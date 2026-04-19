/* ── TheSaaSsin Operator Panel — operator.js ── */
'use strict';

const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? `http://localhost:${window.location.port || 4000}/api`
  : `${window.location.origin}/api`;

/* ── CLOCK ── */
(function clock() {
  const el = document.getElementById('clock');
  function tick() {
    if (el) el.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  tick(); setInterval(tick, 30000);
})();

/* ── TOAST ── */
function toast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'show ' + (type === 'err' ? 'toast-err' : 'toast-ok');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = ''; }, 3000);
}

/* ── NAV ── */
const panels = document.querySelectorAll('.panel');
const navItems = document.querySelectorAll('.nav-item');
const topbarTitle = document.getElementById('topbar-title');
const TITLES = { client: 'Brand Studio', outputs: 'Outputs · Brand Assets', feed: 'Lead Feed', crm: 'CRM / Lead Pipeline', outreach: 'Outreach Queue', followups: 'Follow-ups · 48hr Engine', explorer: 'Keyword Lab · Find New Targets', revenue: 'Revenue & Pipeline', settings: 'Persona & API Keys', workflow: 'Daily Workflow', toolkit: 'Tool Kit · AI Stack' };

/* ═══════════════════════════════════════════════════════════════════
 * TOOL KIT — live registry of AI tools (Scrapling · ModelsLab · Groq…)
 * ═════════════════════════════════════════════════════════════════ */
async function loadToolKit() {
  const grid = document.getElementById('toolkit-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted);grid-column:1/-1"><i class="fas fa-spinner fa-spin"></i> Loading tools…</div>';
  try {
    const r = await fetch((window.OP_CONFIG?.API || '/api') + '/tools');
    const data = await r.json();
    if (!data.ok) throw new Error('registry fetch failed');
    renderToolKit(data.tools);
    data.tools.forEach(t => pingTool(t.id));
  } catch (e) {
    grid.innerHTML = `<div style="padding:40px;text-align:center;color:#ff5d73;grid-column:1/-1">Failed to load Tool Kit: ${e.message}</div>`;
  }
}
function renderToolKit(tools) {
  const grid = document.getElementById('toolkit-grid');
  grid.innerHTML = tools.map(t => `
    <div class="tk-card" data-tool-id="${t.id}" style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;transition:all .3s">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:40px;height:40px;background:rgba(233,180,76,.12);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#e9b44c"><i class="fas ${t.icon||'fa-cube'}"></i></div>
          <div>
            <div style="font-weight:700;font-size:1rem">${t.label}</div>
            <div style="font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">${t.kind}</div>
          </div>
        </div>
        <span class="tk-status" id="tk-status-${t.id}" style="font-size:.7rem;font-weight:600;padding:3px 10px;border-radius:100px;background:rgba(255,255,255,.06);color:var(--muted)">…</span>
      </div>
      <p style="font-size:.85rem;color:var(--muted);margin:0 0 14px;line-height:1.4;min-height:40px">${t.tagline}</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
        ${(t.capabilities||[]).slice(0,4).map(c => `<span style="font-size:.65rem;background:rgba(233,180,76,.08);color:#e9b44c;padding:3px 8px;border-radius:4px;font-family:monospace">${c}</span>`).join('')}
      </div>
      <div style="display:flex;gap:8px">
        ${t.kind==='pinokio'
          ? `<button class="btn btn-secondary btn-sm" onclick="tkQuickScan('${t.id}')" style="flex:1"><i class="fas fa-play"></i> Quick scan</button>`
          : `<button class="btn btn-secondary btn-sm" onclick="tkConfigure('${t.id}','${t.envKey||''}')" style="flex:1"><i class="fas fa-key"></i> ${t.configured?'Reconfigure':'Add API key'}</button>`}
        ${t.docs ? `<a href="${t.docs}" target="_blank" class="btn btn-secondary btn-sm" title="Docs" style="padding:6px 10px"><i class="fas fa-book"></i></a>` : ''}
      </div>
    </div>
  `).join('');
}
async function pingTool(id) {
  const el = document.getElementById('tk-status-' + id);
  if (!el) return;
  try {
    const r = await fetch((window.OP_CONFIG?.API || '/api') + '/tools/health?id=' + id);
    const d = await r.json();
    let color='var(--muted)',bg='rgba(255,255,255,.06)',label=d.status||'?';
    if (d.status==='online')        { color='#c8ff00'; bg='rgba(200,255,0,.12)';  label='● ONLINE'; }
    else if (d.status==='offline')  { color='#ff5d73'; bg='rgba(255,93,115,.12)'; label='○ OFFLINE'; }
    else if (d.status==='configured'){ color='#c8ff00'; bg='rgba(200,255,0,.12)'; label='✓ READY'; }
    else if (d.status==='needs-key'){ color='#e9b44c'; bg='rgba(233,180,76,.12)'; label='! KEY NEEDED'; }
    el.textContent=label; el.style.color=color; el.style.background=bg;
  } catch (e) { el.textContent='ERR'; }
}
function tkQuickScan(id) {
  if (id === 'scrapling') {
    const kw = prompt('Keyword for stealth Reddit scan:', 'need clients');
    if (!kw) return;
    alert(`Scanning with Scrapling for "${kw}"…\n\nLead Feed will light up if sidecar is running (port 5001).`);
  }
}
function tkConfigure(id, envKey) {
  goPanel('settings');
  setTimeout(() => {
    const notice = document.createElement('div');
    notice.innerHTML = `Set <code style="background:#0a0a0a;padding:2px 8px;border-radius:4px">${envKey}</code> in your .env to enable <b>${id}</b>.`;
    notice.style.cssText = 'position:fixed;top:80px;right:20px;background:#e9b44c;color:#0a0a0a;padding:14px 20px;border-radius:10px;font-weight:600;z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,.4);max-width:340px';
    document.body.appendChild(notice);
    setTimeout(()=>notice.remove(), 5000);
  }, 300);
}

/* ═══════════════════════════════════════════════════════════════════
 * B.O.S.S CHAT — floating Jarvis-tier operator (multi-model routed)
 * ═════════════════════════════════════════════════════════════════ */
const OPCHAT = {
  history: [],
  open: false,
  greeted: false,
  endpoint: '/boss/chat',  // upgraded from /chat → BOSS
  commands: [
    { cmd: '/plan',    desc: 'Planner Agent breaks a goal into tasks', hint: '/plan ship landing page' },
    { cmd: '/build',   desc: 'Builder Agent writes code',              hint: '/build add /api/leads route' },
    { cmd: '/analyse', desc: 'Analyst Agent reviews an artefact',      hint: '/analyse paste output' },
    { cmd: '/grow',    desc: 'Growth Agent suggests next moves',       hint: '/grow' },
    { cmd: '/surface', desc: 'Surface GitHub repos worth integrating', hint: '/surface remotion templates' },
    { cmd: '/scan',    desc: 'Scrape leads / sources',                  hint: '/scan need clients' },
    { cmd: '/brand',   desc: 'Open Brand Studio',                       hint: '/brand BlueTap Plumbing' },
    { cmd: '/pitch',   desc: 'Generate pitch doc',                      hint: '/pitch <client>' },
    { cmd: '/tools',   desc: 'Show Tool Kit status',                    hint: '/tools' },
    { cmd: '/deploy',  desc: 'Deploy to Cloudflare/Pages',              hint: '/deploy' },
    { cmd: '/help',    desc: 'Show all commands',                       hint: '/help' },
  ],
};
function opchatToggle() {
  const d = document.getElementById('opchat-drawer');
  OPCHAT.open = !OPCHAT.open;
  d.classList.toggle('open', OPCHAT.open);
  if (OPCHAT.open && !OPCHAT.greeted) opchatGreet();
  if (OPCHAT.open) setTimeout(() => document.getElementById('opchat-input').focus(), 300);
}
function opchatGreet() {
  OPCHAT.greeted = true;
  const hour = new Date().getHours();
  const t = hour < 5 ? 'Still up' : hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : hour < 22 ? 'Evening' : 'Late one';
  const persona = (window._operatorPersona || {});
  const nm = persona.name || 'Josh';
  // BOSS greeting: read state, surface the most useful next move.
  opchatAdd('bot', `${t}, ${nm}. <b>B.O.S.S</b> online — memory loaded, agents armed.<br>Try <code>/plan</code> a goal, <code>/surface</code> repos, or just tell me what's blocking you.`);
  // Background: pull state so suggestions panel stays fresh.
  fetch((window.OP_CONFIG?.API || '/api') + '/boss/state').then(r => r.json()).then(d => {
    if (d.ok && d.state?.next_steps?.length) {
      opchatAdd('bot', `<b>Next move (from memory):</b> ${escapeHtml(d.state.next_steps[0])}`);
    }
  }).catch(() => {});
}
function opchatAdd(role, text) {
  const wrap = document.getElementById('opchat-msgs');
  const el = document.createElement('div');
  el.className = 'opchat-msg ' + role;
  el.innerHTML = text;
  wrap.appendChild(el);
  wrap.scrollTop = wrap.scrollHeight;
}
function opchatTyping(on) {
  const wrap = document.getElementById('opchat-msgs');
  let t = document.getElementById('opchat-typing-el');
  if (on && !t) {
    t = document.createElement('div');
    t.id = 'opchat-typing-el';
    t.className = 'opchat-msg bot opchat-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    wrap.appendChild(t);
    wrap.scrollTop = wrap.scrollHeight;
  } else if (!on && t) {
    t.remove();
  }
}
async function opchatSend(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('opchat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  opchatAdd('user', escapeHtml(text));
  OPCHAT.history.push({ role: 'user', content: text });

  // slash command handling
  if (text.startsWith('/')) {
    const reply = await opchatHandleSlash(text);
    if (reply) {
      opchatAdd('bot', reply);
      OPCHAT.history.push({ role: 'assistant', content: reply });
      return;
    }
  }

  opchatTyping(true);
  try {
    const r = await fetch((window.OP_CONFIG?.API || '/api') + OPCHAT.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: OPCHAT.history,
        userName: (window._operatorPersona || {}).name || 'Josh',
        // taskKind hint lets BOSS router pick the cheapest model that fits.
        taskKind: text.length < 80 ? 'fast' : 'default',
      }),
    });
    const d = await r.json();
    opchatTyping(false);
    if (d.ok) {
      const html = escapeHtml(d.reply).replace(/`([^`]+)`/g, '<code>$1</code>');
      opchatAdd('bot', html);
      OPCHAT.history.push({ role: 'assistant', content: d.reply });
    } else {
      opchatAdd('bot', `<span style="color:#ff5d73">Error: ${d.error || 'chat failed'}</span>`);
    }
  } catch (err) {
    opchatTyping(false);
    opchatAdd('bot', `<span style="color:#ff5d73">Network error. Is server running?</span>`);
  }
}
async function opchatHandleSlash(text) {
  const [cmd, ...rest] = text.split(' ');
  const arg = rest.join(' ').trim();
  switch (cmd) {
    case '/help':
      return 'Commands:<br>' + OPCHAT.commands.map(c =>
        `<code>${c.cmd}</code> — ${c.desc}`
      ).join('<br>');
    case '/scan':
      if (!arg) return 'Usage: <code>/scan &lt;keyword&gt;</code>';
      setTimeout(() => { goPanel('feed'); if (typeof goScan === 'function') goScan(arg); }, 200);
      return `Scanning Reddit for "${escapeHtml(arg)}" — check Lead Feed.`;
    case '/brand':
      setTimeout(() => goPanel('client'), 200);
      return `Brand Studio opened${arg ? ` for <b>${escapeHtml(arg)}</b>` : ''}. Fill in the form to generate.`;
    case '/pitch':
      setTimeout(() => goPanel('outputs'), 200);
      return 'Opening Outputs → Pitch Doc tab.';
    case '/tools':
      setTimeout(() => goPanel('toolkit'), 200);
      return 'Opening Tool Kit. Scrapling + ModelsLab + Groq + Claude + more.';
    case '/run':
      if (!arg) return 'Usage: <code>/run &lt;tool&gt; &lt;args&gt;</code> — e.g. <code>/run scrapling reddit need-clients</code>';
      return `<code>${escapeHtml(arg)}</code> queued. (Wiring Phase — execution lands with Content Studio.)`;
    case '/deploy':
      return 'Cloudflare Pages deploy is Phase 6. Coming after Content Studio renders.';

    // ── B.O.S.S agent commands ─────────────────────────────────
    case '/plan': {
      if (!arg) return 'Usage: <code>/plan &lt;goal&gt;</code> — e.g. <code>/plan ship landing page tonight</code>';
      opchatTyping(true);
      const r = await fetch((window.OP_CONFIG?.API || '/api') + '/boss/plan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: arg }),
      }).then(r => r.json()).catch(e => ({ ok: false, error: e.message }));
      opchatTyping(false);
      if (!r.ok) return `<span style="color:#ff5d73">Planner failed: ${escapeHtml(r.error || '')}</span>`;
      const list = (r.tasks || []).map((t, i) => `${i+1}. <b>${escapeHtml(t.title)}</b> <small>(${t.effort||'m'})</small>`).join('<br>');
      return `<b>Plan for:</b> ${escapeHtml(arg)}<br>${escapeHtml(r.rationale||'')}<br><br>${list}<br><br><b>NEXT MOVE:</b> tackle task 1.`;
    }
    case '/build': {
      if (!arg) return 'Usage: <code>/build &lt;task description&gt;</code>';
      opchatTyping(true);
      const r = await fetch((window.OP_CONFIG?.API || '/api') + '/boss/build', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: arg }),
      }).then(r => r.json()).catch(e => ({ ok: false, error: e.message }));
      opchatTyping(false);
      if (!r.ok) return `<span style="color:#ff5d73">${escapeHtml(r.error||'build failed')}</span>`;
      return escapeHtml(r.output).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
    }
    case '/analyse': {
      if (!arg) return 'Usage: <code>/analyse &lt;paste artefact&gt;</code>';
      opchatTyping(true);
      const r = await fetch((window.OP_CONFIG?.API || '/api') + '/boss/analyse', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artefact: arg }),
      }).then(r => r.json()).catch(e => ({ ok: false, error: e.message }));
      opchatTyping(false);
      if (!r.ok) return `<span style="color:#ff5d73">${escapeHtml(r.error||'analyse failed')}</span>`;
      return `<b>Verdict:</b> ${r.verdict} (${r.score}/10)<br><b>Risks:</b> ${(r.risks||[]).join('; ')}<br><b>Fixes:</b> ${(r.fixes||[]).join('; ')}`;
    }
    case '/grow': {
      opchatTyping(true);
      const r = await fetch((window.OP_CONFIG?.API || '/api') + '/boss/grow', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot: arg || '' }),
      }).then(r => r.json()).catch(e => ({ ok: false, error: e.message }));
      opchatTyping(false);
      if (!r.ok) return `<span style="color:#ff5d73">${escapeHtml(r.error||'grow failed')}</span>`;
      return '<b>Growth moves:</b><br>' + (r.moves||[]).map(m =>
        `• <b>${escapeHtml(m.title)}</b> — ${escapeHtml(m.why)} <small>[${m.tool}, effort:${m.effort}, impact:${m.impact}]</small>`
      ).join('<br>');
    }
    case '/surface': {
      opchatTyping(true);
      const r = await fetch((window.OP_CONFIG?.API || '/api') + '/boss/surface', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: arg || '' }),
      }).then(r => r.json()).catch(e => ({ ok: false, error: e.message }));
      opchatTyping(false);
      if (!r.ok) return `<span style="color:#ff5d73">${escapeHtml(r.error||'surface failed')}</span>`;
      return `<b>Repos worth integrating</b> for <i>${escapeHtml(r.topic)}</i>:<br>` + (r.repos||[]).map(x =>
        `• <a href="${x.html_url}" target="_blank">${escapeHtml(x.full_name)}</a> ★${x.stars} <small>${escapeHtml(x.description||'')}</small>`
      ).join('<br>') + '<br><br><b>NEXT MOVE:</b> reply with <code>/import owner/repo</code> to clone + serve it under /imports/.';
    }
    case '/import': {
      const m = arg.match(/^([^\/]+)\/(.+)$/);
      if (!m) return 'Usage: <code>/import owner/repo</code>';
      opchatTyping(true);
      const r = await fetch((window.OP_CONFIG?.API || '/api') + '/boss/github/import-static', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner: m[1], repo: m[2] }),
      }).then(r => r.json()).catch(e => ({ ok: false, error: e.message }));
      opchatTyping(false);
      if (!r.ok) return `<span style="color:#ff5d73">${escapeHtml(r.error||'import failed')}</span>`;
      return `Imported. Live at <a href="${r.servedAt}" target="_blank">${r.servedAt}</a>.`;
    }
    case '/teach': {
      if (!arg) return 'Usage: <code>/teach &lt;topic&gt;</code> — B.O.S.S becomes your vibe-coding mentor.';
      OPCHAT.history.push({ role: 'user', content: `Teach me ${arg} like a vibe-coding mentor: 3 micro-lessons, each with a runnable snippet I can paste, end with a tiny challenge.` });
      return null; // fall through to chat with the loaded prompt
    }

    default:
      return null; // unknown slash → fall through to AI
  }
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
// ⌘K / Ctrl+K toggle
window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); opchatToggle(); }
});
// Slash chip rendering
(function () {
  const wrap = document.getElementById('opchat-slash');
  if (!wrap) return;
  wrap.innerHTML = OPCHAT.commands.map(c =>
    `<span class="opchat-cmd" onclick="opchatInsertCmd('${c.cmd}')">${c.cmd}</span>`
  ).join('');
  const input = document.getElementById('opchat-input');
  if (input) input.addEventListener('input', () => {
    wrap.style.display = input.value.startsWith('/') ? 'flex' : 'none';
  });
})();
function opchatInsertCmd(c) {
  const i = document.getElementById('opchat-input');
  i.value = c + ' '; i.focus();
}

/* ═══════════════════════════════════════════════════════════════════
 * CONTENT STUDIO — 4-stage production pipeline
 * ═════════════════════════════════════════════════════════════════ */
const CC = {
  stage: 1,
  brief: null,
  script: null,
  shots: [],
  assets: [],
};
function ccInit() {
  ccGoStage(CC.stage);
}
function ccGoStage(n) {
  CC.stage = n;
  document.querySelectorAll('.cc-stage').forEach(el => {
    el.classList.toggle('active', Number(el.dataset.stage) === n);
  });
  document.querySelectorAll('.cc-content').forEach(el => {
    el.classList.toggle('active', el.id === 'cc-s' + n);
  });
  if (n === 3) ccRenderAssets();
}
function ccNewProject() {
  if (!confirm('Start a new content project? Current brief/script will be lost.')) return;
  CC.brief = null; CC.script = null; CC.shots = []; CC.assets = [];
  ['cc-subject','cc-msg','cc-cta','cc-script'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  ccGoStage(1);
}
function ccCollectBrief() {
  CC.brief = {
    goal:    document.getElementById('cc-goal').value,
    channel: document.getElementById('cc-channel').value,
    tone:    document.getElementById('cc-tone').value,
    subject: document.getElementById('cc-subject').value,
    message: document.getElementById('cc-msg').value,
    cta:     document.getElementById('cc-cta').value,
  };
  return CC.brief;
}
async function ccGenerateScript() {
  ccCollectBrief();
  if (!CC.brief.subject) { alert('Subject required.'); return; }
  const scriptBox = document.getElementById('cc-script');
  scriptBox.value = 'Generating script…';
  try {
    const prompt = `Write a ${CC.brief.channel} script for: ${CC.brief.subject}\nGoal: ${CC.brief.goal}\nTone: ${CC.brief.tone}\nKey message: ${CC.brief.message}\nCTA: ${CC.brief.cta}\n\nFormat: [HOOK (3s)] ... [BEAT 1] ... [BEAT 2] ... [CTA]\nKeep it punchy.`;
    const r = await fetch((window.OP_CONFIG?.API || '/api') + '/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], persona: {} }),
    });
    const d = await r.json();
    if (d.ok) {
      scriptBox.value = d.reply;
      CC.script = d.reply;
      ccExtractShots(d.reply);
    } else {
      scriptBox.value = '// Generation failed: ' + (d.error || 'unknown');
    }
  } catch (e) { scriptBox.value = '// Network error — is ANTHROPIC_API_KEY set?'; }
}
function ccRegenScript() { ccGenerateScript(); }
function ccExtractShots(script) {
  const lines = script.split('\n').filter(l => /\[/.test(l));
  CC.shots = lines.map((l, i) => ({ n: i + 1, text: l.trim() }));
  const wrap = document.getElementById('cc-shots');
  if (!wrap) return;
  wrap.innerHTML = CC.shots.length === 0
    ? '<div class="cc-empty">No shot markers found — use [HOOK] [BEAT] [CTA] tags.</div>'
    : CC.shots.map(s => `<div class="cc-shot"><span class="cc-shot-num">SHOT ${String(s.n).padStart(2,'0')}</span><br>${escapeHtml(s.text)}</div>`).join('');
}
function ccRenderAssets() {
  const kinds = [
    { kind: 'Hero image',   tool: 'ModelsLab · SDXL',       icon: '🖼',  id: 'hero-img' },
    { kind: 'Video bg',     tool: 'ModelsLab · text2video', icon: '🎬',  id: 'video-bg' },
    { kind: 'Voiceover',    tool: 'ModelsLab · TTS',        icon: '🎙',  id: 'voiceover' },
    { kind: 'Captions',     tool: 'Auto from script',       icon: '💬',  id: 'captions' },
    { kind: 'Music bed',    tool: 'Suno / library',         icon: '🎵',  id: 'music' },
    { kind: 'Motion graphics', tool: 'Framer Motion → Remotion', icon: '✨', id: 'motion' },
    { kind: 'Thumbnail',    tool: 'Fal.ai · Flux',          icon: '🎨',  id: 'thumb' },
    { kind: 'Overlays',     tool: 'Recraft logos',          icon: '🏷',  id: 'overlay' },
  ];
  const grid = document.getElementById('cc-asset-grid');
  if (!grid) return;
  grid.innerHTML = kinds.map(k => `
    <div class="cc-asset" id="cc-asset-${k.id}">
      <div class="cc-asset-kind">${k.kind}</div>
      <div class="cc-asset-preview">${k.icon}</div>
      <div class="cc-asset-tool">${k.tool}</div>
      <button class="cc-asset-btn" onclick="ccGenAsset('${k.id}','${k.kind}')">Generate</button>
    </div>
  `).join('');
}
function ccGenAsset(id, kind) {
  const el = document.querySelector(`#cc-asset-${id} .cc-asset-btn`);
  if (!el) return;
  el.textContent = 'Generating…';
  el.disabled = true;
  setTimeout(() => {
    el.textContent = 'Regenerate';
    el.disabled = false;
    const prev = document.querySelector(`#cc-asset-${id} .cc-asset-preview`);
    if (prev) prev.innerHTML = '<span style="font-size:.75rem;color:#c8ff00">✓ GENERATED</span>';
  }, 1200);
  // TODO: Phase 4 — real /api/tools/modelslab/run calls
}

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const target = item.dataset.panel;
    navItems.forEach(n => n.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('panel-' + target).classList.add('active');
    topbarTitle.textContent = TITLES[target];
    if (target === 'crm') loadLeads();
    if (target === 'outreach') loadOutreach();
    if (target === 'settings') initSettingsPanel();
    if (target === 'workflow') initWorkflowPanel();
    if (target === 'followups') initFollowUpsPanel();
    if (target === 'explorer') initExplorerPanel();
    if (target === 'revenue') initRevenuePanel();
    if (target === 'outputs') initOutputsPanel();
    if (target === 'toolkit') loadToolKit();
    if (target === 'content') ccInit();
  });
});

/* ══════════════════════════════════
   OUTPUTS PANEL
══════════════════════════════════ */
let _opGeneratedHTML = '';
let _opClientName    = '';
let _opBrand         = null;   // full brand object from /api/generate-brand

function initOutputsPanel() {
  document.querySelectorAll('.op-tab').forEach(btn => {
    btn.onclick = () => switchOpTab(btn.dataset.tab);
  });
  if (_opGeneratedHTML) showOpLandingPreview(_opGeneratedHTML, _opClientName);
  if (_opBrand) {
    renderOpLogoKit(_opBrand.logos, _opBrand.palette);
    renderOpPitchDoc(_opBrand.pitchDoc, _opClientName);
    renderOpPaletteStrip(_opBrand.palette);
  }
}

function switchOpTab(tab) {
  document.querySelectorAll('.op-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.op-content').forEach(c => c.classList.toggle('active', c.id === 'op-' + tab));
}

// ── Landing preview ───────────────────────────────────────
function showOpLandingPreview(html, clientName) {
  _opGeneratedHTML = html;
  _opClientName    = clientName || '';
  const empty   = document.getElementById('op-landing-empty');
  const preview = document.getElementById('op-landing-preview');
  const frame   = document.getElementById('op-preview-frame');
  const nameEl  = document.getElementById('op-landing-client-name');
  if (!empty || !preview || !frame) return;
  if (nameEl) nameEl.textContent = clientName ? clientName + ' · Landing Page' : 'Landing Page';
  empty.style.display   = 'none';
  preview.style.display = 'flex';
  frame.srcdoc = html;
}

