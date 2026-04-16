/* ── TheSaaSsin Operator Panel — operator.js ── */
'use strict';

// Use relative path so API calls work on both localhost AND mobile via ngrok
const API = window.location.origin + '/api';

/* ── CLOCK ── */
(function clock() {
  const el = document.getElementById('clock');
  function tick() {
    if (el) el.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  tick(); setInterval(tick, 30000);
})();

/* ── TOAST ── */
function toast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'show ' + (type === 'err' ? 'toast-err' : 'toast-ok');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = ''; }, 3000);
}

/* ══════════════════════════════════════════════════
   MODULE SYSTEM — THE FULL 70-MODULE MAP
══════════════════════════════════════════════════ */
const MODULE_MAP = [
  {
    id: 'core', name: 'Core Layer', desc: 'Operator Brain — always present',
    icon: 'fa-microchip', color: '#ff2a2a',
    modules: [
      { n:1,  name:'Lead Feed Engine',           icon:'fa-satellite-dish',   status:'active', panel:'feed' },
      { n:2,  name:'Lead Classification System',  icon:'fa-tags',            status:'active', panel:'feed' },
      { n:3,  name:'Lead Scoring System',          icon:'fa-star-half-stroke',status:'active', panel:'crm' },
      { n:4,  name:'Lead Filtering System',        icon:'fa-filter',          status:'active', panel:'feed' },
      { n:5,  name:'CRM Pipeline',                 icon:'fa-chart-line',      status:'active', panel:'crm' },
      { n:6,  name:'Outreach Queue Manager',       icon:'fa-paper-plane',     status:'active', panel:'outreach' },
      { n:7,  name:'System Matcher Engine',         icon:'fa-puzzle-piece',    status:'building' },
      { n:8,  name:'Demo Builder Engine',           icon:'fa-wand-magic-sparkles', status:'active', panel:'client' },
      { n:9,  name:'Analytics Dashboard',           icon:'fa-chart-bar',       status:'active', panel:'analytics' },
      { n:10, name:'User Dashboard',                icon:'fa-gauge-high',      status:'active', panel:'dashboard' },
    ]
  },
  {
    id: 'acquisition', name: 'Acquisition', desc: 'Get clients — scraping, outreach, booking',
    icon: 'fa-bullseye', color: '#22c55e',
    modules: [
      { n:11, name:'Social Media Lead Scraper',     icon:'fa-hashtag',         status:'active', panel:'feed' },
      { n:12, name:'Keyword Detection Engine',      icon:'fa-crosshairs',      status:'building' },
      { n:13, name:'Lead Intent Analyzer',          icon:'fa-brain',           status:'building' },
      { n:14, name:'Competitor Lead Hijack',        icon:'fa-user-secret',     status:'planned' },
      { n:15, name:'Local Business Lead Finder',    icon:'fa-map-pin',         status:'planned' },
      { n:16, name:'Cold Outreach Msg Generator',   icon:'fa-comment-dots',    status:'active', panel:'feed' },
      { n:17, name:'Multi-Platform Outreach Sender', icon:'fa-share-nodes',    status:'planned' },
      { n:18, name:'Follow-Up Automation',          icon:'fa-clock-rotate-left', status:'planned' },
      { n:19, name:'Reply Detection + Routing',     icon:'fa-reply',           status:'planned' },
      { n:20, name:'Appointment Booking Integration', icon:'fa-calendar-check', status:'planned' },
    ,
      { n:14, name:'Competitor Lead Hijack',       icon:'fa-user-secret',   status:'planned', panel:'mod-competitor-hijack' },
      { n:15, name:'Local Business Lead Finder',   icon:'fa-map-pin',       status:'planned', panel:'mod-local-finder' },
      { n:16, name:'Cold Outreach Msg Generator',  icon:'fa-comment-dots',  status:'active',  panel:'mod-cold-outreach' }
    ]
  },
  {
    id: 'sales', name: 'Sales / Conversion', desc: 'Landing pages, funnels, proposals, closing',
    icon: 'fa-hand-holding-dollar', color: '#f59e0b',
    modules: [
      { n:21, name:'Landing Page Generator',        icon:'fa-file-code',       status:'active', panel:'client' },
      { n:22, name:'Funnel Builder',                icon:'fa-filter',          status:'planned' },
      { n:23, name:'Offer Generator',               icon:'fa-gift',            status:'planned' },
      { n:24, name:'Proposal Builder',              icon:'fa-file-invoice',    status:'planned' },
      { n:25, name:'Demo System Visualizer',        icon:'fa-eye',             status:'planned' },
      { n:26, name:'Testimonial / Proof Generator', icon:'fa-quote-left',      status:'planned' },
      { n:27, name:'Call Script Generator',         icon:'fa-phone',           status:'planned' },
      { n:28, name:'Pricing Structure Builder',     icon:'fa-money-bill-wave', status:'planned' },
      { n:29, name:'Objection Handling Scripts',    icon:'fa-shield-halved',   status:'planned' },
      { n:30, name:'Close Tracking System',         icon:'fa-handshake',       status:'planned' },
    ,
      { n:21, name:'Landing Page Generator',       icon:'fa-globe',         status:'planned', panel:'mod-landing-page' },
      { n:26, name:'Testimonial/Proof Generator',  icon:'fa-star',          status:'planned', panel:'mod-testimonials' },
      { n:27, name:'Call Script Generator',        icon:'fa-phone',         status:'planned', panel:'mod-call-script' },
      { n:28, name:'Pricing Structure Builder',    icon:'fa-tags',          status:'planned', panel:'mod-pricing' },
      { n:29, name:'Objection Handling Scripts',   icon:'fa-shield-halved', status:'planned', panel:'mod-objections' }
    ]
  },
  {
    id: 'content', name: 'Content / Brand', desc: 'Content creation, scheduling, brand identity',
    icon: 'fa-pen-nib', color: '#a855f7',
    modules: [
      { n:31, name:'Content Idea Generator',        icon:'fa-lightbulb',       status:'planned' },
      { n:32, name:'Short-Form Content Generator',  icon:'fa-video',           status:'planned' },
      { n:33, name:'Long-Form Content Generator',   icon:'fa-newspaper',       status:'planned' },
      { n:34, name:'Social Media Post Generator',   icon:'fa-thumbs-up',       status:'planned' },
      { n:35, name:'Content Scheduler',             icon:'fa-calendar-days',   status:'planned' },
      { n:36, name:'Visual Asset Generator',        icon:'fa-image',           status:'planned' },
      { n:37, name:'Brand Identity Builder',        icon:'fa-palette',         status:'planned' },
      { n:38, name:'Profile Optimizer',             icon:'fa-user-pen',        status:'planned' },
      { n:39, name:'Engagement Booster System',     icon:'fa-comments',        status:'planned' },
      { n:40, name:'Content Performance Tracker',   icon:'fa-chart-simple',    status:'planned' },
    ,
      { n:32, name:'Short-Form Content Generator', icon:'fa-video',         status:'planned', panel:'mod-short-form' },
      { n:33, name:'Long-Form Content Generator',  icon:'fa-newspaper',     status:'planned', panel:'mod-long-form' },
      { n:36, name:'Visual Asset Generator',       icon:'fa-image',         status:'planned', panel:'mod-visual-assets' },
      { n:38, name:'Profile Optimizer',            icon:'fa-user-circle',   status:'planned', panel:'mod-profile-optimizer' },
      { n:39, name:'Engagement Booster',           icon:'fa-comments',      status:'planned', panel:'mod-engagement' }
    ]
  },
  {
    id: 'automation', name: 'Automation / Operations', desc: 'Workflows, CRM automation, templates',
    icon: 'fa-gears', color: '#3b82f6',
    modules: [
      { n:41, name:'Workflow Automation Builder',   icon:'fa-diagram-project', status:'planned' },
      { n:42, name:'CRM Automation',                icon:'fa-robot',           status:'planned' },
      { n:43, name:'Email Automation',              icon:'fa-envelope-open-text', status:'planned' },
      { n:44, name:'Notification System',           icon:'fa-bell',            status:'planned' },
      { n:45, name:'Internal Task Manager',         icon:'fa-list-check',      status:'planned' },
      { n:46, name:'Client Onboarding Automation',  icon:'fa-user-check',      status:'planned' },
      { n:47, name:'Data Sync System',              icon:'fa-arrows-rotate',   status:'planned' },
      { n:48, name:'File / Asset Management',       icon:'fa-folder-open',     status:'planned' },
      { n:49, name:'Template Library',              icon:'fa-clone',           status:'planned' },
      { n:50, name:'System Cloning Tool',           icon:'fa-copy',            status:'planned' },
    ,
      { n:46, name:'Client Onboarding Automation', icon:'fa-user-check',    status:'planned', panel:'mod-onboarding' },
      { n:47, name:'Data Sync System',             icon:'fa-database',      status:'planned', panel:'mod-data-sync' },
      { n:48, name:'File / Asset Management',      icon:'fa-folder-open',   status:'planned', panel:'mod-file-assets' },
      { n:49, name:'Template Library',             icon:'fa-book',          status:'active',  panel:'mod-templates' },
      { n:50, name:'System Cloning Tool',          icon:'fa-clone',         status:'planned', panel:'mod-clone' }
    ]
  },
  {
    id: 'delivery', name: 'Client Delivery', desc: 'Client dashboards, training, handoff',
    icon: 'fa-truck-fast', color: '#06b6d4',
    modules: [
      { n:51, name:'Client Dashboard',              icon:'fa-gauge-high',      status:'planned' },
      { n:52, name:'System Overview Visual',        icon:'fa-sitemap',         status:'planned' },
      { n:53, name:'Training / Tutorial Generator', icon:'fa-graduation-cap',  status:'planned' },
      { n:54, name:'Progress Tracker',              icon:'fa-bars-progress',   status:'planned' },
      { n:55, name:'Performance Dashboard',         icon:'fa-chart-pie',       status:'planned' },
      { n:56, name:'Support / Messaging System',    icon:'fa-headset',         status:'planned' },
      { n:57, name:'Update / Change Request System',icon:'fa-code-pull-request', status:'planned' },
      { n:58, name:'Client Access Control',         icon:'fa-lock',            status:'planned' },
      { n:59, name:'System Export / Handoff',       icon:'fa-file-export',     status:'planned' },
      { n:60, name:'White-Label Option',            icon:'fa-tag',             status:'planned' },
    ,
      { n:53, name:'Training / Tutorial Generator',icon:'fa-graduation-cap',status:'planned', panel:'mod-training' },
      { n:55, name:'Performance Dashboard',        icon:'fa-chart-line',    status:'planned', panel:'mod-performance' },
      { n:57, name:'Update / Change Request System',icon:'fa-pen-to-square',status:'planned', panel:'mod-change-requests' },
      { n:58, name:'Client Access Control',        icon:'fa-lock',          status:'planned', panel:'mod-access-control' },
      { n:59, name:'System Export / Handoff',      icon:'fa-file-export',   status:'planned', panel:'mod-export' }
    ]
  },
  {
    id: 'expansion', name: 'Expansion', desc: 'Later — partners, marketplace, billing, teams',
    icon: 'fa-rocket', color: '#ec4899',
    modules: [
      { n:61, name:'Partner Management System',     icon:'fa-handshake',       status:'later' },
      { n:62, name:'Reseller Dashboard',            icon:'fa-store',           status:'later' },
      { n:63, name:'Marketplace Integration',       icon:'fa-cart-shopping',   status:'later' },
      { n:64, name:'API Access Layer',              icon:'fa-plug',            status:'later' },
      { n:65, name:'Plugin / Extension System',     icon:'fa-puzzle-piece',    status:'later' },
      { n:66, name:'Revenue Tracking System',       icon:'fa-sack-dollar',     status:'later' },
      { n:67, name:'Subscription / Billing System', icon:'fa-credit-card',     status:'later' },
      { n:68, name:'Affiliate System',              icon:'fa-people-arrows',   status:'later' },
      { n:69, name:'Multi-User Team System',        icon:'fa-users',           status:'later' },
      { n:70, name:'Global Analytics',              icon:'fa-earth-americas',  status:'later' },
    ,
      { n:61, name:'Partner Management System',    icon:'fa-handshake',     status:'later',   panel:'mod-partners' },
      { n:62, name:'Reseller Dashboard',           icon:'fa-store',         status:'later',   panel:'mod-resellers' },
      { n:63, name:'Marketplace Integration',      icon:'fa-plug',          status:'later',   panel:'mod-marketplace' },
      { n:65, name:'Plugin / Extension System',    icon:'fa-puzzle-piece',  status:'later',   panel:'mod-plugins' },
      { n:66, name:'Revenue Tracking System',      icon:'fa-receipt',       status:'later',   panel:'mod-revenue' },
      { n:68, name:'Affiliate System',             icon:'fa-people-arrows', status:'later',   panel:'mod-affiliates' },
      { n:7,  name:'System Matcher Engine',        icon:'fa-puzzle-piece',  status:'building',panel:'mod-system-matcher' }
    ]
  }
];

const STATUS_META = {
  active:   { label:'Live',     cls:'mod-active'  },
  building: { label:'Building', cls:'mod-building' },
  planned:  { label:'Planned',  cls:'mod-planned'  },
  later:    { label:'Later',    cls:'mod-later'    },
};
const STATUS_CYCLE = { planned: 'building', building: 'active', active: 'later', later: 'planned' };

function findModuleByNumber(moduleNumber) {
  for (const cat of MODULE_MAP) {
    const mod = cat.modules.find(m => m.n === moduleNumber);
    if (mod) return mod;
  }
  return null;
}

function updateSidebarModuleCounts() {
  MODULE_MAP.forEach(cat => {
    const active = cat.modules.filter(m => m.status === 'active').length;
    const countEl = document.getElementById('cat-count-' + cat.id);
    if (countEl) countEl.textContent = `${active}/${cat.modules.length}`;
  });
  const totalActive = MODULE_MAP.reduce((sum, cat) => sum + cat.modules.filter(m => m.status === 'active').length, 0);
  const versionEl = document.querySelector('.sidebar-version');
  if (versionEl) versionEl.textContent = `v0.2 — ${totalActive} / 70 modules`;
}

function renderDashboard() {
  const grid = document.getElementById('dash-grid');
  const statsEl = document.getElementById('dash-hero-stats');
  if (!grid) return;

  const totalActive   = MODULE_MAP.reduce((s, c) => s + c.modules.filter(m => m.status === 'active').length, 0);
  const totalBuilding = MODULE_MAP.reduce((s, c) => s + c.modules.filter(m => m.status === 'building').length, 0);
  const totalPlanned  = MODULE_MAP.reduce((s, c) => s + c.modules.filter(m => m.status === 'planned').length, 0);
  const totalLater    = MODULE_MAP.reduce((s, c) => s + c.modules.filter(m => m.status === 'later').length, 0);

  statsEl.innerHTML = `
    <div class="dash-stat"><div class="dash-stat-val" style="color:var(--success)">${totalActive}</div><div class="dash-stat-label">Live</div></div>
    <div class="dash-stat"><div class="dash-stat-val" style="color:var(--warn)">${totalBuilding}</div><div class="dash-stat-label">Building</div></div>
    <div class="dash-stat"><div class="dash-stat-val" style="color:var(--muted)">${totalPlanned + totalLater}</div><div class="dash-stat-label">Planned</div></div>
    <div class="dash-stat"><div class="dash-stat-val">70</div><div class="dash-stat-label">Total</div></div>`;

  grid.innerHTML = MODULE_MAP.map(cat => {
    const active = cat.modules.filter(m => m.status === 'active').length;
    const total  = cat.modules.length;
    const pct    = Math.round((active / total) * 100);

    const modsHTML = cat.modules.map(m => {
      const sm = STATUS_META[m.status];
      const clickable = m.panel ? `onclick="switchPanel('${m.panel}')"` : '';
      const safeNote = esc(m.note || '');
      const safeName = esc(m.name);
      return `<div class="dash-mod ${sm.cls}" ${clickable}>
        <span class="dash-mod-num">${m.n}</span>
        <i class="fas ${m.icon} dash-mod-icon"></i>
        <div class="dash-mod-info">
          <div class="dash-mod-name" title="${safeNote || safeName}">${safeName}</div>
        </div>
        <span class="dash-mod-status" onclick="event.stopPropagation();cycleModuleStatus(${m.n})" title="Click to cycle status">${sm.label}</span>
      </div>`;
    }).join('');

    return `<div class="dash-cat${cat.id === 'core' ? ' open' : ''}" data-cat="${cat.id}">
      <div class="dash-cat-header" onclick="toggleDashCat('${cat.id}')">
        <div class="dash-cat-icon" style="background:${cat.color}15;color:${cat.color}"><i class="fas ${cat.icon}"></i></div>
        <div class="dash-cat-info">
          <div class="dash-cat-name">${cat.name}</div>
          <div class="dash-cat-desc">${cat.desc}</div>
        </div>
        <div class="dash-cat-progress">
          <div class="dash-cat-bar"><div class="dash-cat-bar-fill" style="width:${pct}%;background:${cat.color}"></div></div>
          <div class="dash-cat-count">${active}/${total}</div>
        </div>
        <i class="fas fa-chevron-down dash-cat-chevron"></i>
      </div>
      <div class="dash-cat-body"><div class="dash-mod-grid">${modsHTML}</div></div>
    </div>`;
  }).join('');
}

function toggleDashCat(catId) {
  const el = document.querySelector(`.dash-cat[data-cat="${catId}"]`);
  if (el) el.classList.toggle('open');
}

async function loadModuleState() {
  try {
    const res = await fetch(API + '/modules');
    const data = await res.json();
    if (!data || !data.modules) return;
    Object.values(data.modules).forEach(row => {
      const mod = findModuleByNumber(Number(row.n));
      if (!mod) return;
      if (STATUS_META[row.status]) mod.status = row.status;
      mod.note = typeof row.note === 'string' ? row.note : '';
    });
    renderDashboard();
    updateSidebarModuleCounts();
  } catch {
    // Keep local defaults if module registry API is unavailable
  }
}

async function cycleModuleStatus(moduleNumber) {
  const mod = findModuleByNumber(Number(moduleNumber));
  if (!mod) return;
  const prev = mod.status;
  const next = STATUS_CYCLE[prev] || 'planned';
  mod.status = next;
  renderDashboard();
  updateSidebarModuleCounts();
  try {
    await fetch(API + '/modules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n: moduleNumber, status: next })
    });
    toast(`Module #${moduleNumber} → ${STATUS_META[next].label}`, 'ok');
  } catch {
    mod.status = prev;
    renderDashboard();
    updateSidebarModuleCounts();
    toast('Could not update module status', 'err');
  }
}

renderDashboard();
updateSidebarModuleCounts();
loadModuleState();

/* ── NAV ── */
const panels = document.querySelectorAll('.panel');
const navItems = document.querySelectorAll('.nav-item');
const topbarTitle = document.getElementById('topbar-title');
const TITLES = {
  dashboard: 'Dashboard',
  client: 'Client Creator',
  feed: 'Lead Feed',
  crm: 'CRM / Lead Pipeline',
  outreach: 'Outreach Queue',
  analytics: 'Outreach Analytics'
};

/* ── MODULE LOADER SYSTEM ── */
const _loadedModules = {};
let _currentModuleKey = null;

function _moduleFileKey(target) {
  return target.replace(/^mod-/, '');
}

function _findModuleByPanel(panelKey) {
  for (const cat of MODULE_MAP) {
    for (const m of cat.modules) {
      if (m.panel === panelKey) return m;
    }
  }
  return null;
}

function _findModuleByNavKey(navKey) {
  const fileKey = _moduleFileKey(navKey);
  for (const cat of MODULE_MAP) {
    for (const m of cat.modules) {
      if (m._navKey === navKey || m._fileKey === fileKey) return m;
    }
  }
  return null;
}

async function loadModulePanel(target) {
  const fileKey = _moduleFileKey(target);
  const modBody = document.getElementById('mod-body');
  const modTitle = document.getElementById('mod-title');
  const modSidebar = document.getElementById('mod-sidebar');

  modBody.innerHTML = '<div class="mod-loading"><i class="fas fa-circle-notch fa-spin"></i> Loading module…</div>';
  if (modSidebar) modSidebar.style.display = 'none';

  const mod = _findModuleByNavKey(target);
  modTitle.textContent = mod ? mod.name : fileKey;
  _currentModuleKey = fileKey;

  if (_loadedModules[fileKey]) {
    try {
      _loadedModules[fileKey].render(modBody, mod);
      if (_loadedModules[fileKey].renderSettings) {
        document.getElementById('mod-settings-btn').style.display = '';
      } else {
        document.getElementById('mod-settings-btn').style.display = 'none';
      }
    } catch (e) {
      modBody.innerHTML = `<div class="mod-error"><i class="fas fa-triangle-exclamation"></i><p>Module render error: ${e.message}</p></div>`;
    }
    return;
  }

  const scriptUrl = `modules/mod-${fileKey}.js`;
  try {
    const res = await fetch(scriptUrl);
    if (!res.ok) throw new Error(`Module file not found (${res.status})`);
    const code = await res.text();
    const moduleFactory = new Function('return ' + code)();
    _loadedModules[fileKey] = moduleFactory;

    if (moduleFactory.init) await moduleFactory.init(mod);
    moduleFactory.render(modBody, mod);

    if (moduleFactory.renderSettings) {
      document.getElementById('mod-settings-btn').style.display = '';
    } else {
      document.getElementById('mod-settings-btn').style.display = 'none';
    }
  } catch (e) {
    modBody.innerHTML = `<div class="mod-error"><i class="fas fa-triangle-exclamation"></i><p>Could not load module: ${e.message}</p><p class="mod-error-hint">Expected file: ${scriptUrl}</p></div>`;
    document.getElementById('mod-settings-btn').style.display = 'none';
  }
}

function toggleModSettings() {
  const sb = document.getElementById('mod-sidebar');
  const sbBody = document.getElementById('mod-sidebar-body');
  if (!sb) return;
  const isOpen = sb.style.display !== 'none';
  if (isOpen) { sb.style.display = 'none'; return; }
  sb.style.display = '';
  if (_currentModuleKey && _loadedModules[_currentModuleKey] && _loadedModules[_currentModuleKey].renderSettings) {
    _loadedModules[_currentModuleKey].renderSettings(sbBody);
  } else {
    sbBody.innerHTML = '<p style="color:var(--muted);font-size:.82rem;">No settings for this module.</p>';
  }
}

function refreshCurrentModule() {
  if (_currentModuleKey && _loadedModules[_currentModuleKey]) {
    const modBody = document.getElementById('mod-body');
    const mod = _findModuleByNavKey('mod-' + _currentModuleKey);
    _loadedModules[_currentModuleKey].render(modBody, mod);
  }
}

