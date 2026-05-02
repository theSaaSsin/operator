/* ══════════════════════════════════
   WORKFLOWS LAUNCHPAD — TheSaaSsin Operator
══════════════════════════════════ */
(function () {
  const APIBase = (typeof window !== 'undefined' && window.location && window.location.origin)
    ? window.location.origin + '/api'
    : 'http://localhost:4000/api';

  const escWf = function (s) {
    return String(s == null ? '' : s).replace(/[<>&"']/g, function (c) {
      return { '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#39;' }[c];
    });
  };

  const toastWf = function (msg, kind) {
    const t = document.getElementById('toast');
    if (!t) { console.log(msg); return; }
    t.textContent = msg;
    t.className = kind === 'err' ? 'toast-err' : 'toast-ok';
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.className = ''; }, 3000);
  };

  document.querySelectorAll('.wf-run').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      const wf = btn.dataset.workflow;
      const out  = document.getElementById('wf-output');
      const body = document.getElementById('wf-output-body');
      const title = document.getElementById('wf-output-title');
      const wfLabel = (btn.closest('.wf-card') && btn.closest('.wf-card').querySelector('.wf-name'))
        ? btn.closest('.wf-card').querySelector('.wf-name').textContent
        : wf;
      out.style.display = 'flex';
      title.textContent = wfLabel + ' — running';
      body.innerHTML = '<div class="wf-status running"><i class="fas fa-circle-notch fa-spin"></i> Spawning Blender, rendering... ~30–90s</div>';

      try {
        const res = await fetch(APIBase + '/workflow/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflow: wf })
        });
        const data = await res.json();
        if (!data.ok) {
          body.innerHTML =
            '<div class="wf-status error"><i class="fas fa-triangle-exclamation"></i> ' +
            escWf(data.error || 'Render failed') + '</div>' +
            (data.stderr ? '<pre>' + escWf(data.stderr) + '</pre>' : '');
          title.textContent = wfLabel + ' — failed';
          return;
        }
        title.textContent = wfLabel + ' — done';
        const isVid = data.kind === 'video';
        const mediaTag = isVid
          ? '<video src="' + data.outputUrl + '?t=' + Date.now() + '" controls autoplay loop muted></video>'
          : '<img src="' + data.outputUrl + '?t=' + Date.now() + '" alt="Render output">';
        const downloadLabel = isVid ? 'Download MP4' : 'Download PNG';
        body.innerHTML =
          '<div class="wf-status done"><i class="fas fa-check"></i> Rendered in ' + (data.durationMs / 1000).toFixed(1) + 's</div>' +
          mediaTag +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">' +
          '<a class="btn btn-primary btn-sm" href="' + data.outputUrl + '" download><i class="fas fa-download"></i> ' + downloadLabel + '</a>' +
          '<button class="btn btn-secondary btn-sm" onclick="document.querySelector(\'.wf-run[data-workflow=&quot;' + wf + '&quot;]\').click()"><i class="fas fa-rotate"></i> Re-render</button>' +
          '</div>';
      } catch (e) {
        body.innerHTML = '<div class="wf-status error"><i class="fas fa-triangle-exclamation"></i> ' + escWf(e.message) + '</div>';
        title.textContent = wfLabel + ' — error';
      }
    });
  });

  document.querySelectorAll('.wf-run-claude').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      const out  = document.getElementById('wf-output');
      const body = document.getElementById('wf-output-body');
      const title = document.getElementById('wf-output-title');

      const get = function (id) {
        const el = document.getElementById(id);
        return el ? (el.value || '').trim() : '';
      };
      const brief = {
        name:     get('f-name'),
        niche:    get('f-niche'),
        offer:    get('f-offer'),
        goal:     get('f-goal') || 'leads',
        location: get('f-location'),
        notes:    get('f-notes')
      };

      if (!brief.name && !brief.niche && !brief.offer) {
        const userBrief = prompt('No client brief in Client Creator. Drop a quick brief here (e.g. "Apex Plumbing, local trade, emergency plumbing 24/7, more leads, London"):');
        if (!userBrief) return;
        const parts = userBrief.split(',').map(function (s) { return s.trim(); });
        brief.name = parts[0] || '';
        brief.niche = parts[1] || '';
        brief.offer = parts[2] || '';
        brief.goal = parts[3] || 'leads';
        brief.location = parts[4] || '';
      }

      out.style.display = 'flex';
      title.textContent = 'Operator Plan — Claude Max';
      body.innerHTML = '<div class="wf-status running"><i class="fas fa-circle-notch fa-spin"></i> Calling Claude Max with the master operator prompt + brief... 10–30s</div>';

      try {
        const statusRes = await fetch(APIBase + '/claude/status');
        const status = await statusRes.json();
        if (!status.configured) {
          body.innerHTML =
            '<div class="wf-status error"><i class="fas fa-key"></i> Claude API key not configured</div>' +
            '<pre>Set ANTHROPIC_API_KEY env var, then restart the server.\n\nPowerShell:\n  $env:ANTHROPIC_API_KEY="sk-ant-..."\n  node server.js\n\nbash / WSL:\n  export ANTHROPIC_API_KEY="sk-ant-..."\n  node server.js</pre>';
          title.textContent = 'Operator Plan — needs key';
          return;
        }

        const res = await fetch(APIBase + '/claude/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brief: brief })
        });
        const data = await res.json();
        if (!data.ok) {
          body.innerHTML = '<div class="wf-status error"><i class="fas fa-triangle-exclamation"></i> ' + escWf(data.error || 'Generation failed') + '</div>';
          title.textContent = 'Operator Plan — failed';
          return;
        }

        const inputTokens  = (data.usage && data.usage.input_tokens) || 0;
        const cachedTokens = (data.usage && data.usage.cache_read_input_tokens) || 0;
        const outputTokens = (data.usage && data.usage.output_tokens) || 0;
        const cacheNote    = cachedTokens > 0 ? (' · ' + cachedTokens + ' cached') : '';

        const formatted = (data.text || '').split('\n').map(function (line) {
          if (/^(GOAL|SYSTEMS USED|STORYBOARD|COPY|TIMING|MESHY PROMPTS|PAGE STRUCTURE|AUTOMATION HOOKS|IMPLEMENTATION NOTES)\b/.test(line)) {
            return '<h4 class="claude-section">' + escWf(line) + '</h4>';
          }
          return escWf(line);
        }).join('<br>').replace(/<br><h4/g, '<h4').replace(/<\/h4><br>/g, '</h4>');

        title.textContent = 'Operator Plan — done';
        body.innerHTML =
          '<div class="wf-status done"><i class="fas fa-check"></i> ' + (data.model || 'claude') + ' · ' + inputTokens + ' in' + cacheNote + ' · ' + outputTokens + ' out</div>' +
          '<div class="claude-out">' + formatted + '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">' +
          '<button class="btn btn-primary btn-sm" id="btn-copy-claude-out"><i class="fas fa-copy"></i> Copy plan</button>' +
          '<button class="btn btn-secondary btn-sm" onclick="document.querySelector(\'.wf-run-claude\').click()"><i class="fas fa-rotate"></i> Re-run</button>' +
          '</div>';

        const copyBtn = document.getElementById('btn-copy-claude-out');
        if (copyBtn) {
          copyBtn.addEventListener('click', function () {
            navigator.clipboard.writeText(data.text || '');
            toastWf('Plan copied', 'ok');
          });
        }
      } catch (e) {
        body.innerHTML = '<div class="wf-status error"><i class="fas fa-triangle-exclamation"></i> ' + escWf(e.message) + '</div>';
        title.textContent = 'Operator Plan — error';
      }
    });
  });

  const closeBtn = document.getElementById('btn-wf-close-output');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      document.getElementById('wf-output').style.display = 'none';
    });
  }
})();
