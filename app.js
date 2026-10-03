(() => {
  'use strict';

  const DESIGN_W = 709;
  const DESIGN_H = 1536;
  const SECTION_W = 941;
  const SECTION_H = 1672;
  const root = document.documentElement;
  const body = document.body;
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

  const homeScreen = $('#homeScreen');
  const sectionScreen = $('#sectionScreen');
  const activityScreen = $('#activityScreen');
  const sectionStage = $('#sectionStage');
  const sectionHotspots = $('#sectionHotspots');
  const sectionFullImage = $('#sectionFullImage');
  const settingsModal = $('#settingsModal');
  const avatarModal = $('#avatarModal');
  const menuMusic = $('#menuMusic');
  const toast = $('#toast');
  const activityTitle = $('#activityTitle');
  const activitySectionTitle = $('#activitySectionTitle');
  const activityContent = $('#activityContent');
  const activityStars = $('#activityStars');

  const SETTINGS_KEY = 'areg-settings-v33';
  const AVATAR_KEY = 'areg-avatar-v2';
  const AVATAR_SOURCE_KEY = 'areg-avatar-source-v2';
  const STARS_KEY = 'areg-stars-v33';
  const defaultSettings = { master:true, music:true, voice:true, effects:true };
  let settings = loadJson(SETTINGS_KEY, defaultSettings);
  settings = { ...defaultSettings, ...settings };
  let stars = Number(localStorage.getItem(STARS_KEY) || 120);

  const COMMON_BACK = { x: 30, y: 35, w: 96, h: 96, type: 'back', className: 'back' };

  const SECTION_DATA = {
    nature: {
      title: 'Բնություն',
      image: 'section-nature.png?v=33',
      back: COMMON_BACK,
      games: [
        { id:'animals', label:'Կենդանիներ', x: 45, y: 751, w: 424, h: 250, kind:'quiz', question:'Ո՞ր կենդանին է անտառում ապրում։', options:['Եղնիկ','Հրթիռ','Մոլորակ'], answer:0 },
        { id:'birds', label:'Թռչուններ', x: 486, y: 751, w: 410, h: 250, kind:'memory', pairs:['🐦','🦉','🦜'] },
        { id:'ocean', label:'Օվկիանոս', x: 45, y: 1034, w: 424, h: 250, kind:'quiz', question:'Ո՞վ է ջրում լողում։', options:['Դելֆին','Աստղ','Առյուծ'], answer:0 },
        { id:'flowers', label:'Ծաղիկներ', x: 486, y: 1034, w: 410, h: 250, kind:'tap', target:'🌼', total:6, bg:'nature' },
        { id:'trees', label:'Ծառեր', x: 45, y: 1317, w: 424, h: 250, kind:'memory', pairs:['🌳','🌲','🍃'] },
        { id:'planet', label:'Երկիր մոլորակ', x: 486, y: 1317, w: 410, h: 250, kind:'quiz', question:'Մեր մոլորակը ո՞րն է։', options:['Երկիր','Սատուրն','Լուսին'], answer:0 }
      ]
    },
    space: {
      title: 'Տիեզերք',
      image: 'section-space.png?v=33',
      back: COMMON_BACK,
      games: [
        { id:'planets', label:'Մոլորակներ', x: 35, y: 744, w: 417, h: 246, kind:'memory', pairs:['🪐','🌍','🌕'] },
        { id:'stars', label:'Աստղեր', x: 488, y: 744, w: 417, h: 246, kind:'tap', target:'⭐', total:7, bg:'space' },
        { id:'rocket', label:'Տիեզերական խաղեր', x: 35, y: 1024, w: 417, h: 246, kind:'quiz', question:'Ինչո՞վ են թռչում տիեզերք։', options:['Հրթիռով','Ավտոբուսով','Հեծանիվով'], answer:0 },
        { id:'const', label:'Աստղագուշակություն', x: 488, y: 1024, w: 417, h: 246, kind:'quiz', question:'Քանի՞ աստղ է երևում այս խաղում գտնելու։', options:['3','5','7'], answer:2 },
        { id:'astronauts', label:'Տիեզերագնացներ', x: 35, y: 1308, w: 417, h: 246, kind:'memory', pairs:['👨‍🚀','🚀','🌌'] },
        { id:'blackhole', label:'Իրականություն', x: 488, y: 1308, w: 417, h: 246, kind:'quiz', question:'Սև խոռոչը ինչ գույնի է։', options:['Սև','Կանաչ','Դեղին'], answer:0 }
      ]
    },
    mind: {
      title: 'Մտքի խաղեր',
      image: 'section-mind.png?v=33',
      back: COMMON_BACK,
      games: [
        { id:'memory', label:'Հիշողություն', x: 47, y: 707, w: 390, h: 247, kind:'memory', pairs:['🧩','🧠','🔑'] },
        { id:'logic', label:'Լոգիկա', x: 502, y: 707, w: 390, h: 247, kind:'quiz', question:'Ո՞րը է տարբերվում։', options:['Կլոր','Քառակուսի','Աղվես'], answer:2 },
        { id:'diff', label:'Տարբերությունները', x: 47, y: 988, w: 390, h: 247, kind:'quiz', question:'Աչքերով գտիր ճիշտ պատասխանը։', options:['Մեծ','Փոքր','Միջին'], answer:1 },
        { id:'numbers', label:'Թվեր', x: 502, y: 988, w: 390, h: 247, kind:'quiz', question:'1-ից հետո ո՞ր թիվն է։', options:['2','5','9'], answer:0 },
        { id:'shapes', label:'Ձևեր', x: 47, y: 1271, w: 390, h: 247, kind:'quiz', question:'Ո՞րն է եռանկյունը։', options:['🔺','⚪','🟥'], answer:0 },
        { id:'puzzle', label:'Փազլեր', x: 502, y: 1271, w: 390, h: 247, kind:'memory', pairs:['🟦','🟥','🟨'] }
      ]
    },
    create: {
      title: 'Ստեղծագործություն',
      image: 'section-create.png?v=33',
      back: COMMON_BACK,
      games: [
        { id:'paint', label:'Նկարչություն', x: 31, y: 816, w: 268, h: 250, kind:'draw' },
        { id:'coloring', label:'Գունավորում', x: 337, y: 816, w: 268, h: 250, kind:'draw' },
        { id:'stickers', label:'Սթիքերներ', x: 640, y: 816, w: 268, h: 250, kind:'tap', target:'⭐', total:5, bg:'create' },
        { id:'build', label:'Կոնստրուկտոր', x: 31, y: 1099, w: 268, h: 250, kind:'memory', pairs:['🧱','🟦','🟨'] },
        { id:'origami', label:'Օրիգամի', x: 337, y: 1099, w: 268, h: 250, kind:'quiz', question:'Թղթից ի՞նչ կարելի է ծալել։', options:['Օրիգամի','Մոլորակ','Ջուր'], answer:0 },
        { id:'camera', label:'Դիզայն', x: 640, y: 1099, w: 268, h: 250, kind:'quiz', question:'Նկարը ինչո՞վ են նկարում։', options:['Տեսախցիկով','Գդալով','Կոշիկով'], answer:0 }
      ]
    },
    magic: {
      title: 'Կախարդական աստղի սենյակ',
      image: 'section-magic.png?v=33',
      back: COMMON_BACK,
      games: [
        { id:'stories', label:'Հեքիաթներ', x: 28, y: 939, w: 275, h: 250, kind:'quiz', question:'Հեքիաթները որտե՞ղ են ապրում։', options:['Գրքում','Հրթիռում','Ավտոյում'], answer:0 },
        { id:'knowledge', label:'Գիտելիքներ', x: 333, y: 939, w: 275, h: 250, kind:'quiz', question:'Լամպը ի՞նչ է տալիս։', options:['Լույս','Անտառ','Ալիք'], answer:0 },
        { id:'stargaze', label:'Աստղադիտում', x: 638, y: 939, w: 275, h: 250, kind:'tap', target:'⭐', total:6, bg:'magic' },
        { id:'collect', label:'Աստղերի խաղեր', x: 28, y: 1217, w: 275, h: 250, kind:'tap', target:'✨', total:8, bg:'magic' },
        { id:'wins', label:'Կանոններ', x: 333, y: 1217, w: 275, h: 250, kind:'memory', pairs:['🏆','⭐','🎁'] },
        { id:'book', label:'Իմ գիրքը', x: 638, y: 1217, w: 275, h: 250, kind:'draw' }
      ]
    }
  };

  let currentSectionId = 'nature';
  let currentGame = null;
  let audioUnlocked = false;

  function loadJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
  function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
  function saveStars() { localStorage.setItem(STARS_KEY, String(stars)); }

  const safeProbe = document.createElement('div');
  Object.assign(safeProbe.style, {
    position:'fixed', inset:'0', visibility:'hidden', pointerEvents:'none',
    paddingTop:'env(safe-area-inset-top, 0px)', paddingRight:'env(safe-area-inset-right, 0px)',
    paddingBottom:'env(safe-area-inset-bottom, 0px)', paddingLeft:'env(safe-area-inset-left, 0px)'
  });
  document.body.appendChild(safeProbe);

  function syncViewport() {
    const vv = window.visualViewport;
    const viewportW = vv?.width || window.innerWidth;
    const viewportH = vv?.height || window.innerHeight;
    const sw = window.screen?.width || viewportW;
    const sh = window.screen?.height || viewportH;
    const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone === true;
    const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let layoutW = viewportW;
    let layoutH = viewportH;

    const cs = getComputedStyle(safeProbe);
    let safeTop = parseFloat(cs.paddingTop) || 0;

    if (standalone && isiOS) {
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

    const stageScale = Math.min(layoutW / DESIGN_W, layoutH / DESIGN_H);
    const sectionScale = Math.min(layoutW / SECTION_W, layoutH / SECTION_H);
    root.style.setProperty('--app-h', `${layoutH}px`);
    root.style.setProperty('--stage-scale', String(stageScale));
    root.style.setProperty('--section-scale', String(sectionScale));
    root.style.setProperty('--stage-x', `${layoutW / 2}px`);
    root.style.setProperty('--stage-y', `${layoutH / 2}px`);

    if (standalone && isiOS) {
      const avatarShift = Math.max(0, (safeTop + 2) / stageScale - 58);
      const controlsShift = Math.max(0, (safeTop + 8) / stageScale - 34);
      root.style.setProperty('--avatar-safe-y', `${avatarShift}px`);
      root.style.setProperty('--top-controls-safe-y', `${controlsShift}px`);
    } else {
      root.style.setProperty('--avatar-safe-y', '0px');
      root.style.setProperty('--top-controls-safe-y', '0px');
    }
  }

  syncViewport();
  [100,500,1200].forEach(ms => setTimeout(syncViewport, ms));
  window.addEventListener('pageshow', syncViewport, { passive:true });
  window.addEventListener('orientationchange', () => setTimeout(syncViewport, 120), { passive:true });
  window.addEventListener('resize', syncViewport, { passive:true });
  window.visualViewport?.addEventListener('resize', syncViewport, { passive:true });

  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('dragstart', e => e.preventDefault());
  document.addEventListener('selectstart', e => { if (!e.target.closest('input, canvas')) e.preventDefault(); });
  document.addEventListener('gesturestart', e => e.preventDefault(), { passive:false });
  document.addEventListener('touchmove', e => {
    if (!e.target.closest('.settings-panel,.avatar-panel,#cropPreview,.activity-content,input[type="range"],canvas')) e.preventDefault();
  }, { passive:false });

  menuMusic.volume = 0.24;
  async function ensureAudio() { if (!settings.master || !settings.music) return; try { await menuMusic.play(); audioUnlocked = true; } catch {} }
  function stopMusic() { menuMusic.pause(); }
  function applyAudioSettings() { if (settings.master && settings.music) ensureAudio(); else stopMusic(); }
  function playTap() {}
  ['pointerdown','touchend','keydown'].forEach(type => document.addEventListener(type, () => { if (!audioUnlocked) ensureAudio(); }, { once:true, passive:true }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) menuMusic.pause(); else applyAudioSettings(); });
  applyAudioSettings();

  const toggles = { master: $('#masterSound'), music: $('#musicSound'), voice: $('#voiceHints'), effects: $('#gameEffects') };
  function syncSettingsUI() { Object.entries(toggles).forEach(([k, el]) => el.checked = !!settings[k]); }
  syncSettingsUI();
  Object.entries(toggles).forEach(([key, input]) => {
    input.addEventListener('change', () => { settings[key] = input.checked; saveSettings(); applyAudioSettings(); root.classList.toggle('effects-off', !settings.effects); });
  });
  $('#settingsButton').addEventListener('click', () => { playTap(); syncSettingsUI(); settingsModal.hidden = false; });
  $$('[data-close="settings"]').forEach(el => el.addEventListener('click', () => { playTap(); settingsModal.hidden = true; }));
  $('#starCounter').addEventListener('click', () => showToast(`⭐ ${stars}`));

  // Main menu section buttons
  $$('.section-card').forEach(card => card.addEventListener('click', () => openSection(card.dataset.section)));

  function openSection(sectionId) {
    currentSectionId = sectionId;
    const data = SECTION_DATA[sectionId];
    if (!data) return;
    playTap();
    sectionFullImage.src = data.image;
    sectionFullImage.alt = data.title;
    renderSectionHotspots(data);
    homeScreen.style.visibility = 'hidden';
    sectionScreen.hidden = false;
    requestAnimationFrame(() => sectionScreen.classList.add('is-visible'));
  }

  function closeSection() {
    sectionScreen.classList.remove('is-visible');
    setTimeout(() => { sectionScreen.hidden = true; homeScreen.style.visibility = 'visible'; }, 180);
  }

  function renderSectionHotspots(section) {
    sectionHotspots.innerHTML = '';
    const back = document.createElement('button');
    back.className = 'hotspot-btn back';
    back.style.left = `${section.back.x}px`;
    back.style.top = `${section.back.y}px`;
    back.style.width = `${section.back.w}px`;
    back.style.height = `${section.back.h}px`;
    back.setAttribute('aria-label', 'Հետ');
    back.addEventListener('click', closeSection);
    sectionHotspots.appendChild(back);

    section.games.forEach(game => {
      const btn = document.createElement('button');
      btn.className = 'hotspot-btn game';
      btn.style.left = `${game.x}px`;
      btn.style.top = `${game.y}px`;
      btn.style.width = `${game.w}px`;
      btn.style.height = `${game.h}px`;
      btn.setAttribute('aria-label', game.label);
      btn.addEventListener('click', () => openActivity(section, game));
      sectionHotspots.appendChild(btn);
    });
  }

  $('#activityBack').addEventListener('click', () => {
    playTap();
    activityScreen.classList.remove('is-visible');
    setTimeout(() => { activityScreen.hidden = true; sectionScreen.hidden = false; requestAnimationFrame(() => sectionScreen.classList.add('is-visible')); }, 180);
  });

  function openActivity(section, game) {
    playTap();
    currentGame = game;
    sectionScreen.classList.remove('is-visible');
    setTimeout(() => {
      sectionScreen.hidden = true;
      activityScreen.hidden = false;
      requestAnimationFrame(() => activityScreen.classList.add('is-visible'));
    }, 160);
    activitySectionTitle.textContent = section.title;
    activityTitle.textContent = game.label;
    activityStars.textContent = String(stars);
    renderGame(game);
  }

  function addStars(n = 1) {
    stars += n;
    activityStars.textContent = String(stars);
    saveStars();
    showToast(`⭐ +${n}`);
  }

  function renderGame(game) {
    activityContent.innerHTML = '';
    if (game.kind === 'memory') return renderMemoryGame(game);
    if (game.kind === 'quiz') return renderQuizGame(game);
    if (game.kind === 'tap') return renderTapGame(game);
    if (game.kind === 'draw') return renderDrawGame(game);
  }

  function renderMemoryGame(game) {
    const panel = document.createElement('div');
    panel.className = 'game-panel';
    panel.innerHTML = `<div class="game-help">Գտիր նույն զույգերը</div>`;
    const grid = document.createElement('div');
    grid.className = 'memory-grid';
    const icons = [...game.pairs, ...game.pairs].sort(() => Math.random() - .5);
    let opened = [];
    let lock = false;
    let matched = 0;

    icons.forEach(icon => {
      const btn = document.createElement('button');
      btn.className = 'memory-card';
      btn.innerHTML = `<div class="memory-card-inner"><div class="memory-face memory-front">?</div><div class="memory-face memory-back">${icon}</div></div>`;
      btn.addEventListener('click', () => {
        if (lock || btn.classList.contains('flipped') || btn.classList.contains('matched')) return;
        btn.classList.add('flipped');
        opened.push({ btn, icon });
        if (opened.length === 2) {
          lock = true;
          if (opened[0].icon === opened[1].icon) {
            opened.forEach(x => x.btn.classList.add('matched'));
            matched += 1;
            opened = [];
            lock = false;
            if (matched === game.pairs.length) {
              finishPanel(panel, 'Ապրես, բոլոր զույգերը գտար 🎉', 2);
            }
          } else {
            setTimeout(() => {
              opened.forEach(x => x.btn.classList.remove('flipped'));
              opened = [];
              lock = false;
            }, 700);
          }
        }
      });
      grid.appendChild(btn);
    });
    panel.appendChild(grid);
    activityContent.appendChild(panel);
  }

  function renderQuizGame(game) {
    const panel = document.createElement('div');
    panel.className = 'game-panel';
    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.innerHTML = `<div class="quiz-question">${game.question}</div>`;
    const options = document.createElement('div');
    options.className = 'quiz-options';
    let answered = false;
    game.options.forEach((opt, index) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        if (index === game.answer) {
          btn.classList.add('correct');
          finishPanel(panel, 'Ճիշտ պատասխան ✅', 1);
        } else {
          btn.classList.add('wrong');
          options.children[game.answer].classList.add('correct');
          finishPanel(panel, 'Փորձիր նորից հաջորդ խաղում 🌟', 0);
        }
      });
      options.appendChild(btn);
    });
    card.appendChild(options);
    panel.appendChild(card);
    activityContent.appendChild(panel);
  }

  function renderTapGame(game) {
    const panel = document.createElement('div');
    panel.className = 'game-panel';
    panel.innerHTML = `<div class="game-help">Հավաքիր ${game.total} հատ ${game.target}</div><div class="tap-progress">0 / ${game.total}</div>`;
    const area = document.createElement('div');
    area.className = 'tap-area';
    const progress = panel.querySelector('.tap-progress');
    let collected = 0;

    function spawn() {
      if (collected >= game.total) return;
      const item = document.createElement('button');
      item.className = 'tap-target';
      item.textContent = game.target;
      const maxX = area.clientWidth - 72;
      const maxY = area.clientHeight - 72;
      item.style.left = `${Math.max(0, Math.random() * maxX)}px`;
      item.style.top = `${Math.max(0, Math.random() * maxY)}px`;
      item.style.animationDelay = `${Math.random()*1.5}s`;
      item.addEventListener('click', () => {
        item.remove();
        collected += 1;
        progress.textContent = `${collected} / ${game.total}`;
        if (collected >= game.total) finishPanel(panel, 'Գերազանց, ամեն ինչ հավաքեցիր ⭐', 2);
        else spawn();
      }, { once:true });
      area.appendChild(item);
    }

    panel.appendChild(area);
    activityContent.appendChild(panel);
    requestAnimationFrame(() => { for (let i=0; i<Math.min(4, game.total); i++) spawn(); });
  }

  function renderDrawGame(game) {
    const panel = document.createElement('div');
    panel.className = 'draw-wrap';
    const help = document.createElement('div');
    help.className = 'game-help';
    help.textContent = 'Նկարի կամ ներկիր ազատ ձևով';
    const toolbar = document.createElement('div');
    toolbar.className = 'draw-toolbar';
    const colors = ['#f44336','#ff9800','#ffeb3b','#4caf50','#2196f3','#9c27b0','#000000','#ffffff'];
    const wrap = document.createElement('div');
    wrap.className = 'draw-canvas-wrap';
    wrap.innerHTML = '<canvas id="drawCanvas"></canvas>';
    const canvas = wrap.querySelector('canvas');
    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-btn';
    clearBtn.textContent = 'Մաքրել';
    const finishBtn = document.createElement('button');
    finishBtn.className = 'primary-action';
    finishBtn.textContent = 'Պատրաստ է';
    panel.append(help, toolbar, wrap, clearBtn, finishBtn);
    activityContent.appendChild(panel);

    let currentColor = colors[0];
    colors.forEach((color, idx) => {
      const b = document.createElement('button');
      b.className = 'color-dot' + (idx === 0 ? ' active' : '');
      b.style.background = color;
      b.addEventListener('click', () => {
        currentColor = color;
        toolbar.querySelectorAll('.color-dot').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      });
      toolbar.appendChild(b);
    });

    const ctx = canvas.getContext('2d');
    function sizeCanvas() {
      const rect = wrap.getBoundingClientRect();
      canvas.width = Math.max(300, Math.floor(rect.width));
      canvas.height = Math.max(360, Math.floor(rect.height));
      ctx.fillStyle = '#fff';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 8;
    }
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas, { passive:true, once:true });

    let drawing = false;
    function point(e) {
      const r = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x:(t.clientX-r.left) * (canvas.width/r.width), y:(t.clientY-r.top) * (canvas.height/r.height) };
    }
    function start(e) { drawing = true; const p = point(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }
    function move(e) { if (!drawing) return; e.preventDefault(); const p = point(e); ctx.strokeStyle = currentColor; ctx.lineTo(p.x, p.y); ctx.stroke(); }
    function end() { drawing = false; }
    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    canvas.addEventListener('touchstart', start, { passive:true });
    canvas.addEventListener('touchmove', move, { passive:false });
    canvas.addEventListener('touchend', end, { passive:true });

    clearBtn.addEventListener('click', () => { ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); });
    finishBtn.addEventListener('click', () => finishPanel(panel, 'Շատ սիրուն աշխատանք ստացվեց 🎨', 2));
  }

  function finishPanel(panel, text, reward) {
    if (panel.querySelector('.score-badge')) return;
    const badge = document.createElement('div');
    badge.className = 'score-badge';
    badge.textContent = text;
    const replay = document.createElement('button');
    replay.className = 'primary-action';
    replay.textContent = 'Կրկին խաղալ';
    replay.addEventListener('click', () => renderGame(currentGame));
    panel.appendChild(badge);
    if (reward) addStars(reward);
    panel.appendChild(replay);
  }

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

  avatarButton.addEventListener('click', () => { playTap(); avatarModal.hidden = false; });
  $$('[data-close="avatar"]').forEach(el => el.addEventListener('click', () => { playTap(); avatarModal.hidden = true; }));
  photoInput.addEventListener('change', async () => {
    const file = photoInput.files?.[0]; if (!file) return; sourceDataUrl = await downscaleImage(file, 1800);
    cropImage.onload = () => { naturalW = cropImage.naturalWidth; naturalH = cropImage.naturalHeight; zoom = 1; panX = 0; panY = 0; zoomSlider.value = '1'; cropImage.hidden = false; cropPlaceholder.hidden = true; saveAvatar.disabled = false; renderCrop(); };
    cropImage.src = sourceDataUrl;
  });
  function previewSize() { return cropPreview.clientWidth - 16; }
  function baseFit() { const s = previewSize(); return Math.max(s / naturalW, s / naturalH); }
  function renderCrop() {
    if (!naturalW || !naturalH) return;
    const s = previewSize(); const fit = baseFit(); const w = naturalW * fit * zoom; const h = naturalH * fit * zoom;
    cropImage.style.width = `${w}px`; cropImage.style.height = `${h}px`; cropImage.style.left = `${(s-w)/2 + 8 + panX}px`; cropImage.style.top = `${(s-h)/2 + 8 + panY}px`;
  }
  zoomSlider.addEventListener('input', () => { zoom = Number(zoomSlider.value); renderCrop(); });
  $('#zoomOut').addEventListener('click', () => { zoom = Math.max(.4, zoom - .15); zoomSlider.value = zoom; renderCrop(); });
  $('#zoomIn').addEventListener('click', () => { zoom = Math.min(4, zoom + .15); zoomSlider.value = zoom; renderCrop(); });
  cropPreview.addEventListener('pointerdown', e => {
    if (!sourceDataUrl) return; cropPreview.setPointerCapture?.(e.pointerId); pointerMap.set(e.pointerId, { x:e.clientX, y:e.clientY });
    if (pointerMap.size === 1) dragStart = { x:e.clientX, y:e.clientY, panX, panY };
    if (pointerMap.size === 2) { const pts = [...pointerMap.values()]; pinchStart = { distance:dist(pts[0], pts[1]), zoom }; }
  });
  cropPreview.addEventListener('pointermove', e => {
    if (!pointerMap.has(e.pointerId)) return; pointerMap.set(e.pointerId, { x:e.clientX, y:e.clientY });
    if (pointerMap.size === 1 && dragStart) { panX = dragStart.panX + (e.clientX - dragStart.x); panY = dragStart.panY + (e.clientY - dragStart.y); renderCrop(); }
    else if (pointerMap.size === 2 && pinchStart) { const pts = [...pointerMap.values()]; const ratio = dist(pts[0], pts[1]) / Math.max(1, pinchStart.distance); zoom = Math.max(.4, Math.min(4, pinchStart.zoom * ratio)); zoomSlider.value = zoom; renderCrop(); }
  });
  ['pointerup','pointercancel','pointerout'].forEach(type => cropPreview.addEventListener(type, e => {
    pointerMap.delete(e.pointerId); if (pointerMap.size < 2) pinchStart = null; if (pointerMap.size === 0) dragStart = null; if (pointerMap.size === 1) { const [p] = pointerMap.values(); dragStart = { x:p.x, y:p.y, panX, panY }; }
  }));
  saveAvatar.addEventListener('click', async () => {
    if (!sourceDataUrl) return; const data = await renderSavedAvatar(); localStorage.setItem(AVATAR_KEY, data); localStorage.setItem(AVATAR_SOURCE_KEY, sourceDataUrl); savedAvatar.src = data; savedAvatar.hidden = false; avatarModal.hidden = true; showToast('Պահպանված է');
  });
  function dist(a,b) { return Math.hypot(a.x-b.x, a.y-b.y); }
  async function renderSavedAvatar() {
    const out = 512; const c = document.createElement('canvas'); c.width = c.height = out; const ctx = c.getContext('2d'); const im = new Image();
    await new Promise((res, rej) => { im.onload = res; im.onerror = rej; im.src = sourceDataUrl; });
    const s = previewSize(); const fit = Math.max(s / im.naturalWidth, s / im.naturalHeight); const w = im.naturalWidth * fit * zoom; const h = im.naturalHeight * fit * zoom; const k = out / s;
    ctx.save(); ctx.beginPath(); ctx.arc(out/2, out/2, out/2, 0, Math.PI*2); ctx.clip(); ctx.drawImage(im, ((s-w)/2 + panX)*k, ((s-h)/2 + panY)*k, w*k, h*k); ctx.restore();
    return c.toDataURL('image/jpeg', .9);
  }
  async function downscaleImage(file, maxSide) { const raw = await fileToDataUrl(file); const im = new Image(); await new Promise((res, rej) => { im.onload = res; im.onerror = rej; im.src = raw; }); const scale = Math.min(1, maxSide / Math.max(im.naturalWidth, im.naturalHeight)); if (scale === 1) return raw; const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * scale); c.height = Math.round(im.naturalHeight * scale); c.getContext('2d').drawImage(im,0,0,c.width,c.height); return c.toDataURL('image/jpeg', .9); }
  function fileToDataUrl(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); }); }

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove('show'), 1200);
  }

  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
})();
