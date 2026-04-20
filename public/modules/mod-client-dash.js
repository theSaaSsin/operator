({
  init() {},
  async render(container) {
    const clients = await fetch('/api/clients').then(r => r.json()).then(d => Array.isArray(d) ? d : (d.clients || [])).catch(() => []);
    const leads = await fetch('/api/leads').then(r => r.json()).then(d => Array.isArray(d) ? d : (d.leads || [])).catch(() => []);
    const outreach = await fetch('/api/outreach').then(r => r.json()).catch(() => []);
    let deals = [];
    try { deals = JSON.parse(localStorage.getItem('deals') || '[]'); } catch {}

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${clients.length}</div><div class="mod-stat-label">Total Clients</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${clients.filter(c => c.status === 'active').length}</div><div class="mod-stat-label">Active</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${leads.length}</div><div class="mod-stat-label">Total Leads</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${outreach.length}</div><div class="mod-stat-label">Outreach Items</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Select Client</div>
        <div class="mod-card">
          <select id="cd-select" onchange="_renderClientDash()" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            <option value="">— Choose a client —</option>
            ${clients.map(c => `<option value="${c.name}">${c.name}${c.niche ? ' — '+c.niche : ''}${c.status ? ' ('+c.status+')' : ''}</option>`).join('')}
          </select>
        </div>
      </div>

      <div id="cd-dashboard"></div>`;

    window._renderClientDash = function() {
      const name = document.getElementById('cd-select').value;
      const el = document.getElementById('cd-dashboard');
      if (!name) { el.innerHTML = ''; return; }

      const client = clients.find(c => c.name === name) || {};
      const clientLeads = leads.filter(l => (l.niche || '').toLowerCase().includes((client.niche || '').toLowerCase()));
      const clientOutreach = outreach.filter(o => (o.niche || '').toLowerCase().includes((client.niche || '').toLowerCase()));
      const clientDeals = deals.filter(d => d.client === name);
      const wonRevenue = clientDeals.filter(d => d.stage === 'closed_won').reduce((s, d) => s + (parseFloat(d.value) || 0), 0);

      el.innerHTML = `
        <div class="mod-section">
          <div class="mod-section-title">${name} — Dashboard</div>
          <div class="mod-stat-row">
            <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${clientLeads.length}</div><div class="mod-stat-label">Leads (niche)</div></div>
            <div class="mod-stat"><div class="mod-stat-val">${clientOutreach.length}</div><div class="mod-stat-label">Outreach</div></div>
            <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">$${wonRevenue.toLocaleString()}</div><div class="mod-stat-label">Revenue</div></div>
            <div class="mod-stat"><div class="mod-stat-val">${clientDeals.length}</div><div class="mod-stat-label">Deals</div></div>
          </div>
        </div>

        <div class="mod-section">
          <div class="mod-section-title">Client Info</div>
          <div class="mod-card">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:.78rem">
              ${client.niche ? `<div><span style="color:var(--muted)">Niche:</span> <strong>${client.niche}</strong></div>` : ''}
              ${client.email ? `<div><span style="color:var(--muted)">Email:</span> ${client.email}</div>` : ''}
              ${client.phone ? `<div><span style="color:var(--muted)">Phone:</span> ${client.phone}</div>` : ''}
              ${client.status ? `<div><span style="color:var(--muted)">Status:</span> ${client.status}</div>` : ''}
              ${client.website ? `<div><span style="color:var(--muted)">Website:</span> <a href="${client.website}" target="_blank" style="color:var(--accent)">${client.website}</a></div>` : ''}
              ${client.created ? `<div><span style="color:var(--muted)">Since:</span> ${new Date(client.created).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>` : ''}
            </div>
            ${client.notes ? `<div style="margin-top:8px;font-size:.75rem;color:var(--muted);border-top:1px solid var(--border);padding-top:8px">${client.notes}</div>` : ''}
          </div>
        </div>

        ${clientDeals.length ? `<div class="mod-section">
          <div class="mod-section-title">Deals (${clientDeals.length})</div>
          <table class="mod-table"><thead><tr><th>Description</th><th>Value</th><th>Stage</th></tr></thead><tbody>
            ${clientDeals.map(d => `<tr><td>${d.desc || '—'}</td><td style="color:#22c55e;font-weight:700">$${(parseFloat(d.value)||0).toLocaleString()}</td><td>${(d.stage||'').replace(/_/g,' ')}</td></tr>`).join('')}
          </tbody></table>
        </div>` : ''}

        <div class="mod-section">
          <div class="mod-section-title">Shareable Link</div>
          <div class="mod-card">
            <p style="font-size:.75rem;color:var(--muted);margin-bottom:8px">Share this URL with your client for read-only dashboard access:</p>
            <div style="display:flex;gap:8px;align-items:center">
              <code style="flex:1;background:rgba(255,255,255,.06);padding:8px 10px;border-radius:6px;font-size:.75rem;color:var(--text);word-break:break-all">${location.origin}/?client=${encodeURIComponent(name)}</code>
              <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${location.origin}/?client=${encodeURIComponent(name)}');toast('Link copied','ok')"><i class="fas fa-copy"></i></button>
            </div>
          </div>
        </div>`;
    };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 51 — Client Dashboard</p>
      <p style="font-size:.75rem;color:var(--muted)">Per-client dashboard showing leads, outreach, deals, and revenue. Generate shareable links for client-facing views.</p>`;
  }
})
