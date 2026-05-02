/**
 * channels/linkedin.js — LinkedIn UGC post stub.
 * Posts to your authenticated person URN. Set LINKEDIN_ACCESS_TOKEN + LINKEDIN_AUTHOR_URN.
 */
const memory = require('../ai/memory');

function configured() { return !!(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_AUTHOR_URN); }

async function send({ text } = {}) {
  if (!text) return { ok: false, error: 'text required' };
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const author = process.env.LINKEDIN_AUTHOR_URN; // e.g. urn:li:person:abcdef
  if (!token || !author) return { ok: false, error: 'LINKEDIN_ACCESS_TOKEN + LINKEDIN_AUTHOR_URN required' };
  try {
    const r = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: String(text).slice(0, 2900) },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: data?.message || 'linkedin error', status: r.status };
    memory.logDecision('linkedin', 'posted');
    return { ok: true, id: data.id };
  } catch (e) { return { ok: false, error: e.message }; }
}

function ingest() { return null; }

module.exports = {
  id: 'linkedin', label: 'LinkedIn', kind: 'social',
  configured, send, ingest,
  capabilities: ['outbound-post'],
  setupNote: 'Set LINKEDIN_ACCESS_TOKEN + LINKEDIN_AUTHOR_URN. Get token via OAuth: https://www.linkedin.com/developers/apps',
};