function opDownloadLanding() {
  if (!_opGeneratedHTML) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([_opGeneratedHTML], { type: 'text/html' }));
  a.download = (_opClientName || 'landing').toLowerCase().replace(/\s+/g, '-') + '.html';
  a.click();
}

function opCopyLanding() {
  if (!_opGeneratedHTML) return;
  navigator.clipboard.writeText(_opGeneratedHTML).then(() => toast('HTML copied to clipboard', 'ok'));
}

// ── Logo Kit ──────────────────────────────────────────────
function renderOpLogoKit(logos, palette) {
  if (!logos || !logos.all) return;
  const tab = document.getElementById('op-logo');
  if (!tab) return;

  const swatches = Object.entries({
    Primary: palette.primary,
    Secondary: palette.secondary,
    Background: palette.bg,
    Text: palette.text,
    Muted: palette.muted,
  }).map(([n, c]) => `<div class="lk-swatch" style="background:${c}" title="${n}: ${c}">
    <span class="lk-swatch-name">${n}</span>
    <span class="lk-swatch-hex">${c}</span>
  </div>`).join('');

  const cards = logos.all.map(logo => `
    <div class="lk-card" data-logo-id="${logo.id}">
      <div class="lk-preview ${logo.type === 'monogram' ? 'lk-preview--mono' : ''}" style="background:${logo.type === 'monogram' ? 'transparent' : palette.bg2}">
        ${logo.svg}
      </div>
      <div class="lk-card-foot">
        <span class="lk-card-label">${logo.label}</span>
        <button class="lk-dl-btn" onclick="opDownloadSvg('${logo.id}')" title="Download SVG">
          <i class="fas fa-download"></i>
        </button>
      </div>
    </div>`).join('');

  tab.innerHTML = `
    <div class="lk-wrap">
      <div class="lk-header">
        <div class="lk-title">Logo Kit <span class="lk-sub">· 6 variants · SVG · ${_opClientName || 'Brand'}</span></div>
        <button class="btn btn-primary btn-sm" onclick="opDownloadAllLogos()">
          <i class="fas fa-download"></i> Download All SVGs
        </button>
      </div>
      <div class="lk-grid">${cards}</div>
      <div class="lk-section-hdr"><i class="fas fa-palette"></i> Brand Palette</div>
      <div class="lk-swatches">${swatches}</div>
    </div>`;
}

function opDownloadSvg(logoId) {
  if (!_opBrand) return;
  const logo = _opBrand.logos.all.find(l => l.id === logoId);
  if (!logo) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([logo.svg], { type: 'image/svg+xml' }));
  a.download = (_opClientName || 'brand').toLowerCase().replace(/\s+/g, '-') + '-' + logoId + '.svg';
  a.click();
}

function opDownloadAllLogos() {
  if (!_opBrand) return;
  _opBrand.logos.all.forEach(l => opDownloadSvg(l.id));
}

// ── Pitch doc ─────────────────────────────────────────────
function renderOpPitchDoc(pitchHtml, clientName) {
  if (!pitchHtml) return;
  const tab = document.getElementById('op-pitch');
  if (!tab) return;
  tab.innerHTML = `
    <div class="op-pitch-wrap">
      <div class="op-pitch-toolbar">
        <span class="op-pitch-name">${esc(clientName || '')} · Pitch Document</span>
        <button class="btn btn-secondary btn-sm" onclick="opDownloadPitch()">
          <i class="fas fa-download"></i> Download HTML
        </button>
        <button class="btn btn-primary btn-sm" onclick="opPrintPitch()">
          <i class="fas fa-print"></i> Save as PDF
        </button>
      </div>
      <iframe id="op-pitch-frame" class="op-pitch-frame" srcdoc="${pitchHtml.replace(/"/g, '&quot;')}"></iframe>
    </div>`;
}

function opDownloadPitch() {
  if (!_opBrand) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([_opBrand.pitchDoc], { type: 'text/html' }));
  a.download = (_opClientName || 'pitch').toLowerCase().replace(/\s+/g, '-') + '-proposal.html';
  a.click();
}

function opPrintPitch() {
  const f = document.getElementById('op-pitch-frame');
  if (f && f.contentWindow) f.contentWindow.print();
}

// ── Palette strip (on landing tab) ───────────────────────
function renderOpPaletteStrip(palette) {
  const strip = document.getElementById('op-palette-strip');
  if (!strip || !palette) return;
  strip.innerHTML = Object.entries({
    Primary: palette.primary, Secondary: palette.secondary,
    BG: palette.bg, Text: palette.text
  }).map(([n, c]) => `<span class="op-pal-dot" style="background:${c}" title="${n}: ${c}"></span>`).join('');
  strip.style.display = 'flex';
}

// Called from Brand Studio generate — populates all Outputs tabs
async function generateBrandKit(clientData) {
  try {
    const r = await fetch(API + '/generate-brand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData)
    });
    const data = await r.json();
    if (!data.ok) return;
    _opBrand = data.brand;
    renderOpLogoKit(_opBrand.logos, _opBrand.palette);
    renderOpPitchDoc(_opBrand.pitchDoc, clientData.businessName || clientData.name || '');
    renderOpPaletteStrip(_opBrand.palette);
    // Show a toast nudge
    toast('Brand kit ready — check Outputs panel', 'ok');
  } catch { /* silently skip if API fails */ }
}

/* ══════════════════════════════════
   CLIENT CREATOR (now Brand Studio)
══════════════════════════════════ */
let selectedClient = null;
let generatedHTML  = '';

async function loadClients() {
  try {
    const res  = await fetch(API + '/clients');
    const data = await res.json();
    renderClientList(data.clients || []);
  } catch { renderClientList([]); }
}

function renderClientList(clients) {
  const list  = document.getElementById('client-list');
  const count = document.getElementById('client-count');
  count.textContent = clients.length;
  if (!clients.length) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No clients yet</p></div>';
    return;
  }
  list.innerHTML = clients.map(c => `
    <div class="client-card${selectedClient && selectedClient.id === c.id ? ' selected' : ''}"
         data-id="${c.id}" onclick="selectClient(${c.id})">
      <div class="client-avatar">${c.businessName.charAt(0).toUpperCase()}</div>
      <div class="client-info">
        <div class="client-name">${esc(c.businessName)}</div>
        <div class="client-meta">${esc(c.niche)} &middot; ${c.goal}</div>
      </div>
      <span class="badge badge-active">active</span>
    </div>`).join('');
}

function selectClient(id) {
  fetch(API + '/clients').then(r => r.json()).then(data => {
    const c = (data.clients || []).find(x => x.id === id);
    if (!c) return;
    selectedClient = c;
    document.getElementById('f-name').value     = c.businessName || '';
    document.getElementById('f-niche').value    = c.niche        || '';
    document.getElementById('f-offer').value    = c.offer        || '';
    document.getElementById('f-goal').value     = c.goal         || 'leads';
    document.getElementById('f-location').value = c.location     || '';
    document.getElementById('f-notes').value    = c.notes        || '';

    // Restore tone
    if (c.tone) {
      document.querySelectorAll('.tone-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tone === c.tone);
      });
    }

    // Restore system component checkboxes
    if (c.systemComponents) {
      const sc = c.systemComponents;
      ['landing','crm','outreach','followup','booking'].forEach(key => {
        const el = document.getElementById('sys-' + key);
        if (el && sc[key] !== undefined) el.checked = sc[key];
      });
    }

    // Restore style settings
    if (c.style) {
      const s = c.style;
      if (s.primary) {
        document.getElementById('s-primary').value     = s.primary;
        document.getElementById('s-primary-hex').value = s.primary;
      }
      if (s.accent) {
        document.getElementById('s-accent').value      = s.accent;
        document.getElementById('s-accent-hex').value  = s.accent;
      }
      if (s.theme) {
        document.querySelectorAll('.theme-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.theme === s.theme);
        });
      }
      if (s.imgStyle) document.getElementById('s-imgstyle').value = s.imgStyle;
    }

    renderClientList(data.clients);
  });
}

