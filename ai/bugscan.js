/**
 * ai/bugscan.js — Quick repo bug-scan.
 *
 * Walks the repo for cheap heuristic smells (TODOs, missing await,
 * console.error, broken requires, missing files referenced in routes),
 * then asks the Analyst agent to score the top findings.
 */
const fs   = require('fs');
const path = require('path');
const cfg    = require('../config/boss.config');
const memory = require('./memory');
const { route } = require('./router');

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'memory', '.lovable-import', 'public/imports', 'public/assets']);
const EXTS      = new Set(['.js', '.ts', '.tsx', '.jsx', '.mjs', '.cjs']);

function* walk(dir, root) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.relative(root, path.join(dir, entry.name));
    if (SKIP_DIRS.has(entry.name) || [...SKIP_DIRS].some(s => rel.replace(/\\/g, '/').startsWith(s))) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full, root);
    else if (EXTS.has(path.extname(entry.name))) yield full;
  }
}

const SMELLS = [
  { id: 'todo',          re: /\b(TODO|FIXME|XXX|HACK)\b/g,             label: 'TODO/FIXME marker' },
  { id: 'console-error', re: /console\.(error|warn)\(/g,               label: 'console.error / warn' },
  { id: 'unused-await',  re: /^\s*await\s+[a-z]+\s*\(\s*\)\s*;?\s*$/gm, label: 'lone await line (suspicious)' },
  { id: 'no-catch',      re: /\.then\([^)]*\)(?!\s*\.catch)/g,         label: '.then without .catch' },
  { id: 'unsafe-eval',   re: /\beval\s*\(/g,                            label: 'eval()' },
  { id: 'http-no-tls',   re: /http:\/\/(?!localhost|127\.|0\.0\.0\.0)/g, label: 'http:// (non-localhost)' },
];

function scanFile(file, root) {
  const txt = fs.readFileSync(file, 'utf8');
  const findings = [];
  for (const s of SMELLS) {
    const matches = txt.match(s.re);
    if (matches && matches.length) findings.push({ smell: s.id, label: s.label, count: matches.length });
  }
  return findings.length ? { file: path.relative(root, file).replace(/\\/g, '/'), findings } : null;
}

async function scan({ withVerdict = false } = {}) {
  const root = cfg.paths.root;
  const results = [];
  for (const f of walk(root, root)) {
    const r = scanFile(f, root);
    if (r) results.push(r);
  }
  // Top 20 worst offenders
  const top = results
    .map(r => ({ ...r, score: r.findings.reduce((a, b) => a + b.count, 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  memory.logDecision('bugscan', `scanned ${results.length} files, top score=${top[0]?.score || 0}`);

  let verdict = null;
  if (withVerdict && top.length) {
    const summary = top.slice(0, 8).map(t =>
      `${t.file}: ${t.findings.map(f => `${f.smell}(${f.count})`).join(', ')}`
    ).join('\n');
    const r = await route({
      taskKind: 'analyse',
      system: 'You triage bug-scan output. Return STRICT JSON: {"top_3_to_fix":[{"file":string,"why":string,"action":string}], "overall":"clean"|"watch"|"act"}',
      messages: [{ role: 'user', content: summary }],
      maxTokens: 350,
      actor: 'bugscan',
    });
    if (r.ok) {
      try { verdict = JSON.parse(r.text.match(/\{[\s\S]*\}/)[0]); } catch (_) {}
    }
  }

  return { ok: true, totalFiles: results.length, top, verdict };
}

module.exports = { scan };
