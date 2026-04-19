/**
 * ai/vision.js — BOSS sees your screen.
 *
 * Accepts a base64 image (PNG/JPEG, data: URL or raw b64), sends to Claude
 * vision with a task-specific prompt. Returns structured feedback.
 *
 * Tasks: 'review-ui', 'spot-bug', 'explain', 'teach'.
 */
const cfg = require('../config/boss.config');
const memory = require('./memory');

let Anthropic = null;
try { Anthropic = require('@anthropic-ai/sdk'); } catch (_) {}

const PROMPTS = {
  'review-ui': `You are a senior product designer reviewing this screen.
Return STRICT JSON: { "verdict":"ship"|"iterate", "wins":[string], "issues":[string], "fixes":[string] }`,
  'spot-bug': `You are a senior debugger looking at this screenshot.
Return STRICT JSON: { "bugs_seen":[string], "likely_causes":[string], "next_check":[string] }`,
  'explain': `Explain what this screen shows in 4 short bullets. Plain text. No JSON.`,
  'teach':   `Pretend I am a beginner. Walk me through this screen in 5 steps, and end with one micro-challenge to do next. Plain text.`,
};

function stripDataUrl(b64) {
  if (!b64) return { media: 'image/png', data: '' };
  const m = b64.match(/^data:(image\/[a-z]+);base64,(.*)$/i);
  return m ? { media: m[1], data: m[2] } : { media: 'image/png', data: b64 };
}

async function review({ imageBase64, task = 'review-ui', extra = '' } = {}) {
  if (!Anthropic || !process.env[cfg.env.anthropic]) {
    return { ok: false, error: 'ANTHROPIC_API_KEY not set or sdk missing' };
  }
  if (!imageBase64) return { ok: false, error: 'imageBase64 required' };

  const { media, data } = stripDataUrl(imageBase64);
  const client = new Anthropic({ apiKey: process.env[cfg.env.anthropic] });
  const sys = PROMPTS[task] || PROMPTS['review-ui'];

  try {
    const r = await client.messages.create({
      model: cfg.models.default.id,
      max_tokens: 700,
      system: sys,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: media, data } },
          { type: 'text',  text: extra || 'Analyse this screen.' },
        ],
      }],
    });
    const text = r.content?.[0]?.text || '';
    memory.logDecision('vision', `task=${task} ok bytes=${data.length}`);
    return { ok: true, task, text };
  } catch (e) {
    memory.logDecision('vision', `task=${task} FAIL ${e.message}`);
    return { ok: false, error: e.message };
  }
}

module.exports = { review };
