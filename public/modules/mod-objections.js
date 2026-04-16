({
  init() {},
  render(container) {
    const OBJECTIONS = [
      { obj: "It's too expensive", responses: ["What's one client worth to you? This pays itself back with one deal.", "Compared to what? Not getting clients costs more.", "We can structure payment — what works for your cash flow?"] },
      { obj: "I need to think about it", responses: ["What specifically do you need to think about? Let's address it now.", "What would need to be true for this to be a yes?", "The problem doesn't take a break while you think. What's holding you back?"] },
      { obj: "I'm not ready", responses: ["Ready for what exactly? More clients, or is there something specific?", "The best time to fix a leaky bucket is before it's empty.", "What would make you feel ready?"] },
      { obj: "I'll do it myself", responses: ["Totally — what's your plan for getting clients right now?", "How long have you been trying to solve this yourself?", "Most of our clients said the same thing 6 months ago."] },
      { obj: "I need to talk to my partner/spouse", responses: ["Of course — can we get them on a quick 5-min call right now?", "What do you think their main concern will be?", "What would you tell them is the main benefit?"] },
      { obj: "I've been burned before", responses: ["That's fair — what happened? I want to make sure we're different.", "What would you need to see to trust this?", "Our clients have a guarantee — let me walk you through it."] },
      { obj: "I don't have time", responses: ["That's exactly why this system exists — we do it for you.", "How much time are you currently spending on lead gen?", "This is the thing that frees up your time, not adds to it."] },
      { obj: "Send me more info first", responses: ["What specifically do you want to know? I can answer it now.", "Most of what you need to know is from talking — info alone won't tell you if it fits.", "I can send a case study — what niche are you in so I send the right one?"] },
    ];
    let custom = [];
    try { custom = JSON.parse(localStorage.getItem('customObjections') || '[]'); } catch {}
    const all = [...OBJECTIONS, ...custom];
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${OBJECTIONS.length}</div><div class="mod-stat-label">Built-in Scripts</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${custom.length}</div><div class="mod-stat-label">Custom Added</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-shield-halved"></i> Objection Scripts</div>
        ${all.map((o,i)=>`
          <div class="mod-list-item" style="margin-bottom:10px">
            <div style="font-weight:700;color:var(--accent);margin-bottom:6px">"${o.obj}"</div>
            ${o.responses.map((r,j)=>`
              <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:4px">
                <span style="color:#22c55e;font-size:.7rem;padding-top:2px;min-width:14px">${j+1}.</span>
                <div style="font-size:.82rem;flex:1">${r}</div>
                <button class="mod-btn mod-btn-sm" onclick="navigator.clipboard.writeText('${r.replace(/'/g,"\\'")}');toast('Copied!','ok')"><i class="fas fa-copy"></i></button>
              </div>`).join('')}
          </div>`).join('')}
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-plus"></i> Add Custom Objection</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Objection</label><input id="ob-obj" class="mod-input" placeholder='e.g. "My industry is different"'/></div>
          <div class="mod-field mod-field-full"><label>Your Response</label><input id="ob-res" class="mod-input" placeholder="e.g. Every industry has people who need clients..."/></div>
        </div>
        <button class="mod-btn" style="margin-top:8px" onclick="(function(){
          const obj=document.getElementById('ob-obj').value.trim();
          const res=document.getElementById('ob-res').value.trim();
          if(!obj||!res){toast('Fill both fields','err');return;}
          let c=JSON.parse(localStorage.getItem('customObjections')||'[]');
          c.push({obj,responses:[res]});localStorage.setItem('customObjections',JSON.stringify(c));
          toast('Objection script saved','ok');
        })()"><i class="fas fa-plus"></i> Save</button>
      </div>`;
  }
})