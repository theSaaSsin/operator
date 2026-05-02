({
  init() {},
  async render(container) {
    let templates = [];
    try { templates = JSON.parse(localStorage.getItem('outreachTemplates') || '[]'); } catch {}

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e" id="co-stat-saved">${templates.length}</div><div class="mod-stat-label">Saved</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)" id="co-stat-used">${templates.filter(t=>t.used).length}</div><div class="mod-stat-label">Used</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b" id="co-stat-replied">${templates.filter(t=>t.replied).length}</div><div class="mod-stat-label">Replies</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#a855f7" id="co-stat-ai">AI</div><div class="mod-stat-label">Powered</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-wand-magic-sparkles" style="color:#ff2a2a"></i> AI Message Generator</div>
        <div class="mod-form-grid">
          <div class="mod-field">
            <label>Lead Name</label>
            <input id="co-name" class="mod-input" placeholder="e.g. James"/>
          </div>
          <div class="mod-field">
            <label>Their Pain Point *</label>
            <input id="co-pain" class="mod-input" placeholder="e.g. no clients, zero sales, can't grow"/>
          </div>
          <div class="mod-field">
            <label>Platform</label>
            <select id="co-platform" class="mod-input">
              <option>Reddit DM</option>
              <option>LinkedIn</option>
              <option>Cold Email</option>
              <option>Instagram DM</option>
              <option>Twitter/X DM</option>
              <option>WhatsApp</option>
            </select>
          </div>
          <div class="mod-field">
            <label>Your Offer / Solution</label>
            <input id="co-offer" class="mod-input" placeholder="e.g. AI client acquisition system for SaaS founders"/>
          </div>
          <div class="mod-field">
            <label>Their Niche (optional)</label>
            <input id="co-niche" class="mod-input" placeholder="e.g. fitness coaches, e-com brands, agencies"/>
          </div>
          <div class="mod-field">
            <label>Tone</label>
            <select id="co-tone" class="mod-input">
              <option value="direct">Direct &amp; punchy</option>
              <option value="friendly">Friendly &amp; casual</option>
              <option value="professional">Professional</option>
              <option value="provocative">Provocative / pattern-interrupt</option>
            </select>
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <button class="mod-btn" id="co-btn-ai" onclick="_coGenAI()">
            <i class="fas fa-robot"></i> AI Generate
          </button>
          <button class="mod-btn" style="background:rgba(255,255,255,.06)" onclick="_coGenTemplate()">
            <i class="fas fa-bolt"></i> Quick Template
          </button>
          <button class="mod-btn mod-btn-sm" style="margin-left:auto;background:rgba(255,255,255,.04)" onclick="_coBatchGen()">
            <i class="fas fa-layer-group"></i> Batch (3 variants)
          </button>
        </div>

        <div id="co-loading" style="display:none;padding:10px 0;color:var(--muted);font-size:.8rem">
          <i class="fas fa-circle-notch fa-spin"></i> B.O.S.S is writing…
        </div>

        <textarea id="co-output" class="mod-textarea" style="margin-top:10px;height:160px;font-size:.82rem" placeholder="Generated message will appear here…"></textarea>

        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <button class="mod-btn mod-btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('co-output').value).then(()=>window.toast&&toast('Copied!','ok'))">
            <i class="fas fa-copy"></i> Copy
          </button>
          <button class="mod-btn mod-btn-sm" onclick="_coSave()">
            <i class="fas fa-save"></i> Save Template
          </button>
          <button class="mod-btn mod-btn-sm" style="background:rgba(255,42,42,.12);color:var(--accent)" onclick="_coPushToOutreach()">
            <i class="fas fa-paper-plane"></i> Push to Outreach Queue
          </button>
        </div>
      </div>

      <div class="mod-section" id="co-batch-section" style="display:none">
        <div class="mod-section-title"><i class="fas fa-layer-group"></i> Batch Variants</div>
        <div id="co-batch-grid" style="display:flex;flex-direction:column;gap:10px"></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title" style="display:flex;justify-content:space-between;align-items:center">
          <span><i class="fas fa-folder"></i> Saved Templates (<span id="co-tpl-count">${templates.length}</span>)</span>
          <button class="mod-btn mod-btn-sm" style="background:rgba(239,68,68,.1);color:#ef4444" onclick="_coClearAll()">
            <i class="fas fa-trash"></i> Clear All
          </button>
        </div>
        <div id="co-tpl-list"></div>
      </div>`;

    _coRenderTemplates();

    // ── AI Generate ──
    window._coGenAI = async function() {
      const pain   = document.getElementById('co-pain').value.trim();
      const name   = document.getElementById('co-name').value.trim() || 'there';
      const offer  = document.getElementById('co-offer').value.trim() || 'an AI client acquisition system';
      const niche  = document.getElementById('co-niche').value.trim();
      const plat   = document.getElementById('co-platform').value;
      const tone   = document.getElementById('co-tone').value;
      if (!pain) { window.toast && toast('Enter their pain point first', 'err'); return; }

      document.getElementById('co-loading').style.display = 'block';
      document.getElementById('co-btn-ai').disabled = true;

      const toneDesc = { direct:'direct and punchy — no fluff, hook + value + CTA',
                         friendly:'friendly and casual — feels like a mate, not a salesman',
                         professional:'professional — clear, credible, respected',
                         provocative:'provocative pattern-interrupt — challenges their current situation' }[tone] || tone;

      const prompt = `Write a cold outreach message for ${plat} to a prospect named ${name}${niche?' who is a '+niche:''}.
Their pain point: ${pain}
My solution: ${offer}
Tone: ${toneDesc}
Platform constraints: ${plat === 'Reddit DM' ? 'casual, short, no formal salutation' : plat === 'LinkedIn' ? 'professional but human, 3-4 sentences max' : plat === 'Cold Email' ? 'subject line + 3-4 lines body + CTA' : 'short DM, 2-3 sentences max'}

Requirements:
- Start with THEIR problem (not your solution)
- No generic openers like "Hope this finds you well" or "I came across your profile"
- One clear call to action
- Under 100 words (unless cold email)
${plat === 'Cold Email' ? '- Include: SUBJECT: line at the top' : ''}

Output ONLY the message, no explanation.`;

      try {
        const res = await fetch('/api/boss/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            taskKind: 'pitch',
          })
        });
        const data = await res.json();
        const text = data.text || data.reply || data.message || '';
        document.getElementById('co-output').value = text;
      } catch (e) {
        document.getElementById('co-output').value = `[AI offline — using template]\n\nHey ${name}, saw you're dealing with ${pain}.\n\nWe built ${offer} specifically for this — takes 15 mins to see if it fits your situation.\n\nWant me to show you?`;
      }

      document.getElementById('co-loading').style.display = 'none';
      document.getElementById('co-btn-ai').disabled = false;
    };

    // ── Quick Template (no AI needed) ──
    window._coGenTemplate = function() {
      const pain  = document.getElementById('co-pain').value.trim() || 'getting clients';
      const name  = document.getElementById('co-name').value.trim() || 'there';
      const offer = document.getElementById('co-offer').value.trim() || 'a system that fixes this';
      const plat  = document.getElementById('co-platform').value;
      const starters = [
        `Saw you're struggling with ${pain} — that's exactly what we fix.`,
        `You mentioned ${pain} — we built a system specifically for that.`,
        `Quick one — noticed the ${pain} issue. Happy to show you what we do in 15 mins.`,
        `The ${pain} problem kills most people in your position. We solved it.`,
      ];
      const starter = starters[Math.floor(Math.random() * starters.length)];
      const msg = plat === 'Cold Email'
        ? `SUBJECT: Re: ${pain}\n\nHey ${name},\n\n${starter}\n\n${offer} — designed to handle this exactly. No pitch, just a quick look to see if it fits.\n\nGot 15 mins this week?`
        : `Hey ${name}, ${starter}\n\n${offer} — takes 15 minutes to see if it fits. Want me to show you how it works?`;
      document.getElementById('co-output').value = msg;
    };

    // ── Batch: 3 AI variants ──
    window._coBatchGen = async function() {
      const pain   = document.getElementById('co-pain').value.trim();
      const name   = document.getElementById('co-name').value.trim() || 'there';
      const offer  = document.getElementById('co-offer').value.trim() || 'an AI client acquisition system';
      const plat   = document.getElementById('co-platform').value;
      if (!pain) { window.toast && toast('Enter pain point first', 'err'); return; }

      document.getElementById('co-loading').style.display = 'block';
      document.getElementById('co-batch-section').style.display = 'block';
      document.getElementById('co-batch-grid').innerHTML = '<div class="mod-muted" style="font-size:.8rem"><i class="fas fa-circle-notch fa-spin"></i> Generating 3 variants…</div>';

      const prompt = `Write 3 different cold outreach messages for ${plat} to ${name} about their problem: ${pain}.
Solution: ${offer}
Make each one distinctly different in tone/angle: (1) direct problem-focused, (2) social proof / curiosity, (3) friendly challeng.
Format:
---VARIANT 1---
[message]
---VARIANT 2---
[message]
---VARIANT 3---
[message]
Under 80 words each. Output ONLY the variants.`;

      try {
        const res = await fetch('/api/boss/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], taskKind: 'pitch', maxTokens: 800 })
        });
        const data = await res.json();
        const text = data.text || data.reply || '';
        const variants = text.split(/---VARIANT \d+---/).map(s => s.trim()).filter(Boolean);
        document.getElementById('co-batch-grid').innerHTML = variants.map((v, i) => `
          <div class="mod-card" style="padding:12px">
            <div style="font-size:.68rem;font-weight:700;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">Variant ${i+1}</div>
            <div style="font-size:.82rem;white-space:pre-wrap;line-height:1.5">${v}</div>
            <div style="display:flex;gap:8px;margin-top:8px">
              <button class="mod-btn mod-btn-sm" onclick="document.getElementById('co-output').value=\`${v.replace(/`/g,"'")}\`;document.getElementById('co-batch-section').style.display='none'">Use This</button>
              <button class="mod-btn mod-btn-sm" onclick="navigator.clipboard.writeText(\`${v.replace(/`/g,"'")}\`).then(()=>window.toast&&toast('Copied','ok'))"><i class="fas fa-copy"></i> Copy</button>
            </div>
          </div>`).join('');
      } catch {
        document.getElementById('co-batch-grid').innerHTML = '<div class="mod-empty">AI offline — try Quick Template instead</div>';
      }
      document.getElementById('co-loading').style.display = 'none';
    };

    window._coSave = function() {
      const msg = document.getElementById('co-output').value.trim();
      if (!msg) { window.toast && toast('Generate a message first', 'err'); return; }
      let t = JSON.parse(localStorage.getItem('outreachTemplates') || '[]');
      t.unshift({ id: Date.now(), text: msg, pain: document.getElementById('co-pain').value.trim(),
                  platform: document.getElementById('co-platform').value, used: false, replied: false,
                  savedAt: new Date().toISOString() });
      localStorage.setItem('outreachTemplates', JSON.stringify(t));
      templates = t;
      document.getElementById('co-stat-saved').textContent = t.length;
      document.getElementById('co-tpl-count').textContent = t.length;
      _coRenderTemplates();
      window.toast && toast('Template saved', 'ok');
    };

    window._coPushToOutreach = function() {
      const msg = document.getElementById('co-output').value.trim();
      if (!msg) { window.toast && toast('Generate a message first', 'err'); return; }
      try {
        const q = JSON.parse(localStorage.getItem('outreachQueue') || '[]');
        q.unshift({ id: Date.now(), message: msg, status: 'queued', addedAt: new Date().toISOString() });
        localStorage.setItem('outreachQueue', JSON.stringify(q));
        window.toast && toast('Pushed to Outreach Queue', 'ok');
      } catch { window.toast && toast('Could not push to queue', 'err'); }
    };

    window._coClearAll = function() {
      if (!confirm('Clear all saved templates?')) return;
      localStorage.removeItem('outreachTemplates');
      templates = [];
      document.getElementById('co-stat-saved').textContent = 0;
      document.getElementById('co-tpl-count').textContent = 0;
      _coRenderTemplates();
      window.toast && toast('Cleared', 'ok');
    };

    function _coRenderTemplates() {
      let t = [];
      try { t = JSON.parse(localStorage.getItem('outreachTemplates') || '[]'); } catch {}
      const el = document.getElementById('co-tpl-list');
      if (!el) return;
      if (!t.length) { el.innerHTML = '<div class="mod-empty"><i class="fas fa-comment-dots"></i> No templates yet — generate and save one</div>'; return; }
      el.innerHTML = t.slice(0, 12).map((tpl, i) => `
        <div class="mod-list-item">
          <div style="font-size:.68rem;color:var(--muted);margin-bottom:4px">${tpl.platform || ''} · ${new Date(tpl.savedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
          <div style="font-size:.8rem;line-height:1.45">${tpl.text.substring(0, 160)}${tpl.text.length > 160 ? '…' : ''}</div>
          <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
            <button class="mod-btn mod-btn-sm" onclick="document.getElementById('co-output').value=\`${tpl.text.replace(/`/g,"'")}\`">Use</button>
            <button class="mod-btn mod-btn-sm" onclick="navigator.clipboard.writeText(\`${tpl.text.replace(/`/g,"'")}\`).then(()=>window.toast&&toast('Copied','ok'))"><i class="fas fa-copy"></i></button>
            ${tpl.used ? '<span class="mod-badge badge-ok">Used</span>' : ''}
            ${tpl.replied ? '<span class="mod-badge badge-warn">Replied</span>' : ''}
            <button class="mod-btn mod-btn-sm" style="color:#ef4444;margin-left:auto" onclick="_coDeleteTpl(${i})"><i class="fas fa-trash"></i></button>
          </div>
        </div>`).join('');
    }

    window._coDeleteTpl = function(i) {
      let t = JSON.parse(localStorage.getItem('outreachTemplates') || '[]');
      t.splice(i, 1);
      localStorage.setItem('outreachTemplates', JSON.stringify(t));
      templates = t;
      document.getElementById('co-stat-saved').textContent = t.length;
      document.getElementById('co-tpl-count').textContent = t.length;
      _coRenderTemplates();
    };
  },

  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:10px">Module 16 — Cold Outreach Generator</p>
      <p style="font-size:.75rem;color:var(--muted);line-height:1.5">AI-powered cold messages for Reddit, LinkedIn, Email, Instagram, Twitter. Uses B.O.S.S AI (Groq free tier by default — no cost). Generates single messages or 3-variant batches.</p>
      <div style="margin-top:14px;padding:10px;background:rgba(255,42,42,.06);border-radius:6px;font-size:.75rem;line-height:1.5">
        <strong style="color:var(--accent)">Tip:</strong> Best results when you fill in all fields. The AI adapts tone, length and CTA to the platform automatically.
      </div>`;
  }
})