function switchPanel(target) {
  navItems.forEach(n => n.classList.remove('active'));
  panels.forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-panel="${target}"]`);
  if (navItem) navItem.classList.add('active');
  const mobBtn = document.querySelector(`.mob-nav-btn[data-panel="${target}"]`);
  if (mobBtn) mobBtn.classList.add('active');

  if (target && target.startsWith('mod-')) {
    const panel = document.getElementById('panel-module');
    if (panel) panel.classList.add('active');
    topbarTitle.textContent = 'Loading…';
    loadModulePanel(target);
    return;
  }

  const panel = document.getElementById('panel-' + target);
  if (panel) panel.classList.add('active');
  topbarTitle.textContent = TITLES[target] || target;
  if (target === 'crm') loadLeads();
  if (target === 'outreach') loadOutreach();
  if (target === 'analytics') loadAnalytics();
}

navItems.forEach(item => {
  item.addEventListener('click', () => switchPanel(item.dataset.panel));
});

document.querySelectorAll('.mob-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
});

/* ══════════════════════════════════
   CLIENT CREATOR
══════════════════════════════════ */
let selectedClient = null;
let generatedHTML  = '';

async function loadClients() {
  try {
    const res  = await fetch(API + '/clients');
    const data = await res.json();
    renderClientList(data.clients || []);
  } catch { renderClientList([]); }
}

function renderClientList(clients) {
  const list  = document.getElementById('client-list');
  const count = document.getElementById('client-count');
  count.textContent = clients.length;
  if (!clients.length) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No clients yet</p></div>';
    return;
  }
  list.innerHTML = clients.map(c => `
    <div class="client-card${selectedClient && selectedClient.id === c.id ? ' selected' : ''}"
         data-id="${c.id}" onclick="selectClient(${c.id})">
      <div class="client-avatar">${c.businessName.charAt(0).toUpperCase()}</div>
      <div class="client-info">
        <div class="client-name">${esc(c.businessName)}</div>
        <div class="client-meta">${esc(c.niche)} &middot; ${c.goal}</div>
      </div>
      <span class="badge badge-active">active</span>
    </div>`).join('');
}

function selectClient(id) {
  fetch(API + '/clients').then(r => r.json()).then(data => {
    const c = (data.clients || []).find(x => x.id === id);
    if (!c) return;
    selectedClient = c;
    document.getElementById('f-name').value     = c.businessName || '';
    document.getElementById('f-niche').value    = c.niche        || '';
    document.getElementById('f-offer').value    = c.offer        || '';
    document.getElementById('f-goal').value     = c.goal         || 'leads';
    document.getElementById('f-location').value = c.location     || '';
    document.getElementById('f-notes').value    = c.notes        || '';

    // Restore new fields
    document.getElementById('f-target').value = c.target || '';
    document.getElementById('f-usp').value    = c.usp    || '';

    // Restore tone
    if (c.tone) {
      document.querySelectorAll('[data-tone]').forEach(b => {
        b.classList.toggle('active', b.dataset.tone === c.tone);
      });
    }
    // Restore price point
    if (c.price) {
      document.querySelectorAll('[data-price]').forEach(b => {
        b.classList.toggle('active', b.dataset.price === c.price);
      });
    }
    // Restore stage
    if (c.stage) {
      document.querySelectorAll('[data-stage]').forEach(b => {
        b.classList.toggle('active', b.dataset.stage === c.stage);
      });
    }

    // Restore system component checkboxes
    if (c.systemComponents) {
      const sc = c.systemComponents;
      ['landing','crm','outreach','followup','booking'].forEach(key => {
        const el = document.getElementById('sys-' + key);
        if (el && sc[key] !== undefined) el.checked = sc[key];
      });
    }

    // Restore style settings
    if (c.style) {
      const s = c.style;
      if (s.primary) {
        document.getElementById('s-primary').value     = s.primary;
        document.getElementById('s-primary-hex').value = s.primary;
      }
      if (s.accent) {
        document.getElementById('s-accent').value      = s.accent;
        document.getElementById('s-accent-hex').value  = s.accent;
      }
      if (s.theme) {
        document.querySelectorAll('.theme-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.theme === s.theme);
        });
      }
      if (s.imgStyle) document.getElementById('s-imgstyle').value = s.imgStyle;
    }

    renderClientList(data.clients);
  });
}

document.getElementById('btn-clear-form').addEventListener('click', () => {
  ['f-name','f-niche','f-offer','f-target','f-usp','f-location','f-notes'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('f-goal').value = 'leads';
  selectedClient = null;
  document.getElementById('variant-shell').style.display = 'none';
  document.getElementById('preview-placeholder').style.display = 'flex';
  document.getElementById('btn-download').style.display  = 'none';
  document.getElementById('btn-copy-html').style.display = 'none';
  _variantHTMLs = ['', '', '']; _activeVariant = 0;
  const pkgBar = document.getElementById('pkg-bar');
  if (pkgBar) { pkgBar.innerHTML = ''; pkgBar.classList.remove('visible'); }
  generatedHTML = '';
});

function getActiveBtn(attr) {
  const el = document.querySelector(`[data-${attr}].active`);
  return el ? el.dataset[attr] : null;
}

function getFormPayload() {
  const style = getStyle();
  return {
    businessName: document.getElementById('f-name').value.trim(),
    niche:        document.getElementById('f-niche').value.trim(),
    offer:        document.getElementById('f-offer').value.trim(),
    target:       document.getElementById('f-target').value.trim(),
    usp:          document.getElementById('f-usp').value.trim(),
    price:        getActiveBtn('price') || 'mid',
    stage:        getActiveBtn('stage') || 'growing',
    goal:         document.getElementById('f-goal').value,
    location:     document.getElementById('f-location').value.trim(),
    notes:        document.getElementById('f-notes').value.trim(),
    tone:         style.tone,
    systemComponents: style.systems,
    style: {
      primary:  style.primary,
      accent:   style.accent,
      theme:    style.theme,
      imgStyle: style.imgStyle
    }
  };
}

document.getElementById('btn-save-client').addEventListener('click', async () => {
  const payload = getFormPayload();
  if (!payload.businessName) { toast('Business name is required', 'err'); return; }
  try {
    if (selectedClient) {
      // Update existing
      const res  = await fetch(API + '/clients', { method: 'PATCH', body: JSON.stringify({ ...payload, id: selectedClient.id }) });
      const data = await res.json();
      selectedClient = data.client;
      toast('Client updated', 'ok');
    } else {
      // Create new
      const res  = await fetch(API + '/clients', { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json();
      selectedClient = data.client;
      toast('Client saved', 'ok');
    }
    loadClients();
  } catch { toast('Could not save client', 'err'); }
});

/* ── STYLE CONTROLS WIRING ── */
(function() {
  // Sync color picker ↔ hex input
  function syncColor(pickerId, hexId) {
    const picker = document.getElementById(pickerId);
    const hex    = document.getElementById(hexId);
    if (!picker || !hex) return;
    picker.addEventListener('input', () => { hex.value = picker.value; });
    hex.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) picker.value = hex.value;
    });
  }
  syncColor('s-primary', 's-primary-hex');
  syncColor('s-accent',  's-accent-hex');

  // Theme button toggle
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Button group toggles — each group is isolated by data attribute
  ['tone', 'price', 'stage'].forEach(attr => {
    document.querySelectorAll(`[data-${attr}]`).forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll(`[data-${attr}]`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });

  // Style panel collapse toggle
  const header  = document.getElementById('style-toggle');
  const body    = document.getElementById('style-body');
  const chevron = document.getElementById('style-chevron');
  let open = false;
  if (body) body.style.display = 'none';  // collapsed by default
  if (header) header.addEventListener('click', () => {
    open = !open;
    body.style.display    = open ? 'flex' : 'none';
    chevron.classList.toggle('open', open);
  });
})();

function getStyle() {
  const activeTheme = document.querySelector('.theme-btn.active');
  const activeTone  = document.querySelector('.tone-btn.active');
  return {
    primary:  document.getElementById('s-primary-hex').value  || '#ff2a2a',
    accent:   document.getElementById('s-accent-hex').value   || '#ffffff',
    theme:    activeTheme ? activeTheme.dataset.theme : 'dark',
    tone:     activeTone  ? activeTone.dataset.tone  : 'professional',
    imgStyle: document.getElementById('s-imgstyle').value     || 'auto',
    imgUrl:   document.getElementById('s-imgurl').value.trim() || '',
    systems: {
      landing:  document.getElementById('sys-landing')  ? document.getElementById('sys-landing').checked  : true,
      crm:      document.getElementById('sys-crm')      ? document.getElementById('sys-crm').checked      : true,
      outreach: document.getElementById('sys-outreach') ? document.getElementById('sys-outreach').checked : true,
      followup: document.getElementById('sys-followup') ? document.getElementById('sys-followup').checked : true,
      booking:  document.getElementById('sys-booking')  ? document.getElementById('sys-booking').checked  : false
    }
  };
}

/* ── Derive 3 style variants from the client's chosen colours ── */
function buildVariantStyles(base) {
  // V1 — Bold/Contrast: client colours, darkest theme, aggressive punch
  const v1 = { ...base, theme: 'contrast', tone: 'aggressive' };

  // V2 — Dark/Professional: slightly shift accent to complement, dark theme
  const v2 = { ...base, theme: 'dark', tone: 'professional',
    accent: base.accent === '#ffffff' ? '#cccccc' : base.accent };

  // V3 — Light/Friendly: client primary on a light background
  const v3 = { ...base, theme: 'light', tone: 'friendly',
    accent: base.primary || base.accent };

  return [v1, v2, v3];
}

let _variantHTMLs   = ['', '', ''];
let _activeVariant  = 0;

function setActiveVariant(idx) {
  _activeVariant = idx;
  document.querySelectorAll('.variant-tab').forEach((t, i) => t.classList.toggle('active', i === idx));
  document.querySelectorAll('.variant-frame-wrap').forEach((w, i) => w.classList.toggle('active-frame', i === idx));
  generatedHTML = _variantHTMLs[idx];
  const useBtn = document.getElementById('btn-use-variant');
  if (useBtn) { useBtn.textContent = '✓ Use This'; useBtn.classList.remove('saved'); }
}

function useActiveVariant() {
  generatedHTML = _variantHTMLs[_activeVariant];
  const useBtn = document.getElementById('btn-use-variant');
  if (useBtn) { useBtn.textContent = '✓ Saved'; useBtn.classList.add('saved'); }
  if (selectedClient) {
    fetch(API + '/clients', {
      method: 'PATCH',
      body: JSON.stringify({ id: selectedClient.id, systems: { ...selectedClient.systems, landingPage: generatedHTML }, lastUpdated: new Date().toISOString() })
    }).then(r => r.json()).then(d => { if (d.client) selectedClient = d.client; }).catch(() => {});
  }
  toast('V' + (_activeVariant + 1) + ' set as active page', 'ok');
}

/* ── VARIANT EDITOR ── */
function toggleVariantEdit() {
  const panel = document.getElementById('variant-edit-panel');
  const btn   = document.getElementById('btn-variant-edit');
  const open  = panel.style.display !== 'none' && panel.style.display !== '';
  panel.style.display = open ? 'none' : 'flex';
  btn.classList.toggle('active', !open);
}

function reRenderActiveVariant() {
  const frame = document.getElementById('variant-frame-' + _activeVariant);
  if (!frame) return;
  // Reset height so it remeasures after re-write
  frame.style.height = '100%';
  writeToFrame(frame, _variantHTMLs[_activeVariant]);
  generatedHTML = _variantHTMLs[_activeVariant];
}

/* Patch the .btn{…} CSS block inside the variant HTML */
function patchBtnCSS(html, fn) {
  return html.replace(/(\.btn\{)([^}]+)(\})/, (_, open, props, close) => open + fn(props) + close);
}

function applyBtnShape(shape, clickedEl) {
  const radii = { pill: '28px', rounded: '8px', sharp: '3px', square: '0' };
  const r = radii[shape] || '28px';
  _variantHTMLs[_activeVariant] = patchBtnCSS(
    _variantHTMLs[_activeVariant],
    p => p.replace(/border-radius:[\w.]+/, 'border-radius:' + r)
  );
  reRenderActiveVariant();
  if (clickedEl) {
    clickedEl.closest('.vep-btns').querySelectorAll('.vep-btn').forEach(b => b.classList.remove('active'));
    clickedEl.classList.add('active');
  }
}

function applyBtnStyle(style, clickedEl) {
  _variantHTMLs[_activeVariant] = patchBtnCSS(
    _variantHTMLs[_activeVariant],
    p => {
      // Reset to neutral first, then apply
      p = p.replace(/background:[^;]+/, 'background:var(--accent)');
      p = p.replace(/border:[^;]+/, 'border:none');
      // Remove existing box-shadow entry to re-add or omit
      p = p.replace(/box-shadow:[^;]+;?/, '');

      if (style === 'filled') {
        // Restore box-shadow
        p = p.replace(/transition:/, 'box-shadow:0 6px 24px color-mix(in srgb,var(--accent) 40%,transparent);transition:');
      } else if (style === 'outline') {
        p = p.replace(/background:var\(--accent\)/, 'background:transparent');
        p = p.replace(/border:none/, 'border:2px solid var(--accent)');
      } else if (style === 'ghost') {
        p = p.replace(/background:var\(--accent\)/, 'background:rgba(255,255,255,.07)');
        p = p.replace(/border:none/, 'border:1px solid rgba(255,255,255,.18)');
      }
      return p;
    }
  );
  reRenderActiveVariant();
  if (clickedEl) {
    clickedEl.closest('.vep-btns').querySelectorAll('.vep-btn').forEach(b => b.classList.remove('active'));
    clickedEl.classList.add('active');
  }
}

function applyTextReplace() {
  const find    = document.getElementById('vep-find').value;
  const replace = document.getElementById('vep-replace-val').value;
  if (!find.trim()) { toast('Enter text to find', 'err'); return; }
  const before = _variantHTMLs[_activeVariant];
  _variantHTMLs[_activeVariant] = before.split(find).join(replace);
  if (_variantHTMLs[_activeVariant] === before) { toast('Not found', 'err'); return; }
  reRenderActiveVariant();
  document.getElementById('vep-find').value = '';
  document.getElementById('vep-replace-val').value = '';
  toast('Done', 'ok');
}

document.getElementById('btn-generate').addEventListener('click', () => {
  const name   = document.getElementById('f-name').value.trim()    || 'Your Business';
  const niche  = document.getElementById('f-niche').value.trim()   || 'your industry';
  const offer  = document.getElementById('f-offer').value.trim()   || 'our service';
  const target = document.getElementById('f-target').value.trim();
  const usp    = document.getElementById('f-usp').value.trim();
  const price  = getActiveBtn('price') || 'mid';
  const stage  = getActiveBtn('stage') || 'growing';
  const goal   = document.getElementById('f-goal').value;
  const loc    = document.getElementById('f-location').value.trim();
  const notes  = document.getElementById('f-notes').value.trim();
  const style  = getStyle();

  /* Resolve niche profile — drives ALL output */
  const profile = getNicheProfile(niche, offer, goal, loc);

  /* 1. Build all 3 landing page variants */
  const variantStyles = buildVariantStyles(style);
  const LABELS = [
    { label: 'V1', name: 'Bold' },
    { label: 'V2', name: 'Clean' },
    { label: 'V3', name: 'Light' }
  ];
  _variantHTMLs = variantStyles.map(vs =>
    buildLandingPage({ name, niche, offer, goal, loc, profile, style: vs, target, usp, price, stage })
  );
  _activeVariant = 0;
  generatedHTML = _variantHTMLs[0];
  showVariants(_variantHTMLs);

  /* 2. Full outreach sequence → outreach queue */
  const sequence = buildOutreachSequence({ name, niche, offer, loc, profile, style });
  if (style.systems.outreach) {
    sequence.forEach((msg) => {
      fetch(API + '/outreach', {
        method: 'POST',
        body: JSON.stringify({ clientName: name, niche, label: msg.label, message: msg.body })
      }).catch(() => {});
    });
  }

  /* 3. CRM + Offer → logged */
  console.log('[TheSaaSsin] CRM:', JSON.stringify(buildCRMStructure({ name, niche, offer, goal, profile }), null, 2));
  console.log('[TheSaaSsin] Offer:', JSON.stringify(buildOfferDefinition({ name, niche, offer, goal, loc, profile }), null, 2));

  /* 4. Package summary */
  showPackageSummary(buildPackageSummary({ name, profile, style }));

  /* 5. Auto-save V1 (Bold) to client — they can switch and re-save with Use This */
  if (selectedClient) {
    const updatedSystems = {
      landingPage: generatedHTML,
      outreach:    sequence.map(s => ({ label: s.label, body: s.body })),
      crm:         buildCRMStructure({ name, niche, offer, goal, profile }),
      generatedAt: new Date().toISOString()
    };
    fetch(API + '/clients', {
      method: 'PATCH',
      body: JSON.stringify({ id: selectedClient.id, systems: updatedSystems, lastUpdated: new Date().toISOString() })
    }).then(r => r.json()).then(d => { if (d.client) selectedClient = d.client; }).catch(() => {});
  }

  toast('3 variants generated for ' + name, 'ok');
});

document.getElementById('btn-download').addEventListener('click', () => {
  if (!generatedHTML) return;
  const blob = new Blob([generatedHTML], { type: 'text/html' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = (document.getElementById('f-name').value.trim() || 'client').replace(/\s+/g,'-').toLowerCase() + '.html';
  a.click();
  toast('HTML downloaded', 'ok');
});

document.getElementById('btn-copy-html').addEventListener('click', () => {
  if (!generatedHTML) return;
  navigator.clipboard.writeText(generatedHTML).then(() => toast('HTML copied to clipboard', 'ok'));
});

function writeToFrame(frame, html) {
  const doc = frame.contentDocument || frame.contentWindow.document;
  doc.open(); doc.write(html); doc.close();
  // After content loads, expand iframe to full content height so wrapper div handles scroll
  frame.onload = () => {
    try {
      const h = frame.contentDocument.documentElement.scrollHeight;
      if (h > 200) frame.style.height = h + 'px';
    } catch {}
  };
  // Fallback: set height after short delay (handles srcdoc timing)
  setTimeout(() => {
    try {
      const h = frame.contentDocument.documentElement.scrollHeight;
      if (h > 200) frame.style.height = h + 'px';
    } catch {}
  }, 300);
}

function showVariants(htmls) {
  document.getElementById('preview-placeholder').style.display = 'none';
  document.getElementById('variant-shell').style.display = 'flex';
  document.getElementById('btn-download').style.display  = 'inline-flex';
  document.getElementById('btn-copy-html').style.display = 'inline-flex';
  htmls.forEach((html, i) => {
    const frame = document.getElementById('variant-frame-' + i);
    if (!frame) return;
    writeToFrame(frame, html);
  });
  // Reset to V1 active
  document.querySelectorAll('.variant-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.querySelectorAll('.variant-frame-wrap').forEach((w, i) => w.classList.toggle('active-frame', i === 0));
  const useBtn = document.getElementById('btn-use-variant');
  if (useBtn) { useBtn.textContent = '✓ Use This'; useBtn.classList.remove('saved'); }
}

// Keep showPreview as fallback (used by buildFromLead)
function showPreview(html) {
  _variantHTMLs = [html, '', ''];
  _activeVariant = 0;
  generatedHTML  = html;
  showVariants([html, html, html]);
}

/* ══════════════════════════════════
   NICHE INTELLIGENCE ENGINE
══════════════════════════════════ */

/**
 * Returns a rich niche profile that drives all generator outputs.
 * Falls back gracefully if no keyword match — no generic filler.
 */
function getNicheProfile(niche, offer, goal, loc) {
  const n   = (niche + ' ' + offer).toLowerCase();
  const at  = loc ? ` in ${loc}` : '';
  const for_ = loc ? `for ${loc} homeowners` : 'for local homeowners';

  /* ── PLUMBER ── */
  if (/plumb|pipe|boiler|heating|gas|drain/.test(n)) return {
    type: 'trade',
    audience: `homeowners and landlords${at}`,
    scenarios: [
      `When your boiler dies at 9pm on a Sunday${at} — and every plumber you call either doesn't answer or quotes you a fortune just to show up`,
      `When you've got a leak spreading through the ceiling and you can't find anyone who can come today`,
      `When you've been let down by a tradesperson who said they'd show up and just… didn't`
    ],
    painPoints: [
      `Boiler breaks down${at} — nobody picks up, or they want £150 just to look at it`,
      `Waiting 3–5 days for a callout that should take hours`,
      `Getting quoted one price on the phone and a different one on the day`,
      `Never knowing if the person coming is actually qualified`
    ],
    outcomes: [
      `Same-day callout booked within 2 hours — 7 days a week${at}`,
      `Upfront fixed price before anyone sets foot in your home`,
      `Gas Safe registered — certificate provided on completion`,
      `Problem diagnosed and resolved in a single visit, 90% of the time`
    ],
    headline:  `${loc ? loc + ' Emergency Plumber' : 'Emergency Plumber Near You'} — Here Today, Not Next Week`,
    subline:   `${offer || 'Emergency callouts, boiler repairs & heating'} · Fixed pricing · Available 7 days`,
    cta:       goal === 'bookings' ? `Book a Callout${at}` : `Get a Fixed Quote Today`,
    ctaLow:    `Want me to show you what this system looks like for your setup?`,
    proof:     [`Trusted by 100+ ${loc || 'local'} homeowners`, 'Gas Safe registered', 'Same-day response', 'Fixed pricing — no surprises'],
    form:      { q1: `What's the problem? (e.g. no hot water, leak, boiler fault)`, q2: `Is this urgent — or can it wait a day or two?` }
  };

  /* ── ELECTRICIAN ── */
  if (/electric|wir|fuse|power|sparks/.test(n)) return {
    type: 'trade',
    audience: `homeowners, landlords and small businesses${at}`,
    scenarios: [
      `When a fuse keeps tripping and you don't know if it's safe to leave — let alone who to call`,
      `When a landlord certificate is overdue and your tenant's chasing you${at}`,
      `When you've had three electricians quote three wildly different prices and you still don't know who to trust`
    ],
    painPoints: [
      `Electrical faults you're not sure are safe to leave — and no one to call at short notice`,
      `Landlord certificates overdue, holding up a sale or new tenancy${at}`,
      `Quotes that vary by hundreds with no explanation`,
      `Electricians who book in then cancel, leaving you in the dark`
    ],
    outcomes: [
      `Fault found and fixed in a single visit — certificate issued same day`,
      `Landlord EICR completed within 48 hours, paperwork sent immediately`,
      `Fixed price agreed before work starts — nothing added on the day`,
      `NICEIC approved work, fully insured, guaranteed for 12 months`
    ],
    headline:  `${loc ? loc + ' Electrician' : 'Local Electrician'} — Certified, On Time, Fixed Price`,
    subline:   `${offer || 'Electrical installations, fault finding & certificates'} · NICEIC approved · No hidden costs`,
    cta:       goal === 'bookings' ? `Book a Free Assessment` : `Get a Fixed Quote`,
    ctaLow:    `Happy to show you what a system like this looks like for your business`,
    proof:     [`Trusted by ${loc || 'local'} homeowners & landlords`, 'NICEIC Approved', 'Same-day certificates', 'Fully insured'],
    form:      { q1: `What electrical work do you need?`, q2: `Is this a safety issue, or is it planned work?` }
  };

  /* ── BUILDER / RENOVATION ── */
  if (/build|construct|renovat|extension|loft|kitchen fit/.test(n)) return {
    type: 'trade',
    audience: `homeowners planning renovations${at}`,
    scenarios: [
      `When you've found a builder${at} but they want 50% upfront, no contract, and a verbal promise they'll be done by summer`,
      `When your kitchen renovation is on week 8 of a "3-week job" and the builder's gone quiet`,
      `When you get four quotes that are all different and none of them explain what's actually included`
    ],
    painPoints: [
      `Projects going 40% over budget with no warning it was coming`,
      `Builders${at} who disappear mid-job — phone goes straight to voicemail`,
      `No project timeline, no updates, no idea what's happening on site`,
      `Paying for work that wasn't done right the first time`
    ],
    outcomes: [
      `Fixed-price contract signed before a single tool is picked up`,
      `Dedicated project manager — you get updates without having to chase`,
      `Build diary with photos sent weekly so you always know the status`,
      `On-time completion or we work weekends to catch up at no extra cost`
    ],
    headline:  `${loc ? loc + ' Builder' : 'Local Builder'} You Can Actually Trust — Fixed Price, No Surprises`,
    subline:   `${offer || 'Extensions, renovations & kitchen fits'} · Fixed-price contracts · Project managed`,
    cta:       `Get a Free Project Quote`,
    ctaLow:    `Want me to pull together a quick outline for your project?`,
    proof:     [`50+ projects completed${at}`, 'Fixed-price contracts', 'Fully insured', '5-star Google reviews'],
    form:      { q1: `What project are you planning? (e.g. extension, loft, kitchen)`, q2: `Do you have a rough budget in mind, or are you still at the quote stage?` }
  };

  /* ── FITNESS / PT / GYM ── */
  if (/gym|fitness|personal train|pt |coach|weight|muscle|fat loss/.test(n)) return {
    type: 'fitness',
    audience: `people who are serious about results but keep hitting the same wall`,
    scenarios: [
      `When you've tried the gym three times this year, got results for about two weeks, then life got in the way and you're back at square one`,
      `When you're training consistently but the weight just isn't shifting — and you can't work out what you're doing wrong`,
      `When you've bought the programme, watched the videos, done everything right — and still don't look like any of the before and afters`
    ],
    painPoints: [
      `Paying for a gym${at ? ' ' + at : ''} you use twice a month and feel guilty about every time`,
      `Training with no real plan — just doing what feels right and hoping it works`,
      `Results that plateau after 3–4 weeks because nothing changes`,
      `Nutrition advice that contradicts itself every time you Google something`
    ],
    outcomes: [
      `Visible body composition change within 8 weeks — or your money back`,
      `A weekly plan that fits around your actual schedule, not a perfect one`,
      `Check-in every week — someone who notices if you've gone off track`,
      `Nutrition that works without weighing everything or cutting out entire food groups`
    ],
    headline:  `Stop Starting Over. Get a Plan Built for You${loc ? ' in ' + loc : ''} That Actually Sticks.`,
    subline:   `${offer || 'Personal training & transformation coaching'} · 8-week results · No contracts`,
    cta:       goal === 'leads' ? `Apply for a Free Strategy Call` : `Book Your Free Consultation`,
    ctaLow:    `Want me to show you what a 12-week plan would look like for your situation?`,
    proof:     [`50+ transformations${at}`, 'Average 8–10kg lost in 12 weeks', 'No lock-in contracts', 'Online & in-person'],
    form:      { q1: `What's your main goal? (e.g. lose fat, build muscle, get consistent)`, q2: `What's stopped you getting the result before?` }
  };

  /* ── CONSULTANT / COACH / FREELANCER ── */
  if (/consult|freelanc|strateg|adviso|coach|mentor/.test(n)) return {
    type: 'consulting',
    audience: `business owners who are working too hard for the revenue they're getting`,
    scenarios: [
      `When you're doing £10–20K a month but working 60 hours a week to hold it together — and you can't see how to grow without it getting worse`,
      `When you know exactly what needs to change in your business but you keep putting it off because there's no time to actually work on it`,
      `When a client ghosts after asking for a proposal and you spend three days wondering what went wrong`
    ],
    painPoints: [
      `Revenue is decent but the margin — after your time — barely makes sense`,
      `No system for getting clients consistently: some months great, some months nothing`,
      `Every new client feels like starting from scratch — no repeatable process`,
      `You're the bottleneck: nothing moves unless you're involved in it`
    ],
    outcomes: [
      `A repeatable client acquisition process that runs without you chasing — within 30 days`,
      `Revenue clarity: know exactly which activities are driving income and cut the rest`,
      `A clear 90-day plan that's specific to your business, not a generic framework`,
      `Reclaim 10+ hours a week by systemising what you're currently doing manually`
    ],
    headline:  `You Shouldn't Have to Work This Hard for This Result. Let's Fix That.`,
    subline:   `${offer || 'Business strategy & growth consulting'} · 30-day results · Built around your business`,
    cta:       `Book a Free 30-Min Strategy Call`,
    ctaLow:    `Happy to map out what's actually holding you back — no prep needed, just a 30-min call`,
    proof:     ['Average 3x ROI in 90 days', 'Former operator — not a theorist', '100% confidential', 'No long-term retainers'],
    form:      { q1: `What's the single biggest thing holding your business back right now?`, q2: `What have you already tried — and why do you think it didn't work?` }
  };

  /* ── MARKETING / AGENCY ── */
  if (/market|agency|seo|ads|social|lead gen|growth|digital/.test(n)) return {
    type: 'agency',
    audience: `business owners who've been burned by agencies before`,
    scenarios: [
      `When you're paying £2,000/month in ads and the agency's monthly report is 6 slides of metrics that don't explain why enquiries are down`,
      `When you hit month four of an SEO retainer and you're still "building domain authority" with nothing to show for it`,
      `When leads come in through the form but nobody calls back within the hour — and by the time someone does, they've moved on`
    ],
    painPoints: [
      `Ad spend going up, cost-per-lead going up, and the agency says "it's the algorithm"`,
      `No clear attribution — impossible to tell which channel is actually bringing in revenue`,
      `Leads from campaigns that don't convert because the follow-up is broken`,
      `Agencies who lock you into 6-month contracts and go quiet after month one`
    ],
    outcomes: [
      `Clear attribution dashboard live within 7 days — know exactly what's working`,
      `Avg 4x ROAS within 60 days or we work at cost until we hit it`,
      `Follow-up automation that contacts new leads within 5 minutes — automatically`,
      `No lock-in — monthly rolling, cancel with 30 days notice`
    ],
    headline:  `Your Last Agency Took Your Money. We Only Win When You Do.`,
    subline:   `${offer || 'Performance marketing & lead generation'} · ROI-focused · No long-term lock-in`,
    cta:       `Get a Free Account Audit`,
    ctaLow:    `Want me to take a quick look at your current setup and tell you what I'd fix first?`,
    proof:     ['£500K+ in ad spend managed', 'Avg 4x ROAS', 'No lock-in contracts', 'Weekly reporting — real numbers'],
    form:      { q1: `What are you currently running and what's it costing you per month?`, q2: `What does a "good result" actually look like for your business?` }
  };

  /* ── SAAS / TECH / AUTOMATION ── */
  if (/saas|software|app|tech|platform|tool|automat/.test(n)) return {
    type: 'saas',
    audience: `founders who are building but not growing fast enough`,
    scenarios: [
      `When you've shipped the product, you've got users, but you can't work out why 60% of them aren't coming back after week one`,
      `When your dev sprint is full but you're not sure half the features on the list are actually what users want`,
      `When you're doing all the right things — content, outreach, product updates — but MRR has been flat for three months`
    ],
    painPoints: [
      `Churn eating growth as fast as acquisition — net revenue barely moves`,
      `Building features users asked for but activation rates aren't improving`,
      `No onboarding system — users sign up, poke around, and leave before seeing value`,
      `Dev time spent on the wrong things because there's no clear signal from users`
    ],
    outcomes: [
      `Onboarding flow rebuilt to hit the "aha moment" within the first session — churn drops within 30 days`,
      `Clear feature priority based on what actually correlates with retention, not gut feel`,
      `Automated email sequences that bring dormant users back without manual effort`,
      `MRR movement within 60 days — or we keep working until it does`
    ],
    headline:  `${offer ? esc(offer) : 'Your Product'} Is Good. Here's Why It's Not Growing Faster.`,
    subline:   `${offer || 'SaaS growth systems & retention automation'} · Churn reduction · Scalable from current stage`,
    cta:       `Book a Free Discovery Call`,
    ctaLow:    `Want me to take a look at your onboarding flow and tell you what I'd change first?`,
    proof:     ['10+ SaaS products scaled', 'Avg 40% churn reduction in 60 days', 'From MVP to Series A', 'No bloated retainers'],
    form:      { q1: `What stage is the product and what's your current MRR?`, q2: `Where are users dropping off — and do you know why yet?` }
  };

  /* ── DEFAULT ── */
  return {
    type: 'general',
    audience: `business owners${at} who are tired of inconsistent results`,
    scenarios: [
      `When you have a great month and think you've cracked it — then the next month is half the revenue and you don't know why`,
      `When a potential client lands on your site, looks around, and leaves without contacting you — and you have no idea it's happening`,
      `When you're doing everything you're "supposed" to do but the pipeline still feels like it's running on luck`
    ],
    painPoints: [
      `Leads come in when you're busy — then dry up the moment you need them`,
      `People visit your site${at} and leave without contacting you — nothing captures them`,
      `No follow-up system: enquiries that don't convert immediately just disappear`,
      `Competitors${at} winning jobs that should be coming to you`
    ],
    outcomes: [
      `A consistent lead flow within 30 days — not dependent on referrals or luck`,
      `Automated follow-up that contacts every enquiry within minutes, not days`,
      `A site that converts visitors into booked calls — not just a digital brochure`,
      `${offer || 'Your service'} positioned to win${at} — priced, presented and promoted properly`
    ],
    headline:  `${offer ? esc(offer) : 'Your Business'}${at} — Built to Get Clients Consistently.`,
    subline:   `Stop relying on referrals. Build a system that fills your pipeline — every month.`,
    cta:       goal === 'bookings' ? `Book a Free Strategy Call` : `Get Your Free Growth Plan`,
    ctaLow:    `Want me to map out what this would look like for your business specifically?`,
    proof:     [`Trusted by ${loc || 'UK'} businesses`, 'Proven system', '14-day delivery', 'Free strategy call'],
    form:      { q1: `What are you trying to achieve in the next 90 days?`, q2: `What's currently in place — and what do you think is missing?` }
  };
}

