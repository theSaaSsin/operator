/* ════════════════════════════════════════════
   NOTIFICATIONS HUB — TheSaaSsin Operator
   Central activity feed. Polls /api/notifications
   every 8s, renders into panel + nav badge unread
   count + toast popup when a new one lands.
══════════════════════════════════════════════ */
(function () {
  if (window.__nhInit) return;
  window.__nhInit = true;

  const APIBase = (typeof window !== 'undefined' && window.location && window.location.origin)
    ? window.location.origin + '/api'
    : 'http://localhost:4000/api';

  const POLL_MS = 8000;
  let lastSeenIds = new Set();
  let currentFilter = 'all';

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return s + 's';
    const m = Math.floor(s / 60);
    if (m < 60) return m + 'm';
    const h = Math.floor(m / 60);
    if (h < 24) return h + 'h';
    return Math.floor(h / 24) + 'd';
  }

  function iconFor(type) {
    if (type.startsWith('workflow.start')) return 'fa-circle-notch fa-spin';
    if (type.startsWith('workflow.done')) return 'fa-check-circle';
    if (type.startsWith('workflow.error')) return 'fa-triangle-exclamation';
    if (type.startsWith('lead'))     return 'fa-user-plus';
    if (type.startsWith('client'))   return 'fa-id-card';
    if (type.startsWith('outreach')) return 'fa-paper-plane';
    if (type.startsWith('agent'))    return 'fa-comments';
    if (type.startsWith('feed'))     return 'fa-satellite-dish';
    return 'fa-bell';
  }

  function colorFor(type) {
    if (type === 'workflow.error') return 'var(--warn,#f59e0b)';
    if (type === 'workflow.done')  return '#22c55e';
    return 'var(--accent,#ff2a2a)';
  }

  function showToast(item) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = `🔔 ${item.title}`;
    t.className = 'toast-ok';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.className = '', 4000);
  }

  function updateBadge(unread) {
    const navItem = document.querySelector('[data-panel="notifications"]');
    if (!navItem) return;
    let badge = navItem.querySelector('.nh-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'nh-badge';
      navItem.appendChild(badge);
    }
    if (unread > 0) {
      badge.textContent = unread > 99 ? '99+' : String(unread);
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  function renderList(items) {
    const el = document.getElementById('nh-list');
    if (!el) return;
    if (!items.length) {
      el.innerHTML = '<div class="nh-empty"><i class="fas fa-inbox"></i><p>No notifications yet — start a workflow, scan a lead feed, or save a client.</p></div>';
      return;
    }
    el.innerHTML = items.map(item => {
      const cls = 'nh-item' + (item.read ? ' nh-read' : '');
      const colour = colorFor(item.type);
      return `<div class="${cls}" data-id="${item.id}" data-panel="${item.panel || ''}">
        <div class="nh-icon" style="color:${colour}"><i class="fas ${iconFor(item.type)}"></i></div>
        <div class="nh-body">
          <div class="nh-title">${escapeHtml(item.title)}</div>
          ${item.body ? `<div class="nh-text">${escapeHtml(item.body)}</div>` : ''}
          <div class="nh-meta">${escapeHtml(item.type)} · ${timeAgo(item.ts)} ago</div>
        </div>
        <button class="nh-x" data-action="del" data-id="${item.id}" title="Delete"><i class="fas fa-times"></i></button>
      </div>`;
    }).join('');
  }

  async function poll() {
    try {
      const res = await fetch(APIBase + '/notifications?filter=' + encodeURIComponent(currentFilter) + '&limit=80');
      const data = await res.json();
      if (!data.ok) return;

      // Detect newly arrived (broadcast toast)
      const allIds = data.notifications.map(n => n.id);
      const fresh = data.notifications.filter(n => !lastSeenIds.has(n.id) && lastSeenIds.size > 0);
      lastSeenIds = new Set(allIds);
      fresh.forEach(item => {
        // only toast if NOT currently on the notifications panel
        const onPanel = document.querySelector('.panel.active')?.id === 'panel-notifications';
        if (!onPanel) showToast(item);
      });

      renderList(data.notifications);
      updateBadge(data.unread);
    } catch (_) {
      // silent
    }
  }

  function bindUI() {
    // Filter pills
    document.querySelectorAll('.nh-filter').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.nh-filter').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentFilter = pill.dataset.filter;
        poll();
      });
    });

    // List interactions
    document.getElementById('nh-list')?.addEventListener('click', async (e) => {
      const delBtn = e.target.closest('[data-action="del"]');
      if (delBtn) {
        e.stopPropagation();
        const id = delBtn.dataset.id;
        await fetch(APIBase + '/notifications?id=' + encodeURIComponent(id), { method: 'DELETE' });
        poll();
        return;
      }
      const item = e.target.closest('.nh-item');
      if (!item) return;
      const id = item.dataset.id;
      const panel = item.dataset.panel;
      // Mark read
      await fetch(APIBase + '/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      // Jump to source panel if present
      if (panel) {
        const navItem = document.querySelector(`[data-panel="${panel}"]`);
        if (navItem) navItem.click();
      }
      poll();
    });

    document.getElementById('nh-mark-all')?.addEventListener('click', async () => {
      await fetch(APIBase + '/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
      poll();
    });

    document.getElementById('nh-clear')?.addEventListener('click', async () => {
      if (!confirm('Clear all notifications?')) return;
      await fetch(APIBase + '/notifications?all=1', { method: 'DELETE' });
      poll();
    });
  }

  function init() {
    // Wait until panel is in DOM
    const panel = document.getElementById('panel-notifications');
    if (!panel) {
      setTimeout(init, 200);
      return;
    }
    bindUI();
    poll();
    setInterval(poll, POLL_MS);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
