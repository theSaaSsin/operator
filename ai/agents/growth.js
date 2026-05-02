/**
 * Growth Agent — suggests next business moves.
 * Output is a tiny JSON action-list, easy to render in the Suggestions panel.
 */
const { route } = require('../router');
const memory    = require('../memory');

const SYS = `You are the Growth Agent in B.O.S.S. Given a business snapshot, return STRICT JSON:
{ "moves": [ { "title": string, "why": string, "effort": "s"|"m"|"l", "impact": "s"|"m"|"l", "tool": string } ] }
3 to 5 moves. Prioritise highest impact / lowest effort. Tool = which B.O.S.S capability to invoke (/scan, /content, /deploy, etc).
No prose outside JSON.`;

function parseJsonLoose(t) {
  if (!t) return null;
  const f = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const b = f ? f[1] : t;
  const i = b.indexOf('{'), j = b.lastIndexOf('}');
  if (i === -1 || j === -1) return null;
  try { return JSON.parse(b.slice(i, j + 1)); } catch (_) { return null; }
}

async function run({ snapshot = '' } = {}) {
  const state = memory.readState();
  const snap = snapshot || JSON.stringify({
    goal: state.current_goal,
    active: (state.active_tasks || []).map(t => t.title),
    issues: state.known_issues,
  });
  const res = await route({
    taskKind: 'grow',
    system: SYS,
    messages: [{ role: 'user', content: `SNAPSHOT:\n${snap}`.slice(0, 4000) }],
    maxTokens: 500,
    actor: 'growth',
  });
  if (!res.ok) return { ok: false, error: res.error };
  const parsed = parseJsonLoose(res.text);
  memory.logDecision('growth', `suggested ${parsed?.moves?.length || 0} moves`);
  return parsed ? { ok: true, ...parsed, provider: res.provider } : { ok: false, error: 'unparseable', raw: res.text };
}

module.exports = { run };
