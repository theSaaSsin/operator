/**
 * Planner Agent — breaks a goal into an ordered task list.
 *
 * run({ goal, context }) -> { ok, tasks[], rationale }
 * Side-effect: pushes tasks into project-state.active_tasks and logs decision.
 */

const { route } = require('../router');
const memory    = require('../memory');

const SYS = `You are the Planner Agent inside B.O.S.S.
Given a goal, return a STRICT JSON object: { "rationale": string, "tasks": [ { "id": string, "title": string, "effort": "s"|"m"|"l", "depends_on": string[] } ] }
Rules:
- 3 to 7 tasks, ordered by execution.
- ids are kebab-case, unique.
- First task must be the smallest concrete next action, doable in under 30 minutes.
- Last task must be a verification/ship step.
- No prose outside the JSON. No markdown fences.`;

function parseJsonLoose(text) {
  if (!text) return null;
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1] : text;
  const first = body.indexOf('{');
  const last  = body.lastIndexOf('}');
  if (first === -1 || last === -1) return null;
  try { return JSON.parse(body.slice(first, last + 1)); } catch (_) { return null; }
}

async function run({ goal, context = '' } = {}) {
  if (!goal) return { ok: false, error: 'goal required' };
  const state = memory.readState();

  const userMsg = `GOAL: ${goal}\n\nPROJECT CONTEXT (truncated):\n${context || JSON.stringify({
    current_goal: state.current_goal,
    active_tasks: (state.active_tasks || []).map(t => t.title),
    known_issues: state.known_issues || [],
  }, null, 2)}`;

  const res = await route({
    taskKind: 'plan',
    system: SYS,
    messages: [{ role: 'user', content: userMsg }],
    maxTokens: 800,
    actor: 'planner',
  });

  if (!res.ok) return { ok: false, error: res.error };
  const parsed = parseJsonLoose(res.text);
  if (!parsed || !Array.isArray(parsed.tasks)) {
    return { ok: false, error: 'planner returned unparseable output', raw: res.text };
  }

  // push into memory palace
  parsed.tasks.forEach(t => memory.addTask({ ...t, source: 'planner', forGoal: goal }));
  memory.logDecision('planner', `plan for "${goal}" produced ${parsed.tasks.length} tasks via ${res.provider}`);

  return { ok: true, rationale: parsed.rationale || '', tasks: parsed.tasks, provider: res.provider };
}

module.exports = { run };
