/**
 * ai/router.js — B.O.S.S Hybrid LLM Router v3
 *
 * Provider chains (first configured wins):
 *
 *   BOSS CHAT  → Claude Haiku → Gemini Flash → GPT-4o Mini → Cerebras → Groq → OpenRouter
 *   PITCH/STRAT→ Claude Haiku → Gemini Pro   → GPT-4o Mini → Cerebras → Groq → OpenRouter
 *   CODE       → Claude Sonnet → DeepSeek(OR)→ GPT-4o Mini → Cerebras → Groq
 *   QUICK      → Groq → Cerebras → Gemini Flash → GPT-4o Mini → Claude Haiku
 *   LOCAL      → Ollama → Groq → Cerebras → Claude Haiku
 *
 * Instruction-following models (Claude, Gemini, GPT) lead for anything that
 * requires honesty / staying in character. Groq/Llama is fast but roleplays —
 * kept only as cheap fallback for quick/summarise tasks.
 *
 * Providers & signup:
 *   Anthropic  → anthropic.com/api          (Claude Haiku — best instruction-following)
 *   Gemini     → aistudio.google.com        (Flash — free 1500 RPD, no card needed)
 *   OpenAI     → platform.openai.com        (GPT-4o Mini — cheap, reliable)
 *   Cerebras   → cloud.cerebras.ai          (2000+ tok/s, free tier, English signup)
 *   OpenRouter → openrouter.ai              (DeepSeek Coder free — best code model)
 *   Groq       → console.groq.com           (800 tok/s, free forever)
 *   Ollama     → ollama.ai                  (local, private, free)
 */

'use strict';

const cfg = require('../config/boss.config');

// --- Anthropic SDK (lazy) ---
let Anthropic = null;
try { Anthropic = require('@anthropic-ai/sdk'); } catch (_) {}

// --- helpers ---
function readCfgKey(key) {
  // Check env first, then data/config.json cache (set by POST /api/config)
  if (process.env[key]) return process.env[key];
  try {
    const fs   = require('fs');
    const p    = require('path').join(__dirname, '..', 'data', 'config.json');
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    // Map env key names → config.json field names
    const MAP  = {
      ANTHROPIC_API_KEY:  'anthropicApiKey',
      GROQ_API_KEY:       'groqApiKey',
      OPENROUTER_API_KEY: 'openrouterApiKey',
      CEREBRAS_API_KEY:   'cerebrasApiKey',
      GEMINI_API_KEY:     'geminiApiKey',
      OPENAI_API_KEY:     'openaiApiKey',
      KIMI_API_KEY:       'kimiApiKey',
      MINIMAX_API_KEY:    'minimaxApiKey',
      GLM_API_KEY:        'glmApiKey',
      OLLAMA_URL:         'ollamaUrl',
    };
    return data[MAP[key]] || null;
  } catch (_) { return null; }
}

function ollamaBase() {
  return readCfgKey('OLLAMA_URL') || cfg.ollama.baseUrl;
}

function readAiPrefs() {
  try {
    const fs = require('fs');
    const p = require('path').join(__dirname, '..', 'data', 'config.json');
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    return {
      disabledProviders: Array.isArray(data.disabledProviders) ? data.disabledProviders : [],
      pinnedProvider: typeof data.pinnedProvider === 'string' ? data.pinnedProvider : null,
    };
  } catch (_) {
    return { disabledProviders: [], pinnedProvider: null };
  }
}

function isConfigured(provider) {
  if (provider === 'anthropic')  return !!(readCfgKey('ANTHROPIC_API_KEY') && Anthropic);
  if (provider === 'groq')       return !!readCfgKey('GROQ_API_KEY');
  if (provider === 'openrouter') return !!readCfgKey('OPENROUTER_API_KEY');
  if (provider === 'cerebras')   return !!readCfgKey('CEREBRAS_API_KEY');
  if (provider === 'gemini')     return !!readCfgKey('GEMINI_API_KEY');
  if (provider === 'openai')     return !!readCfgKey('OPENAI_API_KEY');
  if (provider === 'kimi')       return !!readCfgKey('KIMI_API_KEY');
  if (provider === 'minimax')    return !!readCfgKey('MINIMAX_API_KEY');
  if (provider === 'glm')        return !!readCfgKey('GLM_API_KEY');
  if (provider === 'ollama')     return true;
  return false;
}

// --- provider call functions ---

