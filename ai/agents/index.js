/**
 * ai/agents/index.js — agent registry.
 *
 * Usage:
 *   const agents = require('./ai/agents');
 *   await agents.run('planner', { goal: '...' });
 */

const planner = require('./planner');
const builder = require('./builder');
const analyst = require('./analyst');
const growth  = require('./growth');

const registry = { planner, builder, analyst, growth };

async function run(id, args) {
  const agent = registry[id];
  if (!agent) return { ok: false, error: 'unknown agent: ' + id };
  return agent.run(args);
}

function list() {
  return Object.keys(registry);
}

module.exports = { run, list, registry };
