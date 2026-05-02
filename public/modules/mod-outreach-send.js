({
  init() {},
  async render(container) {
    container.innerHTML = '<div class="mod-loading"><i class="fas fa-circle-notch fa-spin"></i> Loading outreach queue…</div>';
    try {
      const [outData, leadData] = await Promise.all([
        fetch('/api/outreach').then(r => r.json()),
        fetch('/api/leads').then(r => r.json())
      ]);
      const queue = (outData.queue || []).sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
      const leads = leadData.leads || [];

      const pending = queue.filter(q => q.status === 'pending').length;
      const sent = queue.filter(q => q.status === 'sent').length;
      const total = queue.length;

      container.innerHTML = `
        <div class="mod-stat-row">
          <div class="mod-stat"><div class="mod-stat-val">${total}</div><div class="mod-stat-label">Total Queued</div></div>
          <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${pending}</div><div class="mod-stat-label">Pending</div></div>
          <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${sent}</div><div class="mod-stat-label">Sent</div></div>
        </div>

        <div class="mod-section">
          <div class="mod-section-title">Compose New Message</div>
          <div class="mod-card">
            <div style="margin-bottom:8px">
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Recipient</label>
              <input type="text" id="os-recipient" placeholder="Username or email" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div style="margin-bottom:8px">
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Platform</label>
              <select id="os-platform" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="reddit">Reddit DM</option>
                <option value="email">Email</option>
                <option value="linkedin">LinkedIn</option>
                <option value="x">X / Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style="margin-bottom:8px">
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Message</label>
              <textarea id="os-message" rows="4" placeholder="Your outreach message…" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit;resize:vertical"></textarea>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-primary btn-sm" onclick="_queueOutreach()"><i class="fas fa-paper-plane"></i> Queue Message</button>
              <button class="btn btn-secondary btn-sm" onclick="_queueOutreach('sent')"><i class="fas fa-bolt"></i> Mark as Sent</button>
            </div>
          </div>
        </div>

        <div class="mod-section">
          <div class="mod-section-title">Queue (${total})</div>
          ${queue.length ? `<table class="mod-table"><thead><tr><th>To</th><th>Platform</th><th>Message</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>
            ${queue.slice(0,40).map(q => `<tr>
              <td><strong>${q.recipient||q.to||'—'}</strong></td>
              <td>${q.platform||'—'}</td>
              <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.75rem;color:var(--muted)">${q.message||q.dm||'—'}</td>
              <td><span style="font-size:.7rem;padding:2px 6px;border-radius:4px;background:${q.status==='sent'?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'};color:${q.status==='sent'?'#22c55e':'#f59e0b'}">${q.status}</span></td>
              <td style="font-size:.7rem;color:var(--muted)">${q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—'}</td>
              <td>${q.status==='pending'?`<button class="btn btn-secondary btn-sm" onclick="_markSent(${q.id})" style="font-size:.65rem;padding:2px 6px">Mark Sent</button>`:''}</td>
            </tr>`).join('')}
          </tbody></table>` : '<div class="mod-empty"><i class="fas fa-paper-plane"></i>No messages queued yet</div>'}
        </div>`;

      window._queueOutreach = async function(status) {
        const recipient = document.getElementById('os-recipient').value.trim();
        const platform = document.getElementById('os-platform').value;
        const message = document.getElementById('os-message').value.trim();
        if (!recipient || !message) { toast('Fill in recipient and message', 'err'); return; }
        await fetch('/api/outreach', { method: 'POST', body: JSON.stringify({ recipient, platform, message, status: status || 'pending' }) });
        toast('Message queued', 'ok');
        refreshCurrentModule();
      };

      window._markSent = async function(id) {
        await fetch('/api/outreach', { method: 'PATCH', body: JSON.stringify({ id, status: 'sent' }) });
        toast('Marked as sent', 'ok');
        refreshCurrentModule();
      };
    } catch {
      container.innerHTML = '<div class="mod-error"><i class="fas fa-triangle-exclamation"></i><p>Could not load outreach data</p></div>';
    }
  }
})
