({
  init() {},
  render(container) {
    const getSize = (key) => {
      try { const d=localStorage.getItem(key)||''; return (new Blob([d]).size/1024).toFixed(1)+'kb'; } catch { return '0kb'; }
    };
    const STORES = ['clients','leads','outreach','modules','feedActivity','proposals','offers','funnels','callScripts','pricingTiers','supportTickets','deals','localLeads','competitorTargets','onboardings'];
    container.innerHTML = `
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-database"></i> Data Store Overview</div>
        <div class="mod-stat-row" style="flex-wrap:wrap">
          ${STORES.map(s=>`<div class="mod-stat" style="min-width:120px"><div class="mod-stat-val" style="font-size:.85rem">${getSize(s)}</div><div class="mod-stat-label">${s}</div></div>`).join('')}
        </div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-download"></i> Export All Data</div>
        <div class="mod-info-box"><i class="fas fa-info-circle"></i> Export all operator data as a single JSON backup file. Import it back anytime to restore your state.</div>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <button class="mod-btn" onclick="(function(){
            const data={};
            ['clients','leads','outreach','modules','feedActivity','proposals','offers','funnels','callScripts','pricingTiers','supportTickets','deals','localLeads','competitorTargets','onboardings','profileDrafts','longFormContent','shortFormScripts','proofItems','outreachTemplates'].forEach(k=>{
              try{data[k]=JSON.parse(localStorage.getItem(k)||'null');}catch{}
            });
            data._exportedAt=new Date().toISOString();
            const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
            const a=document.createElement('a');a.href=URL.createObjectURL(blob);
            a.download='operator-backup-'+new Date().toISOString().slice(0,10)+'.json';
            a.click();toast('Data exported!','ok');
          })()"><i class="fas fa-download"></i> Export Backup</button>
          <button class="mod-btn" onclick="document.getElementById('ds-import').click()"><i class="fas fa-upload"></i> Import Backup</button>
          <input id="ds-import" type="file" accept=".json" style="display:none" onchange="(function(e){
            const f=e.target.files[0];if(!f)return;
            const r=new FileReader();r.onload=ev=>{
              try{
                const data=JSON.parse(ev.target.result);
                Object.entries(data).forEach(([k,v])=>{if(k!=='_exportedAt'&&v!==null)localStorage.setItem(k,JSON.stringify(v));});
                toast('Data imported — refresh to see changes','ok');
              }catch{toast('Invalid backup file','err');}
            };r.readAsText(f);
          })(event)"/>
          <button class="mod-btn mod-btn-danger" onclick="if(confirm('Clear ALL local data? This cannot be undone.')){localStorage.clear();toast('All local data cleared','ok');}"><i class="fas fa-trash"></i> Clear All</button>
        </div>
      </div>`;
  }
})