/* ── B.O.S.S — Business Optimization System Service — boss.js ── */
'use strict';
(function () {
  const API = '/api';
  let HISTORY = [];
  let VOICE_ON = false;

  // ── Panel nav wiring ─────────────────────────────────────
  document.querySelectorAll('.nav-item[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.panel;
      if (p === 'boss-channels') setTimeout(bossLoadChannels, 200);
      if (p === 'boss-agents')   setTimeout(bossLoadAgents, 200);
    });
  });

  // ── Chat drawer ──────────────────────────────────────────
  const drawer  = document.getElementById('boss-drawer');
  const msgs    = document.getElementById('boss-msgs');
  const input   = document.getElementById('boss-input');
  const slashEl = document.getElementById('boss-slash');

  const SLASH_CMDS = [
    { cmd: '/scan',     hint: '/scan <keyword> — sweep Reddit for leads' },
    { cmd: '/pitch',    hint: '/pitch <lead name> — generate full pitch doc' },
    { cmd: '/channels', hint: '/channels — show platform status' },
    { cmd: '/coach',    hint: '/coach — proactive next-move advice' },
    { cmd: '/status',   hint: '/status — memory palace + system state' },
    { cmd: '/plan',     hint: '/plan <goal> — strategic breakdown' },
  ];

  window.bossToggle = function () {
    drawer.classList.toggle('open');
    if (drawer.classList.contains('open')) {
      if (!msgs.children.length) bossGreet();
      setTimeout(() => input.focus(), 100);
    }
  };

  // ⌘K / Ctrl+K shortcut
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); window.bossToggle(); }
  });

  function addMsg(role, text) {
    const div = document.createElement('div');
    div.className = `boss-msg ${role}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'boss-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    t.id = 'boss-typing-indicator';
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
    return t;
  }

  function removeTyping() {
    const t = document.getElementById('boss-typing-indicator');
    if (t) t.remove();
  }

  async function bossGreet() {
    const cfg   = await fetch(API + '/config').then(r => r.json()).catch(() => ({}));
    const leads = await fetch(API + '/leads').then(r => r.json()).catch(() => ({ leads: [] }));
    const name  = cfg.personaName || 'Boss';
    const hasKey = !!cfg.anthropicApiKey;
    const leadCount = (leads.leads || []).length;

    const onboard = `B.O.S.S online${name !== 'Boss' ? ', ' + name : ''}.\n\n` +
      `━━━ SYSTEM STATUS ━━━\n` +
      `🧠 AI Brain: ${hasKey ? '✓ Active (Anthropic Claude)' : '⛔ OFFLINE — you need an Anthropic API key'}\n` +
      `📊 CRM: ${leadCount} lead${leadCount !== 1 ? 's' : ''} in pipeline\n\n` +
      (!hasKey
        ? `⚠️  FIRST THING TO DO:\n` +
          `1. Go to console.anthropic.com → sign up (free $5 credit)\n` +
          `2. Create an API key → copy it\n` +
          `3. In THIS app: sidebar → 🔑 API Keys & Settings (top of B.O.S.S Core section)\n` +
          `4. Paste key → Save & Activate\n` +
          `5. Come back here — I'll wake up fully\n\n` +
          `Everything else is live (Lead Feed, CRM, Outreach) — AI just needs the key.\n\n`
        : `━━━ WHAT TO DO NOW ━━━\n\n` +
          `1️⃣  /scan need more clients  →  live Reddit lead sweep\n` +
          `2️⃣  Click any lead in Lead Feed  →  I write the pitch instantly\n` +
          `3️⃣  /channels  →  activate Telegram so you can talk to me on your phone\n` +
          `4️⃣  Just talk  →  tell me your goal, I'll build the plan\n\n` +
          `🎤 Mic button = voice mode. Speak to me like Jarvis.\n\n`
      ) +
      `What are we building today?`;

    addMsg('bot', onboard);
  }

  // Slash command suggestions
  if (input) {
    input.addEventListener('input', () => {
      const v = input.value;
      if (v.startsWith('/')) {
        const matches = SLASH_CMDS.filter(c => c.cmd.startsWith(v));
        slashEl.style.display = matches.length ? 'flex' : 'none';
        slashEl.innerHTML = matches.map(c =>
          `<span onclick="document.getElementById('boss-input').value='${c.cmd} ';document.getElementById('boss-input').focus()"
            style="background:rgba(200,255,0,.08);color:#c8ff00;border:1px solid rgba(200,255,0,.2);border-radius:5px;padding:3px 9px;font-size:.72rem;cursor:pointer;font-family:monospace">${c.hint}</span>`
        ).join('');
      } else {
        slashEl.style.display = 'none';
      }
    });
  }

  window.bossSend = async function (e) {
    if (e) e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    slashEl.style.display = 'none';
    addMsg('user', text);
    HISTORY.push({ role: 'user', content: text });

    // Handle slash commands locally
    if (text.startsWith('/channels')) { bossLoadChannels(); return addMsg('bot', '↓ Opening Channels panel…'), void switchPanel?.('boss-channels'); }
    if (text.startsWith('/status')) {
      const s = await fetch(API + '/boss/state').then(r => r.json()).catch(() => null);
      return addMsg('bot', s ? `📋 Goal: ${s.state?.current_goal}\nUpdated: ${s.state?.updated_at || 'never'}` : '⚠️ State unavailable');
    }

    const typing = showTyping();
    try {
      const r = await fetch(API + '/boss/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: HISTORY.slice(-14), maxTokens: 700 }),
      }).then(r => r.json());
      removeTyping();
      const reply = r.ok ? r.reply : (r.error || 'B.O.S.S offline — check your Anthropic key in Settings.');
      addMsg('bot', reply);
      HISTORY.push({ role: 'assistant', content: reply });
      if (VOICE_ON && r.ok) bossSpeak(reply);
    } catch (err) {
      removeTyping();
      addMsg('bot', '⚠️ Connection error. Is the server running?');
    }
  };

  // Voice input
  window.bossMic = function () {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return addMsg('bot', '⚠️ Your browser doesn\'t support voice input. Try Chrome.');
    const btn = document.getElementById('boss-mic-btn');
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = 'en-GB';
    r.onstart = () => { btn.classList.add('listening'); btn.textContent = '🔴'; };
    r.onend   = () => { btn.classList.remove('listening'); btn.textContent = '🎤'; };
    r.onresult = ev => {
      input.value = ev.results[0][0].transcript;
      bossSend(null);
    };
    r.start();
  };

  window.bossSpeak = function (text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.slice(0, 300));
    u.lang  = 'en-GB';
    u.rate  = 1.05;
    u.pitch = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const pref   = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Daniel'));
    if (pref) u.voice = pref;
    window.speechSynthesis.speak(u);
  };

  // ── CHANNELS PANEL ───────────────────────────────────────
  const CH_ICONS = {
    telegram:'fab fa-telegram', x:'fab fa-x-twitter', linkedin:'fab fa-linkedin',
    instagram:'fab fa-instagram', discord:'fab fa-discord', slack:'fab fa-slack',
  };

  window.bossLoadChannels = async function () {
    const grid = document.getElementById('boss-channels-grid');
    if (!grid) return;
    grid.innerHTML = '<div style="color:#666;font-size:.8rem">Loading…</div>';
    const r = await fetch(API + '/channels').then(r => r.json()).catch(() => null);
    if (!r || !r.channels) { grid.innerHTML = '<div style="color:#f55;font-size:.8rem">Failed to load channels</div>'; return; }
    grid.innerHTML = r.channels.map(ch => `
      <div style="background:#0d0d0d;border:1px solid ${ch.configured ? '#2a3a1a' : '#1a1a1a'};border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:38px;height:38px;border-radius:9px;background:${ch.configured ? 'rgba(200,255,0,.1)' : '#151515'};display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:${ch.configured ? '#c8ff00' : '#444'}">
            <i class="${CH_ICONS[ch.id] || 'fas fa-satellite-dish'}"></i>
          </div>
          <div>
            <div style="font-weight:700;font-size:.85rem">${ch.label}</div>
            <div style="font-size:.68rem;color:${ch.configured ? '#c8ff00' : '#f55'}">${ch.configured ? '✓ Ready' : '⚠ Needs env key'}</div>
          </div>
        </div>
        <div style="font-size:.68rem;color:#555;line-height:1.4">${ch.configured ? (ch.capabilities||[]).join(' · ') : ch.setupNote}</div>
      </div>
    `).join('');
  };

  window.bossChannelSend = async function () {
    const id   = document.getElementById('ch-send-id')?.value;
    const to   = document.getElementById('ch-send-to')?.value;
    const text = document.getElementById('ch-send-text')?.value;
    const el   = document.getElementById('ch-send-result');
    if (!text) { if (el) el.textContent = '⚠ Enter a message'; return; }
    if (el) el.textContent = 'Sending…';
    const payload = { text };
    if (to) payload.to = to;
    const r = await fetch(`${API}/channels/${id}/send`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) }).then(r => r.json()).catch(e => ({ ok:false, error:e.message }));
    if (el) el.textContent = r.ok ? '✓ Sent' : '✗ ' + (r.error || 'error');
  };

  // ── AGENTS PANEL ─────────────────────────────────────────
  window.bossLoadAgents = async function () {
    const grid = document.getElementById('boss-agents-grid');
    if (!grid) return;
    grid.innerHTML = '<div style="color:#666;font-size:.8rem">Loading…</div>';
    const r = await fetch(API + '/channels/agents').then(r => r.json()).catch(() => null);
    if (!r || !r.agents || !r.agents.length) {
      grid.innerHTML = '<div style="color:#555;font-size:.8rem">No agents yet — use Spawn below to activate a channel agent</div>';
      return;
    }
    grid.innerHTML = r.agents.map(ag => `
      <div style="background:#0d0d0d;border:1px solid #2a3a1a;border-radius:12px;padding:18px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <i class="${CH_ICONS[ag.channelId]||'fas fa-robot'}" style="color:#c8ff00"></i>
          <span style="font-weight:700;font-size:.85rem">${ag.persona?.name||ag.channelId}</span>
          <span style="margin-left:auto;font-size:.66rem;color:#555">${ag.queueDepth||0} queued</span>
        </div>
        <div style="font-size:.7rem;color:#555;line-height:1.5">
          Tone: ${ag.persona?.tone||'—'}<br>
          Chats: ${ag.chatCount||0} · Sent: ${ag.stats?.sent||0} · Recv: ${ag.stats?.received||0}
        </div>
      </div>
    `).join('');
  };

  window.bossSpawnAgent = async function () {
    const id   = document.getElementById('ag-spawn-id')?.value;
    const name = document.getElementById('ag-spawn-name')?.value;
    const tone = document.getElementById('ag-spawn-tone')?.value;
    const el   = document.getElementById('ag-spawn-result');
    if (el) el.textContent = 'Spawning…';
    const persona = {};
    if (name) persona.name = name;
    if (tone) persona.tone = tone;
    const r = await fetch(`${API}/channels/${id}/spawn`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ persona }) }).then(r => r.json()).catch(e => ({ ok:false, error:e.message }));
    if (el) el.textContent = r.ok ? `✓ Agent spawned for ${id}` : '✗ ' + (r.error||'error');
    if (r.ok) setTimeout(bossLoadAgents, 400);
  };

  // ── PITCH BUILDER (callable from Lead Feed) ──────────────
  window.bossPitchLead = async function (lead) {
    window.bossToggle();
    if (!drawer.classList.contains('open')) drawer.classList.add('open');
    addMsg('user', `/pitch ${lead.author || lead.name || 'lead'}`);
    HISTORY.push({ role: 'user', content: `/pitch — Lead: ${JSON.stringify(lead)}` });
    const typing = showTyping();
    try {
      const r = await fetch(API + '/boss/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead }),
      }).then(r => r.json());
      removeTyping();
      if (r.ok) {
        const p = r;
        const formatted = `📧 SUBJECT: ${p.subject || '—'}\n\n🪝 HOOK:\n${p.hook || '—'}\n\n💬 DM (short):\n${p.dm_short || '—'}\n\n📄 FULL EMAIL:\n${p.email_full || '—'}\n\n🎯 Score: ${p.score || '?'}/100`;
        addMsg('bot', formatted);
        HISTORY.push({ role: 'assistant', content: formatted });
      } else {
        addMsg('bot', '⚠️ ' + (r.error || 'Pitch generation failed. Add Anthropic key in Settings.'));
      }
    } catch (err) {
      removeTyping();
      addMsg('bot', '⚠️ Error generating pitch.');
    }
  };

  // ── CONFIG PANEL ─────────────────────────────────────────────────────────

  window.bossLoadConfig = async function () {
    try {
      const cfg = await fetch(API + '/config').then(r => r.json()).catch(() => ({}));
      const keyInput = document.getElementById('cfg-anthropic-key');
      const personaInput = document.getElementById('cfg-persona');
      const offerInput   = document.getElementById('cfg-offer');
      const serperInput  = document.getElementById('cfg-serper-key');
      const banner       = document.getElementById('boss-config-banner');
      const keyStatus    = document.getElementById('cfg-key-status');

      if (keyInput && cfg.anthropicApiKey) {
        keyInput.value = cfg.anthropicApiKey;
        if (keyStatus) {
          keyStatus.textContent  = `✓ Key set (${cfg.anthropicApiKey.length} chars)`;
          keyStatus.style.color  = '#c8ff00';
        }
        if (banner) banner.style.display = 'none';
      } else {
        if (keyStatus) { keyStatus.textContent = '— not set'; keyStatus.style.color = '#f55'; }
        if (banner) banner.style.display = 'block';
      }
      if (personaInput && cfg.personaName) personaInput.value = cfg.personaName;
      if (offerInput   && cfg.offer)       offerInput.value   = cfg.offer;
      if (serperInput  && cfg.serperApiKey) serperInput.value  = cfg.serperApiKey;
    } catch (_) {}
  };

  window.bossCfgDirty = function () {
    const btn = document.getElementById('cfg-save-btn');
    if (btn) btn.style.background = '#ffee00';
  };

  window.bossCfgToggleKey = function () {
    const inp = document.getElementById('cfg-anthropic-key');
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  };

  window.bossCfgSave = async function () {
    const key     = (document.getElementById('cfg-anthropic-key')?.value || '').trim();
    const persona = (document.getElementById('cfg-persona')?.value    || '').trim();
    const offer   = (document.getElementById('cfg-offer')?.value      || '').trim();
    const serper  = (document.getElementById('cfg-serper-key')?.value || '').trim();
    const msg     = document.getElementById('cfg-save-msg');
    const btn     = document.getElementById('cfg-save-btn');
    const status  = document.getElementById('cfg-key-status');
    const banner  = document.getElementById('boss-config-banner');

    if (!key) {
      if (msg) { msg.textContent = '⚠ Anthropic key is required.'; msg.style.color = '#f55'; }
      return;
    }

    const payload = { anthropicApiKey: key };
    if (persona)  payload.personaName  = persona;
    if (offer)    payload.offer        = offer;
    if (serper)   payload.serperApiKey = serper;

    try {
      if (msg) msg.textContent = 'Saving…';
      await fetch(API + '/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (btn)    { btn.style.background = '#c8ff00'; btn.textContent = '✓ Saved!'; }
      if (status) { status.textContent = `✓ Key set (${key.length} chars)`; status.style.color = '#c8ff00'; }
      if (banner) banner.style.display = 'none';
      if (msg)    { msg.textContent = '✓ B.O.S.S activated. Open the chat (bottom right) and type anything.'; msg.style.color = '#c8ff00'; }

      setTimeout(() => {
        if (btn) { btn.textContent = '✓ Save & Activate'; btn.style.background = '#c8ff00'; }
      }, 2500);
    } catch (err) {
      if (msg) { msg.textContent = '✗ Save failed — is the server running?'; msg.style.color = '#f55'; }
    }
  };

  window.bossCfgTest = async function () {
    const msg = document.getElementById('cfg-save-msg');
    if (msg) { msg.textContent = '⚡ Testing…'; msg.style.color = '#c8ff00'; }
    try {
      const r = await fetch(API + '/boss/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Reply in one sentence: B.O.S.S is online and ready.' }),
      }).then(x => x.json());
      if (r.ok) {
        if (msg) { msg.textContent = `✓ Claude says: "${r.reply.slice(0, 120)}"`; msg.style.color = '#c8ff00'; }
      } else {
        if (msg) { msg.textContent = `✗ ${r.error || 'API error'}`; msg.style.color = '#f55'; }
      }
    } catch (e) {
      if (msg) { msg.textContent = '✗ Server not reachable.'; msg.style.color = '#f55'; }
    }
  };

  // ── Auto-save conversation every 30s ─────────────────────────────────────

  setInterval(() => {
    if (HISTORY.length > 2) {
      fetch(API + '/boss/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ last_chat_at: new Date().toISOString(), chat_turns: HISTORY.length }),
      }).catch(() => {});
    }
  }, 30000);

  // Show which AI tier handled a reply in the chat
  function tierBadge(provider, tier) {
    const map = {
      ollama:    { label: 'LOCAL',  color: '#c8ff00' },
      groq:      { label: 'GROQ',   color: '#00aaff' },
      anthropic: { label: 'CLAUDE', color: '#aa44ff' },
    };
    const b = map[provider] || { label: provider?.toUpperCase() || 'AI', color: '#888' };
    return `<span style="font-size:.6rem;background:${b.color}22;color:${b.color};padding:1px 6px;border-radius:100px;font-weight:700;margin-left:6px;vertical-align:middle">${b.label}</span>`;
  }

  // Override addMsg to support HTML (for tier badges)
  const _origAddMsg = addMsg;
  function addMsgRich(role, html) {
    const div = document.createElement('div');
    div.className = `boss-msg ${role}`;
    div.innerHTML = html;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // Patch bossSend to show tier badge
  const _origBossSend = window.bossSend;
  window.bossSend = async function(e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    // Slash command intercepts
    if (text === '/models' || text === '/local') {
      addMsg('user', text);
      document.querySelector('[data-panel="boss-models"]')?.click();
      addMsgRich('bot', '📡 Opening <strong>Local Models</strong> panel…');
      return;
    }
    if (text === '/render' || text === '/studio') {
      addMsg('user', text);
      document.querySelector('[data-panel="boss-creative"]')?.click();
      addMsgRich('bot', '🎬 Opening <strong>Creative Studio</strong>…');
      return;
    }
    if (text === '/keys' || text === '/settings') {
      addMsg('user', text);
      document.querySelector('[data-panel="boss-config"]')?.click();
      addMsgRich('bot', '🔑 Opening <strong>API Keys & Settings</strong>…');
      return;
    }

    addMsg('user', text);
    showTyping();
    HISTORY.push({ role: 'user', content: text });

    try {
      const r = await fetch(API + '/boss/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, messages: HISTORY.slice(-12) }),
      }).then(x => x.json());
      removeTyping();
      if (r.ok) {
        const badge = tierBadge(r.provider, r.tier);
        addMsgRich('bot', r.reply.replace(/\n/g, '<br>') + badge);
        HISTORY.push({ role: 'assistant', content: r.reply });
        if (VOICE_ON) bossSpeak(r.reply);
      } else {
        addMsg('bot', '⚠️ ' + (r.error || 'B.O.S.S offline — check API Keys & Settings.'));
      }
    } catch (err) {
      removeTyping();
      addMsg('bot', '⚠️ Server not reachable.');
    }
  };

  // ── LOCAL MODELS PANEL ───────────────────────────────────────────────────

  window.bossLoadModels = async function() {
    const msg = document.getElementById('models-msg');

    // Load router status
    try {
      const r = await fetch(API + '/boss/router').then(x => x.json());
      const rtLocal = document.getElementById('rt-local');
      const rtGroq  = document.getElementById('rt-groq');
      const rtCloud = document.getElementById('rt-cloud');
      const rtLV    = document.getElementById('rt-local-val');
      const rtGV    = document.getElementById('rt-groq-val');
      const rtCV    = document.getElementById('rt-cloud-val');

      if (r.ollama?.running) {
        rtLocal?.classList.add('on');
        if (rtLV) rtLV.textContent = `${r.ollama.models?.length || 0} model(s) ready`;
        document.getElementById('ollama-install-banner')?.setAttribute('style','display:none');
      } else {
        if (rtLV) rtLV.textContent = 'Not running — install Ollama';
        document.getElementById('ollama-install-banner')?.setAttribute('style','display:block;background:#0d0d0d;border:1px solid #c8ff0033;border-radius:12px;padding:18px 22px;margin-bottom:24px');
      }
      if (r.groq)      { rtGroq?.classList.add('groq-on');  if (rtGV) rtGV.textContent = 'Connected'; }
      else             { if (rtGV) rtGV.textContent = 'No key — get free at groq.com'; }
      if (r.anthropic) { rtCloud?.classList.add('cloud-on'); if (rtCV) rtCV.textContent = 'Connected'; }
      else             { if (rtCV) rtCV.textContent = 'No key — add in Settings'; }
    } catch (_) {}

    // Load downloaded models
    const listEl = document.getElementById('local-models-list');
    try {
      const r = await fetch(API + '/local/models').then(x => x.json());
      if (r.models && r.models.length) {
        listEl.innerHTML = r.models.map(m =>
          `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#0d0d0d;border:1px solid #1a1a1a;border-radius:8px;margin-bottom:6px">
            <span style="font-weight:700;font-size:.8rem;color:#f5f2ec">${m.name}</span>
            <span style="font-size:.7rem;color:#666">${Math.round((m.size||0)/1024/1024/1024*10)/10} GB</span>
          </div>`
        ).join('');
      } else {
        listEl.innerHTML = '<div style="color:#555;font-size:.78rem">No models downloaded yet. Pull one above.</div>';
      }
    } catch (_) {
      listEl.innerHTML = '<div style="color:#555;font-size:.78rem">Ollama not running.</div>';
    }

    // Load groq key
    const cfg = await fetch(API + '/config').then(r => r.json()).catch(() => ({}));
    const groqInp = document.getElementById('cfg-groq-key');
    if (groqInp && cfg.groqApiKey) groqInp.value = cfg.groqApiKey;
  };

  window.bossPullModel = async function(model) {
    const msg = document.getElementById('models-msg');
    if (msg) { msg.textContent = `⬇ Pulling ${model} in background…`; msg.style.color = '#c8ff00'; }
    try {
      await fetch(API + '/local/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model }),
      });
      if (msg) msg.textContent = `✓ Pull started for ${model}. Takes 2-10 min depending on size. Refresh in a bit.`;
      setTimeout(bossLoadModels, 15000);
    } catch (_) {
      if (msg) { msg.textContent = 'Failed — is Ollama installed and running?'; msg.style.color = '#f55'; }
    }
  };

  window.bossGroqSave = async function() {
    const key = (document.getElementById('cfg-groq-key')?.value || '').trim();
    const msg = document.getElementById('models-msg');
    if (!key) { if (msg) { msg.textContent = 'Paste your Groq key first.'; msg.style.color = '#f55'; } return; }
    await fetch(API + '/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groqApiKey: key }),
    });
    if (msg) { msg.textContent = '✓ Groq key saved — analysis tasks now free and fast.'; msg.style.color = '#00aaff'; }
    setTimeout(bossLoadModels, 500);
  };

  // ── CREATIVE STUDIO PANEL ────────────────────────────────────────────────

  let _renderPoll = null;

  window.bossLoadCreative = async function() {
    await bossCreativeRefresh();
  };

  window.bossCreativeRefresh = async function() {
    try {
      const r = await fetch(API + '/creative/status').then(x => x.json());
      document.getElementById('cs-mp4-status').textContent  = r.mp4 ? '✓ Ready' : 'Not rendered yet';
      document.getElementById('cs-mp4-status').style.color  = r.mp4 ? '#c8ff00' : '#666';
      document.getElementById('cs-mp4-size').textContent    = r.mp4 ? `${r.mp4SizeMB} MB` : '—';
      document.getElementById('cs-assets').textContent      = `${r.assets?.length || 0} images`;

      const dlBtn = document.getElementById('cs-download-btn');
      if (dlBtn) dlBtn.style.display = r.mp4 ? 'inline-flex' : 'none';

      // Asset grid
      const grid = document.getElementById('cs-asset-grid');
      if (grid && r.assets?.length) {
        grid.innerHTML = r.assets.map(a => {
          const scene = a.replace(/\.(png|jpg|webp)/i,'');
          return `<div style="background:#0d0d0d;border:1px solid #1a1a1a;border-radius:8px;overflow:hidden;text-align:center">
            <img src="/api/creative/asset/${a}" style="width:100%;aspect-ratio:1;object-fit:cover;display:block" onerror="this.style.background='#111'">
            <div style="font-size:.65rem;color:#666;padding:5px;text-transform:uppercase;letter-spacing:.06em">${scene}</div>
          </div>`;
        }).join('');
      }
    } catch (_) {}

    // Render status
    try {
      const r = await fetch(API + '/creative/render-status').then(x => x.json());
      const el = document.getElementById('cs-render-status');
      const log = document.getElementById('cs-log');
      if (el) {
        el.textContent = r.status;
        el.style.color = r.status === 'done' ? '#c8ff00' : r.status === 'running' ? '#ffaa00' : r.status === 'error' ? '#f55' : '#666';
      }
      if (log && r.logTail) log.textContent = r.logTail;
      if (r.status === 'running' && !_renderPoll) {
        _renderPoll = setInterval(bossCreativeRefresh, 5000);
      } else if (r.status !== 'running' && _renderPoll) {
        clearInterval(_renderPoll); _renderPoll = null;
      }
    } catch (_) {}
  };

  window.bossRenderVideo = async function() {
    const btn = document.getElementById('cs-render-btn');
    const log = document.getElementById('cs-log');
    if (btn) { btn.textContent = '⏳ Rendering…'; btn.disabled = true; }
    if (log) log.textContent = 'Starting render…';
    try {
      const r = await fetch(API + '/creative/render', { method: 'POST' }).then(x => x.json());
      if (log) log.textContent = r.message || 'Render started…';
      // Poll every 5s
      _renderPoll = setInterval(bossCreativeRefresh, 5000);
      setTimeout(bossCreativeRefresh, 2000);
    } catch (_) {
      if (log) log.textContent = 'Failed to start render. Is the server running?';
      if (btn) { btn.textContent = '▶ Render MP4'; btn.disabled = false; }
    }
  };

})();
