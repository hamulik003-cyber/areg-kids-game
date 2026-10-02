(() => {
  'use strict';

  const DESIGN_W = 709;
  const DESIGN_H = 1536;
  const root = document.documentElement;
  const body = document.body;
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

  const homeScreen = $('#homeScreen');
  const designStage = $('#designStage');
  const sectionScreen = $('#sectionScreen');
  const settingsModal = $('#settingsModal');
  const avatarModal = $('#avatarModal');
  const menuMusic = $('#menuMusic');
  const tapSound = $('#tapSound');
  const toast = $('#toast');

  const SETTINGS_KEY = 'areg-settings-v1';
  const AVATAR_KEY = 'areg-avatar-v1';
  const defaultSettings = { master:true, music:true, voice:true, effects:true, theme:'day' };
  let settings = loadJson(SETTINGS_KEY, defaultSettings);
  settings = { ...defaultSettings, ...settings };

  const themes = [
    ['day','Day'],['night','Night'],['winter','Winter'],['rain','Rain'],['aurora','Aurora'],
    ['wood','Wood'],['forest','Forest'],['ocean','Ocean'],['sunset','Sunset'],['space','Space']
  ];

  function loadJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }

  // Accurate fixed viewport height for iOS Safari / installed PWA.
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

    // In iOS standalone mode the visual viewport can begin at y=0 while the
    // Dynamic Island / status bar is still drawn over the app. Use the physical
    // screen height and reserve a conservative hardware-safe band when env()
    // reports 0. This keeps the approved 709x1536 composition proportional;
    // only the surrounding theme background fills any extra space.
    const w = vv?.width || window.innerWidth;
    const viewportH = vv?.height || window.innerHeight;
    const physicalH = standalone && isiOS ? Math.max(viewportH, window.screen?.height || 0) : viewportH;

    const cs = getComputedStyle(safeProbe);
    let safeTop = parseFloat(cs.paddingTop) || 0;
    let safeRight = parseFloat(cs.paddingRight) || 0;
    let safeBottom = parseFloat(cs.paddingBottom) || 0;
    let safeLeft = parseFloat(cs.paddingLeft) || 0;

    if (standalone && isiOS) {
      const sh = window.screen?.height || physicalH;
      const fallbackTop = sh >= 852 ? 59 : sh >= 812 ? 47 : 20;
      const fallbackBottom = sh >= 812 ? 34 : 0;
      safeTop = Math.max(safeTop, fallbackTop);
      safeBottom = Math.max(safeBottom, fallbackBottom);
    }

    const availW = Math.max(1, w - safeLeft - safeRight);
    const availH = Math.max(1, physicalH - safeTop - safeBottom);
    const scale = Math.min(availW / DESIGN_W, availH / DESIGN_H);

    root.style.setProperty('--app-h', `${physicalH}px`);
    root.style.setProperty('--stage-scale', String(scale));
    root.style.setProperty('--stage-x', `${safeLeft + availW / 2}px`);
    root.style.setProperty('--stage-y', `${safeTop + availH / 2}px`);
  }
  syncViewport();
  window.addEventListener('resize', syncViewport, { passive:true });
  window.visualViewport?.addEventListener('resize', syncViewport, { passive:true });
  window.visualViewport?.addEventListener('scroll', syncViewport, { passive:true });

  // Make game UI act like an app, without breaking controls/crop interactions.
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('dragstart', e => e.preventDefault());
  document.addEventListener('selectstart', e => {
    if (!e.target.closest('input')) e.preventDefault();
  });
  document.addEventListener('gesturestart', e => e.preventDefault(), { passive:false });
  document.addEventListener('touchmove', e => {
    if (!e.target.closest('.settings-panel,.avatar-panel,#cropPreview,input[type="range"]')) e.preventDefault();
  }, { passive:false });

  // Audio
  menuMusic.volume = 0.24;
  tapSound.volume = 0.34;
  let audioUnlocked = false;
  async function ensureAudio() {
    if (!settings.master || !settings.music) return;
    try {
      await menuMusic.play();
      audioUnlocked = true;
    } catch { /* iOS waits for first real interaction */ }
  }
  function stopMusic() { menuMusic.pause(); }
  function applyAudioSettings() {
    if (settings.master && settings.music) ensureAudio(); else stopMusic();
  }
  function playTap() {
    if (!settings.master || !settings.effects) return;
    try { tapSound.currentTime = 0; tapSound.play().catch(() => {}); } catch {}
  }
  ['pointerdown','touchend','keydown'].forEach(type => document.addEventListener(type, () => {
    if (!audioUnlocked) ensureAudio();
  }, { once:true, passive:true }));
  window.addEventListener('pageshow', applyAudioSettings);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) menuMusic.pause(); else applyAudioSettings();
  });

  // Themes
  const themeGrid = $('#themeGrid');
  themes.forEach(([id, label]) => {
    const btn = document.createElement('button');
    btn.className = 'theme-option';
    btn.dataset.theme = id;
    btn.setAttribute('aria-label', `Theme ${label}`);
    btn.innerHTML = `<img src="${id}.svg" alt="${label} theme preview" draggable="false"><span>${label}</span>`;
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
    const bg = getComputedStyle(root).getPropertyValue('--bg-1').trim();
    if (meta && bg) meta.setAttribute('content', bg);
  }
  applyTheme();

  // Settings modal
  const toggles = {
    master: $('#masterSound'), music: $('#musicSound'), voice: $('#voiceHints'), effects: $('#gameEffects')
  };
  function syncSettingsUI() {
    Object.entries(toggles).forEach(([k, el]) => el.checked = !!settings[k]);
  }
  syncSettingsUI();
  Object.entries(toggles).forEach(([key, input]) => {
    input.addEventListener('change', () => {
      settings[key] = input.checked;
      saveSettings();
      if (key !== 'effects') playTap();
      applyAudioSettings();
    });
  });
  $('#settingsButton').addEventListener('click', () => { playTap(); syncSettingsUI(); settingsModal.hidden = false; });
  $$('[data-close="settings"]').forEach(el => el.addEventListener('click', () => { playTap(); settingsModal.hidden = true; }));

  // Star counter is a real independent button; it only provides subtle feedback for now.
  $('#starCounter').addEventListener('click', () => { playTap(); showToast('⭐ 120'); });

  // Section navigation
  $$('.section-card').forEach(card => card.addEventListener('click', () => openSection(card.dataset.section)));
  function openSection() {
    playTap();
    sectionScreen.hidden = false;
    requestAnimationFrame(() => sectionScreen.classList.add('is-visible'));
    homeScreen.style.visibility = 'hidden';
  }
  $('#sectionBack').addEventListener('click', () => {
    playTap();
    sectionScreen.classList.remove('is-visible');
    homeScreen.style.visibility = 'visible';
    setTimeout(() => sectionScreen.hidden = true, 220);
  });

  // Avatar cropper
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

  avatarButton.addEventListener('click', () => {
    playTap();
    avatarModal.hidden = false;
  });
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
    return Math.min(s / naturalW, s / naturalH);
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
    const fit = Math.min(s / im.naturalWidth, s / im.naturalHeight);
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

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove('show'), 1100);
  }

  // Register offline shell only on secure origins / localhost (GitHub Pages works).
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
  }

  // Initial audio attempt (browser may reject until first user gesture).
  applyAudioSettings();
})();
