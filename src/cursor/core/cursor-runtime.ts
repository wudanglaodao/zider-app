import { normalizeCursorConfig, type CursorConfig, type CursorConfigInput } from "./cursor-config";
import { DEFAULT_CURSOR_TARGET_SELECTORS, DISABLED_CURSOR_TARGET_SELECTOR } from "./cursor-targets";

export type CursorRuntime = {
  mount(config?: CursorConfigInput): void;
  update(config: CursorConfigInput): void;
  destroy(): void;
};

export type CursorRuntimeOptions = {
  scope?: HTMLElement;
  targetSelectors?: string[];
  isEditorContext?: () => boolean;
};

type CursorNodes = {
  root: HTMLDivElement;
  style: HTMLStyleElement;
  dot: HTMLDivElement;
  ring: HTMLDivElement;
  asset: HTMLDivElement;
  label: HTMLDivElement;
};

const ROOT_CLASS = "zider-cursor-root";
const DOT_CLASS = "zider-cursor-dot";
const RING_CLASS = "zider-cursor-ring";
const ASSET_CLASS = "zider-cursor-asset";
const LABEL_CLASS = "zider-cursor-label";
const PULSE_CLASS = "zider-cursor-pulse";

export function createCursorRuntime(options: CursorRuntimeOptions = {}): CursorRuntime {
  let config = normalizeCursorConfig();
  let scope: HTMLElement | null = null;
  let nodes: CursorNodes | null = null;
  let animationFrame = 0;
  let visible = false;
  let hovering = false;
  let disabled = false;
  let targetX = 0;
  let targetY = 0;
  let ringX = 0;
  let ringY = 0;
  let scopeRect: DOMRect | null = null;
  let previousCursor = "";
  let hoveredElement: Element | null = null;
  const selectors = options.targetSelectors ?? DEFAULT_CURSOR_TARGET_SELECTORS;

  function mount(initialConfig: CursorConfigInput = {}) {
    if (nodes) {
      update(initialConfig);
      return;
    }

    config = normalizeCursorConfig(initialConfig);
    scope = options.scope ?? document.body;
    disabled = shouldDisable();
    nodes = createNodes(scope);
    previousCursor = scope.style.cursor;
    scope.style.cursor = disabled ? previousCursor : "none";
    scope.appendChild(nodes.root);
    applyConfig();
    attachListeners();

    if (!disabled) {
      animationFrame = window.requestAnimationFrame(render);
    }
  }

  function update(nextConfig: CursorConfigInput) {
    config = normalizeCursorConfig({ ...config, ...nextConfig });
    const nextDisabled = shouldDisable();

    if (scope && nextDisabled !== disabled) {
      scope.style.cursor = nextDisabled ? previousCursor : "none";
    }

    disabled = nextDisabled;
    applyConfig();

    if (!disabled && !animationFrame) {
      animationFrame = window.requestAnimationFrame(render);
    }
  }

  function destroy() {
    detachListeners();

    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    if (scope) {
      scope.style.cursor = previousCursor;
    }

    nodes?.root.remove();
    nodes = null;
    scope = null;
    scopeRect = null;
    hoveredElement = null;
  }

  function shouldDisable() {
    if (!config.enabled) {
      return true;
    }

    if (config.disableMobile && isCoarsePointer()) {
      return true;
    }

    return Boolean(config.disableEditor && options.isEditorContext?.());
  }

  function isCoarsePointer() {
    return (
      window.matchMedia?.("(pointer: coarse)").matches ||
      window.matchMedia?.("(hover: none)").matches ||
      navigator.maxTouchPoints > 0
    );
  }

  function createNodes(host: HTMLElement): CursorNodes {
    const isPageScope = host === document.body || host === document.documentElement;
    const root = document.createElement("div");
    const style = document.createElement("style");
    const dot = document.createElement("div");
    const ring = document.createElement("div");
    const asset = document.createElement("div");
    const label = document.createElement("div");

    root.className = ROOT_CLASS;
    root.dataset.scope = isPageScope ? "page" : "local";
    style.textContent = getRuntimeCss();
    dot.className = DOT_CLASS;
    ring.className = RING_CLASS;
    asset.className = ASSET_CLASS;
    label.className = LABEL_CLASS;
    label.textContent = config.hoverText;

    root.append(style, ring, dot, asset, label);
    return { root, style, dot, ring, asset, label };
  }

  function applyConfig() {
    if (!nodes) {
      return;
    }

    const linkHoverEnabled = hovering && config.linkStyle.enabled;
    const activeCursorType = linkHoverEnabled ? config.linkStyle.cursorType : config.cursorType;
    const activeCursorSize = linkHoverEnabled ? config.linkStyle.cursorSize : config.cursorSize;
    const activeBorderWidth = linkHoverEnabled ? config.linkStyle.borderWidth : config.borderWidth;
    const activeHoverColor = linkHoverEnabled ? config.linkStyle.hoverColor : config.hoverColor;
    const activeHoverText = linkHoverEnabled ? config.linkStyle.hoverText : config.hoverText;
    const dotSize = Math.max(6, Math.round(activeCursorSize * 0.28));

    nodes.root.dataset.cursorType = activeCursorType;
    nodes.root.dataset.hoverEffect = config.hoverEffect;
    nodes.root.dataset.assetMode = config.customAsset.mode;
    nodes.root.dataset.disabled = String(disabled);
    nodes.root.style.setProperty("--zider-cursor-size", `${activeCursorSize}px`);
    nodes.root.style.setProperty("--zider-cursor-dot-size", `${dotSize}px`);
    nodes.root.style.setProperty("--zider-cursor-border", `${activeBorderWidth}px`);
    nodes.root.style.setProperty("--zider-cursor-primary", config.primaryColor);
    nodes.root.style.setProperty("--zider-cursor-hover", activeHoverColor);
    nodes.root.style.setProperty("--zider-cursor-opacity", `${config.defaultStyle.opacity}`);
    nodes.root.style.setProperty("--zider-cursor-blend", config.defaultStyle.blendMode);
    nodes.root.style.setProperty("--zider-cursor-glow", `${config.interaction.glowStrength}px`);
    nodes.root.style.setProperty("--zider-cursor-pulse-scale", `${config.interaction.pulseScale}`);
    nodes.root.style.setProperty("--zider-cursor-pulse-duration", `${config.interaction.pulseDuration}ms`);
    nodes.label.textContent = hoveredElement?.getAttribute("data-zider-cursor-label") || activeHoverText;

    const showDot = activeCursorType === "dot" || activeCursorType === "dot-ring";
    const showRing = activeCursorType === "ring" || activeCursorType === "dot-ring";
    const showAsset = config.customAsset.mode !== "none";

    nodes.dot.style.display = showDot ? "block" : "none";
    nodes.ring.style.display = showRing ? "block" : "none";
    nodes.asset.style.display = showAsset ? "grid" : "none";
    syncAssetNode(nodes.asset, config);
  }

  function attachListeners() {
    if (!scope) {
      return;
    }

    refreshScopeRect();
    scope.addEventListener("pointerenter", handlePointerEnter);
    scope.addEventListener("pointermove", handlePointerMove);
    scope.addEventListener("pointerleave", handlePointerLeave);
    scope.addEventListener("pointerover", handlePointerOver);
    scope.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", refreshScopeRect);
    window.addEventListener("scroll", refreshScopeRect, true);
  }

  function detachListeners() {
    if (!scope) {
      return;
    }

    scope.removeEventListener("pointerenter", handlePointerEnter);
    scope.removeEventListener("pointermove", handlePointerMove);
    scope.removeEventListener("pointerleave", handlePointerLeave);
    scope.removeEventListener("pointerover", handlePointerOver);
    scope.removeEventListener("pointerdown", handlePointerDown);
    window.removeEventListener("resize", refreshScopeRect);
    window.removeEventListener("scroll", refreshScopeRect, true);
  }

  function refreshScopeRect() {
    if (!scope || isPageScope()) {
      scopeRect = null;
      return;
    }

    scopeRect = scope.getBoundingClientRect();
  }

  function handlePointerEnter(event: PointerEvent) {
    refreshScopeRect();
    visible = true;
    setTargetFromEvent(event);
  }

  function handlePointerMove(event: PointerEvent) {
    if (disabled) {
      return;
    }

    visible = true;
    setTargetFromEvent(event);
  }

  function handlePointerLeave() {
    visible = false;
    hovering = false;
    hoveredElement = null;
    nodes?.root.classList.remove("is-visible", "is-hovering");
  }

  function handlePointerOver(event: PointerEvent) {
    if (disabled) {
      return;
    }

    hoveredElement = findHoverTarget(event.target);
    hovering = Boolean(hoveredElement);
    nodes?.root.classList.toggle("is-hovering", hovering);
    applyConfig();
  }

  function handlePointerDown(event: PointerEvent) {
    if (disabled || config.clickEffect !== "pulse") {
      return;
    }

    setTargetFromEvent(event);
    createPulse(targetX, targetY);
  }

  function setTargetFromEvent(event: PointerEvent) {
    if (isPageScope()) {
      targetX = event.clientX;
      targetY = event.clientY;
      return;
    }

    if (!scopeRect) {
      refreshScopeRect();
    }

    targetX = event.clientX - (scopeRect?.left ?? 0);
    targetY = event.clientY - (scopeRect?.top ?? 0);
  }

  function findHoverTarget(target: EventTarget | null) {
    if (!(target instanceof Element) || !scope) {
      return null;
    }

    if (target.closest(DISABLED_CURSOR_TARGET_SELECTOR)) {
      return null;
    }

    const matched = target.closest(selectors.join(","));

    if (!matched || !scope.contains(matched)) {
      return null;
    }

    return matched;
  }

  function createPulse(x: number, y: number) {
    if (!nodes) {
      return;
    }

    const pulse = document.createElement("div");
    pulse.className = PULSE_CLASS;
    pulse.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    nodes.root.appendChild(pulse);
    window.setTimeout(() => pulse.remove(), config.interaction.pulseDuration + 40);
  }

  function render() {
    animationFrame = 0;

    if (!nodes || disabled) {
      return;
    }

    nodes.root.classList.toggle("is-visible", visible);

    const easing =
      config.performanceMode === "low"
        ? Math.max(config.interaction.followSpeed, 0.22)
        : config.interaction.followSpeed;
    ringX += (targetX - ringX) * easing;
    ringY += (targetY - ringY) * easing;

    const dotScale = hovering && config.hoverEffect === "scale" ? config.interaction.hoverScale : 1;
    const ringScale =
      hovering && config.hoverEffect === "ring-expand"
        ? config.interaction.ringExpandScale
        : hovering
          ? config.interaction.hoverRingScale
          : 1;
    const labelVisible = hovering && config.hoverEffect === "text";

    nodes.dot.style.transform = moveTransform(targetX, targetY, dotScale);
    nodes.ring.style.transform = moveTransform(ringX, ringY, ringScale);
    nodes.asset.style.transform = moveTransform(targetX, targetY, dotScale);
    nodes.label.style.transform = `translate3d(${ringX + 18}px, ${ringY - 18}px, 0)`;
    nodes.label.style.opacity = labelVisible && visible ? "1" : "0";

    animationFrame = window.requestAnimationFrame(render);
  }

  function moveTransform(x: number, y: number, scale: number) {
    return `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
  }

  function isPageScope() {
    return scope === document.body || scope === document.documentElement;
  }

  return { mount, update, destroy };
}

function getRuntimeCss() {
  return `
    .${ROOT_CLASS} {
      --zider-cursor-size: 30px;
      --zider-cursor-dot-size: 8px;
      --zider-cursor-border: 1px;
      --zider-cursor-primary: #f8fafc;
      --zider-cursor-hover: #7dd3fc;
      --zider-cursor-opacity: 1;
      --zider-cursor-blend: normal;
      --zider-cursor-glow: 28px;
      --zider-cursor-pulse-scale: 2.25;
      --zider-cursor-pulse-duration: 520ms;
      position: absolute;
      inset: 0;
      z-index: 2147483647;
      overflow: hidden;
      pointer-events: none;
      opacity: 0;
      contain: layout style paint;
      transition: opacity 140ms ease;
    }

    .${ROOT_CLASS}[data-scope="page"] {
      position: fixed;
      width: 100vw;
      height: 100vh;
    }

    .${ROOT_CLASS}.is-visible {
      opacity: var(--zider-cursor-opacity);
    }

    .${ROOT_CLASS}[data-disabled="true"] {
      display: none;
    }

    .${DOT_CLASS},
    .${RING_CLASS},
    .${ASSET_CLASS},
    .${LABEL_CLASS},
    .${PULSE_CLASS} {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      will-change: transform, opacity;
      mix-blend-mode: var(--zider-cursor-blend);
    }

    .${DOT_CLASS} {
      width: var(--zider-cursor-dot-size);
      height: var(--zider-cursor-dot-size);
      border-radius: 999px;
      background: var(--zider-cursor-primary);
      box-shadow: 0 0 0 rgba(125, 211, 252, 0);
      transition: background 160ms ease, box-shadow 160ms ease;
    }

    .${RING_CLASS} {
      width: var(--zider-cursor-size);
      height: var(--zider-cursor-size);
      border: var(--zider-cursor-border) solid var(--zider-cursor-primary);
      border-radius: 999px;
      transition: border-color 160ms ease, box-shadow 160ms ease;
    }

    .${ROOT_CLASS}.is-hovering .${DOT_CLASS} {
      background: var(--zider-cursor-hover);
    }

    .${ROOT_CLASS}.is-hovering .${RING_CLASS} {
      border-color: var(--zider-cursor-hover);
    }

    .${ROOT_CLASS}[data-hover-effect="glow"].is-hovering .${DOT_CLASS} {
      box-shadow: 0 0 var(--zider-cursor-glow) color-mix(in srgb, var(--zider-cursor-hover) 72%, transparent);
    }

    .${ROOT_CLASS}[data-hover-effect="glow"].is-hovering .${RING_CLASS} {
      box-shadow: 0 0 calc(var(--zider-cursor-glow) * 1.18) color-mix(in srgb, var(--zider-cursor-hover) 54%, transparent);
    }

    .${ASSET_CLASS} {
      width: var(--zider-cursor-size);
      height: var(--zider-cursor-size);
      display: grid;
      place-items: center;
      color: var(--zider-cursor-hover);
      opacity: 0.96;
      transition: color 160ms ease, opacity 160ms ease, filter 160ms ease;
    }

    .${ASSET_CLASS} svg,
    .${ASSET_CLASS} img {
      width: 76%;
      height: 76%;
      display: block;
    }

    .${ASSET_CLASS} svg {
      overflow: visible;
    }

    .${ASSET_CLASS} img {
      border-radius: 999px;
      object-fit: cover;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    }

    .${ROOT_CLASS}[data-asset-mode="icon"] .${ASSET_CLASS},
    .${ROOT_CLASS}[data-asset-mode="svg"] .${ASSET_CLASS} {
      filter: drop-shadow(0 0 calc(var(--zider-cursor-glow) * 0.58) color-mix(in srgb, var(--zider-cursor-hover) 46%, transparent));
    }

    .${LABEL_CLASS} {
      min-width: 42px;
      color: var(--zider-cursor-hover);
      font: 700 11px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-shadow: 0 0 18px color-mix(in srgb, var(--zider-cursor-hover) 60%, transparent);
      opacity: 0;
      transition: opacity 120ms ease;
    }

    .${PULSE_CLASS} {
      width: var(--zider-cursor-size);
      height: var(--zider-cursor-size);
      border: 1px solid var(--zider-cursor-hover);
      border-radius: 999px;
      animation: zider-cursor-pulse var(--zider-cursor-pulse-duration) ease-out forwards;
    }

    @keyframes zider-cursor-pulse {
      from {
        opacity: 0.8;
        scale: 0.7;
      }

      to {
        opacity: 0;
        scale: var(--zider-cursor-pulse-scale);
      }
    }
  `;
}

function syncAssetNode(asset: HTMLDivElement, config: CursorConfig) {
  const { customAsset } = config;

  if (customAsset.mode === "logo" && customAsset.logoDataUrl) {
    asset.innerHTML = `<img alt="" src="${escapeHtmlAttribute(customAsset.logoDataUrl)}" />`;
    return;
  }

  if (customAsset.mode === "svg" && customAsset.svgMarkup.trim()) {
    asset.innerHTML = customAsset.svgMarkup;
    return;
  }

  if (customAsset.mode === "icon") {
    asset.innerHTML = getCursorIconMarkup(customAsset.iconName);
    return;
  }

  asset.innerHTML = "";
}

function escapeHtmlAttribute(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function getCursorIconMarkup(iconName: CursorConfig["customAsset"]["iconName"]) {
  switch (iconName) {
    case "sparkles":
      return `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15.4l-1.6-4.6L6 9.2l4.4-1.6L12 3Z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"/><path d="M5 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z"/></svg>`;
    case "wand":
      return `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" viewBox="0 0 24 24"><path d="m15 4 5 5"/><path d="M13 6 4 15l5 5 9-9"/><path d="m8 4 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z"/></svg>`;
    case "circle-dot":
      return `<svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.8" fill="currentColor" stroke="none"/></svg>`;
    case "pointer":
    default:
      return `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 3l13 9-6 1.1 3.7 5.3-2.8 1.7-3.5-5.2L6 20 5 3Z"/></svg>`;
  }
}
