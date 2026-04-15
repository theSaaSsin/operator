({
  init() {},
  async render(container) {
    container.innerHTML = '<div class="mod-loading"><i class="fas fa-circle-notch fa-spin"></i> Loading reply data…</div>';
    try {
      const anData = await fetch('/api/analytics').then(r => r.json());
      const outreach = anData.outreach || [];

      const replied = outreach.filter(r => ['replied','interested','booked','closed'].includes(r.status));
      const ghosted = outreach.filter(r => r.status === 'ghosted');
      const sent = outreach.filter(r => r.status === 'sent');
      const replyRate = outreach.length ? Math.round((replied.length / outreach.length) * 100) : 0;

      container.innerHTML = `
        <div class="mod-stat-row">
          <div class="mod-stat"><div class="mod-stat-val">${outreach.length}</div><div class="mod-stat-label">Total Sent</div></div>
          <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${replied.length}</div><div class="mod-stat-label">Replied</div></div>
          <div class="mod-stat"><div class="mod-stat-val" style="color:var(--muted)">${ghosted.length}</div><div class="mod-stat-label">Ghosted</div></div>
          <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${replyRate}%</div><div class="mod-stat-label">Reply Rate</div></div>
        </div>

        <div class="mod-section">
          <div class="mod-section-title">Log a Reply</div>
          <div class="mod-card">
            <div style="margin-bottom:8px">
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Select outreach to update</label>
              <select id="rd-select" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="">— Select —</option>
                ${sent.slice(0,30).map(r => `<option value="${r.id}">@${r.author||'unknown'} — ${(r.postTitle||'').substring(0,40)}</option>`).join('')}
              </select>
            </div>
            <div style="margin-bottom:8px">
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Status</label>
              <select id="rd-status" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="replied">Replied</option>
                <option value="interested">Interested</option>
                <option value="booked">Booked Call</option>
                <option value="closed">Closed (Won)</option>
                <option value="ghosted">Ghosted</option>
              </select>
            </div>
            <div style="margin-bottom:8px">
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Notes</label>
              <textarea id="rd-notes" rows="2" placeholder="What did they say?" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit;resize:vertical"></textarea>
            </div>
            <button class="btn btn-primary btn-sm" onclick="_logReply()"><i class="fas fa-check"></i> Update Status</button>
          </div>
        </div>

        <div class="mod-section">
          <div class="mod-section-title">Reply Log (${replied.length})</div>
          ${replied.length ? `<table class="mod-table"><thead><tr><th>Lead</th><th>Status</th><th>Updated</th><th>Notes</th></tr></thead><tbody>
            ${replied.map(r => `<tr>
              <td><strong>@${r.author||'unknown'}</strong></td>
              <td><span style="font-size:.72rem;padding:2px 6px;border-radius:4px;background:rgba(34,197,94,.12);color:#22c55e">${r.status}</span></td>
              <td style="font-size:.72rem;color:var(--muted)">${r.statusUpdatedAt ? new Date(r.statusUpdatedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—'}</td>
              <td style="font-size:.72rem;color:var(--muted)">${r.notes||'—'}</td>
            </tr>`).join('')}
          </tbody></table>` : '<div class="mod-empty"><i class="fas fa-reply"></i>No replies logged yet</div>'}
        </div>`;

      window._logReply = async function() {
        const id = parseInt(document.getElementById('rd-select').value);
        const status = document.getElementById('rd-status').value;
        const notes = document.getElementById('rd-notes').value;
        if (!id) { toast('Select an outreach entry', 'err'); return; }
        await fetch('/api/analytics', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, notes }) });
        toast('Reply logged — ' + status, 'ok');
        refreshCurrentModule();
      };
    } catch {
      container.innerHTML = '<div class="mod-error"><i class="fas fa-triangle-exclamation"></i><p>Could not load reply data</p></div>';
    }
  }
})
