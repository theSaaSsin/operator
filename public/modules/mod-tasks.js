({
  init() {},
  async render(container) {
    let tasks = [];
    try { tasks = JSON.parse(localStorage.getItem('operatorTasks') || '[]'); } catch {}

    const columns = ['todo', 'in_progress', 'done'];
    const colLabels = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
    const colColors = { todo: '#3b82f6', in_progress: '#f59e0b', done: '#22c55e' };
    const colCounts = {};
    columns.forEach(c => colCounts[c] = tasks.filter(t => t.status === c).length);

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val">${tasks.length}</div><div class="mod-stat-label">Total Tasks</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#3b82f6">${colCounts.todo}</div><div class="mod-stat-label">To Do</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${colCounts.in_progress}</div><div class="mod-stat-label">In Progress</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${colCounts.done}</div><div class="mod-stat-label">Done</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Quick Add Task</div>
        <div class="mod-card" style="display:flex;gap:8px;align-items:flex-end">
          <div style="flex:1">
            <input type="text" id="tk-title" placeholder="Task title..." style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit" onkeydown="if(event.key==='Enter')_addTask()">
          </div>
          <select id="tk-priority" style="background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <button class="btn btn-primary btn-sm" onclick="_addTask()"><i class="fas fa-plus"></i></button>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Kanban Board</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
          ${columns.map(col => `<div style="background:${colColors[col]}08;border:1px solid ${colColors[col]}22;border-radius:8px;padding:10px;min-height:250px">
            <div style="font-size:.78rem;font-weight:700;color:${colColors[col]};margin-bottom:10px;text-align:center">${colLabels[col]} (${colCounts[col]})</div>
            ${tasks.filter(t => t.status === col).map(t => {
              const idx = tasks.indexOf(t);
              const prioColors = { low: '#8888a0', medium: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' };
              return `<div style="background:rgba(0,0,0,.3);border-radius:6px;padding:8px;margin-bottom:6px;border-left:3px solid ${prioColors[t.priority] || '#888'}">
                <div style="font-size:.78rem;color:var(--text);margin-bottom:4px">${t.title}</div>
                <div style="font-size:.65rem;color:var(--muted);margin-bottom:6px">${t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : ''} · ${t.created ? new Date(t.created).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : ''}</div>
                <div style="display:flex;gap:4px;flex-wrap:wrap">
                  ${columns.filter(c => c !== col).map(c => `<button class="btn btn-secondary btn-sm" style="font-size:.6rem;padding:2px 6px" onclick="_moveTask(${idx},'${c}')">${colLabels[c]}</button>`).join('')}
                  <button class="btn btn-secondary btn-sm" style="font-size:.6rem;padding:2px 6px;color:#ef4444" onclick="_deleteTask(${idx})"><i class="fas fa-trash"></i></button>
                </div>
              </div>`;
            }).join('')}
          </div>`).join('')}
        </div>
      </div>`;

    window._addTask = function() {
      const title = document.getElementById('tk-title').value.trim();
      if (!title) return toast('Enter a task title', 'err');
      tasks.unshift({ title, priority: document.getElementById('tk-priority').value, status: 'todo', created: new Date().toISOString() });
      localStorage.setItem('operatorTasks', JSON.stringify(tasks));
      toast('Task added', 'ok');
      refreshCurrentModule();
    };
    window._moveTask = function(i, s) { tasks[i].status = s; localStorage.setItem('operatorTasks', JSON.stringify(tasks)); refreshCurrentModule(); };
    window._deleteTask = function(i) { tasks.splice(i, 1); localStorage.setItem('operatorTasks', JSON.stringify(tasks)); toast('Deleted', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 45 — Internal Task Manager</p>
      <p style="font-size:.75rem;color:var(--muted)">Kanban-style task board for managing operator work. Tasks auto-create from module events like follow-up reminders and lead actions.</p>`;
  }
})