document.getElementById('btn-clear-form').addEventListener('click', () => {
  ['f-name','f-niche','f-offer','f-location','f-notes'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('f-goal').value = 'leads';
  selectedClient = null;
  document.getElementById('preview-frame').style.display = 'none';
  document.getElementById('preview-placeholder').style.display = 'flex';
  document.getElementById('btn-download').style.display  = 'none';
  document.getElementById('btn-copy-html').style.display = 'none';
  const pkgBar = document.getElementById('pkg-bar');
  if (pkgBar) { pkgBar.innerHTML = ''; pkgBar.classList.remove('visible'); }
  generatedHTML = '';
});

function getFormPayload() {
  const style = getStyle();
  return {
    businessName: document.getElementById('f-name').value.trim(),
    niche:        document.getElementById('f-niche').value.trim(),
    offer:        document.getElementById('f-offer').value.trim(),
    goal:         document.getElementById('f-goal').value,
    location:     document.getElementById('f-location').value.trim(),
    notes:        document.getElementById('f-notes').value.trim(),
    tone:         style.tone,
    systemComponents: style.systems,
    style: {
      primary:  style.primary,
      accent:   style.accent,
      theme:    style.theme,
      imgStyle: style.imgStyle
    }
  };
}

document.getElementById('btn-save-client').addEventListener('click', async () => {
  const payload = getFormPayload();
  if (!payload.businessName) { toast('Business name is required', 'err'); return; }
  try {
    if (selectedClient) {
      // Update existing
      const res  = await fetch(API + '/clients', { method: 'PATCH', body: JSON.stringify({ ...payload, id: selectedClient.id }) });
      const data = await res.json();
      selectedClient = data.client;
      toast('Client updated', 'ok');
    } else {
      // Create new
      const res  = await fetch(API + '/clients', { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json();
      selectedClient = data.client;
      toast('Client saved', 'ok');
    }
    loadClients();
  } catch { toast('Could not save client', 'err'); }
});

/* ── STYLE CONTROLS WIRING ── */
(function() {
  // Sync color picker ↔ hex input
  function syncColor(pickerId, hexId) {
    const picker = document.getElementById(pickerId);
    const hex    = document.getElementById(hexId);
    if (!picker || !hex) return;
    picker.addEventListener('input', () => { hex.value = picker.value; });
    hex.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) picker.value = hex.value;
    });
  }
  syncColor('s-primary', 's-primary-hex');
  syncColor('s-accent',  's-accent-hex');

  // Theme button toggle
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Tone button toggle
  document.querySelectorAll('.tone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Style panel collapse toggle
  const header  = document.getElementById('style-toggle');
  const body    = document.getElementById('style-body');
  const chevron = document.getElementById('style-chevron');
  let open = false;
  if (body) body.style.display = 'none';  // collapsed by default
  if (header) header.addEventListener('click', () => {
    open = !open;
    body.style.display    = open ? 'flex' : 'none';
    chevron.classList.toggle('open', open);
  });
})();

function getStyle() {
  const activeTheme = document.querySelector('.theme-btn.active');
  const activeTone  = document.querySelector('.tone-btn.active');
  return {
    primary:  document.getElementById('s-primary-hex').value  || '#ff2a2a',
    accent:   document.getElementById('s-accent-hex').value   || '#ffffff',
    theme:    activeTheme ? activeTheme.dataset.theme : 'dark',
    tone:     activeTone  ? activeTone.dataset.tone  : 'professional',
    imgStyle: document.getElementById('s-imgstyle').value     || 'auto',
    imgUrl:   document.getElementById('s-imgurl').value.trim() || '',
    systems: {
      landing:  document.getElementById('sys-landing')  ? document.getElementById('sys-landing').checked  : true,
      crm:      document.getElementById('sys-crm')      ? document.getElementById('sys-crm').checked      : true,
      outreach: document.getElementById('sys-outreach') ? document.getElementById('sys-outreach').checked : true,
      followup: document.getElementById('sys-followup') ? document.getElementById('sys-followup').checked : true,
      booking:  document.getElementById('sys-booking')  ? document.getElementById('sys-booking').checked  : false
    }
  };
}

document.getElementById('btn-generate').addEventListener('click', () => {
  const name  = document.getElementById('f-name').value.trim()    || 'Your Business';
  const niche = document.getElementById('f-niche').value.trim()   || 'your industry';
  const offer = document.getElementById('f-offer').value.trim()   || 'our service';
  const goal  = document.getElementById('f-goal').value;
  const loc   = document.getElementById('f-location').value.trim();
  const notes = document.getElementById('f-notes').value.trim();
  const style = getStyle();

  /* Resolve niche profile — drives ALL output */
  const profile = getNicheProfile(niche, offer, goal, loc);

  /* 1. Landing page */
  generatedHTML = buildLandingPage({ name, niche, offer, goal, loc, profile, style });
  showPreview(generatedHTML);
  showOpLandingPreview(generatedHTML, name);

  /* 1b. Brand kit (logos + palette + pitch doc) — fire and forget */
  generateBrandKit({ businessName: name, niche, offer, goal, location: loc, tone: style.tone, style });

  /* 2. Full outreach sequence → outreach queue (only if system component enabled) */
  const sequence = buildOutreachSequence({ name, niche, offer, loc, profile, style });
  if (style.systems.outreach) {
    sequence.forEach((msg) => {
      fetch(API + '/outreach', {
        method: 'POST',
        body: JSON.stringify({ clientName: name, niche, label: msg.label, message: msg.body })
      }).catch(() => {});
    });
  }

  /* 3. CRM structure → logged */
  const crm = buildCRMStructure({ name, niche, offer, goal, profile });
  console.log('[TheSaaSsin] CRM Structure for', name, JSON.stringify(crm, null, 2));

  /* 4. Offer definition → logged */
  const offerDef = buildOfferDefinition({ name, niche, offer, goal, loc, profile });
  console.log('[TheSaaSsin] Offer Definition:', JSON.stringify(offerDef, null, 2));

  /* 5. Package summary → show in right panel */
  showPackageSummary(buildPackageSummary({ name, profile, style }));

  /* 6. Auto-save generated system back to client record */
  if (selectedClient) {
    const updatedSystems = {
      landingPage: generatedHTML,
      outreach:    sequence.map(s => ({ label: s.label, body: s.body })),
      crm:         buildCRMStructure({ name, niche, offer, goal, profile }),
      generatedAt: new Date().toISOString()
    };
    fetch(API + '/clients', {
      method: 'PATCH',
      body: JSON.stringify({ id: selectedClient.id, systems: updatedSystems, lastUpdated: new Date().toISOString() })
    }).then(r => r.json()).then(d => { if (d.client) selectedClient = d.client; }).catch(() => {});
  }

  toast('System generated for ' + name, 'ok');
});

document.getElementById('btn-download').addEventListener('click', () => {
  if (!generatedHTML) return;
  const blob = new Blob([generatedHTML], { type: 'text/html' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = (document.getElementById('f-name').value.trim() || 'client').replace(/\s+/g,'-').toLowerCase() + '.html';
  a.click();
  toast('HTML downloaded', 'ok');
});

document.getElementById('btn-copy-html').addEventListener('click', () => {
  if (!generatedHTML) return;
  navigator.clipboard.writeText(generatedHTML).then(() => toast('HTML copied to clipboard', 'ok'));
});

function showPreview(html) {
  const frame = document.getElementById('preview-frame');
  const placeholder = document.getElementById('preview-placeholder');
  frame.style.display = 'block';
  placeholder.style.display = 'none';
  document.getElementById('btn-download').style.display  = 'inline-flex';
  document.getElementById('btn-copy-html').style.display = 'inline-flex';
  const doc = frame.contentDocument || frame.contentWindow.document;
  doc.open(); doc.write(html); doc.close();
}

/* ══════════════════════════════════
   NICHE INTELLIGENCE ENGINE
══════════════════════════════════ */

/**
 * Returns a rich niche profile that drives all generator outputs.
 * Falls back gracefully if no keyword match — no generic filler.
 */
function getNicheProfile(niche, offer, goal, loc) {
  const n   = (niche + ' ' + offer).toLowerCase();
  const at  = loc ? ` in ${loc}` : '';
  const for_ = loc ? `for ${loc} homeowners` : 'for local homeowners';

  /* ── PLUMBER ── */
  if (/plumb|pipe|boiler|heating|gas|drain/.test(n)) return {
    type: 'trade',
    audience: `homeowners and landlords${at}`,
    scenarios: [
      `When your boiler dies at 9pm on a Sunday${at} — and every plumber you call either doesn't answer or quotes you a fortune just to show up`,
      `When you've got a leak spreading through the ceiling and you can't find anyone who can come today`,
      `When you've been let down by a tradesperson who said they'd show up and just… didn't`
    ],
    painPoints: [
      `Boiler breaks down${at} — nobody picks up, or they want £150 just to look at it`,
      `Waiting 3–5 days for a callout that should take hours`,
      `Getting quoted one price on the phone and a different one on the day`,
      `Never knowing if the person coming is actually qualified`
    ],
    outcomes: [
      `Same-day callout booked within 2 hours — 7 days a week${at}`,
      `Upfront fixed price before anyone sets foot in your home`,
      `Gas Safe registered — certificate provided on completion`,
      `Problem diagnosed and resolved in a single visit, 90% of the time`
    ],
    headline:  `${loc ? loc + ' Emergency Plumber' : 'Emergency Plumber Near You'} — Here Today, Not Next Week`,
    subline:   `${offer || 'Emergency callouts, boiler repairs & heating'} · Fixed pricing · Available 7 days`,
    cta:       goal === 'bookings' ? `Book a Callout${at}` : `Get a Fixed Quote Today`,
    ctaLow:    `Want me to show you what this system looks like for your setup?`,
    proof:     [`Trusted by 100+ ${loc || 'local'} homeowners`, 'Gas Safe registered', 'Same-day response', 'Fixed pricing — no surprises'],
    form:      { q1: `What's the problem? (e.g. no hot water, leak, boiler fault)`, q2: `Is this urgent — or can it wait a day or two?` }
  };

  /* ── ELECTRICIAN ── */
  if (/electric|wir|fuse|power|sparks/.test(n)) return {
    type: 'trade',
    audience: `homeowners, landlords and small businesses${at}`,
    scenarios: [
      `When a fuse keeps tripping and you don't know if it's safe to leave — let alone who to call`,
      `When a landlord certificate is overdue and your tenant's chasing you${at}`,
      `When you've had three electricians quote three wildly different prices and you still don't know who to trust`
    ],
    painPoints: [
      `Electrical faults you're not sure are safe to leave — and no one to call at short notice`,
      `Landlord certificates overdue, holding up a sale or new tenancy${at}`,
      `Quotes that vary by hundreds with no explanation`,
      `Electricians who book in then cancel, leaving you in the dark`
    ],
    outcomes: [
      `Fault found and fixed in a single visit — certificate issued same day`,
      `Landlord EICR completed within 48 hours, paperwork sent immediately`,
      `Fixed price agreed before work starts — nothing added on the day`,
      `NICEIC approved work, fully insured, guaranteed for 12 months`
    ],
    headline:  `${loc ? loc + ' Electrician' : 'Local Electrician'} — Certified, On Time, Fixed Price`,
    subline:   `${offer || 'Electrical installations, fault finding & certificates'} · NICEIC approved · No hidden costs`,
    cta:       goal === 'bookings' ? `Book a Free Assessment` : `Get a Fixed Quote`,
    ctaLow:    `Happy to show you what a system like this looks like for your business`,
    proof:     [`Trusted by ${loc || 'local'} homeowners & landlords`, 'NICEIC Approved', 'Same-day certificates', 'Fully insured'],
    form:      { q1: `What electrical work do you need?`, q2: `Is this a safety issue, or is it planned work?` }
  };

  /* ── BUILDER / RENOVATION ── */
  if (/build|construct|renovat|extension|loft|kitchen fit/.test(n)) return {
    type: 'trade',
    audience: `homeowners planning renovations${at}`,
    scenarios: [
      `When you've found a builder${at} but they want 50% upfront, no contract, and a verbal promise they'll be done by summer`,
      `When your kitchen renovation is on week 8 of a "3-week job" and the builder's gone quiet`,
      `When you get four quotes that are all different and none of them explain what's actually included`
    ],
    painPoints: [
      `Projects going 40% over budget with no warning it was coming`,
      `Builders${at} who disappear mid-job — phone goes straight to voicemail`,
      `No project timeline, no updates, no idea what's happening on site`,
      `Paying for work that wasn't done right the first time`
    ],
    outcomes: [
      `Fixed-price contract signed before a single tool is picked up`,
      `Dedicated project manager — you get updates without having to chase`,
      `Build diary with photos sent weekly so you always know the status`,
      `On-time completion or we work weekends to catch up at no extra cost`
    ],
    headline:  `${loc ? loc + ' Builder' : 'Local Builder'} You Can Actually Trust — Fixed Price, No Surprises`,
    subline:   `${offer || 'Extensions, renovations & kitchen fits'} · Fixed-price contracts · Project managed`,
    cta:       `Get a Free Project Quote`,
    ctaLow:    `Want me to pull together a quick outline for your project?`,
    proof:     [`50+ projects completed${at}`, 'Fixed-price contracts', 'Fully insured', '5-star Google reviews'],
    form:      { q1: `What project are you planning? (e.g. extension, loft, kitchen)`, q2: `Do you have a rough budget in mind, or are you still at the quote stage?` }
  };

  /* ── FITNESS / PT / GYM ── */
  if (/gym|fitness|personal train|pt |coach|weight|muscle|fat loss/.test(n)) return {
    type: 'fitness',
    audience: `people who are serious about results but keep hitting the same wall`,
    scenarios: [
      `When you've tried the gym three times this year, got results for about two weeks, then life got in the way and you're back at square one`,
      `When you're training consistently but the weight just isn't shifting — and you can't work out what you're doing wrong`,
      `When you've bought the programme, watched the videos, done everything right — and still don't look like any of the before and afters`
    ],
    painPoints: [
      `Paying for a gym${at ? ' ' + at : ''} you use twice a month and feel guilty about every time`,
      `Training with no real plan — just doing what feels right and hoping it works`,
      `Results that plateau after 3–4 weeks because nothing changes`,
      `Nutrition advice that contradicts itself every time you Google something`
    ],
    outcomes: [
      `Visible body composition change within 8 weeks — or your money back`,
      `A weekly plan that fits around your actual schedule, not a perfect one`,
      `Check-in every week — someone who notices if you've gone off track`,
      `Nutrition that works without weighing everything or cutting out entire food groups`
    ],
    headline:  `Stop Starting Over. Get a Plan Built for You${loc ? ' in ' + loc : ''} That Actually Sticks.`,
    subline:   `${offer || 'Personal training & transformation coaching'} · 8-week results · No contracts`,
    cta:       goal === 'leads' ? `Apply for a Free Strategy Call` : `Book Your Free Consultation`,
    ctaLow:    `Want me to show you what a 12-week plan would look like for your situation?`,
    proof:     [`50+ transformations${at}`, 'Average 8–10kg lost in 12 weeks', 'No lock-in contracts', 'Online & in-person'],
    form:      { q1: `What's your main goal? (e.g. lose fat, build muscle, get consistent)`, q2: `What's stopped you getting the result before?` }
  };

  /* ── CONSULTANT / COACH / FREELANCER ── */
  if (/consult|freelanc|strateg|adviso|coach|mentor/.test(n)) return {
    type: 'consulting',
    audience: `business owners who are working too hard for the revenue they're getting`,
    scenarios: [
      `When you're doing £10–20K a month but working 60 hours a week to hold it together — and you can't see how to grow without it getting worse`,
      `When you know exactly what needs to change in your business but you keep putting it off because there's no time to actually work on it`,
      `When a client ghosts after asking for a proposal and you spend three days wondering what went wrong`
    ],
    painPoints: [
      `Revenue is decent but the margin — after your time — barely makes sense`,
      `No system for getting clients consistently: some months great, some months nothing`,
      `Every new client feels like starting from scratch — no repeatable process`,
      `You're the bottleneck: nothing moves unless you're involved in it`
    ],
    outcomes: [
      `A repeatable client acquisition process that runs without you chasing — within 30 days`,
      `Revenue clarity: know exactly which activities are driving income and cut the rest`,
      `A clear 90-day plan that's specific to your business, not a generic framework`,
      `Reclaim 10+ hours a week by systemising what you're currently doing manually`
    ],
    headline:  `You Shouldn't Have to Work This Hard for This Result. Let's Fix That.`,
    subline:   `${offer || 'Business strategy & growth consulting'} · 30-day results · Built around your business`,
    cta:       `Book a Free 30-Min Strategy Call`,
    ctaLow:    `Happy to map out what's actually holding you back — no prep needed, just a 30-min call`,
    proof:     ['Average 3x ROI in 90 days', 'Former operator — not a theorist', '100% confidential', 'No long-term retainers'],
    form:      { q1: `What's the single biggest thing holding your business back right now?`, q2: `What have you already tried — and why do you think it didn't work?` }
  };

  /* ── MARKETING / AGENCY ── */
  if (/market|agency|seo|ads|social|lead gen|growth|digital/.test(n)) return {
    type: 'agency',
    audience: `business owners who've been burned by agencies before`,
    scenarios: [
      `When you're paying £2,000/month in ads and the agency's monthly report is 6 slides of metrics that don't explain why enquiries are down`,
      `When you hit month four of an SEO retainer and you're still "building domain authority" with nothing to show for it`,
      `When leads come in through the form but nobody calls back within the hour — and by the time someone does, they've moved on`
    ],
    painPoints: [
      `Ad spend going up, cost-per-lead going up, and the agency says "it's the algorithm"`,
      `No clear attribution — impossible to tell which channel is actually bringing in revenue`,
      `Leads from campaigns that don't convert because the follow-up is broken`,
      `Agencies who lock you into 6-month contracts and go quiet after month one`
    ],
    outcomes: [
      `Clear attribution dashboard live within 7 days — know exactly what's working`,
      `Avg 4x ROAS within 60 days or we work at cost until we hit it`,
      `Follow-up automation that contacts new leads within 5 minutes — automatically`,
      `No lock-in — monthly rolling, cancel with 30 days notice`
    ],
    headline:  `Your Last Agency Took Your Money. We Only Win When You Do.`,
    subline:   `${offer || 'Performance marketing & lead generation'} · ROI-focused · No long-term lock-in`,
    cta:       `Get a Free Account Audit`,
    ctaLow:    `Want me to take a quick look at your current setup and tell you what I'd fix first?`,
    proof:     ['£500K+ in ad spend managed', 'Avg 4x ROAS', 'No lock-in contracts', 'Weekly reporting — real numbers'],
    form:      { q1: `What are you currently running and what's it costing you per month?`, q2: `What does a "good result" actually look like for your business?` }
  };

  /* ── SAAS / TECH / AUTOMATION ── */
  if (/saas|software|app|tech|platform|tool|automat/.test(n)) return {
    type: 'saas',
    audience: `founders who are building but not growing fast enough`,
    scenarios: [
      `When you've shipped the product, you've got users, but you can't work out why 60% of them aren't coming back after week one`,
      `When your dev sprint is full but you're not sure half the features on the list are actually what users want`,
      `When you're doing all the right things — content, outreach, product updates — but MRR has been flat for three months`
    ],
    painPoints: [
      `Churn eating growth as fast as acquisition — net revenue barely moves`,
      `Building features users asked for but activation rates aren't improving`,
      `No onboarding system — users sign up, poke around, and leave before seeing value`,
      `Dev time spent on the wrong things because there's no clear signal from users`
    ],
    outcomes: [
      `Onboarding flow rebuilt to hit the "aha moment" within the first session — churn drops within 30 days`,
      `Clear feature priority based on what actually correlates with retention, not gut feel`,
      `Automated email sequences that bring dormant users back without manual effort`,
      `MRR movement within 60 days — or we keep working until it does`
    ],
    headline:  `${offer ? esc(offer) : 'Your Product'} Is Good. Here's Why It's Not Growing Faster.`,
    subline:   `${offer || 'SaaS growth systems & retention automation'} · Churn reduction · Scalable from current stage`,
    cta:       `Book a Free Discovery Call`,
    ctaLow:    `Want me to take a look at your onboarding flow and tell you what I'd change first?`,
    proof:     ['10+ SaaS products scaled', 'Avg 40% churn reduction in 60 days', 'From MVP to Series A', 'No bloated retainers'],
    form:      { q1: `What stage is the product and what's your current MRR?`, q2: `Where are users dropping off — and do you know why yet?` }
  };

  /* ── DEFAULT ── */
  return {
    type: 'general',
    audience: `business owners${at} who are tired of inconsistent results`,
    scenarios: [
      `When you have a great month and think you've cracked it — then the next month is half the revenue and you don't know why`,
      `When a potential client lands on your site, looks around, and leaves without contacting you — and you have no idea it's happening`,
      `When you're doing everything you're "supposed" to do but the pipeline still feels like it's running on luck`
    ],
    painPoints: [
      `Leads come in when you're busy — then dry up the moment you need them`,
      `People visit your site${at} and leave without contacting you — nothing captures them`,
      `No follow-up system: enquiries that don't convert immediately just disappear`,
      `Competitors${at} winning jobs that should be coming to you`
    ],
    outcomes: [
      `A consistent lead flow within 30 days — not dependent on referrals or luck`,
      `Automated follow-up that contacts every enquiry within minutes, not days`,
      `A site that converts visitors into booked calls — not just a digital brochure`,
      `${offer || 'Your service'} positioned to win${at} — priced, presented and promoted properly`
    ],
    headline:  `${offer ? esc(offer) : 'Your Business'}${at} — Built to Get Clients Consistently.`,
    subline:   `Stop relying on referrals. Build a system that fills your pipeline — every month.`,
    cta:       goal === 'bookings' ? `Book a Free Strategy Call` : `Get Your Free Growth Plan`,
    ctaLow:    `Want me to map out what this would look like for your business specifically?`,
    proof:     [`Trusted by ${loc || 'UK'} businesses`, 'Proven system', '14-day delivery', 'Free strategy call'],
    form:      { q1: `What are you trying to achieve in the next 90 days?`, q2: `What's currently in place — and what do you think is missing?` }
  };
}

/* ── IMAGE LOOKUP ── */
function getNicheImage(niche, offer, imgStyle, imgUrl, profileType) {
  if (imgUrl) return imgUrl;
  const n = (niche + ' ' + offer).toLowerCase();

  // High-quality, context-matched images per profile type (auto mode)
  const typeImgs = {
    trade:      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1400&q=80', // tradesperson at work
    fitness:    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&q=80', // real training intensity
    consulting: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=80', // clean strategy desk
    agency:     'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=80', // marketing/analytics screen
    saas:       'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&q=80',    // developer/code screens
    general:    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80'  // clean minimal office
  };

  if (imgStyle === 'auto' && profileType && typeImgs[profileType]) {
    return typeImgs[profileType];
  }

  // Manual style override
  const autoStyle = /plumb|pipe|boiler|electric|build|construct|trade|weld|drain/.test(n) ? 'industrial'
                  : /gym|fitness|train|coach|weight|muscle/.test(n) ? 'fitness'
                  : /saas|software|app|tech|digital|automat/.test(n) ? 'tech'
                  : /consult|strateg|freelanc|coach|mentor/.test(n) ? 'corporate'
                  : 'neutral';
  const resolvedStyle = imgStyle === 'auto' ? autoStyle : imgStyle;
  const imgs = {
    industrial: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80',  // construction site
    fitness:    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&q=80',  // training intensity
    corporate:  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=80',  // strategy desk
    tech:       'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&q=80',     // dev/code
    neutral:    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80'   // minimal office
  };
  return imgs[resolvedStyle] || imgs.neutral;
}

/* ── THEME PRESETS ── */
const THEMES = {
  dark:     { bg:'#0a0a0f', bg2:'#0d0d14', card:'#121218', text:'#f0f0f5', muted:'#8888a0', border:'rgba(255,255,255,0.06)' },
  light:    { bg:'#f5f5fa', bg2:'#ffffff',  card:'#ffffff', text:'#1a1a2e', muted:'#666680', border:'rgba(0,0,0,0.08)' },
  contrast: { bg:'#000000', bg2:'#111111',  card:'#0d0d0d', text:'#ffffff', muted:'#aaaaaa', border:'rgba(255,255,255,0.12)' }
};

/* ── TONE ADAPTERS ── */
function applyTone(profile, tone) {
  if (tone === 'friendly') {
    return Object.assign({}, profile, {
      cta:    profile.ctaLow || 'Want me to map this out for you?',
      ctaLow: 'Let me show you exactly what this would look like for you',
      headline: profile.headline.replace(/\.$/, '') + ' — Let\'s Fix That Together.'
    });
  }
  if (tone === 'aggressive') {
    return Object.assign({}, profile, {
      cta:    profile.cta.replace('Free', 'Your').replace('Get a', 'Claim Your'),
      headline: profile.headline.toUpperCase().substring(0,1) + profile.headline.substring(1)
    });
  }
  return profile; // professional — default, no change
}

/* ── LANDING PAGE GENERATOR ── */
function buildLandingPage({ name, niche, offer, goal, loc, profile, style }) {
  const p  = applyTone(profile, (style && style.tone) || 'professional');
  const st = style || { primary:'#ff2a2a', accent:'#ffffff', theme:'dark', tone:'professional', imgStyle:'auto', imgUrl:'' };
  const th = THEMES[st.theme] || THEMES.dark;
  const imgSrc = getNicheImage(niche, offer, st.imgStyle, st.imgUrl, profile.type);

  const painHTML  = p.painPoints.map(pt =>
    `<li><span class="x">✕</span> ${esc(pt)}</li>`).join('');
  const outHTML   = p.outcomes.map(ot =>
    `<li><span class="chk">✓</span> ${esc(ot)}</li>`).join('');
  const proofHTML = p.proof.map(pr =>
    `<div class="proof-item"><span class="proof-dot">●</span>${esc(pr)}</div>`).join('');
  const scenariosHTML = (p.scenarios || []).map(s =>
    `<div class="scenario"><span class="sc-q">"</span>${esc(s)}<span class="sc-q">"</span></div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(name)}</title>
<style>
:root{
  --accent:${st.primary};
  --accent2:${st.accent};
  --dark:${th.bg};
  --bg2:${th.bg2};
  --card:${th.card};
  --text:${th.text};
  --muted:${th.muted};
  --border:${th.border};
  --success:#22c55e;
}
*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',system-ui,sans-serif}
body{background:var(--dark);color:var(--text);line-height:1.6}
header{padding:18px 6%;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);position:sticky;top:0;background:${th.bg}ee;backdrop-filter:blur(10px);z-index:100}
.logo{font-size:1.25rem;font-weight:800;color:var(--text);text-decoration:none;letter-spacing:-.02em}
.logo em{color:var(--accent);font-style:normal}
.btn{display:inline-block;background:var(--accent);color:${st.theme==='light'?'#fff':st.accent};padding:14px 32px;border-radius:28px;text-decoration:none;font-weight:700;font-size:.95rem;letter-spacing:.02em;box-shadow:0 6px 24px color-mix(in srgb,var(--accent) 40%,transparent);transition:all .2s;border:none;cursor:pointer;font-family:inherit}
.btn:hover{transform:translateY(-2px);filter:brightness(1.1);}
/* HERO */
.hero{padding:0;text-align:center;position:relative;overflow:hidden;min-height:520px;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.hero-bg{position:absolute;inset:0;background-image:url('${imgSrc}');background-size:cover;background-position:center;filter:${st.theme==='light'?'brightness(.55) saturate(.8)':'brightness(.25) saturate(.7)'}}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,${th.bg}cc 0%,${th.bg}88 60%,${th.bg}ff 100%)}
.hero-content{position:relative;z-index:2;padding:96px 6% 72px;width:100%}
.eyebrow{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.18em;color:var(--accent);margin-bottom:18px;opacity:.9}
.hero h1{font-size:clamp(1.9rem,4.5vw,3rem);font-weight:800;line-height:1.15;margin-bottom:18px;max-width:820px;margin-left:auto;margin-right:auto}
.hero h1 em{color:var(--accent);font-style:normal}
.hero .sub{font-size:1.1rem;color:var(--muted);max-width:560px;margin:0 auto 32px}
.proof-row{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 20px;margin-top:28px;margin-bottom:0}
.proof-item{font-size:.8rem;color:var(--muted);display:flex;align-items:center;gap:6px}
.proof-dot{color:var(--accent);font-size:.5rem}
/* PAIN / OUTCOME */
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:900px;margin:0 auto}
.box{background:var(--card);border-radius:12px;padding:28px 24px;border:1px solid rgba(255,255,255,.05)}
.box h3{font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:16px}
.box.pain h3{color:#ff6b6b}
.box.win  h3{color:var(--success)}
.box ul{list-style:none;display:flex;flex-direction:column;gap:10px}
.box ul li{font-size:.88rem;color:var(--muted);display:flex;align-items:flex-start;gap:8px;line-height:1.45}
.x{color:#ff4444;flex-shrink:0;font-weight:700}
.chk{color:var(--success);flex-shrink:0;font-weight:700}
/* FORM */
.form-section{padding:80px 6%;max-width:620px;margin:0 auto;text-align:center}
.form-section h2{font-size:1.8rem;font-weight:800;margin-bottom:12px}
.form-section p{color:var(--muted);margin-bottom:32px;font-size:1rem}
.form-wrap{background:var(--card);border:1px solid rgba(255,42,42,.2);border-radius:14px;padding:32px;text-align:left;display:flex;flex-direction:column;gap:18px}
.form-wrap label{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);display:block;margin-bottom:6px}
.form-wrap textarea,.form-wrap input{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px 14px;color:var(--text);font-size:.9rem;font-family:inherit;outline:none;transition:border .2s;resize:vertical}
.form-wrap textarea:focus,.form-wrap input:focus{border-color:rgba(255,42,42,.4)}
.form-wrap textarea{min-height:80px}
.form-wrap .btn{width:100%;margin-top:4px;font-size:1rem;padding:16px}
.form-note{text-align:center;font-size:.72rem;color:var(--muted);margin-top:10px;opacity:.7}
/* SECTIONS */
.section{padding:72px 6%;}
.section-inner{max-width:1060px;margin:0 auto}
.section h2{font-size:1.8rem;font-weight:800;text-align:center;margin-bottom:44px;position:relative}
.section h2::after{content:'';position:absolute;bottom:-12px;left:50%;transform:translateX(-50%);width:48px;height:3px;background:var(--accent);border-radius:2px}
/* SCENARIOS */
.scenarios{padding:64px 6%;background:var(--bg2,#0d0d14);border-top:1px solid rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.04)}
.scenarios-inner{max-width:760px;margin:0 auto}
.scenarios h2{font-size:1.55rem;font-weight:800;text-align:center;margin-bottom:36px;color:#fff}
.scenario{background:var(--card);border-left:3px solid var(--accent);border-radius:0 10px 10px 0;padding:18px 22px;margin-bottom:14px;font-size:.95rem;color:var(--muted);line-height:1.6;font-style:italic}
.scenario:last-child{margin-bottom:0}
.sc-q{color:var(--accent);font-style:normal;font-size:1.2rem;line-height:1}
footer{text-align:center;padding:28px 6%;color:var(--muted);font-size:.8rem;border-top:1px solid rgba(255,255,255,.05)}
@media(max-width:640px){.two-col{grid-template-columns:1fr}.hero{padding:76px 5% 56px}.scenarios{padding:48px 5%}}
</style>
</head>
<body>
<header>
  <a class="logo" href="#"><em>${esc(name)}</em></a>
  <a class="btn" href="#capture" style="padding:10px 20px;font-size:.82rem">${esc(p.cta)}</a>
</header>

<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="eyebrow">For ${esc(p.audience)}</div>
    <h1>${esc(p.headline)}</h1>
    <p class="sub">${esc(p.subline)}</p>
    <a class="btn" href="#capture">${esc(p.cta)}</a>
    <div class="proof-row">${proofHTML}</div>
  </div>
</section>

${scenariosHTML ? `<section class="scenarios"><div class="scenarios-inner"><h2>Sound familiar?</h2>${scenariosHTML}</div></section>` : ''}

<section class="section" style="background:var(--bg2);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="section-inner">
    <h2>What's broken — and what changes</h2>
    <div class="two-col">
      <div class="box pain">
        <h3>Right now</h3>
        <ul>${painHTML}</ul>
      </div>
      <div class="box win">
        <h3>After working with us</h3>
        <ul>${outHTML}</ul>
      </div>
    </div>
  </div>
</section>

<section class="form-section" id="capture">
  <h2>${esc(p.ctaLow || 'Let\'s map it out.')}</h2>
  <p>Two quick questions. Then a free 30-minute call where we build the plan — specific to your business, not a template.</p>
  <div class="form-wrap">
    <div>
      <label>${esc(p.form.q1)}</label>
      <textarea placeholder="Your answer..."></textarea>
    </div>
    <div>
      <label>${esc(p.form.q2)}</label>
      <textarea placeholder="Your answer..."></textarea>
    </div>
    <div>
      <label>Your name &amp; best contact number</label>
      <input type="text" placeholder="Name · Phone / WhatsApp">
    </div>
    <a class="btn" href="https://calendly.com/thesaassin/build-your-system" target="_blank" rel="noopener">${esc(p.cta)}</a>
    <p class="form-note">No spam. No hard sell. Just a 30-minute call with a clear plan.</p>
  </div>
</section>

<footer>
  &copy; ${new Date().getFullYear()} ${esc(name)}${loc ? ' &middot; ' + esc(loc) : ''}. System by <a href="https://thesaassin.com" style="color:var(--accent);text-decoration:none">TheSaaSsin</a>.
</footer>
</body>
</html>`;
}

/* ── OUTREACH SEQUENCE GENERATOR (5 messages) ── */
function buildOutreachSequence({ name, niche, offer, loc, profile, style }) {
  const p      = profile;
  const tone   = (style && style.tone) || 'professional';
  const at     = loc ? ` in ${loc}` : '';
  const pain0  = p.painPoints[0];
  const pain1  = p.painPoints[1] || p.painPoints[0];
  const win0   = p.outcomes[0];
  const scene  = p.scenarios ? p.scenarios[0] : null;

  // Opener CTA line varies by tone
  const opener_close = tone === 'friendly'
    ? `I'd love to show you what a system built for your setup would look like — no pressure, just a quick look.\n\n15 min? → https://calendly.com/thesaassin/build-your-system`
    : tone === 'aggressive'
    ? `If you want to fix that this month — reply and I'll send you a preview built specifically for ${name}.\n\nSlot: https://calendly.com/thesaassin/build-your-system`
    : `Worth a 15-min call to see if there's a fit?\n\n→ https://calendly.com/thesaassin/build-your-system`;

  const followup_close = tone === 'friendly'
    ? `Happy to just take a look and tell you honestly what I'd tweak. No prep needed.\n\n→ https://calendly.com/thesaassin/build-your-system`
    : tone === 'aggressive'
    ? `Free audit. 30 minutes. You walk away with a plan either way.\n\nClaim it → https://calendly.com/thesaassin/build-your-system`
    : `30 minutes → https://calendly.com/thesaassin/build-your-system`;

  return [
    {
      label: '1 — Opener',
      body:
`[First Name] — quick one.

Are enquiries coming in consistently${at}, or is it still hit and miss month to month?

I build client acquisition systems for ${niche} businesses — and the most common thing I see is: ${pain0.toLowerCase()}.

${scene ? 'Sound familiar?\n\n"' + scene + '"\n\n' : ''}${opener_close}

— TheSaaSsin`
    },
    {
      label: '2 — Value',
      body:
`[First Name] — following up.

Here's what I actually build for ${niche} businesses like ${name}:

→ ${win0}
→ ${p.outcomes[1]}
→ ${p.outcomes[2] || 'A system that works without you manually chasing it'}

The whole thing is live in 14 days. No retainers, no lock-in.

${tone === 'friendly' ? 'Want me to show you what it looks like for your setup? No obligation.' : tone === 'aggressive' ? 'This is what your competitors are missing. Don\'t wait on it.' : p.ctaLow || 'Want me to show you what it looks like for your setup?'}

→ https://calendly.com/thesaassin/build-your-system

— TheSaaSsin`
    },
    {
      label: '3 — System Preview',
      body:
`[First Name].

I've built a system preview specifically for a ${niche} business${at}. Takes me about 20 minutes to put together — I did one for yours.

It includes:
· A landing page written around your actual offer
· A 5-step outreach sequence
· A CRM pipeline with lead scoring
· Automated follow-up that contacts every lead within 5 minutes

I can walk you through the whole thing in 30 minutes. No prep needed from you.

${tone === 'friendly' ? 'If you like it, we can talk next steps. If not, you keep the preview.' : tone === 'aggressive' ? 'This is what\'s currently missing from your pipeline. Let me show you.' : 'If it\'s useful, great. If not, you leave with something concrete either way.'}

→ https://calendly.com/thesaassin/build-your-system

— TheSaaSsin`
    },
    {
      label: '4 — Follow-Up',
      body:
`[First Name] — haven't heard back, which is fine.

One thing I've noticed with ${niche} businesses${at}: ${pain1.toLowerCase()} — and most people either don't know it's fixable, or they've tried something before that didn't work.

${tone === 'aggressive' ? 'I\'m not here to waste your time — but if this is a real problem, let\'s solve it. 30 minutes is all it takes.' : 'I\'m not going to pitch you. But if you want a second opinion on your current setup, I\'ll give you one for free.'}

${followup_close}

— TheSaaSsin`
    },
    {
      label: '5 — Final Nudge',
      body:
`[First Name] — last message from me.

One question: is getting consistent clients for ${name} a priority right now, or is the focus elsewhere?

If it is — I can help, and I can show you exactly how in 30 minutes.

If it's not the right time — no problem at all. I'll leave you to it.

${tone === 'friendly' ? 'Either way, best of luck with it.' : 'Either way:'} https://calendly.com/thesaassin/build-your-system

— TheSaaSsin`
    }
  ];
}

/* ── PACKAGE SUMMARY ── */
function buildPackageSummary({ name, profile, style }) {
  const s = style.systems || {};
  const tone = style.tone || 'professional';
  const outcome = profile.outcomes[0];
  const toneLabel = { aggressive: '⚡ Aggressive', professional: '◼ Professional', friendly: '● Friendly' }[tone] || 'Professional';

  const components = [
    { id: 'landing',  label: 'Landing Page',        on: s.landing  !== false, icon: 'fa-file-code'      },
    { id: 'crm',      label: 'CRM Pipeline',         on: s.crm      !== false, icon: 'fa-chart-line'     },
    { id: 'outreach', label: 'Outreach Sequence',    on: s.outreach !== false, icon: 'fa-paper-plane'    },
    { id: 'followup', label: 'Follow-up System',     on: s.followup !== false, icon: 'fa-clock-rotate-left' },
    { id: 'booking',  label: 'Booking System',       on: !!s.booking,          icon: 'fa-calendar-check' }
  ];

  const countOn = components.filter(c => c.on).length;
  const expectedResult = countOn >= 4
    ? '5–15 qualified leads/week within 14 days'
    : countOn >= 3
    ? '3–8 qualified leads/week within 21 days'
    : 'Improved online conversion within 14 days';

  return { name, components, outcome, expectedResult, tone, toneLabel, countOn };
}

function showPackageSummary({ name, components, outcome, expectedResult, tone, toneLabel, countOn }) {
  const bar = document.getElementById('pkg-bar');
  if (!bar) return;

  const compHTML = components.map(c => `
    <div class="pkg-item${c.on ? '' : ' off'}">
      <i class="fas ${c.icon}"></i> ${c.label}
    </div>`).join('');

  bar.innerHTML = `
    <div class="pkg-label">System Package</div>
    <div class="pkg-name"><i class="fas fa-bolt"></i> ${esc(name)} — ${countOn} component${countOn !== 1 ? 's' : ''}</div>
    <div class="pkg-grid">${compHTML}</div>
    <div class="pkg-result">
      Expected: <strong>${expectedResult}</strong>
      <div class="pkg-meta">Tone: ${toneLabel} &nbsp;·&nbsp; Outcome: ${esc(outcome)}</div>
    </div>`;
  bar.classList.add('visible');
}

/* ── CRM STRUCTURE GENERATOR ── */
function buildCRMStructure({ name, niche, offer, goal, profile }) {
  return {
    client: name,
    niche,
    pipeline: [
      { stage: 'New',       score: 10, action: 'Send opener message',            auto: true  },
      { stage: 'Contacted', score: 25, action: 'Follow up in 48hrs if no reply', auto: true  },
      { stage: 'Replied',   score: 45, action: 'Book strategy call',             auto: false },
      { stage: 'Called',    score: 65, action: 'Send proposal / system preview', auto: false },
      { stage: 'Qualified', score: 80, action: 'Send invoice + onboarding form', auto: false },
      { stage: 'Booked',    score: 90, action: 'Confirm start date + kickoff',   auto: false },
      { stage: 'Closed',    score: 100, action: 'Deliver system + gather proof', auto: false }
    ],
    scoringRules: [
      { trigger: 'Replied to first message',    points: +15 },
      { trigger: 'Opened link in message',      points: +10 },
      { trigger: 'Booked a call',               points: +25 },
      { trigger: 'No reply after 7 days',       points: -10 },
      { trigger: 'Unsubscribed',                points: -50 }
    ],
    tags: [niche, goal, profile.type, 'thesaassin-generated']
  };
}

/* ── OFFER DEFINITION GENERATOR ── */
function buildOfferDefinition({ name, niche, offer, goal, loc, profile }) {
  return {
    client:      name,
    service:     offer,
    audience:    profile.audience,
    coreOffer:   `${offer} for ${profile.audience}${loc ? ' in ' + loc : ''}`,
    outcome:     profile.outcomes[0],
    mechanism:   'Full done-for-you system: landing page + CRM + automation + outreach',
    timeframe:   '14 days to live',
    guarantee:   'If it\'s not live in 14 days, you don\'t pay',
    price:       goal === 'bookings' ? '£597/mo (Growth) or £247 one-off (Starter)' : '£97–£1,197 depending on scope',
    positioning: `"I don't build websites. I build systems that fill your calendar."`,
    pitch:       `${name} is a ${niche} business struggling with ${profile.painPoints[0].toLowerCase()}. We solve that in 14 days with a full system. Priced from £97.`
  };
}

/* ══════════════════════════════════
   CRM / LEADS
══════════════════════════════════ */
async function loadLeads() {
  try {
    const res  = await fetch(API + '/leads');
    const data = await res.json();
    renderLeads(data.leads || []);
  } catch { renderLeads([]); }
}

function renderLeads(leads) {
  const tbody = document.getElementById('leads-tbody');
  document.getElementById('stat-total').textContent     = leads.length;
  document.getElementById('stat-new').textContent       = leads.filter(l => l.status === 'new').length;
  document.getElementById('stat-contacted').textContent = leads.filter(l => l.status === 'contacted').length;
  document.getElementById('stat-closed').textContent    = leads.filter(l => l.status === 'closed').length;

  if (!leads.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted);font-size:.8rem">No leads yet — add your first one</td></tr>';
    return;
  }
  tbody.innerHTML = leads.map(l => {
    const score = Math.min(100, Math.max(0, l.score || 0));
    const statusBadge = {
      new:       '<span class="badge badge-new">new</span>',
      contacted: '<span class="badge badge-pending">contacted</span>',
      qualified: '<span class="badge badge-active">qualified</span>',
      closed:    '<span class="badge badge-active">closed</span>'
    }[l.status] || '<span class="badge">—</span>';
    const date = l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-GB') : '—';
    return `<tr>
      <td>${esc(l.name || '—')}</td>
      <td>${esc(l.business || '—')}</td>
      <td>${statusBadge}</td>
      <td>
        ${score}
        <div class="score-bar"><div class="score-fill" style="width:${score}%"></div></div>
      </td>
      <td>${date}</td>
      <td>
        <select class="field select" style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:4px;padding:4px 8px;color:var(--text);font-size:.75rem;cursor:pointer"
                onchange="updateLeadStatus(${l.id}, this.value)">
          <option value="new"       ${l.status==='new'       ?'selected':''}>New</option>
          <option value="contacted" ${l.status==='contacted' ?'selected':''}>Contacted</option>
          <option value="qualified" ${l.status==='qualified' ?'selected':''}>Qualified</option>
          <option value="closed"    ${l.status==='closed'    ?'selected':''}>Closed</option>
        </select>
      </td>
    </tr>`;
  }).join('');
}

async function updateLeadStatus(id, status) {
  try {
    await fetch(API + '/leads', { method: 'PATCH', body: JSON.stringify({ id, status }) });
    toast('Lead updated', 'ok');
    loadLeads();
  } catch { toast('Update failed', 'err'); }
}

/* ADD LEAD MODAL */
document.getElementById('btn-add-lead').addEventListener('click', () => {
  document.getElementById('modal-lead').style.display = 'flex';
});
document.getElementById('btn-cancel-lead').addEventListener('click', () => {
  document.getElementById('modal-lead').style.display = 'none';
});
document.getElementById('btn-save-lead').addEventListener('click', async () => {
  const name = document.getElementById('lead-name').value.trim();
  if (!name) { toast('Name is required', 'err'); return; }
  const payload = {
    name,
    business: document.getElementById('lead-biz').value.trim(),
    status:   document.getElementById('lead-status').value,
    score:    parseInt(document.getElementById('lead-score').value) || 50
  };
  try {
    await fetch(API + '/leads', { method: 'POST', body: JSON.stringify(payload) });
    document.getElementById('modal-lead').style.display = 'none';
    ['lead-name','lead-biz'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('lead-score').value = 50;
    toast('Lead added', 'ok');
    loadLeads();
  } catch { toast('Could not add lead', 'err'); }
});

/* EXPORT CSV */
document.getElementById('btn-export-csv').addEventListener('click', async () => {
  try {
    const res   = await fetch(API + '/leads');
    const data  = await res.json();
    const leads = data.leads || [];
    if (!leads.length) { toast('No leads to export', 'err'); return; }
    const rows  = [['Name','Business','Status','Score','Added']];
    leads.forEach(l => rows.push([
      l.name || '', l.business || '', l.status || '', l.score || 0,
      l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-GB') : ''
    ]));
    const csv  = rows.map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'thesaassin-leads.csv';
    a.click();
    toast('CSV exported', 'ok');
  } catch { toast('Export failed', 'err'); }
});

/* ══════════════════════════════════
   OUTREACH QUEUE
══════════════════════════════════ */
let currentOutreachTab = 'pending'; // 'pending' | 'sent'

document.querySelectorAll('.out-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.out-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentOutreachTab = tab.dataset.status;
    loadOutreach();
  });
});

async function loadOutreach() {
  try {
    const res  = await fetch(API + '/outreach');
    const data = await res.json();
    renderOutreach(data.queue || []);
  } catch { renderOutreach([]); }
}

function renderOutreach(queue) {
  const list = document.getElementById('out-list');
  const countPending = queue.filter(q => q.status === 'pending').length;
  const countSent    = queue.filter(q => q.status === 'sent' || q.status === 'approved').length;
  document.getElementById('count-pending').textContent = countPending;
  document.getElementById('count-sent').textContent    = countSent;

  // Normalise: treat 'approved' as 'sent' for display
  const tab = currentOutreachTab;
  const filtered = queue.filter(q =>
    tab === 'sent' ? (q.status === 'sent' || q.status === 'approved') : q.status === tab
  );

  if (!filtered.length) {
    const emptyMsg = tab === 'pending'
      ? 'No queued messages — use Lead Feed → Compose to create one'
      : 'Nothing sent yet — fire a batch to see results here';
    list.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>${emptyMsg}</p></div>`;
    return;
  }

  list.innerHTML = filtered.map(q => `
    <div class="out-card">
      <div class="out-card-head">
        <div class="client-avatar" style="font-size:.72rem">${(q.clientName||'?').charAt(0).toUpperCase()}</div>
        <div class="out-card-name">${esc(q.clientName || 'Unknown')} <span style="font-size:.68rem;color:var(--muted);font-weight:400">${esc(q.label||'')}</span></div>
        <span class="badge ${q.status==='pending'?'badge-new':'badge-pending'}">${q.status==='pending'?'queued':'sent'}</span>
      </div>
      <div class="out-card-body">${esc(q.message || '')}</div>
      ${q.status === 'pending' ? `
      <div class="out-actions">
        <button class="btn btn-primary btn-sm" onclick="showSendEmail(${q.id})"><i class="fas fa-envelope"></i> Send Email</button>
        <button class="btn btn-secondary btn-sm" onclick="showSendSms(${q.id})"><i class="fas fa-mobile-screen"></i> Send SMS</button>
        <button class="btn btn-secondary btn-sm" onclick="copyOutreach(${q.id})"><i class="fas fa-copy"></i> Copy</button>
        <button class="btn btn-secondary btn-sm" onclick="updateOutreach(${q.id},'sent')"><i class="fas fa-check"></i> Mark Sent</button>
      </div>` : ''}
    </div>`).join('');
}

function copyOutreach(outreachId) {
  fetch(API + '/outreach').then(r => r.json()).then(data => {
    const item = (data.queue || []).find(q => q.id === outreachId);
    if (item?.message) {
      navigator.clipboard.writeText(item.message).then(() => toast('Copied to clipboard', 'ok'));
    }
  });
}

async function updateOutreach(id, status) {
  try {
    await fetch(API + '/outreach', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    toast('Outreach updated', 'ok');
    loadOutreach();
  } catch { toast('Update failed', 'err'); }
}

function showSendEmail(outreachId) {
  const to = prompt('Recipient email address:');
  if (!to || !to.includes('@')) { toast('Invalid email', 'err'); return; }
  const subject = prompt('Subject line:', 'Quick question for you') || 'Quick question for you';
  sendOutreachEmail(outreachId, to, subject);
}

async function sendOutreachEmail(outreachId, to, subject) {
  toast('Sending...', 'ok');
  try {
    const queue = (await (await fetch(API + '/outreach')).json()).queue || [];
    const item  = queue.find(q => q.id === outreachId);
    if (!item) { toast('Message not found', 'err'); return; }
    const res  = await fetch(API + '/send-outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, message: item.message, outreach_id: outreachId })
    });
    const data = await res.json();
    if (data.ok) { toast('Email sent!', 'ok'); loadOutreach(); }
    else toast(data.error || 'Send failed', 'err');
  } catch { toast('Send failed', 'err'); }
}

/* ── HELPERS ── */
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════════
   SMART ONBOARD WIZARD
══════════════════════════════════ */
const WIZ_STEPS = 4;
let _wizState = {};
let _wizStep  = 0;

const WIZ_NICHES = [
  { id:'trade',      icon:'🔧', label:'Trade / Site',    sub:'Plumber, electrician, builder, roofer, HVAC' },
  { id:'fitness',    icon:'💪', label:'Fitness / Health', sub:'PT, gym, yoga, physio, nutritionist' },
  { id:'cleaning',   icon:'🧹', label:'Cleaning / Care',  sub:'Domestic, commercial, landscaping, care' },
  { id:'consulting', icon:'📊', label:'Consulting',       sub:'Strategy, finance, HR, legal, operations' },
  { id:'agency',     icon:'📱', label:'Marketing / Agency', sub:'SEO, ads, social, design, PR' },
  { id:'saas',       icon:'💻', label:'SaaS / Tech',      sub:'Software, app, platform, automation' },
  { id:'ecommerce',  icon:'🛒', label:'E-commerce',       sub:'DTC brand, dropship, marketplace seller' },
  { id:'coach',      icon:'🎯', label:'Coach / Educator',  sub:'Life coach, tutor, course creator' },
  { id:'other',      icon:'✦',  label:'Other / Mixed',    sub:'Freelancer, creative, multi-service' }
];

const WIZ_SIZES = [
  { id:'solo',   icon:'👤', label:'Solo / Freelance', sub:'Just me — need to fill my own calendar' },
  { id:'small',  icon:'👥', label:'2–10 people',      sub:'Small team, growing but not yet stable' },
  { id:'medium', icon:'🏢', label:'10–50 people',     sub:'Established, scaling to next level' },
  { id:'large',  icon:'🏛️', label:'50+ people',       sub:'Enterprise, division or department' }
];

const WIZ_LOCATIONS = [
  { id:'uk',      icon:'🇬🇧', label:'United Kingdom' },
  { id:'us',      icon:'🇺🇸', label:'United States' },
  { id:'aus',     icon:'🇦🇺', label:'Australia' },
  { id:'canada',  icon:'🇨🇦', label:'Canada' },
  { id:'eu',      icon:'🇪🇺', label:'Europe' },
  { id:'global',  icon:'🌍', label:'Global / Remote' }
];

const WIZ_CHALLENGES = [
  { id:'no_clients',  icon:'😤', label:'Not enough clients', sub:'Pipeline is empty or unreliable' },
  { id:'no_system',   icon:'🔄', label:'No repeatable system', sub:'It works sometimes but not consistently' },
  { id:'low_conv',    icon:'📉', label:'Leads but no conversions', sub:'People enquire but don\'t buy' },
  { id:'retention',   icon:'🚪', label:'Clients don\'t stay', sub:'High churn, one-time buyers' },
  { id:'visibility',  icon:'👁️', label:'Nobody knows I exist', sub:'No brand, no online presence' },
  { id:'scaling',     icon:'📈', label:'Can\'t scale beyond me', sub:'Bottlenecked — can\'t grow without burning out' }
];

const WIZ_GOALS = [
  { id:'10clients',   label:'10 new clients in 30 days',       timeline:'30 days' },
  { id:'replace',     label:'Replace my salary (£3–5k/mo)',    timeline:'60–90 days' },
  { id:'10k',         label:'Hit £10k/month revenue',          timeline:'90 days' },
  { id:'fullbook',    label:'Fully booked calendar',           timeline:'30–60 days' },
  { id:'automate',    label:'Automate client acquisition',     timeline:'60 days' },
  { id:'launch',      label:'Launch & get first 5 clients',    timeline:'14 days' }
];

/* ── Decision Engine ── */
function buildStrategy(state) {
  const { niche, size, location, challenge, goal, bizName, targetClient } = state;

  // Channel priority per niche
  const channelMap = {
    trade:      { primary:'reddit', secondary:'facebook', tone:'aggressive', kws:['need plumber','looking for electrician','boiler repair','emergency trade','no jobs','need more work'] },
    fitness:    { primary:'reddit', secondary:'instagram', tone:'friendly',   kws:['personal trainer','weight loss help','fitness coach','want to get fit','gym motivation'] },
    cleaning:   { primary:'reddit', secondary:'facebook', tone:'professional',kws:['cleaning service','cleaner needed','commercial cleaning','domestic cleaner'] },
    consulting: { primary:'linkedin', secondary:'twitter', tone:'professional',kws:['business consultant','strategy help','struggling to grow','revenue plateau'] },
    agency:     { primary:'reddit', secondary:'linkedin', tone:'professional',kws:['need marketing','facebook ads help','seo help','agency results','lead generation'] },
    saas:       { primary:'twitter', secondary:'linkedin', tone:'professional',kws:['SaaS founder','startup growth','churn problem','product market fit'] },
    ecommerce:  { primary:'reddit', secondary:'twitter',  tone:'professional',kws:['ecommerce growth','conversion rate','DTC brand','shopify help'] },
    coach:      { primary:'reddit', secondary:'facebook', tone:'friendly',    kws:['life coach','business coach','need a coach','accountability partner'] },
    other:      { primary:'reddit', secondary:'linkedin', tone:'professional',kws:['need clients','struggling freelance','no customers','dead business'] }
  };

  // Location-aware approach
  const locationHint = {
    uk:     'Use UK spelling. Reference local platforms: Checkatrade, Bark.com, Facebook Marketplace UK.',
    us:     'Use USD references. Platforms: Thumbtack, Angi, Yelp, Craigslist.',
    aus:    'Use AUD. Platforms: hipages, ServiceSeeking, Airtasker.',
    canada: 'Use CAD. Platforms: Kijiji, HomeStars, Facebook Marketplace CA.',
    eu:     'Use local language cues where relevant. Reference GDPR compliance for outreach.',
    global: 'Focus on digital-first platforms: LinkedIn, Twitter, Reddit. Remote-friendly framing.'
  };

  // Challenge → outreach angle
  const challengeAngle = {
    no_clients:  'Lead with proof of results. Make the volume claim: "10 leads in 7 days."',
    no_system:   'Lead with consistency: "A system that runs every day, not when you have time."',
    low_conv:    'Lead with conversion: "Turn the leads you already have into booked jobs."',
    retention:   'Lead with lifetime value: "Stop losing clients after the first job."',
    visibility:  'Lead with presence: "Get found before they even post an ad."',
    scaling:     'Lead with leverage: "Get clients without you having to be on every call."'
  };

  // Goal → urgency framing
  const goalFrame = {
    '10clients':  { urgency:'high',   cta:'Book a call this week',     expected:'5–10 qualified leads in first 7 days' },
    'replace':    { urgency:'medium', cta:'Start your free trial',     expected:'£3–5k pipeline built in 60 days' },
    '10k':        { urgency:'medium', cta:'See a 30-day growth plan',  expected:'£10k revenue model mapped in first session' },
    'fullbook':   { urgency:'high',   cta:'Get your calendar filled',  expected:'3–5 bookings in first week' },
    'automate':   { urgency:'low',    cta:'Set it running for free',   expected:'Automated lead flow within 14 days' },
    'launch':     { urgency:'high',   cta:'Get your first 5 clients',  expected:'First client within 14 days or money back' }
  };

  const ch      = channelMap[niche]    || channelMap.other;
  const locHint = locationHint[location] || locationHint.global;
  const angle   = challengeAngle[challenge] || 'Lead with results and make it specific to their niche.';
  const gf      = goalFrame[goal]      || goalFrame['10clients'];

  // Size adjustments
  const sizeNote = size === 'solo'
    ? 'Speak to a single person — personal, direct, no corporate language.'
    : size === 'small'
    ? 'Acknowledge they\'re building a team — show scalable systems.'
    : 'Position as enterprise-ready with case studies and ROI framing.';

  // Module recommendations
  const modules = {
    leadGen:   true,
    outreach:  true,
    landing:   ['solo','small'].includes(size),
    crm:       true,
    followup:  true,
    booking:   ['trade','fitness','cleaning','coach'].includes(niche),
    emailSeq:  challenge !== 'visibility',
    sms:       ['trade','fitness','cleaning'].includes(niche) && ['uk','us','aus'].includes(location)
  };

  // Execution steps
  const steps = [
    {
      title: `Scan ${ch.primary === 'reddit' ? 'Reddit' : ch.primary === 'linkedin' ? 'LinkedIn' : 'X/Twitter'} for live leads`,
      detail: `Keywords: ${ch.kws.slice(0,3).join(', ')}. Filter to "${locationHint[location] ? location.toUpperCase() : 'relevant'}" posts from the last 7 days. Target 10–20 quality leads per scan.`
    },
    {
      title: 'AI score + personalise each message',
      detail: `${angle} Tone: ${ch.tone}. ${sizeNote}`
    },
    {
      title: `Send outreach via ${modules.sms ? 'SMS + Reddit DM' : 'Reddit DM + email'}`,
      detail: `First message under 80 words. One clear CTA: "${gf.cta}". Follow up once at 48hrs if no reply.`
    },
    {
      title: 'Track replies in CRM → move to booked',
      detail: `Pipeline: New → Contacted → Replied → Booked. Auto-score bumps up on reply. ${locHint}`
    }
  ];
  if (modules.landing) {
    steps.push({
      title: 'Deploy a landing page for credibility',
      detail: `Niche-matched page with your offer, proof, and booking form. Built automatically from your client profile in seconds.`
    });
  }

  return { ch, modules, steps, gf, angle, locHint, sizeNote };
}

/* ── Wizard Render Helpers ── */
function wiz_renderTileGrid(items, stateKey, cols = 3) {
  return `<div class="wiz-grid cols-${cols}">${items.map(it => `
    <div class="wiz-tile${_wizState[stateKey] === it.id ? ' selected' : ''}"
         onclick="wizSelect('${stateKey}','${it.id}',this)">
      <span class="wiz-tile-icon">${it.icon || ''}</span>
      <span class="wiz-tile-label">${esc(it.label)}</span>
      ${it.sub ? `<span class="wiz-tile-sub">${esc(it.sub)}</span>` : ''}
    </div>`).join('')}
  </div>`;
}

function wizSelect(key, val, el) {
  _wizState[key] = val;
  const parent = el.closest('.wiz-grid');
  parent.querySelectorAll('.wiz-tile').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
}

function wiz_stepContent(step) {
  if (step === 0) return `
    <div class="wiz-q">What's the client's business niche?</div>
    <div class="wiz-sub">Pick the closest match — this drives every keyword, channel, and message the system generates.</div>
    ${wiz_renderTileGrid(WIZ_NICHES, 'niche', 3)}`;

  if (step === 1) return `
    <div class="wiz-q">Their situation</div>
    <div class="wiz-sub">Size and location shape the strategy — a solo UK plumber gets different channels than a US SaaS team.</div>
    <div style="margin-bottom:18px">
      <div class="wiz-sub" style="margin-bottom:8px;font-weight:700;color:var(--text)">Team size</div>
      ${wiz_renderTileGrid(WIZ_SIZES, 'size', 2)}
    </div>
    <div>
      <div class="wiz-sub" style="margin-bottom:8px;font-weight:700;color:var(--text)">Location / Market</div>
      ${wiz_renderTileGrid(WIZ_LOCATIONS, 'location', 3)}
    </div>`;

  if (step === 2) return `
    <div class="wiz-q">What's their biggest challenge right now?</div>
    <div class="wiz-sub">This shapes the outreach angle — every message is written to address this specific pain.</div>
    ${wiz_renderTileGrid(WIZ_CHALLENGES, 'challenge', 2)}
    <div style="margin-top:20px">
      <div class="wiz-q" style="font-size:.9rem">What does success look like?</div>
      <div class="wiz-sub">Pick the goal — the system will reverse-engineer the execution plan from here.</div>
      <div class="wiz-grid cols-2" style="margin-top:12px">${WIZ_GOALS.map(g => `
        <div class="wiz-tile${_wizState.goal === g.id ? ' selected' : ''}"
             onclick="wizSelect('goal','${g.id}',this)" style="flex-direction:row;text-align:left;gap:10px;padding:10px 12px;">
          <div style="flex:1">
            <div class="wiz-tile-label">${esc(g.label)}</div>
            <div class="wiz-tile-sub">Timeline: ${esc(g.timeline)}</div>
          </div>
        </div>`).join('')}
      </div>
    </div>`;

  if (step === 3) return `
    <div class="wiz-q">Last details — then we build the plan</div>
    <div class="wiz-sub">A few quick fields to personalise the generated messages and landing page.</div>
    <div class="wiz-row">
      <label>Client business name</label>
      <input type="text" id="wiz-bizname" placeholder="e.g. Apex Plumbing" value="${esc(_wizState.bizName || '')}">
    </div>
    <div class="wiz-row">
      <label>Their core offer (one line)</label>
      <input type="text" id="wiz-offer" placeholder="e.g. Emergency plumbing, 24/7, South London" value="${esc(_wizState.offer || '')}">
    </div>
    <div class="wiz-row">
      <label>Who are their ideal clients? (optional)</label>
      <input type="text" id="wiz-target" placeholder="e.g. Homeowners and landlords in South London" value="${esc(_wizState.targetClient || '')}">
    </div>
    <div class="wiz-row">
      <label>Any extra context? (optional)</label>
      <textarea id="wiz-notes" placeholder="e.g. Recently went solo, used to work for big firm, wants to specialise in boilers">${esc(_wizState.notes || '')}</textarea>
    </div>`;
}

function wiz_resultContent(strategy) {
  const { ch, modules, steps, gf } = strategy;
  const niche    = WIZ_NICHES.find(n => n.id === _wizState.niche)    || {};
  const loc      = WIZ_LOCATIONS.find(l => l.id === _wizState.location) || {};
  const challenge= WIZ_CHALLENGES.find(c => c.id === _wizState.challenge) || {};
  const goal     = WIZ_GOALS.find(g => g.id === _wizState.goal)      || {};

  const moduleList = [
    { id:'leadGen',  label:'Lead Scanning',    on: modules.leadGen },
    { id:'outreach', label:'Outreach Composer', on: modules.outreach },
    { id:'crm',      label:'CRM Pipeline',     on: modules.crm },
    { id:'followup', label:'Follow-up System', on: modules.followup },
    { id:'landing',  label:'Landing Page',     on: modules.landing },
    { id:'booking',  label:'Booking System',   on: modules.booking },
    { id:'sms',      label:'SMS Outreach',      on: modules.sms },
    { id:'emailSeq', label:'Email Sequence',    on: modules.emailSeq }
  ];

  return `<div class="wiz-result">
    <div class="wiz-result-hero">
      <div class="wiz-result-tag">Strategy built for ${niche.icon || ''} ${niche.label || ''} · ${loc.icon || ''} ${loc.label || ''}</div>
      <div class="wiz-result-title">${esc(_wizState.bizName || 'This client')}'s Acquisition System</div>
      <div class="wiz-result-sub">Challenge: <b>${challenge.label || ''}</b> · Goal: <b>${goal.label || ''}</b> (${goal.timeline || ''})</div>
      <div class="wiz-result-sub" style="margin-top:4px">Primary channel: <b>${ch.primary}</b> · Tone: <b>${ch.tone}</b> · Outreach angle: <b>${strategy.angle.split('.')[0]}</b></div>
      <div class="wiz-modules">${moduleList.map(m =>
        `<span class="wiz-module${m.on ? '' : ' off'}">${m.on ? '✓' : '○'} ${m.label}</span>`).join('')}
      </div>
    </div>
    <div>
      <div class="wiz-sub" style="font-weight:700;color:var(--text);margin-bottom:8px">Execution plan</div>
      <div class="wiz-steps-list">${steps.map((s, i) => `
        <div class="wiz-exec-step">
          <div class="wiz-exec-n">${i+1}</div>
          <div>
            <div class="wiz-exec-title">${esc(s.title)}</div>
            <div class="wiz-exec-detail">${esc(s.detail)}</div>
          </div>
        </div>`).join('')}
      </div>
    </div>
    <div class="wiz-kw-row">
      ${ch.kws.map(k => `<button class="kw-btn" onclick="void(0)">${esc(k)}</button>`).join('')}
    </div>
    <div class="wiz-expected">
      <strong>Expected result</strong>
      ${esc(gf.expected)}
    </div>
    <button class="btn-lock-in" onclick="lockInAndFire()">
      <i class="fas fa-bolt"></i> Lock In &amp; Fire — Start Scanning Now
    </button>
  </div>`;
}

/* ── Wizard Flow ── */
function openWizard() {
  _wizState = {};
  _wizStep  = 0;
  document.getElementById('wizard-overlay').style.display = 'flex';
  renderWizardStep();
}

function closeWizard() {
  document.getElementById('wizard-overlay').style.display = 'none';
}

function renderWizardStep() {
  // Step track
  const track = document.getElementById('wizard-step-track');
  const labels = ['Niche', 'Situation', 'Challenge', 'Details'];
  track.innerHTML = labels.map((l, i) => {
    const cls = i < _wizStep ? 'done' : i === _wizStep ? 'active' : '';
    const lineCls = i < _wizStep ? 'done' : '';
    return (i > 0 ? `<div class="wiz-step-line ${lineCls}"></div>` : '') +
           `<div class="wiz-step ${cls}" title="${l}">${i < _wizStep ? '✓' : i+1}</div>`;
  }).join('');

  document.getElementById('wizard-body').innerHTML = wiz_stepContent(_wizStep);
  document.getElementById('wiz-back').style.display = _wizStep > 0 ? 'inline-flex' : 'none';

  const nextBtn = document.getElementById('wiz-next');
  nextBtn.style.display = 'inline-flex';
  nextBtn.innerHTML = _wizStep === WIZ_STEPS - 1
    ? '<i class="fas fa-wand-magic-sparkles"></i> Build Strategy'
    : 'Next <i class="fas fa-arrow-right"></i>';
}

function wizardBack() {
  if (_wizStep > 0) { _wizStep--; renderWizardStep(); }
}

function wizardNext() {
  // Capture step-3 text fields
  if (_wizStep === 3) {
    _wizState.bizName      = (document.getElementById('wiz-bizname')?.value || '').trim();
    _wizState.offer        = (document.getElementById('wiz-offer')?.value   || '').trim();
    _wizState.targetClient = (document.getElementById('wiz-target')?.value  || '').trim();
    _wizState.notes        = (document.getElementById('wiz-notes')?.value   || '').trim();
  }

  // Validate required selections
  const required = ['niche','size','location','challenge','goal'];
  if (_wizStep < 3) {
    const stepKeys = [['niche'],['size','location'],['challenge','goal']][_wizStep];
    const missing  = stepKeys.filter(k => !_wizState[k]);
    if (missing.length) { toast('Pick an option to continue', 'err'); return; }
  }

  if (_wizStep < WIZ_STEPS - 1) {
    _wizStep++;
    renderWizardStep();
  } else {
    // Build strategy + show result
    if (!_wizState.bizName) _wizState.bizName = WIZ_NICHES.find(n=>n.id===_wizState.niche)?.label || 'New Client';
    const strategy = buildStrategy(_wizState);
    document.getElementById('wizard-body').innerHTML = wiz_resultContent(strategy);
    document.getElementById('wizard-step-track').innerHTML =
      `<span style="font-size:.75rem;font-weight:700;color:var(--success)"><i class="fas fa-check"></i> Strategy built</span>`;
    document.getElementById('wiz-next').style.display = 'none';
    document.getElementById('wiz-back').style.display = 'none';
  }
}

async function lockInAndFire() {
  const niche    = WIZ_NICHES.find(n => n.id === _wizState.niche) || {};
  const strategy = buildStrategy(_wizState);
  const ch       = strategy.ch;

  // Build client payload
  const payload = {
    businessName: _wizState.bizName || niche.label || 'New Client',
    niche:        niche.label || _wizState.niche,
    offer:        _wizState.offer || `${niche.label} services`,
    goal:         WIZ_GOALS.find(g=>g.id===_wizState.goal)?.label || 'leads',
    location:     WIZ_LOCATIONS.find(l=>l.id===_wizState.location)?.label || '',
    notes:        [_wizState.targetClient, _wizState.notes].filter(Boolean).join(' | '),
    tone:         ch.tone,
    systemComponents: {
      landing:  strategy.modules.landing,
      crm:      strategy.modules.crm,
      outreach: strategy.modules.outreach,
      followup: strategy.modules.followup,
      booking:  strategy.modules.booking
    }
  };

  // Save client
  try {
    const r = await fetch(API + '/clients', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const d = await r.json();
    if (d.client) { selectedClient = d.client; loadClients(); }
  } catch {}

  // Close wizard and fire Lead Feed with strategy keywords
  closeWizard();

  // Switch to Lead Feed
  navItems.forEach(n => n.classList.remove('active'));
  panels.forEach(p => p.classList.remove('active'));
  const feedNav = document.querySelector('[data-panel="feed"]');
  if (feedNav) feedNav.classList.add('active');
  const feedPanel = document.getElementById('panel-feed');
  if (feedPanel) feedPanel.classList.add('active');
  topbarTitle.textContent = 'Lead Feed';

  // Pre-fill keyword + scan
  activeFeedKw = ch.kws[0] || 'need clients';
  const kwInput = document.getElementById('feed-custom-kw');
  if (kwInput) kwInput.value = ch.kws[0] || '';

  // Platform tab
  activeFeedPlatform = ch.primary === 'linkedin' ? 'linkedin'
    : ch.primary === 'twitter' ? 'twitter' : 'reddit';
  document.querySelectorAll('.feed-ptab').forEach(t =>
    t.classList.toggle('active', t.dataset.platform === activeFeedPlatform));

  toast(`${_wizState.bizName || 'Client'} locked in — scanning for leads...`, 'ok');

  // Auto-scan
  setTimeout(() => {
    if (activeFeedPlatform === 'twitter') fetchFeedX(activeFeedKw);
    else if (activeFeedPlatform === 'linkedin') fetchFeedLinkedIn(activeFeedKw);
    else fetchFeed(activeFeedKw);
  }, 300);
}

/* ══════════════════════════════════
   PERSONA
══════════════════════════════════ */
function loadPersona() {
  try { return JSON.parse(localStorage.getItem('ts_persona') || '{}'); } catch { return {}; }
}
function savePersonaData(p) {
  localStorage.setItem('ts_persona', JSON.stringify(p));
}

/* ══════════════════════════════════
   SETTINGS PANEL INIT
══════════════════════════════════ */
function initSettingsPanel() {
  const p = loadPersona();
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
  set('p-name', p.name); set('p-niche', p.niche); set('p-offer', p.offer);
  set('p-market', p.market); set('p-location', p.location);
  if (p.tone) {
    document.querySelectorAll('#p-tone-btns .tone-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.tone === p.tone));
  }
  renderApiKeysGrid();
}

document.getElementById('btn-save-persona') && document.getElementById('btn-save-persona').addEventListener('click', () => {
  const activeTone = document.querySelector('#p-tone-btns .tone-btn.active');
  const p = {
    name:     document.getElementById('p-name').value.trim(),
    niche:    document.getElementById('p-niche').value.trim(),
    offer:    document.getElementById('p-offer').value.trim(),
    market:   document.getElementById('p-market').value.trim(),
    location: document.getElementById('p-location').value.trim(),
    tone:     activeTone ? activeTone.dataset.tone : 'professional'
  };
  savePersonaData(p);
  toast('Persona saved', 'ok');
});

document.querySelectorAll('#p-tone-btns .tone-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#p-tone-btns .tone-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* ══════════════════════════════════
   API SETUP MODAL
══════════════════════════════════ */
const API_DEFS = {
  claude:  { label:'Claude AI',    icon:'fa-brain',             key:'ANTHROPIC_API_KEY',   desc:'AI lead scoring and personalised outreach generation',      url:'https://console.anthropic.com/account/keys', urlLabel:'Get free key ($5 credit)',  hint:'$5 free credit = 10,000+ lead scores. Model: claude-haiku-4-5.',    ph:'sk-ant-api03-...' },
  resend:  { label:'Resend Email', icon:'fa-envelope',          key:'RESEND_API_KEY',       desc:'Send outreach emails directly from the composer',            url:'https://resend.com/api-keys',                urlLabel:'Get free key',             hint:'Free tier: 3,000 emails/month. Also set FROM_EMAIL below.',         ph:'re_...',
             extra:[{label:'From Email',key:'FROM_EMAIL',ph:'you@yourdomain.com'}] },
  hunter:  { label:'Hunter.io',    icon:'fa-magnifying-glass',  key:'HUNTER_API_KEY',       desc:'Find email addresses from names and company domains',        url:'https://hunter.io/api',                      urlLabel:'Get free key',             hint:'Free tier: 25 searches/month — enough to test every lead.',         ph:'Your Hunter.io API key' },
  twilio:  { label:'Twilio SMS',   icon:'fa-mobile-screen',     key:'TWILIO_ACCOUNT_SID',   desc:'Send SMS messages to leads directly from the composer',      url:'https://www.twilio.com/console',             urlLabel:'Get free trial ($15)',     hint:'Need 3 values: Account SID + Auth Token + From Number.',           ph:'ACxxxxxxxx...',
             extra:[{label:'Auth Token',key:'TWILIO_AUTH_TOKEN',ph:'Your auth token'},{label:'From Number (+44...)',key:'TWILIO_FROM_NUMBER',ph:'+447...'}] },
  twitter: { label:'X / Twitter',  icon:'fa-x-twitter',         key:'TWITTER_BEARER_TOKEN', desc:'Scan X/Twitter for leads mentioning client pain points',     url:'https://developer.twitter.com/en/portal',    urlLabel:'Get free Basic key',       hint:'Free Basic tier: 100 reads/month — enough for daily scanning.',    ph:'AAAA...' },
  serpapi: { label:'SerpAPI',      icon:'fa-linkedin',          key:'SERPAPI_KEY',          desc:'LinkedIn lead search via Google dorking (no LinkedIn API)',  url:'https://serpapi.com/manage-api-key',         urlLabel:'Get free key',             hint:'Free tier: 100 searches/month.',                                   ph:'Your SerpAPI key' },
  stripe:  { label:'Stripe',       icon:'fa-credit-card',       key:'STRIPE_SECRET_KEY',    desc:'Power the £49/month subscription checkout',                 url:'https://dashboard.stripe.com/apikeys',       urlLabel:'Get test key',             hint:'Use sk_test_... first. Swap sk_live_... when ready to charge.',    ph:'sk_test_...' }
};

let _currentApiDef = null;

function openApiSetup(serviceKey) {
  const def = API_DEFS[serviceKey];
  if (!def) return;
  _currentApiDef = def;

  document.getElementById('api-modal-icon').innerHTML  = `<i class="fas ${def.icon}"></i>`;
  document.getElementById('api-modal-title').textContent = `Set up ${def.label}`;
  document.getElementById('api-modal-desc').textContent  = def.desc;
  document.getElementById('api-modal-hint').textContent  = def.hint;
  document.getElementById('api-modal-link').href         = def.url;
  document.getElementById('api-modal-link-label').textContent = def.urlLabel;

  const fields = document.getElementById('api-modal-fields');
  const allFields = [{ label: def.label + ' Key', key: def.key, ph: def.ph }, ...(def.extra || [])];
  fields.innerHTML = allFields.map(f => `
    <div class="api-modal-field">
      <label>${esc(f.label)}</label>
      <input type="password" id="api-input-${esc(f.key)}" placeholder="${esc(f.ph)}" autocomplete="off">
    </div>`).join('');

  const modal = document.getElementById('modal-api-setup');
  modal.style.display = 'flex';
}

function closeApiSetup() {
  document.getElementById('modal-api-setup').style.display = 'none';
  _currentApiDef = null;
}

async function saveApiKeys() {
  if (!_currentApiDef) return;
  const allFields = [{ key: _currentApiDef.key }, ...(_currentApiDef.extra || [])];
  const pairs = allFields.map(f => ({
    key:   f.key,
    value: (document.getElementById('api-input-' + f.key) || {}).value || ''
  })).filter(p => p.value.trim());

  if (!pairs.length) { toast('Paste at least one key first', 'err'); return; }

  const btn = document.querySelector('#modal-api-setup .btn-primary');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Saving...';

  let saved = 0;
  for (const pair of pairs) {
    try {
      const r = await fetch(API + '/save-key', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: pair.key, value: pair.value })
      });
      const d = await r.json();
      if (d.ok) saved++;
    } catch {}
  }

  btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Save & Activate';

  if (saved > 0) {
    toast(`${_currentApiDef.label} activated`, 'ok');
    closeApiSetup();
    checkApiStatus();
    renderApiKeysGrid();
  } else {
    toast('Save failed — check server is running', 'err');
  }
}

function renderApiKeysGrid() {
  const grid = document.getElementById('api-keys-grid');
  if (!grid) return;
  fetch(API + '/status').then(r => r.json()).then(data => {
    const s = data.services || {};
    const SERVICE_MAP = {
      claude: 'claude', resend: 'resend', hunter: 'hunter',
      twilio: 'twilio', twitter: 'twitter', stripe: 'stripe', serpapi: 'serpapi'
    };
    const STATUS_KEYS = {
      claude: s.claude, resend: s.resend, hunter: s.hunter,
      twilio: s.twilio, twitter: s.twitter, stripe: s.stripe, serpapi: !!s.serpapi
    };
    grid.innerHTML = Object.entries(API_DEFS).map(([key, def]) => {
      const isSet = STATUS_KEYS[key];
      return `<div class="api-key-row ${isSet ? 'key-set' : ''}" onclick="openApiSetup('${key}')">
        <div class="api-key-icon"><i class="fas ${def.icon}"></i></div>
        <div class="api-key-info">
          <div class="api-key-label">${def.label}</div>
          <div class="api-key-hint">${def.hint.split('.')[0]}</div>
        </div>
        <span class="api-key-status">${isSet ? '✓ Connected' : 'Not set'}</span>
        <i class="fas fa-chevron-right api-key-edit"></i>
      </div>`;
    }).join('');
  }).catch(() => {});
}

/* ══════════════════════════════════
   LEAD FEED
══════════════════════════════════ */

/* ── LEAD QUALITY FILTERS ── */
const REAL_INTENT = [
  'no clients','no customers','not getting clients','not getting leads',
  'no sales','no bookings','dead','nothing working','tried everything',
  'still not','can\'t get clients','cant get clients','zero clients',
  'struggling to find','can\'t find clients','no one is buying',
  'nothing is working','no enquiries','no response','nobody is',
  'how do i get','how can i get','need more clients','need clients',
  'any advice on getting','slow','quiet','dead month','any tips',
  'no work','where do i find','how to find clients','not working',
  'can\'t seem to','cant seem to','what am i doing wrong'
];

const BUYER_SIGNALS = [
  'clients','customers','leads','bookings','sales','revenue',
  'enquiries','appointments','contracts','jobs','business','freelance'
];

const BUSINESS_SIGNALS = [
  'business','freelance','self-employed','self employed','service','offer',
  'charge','rate','pricing','invoice','contract','client','customer',
  'revenue','income','money','pay','work','project'
];

const HARD_EXCLUDE = [
  'google ads','seo agency','hiring','looking for a job','job posting',
  'career advice','agency advice','employee','salary','interview',
  'apply for','resume','cv','job offer','therapist','therapy','mental health',
  'anxiety','depression','just got hired','got a job','i got a client',
  'landed a client','just closed','i closed','signed a client','won a client',
  'sharing my journey','my story','how i went from','here\'s what worked',
  'i made it','6 figures','i earn','passive income','dropship','amazon fba',
  'print on demand','crypto','nft','affiliate'
];

function hasBusinessContext(t) {
  return BUSINESS_SIGNALS.some(k => t.includes(k));
}

// Softer intent phrases — still relevant, just less explicit pain
const SOFT_INTENT = [
  'how do i','how can i','any advice','struggling','not getting',
  'need help','what should i do','why am i not','anyone else',
  'how to get','help me','where do i','getting nowhere',
  'slow month','quiet period','any tips','looking for clients',
  'find clients','get customers','grow my','build my client',
  'generate leads','attract clients','market my','promote my'
];

function scorePost(title, text, isComment = false) {
  const raw = (title + ' ' + text).toLowerCase();

  // Hard excludes — return 0 immediately
  if (HARD_EXCLUDE.some(k => raw.includes(k))) return 0;

  // Must have business context (comments are already business-context-adjacent)
  if (!isComment && !hasBusinessContext(raw)) return 0;

  let score = 0;
  const hasBuyer = BUYER_SIGNALS.some(k => raw.includes(k));

  // Strong pain signal — high confidence lead (passes alone)
  if (REAL_INTENT.some(k => raw.includes(k))) {
    score += 50;
  } else if (SOFT_INTENT.some(k => raw.includes(k)) && hasBuyer) {
    // Softer intent only counts when combined with a specific buyer keyword
    score += 25;
  } else {
    return 0; // no clear intent + buyer combo → not a lead
  }

  // Buyer context bonus (on top of base)
  if (hasBuyer) score += 20;

  // Active question
  if (title.includes('?') || raw.includes('?')) score += 20;

  // Urgency
  if (/now|today|this week|this month|currently|right now/.test(raw)) score += 10;
  if (/desperate|urgent|asap|really struggling|at a loss|nothing works/.test(raw)) score += 15;

  return Math.max(0, Math.min(score, 100));
}

/* ── ANALYSIS ENGINE ── */
function analyzePost(title, text, preScore) {
  const t = (title + ' ' + text).toLowerCase();
  const urgency = preScore !== undefined ? preScore : scorePost(title, text);

  // Niche detection
  const niche = /plumb|pipe|boiler|heating|gas safe/.test(t)       ? 'Plumber'
    : /electrician|wiring|fuse|eicr|niceic/.test(t)                ? 'Electrician'
    : /builder|construction|renovation|extension|loft/.test(t)     ? 'Builder'
    : /pt |personal train|fitness coach|gym|fat loss|body/.test(t) ? 'PT / Fitness'
    : /consultant|freelanc|strateg|advisor|coach|mentor/.test(t)   ? 'Consultant'
    : /marketing|agency|seo|ads|social media|lead gen/.test(t)     ? 'Marketing Agency'
    : /saas|software|app |platform|startup|founder/.test(t)        ? 'SaaS / Tech'
    : 'Business Owner';

  // Approach
  const approach = urgency >= 70 ? 'Direct offer — they need help now, lead with a result'
    : urgency >= 40              ? 'Empathy first — acknowledge the problem, then offer'
    :                              'Question first — qualify before pitching';

  // Opener
  const opener = urgency >= 70
    ? `Saw your post — I help ${niche.toLowerCase()} businesses fix exactly this. Built a quick preview for you. Worth a 15-min look?`
    : `Saw this and it resonated — most ${niche.toLowerCase()} businesses I work with hit the same wall. Happy to show you what changed for them?`;

  // Tip
  const tip = urgency >= 70 ? 'Message within the hour — high-intent window closes fast'
    : urgency >= 40          ? 'Start with empathy, not a pitch — ask one question first'
    :                          'Low signal — qualify harder before investing time here';

  const urgencyLabel = urgency >= 70 ? 'High' : urgency >= 40 ? 'Medium' : 'Low';
  const urgencyColor = urgency >= 70 ? '#22c55e' : urgency >= 40 ? '#f59e0b' : '#8888a0';

  return { urgency, urgencyLabel, urgencyColor, niche, approach, opener, tip };
}

/* ── POST CACHE (for composer) ── */
const feedPostCache = {};

/* ── KEYWORD PILLS ── */
let activeFeedKw       = 'need clients';
let activeFeedPlatform = 'reddit';

document.querySelectorAll('.kw-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.kw-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFeedKw = btn.dataset.kw;
  });
});

/* ── PLATFORM TABS ── */
let _apiStatus = {};  // cached from /api/status

document.querySelectorAll('.feed-ptab').forEach(tab => {
  tab.addEventListener('click', () => {
    const platform = tab.dataset.platform;
    // Gate locked platforms — show setup modal immediately
    if (platform === 'twitter'  && !_apiStatus.twitter)  { openApiSetup('twitter');  return; }
    if (platform === 'linkedin' && !_apiStatus.serpapi)  { openApiSetup('serpapi');  return; }
    document.querySelectorAll('.feed-ptab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFeedPlatform = platform;
  });
});

document.getElementById('btn-feed-refresh').addEventListener('click', () => {
  const custom = document.getElementById('feed-custom-kw').value.trim();
  const kw = custom || activeFeedKw;
  if (activeFeedPlatform === 'twitter')  fetchFeedX(kw);
  else if (activeFeedPlatform === 'linkedin') fetchFeedLinkedIn(kw);
  else fetchFeed(kw);
});

/* ── FETCH + RENDER ── */
async function fetchFeed(keyword) {
  const grid = document.getElementById('feed-grid');
  const meta = document.getElementById('feed-meta');
  grid.innerHTML = '<div class="feed-loading"><i class="fas fa-circle-notch"></i>Scanning Reddit for leads...</div>';
  meta.textContent = '';
  try {
    const res  = await fetch(API + '/feed?q=' + encodeURIComponent(keyword));
    const data = await res.json();
    if (!data.ok || !data.posts.length) {
      grid.innerHTML = '<div class="feed-empty"><i class="fas fa-inbox"></i><p>No posts found — try a different keyword</p></div>';
      return;
    }

    // Whitelist — only accept posts from target business subs
    const TARGET_SUBS = new Set([
      'smallbusiness','entrepreneur','sidehustle','freelance','sales',
      'startups','sweatystartup','entrepreneurridealong','forhire',
      'entrepreneur_ride_along','businessowners','growmybusiness',
      'digital_marketing','marketinghelp','agency'
    ]);
    const businessPosts = data.posts.filter(p => TARGET_SUBS.has(p.subreddit.toLowerCase()));

    // Score posts
    const scoredPosts = businessPosts
      .map(p => ({ ...p, _score: scorePost(p.title, p.text), _source: 'post' }))
      .filter(p => p._score >= 40);

    // Extract high-signal comments as additional lead candidates
    const commentLeads = [];
    for (const post of businessPosts) {
      if (!post.comments || !post.comments.length) continue;
      for (const comment of post.comments) {
        const cs = scorePost('', comment, true);
        if (cs >= 40) {
          commentLeads.push({
            id:        post.id + '_c' + commentLeads.length,
            title:     post.title,
            text:      comment,
            author:    post.author,
            subreddit: post.subreddit,
            url:       post.url,
            permalink: post.permalink,
            created:   post.created,
            score:     post.score,
            platform:  'reddit',
            _score:    cs,
            _source:   'comment'
          });
        }
      }
    }

    // Merge, deduplicate by post id (keep highest scorer), sort desc
    const seen = new Set();
    const allLeads = [...scoredPosts, ...commentLeads]
      .sort((a, b) => b._score - a._score)
      .filter(l => {
        const key = l.id.split('_c')[0];
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    if (!allLeads.length) {
      grid.innerHTML = '<div class="feed-empty"><i class="fas fa-filter"></i><p>No high-intent leads in this batch — try "no clients" or "need more bookings"</p></div>';
      meta.textContent = `${data.posts.length} posts fetched · ${businessPosts.length} from target subs · 0 passed quality filter`;
      return;
    }

    const commentCount = allLeads.filter(l => l._source === 'comment').length;
    meta.textContent = `${allLeads.length} quality leads · ${businessPosts.length}/${data.posts.length} from target subs${commentCount ? ` · ${commentCount} from comments` : ''} · "${keyword}"`;
    grid.innerHTML = allLeads.map(p => renderFeedCard(p)).join('');
  } catch (e) {
    grid.innerHTML = '<div class="feed-empty"><i class="fas fa-triangle-exclamation"></i><p>Could not fetch — check server is running</p></div>';
  }
}

function timeAgo(utc) {
  const diff = Math.floor(Date.now() / 1000) - utc;
  if (diff < 3600)   return Math.floor(diff/60) + 'm ago';
  if (diff < 86400)  return Math.floor(diff/3600) + 'h ago';
  return Math.floor(diff/86400) + 'd ago';
}

function renderFeedCard(post) {
  feedPostCache[post.id] = post; // cache for composer
  const isComment = post._source === 'comment';
  const a   = analyzePost(post.title, post.text, post._score);
  const ago = timeAgo(post.created);
  const fillW = Math.max(4, a.urgency);
  const sourceTag = isComment
    ? `<span style="font-size:.65rem;background:rgba(255,42,42,.15);color:var(--accent);padding:2px 6px;border-radius:4px;margin-left:4px">comment</span>`
    : '';

  return `<div class="feed-card" id="fc-${esc(post.id)}">
    <div class="feed-card-top">
      <span class="feed-platform">r/${esc(post.subreddit)}</span>
      <span class="feed-title">${esc(post.title)}${sourceTag}</span>
      <span class="feed-time">${ago}</span>
    </div>
    ${post.text && post.text !== post.title ? `<div class="feed-snippet">${isComment ? '<i class="fas fa-comment" style="color:var(--accent);margin-right:4px;font-size:.7rem"></i>' : ''}${esc(post.text)}</div>` : ''}
    <div class="feed-analysis">
      <div class="feed-analysis-row">
        <span class="analysis-label">Urgency</span>
        <div class="urgency-bar"><div class="urgency-fill" style="width:${fillW}%;background:${a.urgencyColor}"></div></div>
        <span class="analysis-val" style="color:${a.urgencyColor};font-weight:700">${a.urgencyLabel} (${a.urgency})</span>
      </div>
      <div class="feed-analysis-row">
        <span class="analysis-label">Niche</span>
        <span class="analysis-val">${esc(a.niche)}</span>
      </div>
      <div class="feed-analysis-row">
        <span class="analysis-label">Approach</span>
        <span class="analysis-val">${esc(a.approach)}</span>
      </div>
      <div class="feed-tip">💡 ${esc(a.tip)}</div>
    </div>
    <div class="feed-analysis" style="margin-top:-4px;border-color:rgba(255,42,42,.15)">
      <div class="feed-analysis-row" style="align-items:flex-start">
        <span class="analysis-label" style="color:var(--accent)">Opener</span>
        <span class="analysis-val" style="font-style:italic;color:var(--text)">"${esc(a.opener)}"</span>
      </div>
    </div>
    <div class="feed-actions">
      <button class="btn btn-primary btn-sm" onclick="openComposer('${esc(post.id)}')">
        <i class="fas fa-pen-to-square"></i> Compose
      </button>
      <button class="btn btn-secondary btn-sm" onclick="saveFeedLead('${esc(post.id)}','${esc(post.author)}','${esc(a.niche)}','${esc(post.url)}','${esc(post.title).replace(/'/g,'')}',${a.urgency})">
        <i class="fas fa-user-plus"></i> Save
      </button>
      <button class="btn btn-secondary btn-sm" id="ai-btn-${esc(post.id)}" onclick="aiScorePost('${esc(post.id)}','${esc(post.title).replace(/'/g,'')}','${esc(post.text).replace(/'/g,'').substring(0,300)}')">
        <i class="fas fa-brain"></i> AI Score
      </button>
      <button class="btn btn-secondary btn-sm" id="email-btn-${esc(post.id)}" onclick="findEmail('${esc(post.id)}','${esc(post.author)}','')">
        <i class="fas fa-at"></i> Email
      </button>
      <a class="btn btn-secondary btn-sm" href="${esc(post.url)}" target="_blank" rel="noopener">
        <i class="fas fa-arrow-up-right-from-square"></i> Post
      </a>
    </div>
    <div id="ai-result-${esc(post.id)}" style="display:none;margin-top:8px;padding:10px 12px;background:rgba(139,92,246,.08);border:1px solid rgba(139,92,246,.2);border-radius:8px;font-size:.78rem;color:var(--text)"></div>
  </div>`;
}

async function aiScorePost(postId, title, text) {
  const btn    = document.getElementById('ai-btn-' + postId);
  const result = document.getElementById('ai-result-' + postId);
  if (!btn || !result) return;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Scoring...';
  try {
    const res  = await fetch(API + '/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, text })
    });
    const data = await res.json();
    if (data.ok) {
      const color = data.score >= 70 ? '#22c55e' : data.score >= 40 ? '#f59e0b' : '#8888a0';
      result.style.display = 'block';
      result.innerHTML = `<b style="color:${color}">Claude Score: ${data.score}/100</b> · <i>${data.intent}</i><br><span style="color:var(--muted)">${data.reason}</span>${data.suggested_opener ? `<br><span style="color:var(--accent);margin-top:4px;display:block">💬 "${data.suggested_opener}"</span>` : ''}`;
      btn.innerHTML = '<i class="fas fa-check"></i> Scored';
    } else if (data.needsKey || (data.error || '').includes('ANTHROPIC')) {
      btn.innerHTML = '<i class="fas fa-brain"></i> AI Score';
      btn.disabled = false;
      openApiSetup('claude');
    } else {
      btn.innerHTML = '<i class="fas fa-brain"></i> AI Score';
      btn.disabled = false;
      toast(data.error || 'Score failed', 'err');
    }
  } catch {
    btn.innerHTML = '<i class="fas fa-brain"></i> AI Score';
    btn.disabled = false;
    toast('AI scoring failed', 'err');
  }
}

async function saveFeedLead(id, author, niche, url, title, score) {
  try {
    await fetch(API + '/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:     'u/' + author,
        business: niche + ' (Reddit)',
        status:   'new',
        score:    score,
        url:      url,
        title:    title,
        platform: 'reddit'
      })
    });
    // Visual feedback — grey out the saved card
    const card = document.getElementById('fc-' + id);
    if (card) {
      card.style.opacity = '0.45';
      card.style.pointerEvents = 'none';
      const btn = card.querySelector('.btn');
      if (btn) btn.innerHTML = '<i class="fas fa-check"></i> Saved';
    }
    toast('Lead saved to CRM', 'ok');
  } catch { toast('Could not save lead', 'err'); }
}

/* ══════════════════════════════════
   API STATUS CHECKER
══════════════════════════════════ */
async function checkApiStatus() {
  try {
    const res  = await fetch(API + '/status');
    const data = await res.json();
    if (!data.ok) return;
    _apiStatus = data.services; // cache for platform tab gating
    const s = data.services;
    const bar = document.getElementById('api-status-bar');
    if (!bar) return;
    // supabase not configurable in-app; others map to API_DEFS
    const items = [
      { key: 'supabase', label: 'DB',      icon: 'fa-database',        setup: null },
      { key: 'claude',   label: 'AI',      icon: 'fa-brain',           setup: 'claude' },
      { key: 'resend',   label: 'Email',   icon: 'fa-envelope',        setup: 'resend' },
      { key: 'twilio',   label: 'SMS',     icon: 'fa-mobile-screen',   setup: 'twilio' },
      { key: 'stripe',   label: 'Stripe',  icon: 'fa-credit-card',     setup: 'stripe' }
    ];
    bar.innerHTML = items.map(i => {
      const on      = !!s[i.key];
      const clickFn = i.setup && !on ? `onclick="openApiSetup('${i.setup}')" style="cursor:pointer"` : '';
      const tip     = on ? `${i.label}: connected` : `${i.label}: click to set up`;
      return `<span class="api-dot ${on ? 'api-on' : 'api-off'}" title="${tip}" ${clickFn}>
        <i class="fas ${on ? i.icon : 'fa-lock'}"></i> ${i.label}
      </span>`;
    }).join('');

    // Update platform tab lock indicators
    const tabs = { twitter: s.twitter, linkedin: s.serpapi };
    document.querySelectorAll('.feed-ptab').forEach(tab => {
      const p = tab.dataset.platform;
      if (p === 'twitter' || p === 'linkedin') {
        const unlocked = tabs[p];
        tab.title = unlocked ? '' : `Requires ${p === 'twitter' ? 'Twitter' : 'SerpAPI'} key — click to set up`;
        const icon = tab.querySelector('i');
        if (icon) {
          icon.className = unlocked
            ? (p === 'twitter' ? 'fab fa-x-twitter' : 'fab fa-linkedin')
            : 'fas fa-lock';
        }
      }
    });
  } catch { /* silent */ }
}

/* ── X/Twitter Feed ── */
async function fetchFeedX(keyword) {
  const grid = document.getElementById('feed-grid');
  const meta = document.getElementById('feed-meta');
  grid.innerHTML = '<div class="feed-loading"><i class="fas fa-circle-notch"></i>Scanning X/Twitter for leads...</div>';
  meta.textContent = '';
  try {
    const res  = await fetch(API + '/feed-x?q=' + encodeURIComponent(keyword));
    const data = await res.json();
    if (!data.ok) {
      grid.innerHTML = `<div class="feed-empty"><i class="fas fa-x-twitter"></i><p>${esc(data.error || 'Twitter unavailable')}</p>${data.hint ? `<p style="font-size:.7rem;opacity:.5">${esc(data.hint)}</p>` : ''}</div>`;
      return;
    }
    if (!data.posts.length) {
      grid.innerHTML = '<div class="feed-empty"><i class="fas fa-x-twitter"></i><p>No matching posts — try a different keyword</p></div>';
      return;
    }
    meta.textContent = `${data.posts.length} posts from X/Twitter · "${keyword}"`;
    grid.innerHTML = data.posts.map(p => renderFeedCard(p)).join('');
  } catch {
    grid.innerHTML = '<div class="feed-empty"><i class="fas fa-triangle-exclamation"></i><p>X/Twitter fetch failed</p></div>';
  }
}

/* ── LinkedIn Dork Feed ── */
async function fetchFeedLinkedIn(keyword) {
  const grid = document.getElementById('feed-grid');
  const meta = document.getElementById('feed-meta');
  const niche = document.getElementById('feed-custom-kw')?.value?.trim() || '';
  grid.innerHTML = '<div class="feed-loading"><i class="fas fa-circle-notch"></i>Scanning LinkedIn via Google...</div>';
  meta.textContent = '';
  try {
    const res  = await fetch(API + '/feed-linkedin?q=' + encodeURIComponent(keyword) + '&niche=' + encodeURIComponent(niche));
    const data = await res.json();
    if (!data.ok) {
      grid.innerHTML = `<div class="feed-empty"><i class="fab fa-linkedin"></i><p>${esc(data.error || 'LinkedIn search unavailable')}</p>${data.hint ? `<p style="font-size:.7rem;opacity:.5">${esc(data.hint)}</p>` : ''}</div>`;
      return;
    }
    if (!data.posts.length) {
      grid.innerHTML = '<div class="feed-empty"><i class="fab fa-linkedin"></i><p>No LinkedIn posts found — try different keywords</p></div>';
      return;
    }
    meta.textContent = `${data.posts.length} LinkedIn posts found · "${keyword}"`;
    grid.innerHTML = data.posts.map(p => renderFeedCard(p)).join('');
  } catch {
    grid.innerHTML = '<div class="feed-empty"><i class="fas fa-triangle-exclamation"></i><p>LinkedIn search failed</p></div>';
  }
}

/* ── Find Email (Hunter.io) ── */
async function findEmail(postId, authorName, domain) {
  // Gate: if Hunter key missing, show setup modal instead of silently failing
  if (!_apiStatus.hunter) { openApiSetup('hunter'); return; }

  const btn = document.getElementById('email-btn-' + postId);
  if (!btn) return;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
  try {
    const name   = authorName.replace(/^u\//, '').replace(/_/g, ' ');
    const d      = domain || prompt('Enter their website domain (e.g. plumbingco.co.uk):');
    if (!d) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-at"></i> Find Email'; return; }
    const res    = await fetch(API + '/find-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, domain: d })
    });
    const data = await res.json();
    if (data.ok && data.email) {
      btn.innerHTML = `<i class="fas fa-check"></i> ${esc(data.email)}`;
      btn.style.color = 'var(--success)';
      btn.onclick = () => navigator.clipboard.writeText(data.email).then(() => toast('Email copied', 'ok'));
      toast('Email found: ' + data.email, 'ok');
    } else if (data.ok && data.emails?.length) {
      const e = data.emails[0].email;
      btn.innerHTML = `<i class="fas fa-check"></i> ${esc(e)}`;
      btn.style.color = 'var(--success)';
      btn.onclick = () => navigator.clipboard.writeText(e).then(() => toast('Email copied', 'ok'));
      toast('Email found: ' + e, 'ok');
    } else {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-at"></i> Find Email';
      toast(data.error || 'No email found', 'err');
    }
  } catch {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-at"></i> Find Email';
    toast('Email lookup failed', 'err');
  }
}

/* ══════════════════════════════════
   OUTREACH COMPOSER
══════════════════════════════════ */
let _composerMsgs   = [];
let _composerTabIdx = 0;
let _composerPost   = null;
let _composerChannel = 'copy';

function openComposer(postId) {
  const post = feedPostCache[postId];
  if (!post) { toast('Lead not found', 'err'); return; }
  _composerPost   = post;
  _composerChannel = 'copy';

  // Show drawer
  document.getElementById('drawer-composer').classList.add('open');
  document.getElementById('drawer-overlay').classList.add('open');

  // Lead context
  const a = analyzePost(post.title, post.text, post._score);
  document.getElementById('composer-lead-ctx').innerHTML = `
    <div class="composer-lead-platform">${esc(post.platform || 'reddit')} · r/${esc(post.subreddit || post.author)}</div>
    <div class="composer-lead-title">${esc(post.title)}</div>
    <div class="composer-lead-meta">
      <span>u/${esc(post.author)}</span>
      <span class="composer-lead-score" style="color:${a.urgencyColor}">${a.urgencyLabel} intent (${a.urgency})</span>
      <span>${esc(a.niche)}</span>
    </div>`;

  // Reset tabs
  document.getElementById('composer-tabs').innerHTML = '';
  document.getElementById('composer-textarea').value = '';
  document.getElementById('composer-status').textContent = '';
  document.getElementById('composer-textarea').value = '';

  // Reset channel button
  document.querySelectorAll('.channel-btn').forEach(b => b.classList.toggle('active', b.dataset.channel === 'copy'));
  document.getElementById('composer-channel-input').style.display = 'none';
  document.getElementById('composer-send-btn').innerHTML = '<i class="fas fa-copy"></i> Copy & Open Reddit';

  // Generate messages
  generateComposerMessages(post, a);
}

function closeComposer() {
  document.getElementById('drawer-composer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
}

async function generateComposerMessages(post, analysis) {
  const textarea = document.getElementById('composer-textarea');
  const tabs     = document.getElementById('composer-tabs');
  const persona  = loadPersona();

  textarea.value = '';
  tabs.innerHTML = '<div class="composer-loading"><i class="fas fa-circle-notch"></i> Generating with your persona...</div>';

  // Try Claude API first
  let msgs = null;
  try {
    const r = await fetch(API + '/generate-outreach', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        niche:       analysis.niche,
        offer:       persona.offer || 'an AI lead generation system',
        goal:        'leads',
        location:    persona.location || 'UK',
        tone:        persona.tone || 'professional',
        leadContext: `Platform: ${post.platform}. Post: ${post.title}. Body: ${(post.text || '').substring(0, 300)}. Urgency: ${analysis.urgencyLabel}. Niche: ${analysis.niche}.`,
        persona:     { name: persona.name, niche: persona.niche, offer: persona.offer, market: persona.market }
      })
    });
    const d = await r.json();
    if (d.ok && d.messages) msgs = d.messages;
  } catch {}

  // Template fallback (no Claude key needed)
  if (!msgs) {
    const name   = persona.name   || 'I';
    const offer  = persona.offer  || 'a system that finds you clients on autopilot';
    const niche  = analysis.niche;
    const author = post.author || 'there';
    msgs = [
      { label: 'Direct', body: `Hey u/${author} — saw your post about getting clients. ${name} built a system that scans Reddit daily for ${niche.toLowerCase()} businesses in your exact situation and sends you 10+ ready-to-contact leads every morning. 14-day free trial — no card needed. Want to see what it pulls for your area tonight?` },
      { label: 'Empathy', body: `Saw this and it resonated — most ${niche.toLowerCase()} businesses I talk to hit this exact wall. The referral cycle runs dry right when you need it most. ${name} built ${offer} specifically for this. Took 10 minutes to set up, no agency fees. Happy to show you what it found for someone in your niche this week?` },
      { label: 'Value-first', body: `Quick one for u/${author} — I ran your niche ("${niche}") through the system I built and it pulled 14 local leads in the last 48hrs who are actively asking for help. I can send you that list free. If any of them convert, you'd know the system works and it's £49/mo — less than one lost job. Want the list?` }
    ];
  }

  _composerMsgs = msgs;
  _composerTabIdx = 0;
  renderComposerTabs();
}

function renderComposerTabs() {
  const tabs     = document.getElementById('composer-tabs');
  const textarea = document.getElementById('composer-textarea');
  tabs.innerHTML = _composerMsgs.map((m, i) =>
    `<div class="composer-tab${i === _composerTabIdx ? ' active' : ''}" onclick="switchComposerTab(${i})">${esc(m.label)}</div>`
  ).join('');
  textarea.value = _composerMsgs[_composerTabIdx]?.body || '';
  updateCharCount();
  textarea.addEventListener('input', updateCharCount);
}

function switchComposerTab(i) {
  _composerTabIdx = i;
  document.querySelectorAll('.composer-tab').forEach((t, idx) => t.classList.toggle('active', idx === i));
  document.getElementById('composer-textarea').value = _composerMsgs[i]?.body || '';
  updateCharCount();
}

function updateCharCount() {
  const ta  = document.getElementById('composer-textarea');
  const cnt = document.getElementById('composer-chars');
  if (ta && cnt) cnt.textContent = `${ta.value.length} / 300`;
}

function setComposerChannel(channel, btn) {
  _composerChannel = channel;
  document.querySelectorAll('.channel-btn').forEach(b => b.classList.toggle('active', b === btn));
  const inputWrap = document.getElementById('composer-channel-input');
  const input     = document.getElementById('composer-recipient');
  const sendBtn   = document.getElementById('composer-send-btn');

  if (channel === 'copy') {
    inputWrap.style.display = 'none';
    sendBtn.innerHTML = '<i class="fas fa-copy"></i> Copy & Open Reddit';
  } else if (channel === 'email') {
    inputWrap.style.display = 'block';
    input.placeholder = 'Their email address';
    input.type = 'email';
    sendBtn.innerHTML = '<i class="fas fa-envelope"></i> Send Email';
  } else if (channel === 'sms') {
    inputWrap.style.display = 'block';
    input.placeholder = 'Mobile number (e.g. 07700900000)';
    input.type = 'tel';
    sendBtn.innerHTML = '<i class="fas fa-mobile-screen"></i> Send SMS';
  }
}

async function composerSend() {
  const message = document.getElementById('composer-textarea').value.trim();
  if (!message) { toast('Write a message first', 'err'); return; }

  const status  = document.getElementById('composer-status');
  const sendBtn = document.getElementById('composer-send-btn');

  if (_composerChannel === 'copy') {
    navigator.clipboard.writeText(message).then(() => {
      toast('Copied! Opening Reddit...', 'ok');
      status.textContent = '✓ Copied to clipboard — paste it as a Reddit DM';
      if (_composerPost?.url) window.open(_composerPost.url, '_blank');
    });
    return;
  }

  const recipient = document.getElementById('composer-recipient').value.trim();
  if (!recipient) { toast('Enter a recipient first', 'err'); return; }

  sendBtn.disabled = true;
  sendBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';

  try {
    if (_composerChannel === 'email') {
      const r = await fetch(API + '/send-outreach', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, subject: 'Quick question for you', message })
      });
      const d = await r.json();
      if (d.ok) {
        toast('Email sent!', 'ok');
        status.textContent = `✓ Email sent to ${recipient}`;
        closeComposer();
      } else if (d.needsKey || d.error?.includes('RESEND')) {
        toast('Set up Resend to send emails', 'err');
        openApiSetup('resend');
      } else {
        toast(d.error || 'Send failed', 'err');
      }
    } else if (_composerChannel === 'sms') {
      const r = await fetch(API + '/send-sms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, message })
      });
      const d = await r.json();
      if (d.ok) {
        toast('SMS sent!', 'ok');
        status.textContent = `✓ SMS sent to ${recipient}`;
        closeComposer();
      } else if (d.error?.includes('Twilio') || d.error?.includes('not configured')) {
        toast('Set up Twilio to send SMS', 'err');
        openApiSetup('twilio');
      } else {
        toast(d.error || 'SMS failed', 'err');
      }
    }
  } catch {
    toast('Send failed — check server', 'err');
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerHTML = _composerChannel === 'email'
      ? '<i class="fas fa-envelope"></i> Send Email'
      : '<i class="fas fa-mobile-screen"></i> Send SMS';
  }
}

/* ══════════════════════════════════
   BATCH OUTREACH + FEEDBACK LOOP
══════════════════════════════════ */
let _batchItems   = [];   // [{ post, message, channel, status }]
let _feedbackQueue = [];  // pending feedback checks
let _feedbackCurrent = null;

async function runBatch() {
  // 1. Need posts in the feed — scan if empty
  const grid = document.getElementById('feed-grid');
  const hasPosts = Object.keys(feedPostCache).length > 0;

  document.getElementById('modal-batch').style.display = 'flex';
  document.getElementById('batch-list').innerHTML =
    '<div class="composer-loading"><i class="fas fa-circle-notch"></i> Scanning for top leads…</div>';
  document.getElementById('batch-sub').textContent = 'Scanning Reddit…';
  document.getElementById('btn-fire-all').disabled = true;

  // 2. Fetch leads if cache empty
  if (!hasPosts) {
    try {
      const kw  = activeFeedKw || 'need clients';
      const res = await fetch(API + '/feed?q=' + encodeURIComponent(kw));
      const data = await res.json();
      if (data.ok) {
        const TARGET_SUBS = new Set(['smallbusiness','entrepreneur','sidehustle','freelance',
          'sales','startups','sweatystartup','entrepreneurridealong','smallbusinessuk',
          'forhire','businessowners','growmybusiness']);
        (data.posts || [])
          .filter(p => TARGET_SUBS.has((p.subreddit||'').toLowerCase()))
          .forEach(p => { feedPostCache[p.id] = p; });
      }
    } catch {}
  }

  // 3. Pick top 5 by score
  const scored = Object.values(feedPostCache)
    .map(p => ({ ...p, _score: p._score !== undefined ? p._score : scorePost(p.title, p.text) }))
    .filter(p => p._score >= 35)
    .sort((a, b) => b._score - a._score)
    .slice(0, 5);

  if (!scored.length) {
    document.getElementById('batch-list').innerHTML =
      '<div class="feed-empty"><i class="fas fa-filter"></i><p>No quality leads found — hit Scan first, then Run Batch.</p></div>';
    document.getElementById('batch-sub').textContent = 'No leads found';
    return;
  }

  document.getElementById('batch-sub').textContent = `Composing ${scored.length} messages from your persona…`;

  // 4. Generate messages (Claude or template)
  const persona = loadPersona();
  _batchItems = [];

  for (const post of scored) {
    const a = analyzePost(post.title, post.text, post._score);
    let msg = buildTemplateMessage(post, a, persona);

    // Try Claude
    try {
      const r = await fetch(API + '/generate-outreach', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: a.niche, offer: persona.offer, goal: 'leads',
          location: persona.location || 'UK', tone: persona.tone || 'professional',
          leadContext: `Post: ${post.title}. Body: ${(post.text||'').substring(0,200)}. Urgency: ${a.urgencyLabel}. Niche: ${a.niche}.`,
          persona: { name: persona.name, niche: persona.niche, offer: persona.offer, market: persona.market }
        })
      });
      const d = await r.json();
      if (d.ok && d.messages?.[0]) msg = d.messages[0].body;
    } catch {}

    _batchItems.push({ post, analysis: a, message: msg, channel: 'copy', status: 'pending', id: post.id });
  }

  // 5. Render batch list
  renderBatchList();
  document.getElementById('batch-sub').textContent = `${_batchItems.length} messages ready — review and fire`;
  document.getElementById('btn-fire-all').disabled = false;
  updateBatchReadyCount();
}

function buildTemplateMessage(post, a, persona) {
  const name   = persona.name   || 'I';
  const offer  = persona.offer  || 'an AI system that finds local clients on autopilot';
  const author = post.author    || 'there';
  const niche  = a.niche.toLowerCase();

  if (a.urgency >= 70) {
    return `Hey u/${author} — saw this and it's exactly the problem ${name} built a solution for. ${offer.charAt(0).toUpperCase() + offer.slice(1)} — specifically for ${niche} businesses. 14-day trial, no card. Want me to run it on your area tonight and send you what it pulls?`;
  }
  if (a.urgency >= 40) {
    return `Saw your post, u/${author}. Most ${niche} businesses ${name} work with hit the same wall — works when you're lucky, nothing when you're not. ${name} fixed that with ${offer}. Happy to show you what it found for someone in your niche this week?`;
  }
  return `Quick one for u/${author} — ${name} built a system that scans Reddit daily for ${niche} leads actively looking right now. Ran it on your niche and found 8 in the last 48hrs. Worth a 10-min look? Free trial, no commitment.`;
}

function renderBatchList() {
  const list = document.getElementById('batch-list');
  list.innerHTML = _batchItems.map((item, i) => {
    const { post, analysis: a, message, status } = item;
    const scoreColor = a.urgency >= 70 ? 'var(--success)' : a.urgency >= 40 ? 'var(--warn)' : 'var(--muted)';
    return `<div class="batch-item" id="batch-item-${i}">
      <div class="batch-item-hdr">
        <div class="batch-item-num">${i+1}</div>
        <div class="batch-item-lead">
          <div class="batch-item-author">u/${esc(post.author)} · r/${esc(post.subreddit||'')}</div>
          <div class="batch-item-meta">${esc(post.title.substring(0,70))}${post.title.length>70?'…':''}</div>
        </div>
        <span class="batch-item-score" style="background:${scoreColor}22;color:${scoreColor};border:1px solid ${scoreColor}44">${a.urgency}</span>
        <span class="batch-item-status ${status}" id="batch-status-${i}">${status==='fired'?'✓ Fired':'Pending'}</span>
      </div>
      <textarea class="batch-textarea" id="batch-msg-${i}" rows="3">${esc(message)}</textarea>
      <div class="batch-item-actions">
        <select class="batch-channel-sel" id="batch-ch-${i}" onchange="_batchItems[${i}].channel=this.value">
          <option value="copy">Reddit DM (Copy)</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>
        <input type="text" class="batch-textarea" id="batch-rec-${i}" placeholder="Email or phone (if not Reddit)"
               style="min-height:0;padding:5px 10px;font-size:.75rem;flex:1;display:none">
        <button class="btn btn-secondary btn-sm" onclick="fireSingle(${i})">
          <i class="fas fa-paper-plane"></i> Fire
        </button>
        <a class="btn btn-secondary btn-sm" href="${esc(post.url)}" target="_blank" rel="noopener">
          <i class="fas fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    </div>`;
  }).join('');

  // Wire up channel selects to show/hide recipient input
  _batchItems.forEach((_, i) => {
    const sel = document.getElementById('batch-ch-' + i);
    const rec = document.getElementById('batch-rec-' + i);
    if (sel && rec) {
      sel.addEventListener('change', () => {
        rec.style.display = sel.value === 'copy' ? 'none' : 'block';
        rec.placeholder = sel.value === 'email' ? 'Email address' : 'Phone number';
      });
    }
  });
}

function updateBatchReadyCount() {
  const fired   = _batchItems.filter(i => i.status === 'fired').length;
  const pending = _batchItems.length - fired;
  document.getElementById('batch-ready-count').textContent =
    fired ? `${fired} fired · ${pending} remaining` : `${_batchItems.length} ready to fire`;
}

async function fireSingle(idx) {
  const item = _batchItems[idx];
  if (!item) return;

  // Read live textarea value
  item.message = document.getElementById('batch-msg-' + idx)?.value || item.message;
  const channel = item.channel;
  const recipient = document.getElementById('batch-rec-' + idx)?.value?.trim() || '';

  if (channel === 'copy') {
    navigator.clipboard.writeText(item.message).then(() => {
      window.open(item.post.url, '_blank');
      markBatchFired(idx, item);
    });
    return;
  }

  if (!recipient) { toast('Enter a recipient for item ' + (idx+1), 'err'); return; }

  try {
    if (channel === 'email') {
      const r = await fetch(API + '/send-outreach', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ to: recipient, subject: 'Quick question for you', message: item.message })
      });
      const d = await r.json();
      if (d.ok) markBatchFired(idx, item);
      else if (d.needsKey) { closeBatch(); openApiSetup('resend'); }
      else toast(d.error || 'Send failed', 'err');
    } else if (channel === 'sms') {
      const r = await fetch(API + '/send-sms', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ to: recipient, message: item.message })
      });
      const d = await r.json();
      if (d.ok) markBatchFired(idx, item);
      else if (d.error?.includes('not configured')) { closeBatch(); openApiSetup('twilio'); }
      else toast(d.error || 'SMS failed', 'err');
    }
  } catch { toast('Send failed', 'err'); }
}

