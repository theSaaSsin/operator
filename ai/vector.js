'use strict';

/**
 * ai/vector.js — Zero-dependency semantic vector store
 *
 * Embeddings: Gemini text-embedding-004 (free 1500 RPD) → fallback OpenAI text-embedding-3-small
 * Storage:    data/vector-store.json  [{id, content, embedding[], metadata{}, created, ns}]
 * Search:     cosine similarity, pure JS
 */

const fs   = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', 'data', 'vector-store.json');

// ── Config helpers ────────────────────────────────────────────────────────────
function readCfgKey(key) {
  if (process.env[key]) return process.env[key];
  try {
    const MAP = {
      GEMINI_API_KEY: 'geminiApiKey',
      OPENAI_API_KEY: 'openaiApiKey',
    };
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'config.json'), 'utf8'));
    return data[MAP[key]] || null;
  } catch (_) { return null; }
}

// ── Store I/O ─────────────────────────────────────────────────────────────────
function loadStore() {
  try {
    if (!fs.existsSync(STORE_PATH)) return [];
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  } catch (_) { return []; }
}

function saveStore(store) {
  try { fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true }); } catch (_) {}
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

// ── Embedding providers ───────────────────────────────────────────────────────
async function embedGemini(text) {
  const key = readCfgKey('GEMINI_API_KEY');
  if (!key) throw new Error('no gemini key');
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${key}`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ model: 'models/text-embedding-004', content: { parts: [{ text }] } }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'gemini embed error');
  return data.embedding.values; // 768-dim float[]
}

async function embedOpenAI(text) {
  const key = readCfgKey('OPENAI_API_KEY');
  if (!key) throw new Error('no openai key');
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'openai embed error');
  return data.data[0].embedding; // 1536-dim float[]
}

async function embed(text) {
  try { return await embedGemini(text); } catch (_) {}
  try { return await embedOpenAI(text); } catch (_) {}
  throw new Error('No embedding provider configured. Add a free Gemini key at aistudio.google.com.');
}

// ── Math ──────────────────────────────────────────────────────────────────────
function cosineSim(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Add or update a document in the vector store.
 * @param {string} id        - unique key (e.g. 'lead:123', 'bible:cold-outreach')
 * @param {string} content   - text to embed and store
 * @param {object} metadata  - any JSON-serialisable data to attach
 * @param {string} ns        - namespace for scoped search ('leads','bible','pitches',...)
 */
async function upsert(id, content, metadata = {}, ns = 'default') {
  const store = loadStore();
  const embedding = await embed(content);
  const idx = store.findIndex(d => d.id === id);
  const doc = { id, content, embedding, metadata, ns, created: new Date().toISOString() };
  if (idx >= 0) store[idx] = doc; else store.push(doc);
  saveStore(store);
  return { ok: true, id, ns, dims: embedding.length };
}

/**
 * Search for the top-k most similar documents.
 * @param {string}   query  - natural-language query
 * @param {object}   opts   - { topK, ns, threshold }
 */
async function search(query, { topK = 5, ns = null, threshold = 0.3 } = {}) {
  const store = loadStore();
  if (!store.length) return [];
  const qvec = await embed(query);
  return store
    .filter(d => !ns || d.ns === ns)
    .map(d => ({ ...d, score: cosineSim(qvec, d.embedding) }))
    .filter(d => d.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ embedding: _e, ...rest }) => rest); // strip raw embedding from results
}

/** List all documents (no embeddings) */
function list(ns = null) {
  return loadStore()
    .filter(d => !ns || d.ns === ns)
    .map(({ embedding: _e, ...rest }) => rest);
}

/** Delete a document by id */
function remove(id) {
  const store = loadStore().filter(d => d.id !== id);
  saveStore(store);
  return { ok: true, id };
}

/** Delete all documents in a namespace */
function clearNs(ns) {
  const store = loadStore().filter(d => d.ns !== ns);
  saveStore(store);
  return { ok: true, ns };
}

/** Stats */
function stats() {
  const store = loadStore();
  const ns = {};
  store.forEach(d => { ns[d.ns] = (ns[d.ns] || 0) + 1; });
  return { total: store.length, namespaces: ns };
}

module.exports = { upsert, search, list, remove, clearNs, stats, embed };
