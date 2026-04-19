/**
 * ai/router.js — multi-model router
 *
 * One call signature, many providers:
 *   await route({ taskKind, system, messages, maxTokens })
 *
 * Providers supported:
 *   - anthropic  (Claude — primary)
 *   - groq       (Llama fast lane)
 *   - ooba       (Oobabooga local, OpenAI-compatible)
 *
 * Falls back automatically through cfg.models.fallback if a provider is unconfigured
 * or throws. Every call is logged to decisions.log.
 */

const cfg    = require('../config/boss.config');
const memory = require('./memory');

// Lazy-load Anthropic SDK only if present.
let Anthropic = null;
try { Anthropic = require('@anthropic-ai/sdk'); } catch (_) {}

function pickModel(taskKind = 'default') {
  return cfg.models[taskKind] || cfg.models.default;
}

function isConfigured(provider) {
  if (provider === 'anthropic') return !!(process.env[cfg.env.anthropic] && Anthropic);
  if (provider === 'groq')      return !!process.env[cfg.env.groq];
  if (provider === 'openai')    return !!process.env[cfg.env.openai];
  if (provider === 'ooba')      return !!process.env[cfg.env.oobaboogaUrl];
  return false;
}

async function callAnthropic({ modelId, system, messages, maxTokens }) {
  const client = new Anthropic({ apiKey: process.env[cfg.env.anthropic] });
  const r = await client.messages.create({
    model: modelId,
    max_tokens: maxTokens || 600,
    system,
    messages: messages.slice(-16),
  });
  return r.content?.[0]?.text || '';
}

async function callGroq({ modelId, system, messages, maxTokens }) {
  const body = {
    model: modelId,
    max_tokens: maxTokens || 600,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages.slice(-16),
    ],
  };
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env[cfg.env.groq]}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'groq error');
  return data.choices?.[0]?.message?.content || '';
}

async function callOoba({ modelId, system, messages, maxTokens }) {
  const base = process.env[cfg.env.oobaboogaUrl].replace(/\/+$/, '');
  const body = {
    model: modelId || 'local',
    max_tokens: maxTokens || 600,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages.slice(-16),
    ],
  };
  const res = await fetch(`${base}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'ooba error');
  return data.choices?.[0]?.message?.content || '';
}

async function callProvider(provider, args) {
  if (provider === 'anthropic') return callAnthropic(args);
  if (provider === 'groq')      return callGroq(args);
  if (provider === 'ooba')      return callOoba(args);
  throw new Error('unknown provider: ' + provider);
}

async function route({ taskKind = 'default', system = '', messages = [], maxTokens = 600, actor = 'router' } = {}) {
  const primary = pickModel(taskKind);
  const chain = [primary.provider, ...cfg.models.fallback.filter(p => p !== primary.provider)];
  let lastErr = null;

  for (const provider of chain) {
    if (!isConfigured(provider)) continue;
    const modelId = provider === primary.provider
      ? primary.id
      : (cfg.models[taskKind]?.id || cfg.models.default.id);
    try {
      const text = await callProvider(provider, { modelId, system, messages, maxTokens });
      memory.logDecision(actor, `route ${taskKind} → ${provider}:${modelId} ok (${text.length} chars)`);
      return { ok: true, provider, modelId, text };
    } catch (e) {
      lastErr = e;
      memory.logDecision(actor, `route ${taskKind} → ${provider} FAIL: ${e.message}`);
    }
  }
  return { ok: false, error: lastErr ? lastErr.message : 'no provider configured' };
}

module.exports = { route, pickModel, isConfigured };