function markBatchFired(idx, item) {
  item.status = 'fired';
  const statusEl = document.getElementById('batch-status-' + idx);
  if (statusEl) { statusEl.textContent = '✓ Fired'; statusEl.className = 'batch-item-status fired'; }
  updateBatchReadyCount();

  // Queue feedback check for this lead
  _feedbackQueue.push({
    author:  item.post.author,
    title:   item.post.title.substring(0, 60),
    url:     item.post.url,
    channel: item.channel,
    message: item.message
  });
}

async function fireAll() {
  const btn = document.getElementById('btn-fire-all');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Firing…';

  for (let i = 0; i < _batchItems.length; i++) {
    if (_batchItems[i].status !== 'fired') await fireSingle(i);
    await new Promise(r => setTimeout(r, 400)); // small delay between sends
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-check"></i> All Fired';

  // Save batch to outreach queue for tracking
  for (const item of _batchItems) {
    fetch(API + '/outreach', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: loadPersona().name || 'Operator',
        niche:      item.analysis.niche,
        label:      'Batch — ' + item.channel,
        message:    item.message,
        status:     'sent'
      })
    }).catch(()=>{});
  }

  // Start feedback loop after 8s
  setTimeout(() => {
    closeBatch();
    showNextFeedback();
  }, 8000);
}

