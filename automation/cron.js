/**
 * automation/cron.js — in-process scheduler.
 *
 * No external cron required. Loaded once by server.js, schedules:
 *   - Coach tick every 30 min  (proactive next-move suggestion)
 *   - Self-improvement surface every 24 h (recommend GitHub repos)
 *
 * Disable per-job with env: BOSS_CRON_DISABLE="coach,surface".
 */
const cfg     = require('../config/boss.config');
const memory  = require('../ai/memory');
const coach   = require('../ai/coach');
const github  = require('../ai/github');

const DISABLED = new Set((process.env.BOSS_CRON_DISABLE || '').split(',').map(s => s.trim()).filter(Boolean));
const timers = [];

function every(ms, name, fn) {
  if (DISABLED.has(name)) {
    memory.logDecision('cron', `${name} disabled by env`);
    return;
  }
  // First run after 60s so server is fully up.
  const t = setTimeout(function tick() {
    Promise.resolve().then(fn).catch(e => memory.logDecision('cron', `${name} FAIL ${e.message}`));
    timers.push(setInterval(() => {
      Promise.resolve().then(fn).catch(e => memory.logDecision('cron', `${name} FAIL ${e.message}`));
    }, ms));
  }, 60_000);
  timers.push(t);
  memory.logDecision('cron', `scheduled ${name} every ${Math.round(ms/60000)}m`);
}

function start() {
  every(30 * 60_000, 'coach', async () => {
    const r = await coach.tick();
    memory.logDecision('cron', `coach tick vibe=${r?.vibe || 'n/a'}`);
  });
  every(cfg.selfImprove.surfaceToolsEveryHours * 3_600_000, 'surface', async () => {
    const topic = memory.readState().current_goal || 'ai agents nodejs';
    const repos = await github.suggest(topic);
    memory.writeState({ last_surface: { topic, at: new Date().toISOString(), count: repos.length, repos: repos.slice(0,3) } });
  });
}

function stop() {
  timers.forEach(t => { try { clearTimeout(t); clearInterval(t); } catch (_) {} });
  timers.length = 0;
}

module.exports = { start, stop };
