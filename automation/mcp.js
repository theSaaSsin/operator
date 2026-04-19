/**
 * automation/mcp.js — MCP "best skills" discovery.
 *
 * Stub registry of high-signal MCP servers worth bolting onto B.O.S.S.
 * Returns a curated, scored shortlist on demand. Acts as the "always
 * surfaces the best skills" layer the user asked for.
 *
 * Source policy:
 *  - Hand-curated baseline (this file)
 *  - Augmented at runtime by the discovered_mcp memory bucket if present
 */
const memory = require('../ai/memory');

const BASELINE = [
  {
    id: 'github', label: 'GitHub MCP',
    why: 'Full repo control — search, read, write, PRs, issues from inside BOSS.',
    install: 'npx @modelcontextprotocol/server-github',
    skills: ['repo.read','repo.write','issue.create','pr.merge'], score: 95,
  },
  {
    id: 'browser', label: 'Browser / Playwright MCP',
    why: 'Drives a real Chrome — scrape, screenshot, fill forms, login flows.',
    install: 'npx @playwright/mcp',
    skills: ['nav','click','screenshot','dom.read','form.fill'], score: 92,
  },
  {
    id: 'filesystem', label: 'Filesystem MCP',
    why: 'Safe sandboxed read/write inside a chosen folder. Great for output handling.',
    install: 'npx @modelcontextprotocol/server-filesystem ./memory/outputs',
    skills: ['fs.read','fs.write','fs.glob'], score: 80,
  },
  {
    id: 'supabase', label: 'Supabase MCP',
    why: 'Direct DB queries, migrations, RLS — same DB BOSS already uses.',
    install: 'npx @supabase/mcp-server-supabase',
    skills: ['sql.exec','schema.list','migration.apply'], score: 88,
  },
  {
    id: 'figma', label: 'Figma MCP',
    why: 'Pull design tokens and frames straight into Content Studio.',
    install: 'Figma Desktop -> Plugins -> Dev Mode MCP Server',
    skills: ['design.context','tokens.read','frame.export'], score: 78,
  },
  {
    id: 'vercel', label: 'Vercel MCP',
    why: 'Deploy + tail logs from chat. Plays nice with the new vercel.json.',
    install: 'Add Vercel MCP via Vercel dashboard -> Integrations',
    skills: ['deploy','logs','env.set'], score: 84,
  },
  {
    id: 'huggingface', label: 'Hugging Face MCP',
    why: 'Search Spaces/models/datasets; spin up new model endpoints fast.',
    install: 'npx @huggingface/mcp-server',
    skills: ['model.search','space.search','paper.search'], score: 76,
  },
];

function discover({ topic = '', limit = 6 } = {}) {
  const extra = memory.readState().discovered_mcp || [];
  const all = [...BASELINE, ...extra];
  const t = topic.toLowerCase();
  const scored = all.map(s => {
    let bonus = 0;
    if (t && (s.label.toLowerCase().includes(t) || (s.skills || []).some(k => k.includes(t)))) bonus += 15;
    return { ...s, _final: (s.score || 60) + bonus };
  }).sort((a, b) => b._final - a._final).slice(0, limit);
  memory.logDecision('mcp', `discover topic="${topic}" -> ${scored.length}`);
  return scored;
}

function record(server) {
  const s = memory.readState();
  const list = Array.isArray(s.discovered_mcp) ? s.discovered_mcp : [];
  list.push({ ...server, recordedAt: new Date().toISOString() });
  memory.writeState({ discovered_mcp: list });
  return list;
}

module.exports = { discover, record, BASELINE };
