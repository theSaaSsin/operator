({
  init() {},
  async render(container) {
    let proposals = [];
    try { proposals = JSON.parse(localStorage.getItem('proposals') || '[]'); } catch {}
    const clients = await fetch('/api/clients').then(r => r.json()).then(d => Array.isArray(d) ? d : (d.clients || [])).catch(() => []);

    const sentCount = proposals.filter(p => p.status === 'sent').length;
    const acceptedCount = proposals.filter(p => p.status === 'accepted').length;

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val">${proposals.length}</div><div class="mod-stat-label">Total Proposals</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${sentCount}</div><div class="mod-stat-label">Sent</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${acceptedCount}</div><div class="mod-stat-label">Accepted</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${clients.length}</div><div class="mod-stat-label">Clients</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Create Proposal</div>
        <div class="mod-card">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Client</label>
              <select id="pr-client" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="">— Select Client —</option>
                ${clients.map(c => `<option value="${c.name}" data-niche="${c.niche || ''}">${c.name}${c.niche ? ' ('+c.niche+')' : ''}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Project Title</label>
              <input type="text" id="pr-title" placeholder="e.g. Complete Digital Presence Package" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
          </div>
          <div style="margin-bottom:8px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Deliverables (one per line)</label>
            <textarea id="pr-deliverables" rows="4" placeholder="Website redesign\nSEO optimization\nSocial media setup\nContent calendar" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit;resize:vertical"></textarea>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Total Price</label>
              <input type="text" id="pr-price" placeholder="$2,500" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Timeline</label>
              <input type="text" id="pr-timeline" placeholder="3 weeks" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Valid Until</label>
              <input type="date" id="pr-valid" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="_createProposal()"><i class="fas fa-file-contract"></i> Create Proposal</button>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Proposals (${proposals.length})</div>
        ${proposals.length ? proposals.map((p, i) => {
          const statusColors = { draft: '#8888a0', sent: '#f59e0b', accepted: '#22c55e', declined: '#ef4444' };
          return `<div class="mod-card" style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
              <div>
                <strong style="font-size:.85rem">${p.title}</strong>
                <span style="font-size:.7rem;color:var(--muted);margin-left:8px">→ ${p.client}</span>
              </div>
              <div style="display:flex;gap:6px;align-items:center">
                <select onchange="_updateProposalStatus(${i},this.value)" style="background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:4px;padding:3px 6px;color:${statusColors[p.status] || 'var(--text)'};font-size:.72rem;font-family:inherit">
                  ${['draft','sent','accepted','declined'].map(s => `<option value="${s}" ${p.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
                </select>
                <button class="btn btn-secondary btn-sm" onclick="_deleteProposal(${i})" style="color:#ef4444"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <div style="font-size:.78rem;color:var(--muted);margin-bottom:4px"><strong>${p.price}</strong> · ${p.timeline} · Valid until ${p.validUntil || 'N/A'}</div>
            <div style="font-size:.75rem;color:var(--text)">
              ${(p.deliverables || []).map(d => `<div style="padding:2px 0"><i class="fas fa-check" style="color:#22c55e;font-size:.65rem;margin-right:6px"></i>${d}</div>`).join('')}
            </div>
            <div style="font-size:.68rem;color:var(--muted);margin-top:6px">${new Date(p.created).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
          </div>`;
        }).join('') : '<div class="mod-empty"><i class="fas fa-file-contract"></i>No proposals yet — create one above</div>'}
      </div>`;

    window._createProposal = function() {
      const client = document.getElementById('pr-client').value;
      const title = document.getElementById('pr-title').value.trim();
      if (!client) return toast('Select a client', 'err');
      if (!title) return toast('Enter a project title', 'err');
      const deliverables = document.getElementById('pr-deliverables').value.split('\n').map(s => s.trim()).filter(Boolean);
      proposals.unshift({
        client, title, deliverables,
        price: document.getElementById('pr-price').value.trim() || 'TBD',
        timeline: document.getElementById('pr-timeline').value.trim() || 'TBD',
        validUntil: document.getElementById('pr-valid').value || '',
        status: 'draft', created: new Date().toISOString()
      });
      localStorage.setItem('proposals', JSON.stringify(proposals));
      toast('Proposal created', 'ok');
      refreshCurrentModule();
    };
    window._updateProposalStatus = function(i, s) { proposals[i].status = s; localStorage.setItem('proposals', JSON.stringify(proposals)); refreshCurrentModule(); };
    window._deleteProposal = function(i) { proposals.splice(i, 1); localStorage.setItem('proposals', JSON.stringify(proposals)); toast('Deleted', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 24 — Proposal Builder</p>
      <p style="font-size:.75rem;color:var(--muted)">Create and manage client proposals with deliverables, pricing, and status tracking. Proposals pull client data from your CRM.</p>`;
  }
})
