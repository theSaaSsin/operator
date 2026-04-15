({
  init() {},
  async render(container) {
    let tickets = [];
    try { tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]'); } catch {}
    const clients = await fetch('/api/clients').then(r => r.json()).catch(() => []);

    const statusCounts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    tickets.forEach(t => { if (statusCounts[t.status] !== undefined) statusCounts[t.status]++; });

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val">${tickets.length}</div><div class="mod-stat-label">Total Tickets</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#ef4444">${statusCounts.open}</div><div class="mod-stat-label">Open</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${statusCounts.in_progress}</div><div class="mod-stat-label">In Progress</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${statusCounts.resolved + statusCounts.closed}</div><div class="mod-stat-label">Resolved</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Create Ticket</div>
        <div class="mod-card">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Client</label>
              <select id="sp-client" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="">— Select —</option>
                ${clients.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Subject</label>
              <input type="text" id="sp-subject" placeholder="Issue title" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Priority</label>
              <select id="sp-priority" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom:8px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Message</label>
            <textarea id="sp-message" rows="3" placeholder="Describe the issue..." style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit;resize:vertical"></textarea>
          </div>
          <button class="btn btn-primary btn-sm" onclick="_createTicket()"><i class="fas fa-plus"></i> Create Ticket</button>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Tickets (${tickets.length})</div>
        ${tickets.length ? tickets.map((t, i) => {
          const prioColors = { low: '#8888a0', medium: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' };
          const statusColors = { open: '#ef4444', in_progress: '#f59e0b', resolved: '#22c55e', closed: '#8888a0' };
          return `<div class="mod-card" style="margin-bottom:6px;border-left:3px solid ${prioColors[t.priority] || '#888'}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
              <div>
                <strong style="font-size:.82rem">${t.subject}</strong>
                <span style="font-size:.7rem;color:var(--muted);margin-left:8px">→ ${t.client}</span>
              </div>
              <div style="display:flex;gap:6px;align-items:center">
                <select onchange="_updateTicketStatus(${i},this.value)" style="background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:4px;padding:3px 6px;color:${statusColors[t.status] || 'var(--text)'};font-size:.72rem;font-family:inherit">
                  ${['open','in_progress','resolved','closed'].map(s => `<option value="${s}" ${t.status===s?'selected':''}>${s.replace(/_/g,' ').replace(/^\w/,c=>c.toUpperCase())}</option>`).join('')}
                </select>
                <button class="btn btn-secondary btn-sm" onclick="_deleteTicket(${i})" style="color:#ef4444;font-size:.65rem"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <div style="font-size:.75rem;color:var(--text);margin-bottom:4px">${t.message || ''}</div>
            ${(t.replies || []).length ? `<div style="margin-top:6px;border-top:1px solid var(--border);padding-top:6px">
              ${t.replies.map(r => `<div style="font-size:.72rem;padding:4px 0;color:var(--muted)"><strong style="color:var(--text)">${r.from}:</strong> ${r.text} <span style="font-size:.65rem;opacity:.6">${r.time ? new Date(r.time).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : ''}</span></div>`).join('')}
            </div>` : ''}
            <div style="display:flex;gap:6px;margin-top:6px">
              <input type="text" class="reply-input" data-idx="${i}" placeholder="Reply..." style="flex:1;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-size:.75rem;font-family:inherit" onkeydown="if(event.key==='Enter')_replyTicket(${i})">
              <button class="btn btn-secondary btn-sm" onclick="_replyTicket(${i})"><i class="fas fa-reply"></i></button>
            </div>
            <div style="font-size:.65rem;color:var(--muted);margin-top:4px">${t.created ? new Date(t.created).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : ''} · ${t.priority}</div>
          </div>`;
        }).join('') : '<div class="mod-empty"><i class="fas fa-headset"></i>No tickets yet — create one when a client needs support</div>'}
      </div>`;

    window._createTicket = function() {
      const client = document.getElementById('sp-client').value;
      const subject = document.getElementById('sp-subject').value.trim();
      if (!client) return toast('Select a client', 'err');
      if (!subject) return toast('Enter a subject', 'err');
      tickets.unshift({
        client, subject,
        message: document.getElementById('sp-message').value.trim(),
        priority: document.getElementById('sp-priority').value,
        status: 'open', replies: [],
        created: new Date().toISOString()
      });
      localStorage.setItem('supportTickets', JSON.stringify(tickets));
      toast('Ticket created', 'ok');
      refreshCurrentModule();
    };
    window._updateTicketStatus = function(i, s) { tickets[i].status = s; localStorage.setItem('supportTickets', JSON.stringify(tickets)); refreshCurrentModule(); };
    window._replyTicket = function(i) {
      const input = document.querySelector(`.reply-input[data-idx="${i}"]`);
      const text = input.value.trim();
      if (!text) return;
      if (!tickets[i].replies) tickets[i].replies = [];
      tickets[i].replies.push({ from: 'Operator', text, time: new Date().toISOString() });
      localStorage.setItem('supportTickets', JSON.stringify(tickets));
      refreshCurrentModule();
    };
    window._deleteTicket = function(i) { tickets.splice(i, 1); localStorage.setItem('supportTickets', JSON.stringify(tickets)); toast('Deleted', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 56 — Support / Messaging</p>
      <p style="font-size:.75rem;color:var(--muted)">Ticket-based support system between you and your clients. Track issues by priority and status with threaded replies.</p>`;
  }
})
