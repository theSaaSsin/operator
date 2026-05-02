({
  init() {},
  async render(container) {
    let ideas = [];
    try { ideas = JSON.parse(localStorage.getItem('contentIdeas') || '[]'); } catch {}
    const leads = await fetch('/api/leads').then(r => r.json()).then(d => Array.isArray(d) ? d : (d.leads || [])).catch(() => []);
    const niches = [...new Set(leads.map(l => l.niche).filter(Boolean))];

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${ideas.length}</div><div class="mod-stat-label">Ideas Generated</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${ideas.filter(i => i.used).length}</div><div class="mod-stat-label">Used</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${niches.length}</div><div class="mod-stat-label">Niches Found</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">AI Content Idea Generator</div>
        <div class="mod-card">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Niche / Topic</label>
              <input type="text" id="ci-niche" list="ci-niche-list" placeholder="e.g. web design for dentists" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
              <datalist id="ci-niche-list">${niches.map(n => `<option value="${n}">`).join('')}</datalist>
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Content Type</label>
              <select id="ci-type" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="all">All Types</option>
                <option value="blog">Blog Posts</option>
                <option value="social">Social Media</option>
                <option value="video">Video Scripts</option>
                <option value="email">Email Sequences</option>
                <option value="case-study">Case Studies</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom:8px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Pain Points / Context (optional)</label>
            <input type="text" id="ci-pain" placeholder="e.g. struggling to get online visibility" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
          </div>
          <button class="btn btn-primary btn-sm" id="ci-gen-btn" onclick="_genIdeas()"><i class="fas fa-lightbulb"></i> Generate Ideas with AI</button>
          <div id="ci-result" style="margin-top:10px"></div>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Saved Ideas (${ideas.length})</div>
        ${ideas.length ? ideas.map((idea, i) => `
          <div class="mod-card" style="margin-bottom:6px;display:flex;align-items:flex-start;gap:10px">
            <button onclick="_toggleIdeaUsed(${i})" style="background:none;border:none;cursor:pointer;padding:2px;margin-top:2px;color:${idea.used ? '#22c55e' : 'var(--muted)'};font-size:.9rem">
              <i class="fas ${idea.used ? 'fa-check-circle' : 'fa-circle'}"></i>
            </button>
            <div style="flex:1">
              <div style="font-size:.82rem;color:var(--text);${idea.used ? 'text-decoration:line-through;opacity:.6' : ''}">${idea.title}</div>
              <div style="font-size:.7rem;color:var(--muted)">${idea.type || 'General'} · ${idea.niche || ''}</div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="_deleteIdea(${i})" style="color:#ef4444;font-size:.65rem"><i class="fas fa-trash"></i></button>
          </div>
        `).join('') : '<div class="mod-empty"><i class="fas fa-lightbulb"></i>No ideas yet — generate some above</div>'}
      </div>`;

    window._genIdeas = async function() {
      const niche = document.getElementById('ci-niche').value.trim();
      if (!niche) return toast('Enter a niche or topic', 'err');
      const type = document.getElementById('ci-type').value;
      const pain = document.getElementById('ci-pain').value.trim();
      const btn = document.getElementById('ci-gen-btn');
      btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
      try {
        const resp = await fetch('/api/ai', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: `Generate 8 content ideas for a ${niche} business.${pain ? ' Their pain points: ' + pain : ''}\nContent type: ${type === 'all' ? 'mix of blog, social, video, email' : type}\n\nReturn ONLY a JSON array of objects with "title" and "type" fields. Example: [{"title":"5 Reasons Your Website Is Losing Clients","type":"blog"}]` })
        });
        const data = await resp.json();
        const text = data.response || data.text || '';
        const match = text.match(/\[[\s\S]*?\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          parsed.forEach(p => ideas.unshift({ title: p.title, type: p.type || type, niche, used: false, created: new Date().toISOString() }));
          localStorage.setItem('contentIdeas', JSON.stringify(ideas));
          toast(`${parsed.length} ideas generated`, 'ok');
          refreshCurrentModule();
        } else {
          document.getElementById('ci-result').innerHTML = `<div class="mod-card" style="font-size:.78rem;white-space:pre-wrap">${text}</div>`;
        }
      } catch (e) {
        toast('AI error: ' + e.message, 'err');
      } finally { btn.disabled = false; btn.innerHTML = '<i class="fas fa-lightbulb"></i> Generate Ideas with AI'; }
    };
    window._toggleIdeaUsed = function(i) { ideas[i].used = !ideas[i].used; localStorage.setItem('contentIdeas', JSON.stringify(ideas)); refreshCurrentModule(); };
    window._deleteIdea = function(i) { ideas.splice(i, 1); localStorage.setItem('contentIdeas', JSON.stringify(ideas)); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 31 — Content Idea Generator</p>
      <p style="font-size:.75rem;color:var(--muted)">AI-powered content ideas based on your niches and lead pain points. Mark ideas as used to track your content pipeline.</p>`;
  }
})
