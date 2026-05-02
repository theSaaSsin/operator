({
  init() {},
  async render(container) {
    let brands = [];
    try { brands = JSON.parse(localStorage.getItem('brandProfiles') || '[]'); } catch {}

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${brands.length}</div><div class="mod-stat-label">Brand Profiles</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">AI Brand Identity Generator</div>
        <div class="mod-card">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Business Name</label>
              <input type="text" id="br-name" placeholder="e.g. BrightSmile Dental" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Niche / Industry</label>
              <input type="text" id="br-niche" placeholder="e.g. dental clinic" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
          </div>
          <div style="margin-bottom:8px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Brand Personality / Keywords</label>
            <input type="text" id="br-keywords" placeholder="e.g. modern, friendly, trustworthy, clean" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
          </div>
          <button class="btn btn-primary btn-sm" id="br-gen-btn" onclick="_genBrand()"><i class="fas fa-palette"></i> Generate Brand Identity</button>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Brand Profiles (${brands.length})</div>
        ${brands.length ? brands.map((b, i) => {
          const isActive = localStorage.getItem('activeBrand') === b.name;
          return `
          <div class="mod-card" style="margin-bottom:10px;${isActive ? 'border:1px solid var(--accent);background:rgba(255,42,42,.06)' : ''}">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <div>
                <strong style="font-size:.9rem">${b.name}${isActive ? ' <span style="color:var(--accent);font-size:.7rem;margin-left:6px">✓ ACTIVE</span>' : ''}</strong>
                <span style="font-size:.7rem;color:var(--muted);margin-left:8px">${b.niche || ''}</span>
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn btn-secondary btn-sm" onclick="_setActiveBrand('${b.name}')" style="${isActive ? 'background:var(--accent);color:#000' : 'color:var(--muted)'}" title="Use this brand for pitch generation"><i class="fas fa-check"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="_deleteBrand(${i})" style="color:#ef4444"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            ${b.taglines ? `<div style="margin-bottom:8px">
              <div style="font-size:.72rem;font-weight:600;color:var(--muted);margin-bottom:4px">TAGLINES</div>
              ${b.taglines.map(t => `<div style="font-size:.8rem;color:var(--text);padding:2px 0;font-style:italic">"${t}"</div>`).join('')}
            </div>` : ''}
            ${b.colors ? `<div style="margin-bottom:8px">
              <div style="font-size:.72rem;font-weight:600;color:var(--muted);margin-bottom:4px">COLOR PALETTE</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                ${b.colors.map(c => `<div style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.04);padding:4px 8px;border-radius:6px">
                  <div style="width:24px;height:24px;border-radius:4px;background:${c.hex || c}"></div>
                  <div><div style="font-size:.72rem;color:var(--text)">${c.name || c}</div><div style="font-size:.65rem;color:var(--muted)">${c.hex || c}</div></div>
                </div>`).join('')}
              </div>
            </div>` : ''}
            ${b.fonts ? `<div style="margin-bottom:8px">
              <div style="font-size:.72rem;font-weight:600;color:var(--muted);margin-bottom:4px">FONTS</div>
              ${b.fonts.map(f => `<div style="font-size:.78rem;color:var(--text);padding:2px 0">${f}</div>`).join('')}
            </div>` : ''}
            ${b.voice ? `<div>
              <div style="font-size:.72rem;font-weight:600;color:var(--muted);margin-bottom:4px">BRAND VOICE</div>
              <div style="font-size:.78rem;color:var(--muted)">${b.voice}</div>
            </div>` : ''}
          </div>
        `;
        }).join('') : '<div class="mod-empty"><i class="fas fa-paint-brush"></i>No brand profiles yet — generate one above</div>'}
      </div>`;

    window._genBrand = async function() {
      const name = document.getElementById('br-name').value.trim();
      const niche = document.getElementById('br-niche').value.trim();
      if (!name) return toast('Enter a business name', 'err');
      if (!niche) return toast('Enter a niche', 'err');
      const keywords = document.getElementById('br-keywords').value.trim();
      const btn = document.getElementById('br-gen-btn');
      btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
      try {
        const resp = await fetch('/api/boss/chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskKind: 'analyse',
            system: 'Generate a brand identity. Return ONLY valid JSON (no markdown, no ```json blocks, just raw JSON) with these exact fields:\n- "taglines": array of 3 tagline strings\n- "colors": array of 5 objects with "name" (string) and "hex" (string) fields\n- "fonts": array of 3 font name strings\n- "voice": string describing brand voice in 1-2 sentences',
            messages: [{ role: 'user', content: `Generate brand identity for "${name}" (${niche}).${keywords ? ' Personality: ' + keywords : ''}` }],
            maxTokens: 800
          })
        });
        const data = await resp.json();
        const text = data.text || '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          brands.unshift({ name, niche, keywords, ...parsed, created: new Date().toISOString() });
          localStorage.setItem('brandProfiles', JSON.stringify(brands));
          toast('Brand profile generated', 'ok');
          refreshCurrentModule();
        } else { toast('Could not parse AI response', 'err'); }
      } catch (e) { toast('AI error: ' + e.message, 'err'); }
      finally { btn.disabled = false; btn.innerHTML = '<i class="fas fa-palette"></i> Generate Brand Identity'; }
    };
    window._setActiveBrand = function(name) {
      localStorage.setItem('activeBrand', name);
      toast(`Brand set to: ${name}`, 'ok');
      refreshCurrentModule();
    };
    window._deleteBrand = function(i) { brands.splice(i, 1); localStorage.setItem('brandProfiles', JSON.stringify(brands)); toast('Deleted', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 37 — Brand Identity Builder</p>
      <p style="font-size:.75rem;color:var(--muted)">Generate complete brand identities with AI — color palettes, fonts, taglines, and brand voice guidelines.</p>`;
  }
})
