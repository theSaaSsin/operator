/**
 * channels/agents.js — "Spin up agents per channel" (the swarm).
 *
 * Each channel gets:
 *   - its own persona override (tone, name, guardrails)
 *   - its own short-term memory (last N messages by chatId)
 *   - its own task queue (jobs B.O.S.S runs FOR that channel)
 *
 * State lives at memory/channels/<channel>.json.
 *
 * API:
 *   spawn(channelId, opts)        -> persona + state for this channel
 *   getPersona(channelId)         -> persona (defaults if not spawned)
 *   pushMessage(channelId, chatId, role, text)
 *   recentMessages(channelId, chatId, n)
 *   list()                        -> [{channelId, persona, queueDepth}]
 *   enqueue(channelId, job)       -> add a job
 *   nextJob(channelId)            -> pop next job
 */
const fs   = require('fs');
const path = require('path');
const cfg    = require('../config/boss.config');
const memory = require('../ai/memory');

function dir() {
  const d = path.join(cfg.paths.memory, 'channels');
  fs.mkdirSync(d, { recursive: true });
  return d;
}
function file(id) { return path.join(dir(), `${id}.json`); }

function read(id) {
  try { return JSON.parse(fs.readFileSync(file(id), 'utf8')); }
  catch (_) { return null; }
}
function write(id, data) {
  fs.writeFileSync(file(id), JSON.stringify(data, null, 2));
}

const DEFAULT_PERSONAS = {
  telegram:  { name: 'B.O.S.S', tone: 'casual, sharp, occasional dry wit; brief; uses emoji sparingly', greetingName: 'Boss' },
  x:         { name: 'B.O.S.S', tone: 'punchy, contrarian, hook-first; <280 chars; no hashtags' },
  linkedin:  { name: 'B.O.S.S', tone: 'professional, story-led, ends with one clear CTA; UK English' },
  instagram: { name: 'B.O.S.S', tone: 'visual-first caption, 3 lines max, line breaks for rhythm' },
  discord:   { name: 'B.O.S.S', tone: 'community-friendly, helpful, code-aware' },
  slack:     { name: 'B.O.S.S', tone: 'crisp, action-oriented, threaded by default' },
};

function spawn(channelId, opts = {}) {
  const existing = read(channelId) || {};
  const persona = { ...(DEFAULT_PERSONAS[channelId] || {}), ...(existing.persona || {}), ...(opts.persona || {}) };
  const data = {
    channelId,
    spawnedAt: existing.spawnedAt || new Date().toISOString(),
    persona,
    chats: existing.chats || {},        // chatId -> [{role,text,ts}]
    queue: existing.queue || [],        // pending jobs
    stats: existing.stats || { sent: 0, received: 0 },
  };
  write(channelId, data);
  memory.logDecision('swarm', `spawned agent for ${channelId}`);
  return data;
}

function getPersona(channelId) {
  const d = read(channelId);
  return (d && d.persona) || DEFAULT_PERSONAS[channelId] || {};
}

function pushMessage(channelId, chatId, role, text) {
  const d = read(channelId) || spawn(channelId);
  if (!d.chats[chatId]) d.chats[chatId] = [];
  d.chats[chatId].push({ role, text: String(text).slice(0, 1500), ts: Date.now() });
  if (d.chats[chatId].length > 30) d.chats[chatId] = d.chats[chatId].slice(-30);
  if (role === 'user') d.stats.received++; else if (role === 'assistant') d.stats.sent++;
  write(channelId, d);
}

function recentMessages(channelId, chatId, n = 10) {
  const d = read(channelId);
  if (!d || !d.chats[chatId]) return [];
  return d.chats[chatId].slice(-n).map(m => ({ role: m.role, content: m.text }));
}

function enqueue(channelId, job) {
  const d = read(channelId) || spawn(channelId);
  d.queue.push({ id: 'job-' + Date.now().toString(36), createdAt: Date.now(), ...job });
  write(channelId, d);
  return d.queue[d.queue.length - 1];
}
function nextJob(channelId) {
  const d = read(channelId);
  if (!d || !d.queue.length) return null;
  const j = d.queue.shift();
  write(channelId, d);
  return j;
}

function list() {
  try {
    return fs.readdirSync(dir()).filter(f => f.endsWith('.json')).map(f => {
      const d = read(f.replace(/\.json$/, '')) || {};
      return {
        channelId: d.channelId,
        persona: d.persona,
        spawnedAt: d.spawnedAt,
        queueDepth: (d.queue || []).length,
        stats: d.stats || {},
        chatCount: Object.keys(d.chats || {}).length,
      };
    });
  } catch (_) { return []; }
}

module.exports = { spawn, getPersona, pushMessage, recentMessages, enqueue, nextJob, list, DEFAULT_PERSONAS };