async function callAnthropic({ modelId, system, messages, maxTokens }) {
  const key    = readCfgKey('ANTHROPIC_API_KEY');
  if (!key || !Anthropic) throw new Error('no anthropic key');
  const client = new Anthropic({ apiKey: key });
  const r = await client.messages.create({
    model:      modelId || 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens || 600,
    system,
    messages:   messages.slice(-16),
  });
  return r.content?.[0]?.text || '';
}

async function callGroq({ modelId, system, messages, maxTokens }) {
  const key = readCfgKey('GROQ_API_KEY');
  if (!key) throw new Error('no groq key');
  const body = {
    model:      modelId || 'llama-3.1-8b-instant',
    max_tokens: maxTokens || 600,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages.slice(-16),
    ],
  };
  const res  = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'groq error');
  return data.choices?.[0]?.message?.content || '';
}

async function callOpenRouter({ modelId, system, messages, maxTokens }) {
  const key = readCfgKey('OPENROUTER_API_KEY');
  if (!key) throw new Error('no openrouter key');
  const body = {
    model:      modelId || 'meta-llama/llama-3.3-70b-instruct:free',
    max_tokens: maxTokens || 600,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages.slice(-16),
    ],
  };
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type':  'application/json',
      'HTTP-Referer':  'https://thesaassin.com',
      'X-Title':       'TheSaaSsin B.O.S.S',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'openrouter error');
  return data.choices?.[0]?.message?.content || '';
}

// Kimi (Moonshot AI) — fast, long-context, great for analysis
async function callKimi({ modelId, system, messages, maxTokens }) {
  const key = readCfgKey('KIMI_API_KEY');
  if (!key) throw new Error('no kimi key');
  const body = {
    model:      modelId || 'moonshot-v1-8k',
    max_tokens: maxTokens || 600,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages.slice(-16),
    ],
  };
  const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'kimi error');
  return data.choices?.[0]?.message?.content || '';
}

// MiniMax — solid Chinese frontier model
async function callMinimax({ modelId, system, messages, maxTokens }) {
  const key = readCfgKey('MINIMAX_API_KEY');
  if (!key) throw new Error('no minimax key');
  const body = {
    model:      modelId || 'MiniMax-Text-01',
    max_tokens: maxTokens || 600,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages.slice(-16),
    ],
  };
  const res = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'minimax error');
  return data.choices?.[0]?.message?.content || '';
}

// Cerebras — fastest inference available (2000+ tok/s), free tier, English signup
async function callCerebras({ modelId, system, messages, maxTokens }) {
  const key = readCfgKey('CEREBRAS_API_KEY');
  if (!key) throw new Error('no cerebras key');
  const body = {
    model:      modelId || 'llama-3.3-70b',   // same 70B quality as Groq but often faster
    max_tokens: maxTokens || 600,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages.slice(-16),
    ],
  };
  const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'cerebras error');
  return data.choices?.[0]?.message?.content || '';
}

// Gemini (Google AI Studio) — free 1500 RPD, best instruction-following free model
// Uses OpenAI-compatible endpoint so format is identical
async function callGemini({ modelId, system, messages, maxTokens }) {
  const key = readCfgKey('GEMINI_API_KEY');
  if (!key) throw new Error('no gemini key');
  const body = {
    model:      modelId || 'gemini-2.0-flash',
    max_tokens: maxTokens || 600,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages.slice(-16),
    ],
  };
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'gemini error');
  return data.choices?.[0]?.message?.content || '';
}

// OpenAI — GPT-4o Mini, reliable instruction-following, ~$0.15/1M input tokens
async function callOpenAI({ modelId, system, messages, maxTokens }) {
  const key = readCfgKey('OPENAI_API_KEY');
  if (!key) throw new Error('no openai key');
  const body = {
    model:      modelId || 'gpt-4o-mini',
    max_tokens: maxTokens || 600,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages.slice(-16),
    ],
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'openai error');
  return data.choices?.[0]?.message?.content || '';
}

// GLM (Zhipu AI) — GLM-4, excellent for code + reasoning
async function callGLM({ modelId, system, messages, maxTokens }) {
  const key = readCfgKey('GLM_API_KEY');
  if (!key) throw new Error('no glm key');
  const body = {
    model:      modelId || 'glm-4-flash',   // glm-4-flash is FREE
    max_tokens: maxTokens || 600,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages.slice(-16),
    ],
  };
  const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'glm error');
  return data.choices?.[0]?.message?.content || '';
}

