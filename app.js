(() => {
  'use strict';

  const DESIGN_W = 709;
  const DESIGN_H = 1536;
  const root = document.documentElement;
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

  const homeScreen = $('#homeScreen');
  const designStage = $('#designStage');
  const sectionScreen = $('#sectionScreen');
  const settingsModal = $('#settingsModal');
  const avatarModal = $('#avatarModal');
  const menuMusic = $('#menuMusic');
  const toast = $('#toast');
  const starCounter = $('#starCounter');

  const SETTINGS_KEY = 'areg-settings-v30';
  const AVATAR_KEY = 'areg-avatar-v30';
  const AVATAR_SOURCE_KEY = 'areg-avatar-source-v30';
  const defaultSettings = { master:true, music:true, voice:true, effects:true, theme:'day' };
  let settings = loadJson(SETTINGS_KEY, defaultSettings);
  settings = { ...defaultSettings, ...settings };

  const sectionMeta = {
    nature: { title:'Բնություն', icon:'🌿', text:'Կենդանիներ, բնության հեքիաթներ և խաղաղ արկածներ։', meta:'Առաջընթաց՝ 4/12 • Հեշտ մակարդակ', accent:'#90db75' },
    space: { title:'Տիեզերք', icon:'🚀', text:'Մոլորակներ, աստղեր և փայլուն տիեզերական ճանապարհորդություն։', meta:'Նոր բաժին • 2 փոքրիկ առաքելություն', accent:'#8cc7ff' },
    mind: { title:'Մտքի խաղեր', icon:'🧠', text:'Թվեր, ձևեր և խելացի գլուխկոտրուկներ։', meta:'Առաջընթաց՝ 2/10 • Զարգացնող', accent:'#ffd96f' },
    create: { title:'Ստեղծագործություն', icon:'🎨', text:'Նկարչություն, գույներ և ստեղծագործական առաջադրանքներ։', meta:'Առաջընթաց՝ 3/8 • Ստեղծիր', accent:'#ffb981' },
    magic: { title:'Կախարդական աստղի սենյակ', icon:'⭐', text:'Հատուկ կախարդական սենյակ՝ գիշերային պատմություններով ու գաղտնիքներով։', meta:'SPECIAL • Պրեմիում զգացողություն', accent:'#ffe27c' }
  };

  const themes = [
    ['day','Day'],['night','Night'],['winter','Winter'],['rain','Rain'],['aurora','Aurora'],
    ['wood','Wood'],['forest','Forest'],['ocean','Ocean'],['sunset','Sunset'],['space','Space']
  ];

  function loadJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }

  // ---- viewport / safe area ------------------------------------------------
  const safeProbe = document.createElement('div');
  Object.assign(safeProbe.style, {
    position:'fixed', inset:'0', visibility:'hidden', pointerEvents:'none',
    paddingTop:'env(safe-area-inset-top, 0px)', paddingRight:'env(safe-area-inset-right, 0px)',
    paddingBottom:'env(safe-area-inset-bottom, 0px)', paddingLeft:'env(safe-area-inset-left, 0px)'
  });
  document.body.appendChild(safeProbe);

  function syncViewport() {
    const vv = window.visualViewport;
    const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone === true;
    const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const viewportW = vv?.width || window.innerWidth;
    const viewportH = vv?.height || window.innerHeight;
    const cs = getComputedStyle(safeProbe);
    let safeTop = parseFloat(cs.paddingTop) || 0;
    let safeBottom = parseFloat(cs.paddingBottom) || 0;
    let layoutW = viewportW;
    let layoutH = viewportH;

    if (standalone && isiOS) {
      const sw = window.screen?.width || viewportW;
      const sh = window.screen?.height || viewportH;
      const portrait = viewportW <= viewportH;
      layoutW = portrait ? Math.min(sw, sh) : Math.max(sw, sh);
      layoutH = portrait ? Math.max(sw, sh) : Math.min(sw, sh);
      if (!Number.isFinite(layoutW) || Math.abs(layoutW - viewportW) > 120) layoutW = viewportW;
      if (!Number.isFinite(layoutH) || layoutH < viewportH) layoutH = Math.max(viewportH, window.innerHeight || 0);
      const longSide = Math.max(sw, sh);
      const fallbackTop = longSide >= 852 ? 59 : longSide >= 812 ? 47 : 20;
      safeTop = Math.max(safeTop, fallbackTop);
      root.classList.add('ios-standalone');
    } else {
      root.classList.remove('ios-standalone');
    }

    const stageW = Math.max(1, layoutW);
    const stageH = Math.max(1, layoutH);
    const scale = Math.min(stageW / DESIGN_W, stageH / DESIGN_H);

    root.style.setProperty('--app-h', `${stageH}px`);
    root.style.setProperty('--stage-scale', String(scale));
    root.style.setProperty('--stage-x', `${stageW / 2}px`);
    root.style.setProperty('--stage-y', `${stageH / 2}px`);

    if (standalone && isiOS) {
      const avatarDesiredCssTop = safeTop + 2;
      const controlsDesiredCssTop = safeTop + 8;
      const avatarShift = Math.max(0, avatarDesiredCssTop / scale - 58);
      const controlsShift = Math.max(0, controlsDesiredCssTop / scale - 34);
      root.style.setProperty('--avatar-safe-y', `${avatarShift}px`);
      root.style.setProperty('--top-controls-safe-y', `${controlsShift}px`);
    } else {
      root.style.setProperty('--avatar-safe-y', '0px');
      root.style.setProperty('--top-controls-safe-y', '0px');
    }

    root.style.setProperty('--safe-bottom-demo', `${safeBottom}px`);
  }

  syncViewport();
  [100, 500, 1200].forEach(ms => setTimeout(syncViewport, ms));
  window.addEventListener('pageshow', syncViewport, { passive:true });
  window.addEventListener('orientationchange', () => setTimeout(syncViewport, 120), { passive:true });
  window.addEventListener('resize', syncViewport, { passive:true });
  window.visualViewport?.addEventListener('resize', syncViewport, { passive:true });
  window.visualViewport?.addEventListener('scroll', syncViewport, { passive:true });

  // ---- app-like behavior ---------------------------------------------------
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('dragstart', e => e.preventDefault());
  document.addEventListener('selectstart', e => { if (!e.target.closest('input')) e.preventDefault(); });
  document.addEventListener('gesturestart', e => e.preventDefault(), { passive:false });
  document.addEventListener('touchmove', e => {
    if (!e.target.closest('.settings-panel,.avatar-panel,#cropPreview,input[type="range"]')) e.preventDefault();
  }, { passive:false });

  // ---- audio ---------------------------------------------------------------
  menuMusic.volume = 0.24;
  let audioUnlocked = false;
  async function ensureAudio() {
    if (!settings.master || !settings.music) return;
    try {
      await menuMusic.play();
      audioUnlocked = true;
    } catch {}
  }
  function stopMusic() { menuMusic.pause(); }
  function applyAudioSettings() {
    if (settings.master && settings.music) ensureAudio(); else stopMusic();
  }
  function playTap() { /* intentionally silent */ }
  ['pointerdown','touchend','keydown'].forEach(type => document.addEventListener(type, () => {
    if (!audioUnlocked) ensureAudio();
  }, { once:true, passive:true }));
  window.addEventListener('pageshow', applyAudioSettings);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) menuMusic.pause(); else applyAudioSettings();
  });

  // ---- themes --------------------------------------------------------------
  const themeGrid = $('#themeGrid');
  themes.forEach(([id, label]) => {
    const btn = document.createElement('button');
    btn.className = 'theme-option';
    btn.dataset.theme = id;
    btn.setAttribute('aria-label', `Theme ${label}`);
    btn.innerHTML = `<img src="${id}.svg" alt="" aria-hidden="true" draggable="false"><span>${label}</span>`;
    btn.addEventListener('click', () => {
      playTap();
      settings.theme = id;
      saveSettings();
      applyTheme();
    });
    themeGrid.appendChild(btn);
  });
  function applyTheme() {
    root.dataset.theme = settings.theme;
    $$('.theme-option').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.theme === settings.theme)));
    const meta = $('meta[name="theme-color"]');
    const css = getComputedStyle(root);
    const bgTop = css.getPropertyValue('--bg-1').trim();
    const bgBottom = css.getPropertyValue('--bg-3').trim();
    const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone === true;
    const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (meta) meta.setAttribute('content', standalone && isiOS && bgBottom ? bgBottom : bgTop);
  }
  applyTheme();

  // ---- settings ------------------------------------------------------------
  const toggles = { master: $('#masterSound'), music: $('#musicSound'), voice: $('#voiceHints'), effects: $('#gameEffects') };
  function syncSettingsUI() { Object.entries(toggles).forEach(([k, el]) => el.checked = !!settings[k]); }
  function applyEffectsSetting() { root.classList.toggle('effects-off', !settings.effects); }
  syncSettingsUI();
  applyEffectsSetting();
  Object.entries(toggles).forEach(([key, input]) => {
    input.addEventListener('change', () => {
      settings[key] = input.checked;
      saveSettings();
      applyEffectsSetting();
      applyAudioSettings();
    });
  });
  $('#settingsButton').addEventListener('click', () => { playTap(); syncSettingsUI(); settingsModal.hidden = false; });
  $$('[data-close="settings"]').forEach(el => el.addEventListener('click', () => { playTap(); settingsModal.hidden = true; }));

  // ---- star counter feedback ----------------------------------------------
  starCounter.addEventListener('click', () => {
    playTap();
    starCounter.classList.remove('pop-once');
    void starCounter.offsetWidth;
    starCounter.classList.add('pop-once');
    showToast('⭐ 120 աստղ');
  });

  // ---- card feedback / section navigation ---------------------------------
  const cards = $$('.section-card');
  cards.forEach(card => {
    card.addEventListener('click', () => openSection(card.dataset.section, card));
    card.addEventListener('pointerdown', () => card.classList.add('is-pressed'));
    card.addEventListener('pointerup', () => card.classList.remove('is-pressed'));
    card.addEventListener('pointercancel', () => card.classList.remove('is-pressed'));
    card.addEventListener('pointerleave', () => card.classList.remove('is-pressed'));
  });

  let sectionGhost = null;
  function openSection(section, sourceCard) {
    playTap();
    flyStarFromTo(sourceCard, starCounter);
    runCardTransition(section, sourceCard);
  }

  function runCardTransition(section, sourceCard) {
    const meta = sectionMeta[section] || { title:'Բաժին', icon:'✨', text:'Շուտով', meta:'', accent:'#ffffff' };
    $('#sectionTitle').textContent = meta.title;
    $('#sectionText').textContent = meta.text;
    $('#sectionMeta').textContent = meta.meta;
    $('#sectionIcon').textContent = meta.icon;
    sectionScreen.style.setProperty('--section-accent', meta.accent);

    if (sectionGhost) sectionGhost.remove();
    const rect = sourceCard.getBoundingClientRect();
    sectionGhost = document.createElement('div');
    sectionGhost.className = 'section-ghost';
    sectionGhost.style.left = `${rect.left}px`;
    sectionGhost.style.top = `${rect.top}px`;
    sectionGhost.style.width = `${rect.width}px`;
    sectionGhost.style.height = `${rect.height}px`;
    const img = sourceCard.querySelector('.asset-img');
    sectionGhost.innerHTML = `<img src="${img.getAttribute('src')}" alt="" draggable="false">`;
    document.body.appendChild(sectionGhost);

    sourceCard.classList.add('launching');
    sectionScreen.hidden = false;
    requestAnimationFrame(() => {
      sectionScreen.classList.add('preparing');
      sectionGhost.classList.add('expand');
    });
    setTimeout(() => {
      homeScreen.style.visibility = 'hidden';
      sectionScreen.classList.remove('preparing');
      sectionScreen.classList.add('is-visible');
      sectionGhost?.classList.add('fade-out');
    }, 260);
    setTimeout(() => {
      sourceCard.classList.remove('launching');
      sectionGhost?.remove();
      sectionGhost = null;
    }, 560);
  }

  $('#sectionBack').addEventListener('click', () => {
    playTap();
    sectionScreen.classList.remove('is-visible');
    homeScreen.style.visibility = 'visible';
    setTimeout(() => sectionScreen.hidden = true, 220);
  });

  // ---- avatar cropper ------------------------------------------------------
  const avatarButton = $('#avatarButton');
  const savedAvatar = $('#savedAvatar');
  const photoInput = $('#photoInput');
  const cropPreview = $('#cropPreview');
  const cropImage = $('#cropImage');
  const cropPlaceholder = $('#cropPlaceholder');
  const zoomSlider = $('#zoomSlider');
  const saveAvatar = $('#saveAvatar');
  let sourceDataUrl = null;
  let naturalW = 0, naturalH = 0;
  let zoom = 1, panX = 0, panY = 0;
  let pointerMap = new Map();
  let dragStart = null;
  let pinchStart = null;

  const persistedAvatar = localStorage.getItem(AVATAR_KEY);
  if (persistedAvatar) { savedAvatar.src = persistedAvatar; savedAvatar.hidden = false; }

  avatarButton.addEventListener('click', () => { playTap(); avatarModal.hidden = false; });
  $$('[data-close="avatar"]').forEach(el => el.addEventListener('click', () => { playTap(); avatarModal.hidden = true; }));

  photoInput.addEventListener('change', async () => {
    const file = photoInput.files?.[0];
    if (!file) return;
    playTap();
    sourceDataUrl = await downscaleImage(file, 1800);
    cropImage.onload = () => {
      naturalW = cropImage.naturalWidth;
      naturalH = cropImage.naturalHeight;
      zoom = 1; panX = 0; panY = 0; zoomSlider.value = '1';
      cropImage.hidden = false; cropPlaceholder.hidden = true; saveAvatar.disabled = false;
      renderCrop();
    };
    cropImage.src = sourceDataUrl;
  });

  function previewSize() { return cropPreview.clientWidth - 16; }
  function baseFit() {
    const s = previewSize();
    return Math.max(s / naturalW, s / naturalH);
  }
  function renderCrop() {
    if (!naturalW || !naturalH) return;
    const s = previewSize();
    const fit = baseFit();
    const w = naturalW * fit * zoom;
    const h = naturalH * fit * zoom;
    cropImage.style.width = `${w}px`;
    cropImage.style.height = `${h}px`;
    cropImage.style.left = `${(s - w) / 2 + 8 + panX}px`;
    cropImage.style.top = `${(s - h) / 2 + 8 + panY}px`;
  }

  zoomSlider.addEventListener('input', () => { zoom = Number(zoomSlider.value); renderCrop(); });
  $('#zoomOut').addEventListener('click', () => { playTap(); zoom = Math.max(.4, zoom - .15); zoomSlider.value = zoom; renderCrop(); });
  $('#zoomIn').addEventListener('click', () => { playTap(); zoom = Math.min(4, zoom + .15); zoomSlider.value = zoom; renderCrop(); });

  cropPreview.addEventListener('pointerdown', e => {
    if (!sourceDataUrl) return;
    cropPreview.setPointerCapture?.(e.pointerId);
    pointerMap.set(e.pointerId, { x:e.clientX, y:e.clientY });
    if (pointerMap.size === 1) dragStart = { x:e.clientX, y:e.clientY, panX, panY };
    if (pointerMap.size === 2) {
      const pts = [...pointerMap.values()];
      pinchStart = { distance:dist(pts[0],pts[1]), zoom };
    }
  });
  cropPreview.addEventListener('pointermove', e => {
    if (!pointerMap.has(e.pointerId)) return;
    pointerMap.set(e.pointerId, { x:e.clientX, y:e.clientY });
    if (pointerMap.size === 1 && dragStart) {
      panX = dragStart.panX + (e.clientX - dragStart.x);
      panY = dragStart.panY + (e.clientY - dragStart.y);
      renderCrop();
    } else if (pointerMap.size === 2 && pinchStart) {
      const pts = [...pointerMap.values()];
      const ratio = dist(pts[0],pts[1]) / Math.max(1,pinchStart.distance);
      zoom = Math.max(.4, Math.min(4, pinchStart.zoom * ratio));
      zoomSlider.value = zoom;
      renderCrop();
    }
  });
  ['pointerup','pointercancel','pointerout'].forEach(type => cropPreview.addEventListener(type, e => {
    pointerMap.delete(e.pointerId);
    if (pointerMap.size < 2) pinchStart = null;
    if (pointerMap.size === 0) dragStart = null;
    if (pointerMap.size === 1) {
      const [p] = pointerMap.values(); dragStart = { x:p.x, y:p.y, panX, panY };
    }
  }));

  saveAvatar.addEventListener('click', async () => {
    if (!sourceDataUrl) return;
    playTap();
    const data = await renderSavedAvatar();
    localStorage.setItem(AVATAR_KEY, data);
    localStorage.setItem(AVATAR_SOURCE_KEY, sourceDataUrl);
    savedAvatar.src = data;
    savedAvatar.hidden = false;
    avatarModal.hidden = true;
    showToast('Պահպանված է');
  });

  function dist(a,b) { return Math.hypot(a.x-b.x,a.y-b.y); }

  async function renderSavedAvatar() {
    const out = 512;
    const c = document.createElement('canvas');
    c.width = c.height = out;
    const ctx = c.getContext('2d');
    const im = new Image();
    await new Promise((res, rej) => { im.onload=res; im.onerror=rej; im.src=sourceDataUrl; });
    ctx.fillStyle = '#f0c582'; ctx.fillRect(0,0,out,out);
    const s = previewSize();
    const fit = Math.max(s / im.naturalWidth, s / im.naturalHeight);
    const w = im.naturalWidth * fit * zoom;
    const h = im.naturalHeight * fit * zoom;
    const k = out / s;
    ctx.save();
    ctx.beginPath(); ctx.arc(out/2,out/2,out/2,0,Math.PI*2); ctx.clip();
    ctx.drawImage(im, ((s-w)/2 + panX)*k, ((s-h)/2 + panY)*k, w*k, h*k);
    ctx.restore();
    return c.toDataURL('image/jpeg', .90);
  }

  async function downscaleImage(file, maxSide) {
    const raw = await fileToDataUrl(file);
    const im = new Image();
    await new Promise((res, rej) => { im.onload=res; im.onerror=rej; im.src=raw; });
    const scale = Math.min(1, maxSide / Math.max(im.naturalWidth, im.naturalHeight));
    if (scale === 1) return raw;
    const c = document.createElement('canvas');
    c.width = Math.round(im.naturalWidth * scale);
    c.height = Math.round(im.naturalHeight * scale);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    return c.toDataURL('image/jpeg', .90);
  }
  function fileToDataUrl(file) { return new Promise((res,rej) => { const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }

  // ---- polish --------------------------------------------------------------
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove('show'), 1200);
  }

  function flyStarFromTo(fromEl, toEl) {
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const star = document.createElement('div');
    star.className = 'flying-star';
    star.textContent = '⭐';
    star.style.left = `${a.left + a.width * 0.5}px`;
    star.style.top = `${a.top + a.height * 0.42}px`;
    star.style.setProperty('--dx', `${(b.left + b.width * 0.5) - (a.left + a.width * 0.5)}px`);
    star.style.setProperty('--dy', `${(b.top + b.height * 0.5) - (a.top + a.height * 0.42)}px`);
    document.body.appendChild(star);
    setTimeout(() => {
      starCounter.classList.remove('pop-once');
      void starCounter.offsetWidth;
      starCounter.classList.add('pop-once');
    }, 420);
    setTimeout(() => star.remove(), 900);
  }

  function initFocusLoop() {
    let index = 0;
    const ordered = ['nature','space','mind','create','magic'].map(id => $(`[data-section="${id}"]`)).filter(Boolean);
    function tick() {
      ordered.forEach(card => card.classList.remove('is-focus'));
      const active = ordered[index % ordered.length];
      active?.classList.add('is-focus');
      index += 1;
    }
    tick();
    setInterval(tick, 2200);
  }

  function initParallax() {
    const layers = [
      { el: $('.logo'), depth: 5, rot: 0.8 },
      { el: $('.bottom-landscape'), depth: 3, rot: 0 },
      { el: $('.avatar-button'), depth: 6, rot: 1.1 },
      { el: $('.star-counter'), depth: 7, rot: 0.8 },
      { el: $('.settings-button'), depth: 8, rot: 0.8 },
      ...cards.map((el, i) => ({ el, depth: 4 + (i % 2), rot: i === 4 ? 0.5 : 0.9 }))
    ];

    let targetX = 0, targetY = 0;
    let curX = 0, curY = 0;
    function setTargets(nx, ny) { targetX = nx; targetY = ny; }
    document.addEventListener('pointermove', e => {
      setTargets((e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2);
    }, { passive:true });
    document.addEventListener('pointerleave', () => setTargets(0,0), { passive:true });

    let orientationReady = false;
    function attachOrientation() {
      if (orientationReady || !window.DeviceOrientationEvent) return;
      orientationReady = true;
      window.addEventListener('deviceorientation', e => {
        const x = Math.max(-1, Math.min(1, (e.gamma || 0) / 20));
        const y = Math.max(-1, Math.min(1, (e.beta || 0) / 30));
        setTargets(x, y * 0.8);
      }, { passive:true });
    }
    document.addEventListener('pointerdown', attachOrientation, { once:true, passive:true });

    function frame() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      layers.forEach(({ el, depth, rot }) => {
        if (!el) return;
        el.style.setProperty('--tx', `${curX * depth}px`);
        el.style.setProperty('--ty', `${curY * depth}px`);
        el.style.setProperty('--rot', `${curX * rot}deg`);
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  initFocusLoop();
  initParallax();

  // ---- SW ------------------------------------------------------------------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
  }

  applyAudioSettings();
})();
