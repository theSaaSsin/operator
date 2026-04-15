({
  init() {},
  async render(container) {
    let plans = [];
    try { plans = JSON.parse(localStorage.getItem('billingPlans') || '[]'); } catch {}
    let subscribers = [];
    try { subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]'); } catch {}
    let settings = {};
    try { settings = ((await fetch('/api/module-settings').then(r => r.json())).settings || {})['67'] || {}; } catch {}
    const clients = await fetch('/api/clients').then(r => r.json()).catch(() => []);

    const mrr = subscribers.filter(s => s.status === 'active').reduce((sum, s) => {
      const plan = plans.find(p => p.name === s.plan);
      return sum + (plan ? parseFloat(plan.price) || 0 : 0);
    }, 0);
    const activeSubscribers = subscribers.filter(s => s.status === 'active').length;

    if (!plans.length) {
      plans = [
        { name: 'Starter', price: '97', interval: 'month', modules: '10', features: 'Lead feed, CRM, Outreach, Analytics' },
        { name: 'Growth', price: '197', interval: 'month', modules: '30', features: 'All Starter + Sales, Content, Automation' },
        { name: 'Enterprise', price: '497', interval: 'month', modules: '70', features: 'Full platform access + White-label + API' }
      ];
      localStorage.setItem('billingPlans', JSON.stringify(plans));
    }

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">$${mrr.toLocaleString()}</div><div class="mod-stat-label">MRR</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${activeSubscribers}</div><div class="mod-stat-label">Active Subscribers</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${subscribers.length}</div><div class="mod-stat-label">Total Subscribers</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${plans.length}</div><div class="mod-stat-label">Plans</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Stripe Integration</div>
        <div class="mod-card">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Stripe Webhook Secret</label>
              <input type="password" id="bl-stripe-secret" value="${settings.stripeSecret || ''}" placeholder="whsec_..." style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Stripe Publishable Key</label>
              <input type="text" id="bl-stripe-pub" value="${settings.stripePub || ''}" placeholder="pk_..." style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="btn btn-primary btn-sm" onclick="_saveStripeSettings()"><i class="fas fa-save"></i> Save</button>
            <span style="font-size:.7rem;color:var(--muted)">Webhook URL: <code>${location.origin}/api/webhook</code></span>
          </div>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Pricing Plans (${plans.length})</div>
        <div style="display:grid;grid-template-columns:repeat(${Math.min(plans.length, 3)},1fr);gap:10px">
          ${plans.map((p, i) => `
            <div class="mod-card" style="text-align:center;border:1px solid ${i === 1 ? 'var(--accent)' : 'var(--border)'}">
              ${i === 1 ? '<div style="font-size:.65rem;font-weight:700;color:var(--accent);margin-bottom:6px;text-transform:uppercase">Most Popular</div>' : ''}
              <div style="font-size:1rem;font-weight:700;color:var(--text)">${p.name}</div>
              <div style="font-size:1.6rem;font-weight:800;color:#22c55e;margin:8px 0">$${p.price}<span style="font-size:.7rem;font-weight:400;color:var(--muted)">/${p.interval}</span></div>
              <div style="font-size:.72rem;color:var(--muted);margin-bottom:8px">${p.modules} modules included</div>
              <div style="font-size:.72rem;color:var(--text);text-align:left;line-height:1.6">${(p.features || '').split(',').map(f => `<div><i class="fas fa-check" style="color:#22c55e;font-size:.6rem;margin-right:4px"></i>${f.trim()}</div>`).join('')}</div>
              <div style="margin-top:8px;display:flex;gap:4px;justify-content:center">
                <button class="btn btn-secondary btn-sm" onclick="_editPlan(${i})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="_deletePlan(${i})" style="color:#ef4444"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:8px">
          <button class="btn btn-secondary btn-sm" onclick="_addPlan()"><i class="fas fa-plus"></i> Add Plan</button>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Subscribers (${subscribers.length})</div>
        ${subscribers.length ? `<table class="mod-table"><thead><tr><th>Client</th><th>Plan</th><th>Status</th><th>Since</th><th></th></tr></thead><tbody>
          ${subscribers.map((s, i) => `<tr>
            <td><strong>${s.client}</strong></td>
            <td>${s.plan}</td>
            <td style="color:${s.status === 'active' ? '#22c55e' : s.status === 'cancelled' ? '#ef4444' : '#f59e0b'}">${s.status}</td>
            <td style="font-size:.72rem;color:var(--muted)">${s.since ? new Date(s.since).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'}</td>
            <td><button class="btn btn-secondary btn-sm" onclick="_removeSub(${i})" style="font-size:.6rem;color:#ef4444"><i class="fas fa-trash"></i></button></td>
          </tr>`).join('')}
        </tbody></table>` : `<div class="mod-card">
          <p style="font-size:.75rem;color:var(--muted);margin-bottom:8px">Add a subscriber manually:</p>
          <div style="display:flex;gap:8px;align-items:flex-end">
            <select id="bl-sub-client" style="flex:1;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
              ${clients.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
            </select>
            <select id="bl-sub-plan" style="flex:1;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
              ${plans.map(p => `<option value="${p.name}">${p.name} ($${p.price})</option>`).join('')}
            </select>
            <button class="btn btn-primary btn-sm" onclick="_addSubscriber()"><i class="fas fa-plus"></i></button>
          </div>
        </div>`}
      </div>`;

    window._saveStripeSettings = async function() {
      await fetch('/api/module-settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 67, settings: { stripeSecret: document.getElementById('bl-stripe-secret').value.trim(), stripePub: document.getElementById('bl-stripe-pub').value.trim() } }) });
      toast('Stripe settings saved', 'ok');
    };
    window._addPlan = function() {
      const name = prompt('Plan name:');
      if (!name) return;
      const price = prompt('Monthly price ($):') || '0';
      plans.push({ name, price, interval: 'month', modules: '10', features: 'Basic features' });
      localStorage.setItem('billingPlans', JSON.stringify(plans));
      refreshCurrentModule();
    };
    window._editPlan = function(i) {
      const p = plans[i];
      const price = prompt('Price ($):', p.price);
      if (price !== null) p.price = price;
      const features = prompt('Features (comma-separated):', p.features);
      if (features !== null) p.features = features;
      localStorage.setItem('billingPlans', JSON.stringify(plans));
      refreshCurrentModule();
    };
    window._deletePlan = function(i) { plans.splice(i, 1); localStorage.setItem('billingPlans', JSON.stringify(plans)); toast('Deleted', 'ok'); refreshCurrentModule(); };
    window._addSubscriber = function() {
      const client = document.getElementById('bl-sub-client')?.value;
      const plan = document.getElementById('bl-sub-plan')?.value;
      if (!client || !plan) return toast('Select client and plan', 'err');
      subscribers.push({ client, plan, status: 'active', since: new Date().toISOString() });
      localStorage.setItem('subscribers', JSON.stringify(subscribers));
      toast('Subscriber added', 'ok');
      refreshCurrentModule();
    };
    window._removeSub = function(i) { subscribers.splice(i, 1); localStorage.setItem('subscribers', JSON.stringify(subscribers)); toast('Removed', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 67 — Subscription / Billing</p>
      <p style="font-size:.75rem;color:var(--muted)">Stripe integration for subscription billing. Define plan tiers, manage subscribers, and track MRR.</p>`;
  }
})