/* ── IMAGE LOOKUP ── */
function getNicheImage(niche, offer, imgStyle, imgUrl, profileType) {
  if (imgUrl) return imgUrl;
  const n = (niche + ' ' + offer).toLowerCase();

  // High-quality, context-matched images per profile type (auto mode)
  const typeImgs = {
    trade:      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1400&q=80', // tradesperson at work
    fitness:    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&q=80', // real training intensity
    consulting: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=80', // clean strategy desk
    agency:     'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=80', // marketing/analytics screen
    saas:       'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&q=80',    // developer/code screens
    general:    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80'  // clean minimal office
  };

  if (imgStyle === 'auto' && profileType && typeImgs[profileType]) {
    return typeImgs[profileType];
  }

  // Manual style override
  const autoStyle = /plumb|pipe|boiler|electric|build|construct|trade|weld|drain/.test(n) ? 'industrial'
                  : /gym|fitness|train|coach|weight|muscle/.test(n) ? 'fitness'
                  : /saas|software|app|tech|digital|automat/.test(n) ? 'tech'
                  : /consult|strateg|freelanc|coach|mentor/.test(n) ? 'corporate'
                  : 'neutral';
  const resolvedStyle = imgStyle === 'auto' ? autoStyle : imgStyle;
  const imgs = {
    industrial: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80',  // construction site
    fitness:    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&q=80',  // training intensity
    corporate:  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=80',  // strategy desk
    tech:       'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&q=80',     // dev/code
    neutral:    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80'   // minimal office
  };
  return imgs[resolvedStyle] || imgs.neutral;
}

/* ── THEME PRESETS ── */
const THEMES = {
  dark:     { bg:'#0a0a0f', bg2:'#0d0d14', card:'#121218', text:'#f0f0f5', muted:'#8888a0', border:'rgba(255,255,255,0.06)' },
  light:    { bg:'#f5f5fa', bg2:'#ffffff',  card:'#ffffff', text:'#1a1a2e', muted:'#666680', border:'rgba(0,0,0,0.08)' },
  contrast: { bg:'#000000', bg2:'#111111',  card:'#0d0d0d', text:'#ffffff', muted:'#aaaaaa', border:'rgba(255,255,255,0.12)' }
};

/* ── TONE ADAPTERS ── */
function applyTone(profile, tone) {
  if (tone === 'friendly') {
    return Object.assign({}, profile, {
      cta:    profile.ctaLow || 'Want me to map this out for you?',
      ctaLow: 'Let me show you exactly what this would look like for you',
      headline: profile.headline.replace(/\.$/, '') + ' — Let\'s Fix That Together.'
    });
  }
  if (tone === 'aggressive') {
    return Object.assign({}, profile, {
      cta:    profile.cta.replace('Free', 'Your').replace('Get a', 'Claim Your'),
      headline: profile.headline.toUpperCase().substring(0,1) + profile.headline.substring(1)
    });
  }
  return profile; // professional — default, no change
}

/* ── LANDING PAGE GENERATOR ── */
function buildLandingPage({ name, niche, offer, goal, loc, profile, style, target, usp, price, stage }) {
  const p  = applyTone(profile, (style && style.tone) || 'professional');
  const st = style || { primary:'#ff2a2a', accent:'#ffffff', theme:'dark', tone:'professional', imgStyle:'auto', imgUrl:'' };

  // ── Lead context injection — consume & clear so next manual generate is clean ──
  const lc = window.currentLeadContext || null;
  window.currentLeadContext = null;

  // Defaults — may be overridden by lead context below
  let overrideHeadline = p.headline;
  let overrideEyebrow  = usp || p.eyebrow || niche;
  let overrideSubline  = null; // null = use profile subline
  let overrideCta      = p.cta;
  let overrideCtaLow   = p.ctaLow;
  let overrideScenariosLabel = 'Sound familiar?';
  let leadScenarios    = p.scenarios || [];

  if (lc && lc.ctx) {
    const ctx = lc.ctx;
    // 1. Headline — from context engine (specific to their situation)
    overrideHeadline = ctx.headline;
    // 2. Eyebrow — short positioning angle
    overrideEyebrow  = ctx.angle;
    // 3. Subline — context-aware subtext (override p.subline)
    overrideSubline  = ctx.subtext;
    // 4. Scenarios — generated from their actual problem/emotion (replaces niche defaults)
    leadScenarios    = ctx.scenarios;
    overrideScenariosLabel = 'Does this sound like you?';
    // 5. CTA — personal, built-for-them
    overrideCta    = lc.forcedCta
      || (lc.demoFocus
        ? `I mocked up a ${lc.demoFocus} for this — want to see it?`
        : 'I built this based on your post — want to see it?');
    overrideCtaLow = lc.forcedCtaLow
      || 'Want to see how this would work for your specific situation?';
  } else if (lc) {
    // Legacy fallback (pre-context-engine)
    if (lc.angle) overrideHeadline = lc.angle;
    if (lc.problem) overrideEyebrow = `Solving: ${lc.problem}`;
    if (lc.pain) { leadScenarios = [lc.pain, ...leadScenarios].slice(0, 4); overrideScenariosLabel = 'Does this sound like you?'; }
    overrideCta = lc.forcedCta || (lc.demoFocus ? `I mocked up a ${lc.demoFocus} for this — want to see it?` : 'I built this based on your post — want to see it?');
    overrideCtaLow = lc.forcedCtaLow || 'Want to see how this would work for your specific situation?';
  }

  // Build tailored copy from new fields
  const targetLine  = target ? `Built for ${target}` : '';
  const uspBadge    = usp    ? usp : '';
  const priceLabel  = { budget:'Affordable Pricing', mid:'Professional Service', premium:'Premium Service' }[price] || 'Professional Service';
  const stageLine   = { new:'New & Already Delivering Results', growing:'Trusted & Growing Fast', established:'Established. Proven. Trusted.' }[stage] || '';
  const heroUsp     = `<div class="eyebrow">${esc(overrideEyebrow)}</div>`;
  const targetBadge = target ? `<div class="proof-item"><span class="proof-dot">●</span>Serving ${esc(target)}</div>` : '';
  const stageBadge  = stageLine ? `<div class="proof-item"><span class="proof-dot">●</span>${esc(stageLine)}</div>` : '';
  const priceBadge  = `<div class="proof-item"><span class="proof-dot">●</span>${esc(priceLabel)}</div>`;
  const th = THEMES[st.theme] || THEMES.dark;
  const imgSrc = getNicheImage(niche, offer, st.imgStyle, st.imgUrl, profile.type);

  // When lead context exists — use context engine for ALL content blocks
  const ctx            = lc && lc.ctx;
  const activePain     = ctx ? ctx.painPoints : p.painPoints;
  const activeOutcomes = ctx ? ctx.outcomes   : p.outcomes;
  const activeProof    = ctx ? ctx.proof      : p.proof;
  const activeForm     = ctx ? ctx.formQs     : p.form;

  const painHTML  = activePain.map(pt =>
    `<li><span class="x">✕</span> ${esc(pt)}</li>`).join('');
  const outHTML   = activeOutcomes.map(ot =>
    `<li><span class="chk">✓</span> ${esc(ot)}</li>`).join('');
  const proofHTML = activeProof.map(pr =>
    `<div class="proof-item"><span class="proof-dot">●</span>${esc(pr)}</div>`).join('');
  const scenariosHTML = leadScenarios.map(s =>
    `<div class="scenario"><span class="sc-q">"</span>${esc(s)}<span class="sc-q">"</span></div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(name)}</title>
<style>
:root{
  --accent:${st.primary};
  --accent2:${st.accent};
  --dark:${th.bg};
  --bg2:${th.bg2};
  --card:${th.card};
  --text:${th.text};
  --muted:${th.muted};
  --border:${th.border};
  --success:#22c55e;
}
*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',system-ui,sans-serif}
body{background:var(--dark);color:var(--text);line-height:1.6}
header{padding:18px 6%;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);position:sticky;top:0;background:${th.bg}ee;backdrop-filter:blur(10px);z-index:100}
.logo{font-size:1.25rem;font-weight:800;color:var(--text);text-decoration:none;letter-spacing:-.02em}
.logo em{color:var(--accent);font-style:normal}
.btn{display:inline-block;background:var(--accent);color:${st.theme==='light'?'#fff':st.accent};padding:14px 32px;border-radius:28px;text-decoration:none;font-weight:700;font-size:.95rem;letter-spacing:.02em;box-shadow:0 6px 24px color-mix(in srgb,var(--accent) 40%,transparent);transition:all .2s;border:none;cursor:pointer;font-family:inherit}
.btn:hover{transform:translateY(-2px);filter:brightness(1.1);}
/* HERO */
.hero{padding:0;text-align:center;position:relative;overflow:hidden;min-height:520px;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.hero-bg{position:absolute;inset:0;background-image:url('${imgSrc}');background-size:cover;background-position:center;filter:${st.theme==='light'?'brightness(.55) saturate(.8)':'brightness(.25) saturate(.7)'}}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,${th.bg}cc 0%,${th.bg}88 60%,${th.bg}ff 100%)}
.hero-content{position:relative;z-index:2;padding:96px 6% 72px;width:100%}
.eyebrow{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.18em;color:var(--accent);margin-bottom:18px;opacity:.9}
.hero h1{font-size:clamp(1.9rem,4.5vw,3rem);font-weight:800;line-height:1.15;margin-bottom:18px;max-width:820px;margin-left:auto;margin-right:auto}
.hero h1 em{color:var(--accent);font-style:normal}
.hero .sub{font-size:1.1rem;color:var(--muted);max-width:560px;margin:0 auto 32px}
.proof-row{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 20px;margin-top:28px;margin-bottom:0}
.proof-item{font-size:.8rem;color:var(--muted);display:flex;align-items:center;gap:6px}
.proof-dot{color:var(--accent);font-size:.5rem}
/* PAIN / OUTCOME */
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:900px;margin:0 auto}
.box{background:var(--card);border-radius:12px;padding:28px 24px;border:1px solid rgba(255,255,255,.05)}
.box h3{font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:16px}
.box.pain h3{color:#ff6b6b}
.box.win  h3{color:var(--success)}
.box ul{list-style:none;display:flex;flex-direction:column;gap:10px}
.box ul li{font-size:.88rem;color:var(--muted);display:flex;align-items:flex-start;gap:8px;line-height:1.45}
.x{color:#ff4444;flex-shrink:0;font-weight:700}
.chk{color:var(--success);flex-shrink:0;font-weight:700}
/* FORM */
.form-section{padding:80px 6%;max-width:620px;margin:0 auto;text-align:center}
.form-section h2{font-size:1.8rem;font-weight:800;margin-bottom:12px}
.form-section p{color:var(--muted);margin-bottom:32px;font-size:1rem}
.form-wrap{background:var(--card);border:1px solid rgba(255,42,42,.2);border-radius:14px;padding:32px;text-align:left;display:flex;flex-direction:column;gap:18px}
.form-wrap label{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);display:block;margin-bottom:6px}
.form-wrap textarea,.form-wrap input{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px 14px;color:var(--text);font-size:.9rem;font-family:inherit;outline:none;transition:border .2s;resize:vertical}
.form-wrap textarea:focus,.form-wrap input:focus{border-color:rgba(255,42,42,.4)}
.form-wrap textarea{min-height:80px}
.form-wrap .btn{width:100%;margin-top:4px;font-size:1rem;padding:16px}
.form-note{text-align:center;font-size:.72rem;color:var(--muted);margin-top:10px;opacity:.7}
/* SECTIONS */
.section{padding:72px 6%;}
.section-inner{max-width:1060px;margin:0 auto}
.section h2{font-size:1.8rem;font-weight:800;text-align:center;margin-bottom:44px;position:relative}
.section h2::after{content:'';position:absolute;bottom:-12px;left:50%;transform:translateX(-50%);width:48px;height:3px;background:var(--accent);border-radius:2px}
/* SCENARIOS */
.scenarios{padding:64px 6%;background:var(--bg2,#0d0d14);border-top:1px solid rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.04)}
.scenarios-inner{max-width:760px;margin:0 auto}
.scenarios h2{font-size:1.55rem;font-weight:800;text-align:center;margin-bottom:36px;color:#fff}
.scenario{background:var(--card);border-left:3px solid var(--accent);border-radius:0 10px 10px 0;padding:18px 22px;margin-bottom:14px;font-size:.95rem;color:var(--muted);line-height:1.6;font-style:italic}
.scenario:last-child{margin-bottom:0}
.sc-q{color:var(--accent);font-style:normal;font-size:1.2rem;line-height:1}
/* LEAD ORIGIN QUOTE */
.lead-origin{text-align:center;padding:28px 6% 0;display:flex;flex-direction:column;align-items:center;gap:8px}
.lead-origin-label{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:var(--accent);opacity:.8}
.lead-origin-quote{font-size:.95rem;color:var(--muted);font-style:italic;max-width:640px;line-height:1.6;opacity:.85}
footer{text-align:center;padding:28px 6%;color:var(--muted);font-size:.8rem;border-top:1px solid rgba(255,255,255,.05)}
@media(max-width:640px){.two-col{grid-template-columns:1fr}.hero{padding:76px 5% 56px}.scenarios{padding:48px 5%}}
</style>
</head>
<body>
<header>
  <a class="logo" href="#"><em>${esc(name)}</em></a>
  <a class="btn" href="#capture" style="padding:10px 20px;font-size:.82rem">${esc(overrideCta)}</a>
</header>

<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    ${heroUsp}
    <h1>${esc(overrideHeadline)}</h1>
    <p class="sub">${esc(overrideSubline || (target ? `For ${target}. ` : '') + p.subline)}</p>
    <a class="btn" href="#capture">${esc(overrideCta)}</a>
    <div class="proof-row">
      ${proofHTML}
      ${targetBadge}
      ${stageBadge}
      ${priceBadge}
    </div>
  </div>
</section>

${lc && lc.rawTitle ? `
<div class="lead-origin">
  <span class="lead-origin-label">Based on what you said</span>
  <span class="lead-origin-quote">"${esc(lc.rawTitle.substring(0, 160))}"</span>
</div>` : ''}

${scenariosHTML ? `<section class="scenarios"><div class="scenarios-inner"><h2>${esc(overrideScenariosLabel)}</h2>${scenariosHTML}</div></section>` : ''}

<section class="section" style="background:var(--bg2);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="section-inner">
    <h2>${ctx ? 'Here\'s what\'s happening — and what changes' : 'What\'s broken — and what changes'}</h2>
    <div class="two-col">
      <div class="box pain">
        <h3>Right now</h3>
        <ul>${painHTML}</ul>
      </div>
      <div class="box win">
        <h3>${ctx ? 'With the right system' : 'After working with us'}</h3>
        <ul>${outHTML}</ul>
      </div>
    </div>
  </div>
</section>

<section class="form-section" id="capture">
  <h2>${esc(overrideCtaLow || 'Let\'s map it out.')}</h2>
  <p>Two quick questions. Then a free 30-minute call where we build the plan — specific to your business, not a template.</p>
  <div class="form-wrap">
    <div>
      <label>${esc(activeForm.q1)}</label>
      <textarea placeholder="Your answer..."></textarea>
    </div>
    <div>
      <label>${esc(activeForm.q2)}</label>
      <textarea placeholder="Your answer..."></textarea>
    </div>
    <div>
      <label>Your name &amp; best contact number</label>
      <input type="text" placeholder="Name · Phone / WhatsApp">
    </div>
    <a class="btn" href="https://calendly.com/thesaassin/build-your-system" target="_blank" rel="noopener">${esc(overrideCta)}</a>
    <p class="form-note">No spam. No hard sell. Just a 30-minute call with a clear plan.</p>
  </div>
</section>

<footer>
  &copy; ${new Date().getFullYear()} ${esc(name)}${loc ? ' &middot; ' + esc(loc) : ''}. System by <a href="https://thesaassin.com" style="color:var(--accent);text-decoration:none">TheSaaSsin</a>.
</footer>
</body>
</html>`;
}

/* ── OUTREACH SEQUENCE GENERATOR (5 messages) ── */
function buildOutreachSequence({ name, niche, offer, loc, profile, style }) {
  const p      = profile;
  const tone   = (style && style.tone) || 'professional';
  const at     = loc ? ` in ${loc}` : '';
  const pain0  = p.painPoints[0];
  const pain1  = p.painPoints[1] || p.painPoints[0];
  const win0   = p.outcomes[0];
  const scene  = p.scenarios ? p.scenarios[0] : null;

  // Opener CTA line varies by tone
  const opener_close = tone === 'friendly'
    ? `I'd love to show you what a system built for your setup would look like — no pressure, just a quick look.\n\n15 min? → https://calendly.com/thesaassin/build-your-system`
    : tone === 'aggressive'
    ? `If you want to fix that this month — reply and I'll send you a preview built specifically for ${name}.\n\nSlot: https://calendly.com/thesaassin/build-your-system`
    : `Worth a 15-min call to see if there's a fit?\n\n→ https://calendly.com/thesaassin/build-your-system`;

  const followup_close = tone === 'friendly'
    ? `Happy to just take a look and tell you honestly what I'd tweak. No prep needed.\n\n→ https://calendly.com/thesaassin/build-your-system`
    : tone === 'aggressive'
    ? `Free audit. 30 minutes. You walk away with a plan either way.\n\nClaim it → https://calendly.com/thesaassin/build-your-system`
    : `30 minutes → https://calendly.com/thesaassin/build-your-system`;

  return [
    {
      label: '1 — Opener',
      body:
`[First Name] — quick one.

Are enquiries coming in consistently${at}, or is it still hit and miss month to month?

I build client acquisition systems for ${niche} businesses — and the most common thing I see is: ${pain0.toLowerCase()}.

${scene ? 'Sound familiar?\n\n"' + scene + '"\n\n' : ''}${opener_close}

— TheSaaSsin`
    },
    {
      label: '2 — Value',
      body:
`[First Name] — following up.

Here's what I actually build for ${niche} businesses like ${name}:

→ ${win0}
→ ${p.outcomes[1]}
→ ${p.outcomes[2] || 'A system that works without you manually chasing it'}

The whole thing is live in 14 days. No retainers, no lock-in.

${tone === 'friendly' ? 'Want me to show you what it looks like for your setup? No obligation.' : tone === 'aggressive' ? 'This is what your competitors are missing. Don\'t wait on it.' : p.ctaLow || 'Want me to show you what it looks like for your setup?'}

→ https://calendly.com/thesaassin/build-your-system

— TheSaaSsin`
    },
    {
      label: '3 — System Preview',
      body:
`[First Name].

I've built a system preview specifically for a ${niche} business${at}. Takes me about 20 minutes to put together — I did one for yours.

It includes:
· A landing page written around your actual offer
· A 5-step outreach sequence
· A CRM pipeline with lead scoring
· Automated follow-up that contacts every lead within 5 minutes

I can walk you through the whole thing in 30 minutes. No prep needed from you.

${tone === 'friendly' ? 'If you like it, we can talk next steps. If not, you keep the preview.' : tone === 'aggressive' ? 'This is what\'s currently missing from your pipeline. Let me show you.' : 'If it\'s useful, great. If not, you leave with something concrete either way.'}

→ https://calendly.com/thesaassin/build-your-system

— TheSaaSsin`
    },
    {
      label: '4 — Follow-Up',
      body:
`[First Name] — haven't heard back, which is fine.

One thing I've noticed with ${niche} businesses${at}: ${pain1.toLowerCase()} — and most people either don't know it's fixable, or they've tried something before that didn't work.

${tone === 'aggressive' ? 'I\'m not here to waste your time — but if this is a real problem, let\'s solve it. 30 minutes is all it takes.' : 'I\'m not going to pitch you. But if you want a second opinion on your current setup, I\'ll give you one for free.'}

${followup_close}

— TheSaaSsin`
    },
    {
      label: '5 — Final Nudge',
      body:
`[First Name] — last message from me.

One question: is getting consistent clients for ${name} a priority right now, or is the focus elsewhere?

If it is — I can help, and I can show you exactly how in 30 minutes.

If it's not the right time — no problem at all. I'll leave you to it.

${tone === 'friendly' ? 'Either way, best of luck with it.' : 'Either way:'} https://calendly.com/thesaassin/build-your-system

— TheSaaSsin`
    }
  ];
}

/* ── PACKAGE SUMMARY ── */
function buildPackageSummary({ name, profile, style }) {
  const s = style.systems || {};
  const tone = style.tone || 'professional';
  const outcome = profile.outcomes[0];
  const toneLabel = { aggressive: '⚡ Aggressive', professional: '◼ Professional', friendly: '● Friendly' }[tone] || 'Professional';

  const components = [
    { id: 'landing',  label: 'Landing Page',        on: s.landing  !== false, icon: 'fa-file-code'      },
    { id: 'crm',      label: 'CRM Pipeline',         on: s.crm      !== false, icon: 'fa-chart-line'     },
    { id: 'outreach', label: 'Outreach Sequence',    on: s.outreach !== false, icon: 'fa-paper-plane'    },
    { id: 'followup', label: 'Follow-up System',     on: s.followup !== false, icon: 'fa-clock-rotate-left' },
    { id: 'booking',  label: 'Booking System',       on: !!s.booking,          icon: 'fa-calendar-check' }
  ];

  const countOn = components.filter(c => c.on).length;
  const expectedResult = countOn >= 4
    ? '5–15 qualified leads/week within 14 days'
    : countOn >= 3
    ? '3–8 qualified leads/week within 21 days'
    : 'Improved online conversion within 14 days';

  return { name, components, outcome, expectedResult, tone, toneLabel, countOn };
}

function showPackageSummary({ name, components, outcome, expectedResult, tone, toneLabel, countOn }) {
  const bar = document.getElementById('pkg-bar');
  if (!bar) return;

  const compHTML = components.map(c => `
    <div class="pkg-item${c.on ? '' : ' off'}">
      <i class="fas ${c.icon}"></i> ${c.label}
    </div>`).join('');

  const wasCollapsed = bar.classList.contains('pkg-collapsed');
  bar.innerHTML = `
    <div class="pkg-header" onclick="togglePkgBar()">
      <span class="pkg-label">System Package</span>
      <span class="pkg-toggle-hint" id="pkg-toggle-hint">${wasCollapsed ? '▶ Show' : '▼ Hide'}</span>
    </div>
    <div class="pkg-body" id="pkg-body">
      <div class="pkg-name"><i class="fas fa-bolt"></i> ${esc(name)} — ${countOn} component${countOn !== 1 ? 's' : ''}</div>
      <div class="pkg-grid">${compHTML}</div>
      <div class="pkg-result">
        Expected: <strong>${expectedResult}</strong>
        <div class="pkg-meta">Tone: ${toneLabel} &nbsp;·&nbsp; Outcome: ${esc(outcome)}</div>
      </div>
    </div>`;
  bar.classList.add('visible');
  if (wasCollapsed) bar.classList.add('pkg-collapsed');
}

function togglePkgBar() {
  const bar  = document.getElementById('pkg-bar');
  const body = document.getElementById('pkg-body');
  const hint = document.getElementById('pkg-toggle-hint');
  if (!bar) return;
  const collapsed = bar.classList.toggle('pkg-collapsed');
  if (hint) hint.textContent = collapsed ? '▶ Show' : '▼ Hide';
}

/* ── CRM STRUCTURE GENERATOR ── */
function buildCRMStructure({ name, niche, offer, goal, profile }) {
  return {
    client: name,
    niche,
    pipeline: [
      { stage: 'New',       score: 10, action: 'Send opener message',            auto: true  },
      { stage: 'Contacted', score: 25, action: 'Follow up in 48hrs if no reply', auto: true  },
      { stage: 'Replied',   score: 45, action: 'Book strategy call',             auto: false },
      { stage: 'Called',    score: 65, action: 'Send proposal / system preview', auto: false },
      { stage: 'Qualified', score: 80, action: 'Send invoice + onboarding form', auto: false },
      { stage: 'Booked',    score: 90, action: 'Confirm start date + kickoff',   auto: false },
      { stage: 'Closed',    score: 100, action: 'Deliver system + gather proof', auto: false }
    ],
    scoringRules: [
      { trigger: 'Replied to first message',    points: +15 },
      { trigger: 'Opened link in message',      points: +10 },
      { trigger: 'Booked a call',               points: +25 },
      { trigger: 'No reply after 7 days',       points: -10 },
      { trigger: 'Unsubscribed',                points: -50 }
    ],
    tags: [niche, goal, profile.type, 'thesaassin-generated']
  };
}

/* ── OFFER DEFINITION GENERATOR ── */
function buildOfferDefinition({ name, niche, offer, goal, loc, profile }) {
  return {
    client:      name,
    service:     offer,
    audience:    profile.audience,
    coreOffer:   `${offer} for ${profile.audience}${loc ? ' in ' + loc : ''}`,
    outcome:     profile.outcomes[0],
    mechanism:   'Full done-for-you system: landing page + CRM + automation + outreach',
    timeframe:   '14 days to live',
    guarantee:   'If it\'s not live in 14 days, you don\'t pay',
    price:       goal === 'bookings' ? '£597/mo (Growth) or £247 one-off (Starter)' : '£97–£1,197 depending on scope',
    positioning: `"I don't build websites. I build systems that fill your calendar."`,
    pitch:       `${name} is a ${niche} business struggling with ${profile.painPoints[0].toLowerCase()}. We solve that in 14 days with a full system. Priced from £97.`
  };
}

/* ══════════════════════════════════
   CRM / LEADS
══════════════════════════════════ */
async function loadLeads() {
  try {
    const res  = await fetch(API + '/leads');
    const data = await res.json();
    renderLeads(data.leads || []);
  } catch { renderLeads([]); }
}

function renderLeads(leads) {
  const tbody = document.getElementById('leads-tbody');
  document.getElementById('stat-total').textContent     = leads.length;
  document.getElementById('stat-new').textContent       = leads.filter(l => l.status === 'new').length;
  document.getElementById('stat-contacted').textContent = leads.filter(l => l.status === 'contacted').length;
  document.getElementById('stat-closed').textContent    = leads.filter(l => l.status === 'closed').length;

  if (!leads.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted);font-size:.8rem">No leads yet — add your first one</td></tr>';
    return;
  }
  tbody.innerHTML = leads.map(l => {
    const score = Math.min(100, Math.max(0, l.score || 0));
    const statusBadge = {
      new:       '<span class="badge badge-new">new</span>',
      contacted: '<span class="badge badge-pending">contacted</span>',
      qualified: '<span class="badge badge-active">qualified</span>',
      closed:    '<span class="badge badge-active">closed</span>'
    }[l.status] || '<span class="badge">—</span>';
    const date = l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-GB') : '—';
    return `<tr>
      <td>${esc(l.name || '—')}</td>
      <td>${esc(l.business || '—')}</td>
      <td>${statusBadge}</td>
      <td>
        ${score}
        <div class="score-bar"><div class="score-fill" style="width:${score}%"></div></div>
      </td>
      <td>${date}</td>
      <td>
        <select class="field select" style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:4px;padding:4px 8px;color:var(--text);font-size:.75rem;cursor:pointer"
                onchange="updateLeadStatus(${l.id}, this.value)">
          <option value="new"       ${l.status==='new'       ?'selected':''}>New</option>
          <option value="contacted" ${l.status==='contacted' ?'selected':''}>Contacted</option>
          <option value="qualified" ${l.status==='qualified' ?'selected':''}>Qualified</option>
          <option value="closed"    ${l.status==='closed'    ?'selected':''}>Closed</option>
        </select>
      </td>
    </tr>`;
  }).join('');
}

