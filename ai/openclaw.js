'use strict';

/**
 * ai/openclaw.js — OpenClaw Gateway client
 *
 * OpenClaw runs locally on port 18789 (default).
 * Docs: https://docs.openclaw.ai/gateway
 *
 * Endpoints used:
 *   GET  /api/status                          — health check (no auth)
 *   POST /api/sessions/{session}/messages     — send message, get reply
 *   GET  /api/sessions/{session}/messages     — session history
 *   POST /openai/v1/chat/completions          — OpenAI-compat (streaming optional)
 */

const fs   = require('fs');
const path = require('path');

function readCfg() {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'config.json'), 'utf8'));
  } catch (_) { return {}; }
}

function baseUrl() {
  return (readCfg().openclawUrl || 'http://localhost:18789').replace(/\/$/, '');
}

function token() {
  return readCfg().openclawToken || '';
}

function authHeader() {
  const t = token();
  return t ? { 'Authorization': `Bearer ${t}` } : {};
}

// ── Status ─────────────────────────────────────────────────────────────────────
async function status() {
  try {
    const res = await fetch(`${baseUrl()}/api/status`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { running: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { running: true, ...data };
  } catch (e) {
    return { running: false, error: e.message };
  }
}

// ── Send a message to an OpenClaw session ─────────────────────────────────────
async function sendMessage(message, session = 'main') {
  const res = await fetch(`${baseUrl()}/api/sessions/${encodeURIComponent(session)}/messages`, {
    method:  'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body:    JSON.stringify({ message }),
    signal:  AbortSignal.timeout(30000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || data?.message || `openclaw ${res.status}`);
  return data; // { id, role, content, created, ... }
}

// ── Get session history ────────────────────────────────────────────────────────
async function getHistory(session = 'main', limit = 20) {
  const res = await fetch(`${baseUrl()}/api/sessions/${encodeURIComponent(session)}/messages?limit=${limit}`, {
    headers: authHeader(),
    signal:  AbortSignal.timeout(5000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `openclaw ${res.status}`);
  return Array.isArray(data) ? data : (data.messages || []);
}

// ── OpenAI-compat chat completions (for richer task delegation) ───────────────
async function chat(messages, { model = 'openclaw', maxTokens = 800 } = {}) {
  const res = await fetch(`${baseUrl()}/openai/v1/chat/completions`, {
    method:  'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body:    JSON.stringify({ model, messages, max_tokens: maxTokens }),
    signal:  AbortSignal.timeout(30000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `openclaw ${res.status}`);
  return data.choices?.[0]?.message?.content || '';
}

// ── List available sessions ────────────────────────────────────────────────────
async function listSessions() {
  try {
    const res = await fetch(`${baseUrl()}/api/sessions`, {
      headers: authHeader(),
      signal:  AbortSignal.timeout(4000),
    });
    const data = await res.json();
    return Array.isArray(data) ? data : (data.sessions || []);
  } catch (_) { return []; }
}

module.exports = { status, sendMessage, getHistory, chat, listSessions };
