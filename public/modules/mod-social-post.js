({
  init() {},

  async render(container) {
    let drafts = [];
    try { drafts = JSON.parse(localStorage.getItem('socialDrafts') || '[]'); } catch {}
    const activeBrand = localStorage.getItem('activeBrand') || '';

    container.innerHTML = `
      <!-- ═══════════════════════════════════════════════
           TOP: POST COMPOSER
      ════════════════════════════════════════════════ -->
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-pen-nib" style="color:var(--accent)"></i> Post Composer</div>
        <div class="mod-card">

          <!-- Caption -->
          <div style="margin-bottom:10px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Caption</label>
            <textarea id="sps-caption" rows="4"
              placeholder="Write your caption here, or use AI to generate one…"
              oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
              style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:10px;color:var(--text);font-size:.84rem;font-family:inherit;resize:none;overflow:hidden;line-height:1.55;box-sizing:border-box"></textarea>
          </div>

          <!-- AI Caption row -->
          <div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:12px">
            <div style="flex:1;min-width:180px">
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Topic / hook for AI</label>
              <input id="sps-topic" type="text" class="mod-input" placeholder="e.g. why most agencies fail at retention"
                style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit;box-sizing:border-box">
            </div>
            <button class="btn btn-primary btn-sm" id="sps-ai-btn" onclick="_spsGenCaption()" style="white-space:nowrap">
              <i class="fas fa-magic"></i> Generate Caption with AI
            </button>
          </div>

          <!-- Platform selector -->
          <div style="margin-bottom:12px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:6px">Platforms</label>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              ${[
                { id: 'x',        label: 'X / Twitter', icon: 'fab fa-x-twitter' },
                { id: 'linkedin', label: 'LinkedIn',     icon: 'fab fa-linkedin'  },
                { id: 'instagram',label: 'Instagram',    icon: 'fab fa-instagram' },
                { id: 'telegram', label: 'Telegram',     icon: 'fab fa-telegram'  },
              ].map(p => `
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:.8rem;padding:6px 10px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:6px;transition:background .15s">
                  <input type="checkbox" id="sps-plat-${p.id}" value="${p.id}" style="accent-color:var(--accent)">
                  <i class="${p.icon}" style="font-size:.85rem"></i> ${p.label}
                </label>`).join('')}
            </div>
          </div>

          <!-- Image generation row -->
          <div style="margin-bottom:12px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Image Prompt (optional)</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <input id="sps-img-prompt" type="text" placeholder="Describe the image, or leave blank to use caption topic"
                style="flex:1;min-width:200px;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit;box-sizing:border-box">
              <button class="btn btn-secondary btn-sm" id="sps-img-btn" onclick="_spsGenImage()" style="white-space:nowrap">
                <i class="fas fa-image"></i> Generate Image
              </button>
            </div>
            <div id="sps-img-status" style="font-size:.72rem;color:var(--muted);margin-top:4px"></div>
            <div id="sps-img-preview" style="margin-top:10px"></div>
          </div>

          <!-- Status badges area -->
          <div id="sps-post-status" style="margin-bottom:10px;display:flex;gap:6px;flex-wrap:wrap"></div>

          <!-- Action row -->
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" id="sps-post-btn" onclick="_spsPostNow()">
              <i class="fas fa-paper-plane"></i> Post Now
            </button>
            <button class="btn btn-secondary btn-sm" onclick="_spsSaveDraft()">
              <i class="fas fa-save"></i> Save Draft
            </button>
            <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('sps-caption').value||'').then(()=>toast('Copied','ok'))">
              <i class="fas fa-copy"></i> Copy
            </button>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════
           MIDDLE: SAVED DRAFTS
      ════════════════════════════════════════════════ -->
      <div class="mod-section">
        <div class="mod-section-title" style="display:flex;justify-content:space-between;align-items:center">
          <span><i class="fas fa-folder-open"></i> Saved Drafts (<span id="sps-draft-count">${drafts.length}</span>)</span>
          ${drafts.length ? `<button class="btn btn-secondary btn-sm" style="font-size:.65rem;color:#ef4444" onclick="_spsClearDrafts()"><i class="fas fa-trash"></i> Clear All</button>` : ''}
        </div>
        <div id="sps-drafts-list">
          ${drafts.length ? drafts.map((d, i) => `
            <div class="mod-card" style="margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                <div style="flex:1">
                  <div style="font-size:.8rem;color:var(--text);white-space:pre-wrap;line-height:1.5;margin-bottom:6px">${d.caption.substring(0, 220)}${d.caption.length > 220 ? '…' : ''}</div>
                  <div style="font-size:.68rem;color:var(--muted)">${new Date(d.savedAt).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}${d.platforms && d.platforms.length ? ' · ' + d.platforms.join(', ') : ''}</div>
                </div>
                <div style="display:flex;gap:6px;flex-shrink:0;align-items:flex-start">
                  <button class="btn btn-primary btn-sm" onclick="_spsLoadDraft(${i})" title="Load into composer">
                    <i class="fas fa-edit"></i> Edit
                  </button>
                  <button class="btn btn-secondary btn-sm" onclick="_spsSendDraft(${i})" title="Post now">
                    <i class="fas fa-paper-plane"></i> Send
                  </button>
                  <button class="btn btn-secondary btn-sm" style="color:#ef4444" onclick="_spsDeleteDraft(${i})">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>`).join('') : '<div class="mod-empty"><i class="fas fa-folder-open"></i> No drafts saved yet</div>'}
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════
           BOTTOM: QUICK IDEAS
      ════════════════════════════════════════════════ -->
      <div class="mod-section">
        <div class="mod-section-title" style="display:flex;justify-content:space-between;align-items:center">
          <span><i class="fas fa-lightbulb" style="color:var(--accent)"></i> Quick Post Ideas</span>
          <button class="btn btn-primary btn-sm" id="sps-ideas-btn" onclick="_spsGenIdeas()" style="font-size:.72rem">
            <i class="fas fa-wand-magic-sparkles"></i> Generate 3 Ideas
          </button>
        </div>
        ${activeBrand
          ? `<div style="font-size:.72rem;color:var(--muted);margin-bottom:8px">Active brand: <strong style="color:var(--text)">${activeBrand}</strong></div>`
          : `<div style="font-size:.72rem;color:var(--muted);margin-bottom:8px">No active brand set — ideas will be generic. Set one in the Brand module.</div>`}
        <div id="sps-ideas-list">
          <div class="mod-empty"><i class="fas fa-lightbulb"></i> Click "Generate 3 Ideas" to get AI-powered post concepts</div>
        </div>
      </div>`;

    /* ─────────────────────────────────────────────────
       HELPER: get selected platforms
    ───────────────────────────────────────────────── */
    function _spsGetPlatforms() {
      return ['x', 'linkedin', 'instagram', 'telegram']
        .filter(p => document.getElementById('sps-plat-' + p)?.checked);
    }

    /* ─────────────────────────────────────────────────
       HELPER: re-render drafts list
    ───────────────────────────────────────────────── */
    function _spsRenderDrafts() {
      let d = [];
      try { d = JSON.parse(localStorage.getItem('socialDrafts') || '[]'); } catch {}
      const el = document.getElementById('sps-drafts-list');
      const countEl = document.getElementById('sps-draft-count');
      if (countEl) countEl.textContent = d.length;
      if (!el) return;
      if (!d.length) { el.innerHTML = '<div class="mod-empty"><i class="fas fa-folder-open"></i> No drafts saved yet</div>'; return; }
      el.innerHTML = d.map((draft, i) => `
        <div class="mod-card" style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <div style="flex:1">
              <div style="font-size:.8rem;color:var(--text);white-space:pre-wrap;line-height:1.5;margin-bottom:6px">${draft.caption.substring(0, 220)}${draft.caption.length > 220 ? '…' : ''}</div>
              <div style="font-size:.68rem;color:var(--muted)">${new Date(draft.savedAt).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}${draft.platforms && draft.platforms.length ? ' · ' + draft.platforms.join(', ') : ''}</div>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0;align-items:flex-start">
              <button class="btn btn-primary btn-sm" onclick="_spsLoadDraft(${i})" title="Load into composer">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="btn btn-secondary btn-sm" onclick="_spsSendDraft(${i})" title="Post now">
                <i class="fas fa-paper-plane"></i> Send
              </button>
              <button class="btn btn-secondary btn-sm" style="color:#ef4444" onclick="_spsDeleteDraft(${i})">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>`).join('');
    }

    /* ─────────────────────────────────────────────────
       AI: GENERATE CAPTION
    ───────────────────────────────────────────────── */
    window._spsGenCaption = async function() {
      const topic = (document.getElementById('sps-topic')?.value || '').trim();
      if (!topic) return toast('Enter a topic for the AI', 'err');
      const btn = document.getElementById('sps-ai-btn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Writing…';
      try {
        const res = await fetch('/api/boss/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskKind: 'socialPost',
            system: 'You are a social media expert. Write punchy, scroll-stopping captions. Include hashtags. Max 3 paragraphs.',
            messages: [{ role: 'user', content: 'Write a high-converting post about: ' + topic }]
          })
        });
        const data = await res.json();
        const text = data.text || data.reply || data.message || '';
        if (text) {
          const ta = document.getElementById('sps-caption');
          ta.value = text;
          ta.style.height = 'auto';
          ta.style.height = ta.scrollHeight + 'px';
          // Pre-fill image prompt with topic if empty
          const imgPrompt = document.getElementById('sps-img-prompt');
          if (imgPrompt && !imgPrompt.value.trim()) imgPrompt.value = topic;
          toast('Caption generated', 'ok');
        } else {
          toast('AI returned empty response', 'err');
        }
      } catch (e) {
        toast('AI offline: ' + e.message, 'err');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magic"></i> Generate Caption with AI';
      }
    };

    /* ─────────────────────────────────────────────────
       IMAGE: GENERATE
    ───────────────────────────────────────────────── */
    window._spsGenImage = async function() {
      const caption = (document.getElementById('sps-caption')?.value || '').trim();
      const topic   = (document.getElementById('sps-topic')?.value  || '').trim();
      let prompt    = (document.getElementById('sps-img-prompt')?.value || '').trim();
      if (!prompt) prompt = topic || caption.substring(0, 120);
      if (!prompt) return toast('Enter an image prompt or generate a caption first', 'err');

      const btn    = document.getElementById('sps-img-btn');
      const status = document.getElementById('sps-img-status');
      const preview= document.getElementById('sps-img-preview');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating…';
      status.textContent = 'Requesting image…';
      preview.innerHTML  = '';

      try {
        const res = await fetch('/api/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const url  = data.url || data.imageUrl || data.image || '';
        if (url) {
          preview.innerHTML = `
            <div style="position:relative;display:inline-block;max-width:100%">
              <img src="${url}" alt="Generated image" id="sps-gen-img"
                style="max-width:100%;border-radius:8px;border:1px solid var(--border);display:block">
              <div style="display:flex;gap:8px;margin-top:8px">
                <button class="btn btn-secondary btn-sm" onclick="window.open('${url}','_blank')">
                  <i class="fas fa-external-link-alt"></i> Open
                </button>
                <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${url}').then(()=>toast('URL copied','ok'))">
                  <i class="fas fa-copy"></i> Copy URL
                </button>
              </div>
            </div>`;
          status.textContent = '';
          toast('Image generated', 'ok');
          // Store generated URL for posting
          window._spsGeneratedImageUrl = url;
        } else {
          throw new Error('No image URL in response');
        }
      } catch (e) {
        status.innerHTML = '<span style="color:var(--accent)">Image gen offline — add HF_TOKEN in API Keys</span>';
        preview.innerHTML = '';
        window._spsGeneratedImageUrl = null;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-image"></i> Generate Image';
      }
    };

    /* ─────────────────────────────────────────────────
       POST NOW
    ───────────────────────────────────────────────── */
    window._spsPostNow = async function() {
      const caption   = (document.getElementById('sps-caption')?.value || '').trim();
      const platforms = _spsGetPlatforms();
      if (!caption)          return toast('Write a caption first', 'err');
      if (!platforms.length) return toast('Select at least one platform', 'err');

      const btn        = document.getElementById('sps-post-btn');
      const statusArea = document.getElementById('sps-post-status');
      btn.disabled     = true;
      btn.innerHTML    = '<i class="fas fa-spinner fa-spin"></i> Posting…';
      statusArea.innerHTML = '';

      try {
        const payload = {
          platforms,
          text: caption,
          imageUrl: window._spsGeneratedImageUrl || undefined
        };
        const res  = await fetch('/api/social/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));

        // Build per-platform status badges
        const results = data.results || {};
        const badges  = platforms.map(p => {
          const ok = results[p] !== false; // default optimistic if no per-platform result
          const label = { x: 'X/Twitter', linkedin: 'LinkedIn', instagram: 'Instagram', telegram: 'Telegram' }[p] || p;
          return `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:.72rem;font-weight:600;background:${ok ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)'};color:${ok ? '#22c55e' : '#ef4444'}">
            ${ok ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-times-circle"></i>'} ${ok ? '✓ Posted to ' : '✗ Failed on '} ${label}
          </span>`;
        }).join('');
        statusArea.innerHTML = badges;
        toast('Posted!', 'ok');
      } catch (e) {
        statusArea.innerHTML = `<span style="font-size:.75rem;color:#ef4444"><i class="fas fa-exclamation-triangle"></i> Post failed: ${e.message} — check API keys in Settings</span>`;
        toast('Post failed', 'err');
      } finally {
        btn.disabled  = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Post Now';
      }
    };

    /* ─────────────────────────────────────────────────
       SAVE DRAFT
    ───────────────────────────────────────────────── */
    window._spsSaveDraft = function() {
      const caption   = (document.getElementById('sps-caption')?.value || '').trim();
      const platforms = _spsGetPlatforms();
      const imageUrl  = window._spsGeneratedImageUrl || null;
      if (!caption) return toast('Write a caption first', 'err');
      let d = [];
      try { d = JSON.parse(localStorage.getItem('socialDrafts') || '[]'); } catch {}
      d.unshift({ caption, platforms, imageUrl, savedAt: new Date().toISOString() });
      localStorage.setItem('socialDrafts', JSON.stringify(d));
      toast('Draft saved', 'ok');
      _spsRenderDrafts();
    };

    /* ─────────────────────────────────────────────────
       LOAD DRAFT INTO COMPOSER
    ───────────────────────────────────────────────── */
    window._spsLoadDraft = function(i) {
      let d = [];
      try { d = JSON.parse(localStorage.getItem('socialDrafts') || '[]'); } catch {}
      const draft = d[i];
      if (!draft) return;
      const ta = document.getElementById('sps-caption');
      ta.value = draft.caption;
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
      // Restore platforms
      ['x', 'linkedin', 'instagram', 'telegram'].forEach(p => {
        const cb = document.getElementById('sps-plat-' + p);
        if (cb) cb.checked = draft.platforms && draft.platforms.includes(p);
      });
      if (draft.imageUrl) {
        window._spsGeneratedImageUrl = draft.imageUrl;
        document.getElementById('sps-img-preview').innerHTML = `
          <img src="${draft.imageUrl}" alt="Draft image"
            style="max-width:100%;border-radius:8px;border:1px solid var(--border);display:block">`;
      }
      toast('Draft loaded', 'ok');
    };

    /* ─────────────────────────────────────────────────
       SEND DRAFT DIRECTLY
    ───────────────────────────────────────────────── */
    window._spsSendDraft = async function(i) {
      let d = [];
      try { d = JSON.parse(localStorage.getItem('socialDrafts') || '[]'); } catch {}
      const draft = d[i];
      if (!draft) return;
      if (!draft.platforms || !draft.platforms.length) return toast('Draft has no platforms set — load and edit it first', 'err');
      try {
        const res = await fetch('/api/social/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platforms: draft.platforms, text: draft.caption, imageUrl: draft.imageUrl || undefined })
        });
        await res.json().catch(() => {});
        toast('Draft posted!', 'ok');
        // Remove from drafts after send
        d.splice(i, 1);
        localStorage.setItem('socialDrafts', JSON.stringify(d));
        _spsRenderDrafts();
      } catch (e) {
        toast('Post failed: ' + e.message, 'err');
      }
    };

    /* ─────────────────────────────────────────────────
       DELETE DRAFT
    ───────────────────────────────────────────────── */
    window._spsDeleteDraft = function(i) {
      let d = [];
      try { d = JSON.parse(localStorage.getItem('socialDrafts') || '[]'); } catch {}
      d.splice(i, 1);
      localStorage.setItem('socialDrafts', JSON.stringify(d));
      toast('Draft deleted', 'ok');
      _spsRenderDrafts();
    };

    /* ─────────────────────────────────────────────────
       CLEAR ALL DRAFTS
    ───────────────────────────────────────────────── */
    window._spsClearDrafts = function() {
      if (!confirm('Clear all saved drafts?')) return;
      localStorage.removeItem('socialDrafts');
      toast('Drafts cleared', 'ok');
      _spsRenderDrafts();
    };

    /* ─────────────────────────────────────────────────
       AI: GENERATE 3 POST IDEAS
    ───────────────────────────────────────────────── */
    window._spsGenIdeas = async function() {
      const brand = localStorage.getItem('activeBrand') || '';
      const btn   = document.getElementById('sps-ideas-btn');
      const list  = document.getElementById('sps-ideas-list');
      btn.disabled  = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Thinking…';
      list.innerHTML = '<div style="font-size:.8rem;color:var(--muted);padding:8px 0"><i class="fas fa-circle-notch fa-spin"></i> Generating ideas…</div>';

      const prompt = brand
        ? `Generate 3 scroll-stopping social media post ideas for a brand called "${brand}". For each idea, provide a short punchy title and a 1-sentence hook. Format as JSON array: [{"title":"...","hook":"..."}]. No markdown.`
        : `Generate 3 generic scroll-stopping social media post ideas for a B2B SaaS operator. For each, provide a short punchy title and a 1-sentence hook. Format as JSON array: [{"title":"...","hook":"..."}]. No markdown.`;

      try {
        const res = await fetch('/api/boss/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskKind: 'socialPost',
            system: 'You are a social media strategist. Return ONLY valid JSON — no markdown fences, no explanation.',
            messages: [{ role: 'user', content: prompt }],
            maxTokens: 400
          })
        });
        const data = await res.json();
        const text = data.text || data.reply || data.message || '';
        const match = text.match(/\[[\s\S]*?\]/);
        if (match) {
          const ideas = JSON.parse(match[0]);
          list.innerHTML = ideas.map((idea, i) => `
            <div class="mod-card" style="margin-bottom:8px;display:flex;align-items:flex-start;gap:10px">
              <div style="background:var(--accent);color:#fff;font-size:.65rem;font-weight:700;padding:2px 7px;border-radius:20px;flex-shrink:0;margin-top:2px">${i + 1}</div>
              <div style="flex:1">
                <div style="font-size:.82rem;font-weight:600;color:var(--text);margin-bottom:2px">${idea.title || ''}</div>
                <div style="font-size:.76rem;color:var(--muted);line-height:1.45">${idea.hook || ''}</div>
              </div>
              <button class="btn btn-secondary btn-sm" style="flex-shrink:0;font-size:.65rem"
                onclick="(function(){const ta=document.getElementById('sps-caption');ta.value=${JSON.stringify((idea.title || '') + '\n\n' + (idea.hook || ''))};ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';const ti=document.getElementById('sps-topic');if(ti)ti.value=${JSON.stringify(idea.title||'')};toast('Loaded into composer','ok')})()">
                Use
              </button>
            </div>`).join('');
        } else {
          list.innerHTML = `<div class="mod-card" style="font-size:.78rem;white-space:pre-wrap;color:var(--text)">${text}</div>`;
        }
      } catch (e) {
        list.innerHTML = '<div class="mod-empty"><i class="fas fa-exclamation-triangle"></i> AI offline — check your API key</div>';
      } finally {
        btn.disabled  = false;
        btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate 3 Ideas';
      }
    };
  },

  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Social Post Studio — full composer with AI captions, image generation, drafts, and cross-platform posting.</p>

      <div style="margin-bottom:16px">
        <div style="font-size:.72rem;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Required API Keys</div>

        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:6px;padding:10px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <i class="fab fa-x-twitter" style="font-size:.85rem"></i>
              <strong style="font-size:.78rem">X / Twitter</strong>
            </div>
            <code style="font-size:.7rem;color:var(--accent)">X_BEARER_TOKEN</code>
            <p style="font-size:.7rem;color:var(--muted);margin:4px 0 0">OAuth 2.0 Bearer token from <a href="https://developer.twitter.com" target="_blank" style="color:var(--accent)">developer.twitter.com</a>. Requires Basic or Pro plan for posting.</p>
          </div>

          <div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:6px;padding:10px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <i class="fab fa-linkedin" style="font-size:.85rem"></i>
              <strong style="font-size:.78rem">LinkedIn</strong>
            </div>
            <code style="font-size:.7rem;color:var(--accent)">LINKEDIN_TOKEN</code>
            <p style="font-size:.7rem;color:var(--muted);margin:4px 0 0">OAuth 2.0 access token from <a href="https://www.linkedin.com/developers" target="_blank" style="color:var(--accent)">linkedin.com/developers</a>. Needs <em>w_member_social</em> scope.</p>
          </div>

          <div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:6px;padding:10px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <i class="fab fa-instagram" style="font-size:.85rem"></i>
              <strong style="font-size:.78rem">Instagram</strong>
            </div>
            <code style="font-size:.7rem;color:var(--accent)">IG_ACCESS_TOKEN</code>
            <p style="font-size:.7rem;color:var(--muted);margin:4px 0 0">Long-lived access token via <a href="https://developers.facebook.com" target="_blank" style="color:var(--accent)">Meta for Developers</a>. Requires Instagram Business account linked to a Facebook Page.</p>
          </div>

          <div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:6px;padding:10px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <i class="fab fa-telegram" style="font-size:.85rem"></i>
              <strong style="font-size:.78rem">Telegram</strong>
            </div>
            <code style="font-size:.7rem;color:var(--accent)">TELEGRAM_BOT_TOKEN</code> + <code style="font-size:.7rem;color:var(--accent)">TELEGRAM_CHAT_ID</code>
            <p style="font-size:.7rem;color:var(--muted);margin:4px 0 0">Create a bot via <a href="https://t.me/BotFather" target="_blank" style="color:var(--accent)">@BotFather</a> and get the chat/channel ID where the bot is an admin.</p>
          </div>

          <div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:6px;padding:10px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <i class="fas fa-image" style="font-size:.85rem;color:var(--accent)"></i>
              <strong style="font-size:.78rem">Image Generation</strong>
            </div>
            <code style="font-size:.7rem;color:var(--accent)">HF_TOKEN</code>
            <p style="font-size:.7rem;color:var(--muted);margin:4px 0 0">Hugging Face API token from <a href="https://huggingface.co/settings/tokens" target="_blank" style="color:var(--accent)">huggingface.co/settings/tokens</a>. Used by the <code>/api/image/generate</code> endpoint.</p>
          </div>
        </div>
      </div>

      <div style="padding:10px;background:rgba(255,42,42,.06);border-radius:6px;font-size:.73rem;line-height:1.5;color:var(--muted)">
        <strong style="color:var(--accent)">Tip:</strong> Add all tokens in the <strong>API Keys</strong> module. The server reads them from your <code>.env</code> file — never store them in the browser.
      </div>`;
  }
})