function closeBatch() {
  document.getElementById('modal-batch').style.display = 'none';
}

/* ── Feedback Loop ── */
function showNextFeedback() {
  if (!_feedbackQueue.length) {
    maybeShowInsights();
    return;
  }
  _feedbackCurrent = _feedbackQueue.shift();
  const modal = document.getElementById('modal-feedback');
  document.getElementById('feedback-title').textContent = 'Did they reply?';
  document.getElementById('feedback-lead-name').textContent =
    `u/${_feedbackCurrent.author} — "${_feedbackCurrent.title}…" via ${_feedbackCurrent.channel}`;
  const qCount = _feedbackQueue.length;
  document.getElementById('feedback-queue-count').textContent =
    qCount ? `${qCount} more to check after this` : 'Last one';
  modal.style.display = 'block';
}

function logFeedback(outcome) {
  if (!_feedbackCurrent) return;

  // Persist feedback to localStorage for pattern analysis
  const history = JSON.parse(localStorage.getItem('ts_feedback') || '[]');
  history.push({
    ts:      Date.now(),
    channel: _feedbackCurrent.channel,
    outcome,
    niche:   _feedbackCurrent.title
  });
  // Keep last 100
  if (history.length > 100) history.splice(0, history.length - 100);
  localStorage.setItem('ts_feedback', JSON.stringify(history));

  dismissFeedback();
  if (_feedbackQueue.length) {
    setTimeout(showNextFeedback, 600);
  } else {
    maybeShowInsights();
  }
}

