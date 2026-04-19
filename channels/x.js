/**
 * channels/x.js — X (Twitter) stub.
 * v0: outbound-only via API v2. Inbound (mentions/DMs) requires elevated access.
 */
const memory = require('../ai/memory');

function configured() { return !!(process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN); }

async function send({ text } = {}) {
  if (!text) return { ok: false, error: 'text required' };
  const token = process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN;
  if (!token) return { ok: false, error: 'X_BEARER_TOKEN not set' };
  try {
    const r = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: String(text).slice(0, 280) }),
    });
    const data = await r.json();
    if (!r.ok) return { ok: false, error: data?.detail || 'x error', data };
    memory.logDecision('x', `posted (${String(text).length} chars)`);
    return { ok: true, id: data?.data?.id };
  } catch (e) { return { ok: false, error: e.message }; }
}

function ingest() { return null; } // not yet — needs OAuth user context

module.exports = {
  id: 'x', label: 'X / Twitter', kind: 'social',
  configured, send, ingest,
  capabilities: ['outbound-post'],
  setupNote: 'Set X_BEARER_TOKEN (developer.twitter.com → app → bearer). Inbound (mentions/DMs) needs OAuth 2.0 user context — coming next iteration.',
};
