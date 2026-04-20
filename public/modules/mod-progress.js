({
  init() {},
  async render(container) {
    let projects = [];
    try { projects = JSON.parse(localStorage.getItem('clientProjects') || '[]'); } catch {}
    const clients = await fetch('/api/clients').then(r => r.json()).then(d => Array.isArray(d) ? d : (d.clients || [])).catch(() => []);

    const totalMilestones = projects.reduce((s, p) => s + (p.milestones || []).length, 0);
    const completedMilestones = projects.reduce((s, p) => s + (p.milestones || []).filter(m => m.done).length, 0);
    const overallProgress = totalMilestones ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val">${projects.length}</div><div class="mod-stat-label">Projects</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${completedMilestones}</div><div class="mod-stat-label">Milestones Done</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${totalMilestones}</div><div class="mod-stat-label">Total Milestones</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${overallProgress}%</div><div class="mod-stat-label">Overall Progress</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Create Project</div>
        <div class="mod-card">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Client</label>
              <select id="pg-client" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="">— Select —</option>
                ${clients.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Project Name</label>
              <input type="text" id="pg-name" placeholder="e.g. Website Redesign" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
          </div>
          <div style="margin-bottom:8px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Milestones (one per line)</label>
            <textarea id="pg-milestones" rows="4" placeholder="Discovery & Planning\nDesign Mockups\nDevelopment\nQA & Launch" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit;resize:vertical"></textarea>
          </div>
          <button class="btn btn-primary btn-sm" onclick="_createProject()"><i class="fas fa-plus"></i> Create Project</button>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Projects (${projects.length})</div>
        ${projects.length ? projects.map((p, pi) => {
          const done = (p.milestones || []).filter(m => m.done).length;
          const total = (p.milestones || []).length;
          const pct = total ? Math.round((done / total) * 100) : 0;
          return `<div class="mod-card" style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <div>
                <strong style="font-size:.88rem">${p.name}</strong>
                <span style="font-size:.7rem;color:var(--muted);margin-left:8px">→ ${p.client}</span>
              </div>
              <div style="display:flex;gap:6px;align-items:center">
                <span style="font-size:.75rem;font-weight:700;color:${pct === 100 ? '#22c55e' : 'var(--accent)'}">${pct}%</span>
                <button class="btn btn-secondary btn-sm" onclick="_deleteProject(${pi})" style="color:#ef4444"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <div style="background:rgba(255,255,255,.06);border-radius:4px;height:6px;margin-bottom:10px">
              <div style="background:${pct === 100 ? '#22c55e' : 'var(--accent)'};height:100%;border-radius:4px;width:${pct}%;transition:width .3s"></div>
            </div>
            ${(p.milestones || []).map((m, mi) => `
              <div style="display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer" onclick="_toggleMilestone(${pi},${mi})">
                <i class="fas ${m.done ? 'fa-check-circle' : 'fa-circle'}" style="color:${m.done ? '#22c55e' : 'var(--muted)'};font-size:.8rem"></i>
                <span style="font-size:.78rem;color:var(--text);${m.done ? 'text-decoration:line-through;opacity:.6' : ''}">${m.name}</span>
              </div>
            `).join('')}
          </div>`;
        }).join('') : '<div class="mod-empty"><i class="fas fa-tasks"></i>No projects yet — create one above to start tracking progress</div>'}
      </div>`;

    window._createProject = function() {
      const client = document.getElementById('pg-client').value;
      const name = document.getElementById('pg-name').value.trim();
      if (!client) return toast('Select a client', 'err');
      if (!name) return toast('Enter a project name', 'err');
      const milestones = document.getElementById('pg-milestones').value.split('\n').map(s => s.trim()).filter(Boolean).map(s => ({ name: s, done: false }));
      if (!milestones.length) return toast('Add at least one milestone', 'err');
      projects.unshift({ client, name, milestones, created: new Date().toISOString() });
      localStorage.setItem('clientProjects', JSON.stringify(projects));
      toast('Project created', 'ok');
      refreshCurrentModule();
    };
    window._toggleMilestone = function(pi, mi) {
      projects[pi].milestones[mi].done = !projects[pi].milestones[mi].done;
      localStorage.setItem('clientProjects', JSON.stringify(projects));
      refreshCurrentModule();
    };
    window._deleteProject = function(i) { projects.splice(i, 1); localStorage.setItem('clientProjects', JSON.stringify(projects)); toast('Deleted', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 54 — Progress Tracker</p>
      <p style="font-size:.75rem;color:var(--muted)">Milestone-based progress tracking for client projects. Visual progress bars and clickable milestone checkboxes.</p>`;
  }
})
