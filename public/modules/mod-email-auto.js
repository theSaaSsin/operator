({
  init() {},
  async render(container) {
    let sequences = [];
    try { sequences = JSON.parse(localStorage.getItem('emailSequences') || '[]'); } catch {}
    let settings = {};
    try { settings = ((await fetch('/api/module-settings').then(r => r.json())).settings || {})['43'] || {}; } catch {}

    const totalSteps = sequences.reduce((s, seq) => s + (seq.steps || []).length, 0);

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val">${sequences.length}</div><div class="mod-stat-label">Sequences</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${totalSteps}</div><div class="mod-stat-label">Total Steps</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${sequences.filter(s => s.active).length}</div><div class="mod-stat-label">Active</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Create Email Sequence</div>
        <div class="mod-card">
          <div style="margin-bottom:8px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Sequence Name</label>
            <input type="text" id="ea-name" placeholder="e.g. Cold Lead Nurture" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
          </div>
          <div id="ea-steps">
            <div class="ea-step" style="background:rgba(255,255,255,.02);border-radius:6px;padding:10px;margin-bottom:6px">
              <div style="display:grid;grid-template-columns:60px 1fr;gap:8px;margin-bottom:6px">
                <div>
                  <label style="font-size:.65rem;color:var(--muted);display:block;margin-bottom:2px">Day</label>
                  <input type="number" class="ea-day" value="0" min="0" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-size:.8rem;font-family:inherit">
                </div>
                <div>
                  <label style="font-size:.65rem;color:var(--muted);display:block;margin-bottom:2px">Subject</label>
                  <input type="text" class="ea-subject" placeholder="Email subject line" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-size:.8rem;font-family:inherit">
                </div>
              </div>
              <textarea class="ea-body" rows="2" placeholder="Email body..." style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-size:.8rem;font-family:inherit;resize:vertical"></textarea>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" onclick="_addStep()"><i class="fas fa-plus"></i> Add Step</button>
            <button class="btn btn-primary btn-sm" onclick="_saveSequence()"><i class="fas fa-save"></i> Save Sequence</button>
          </div>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Sequences (${sequences.length})</div>
        ${sequences.length ? sequences.map((seq, i) => `
          <div class="mod-card" style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <div>
                <strong style="font-size:.85rem">${seq.name}</strong>
                <span style="font-size:.7rem;color:var(--muted);margin-left:8px">${(seq.steps || []).length} steps</span>
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn btn-sm ${seq.active ? 'btn-primary' : 'btn-secondary'}" onclick="_toggleSeq(${i})">${seq.active ? '<i class="fas fa-check"></i> Active' : 'Inactive'}</button>
                <button class="btn btn-secondary btn-sm" onclick="_deleteSeq(${i})" style="color:#ef4444"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              ${(seq.steps || []).map((step, si) => `<div style="display:flex;align-items:center;gap:4px">
                <div style="background:rgba(255,255,255,.06);padding:4px 8px;border-radius:4px;font-size:.72rem">
                  <span style="color:var(--accent)">Day ${step.day}</span>: ${step.subject || 'Untitled'}
                </div>
                ${si < seq.steps.length - 1 ? '<i class="fas fa-arrow-right" style="font-size:.5rem;color:var(--muted)"></i>' : ''}
              </div>`).join('')}
            </div>
          </div>
        `).join('') : '<div class="mod-empty"><i class="fas fa-envelope"></i>No sequences yet — create your first email sequence above</div>'}
      </div>

      <div class="mod-section">
        <div class="mod-section-title">SMTP / Integration Settings</div>
        <div class="mod-card">
          <p style="font-size:.75rem;color:var(--muted);margin-bottom:8px">Configure your email sending method. Connect via SMTP or webhook to services like Mailgun or SendGrid.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Method</label>
              <select id="ea-method" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="webhook" ${settings.method === 'webhook' ? 'selected' : ''}>Webhook (Mailgun/SendGrid)</option>
                <option value="smtp" ${settings.method === 'smtp' ? 'selected' : ''}>SMTP</option>
              </select>
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Webhook URL or SMTP Host</label>
              <input type="text" id="ea-host" value="${settings.host || ''}" placeholder="https://api.mailgun.net/..." style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="_saveEmailSettings()"><i class="fas fa-save"></i> Save Settings</button>
        </div>
      </div>`;

    window._addStep = function() {
      const stepsDiv = document.getElementById('ea-steps');
      const count = stepsDiv.querySelectorAll('.ea-step').length;
      const step = document.createElement('div');
      step.className = 'ea-step';
      step.style.cssText = 'background:rgba(255,255,255,.02);border-radius:6px;padding:10px;margin-bottom:6px';
      step.innerHTML = `<div style="display:grid;grid-template-columns:60px 1fr;gap:8px;margin-bottom:6px">
        <div><label style="font-size:.65rem;color:var(--muted);display:block;margin-bottom:2px">Day</label><input type="number" class="ea-day" value="${count * 3}" min="0" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-size:.8rem;font-family:inherit"></div>
        <div><label style="font-size:.65rem;color:var(--muted);display:block;margin-bottom:2px">Subject</label><input type="text" class="ea-subject" placeholder="Follow-up email" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-size:.8rem;font-family:inherit"></div>
      </div><textarea class="ea-body" rows="2" placeholder="Email body..." style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-size:.8rem;font-family:inherit;resize:vertical"></textarea>`;
      stepsDiv.appendChild(step);
    };
    window._saveSequence = function() {
      const name = document.getElementById('ea-name').value.trim();
      if (!name) return toast('Enter a sequence name', 'err');
      const stepEls = document.querySelectorAll('.ea-step');
      const steps = Array.from(stepEls).map(el => ({
        day: parseInt(el.querySelector('.ea-day').value) || 0,
        subject: el.querySelector('.ea-subject').value.trim(),
        body: el.querySelector('.ea-body').value.trim()
      })).filter(s => s.subject);
      if (!steps.length) return toast('Add at least one step with a subject', 'err');
      sequences.push({ name, steps, active: true, created: new Date().toISOString() });
      localStorage.setItem('emailSequences', JSON.stringify(sequences));
      toast('Sequence saved', 'ok');
      refreshCurrentModule();
    };
    window._toggleSeq = function(i) { sequences[i].active = !sequences[i].active; localStorage.setItem('emailSequences', JSON.stringify(sequences)); refreshCurrentModule(); };
    window._deleteSeq = function(i) { sequences.splice(i, 1); localStorage.setItem('emailSequences', JSON.stringify(sequences)); toast('Deleted', 'ok'); refreshCurrentModule(); };
    window._saveEmailSettings = async function() {
      await fetch('/api/module-settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 43, settings: { method: document.getElementById('ea-method').value, host: document.getElementById('ea-host').value.trim() } }) });
      toast('Email settings saved', 'ok');
    };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 43 — Email Automation</p>
      <p style="font-size:.75rem;color:var(--muted)">Build email sequences with timed steps. Connect via SMTP or webhook to Mailgun/SendGrid for automated sending.</p>`;
  }
})
