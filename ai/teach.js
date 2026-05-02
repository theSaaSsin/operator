/**
 * ai/teach.js — Vibe-coding mentor. Generates a 3-lesson micro-curriculum
 * for any topic and persists it to memory/outputs/lessons/<topic>.md.
 */
const fs   = require('fs');
const path = require('path');
const cfg    = require('../config/boss.config');
const memory = require('./memory');
const { route } = require('./router');

const SYS = `You are the Teach Agent in B.O.S.S — a "vibe-coding boss" mentor.
Given a TOPIC, return a markdown curriculum with EXACTLY this shape:

# <topic>

## Lesson 1 — <hook title>
**Concept (2 lines):** ...
**Snippet:** \`\`\`<lang>\n<runnable code, <=12 lines>\n\`\`\`
**Try it:** <one-line instruction>

## Lesson 2 — ...
(same shape)

## Lesson 3 — ...
(same shape)

## Mini Challenge
<one concrete 30-min build task>

## Boss tip
<one sentence, dryly witty>

No prose outside this structure. British spelling.`;

function lessonsDir() {
  const d = path.join(cfg.paths.outputs, 'lessons');
  fs.mkdirSync(d, { recursive: true });
  return d;
}

async function teach({ topic, level = 'intermediate' } = {}) {
  if (!topic) return { ok: false, error: 'topic required' };
  const r = await route({
    taskKind: 'plan',
    system: SYS,
    messages: [{ role: 'user', content: `TOPIC: ${topic}\nLEVEL: ${level}` }],
    maxTokens: 900,
    actor: 'teach',
  });
  if (!r.ok) return { ok: false, error: r.error };

  const slug = String(topic).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  const file = path.join(lessonsDir(), `${slug}.md`);
  fs.writeFileSync(file, r.text);
  memory.logDecision('teach', `lesson saved -> ${file}`);

  return { ok: true, topic, level, markdown: r.text, savedTo: file.replace(cfg.paths.root, '') };
}

function listLessons() {
  try {
    return fs.readdirSync(lessonsDir())
      .filter(f => f.endsWith('.md'))
      .map(f => ({ slug: f.replace(/\.md$/, ''), file: `/memory/outputs/lessons/${f}` }));
  } catch (_) { return []; }
}

module.exports = { teach, listLessons };
