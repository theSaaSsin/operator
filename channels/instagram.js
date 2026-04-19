/**
 * channels/instagram.js — IG Graph API stub (requires Business/Creator account + FB Page link).
 * Two-step publish: create container → publish.
 */
const memory = require('../ai/memory');

function configured() { return !!(process.env.IG_ACCESS_TOKEN && process.env.IG_USER_ID); }

async function send({ text, imageUrl } = {}) {
  const token = process.env.IG_ACCESS_TOKEN;
  const user  = process.env.IG_USER_ID;
  if (!token || !user) return { ok: false, error: 'IG_ACCESS_TOKEN + IG_USER_ID required' };
  if (!imageUrl) return { ok: false, error: 'imageUrl required (IG mandates an image)' };
  try {
    const c = await fetch(`https://graph.facebook.com/v18.0/${user}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl, caption: String(text || '').slice(0, 2200), access_token: token }),
    }).then(r => r.json());
    if (!c.id) return { ok: false, error: c.error?.message || 'container failed', data: c };
    const p = await fetch(`https://graph.facebook.com/v18.0/${user}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: c.id, access_token: token }),
    }).then(r => r.json());
    memory.logDecision('instagram', `posted id=${p.id}`);
    return { ok: !!p.id, id: p.id, error: p.error?.message };
  } catch (e) { return { ok: false, error: e.message }; }
}

function ingest() { return null; }

module.exports = {
  id: 'instagram', label: 'Instagram', kind: 'social',
  configured, send, ingest,
  capabilities: ['outbound-post-with-image'],
  setupNote: 'IG Business/Creator account linked to a FB Page. Set IG_ACCESS_TOKEN + IG_USER_ID. https://developers.facebook.com/docs/instagram-api',
};
