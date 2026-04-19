({
  init() {},
  async render(container) {
    container.innerHTML = '<div class="mod-loading"><i class="fas fa-circle-notch fa-spin"></i> Analyzing follow-up opportunities…</div>';
    try {
      const [anData, outData] = await Promise.all([
        fetch('/api/analytics').then(r => r.json()),
        fetch('/api/outreach').then(r => r.json())
      ]);
      const outreach = anData.outreach || [];
      const queue = outData.queue || [];

      const now = Date.now();
      const DAY = 86400000;
      const stale = outreach.filter(r => {
        if (r.status !== 'sent') return false;
        const age = now - new Date(r.timestamp).getTime();
        return age > 2 * DAY;
      });
      const overdue3 = stale.filter(r => (now - new Date(r.timestamp).getTime()) > 3 * DAY);
      const overdue7 = stale.filter(r => (now - new Date(r.timestamp).getTime()) > 7 * DAY);

      const settings = (function() { try { return JSON.parse(localStorage.getItem('followupSettings') || '{}'); } catch { return {}; } })();
      const delayDays = settings.delayDays || 3;
      const maxFollowups = settings.maxFollowups || 2;

      container.innerHTML = `
        <div class="mod-stat-row">
          <div class="mod-stat"><div class="mod-stat-val">${outreach.length}</div><div class="mod-stat-label">Total Sent</div></div>
          <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${stale.length}</div><div class="mod-stat-label">Need Follow-Up</div></div>
          <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${overdue3.length}</div><div class="mod-stat-label">3+ Days Old</div></div>
          <div class="mod-stat"><div class="mod-stat-val" style="color:#ef4444">${overdue7.length}</div><div class="mod-stat-label">7+ Days Old</div></div>
        </div>

        <div class="mod-section">
          <div class="mod-section-title">Follow-Up Rules</div>
          <div class="mod-card" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Follow up after (days)</label>
              <input type="number" id="fu-delay" value="${delayDays}" min="1" max="30" style="width:70px;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Max follow-ups</label>
              <input type="number" id="fu-max" value="${maxFollowups}" min="1" max="10" style="width:70px;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <button class="btn btn-secondary btn-sm" onclick="_saveFuSettings()" style="margin-top:14px"><i class="fas fa-save"></i> Save Rules</button>
          </div>
        </div>

        <div class="mod-section">
          <div class="mod-section-title">Needs Follow-Up (${stale.length})</div>
          ${stale.length ? `<table class="mod-table"><thead><tr><th>Lead</th><th>Sent</th><th>Age</th><th>Action</th></tr></thead><tbody>
            ${stale.slice(0,30).map(r => {
              const ageDays = Math.floor((now - new Date(r.timestamp).getTime()) / DAY);
              const urgColor = ageDays >= 7 ? '#ef4444' : ageDays >= 3 ? '#f59e0b' : 'var(--muted)';
              return `<tr>
                <td><strong>@${r.author||'unknown'}</strong><br><span style="font-size:.68rem;color:var(--muted)">${(r.postTitle||'').substring(0,40)}</span></td>
                <td style="font-size:.72rem;color:var(--muted)">${new Date(r.timestamp).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</td>
                <td style="color:${urgColor};font-weight:700">${ageDays}d</td>
                <td>
                  <button class="btn btn-primary btn-sm" onclick="_queueFollowUp(${r.id},'${(r.author||'').replace(/'/g,'')}')" style="font-size:.65rem;padding:2px 8px"><i class="fas fa-paper-plane"></i> Queue</button>
                  <button class="btn btn-secondary btn-sm" onclick="_markGhosted(${r.id})" style="font-size:.65rem;padding:2px 8px">Ghosted</button>
                </td>
              </tr>`;
            }).join('')}
          </tbody></table>` : '<div class="mod-empty"><i class="fas fa-check-circle"></i>No follow-ups needed right now</div>'}
        </div>`;

      window._saveFuSettings = function() {
        const d = parseInt(document.getElementById('fu-delay').value) || 3;
        const m = parseInt(document.getElementById('fu-max').value) || 2;
        localStorage.setItem('followupSettings', JSON.stringify({ delayDays: d, maxFollowups: m }));
        toast('Follow-up rules saved', 'ok');
      };

      window._queueFollowUp = async function(id, author) {
        await fetch('/api/outreach', { method: 'POST', body: JSON.stringify({ recipient: author, platform: 'reddit', message: 'Follow-up — checking in on my previous message. Would love to show you what I had in mind.', status: 'pending', followUpFor: id }) });
        toast('Follow-up queued for @' + author, 'ok');
        refreshCurrentModule();
      };

      window._markGhosted = async function(id) {
        await fetch('/api/analytics', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'ghosted' }) });
        toast('Marked as ghosted', 'ok');
        refreshCurrentModule();
      };
    } catch {
      container.innerHTML = '<div class="mod-error"><i class="fas fa-triangle-exclamation"></i><p>Could not load follow-up data</p></div>';
    }
  }
})
