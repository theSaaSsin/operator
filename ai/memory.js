/**
 * ai/memory.js — the "Memory Palace"
 *
 * Shared, persistent state across Claude / Bolt / local models.
 * Every agent reads project-state.json before acting and appends a line
 * to decisions.log after acting.
 *
 * API:
 *   readState()                   -> object
 *   writeState(patch)             -> object   (shallow merge, always bumps updatedAt)
 *   addTask(task)                 -> object   (push to active_tasks)
 *   completeTask(id, extra?)      -> object   (move to completed_tasks)
 *   logDecision(actor, message)   -> void     (append to decisions.log)
 *   readGoals()                   -> object
 *   touchOutput(name, payload)    -> path     (writes memory/outputs/<name>.json)
 */

const fs   = require('fs');
const path = require('path');
const cfg  = require('../config/boss.config');

function ensureDir(p) { try { fs.mkdirSync(p, { recursive: true }); } catch (_) {} }

function readState() {
  try {
    const raw = fs.readFileSync(cfg.paths.projectState, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { schemaVersion: 1, updatedAt: new Date().toISOString(), active_tasks: [], completed_tasks: [] };
  }
}

function writeState(patch = {}) {
  const current = readState();
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
  ensureDir(cfg.paths.memory);
  fs.writeFileSync(cfg.paths.projectState, JSON.stringify(next, null, 2));
  return next;
}

function addTask(task) {
  const s = readState();
  const list = Array.isArray(s.active_tasks) ? s.active_tasks : [];
  const entry = {
    id: task.id || ('task-' + Date.now().toString(36)),
    title: task.title || 'Untitled task',
    status: task.status || 'pending',
    createdAt: new Date().toISOString(),
    ...task,
  };
  list.push(entry);
  return writeState({ active_tasks: list });
}

function completeTask(id, extra = {}) {
  const s = readState();
  const active = Array.isArray(s.active_tasks) ? s.active_tasks : [];
  const done   = Array.isArray(s.completed_tasks) ? s.completed_tasks : [];
  const idx = active.findIndex(t => t.id === id);
  if (idx === -1) return s;
  const [task] = active.splice(idx, 1);
  done.push({ ...task, ...extra, status: 'completed', completedAt: new Date().toISOString() });
  return writeState({ active_tasks: active, completed_tasks: done });
}

function logDecision(actor, message) {
  ensureDir(cfg.paths.memory);
  const line = `${new Date().toISOString()}\t${actor}\t${String(message).replace(/\s+/g, ' ').trim()}\n`;
  fs.appendFileSync(cfg.paths.decisionsLog, line);
}

function readGoals() {
  try { return JSON.parse(fs.readFileSync(cfg.paths.goals, 'utf8')); }
  catch (_) { return { goals: [] }; }
}

function touchOutput(name, payload) {
  ensureDir(cfg.paths.outputs);
  const safe = String(name).replace(/[^a-z0-9._-]/gi, '_');
  const p = path.join(cfg.paths.outputs, safe + '.json');
  fs.writeFileSync(p, JSON.stringify(payload, null, 2));
  return p;
}

module.exports = {
  readState,
  writeState,
  addTask,
  completeTask,
  logDecision,
  readGoals,
  touchOutput,
};