function dismissFeedback() {
  document.getElementById('modal-feedback').style.display = 'none';
  _feedbackCurrent = null;
}

function maybeShowInsights() {
  const history = JSON.parse(localStorage.getItem('ts_feedback') || '[]');
  if (history.length < 5) return; // need at least 5 data points

  // Channel breakdown
  const channels = {};
  history.forEach(h => {
    if (!channels[h.channel]) channels[h.channel] = { replied:0, total:0 };
    channels[h.channel].total++;
    if (h.outcome === 'replied') channels[h.channel].replied++;
  });

  const best = Object.entries(channels)
    .map(([ch, d]) => ({ ch, rate: d.total ? Math.round(d.replied/d.total*100) : 0, total: d.total }))
    .filter(x => x.total >= 2)
    .sort((a,b) => b.rate - a.rate)[0];

  if (best) {
    toast(`Insight: ${best.ch} has ${best.rate}% reply rate (${best.total} sends) — keep using it`, 'ok');
    // Update persona channel preference
    const p = loadPersona();
    p.bestChannel = best.ch;
    savePersonaData(p);
  }
}

/* ── Send SMS (Twilio) ── */
function showSendSms(outreachId) {
  const to = prompt('Mobile number (e.g. 07700900000 or +447700900000):');
  if (!to) return;
  sendSms(outreachId, to);
}