async function callOllama({ modelId, system, messages, maxTokens }) {
  const base = ollamaBase();
  const body = {
    model:  modelId || cfg.ollama.models.balanced,
    stream: false,
    options: { num_predict: maxTokens || 600 },
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages.slice(-16),
    ],
  };
  const res  = await fetch(`${base}/api/chat`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
    signal:  AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`ollama ${res.status}`);
  const data = await res.json();
  return data.message?.content || '';
}

// --- tier classification ---

function classifyTier(taskKind) {
  if (cfg.routing.local.includes(taskKind)) return 'local';
  if (cfg.routing.groq.includes(taskKind))  return 'groq';
  if (cfg.routing.cloud.includes(taskKind)) return 'cloud';
  return 'cloud'; // default to best quality
}

// Heuristic: classify a freeform message into a taskKind
function classifyMessage(msg = '') {
  const m = msg.toLowerCase();
  if (m.length < 80 && !m.includes('pitch') && !m.includes('strategy'))
    return 'quickReply';
  if (/pitch|propose|write.*email|cold.*outreach|sales/.test(m)) return 'pitch';
  if (/strateg|plan|roadmap|how.*grow|next.*move/.test(m))       return 'strategy';
  if (/code|build|implement|fix.*bug|write.*function/.test(m))   return 'code';
  if (/analys|review|compare|research|find/.test(m))             return 'analyse';
  if (/post|content|tweet|caption|social/.test(m))               return 'socialPost';
  if (/summar|tl;dr|recap|what.*said/.test(m))                   return 'summarise';
  return 'default';
}

// Build provider chain — instruction-following first for BOSS/pitch/strategy
// Groq/Llama demoted to fallback (fast but roleplays & hallucinates)
function buildChain(tier, taskKind, disabled = []) {
  // If a provider is disabled, remove it from all chains
  const filter = (chain) => chain.filter(p => !disabled.includes(p));

  // CODE: best free coder first, then paid
  if (taskKind === 'code' || taskKind === 'build') {
    return filter(['anthropic', 'openrouter', 'openai', 'cerebras', 'groq', 'glm']);
  }
  // BOSS CHAT / PITCH / STRATEGY: instruction-following models lead
  // Claude/Gemini/GPT stay in character and follow rules. Groq roleplays.
  if (taskKind === 'boss' || taskKind === 'pitch' || taskKind === 'strategy') {
    return filter(['anthropic', 'gemini', 'openai', 'cerebras', 'openrouter', 'groq', 'kimi', 'minimax']);
  }
  // QUICK REPLY / SUMMARISE: speed matters, Groq leads
  if (taskKind === 'quickReply' || taskKind === 'summarise') {
    return filter(['groq', 'cerebras', 'gemini', 'openai', 'openrouter', 'anthropic']);
  }
  // LOCAL: try Ollama first
  if (tier === 'local') {
    return filter(['ollama', 'groq', 'cerebras', 'gemini', 'openai', 'anthropic']);
  }
  // DEFAULT: instruction-following leads
  return filter(['anthropic', 'gemini', 'openai', 'cerebras', 'groq', 'openrouter', 'kimi', 'minimax', 'ollama']);
}

function modelFor(provider, taskKind) {
  if (provider === 'ollama') {
    if (taskKind === 'code' || taskKind === 'build') return cfg.ollama.models.code;
    if (taskKind === 'quickReply' || taskKind === 'summarise') return cfg.ollama.models.fast;
    return cfg.ollama.models.balanced;
  }
  if (provider === 'groq') {
    if (taskKind === 'quickReply' || taskKind === 'summarise') return 'llama-3.1-8b-instant';
    return 'llama-3.3-70b-versatile';
  }
  if (provider === 'cerebras') {
    // Cerebras runs Llama-3.3-70B at 2000+ tok/s — ultra fast for everything
    if (taskKind === 'quickReply' || taskKind === 'summarise') return 'llama-3.1-8b';
    return 'llama-3.3-70b';
  }
  if (provider === 'openrouter') {
    // DeepSeek Coder v2 — best FREE coding model (beats GPT-4 on HumanEval)
    if (taskKind === 'code' || taskKind === 'build') return 'deepseek/deepseek-coder-v2:free';
    if (taskKind === 'quickReply') return 'meta-llama/llama-3.1-8b-instruct:free';
    return 'meta-llama/llama-3.3-70b-instruct:free';
  }
  if (provider === 'gemini') {
    if (taskKind === 'code' || taskKind === 'build') return 'gemini-2.0-flash';
    return 'gemini-2.0-flash';
  }
  if (provider === 'openai') {
    if (taskKind === 'code' || taskKind === 'build') return 'gpt-4o-mini';
    return 'gpt-4o-mini';
  }
  if (provider === 'glm') return 'glm-4-flash';
  if (provider === 'anthropic') {
    if (taskKind === 'build' || taskKind === 'code') return 'claude-sonnet-4-5';
    return 'claude-haiku-4-5-20251001';
  }
  return 'claude-haiku-4-5-20251001';
}

