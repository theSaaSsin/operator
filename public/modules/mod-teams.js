({
  init() {},
  async render(container) {
    let users = [];
    try { users = JSON.parse(localStorage.getItem('teamUsers') || '[]'); } catch {}
    let settings = {};
    try { settings = ((await fetch('/api/module-settings').then(r => r.json())).settings || {})['69'] || {}; } catch {}

    if (!users.length) {
      users = [{ name: 'Admin', email: 'admin@system.local', role: 'admin', active: true, created: new Date().toISOString() }];
      localStorage.setItem('teamUsers', JSON.stringify(users));
    }

    const roles = ['admin', 'operator', 'viewer'];
    const roleLabels = { admin: 'Admin', operator: 'Operator', viewer: 'Viewer' };
    const roleColors = { admin: '#ef4444', operator: '#3b82f6', viewer: '#8888a0' };
    const roleCounts = {};
    roles.forEach(r => roleCounts[r] = users.filter(u => u.role === r).length);

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val">${users.length}</div><div class="mod-stat-label">Team Members</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#ef4444">${roleCounts.admin}</div><div class="mod-stat-label">Admins</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#3b82f6">${roleCounts.operator}</div><div class="mod-stat-label">Operators</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${roleCounts.viewer}</div><div class="mod-stat-label">Viewers</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Add Team Member</div>
        <div class="mod-card">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Name</label>
              <input type="text" id="tm-name" placeholder="Full name" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Email</label>
              <input type="email" id="tm-email" placeholder="user@company.com" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Role</label>
              <select id="tm-role" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                ${roles.map(r => `<option value="${r}">${roleLabels[r]}</option>`).join('')}
              </select>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="_addUser()"><i class="fas fa-user-plus"></i> Add Member</button>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Team Members (${users.length})</div>
        <table class="mod-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th></th></tr></thead><tbody>
          ${users.map((u, i) => `<tr>
            <td><strong>${u.name}</strong></td>
            <td style="font-size:.72rem">${u.email}</td>
            <td>
              <select onchange="_changeRole(${i},this.value)" style="background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:4px;padding:2px 6px;color:${roleColors[u.role] || 'var(--text)'};font-size:.72rem;font-family:inherit">
                ${roles.map(r => `<option value="${r}" ${u.role===r?'selected':''}>${roleLabels[r]}</option>`).join('')}
              </select>
            </td>
            <td><button class="btn btn-sm ${u.active ? 'btn-primary' : 'btn-secondary'}" style="font-size:.65rem" onclick="_toggleUser(${i})">${u.active ? 'Active' : 'Disabled'}</button></td>
            <td style="font-size:.68rem;color:var(--muted)">${u.created ? new Date(u.created).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—'}</td>
            <td>${i > 0 ? `<button class="btn btn-secondary btn-sm" onclick="_removeUser(${i})" style="color:#ef4444;font-size:.6rem"><i class="fas fa-trash"></i></button>` : ''}</td>
          </tr>`).join('')}
        </tbody></table>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Role Permissions</div>
        <div class="mod-card">
          <table class="mod-table"><thead><tr><th>Permission</th><th style="text-align:center;color:#ef4444">Admin</th><th style="text-align:center;color:#3b82f6">Operator</th><th style="text-align:center;color:#8888a0">Viewer</th></tr></thead><tbody>
            ${[
              ['View dashboards', true, true, true],
              ['Manage leads & CRM', true, true, false],
              ['Send outreach', true, true, false],
              ['Manage clients', true, true, false],
              ['Configure modules', true, false, false],
              ['Manage team', true, false, false],
              ['Billing & API keys', true, false, false],
              ['System settings', true, false, false]
            ].map(([perm, admin, op, viewer]) => `<tr>
              <td style="font-size:.75rem">${perm}</td>
              <td style="text-align:center"><i class="fas ${admin ? 'fa-check' : 'fa-times'}" style="color:${admin ? '#22c55e' : '#555'}"></i></td>
              <td style="text-align:center"><i class="fas ${op ? 'fa-check' : 'fa-times'}" style="color:${op ? '#22c55e' : '#555'}"></i></td>
              <td style="text-align:center"><i class="fas ${viewer ? 'fa-check' : 'fa-times'}" style="color:${viewer ? '#22c55e' : '#555'}"></i></td>
            </tr>`).join('')}
          </tbody></table>
        </div>
      </div>`;

    window._addUser = function() {
      const name = document.getElementById('tm-name').value.trim();
      const email = document.getElementById('tm-email').value.trim();
      if (!name) return toast('Enter a name', 'err');
      if (!email) return toast('Enter an email', 'err');
      users.push({ name, email, role: document.getElementById('tm-role').value, active: true, created: new Date().toISOString() });
      localStorage.setItem('teamUsers', JSON.stringify(users));
      toast('Team member added', 'ok');
      refreshCurrentModule();
    };
    window._changeRole = function(i, r) { users[i].role = r; localStorage.setItem('teamUsers', JSON.stringify(users)); refreshCurrentModule(); };
    window._toggleUser = function(i) { if (i === 0) return toast('Cannot disable primary admin', 'err'); users[i].active = !users[i].active; localStorage.setItem('teamUsers', JSON.stringify(users)); refreshCurrentModule(); };
    window._removeUser = function(i) { users.splice(i, 1); localStorage.setItem('teamUsers', JSON.stringify(users)); toast('Removed', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 69 — Multi-User Team System</p>
      <p style="font-size:.75rem;color:var(--muted)">Manage team members with role-based access control. Three roles: Admin (full access), Operator (day-to-day), Viewer (read-only).</p>`;
  }
})