async function sendSms(outreachId, to) {
  toast('Sending SMS...', 'ok');
  try {
    const queue = (await (await fetch(API + '/outreach')).json()).queue || [];
    const item  = queue.find(q => q.id === outreachId);
    if (!item) { toast('Message not found', 'err'); return; }
    const res  = await fetch(API + '/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message: item.message, outreach_id: outreachId })
    });
    const data = await res.json();
    if (data.ok) { toast('SMS sent!', 'ok'); loadOutreach(); }
    else toast(data.error || 'SMS failed — check Twilio config', 'err');
  } catch { toast('SMS send failed', 'err'); }
}

/* ══════════════════════════════════
   FIRST RUN
══════════════════════════════════ */
function firstRunComplete() {
  const name  = (document.getElementById('fr-name')?.value  || '').trim();
  const offer = (document.getElementById('fr-offer')?.value || '').trim();
  if (!name && !offer) { toast('Fill in at least one field', 'err'); return; }

  // Save to persona
  const p = loadPersona();
  if (name)  p.name  = name;
  if (offer) p.offer = offer;
  if (!p.tone) p.tone = 'professional';
  savePersonaData(p);

  // Hide first-run
  const fr = document.getElementById('first-run');
  if (fr) fr.style.display = 'none';

  // Switch to Lead Feed and auto-scan
  navItems.forEach(n => n.classList.remove('active'));
  panels.forEach(p => p.classList.remove('active'));
  const feedNav = document.querySelector('[data-panel="feed"]');
  if (feedNav) feedNav.classList.add('active');
  const feedPanel = document.getElementById('panel-feed');
  if (feedPanel) feedPanel.classList.add('active');
  topbarTitle.textContent = 'Lead Feed';

  toast('Welcome ' + (name || 'Operator') + ' — scanning for leads…', 'ok');
  setTimeout(() => fetchFeed('need clients'), 400);
}

// Enter key submits first-run form
document.addEventListener('DOMContentLoaded', () => {
  ['fr-name','fr-offer'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') firstRunComplete();
    });
  });
});

/* ══════════════════════════════════
   WORKFLOW PANEL
══════════════════════════════════ */
function goPanel(name) {
  navItems.forEach(n => n.classList.remove('active'));
  panels.forEach(p => p.classList.remove('active'));
  const nav = document.querySelector(`[data-panel="${name}"]`);
  const panel = document.getElementById('panel-' + name);
  if (nav) nav.classList.add('active');
  if (panel) panel.classList.add('active');
  topbarTitle.textContent = TITLES[name] || name;
  if (name === 'crm') loadLeads();
  if (name === 'outreach') loadOutreach();
  if (name === 'settings') initSettingsPanel();
  if (name === 'workflow') initWorkflowPanel();
  if (name === 'followups') initFollowUpsPanel();
  if (name === 'explorer') initExplorerPanel();
  if (name === 'revenue') initRevenuePanel();
}

function goScan(keyword) {
  goPanel('feed');
  // Sync the active keyword + reflect in custom-kw input + highlight matching pill
  activeFeedKw = keyword;
  const input = document.getElementById('feed-custom-kw');
  if (input) input.value = keyword;
  document.querySelectorAll('.kw-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.kw === keyword);
  });
  setTimeout(() => {
    if (activeFeedPlatform === 'twitter') fetchFeedX(keyword);
    else if (activeFeedPlatform === 'linkedin') fetchFeedLinkedIn(keyword);
    else fetchFeed(keyword);
  }, 200);
}

function goRunBatch() {
  goPanel('feed');
  setTimeout(() => runBatch(), 300);
}

async function loadWorkflowStats() {
  try {
    const [outreach, leads] = await Promise.all([
      fetch(API + '/outreach').then(r => r.json()),
      fetch(API + '/leads').then(r => r.json())
    ]);
    const queue      = outreach.queue || [];
    const allLeads   = leads.leads   || [];
    const midnightTs = new Date().setHours(0, 0, 0, 0);
    const todayIso   = new Date().toISOString().slice(0, 10);
    // API returns camelCase createdAt (ISO string) — fall back to created_at just in case
    const todaySent  = queue.filter(q => {
      const ts = q.createdAt || q.created_at || '';
      return typeof ts === 'string' && ts.startsWith(todayIso);
    }).length;
    const todayLeads = Object.keys(feedPostCache).length;
    // Feedback ts is stored as Date.now() (number) — compare against midnight epoch
    const replied    = JSON.parse(localStorage.getItem('ts_feedback') || '[]')
      .filter(f => f.outcome === 'replied' && Number(f.ts) >= midnightTs).length;
    const pipeline   = allLeads.filter(l => l.status === 'qualified' || l.status === 'contacted').length;
    document.getElementById('wf-n-scanned').textContent  = todayLeads || '—';
    document.getElementById('wf-n-sent').textContent     = todaySent  || '—';
    document.getElementById('wf-n-replied').textContent  = replied    || '—';
    document.getElementById('wf-n-pipeline').textContent = pipeline   || '—';
  } catch { /* stats unavailable */ }
}

function updateSetupChecklist() {
  const p = loadPersona();
  let done = 0;
  function check(id, condition) {
    const el = document.getElementById(id);
    if (!el) return;
    const icon = el.querySelector('.wf-check-icon');
    if (condition) {
      el.classList.add('done');
      if (icon) { icon.className = 'wf-check-icon complete'; icon.innerHTML = '<i class="fas fa-check"></i>'; }
      done++;
    } else {
      el.classList.remove('done');
      if (icon) { icon.className = 'wf-check-icon pending'; icon.innerHTML = icon.innerHTML; }
    }
  }
  check('wfc-persona', !!(p.name && p.offer));
  check('wfc-claude',  !!_apiStatus.claude);
  check('wfc-stripe',  !!_apiStatus.stripe);
  check('wfc-deploy',  !!localStorage.getItem('ts_deployed'));
  const badge = document.getElementById('wf-setup-badge');
  if (badge) badge.textContent = `${done} / 4`;
}

function showDeploySteps() {
  const box = document.getElementById('wf-deploy-steps');
  const btn = document.getElementById('wfc-deploy-btn');
  if (!box) return;
  const visible = box.style.display !== 'none';
  box.style.display = visible ? 'none' : 'flex';
  if (btn) btn.textContent = visible ? 'How to' : 'Hide';
}

function markDeployed() {
  localStorage.setItem('ts_deployed', '1');
  const box = document.getElementById('wf-deploy-steps');
  if (box) box.style.display = 'none';
  updateSetupChecklist();
  toast('Deployed! Share your Railway URL with leads.', 'ok');
}

async function initWorkflowPanel() {
  // Refresh API status so setup checklist is accurate, then paint
  if (!_apiStatus || !Object.keys(_apiStatus).length) {
    try { await checkApiStatus(); } catch {}
  }
  loadWorkflowStats();
  updateSetupChecklist();
}

/* ══════════════════════════════════
   FOLLOW-UPS · 48hr ENGINE
══════════════════════════════════ */
let _fuThresholdHrs = 48;
let _fuQueueCache   = [];  // last loaded queue
let _fuBinding      = false;

function _fuFormatAge(ms) {
  const m = Math.floor(ms / 60000);
  if (m < 60)   return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24)   return h + 'h ago';
  const d = Math.floor(h / 24);
  return d + 'd ago';
}

function _fuAgeClass(ms) {
  const h = ms / 3600000;
  if (h < 24) return '';
  if (h < 72) return 'urgent';
  return 'cold';
}

function _fuChannelFromLabel(label) {
  const l = (label || '').toLowerCase();
  if (l.includes('email')) return 'email';
  if (l.includes('sms'))   return 'sms';
  return 'copy';  // reddit / manual
}

function _fuBindOnce() {
  if (_fuBinding) return;
  _fuBinding = true;
  document.querySelectorAll('.fu-thr').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fu-thr').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _fuThresholdHrs = Number(btn.dataset.hrs) || 0;
      renderFollowUps();
    });
  });
  document.getElementById('btn-fu-draft-all')?.addEventListener('click', draftAllFollowUps);
}

async function initFollowUpsPanel() {
  _fuBindOnce();
  const list = document.getElementById('fu-list');
  if (list) list.innerHTML = '<div class="composer-loading"><i class="fas fa-circle-notch"></i> Loading outreach history…</div>';
  try {
    const r = await fetch(API + '/outreach');
    const d = await r.json();
    _fuQueueCache = d.queue || [];
  } catch {
    _fuQueueCache = [];
  }
  renderFollowUps();
}

function _fuBuildCandidates() {
  const now = Date.now();
  const thresholdMs = _fuThresholdHrs * 3600000;

  // Index of original IDs that already have a follow-up
  const followedUpIds = new Set();
  let sentCount = 0;
  for (const q of _fuQueueCache) {
    const label = q.label || '';
    const m = label.match(/Follow-up\s*#(\d+)/i);
    if (m) {
      followedUpIds.add(Number(m[1]));
      if (q.status === 'sent') sentCount++;
    }
  }

  const skipped = new Set(JSON.parse(localStorage.getItem('ts_fu_skipped') || '[]'));

  // Originals = status sent, not itself a follow-up, older than threshold, not already followed up, not skipped
  const candidates = _fuQueueCache.filter(q => {
    if (q.status !== 'sent') return false;
    if ((q.label || '').match(/Follow-up\s*#/i)) return false;
    if (followedUpIds.has(q.id)) return false;
    if (skipped.has(q.id)) return false;
    const created = q.createdAt ? new Date(q.createdAt).getTime() : 0;
    if (!created) return false;
    return (now - created) >= thresholdMs;
  });

  // Newest first
  candidates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { candidates, sentCount };
}

function renderFollowUps() {
  const list = document.getElementById('fu-list');
  if (!list) return;
  const { candidates, sentCount } = _fuBuildCandidates();

  document.getElementById('fu-n-ready').textContent = candidates.length;
  document.getElementById('fu-n-done').textContent  = sentCount;

  if (!candidates.length) {
    list.innerHTML = `
      <div class="fu-empty">
        <i class="fas fa-clock-rotate-left"></i>
        <p>Nothing to follow up at this threshold</p>
        <p style="font-size:.72rem;opacity:.6;margin-top:4px">Try "All sent" to see every past send · or fire a new batch first</p>
      </div>`;
    return;
  }

  const now = Date.now();
  list.innerHTML = candidates.map(q => {
    const age       = now - new Date(q.createdAt).getTime();
    const ageClass  = _fuAgeClass(age);
    const ageTxt    = _fuFormatAge(age);
    const channel   = _fuChannelFromLabel(q.label);
    const channelBadge = channel === 'email' ? 'Email' : channel === 'sms' ? 'SMS' : 'Reddit/DM';
    const name      = q.clientName || q.niche || 'Lead';
    const original  = (q.message || '').replace(/</g, '&lt;').substring(0, 280);

    return `
      <div class="fu-card" id="fu-card-${q.id}" data-id="${q.id}" data-channel="${channel}" data-recipient="${q.recipientEmail || ''}">
        <div class="fu-card-hdr">
          <span class="fu-card-name">${name}</span>
          <span class="fu-card-badge">${channelBadge}</span>
          <span class="fu-card-age ${ageClass}"><i class="fas fa-clock"></i> ${ageTxt}</span>
        </div>
        <div class="fu-card-original">
          <div class="fu-card-original-label">Original message</div>
          ${original}${(q.message || '').length > 280 ? '…' : ''}
        </div>
        <div class="fu-draft-wrap" id="fu-draft-${q.id}">
          <textarea class="fu-draft-textarea" id="fu-msg-${q.id}" placeholder="Follow-up nudge will appear here…"></textarea>
          <div class="fu-draft-meta"><span id="fu-src-${q.id}"></span><span id="fu-chars-${q.id}">0 chars</span></div>
        </div>
        <div class="fu-card-actions">
          <button class="fu-btn primary" onclick="draftFollowUp(${q.id})"><i class="fas fa-wand-magic-sparkles"></i> Draft Nudge</button>
          <button class="fu-btn" onclick="sendFollowUp(${q.id})" id="fu-send-${q.id}" style="display:none"><i class="fas fa-paper-plane"></i> Send</button>
          <button class="fu-btn" onclick="skipFollowUp(${q.id})"><i class="fas fa-ban"></i> Skip</button>
        </div>
      </div>`;
  }).join('');
}

function _fuGetCandidate(id) {
  return _fuQueueCache.find(q => q.id === id);
}

async function draftFollowUp(id) {
  const q = _fuGetCandidate(id);
  if (!q) return;
  const draftWrap = document.getElementById('fu-draft-' + id);
  const textarea  = document.getElementById('fu-msg-' + id);
  const sendBtn   = document.getElementById('fu-send-' + id);
  const srcEl     = document.getElementById('fu-src-' + id);
  const charsEl   = document.getElementById('fu-chars-' + id);
  if (!draftWrap || !textarea) return;

  draftWrap.classList.add('visible');
  textarea.value = 'Generating…';
  textarea.disabled = true;
  if (srcEl) srcEl.textContent = '';

  try {
    const channel = _fuChannelFromLabel(q.label);
    const r = await fetch(API + '/generate-followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalMessage: q.message || '',
        leadName:        q.clientName || '',
        niche:           q.niche || '',
        channel,
        persona:         loadPersona()
      })
    });
    const d = await r.json();
    textarea.value = d.message || '';
    if (srcEl) srcEl.textContent = d.source === 'ai' ? 'AI-generated · edit freely' : 'Template · edit to personalise';
  } catch {
    textarea.value = 'Hey — wanted to circle back on this. No pressure if the timing is off. Worth a quick look?';
    if (srcEl) srcEl.textContent = 'Fallback · edit before sending';
  } finally {
    textarea.disabled = false;
    if (charsEl) charsEl.textContent = textarea.value.length + ' chars';
    textarea.addEventListener('input', () => {
      if (charsEl) charsEl.textContent = textarea.value.length + ' chars';
    });
    if (sendBtn) sendBtn.style.display = '';
  }
}

async function draftAllFollowUps() {
  const btn = document.getElementById('btn-fu-draft-all');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Drafting…'; }
  const ids = Array.from(document.querySelectorAll('.fu-card')).map(c => Number(c.dataset.id));
  for (const id of ids) {
    await draftFollowUp(id);
    await new Promise(r => setTimeout(r, 200));
  }
  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Draft All'; }
}

async function sendFollowUp(id) {
  const q = _fuGetCandidate(id);
  if (!q) return;
  const textarea = document.getElementById('fu-msg-' + id);
  const card     = document.getElementById('fu-card-' + id);
  const message  = (textarea?.value || '').trim();
  if (!message) { toast('Draft the message first', 'err'); return; }

  const channel = _fuChannelFromLabel(q.label);

  // For copy/reddit — copy to clipboard + queue record
  if (channel === 'copy') {
    try { await navigator.clipboard.writeText(message); } catch {}
    await _fuQueueRecord(q, message, 'copy');
    if (card) { card.classList.add('sent'); card.insertAdjacentHTML('afterbegin', '<div class="fu-sent-flag"><i class="fas fa-check"></i> Follow-up copied + logged — paste into the original thread</div>'); }
    toast('Follow-up copied to clipboard — paste on Reddit/DM', 'ok');
    renderFollowUps._refresh?.();
    return;
  }

  // Email / SMS need a recipient
  let recipient = q.recipientEmail || '';
  if (channel === 'email' && !recipient) {
    recipient = prompt('Email address for this follow-up:') || '';
    if (!recipient) return;
  }
  if (channel === 'sms' && !recipient) {
    recipient = prompt('Mobile number (e.g. +447700900000):') || '';
    if (!recipient) return;
  }

  try {
    const endpoint = channel === 'email' ? '/send-outreach' : '/send-sms';
    const payload  = channel === 'email'
      ? { to: recipient, subject: 'Re: quick question', message }
      : { to: recipient, message };
    const r = await fetch(API + endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const d = await r.json();
    if (!d.ok) {
      if (d.needsKey || (d.error || '').includes('RESEND'))    { openApiSetup('resend'); return; }
      if ((d.error || '').toLowerCase().includes('twilio'))    { openApiSetup('twilio'); return; }
      toast(d.error || 'Send failed', 'err');
      return;
    }
    await _fuQueueRecord(q, message, channel);
    if (card) { card.classList.add('sent'); card.insertAdjacentHTML('afterbegin', '<div class="fu-sent-flag"><i class="fas fa-check"></i> Follow-up sent via ' + channel + '</div>'); }
    toast('Follow-up sent!', 'ok');
  } catch {
    toast('Send failed — check server', 'err');
  }
}

async function _fuQueueRecord(original, message, channel) {
  try {
    await fetch(API + '/outreach', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: original.clientName || '',
        niche:      original.niche || '',
        label:      'Follow-up #' + original.id + ' — ' + channel,
        message,
        status:     'sent',
        recipient_email: original.recipientEmail || ''
      })
    });
  } catch {}
  // Refresh local cache so this lead drops out of "ready" count
  try {
    const r = await fetch(API + '/outreach');
    const d = await r.json();
    _fuQueueCache = d.queue || [];
    renderFollowUps();
  } catch {}
}

function skipFollowUp(id) {
  const skipped = JSON.parse(localStorage.getItem('ts_fu_skipped') || '[]');
  if (!skipped.includes(id)) skipped.push(id);
  localStorage.setItem('ts_fu_skipped', JSON.stringify(skipped));
  const card = document.getElementById('fu-card-' + id);
  if (card) card.remove();
  const remaining = document.querySelectorAll('.fu-card').length;
  document.getElementById('fu-n-ready').textContent = remaining;
}

/* ══════════════════════════════════
   KEYWORD LAB · EXPLORER
══════════════════════════════════ */
let _kxCombos       = [];
let _kxBinding      = false;

function _kxBindOnce() {
  if (_kxBinding) return;
  _kxBinding = true;
  document.getElementById('btn-kx-generate')?.addEventListener('click', generateCombos);
  document.getElementById('kx-seed')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') generateCombos();
  });
}

function initExplorerPanel() {
  _kxBindOnce();
  const p = loadPersona();
  document.getElementById('kx-p-offer').textContent  = p.offer  || 'Set your offer in Settings';
  document.getElementById('kx-p-market').textContent = p.market || 'Target market not set';
  renderSavedCombos();
}

