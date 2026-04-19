/**
 * channels/slack.js — Slack incoming webhook (one-way).
 * Set SLACK_WEBHOOK_URL.
 */
const memory = require('../ai/memory');

function configured() { return !!process.env.SLACK_WEBHOOK_URL; }

async function send({ text } = {}) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return { ok: false, error: 'SLACK_WEBHOOK_URL not set' };
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: String(text || '').slice(0, 3900), username: 'B.O.S.S' }),
    });
    if (!r.ok) return { ok: false, error: `slack ${r.status}` };
    memory.logDecision('slack', 'posted');
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
}

function ingest(payload) {
  // Slack Events API "event_callback" — message.channels event
  if (payload?.type === 'url_verification') return { challenge: payload.challenge };
  const ev = payload?.event;
  if (!ev || ev.bot_id) return null;
  return ev.text ? { chatId: ev.channel, userId: ev.user, text: ev.text, raw: payload } : null;
}

module.exports = {
  id: 'slack', label: 'Slack', kind: 'messaging',
  configured, send, ingest,
  capabilities: ['outbound-message','events'],
  setupNote: 'Workspace → Apps → Incoming Webhooks → Add → SLACK_WEBHOOK_URL. For inbound: enable Events API, point Request URL at /api/channels/slack/webhook.',
};
