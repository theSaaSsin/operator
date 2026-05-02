({
  init() {},
  render(container) {
    container.innerHTML = `
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-image"></i> Visual Asset Generator</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Asset Type</label>
            <select id="va-type" class="mod-input" onchange="document.getElementById('va-preview').innerHTML=''">
              <option>Quote Card</option><option>Stats Card</option><option>CTA Banner</option><option>Profile Banner</option>
            </select>
          </div>
          <div class="mod-field"><label>Brand Name</label><input id="va-brand" class="mod-input" placeholder="e.g. TheSaaSsin"/></div>
          <div class="mod-field"><label>Headline / Stat / Quote</label><input id="va-text" class="mod-input" placeholder="e.g. 10 clients in 30 days. No ads."/></div>
          <div class="mod-field"><label>Accent Colour</label><input id="va-color" class="mod-input" type="color" value="#ff2a2a"/></div>
          <div class="mod-field"><label>Subtext (optional)</label><input id="va-sub" class="mod-input" placeholder="e.g. Book a free strategy call"/></div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const type=document.getElementById('va-type').value;
          const brand=document.getElementById('va-brand').value.trim()||'TheSaaSsin';
          const text=document.getElementById('va-text').value.trim()||'Your headline here';
          const color=document.getElementById('va-color').value;
          const sub=document.getElementById('va-sub').value.trim();
          const preview=document.getElementById('va-preview');
          const canvas=document.createElement('canvas');
          canvas.width=1080;canvas.height=1080;
          const ctx=canvas.getContext('2d');
          ctx.fillStyle='#0a0a0f';ctx.fillRect(0,0,1080,1080);
          ctx.strokeStyle=color;ctx.lineWidth=8;ctx.strokeRect(20,20,1040,1040);
          ctx.fillStyle=color;ctx.font='bold 36px system-ui';ctx.textAlign='center';
          ctx.fillText(brand.toUpperCase(),540,80);
          ctx.fillStyle='#f0f0f5';ctx.font='bold 72px system-ui';
          const words=text.split(' ');let line='';let y=400;
          words.forEach(w=>{const t=line+w+' ';if(ctx.measureText(t).width>900&&line){ctx.fillText(line.trim(),540,y);line=w+' ';y+=90;}else line=t;});
          ctx.fillText(line.trim(),540,y);
          if(sub){ctx.fillStyle='#6b6b80';ctx.font='32px system-ui';ctx.fillText(sub,540,y+80);}
          canvas.style.width='100%';canvas.style.borderRadius='8px';canvas.style.marginTop='12px';
          preview.innerHTML='';preview.appendChild(canvas);
          const dl=document.createElement('a');dl.download='asset.png';dl.href=canvas.toDataURL();
          dl.style.display='block';dl.style.marginTop='10px';dl.textContent='Download Asset';
          dl.className='mod-btn';preview.appendChild(dl);
        })()"><i class="fas fa-wand-magic-sparkles"></i> Generate Asset</button>
        <div id="va-preview" style="margin-top:12px"></div>
      </div>`;
  }
})