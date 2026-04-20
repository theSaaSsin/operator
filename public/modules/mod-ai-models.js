({
  init() {},

  async render(container) {
    // ── Load persisted state ──────────────────────────────────────────────────
    const DEFAULT_AGENT_MODELS = {
      scout:      'groq/llama-3.1-8b-instant',
      copywriter: 'groq/llama-3.3-70b-versatile',
      analyst:    'groq/llama-3.3-70b-versatile',
      builder:    'glm/glm-4-flash',
      coach:      'groq/llama-3.3-70b-versatile',
    };
    const DEFAULT_TOGGLES = {
      groq:        true,
      glm:         true,
      openrouter:  true,
      cerebras:    true,
      kimi:        false,
      minimax:     false,
      anthropic:   true,
      ollama:      false,
    };
    const DEFAULT_BUDGET = 10000;

    let agentModels = DEFAULT_AGENT_MODELS;
    let providerToggles = DEFAULT_TOGGLES;
    let dailyBudget = DEFAULT_BUDGET;
    let tokensUsed = 0;

    try { agentModels    = JSON.parse(localStorage.getItem('boss_agent_models')  || 'null') || DEFAULT_AGENT_MODELS; } catch {}
    try { providerToggles = JSON.parse(localStorage.getItem('boss_prov_toggles') || 'null') || DEFAULT_TOGGLES; } catch {}
    try { dailyBudget    = parseInt(localStorage.getItem('boss_daily_budget'))   || DEFAULT_BUDGET; } catch {}

    // ── Fetch token usage + router status ─────────────────────────────────────
    let routerStatus = {};
    try {
      const r = await fetch('/api/boss/router', { signal: AbortSignal.timeout(3000) });
      if (r.ok) routerStatus = await r.json();
    } catch {}
    try {
      const r = await fetch('/api/boss/token-usage', { signal: AbortSignal.timeout(3000) });
      if (r.ok) { const d = await r.json(); tokensUsed = d.today || d.tokensUsed || 0; }
    } catch {}

    // ── Helpers ───────────────────────────────────────────────────────────────
    const MODEL_OPTIONS = [
      { value: 'groq/llama-3.1-8b-instant',                          label: '⚡ Fast & Free',       tag: 'groq/llama-3.1-8b-instant' },
      { value: 'groq/llama-3.3-70b-versatile',                       label: '🧠 Smart & Free',      tag: 'groq/llama-3.3-70b-versatile' },
      { value: 'glm/glm-4-flash',                                     label: '🆓 GLM Free',          tag: 'glm/glm-4-flash' },
      { value: 'openrouter/meta-llama/llama-3.3-70b-instruct:free',   label: '🌐 OpenRouter Free',   tag: 'openrouter/meta-llama/llama-3.3-70b-instruct:free' },
      { value: 'anthropic/claude-haiku-4-5-20251001',                 label: '💎 Claude Haiku',      tag: 'anthropic/claude-haiku-4-5-20251001' },
      { value: 'anthropic/claude-sonnet-4-5',                         label: '👑 Claude Sonnet',     tag: 'anthropic/claude-sonnet-4-5' },
      { value: 'ollama/qwen2.5:7b',                                   label: '🏠 Local Ollama',      tag: 'ollama/qwen2.5:7b' },
    ];

    const AGENTS = [
      { id: 'scout',      icon: '🔍', name: 'Scout',      desc: 'Finds leads, scans markets' },
      { id: 'copywriter', icon: '✍️',  name: 'Copywriter', desc: 'Pitches, emails, DMs' },
      { id: 'analyst',    icon: '📊', name: 'Analyst',    desc: 'Market research, strategy' },
      { id: 'builder',    icon: '🔧', name: 'Builder',    desc: 'Code fixes, module generation' },
      { id: 'coach',      icon: '🎯', name: 'Coach',      desc: 'Next moves, objection handling' },
    ];

    const PROVIDERS = [
      { id: 'groq',       name: 'Groq',             badgeColor: '#22c55e', badgeText: 'FREE',             costPer1k: 0,      latency: '~0.4s' },
      { id: 'glm',        name: 'GLM-4 Flash',       badgeColor: '#22c55e', badgeText: 'FREE FOREVER',     costPer1k: 0,      latency: '~0.8s' },
      { id: 'openrouter', name: 'OpenRouter',         badgeColor: '#f59e0b', badgeText: 'FREE MODELS',      costPer1k: 0,      latency: '~1.2s' },
      { id: 'cerebras',   name: 'Cerebras \u26a1',   badgeColor: '#22c55e', badgeText: '2000+ tok/s free', costPer1k: 0,      latency: '~0.2s' },
      { id: 'kimi',       name: 'Kimi',               badgeColor: '#6b7280', badgeText: 'PAID',             costPer1k: 0.0015, latency: '~1.0s' },
      { id: 'minimax',    name: 'MiniMax',            badgeColor: '#6b7280', badgeText: 'PAID',             costPer1k: 0.001,  latency: '~1.1s' },
      { id: 'anthropic',  name: 'Anthropic Claude',   badgeColor: '#a855f7', badgeText: 'PAID - SPARINGLY', costPer1k: 0.003,  latency: '~1.5s', warn: true },
      { id: 'ollama',     name: 'Ollama',             badgeColor: '#3b82f6', badgeText: 'LOCAL',            costPer1k: 0,      latency: '~2s',   auto: true },
    ];

    const budgetPct = dailyBudget > 0 ? Math.min(100, Math.round((tokensUsed / dailyBudget) * 100)) : 0;
    const budgetColor = budgetPct >= 100 ? '#ef4444' : budgetPct >= 80 ? '#f59e0b' : '#22c55e';

    const providerDot = (id) => {
      const st = routerStatus[id];
      if (providerToggles[id] === false) return '#ef4444';
      if (st === 'ok' || st === 'active') return '#22c55e';
      if (st === undefined && providerToggles[id] !== false) return providerToggles[id] ? '#22c55e' : '#6b7280';
      return '#6b7280';
    };

    const modelOptions = (selectedVal) =>
      MODEL_OPTIONS.map(o =>
        `<option value="${o.value}" ${selectedVal === o.value ? 'selected' : ''}>${o.label} — ${o.tag}</option>`
      ).join('');

    // ── Render ─────────────────────────────────────────────────────────────────
    container.innerHTML = `
<style>
  /* ── CSS-only toggle switch ───────────────────────────────────────── */
  .ai-toggle-wrap { display:flex; align-items:center; gap:10px; flex-shrink:0; }
  .ai-toggle-wrap input[type=checkbox] { display:none; }
  .ai-sw { position:relative; width:42px; height:22px; cursor:pointer; flex-shrink:0; }
  .ai-sw .ai-sw-track {
    position:absolute; inset:0; border-radius:999px;
    background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
    transition:background .2s, border-color .2s;
  }
  .ai-sw .ai-sw-thumb {
    position:absolute; top:3px; left:3px;
    width:14px; height:14px; border-radius:50%;
    background:#6b7280; transition:transform .2s, background .2s;
  }
  .ai-toggle-wrap input:checked + .ai-sw .ai-sw-track { background:rgba(34,197,94,.25); border-color:#22c55e; }
  .ai-toggle-wrap input:checked + .ai-sw .ai-sw-thumb { background:#22c55e; transform:translateX(20px); }

  /* ── Budget bar ───────────────────────────────────────────────────── */
  .ai-budget-bar { height:8px; border-radius:999px; background:rgba(255,255,255,.07); overflow:hidden; margin:8px 0; }
  .ai-budget-fill { height:100%; border-radius:999px; transition:width .4s; }

  /* ── Status bar ───────────────────────────────────────────────────── */
  .ai-status-bar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
  .ai-status-dot { display:flex; align-items:center; gap:5px; font-size:.72rem; color:var(--muted); }
  .ai-status-dot span.dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

  /* ── Agent grid ───────────────────────────────────────────────────── */
  .ai-agent-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:10px; }
  .ai-agent-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:10px; padding:14px; }
  .ai-agent-card:hover { border-color:rgba(255,42,42,.2); }
  .ai-agent-icon { font-size:1.4rem; margin-bottom:8px; }
  .ai-agent-name { font-size:.85rem; font-weight:700; margin-bottom:2px; }
  .ai-agent-desc { font-size:.7rem; color:var(--muted); margin-bottom:10px; }
  .ai-agent-select { width:100%; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:6px; padding:7px 10px; color:var(--text); font-size:.75rem; font-family:inherit; cursor:pointer; }
  .ai-agent-select:focus { outline:1px solid var(--accent); }

  /* ── Provider cards ───────────────────────────────────────────────── */
  .ai-prov-card { display:flex; align-items:center; gap:12px; padding:12px 16px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:8px; margin-bottom:8px; }
  .ai-prov-card.prov-off { opacity:.5; }
  .ai-prov-info { flex:1; min-width:0; }
  .ai-prov-name { font-size:.85rem; font-weight:600; }
  .ai-prov-badge { display:inline-block; padding:1px 7px; border-radius:999px; font-size:.6rem; font-weight:700; letter-spacing:.06em; margin-left:6px; color:#fff; }
  .ai-prov-cost { font-size:.7rem; color:var(--muted); margin-top:2px; }
  .ai-prov-warn { font-size:.68rem; color:#f59e0b; margin-top:3px; }

  /* ── Slider ───────────────────────────────────────────────────────── */
  .ai-slider { -webkit-appearance:none; appearance:none; width:100%; height:4px; border-radius:999px; background:rgba(255,255,255,.1); outline:none; cursor:pointer; }
  .ai-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:16px; height:16px; border-radius:50%; background:var(--accent); cursor:pointer; border:2px solid rgba(255,255,255,.2); }
  .ai-slider::-moz-range-thumb { width:16px; height:16px; border-radius:50%; background:var(--accent); cursor:pointer; border:2px solid rgba(255,255,255,.2); }

  /* ── Save button ──────────────────────────────────────────────────── */
  .ai-save-btn { background:var(--accent); color:#fff; border:none; border-radius:7px; padding:10px 28px; font-size:.85rem; font-weight:700; cursor:pointer; letter-spacing:.04em; transition:opacity .15s, transform .1s; }
  .ai-save-btn:hover { opacity:.88; transform:translateY(-1px); }
  .ai-save-btn:active { transform:translateY(0); }
</style>

<!-- ═══════════════════════════════════════════════════════════════════════════
     STATUS BAR
     ═══════════════════════════════════════════════════════════════════════════ -->
<div class="mod-card" style="margin-bottom:20px;padding:12px 16px">
  <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:8px">
    <i class="fas fa-circle-dot" style="color:#22c55e;margin-right:4px"></i> Provider Status
  </div>
  <div class="ai-status-bar">
    ${PROVIDERS.map(p => `
      <div class="ai-status-dot" title="${p.latency} latency">
        <span class="dot" style="background:${providerDot(p.id)}"></span>
        ${p.name} <span style="opacity:.5">${p.latency}</span>
      </div>`).join('')}
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 1 — AGENT ROLES
     ═══════════════════════════════════════════════════════════════════════════ -->
<div class="mod-section">
  <div class="mod-section-title"><i class="fas fa-robot" style="margin-right:6px"></i>Agent Roles — Model Assignment</div>
  <div class="ai-agent-grid" id="aim-agent-grid">
    ${AGENTS.map(a => `
      <div class="ai-agent-card">
        <div class="ai-agent-icon">${a.icon}</div>
        <div class="ai-agent-name">${a.name}</div>
        <div class="ai-agent-desc">${a.desc}</div>
        <select class="ai-agent-select" id="aim-agent-${a.id}" data-agent="${a.id}">
          ${modelOptions(agentModels[a.id] || DEFAULT_AGENT_MODELS[a.id])}
        </select>
      </div>`).join('')}
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 2 — PROVIDER TOGGLES
     ═══════════════════════════════════════════════════════════════════════════ -->
<div class="mod-section">
  <div class="mod-section-title"><i class="fas fa-plug" style="margin-right:6px"></i>Provider Toggles — Routing Chain</div>
  ${PROVIDERS.map(p => `
    <div class="ai-prov-card ${providerToggles[p.id] === false ? 'prov-off' : ''}" id="aim-prov-card-${p.id}">
      <div class="ai-prov-info">
        <div class="ai-prov-name">
          ${p.name}
          <span class="ai-prov-badge" style="background:${p.badgeColor}">${p.badgeText}</span>
          ${p.auto ? '<span style="font-size:.65rem;color:#3b82f6;margin-left:4px">auto-detects</span>' : ''}
        </div>
        <div class="ai-prov-cost">
          ${p.costPer1k === 0 ? 'No cost per 1k tokens' : `~$${p.costPer1k.toFixed(4)} per 1k tokens`}
          &nbsp;·&nbsp; est. latency ${p.latency}
        </div>
        ${p.warn ? `<div class="ai-prov-warn"><i class="fas fa-triangle-exclamation"></i> Paid provider — tokens consume budget. Use sparingly or route free models first.</div>` : ''}
      </div>
      <label class="ai-toggle-wrap" title="Toggle ${p.name}">
        <input type="checkbox" id="aim-prov-${p.id}" data-prov="${p.id}" ${providerToggles[p.id] !== false ? 'checked' : ''}
          onchange="(function(el){
            const card=document.getElementById('aim-prov-card-${p.id}');
            if(el.checked){card.classList.remove('prov-off');}else{card.classList.add('prov-off');}
          })(this)">
        <span class="ai-sw"><span class="ai-sw-track"></span><span class="ai-sw-thumb"></span></span>
        <span style="font-size:.72rem;color:var(--muted);min-width:24px">${providerToggles[p.id] !== false ? 'ON' : 'OFF'}</span>
      </label>
    </div>`).join('')}
</div>

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 3 — TOKEN BUDGET
     ═══════════════════════════════════════════════════════════════════════════ -->
<div class="mod-section">
  <div class="mod-section-title"><i class="fas fa-coins" style="margin-right:6px"></i>Token Budget</div>
  <div class="mod-card">
    <!-- Slider -->
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <label style="font-size:.78rem;font-weight:600">Daily Token Budget</label>
        <span id="aim-budget-display" style="font-size:.85rem;font-weight:700;color:var(--accent)">${dailyBudget.toLocaleString()} tokens</span>
      </div>
      <input type="range" class="ai-slider" id="aim-budget-slider" min="0" max="50000" step="500" value="${dailyBudget}"
        oninput="(function(v){
          document.getElementById('aim-budget-display').textContent = parseInt(v).toLocaleString() + ' tokens';
        })(this.value)">
      <div style="display:flex;justify-content:space-between;font-size:.65rem;color:var(--muted);margin-top:4px">
        <span>0</span><span>10k</span><span>25k</span><span>50k</span>
      </div>
    </div>

    <!-- Usage bar -->
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:.75rem;color:var(--muted)">Tokens used today</span>
        <span id="aim-tokens-used" style="font-size:.8rem;font-weight:700;color:${budgetColor}">${tokensUsed.toLocaleString()} / ${dailyBudget.toLocaleString()}</span>
      </div>
      <div class="ai-budget-bar">
        <div class="ai-budget-fill" id="aim-budget-fill" style="width:${budgetPct}%;background:${budgetColor}"></div>
      </div>
      ${budgetPct >= 100 ? `<div style="font-size:.72rem;color:#ef4444;margin-top:4px"><i class="fas fa-circle-xmark"></i> Budget exhausted — AI calls paused until reset.</div>` :
        budgetPct >= 80  ? `<div style="font-size:.72rem;color:#f59e0b;margin-top:4px"><i class="fas fa-triangle-exclamation"></i> Approaching limit (${budgetPct}% used). Consider raising budget or switching to free models.</div>` : ''}
    </div>

    <!-- Cost estimates table -->
    <div style="margin-bottom:16px">
      <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:8px">Estimated cost per 1k tokens</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px">
        ${PROVIDERS.map(p => `
          <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:6px;padding:8px 10px">
            <div style="font-size:.72rem;font-weight:600">${p.name}</div>
            <div style="font-size:.8rem;font-weight:700;margin-top:2px;color:${p.costPer1k === 0 ? '#22c55e' : '#f59e0b'}">
              ${p.costPer1k === 0 ? '$0.000' : '$' + p.costPer1k.toFixed(4)}
            </div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Reset button -->
    <button class="btn btn-secondary btn-sm" onclick="(function(){
      if(!confirm('Reset today\\'s token count to 0?')) return;
      fetch('/api/boss/token-usage/reset', {method:'POST'}).catch(()=>{});
      document.getElementById('aim-tokens-used').textContent = '0 / ' + parseInt(document.getElementById('aim-budget-slider').value).toLocaleString();
      document.getElementById('aim-budget-fill').style.width = '0%';
      document.getElementById('aim-budget-fill').style.background = '#22c55e';
      toast('Token count reset', 'ok');
    })()">
      <i class="fas fa-arrow-rotate-left"></i> Reset today's count
    </button>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════════
     SAVE ALL
     ═══════════════════════════════════════════════════════════════════════════ -->
<div style="display:flex;justify-content:flex-end;padding-bottom:24px">
  <button class="ai-save-btn" onclick="window._aimSaveAll()">
    <i class="fas fa-floppy-disk" style="margin-right:6px"></i> Save Configuration
  </button>
</div>`;

    // ── Save handler ──────────────────────────────────────────────────────────
    window._aimSaveAll = async function() {
      // Collect agent assignments
      const newAgentModels = {};
      AGENTS.forEach(a => {
        const el = document.getElementById(`aim-agent-${a.id}`);
        if (el) newAgentModels[a.id] = el.value;
      });

      // Collect provider toggles + update label text
      const newToggles = {};
      PROVIDERS.forEach(p => {
        const el = document.getElementById(`aim-prov-${p.id}`);
        if (el) {
          newToggles[p.id] = el.checked;
          const label = el.closest('label');
          if (label) {
            const txt = label.querySelector('span:last-child');
            if (txt) txt.textContent = el.checked ? 'ON' : 'OFF';
          }
        }
      });

      // Collect budget
      const sliderEl = document.getElementById('aim-budget-slider');
      const newBudget = sliderEl ? parseInt(sliderEl.value) : DEFAULT_BUDGET;

      // Persist locally
      localStorage.setItem('boss_agent_models',  JSON.stringify(newAgentModels));
      localStorage.setItem('boss_prov_toggles',  JSON.stringify(newToggles));
      localStorage.setItem('boss_daily_budget',  String(newBudget));

      // POST to server
      try {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentModels: newAgentModels, providerToggles: newToggles, dailyTokenBudget: newBudget }),
        });
        toast('AI config saved', 'ok');
      } catch {
        toast('Saved locally (server offline)', 'ok');
      }
    };
  },

  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">AI Models & Providers</p>
      <p style="font-size:.75rem;color:var(--muted);line-height:1.6">
        Assign specialist models to each B.O.S.S agent role, toggle provider routing, and manage your daily token budget.
        Free providers (Groq, GLM, OpenRouter) are routed first; paid providers (Anthropic) are flagged with a token warning.
      </p>
      <div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.06)">
        <div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:8px">Quick Presets</div>
        <button class="btn btn-secondary btn-sm" style="width:100%;margin-bottom:6px;justify-content:flex-start" onclick="window._aimApplyPreset('free')">
          <i class="fas fa-leaf"></i> Free-Only Mode
        </button>
        <button class="btn btn-secondary btn-sm" style="width:100%;margin-bottom:6px;justify-content:flex-start" onclick="window._aimApplyPreset('balanced')">
          <i class="fas fa-scale-balanced"></i> Balanced Mode
        </button>
        <button class="btn btn-secondary btn-sm" style="width:100%;justify-content:flex-start" onclick="window._aimApplyPreset('performance')">
          <i class="fas fa-bolt"></i> Max Performance
        </button>
      </div>
      <div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.06)">
        <div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:8px">Storage Keys</div>
        <div style="font-size:.7rem;color:var(--muted);line-height:1.8">
          <code style="background:rgba(255,255,255,.06);padding:1px 5px;border-radius:3px">boss_agent_models</code><br>
          <code style="background:rgba(255,255,255,.06);padding:1px 5px;border-radius:3px">boss_prov_toggles</code><br>
          <code style="background:rgba(255,255,255,.06);padding:1px 5px;border-radius:3px">boss_daily_budget</code>
        </div>
      </div>`;

    // ── Preset logic ────────────────────────────────────────────────────────
    window._aimApplyPreset = function(preset) {
      const agentSelects = ['scout','copywriter','analyst','builder','coach'];
      const provInputs = ['groq','glm','openrouter','cerebras','kimi','minimax','anthropic','ollama'];

      if (preset === 'free') {
        // Assign all agents to free fast model, disable paid
        agentSelects.forEach(id => {
          const el = document.getElementById(`aim-agent-${id}`);
          if (el) el.value = id === 'builder' ? 'glm/glm-4-flash' : 'groq/llama-3.1-8b-instant';
        });
        const freeOn = { groq:true, glm:true, openrouter:true, cerebras:true, kimi:false, minimax:false, anthropic:false, ollama:false };
        provInputs.forEach(id => {
          const el = document.getElementById(`aim-prov-${id}`);
          if (el) { el.checked = !!freeOn[id]; el.dispatchEvent(new Event('change')); }
        });
        toast('Free-Only preset applied — save to confirm', 'ok');
      } else if (preset === 'balanced') {
        agentSelects.forEach(id => {
          const el = document.getElementById(`aim-agent-${id}`);
          if (el) el.value = id === 'scout' ? 'groq/llama-3.1-8b-instant' : id === 'builder' ? 'glm/glm-4-flash' : 'groq/llama-3.3-70b-versatile';
        });
        const balOn = { groq:true, glm:true, openrouter:true, cerebras:true, kimi:false, minimax:false, anthropic:true, ollama:false };
        provInputs.forEach(id => {
          const el = document.getElementById(`aim-prov-${id}`);
          if (el) { el.checked = !!balOn[id]; el.dispatchEvent(new Event('change')); }
        });
        toast('Balanced preset applied — save to confirm', 'ok');
      } else if (preset === 'performance') {
        agentSelects.forEach(id => {
          const el = document.getElementById(`aim-agent-${id}`);
          if (el) el.value = id === 'scout' ? 'groq/llama-3.1-8b-instant' : 'anthropic/claude-sonnet-4-5';
        });
        const perfOn = { groq:true, glm:true, openrouter:true, cerebras:true, kimi:false, minimax:false, anthropic:true, ollama:false };
        provInputs.forEach(id => {
          const el = document.getElementById(`aim-prov-${id}`);
          if (el) { el.checked = !!perfOn[id]; el.dispatchEvent(new Event('change')); }
        });
        toast('Max Performance preset applied — save to confirm', 'ok');
      }
    };
  }
})