async function updateLeadStatus(id, status) {
  try {
    await fetch(API + '/leads', { method: 'PATCH', body: JSON.stringify({ id, status }) });
    toast('Lead updated', 'ok');
    loadLeads();
  } catch { toast('Update failed', 'err'); }
}

/* ADD LEAD MODAL */
document.getElementById('btn-add-lead').addEventListener('click', () => {
  document.getElementById('modal-lead').style.display = 'flex';
});
document.getElementById('btn-cancel-lead').addEventListener('click', () => {
  document.getElementById('modal-lead').style.display = 'none';
});
document.getElementById('btn-save-lead').addEventListener('click', async () => {
  const name = document.getElementById('lead-name').value.trim();
  if (!name) { toast('Name is required', 'err'); return; }
  const payload = {
    name,
    business: document.getElementById('lead-biz').value.trim(),
    status:   document.getElementById('lead-status').value,
    score:    parseInt(document.getElementById('lead-score').value) || 50
  };
  try {
    await fetch(API + '/leads', { method: 'POST', body: JSON.stringify(payload) });
    document.getElementById('modal-lead').style.display = 'none';
    ['lead-name','lead-biz'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('lead-score').value = 50;
    toast('Lead added', 'ok');
    loadLeads();
  } catch { toast('Could not add lead', 'err'); }
});

/* EXPORT CSV */
document.getElementById('btn-export-csv').addEventListener('click', async () => {
  try {
    const res   = await fetch(API + '/leads');
    const data  = await res.json();
    const leads = data.leads || [];
    if (!leads.length) { toast('No leads to export', 'err'); return; }
    const rows  = [['Name','Business','Status','Score','Added']];
    leads.forEach(l => rows.push([
      l.name || '', l.business || '', l.status || '', l.score || 0,
      l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-GB') : ''
    ]));
    const csv  = rows.map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'thesaassin-leads.csv';
    a.click();
    toast('CSV exported', 'ok');
  } catch { toast('Export failed', 'err'); }
});

/* ══════════════════════════════════
   OUTREACH QUEUE
══════════════════════════════════ */
let currentOutreachTab = 'pending';

document.querySelectorAll('.out-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.out-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentOutreachTab = tab.dataset.status;
    loadOutreach();
  });
});

async function loadOutreach() {
  try {
    const res  = await fetch(API + '/outreach');
    const data = await res.json();
    renderOutreach(data.queue || []);
  } catch { renderOutreach([]); }
}

function renderOutreach(queue) {
  const list = document.getElementById('out-list');
  const counts = { pending: 0, approved: 0, sent: 0 };
  queue.forEach(q => { if (counts[q.status] !== undefined) counts[q.status]++; });
  document.getElementById('count-pending').textContent  = counts.pending;
  document.getElementById('count-approved').textContent = counts.approved;
  document.getElementById('count-sent').textContent     = counts.sent;

  const filtered = queue.filter(q => q.status === currentOutreachTab);
  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Nothing here yet</p></div>';
    return;
  }
  list.innerHTML = filtered.map(q => `
    <div class="out-card">
      <div class="out-card-head">
        <div class="client-avatar" style="font-size:.72rem">${(q.clientName||'?').charAt(0).toUpperCase()}</div>
        <div class="out-card-name">${esc(q.clientName || 'Unknown')}</div>
        <span class="badge ${q.status==='pending'?'badge-new':q.status==='approved'?'badge-active':'badge-pending'}">${q.status}</span>
      </div>
      <div class="out-card-body">${esc(q.message || '')}</div>
      <div class="out-actions">
        ${q.status === 'pending'  ? `<button class="btn btn-success btn-sm" onclick="updateOutreach(${q.id},'approved')"><i class="fas fa-check"></i> Approve</button>` : ''}
        ${q.status === 'approved' ? `<button class="btn btn-primary btn-sm" onclick="updateOutreach(${q.id},'sent')"><i class="fas fa-paper-plane"></i> Mark Sent</button>` : ''}
        ${q.status === 'pending'  ? `<button class="btn btn-danger btn-sm"  onclick="updateOutreach(${q.id},'sent')"><i class="fas fa-times"></i> Dismiss</button>` : ''}
      </div>
    </div>`).join('');
}

async function updateOutreach(id, status) {
  try {
    await fetch(API + '/outreach', { method: 'PATCH', body: JSON.stringify({ id, status }) });
    toast('Outreach updated', 'ok');
    loadOutreach();
  } catch { toast('Update failed', 'err'); }
}

/* ── HELPERS ── */
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════════
   LEAD FEED
══════════════════════════════════ */

/* ── LEAD QUALITY FILTERS ── */

// Tier 1 — Desperation: existential business pain, highest urgency
const DESPERATION_SIGNALS = [
  'about to give up','considering quitting','about to quit','about to close',
  'going under','on the verge of closing','thinking of shutting down','closing down',
  'running out of money','running out of savings','burning through savings',
  'dipping into savings','can\'t pay myself','can\'t pay my bills','can\'t pay rent',
  'had to take a loan','going into debt','maxed out','last resort',
  'last few clients','down to my last','only have one client left',
  'lost everything','nothing left to try','reached my limit',
  'seriously considering','genuinely considering','not sure i can continue',
  'this is make or break','make or break month','i give up','ready to quit',
  'kill my business','end my business','pivot out of','stepping away',
  'months of nothing','six months of nothing','been struggling for months',
  'year of nothing','a year in and nothing','almost a year with no',
  'spent thousands and nothing','spent hundreds and nothing',
  'thousands in ads with zero','spent x on ads with nothing',
  'burned through budget','wasted my budget','wasted my savings',
  'negative roi','no roi','money pit','hemorrhaging money'
];

// Tier 2 — Real intent: explicit, direct pain language
const REAL_INTENT = [
  // Zero clients
  'no clients','zero clients','no customers','no work','no jobs',
  'no enquiries','no leads','no sales','no bookings','zero leads',
  'no response','no replies','nobody is contacting','nobody enquiring',
  'no one is buying','not getting any clients','not getting any leads',
  'not getting any bookings','not getting any enquiries','zero bookings',
  'zero sales','zero customers','0 clients','0 leads','0 sales',
  // Tried and failed
  'tried everything','nothing is working','nothing working','nothing converting',
  'still not getting','tried multiple things','tried different things',
  'ads not working','ads aren\'t working','ads not converting',
  'ads not bringing','wasting money on ads','pouring money into ads',
  'cold outreach not working','cold outreach no response','cold email not working',
  'cold dms not working','nobody replies','nobody responding',
  'website not converting','website not getting leads','traffic but no leads',
  'traffic but no sales','visitors but no enquiries','clicks but no conversions',
  'social media not working','posting every day no clients','posting daily no leads',
  'posting but nothing','content not converting','content getting no leads',
  'got traffic but','tons of views but','good engagement but no',
  // Specific channel failures
  'google ads not working','facebook ads not working','instagram ads not working',
  'linkedin not working','cold calling not working','networking not working',
  'seo not working','not ranking','can\'t rank','website not ranking',
  // Feast or famine / slow
  'dead month','slow month','quiet month','dead period','quiet period',
  'feast or famine','famine phase','dried up','referrals dried up',
  'referral ran out','no more referrals','word of mouth dried up',
  'business is slow','business has slowed','things are slow','extremely slow',
  'really slow','so slow','painfully slow','almost nothing coming in',
  'barely any work','barely any clients','a trickle','hardly any',
  // Seeking help / lost
  'how do i get clients','how can i get clients','where do i find clients',
  'how to find clients','how to get my first client','struggling to get clients',
  'can\'t get clients','cant get clients','can\'t find clients',
  'what am i doing wrong','not sure what i\'m doing wrong','any advice on getting',
  'any tips for getting clients','how to actually get clients',
  'what actually works','what works for getting','what worked for you',
  // Proposals / pipeline failures
  'proposals not converting','quotes not converting','proposals ignored',
  'getting ghosted','prospects ghosting','clients ghosting','being ghosted',
  'no one responds after quote','send proposals and hear nothing',
  'follow up and nothing','follow ups ignored',
  // Losing / at risk
  'losing clients','lost clients','losing customers','clients leaving',
  'clients churning','losing accounts','client cancelled','client left',
  'big client left','lost a major client'
];

// Tier 3 — Soft intent: less explicit but relevant when paired with buyer context
const SOFT_INTENT = [
  'how do i','how can i','any advice','struggling with','not getting',
  'need help with','what should i do','why am i not','anyone else struggle',
  'anyone else find','how to get','help me understand','where do i',
  'getting nowhere','slow month','quiet period','any tips',
  'looking for clients','looking for customers','looking for leads',
  'find clients','get customers','grow my client base','build my client base',
  'generate leads','attract clients','market my business','promote my business',
  'get more clients','get more customers','get more leads','scale my business',
  'struggling to scale','struggling to grow','hard to grow','hard to scale',
  'need more work','need more projects','need more revenue',
  'not making enough','not profitable enough','not earning enough'
];

// Buyer context — confirms they\'re a business operator
const BUYER_SIGNALS = [
  'clients','customers','leads','bookings','sales','revenue','enquiries',
  'appointments','contracts','jobs','business','freelance','my business',
  'my clients','my customers','my agency','my studio','my practice',
  'my firm','my company','my shop','my service','my offer'
];

const BUSINESS_SIGNALS = [
  'business','freelance','self-employed','self employed','service','offer',
  'charge','rate','pricing','invoice','contract','client','customer',
  'revenue','income','money','pay','work','project','agency','studio',
  'practice','firm','company','shop','trade','sole trader','limited company'
];

// Financial pressure — amplifies urgency when detected alongside pain
const FINANCIAL_PRESSURE = [
  'can\'t pay','can\'t afford','struggling financially','financial pressure',
  'burning money','burning savings','burning cash','negative cash flow',
  'broke','going broke','almost broke','nearly broke','in the red',
  'in debt','more debt','mounting debt','overdraft','maxed credit',
  'emergency fund gone','savings gone','no savings left','down to nothing',
  'barely breaking even','not breaking even','losing money each month',
  'spending more than earning','costs exceeding income','not profitable',
  'in the hole','operating at a loss','can\'t sustain','unsustainable'
];

// Time pressure — shows urgency window is closing
const TIME_PRESSURE = [
  'this month','end of month','by end of','before the end',
  'need it now','need this asap','asap','right now','immediately',
  'this week','by friday','by monday','within the week',
  'last month was terrible','last month was dead','past few months',
  'for months now','months of this','three months','six months','a year of this',
  'running out of time','time is running out','time sensitive',
  'urgent','urgently','desperate','desperately'
];

// Hard excludes — disqualify immediately
const HARD_EXCLUDE = [
  // Job hunting / employment
  'looking for a job','job posting','job offer','hiring manager','apply for',
  'resume','cv','career advice','employee looking','salary negotiation','interview tips',
  // Mental health (therapy client context)
  'therapist','therapy session','mental health client','counselling client',
  'my therapist','seeing a therapist',
  // Success posts — already solved it
  'i got a client','landed a client','just closed','i closed a deal',
  'signed a client','won a client','got my first client','finally got clients',
  'i made it','hit my goal','reached my target','celebrating',
  'sharing my journey','how i went from','here\'s what worked for me',
  'case study','i scaled to','6 figures','7 figures','i earn','i make $',
  'grew to','built to','reached',
  // Unrelated business models
  'passive income course','dropship','amazon fba','print on demand',
  'crypto','nft','affiliate marketing','adsense','youtube channel',
  // Offering services (they\'re a seller not a buyer)
  'dm me if','comment below','link in bio','i can help you with',
  'check out my','visit my website','free consultation for',
  'i offer','my services include','services starting at','prices start at'
];

function hasBusinessContext(t) {
  return BUSINESS_SIGNALS.some(k => t.includes(k));
}

function scorePost(title, text, isComment = false) {
  const raw = (title + ' ' + text).toLowerCase();

  // Hard excludes — reject immediately
  if (HARD_EXCLUDE.some(k => raw.includes(k))) return 0;

  // Must have business context (comments already adjacent)
  if (!isComment && !hasBusinessContext(raw)) return 0;

  let score = 0;
  const hasBuyer    = BUYER_SIGNALS.some(k => raw.includes(k));
  const hasDesper   = DESPERATION_SIGNALS.some(k => raw.includes(k));
  const hasFinancial = FINANCIAL_PRESSURE.some(k => raw.includes(k));
  const hasTimePressure = TIME_PRESSURE.some(k => raw.includes(k));

  // ── Tier 1: Desperation — near-certain high-priority lead
  if (hasDesper) {
    score += 75;
  }
  // ── Tier 2: Real explicit pain
  else if (REAL_INTENT.some(k => raw.includes(k))) {
    score += 50;
  }
  // ── Tier 3: Soft intent (only with buyer signal)
  else if (SOFT_INTENT.some(k => raw.includes(k)) && hasBuyer) {
    score += 25;
  }
  // No detectable pain/intent → not a lead
  else {
    return 0;
  }

  // Amplifiers — stack on top of base
  if (hasBuyer)       score += 10;  // confirmed business context
  if (hasFinancial)   score += 12;  // financial pressure = urgency
  if (hasTimePressure) score += 10; // time pressure = urgency

  // Active question in title (genuine ask, not a rant)
  if (title.includes('?')) score += 8;
  else if (raw.includes('?')) score += 5;

  // Multiple pain signals stacking (they wrote a lot of pain)
  const painCount = [
    REAL_INTENT.some(k => raw.includes(k)),
    DESPERATION_SIGNALS.some(k => raw.includes(k)),
    hasFinancial,
    hasTimePressure,
    /spent|wasted|burned/.test(raw) && /\$|£|€|\d+k|\d+ (hundred|thousand)/.test(raw)
  ].filter(Boolean).length;
  if (painCount >= 3) score += 10; // multi-dimensional pain = very hot lead
  if (painCount >= 4) score += 5;  // extreme stacking bonus

  // Post length signal — longer = more genuine, not a throwaway post
  if (raw.length > 400) score += 5;
  if (raw.length > 800) score += 5;

  return Math.max(0, Math.min(score, 100));
}

