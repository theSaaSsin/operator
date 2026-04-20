({
  init() {},
  async render(container) {
    let rules = [];
    try { rules = JSON.parse(localStorage.getItem('crmAutoRules') || '[]'); } catch {}
    let autoLog = [];
    try { autoLog = JSON.parse(localStorage.getItem('crmAutoLog') || '[]'); } catch {}
    const leads = await fetch('/api/leads').then(r => r.json()).then(d => Array.isArray(d) ? d : (d.leads || [])).catch(() => []);

    const activeRules = rules.filter(r => r.active).length;

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val">${rules.length}</div><div class="mod-stat-label">Auto Rules</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${activeRules}</div><div class="mod-stat-label">Active</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${autoLog.length}</div><div class="mod-stat-label">Actions Taken</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${leads.length}</div><div class="mod-stat-label">Total Leads</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Create CRM Auto-Rule</div>
        <div class="mod-card">
          <div style="margin-bottom:8px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Rule Name</label>
            <input type="text" id="ca-name" placeholder="e.g. Auto-qualify leads scoring 85+" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Condition Type</label>
              <select id="ca-condition" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="score_above">Score Above</option>
                <option value="score_below">Score Below</option>
                <option value="status_is">Status Is</option>
                <option value="inactive_days">Inactive For Days</option>
                <option value="niche_match">Niche Contains</option>
              </select>
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Value</label>
              <input type="text" id="ca-value" placeholder="e.g. 85, contacted, 7" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Action</label>
              <select id="ca-action" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="auto_qualify">Auto-Qualify</option>
                <option value="auto_archive">Auto-Archive</option>
                <option value="change_status">Change Status</option>
                <option value="add_to_outreach">Add to Outreach</option>
                <option value="flag_review">Flag for Review</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="_addCrmRule()"><i class="fas fa-plus"></i> Add Rule</button>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Active Rules (${rules.length})</div>
        ${rules.length ? rules.map((r, i) => `
          <div class="mod-card" style="margin-bottom:6px;display:flex;align-items:center;gap:10px">
            <button onclick="_toggleCrmRule(${i})" style="background:none;border:none;cursor:pointer;color:${r.active ? '#22c55e' : 'var(--muted)'};font-size:1rem"><i class="fas ${r.active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i></button>
            <div style="flex:1">
              <div style="font-size:.82rem;color:var(--text)">${r.name}</div>
              <div style="font-size:.7rem;color:var(--muted)">IF ${r.condition.replace(/_/g,' ')} = "${r.value}" → ${r.action.replace(/_/g,' ')}</div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="_runCrmRule(${i})"><i class="fas fa-play"></i> Run Now</button>
            <button class="btn btn-secondary btn-sm" onclick="_deleteCrmRule(${i})" style="color:#ef4444"><i class="fas fa-trash"></i></button>
          </div>
        `).join('') : '<div class="mod-empty"><i class="fas fa-robot"></i>No rules yet — create your first auto-rule above</div>'}
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Automation Log (${autoLog.length})</div>
        ${autoLog.length ? `<table class="mod-table"><thead><tr><th>Rule</th><th>Lead</th><th>Action</th><th>Time</th></tr></thead><tbody>
          ${autoLog.slice(0, 20).map(l => `<tr>
            <td>${l.rule || '—'}</td>
            <td><strong>${l.lead || '—'}</strong></td>
            <td style="font-size:.72rem">${(l.action || '').replace(/_/g,' ')}</td>
            <td style="font-size:.72rem;color:var(--muted)">${l.time ? new Date(l.time).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : ''}</td>
          </tr>`).join('')}
        </tbody></table>` : '<div class="mod-empty"><i class="fas fa-history"></i>No automation actions yet</div>'}
      </div>`;

    window._addCrmRule = function() {
      const name = document.getElementById('ca-name').value.trim();
      if (!name) return toast('Enter a rule name', 'err');
      rules.push({
        name, condition: document.getElementById('ca-condition').value,
        value: document.getElementById('ca-value').value.trim(),
        action: document.getElementById('ca-action').value,
        active: true, created: new Date().toISOString()
      });
      localStorage.setItem('crmAutoRules', JSON.stringify(rules));
      toast('Rule created', 'ok');
      refreshCurrentModule();
    };
    window._toggleCrmRule = function(i) { rules[i].active = !rules[i].active; localStorage.setItem('crmAutoRules', JSON.stringify(rules)); refreshCurrentModule(); };
    window._runCrmRule = function(i) {
      const r = rules[i];
      let matched = 0;
      leads.forEach(l => {
        let match = false;
        if (r.condition === 'score_above' && (l.score || 0) > parseInt(r.value)) match = true;
        if (r.condition === 'score_below' && (l.score || 0) < parseInt(r.value)) match = true;
        if (r.condition === 'status_is' && l.status === r.value) match = true;
        if (r.condition === 'niche_match' && (l.niche || '').toLowerCase().includes(r.value.toLowerCase())) match = true;
        if (match) {
          matched++;
          autoLog.unshift({ rule: r.name, lead: l.author || l.title || 'unknown', action: r.action, time: new Date().toISOString() });
        }
      });
      localStorage.setItem('crmAutoLog', JSON.stringify(autoLog));
      toast(`Rule ran: ${matched} leads matched`, 'ok');
      refreshCurrentModule();
    };
    window._deleteCrmRule = function(i) { rules.splice(i, 1); localStorage.setItem('crmAutoRules', JSON.stringify(rules)); toast('Deleted', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 42 — CRM Automation</p>
      <p style="font-size:.75rem;color:var(--muted)">Auto-actions on CRM events: qualify leads above a score, archive inactive ones, route by niche. Run rules manually or let them trigger automatically.</p>`;
  }
})
