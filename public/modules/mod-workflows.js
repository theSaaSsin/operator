({
  init() {},
  async render(container) {
    let workflows = [];
    try { workflows = JSON.parse(localStorage.getItem('workflows') || '[]'); } catch {}
    let wfLog = [];
    try { wfLog = JSON.parse(localStorage.getItem('workflowLog') || '[]'); } catch {}

    const activeCount = workflows.filter(w => w.active).length;
    const triggers = ['new_lead', 'status_change', 'score_threshold', 'time_elapsed', 'reply_detected', 'deal_closed'];
    const actions = ['send_message', 'update_status', 'create_task', 'fire_webhook', 'add_to_queue', 'notify'];
    const triggerLabels = { new_lead: 'New Lead', status_change: 'Status Change', score_threshold: 'Score Threshold', time_elapsed: 'Time Elapsed', reply_detected: 'Reply Detected', deal_closed: 'Deal Closed' };
    const actionLabels = { send_message: 'Send Message', update_status: 'Update Status', create_task: 'Create Task', fire_webhook: 'Fire Webhook', add_to_queue: 'Add to Queue', notify: 'Send Notification' };

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val">${workflows.length}</div><div class="mod-stat-label">Total Workflows</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${activeCount}</div><div class="mod-stat-label">Active</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${wfLog.length}</div><div class="mod-stat-label">Executions</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Create Workflow Rule</div>
        <div class="mod-card">
          <div style="margin-bottom:8px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Workflow Name</label>
            <input type="text" id="wf-name" placeholder="e.g. Auto-qualify hot leads" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">IF (Trigger)</label>
              <select id="wf-trigger" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                ${triggers.map(t => `<option value="${t}">${triggerLabels[t]}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">THEN (Action)</label>
              <select id="wf-action" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                ${actions.map(a => `<option value="${a}">${actionLabels[a]}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="margin-bottom:8px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Condition / Value (optional)</label>
            <input type="text" id="wf-condition" placeholder="e.g. score > 80, status = contacted, days > 3" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
          </div>
          <button class="btn btn-primary btn-sm" onclick="_addWorkflow()"><i class="fas fa-plus"></i> Create Workflow</button>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Workflows (${workflows.length})</div>
        ${workflows.length ? workflows.map((w, i) => `
          <div class="mod-card" style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <strong style="font-size:.85rem">${w.name}</strong>
              <div style="display:flex;gap:6px">
                <button class="btn btn-sm ${w.active ? 'btn-primary' : 'btn-secondary'}" onclick="_toggleWf(${i})">${w.active ? '<i class="fas fa-check"></i> Active' : 'Inactive'}</button>
                <button class="btn btn-secondary btn-sm" onclick="_deleteWf(${i})" style="color:#ef4444"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;font-size:.78rem">
              <span style="background:rgba(59,130,246,.15);color:#3b82f6;padding:3px 8px;border-radius:4px">IF ${triggerLabels[w.trigger] || w.trigger}</span>
              ${w.condition ? `<span style="color:var(--muted)">[${w.condition}]</span>` : ''}
              <i class="fas fa-arrow-right" style="color:var(--muted);font-size:.6rem"></i>
              <span style="background:rgba(34,197,94,.15);color:#22c55e;padding:3px 8px;border-radius:4px">THEN ${actionLabels[w.action] || w.action}</span>
            </div>
          </div>
        `).join('') : '<div class="mod-empty"><i class="fas fa-cogs"></i>No workflows yet — create your first automation above</div>'}
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Recent Executions (${wfLog.length})</div>
        ${wfLog.length ? `<table class="mod-table"><thead><tr><th>Workflow</th><th>Trigger</th><th>Action</th><th>Time</th></tr></thead><tbody>
          ${wfLog.slice(0, 20).map(l => `<tr>
            <td><strong>${l.name || '—'}</strong></td>
            <td style="font-size:.72rem">${triggerLabels[l.trigger] || l.trigger}</td>
            <td style="font-size:.72rem">${actionLabels[l.action] || l.action}</td>
            <td style="font-size:.72rem;color:var(--muted)">${l.time ? new Date(l.time).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}</td>
          </tr>`).join('')}
        </tbody></table>` : '<div class="mod-empty"><i class="fas fa-history"></i>No executions yet</div>'}
      </div>`;

    window._addWorkflow = function() {
      const name = document.getElementById('wf-name').value.trim();
      if (!name) return toast('Enter a name', 'err');
      workflows.push({
        name, trigger: document.getElementById('wf-trigger').value,
        action: document.getElementById('wf-action').value,
        condition: document.getElementById('wf-condition').value.trim(),
        active: true, created: new Date().toISOString()
      });
      localStorage.setItem('workflows', JSON.stringify(workflows));
      toast('Workflow created', 'ok');
      refreshCurrentModule();
    };
    window._toggleWf = function(i) { workflows[i].active = !workflows[i].active; localStorage.setItem('workflows', JSON.stringify(workflows)); refreshCurrentModule(); };
    window._deleteWf = function(i) { workflows.splice(i, 1); localStorage.setItem('workflows', JSON.stringify(workflows)); toast('Deleted', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 41 — Workflow Automation Builder</p>
      <p style="font-size:.75rem;color:var(--muted)">Build IF/THEN automation rules. Triggers fire on events like new leads or status changes, and execute actions like sending messages or creating tasks.</p>`;
  }
})
