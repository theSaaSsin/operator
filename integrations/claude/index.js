// integrations/claude/index.js
//
// Anthropic API adapter for TheSaaSsin Operator.
// Uses raw fetch — no SDK install required, keeps server.js dependency-free.
// Includes prompt caching on the system prompt (always cached at the
// claude-api skill recommended ephemeral tier).
//
// Required env: ANTHROPIC_API_KEY (set before running server: e.g.
//   $env:ANTHROPIC_API_KEY="sk-ant-..."  on PowerShell
//   export ANTHROPIC_API_KEY="sk-ant-..."  on bash)

const fs = require('fs');
const path = require('path');

const DEFAULT_MODEL = 'claude-opus-4-7';
const API_URL = 'https://api.anthropic.com/v1/messages';
const MASTER_PROMPT_PATH = path.join(__dirname, '..', '..', 'docs', 'CLAUDE_MAX_OPERATOR_PROMPT.md');

let _cachedMasterPrompt = null;

function loadMasterPrompt() {
  if (_cachedMasterPrompt) return _cachedMasterPrompt;
  if (!fs.existsSync(MASTER_PROMPT_PATH)) {
    return 'You are THE OPERATOR inside The SaaSsin Studio. Be efficient, clean, operator-grade. No fluff.';
  }
  const raw = fs.readFileSync(MASTER_PROMPT_PATH, 'utf8');
  const m = raw.match(/```\s*\n([\s\S]*?)```/);
  _cachedMasterPrompt = m ? m[1].trim() : raw;
  return _cachedMasterPrompt;
}

async function generate({ userMessage, system, model, maxTokens = 4096 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: 'ANTHROPIC_API_KEY env var not set. Set it in your shell (PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-...") and restart the server.'
    };
  }

  const sysPrompt = system || loadMasterPrompt();

  const body = {
    model: model || DEFAULT_MODEL,
    max_tokens: maxTokens,
    system: [
      { type: 'text', text: sysPrompt, cache_control: { type: 'ephemeral' } }
    ],
    messages: [{ role: 'user', content: userMessage }]
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: `Anthropic API ${res.status}: ${errText.slice(0, 400)}` };
    }

    const data = await res.json();
    const text = (data.content || []).map(b => b.text || '').join('').trim();
    return {
      ok: true,
      text,
      usage: data.usage,
      model: data.model,
      stopReason: data.stop_reason
    };
  } catch (err) {
    return { ok: false, error: `Fetch failed: ${err.message}` };
  }
}

function buildBriefMessage({ name, niche, offer, goal, location, notes }) {
  return `Operator online: design a full system for the following client.

CLIENT BRIEF
- Business name: ${name || '(not provided)'}
- Niche: ${niche || '(not provided)'}
- Core offer: ${offer || '(not provided)'}
- Primary goal: ${goal || 'leads'}
- Location / market: ${location || '(not provided)'}
- Notes: ${notes || '(none)'}

Identify which of the 16 systems apply. Output the 9 labelled sections per the operator role: GOAL, SYSTEMS USED, STORYBOARD, COPY, TIMING, MESHY PROMPTS, PAGE STRUCTURE, AUTOMATION HOOKS, IMPLEMENTATION NOTES.`;
}

async function chat({ messages, system, model, maxTokens = 4096 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: 'ANTHROPIC_API_KEY env var not set. Set it in your shell and restart the server.'
    };
  }

  const sysPrompt = system || loadMasterPrompt();
  // Sanitise: only keep role + content, drop client-side metadata
  const cleanMessages = (messages || [])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && m.content)
    .map(m => ({ role: m.role, content: String(m.content) }));

  if (!cleanMessages.length) return { ok: false, error: 'No valid messages in history' };
  if (cleanMessages[0].role !== 'user') {
    // Anthropic requires first message to be user
    return { ok: false, error: 'First message must be from user' };
  }

  const body = {
    model: model || DEFAULT_MODEL,
    max_tokens: maxTokens,
    system: [
      { type: 'text', text: sysPrompt, cache_control: { type: 'ephemeral' } }
    ],
    messages: cleanMessages
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: `Anthropic API ${res.status}: ${errText.slice(0, 400)}` };
    }
    const data = await res.json();
    const text = (data.content || []).map(b => b.text || '').join('').trim();
    return {
      ok: true,
      text,
      usage: data.usage,
      model: data.model,
      stopReason: data.stop_reason
    };
  } catch (err) {
    return { ok: false, error: `Fetch failed: ${err.message}` };
  }
}

module.exports = { generate, chat, buildBriefMessage, loadMasterPrompt };
