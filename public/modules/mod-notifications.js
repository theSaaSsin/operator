({
  init() {},
  async render(container) {
    let notifications = [];
    try { notifications = JSON.parse(localStorage.getItem('notifications') || '[]'); } catch {}
    let notifSettings = {};
    try { notifSettings = ((await fetch('/api/module-settings').then(r => r.json())).settings || {})['44'] || {}; } catch {}

    const unread = notifications.filter(n => !n.read).length;
    const eventTypes = ['new_lead', 'reply_detected', 'deal_closed', 'score_alert', 'booking', 'task_due'];
    const eventLabels = { new_lead: 'New Lead', reply_detected: 'Reply Detected', deal_closed: 'Deal Closed', score_alert: 'High Score Alert', booking: 'New Booking', task_due: 'Task Due' };
    const eventIcons = { new_lead: 'fa-user-plus', reply_detected: 'fa-reply', deal_closed: 'fa-handshake', score_alert: 'fa-fire', booking: 'fa-calendar-check', task_due: 'fa-tasks' };
    const eventColors = { new_lead: '#3b82f6', reply_detected: '#22c55e', deal_closed: '#f59e0b', score_alert: '#ef4444', booking: '#a855f7', task_due: '#06b6d4' };

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val">${notifications.length}</div><div class="mod-stat-label">Total</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#ef4444">${unread}</div><div class="mod-stat-label">Unread</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title" style="display:flex;justify-content:space-between;align-items:center">
          Notification Settings
        </div>
        <div class="mod-card">
          <p style="font-size:.75rem;color:var(--muted);margin-bottom:10px">Choose which events trigger notifications. Optionally send to Slack/Discord via webhook.</p>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px">
            ${eventTypes.map(e => {
              const enabled = notifSettings[e] !== false;
              return `<label style="display:flex;align-items:center;gap:6px;font-size:.75rem;color:var(--text);cursor:pointer;background:rgba(255,255,255,.03);padding:6px 8px;border-radius:6px">
                <input type="checkbox" class="notif-toggle" data-event="${e}" ${enabled ? 'checked' : ''} style="accent-color:var(--accent)">
                <i class="fas ${eventIcons[e]}" style="color:${eventColors[e]};font-size:.7rem"></i> ${eventLabels[e]}
              </label>`;
            }).join('')}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Slack Webhook URL</label>
              <input type="url" id="notif-slack" value="${notifSettings.slackUrl || ''}" placeholder="https://hooks.slack.com/..." style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Discord Webhook URL</label>
              <input type="url" id="notif-discord" value="${notifSettings.discordUrl || ''}" placeholder="https://discord.com/api/webhooks/..." style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="_saveNotifSettings()"><i class="fas fa-save"></i> Save Settings</button>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title" style="display:flex;justify-content:space-between;align-items:center">
          Notifications (${notifications.length})
          <div style="display:flex;gap:6px">
            <button class="btn btn-secondary btn-sm" onclick="_markAllRead()"><i class="fas fa-check-double"></i> Mark All Read</button>
            <button class="btn btn-secondary btn-sm" onclick="_clearNotifs()" style="color:#ef4444"><i class="fas fa-trash"></i> Clear All</button>
          </div>
        </div>
        ${notifications.length ? notifications.slice(0, 30).map((n, i) => `
          <div class="mod-card" style="margin-bottom:4px;display:flex;align-items:center;gap:10px;opacity:${n.read ? '.5' : '1'};cursor:pointer" onclick="_markRead(${i})">
            <i class="fas ${eventIcons[n.type] || 'fa-bell'}" style="color:${eventColors[n.type] || 'var(--muted)'};font-size:.9rem"></i>
            <div style="flex:1">
              <div style="font-size:.8rem;color:var(--text);font-weight:${n.read ? '400' : '600'}">${n.message}</div>
              <div style="font-size:.68rem;color:var(--muted)">${n.time ? new Date(n.time).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : ''}</div>
            </div>
            ${!n.read ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--accent)"></div>' : ''}
          </div>
        `).join('') : '<div class="mod-empty"><i class="fas fa-bell-slash"></i>No notifications yet — they appear here when key events happen</div>'}
      </div>`;

    window._saveNotifSettings = async function() {
      const settings = {};
      document.querySelectorAll('.notif-toggle').forEach(cb => { settings[cb.dataset.event] = cb.checked; });
      settings.slackUrl = document.getElementById('notif-slack').value.trim();
      settings.discordUrl = document.getElementById('notif-discord').value.trim();
      await fetch('/api/module-settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module: 44, settings }) });
      toast('Notification settings saved', 'ok');
    };
    window._markRead = function(i) { notifications[i].read = true; localStorage.setItem('notifications', JSON.stringify(notifications)); refreshCurrentModule(); };
    window._markAllRead = function() { notifications.forEach(n => n.read = true); localStorage.setItem('notifications', JSON.stringify(notifications)); refreshCurrentModule(); };
    window._clearNotifs = function() { localStorage.setItem('notifications', '[]'); toast('Cleared', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 44 — Notification System</p>
      <p style="font-size:.75rem;color:var(--muted)">In-app notifications with optional Slack/Discord webhook integration. Configure which events trigger alerts.</p>`;
  }
})
