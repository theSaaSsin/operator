/**
 * channels/telegram.js — Telegram Bot API integration.
 *
 * Two-way:
 *   INBOUND  : Telegram → POST /api/channels/telegram/webhook → ingest()
 *               → BOSS chat → reply via send()
 *   OUTBOUND : bossTelegram.send({to, text}) — BOSS posts proactively
 *               (broadcasts, scheduled messages, agent actions).
 *
 * Setup:
 *   1. Talk to @BotFather → /newbot → grab the token
 *   2. .env:  TELEGRAM_BOT_TOKEN=123:abc
 *             TELEGRAM_WEBHOOK_SECRET=long-random-string  (optional but recommended)
 *             TELEGRAM_ALLOWED_CHAT_IDS=12345678,987654321  (comma list — your phone's chat ids)
 *   3. Expose the server publicly (ngrok / cloudflared / fly.io / Railway)
 *   4. Register webhook:
 *        curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-host>/api/channels/telegram/webhook?secret=<secret>"
 *   5. Or use polling (no public URL needed): TELEGRAM_POLLING=1 in .env → server starts long-poll on boot.
 */

const memory = require('../ai/memory');

const ID = 'telegram';
const API = 'https://api.telegram.org/bot';

function token() { return process.env.TELEGRAM_BOT_TOKEN || ''; }
function configured() { return !!token(); }
function allowedChats() {
  return (process.env.TELEGRAM_ALLOWED_CHAT_IDS || '')
    .split(',').map(s => s.trim()).filter(Boolean);
}
function isAllowed(chatId) {
  const list = allowedChats();
  if (!list.length) return true; // open mode (dev) — locked by webhook secret instead
  return list.includes(String(chatId));
}

async function tg(method, body) {
  if (!configured()) throw new Error('TELEGRAM_BOT_TOKEN not set');
  const res = await fetch(`${API}${token()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || 'tg error');
  return data.result;
}

async function send({ to, text, parse_mode = 'Markdown', reply_to_message_id } = {}) {
  if (!to || !text) return { ok: false, error: 'to + text required' };
  try {
    const r = await tg('sendMessage', {
      chat_id: to,
      text: String(text).slice(0, 3900),
      parse_mode,
      reply_to_message_id,
      disable_web_page_preview: true,
    });
    memory.logDecision('telegram', `sent → ${to} (${String(text).length} chars)`);
    return { ok: true, message_id: r.message_id };
  } catch (e) {
    memory.logDecision('telegram', `send FAIL → ${to}: ${e.message}`);
    return { ok: false, error: e.message };
  }
}

async function broadcast(text) {
  const chats = allowedChats();
  if (!chats.length) return { ok: false, error: 'TELEGRAM_ALLOWED_CHAT_IDS not set' };
  const results = await Promise.all(chats.map(c => send({ to: c, text })));
  return { ok: true, results };
}

function ingest(update) {
  // Telegram Update object → normalised (handles text, photos, voice, docs, stickers)
  const msg = update.message || update.edited_message || update.channel_post;
  if (!msg) return null;

  let text = msg.text || msg.caption || '';
  let mediaType = null;
  let mediaFileId = null;

  // Photo — get largest size
  if (msg.photo && msg.photo.length > 0) {
    mediaType = 'photo';
    mediaFileId = msg.photo[msg.photo.length - 1].file_id;
    if (!text) text = '[Photo received]';
  }
  // Voice note
  if (msg.voice) {
    mediaType = 'voice';
    mediaFileId = msg.voice.file_id;
    if (!text) text = '[Voice note received — transcription not yet wired. Try typing your message.]';
  }
  // Audio
  if (msg.audio) {
    mediaType = 'audio';
    mediaFileId = msg.audio.file_id;
    if (!text) text = '[Audio file received]';
  }
  // Document
  if (msg.document) {
    mediaType = 'document';
    mediaFileId = msg.document.file_id;
    const fname = msg.document.file_name || 'file';
    if (!text) text = `[Document received: ${fname}]`;
  }
  // Sticker → treat as emoji
  if (msg.sticker) {
    text = msg.sticker.emoji || '[sticker]';
  }

  return {
    chatId:      msg.chat?.id,
    userId:      msg.from?.id,
    userName:    msg.from?.first_name || msg.from?.username || 'friend',
    text,
    mediaType,
    mediaFileId,
    raw: update,
  };
}

// ── Send a photo (file path or URL or Buffer) ─────────────────────────────
async function sendPhoto({ to, photoUrl, caption = '' } = {}) {
  if (!to || !photoUrl) return { ok: false, error: 'to + photoUrl required' };
  try {
    const r = await tg('sendPhoto', {
      chat_id: to,
      photo: photoUrl,
      caption: caption.slice(0, 1024),
    });
    return { ok: true, message_id: r.message_id };
  } catch (e) { return { ok: false, error: e.message }; }
}

// ── Download a Telegram file and return its URL ────────────────────────────
async function getFileUrl(file_id) {
  const fileInfo = await tg('getFile', { file_id });
  const filePath = fileInfo.file_path;
  return `https://api.telegram.org/file/bot${token()}/${filePath}`;
}

async function setWebhook(url) {
  return tg('setWebhook', { url, allowed_updates: ['message','edited_message','channel_post','callback_query'] });
}
async function deleteWebhook() { return tg('deleteWebhook', {}); }
async function getMe() { return tg('getMe', {}); }

// ── Long-poll mode (no public URL needed) ─────────────────────────
let _pollOffset = 0;
let _polling = false;
async function startPolling(onMessage) {
  if (_polling || !configured()) return;
  _polling = true;
  memory.logDecision('telegram', 'polling started');
  while (_polling) {
    try {
      const updates = await tg('getUpdates', { offset: _pollOffset, timeout: 25 });
      for (const u of updates) {
        _pollOffset = u.update_id + 1;
        const norm = ingest(u);
        if (norm && isAllowed(norm.chatId)) await onMessage(norm).catch(()=>{});
      }
    } catch (e) {
      memory.logDecision('telegram', `poll error ${e.message}`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}
function stopPolling() { _polling = false; }

module.exports = {
  id: ID, label: 'Telegram', kind: 'messaging',
  configured, send, sendPhoto, broadcast, ingest, setWebhook, deleteWebhook, getMe,
  getFileUrl, startPolling, stopPolling, isAllowed,
  capabilities: ['inbound-chat','outbound-message','broadcast','photo-receive','photo-send','voice-receive'],
  setupNote: 'Set TELEGRAM_BOT_TOKEN (from @BotFather). Optionally TELEGRAM_ALLOWED_CHAT_IDS to restrict + TELEGRAM_WEBHOOK_SECRET for security. Set TELEGRAM_POLLING=1 to skip needing a public URL.',
};
