/**
 * B.O.S.S — Business Operating System & Strategist
 * ------------------------------------------------
 * LOCKED VARIABLES — single source of truth.
 * Every env var, path, model id, and default lives here.
 */

const path = require('path');
const ROOT  = path.resolve(__dirname, '..');

module.exports = {
  // ---- identity ----
  name:     'B.O.S.S',
  codename: 'Operator',
  owner:    'thesaasguy101@gmail.com',
  version:  '0.3.0',

  // ---- filesystem ----
  paths: {
    root:         ROOT,
    memory:       path.join(ROOT, 'memory'),
    projectState: path.join(ROOT, 'memory', 'project-state.json'),
    goals:        path.join(ROOT, 'memory', 'goals.json'),
    decisionsLog: path.join(ROOT, 'memory', 'decisions.log'),
    outputs:      path.join(ROOT, 'memory', 'outputs'),
    agents:       path.join(ROOT, 'ai', 'agents'),
    creative:     path.join(ROOT, 'creative'),
    animeMorph:   path.join(ROOT, 'creative', 'anime-morph'),
  },

  // ---- env keys ----
  env: {
    anthropic:    'ANTHROPIC_API_KEY',
    groq:         'GROQ_API_KEY',
    openai:       'OPENAI_API_KEY',
    ollamaUrl:    'OLLAMA_URL',         // default http://localhost:11434
    oobaboogaUrl: 'OOBABOOGA_URL',
  },

  // ---- Ollama defaults ----
  ollama: {
    baseUrl:      'http://localhost:11434',
    // Recommended models (pulled by user)
    models: {
      fast:     'llama3.2:3b',    // 2GB  — instant, simple tasks
      balanced: 'qwen2.5:7b',     // 4.7GB — best all-rounder
      code:     'qwen2.5-coder:7b', // code generation
    },
  },

  // ---- smart routing policy ----
  // Each tier costs progressively more tokens/money.
  // B.O.S.S auto-picks the cheapest tier that can handle the task.
  //
  //  TIER 1 LOCAL  — Ollama  — free, instant, private
  //  TIER 2 FAST   — Groq    — free tier, ~200ms, 70B models
  //  TIER 3 CLOUD  — Claude  — paid, best quality
  //
  routing: {
    // Tasks that always use local model (if available)
    local: ['quickReply', 'dataExtract', 'classify', 'summarise', 'template'],
    // Tasks that use Groq fast lane
    groq:  ['analyse', 'research', 'contentIdeas', 'socialPost', 'coach'],
    // Tasks that always use Claude (quality-critical)
    cloud: ['pitch', 'strategy', 'longform', 'code', 'vision', 'build'],
  },

  models: {
    default:  { provider: 'anthropic', id: 'claude-haiku-4-5-20251001' },
    plan:     { provider: 'anthropic', id: 'claude-haiku-4-5-20251001' },
    build:    { provider: 'anthropic', id: 'claude-sonnet-4-5'          },
    analyse:  { provider: 'groq',      id: 'llama-3.3-70b-versatile'   },
    grow:     { provider: 'anthropic', id: 'claude-haiku-4-5-20251001' },
    fast:     { provider: 'groq',      id: 'llama-3.1-8b-instant'      },
    local:    { provider: 'ollama',    id: 'qwen2.5:7b'                 },
    fallback: ['anthropic', 'groq', 'ollama'],
  },

  // ---- agents ----
  agents: [
    { id: 'planner',  label: 'Planner',   role: 'breaks goals into tasks',      taskKind: 'plan'    },
    { id: 'builder',  label: 'Builder',   role: 'writes code + solutions',      taskKind: 'build'   },
    { id: 'analyst',  label: 'Analyst',   role: 'reviews output + performance', taskKind: 'analyse' },
    { id: 'growth',   label: 'Growth',    role: 'business strategy + moves',    taskKind: 'grow'    },
    { id: 'designer', label: 'Designer',  role: 'UI, 3D, visuals',              taskKind: 'build'   },
    { id: 'content',  label: 'Content',   role: 'posts, videos, assets',        taskKind: 'build'   },
  ],

  // ---- persona ----
  persona: {
    name:         'B.O.S.S',
    archetype:    'Jarvis × operator × master strategist',
    tone:         'calm, direct, one-step-ahead, British spelling, no fluff',
    greetingName: 'Josh',
    guardrails: [
      'Never flatter — respect the user by being honest and specific.',
      'Always end with one clear NEXT MOVE.',
      'Route cheap tasks local, save API tokens for quality-critical work.',
      'Automate the hard things; keep easy things one-click.',
    ],
  },
};
