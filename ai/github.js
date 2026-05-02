/**
 * ai/github.js — "build off of GitHub repos easily"
 *
 * Token-efficient integration layer for repo discovery + import.
 *
 * Capabilities:
 *   search(query, opts)     -> GitHub search (public, no auth needed for low-rate).
 *   inspect(owner, repo)    -> README + package.json + primary lang + latest commit.
 *   suggest(topic)          -> Analyst-scored shortlist for a given goal/topic.
 *   clone(owner, repo, dir) -> git clone into /memory/outputs/repos/<name>.
 *   importStatic(owner, repo, { subdir, destSubdir }) -> copy static assets
 *       (public/, dist/, build/) into /public/imports/<name> — the Operator
 *       can serve/showcase them immediately, no build step.
 *
 * No GitHub token required for read-only discovery. Clone uses system git.
 */

const fs   = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const cfg    = require('../config/boss.config');
const memory = require('./memory');

const GH_API = 'https://api.github.com';

function headers() {
  const h = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'BOSS-Operator' };
  if (process.env.GITHUB_TOKEN) h['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function gh(pathname) {
  const res = await fetch(GH_API + pathname, { headers: headers() });
  if (!res.ok) throw new Error(`gh ${pathname} ${res.status}`);
  return res.json();
}

async function search(query, { language, sort = 'stars', per_page = 8 } = {}) {
  const q = encodeURIComponent(query + (language ? ` language:${language}` : ''));
  const data = await gh(`/search/repositories?q=${q}&sort=${sort}&per_page=${per_page}`);
  const items = (data.items || []).map(r => ({
    full_name: r.full_name,
    html_url: r.html_url,
    description: r.description,
    stars: r.stargazers_count,
    language: r.language,
    topics: r.topics || [],
    pushed_at: r.pushed_at,
  }));
  memory.logDecision('github', `search "${query}" -> ${items.length} repos`);
  return items;
}

async function inspect(owner, repo) {
  const [meta, readme, pkg] = await Promise.allSettled([
    gh(`/repos/${owner}/${repo}`),
    gh(`/repos/${owner}/${repo}/readme`),
    gh(`/repos/${owner}/${repo}/contents/package.json`),
  ]);
  const out = { owner, repo };
  if (meta.status === 'fulfilled') {
    out.description = meta.value.description;
    out.language    = meta.value.language;
    out.stars       = meta.value.stargazers_count;
    out.topics      = meta.value.topics;
    out.default_branch = meta.value.default_branch;
  }
  if (readme.status === 'fulfilled' && readme.value.content) {
    out.readme = Buffer.from(readme.value.content, 'base64').toString('utf8').slice(0, 6000);
  }
  if (pkg.status === 'fulfilled' && pkg.value.content) {
    try {
      out.package = JSON.parse(Buffer.from(pkg.value.content, 'base64').toString('utf8'));
    } catch (_) {}
  }
  return out;
}

async function suggest(topic) {
  const items = await search(topic, { per_page: 10 });
  // cheap local scoring: recent push + stars + topic overlap
  const now = Date.now();
  const scored = items.map(r => {
    const ageDays = (now - new Date(r.pushed_at).getTime()) / 86400000;
    const recency = Math.max(0, 1 - ageDays / 365);
    const score = Math.log10((r.stars || 0) + 10) + recency * 2;
    return { ...r, score: Math.round(score * 100) / 100 };
  }).sort((a, b) => b.score - a.score);
  memory.touchOutput(`github-suggest-${topic.slice(0,30).replace(/\W+/g,'-')}`, scored);
  return scored.slice(0, 6);
}

function reposDir() {
  const d = path.join(cfg.paths.outputs, 'repos');
  fs.mkdirSync(d, { recursive: true });
  return d;
}

function clone(owner, repo, { depth = 1 } = {}) {
  const dest = path.join(reposDir(), `${owner}__${repo}`);
  if (fs.existsSync(dest)) return { ok: true, path: dest, cached: true };
  try {
    execFileSync('git', ['clone', '--depth', String(depth), `https://github.com/${owner}/${repo}.git`, dest], { stdio: 'pipe' });
    memory.logDecision('github', `cloned ${owner}/${repo} -> ${dest}`);
    return { ok: true, path: dest, cached: false };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

/**
 * Clone a repo and copy its static output (public/ or dist/ or build/)
 * into public/imports/<name> so the Operator serves it under that path.
 */
function importStatic(owner, repo, { subdir, destSubdir } = {}) {
  const cloned = clone(owner, repo);
  if (!cloned.ok) return cloned;
  const candidates = subdir ? [subdir] : ['public', 'dist', 'build', 'out', 'site'];
  const src = candidates.map(c => path.join(cloned.path, c)).find(p => fs.existsSync(p));
  if (!src) return { ok: false, error: `no static folder found in ${owner}/${repo} (tried: ${candidates.join(', ')})` };
  const slug = destSubdir || `${owner}__${repo}`;
  const dest = path.join(cfg.paths.root, 'public', 'imports', slug);
  copyDir(src, dest);
  memory.logDecision('github', `imported ${owner}/${repo}/${path.basename(src)} -> public/imports/${slug}`);
  return { ok: true, servedAt: `/imports/${slug}/`, source: src };
}

module.exports = { search, inspect, suggest, clone, importStatic };
