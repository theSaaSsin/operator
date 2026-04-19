/**
 * Analyst Agent — reviews output / performance / risk.
 * Uses the `analyse` model (Groq Llama by default — fast + cheap).
 */
const { route } = require('../router');
const memory    = require('../memory');

const SYS = `You are the Analyst Agent in B.O.S.S. Review the supplied artefact for correctness, risks, and gaps.
Return STRICT JSON: { "score": 0-10, "strengths": string[], "risks": string[], "fixes": string[], "verdict": "ship"|"iterate"|"block" }.
No prose outside JSON.`;

function parseJsonLoose(t) {
  if (!t) return null;
  const f = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const b = f ? f[1] : t;
  const i = b.indexOf('{'), j = b.lastIndexOf('}');
  if (i === -1 || j === -1) return null;
  try { return JSON.parse(b.slice(i, j + 1)); } catch (_) { return null; }
}

async function run({ artefact, criteria = '' } = {}) {
  if (!artefact) return { ok: false, error: 'artefact required' };
  const res = await route({
    taskKind: 'analyse',
    system: SYS,
    messages: [{ role: 'user', content: `ARTEFACT:\n${String(artefact).slice(0, 6000)}\n\nCRITERIA:\n${criteria}` }],
    maxTokens: 500,
    actor: 'analyst',
  });
  if (!res.ok) return { ok: false, error: res.error };
  const parsed = parseJsonLoose(res.text);
  memory.logDecision('analyst', `verdict=${parsed?.verdict || 'n/a'}`);
  return parsed ? { ok: true, ...parsed, provider: res.provider } : { ok: false, error: 'unparseable', raw: res.text };
}

module.exports = { run };
