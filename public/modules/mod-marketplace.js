({
  init() {},
  render(container) {
    let integrations = [];
    try { integrations = JSON.parse(localStorage.getItem('marketplaceIntegrations') || '[]'); } catch {}
    const AVAILABLE = [
      { name:'Calendly', icon:'fa-calendar-check', desc:'Auto-sync bookings to CRM', status:'available' },
      { name:'Stripe', icon:'fa-credit-card', desc:'Payment processing + revenue tracking', status:'available' },
      { name:'Zapier', icon:'fa-bolt', desc:'Connect 5000+ apps via webhooks', status:'available' },
      { name:'Make (Integromat)', icon:'fa-diagram-project', desc:'Advanced workflow automation', status:'available' },
      { name:'Notion', icon:'fa-book', desc:'Sync client data to Notion databases', status:'available' },
      { name:'Slack', icon:'fa-slack', desc:'Lead alerts + team notifications', status:'available' },
      { name:'Gmail / SMTP', icon:'fa-envelope', desc:'Direct email sending integration', status:'available' },
      { name:'Airtable', icon:'fa-table', desc:'Advanced CRM database', status:'coming' },
      { name:'GoHighLevel', icon:'fa-rocket', desc:'Full CRM + marketing sync', status:'coming' },
    ];
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${integrations.length}</div><div class="mod-stat-label">Connected</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${AVAILABLE.filter(a=>a.status==='available').length}</div><div class="mod-stat-label">Available</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--muted)">${AVAILABLE.filter(a=>a.status==='coming').length}</div><div class="mod-stat-label">Coming Soon</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-plug"></i> Integration Marketplace</div>
        ${AVAILABLE.map(a=>`
          <div class="mod-list-item" style="display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;align-items:center;gap:12px">
              <i class="fas ${a.icon}" style="font-size:1.2rem;width:24px;color:${a.status==='coming'?'var(--muted)':'var(--text)'}"></i>
              <div>
                <div style="font-weight:600;${a.status==='coming'?'color:var(--muted)':''}">${a.name}</div>
                <div class="mod-muted" style="font-size:.72rem">${a.desc}</div>
              </div>
            </div>
            ${a.status==='coming'
              ? '<span class="mod-badge badge-muted">Coming Soon</span>'
              : `<button class="mod-btn mod-btn-sm" onclick="(function(){
                  let arr=JSON.parse(localStorage.getItem('marketplaceIntegrations')||'[]');
                  if(!arr.find(x=>x.name==='${a.name}')){arr.push({name:'${a.name}',connectedAt:new Date().toISOString()});}
                  localStorage.setItem('marketplaceIntegrations',JSON.stringify(arr));
                  toast('${a.name} marked as connected','ok');
                })()"><i class="fas fa-link"></i> Connect</button>`}
          </div>`).join('')}
      </div>`;
  }
})