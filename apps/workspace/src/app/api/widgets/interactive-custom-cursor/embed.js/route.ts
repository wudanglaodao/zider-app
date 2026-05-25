import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const url = request.nextUrl;
  const instanceId = url.searchParams.get("instanceId");
  const platform = url.searchParams.get("platform") ?? "wix";
  const configUrl = new URL("/api/widgets/interactive-custom-cursor/config", getWorkspaceRuntimeBaseUrl(request.url));

  if (instanceId) {
    configUrl.searchParams.set("platform", platform);
    configUrl.searchParams.set("instanceId", instanceId);
  }

  const script = instanceId
    ? getEmbedScript(configUrl.toString())
    : "console.warn('[Zider] Interactive Custom Cursor skipped: missing instanceId.');";

  return new NextResponse(script, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
      "Content-Type": "application/javascript; charset=utf-8",
    },
  });
}

function getWorkspaceRuntimeBaseUrl(requestUrl: string) {
  return requestUrl;
}

function getEmbedScript(configUrl: string) {
  return `(function(){
  var CONFIG_URL = ${JSON.stringify(configUrl)};
  var TARGET_SELECTORS = 'a,button,[role="button"],input[type="button"],input[type="submit"],[data-zider-cursor]';
  var DISABLED_SELECTOR = '[data-zider-cursor-disabled]';
  var previous = window.__ZIDER_INTERACTIVE_CUSTOM_CURSOR__;
  if (previous && typeof previous.destroy === 'function') previous.destroy();

  fetch(CONFIG_URL, { credentials: 'omit' })
    .then(function(response){ return response.ok ? response.json() : Promise.reject(new Error('Config request failed')); })
    .then(function(payload){ mount(payload.config || {}); })
    .catch(function(error){ console.warn('[Zider] Interactive Custom Cursor failed:', error); });

  function mount(config) {
    config = normalize(config);
    if (!config.enabled) return;
    if (config.disableMobile && (matchMedia('(pointer: coarse)').matches || matchMedia('(hover: none)').matches || navigator.maxTouchPoints > 0)) return;

    var root = document.createElement('div');
    var style = document.createElement('style');
    var dot = document.createElement('div');
    var ring = document.createElement('div');
    var asset = document.createElement('div');
    var label = document.createElement('div');
    var visible = false;
    var hovering = false;
    var hoverTarget = null;
    var x = 0;
    var y = 0;
    var ringX = 0;
    var ringY = 0;
    var raf = 0;
    var previousCursor = document.body.style.cursor;

    root.id = 'zider-interactive-custom-cursor';
    root.append(style, ring, dot, asset, label);
    style.textContent = css();
    dot.className = 'zider-icc-dot';
    ring.className = 'zider-icc-ring';
    asset.className = 'zider-icc-asset';
    label.className = 'zider-icc-label';
    document.body.appendChild(root);
    document.body.style.cursor = 'none';
    applyConfig();

    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerover', onOver, true);
    document.addEventListener('pointerleave', onLeave, true);
    document.addEventListener('pointerdown', onDown, true);
    raf = requestAnimationFrame(render);

    window.__ZIDER_INTERACTIVE_CUSTOM_CURSOR__ = {
      destroy: destroy
    };

    function destroy() {
      cancelAnimationFrame(raf);
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerover', onOver, true);
      document.removeEventListener('pointerleave', onLeave, true);
      document.removeEventListener('pointerdown', onDown, true);
      document.body.style.cursor = previousCursor;
      root.remove();
    }

    function onMove(event) {
      visible = true;
      x = event.clientX;
      y = event.clientY;
    }

    function onOver(event) {
      hoverTarget = findHoverTarget(event.target);
      hovering = Boolean(hoverTarget);
      root.classList.toggle('is-hovering', hovering);
      applyConfig();
    }

    function onLeave() {
      visible = false;
      hovering = false;
      hoverTarget = null;
      root.classList.remove('is-visible', 'is-hovering');
    }

    function onDown(event) {
      if (config.clickEffect !== 'pulse') return;
      var pulse = document.createElement('div');
      pulse.className = 'zider-icc-pulse';
      pulse.style.transform = move(event.clientX, event.clientY, 1);
      root.appendChild(pulse);
      setTimeout(function(){ pulse.remove(); }, config.interaction.pulseDuration + 40);
    }

    function findHoverTarget(target) {
      if (!target || !target.closest) return null;
      if (target.closest(DISABLED_SELECTOR)) return null;
      return target.closest(TARGET_SELECTORS);
    }

    function applyConfig() {
      var linkHover = hovering && config.linkStyle.enabled;
      var cursorType = linkHover ? config.linkStyle.cursorType : config.cursorType;
      var cursorSize = linkHover ? config.linkStyle.cursorSize : config.cursorSize;
      var borderWidth = linkHover ? config.linkStyle.borderWidth : config.borderWidth;
      var hoverColor = linkHover ? config.linkStyle.hoverColor : config.hoverColor;
      var hoverText = linkHover ? config.linkStyle.hoverText : config.hoverText;
      var dotSize = Math.max(6, Math.round(cursorSize * 0.28));

      root.dataset.cursorType = cursorType;
      root.dataset.hoverEffect = config.hoverEffect;
      root.dataset.assetMode = config.customAsset.mode;
      root.style.setProperty('--zider-icc-size', cursorSize + 'px');
      root.style.setProperty('--zider-icc-dot-size', dotSize + 'px');
      root.style.setProperty('--zider-icc-border', borderWidth + 'px');
      root.style.setProperty('--zider-icc-primary', config.primaryColor);
      root.style.setProperty('--zider-icc-hover', hoverColor);
      root.style.setProperty('--zider-icc-opacity', String(config.defaultStyle.opacity));
      root.style.setProperty('--zider-icc-blend', config.defaultStyle.blendMode);
      root.style.setProperty('--zider-icc-glow', config.interaction.glowStrength + 'px');
      root.style.setProperty('--zider-icc-pulse-scale', String(config.interaction.pulseScale));
      root.style.setProperty('--zider-icc-pulse-duration', config.interaction.pulseDuration + 'ms');
      label.textContent = (hoverTarget && hoverTarget.getAttribute('data-zider-cursor-label')) || hoverText;
      dot.style.display = cursorType === 'dot' || cursorType === 'dot-ring' ? 'block' : 'none';
      ring.style.display = cursorType === 'ring' || cursorType === 'dot-ring' ? 'block' : 'none';
      syncAsset();
    }

    function syncAsset() {
      asset.style.display = config.customAsset.mode === 'none' ? 'none' : 'grid';
      if (config.customAsset.mode === 'logo' && config.customAsset.logoDataUrl) {
        asset.innerHTML = '';
        var img = document.createElement('img');
        img.alt = '';
        img.src = config.customAsset.logoDataUrl;
        asset.appendChild(img);
        return;
      }
      if (config.customAsset.mode === 'svg' && config.customAsset.svgMarkup) {
        asset.innerHTML = config.customAsset.svgMarkup;
        return;
      }
      if (config.customAsset.mode === 'icon') {
        asset.innerHTML = icon(config.customAsset.iconName);
        return;
      }
      asset.innerHTML = '';
    }

    function render() {
      root.classList.toggle('is-visible', visible);
      ringX += (x - ringX) * config.interaction.followSpeed;
      ringY += (y - ringY) * config.interaction.followSpeed;
      var dotScale = hovering && config.hoverEffect === 'scale' ? config.interaction.hoverScale : 1;
      var ringScale = hovering && config.hoverEffect === 'ring-expand' ? config.interaction.ringExpandScale : hovering ? config.interaction.hoverRingScale : 1;
      dot.style.transform = move(x, y, dotScale);
      asset.style.transform = move(x, y, dotScale);
      ring.style.transform = move(ringX, ringY, ringScale);
      label.style.transform = 'translate3d(' + (ringX + 18) + 'px,' + (ringY - 18) + 'px,0)';
      label.style.opacity = hovering && config.hoverEffect === 'text' && visible ? '1' : '0';
      raf = requestAnimationFrame(render);
    }
  }

  function move(x, y, scale) {
    return 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%) scale(' + scale + ')';
  }

  function normalize(config) {
    var defaults = {
      enabled: true,
      cursorType: 'dot-ring',
      cursorSize: 28,
      borderWidth: 1,
      primaryColor: '#111827',
      hoverColor: '#087a46',
      hoverText: 'CLICK',
      hoverEffect: 'scale',
      clickEffect: 'pulse',
      defaultStyle: { opacity: 1, blendMode: 'normal' },
      linkStyle: { enabled: true, cursorType: 'dot-ring', cursorSize: 36, borderWidth: 1, hoverColor: '#087a46', hoverText: 'OPEN' },
      customAsset: { mode: 'none', iconName: 'pointer', svgMarkup: '', logoDataUrl: '', logoName: '' },
      interaction: { followSpeed: 0.16, hoverScale: 1.8, ringExpandScale: 1.65, hoverRingScale: 1.22, glowStrength: 28, pulseScale: 2.25, pulseDuration: 520 },
      disableMobile: true,
      disableEditor: true,
      performanceMode: 'auto'
    };
    config = config || {};
    config.defaultStyle = Object.assign({}, defaults.defaultStyle, config.defaultStyle);
    config.linkStyle = Object.assign({}, defaults.linkStyle, config.linkStyle);
    config.customAsset = Object.assign({}, defaults.customAsset, config.customAsset);
    config.interaction = Object.assign({}, defaults.interaction, config.interaction);
    return Object.assign({}, defaults, config);
  }

  function icon(name) {
    if (name === 'sparkles') return '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15.4l-1.6-4.6L6 9.2l4.4-1.6L12 3Z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"/></svg>';
    if (name === 'wand') return '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" viewBox="0 0 24 24"><path d="m15 4 5 5"/><path d="M13 6 4 15l5 5 9-9"/><path d="m8 4 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z"/></svg>';
    if (name === 'circle-dot') return '<svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.8" fill="currentColor" stroke="none"/></svg>';
    return '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 3l13 9-6 1.1 3.7 5.3-2.8 1.7-3.5-5.2L6 20 5 3Z"/></svg>';
  }

  function css() {
    return '#zider-interactive-custom-cursor{--zider-icc-size:28px;--zider-icc-dot-size:8px;--zider-icc-border:1px;--zider-icc-primary:#111827;--zider-icc-hover:#087a46;--zider-icc-opacity:1;--zider-icc-blend:normal;--zider-icc-glow:28px;--zider-icc-pulse-scale:2.25;--zider-icc-pulse-duration:520ms;position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483647;overflow:hidden;pointer-events:none;opacity:0;transition:opacity 140ms ease;contain:layout style paint}#zider-interactive-custom-cursor.is-visible{opacity:var(--zider-icc-opacity)}.zider-icc-dot,.zider-icc-ring,.zider-icc-asset,.zider-icc-label,.zider-icc-pulse{position:absolute;top:0;left:0;pointer-events:none;will-change:transform,opacity;mix-blend-mode:var(--zider-icc-blend)}.zider-icc-dot{width:var(--zider-icc-dot-size);height:var(--zider-icc-dot-size);border-radius:999px;background:var(--zider-icc-primary);transition:background 160ms ease,box-shadow 160ms ease}.zider-icc-ring{width:var(--zider-icc-size);height:var(--zider-icc-size);border:var(--zider-icc-border) solid var(--zider-icc-primary);border-radius:999px;transition:border-color 160ms ease,box-shadow 160ms ease}#zider-interactive-custom-cursor.is-hovering .zider-icc-dot{background:var(--zider-icc-hover)}#zider-interactive-custom-cursor.is-hovering .zider-icc-ring{border-color:var(--zider-icc-hover)}#zider-interactive-custom-cursor[data-hover-effect="glow"].is-hovering .zider-icc-dot{box-shadow:0 0 var(--zider-icc-glow) color-mix(in srgb,var(--zider-icc-hover) 72%,transparent)}#zider-interactive-custom-cursor[data-hover-effect="glow"].is-hovering .zider-icc-ring{box-shadow:0 0 calc(var(--zider-icc-glow) * 1.18) color-mix(in srgb,var(--zider-icc-hover) 54%,transparent)}.zider-icc-asset{width:var(--zider-icc-size);height:var(--zider-icc-size);display:grid;place-items:center;color:var(--zider-icc-hover);opacity:.96}.zider-icc-asset svg,.zider-icc-asset img{width:76%;height:76%;display:block}.zider-icc-asset img{border-radius:999px;object-fit:cover;box-shadow:0 8px 24px rgba(0,0,0,.18)}.zider-icc-label{min-width:42px;color:var(--zider-icc-hover);font:700 11px/1 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;letter-spacing:.08em;text-transform:uppercase;text-shadow:0 0 18px color-mix(in srgb,var(--zider-icc-hover) 60%,transparent);opacity:0;transition:opacity 120ms ease}.zider-icc-pulse{width:var(--zider-icc-size);height:var(--zider-icc-size);border:1px solid var(--zider-icc-hover);border-radius:999px;animation:zider-icc-pulse var(--zider-icc-pulse-duration) ease-out forwards}@keyframes zider-icc-pulse{from{opacity:.8;scale:.7}to{opacity:0;scale:var(--zider-icc-pulse-scale)}}';
  }
})();`;
}
