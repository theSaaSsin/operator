/**
 * Builder Agent — writes code / concrete solutions for a task.
 * Token-efficient: uses `build` model, capped tokens, compact system.
 */
const { route } = require('../router');
const memory    = require('../memory');

const SYS = `You are the Builder Agent in B.O.S.S. Output runnable code or concrete diffs only.
- If code: wrap in \`\`\`lang fenced blocks with a filename header comment.
- If diff: unified diff format.
- No explanation prose beyond 2 lines at top.
- End with a single line: NEXT MOVE: <one concrete action>.`;

async function run({ task, context = '' } = {}) {
  if (!task) return { ok: false, error: 'task required' };
  const res = await route({
    taskKind: 'build',
    system: SYS,
    messages: [{ role: 'user', content: `TASK: ${task}\n\nCONTEXT:\n${context}`.slice(0, 6000) }],
    maxTokens: 900,
    actor: 'builder',
  });
  memory.logDecision('builder', `built for task "${String(task).slice(0, 60)}" ok=${res.ok}`);
  return res.ok ? { ok: true, output: res.text, provider: res.provider } : { ok: false, error: res.error };
}

module.exports = { run };
