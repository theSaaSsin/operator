/**
 * channels/discord.js — Discord webhook (one-way) + bot inbound (optional).
 * Easiest: use a channel webhook URL — no bot, no OAuth. Set DISCORD_WEBHOOK_URL.
 */
const memory = require('../ai/memory');

function configured() { return !!process.env.DISCORD_WEBHOOK_URL; }

async function send({ text } = {}) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return { ok: false, error: 'DISCORD_WEBHOOK_URL not set' };
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: String(text || '').slice(0, 1900), username: 'B.O.S.S' }),
    });
    if (!r.ok) return { ok: false, error: `discord ${r.status}` };
    memory.logDecision('discord', 'posted');
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
}

function ingest(payload) {
  // For Discord interactions endpoint (slash commands), payload arrives as InteractionType=2 etc.
  // We extract the simplest case: a chat-input command with one "message" option.
  if (!payload || payload.type !== 2) return null;
  const opt = payload.data?.options?.find(o => o.name === 'message');
  return opt ? { chatId: payload.channel_id, userId: payload.member?.user?.id, text: opt.value, raw: payload } : null;
}

module.exports = {
  id: 'discord', label: 'Discord', kind: 'messaging',
  configured, send, ingest,
  capabilities: ['outbound-message','interactions'],
  setupNote: 'Channel → Edit → Integrations → Webhooks → Copy URL → DISCORD_WEBHOOK_URL. Optional: register a slash command and point Interactions URL at /api/channels/discord/webhook.',
};