// --- main export ---

async function route({
  taskKind  = null,
  message   = '',
  system    = '',
  messages  = [],
  maxTokens = 600,
} = {}) {
  const kind  = taskKind || classifyMessage(message);
  const tier  = classifyTier(kind);
  const prefs = readAiPrefs();
  let chain   = buildChain(tier, kind, prefs.disabledProviders);

  // If a provider is pinned and available, put it first
  if (prefs.pinnedProvider && chain.includes(prefs.pinnedProvider)) {
    chain = [prefs.pinnedProvider, ...chain.filter(p => p !== prefs.pinnedProvider)];
  }

  for (const provider of chain) {
    if (provider !== 'ollama' && !isConfigured(provider)) continue;
    const modelId = modelFor(provider, kind);
    try {
      let text;
      if      (provider === 'anthropic')  text = await callAnthropic({ modelId, system, messages, maxTokens });
      else if (provider === 'gemini')     text = await callGemini({ modelId, system, messages, maxTokens });
      else if (provider === 'openai')     text = await callOpenAI({ modelId, system, messages, maxTokens });
      else if (provider === 'groq')       text = await callGroq({ modelId, system, messages, maxTokens });
      else if (provider === 'cerebras')   text = await callCerebras({ modelId, system, messages, maxTokens });
      else if (provider === 'openrouter') text = await callOpenRouter({ modelId, system, messages, maxTokens });
      else if (provider === 'kimi')       text = await callKimi({ modelId, system, messages, maxTokens });
      else if (provider === 'minimax')    text = await callMinimax({ modelId, system, messages, maxTokens });
      else if (provider === 'glm')        text = await callGLM({ modelId, system, messages, maxTokens });
      else                                text = await callOllama({ modelId, system, messages, maxTokens });
      return { ok: true, provider, modelId, tier, taskKind: kind, text, pinned: provider === prefs.pinnedProvider };
    } catch (e) {
      // Surface credit exhaustion immediately — no point trying other providers for this error
      if (e?.status === 400 && e?.message?.includes('credit balance')) {
        return { ok: false, error: 'credits_exhausted', provider, tier, taskKind: kind,
                 hint: 'Anthropic credits are zero. Add a free Groq key at console.groq.com → API Keys → free forever.' };
      }
      // try next in chain
    }
  }
  return { ok: false, error: 'no_provider', tier, taskKind: kind,
           hint: 'No AI provider configured. Add a free Groq key at console.groq.com → paste in API Keys.' };
}

// --- status check (used by /api/local/status) ---
async function routerStatus() {
  const status = { anthropic: false, groq: false, openrouter: false, cerebras: false, ollama: { running: false, models: [] } };
  const prefs = readAiPrefs();

  status.anthropic  = isConfigured('anthropic');
  status.gemini     = isConfigured('gemini');
  status.openai     = isConfigured('openai');
  status.groq       = isConfigured('groq');
  status.cerebras   = isConfigured('cerebras');
  status.openrouter = isConfigured('openrouter');
  status.kimi       = isConfigured('kimi');
  status.minimax    = isConfigured('minimax');
  status.glm        = isConfigured('glm');
  status.disabledProviders = prefs.disabledProviders;
  status.pinnedProvider = prefs.pinnedProvider;

  try {
    const res  = await fetch(`${ollamaBase()}/api/tags`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      status.ollama.running = true;
      status.ollama.models  = (data.models || []).map(m => ({
        name:  m.name,
        size:  m.size,
        sizeMB: Math.round((m.size || 0) / 1024 / 1024),
      }));
    }
  } catch (_) {}

  return status;
}

module.exports = { route, routerStatus, classifyMessage, classifyTier };