/* ── ANALYSIS ENGINE ── */
function analyzePost(title, text, preScore) {
  const t = (title + ' ' + text).toLowerCase();
  const urgency = preScore !== undefined ? preScore : scorePost(title, text);

  // ── Desperation tier check (drives opener + tip tone)
  const isDesparate = DESPERATION_SIGNALS.some(k => t.includes(k)) || urgency >= 85;
  const hasFinancialPain = FINANCIAL_PRESSURE.some(k => t.includes(k));
  const hasTimePain = TIME_PRESSURE.some(k => t.includes(k));

  // ── Niche detection — expanded patterns
  const niche = /plumb|pipe|boiler|heating|gas safe/.test(t)            ? 'Plumber'
    : /electrician|wiring|fuse|eicr|niceic|sparky/.test(t)             ? 'Electrician'
    : /builder|construction|renovation|extension|loft|joiner|carpenter/.test(t) ? 'Builder'
    : /pt |personal train|fitness coach|gym|fat loss|body|personal trainer/.test(t) ? 'PT / Fitness'
    : /dentist|dental|teeth|orthodont/.test(t)                          ? 'Dentist'
    : /solicitor|lawyer|legal|conveyancing|barrister/.test(t)           ? 'Solicitor'
    : /accountant|bookkeep|tax|vat|bookkeeper/.test(t)                  ? 'Accountant'
    : /cleaner|cleaning|domestic clean|commercial clean|janitorial/.test(t) ? 'Cleaning Business'
    : /landscap|garden|lawn|groundswork|tree surgeon/.test(t)           ? 'Landscaper'
    : /roofer|roofing|guttering/.test(t)                                ? 'Roofer'
    : /painter|decorator|plastering|plastered/.test(t)                  ? 'Painter / Decorator'
    : /hvac|air conditioning|boiler install|heating engineer/.test(t)   ? 'HVAC'
    : /mortgage|financial advis|financial plan|ifa |wealth/.test(t)     ? 'Financial Advisor'
    : /physio|chiropract|osteopath|massage therap/.test(t)              ? 'Therapist / Health'
    : /restaurant|cafe|food business|catering|hospitality/.test(t)      ? 'Restaurant / Hospitality'
    : /consultant|freelanc|strateg|advisor|coach|mentor/.test(t)        ? 'Consultant'
    : /marketing|agency|seo|ads|social media|lead gen/.test(t)          ? 'Marketing Agency'
    : /saas|software|app |platform|startup|founder|tech/.test(t)        ? 'SaaS / Tech'
    : /ecomm|shopify|store|product|dropship|amazon seller/.test(t)      ? 'eCommerce'
    : /photographer|videographer|photo|video|shoot|wedding photo/.test(t) ? 'Photographer'
    : /designer|graphic|brand|logo|web design|ux|ui design/.test(t)    ? 'Designer'
    : /copywriter|content writer|content creator|blogger/.test(t)       ? 'Copywriter'
    : /virtual assistant|va |admin support|online assistant/.test(t)    ? 'Virtual Assistant'
    : /estate agent|realtor|real estate|property|landlord/.test(t)      ? 'Estate Agent'
    : 'Business Owner';

  // ── Problem type detection — specific language, not generic labels
  const problem = /ads|paid|ppc|facebook ad|google ad|instagram ad|meta ad/.test(t)
    ? /spend|wast|burn|£|€|\$|money|budget/.test(t)
      ? 'Spending money on ads but not getting clients from it'
      : 'Running ads but not seeing any results'
    : /cold (email|outreach|dm|message)|no (reply|response|replies)/.test(t)
    ? 'Reaching out to people but getting zero replies'
    : /website|landing page|traffic but no|visitors but/.test(t)
    ? 'Getting visitors to the site but none of them convert'
    : /social media|post(ing)?|content|instagram|tiktok|reels|shorts/.test(t)
    ? 'Posting content every day but it\'s not bringing in clients'
    : /referral|word of mouth|dried up/.test(t)
    ? 'Referrals have dried up — no consistent way to get new work'
    : /proposal|quote|follow.?up|ghost/.test(t)
    ? 'Sending quotes and proposals but prospects go cold or ghost'
    : /network(ing)?|event|chamber|bni/.test(t)
    ? 'Networking but not converting contacts into actual clients'
    : /seo|rank|google rank|search result/.test(t)
    ? 'Investing in SEO but not seeing enquiries come from it'
    : /no (clients|customers|work|bookings|enquiries|leads|sales)/.test(t)
    ? 'No consistent flow of new clients or enquiries'
    : /slow|quiet|dead|dry/.test(t)
    ? 'Things have gone quiet — not enough work coming in'
    : /feast|famine|inconsistent/.test(t)
    ? 'Boom and bust — great months followed by nothing'
    : /tried|wasted|nothing work/.test(t)
    ? 'Tried different things but nothing\'s actually working'
    : hasFinancialPain
    ? 'Financial pressure building — the current approach isn\'t bringing in enough'
    : 'Struggling to get a consistent flow of new clients';

  // ── Root cause
  const cause = /ads|paid|ppc/.test(t)
    ? 'Traffic without a conversion system — clicks disappear with nothing captured'
    : /cold|outreach|dm/.test(t)
    ? 'Generic messages with no personalisation or follow-up — easy to ignore'
    : /website|landing|traffic/.test(t)
    ? 'No clear offer, no trust signals, no way to capture interest'
    : /social|content|post/.test(t)
    ? 'Content builds an audience, not a pipeline — the bridge between them is missing'
    : /referral/.test(t)
    ? 'One channel means one point of failure — nothing to fall back on'
    : /proposal|quote|ghost/.test(t)
    ? 'No follow-up sequence — the decision window closes and they move on'
    : /network/.test(t)
    ? 'Networking generates awareness but there\'s no system to turn it into booked work'
    : hasFinancialPain
    ? 'The spend is outpacing the revenue — no acquisition system means costs compound'
    : 'No system — relying on luck, timing, and word of mouth';

  // ── Pitch angle — direct, no wrapper quotes
  const angle = isDesparate
    ? `This is exactly the situation that a proper acquisition system fixes — and fast. The good news is the work is already there, it just isn't being captured.`
    : /ads|paid/.test(t)
    ? /spend|wast|burn|money/.test(t)
      ? 'Spending money on ads without a system to convert them is just burning cash'
      : 'You don\'t need more ad spend — you need a system that converts what you already have'
    : /cold|outreach/.test(t)
    ? 'Cold messaging doesn\'t convert anymore — here\'s what does'
    : /website|landing/.test(t)
    ? 'Getting traffic but losing every visitor — here\'s why and how to fix it'
    : /social|content/.test(t)
    ? 'Posting every day without a capture system is just content with no pipeline'
    : /referral/.test(t)
    ? 'Referrals drying up means you need a system that doesn\'t rely on luck'
    : /no client|no work|no lead|no book/.test(t)
    ? 'No clients usually means one thing — no system to attract and convert them'
    : /slow|quiet|dry/.test(t)
    ? 'A quiet month isn\'t bad luck — it\'s a gap in the system'
    : 'The issue isn\'t your service — it\'s that the right people can\'t find and trust you yet';

  // ── Demo focus — what to actually show them
  const demoFocus = /ads|paid/.test(t)
    ? 'lead capture page + follow-up sequence to stop losing clicks'
    : /cold|outreach/.test(t)
    ? 'landing page they can review before replying — personalised to their sector'
    : /website|landing/.test(t)
    ? 'rebuilt landing page with offer clarity and a real CTA'
    : /social|content/.test(t)
    ? 'lead magnet page + CRM to turn followers into actual enquiries'
    : /referral/.test(t)
    ? 'full inbound pipeline — page, outreach, and follow-up'
    : isDesparate
    ? 'full acquisition system — fast-track setup to get leads coming in immediately'
    : 'client acquisition system — page, CRM, and outreach';

  // ── Opener — tiered by desperation/urgency level
  const opener = isDesparate
    ? `Read your post — I work specifically with ${niche.toLowerCase()} owners in this exact situation. I've fixed this before and I can show you what needs to change. No pitch, just a straight look at what's missing. Want me to break it down?`
    : urgency >= 70
    ? `Saw your post — I build acquisition systems for ${niche.toLowerCase()} businesses and this is exactly what I fix. I can put together a preview for your setup today. Worth a look?`
    : `Saw this and recognised it — the problem usually isn't the service, it's the system behind it. I map this out for free. Want to see what that would look like for you?`;

  // ── Urgency reason — why this score (shown in tip)
  const urgencyReason = isDesparate   ? 'Desperation signal detected'
    : hasFinancialPain                ? 'Financial pressure language detected'
    : hasTimePain                     ? 'Time-pressure language detected'
    : urgency >= 60                   ? 'Strong direct pain signal'
    : urgency >= 40                   ? 'Clear business pain + buyer context'
    :                                   'Soft intent — qualify before pitching';

  // ── Tip — action-oriented, tiered
  const tip = isDesparate
    ? `🔥 Desperation signal — message NOW, this closes fast. Lead with empathy: "I've fixed this exact situation before"`
    : urgency >= 70
    ? `⚡ High intent — message within the hour. ${hasTimePain ? 'Time pressure detected — they need this urgently.' : 'Window closes fast on hot posts.'}`
    : urgency >= 40
    ? `💬 Empathy first — acknowledge the pain before any pitch. ${hasFinancialPain ? 'Financial pressure detected — speed and ROI matter.' : ''}`
    : `🔍 Qualify first — ask one specific question before investing time`;

  const urgencyLabel = urgency >= 85 ? 'Critical' : urgency >= 70 ? 'High' : urgency >= 40 ? 'Medium' : 'Low';
  const urgencyColor = urgency >= 85 ? '#ef4444' : urgency >= 70 ? '#22c55e' : urgency >= 40 ? '#f59e0b' : '#8888a0';

  // ── Lead Type — Direct / Operator / Partner ──
  const leadType = detectLeadType(title, text, '', urgency);

  return { urgency, urgencyLabel, urgencyColor, niche, problem, cause, angle, demoFocus, opener, tip, urgencyReason, isDesparate, leadType };
}

/* ══════════════════════════════════
   LEAD TYPE DETECTION
   Direct Client | Operator/Agency | Strategic Partner
══════════════════════════════════ */
const LEAD_TYPES = {
  direct: {
    key:     'direct',
    label:   'Direct Client',
    badge:   '💰',
    color:   '#22c55e',
    bg:      'rgba(34,197,94,.12)',
    tagline: 'Money Now',
    pitch:   'Landing page · CRM · Outreach · Follow-up'
  },
  operator: {
    key:     'operator',
    label:   'Operator / Agency',
    badge:   '⚡',
    color:   '#f59e0b',
    bg:      'rgba(245,158,11,.12)',
    tagline: 'Money ×10',
    pitch:   'White-label backend — you bring clients, I build the system'
  },
  partner: {
    key:     'partner',
    label:   'Strategic Partner',
    badge:   '🚀',
    color:   '#a855f7',
    bg:      'rgba(168,85,247,.12)',
    tagline: 'Big Play',
    pitch:   'Integration · White-label · Scale layer'
  }
};

function detectLeadType(title, text, subreddit, urgency) {
  const full = (title + ' ' + text).toLowerCase();
  const sub  = (subreddit || '').toLowerCase();

  // ── Partner signals ──
  const partnerWords = [
    'saas','software platform','marketplace','app for businesses','white.?label',
    'integration','reseller','franchise','enterprise','b2b platform',
    'niche community','membership platform','plugin','api partner',
    'distribution channel','revenue share','affiliate program',
    'thousands of users','scale fast','series a','raised funding'
  ];
  const partnerSubs = ['startups','indiehackers','saas','producthunt'];
  let pScore = partnerWords.filter(w => new RegExp(w).test(full)).length * 3
             + (partnerSubs.includes(sub) ? 4 : 0);

  // ── Operator/Agency signals ──
  const operatorWords = [
    'web design','web designer','website designer','digital agency',
    'marketing agency','seo agency','social media agency','ppc agency',
    'branding agency','creative agency','freelance designer',
    'i build websites','i design','i help businesses','i manage',
    'my clients need','client work','client projects','outsource',
    'subcontract','white label','resell services','retainer clients',
    'i offer','my services include','i specialize in','i work with clients',
    'my portfolio','i charge','per project','monthly retainer',
    'graphic designer','copywriter for hire','content creator for business',
    'email marketer','paid ads freelancer','seo consultant'
  ];
  const operatorSubs = [
    'web_design','graphic_design','agency','digital_marketing','webdev',
    'copywriting','socialmediamarketing','seo','ppc','workonline','hiring'
  ];
  let oScore = operatorWords.filter(w => new RegExp(w).test(full)).length * 2
             + (operatorSubs.includes(sub) ? 4 : 0);

  // LinkedIn posts skew heavily operator/partner
  if (sub === '' && /linkedin/.test(full)) oScore += 3;

  // ── Decide ──
  if (pScore >= 5) return LEAD_TYPES.partner;
  if (oScore >= 4) return LEAD_TYPES.operator;
  if (oScore >= 2 && oScore > pScore) return LEAD_TYPES.operator;
  return LEAD_TYPES.direct;
}

/* ── KEYWORD POOL ── */
const KW_POOL = [
  // ── Universal desperation / existential pain ──
  'about to give up','considering quitting','thinking of shutting down',
  'running out of money','burning through savings','cant pay myself',
  'desperate for clients','need clients urgently','business failing',
  'make or break month','last few clients','only have one client left',
  'spent thousands and nothing','spent hundreds and nothing',
  'wasted my budget on ads','negative roi','burning cash',
  'going under','seriously considering closing','not sure i can continue',

  // ── Universal no-client pain ──
  'no clients','zero clients','no customers','no enquiries','no leads',
  'no sales','no bookings','no work','no jobs','no revenue',
  'zero leads','zero sales','zero bookings','0 clients','0 leads',

  // ── Business slow ──
  'dead month','slow month','quiet month','feast or famine',
  'referrals dried up','business is slow','clients dried up','dry spell',
  'no work coming in','losing clients','clients ghosting',
  'been slow for months','extremely slow','painfully slow','barely any work',
  'nothing coming in','a trickle of work','almost no enquiries',

  // ── Tried and failed ──
  'tried everything','nothing is working','nothing working','tried multiple things',
  'tried different approaches','spent months trying','been at this for months',
  'a year in and nothing','six months of nothing','three months no clients',
  'what am i doing wrong','not sure what im doing wrong',
  'any advice on getting clients','what actually works for getting clients',

  // ── Marketing / ads not working ──
  'ads not working','ads not converting','facebook ads not working',
  'google ads wasting money','instagram ads no results','meta ads failing',
  'cold outreach no response','cold email not working','no replies to outreach',
  'cold dms not working','nobody replies to my messages',
  'website not converting','getting traffic no leads','visitors but no enquiries',
  'traffic but no conversions','clicks but no sales',
  'social media not working','posting every day no clients',
  'content not converting','marketing not working','posting daily nothing',
  'great engagement no clients','going viral not converting',
  'proposals not converting','getting ghosted after quotes','quotes ignored',
  'sending proposals hearing nothing','follow ups going nowhere',

  // ── Specific questions Reddit users ask ──
  'how do i get clients','how to get clients','best way to find clients',
  'where do i find clients','where to find clients',
  'how to get my first client','struggling to get first client',
  'what outreach actually works','outreach strategy that works',
  'how to get consistent leads','getting consistent clients',
  'how do i grow my business','how to scale my service business',
  'how to make my first sale','how to land my first client',
  'how to stop feast and famine','how to get steady work',
  'how to build a client base','how to fill my calendar',

  // ── Photography & videography ──
  'need more photography clients','photography business slow',
  'wedding photography clients','struggling photographer',
  'photography marketing','get more wedding bookings',
  'videographer clients','video business slow','no photo bookings',
  'photographer no work','slow season photography',

  // ── Trades & home services ──
  'plumber marketing','electrician getting clients','hvac marketing',
  'landscaping clients','cleaning business clients','tradesman no work',
  'builder slow','no plumbing jobs','how to get more jobs trades',
  'painter decorator clients','how to get landscaping clients',
  'roofer getting clients','joiner no work','carpenter clients',
  'no building jobs','how to get more jobs as a tradesman',

  // ── Fitness & health ──
  'personal trainer clients','gym clients','fitness coach marketing',
  'no personal training clients','online fitness coaching',
  'health coach clients','nutritionist clients','no pt clients',
  'struggling personal trainer','fitness business slow',

  // ── Marketing agencies & freelance ──
  'freelance clients','agency clients','web design clients',
  'graphic design clients','no design work','copywriting clients',
  'social media agency clients','seo clients','ppc clients',
  'marketing agency struggling','web developer clients','freelancer slow',
  'no freelance work','agency not growing','struggling agency',
  'digital agency slow','web design business slow',

  // ── Real estate ──
  'real estate leads','realtor clients','estate agent marketing',
  'property leads','real estate slow','landlord finding tenants',
  'no property viewings','estate agent struggling',

  // ── Ecommerce & retail ──
  'shopify store no sales','ecommerce not selling','dropshipping no sales',
  'amazon seller slow','online store no traffic','product not selling',
  'store getting traffic no conversions','ecommerce conversion problem',

  // ── Coaching & consulting ──
  'business coach clients','life coach clients','consulting clients',
  'coaching business slow','no consulting work','executive coach clients',
  'coach no clients','consultant slow','struggling coach',

  // ── Restaurants & food ──
  'restaurant slow','cafe not busy','food business clients',
  'catering no bookings','restaurant marketing','hospitality slow',
  'cafe struggling','restaurant not busy','catering no work',

  // ── Tech / SaaS ──
  'saas no customers','startup no users','app no downloads',
  'no b2b clients','software company slow','mvp no signups',
  'saas churn','losing saas customers','startup getting no traction',
  'product no users','b2b no demos','no demo bookings',

  // ── Financial advisors / professionals ──
  'financial advisor clients','mortgage broker clients',
  'accountant getting clients','bookkeeper clients',
  'no accounting clients','financial planner clients',

  // ── Virtual assistants & admin ──
  'virtual assistant clients','va clients','no va work',
  'remote work clients','online business clients',

  // ── Lead gen / general growth ──
  'struggling to scale','how to grow my business',
  'need more leads','lead generation help',
  'client acquisition strategy','getting consistent leads',
  'how to fill my pipeline','pipeline empty','no pipeline'
];

function shuffleKws() {
  const pool    = [...KW_POOL].sort(() => Math.random() - 0.5);
  const picked  = pool.slice(0, 12);
  const container = document.getElementById('feed-keywords');
  const refreshBtn = document.getElementById('btn-feed-shuffle');

  // Remove all pills except the refresh button
  [...container.querySelectorAll('.kw-btn:not(.kw-refresh)')].forEach(b => b.remove());

  // Insert new pills before the refresh button
  picked.forEach((kw, i) => {
    const btn = document.createElement('button');
    btn.className = 'kw-btn' + (i === 0 ? ' active' : '');
    btn.dataset.kw = kw;
    btn.textContent = kw;
    btn.addEventListener('click', () => {
      container.querySelectorAll('.kw-btn:not(.kw-refresh)').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFeedKw = kw;
      fetchFeed(kw);
    });
    container.insertBefore(btn, refreshBtn);
  });

  if (picked.length) activeFeedKw = picked[0];
}

let activeFeedKw = KW_POOL[0];
shuffleKws(); // init on load

document.getElementById('btn-feed-shuffle').addEventListener('click', () => {
  shuffleKws(); // rotate keywords — tap a pill to fetch
});

