/**
 * automation/webhooks.js — n8n-ready webhook hub.
 *
 * Inbound:  external services POST to /api/hooks/in/<name>?secret=...
 * Outbound: BOSS posts to URLs registered per event in WEBHOOK_OUT (env JSON).
 *
 * Why this shape:
 *  - Same surface area whether n8n is local (port 5678) or cloud (n8n.cloud).
 *  - Inbound events drop into the queue; agents can react on next coach tick.
 *  - All inbound payloads are recorded to memory/outputs/hooks/<name>-<ts>.json.
 */
const fs   = require('fs');
const path = require('path');
const cfg    = require('../config/boss.config');
const memory = require('../ai/memory');

const HOOK_SECRET = process.env.WEBHOOK_SECRET || '';
const OUT = (() => { try { return JSON.parse(process.env.WEBHOOK_OUT || '{}'); } catch (_) { return {}; } })();

function hooksDir() {
  const d = path.join(cfg.paths.outputs, 'hooks');
  fs.mkdirSync(d, { recursive: true });
  return d;
}

const QUEUE = []; // in-memory queue; consumed by coach tick or polled

function recordInbound(name, payload, headers) {
  const ts = Date.now();
  const safe = String(name).replace(/[^a-z0-9_-]/gi, '_');
  const file = path.join(hooksDir(), `${safe}-${ts}.json`);
  fs.writeFileSync(file, JSON.stringify({ name, ts, headers, payload }, null, 2));
  QUEUE.push({ name, ts, file, payload });
  if (QUEUE.length > 200) QUEUE.shift();
  memory.logDecision('hook', `inbound ${name} (${file})`);
  return file;
}

async function emit(event, payload) {
  const targets = []
    .concat(OUT[event] || [])
    .concat(OUT['*'] || []);
  const results = [];
  for (const url of targets) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-BOSS-Event': event },
        body: JSON.stringify({ event, ts: Date.now(), payload }),
      });
      results.push({ url, ok: r.ok, status: r.status });
    } catch (e) {
      results.push({ url, ok: false, error: e.message });
    }
  }
  if (targets.length) memory.logDecision('hook', `emit ${event} → ${targets.length} target(s)`);
  return results;
}

function snapshot() {
  return { queueDepth: QUEUE.length, recent: QUEUE.slice(-20), out: Object.keys(OUT) };
}

function authOk(querySecret) {
  if (!HOOK_SECRET) return true; // no secret configured = open (dev mode)
  return querySecret === HOOK_SECRET;
}

module.exports = { recordInbound, emit, snapshot, authOk };
