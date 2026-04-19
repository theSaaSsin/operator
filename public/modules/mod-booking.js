({
  init() {},
  async render(container) {
    let settings = {};
    try { settings = (await fetch('/api/module-settings').then(r => r.json())).settings || {}; } catch {}
    const bookingSettings = settings['20'] || {};
    const calUrl = bookingSettings.calendarUrl || '';
    const webhookLog = (function() { try { return JSON.parse(localStorage.getItem('bookingLog') || '[]'); } catch { return []; } })();

    const anData = await fetch('/api/analytics').then(r => r.json()).catch(() => ({}));
    const booked = (anData.outreach || []).filter(r => r.status === 'booked');

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${booked.length}</div><div class="mod-stat-label">Calls Booked</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${webhookLog.length}</div><div class="mod-stat-label">Webhook Events</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Calendar Integration</div>
        <div class="mod-card">
          <div style="margin-bottom:8px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Calendly / Cal.com URL</label>
            <input type="url" id="bk-cal-url" value="${calUrl}" placeholder="https://calendly.com/yourname" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="btn btn-primary btn-sm" onclick="_saveCalUrl()"><i class="fas fa-save"></i> Save</button>
            ${calUrl ? `<a href="${calUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm"><i class="fas fa-external-link-alt"></i> Open Calendar</a>` : ''}
          </div>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Webhook Setup</div>
        <div class="mod-card">
          <p style="font-size:.78rem;color:var(--muted);margin-bottom:8px">Point your Calendly/Cal.com webhook to:</p>
          <div style="display:flex;gap:8px;align-items:center">
            <code style="flex:1;background:rgba(255,255,255,.06);padding:8px 10px;border-radius:6px;font-size:.78rem;color:var(--text);word-break:break-all" id="bk-webhook-url">${location.origin}/api/webhook</code>
            <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('bk-webhook-url').textContent);toast('Webhook URL copied','ok')"><i class="fas fa-copy"></i></button>
          </div>
          <p style="font-size:.7rem;color:var(--muted);margin-top:6px;opacity:.6">Incoming webhooks are logged automatically. Set event type to "invitee.created" in Calendly.</p>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Booked Calls (${booked.length})</div>
        ${booked.length ? `<table class="mod-table"><thead><tr><th>Lead</th><th>Niche</th><th>Date</th><th>Notes</th></tr></thead><tbody>
          ${booked.map(r => `<tr>
            <td><strong>@${r.author||'unknown'}</strong></td>
            <td>${r.niche||'—'}</td>
            <td style="font-size:.72rem;color:var(--muted)">${r.statusUpdatedAt ? new Date(r.statusUpdatedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}</td>
            <td style="font-size:.72rem;color:var(--muted)">${r.notes||'—'}</td>
          </tr>`).join('')}
        </tbody></table>` : '<div class="mod-empty"><i class="fas fa-calendar-check"></i>No bookings yet — book calls from the Reply Detection module</div>'}
      </div>`;

    window._saveCalUrl = async function() {
      const url = document.getElementById('bk-cal-url').value.trim();
      await fetch('/api/module-settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module: 20, settings: { calendarUrl: url } }) });
      toast('Calendar URL saved', 'ok');
      refreshCurrentModule();
    };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 20 — Appointment Booking</p>
      <p style="font-size:.75rem;color:var(--muted)">Configure your calendar URL above. Webhook events from Calendly/Cal.com will be logged at <code>/api/webhook</code>.</p>
      <p style="font-size:.72rem;color:var(--muted);margin-top:12px;opacity:.6">Supported: Calendly, Cal.com, or any service that sends JSON webhooks.</p>`;
  }
})
