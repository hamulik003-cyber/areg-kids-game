(() => {
  'use strict';

  const root = document.documentElement;
  const DESIGN_W = 709;
  const DESIGN_H = 1536;
  const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone === true;
  const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (!standalone || !isiOS) return;

  const probe = document.createElement('div');
  Object.assign(probe.style, {
    position: 'fixed',
    inset: '0',
    visibility: 'hidden',
    pointerEvents: 'none',
    paddingTop: 'env(safe-area-inset-top, 0px)',
    paddingRight: 'env(safe-area-inset-right, 0px)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    paddingLeft: 'env(safe-area-inset-left, 0px)'
  });
  document.documentElement.appendChild(probe);

  function applyFinalFit() {
    const vv = window.visualViewport;
    const viewportW = vv?.width || window.innerWidth;
    const viewportH = vv?.height || window.innerHeight;

    const sw = window.screen?.width || viewportW;
    const sh = window.screen?.height || viewportH;
    const portrait = viewportW <= viewportH;
    const fullW = portrait ? Math.min(sw, sh) : Math.max(sw, sh);
    const fullH = portrait ? Math.max(sw, sh) : Math.min(sw, sh);

    const cs = getComputedStyle(probe);
    let safeTop = parseFloat(cs.paddingTop) || 0;

    // Dynamic Island / notch fallback. WebKit sometimes reports env() as 0
    // on an installed Home Screen app during startup.
    const longSide = Math.max(sw, sh);
    const fallbackTop = longSide >= 900 ? 59 : longSide >= 852 ? 59 : longSide >= 812 ? 47 : 20;
    safeTop = Math.max(safeTop, fallbackTop);

    // Final PWA compromise for iPhone:
    // - background remains full-bleed edge-to-edge
    // - the complete approved 709x1536 composition starts BELOW the status bar
    // - it is scaled uniformly so its bottom lands exactly on the physical bottom
    // - no card is stretched or independently resized
    const scale = Math.min(fullW / DESIGN_W, (fullH - safeTop) / DESIGN_H);
    const renderedH = DESIGN_H * scale;

    root.classList.add('ios-standalone');
    root.style.setProperty('--app-h', `${fullH}px`);
    root.style.setProperty('--stage-scale', String(scale));
    root.style.setProperty('--stage-x', `${fullW / 2}px`);
    root.style.setProperty('--stage-y', `${safeTop + renderedH / 2}px`);

    // V8 moved individual HUD items. In V9 the whole master composition is
    // already below the status bar, so restore the exact master coordinates.
    root.style.setProperty('--avatar-safe-y', '0px');
    root.style.setProperty('--top-controls-safe-y', '0px');
  }

  applyFinalFit();

  // Run after the main app's own iOS measurements so this final fit wins.
  [60, 180, 650, 1400].forEach(ms => setTimeout(applyFinalFit, ms));
  window.addEventListener('pageshow', () => setTimeout(applyFinalFit, 0), { passive: true });
  window.addEventListener('resize', applyFinalFit, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(applyFinalFit, 120), { passive: true });
  window.visualViewport?.addEventListener('resize', applyFinalFit, { passive: true });
  window.visualViewport?.addEventListener('scroll', applyFinalFit, { passive: true });
})();
