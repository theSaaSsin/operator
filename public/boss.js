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
    { cmd: '/auto',        hint: '/auto - autonomous workflow: discover → brand → pitch → send → close' },
    { cmd: '/scan',        hint: '/scan [niche] - find prospects bleeding pain on Reddit + Forums' },
    { cmd: '/pitch',       hint: '/pitch [market] - full battle pack → email, DM, opener, close line' },
    { cmd: '/orchestrate', hint: '/orchestrate [goal] - burn through all agents, assemble the plan' },
    { cmd: '/agents',      hint: '/agents - meet the crew (Scout, Growth, Copywriter, Builder)' },
    { cmd: '/studio',      hint: '/studio - design assets, landing pages, offer sheets' },
    { cmd: '/channels',    hint: '/channels - which platforms are live? where can you reach?' },
    { cmd: '/models',      hint: '/models - local AI running on your machine (offline speed)' },
    { cmd: '/keys',        hint: '/keys - wire up your API keys (Groq, OpenRouter, Claude)' },
    { cmd: '/coach',       hint: '/coach - what\'s the next move? Let\'s make money.' },
    { cmd: '/status',      hint: '/status - system state' },
    { cmd: '/plan',        hint: '/plan [goal] - strategic breakdown' },
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
            style="background:rgba(255,42,42,.08);color:#ff2a2a;border:1px solid rgba(255,42,42,.2);border-radius:5px;padding:3px 9px;font-size:.72rem;cursor:pointer;font-family:monospace">${c.hint}</span>`
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
    if (text.startsWith('/auto')) {
      return bossAutoWorkflow();
    }
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
  // Voice output toggle
  window.bossToggleVoice = function () {
    VOICE_ON = !VOICE_ON;
    const btn = document.getElementById('boss-voice-btn');
    localStorage.setItem('boss_voice_enabled', VOICE_ON);
    if (btn) {
      btn.style.color = VOICE_ON ? '#ff2a2a' : '#888';
      btn.style.borderColor = VOICE_ON ? 'rgba(255,42,42,.4)' : '#1f1f1f';
    }
    const msg = VOICE_ON ? '🔊 Voice ON — I\'ll speak to you now.' : '🔇 Voice OFF — chat only.';
    addMsg('bot', msg);
  };

  // Initialize voice state from localStorage
  VOICE_ON = localStorage.getItem('boss_voice_enabled') !== 'false';
  setTimeout(() => {
    const btn = document.getElementById('boss-voice-btn');
    if (btn) {
      btn.style.color = VOICE_ON ? '#ff2a2a' : '#888';
      btn.style.borderColor = VOICE_ON ? 'rgba(255,42,42,.4)' : '#1f1f1f';
    }
  }, 100);

  window.bossMic = function () {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return addMsg('bot', '⚠️ Your browser doesn\'t support voice input. Try Chrome.');
    const btn = document.getElementById('boss-mic-btn');
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = 'en-US';
    r.onstart = () => { btn.classList.add('listening'); btn.textContent = '🔴'; };
    r.onend   = () => { btn.classList.remove('listening'); btn.textContent = '🎤'; };
    r.onresult = ev => {
      input.value = ev.results[0][0].transcript;
      bossSend(null);
    };
    r.start();
  };

  // Autonomous workflow — nothing to revenue
  window.bossAutoWorkflow = async function () {
    addMsg('bot', '🚀 Launching autonomous workflow. Let me check the state of play…');
    const state = await fetch(API + '/boss/state').then(r => r.json()).catch(() => ({ state: {} }));
    const s = state.state || {};
    const leads = s.leads_count || 0;
    const brandReady = s.brand_set || false;
    const pitchesSent = s.pitches_sent || 0;
    const dealsOpen = s.deals_open || 0;
    const dealsClosed = s.deals_closed || 0;

    // Step 1: No leads yet → Discover
    if (leads === 0) {
      addMsg('bot', `
📍 STEP 1: DISCOVER PAIN
You have 0 leads. We need to find prospects who are bleeding money problems.

🎯 Next move:
/scan [your target] — e.g., /scan "fitness coaches without online clients"

What market are we attacking?`);
      if (VOICE_ON) bossSpeak('Step one. We need leads. Tell me your target market and I will find prospects bleeding pain.');
      return;
    }

    // Step 2: Have leads but no brand → Build brand
    if (leads > 0 && !brandReady) {
      addMsg('bot', `
📍 STEP 2: BUILD BRAND
You have ${leads} lead${leads > 1 ? 's' : ''}. Now we need YOUR brand voice.

Go to: sidebar → Brand Assets → Generate a brand profile for your offer
Or tell me your brand personality and I'll build it.

