/**
 * ai/coach.js — Proactive "stay 1 step ahead" engine.
 *
 * Periodically (or on-demand) reads project-state, recent decisions, and
 * tool-kit health, then asks the Growth + Analyst agents to surface the
 * single most useful NEXT MOVE. Caches result for the dashboard panel.
 */
const fs   = require('fs');
const cfg    = require('../config/boss.config');
const memory = require('./memory');
const { route } = require('./router');

const SYS = `You are the Coach inside B.O.S.S.
Given the user's current project state and recent decision log, return STRICT JSON:
{
  "headline": string,                 // <= 70 chars, the one thing to do now
  "why": string,                      // 1 sentence
  "do_now": [ { "label": string, "command": string } ],   // 1-3 micro actions
  "blockers_spotted": [ string ],     // 0-3 short notes
  "vibe": "green" | "amber" | "red"
}
No prose outside JSON.`;

function recentDecisions(n = 12) {
  try {
    const lines = fs.readFileSync(cfg.paths.decisionsLog, 'utf8').trim().split('\n');
    return lines.slice(-n);
  } catch (_) { return []; }
}

async function tick() {
  const state = memory.readState();
  const decisions = recentDecisions(15);
  const userMsg = `STATE:\n${JSON.stringify({
    goal: state.current_goal,
    active: (state.active_tasks || []).map(t => t.title),
    issues: state.known_issues,
    next: state.next_steps,
  }, null, 2)}\n\nRECENT DECISIONS (last 15):\n${decisions.join('\n')}`;

  const r = await route({
    taskKind: 'analyse',
    system: SYS,
    messages: [{ role: 'user', content: userMsg.slice(0, 5000) }],
    maxTokens: 400,
    actor: 'coach',
  });
  if (!r.ok) return { ok: false, error: r.error };

  const f = r.text.match(/\{[\s\S]*\}/);
  let parsed = null;
  try { parsed = JSON.parse(f ? f[0] : r.text); } catch (_) {}
  if (!parsed) return { ok: false, error: 'unparseable', raw: r.text };

  const out = { ok: true, ts: new Date().toISOString(), provider: r.provider, ...parsed };
  memory.touchOutput('coach-latest', out);
  memory.writeState({ coach_latest: out });
  memory.logDecision('coach', `tick vibe=${parsed.vibe} headline="${parsed.headline.slice(0, 50)}"`);
  return out;
}

function latest() {
  return memory.readState().coach_latest || null;
}

module.exports = { tick, latest };