/* ── FETCH + RENDER ── */
async function fetchFeed(keyword) {
  const grid    = document.getElementById('feed-grid');
  const meta    = document.getElementById('feed-meta');
  const refreshBtn = document.getElementById('btn-feed-refresh');
  grid.innerHTML = '<div class="feed-loading"><i class="fas fa-circle-notch"></i>Scanning all platforms for leads...</div>';
  meta.textContent = '';
  if (refreshBtn) refreshBtn.classList.add('spinning');
  try {
    const res  = await fetch(API + '/feed?q=' + encodeURIComponent(keyword));
    const data = await res.json();
    if (!data.ok || !data.posts.length) {
      grid.innerHTML = '<div class="feed-empty"><i class="fas fa-inbox"></i><p>No posts found — try a different keyword</p></div>';
      return;
    }

    // Pass all non-Reddit platforms through directly; filter Reddit to business subs only
    const REDDIT_SUBS = new Set([
      'smallbusiness','entrepreneur','sidehustle','freelance','sales',
      'startups','sweatystartup','entrepreneurridealong','forhire',
      'entrepreneur_ride_along','businessowners','growmybusiness',
      'digital_marketing','marketinghelp','agency','solopreneur',
      'web_design','webdev','photography','weddingphotography','videography',
      'graphic_design','homeimprovement','plumbing','hvac','landscaping',
      'cleaning_business','ecommerce','shopify','amazonseller',
      'personaltraining','fitness','realestate','realtors',
      'financialplanning','consulting','coaching','seo','ppc','copywriting',
      'socialmediamarketing','workonline','hiring'
    ]);
    const businessPosts = data.posts.filter(p =>
      p.platform !== 'reddit' || REDDIT_SUBS.has((p.subreddit || '').toLowerCase())
    );

    // Score posts
    const scoredPosts = businessPosts
      .map(p => ({ ...p, _score: scorePost(p.title, p.text), _source: 'post' }))
      .filter(p => p._score >= 40);

    // Extract high-signal comments as additional lead candidates
    const commentLeads = [];
    for (const post of businessPosts) {
      if (!post.comments || !post.comments.length) continue;
      for (const comment of post.comments) {
        const cs = scorePost('', comment, true);
        if (cs >= 40) {
          commentLeads.push({
            id:        post.id + '_c' + commentLeads.length,
            title:     post.title,
            text:      comment,
            author:    post.author,
            subreddit: post.subreddit,
            url:       post.url,
            permalink: post.permalink,
            created:   post.created,
            score:     post.score,
            platform:  'reddit',
            _score:    cs,
            _source:   'comment'
          });
        }
      }
    }

    // Score + include non-Reddit posts (HN, X, Facebook, etc.) — already keyword-filtered by their APIs
    const externalLeads = businessPosts
      .filter(p => p.platform !== 'reddit')
      .map(p => ({ ...p, _score: Math.max(scorePost(p.title, p.text), 30), _source: 'external' }));

    // Merge, deduplicate by post id (keep highest scorer), filter weak leads, sort desc
    const seen = new Set();
    const allLeads = [...scoredPosts, ...commentLeads, ...externalLeads]
      .sort((a, b) => {
        const aHot = isHotLead(a) ? 1 : 0;
        const bHot = isHotLead(b) ? 1 : 0;
        if (bHot !== aHot) return bHot - aHot;
        return b._score - a._score;
      })
      .filter(l => {
        if (isWeakLead(l)) return false;
        const key = l.id.split('_c')[0];
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    if (!allLeads.length) {
      grid.innerHTML = '<div class="feed-empty"><i class="fas fa-filter"></i><p>No high-intent leads in this batch — try "no clients" or "need more bookings"</p></div>';
      meta.textContent = `${data.posts.length} posts fetched · ${businessPosts.length} from target subs · 0 passed quality filter`;
      return;
    }

    const xCount  = allLeads.filter(l => l.platform === 'x').length;
    const hnCount = allLeads.filter(l => l.platform === 'hn').length;
    const fbCount = allLeads.filter(l => l.platform === 'facebook').length;
    const liCount = allLeads.filter(l => l.platform === 'linkedin').length;
    const xNote   = xCount  ? ` · ${xCount} 𝕏`  : (!data.xConfigured      ? ' · <a href="#" onclick="showXSetup()"      style="color:var(--accent);text-decoration:none">+ 𝕏</a>'      : '');
    const gNote   = (fbCount||liCount) ? ` · ${fbCount+liCount} web` : (!data.googleConfigured ? ' · <a href="#" onclick="showGoogleSetup()" style="color:var(--accent);text-decoration:none">+ Facebook/LinkedIn</a>' : '');
    const hnNote  = hnCount ? ` · ${hnCount} HN` : '';
    const aiNote  = _aiEnabled ? ' · <span style="color:var(--accent);font-size:.72rem">⚡ AI</span>' : ' · <a href="#" onclick="showAISetup()" style="color:var(--muted);text-decoration:none;font-size:.72rem">+ AI Assist</a>';
    const rdCount = allLeads.filter(l => l.platform === 'reddit').length;
    // Lead type counts for meta
    const directCount   = allLeads.filter(l => detectLeadType(l.title,l.text,l.subreddit||l.platform,l._score).key==='direct').length;
    const operatorCount = allLeads.filter(l => detectLeadType(l.title,l.text,l.subreddit||l.platform,l._score).key==='operator').length;
    const partnerCount  = allLeads.filter(l => detectLeadType(l.title,l.text,l.subreddit||l.platform,l._score).key==='partner').length;
    const typeNote = ` · <span style="color:#22c55e">💰${directCount}</span> <span style="color:#f59e0b">⚡${operatorCount}</span> <span style="color:#a855f7">🚀${partnerCount}</span>`;

    meta.innerHTML = `${allLeads.length} quality leads · ${rdCount} Reddit${xNote}${hnNote}${gNote}${typeNote}${aiNote} · "${keyword}"`;
    grid.innerHTML = allLeads.map(p => renderFeedCard(p)).join('');

    logFeedScan(keyword, allLeads.length, allLeads);

    // Show type filter bar
    const filterBar = document.getElementById('lead-type-filters');
    if (filterBar) filterBar.style.display = 'flex';
  } catch (e) {
    grid.innerHTML = '<div class="feed-empty"><i class="fas fa-triangle-exclamation"></i><p>Could not fetch — check server is running</p></div>';
  } finally {
    if (refreshBtn) refreshBtn.classList.remove('spinning');
  }
}

function timeAgo(utc) {
  const diff = Math.floor(Date.now() / 1000) - utc;
  if (diff < 3600)   return Math.floor(diff/60) + 'm ago';
  if (diff < 86400)  return Math.floor(diff/3600) + 'h ago';
  return Math.floor(diff/86400) + 'd ago';
}

// Global post data store — avoids all string-escaping issues in onclick attributes
window._feedData = window._feedData || {};

function renderFeedCard(post) {
  const isComment = post._source === 'comment';
  const a   = analyzePost(post.title, post.text, post._score);
  // Re-run type detection with subreddit for accuracy
  a.leadType = detectLeadType(post.title, post.text, post.subreddit || post.platform, a.urgency);
  const ago = timeAgo(post.created);
  const fillW = Math.max(4, a.urgency);
  const sourceTag = isComment
    ? `<span class="feed-source-tag">comment</span>` : '';

  // Store full data in global map — onclick just passes the ID
  window._feedData[post.id] = { post, a };
  const pid = post.id;

  const platformBadge = post.platform === 'x'        ? `<span class="feed-platform feed-platform-x">𝕏</span>`
    : post.platform === 'hn'       ? `<span class="feed-platform feed-platform-hn">HN</span>`
    : post.platform === 'facebook' ? `<span class="feed-platform feed-platform-fb">FB</span>`
    : post.platform === 'linkedin' ? `<span class="feed-platform feed-platform-li">in</span>`
    : post.platform === 'quora'    ? `<span class="feed-platform feed-platform-q">Q</span>`
    : post.platform === 'web'      ? `<span class="feed-platform feed-platform-web">Web</span>`
    : `<span class="feed-platform">r/${esc(post.subreddit)}</span>`;

  const lt = a.leadType;

  // Critical desperation band shown above card
  const desperateBanner = a.isDesparate
    ? `<div class="feed-critical-banner">🔥 DESPERATION SIGNAL — message now</div>`
    : '';
  const hotClass = isHotLead(post) ? ' feed-card-hot' : '';

  return `<div class="feed-card${a.isDesparate ? ' feed-card-critical' : ''}${hotClass}" id="fc-${esc(post.id)}" data-lead-type="${lt.key}">

    ${desperateBanner}

    <div class="feed-card-top">
      ${platformBadge}
      <span class="feed-title">${esc(post.title)}${sourceTag}</span>
      <span class="feed-time">${ago}</span>
    </div>

    ${post.text && post.text !== post.title
      ? `<div class="feed-snippet">${isComment ? '<i class="fas fa-comment" style="color:var(--accent);margin-right:4px;font-size:.7rem"></i>' : ''}${esc(post.text)}</div>`
      : ''}

    <!-- LEAD TYPE BADGE -->
    <div class="lead-type-badge" style="background:${lt.bg};border-color:${lt.color}20">
      <span class="ltb-icon">${lt.badge}</span>
      <span class="ltb-label" style="color:${lt.color}">${lt.label}</span>
      <span class="ltb-tag">${lt.tagline}</span>
      <span class="ltb-pitch">${lt.pitch}</span>
    </div>

    <!-- URGENCY BAR -->
    <div class="feed-urgency-row">
      <span class="analysis-label">Intent</span>
      <div class="urgency-bar"><div class="urgency-fill" style="width:${fillW}%;background:${a.urgencyColor}"></div></div>
      <span style="color:${a.urgencyColor};font-weight:700;font-size:.75rem">${a.urgencyLabel} · ${a.urgency}</span>
      <span class="feed-niche-tag">${esc(a.niche)}</span>
    </div>
    <div class="feed-urgency-reason">${esc(a.urgencyReason)}</div>

    <!-- INTEL PANEL -->
    <div class="intel-panel">
      <div class="intel-row">
        <span class="intel-label">Problem</span>
        <span class="intel-val">${esc(a.problem)}</span>
      </div>
      <div class="intel-row">
        <span class="intel-label">Root cause</span>
        <span class="intel-val">${esc(a.cause)}</span>
      </div>
      <div class="intel-row">
        <span class="intel-label">Your angle</span>
        <span class="intel-val intel-angle">${esc(a.angle)}</span>
      </div>
      <div class="intel-row">
        <span class="intel-label">Approach</span>
        <span class="intel-val" style="color:${lt.color}">${lt.key === 'direct' ? esc(a.demoFocus) : lt.pitch}</span>
      </div>
    </div>

    <!-- OPENER -->
    <div class="feed-opener">
      <div class="feed-opener-head">
        <span class="intel-label" style="color:var(--accent)">Send this</span>
        <button class="btn-copy-opener" onclick="copyOpener('${pid}')" title="Copy message">
          <i class="fas fa-copy"></i>
        </button>
      </div>
      <span class="feed-opener-text">"${esc(buildTypeOpener(lt.key, a, post))}"</span>
    </div>

    <div class="feed-tip">${esc(a.tip)}</div>

    <!-- ACTIONS -->
    <div class="feed-actions">
      <button class="btn btn-primary btn-sm" onclick="buildFromLead('${pid}')" style="background:${lt.color}">
        <i class="fas fa-bolt"></i> Build ${lt.key === 'direct' ? 'Demo' : lt.key === 'operator' ? 'Pitch' : 'Deck'}
      </button>
      <button class="btn btn-secondary btn-sm" onclick="copyLeadIntel('${pid}')">
        <i class="fas fa-clipboard"></i> Copy Intel
      </button>
      <button class="btn btn-secondary btn-sm" onclick="saveFeedLead('${pid}')">
        <i class="fas fa-user-plus"></i> Save
      </button>
      <button class="btn btn-secondary btn-sm" onclick="quickResearch('${pid}')">
        <i class="fas fa-magnifying-glass"></i>
      </button>
      <a class="btn btn-secondary btn-sm" href="${esc(post.url)}" target="_blank" rel="noopener">
        <i class="fas fa-arrow-up-right-from-square"></i>
      </a>
      <button class="btn btn-hot btn-sm" onclick="markHotLead('${pid}')" title="Star as hot lead">
        <i class="fas fa-star"></i> Hot
      </button>
      <button class="btn btn-weak btn-sm" onclick="markWeakLead('${pid}')" title="Mark as weak lead">
        <i class="fas fa-ban"></i> Weak
      </button>
    </div>
  </div>`;
}

/* ── COPY HELPERS ── */
function copyOpener(pid) {
  const d = window._feedData[pid];
  if (!d) return;
  const msg = buildTypeOpener(d.a.leadType.key, d.a, d.post);
  navigator.clipboard.writeText(msg).then(() => {
    flashCopyBtn(pid, '.btn-copy-opener');
    logFeedAction('copies');
  });
}

function copyLeadIntel(pid) {
  const d = window._feedData[pid];
  if (!d) return;
  const { a, post } = d;
  const lt = a.leadType;
  const lines = [
    `--- LEAD INTEL ---`,
    `Source: ${post.platform === 'reddit' ? 'r/' + post.subreddit : post.platform} | ${post.url}`,
    `Niche: ${a.niche}`,
    `Lead Type: ${lt.label} (${lt.tagline})`,
    `Urgency: ${a.urgencyLabel} (${a.urgency}/100) — ${a.urgencyReason}`,
    ``,
    `Problem: ${a.problem}`,
    `Root Cause: ${a.cause}`,
    `Angle: ${a.angle}`,
    `Demo Focus: ${a.demoFocus}`,
    ``,
    `--- OPENER ---`,
    buildTypeOpener(lt.key, a, post),
    ``,
    `--- ORIGINAL POST ---`,
    post.title,
    post.text && post.text !== post.title ? post.text : '',
    ``,
    `Tip: ${a.tip.replace(/[🔥⚡💬🔍]/g, '').trim()}`
  ].filter(l => l !== undefined).join('\n');

  navigator.clipboard.writeText(lines).then(() => {
    logFeedAction('intelCopies');
    const card = document.getElementById('fc-' + pid);
    if (!card) return;
    const btn = card.querySelector('[onclick*="copyLeadIntel"]');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> Copied';
      btn.style.borderColor = 'var(--accent)';
      btn.style.color = 'var(--accent)';
      setTimeout(() => { btn.innerHTML = orig; btn.style.borderColor = ''; btn.style.color = ''; }, 1500);
    }
  });
}

function flashCopyBtn(pid, sel) {
  const card = document.getElementById('fc-' + pid);
  if (!card) return;
  const btn = card.querySelector(sel);
  if (!btn) return;
  btn.classList.add('copy-flash');
  setTimeout(() => btn.classList.remove('copy-flash'), 1200);
}

/* ── FEED ACTIVITY TRACKER ── */
function getFeedActivity() {
  try { return JSON.parse(localStorage.getItem('feedActivity') || 'null') || _defaultFeedActivity(); }
  catch { return _defaultFeedActivity(); }
}
function _defaultFeedActivity() {
  return { scans: [], actions: { copies: 0, intelCopies: 0, hotMarks: 0, weakMarks: 0, saves: 0, demosBuilt: 0 }, topKeywords: {}, topNiches: {}, topSubreddits: {}, avgScore: 0, totalLeadsFound: 0, highIntentCount: 0, criticalCount: 0, sessionStart: new Date().toISOString() };
}
function saveFeedActivity(fa) {
  localStorage.setItem('feedActivity', JSON.stringify(fa));
}
function logFeedScan(keyword, leadsFound, leads) {
  const fa = getFeedActivity();
  fa.scans.push({ keyword, leadsFound, ts: Date.now() });
  fa.totalLeadsFound += leadsFound;
  if (!fa.topKeywords[keyword]) fa.topKeywords[keyword] = 0;
  fa.topKeywords[keyword] += leadsFound;
  let scoreSum = 0;
  leads.forEach(l => {
    scoreSum += l._score || 0;
    if ((l._score || 0) >= 70) fa.highIntentCount++;
    if ((l._score || 0) >= 85) fa.criticalCount++;
    const a = analyzePost(l.title, l.text, l._score);
    const niche = a.niche || 'Unknown';
    if (!fa.topNiches[niche]) fa.topNiches[niche] = 0;
    fa.topNiches[niche]++;
    const sub = l.subreddit || l.platform || 'other';
    if (!fa.topSubreddits[sub]) fa.topSubreddits[sub] = 0;
    fa.topSubreddits[sub]++;
  });
  if (fa.totalLeadsFound > 0) {
    fa.avgScore = Math.round(((fa.avgScore * (fa.totalLeadsFound - leadsFound)) + scoreSum) / fa.totalLeadsFound);
  }
  saveFeedActivity(fa);
}
function logFeedAction(type) {
  const fa = getFeedActivity();
  if (fa.actions[type] !== undefined) fa.actions[type]++;
  saveFeedActivity(fa);
}

/* ── WEAK LEAD MANAGEMENT ── */
function getWeakLeads() {
  try { return JSON.parse(localStorage.getItem('WeakLeads') || '[]'); }
  catch { return []; }
}

function isWeakLead(post) {
  const dominated = getWeakLeads();
  const key = (post.author || '') + '|' + (post.subreddit || post.platform || '');
  return dominated.includes(key) || dominated.includes(post.id);
}

function markWeakLead(pid) {
  const d = window._feedData[pid];
  if (!d) return;
  const { post } = d;
  const weak = getWeakLeads();
  const key = (post.author || '') + '|' + (post.subreddit || post.platform || '');
  if (!weak.includes(key)) weak.push(key);
  if (!weak.includes(post.id)) weak.push(post.id);
  localStorage.setItem('WeakLeads', JSON.stringify(weak));

  const card = document.getElementById('fc-' + pid);
  if (card) {
    card.style.transition = 'opacity .3s, transform .3s';
    card.style.opacity = '0';
    card.style.transform = 'scale(.96)';
    setTimeout(() => card.remove(), 300);
  }
  logFeedAction('weakMarks');
  toast('Marked as weak — hidden from future feeds', 'ok');
}

/* ── HOT LEAD MANAGEMENT ── */
function getHotLeads() {
  try { return JSON.parse(localStorage.getItem('hotLeads') || '[]'); }
  catch { return []; }
}

function isHotLead(post) {
  const hot = getHotLeads();
  return hot.includes(post.id);
}

function markHotLead(pid) {
  const d = window._feedData[pid];
  if (!d) return;
  const { post } = d;
  const hot = getHotLeads();

  const card = document.getElementById('fc-' + pid);
  if (hot.includes(post.id)) {
    hot.splice(hot.indexOf(post.id), 1);
    localStorage.setItem('hotLeads', JSON.stringify(hot));
    if (card) card.classList.remove('feed-card-hot');
    toast('Removed hot lead star', 'ok');
    return;
  }

  hot.push(post.id);
  localStorage.setItem('hotLeads', JSON.stringify(hot));

  if (card) {
    card.classList.add('feed-card-hot');
    const grid = card.parentElement;
    if (grid && grid.firstChild !== card) {
      card.style.transition = 'opacity .2s, transform .2s';
      card.style.opacity = '0';
      card.style.transform = 'translateY(-8px)';
      setTimeout(() => {
        grid.insertBefore(card, grid.firstChild);
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 200);
    }
  }
  logFeedAction('hotMarks');
  toast('⭐ Starred as hot lead', 'ok');
}

/* ══════════════════════════════════
   LEAD CONTEXT ENGINE
   Converts raw post text → structured
   page copy specific to this person
══════════════════════════════════ */

function extractLeadContext(title, text, niche) {
  const full = (title + ' ' + text).toLowerCase();
  return {
    problem:    lcDetectProblem(full),
    stage:      lcDetectStage(full),
    funnelGap:  lcDetectFunnelGap(full),
    emotion:    lcDetectEmotion(full),
    angle:      lcGenerateAngle(full),
    headline:   lcGenerateHeadline(full),
    subtext:    lcGenerateSubtext(full),
    scenarios:  lcGenerateScenarios(full),
    painPoints: lcGeneratePainPoints(full),
    outcomes:   lcGenerateOutcomes(full),
    formQs:     lcGenerateFormQuestions(full),
    proof:      lcGenerateProof(full, niche),
    opener:     lcGenerateOpener(full, title)
  };
}

function lcDetectProblem(t) {
  if (/ads|paid|ppc|facebook ad|google ad/.test(t)) {
    if (/dm|messag|enquir|interest|click/.test(t) && /no (client|book|sale|conver)/.test(t))
      return 'getting attention and clicks but nobody is actually converting';
    if (/spend|wast|burn|£|€|\$|money/.test(t))
      return 'spending money on ads but getting no clients back from it';
    return 'running ads that aren\'t producing paying clients';
  }
  if (/cold (email|outreach|dm|message)|no (reply|response|replies)/.test(t))
    return 'reaching out to potential clients but getting ignored';
  if (/website|landing page|traffic but no/.test(t))
    return 'getting visitors to the site but none of them turn into enquiries';
  if (/social media|post(ing)?|content|instagram|tiktok/.test(t))
    return 'posting content every day but not seeing clients come from it';
  if (/referral|word of mouth|dried up/.test(t))
    return 'referrals drying up with nothing consistent to replace them';
  if (/proposal|quote|follow.?up|ghost/.test(t))
    return 'sending quotes and proposals but prospects go cold and never reply';
  if (/no (clients|customers|work|bookings|enquiries|leads)/.test(t))
    return 'no consistent flow of new clients or enquiries coming in';
  if (/slow|quiet|dead|dry spell/.test(t))
    return 'things going quiet — not enough new work coming in';
  if (/feast|famine|inconsistent/.test(t))
    return 'inconsistent months — good periods followed by nothing';
  return 'struggling to get a reliable, consistent flow of new clients';
}

function lcDetectStage(t) {
  if (/already.*(ads|run|spend|pay)|running ads|been running/.test(t))   return 'already investing in paid marketing';
  if (/just start|new business|first client|starting out|beginner/.test(t)) return 'just getting started';
  if (/year|established|been doing this|long time/.test(t))              return 'established business that\'s hit a plateau';
  if (/grew|growing|scaling|expand|busy period/.test(t))                 return 'growing but with inconsistent peaks and troughs';
  if (/tried (ads|everything|outreach|social|content)/.test(t))          return 'tried multiple approaches without consistent results';
  return 'active business looking to grow more consistently';
}

function lcDetectFunnelGap(t) {
  if (/dm|messag|enquir/.test(t) && /no (book|client|sale|conver)/.test(t))
    return 'interest coming in but no system to convert it into paying clients';
  if (/no follow.?up|follow up|ghost|go cold|go quiet/.test(t))
    return 'no follow-up — leads go cold before they close';
  if (/no reply|no response|ignor|left on read/.test(t))
    return 'outreach not landing — message isn\'t connecting';
  if ((/website|traffic|visit/).test(t) && /no (lead|enquir|conver|client)/.test(t))
    return 'traffic arriving but no way to capture or convert it';
  if (/ads|paid/.test(t) && /no (client|conver|sale|return)/.test(t))
    return 'ad spend with no conversion system to turn clicks into clients';
  if (/social|content|post/.test(t))
    return 'building an audience but missing the bridge to turn them into clients';
  if (/referral/.test(t))
    return 'single referral channel with no backup when it dries up';
  return 'no reliable system pulling enquiries through to closed clients';
}

function lcDetectEmotion(t) {
  if (/desperate|give up|quit|failing|can\'?t keep|running out|rock bottom/.test(t)) return 'desperate';
  if (/frustrated|frustrating|annoying|sick of|fed up|done with/.test(t)) return 'frustrated';
  if (/confus|don\'?t know|no idea|not sure what|lost|nothing work/.test(t)) return 'confused and lost';
  if (/wasted|burned|spent.*(and nothing|but no)|threw money/.test(t)) return 'burned — money wasted';
  if (/stressed|anxious|worry|worried|scared/.test(t)) return 'stressed';
  return 'frustrated';
}

function lcGenerateAngle(t) {
  if (/ads|paid/.test(t)) {
    if (/dm|messag|enquir|click/.test(t) && /no (book|client|sale)/.test(t))
      return 'You\'re getting attention — you just don\'t have a system to convert it';
    if (/spend|wast|burn/.test(t))
      return 'More ad spend won\'t fix it — a conversion system will';
    return 'Traffic isn\'t the problem — converting it into clients is';
  }
  if (/cold|outreach|dm/.test(t))
    return 'Cold outreach works when people have somewhere to land — right now they don\'t';
  if (/website|landing|traffic/.test(t))
    return 'Getting traffic is the easy part — turning it into clients is the gap';
  if (/social|content|post/.test(t))
    return 'Content builds an audience — but without a pipeline it doesn\'t build a business';
  if (/referral/.test(t))
    return 'Referrals are great when they come — you need something that works without them';
  if (/proposal|quote|ghost/.test(t))
    return 'The sale doesn\'t happen at the proposal — it happens in the follow-up';
  if (/no client|no work|no lead/.test(t))
    return 'No clients usually means one thing — no system to attract and close them';
  return 'The issue isn\'t your service — it\'s that the right people can\'t find and trust you yet';
}

function lcGenerateHeadline(t) {
  if (/ads|paid/.test(t)) {
    if (/dm|messag|enquir/.test(t) && /no (book|client|sale|conver)/.test(t))
      return 'When you\'re getting messages but nobody actually becomes a client — this is why';
    if (/spend|wast|burn|money/.test(t))
      return 'When you\'re spending on ads and getting nothing back — here\'s where it\'s breaking';
    return 'When ads are running but clients aren\'t coming — this is the missing piece';
  }
  if (/cold|outreach|dm/.test(t) && /no reply|ignor|ghost|read/.test(t))
    return 'When you\'re reaching out but nobody replies — here\'s what\'s actually happening';
  if (/website|traffic/.test(t))
    return 'When people visit your site but never enquire — here\'s exactly why';
  if (/social|content|post/.test(t))
    return 'When you\'re posting every day and still not getting clients — this is the gap';
  if (/referral|dried up/.test(t))
    return 'When referrals stop coming in and there\'s nothing to replace them — let\'s fix that';
  if (/proposal|quote|ghost/.test(t))
    return 'When prospects ask for a quote then disappear — here\'s how to stop losing them';
  if (/no client|no customer|no work|no booking/.test(t))
    return 'When there\'s no consistent flow of new clients — this is why and how to fix it';
  if (/slow|quiet|dead/.test(t))
    return 'When things go quiet and you\'re not sure what to do — start here';
  return 'When getting new clients feels harder than it should — here\'s what\'s missing';
}

function lcGenerateSubtext(t) {
  if (/ads|paid/.test(t)) {
    if (/dm|messag|enquir/.test(t) && /no (book|client|sale)/.test(t))
      return 'You\'re already spending and getting interest — but interest without a system to convert it just disappears. Here\'s the part that\'s missing.';
    if (/spend|wast|burn/.test(t))
      return 'Running ads without a conversion system is like filling a leaking bucket. The traffic is there — but it\'s going nowhere. Here\'s how to fix that.';
    return 'Ads can drive traffic — but without the right system on the other end, none of it turns into clients. That\'s the gap we close.';
  }
  if (/cold|outreach|dm/.test(t))
    return 'Outreach works when people have somewhere to land that builds trust before they reply. Without that, even good messages get ignored. Here\'s what changes it.';
  if (/website|traffic/.test(t))
    return 'Most websites explain what you do. A high-converting one makes it obvious why someone should act today — and captures them when they\'re ready. That\'s what\'s missing.';
  if (/social|content|post/.test(t))
    return 'Posting builds visibility — but without a system to capture interest when it peaks, you\'re growing an audience not a client list. Here\'s the bridge.';
  if (/referral/.test(t))
    return 'Referrals are one of the best ways to get clients — but you can\'t control when they come. This is how you build something that doesn\'t rely on that.';
  if (/proposal|quote|ghost/.test(t))
    return 'Most deals are lost not because the proposal was wrong, but because there was no follow-up to close while the decision window was open. Here\'s how to fix that.';
  return 'Most service businesses have a great service — they just don\'t have a reliable way to turn interest into consistent paying clients. That\'s what this fixes.';
}

function lcGenerateScenarios(t) {
  if (/ads|paid/.test(t)) {
    if (/dm|messag|enquir/.test(t) && /no (book|client|sale)/.test(t)) return [
      'You get DMs and enquiries from the ads — but people ask one question, you reply, and then they go completely cold',
      'You\'re spending money every month, getting clicks and some interest, but still don\'t have consistent clients booked',
      'You\'ve tried adjusting the ads — the creative, the audience, the budget — but the real problem is what happens after someone clicks'
    ];
    return [
      'Your ads are running, you\'re paying per click, but very few of those clicks turn into actual enquiries',
      'The ad account looks active — but your calendar is still quiet and you\'re not sure what\'s wrong',
      'You\'ve tweaked the ads repeatedly but the issue isn\'t the ad — it\'s the system on the other side of it'
    ];
  }
  if (/cold|outreach|dm/.test(t)) return [
    'You send outreach messages — some get seen, most get left on read, and you\'re not sure if it\'s the message or just bad luck',
    'The few who do reply ask a question or two then disappear before you can book a call',
    'You keep reaching out because you don\'t have anything else — but each ignored message makes it harder to stay consistent'
  ];
  if (/website|traffic/.test(t)) return [
    'People visit your website — you can see the traffic — but the phone doesn\'t ring and no enquiries come through',
    'You\'ve updated the site, added more info, maybe changed the design — but it still doesn\'t seem to convert',
    'Visitors come, look around, and leave — and you have no idea what they were looking for or why they didn\'t get in touch'
  ];
  if (/social|content|post/.test(t)) return [
    'You post consistently, get likes and some comments — but nobody actually reaches out to hire you',
    'Your following is growing slowly but it\'s not translating into clients or bookings',
    'You\'re spending hours creating content every week but it\'s not building your pipeline — just your follower count'
  ];
  if (/referral|dried up/.test(t)) return [
    'You\'ve had good periods when referrals were coming regularly — but they\'re completely unpredictable',
    'You never know when the next client is coming, so every quiet week feels like a crisis',
    'There\'s no way to turn the referral tap on when you need work — you just have to wait and hope'
  ];
  if (/proposal|quote|ghost/.test(t)) return [
    'You send a detailed quote, they say they\'ll think about it — and then you never hear from them again',
    'You follow up once or twice but don\'t want to seem pushy, so you let it go and lose the deal',
    'Good leads turn into nothing and you\'re not sure if it\'s the price, the timing, or something else'
  ];
  if (/slow|quiet|dead/.test(t)) return [
    'This month has been slow — quieter than usual — and you\'re not sure if it\'s a blip or something to worry about',
    'You don\'t have a clear way to generate new work when things go quiet — you just wait for something to come in',
    'The busy periods are great but when it slows down there\'s nothing to fall back on'
  ];
  return [
    'Some months are great, others are nearly empty — and you can\'t predict which it\'ll be',
    'You know you need a more consistent flow of clients but you\'re not sure where to start fixing it',
    'You\'ve tried a couple of things that didn\'t work, and now you\'re not sure what to trust or prioritise'
  ];
}

function lcGenerateOpener(t, rawTitle) {
  const angle = lcGenerateAngle(t);
  if (/desperate|give up|quit|failing|running out/.test(t))
    return `Saw your post and wanted to reach out — ${angle.charAt(0).toLowerCase() + angle.slice(1)}. I've built systems that fix exactly this and I can put a preview together for your setup today. Worth a look?`;
  if (/ads|paid/.test(t))
    return `Saw your post about the ads — ${angle.charAt(0).toLowerCase() + angle.slice(1)}. I build the conversion side of this for businesses like yours. I can mock something up based on your situation — want to see it?`;
  return `Saw your post and it stood out — ${angle.charAt(0).toLowerCase() + angle.slice(1)}. I build systems that fix exactly this. Happy to put a quick preview together for your specific setup — want to take a look?`;
}

function lcGeneratePainPoints(t) {
  if (/ads|paid/.test(t)) {
    if (/dm|messag|enquir/.test(t) && /no (book|client|sale|conver)/.test(t)) return [
      'You\'re getting DMs and clicks but they don\'t turn into actual bookings',
      'Interest comes in and immediately goes cold — no system to follow it up',
      'You\'re spending on ads every month with nothing consistent coming back',
      'No way to tell which part of the process is losing them'
    ];
    return [
      'Paying for clicks that never turn into enquiries or clients',
      'Ad spend going out every month without clear return',
      'No conversion system on the other side of the ads',
      'Difficult to know if the problem is the ad, the page, or the follow-up'
    ];
  }
  if (/cold|outreach|dm/.test(t)) return [
    'Messages go out but most get ignored or left on read',
    'The few who reply ask one question and disappear',
    'Nothing to send people to that builds trust before they respond',
    'Manual outreach is exhausting with no reliable return'
  ];
  if (/website|traffic/.test(t)) return [
    'People visit the site but leave without getting in touch',
    'No way to capture interest from visitors who aren\'t ready to call today',
    'Can\'t tell what visitors are looking for or why they\'re not enquiring',
    'Traffic exists but it doesn\'t translate into enquiries'
  ];
  if (/social|content|post/.test(t)) return [
    'Posting consistently but it\'s not producing enquiries or clients',
    'People engage with content but never reach out to hire you',
    'No system to capture the interest that content generates',
    'Hours spent creating content with no clear link to revenue'
  ];
  if (/referral|dried up/.test(t)) return [
    'Referrals have slowed or stopped and nothing has replaced them',
    'No control over when the next client comes — you just wait and hope',
    'Good months exist but they rely on luck, not a repeatable system',
    'Single source of clients means one point of failure'
  ];
  if (/proposal|quote|ghost/.test(t)) return [
    'Proposals go out and leads go completely cold with no explanation',
    'No follow-up system — you chase once then let it go',
    'Time spent on detailed quotes for leads who never reply',
    'No way to keep the decision window open after sending the quote'
  ];
  return [
    'No consistent, predictable way to bring in new enquiries',
    'Good months followed by quiet ones — feast or famine',
    'Tried things that didn\'t work and not sure what to trust next',
    'Growth relies on timing and luck rather than a system'
  ];
}

function lcGenerateOutcomes(t) {
  if (/ads|paid/.test(t)) {
    if (/dm|messag|enquir/.test(t) && /no (book|client|sale|conver)/.test(t)) return [
      'Every enquiry that comes in gets captured and followed up automatically within minutes',
      'A conversion sequence turns interested DMs into booked clients',
      'Clear visibility on which part of the funnel is producing results',
      'Ad spend produces measurable, trackable new clients — not just clicks'
    ];
    return [
      'Clicks land on a page built to convert them into real enquiries',
      'Every lead gets an immediate automated follow-up before they go cold',
      'Measurable return on ad spend — clients, not just impressions',
      'Full pipeline: click → enquiry → booked client, tracked end to end'
    ];
  }
  if (/cold|outreach|dm/.test(t)) return [
    'Outreach links to a page that builds trust before they reply',
    'Automated follow-up ensures no lead goes cold after first contact',
    'Replies convert into booked calls with a clear simple path',
    'Consistent inbound from outreach — not a numbers game'
  ];
  if (/website|traffic/.test(t)) return [
    'Visitors have a clear reason to take action before they leave',
    'Interest is captured from people who aren\'t ready to call today',
    'Every page has a clear offer and a path to enquire',
    'Consistent enquiries from people who are already warm to your service'
  ];
  if (/social|content|post/.test(t)) return [
    'Content interest gets captured into a real pipeline automatically',
    'A clear path from follower → lead → booked client',
    'Engaged audience turns into consistent enquiries, not just likes',
    'Content works as a lead generation engine, not just brand building'
  ];
  if (/referral|dried up/.test(t)) return [
    'Consistent inbound pipeline that doesn\'t rely on referrals',
    'New clients coming in predictably — you know where they\'re coming from',
    'Quiet months become the exception, not the norm',
    'Multiple channels working together so no single point of failure'
  ];
  if (/proposal|quote|ghost/.test(t)) return [
    'Every quote is followed by an automated sequence that keeps the conversation alive',
    'Warm leads get nurtured until they\'re ready to say yes',
    'Higher conversion rate on the proposals you\'re already sending',
    'Clear system from first enquiry → proposal → closed client'
  ];
  return [
    'Consistent, predictable enquiries coming in every week',
    'A clear system that works without relying on timing or luck',
    'Full visibility on where clients come from and what converts them',
    'Growth that\'s repeatable — not dependent on a single good month'
  ];
}

function lcGenerateFormQuestions(t) {
  if (/ads|paid/.test(t)) return {
    q1: 'What are you currently running ads on — and what happens after someone clicks?',
    q2: 'What does a good week look like vs where things are right now?'
  };
  if (/cold|outreach/.test(t)) return {
    q1: 'What does your current outreach look like — and where does it tend to drop off?',
    q2: 'When someone does reply, what usually happens next?'
  };
  if (/website|traffic/.test(t)) return {
    q1: 'How are people currently finding your site — and what do you think they\'re looking for?',
    q2: 'What would you want a visitor to do when they land on your page?'
  };
  if (/social|content/.test(t)) return {
    q1: 'What kind of content are you posting and where does the engagement tend to stop?',
    q2: 'Have you had anyone reach out from your content before — and what happened?'
  };
  return {
    q1: 'What are you currently doing to get clients — and where do you think it\'s breaking down?',
    q2: 'What would consistent new enquiries actually change for your business right now?'
  };
}

function lcGenerateProof(t, niche) {
  const nicheLabel = niche && niche !== 'Business Owner' ? niche.toLowerCase() + ' businesses' : 'service businesses';
  if (/ads|paid/.test(t)) return [
    `Built for ${nicheLabel} running paid traffic`,
    'Average 3–5x improvement in enquiry conversion',
    'Conversion system live within 14 days',
    'Full pipeline tracking included'
  ];
  if (/cold|outreach/.test(t)) return [
    `Trusted by ${nicheLabel} doing outreach`,
    'Automated follow-up that runs without you',
    'Higher reply rates from warmer outreach',
    'System live within 14 days'
  ];
  if (/social|content/.test(t)) return [
    `Built for ${nicheLabel} with an active audience`,
    'Content to client pipeline — fully automated',
    'Consistent enquiries from existing followers',
    'Up and running within 14 days'
  ];
  return [
    `Built specifically for ${nicheLabel}`,
    'Consistent results within 14 days',
    'No retainer — you own the system',
    'Free 30-minute strategy call included'
  ];
}

function inferOffer(niche, text) {
  const t = text.toLowerCase();
  if (/ads|paid|ppc|facebook|google/.test(t))       return 'Lead generation system that converts traffic into bookings';
  if (/cold|outreach|dm|email/.test(t))              return 'Automated outreach system with follow-up sequence';
  if (/website|landing|traffic/.test(t))             return 'High-converting website and lead capture system';
  if (/social|content|instagram|tiktok/.test(t))    return 'Social media to lead pipeline system';
  if (/referral|word of mouth/.test(t))              return 'Multi-channel lead pipeline replacing referral dependency';
  if (/proposal|quote|follow.?up/.test(t))           return 'CRM and automated follow-up system';
  return niche + ' client acquisition system';
}

function generateBusinessName(niche) {
  const names = {
    'Plumber': 'Local Plumbing Co', 'Electrician': 'Local Electrical Co',
    'Builder': 'Local Build Co', 'PT / Fitness': 'Fitness Coaching',
    'Consultant': 'Growth Consulting', 'Marketing Agency': 'Digital Growth Agency',
    'SaaS / Tech': 'SaaS Growth', 'Cleaning Business': 'Clean Pro',
    'Landscaper': 'Green Landscapes', 'Accountant': 'Smart Accounting',
    'Solicitor': 'Legal Solutions', 'Designer': 'Creative Studio',
    'Photographer': 'Studio Photography', 'eCommerce': 'Online Store'
  };
  return names[niche] || niche + ' Business';
}

/* ── AI ASSIST LAYER ── */
async function enhanceWithAI(ctx, rawTitle) {
  try {
    const prompt = `You are refining a sales demo page for a service business prospect who posted on Reddit.

Their post: "${rawTitle}"

Detected context:
- Problem: ${ctx.problem}
- Stage: ${ctx.stage}
- Funnel gap: ${ctx.funnelGap}
- Emotion: ${ctx.emotion}

Return ONLY a JSON object with exactly these 3 fields — no other text:
{
  "headline": "A punchy, specific H1 for their situation. Start with 'When' and reference their exact problem. Under 14 words.",
  "subline": "One sentence explaining their situation and what changes. Specific, not generic. Under 25 words.",
  "dm": "A short personal first DM referencing their exact post. Human and direct, no buzzwords. Under 35 words."
}`;

    const res  = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();

    if (!data.ok) return null;

    // Confidence check — reject if any field is too short or suspiciously generic
    const score =
      (data.headline && data.headline.length > 20 ? 0.4 : 0) +
      (data.subline  && data.subline.length  > 20 ? 0.3 : 0) +
      (data.dm       && data.dm.length       > 20 ? 0.3 : 0);

    if (score < 0.6) return null; // fall back to rule engine — not confident enough
    return data;
  } catch { return null; }
}

async function buildFromLead(postId) {
  const d = window._feedData && window._feedData[postId];
  if (!d) { toast('Lead data not found — try re-fetching', 'err'); return; }
  logFeedAction('demosBuilt');
  const { post, a } = d;
  const title     = post.title  || '';
  const author    = post.author || 'unknown';
  const niche     = a.niche;
  const text      = post.text   || '';
  const demoFocus = a.demoFocus;
  const urgency   = a.urgency;

  // 1. Rule engine — fast, deterministic backbone
  const ctx   = extractLeadContext(title, text, niche);
  const offer = inferOffer(niche, text);
  const bizName = generateBusinessName(niche);

  // 2. AI refine — sharpens headline, subline, DM (silent fallback if no key / fails)
  toast('Analysing lead context…', 'ok');
  const ai = await enhanceWithAI(ctx, title);
  if (ai) {
    if (ai.headline) ctx.headline = ai.headline;
    if (ai.subline)  ctx.subtext  = ai.subline;
    if (ai.dm)       ctx.opener   = ai.dm;
  }

  // Detect lead type now we have full context
  const leadType = detectLeadType(title, text, post.subreddit || post.platform, ctx.urgency || 50);

  // Store lead metadata for analytics logging
  window._currentLeadMeta = {
    author,
    subreddit:  post.subreddit || '',
    postTitle:  title,
    postUrl:    post.url || '',
    niche,
    keyword:    window.activeFeedKw || '',
    aiUsed:     !!ai,
    leadType:   leadType.key
  };

  // Store rich context for buildLandingPage to consume
  window.currentLeadContext = {
    rawTitle:  title,
    author,
    demoFocus,
    aiUsed:    !!ai,
    ctx         // full structured context (possibly AI-refined)
  };

  // Pre-fill form from context engine
  document.getElementById('f-name').value     = bizName;
  document.getElementById('f-niche').value    = niche;
  document.getElementById('f-offer').value    = offer;
  document.getElementById('f-target').value   = 'Business owners ' + ctx.problem;
  document.getElementById('f-usp').value      = ctx.angle;
  document.getElementById('f-notes').value    = `Lead wrote: "${title}"\n\nProblem: ${ctx.problem}\nStage: ${ctx.stage}\nFunnel gap: ${ctx.funnelGap}\nEmotion: ${ctx.emotion}\nAngle: ${ctx.angle}`;
  document.getElementById('f-location').value = '';
  document.getElementById('f-goal').value     = 'leads';

  // Tone from urgency
  const tone = urgency >= 70 ? 'aggressive' : urgency >= 50 ? 'professional' : 'friendly';
  document.querySelectorAll('[data-tone]').forEach(b => b.classList.toggle('active', b.dataset.tone === tone));
  document.querySelectorAll('[data-stage]').forEach(b => b.classList.toggle('active', b.dataset.stage === 'growing'));
  document.querySelectorAll('[data-price]').forEach(b => b.classList.toggle('active', b.dataset.price === 'mid'));

  // Switch panel, scroll to top
  switchPanel('client');
  const formBody = document.querySelector('.form-body');
  if (formBody) formBody.scrollTop = 0;

  // Backup context for Edit Before Send regenerate
  window._lastLeadContext = { ...window.currentLeadContext };

  // Auto-generate then surface the edit panel + share link
  setTimeout(() => {
    document.getElementById('btn-generate').click();
    toast(`Building demo for ${niche} lead…`, 'ok');

    // After generate finishes — show edit panel + try to surface ngrok share URL
    setTimeout(async () => {
      showEditPanel(window._lastLeadContext, niche);

      try {
        const r = await fetch('http://localhost:4040/api/tunnels');
        const d = await r.json();
        const t = (d.tunnels || []).find(t => t.proto === 'https') || d.tunnels[0];
        if (t && t.public_url) {
          const lc      = window._lastLeadContext;
          const ctx     = lc && lc.ctx;
          const postUrl = post.url || '';
          const dm      = generateReadyDM(ctx, author, t.public_url, (window._currentLeadMeta||{}).leadType);
          // Auto-copy DM (more useful than just the URL)
          navigator.clipboard.writeText(dm).catch(() => {});
          showDemoShareBar(t.public_url, niche, dm, author, postUrl);
        }
      } catch { /* ngrok not running — silently skip */ }
    }, 1800);
  }, 200);
}

/* ── EDIT BEFORE SEND PANEL ── */
function showEditPanel(lc, niche) {
  const old = document.getElementById('edit-before-send');
  if (old) old.remove();

  const defaultHeadline = (lc && lc.ctx && lc.ctx.headline) || (lc && lc.angle) || '';
  const defaultCta      = lc && lc.demoFocus
    ? `I mocked up a ${lc.demoFocus} for this — want to see it?`
    : 'I built this based on your post — want to see it?';
  const defaultOpener   = (lc && lc.ctx && lc.ctx.opener) || (lc && lc.opener) || '';

  const panel = document.createElement('div');
  panel.id = 'edit-before-send';
  panel.innerHTML = `
    <div class="ebs-header">
      <span><i class="fas fa-pen" style="color:var(--accent)"></i> Edit Before Send</span>
      <button onclick="document.getElementById('edit-before-send').remove()" class="ebs-close">&times;</button>
    </div>
    <div class="ebs-fields">
      <div class="ebs-field">
        <label>Headline</label>
        <input id="ebs-headline" type="text" value="${defaultHeadline.replace(/"/g, '&quot;')}">
      </div>
      <div class="ebs-field">
        <label>CTA Button</label>
        <input id="ebs-cta" type="text" value="${defaultCta.replace(/"/g, '&quot;')}">
      </div>
      <div class="ebs-field">
        <label>Your Opening DM</label>
        <textarea id="ebs-opener" rows="3">${defaultOpener.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
      </div>
    </div>
    <button class="btn btn-primary btn-sm ebs-regen" onclick="regenerateWithEdits()">
      <i class="fas fa-rotate-right"></i> Regenerate with Edits
    </button>`;

  const previewWrap = document.querySelector('.preview-wrap');
  if (previewWrap) previewWrap.parentNode.insertBefore(panel, previewWrap);

  // Mobile: tap header to expand/collapse
  if (window.innerWidth <= 768) {
    const header = panel.querySelector('.ebs-header');
    if (header) header.addEventListener('click', () => panel.classList.toggle('expanded'));
  }
}

function regenerateWithEdits() {
  const lc = window._lastLeadContext;
  if (!lc) { toast('No lead context — fetch a lead first', 'err'); return; }

  const headline = document.getElementById('ebs-headline') ? document.getElementById('ebs-headline').value.trim() : '';
  const cta      = document.getElementById('ebs-cta')      ? document.getElementById('ebs-cta').value.trim()      : '';
  const openerEl = document.getElementById('ebs-opener');
  if (openerEl) lc.opener = openerEl.value.trim(); // update opener for outreach

  window.currentLeadContext = {
    ...lc,
    angle:      headline || lc.angle,
    forcedCta:  cta      || null,
    forcedCtaLow: cta ? 'Want to see how this would work for your specific situation?' : null
  };

  document.getElementById('btn-generate').click();
  toast('Regenerating with your edits…', 'ok');
}

/* ── OPENER PER LEAD TYPE ── */
function buildTypeOpener(typeKey, a, post) {
  if (typeKey === 'operator') {
    return `Noticed you're doing ${a.niche.toLowerCase()} work — I build the backend systems that agencies and freelancers white-label for their clients. Landing pages, CRM, follow-up sequences — all set up under your brand. Worth a look?`;
  }
  if (typeKey === 'partner') {
    return `Saw what you're building — I've put together a complete client acquisition stack that could sit as a layer on top of your platform. Integration, white-label, or distribution play. Worth a quick conversation?`;
  }
  return a.opener;
}

/* ── READY DM GENERATOR ── */
function generateReadyDM(ctx, author, demoUrl, leadType) {
  const opener  = (ctx && ctx.opener)  || 'Looks like a system gap more than anything else.';
  const problem = (ctx && ctx.problem) || 'getting consistent clients';
  const name    = author && author !== 'unknown' ? author : null;
  const greet   = name ? `Hey ${name} —` : 'Hey —';
  const lt      = leadType || 'direct';

  if (lt === 'operator') {
    return [
      greet,
      `Saw your post — looks like you're running client work in this space.`,
      '',
      `I build the backend systems that agencies and freelancers like you can offer their own clients — landing pages, CRM pipelines, follow-up sequences, outreach. All white-labeled to your brand.`,
      '',
      `Instead of building it yourself, you'd just be adding it to what you already deliver.`,
      '',
      `Put together a quick look at how it works:`,
      `→ ${demoUrl}`,
      '',
      `Worth 5 minutes?`
    ].join('\n');
  }

  if (lt === 'partner') {
    return [
      greet,
      `Came across what you're building — interesting.`,
      '',
      `I've built a full client acquisition system layer — landing pages, CRM, automated follow-up, outreach sequences. The kind of thing that could sit on top of your platform as an integration, white-label feature, or distribution channel.`,
      '',
      `Mocked up a quick look at what that would mean in practice:`,
      `→ ${demoUrl}`,
      '',
      `If there's a fit I'd want to talk properly. Worth 15 minutes?`
    ].join('\n');
  }

  return [
    greet,
    `Saw your post about ${problem}.`,
    '',
    opener,
    '',
    `I put together a quick preview based on what you said:`,
    `→ ${demoUrl}`,
    '',
    `Worth 2 minutes to look at?`
  ].join('\n');
}

/* ── ONE-CLICK SEND PACK — appears above preview after Build System ── */
function showDemoShareBar(url, niche, dm, author, postUrl) {
  const old = document.getElementById('demo-share-bar');
  if (old) old.remove();

  // Store for button callbacks
  window._currentDemoUrl = url;
  window._currentDemoDM  = dm  || '';
  window._currentPostUrl = postUrl || '';

  const safeNich = (niche || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const redditProfileUrl = author && author !== 'unknown'
    ? `https://reddit.com/user/${author}`
    : 'https://reddit.com';

  const bar = document.createElement('div');
  bar.id = 'demo-share-bar';
  bar.innerHTML = `
    <div class="dsb-header">
      <i class="fas fa-bolt" style="color:var(--accent)"></i>
      <span>Demo ready · <strong>${safeNich}</strong></span>
      <span class="dsb-copied-badge" id="dsb-copied">DM copied</span>
      <button onclick="document.getElementById('demo-share-bar').remove()" class="dsb-close">&times;</button>
    </div>
    <div class="dsb-actions">
      <button class="dsb-btn dsb-primary" onclick="copyDemoUrl()">
        <i class="fas fa-link"></i> Copy Link
      </button>
      <button class="dsb-btn dsb-primary" onclick="copyDemoDM()">
        <i class="fas fa-paper-plane"></i> Copy DM
      </button>
      <a class="dsb-btn dsb-secondary" href="${redditProfileUrl}" target="_blank" rel="noopener">
        <i class="fab fa-reddit-alien"></i> Profile
      </a>
      ${postUrl ? `<a class="dsb-btn dsb-secondary" href="${postUrl}" target="_blank" rel="noopener">
        <i class="fas fa-arrow-up-right-from-square"></i> Post
      </a>` : ''}
    </div>
    <div class="dsb-preview" id="dsb-dm-preview" onclick="copyDemoDM()" title="Click to copy">${(dm || '').replace(/\n/g, '<br>')}</div>`;

  const previewWrap = document.querySelector('.preview-wrap');
  if (previewWrap) previewWrap.parentNode.insertBefore(bar, previewWrap);

  // Flash "DM copied" badge then fade
  setTimeout(() => {
    const badge = document.getElementById('dsb-copied');
    if (badge) badge.style.opacity = '0';
  }, 2500);

  // Mobile: auto-scroll to send pack so it's immediately visible
  if (window.innerWidth <= 768) {
    setTimeout(() => {
      bar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

function copyDemoUrl() {
  const url = window._currentDemoUrl || '';
  if (!url) return;
  navigator.clipboard.writeText(url).then(() => toast('Link copied!', 'ok'));
}

function copyDemoDM() {
  const dm = window._currentDemoDM || '';
  if (!dm) return;
  navigator.clipboard.writeText(dm).then(() => {
    toast('DM copied — paste into Reddit', 'ok');
    logOutreachSent(dm);
  });
}

function logOutreachSent(dm) {
  const meta = window._currentLeadMeta || {};
  fetch(API + '/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      author:     meta.author    || 'unknown',
      subreddit:  meta.subreddit || '',
      postTitle:  meta.postTitle || '',
      postUrl:    meta.postUrl   || '',
      niche:      meta.niche     || '',
      keyword:    meta.keyword   || '',
      demoUrl:    window._currentDemoUrl || '',
      dmPreview:  dm.substring(0, 200),
      aiUsed:     meta.aiUsed   || false
    })
  }).catch(() => {});
}

function quickResearch(postId) {
  const d = window._feedData && window._feedData[postId];
  const author  = d ? d.post.author : 'unknown';
  const postUrl = d ? d.post.url    : '#';
  window.open(`https://reddit.com/user/${author}`, '_blank');
  window.open(`https://www.google.com/search?q=${encodeURIComponent(author + ' business')}`, '_blank');
}

async function saveFeedLead(postId) {
  const d = window._feedData && window._feedData[postId];
  if (!d) { toast('Lead data not found', 'err'); return; }
  const { post, a } = d;
  const author = post.author || 'unknown';
  const niche  = a.niche;
  const url    = post.url;
  const title  = post.title || '';
  const score  = a.urgency;
  try {
    await fetch(API + '/leads', {
      method: 'POST',
      body: JSON.stringify({
        name:     'u/' + author,
        business: niche + ' (Reddit)',
        status:   'new',
        score:    score,
        source:   url,
        notes:    title,
        niche:    niche
      })
    });
    // Visual feedback — grey out the saved card
    const card = document.getElementById('fc-' + postId);
    if (card) {
      card.style.opacity = '0.45';
      card.style.pointerEvents = 'none';
      const btn = card.querySelector('.btn');
      if (btn) btn.innerHTML = '<i class="fas fa-check"></i> Saved';
    }
    logFeedAction('saves');
    toast('Lead saved to CRM', 'ok');
  } catch { toast('Could not save lead', 'err'); }
}

/* ── INIT ── */
loadClients();

/* ── X SETUP ── */
function showXSetup() {
  const existing = document.getElementById('x-setup-modal');
  if (existing) { existing.style.display = 'flex'; return; }

  const modal = document.createElement('div');
  modal.id = 'x-setup-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:28px 24px;width:340px;display:flex;flex-direction:column;gap:14px">
      <div style="font-size:1rem;font-weight:700;color:var(--text);display:flex;align-items:center;gap:8px">
        <span style="font-size:1.2rem">𝕏</span> Connect X / Twitter
      </div>
      <div style="font-size:.78rem;color:var(--muted);line-height:1.5">
        X search requires a Bearer Token from the X Developer Portal.<br><br>
        1. Go to <a href="https://developer.twitter.com" target="_blank" style="color:var(--accent)">developer.twitter.com</a><br>
        2. Create a free developer account<br>
        3. Create an App → copy the Bearer Token<br><br>
        <strong style="color:var(--warn)">Note:</strong> Search requires the Basic plan ($100/mo). Free tier is write-only.
      </div>
      <input id="x-token-input" type="password" placeholder="Paste Bearer Token here..."
        style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:9px 12px;color:var(--text);font-size:.82rem;font-family:inherit;outline:none;width:100%">
      <div style="display:flex;gap:8px">
        <button onclick="saveXToken()" style="flex:1;background:var(--accent);border:none;border-radius:6px;color:#fff;padding:10px;cursor:pointer;font-family:inherit;font-weight:600">Save Token</button>
        <button onclick="document.getElementById('x-setup-modal').style.display='none'" style="background:transparent;border:1px solid var(--border);border-radius:6px;color:var(--muted);padding:10px 16px;cursor:pointer;font-family:inherit">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
}

async function saveXToken() {
  const token = document.getElementById('x-token-input').value.trim();
  if (!token) return;
  await fetch(API + '/config', { method: 'POST', body: JSON.stringify({ xBearerToken: token }) });
  document.getElementById('x-setup-modal').style.display = 'none';
  toast('𝕏 connected — fetch leads to see X results', 'ok');
}

/* ── SERPER SETUP — Google results inc. Facebook Groups, LinkedIn, Quora ── */
function showGoogleSetup() {
  if (document.getElementById('serper-setup-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'serper-setup-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:28px 24px;width:100%;max-width:400px;display:flex;flex-direction:column;gap:14px">
      <div style="font-size:1rem;font-weight:700;color:var(--text);display:flex;align-items:center;gap:8px">
        <span style="font-size:1.1rem">🔍</span> Connect Web Search
        <button onclick="document.getElementById('serper-setup-modal').remove()" style="margin-left:auto;background:none;border:none;color:var(--muted);cursor:pointer;font-size:1.2rem">×</button>
      </div>
      <div style="font-size:.78rem;color:var(--muted);line-height:1.6;background:rgba(255,255,255,.03);border-radius:8px;padding:12px">
        Searches <strong style="color:var(--text)">Facebook Groups, LinkedIn, Quora, forums</strong> via Google — anything publicly indexed.<br><br>
        <strong style="color:var(--text)">Free: 2,500 searches</strong> — no card needed to start.<br><br>
        1. Go to <a href="https://serper.dev" target="_blank" rel="noopener" style="color:var(--accent)">serper.dev</a> → Sign up free<br>
        2. Dashboard → copy your <strong style="color:var(--text)">API Key</strong><br>
        3. Paste it below and save
      </div>
      <div>
        <label style="font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:5px">Serper API Key</label>
        <input id="serper-api-key-input" type="password" placeholder="Paste your key here…" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:7px;padding:10px 12px;color:var(--text);font-size:.85rem;font-family:inherit;outline:none">
      </div>
      <div>
        <label style="font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:5px">Sites to search <span style="text-transform:none;letter-spacing:0;opacity:.6">(space-separated)</span></label>
        <input id="serper-sites-input" value="facebook.com/groups linkedin.com quora.com" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:7px;padding:10px 12px;color:var(--text);font-size:.85rem;font-family:inherit;outline:none">
      </div>
      <button onclick="saveSerperSetup()" style="background:var(--accent);color:#fff;border:none;border-radius:8px;padding:12px;font-size:.9rem;font-weight:700;cursor:pointer;transition:filter .15s" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter=''">Save & Activate</button>
    </div>`;
  document.body.appendChild(modal);
}

async function saveSerperSetup() {
  const key   = document.getElementById('serper-api-key-input').value.trim();
  const sites = document.getElementById('serper-sites-input').value.trim();
  if (!key) { toast('Paste your Serper API key first', 'err'); return; }
  await fetch(API + '/config', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serperApiKey: key, serperSearchSites: sites }) });
  document.getElementById('serper-setup-modal').remove();
  toast('Web search connected — Facebook & LinkedIn results enabled', 'ok');
}

/* ── AI SETUP MODAL ── */
function showAISetup() {
  const existing = document.getElementById('ai-setup-modal');
  if (existing) { existing.style.display = 'flex'; return; }

  const modal = document.createElement('div');
  modal.id = 'ai-setup-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:28px 24px;width:360px;display:flex;flex-direction:column;gap:14px">
      <div style="font-size:1rem;font-weight:700;color:var(--text);display:flex;align-items:center;gap:8px">
        <span style="color:var(--accent);font-size:1.1rem">⚡</span> Connect AI Assist
      </div>
      <div style="font-size:.78rem;color:var(--muted);line-height:1.6">
        AI Assist sharpens your headlines, sublines, and outreach DMs using Claude — so demos are send-ready without editing.<br><br>
        1. Go to <a href="https://console.anthropic.com" target="_blank" style="color:var(--accent)">console.anthropic.com</a><br>
        2. API Keys → Create Key<br>
        3. Paste it below<br><br>
        <span style="color:var(--accent);font-weight:600">Free to start</span> · ~$0.001 per lead refinement
      </div>
      <input id="ai-key-input" type="password" placeholder="sk-ant-..."
        style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:9px 12px;color:var(--text);font-size:.82rem;font-family:inherit;outline:none;width:100%">
      <div style="display:flex;gap:8px">
        <button onclick="saveAIKey()" style="flex:1;background:var(--accent);border:none;border-radius:6px;color:#fff;padding:10px;cursor:pointer;font-family:inherit;font-weight:600">Save Key</button>
        <button onclick="document.getElementById('ai-setup-modal').style.display='none'" style="background:transparent;border:1px solid var(--border);border-radius:6px;color:var(--muted);padding:10px 16px;cursor:pointer;font-family:inherit">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
}

async function saveAIKey() {
  const key = document.getElementById('ai-key-input').value.trim();
  if (!key) return;
  await fetch(API + '/config', { method: 'POST', body: JSON.stringify({ anthropicApiKey: key }) });
  document.getElementById('ai-setup-modal').style.display = 'none';
  updateAIStatus(true);
  toast('⚡ AI Assist connected — demos will now be AI-refined', 'ok');
}

let _aiEnabled = false;
async function checkAIStatus() {
  try {
    const cfg = await fetch(API + '/config').then(r => r.json());
    _aiEnabled = !!cfg.anthropicApiKey;
    updateAIStatus(_aiEnabled);
  } catch {}
}

function updateAIStatus(enabled) {
  _aiEnabled = enabled;
  const btn = document.getElementById('btn-ai-status');
  if (!btn) return;
  btn.textContent = enabled ? '⚡ AI On' : '⚡ AI Off';
  btn.style.color = enabled ? 'var(--accent)' : 'var(--muted)';
  btn.style.borderColor = enabled ? 'rgba(255,42,42,.4)' : 'var(--border)';
}

checkAIStatus();

/* ── MOBILE LINK ── */
/* ── Fetch ngrok URL (tries live tunnel first, falls back to saved static domain) ── */
async function getNgrokUrl() {
  // 1. Try live ngrok tunnel
  try {
    const res    = await fetch('http://localhost:4040/api/tunnels');
    const data   = await res.json();
    const tunnel = (data.tunnels || []).find(t => t.proto === 'https') || data.tunnels[0];
    if (tunnel && tunnel.public_url) return tunnel.public_url;
  } catch {}
  // 2. Fall back to saved static domain
  try {
    const cfg = await fetch(API + '/config').then(r => r.json());
    if (cfg.ngrokDomain) return cfg.ngrokDomain;
  } catch {}
  return null;
}

/* ── Persistent URL bar in topbar ── */
let _ngrokUrl = null;
async function detectNgrokAndShowBar() {
  const url = await getNgrokUrl();
  if (!url) return;
  _ngrokUrl = url;
  // Update phone button to show it's live
  const btn = document.getElementById('btn-mobile-link');
  if (btn) {
    btn.title = url;
    btn.style.color = 'var(--accent)';
    btn.style.borderColor = 'rgba(255,42,42,.4)';
  }
  // Show a small persistent URL strip under topbar
  let strip = document.getElementById('ngrok-strip');
  if (!strip) {
    strip = document.createElement('div');
    strip.id = 'ngrok-strip';
    strip.style.cssText = [
      'display:flex;align-items:center;gap:8px',
      'background:rgba(255,42,42,.08);border-bottom:1px solid rgba(255,42,42,.2)',
      'padding:5px 16px;font-size:.72rem;color:var(--muted)',
      'flex-shrink:0'
    ].join(';');
    document.getElementById('main').insertBefore(strip, document.getElementById('content'));
  }
  const short = url.replace('https://','');
  strip.innerHTML = `
    <i class="fas fa-signal" style="color:var(--accent);font-size:.7rem"></i>
    <span style="color:var(--accent);font-weight:600">Live:</span>
    <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${short}</span>
    <button onclick="copyNgrokUrl()" style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:.72rem;padding:2px 6px;border-radius:4px;border:1px solid rgba(255,42,42,.3)">Copy</button>
    <button onclick="showMobileLink()" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:.72rem;padding:2px 6px;border-radius:4px;border:1px solid var(--border)">QR</button>`;
}

function copyNgrokUrl() {
  if (!_ngrokUrl) return;
  navigator.clipboard.writeText(_ngrokUrl).then(() => toast('URL copied!', 'ok'));
}

async function showMobileLink() {
  const modal  = document.getElementById('mobile-modal');
  const status = document.getElementById('mobile-modal-status');
  const qrWrap = document.getElementById('mobile-qr-wrap');
  const input  = document.getElementById('mobile-url-input');

  modal.classList.add('open');
  status.textContent = 'Fetching tunnel URL...';
  qrWrap.innerHTML   = '';
  input.value        = '';

  const url = await getNgrokUrl();

  if (url) {
    _ngrokUrl    = url;
    input.value  = url;
    status.textContent = 'Scan with your iPhone camera:';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&margin=10`;
    const img   = document.createElement('img');
    img.src     = qrUrl;
    img.width   = 200; img.height = 200;
    img.style.borderRadius = '8px';
    qrWrap.appendChild(img);
  } else {
    status.textContent = '⚠ ngrok not running';
    qrWrap.innerHTML   = `
      <div style="font-size:.8rem;color:var(--muted);text-align:center;padding:12px;line-height:1.6">
        Start ngrok first:<br>
        <code style="color:var(--accent)">ngrok http 4000</code><br><br>
        Or save your static domain below:
      </div>
      <div style="display:flex;gap:6px;width:100%">
        <input id="static-domain-input" placeholder="https://your-domain.ngrok-free.app"
          style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:7px 10px;color:var(--text);font-size:.75rem;font-family:inherit;outline:none">
        <button onclick="saveStaticDomain()" style="background:var(--accent);border:none;border-radius:6px;color:#fff;padding:7px 12px;cursor:pointer;font-size:.78rem;font-weight:600">Save</button>
      </div>`;
  }
}

async function saveStaticDomain() {
  const input = document.getElementById('static-domain-input');
  if (!input || !input.value.trim()) return;
  const domain = input.value.trim();
  await fetch(API + '/config', { method: 'POST', body: JSON.stringify({ ngrokDomain: domain }) });
  _ngrokUrl = domain;
  document.getElementById('mobile-modal-status').textContent = 'Saved — scan below:';
  const qrWrap = document.getElementById('mobile-qr-wrap');
  const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(domain)}&bgcolor=ffffff&color=000000&margin=10`;
  const img    = document.createElement('img');
  img.src = qrUrl; img.width = 200; img.height = 200; img.style.borderRadius = '8px';
  qrWrap.innerHTML = '';
  qrWrap.appendChild(img);
  document.getElementById('mobile-url-input').value = domain;
  detectNgrokAndShowBar();
  toast('Static domain saved', 'ok');
}

function closeMobileModal() {
  document.getElementById('mobile-modal').classList.remove('open');
}

function copyMobileUrl() {
  const input = document.getElementById('mobile-url-input');
  if (!input.value) return;
  navigator.clipboard.writeText(input.value).then(() => toast('Link copied!', 'ok'));
}

// Auto-detect ngrok on load
detectNgrokAndShowBar();

/* ── LEAD TYPE FILTER ── */
function filterLeadType(type) {
  document.querySelectorAll('.ltf-btn').forEach(b => b.classList.toggle('active', b.dataset.type === type));
  document.querySelectorAll('.feed-card').forEach(card => {
    card.style.display = (type === 'all' || card.dataset.leadType === type) ? '' : 'none';
  });
}

/* ══════════════════════════════════
   ANALYTICS
══════════════════════════════════ */

async function loadAnalytics() {
  const body = document.getElementById('an-body');
  if (!body) return;
  body.innerHTML = '<div class="an-loading"><i class="fas fa-spinner fa-spin"></i> Loading…</div>';
  let outreachRows = [];
  try {
    const data = await fetch(API + '/analytics').then(r => r.json());
    outreachRows = data.outreach || [];
  } catch { /* server may be down — still show feed stats */ }
  renderAnalytics(outreachRows);
}

function renderAnalytics(rows) {
  const body = document.getElementById('an-body');
  if (!body) return;

  const fa = getFeedActivity();
  const hotLeads = getHotLeads();
  const weakLeads = getWeakLeads();
  const hasActivity = fa.scans.length > 0 || rows.length > 0;

  if (!hasActivity) {
    body.innerHTML = `<div class="an-empty"><i class="fas fa-chart-bar"></i><p>No data yet — scan the Lead Feed to start building analytics</p></div>`;
    return;
  }

  // ── FEED ACTIVITY STATS ──
  const totalScans = fa.scans.length;
  const totalLeads = fa.totalLeadsFound;
  const act = fa.actions;
  const avgPerScan = totalScans ? Math.round(totalLeads / totalScans) : 0;

  // Top keywords by leads found
  const kwEntries = Object.entries(fa.topKeywords).sort((a,b) => b[1] - a[1]).slice(0, 6);
  const maxKwLeads = Math.max(...kwEntries.map(x => x[1]), 1);

  // Top niches by leads found
  const nicheEntries = Object.entries(fa.topNiches).sort((a,b) => b[1] - a[1]).slice(0, 6);
  const maxNicheLeads = Math.max(...nicheEntries.map(x => x[1]), 1);

  // Top subreddits by leads found
  const subEntries = Object.entries(fa.topSubreddits).sort((a,b) => b[1] - a[1]).slice(0, 6);
  const maxSubLeads = Math.max(...subEntries.map(x => x[1]), 1);

  function countBar(label, val, max, color) {
    const pct = Math.round((val / max) * 100);
    return `<div class="an-bar-row">
      <span class="an-bar-label">${label}</span>
      <div class="an-bar-track"><div class="an-bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <span class="an-bar-stat"><em>${val}</em></span>
    </div>`;
  }

  // Recent scan timeline (last 10)
  const recentScans = fa.scans.slice(-10).reverse();
  const scanTimelineHTML = recentScans.length ? recentScans.map(s => {
    const ago = timeAgo(s.ts);
    const leadsColor = s.leadsFound >= 5 ? 'var(--success)' : s.leadsFound >= 2 ? '#f59e0b' : 'var(--muted)';
    return `<div class="an-scan-row">
      <span class="an-scan-kw">"${esc(s.keyword)}"</span>
      <span class="an-scan-leads" style="color:${leadsColor}">${s.leadsFound} leads</span>
      <span class="an-scan-time">${ago}</span>
    </div>`;
  }).join('') : '<div class="an-chart-empty">No scans yet</div>';

  // ── FEED ACTIVITY HTML ──
  const feedHTML = `
    <div class="an-section-label"><i class="fas fa-rss"></i> Feed Activity</div>
    <div class="an-stats-row an-stats-6">
      <div class="an-stat"><div class="an-stat-val">${totalScans}</div><div class="an-stat-label">Scans</div></div>
      <div class="an-stat"><div class="an-stat-val" style="color:var(--accent)">${totalLeads}</div><div class="an-stat-label">Leads Found</div></div>
      <div class="an-stat"><div class="an-stat-val" style="color:#eab308">${fa.highIntentCount}</div><div class="an-stat-label">High Intent</div></div>
      <div class="an-stat"><div class="an-stat-val" style="color:#ef4444">${fa.criticalCount}</div><div class="an-stat-label">Critical</div></div>
      <div class="an-stat"><div class="an-stat-val">${avgPerScan}</div><div class="an-stat-label">Avg / Scan</div></div>
      <div class="an-stat"><div class="an-stat-val">${fa.avgScore}</div><div class="an-stat-label">Avg Score</div></div>
    </div>

    <div class="an-stats-row an-stats-6">
      <div class="an-stat"><div class="an-stat-val">${act.copies + act.intelCopies}</div><div class="an-stat-label">Copied</div></div>
      <div class="an-stat"><div class="an-stat-val" style="color:#eab308">${hotLeads.length}</div><div class="an-stat-label">⭐ Hot</div></div>
      <div class="an-stat"><div class="an-stat-val" style="color:#ef4444">${Math.floor(weakLeads.length / 2)}</div><div class="an-stat-label">Weak</div></div>
      <div class="an-stat"><div class="an-stat-val" style="color:var(--success)">${act.saves}</div><div class="an-stat-label">Saved to CRM</div></div>
      <div class="an-stat"><div class="an-stat-val" style="color:var(--accent)">${act.demosBuilt}</div><div class="an-stat-label">Demos Built</div></div>
      <div class="an-stat"><div class="an-stat-val">${act.intelCopies}</div><div class="an-stat-label">Intel Copies</div></div>
    </div>

    <div class="an-charts">
      <div class="an-chart-block">
        <div class="an-chart-title">Top Keywords (by leads)</div>
        ${kwEntries.length ? kwEntries.map(([k,v]) => countBar('"'+k+'"', v, maxKwLeads, 'var(--accent)')).join('') : '<div class="an-chart-empty">Scan more keywords</div>'}
      </div>
      <div class="an-chart-block">
        <div class="an-chart-title">Top Niches Detected</div>
        ${nicheEntries.length ? nicheEntries.map(([k,v]) => countBar(k, v, maxNicheLeads, '#f59e0b')).join('') : '<div class="an-chart-empty">Scan more to detect</div>'}
      </div>
      <div class="an-chart-block">
        <div class="an-chart-title">Top Sources</div>
        ${subEntries.length ? subEntries.map(([k,v]) => countBar(k.startsWith('r') ? k : 'r/'+k, v, maxSubLeads, 'var(--success)')).join('') : '<div class="an-chart-empty">Scan more to detect</div>'}
      </div>
    </div>

    <div class="an-chart-block an-scan-timeline">
      <div class="an-chart-title">Recent Scans</div>
      ${scanTimelineHTML}
    </div>
  `;

  // ── OUTREACH STATS (only if there are rows) ──
  let outreachHTML = '';
  if (rows.length) {
    const total     = rows.length;
    const replied   = rows.filter(r => ['replied','interested','booked','closed'].includes(r.status)).length;
    const booked    = rows.filter(r => ['booked','closed'].includes(r.status)).length;
    const replyRate = total ? Math.round((replied / total) * 100) : 0;
    const bookRate  = total ? Math.round((booked  / total) * 100) : 0;

    const subMap = {};
    rows.forEach(r => {
      const s = r.subreddit || 'unknown';
      if (!subMap[s]) subMap[s] = { sent: 0, replied: 0 };
      subMap[s].sent++;
      if (['replied','interested','booked','closed'].includes(r.status)) subMap[s].replied++;
    });
    const subLeader = Object.entries(subMap)
      .map(([k, v]) => ({ label: 'r/' + k, sent: v.sent, replied: v.replied, rate: v.sent ? Math.round((v.replied / v.sent) * 100) : 0 }))
      .sort((a, b) => b.rate - a.rate).slice(0, 5);

    const nicheMap = {};
    rows.forEach(r => {
      const n = r.niche || 'unknown';
      if (!nicheMap[n]) nicheMap[n] = { sent: 0, replied: 0 };
      nicheMap[n].sent++;
      if (['replied','interested','booked','closed'].includes(r.status)) nicheMap[n].replied++;
    });
    const nicheLeader = Object.entries(nicheMap)
      .map(([k, v]) => ({ label: k, sent: v.sent, replied: v.replied, rate: v.sent ? Math.round((v.replied / v.sent) * 100) : 0 }))
      .sort((a, b) => b.rate - a.rate).slice(0, 5);

    const kwMap = {};
    rows.forEach(r => {
      const k = r.keyword || 'unknown';
      if (!kwMap[k]) kwMap[k] = { sent: 0, replied: 0 };
      kwMap[k].sent++;
      if (['replied','interested','booked','closed'].includes(r.status)) kwMap[k].replied++;
    });
    const kwLeader = Object.entries(kwMap)
      .map(([k, v]) => ({ label: '"' + k + '"', sent: v.sent, replied: v.replied, rate: v.sent ? Math.round((v.replied / v.sent) * 100) : 0 }))
      .sort((a, b) => b.rate - a.rate).slice(0, 5);

    const maxSubRate   = Math.max(...subLeader.map(x => x.rate), 1);
    const maxNicheRate = Math.max(...nicheLeader.map(x => x.rate), 1);
    const maxKwRate    = Math.max(...kwLeader.map(x => x.rate), 1);

    function barRow(item, max) {
      const pct = Math.round((item.rate / max) * 100);
      const color = item.rate >= 30 ? 'var(--success)' : item.rate >= 15 ? 'var(--accent)' : 'rgba(255,255,255,.25)';
      return `<div class="an-bar-row">
        <span class="an-bar-label">${item.label}</span>
        <div class="an-bar-track"><div class="an-bar-fill" style="width:${pct}%;background:${color}"></div></div>
        <span class="an-bar-stat">${item.replied}/${item.sent} <em>${item.rate}%</em></span>
      </div>`;
    }

    const STATUS_LABELS = { sent:'Sent', replied:'Replied', interested:'Interested', booked:'Booked', closed:'Closed', ghosted:'Ghosted' };
    const STATUS_COLOR  = { sent:'var(--muted)', replied:'var(--accent)', interested:'#f59e0b', booked:'var(--success)', closed:'#22c55e', ghosted:'rgba(255,255,255,.2)' };

    function statusBadge(s) {
      return `<span class="an-status" style="background:${STATUS_COLOR[s]||'var(--muted)'}20;color:${STATUS_COLOR[s]||'var(--muted)'};">${STATUS_LABELS[s]||s}</span>`;
    }

    function statusBtns(id, current) {
      return ['replied','booked','closed','ghosted'].map(s =>
        `<button class="an-status-btn${current===s?' active':''}" onclick="updateOutreachStatus(${id},'${s}')" style="--sc:${STATUS_COLOR[s]}">${STATUS_LABELS[s]}</button>`
      ).join('');
    }

    const logHTML = rows.slice(0, 60).map(r => `
      <div class="an-log-row" id="an-row-${r.id}">
        <div class="an-log-main">
          <div class="an-log-who">
            <span class="an-log-author">@${esc(r.author)}</span>
            ${r.subreddit ? `<span class="an-log-sub">r/${esc(r.subreddit)}</span>` : ''}
            ${r.niche     ? `<span class="an-log-niche">${esc(r.niche)}</span>` : ''}
          </div>
          <div class="an-log-title">${esc((r.postTitle||'').substring(0,80))}${(r.postTitle||'').length>80?'…':''}</div>
          <div class="an-log-meta">
            ${new Date(r.timestamp).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
            ${r.keyword ? ` · <em>${esc(r.keyword)}</em>` : ''}
            ${r.demoUrl  ? ` · <a href="${esc(r.demoUrl)}" target="_blank" rel="noopener" style="color:var(--accent)">Demo ↗</a>` : ''}
            ${r.postUrl  ? ` · <a href="${esc(r.postUrl)}"  target="_blank" rel="noopener" style="color:var(--muted)">Post ↗</a>` : ''}
          </div>
        </div>
        <div class="an-log-right">
          ${statusBadge(r.status)}
          <div class="an-log-actions">${statusBtns(r.id, r.status)}</div>
          <textarea class="an-note" placeholder="Notes…" onblur="saveOutreachNote(${r.id},this.value)">${esc(r.notes||'')}</textarea>
        </div>
      </div>`).join('');

    outreachHTML = `
      <div class="an-section-label"><i class="fas fa-paper-plane"></i> Outreach Performance</div>
      <div class="an-stats-row">
        <div class="an-stat"><div class="an-stat-val">${total}</div><div class="an-stat-label">DMs Sent</div></div>
        <div class="an-stat"><div class="an-stat-val" style="color:var(--accent)">${replied}</div><div class="an-stat-label">Replied · ${replyRate}%</div></div>
        <div class="an-stat"><div class="an-stat-val" style="color:var(--success)">${booked}</div><div class="an-stat-label">Booked · ${bookRate}%</div></div>
        <div class="an-stat"><div class="an-stat-val" style="color:#f59e0b">${rows.filter(r=>r.status==='interested').length}</div><div class="an-stat-label">Interested</div></div>
      </div>

      <div class="an-charts">
        <div class="an-chart-block">
          <div class="an-chart-title">Subreddit Reply Rate</div>
          ${subLeader.length ? subLeader.map(x => barRow(x, maxSubRate)).join('') : '<div class="an-chart-empty">Not enough data yet</div>'}
        </div>
        <div class="an-chart-block">
          <div class="an-chart-title">Niche Reply Rate</div>
          ${nicheLeader.length ? nicheLeader.map(x => barRow(x, maxNicheRate)).join('') : '<div class="an-chart-empty">Not enough data yet</div>'}
        </div>
        <div class="an-chart-block">
          <div class="an-chart-title">Keyword Reply Rate</div>
          ${kwLeader.length ? kwLeader.map(x => barRow(x, maxKwRate)).join('') : '<div class="an-chart-empty">Not enough data yet</div>'}
        </div>
      </div>

      <div class="an-log-header">
        <span>Outreach Log <em style="color:var(--muted);font-size:.75rem;font-weight:400">(${total} total)</em></span>
      </div>
      <div class="an-log">${logHTML}</div>
    `;
  } else {
    outreachHTML = `
      <div class="an-section-label"><i class="fas fa-paper-plane"></i> Outreach Performance</div>
      <div class="an-outreach-empty">
        <p>No DMs sent yet — build a demo from the Lead Feed and copy the message to start tracking outreach performance here.</p>
      </div>
    `;
  }

  // ── CLEAR BUTTON ──
  const clearBtn = `<div class="an-clear-wrap"><button class="btn btn-secondary btn-sm" onclick="if(confirm('Clear all feed activity data?')){localStorage.removeItem('feedActivity');loadAnalytics();}"><i class="fas fa-trash"></i> Reset Feed Stats</button></div>`;

  body.innerHTML = feedHTML + outreachHTML + clearBtn;
}

function updateOutreachStatus(id, status) {
  fetch(API + '/analytics', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status })
  }).then(() => {
    // Update the row UI without full reload
    const row = document.getElementById('an-row-' + id);
    if (!row) return loadAnalytics();
    const badge = row.querySelector('.an-status');
    const STATUS_LABELS = { sent:'Sent', replied:'Replied', interested:'Interested', booked:'Booked', closed:'Closed', ghosted:'Ghosted' };
    const STATUS_COLOR  = { sent:'var(--muted)', replied:'var(--accent)', interested:'#f59e0b', booked:'var(--success)', closed:'#22c55e', ghosted:'rgba(255,255,255,.2)' };
    if (badge) { badge.textContent = STATUS_LABELS[status]||status; badge.style.background = (STATUS_COLOR[status]||'var(--muted)')+'20'; badge.style.color = STATUS_COLOR[status]||'var(--muted)'; }
    row.querySelectorAll('.an-status-btn').forEach(b => b.classList.toggle('active', b.textContent.toLowerCase() === (STATUS_LABELS[status]||status).toLowerCase()));
    toast(STATUS_LABELS[status] + ' marked', 'ok');
  }).catch(() => toast('Failed to update', 'err'));
}

function saveOutreachNote(id, notes) {
  fetch(API + '/analytics', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, notes })
  }).catch(() => {});
}
