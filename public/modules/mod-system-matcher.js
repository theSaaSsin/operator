({
  init() {},
  async render(container) {
    const SYSTEMS = [
      { name:'Lead Acquisition System', triggers:['no clients','getting clients','need clients','find customers'], output:'Reddit scraper + outreach queue + follow-up sequence' },
      { name:'Social Media Growth System', triggers:['grow following','more followers','social media','no engagement'], output:'Content scheduler + post generator + engagement tracker' },
      { name:'Sales Funnel System', triggers:['no conversions','low sales','people don\'t buy','landing page not converting'], output:'Funnel builder + offer generator + close tracking' },
      { name:'Client Delivery System', triggers:['client management','onboarding','deliver results','client retention'], output:'Client dashboard + progress tracker + support system' },
      { name:'Content Machine', triggers:['content ideas','what to post','content strategy','no content'], output:'Content idea generator + short/long form + scheduler' },
      { name:'Agency Scale System', triggers:['hire team','multiple clients','agency','scale'], output:'Team system + reseller dashboard + white-label + partner management' },
      { name:'Revenue Tracking System', triggers:['track revenue','sales numbers','how much','MRR'], output:'Revenue tracker + billing system + affiliate dashboard' },
    ];
    container.innerHTML = `
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-puzzle-piece"></i> System Matcher — Problem → Solution</div>
        <div class="mod-info-box"><i class="fas fa-lightbulb"></i> Describe the client's problem below and the matcher will recommend the right system to build for them.</div>
        <div class="mod-form-grid" style="margin-top:12px">
          <div class="mod-field mod-field-full"><label>Client's Problem / Pain</label>
            <input id="sm-problem" class="mod-input" placeholder="e.g. I can't get clients, my social media isn't growing, no one buys my offer…"/>
          </div>
        </div>
        <button class="mod-btn" style="margin-top:8px" onclick="(function(){
          const prob=document.getElementById('sm-problem').value.toLowerCase().trim();
          if(!prob){toast('Enter a problem','err');return;}
          const SYSTEMS=${JSON.stringify(SYSTEMS)};
          const matches=SYSTEMS.filter(s=>s.triggers.some(t=>prob.includes(t)));
          const out=document.getElementById('sm-results');
          if(!matches.length){
            out.innerHTML='<div class=mod-empty><i class=fas fa-search></i> No exact match — try describing the problem differently</div>';
            return;
          }
          out.innerHTML=matches.map(m=>'<div class=mod-list-item><div style=font-weight:700;color:#22c55e>'+m.name+'</div><div class=mod-muted style=font-size:.78rem;margin-top:4px>Build: '+m.output+'</div></div>').join('');
        })()"><i class="fas fa-search"></i> Match System</button>
        <div id="sm-results" style="margin-top:16px">
          <div class="mod-section-title">All Systems</div>
          ${SYSTEMS.map(s=>`<div class="mod-list-item"><div style="font-weight:600">${s.name}</div><div class="mod-muted" style="font-size:.75rem;margin-top:3px">Build: ${s.output}</div></div>`).join('')}
        </div>
      </div>`;
  }
})