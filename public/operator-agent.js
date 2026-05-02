/* ══════════════════════════════════════════
   OPERATOR AGENT (beta) — Grok-style chat,
   driven by Claude Max + master operator prompt.
══════════════════════════════════════════ */
(function () {
  const APIBase = (typeof window !== 'undefined' && window.location && window.location.origin)
    ? window.location.origin + '/api'
    : 'http://localhost:4000/api';

  const STORAGE_KEY = 'tss_operator_agent_history_v1';
  let history = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) history = JSON.parse(raw);
  } catch (_) { history = []; }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-40))); } catch (_) {}
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[<>&"']/g, function (c) {
      return { '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  function formatAssistant(text) {
    return escapeHtml(text)
      .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function render() {
    const log = document.getElementById('agent-log');
    if (!log) return;
    log.innerHTML = history.map(function (m) {
      const cls = 'agent-msg agent-' + m.role;
      const body = m.role === 'assistant' ? formatAssistant(m.content) : escapeHtml(m.content);
      return '<div class="' + cls + '"><div class="agent-msg-role">' + (m.role === 'user' ? 'YOU' : 'OPERATOR') + '</div><div class="agent-msg-body">' + body + '</div></div>';
    }).join('');
    log.scrollTop = log.scrollHeight;
  }

  async function send(message) {
    history.push({ role: 'user', content: message });
    save(); render();

    const log = document.getElementById('agent-log');
    const thinking = document.createElement('div');
    thinking.className = 'agent-msg agent-assistant agent-thinking';
    thinking.innerHTML = '<div class="agent-msg-role">OPERATOR</div><div class="agent-msg-body"><i class="fas fa-circle-notch fa-spin"></i> Thinking…</div>';
    log.appendChild(thinking);
    log.scrollTop = log.scrollHeight;

    try {
      const statusRes = await fetch(APIBase + '/claude/status');
      const status = await statusRes.json();
      if (!status.configured) {
        thinking.querySelector('.agent-msg-body').innerHTML =
          '<i class="fas fa-key" style="color:var(--accent)"></i> ANTHROPIC_API_KEY not set. Run <code>$env:ANTHROPIC_API_KEY="sk-ant-..."</code> (PowerShell) or <code>export ANTHROPIC_API_KEY="sk-ant-..."</code> (bash), then restart the server.';
        thinking.classList.remove('agent-thinking');
        history.push({ role: 'assistant', content: 'ANTHROPIC_API_KEY not set. Configure it and restart the server.' });
        save();
        return;
      }

      const res = await fetch(APIBase + '/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      const data = await res.json();
      thinking.remove();

      if (!data.ok) {
        const errMsg = 'Error: ' + (data.error || 'agent failed');
        history.push({ role: 'assistant', content: errMsg });
        save(); render();
        return;
      }
      history.push({ role: 'assistant', content: data.text || '' });
      save(); render();
    } catch (e) {
      thinking.remove();
      history.push({ role: 'assistant', content: 'Network error: ' + e.message });
      save(); render();
    }
  }

  function init() {
    const btn = document.getElementById('agent-send');
    const input = document.getElementById('agent-input');
    const clearBtn = document.getElementById('agent-clear');
    if (!btn || !input) return;

    btn.addEventListener('click', function () {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      send(text);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        btn.click();
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (!confirm('Clear all chat history?')) return;
        history = [];
        save();
        render();
      });
    }

    document.querySelectorAll('.agent-quick').forEach(function (q) {
      q.addEventListener('click', function () {
        input.value = q.dataset.prompt || q.textContent;
        input.focus();
      });
    });

    if (history.length === 0) {
      history.push({
        role: 'assistant',
        content: "Operator online. Ask anything about a client's brief, a system to deploy, or a workflow to run.\n\nQuick starts:\n- Design a 3D parallax sales page workflow for a SaaS founder\n- Plan a CRO audit for a struggling onboarding flow\n- Draft cold-outreach for [niche] using the [n] system"
      });
      save();
    }
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