async function generateCombos() {
  const btn   = document.getElementById('btn-kx-generate');
  const list  = document.getElementById('kx-list');
  const seed  = (document.getElementById('kx-seed')?.value || '').trim();
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Generating…'; }
  if (list) list.innerHTML = '<div class="kx-loading"><i class="fas fa-circle-notch"></i> Claude is mapping fresh subreddit combos for your offer…</div>';

  try {
    const r = await fetch(API + '/explore-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona: loadPersona(), seed })
    });
    const d = await r.json();
    _kxCombos = d.combos || [];
    if (!_kxCombos.length) {
      list.innerHTML = '<div class="kx-empty"><i class="fas fa-triangle-exclamation"></i><p>No combos generated — try a more specific seed</p></div>';
      return;
    }
    renderCombos(d.source);
    toast(`${_kxCombos.length} ${d.source === 'ai' ? 'AI-tailored' : 'template'} combos ready`, 'ok');
  } catch {
    list.innerHTML = '<div class="kx-empty"><i class="fas fa-plug-circle-xmark"></i><p>Couldn\'t reach the server</p></div>';
    toast('Keyword generation failed', 'err');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate 15'; }
  }
}

function renderCombos(source) {
  const list = document.getElementById('kx-list');
  if (!list) return;
  list.innerHTML = _kxCombos.map((c, i) => {
    const kw  = (c.keyword || '').replace(/</g, '&lt;');
    const sub = (c.subreddit || '').replace(/</g, '&lt;');
    const why = (c.reason || '').replace(/</g, '&lt;');
    return `
      <div class="kx-card">
        <div class="kx-card-sub">${sub}</div>
        <div class="kx-card-kw">${kw}</div>
        <div class="kx-card-why">${why}</div>
        <div class="kx-card-actions">
          <button class="kx-btn primary" onclick="scanCombo(${i})"><i class="fas fa-satellite-dish"></i> Scan Now</button>
          <button class="kx-btn" onclick="saveCombo(${i})" title="Save"><i class="fas fa-bookmark"></i></button>
        </div>
      </div>`;
  }).join('');
}

function scanCombo(i) {
  const c = _kxCombos[i];
  if (!c) return;
  goPanel('feed');
  activeFeedKw = c.keyword;
  const input = document.getElementById('feed-custom-kw');
  if (input) input.value = c.keyword;
  document.querySelectorAll('.kw-btn').forEach(b => b.classList.remove('active'));
  // If the combo's subreddit is a Reddit target, let fetchFeed handle the sub whitelist
  setTimeout(() => fetchFeed(c.keyword), 150);
  toast(`Scanning r/${c.subreddit} for "${c.keyword}"`, 'ok');
}

function saveCombo(i) {
  const c = _kxCombos[i];
  if (!c) return;
  const saved = JSON.parse(localStorage.getItem('ts_saved_combos') || '[]');
  if (saved.some(s => s.keyword === c.keyword && s.subreddit === c.subreddit)) {
    toast('Already saved', 'err');
    return;
  }
  saved.push({ keyword: c.keyword, subreddit: c.subreddit, reason: c.reason });
  localStorage.setItem('ts_saved_combos', JSON.stringify(saved));
  renderSavedCombos();
  toast('Saved — shortcut added', 'ok');
}

function renderSavedCombos() {
  const wrap = document.getElementById('kx-saved-wrap');
  const box  = document.getElementById('kx-saved');
  if (!wrap || !box) return;
  const saved = JSON.parse(localStorage.getItem('ts_saved_combos') || '[]');
  if (!saved.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  box.innerHTML = saved.map((s, i) => {
    const kw  = (s.keyword   || '').replace(/</g, '&lt;');
    const sub = (s.subreddit || '').replace(/</g, '&lt;');
    return `
      <span class="kx-saved-pill" onclick="scanSavedCombo(${i})" title="r/${sub} · ${s.reason || ''}">
        <i class="fas fa-play" style="font-size:.6rem;color:var(--accent)"></i>
        ${kw}
        <span class="kx-pill-x" onclick="event.stopPropagation();removeSavedCombo(${i})"><i class="fas fa-times"></i></span>
      </span>`;
  }).join('');
}

function scanSavedCombo(i) {
  const saved = JSON.parse(localStorage.getItem('ts_saved_combos') || '[]');
  const c = saved[i];
  if (!c) return;
  goPanel('feed');
  activeFeedKw = c.keyword;
  const input = document.getElementById('feed-custom-kw');
  if (input) input.value = c.keyword;
  document.querySelectorAll('.kw-btn').forEach(b => b.classList.remove('active'));
  setTimeout(() => fetchFeed(c.keyword), 150);
}

function removeSavedCombo(i) {
  const saved = JSON.parse(localStorage.getItem('ts_saved_combos') || '[]');
  saved.splice(i, 1);
  localStorage.setItem('ts_saved_combos', JSON.stringify(saved));
  renderSavedCombos();
}

/* ══════════════════════════════════
   REVENUE DASHBOARD
══════════════════════════════════ */
let _revBinding = false;
let _revData    = null;  // last /api/revenue response
let _revLeads   = [];    // leads cache for pipeline breakdown

function _revCurrency(cur) {
  const c = (cur || 'gbp').toLowerCase();
  return c === 'gbp' ? '£' : c === 'eur' ? '€' : c === 'usd' ? '$' : (cur + ' ');
}
function _revFmt(amountMinor, cur) {
  const sym = _revCurrency(cur);
  const n = (amountMinor || 0) / 100;
  return sym + n.toLocaleString('en-GB', { maximumFractionDigits: n >= 1000 ? 0 : 2 });
}
function _revFmtPounds(pounds, cur) {
  const sym = _revCurrency(cur);
  return sym + Number(pounds || 0).toLocaleString('en-GB', { maximumFractionDigits: 0 });
}
function _revTimeAgo(ts) {
  const d = Date.now() - ts * 1000;
  const h = Math.floor(d / 3600000);
  if (h < 1)  return Math.max(1, Math.floor(d / 60000)) + 'm ago';
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

function _revBindOnce() {
  if (_revBinding) return;
  _revBinding = true;
  document.getElementById('btn-rev-log-win')?.addEventListener('click', openLogWin);
  const goalInput = document.getElementById('rev-goal-input');
  const perInput  = document.getElementById('rev-per-client');
  goalInput?.addEventListener('input', () => {
    localStorage.setItem('ts_weekly_goal', goalInput.value);
    updateRevenueProgress();
  });
  perInput?.addEventListener('input', () => {
    localStorage.setItem('ts_per_client_value', perInput.value);
    renderPipelineBreakdown();
    updateRevenueProgress();
  });
}

async function initRevenuePanel() {
  _revBindOnce();

  // Restore settings
  const goalInput = document.getElementById('rev-goal-input');
  const perInput  = document.getElementById('rev-per-client');
  if (goalInput) goalInput.value = localStorage.getItem('ts_weekly_goal') || '500';
  if (perInput)  perInput.value  = localStorage.getItem('ts_per_client_value') || '500';

  // Parallel: Stripe revenue + leads for pipeline
  try {
    const [revR, leadsR] = await Promise.all([
      fetch(API + '/revenue').then(r => r.json()),
      fetch(API + '/leads').then(r => r.json())
    ]);
    _revData  = revR;
    _revLeads = leadsR.leads || [];
  } catch {
    _revData  = { ok: false, hasStripe: false, mrr: 0, activeSubs: 0, last30dGross: 0, currency: 'gbp', recent: [] };
    _revLeads = [];
  }

  renderRevenueStats();
  renderPipelineBreakdown();
  renderRevenueFeed();
  updateRevenueProgress();
}

function renderRevenueStats() {
  const d = _revData || {};
  const cur = d.currency || 'gbp';
  document.getElementById('rev-mrr').textContent  = d.hasStripe ? _revFmt(d.mrr, cur)           : '—';
  document.getElementById('rev-30d').textContent  = d.hasStripe ? _revFmt(d.last30dGross, cur)  : '—';
  document.getElementById('rev-subs').textContent = d.hasStripe ? String(d.activeSubs || 0)     : '—';

  const note = document.getElementById('rev-mrr-note');
  if (note) note.textContent = d.hasStripe
    ? (d.warning ? 'Stripe warning: ' + d.warning : 'Live from Stripe')
    : 'Click API Keys → add Stripe to unlock';
}

function renderPipelineBreakdown() {
  const list = document.getElementById('rev-pipe-list');
  const perClient = Number(localStorage.getItem('ts_per_client_value') || 500);
  const leads = _revLeads || [];
  if (!leads.length) {
    if (list) list.innerHTML = '<div class="rev-pipe-empty">No leads yet — scan the feed and import some</div>';
    document.getElementById('rev-pipeline').textContent = '—';
    return;
  }
  // Count by status — active pipeline = new + contacted + qualified; won = closed
  const buckets = { new: 0, contacted: 0, qualified: 0, closed: 0 };
  for (const l of leads) {
    const s = (l.status || 'new').toLowerCase();
    if (buckets[s] !== undefined) buckets[s]++;
    else buckets.new++;
  }

  const pipelineValue = (buckets.new + buckets.contacted + buckets.qualified) * perClient;
  const wonValue      = buckets.closed * perClient;
  const cur = _revData?.currency || 'gbp';
  document.getElementById('rev-pipeline').textContent = _revFmtPounds(pipelineValue, cur);
  document.getElementById('rev-pipe-note').textContent = buckets.closed ? `+ ${_revFmtPounds(wonValue, cur)} closed` : '';

  const rows = [
    { status: 'new',       count: buckets.new,       val: buckets.new * perClient,       label: 'Cold / new' },
    { status: 'contacted', count: buckets.contacted, val: buckets.contacted * perClient, label: 'In conversation' },
    { status: 'qualified', count: buckets.qualified, val: buckets.qualified * perClient, label: 'Qualified' },
    { status: 'closed',    count: buckets.closed,    val: buckets.closed * perClient,    label: 'Closed / won' }
  ];
  if (list) list.innerHTML = rows.map(r => `
    <div class="rev-pipe-row">
      <span class="rev-pipe-status ${r.status}">${r.status}</span>
      <span>${r.label}</span>
      <span class="rev-pipe-count">${r.count} lead${r.count === 1 ? '' : 's'}</span>
      <span class="rev-pipe-val">${_revFmtPounds(r.val, cur)}</span>
    </div>
  `).join('');
}

function renderRevenueFeed() {
  const feed = document.getElementById('rev-feed');
  if (!feed) return;
  const wins = JSON.parse(localStorage.getItem('ts_wins') || '[]');
  const stripeItems = (_revData?.recent || []).map(c => ({
    source: 'stripe',
    amount: c.amount,
    cur:    c.currency,
    ts:     c.created * 1000,
    title:  c.description || 'Stripe payment',
    sub:    c.customer_email || ''
  }));
  const winItems = wins.map((w, i) => ({
    source: 'manual',
    amount: Math.round(Number(w.amount || 0) * 100),
    cur:    w.currency || 'gbp',
    ts:     w.ts || Date.now(),
    title:  w.source || 'Logged win',
    sub:    (w.type || '') + ' · manually logged',
    idx:    i
  }));
  const all = [...stripeItems, ...winItems].sort((a, b) => b.ts - a.ts);

  if (!all.length) {
    feed.innerHTML = `
      <div class="rev-feed-empty">
        <i class="fas fa-sack-dollar"></i>
        <p>No revenue activity yet</p>
        <p style="font-size:.72rem;opacity:.6;margin-top:4px">Connect Stripe to show live payments · or log wins manually</p>
      </div>`;
    return;
  }

  feed.innerHTML = all.map(x => {
    const safeTitle = String(x.title).replace(/</g, '&lt;');
    const safeSub   = String(x.sub).replace(/</g, '&lt;');
    const delBtn    = x.source === 'manual' ? `<span class="rev-feed-del" onclick="removeWin(${x.idx})" title="Remove"><i class="fas fa-times"></i></span>` : '';
    return `
      <div class="rev-feed-row ${x.source}">
        <div class="rev-feed-icon ${x.source === 'manual' ? 'win' : 'stripe'}">
          <i class="fas ${x.source === 'manual' ? 'fa-trophy' : 'fa-credit-card'}"></i>
        </div>
        <div class="rev-feed-body">
          <div class="rev-feed-main">${safeTitle}</div>
          <div class="rev-feed-sub">${safeSub || _revTimeAgo(x.ts / 1000)}${safeSub ? ' · ' + _revTimeAgo(x.ts / 1000) : ''}</div>
        </div>
        <div class="rev-feed-amt">${_revFmt(x.amount, x.cur)}</div>
        ${delBtn}
      </div>`;
  }).join('');
}

function updateRevenueProgress() {
  const goal = Number(localStorage.getItem('ts_weekly_goal') || 500);
  const cur  = _revData?.currency || 'gbp';

  // Count earnings this week: Stripe last-30d proportion + manually logged wins in last 7 days
  const weekAgo = Date.now() - 7 * 86400000;
  const wins    = JSON.parse(localStorage.getItem('ts_wins') || '[]');
  const winEarned = wins
    .filter(w => (w.ts || 0) >= weekAgo)
    .reduce((s, w) => s + Number(w.amount || 0), 0);

  // Stripe weekly ~ 30d / 30 * 7 (rough)
  const stripeWeekApprox = _revData?.hasStripe
    ? Math.round(((_revData.last30dGross || 0) / 100) * (7 / 30))
    : 0;

  const earned = winEarned + stripeWeekApprox;
  const pct    = Math.min(100, Math.round(earned / Math.max(1, goal) * 100));

  document.getElementById('rev-progress-fill').style.width = pct + '%';
  document.getElementById('rev-progress-now').textContent  = _revFmtPounds(earned, cur);
  document.getElementById('rev-progress-goal').textContent = _revFmtPounds(goal, cur);

  const hint = document.getElementById('rev-goal-hint');
  if (hint) {
    if (pct >= 100) hint.textContent = 'Goal smashed. Raise the bar next week.';
    else if (pct >= 75) hint.textContent = `Almost there — ${_revFmtPounds(goal - earned, cur)} to go`;
    else if (pct >= 25) hint.textContent = `${pct}% of target · keep firing the batch`;
    else if (earned > 0) hint.textContent = 'First win logged. Momentum.';
    else hint.textContent = 'Set a target, log wins below, watch it fill';
  }
}

/* ── Log-a-win modal ── */
function openLogWin() {
  document.getElementById('rev-modal-win').style.display = 'flex';
  document.getElementById('win-amount').focus();
}
function closeLogWin() {
  document.getElementById('rev-modal-win').style.display = 'none';
  document.getElementById('win-amount').value = '';
  document.getElementById('win-source').value = '';
}
function saveLogWin() {
  const amount = Number(document.getElementById('win-amount').value);
  const source = document.getElementById('win-source').value.trim();
  const type   = document.getElementById('win-type').value;
  if (!amount || amount <= 0) { toast('Enter an amount', 'err'); return; }
  const wins = JSON.parse(localStorage.getItem('ts_wins') || '[]');
  wins.push({ amount, source: source || 'Untitled win', type, ts: Date.now(), currency: 'gbp' });
  localStorage.setItem('ts_wins', JSON.stringify(wins));
  closeLogWin();
  renderRevenueFeed();
  updateRevenueProgress();
  toast('Win logged — you\'re on the board', 'ok');
}
function removeWin(i) {
  const wins = JSON.parse(localStorage.getItem('ts_wins') || '[]');
  wins.splice(i, 1);
  localStorage.setItem('ts_wins', JSON.stringify(wins));
  renderRevenueFeed();
  updateRevenueProgress();
}

/* ══════════════════════════════════
   GUIDED TOUR ENGINE
══════════════════════════════════ */
const TOUR_STEPS = [
  {
    id: 'welcome',
    panel: 'workflow',
    target: null,
    title: 'Welcome to your client-acquisition engine',
    body: "I'll walk you through the full flow — persona → leads → fire → follow-up → revenue. 90 seconds. You can skip anytime.",
    cta: "Let's go"
  },
  {
    id: 'workflow',
    panel: 'workflow',
    target: '.wf-steps',
    title: 'Step 0 · Your daily mission',
    body: "This panel is your command centre. Five steps a day = consistent bookings. We'll hit every one together now.",
    cta: 'Next'
  },
  {
    id: 'persona',
    panel: 'settings',
    target: '#p-name',
    title: 'Step 1 · Set your persona',
    body: 'The AI writes every message as <b>you</b>. Drop your name, offer, and target market — then hit <code>Save</code>. Do it now, I\'ll wait.',
    cta: 'Saved — next'
  },
  {
    id: 'api',
    panel: 'settings',
    target: '#api-keys-grid',
    title: 'Step 2 · Add a Claude AI key (optional)',
    body: "Works without a key (uses templates), but Claude makes messages 3× more human. <code>Free $5 credit</code> at console.anthropic.com. Paste the key here.",
    cta: "Got it"
  },
  {
    id: 'explorer',
    panel: 'explorer',
    target: '#btn-kx-generate',
    title: 'Step 3 · Generate fresh targets',
    body: 'Hit <code>Generate 15</code> — Claude builds subreddit + keyword combos matched to your offer. Click any card\'s <b>Scan Now</b> to pull live leads.',
    cta: 'Next'
  },
  {
    id: 'feed',
    panel: 'feed',
    target: '#btn-feed-refresh',
    title: 'Step 4 · Scan the lead feed',
    body: "Reddit scanning is free and needs no key. You'll get ranked posts — high-urgency complaints about no clients / dead months. The real gold.",
    cta: 'Next'
  },
  {
    id: 'batch',
    panel: 'feed',
    target: '#btn-run-batch',
    title: 'Step 5 · Auto-compose top 5',
    body: "<code>Run Batch</code> scores every lead, picks the 5 highest-intent, and writes a personalised message for each in your voice. Review, edit, fire.",
    cta: 'Next'
  },
  {
    id: 'followups',
    panel: 'followups',
    target: '.fu-threshold-row',
    title: 'Step 6 · 48-hour follow-up engine',
    body: "Silent leads convert 20–30% on a second nudge. This panel auto-surfaces every sent message that needs one — AI drafts a fresh angle, you review and fire.",
    cta: 'Next'
  },
  {
    id: 'crm',
    panel: 'crm',
    target: null,
    title: 'Step 7 · Move them through the pipeline',
    body: "Every reply lands here. Drag leads through New → Contacted → Qualified → Closed. One booked call = £49–£500+ depending on your offer.",
    cta: 'Next'
  },
  {
    id: 'revenue',
    panel: 'revenue',
    target: '.rev-stats',
    title: 'Step 8 · Watch the money stack',
    body: "Live Stripe MRR, pipeline value, weekly goal bar. <code>Log a win</code> every time you close — momentum compounds fast.",
    cta: 'Next'
  },
  {
    id: 'finish',
    panel: 'workflow',
    target: null,
    title: "You're trained. Go make money.",
    body: "Your daily routine: Workflow tab → Scan → Batch → Fire → Follow-ups at 48h. Rinse, scale. Hit the <b>?</b> icon top-right to replay this tour anytime.",
    cta: 'Start my first scan'
  }
];

let _tourIdx = 0;
let _tourActive = false;
let _tourResizeBound = false;

function _tourEl(sel) { return sel ? document.querySelector(sel) : null; }

function _tourRemoveChrome() {
  document.querySelectorAll('.tour-backdrop,.tour-spotlight,.tour-tooltip').forEach(n => n.remove());
}

function _tourPlaceSpotlight(target) {
  const rect = target.getBoundingClientRect();
  const pad = 8;
  const sp = document.createElement('div');
  sp.className = 'tour-spotlight';
  sp.style.top    = (rect.top  - pad) + 'px';
  sp.style.left   = (rect.left - pad) + 'px';
  sp.style.width  = (rect.width  + pad * 2) + 'px';
  sp.style.height = (rect.height + pad * 2) + 'px';
  document.body.appendChild(sp);
  return sp;
}

function _tourPlaceTooltip(target, step) {
  const total = TOUR_STEPS.length;
  const tip = document.createElement('div');
  tip.className = 'tour-tooltip' + (target ? '' : ' centred');

  const dots = TOUR_STEPS.map((_, i) =>
    `<span class="tour-dot ${i === _tourIdx ? 'active' : i < _tourIdx ? 'done' : ''}"></span>`
  ).join('');

  tip.innerHTML = `
    <div class="tour-step-badge">
      <span>Guided Tour</span>
      <span class="tour-count">${_tourIdx + 1} / ${total}</span>
    </div>
    <div class="tour-tip-title">${step.title}</div>
    <div class="tour-tip-body">${step.body}</div>
    <div class="tour-dots">${dots}</div>
    <div class="tour-ftr">
      <button class="tour-skip" onclick="endTour()">Skip tour</button>
      <div class="tour-navs">
        ${_tourIdx > 0 ? '<button class="tour-btn" onclick="prevTourStep()"><i class=\"fas fa-arrow-left\"></i> Back</button>' : ''}
        <button class="tour-btn primary" onclick="nextTourStep()">${step.cta || 'Next'} ${_tourIdx < total - 1 ? '<i class=\"fas fa-arrow-right\"></i>' : '<i class=\"fas fa-check\"></i>'}</button>
      </div>
    </div>`;
  document.body.appendChild(tip);

  if (!target) return tip;

  // Position: below the target if space, otherwise above; clamp to viewport
  const rect = target.getBoundingClientRect();
  const tipW = tip.offsetWidth  || 360;
  const tipH = tip.offsetHeight || 240;
  const vpW  = window.innerWidth;
  const vpH  = window.innerHeight;
  const gap  = 16;

  let left = rect.left + rect.width / 2 - tipW / 2;
  left = Math.max(16, Math.min(left, vpW - tipW - 16));

  let top = rect.bottom + gap;
  if (top + tipH > vpH - 16) {
    top = rect.top - tipH - gap;
    if (top < 16) top = Math.max(16, Math.min(vpH - tipH - 16, (vpH - tipH) / 2));
  }
  tip.style.top  = top  + 'px';
  tip.style.left = left + 'px';
  tip.style.transform = 'none';
  return tip;
}

function _tourRender() {
  const step = TOUR_STEPS[_tourIdx];
  if (!step) return endTour();

  _tourRemoveChrome();

  // Navigate to the right panel
  if (step.panel) {
    const nav = document.querySelector(`.nav-item[data-panel="${step.panel}"]`);
    if (nav && !nav.classList.contains('active')) nav.click();
  }

  // Give the panel a tick to render, then place the chrome
  setTimeout(() => {
    const backdrop = document.createElement('div');
    backdrop.className = 'tour-backdrop';
    backdrop.addEventListener('click', () => { /* ignore — force use of buttons */ });
    document.body.appendChild(backdrop);

    const target = _tourEl(step.target);
    if (target) {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setTimeout(() => {
        _tourPlaceSpotlight(target);
        _tourPlaceTooltip(target, step);
      }, 280);
    } else {
      _tourPlaceTooltip(null, step);
    }
  }, step.panel ? 220 : 0);
}

function startTour(force) {
  if (!force && localStorage.getItem('ts_tour_done') === '1') return;
  _tourIdx = 0;
  _tourActive = true;
  localStorage.setItem('ts_tour_active', '1');
  if (!_tourResizeBound) {
    _tourResizeBound = true;
    window.addEventListener('resize', () => { if (_tourActive) _tourRender(); });
  }
  _tourRender();
}

function nextTourStep() {
  if (_tourIdx >= TOUR_STEPS.length - 1) {
    endTour(true);
    // After finish, send them to Lead Feed for a real scan
    goPanel('feed');
    setTimeout(() => { activeFeedKw = 'need clients'; fetchFeed('need clients'); }, 200);
    return;
  }
  _tourIdx++;
  _tourRender();
}

function prevTourStep() {
  if (_tourIdx <= 0) return;
  _tourIdx--;
  _tourRender();
}

function endTour(completed) {
  _tourActive = false;
  _tourRemoveChrome();
  localStorage.removeItem('ts_tour_active');
  if (completed) localStorage.setItem('ts_tour_done', '1');
  else if (confirm('Skip the tour? You can restart it anytime from the ? icon top-right.')) {
    localStorage.setItem('ts_tour_done', '1');
  }
}

// Auto-start the tour after first-run completes (wrap existing firstRunComplete)
const _tourOrigFirstRun = typeof firstRunComplete === 'function' ? firstRunComplete : null;
if (_tourOrigFirstRun) {
  window.firstRunComplete = function () {
    _tourOrigFirstRun();
    setTimeout(() => startTour(true), 800);
  };
}

// If not a first-run but tour hasn't been seen, nudge on next paint
window.addEventListener('load', () => {
  const hasPersona = !!(loadPersona().name || loadPersona().offer);
  const seen       = localStorage.getItem('ts_tour_done') === '1';
  if (hasPersona && !seen) {
    setTimeout(() => startTour(false), 600);
  }
});

/* ── INIT ── */
loadClients();
checkApiStatus();

// Show first-run if no persona saved yet
(function checkFirstRun() {
  const p  = loadPersona();
  const fr = document.getElementById('first-run');
  if (!fr) return;
  if (!p.name && !p.offer) {
    fr.style.display = 'flex';
  }
})();
