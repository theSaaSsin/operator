/* ════════════════════════════════════════════
   STUDIO CANVAS (beta) — TheSaaSsin Operator
   Infinite canvas + timeline + beat detection
   + 3D perspective + GSAP keyframe animation.
══════════════════════════════════════════════ */
(function () {
  if (window.__studioCanvasInit) return;
  window.__studioCanvasInit = true;

  const STATE_KEY = 'tss_studio_canvas_v1';

  // ── State ──────────────────────────────────
  const state = {
    pan: { x: 0, y: 0 },
    zoom: 1,
    layers: [],         // {id, type, x, y, z, w, h, rot, src, text, fontSize, color, filter, kfs:[]}
    selected: null,
    timeline: { dur: 12, time: 0, playing: false, beats: [], audioBuf: null, audioSrc: null },
    nextId: 1
  };

  // ── Persistence ────────────────────────────
  function save() {
    try {
      const snap = {
        layers: state.layers,
        timeline: { dur: state.timeline.dur, beats: state.timeline.beats, audioSrc: state.timeline.audioSrc }
      };
      localStorage.setItem(STATE_KEY, JSON.stringify(snap));
    } catch (e) { /* ignore */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return;
      const snap = JSON.parse(raw);
      if (snap.layers) {
        state.layers = snap.layers;
        state.nextId = Math.max(0, ...state.layers.map(l => l.id || 0)) + 1;
      }
      if (snap.timeline) {
        state.timeline.dur = snap.timeline.dur || 12;
        state.timeline.beats = snap.timeline.beats || [];
        state.timeline.audioSrc = snap.timeline.audioSrc || null;
      }
    } catch (e) { /* ignore */ }
  }

  // ── DOM refs (set in init) ────────────────
  let canvasEl, worldEl, layerListEl, propsEl, timelineEl, playheadEl, beatTrackEl, audioEl, timeReadoutEl, audioCtx;

  // ── Render world (layers in 3D space) ─────
  function renderWorld() {
    if (!worldEl) return;
    const z = state.zoom;
    worldEl.style.transform = `translate(${state.pan.x}px, ${state.pan.y}px) scale(${z})`;
    worldEl.innerHTML = '';
    state.layers.forEach(layer => {
      const el = document.createElement('div');
      el.className = 'sc-layer' + (state.selected === layer.id ? ' sc-selected' : '');
      el.dataset.id = layer.id;
      el.style.left = layer.x + 'px';
      el.style.top  = layer.y + 'px';
      el.style.width  = layer.w + 'px';
      el.style.height = layer.h + 'px';
      el.style.transform = `translateZ(${layer.z || 0}px) rotate(${layer.rot || 0}deg)`;
      if (layer.filter) el.style.filter = layer.filter;
      if (layer.opacity != null) el.style.opacity = layer.opacity;

      if (layer.type === 'image') {
        el.innerHTML = `<img src="${layer.src}" draggable="false" style="width:100%;height:100%;object-fit:cover;">`;
      } else if (layer.type === 'video') {
        el.innerHTML = `<video src="${layer.src}" autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;"></video>`;
      } else if (layer.type === 'text') {
        const c = layer.color || '#f0f0f5';
        const fs = layer.fontSize || 36;
        el.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:${fs}px;font-weight:800;color:${c};text-align:center;line-height:1.1;letter-spacing:-.02em;">${escapeHtml(layer.text || '')}</div>`;
      } else if (layer.type === 'kanji') {
        el.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:${layer.fontSize||120}px;font-weight:900;color:${layer.color||'#ff2a2a'};line-height:1;letter-spacing:-.04em;">${escapeHtml(layer.text || '暗殺')}</div>`;
      }
      worldEl.appendChild(el);
    });
    renderLayerList();
  }

  function renderLayerList() {
    if (!layerListEl) return;
    if (!state.layers.length) {
      layerListEl.innerHTML = '<div class="sc-empty">No layers yet — add an image, video, text, or kanji from the toolbar.</div>';
      return;
    }
    layerListEl.innerHTML = state.layers.slice().reverse().map(l => {
      const sel = state.selected === l.id ? ' sc-layer-row-sel' : '';
      const icon = l.type === 'image' ? 'fa-image' : l.type === 'video' ? 'fa-film' : l.type === 'kanji' ? 'fa-bolt' : 'fa-font';
      const label = l.type === 'text' || l.type === 'kanji' ? (l.text || '').slice(0,20) : (l.src || '').split('/').pop().slice(0,22);
      return `<div class="sc-layer-row${sel}" data-id="${l.id}">
        <i class="fas ${icon}"></i>
        <span class="sc-layer-label">${escapeHtml(label || l.type)}</span>
        <span class="sc-layer-z">z${l.z||0}</span>
        <button class="sc-mini-btn" data-action="up" data-id="${l.id}" title="Bring forward"><i class="fas fa-arrow-up"></i></button>
        <button class="sc-mini-btn" data-action="del" data-id="${l.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </div>`;
    }).join('');
  }

  function renderProps() {
    if (!propsEl) return;
    const layer = state.layers.find(l => l.id === state.selected);
    if (!layer) {
      propsEl.innerHTML = '<div class="sc-empty">Select a layer to edit its properties + keyframes.</div>';
      return;
    }
    propsEl.innerHTML = `
      <div class="sc-props-grid">
        <label>X<input type="number" data-prop="x" value="${layer.x}"></label>
        <label>Y<input type="number" data-prop="y" value="${layer.y}"></label>
        <label>Z (depth)<input type="number" data-prop="z" value="${layer.z||0}"></label>
        <label>W<input type="number" data-prop="w" value="${layer.w}"></label>
        <label>H<input type="number" data-prop="h" value="${layer.h}"></label>
        <label>Rot°<input type="number" data-prop="rot" value="${layer.rot||0}"></label>
        <label>Opacity<input type="number" step="0.1" min="0" max="1" data-prop="opacity" value="${layer.opacity ?? 1}"></label>
      </div>
      ${layer.type === 'text' || layer.type === 'kanji' ? `
        <label class="sc-full">Text<input type="text" data-prop="text" value="${escapeHtml(layer.text || '')}"></label>
        <div class="sc-props-grid">
          <label>Font px<input type="number" data-prop="fontSize" value="${layer.fontSize||36}"></label>
          <label>Color<input type="color" data-prop="color" value="${layer.color||'#f0f0f5'}"></label>
        </div>
      ` : ''}
      <div class="sc-fx">
        <span class="sc-fx-label">EFFECTS</span>
        <button class="sc-fx-btn" data-fx="none">None</button>
        <button class="sc-fx-btn" data-fx="blur(8px)">Blur</button>
        <button class="sc-fx-btn" data-fx="grayscale(1) contrast(1.1)">Mono</button>
        <button class="sc-fx-btn" data-fx="brightness(0.5) contrast(1.4)">Crush</button>
        <button class="sc-fx-btn" data-fx="hue-rotate(0deg) saturate(0.4) brightness(.85)">Filmic</button>
        <button class="sc-fx-btn" data-fx="drop-shadow(0 0 24px rgba(255,42,42,0.6))">Red glow</button>
      </div>
      <div class="sc-kf-bar">
        <div class="sc-kf-label">KEYFRAMES @ ${state.timeline.time.toFixed(2)}s</div>
        <button class="sc-mini-btn sc-kf-add" data-action="kf-add"><i class="fas fa-plus"></i> ADD KF</button>
        <button class="sc-mini-btn sc-kf-snap" data-action="kf-snap" title="Add KF at nearest beat"><i class="fas fa-bolt"></i> SNAP TO BEAT</button>
      </div>
      <div class="sc-kf-list">${(layer.kfs||[]).map((kf, i) => `
        <div class="sc-kf-row"><span>${kf.t.toFixed(2)}s</span><span class="sc-kf-vals">x:${kf.x} y:${kf.y} z:${kf.z||0} rot:${kf.rot||0}° op:${kf.opacity ?? 1}</span><button class="sc-mini-btn" data-action="kf-del" data-i="${i}"><i class="fas fa-trash"></i></button></div>
      `).join('') || '<div class="sc-empty">No keyframes — set the playhead, change properties, click ADD KF.</div>'}</div>
    `;
  }

  function renderTimeline() {
    if (!playheadEl || !beatTrackEl || !timeReadoutEl) return;
    const w = timelineEl.offsetWidth;
    playheadEl.style.left = (state.timeline.time / state.timeline.dur * w) + 'px';
    timeReadoutEl.textContent = `${state.timeline.time.toFixed(2)} / ${state.timeline.dur.toFixed(1)}s` + (state.timeline.beats.length ? ` · ${state.timeline.beats.length} beats` : '');
    beatTrackEl.innerHTML = state.timeline.beats.map(b => {
      const left = (b / state.timeline.dur * w) + 'px';
      return `<div class="sc-beat" style="left:${left}"></div>`;
    }).join('') + (state.selected ? (state.layers.find(l => l.id === state.selected)?.kfs || []).map(kf => `<div class="sc-kf-mark" style="left:${(kf.t / state.timeline.dur * w)}px" title="${kf.t.toFixed(2)}s"></div>`).join('') : '');
  }

  // ── Layer creation ────────────────────────
  function addLayer(type, opts = {}) {
    const layer = Object.assign({
      id: state.nextId++,
      type,
      x: -opts.w/2 + window.innerWidth*0.4,
      y: -opts.h/2 + 200,
      z: 0, w: opts.w || 320, h: opts.h || 180, rot: 0, opacity: 1, kfs: []
    }, opts);
    state.layers.push(layer);
    state.selected = layer.id;
    save(); renderWorld(); renderProps(); renderTimeline();
  }

  // ── File import ───────────────────────────
  function importFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target.result;
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          const w = Math.min(480, img.width);
          const h = w / img.width * img.height;
          addLayer('image', { src: dataUrl, w, h });
        };
        img.src = dataUrl;
      } else if (file.type.startsWith('video/')) {
        addLayer('video', { src: dataUrl, w: 480, h: 270 });
      } else if (file.type.startsWith('audio/')) {
        importAudio(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }

  // ── Audio + beat detection ────────────────
  async function importAudio(dataUrl) {
    state.timeline.audioSrc = dataUrl;
    if (audioEl) {
      audioEl.src = dataUrl;
      audioEl.load();
    }
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const res = await fetch(dataUrl);
      const arr = await res.arrayBuffer();
      const buf = await audioCtx.decodeAudioData(arr);
      state.timeline.audioBuf = buf;
      state.timeline.dur = Math.max(state.timeline.dur, buf.duration);
      detectBeats(buf);
      save(); renderTimeline();
      toast('Audio imported · ' + state.timeline.beats.length + ' beats', 'ok');
    } catch (e) {
      toast('Audio decode failed: ' + e.message, 'err');
    }
  }

  function detectBeats(buf) {
    // Energy-based onset detection: compute RMS over 1024-sample windows
    // on channel 0, then peak-pick where RMS exceeds local-mean * threshold.
    const data = buf.getChannelData(0);
    const sampleRate = buf.sampleRate;
    const win = 1024;
    const hop = 512;
    const rms = [];
    for (let i = 0; i + win < data.length; i += hop) {
      let s = 0;
      for (let j = 0; j < win; j++) {
        const v = data[i + j];
        s += v * v;
      }
      rms.push(Math.sqrt(s / win));
    }
    // Local mean window for adaptive threshold
    const beats = [];
    const lookback = 32;
    const minGapSec = 0.18; // suppress closer than 180ms
    let lastBeatTime = -Infinity;
    for (let i = lookback; i < rms.length - 1; i++) {
      let local = 0;
      for (let j = i - lookback; j < i; j++) local += rms[j];
      local /= lookback;
      const isPeak = rms[i] > rms[i-1] && rms[i] > rms[i+1] && rms[i] > local * 1.6 && rms[i] > 0.04;
      if (isPeak) {
        const t = (i * hop) / sampleRate;
        if (t - lastBeatTime > minGapSec) {
          beats.push(+t.toFixed(3));
          lastBeatTime = t;
        }
      }
    }
    state.timeline.beats = beats;
  }

  // ── Playback ──────────────────────────────
  let playStart = 0, playOffset = 0, rafId = null;
  function play() {
    if (state.timeline.playing) return;
    state.timeline.playing = true;
    playStart = performance.now();
    playOffset = state.timeline.time;
    if (audioEl && audioEl.src) {
      audioEl.currentTime = state.timeline.time;
      audioEl.play().catch(() => {});
    }
    document.getElementById('sc-play').innerHTML = '<i class="fas fa-pause"></i>';
    const tick = () => {
      if (!state.timeline.playing) return;
      const t = playOffset + (performance.now() - playStart) / 1000;
      if (t >= state.timeline.dur) { stop(); return; }
      state.timeline.time = t;
      applyKeyframesAtTime(t);
      renderTimeline();
      rafId = requestAnimationFrame(tick);
    };
    tick();
  }
  function stop() {
    state.timeline.playing = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (audioEl) audioEl.pause();
    document.getElementById('sc-play').innerHTML = '<i class="fas fa-play"></i>';
  }
  function seek(t) {
    state.timeline.time = Math.max(0, Math.min(state.timeline.dur, t));
    if (audioEl) audioEl.currentTime = state.timeline.time;
    applyKeyframesAtTime(state.timeline.time);
    renderTimeline();
    renderProps();
  }

  function applyKeyframesAtTime(t) {
    state.layers.forEach(layer => {
      if (!layer.kfs || !layer.kfs.length) return;
      const sorted = layer.kfs.slice().sort((a,b) => a.t - b.t);
      let prev = null, next = null;
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].t <= t) prev = sorted[i];
        if (sorted[i].t >= t && !next) next = sorted[i];
      }
      if (!prev && !next) return;
      const target = prev || next;
      if (prev && next && next.t > prev.t) {
        const k = (t - prev.t) / (next.t - prev.t);
        const e = ease(k);
        layer.x = lerp(prev.x, next.x, e);
        layer.y = lerp(prev.y, next.y, e);
        layer.z = lerp(prev.z||0, next.z||0, e);
        layer.rot = lerp(prev.rot||0, next.rot||0, e);
        layer.opacity = lerp(prev.opacity ?? 1, next.opacity ?? 1, e);
      } else if (target) {
        layer.x = target.x; layer.y = target.y;
        layer.z = target.z || 0; layer.rot = target.rot || 0;
        layer.opacity = target.opacity ?? 1;
      }
    });
    renderWorld();
  }
  function ease(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ── Helpers ───────────────────────────────
  function escapeHtml(s){ return String(s == null ? '' : s).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c])); }
  function toast(msg, kind) {
    const t = document.getElementById('toast');
    if (!t) { console.log(msg); return; }
    t.textContent = msg;
    t.className = kind === 'err' ? 'toast-err' : 'toast-ok';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.className = '', 3000);
  }

  // ── Init ──────────────────────────────────
  function init() {
    canvasEl = document.getElementById('sc-canvas');
    if (!canvasEl) return;
    worldEl = document.getElementById('sc-world');
    layerListEl = document.getElementById('sc-layer-list');
    propsEl = document.getElementById('sc-props');
    timelineEl = document.getElementById('sc-timeline');
    playheadEl = document.getElementById('sc-playhead');
    beatTrackEl = document.getElementById('sc-beat-track');
    audioEl = document.getElementById('sc-audio');
    timeReadoutEl = document.getElementById('sc-time-readout');

    load();
    renderWorld(); renderProps(); renderTimeline();

    // Pan with middle-mouse / space+drag, zoom with wheel
    let panning = false, panStart = null, spaceDown = false;
    canvasEl.addEventListener('mousedown', e => {
      if (e.button === 1 || (e.button === 0 && spaceDown)) {
        panning = true;
        panStart = { x: e.clientX - state.pan.x, y: e.clientY - state.pan.y };
        canvasEl.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });
    window.addEventListener('mousemove', e => {
      if (!panning) return;
      state.pan.x = e.clientX - panStart.x;
      state.pan.y = e.clientY - panStart.y;
      renderWorld();
    });
    window.addEventListener('mouseup', () => { panning = false; canvasEl.style.cursor = ''; });
    window.addEventListener('keydown', e => { if (e.key === ' ') { spaceDown = true; canvasEl.style.cursor = 'grab'; } });
    window.addEventListener('keyup',   e => { if (e.key === ' ') { spaceDown = false; canvasEl.style.cursor = ''; } });
    canvasEl.addEventListener('wheel', e => {
      e.preventDefault();
      const rect = canvasEl.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.1 : 1/1.1;
      const newZoom = Math.max(0.1, Math.min(4, state.zoom * factor));
      // Zoom around mouse position
      state.pan.x = mx - (mx - state.pan.x) * (newZoom / state.zoom);
      state.pan.y = my - (my - state.pan.y) * (newZoom / state.zoom);
      state.zoom = newZoom;
      renderWorld();
    }, { passive: false });

    // Layer click to select + drag to move
    let dragging = null, dragStart = null;
    worldEl.addEventListener('mousedown', e => {
      const layerEl = e.target.closest('.sc-layer');
      if (!layerEl || spaceDown) return;
      const id = +layerEl.dataset.id;
      state.selected = id;
      const layer = state.layers.find(l => l.id === id);
      if (!layer) return;
      dragging = layer;
      dragStart = { x: e.clientX, y: e.clientY, lx: layer.x, ly: layer.y };
      e.stopPropagation();
      renderWorld(); renderProps();
    });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = (e.clientX - dragStart.x) / state.zoom;
      const dy = (e.clientY - dragStart.y) / state.zoom;
      dragging.x = dragStart.lx + dx;
      dragging.y = dragStart.ly + dy;
      renderWorld(); renderProps();
    });
    window.addEventListener('mouseup', () => { if (dragging) { save(); dragging = null; } });

    // Toolbar buttons
    document.getElementById('sc-add-text')?.addEventListener('click', () => {
      addLayer('text', { text: 'AUTOMATE.', x: 100, y: 100, w: 420, h: 80, fontSize: 56, color: '#f0f0f5' });
    });
    document.getElementById('sc-add-kanji')?.addEventListener('click', () => {
      addLayer('kanji', { text: '暗殺', x: 200, y: 200, w: 200, h: 200, fontSize: 160, color: '#ff2a2a' });
    });
    document.getElementById('sc-add-img')?.addEventListener('click', () => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*';
      i.onchange = ev => { const f = ev.target.files[0]; if (f) importFile(f); };
      i.click();
    });
    document.getElementById('sc-add-vid')?.addEventListener('click', () => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = 'video/*';
      i.onchange = ev => { const f = ev.target.files[0]; if (f) importFile(f); };
      i.click();
    });
    document.getElementById('sc-add-audio')?.addEventListener('click', () => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = 'audio/*';
      i.onchange = ev => { const f = ev.target.files[0]; if (f) importFile(f); };
      i.click();
    });
    document.getElementById('sc-clear')?.addEventListener('click', () => {
      if (!confirm('Clear the canvas?')) return;
      state.layers = []; state.selected = null;
      state.timeline.beats = []; state.timeline.audioSrc = null;
      if (audioEl) audioEl.removeAttribute('src');
      save(); renderWorld(); renderProps(); renderTimeline();
    });
    document.getElementById('sc-zoom-fit')?.addEventListener('click', () => {
      state.pan = { x: canvasEl.offsetWidth / 2, y: canvasEl.offsetHeight / 2 };
      state.zoom = 1;
      renderWorld();
    });

    // Layer list interactions
    layerListEl.addEventListener('click', e => {
      const row = e.target.closest('.sc-layer-row');
      const btn = e.target.closest('.sc-mini-btn');
      if (btn) {
        const id = +btn.dataset.id;
        const layer = state.layers.find(l => l.id === id);
        if (!layer) return;
        if (btn.dataset.action === 'del') {
          state.layers = state.layers.filter(l => l.id !== id);
          if (state.selected === id) state.selected = null;
        } else if (btn.dataset.action === 'up') {
          layer.z = (layer.z || 0) + 50;
        }
        save(); renderWorld(); renderProps();
        e.stopPropagation();
        return;
      }
      if (row) {
        state.selected = +row.dataset.id;
        renderWorld(); renderProps();
      }
    });

    // Props panel interactions
    propsEl.addEventListener('input', e => {
      const layer = state.layers.find(l => l.id === state.selected);
      if (!layer) return;
      const prop = e.target.dataset.prop;
      if (!prop) return;
      const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
      layer[prop] = val;
      save(); renderWorld();
    });
    propsEl.addEventListener('click', e => {
      const fxBtn = e.target.closest('.sc-fx-btn');
      if (fxBtn) {
        const layer = state.layers.find(l => l.id === state.selected);
        if (!layer) return;
        layer.filter = fxBtn.dataset.fx === 'none' ? '' : fxBtn.dataset.fx;
        save(); renderWorld();
      }
      const action = e.target.closest('[data-action]')?.dataset.action;
      const layer = state.layers.find(l => l.id === state.selected);
      if (!layer) return;
      if (action === 'kf-add') {
        layer.kfs = layer.kfs || [];
        layer.kfs.push({ t: state.timeline.time, x: layer.x, y: layer.y, z: layer.z||0, rot: layer.rot||0, opacity: layer.opacity ?? 1 });
        save(); renderProps(); renderTimeline();
      } else if (action === 'kf-snap') {
        if (!state.timeline.beats.length) { toast('Import audio first to detect beats', 'err'); return; }
        const t = state.timeline.time;
        const nearest = state.timeline.beats.reduce((a,b) => Math.abs(b - t) < Math.abs(a - t) ? b : a);
        layer.kfs = layer.kfs || [];
        layer.kfs.push({ t: nearest, x: layer.x, y: layer.y, z: layer.z||0, rot: layer.rot||0, opacity: layer.opacity ?? 1 });
        seek(nearest);
        save(); renderProps(); renderTimeline();
        toast('KF added @ beat ' + nearest.toFixed(2) + 's', 'ok');
      } else if (action === 'kf-del') {
        const i = +e.target.closest('[data-i]').dataset.i;
        layer.kfs.splice(i, 1);
        save(); renderProps(); renderTimeline();
      }
    });

    // Timeline scrub
    timelineEl.addEventListener('mousedown', e => {
      if (e.target.closest('button') || e.target.closest('input')) return;
      const rect = timelineEl.getBoundingClientRect();
      const t = (e.clientX - rect.left) / rect.width * state.timeline.dur;
      seek(t);
      const onMove = ev => {
        const t2 = (ev.clientX - rect.left) / rect.width * state.timeline.dur;
        seek(t2);
      };
      const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });

    document.getElementById('sc-play')?.addEventListener('click', () => {
      state.timeline.playing ? stop() : play();
    });
    document.getElementById('sc-rewind')?.addEventListener('click', () => seek(0));

    // Audio playback element
    if (state.timeline.audioSrc) {
      audioEl.src = state.timeline.audioSrc;
    }

    // Centre canvas initially
    setTimeout(() => {
      if (state.layers.length === 0) {
        state.pan = { x: canvasEl.offsetWidth / 2, y: canvasEl.offsetHeight / 2 };
        renderWorld();
      }
    }, 50);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