What's the vibe? (aggressive, smooth, technical, friendly, etc.)`);
      if (VOICE_ON) bossSpeak('You have leads. Now we build your brand voice so every message feels like YOU.');
      return;
    }

    // Step 3: Have leads + brand but no pitches → Generate pitches
    if (leads > 0 && brandReady && pitchesSent === 0) {
      addMsg('bot', `
📍 STEP 3: GENERATE PITCHES
You have ${leads} lead${leads > 1 ? 's' : ''} and your brand is locked.

Now we generate customized pitches for each market segment.

Type: /pitch [specific target]
Example: /pitch "coaches who are too busy to sell"

Or just tell me a lead and I'll build the battle pack.`);
      if (VOICE_ON) bossSpeak('Brand locked. Now we generate pitches. Give me a specific lead or segment and I will build your battle pack.');
      return;
    }

    // Step 4: Have pitches but no deals → Send and track
    if (pitchesSent > 0 && dealsOpen === 0 && dealsClosed === 0) {
      addMsg('bot', `
📍 STEP 4: SEND & TRACK
You have ${pitchesSent} pitch${pitchesSent > 1 ? 'es' : ''} ready. Time to HIT THE MARKET.

Next:
1. Go to Outreach module (sidebar)
2. Load your pitches
3. Start sending (email, DM, call)
4. I'll track responses in real-time

Which channel first? (Email, LinkedIn DM, Telegram, etc.)`);
      if (VOICE_ON) bossSpeak('Pitches locked. Time to send. Which channel do you want to hit first?');
      return;
    }

    // Step 5: Have opens deals → Close them
    if (dealsOpen > 0) {
      addMsg('bot', `
📍 STEP 5: CLOSE & SCALE
You have ${dealsOpen} conversation${dealsOpen > 1 ? 's' : ''} with prospects.

Time to close. Each one is a potential payday.

Type: /coach [prospect name] — I'll give you the exact close strategy
Or tell me: What's their main objection?`);
      if (VOICE_ON) bossSpeak('You have hot prospects. Time to close. What are they asking? What\'s their hesitation?');
      return;
    }

    // Step 6: Already have revenue → Scale
    if (dealsClosed > 0) {
      addMsg('bot', `
✅ REVENUE LOCKED: £${(dealsClosed * 1500).toLocaleString()} (${dealsClosed} deal${dealsClosed > 1 ? 's' : ''})

Now we SCALE.

Options:
1. /scan [new market] — Find more bleeding pain in a new segment
2. /orchestrate growth — Automate outreach to 100+ leads
3. /coach — Refine our close rate (more deals faster)

What's next? More leads or better close rate?`);
      if (VOICE_ON) bossSpeak(`You have made money. ${dealsClosed} deals closed. Now we scale. Do you want more leads or a better close rate?`);
      return;
    }
  };

  window.bossSpeak = function (text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Clean text: remove emoji, limit to first 400 chars
    const cleanText = text.replace(/[\p{Emoji}]/gu, '').slice(0, 400);
    const u = new SpeechSynthesisUtterance(cleanText);
    u.lang  = 'en-US';
    u.rate  = 1.0;
    u.pitch = 1.1;  // Slightly higher for female voice
    u.volume = 0.9;

    const voices = window.speechSynthesis.getVoices();
    // Priority: American female voices (Zira, Samantha, Victoria, Moira)
    const femaleVoices = [
      'Zira',           // Microsoft Zira (US female)
      'Samantha',       // Apple Samantha
      'Victoria',       // Apple Victoria (British female)
      'Moira',          // Apple Moira (Irish female)
      'Google US English',
    ];
    const selectedVoice = voices.find(v => femaleVoices.some(f => v.name.includes(f)));
    if (selectedVoice) u.voice = selectedVoice;

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
          <div style="width:38px;height:38px;border-radius:9px;background:${ch.configured ? 'rgba(255,42,42,.1)' : '#151515'};display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:${ch.configured ? '#ff2a2a' : '#444'}">
            <i class="${CH_ICONS[ch.id] || 'fas fa-satellite-dish'}"></i>
          </div>
          <div>
            <div style="font-weight:700;font-size:.85rem">${ch.label}</div>
            <div style="font-size:.68rem;color:${ch.configured ? '#ff2a2a' : '#f55'}">${ch.configured ? '✓ Ready' : '⚠ Needs env key'}</div>
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
          <i class="${CH_ICONS[ag.channelId]||'fas fa-robot'}" style="color:#ff2a2a"></i>
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

  // AI on/off state — persisted in localStorage
  let AI_ENABLED = localStorage.getItem('boss_ai_enabled') !== 'false';

  function applyAIToggleUI() {
    const track = document.getElementById('ai-toggle-track');
    const thumb = document.getElementById('ai-toggle-thumb');
    const label = document.getElementById('ai-toggle-label');
    if (!track) return;
    if (AI_ENABLED) {
      track.style.background = '#2cb67d';
      if (thumb) thumb.style.left = '22px';
      if (label) { label.textContent = 'ON'; label.style.color = '#2cb67d'; }
    } else {
      track.style.background = '#333';
      if (thumb) thumb.style.left = '3px';
      if (label) { label.textContent = 'OFF'; label.style.color = '#555'; }
    }
  }

  window.bossToggleAI = function () {
    AI_ENABLED = !AI_ENABLED;
    localStorage.setItem('boss_ai_enabled', AI_ENABLED);
    applyAIToggleUI();
    const msg = AI_ENABLED
      ? 'AI brain <strong style="color:#2cb67d">ON</strong> — B.O.S.S will respond normally.'
      : 'AI brain <strong style="color:#555">OFF</strong> — B.O.S.S will not make any AI calls. CRM still works.';
    addMsgRich('bot', msg);
  };

  // Call on page load so toggle always reflects current state
  document.addEventListener('DOMContentLoaded', () => setTimeout(applyAIToggleUI, 300));

  window.bossLoadConfig = async function () {
    applyAIToggleUI();
    try {
      const cfg = await fetch(API + '/config').then(r => r.json()).catch(() => ({}));
      const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
      set('cfg-anthropic-key',   cfg.anthropicApiKey);
      set('cfg-groq-key',        cfg.groqApiKey);
      set('cfg-openrouter-key',  cfg.openrouterApiKey);
      set('cfg-glm-key',         cfg.glmApiKey);
      set('cfg-kimi-key',        cfg.kimiApiKey);
      set('cfg-persona',         cfg.personaName);
      set('cfg-offer',           cfg.offer);
      set('cfg-serper-key',      cfg.serperApiKey);
      set('cfg-telegram-token',  cfg.telegramBotToken);
      set('cfg-telegram-chatid', cfg.telegramChatIds);
      set('cfg-hf-token',        cfg.hfToken);
      set('cfg-x-token',         cfg.xBearerToken);
      set('cfg-linkedin-token',  cfg.linkedinToken);
      set('cfg-ig-token',        cfg.igAccessToken);
      const keyStatus = document.getElementById('cfg-key-status');
      if (keyStatus) {
        if (cfg.anthropicApiKey) { keyStatus.textContent = `✓ set (${cfg.anthropicApiKey.length} chars)`; keyStatus.style.color = '#2cb67d'; }
        else                     { keyStatus.textContent = '— not set'; keyStatus.style.color = '#555'; }
      }
      // Live provider status under save button
      try {
        const st = await fetch(API + '/boss/router').then(r => r.json());
        const saveMsg = document.getElementById('cfg-save-msg');
        if (saveMsg) {
          const badges = [];
          if (st.groq)            badges.push('<span style="color:#00aaff;font-weight:700">GROQ ✓</span>');
          if (st.openrouter)      badges.push('<span style="color:#ff9500;font-weight:700">OPENROUTER ✓</span>');
          if (st.anthropic)       badges.push('<span style="color:#aa44ff;font-weight:700">CLAUDE ✓</span>');
          if (st.ollama?.running) badges.push('<span style="color:#2cb67d;font-weight:700">OLLAMA ✓</span>');
          saveMsg.innerHTML = badges.length ? 'Active: ' + badges.join(' · ') : '<span style="color:#f55">No providers active</span>';
        }
      } catch(_) {}
    } catch (_) {}
  };

  window.bossCfgDirty = function () {
    const btn = document.getElementById('cfg-save-btn');
    if (btn) { btn.style.background = '#c4a000'; btn.textContent = '● Save'; }
  };

  window.bossCfgToggleKey = function () {
    const inp = document.getElementById('cfg-anthropic-key');
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  };

  window.bossCfgToggleVisible = function (id) {
    const inp = document.getElementById(id);
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  };

  window.bossCfgSave = async function () {
    const get  = id => (document.getElementById(id)?.value || '').trim();
    const msg  = document.getElementById('cfg-save-msg');
    const btn  = document.getElementById('cfg-save-btn');

    const payload = {};
    const ant  = get('cfg-anthropic-key');
    const grq  = get('cfg-groq-key');
    const ort  = get('cfg-openrouter-key');
    const per  = get('cfg-persona');
    const off  = get('cfg-offer');
    const ser  = get('cfg-serper-key');
    const glm  = get('cfg-glm-key');
    const kimi = get('cfg-kimi-key');
    const tgToken  = get('cfg-telegram-token');
    const tgChats  = get('cfg-telegram-chatid');
    const hfToken  = get('cfg-hf-token');
    const xToken   = get('cfg-x-token');
    const liToken  = get('cfg-linkedin-token');
    const igToken  = get('cfg-ig-token');

    if (ant)     payload.anthropicApiKey  = ant;
    if (grq)     payload.groqApiKey       = grq;
    if (ort)     payload.openrouterApiKey = ort;
    if (glm)     payload.glmApiKey        = glm;
    if (kimi)    payload.kimiApiKey       = kimi;
    if (per)     payload.personaName      = per;
    if (off)     payload.offer            = off;
    if (ser)     payload.serperApiKey     = ser;
    if (tgToken) payload.telegramBotToken = tgToken;
    if (tgChats) payload.telegramChatIds  = tgChats;
    if (hfToken) payload.hfToken          = hfToken;
    if (xToken)  payload.xBearerToken     = xToken;
    if (liToken) payload.linkedinToken    = liToken;
    if (igToken) payload.igAccessToken    = igToken;

    if (!ant && !grq && !ort && !glm && !kimi) {
      if (msg) { msg.innerHTML = '<span style="color:#f55">Add at least one AI key to activate B.O.S.S.</span>'; }
      return;
    }

    try {
      if (msg) { msg.textContent = 'Saving…'; msg.style.color = '#aaa'; }
      await fetch(API + '/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

      if (btn) { btn.style.background = '#ff2a2a'; btn.textContent = '✓ Saved'; }
      const active = [grq && 'Groq', glm && 'GLM', ort && 'OpenRouter', kimi && 'Kimi', ant && 'Claude'].filter(Boolean).join(' + ');
      if (msg) { msg.innerHTML = `<span style="color:#2cb67d">✓ Saved — ${active} active. Chat away.</span>`; }
      const keyStatus = document.getElementById('cfg-key-status');
      if (keyStatus && ant) { keyStatus.textContent = `✓ set (${ant.length} chars)`; keyStatus.style.color = '#2cb67d'; }

      setTimeout(() => { if (btn) { btn.textContent = '✓ Save'; btn.style.background = '#ff2a2a'; } }, 2500);
    } catch (err) {
      if (msg) { msg.innerHTML = '<span style="color:#f55">✗ Save failed — is the server running on port 4000?</span>'; }
    }
  };

  window.bossCfgTest = async function () {
    const msg = document.getElementById('cfg-save-msg');
    if (msg) { msg.innerHTML = '<span style="color:#aaa">Testing connection…</span>'; }
    try {
      const r = await fetch(API + '/boss/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Say exactly: B.O.S.S online.' }),
      }).then(x => x.json());
      if (r.ok) {
        if (msg) { msg.innerHTML = `<span style="color:#2cb67d">✓ ${r.provider?.toUpperCase()} replied: "${r.reply?.slice(0,80)}"</span>`; }
      } else {
        if (msg) { msg.innerHTML = `<span style="color:#f55">✗ ${r.error || 'API error'}</span>`; }
      }
    } catch (e) {
      if (msg) { msg.innerHTML = '<span style="color:#f55">✗ Server not reachable — run: node server.js</span>'; }
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
      ollama:      { label: 'LOCAL',  color: '#2cb67d' },
      groq:        { label: 'GROQ',   color: '#00aaff' },
      openrouter:  { label: 'FREE',   color: '#ff9500' },
      anthropic:   { label: 'CLAUDE', color: '#aa44ff' },
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
    
    // --- Orchestration + Studio slash commands ---
    if (text.startsWith('/orchestrate ') || text.startsWith('/o ')) {
      const goal = text.replace(/^\/o(rchestrate)?\s+/, '').trim();
      if (!goal) { addMsg('bot', 'Usage: /orchestrate [your goal]'); return; }
      addMsg('user', text);
      addMsgRich('bot', '<strong>Launching agent swarm</strong> for: <em>' + goal + '</em>...');
      showTyping();
      try {
        const r = await fetch(API + '/boss/orchestrate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal }),
        }).then(x => x.json());
        removeTyping();
        if (r.ok) {
          let html = '<div style="font-size:.8rem;opacity:.7;margin-bottom:8px">Agents ran: ' + r.agentCount + '</div>';
          const EMOJIS = { boss:'', planner:'', builder:'', analyst:'', growth:'', creative:'', scout:'', copywriter:'', guardian:'' };
          r.steps.filter(s => s.task !== 'Assemble').forEach(s => {
            const em = EMOJIS[s.agent] || '';
            const badge = tierBadge(s.provider, null);
            html += '<div style="margin:6px 0;padding:8px 10px;background:#0d0d0d;border-left:2px solid #ff2a2a;border-radius:0 8px 8px 0;font-size:.78rem">' + em + ' <strong>' + s.agent.toUpperCase() + '</strong>' + badge + '<div style="margin-top:5px;color:#aaa;white-space:pre-wrap">' + (s.output||'').slice(0,300) + (s.output&&s.output.length>300?'...':'') + '</div></div>';
          });
          const finalStep = r.steps.find(s => s.task === 'Assemble');
          if (finalStep) html += '<div style="margin-top:10px;padding:10px;background:#0a0a1a;border:1px solid rgba(255,42,42,.2);border-radius:8px">' + finalStep.output.replace(/\n/g,'<br>') + '</div>';
          addMsgRich('bot', html);
          HISTORY.push({ role: 'assistant', content: r.result || 'Orchestration complete.' });
        } else {
          addMsg('bot', r.error || 'Orchestration failed');
        }
      } catch(err) {
        removeTyping();
        addMsg('bot', 'Server not reachable.');
      }
      return;
    }
    if (text === '/agents') {
      addMsg('user', text);
      showTyping();
      try {
        const r = await fetch(API + '/boss/agents').then(x => x.json());
        removeTyping();
        if (r.ok) {
          let html = '<strong>Agent Roster</strong><br><br>';
          r.agents.forEach(a => {
            html += '<strong>' + a.id + '</strong> — ' + a.desc + ' <span style="opacity:.5;font-size:.75em">[' + a.tier + ']</span><br>';
          });
          html += '<br><em style="opacity:.6">Type /orchestrate [goal] to deploy them all</em>';
          addMsgRich('bot', html);
        }
      } catch { removeTyping(); addMsg('bot', 'Server not reachable.'); }
      return;
    }
    if (text === '/studio' || text === '/creative') {
      addMsg('user', text);
      window.open('/studio.html', '_blank');
      addMsgRich('bot', 'Opening Creative Studio in new tab.');
      return;
    }
    if (text === '/keys' || text === '/settings') {
      addMsg('user', text);
      document.querySelector('[data-panel="boss-config"]')?.click();
      addMsgRich('bot', '🔑 Opening <strong>API Keys & Settings</strong>…');
      return;
    }

    // ── /pitch — full campaign pack generator ──────────────────────────────
    if (text.startsWith('/pitch') || text.startsWith('/campaign')) {
      const target = text.replace(/^\/(pitch|campaign)\s*/,'').trim();
      addMsg('user', text);
      if (!target) {
        addMsgRich('bot', `<strong>/pitch</strong> — Generate a full outreach pack.<br><br>Usage:<br><code>/pitch SaaS founders who struggle with client acquisition</code><br><code>/pitch fitness coaches who want to automate their DMs</code>`);
        return;
      }
      const typing = showTyping();
      try {
        // Load active brand profile (client-specific brand tone)
        let brandInfo = '';
        try {
          const activeBrand = localStorage.getItem('activeBrand');
          if (activeBrand) {
            const brands = JSON.parse(localStorage.getItem('brandProfiles') || '[]');
            const selected = brands.find(b => b.name === activeBrand);
            if (selected) {
              brandInfo = `\n\nBrand Context: "${selected.name}" (${selected.niche})\nBrand Voice: ${selected.voice || ''}\nTone Keywords: ${selected.keywords || ''}\nTaglines: ${selected.taglines?.join(', ') || ''}`;
            }
          }
        } catch (e) {}

        const systemPrompt = `You are B.O.S.S — a sharp sales operator. Generate complete, ready-to-send outreach assets.${brandInfo ? ' Maintain the brand identity below while staying aggressive and money-focused.' : ''} Be direct, punchy, and persuasive. No fluff. Make everything immediately usable and on-brand.`;
        const userPrompt = `Generate a complete cold outreach campaign pack for: "${target}"${brandInfo}

Deliver ALL of these, each clearly labelled and CONSISTENT with the brand above:

📧 COLD EMAIL (subject line + 4-line body + CTA)
💬 REDDIT/FORUM DM (2-3 casual lines, no pitch vibe)
🔗 LINKEDIN MESSAGE (professional, 3 sentences, soft CTA)
📱 INSTAGRAM/TWITTER DM (ultra short, 1-2 lines, curiosity hook)
📞 CALL OPENER (first 20 seconds of a cold call, confident)
🎯 KEY PAIN POINTS (3 bullet points — what they're struggling with)
💰 OFFER STATEMENT (one clear sentence — what we do + result)
❓ QUALIFYING QUESTION (one question to open a real conversation)

Keep everything tight. Real words, not templates. Output only the pack.`;

        const r = await fetch(API + '/boss/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: userPrompt }],
            system: systemPrompt,
            taskKind: 'pitch',
            maxTokens: 1200,
          })
        }).then(x => x.json());
        removeTyping();
        const out = r.text || r.reply || r.message || 'Could not generate — try again.';
        const badge = tierBadge(r.provider, null);
        let activeBrandLabel = '';
        try {
          const ab = localStorage.getItem('activeBrand');
          if (ab) activeBrandLabel = ` | Brand: <strong>${ab}</strong>`;
        } catch (e) {}
        const html = `<div style="margin-bottom:8px"><strong>🎯 Pitch Pack</strong>${badge} <span style="opacity:.5;font-size:.72rem">for: ${target.slice(0,50)}${activeBrandLabel}</span></div>`
          + `<div style="font-size:.8rem;white-space:pre-wrap;line-height:1.6;color:#d0d0e0">${out.replace(/</g,'&lt;')}</div>`
          + `<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">`
          + `<button style="background:rgba(255,42,42,.12);border:1px solid rgba(255,42,42,.2);color:var(--accent);border-radius:6px;padding:5px 12px;font-size:.75rem;cursor:pointer;font-family:inherit" onclick="navigator.clipboard.writeText(this.closest('#boss-msgs').querySelector('.boss-msg:last-of-type .boss-msg-text pre')?.textContent||'').then(()=>toast('Pack copied','ok'))"><i class="fas fa-copy"></i> Copy All</button>`
          + `<button style="background:rgba(255,255,255,.05);border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:5px 12px;font-size:.75rem;cursor:pointer;font-family:inherit" onclick="document.querySelector('[data-panel=\\'mod-cold-outreach\\']')?.click()"><i class="fas fa-comment-dots"></i> Open Outreach</button>`
          + `</div>`;
        addMsgRich('bot', html);
        HISTORY.push({ role: 'assistant', content: out });
      } catch(err) {
        removeTyping();
        addMsg('bot', 'Pitch generation failed — check AI connection in API Keys.');
      }
      return;
    }

    addMsg('user', text);
    HISTORY.push({ role: 'user', content: text });

    // AI off — just echo back a notice
    if (!AI_ENABLED) {
      removeTyping();
      addMsgRich('bot', '🔇 AI is off — go to <b>API Keys & Settings</b> to turn it back on.');
      return;
    }

    showTyping();

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
        const errMsg = r.error || '';
        if (errMsg.includes('All providers') || errMsg.includes('failed') || errMsg.includes('credit balance') || errMsg.includes('unconfigured')) {
          addMsgRich('bot', '<strong style="color:#ff2a2a">No AI provider active.</strong><br><br>' +
            '<b>Option 1 — Groq (free, fastest):</b><br>' +
            'Get key at <a href="https://console.groq.com/keys" target="_blank" style="color:#00aaff">console.groq.com/keys</a><br>' +
            'Paste in <b>Local Models</b> panel &#8594; Save<br><br>' +
            '<b>Option 2 — OpenRouter (free models, no card):</b><br>' +
            'Get key at <a href="https://openrouter.ai/keys" target="_blank" style="color:#ff9500">openrouter.ai/keys</a><br>' +
            'Paste in <b>Local Models</b> panel &#8594; Save<br><br>' +
            '<b>Option 3 — Claude (best quality):</b><br>' +
            'Top up at <a href="https://console.anthropic.com/billing" target="_blank" style="color:#aa44ff">console.anthropic.com/billing</a>');
        } else {
          addMsg('bot', '\u26a0\ufe0f ' + (errMsg || 'B.O.S.S offline — check API Keys & Settings.'));
        }
      }
    } catch (err) {
      removeTyping();
      addMsg('bot', '\u26a0\ufe0f Server not reachable — is the Node server running on port 4000?');
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
        document.getElementById('ollama-install-banner')?.setAttribute('style','display:block;background:#0d0d0d;border:1px solid #ff2a2a33;border-radius:12px;padding:18px 22px;margin-bottom:24px');
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

    // Load saved keys
    const cfg = await fetch(API + '/config').then(r => r.json()).catch(() => ({}));
    const groqInp = document.getElementById('cfg-groq-key');
    if (groqInp && cfg.groqApiKey) groqInp.value = cfg.groqApiKey;
    const orInp = document.getElementById('cfg-openrouter-key');
    if (orInp && cfg.openrouterApiKey) orInp.value = cfg.openrouterApiKey;
    // Load router status badges
    try {
      const st = await fetch(API + '/boss/router').then(r => r.json());
      const msg = document.getElementById('models-msg');
      if (msg) {
        const badges = [];
        if (st.groq)       badges.push('<span style="color:#00aaff;font-weight:700">GROQ ✓</span>');
        if (st.openrouter) badges.push('<span style="color:#ff9500;font-weight:700">OPENROUTER ✓</span>');
        if (st.anthropic)  badges.push('<span style="color:#aa44ff;font-weight:700">CLAUDE ✓</span>');
        if (st.ollama?.running) badges.push('<span style="color:#2cb67d;font-weight:700">OLLAMA ✓</span>');
        msg.innerHTML = badges.length ? 'Active: ' + badges.join(' · ') : '<span style="color:#f55">No providers active — add a key above.</span>';
      }
    } catch(_) {}
  };

  window.bossPullModel = async function(model) {
    const msg = document.getElementById('models-msg');
    if (msg) { msg.textContent = `⬇ Pulling ${model} in background…`; msg.style.color = '#ff2a2a'; }
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

  // ── FREE GPU PANEL ───────────────────────────────────────────────────────

  const GPU_SNIPPETS = {
    'colab-drive': `# ── Cell 1: Mount Drive + set save dir ────────────────────
from google.colab import drive
drive.mount('/content/drive')

import os
SAVE_DIR = '/content/drive/MyDrive/boss-models/'
os.makedirs(SAVE_DIR, exist_ok=True)
print(f"Saving to: {SAVE_DIR}")`,

    'colab-4bit': `# ── 4-bit quantised load (bitsandbytes) ───────────────────
!pip install -q transformers bitsandbytes accelerate

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

MODEL = "Qwen/Qwen2.5-7B-Instruct"   # swap for any model

bnb_cfg = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

tokenizer = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForCausalLM.from_pretrained(
    MODEL, quantization_config=bnb_cfg, device_map="auto"
)
print(f"Loaded {MODEL} in 4-bit — VRAM: {torch.cuda.memory_allocated()/1e9:.1f}GB")`,

    'kaggle-setup': `# ── Kaggle setup cell ─────────────────────────────────────
import os
WORK_DIR = "/kaggle/working/boss-outputs"
os.makedirs(WORK_DIR, exist_ok=True)
os.system("pip install -q transformers bitsandbytes accelerate peft")
os.system("nvidia-smi --query-gpu=name,memory.total --format=csv,noheader")
print("Ready")`,

    'lora': `# ── LoRA fine-tune on custom data ─────────────────────────
!pip install -q transformers peft bitsandbytes accelerate datasets trl
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, TaskType
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import Dataset
import torch, os

SAVE_DIR = '/content/drive/MyDrive/boss-lora/'
os.makedirs(SAVE_DIR, exist_ok=True)

MODEL = "Qwen/Qwen2.5-7B-Instruct"
bnb   = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.float16)
model = AutoModelForCausalLM.from_pretrained(MODEL, quantization_config=bnb, device_map="auto")
tokenizer = AutoTokenizer.from_pretrained(MODEL)

lora_cfg = LoraConfig(r=16, lora_alpha=32, target_modules=["q_proj","v_proj"],
                      lora_dropout=0.05, task_type=TaskType.CAUSAL_LM)
model = get_peft_model(model, lora_cfg)
model.print_trainable_parameters()

train_data = [{"text": "### Human: What is TheSaaSsin?\\n### Assistant: AI client acquisition operator."}]
dataset = Dataset.from_list(train_data)

args = TrainingArguments(output_dir=SAVE_DIR, num_train_epochs=3,
                         per_device_train_batch_size=2, save_steps=50, fp16=True)
trainer = SFTTrainer(model=model, tokenizer=tokenizer, train_dataset=dataset,
                     dataset_text_field="text", args=args, max_seq_length=512)
trainer.train()
model.save_pretrained(SAVE_DIR)
print(f"Saved to {SAVE_DIR}")`,

    'sd-colab': `# ── SDXL on free T4 ──────────────────────────────────────
!pip install -q diffusers transformers accelerate
from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
import torch

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16, use_safetensors=True, variant="fp16"
).to("cuda")
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
pipe.enable_xformers_memory_efficient_attention()

prompt = "TheSaaSsin operator dashboard, dark neon UI, cinematic, 8k"
image  = pipe(prompt=prompt, num_inference_steps=25, guidance_scale=7.5).images[0]
image.save("/content/drive/MyDrive/boss-models/render.png")
image`,

    'hf-zerogpu': `# app.py — HF Space with ZeroGPU
import gradio as gr
import spaces
import torch
from transformers import pipeline

pipe = pipeline("text-generation", model="Qwen/Qwen2.5-7B-Instruct",
                torch_dtype=torch.float16)

@spaces.GPU
def generate(prompt, max_tokens=256):
    result = pipe(prompt, max_new_tokens=max_tokens, do_sample=True, temperature=0.7)
    return result[0]["generated_text"]

gr.Interface(fn=generate,
             inputs=gr.Textbox(label="Prompt"),
             outputs=gr.Textbox(label="Output"),
             title="B.O.S.S Inference").launch()`,
  };

  window.gpuCopy = function(key) {
    const text = GPU_SNIPPETS[key];
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      addMsgRich('bot', `📋 Copied <b>${key}</b> template — paste into your notebook.`);
    }).catch(() => {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      addMsgRich('bot', `📋 Copied <b>${key}</b> template.`);
    });
  };

  window.bossLoadGPU = function() {
    // Off-peak clock
    const now = new Date();
    const ukHour = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' })).getHours();
    const offPeak = ukHour >= 3 && ukHour < 8;
    const timeEl = document.getElementById('gpu-time-label');
    const peakEl = document.getElementById('gpu-peak-label');
    if (timeEl) timeEl.textContent = ukHour.toString().padStart(2,'0') + ':00 UK';
    if (peakEl) {
      peakEl.textContent = offPeak ? '🟢 OFF-PEAK — best time now!' : '🟡 Peak hours — queues longer';
      peakEl.style.color = offPeak ? '#2cb67d' : '#ff9500';
    }
    const detailEl = document.getElementById('gpu-offpeak-detail');
    if (detailEl) {
      detailEl.innerHTML = offPeak
        ? '<span style="color:#2cb67d;font-weight:700">✓ Off-peak right now (3am–8am UK)</span> — US and EU asleep, GPU allocation is fastest. Good time to kick off a training run.'
        : '<b>Off-peak window:</b> 3am–8am UK time — that\'s when Colab, Kaggle and HF GPU queues are shortest. US West Coast is midnight, EU is 4–9am. If you have a long run, schedule it to start around 3am UK and it\'ll finish by morning.';
    }
  };

  // ── AI TOOLS PANEL ───────────────────────────────────────────────────────
  window.bossLoadAITools = async function() {
    try {
      const st = await fetch(API + '/boss/router').then(r => r.json());
      const bar = document.getElementById('ait-status-bar');
      if (bar) {
        const providers = [
          { key: 'groq',       label: 'GROQ',        color: '#00aaff' },
          { key: 'glm',        label: 'GLM',          color: '#44aaff' },
          { key: 'openrouter', label: 'OPENROUTER',   color: '#ff9500' },
          { key: 'kimi',       label: 'KIMI',         color: '#00ddaa' },
          { key: 'minimax',    label: 'MINIMAX',      color: '#ff6688' },
          { key: 'anthropic',  label: 'CLAUDE',       color: '#aa44ff' },
        ];
        bar.innerHTML = providers.map(p => {
          const on = st[p.key];
          return `<span style="font-size:.65rem;font-weight:700;padding:3px 10px;border-radius:100px;background:${on ? p.color+'22' : '#1a1a1a'};color:${on ? p.color : '#333'};border:1px solid ${on ? p.color+'44' : '#1a1a1a'}">${p.label} ${on ? '✓' : '—'}</span>`;
        }).join('');
      }
      // Highlight active cards
      ['groq','glm','openrouter','kimi','minimax','anthropic'].forEach(k => {
        const el = document.getElementById('aitc-' + k);
        if (el) el.classList.toggle('active', !!st[k]);
      });
      // Ollama status
      const olEl = document.getElementById('ait-ollama-status');
      if (olEl) {
        if (st.ollama?.running) {
          const models = st.ollama.models.map(m => m.name).join(' · ') || 'running, no models pulled';
          olEl.textContent = '● Online — ' + models;
          olEl.style.color = '#2cb67d';
        } else {
          olEl.textContent = '○ Not running — install Ollama below';
          olEl.style.color = '#555';
        }
      }
    } catch(_) {}
  };

  window.bossGroqSave = async function() {
    const key = (document.getElementById('cfg-groq-key')?.value || '').trim();
    const msg = document.getElementById('models-msg');
    if (!key) { if (msg) { msg.innerHTML = '<span style="color:#f55">Paste your Groq key first.</span>'; } return; }
    await fetch(API + '/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groqApiKey: key }),
    });
    if (msg) { msg.innerHTML = '<span style="color:#00aaff">✓ Groq key saved — B.O.S.S is now FREE via Llama 3.3 70B</span>'; }
    setTimeout(bossLoadModels, 600);
  };

  window.bossOpenrouterSave = async function() {
    const key = (document.getElementById('cfg-openrouter-key')?.value || '').trim();
    const msg = document.getElementById('models-msg');
    if (!key) { if (msg) { msg.innerHTML = '<span style="color:#f55">Paste your OpenRouter key first.</span>'; } return; }
    await fetch(API + '/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ openrouterApiKey: key }),
    });
    if (msg) { msg.innerHTML = '<span style="color:#ff9500">✓ OpenRouter saved — free models active as backup</span>'; }
    setTimeout(bossLoadModels, 600);
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
      document.getElementById('cs-mp4-status').style.color  = r.mp4 ? '#ff2a2a' : '#666';
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
        el.style.color = r.status === 'done' ? '#ff2a2a' : r.status === 'running' ? '#ffaa00' : r.status === 'error' ? '#f55' : '#666';
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
