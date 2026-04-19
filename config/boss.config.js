/**
 * B.O.S.S — Business Operating System & Strategist
 * ------------------------------------------------
 * LOCKED VARIABLES — single source of truth.
 * Every env var, path, model id, and default lives here.
 *
 * Usage:  const cfg = require('./config/boss.config');
 */

const path = require('path');

const ROOT = path.resolve(__dirname, '..');

module.exports = {
  // ---- identity ----
  name: 'B.O.S.S',
  codename: 'Operator',
  owner: 'thesaasguy101@gmail.com',
  version: '0.1.0',

  // ---- filesystem ----
  paths: {
    root: ROOT,
    memory: path.join(ROOT, 'memory'),
    projectState: path.join(ROOT, 'memory', 'project-state.json'),
    goals: path.join(ROOT, 'memory', 'goals.json'),
    decisionsLog: path.join(ROOT, 'memory', 'decisions.log'),
    outputs: path.join(ROOT, 'memory', 'outputs'),
    agents: path.join(ROOT, 'ai', 'agents'),
    tools: path.join(ROOT, 'tools'),
    creative: path.join(ROOT, 'creative'),
    automation: path.join(ROOT, 'automation'),
  },

  // ---- env keys (read-only reference list) ----
  env: {
    anthropic: 'ANTHROPIC_API_KEY',
    groq: 'GROQ_API_KEY',
    openai: 'OPENAI_API_KEY',
    modelslab: 'MODELSLAB_API_KEY',
    fal: 'FAL_API_KEY',
    unsplash: 'UNSPLASH_ACCESS_KEY',
    supabase: 'SUPABASE_URL',
    operatorPass: 'OPERATOR_PASSWORD',
    oobaboogaUrl: 'OOBABOOGA_URL', // e.g. http://127.0.0.1:5000
  },

  // ---- model routing policy ----
  // Each task kind picks a preferred provider, then a fallback chain.
  models: {
    default: { provider: 'anthropic', id: 'claude-haiku-4-5-20251001' },
    plan:    { provider: 'anthropic', id: 'claude-haiku-4-5-20251001' },
    build:   { provider: 'anthropic', id: 'claude-haiku-4-5-20251001' },
    analyse: { provider: 'groq',      id: 'llama-3.3-70b-versatile'    },
    grow:    { provider: 'anthropic', id: 'claude-haiku-4-5-20251001' },
    fast:    { provider: 'groq',      id: 'llama-3.1-8b-instant'       },
    local:   { provider: 'ooba',      id: 'local'                       },
    fallback: ['anthropic', 'groq', 'ooba'],
  },

  // ---- agent registry (authoritative list) ----
  agents: [
    { id: 'planner', label: 'Planner',  role: 'breaks goals into tasks',       taskKind: 'plan'    },
    { id: 'builder', label: 'Builder',  role: 'writes code + solutions',       taskKind: 'build'   },
    { id: 'analyst', label: 'Analyst',  role: 'reviews output + performance',  taskKind: 'analyse' },
    { id: 'growth',  label: 'Growth',   role: 'business strategy + moves',     taskKind: 'grow'    },
    { id: 'designer',label: 'Designer', role: 'UI, 3D, visuals',                taskKind: 'build'  },
    { id: 'content', label: 'Content',  role: 'posts, videos, assets',          taskKind: 'build'  },
  ],

  // ---- persona ----
  persona: {
    name: 'B.O.S.S',
    archetype: 'Jarvis × My Hero Academia coach × master prompt engineer',
    tone: 'calm, confident, one-step-ahead, dryly witty, British spelling',
    greetingName: 'Josh',
    guardrails: [
      'Never flatter — respect the user by being honest and specific.',
      'Propose the next smallest concrete action, always.',
      'Automate the hard things; keep the easy things one-click.',
      'Every reply ends with a clear NEXT MOVE.',
    ],
  },

  // ---- self-improvement cadence ----
  selfImprove: {
    surfaceToolsEveryHours: 24,
    surfaceCandidates: ['github-repos', 'npm-packages', 'hf-spaces', 'pinokio-scripts'],
  },
};
