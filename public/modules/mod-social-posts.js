({
  init() {},
  async render(container) {
    let posts = [];
    try { posts = JSON.parse(localStorage.getItem('socialPosts') || '[]'); } catch {}

    const platforms = { linkedin: { icon: 'fab fa-linkedin', color: '#0077b5' }, twitter: { icon: 'fab fa-twitter', color: '#1da1f2' }, reddit: { icon: 'fab fa-reddit', color: '#ff4500' }, facebook: { icon: 'fab fa-facebook', color: '#1877f2' } };
    const platCounts = {};
    Object.keys(platforms).forEach(p => platCounts[p] = posts.filter(x => x.platform === p).length);

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val">${posts.length}</div><div class="mod-stat-label">Total Posts</div></div>
        ${Object.entries(platforms).slice(0, 3).map(([k, v]) => `<div class="mod-stat"><div class="mod-stat-val" style="color:${v.color}">${platCounts[k]}</div><div class="mod-stat-label"><i class="${v.icon}"></i> ${k.charAt(0).toUpperCase() + k.slice(1)}</div></div>`).join('')}
      </div>

      <div class="mod-section">
        <div class="mod-section-title">AI Post Generator</div>
        <div class="mod-card">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Platform</label>
              <select id="sp-platform" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                ${Object.entries(platforms).map(([k]) => `<option value="${k}">${k.charAt(0).toUpperCase() + k.slice(1)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Tone</label>
              <select id="sp-tone" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="bold">Bold / Provocative</option>
                <option value="educational">Educational</option>
                <option value="storytelling">Storytelling</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom:8px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Topic / Key Message</label>
            <textarea id="sp-topic" rows="2" placeholder="e.g. Why most small businesses fail at marketing online" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit;resize:vertical"></textarea>
          </div>
          <button class="btn btn-primary btn-sm" id="sp-gen-btn" onclick="_genPost()"><i class="fas fa-magic"></i> Generate Post</button>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Saved Posts (${posts.length})</div>
        ${posts.length ? posts.map((p, i) => {
          const pl = platforms[p.platform] || { icon: 'fas fa-globe', color: 'var(--muted)' };
          return `<div class="mod-card" style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <div style="display:flex;align-items:center;gap:8px">
                <i class="${pl.icon}" style="color:${pl.color}"></i>
                <span style="font-size:.75rem;font-weight:600;color:${pl.color}">${(p.platform || '').charAt(0).toUpperCase() + (p.platform || '').slice(1)}</span>
                <span style="font-size:.68rem;color:var(--muted)">${p.tone || ''}</span>
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText(${JSON.stringify(JSON.stringify(p.content))});toast('Copied','ok')"><i class="fas fa-copy"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="_deletePost(${i})" style="color:#ef4444"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <div style="font-size:.8rem;color:var(--text);white-space:pre-wrap;background:rgba(255,255,255,.02);padding:10px;border-radius:6px;max-height:150px;overflow-y:auto">${p.content}</div>
            <div style="font-size:.68rem;color:var(--muted);margin-top:6px">${new Date(p.created).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
          </div>`;
        }).join('') : '<div class="mod-empty"><i class="fas fa-share-alt"></i>No posts yet — generate your first post above</div>'}
      </div>`;

    window._genPost = async function() {
      const platform = document.getElementById('sp-platform').value;
      const tone = document.getElementById('sp-tone').value;
      const topic = document.getElementById('sp-topic').value.trim();
      if (!topic) return toast('Enter a topic', 'err');
      const btn = document.getElementById('sp-gen-btn');
      btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
      try {
        const resp = await fetch('/api/ai', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: `Write a ${tone} social media post for ${platform} about: ${topic}\n\nKeep it ${platform === 'twitter' ? 'under 280 characters' : platform === 'linkedin' ? 'between 100-300 words with line breaks for readability' : platform === 'reddit' ? 'authentic and conversational, not salesy' : 'engaging and shareable'}. Include a call to action.` })
        });
        const data = await resp.json();
        const content = data.response || data.text || '';
        if (content) {
          posts.unshift({ platform, tone, topic, content, created: new Date().toISOString() });
          localStorage.setItem('socialPosts', JSON.stringify(posts));
          toast('Post generated', 'ok');
          refreshCurrentModule();
        }
      } catch (e) { toast('AI error: ' + e.message, 'err'); }
      finally { btn.disabled = false; btn.innerHTML = '<i class="fas fa-magic"></i> Generate Post'; }
    };
    window._deletePost = function(i) { posts.splice(i, 1); localStorage.setItem('socialPosts', JSON.stringify(posts)); toast('Deleted', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 34 — Social Media Post Generator</p>
      <p style="font-size:.75rem;color:var(--muted)">Generate platform-specific social media posts with AI. Supports LinkedIn, Twitter/X, Reddit, and Facebook with customizable tone.</p>`;
  }
})
