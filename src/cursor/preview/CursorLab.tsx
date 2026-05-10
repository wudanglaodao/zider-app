"use client";

import {
  ChevronDown,
  CircleDot,
  MoreHorizontal,
  MousePointer2,
  Save,
  Send,
  Sparkles,
  Upload,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { WorkbenchShell } from "@/app/_components/WorkbenchShell";
import {
  CURSOR_PRESETS,
  DEFAULT_CURSOR_CONFIG,
  createCursorRuntime,
  normalizeCursorConfig,
  type CursorAssetMode,
  type CursorBlendMode,
  type CursorConfig,
  type CursorConfigInput,
  type CursorIconName,
  type CursorPreset,
  type CursorPresetId,
  type CursorRuntime,
  type CursorType,
  type HoverEffect,
} from "@/cursor/core";

const cursorTypes: { label: string; value: CursorType }[] = [
  { label: "Dot", value: "dot" },
  { label: "Ring", value: "ring" },
  { label: "Dot + Ring", value: "dot-ring" },
];

const hoverEffects: { label: string; value: Exclude<HoverEffect, "text"> }[] = [
  { label: "Scale", value: "scale" },
  { label: "Ring Expand", value: "ring-expand" },
  { label: "Glow", value: "glow" },
];

const blendModes: { label: string; value: CursorBlendMode }[] = [
  { label: "Normal", value: "normal" },
  { label: "Difference", value: "difference" },
  { label: "Screen", value: "screen" },
  { label: "Multiply", value: "multiply" },
];

const assetModes: { label: string; value: CursorAssetMode }[] = [
  { label: "None", value: "none" },
  { label: "Icon", value: "icon" },
  { label: "SVG", value: "svg" },
  { label: "Logo", value: "logo" },
];

const iconOptions: { iconName: CursorIconName; label: string; Icon: LucideIcon; svgMarkup: string }[] = [
  {
    iconName: "pointer",
    label: "Pointer",
    Icon: MousePointer2,
    svgMarkup:
      '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 3l13 9-6 1.1 3.7 5.3-2.8 1.7-3.5-5.2L6 20 5 3Z"/></svg>',
  },
  {
    iconName: "sparkles",
    label: "Sparkles",
    Icon: Sparkles,
    svgMarkup:
      '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15.4l-1.6-4.6L6 9.2l4.4-1.6L12 3Z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"/></svg>',
  },
  {
    iconName: "wand",
    label: "Magic",
    Icon: WandSparkles,
    svgMarkup:
      '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" viewBox="0 0 24 24"><path d="m15 4 5 5"/><path d="M13 6 4 15l5 5 9-9"/><path d="m8 4 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z"/></svg>',
  },
  {
    iconName: "circle-dot",
    label: "Orb",
    Icon: CircleDot,
    svgMarkup:
      '<svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.8" fill="currentColor" stroke="none"/></svg>',
  },
];

const hoverTexts = ["CLICK", "OPEN", "VIEW"] as const;
const ziderLogoUrl = "https://zider.ink/wp-content/uploads/2024/07/zider-def.png";
type PanelId = "preset" | "default" | "link" | "asset" | "interaction" | "guards";

export type CursorLabProps = {
  shell?: "workbench" | "embedded";
  initialConfig?: CursorConfigInput;
  installContext?: {
    appKey: string;
    platform: "wix" | "zider" | "direct";
    instanceId: string | null;
    instanceToken?: string | null;
    configEndpoint?: string;
  };
};

export function CursorLab({ shell = "workbench", initialConfig, installContext }: CursorLabProps = {}) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<CursorRuntime | null>(null);
  const [activePreset, setActivePreset] = useState<CursorPresetId>("studio-cursor");
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "published" | "error">("idle");
  const [collapsedPanels, setCollapsedPanels] = useState<PanelId[]>(["guards"]);
  const [config, setConfig] = useState<CursorConfig>(() =>
    normalizeCursorConfig({
      ...DEFAULT_CURSOR_CONFIG,
      ...CURSOR_PRESETS.find((preset) => preset.id === "studio-cursor")?.config,
      ...initialConfig,
    }),
  );

  useEffect(() => {
    if (!surfaceRef.current || runtimeRef.current) {
      return;
    }

    const runtime = createCursorRuntime({ scope: surfaceRef.current });
    runtime.mount(config);
    runtimeRef.current = runtime;

    return () => {
      runtime.destroy();
      runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    runtimeRef.current?.update(config);
  }, [config]);

  function applyPreset(presetId: CursorPresetId) {
    const preset = CURSOR_PRESETS.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    setActivePreset(presetId);
    updateConfig(preset.config);
  }

  function updateConfig(nextConfig: CursorConfigInput) {
    setConfig((current) =>
      normalizeCursorConfig({
        ...current,
        ...nextConfig,
        defaultStyle: {
          ...current.defaultStyle,
          ...nextConfig.defaultStyle,
        },
        linkStyle: {
          ...current.linkStyle,
          ...nextConfig.linkStyle,
        },
        customAsset: {
          ...current.customAsset,
          ...nextConfig.customAsset,
        },
        interaction: {
          ...current.interaction,
          ...nextConfig.interaction,
        },
      }),
    );
  }

  function togglePanel(panelId: PanelId) {
    setCollapsedPanels((current) =>
      current.includes(panelId) ? current.filter((item) => item !== panelId) : [...current, panelId],
    );
  }

  function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      updateConfig({
        customAsset: {
          mode: "logo",
          logoDataUrl: String(reader.result ?? ""),
          logoName: file.name,
        },
      });
    });
    reader.readAsDataURL(file);
  }

  async function persistConfig(mode: "draft" | "publish") {
    if (!installContext?.configEndpoint || !installContext.instanceId) {
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1800);
      return;
    }

    setSaveState("saving");

    try {
      const response = await fetch(installContext.configEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appKey: installContext.appKey,
          platform: installContext.platform,
          instanceId: installContext.instanceId,
          instanceToken: installContext.instanceToken,
          mode,
          config,
        }),
      });

      if (!response.ok) {
        throw new Error(`Save failed with ${response.status}`);
      }

      setSaveState(mode === "publish" ? "published" : "saved");
      window.setTimeout(() => setSaveState("idle"), 2200);
    } catch (error) {
      console.error(error);
      setSaveState("error");
    }
  }

  const isTextHoverEnabled = config.hoverEffect === "text";
  const isPanelOpen = (panelId: PanelId) => !collapsedPanels.includes(panelId);
  const previewPresets = CURSOR_PRESETS.slice(0, 2);
  const isHiddenPresetActive = !previewPresets.some((preset) => preset.id === activePreset);
  const previewHoverColor = config.linkStyle.enabled ? config.linkStyle.hoverColor : config.hoverColor;

  const content = (
      <div className="cursor-builder">
        <style>{getCursorBuilderCss()}</style>

        <header className="cursor-builder__header">
          <div>
            <div className="cursor-builder__brandline">
              <img alt="Zider" src={ziderLogoUrl} />
              <span>Create Widget</span>
            </div>
            <h1>Interactive Custom Cursor</h1>
            <p className="cursor-builder__subtitle">Design cursor behavior, link states, and install-ready styling from one platform-neutral config.</p>
          </div>
        </header>

        <div className="cursor-builder__toolbar" aria-label="Builder actions">
          <span aria-live="polite" className="cursor-builder__save-state" data-state={saveState}>
            {saveState === "saving"
              ? "Saving..."
              : saveState === "saved"
                ? "Saved"
                : saveState === "published"
                  ? "Published"
                  : saveState === "error"
                    ? "Save failed"
                    : null}
          </span>
          <button
            className="cursor-builder__save-button cursor-builder__save-button--secondary"
            disabled={saveState === "saving"}
            onClick={() => persistConfig("draft")}
            type="button"
          >
            <Save aria-hidden="true" size={17} />
            Save
          </button>
          <button className="cursor-builder__save-button" disabled={saveState === "saving"} onClick={() => persistConfig("publish")} type="button">
            <Send aria-hidden="true" size={17} />
            Publish
          </button>
        </div>

        <div className="cursor-builder__layout">
          <aside className="cursor-builder__inspector" aria-label="Cursor settings">
            <section className="cursor-builder__panel">
              <PanelHeader
                collapsed={!isPanelOpen("preset")}
                eyebrow="01"
                onToggle={() => togglePanel("preset")}
                title="Preset Library"
                value="Templates"
              />
              {isPanelOpen("preset") ? (
                <div className="cursor-builder__preset-list">
                  {previewPresets.map((preset) => (
                    <PresetButton active={activePreset === preset.id} key={preset.id} onClick={() => applyPreset(preset.id)} preset={preset} />
                  ))}
                  <button
                    className="cursor-builder__preset cursor-builder__preset--more"
                    data-active={isHiddenPresetActive}
                    onClick={() => setIsPresetModalOpen(true)}
                    type="button"
                  >
                    <span className="cursor-builder__preset-icon">
                      <MoreHorizontal aria-hidden="true" size={24} />
                    </span>
                    <strong>More</strong>
                  </button>
                </div>
              ) : null}
            </section>

            <section className="cursor-builder__panel">
              <PanelHeader
                collapsed={!isPanelOpen("default")}
                eyebrow="02"
                onToggle={() => togglePanel("default")}
                title="Default Style"
                value={`${config.cursorSize}px`}
              />
              {isPanelOpen("default") ? (
                <>
                  <SegmentedControl items={cursorTypes} value={config.cursorType} onChange={(cursorType) => updateConfig({ cursorType })} />
                  <RangeField label="Size" max={56} min={14} onChange={(cursorSize) => updateConfig({ cursorSize })} value={config.cursorSize} />
                  <RangeField label="Border" max={5} min={1} onChange={(borderWidth) => updateConfig({ borderWidth })} value={config.borderWidth} />
                  <div className="cursor-builder__color-grid">
                    <ColorField label="Primary" onChange={(primaryColor) => updateConfig({ primaryColor })} value={config.primaryColor} />
                    <ColorField label="Hover" onChange={(hoverColor) => updateConfig({ hoverColor })} value={config.hoverColor} />
                  </div>
                  <RangeField
                    formatValue={(value) => `${Math.round(value * 100)}%`}
                    label="Opacity"
                    max={1}
                    min={0.35}
                    onChange={(opacity) => updateConfig({ defaultStyle: { opacity } })}
                    step={0.05}
                    value={config.defaultStyle.opacity}
                  />
                  <SegmentedControl
                    items={blendModes}
                    value={config.defaultStyle.blendMode}
                    onChange={(blendMode) => updateConfig({ defaultStyle: { blendMode } })}
                  />
                </>
              ) : null}
            </section>

            <section className="cursor-builder__panel">
              <PanelHeader
                collapsed={!isPanelOpen("link")}
                eyebrow="03"
                onToggle={() => togglePanel("link")}
                title="Link Style"
                value={config.linkStyle.enabled ? "Custom" : "Default"}
              />
              {isPanelOpen("link") ? (
                <>
                  <ToggleRow checked={config.linkStyle.enabled} label="Separate link style" onChange={(enabled) => updateConfig({ linkStyle: { enabled } })} />
                  {config.linkStyle.enabled ? (
                    <div className="cursor-builder__nested">
                      <SegmentedControl
                        items={cursorTypes}
                        value={config.linkStyle.cursorType}
                        onChange={(cursorType) => updateConfig({ linkStyle: { cursorType } })}
                      />
                      <RangeField
                        label="Link size"
                        max={64}
                        min={18}
                        onChange={(cursorSize) => updateConfig({ linkStyle: { cursorSize } })}
                        value={config.linkStyle.cursorSize}
                      />
                      <RangeField
                        label="Link border"
                        max={5}
                        min={1}
                        onChange={(borderWidth) => updateConfig({ linkStyle: { borderWidth } })}
                        value={config.linkStyle.borderWidth}
                      />
                      <div className="cursor-builder__color-grid">
                        <ColorField
                          label="Link hover"
                          onChange={(hoverColor) => updateConfig({ linkStyle: { hoverColor } })}
                          value={config.linkStyle.hoverColor}
                        />
                        <TextField
                          label="Link text"
                          maxLength={18}
                          onChange={(hoverText) => updateConfig({ linkStyle: { hoverText } })}
                          value={config.linkStyle.hoverText}
                        />
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}
            </section>

            <section className="cursor-builder__panel">
              <PanelHeader
                collapsed={!isPanelOpen("asset")}
                eyebrow="04"
                onToggle={() => togglePanel("asset")}
                title="Cursor Asset"
                value={config.customAsset.mode}
              />
              {isPanelOpen("asset") ? (
                <>
                  <SegmentedControl
                    items={assetModes}
                    value={config.customAsset.mode}
                    onChange={(mode) => updateConfig({ customAsset: { mode } })}
                  />

                  {config.customAsset.mode === "icon" ? (
                    <div className="cursor-builder__icon-grid" aria-label="Icon library">
                      {iconOptions.map(({ Icon, iconName, label }) => (
                        <button
                          data-active={config.customAsset.iconName === iconName}
                          key={iconName}
                          onClick={() => updateConfig({ customAsset: { mode: "icon", iconName } })}
                          type="button"
                        >
                          <Icon aria-hidden="true" size={20} />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {config.customAsset.mode === "svg" ? (
                    <label className="cursor-builder__textarea">
                      <span>Custom SVG</span>
                      <textarea
                        onChange={(event) => updateConfig({ customAsset: { mode: "svg", svgMarkup: event.target.value } })}
                        placeholder={iconOptions[0].svgMarkup}
                        rows={5}
                        value={config.customAsset.svgMarkup}
                      />
                    </label>
                  ) : null}

                  {config.customAsset.mode === "logo" ? (
                    <div className="cursor-builder__upload">
                      <label>
                        <Upload aria-hidden="true" size={18} />
                        <span>Upload Logo</span>
                        <input accept="image/*" onChange={handleLogoUpload} type="file" />
                      </label>
                      {config.customAsset.logoDataUrl ? (
                        <div className="cursor-builder__logo-preview">
                          <img alt="" src={config.customAsset.logoDataUrl} />
                          <span>{config.customAsset.logoName || "Custom logo"}</span>
                        </div>
                      ) : (
                        <p>PNG, JPG, GIF, or SVG image files work best.</p>
                      )}
                    </div>
                  ) : null}
                </>
              ) : null}
            </section>

            <section className="cursor-builder__panel">
              <PanelHeader
                collapsed={!isPanelOpen("interaction")}
                eyebrow="05"
                onToggle={() => togglePanel("interaction")}
                title="Interaction"
                value={isTextHoverEnabled ? config.hoverText : config.hoverEffect}
              />
              {isPanelOpen("interaction") ? (
                <>
                  <SegmentedControl items={hoverEffects} value={isTextHoverEnabled ? "scale" : config.hoverEffect} onChange={(hoverEffect) => updateConfig({ hoverEffect })} />
                  <ToggleRow
                    checked={isTextHoverEnabled}
                    label="Text Hover"
                    onChange={(checked) => updateConfig({ hoverEffect: checked ? "text" : "scale" })}
                  />
                  {isTextHoverEnabled ? (
                    <div className="cursor-builder__text-tools">
                      <div className="cursor-builder__text-row" aria-label="Hover text presets">
                        {hoverTexts.map((text) => (
                          <button data-active={config.hoverText === text} key={text} onClick={() => updateConfig({ hoverText: text })} type="button">
                            {text}
                          </button>
                        ))}
                      </div>
                      <TextField label="Custom text" maxLength={18} onChange={(hoverText) => updateConfig({ hoverText })} value={config.hoverText} />
                    </div>
                  ) : null}
                  <div className="cursor-builder__param-grid">
                    <RangeField
                      formatValue={(value) => value.toFixed(2)}
                      label="Follow speed"
                      max={0.32}
                      min={0.08}
                      onChange={(followSpeed) => updateConfig({ interaction: { followSpeed } })}
                      step={0.01}
                      value={config.interaction.followSpeed}
                    />
                    <RangeField
                      formatValue={(value) => `${value.toFixed(2)}x`}
                      label="Hover scale"
                      max={2.8}
                      min={1}
                      onChange={(hoverScale) => updateConfig({ interaction: { hoverScale } })}
                      step={0.05}
                      value={config.interaction.hoverScale}
                    />
                    <RangeField
                      formatValue={(value) => `${value.toFixed(2)}x`}
                      label="Ring expand"
                      max={2.8}
                      min={1}
                      onChange={(ringExpandScale) => updateConfig({ interaction: { ringExpandScale } })}
                      step={0.05}
                      value={config.interaction.ringExpandScale}
                    />
                    <RangeField
                      label="Glow"
                      max={64}
                      min={8}
                      onChange={(glowStrength) => updateConfig({ interaction: { glowStrength } })}
                      value={config.interaction.glowStrength}
                    />
                    <RangeField
                      formatValue={(value) => `${value.toFixed(2)}x`}
                      label="Pulse scale"
                      max={3.6}
                      min={1.3}
                      onChange={(pulseScale) => updateConfig({ interaction: { pulseScale } })}
                      step={0.05}
                      value={config.interaction.pulseScale}
                    />
                    <RangeField
                      label="Pulse duration"
                      max={900}
                      min={240}
                      onChange={(pulseDuration) => updateConfig({ interaction: { pulseDuration } })}
                      step={20}
                      suffix="ms"
                      value={config.interaction.pulseDuration}
                    />
                  </div>
                </>
              ) : null}
            </section>

            <section className="cursor-builder__panel">
              <PanelHeader
                collapsed={!isPanelOpen("guards")}
                eyebrow="06"
                onToggle={() => togglePanel("guards")}
                title="Runtime Guards"
                value={config.performanceMode}
              />
              {isPanelOpen("guards") ? (
                <>
                  <ToggleRow checked={config.enabled} label="Enable cursor" onChange={(enabled) => updateConfig({ enabled })} />
                  <ToggleRow checked={config.disableMobile} label="Disable on mobile" onChange={(disableMobile) => updateConfig({ disableMobile })} />
                  <ToggleRow checked={config.disableEditor} label="Disable in editor" onChange={(disableEditor) => updateConfig({ disableEditor })} />
                </>
              ) : null}
            </section>
          </aside>

          <section className="cursor-builder__stage" aria-label="Cursor preview">
            <div className="cursor-builder__stage-head">
              <p>Preview</p>
              <span>{config.customAsset.mode === "none" ? "Scoped DOM runtime" : `${config.customAsset.mode} asset`}</span>
            </div>

            <div className="cursor-builder__preview-shell">
              <div className="cursor-builder__browser-bar" aria-hidden="true">
                <span />
                <span />
                <span />
                <strong>zider-preview.site</strong>
              </div>

              <div className="cursor-builder__surface" ref={surfaceRef} style={{ "--zider-hover-color": previewHoverColor } as CSSProperties}>
                <nav className="cursor-builder__surface-nav">
                  <a data-zider-cursor-label="OPEN" href="#work">
                    Work
                  </a>
                  <a data-zider-cursor-label="VIEW" href="#pricing">
                    Pricing
                  </a>
                  <button data-zider-cursor-label="CLICK" type="button">
                    Contact
                  </button>
                </nav>

                <section className="cursor-builder__hero-preview">
                  <p>Cursor layer</p>
                  <h3>Make ordinary links feel intentional.</h3>
                  <div className="cursor-builder__actions">
                    <button data-zider-cursor-label={config.hoverText} type="button">
                      Try hover
                    </button>
                    <a data-zider-cursor-label="VIEW" href="#gallery">
                      View examples
                    </a>
                  </div>
                </section>

                <div className="cursor-builder__example-grid" id="gallery">
                  <a data-zider-cursor-label="VIEW" href="#ai">
                    <span>AI Launch</span>
                    <strong>Glow CTA</strong>
                  </a>
                  <a data-zider-cursor-label={config.linkStyle.hoverText} href="#studio">
                    <span>Studio Site</span>
                    <strong>Text Hover</strong>
                  </a>
                  <button data-zider-cursor-label="CLICK" type="button">
                    <span>Brand Page</span>
                    <strong>Click Pulse</strong>
                  </button>
                </div>

                <p className="cursor-builder__mobile-note">Mobile installs stay off by default when a coarse pointer is detected.</p>
              </div>
            </div>
          </section>
        </div>

        <PresetTemplateModal
          activePreset={activePreset}
          onApply={(presetId) => {
            applyPreset(presetId);
            setIsPresetModalOpen(false);
          }}
          onClose={() => setIsPresetModalOpen(false)}
          open={isPresetModalOpen}
        />
      </div>
  );

  if (shell === "embedded") {
    return <main className="cursor-builder-shell cursor-builder-shell--embedded">{content}</main>;
  }

  return <WorkbenchShell active="cursor">{content}</WorkbenchShell>;
}

function PanelHeader({
  collapsed,
  eyebrow,
  onToggle,
  title,
  value,
}: {
  collapsed: boolean;
  eyebrow: string;
  onToggle: () => void;
  title: string;
  value?: string;
}) {
  return (
    <button aria-expanded={!collapsed} className="cursor-builder__panel-head" data-collapsed={collapsed} onClick={onToggle} type="button">
      <span className="cursor-builder__panel-title">
        <small>{eyebrow}</small>
        <strong>{title}</strong>
      </span>
      <span className="cursor-builder__panel-meta">
        {value ? <em>{value}</em> : null}
        <ChevronDown aria-hidden="true" size={18} />
      </span>
    </button>
  );
}

function PresetButton({ active, onClick, preset }: { active: boolean; onClick: () => void; preset: CursorPreset }) {
  return (
    <button className="cursor-builder__preset" data-active={active} onClick={onClick} type="button">
      <span className="cursor-builder__preset-swatch" style={presetSwatchStyle(preset.config)} />
      <strong>{preset.name}</strong>
    </button>
  );
}

function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="cursor-builder__segmented">
      {items.map((item) => (
        <button data-active={value === item.value} key={item.value} onClick={() => onChange(item.value)} type="button">
          {item.label}
        </button>
      ))}
    </div>
  );
}

function RangeField({
  formatValue,
  label,
  max,
  min,
  onChange,
  step = 1,
  suffix = "px",
  value,
}: {
  formatValue?: (value: number) => string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step?: number;
  suffix?: string;
  value: number;
}) {
  return (
    <label className="cursor-builder__range">
      <span>{label}</span>
      <output>{formatValue ? formatValue(value) : `${value}${suffix}`}</output>
      <input max={max} min={min} onChange={(event) => onChange(Number(event.target.value))} step={step} type="range" value={value} />
    </label>
  );
}

function ColorField({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="cursor-builder__color">
      <span>{label}</span>
      <input onChange={(event) => onChange(event.target.value)} type="color" value={value} />
    </label>
  );
}

function TextField({
  label,
  maxLength,
  onChange,
  value,
}: {
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="cursor-builder__text-input">
      <span>{label}</span>
      <input maxLength={maxLength} onChange={(event) => onChange(event.target.value)} placeholder="TYPE TEXT" type="text" value={value} />
    </label>
  );
}

function ToggleRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="cursor-builder__toggle">
      <span>{label}</span>
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <i aria-hidden="true" className="cursor-builder__switch" />
    </label>
  );
}

function PresetTemplateModal({
  activePreset,
  onApply,
  onClose,
  open,
}: {
  activePreset: CursorPresetId;
  onApply: (presetId: CursorPresetId) => void;
  onClose: () => void;
  open: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="cursor-builder__modal" aria-modal="true" role="dialog" aria-labelledby="preset-modal-title" onClick={onClose}>
      <div className="cursor-builder__modal-sheet" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <p>Preset templates</p>
            <h2 id="preset-modal-title">Choose a cursor style</h2>
          </div>
          <button aria-label="Close presets" onClick={onClose} type="button">
            x
          </button>
        </header>
        <div className="cursor-builder__modal-grid">
          {CURSOR_PRESETS.map((preset) => (
            <button data-active={activePreset === preset.id} key={preset.id} onClick={() => onApply(preset.id)} type="button">
              <span className="cursor-builder__preset-swatch" style={presetSwatchStyle(preset.config)} />
              <strong>{preset.name}</strong>
              <small>{preset.bestFor}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function presetSwatchStyle(config: CursorConfigInput): CSSProperties {
  return {
    "--primary": config.primaryColor ?? DEFAULT_CURSOR_CONFIG.primaryColor,
    "--hover": config.hoverColor ?? config.linkStyle?.hoverColor ?? DEFAULT_CURSOR_CONFIG.hoverColor,
  } as CSSProperties;
}

function getCursorBuilderCss() {
  return `
    .cursor-builder {
      width: 100%;
      max-width: 1760px;
      min-width: 0;
      margin: 0 auto;
    }

    .cursor-builder-shell--embedded {
      min-height: 100vh;
      padding: 30px clamp(18px, 4vw, 56px);
      background:
        linear-gradient(115deg, rgba(8, 122, 70, 0.035) 0 1px, transparent 1px 148px),
        linear-gradient(90deg, rgba(13, 23, 19, 0.018) 1px, transparent 1px),
        linear-gradient(rgba(13, 23, 19, 0.014) 1px, transparent 1px),
        #fbfcf8;
      background-size: 40px 40px;
      color: #0d1713;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .cursor-builder,
    .cursor-builder * {
      box-sizing: border-box;
    }

    .cursor-builder__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 28px;
      margin-bottom: 14px;
    }

    .cursor-builder__brandline,
    .cursor-builder__stage-head p,
    .cursor-builder__hero-preview p {
      margin: 0;
      color: #087a46;
      font-size: 11px;
      font-weight: 850;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .cursor-builder__brandline {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .cursor-builder__brandline img {
      width: 78px;
      height: auto;
      display: block;
    }

    .cursor-builder__brandline span {
      min-height: 25px;
      display: inline-flex;
      align-items: center;
      border: 1px solid rgba(8, 122, 70, 0.18);
      border-radius: 999px;
      background: #e8f7ee;
      color: #087a46;
      padding: 0 10px;
    }

    .cursor-builder h1,
    .cursor-builder h2,
    .cursor-builder h3,
    .cursor-builder p {
      letter-spacing: 0;
    }

    .cursor-builder h1 {
      margin: 8px 0 0;
      color: #111318;
      font-size: clamp(26px, 2.35vw, 34px);
      line-height: 1.06;
      overflow-wrap: break-word;
    }

    .cursor-builder__subtitle {
      max-width: 780px;
      margin: 12px 0 0;
      color: #54565f;
      font-size: 14px;
      line-height: 1.38;
    }

    .cursor-builder__panel-meta em,
    .cursor-builder__stage-head span {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      border-radius: 999px;
      background: #e8f7ee;
      color: #087a46;
      padding: 0 11px;
      font-size: 12px;
      font-style: normal;
      font-weight: 800;
    }

    .cursor-builder__toolbar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 18px;
    }

    .cursor-builder__save-state {
      min-width: 76px;
      color: #087a46;
      font-size: 13px;
      font-weight: 780;
      text-align: right;
    }

    .cursor-builder__save-state[data-state="error"] {
      color: #c2410c;
    }

    .cursor-builder__save-button {
      min-height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid #087a46;
      border-radius: 6px;
      padding: 0 16px;
      background: #087a46;
      color: #ffffff;
      cursor: pointer;
      font-weight: 760;
      box-shadow: 0 12px 24px rgba(8, 122, 70, 0.2);
      transition: background 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
    }

    .cursor-builder__save-button:disabled {
      cursor: wait;
      opacity: 0.7;
      transform: none;
    }

    .cursor-builder__save-button:hover {
      background: #045f35;
      transform: translateY(-1px);
      box-shadow: 0 16px 30px rgba(8, 122, 70, 0.28);
    }

    .cursor-builder__save-button--secondary {
      border-color: #d9e2db;
      background: rgba(255, 255, 255, 0.8);
      color: #0d1713;
      box-shadow: none;
    }

    .cursor-builder__save-button--secondary:hover {
      border-color: rgba(8, 122, 70, 0.28);
      background: #ffffff;
      color: #087a46;
      box-shadow: 0 10px 22px rgba(13, 23, 19, 0.07);
    }

    .cursor-builder__layout {
      display: grid;
      grid-template-columns: minmax(440px, 500px) minmax(0, 1fr);
      gap: 22px;
      align-items: start;
    }

    .cursor-builder__layout > * {
      min-width: 0;
    }

    .cursor-builder__inspector {
      display: grid;
      gap: 12px;
    }

    .cursor-builder__panel,
    .cursor-builder__stage {
      border: 1px solid #e5e6ec;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 1px 0 rgba(17, 19, 24, 0.02);
    }

    .cursor-builder__panel {
      padding: 14px;
    }

    .cursor-builder__panel-head {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border: 0;
      background: transparent;
      color: inherit;
      padding: 0;
      margin: 0 0 12px;
      text-align: left;
      cursor: pointer;
    }

    .cursor-builder__panel-title small {
      display: block;
      margin-bottom: 4px;
      color: #85868f;
      font-size: 11px;
      font-weight: 850;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .cursor-builder__panel-title strong {
      display: block;
      color: #111318;
      font-size: 17px;
      line-height: 1.1;
    }

    .cursor-builder__panel-meta {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #70727d;
    }

    .cursor-builder__panel-head[data-collapsed="true"] {
      margin-bottom: 0;
    }

    .cursor-builder__panel-head[data-collapsed="true"] svg {
      transform: rotate(-90deg);
    }

    .cursor-builder__panel-head svg {
      transition: transform 160ms ease;
    }

    .cursor-builder__preset-list {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .cursor-builder__preset {
      width: 100%;
      min-height: 78px;
      display: grid;
      justify-items: center;
      align-content: center;
      gap: 7px;
      border: 1px solid #e4e5ec;
      border-radius: 7px;
      background: #ffffff;
      color: #242630;
      padding: 10px 8px;
      text-align: center;
      cursor: pointer;
      transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
    }

    .cursor-builder__preset:hover,
    .cursor-builder__preset[data-active="true"] {
      border-color: rgba(8, 122, 70, 0.32);
      background: #fbfbff;
      box-shadow: 0 12px 28px rgba(35, 37, 47, 0.07);
      transform: translateY(-1px);
    }

    .cursor-builder__preset[data-active="true"] {
      box-shadow: inset 0 0 0 1px rgba(8, 122, 70, 0.16), 0 12px 28px rgba(35, 37, 47, 0.06);
    }

    .cursor-builder__preset-swatch,
    .cursor-builder__preset-icon {
      width: 32px;
      height: 32px;
      border-radius: 999px;
    }

    .cursor-builder__preset-swatch {
      background:
        radial-gradient(circle at 34% 36%, var(--hover) 0 22%, transparent 23%),
        conic-gradient(from 120deg, var(--primary), var(--hover), var(--primary));
      box-shadow: inset 0 0 0 8px #ffffff, 0 8px 18px rgba(15, 17, 28, 0.12);
    }

    .cursor-builder__preset-icon {
      display: grid;
      place-items: center;
      background: #f2f4f3;
      color: #087a46;
    }

    .cursor-builder__preset strong {
      color: #15171f;
      font-size: 12px;
      line-height: 1.15;
    }

    .cursor-builder__segmented,
    .cursor-builder__text-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(84px, 1fr));
      gap: 8px;
    }

    .cursor-builder__segmented button,
    .cursor-builder__text-row button,
    .cursor-builder__icon-grid button {
      min-height: 38px;
      border: 1px solid #e1e2e9;
      border-radius: 6px;
      background: #f7f7fa;
      color: #454751;
      cursor: pointer;
      font-size: 13px;
      font-weight: 760;
      transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, color 160ms ease;
    }

    .cursor-builder__segmented button:hover,
    .cursor-builder__text-row button:hover,
    .cursor-builder__icon-grid button:hover {
      color: #087a46;
      border-color: rgba(8, 122, 70, 0.24);
      background: #ffffff;
      transform: translateY(-1px);
    }

    .cursor-builder__segmented button[data-active="true"],
    .cursor-builder__text-row button[data-active="true"],
    .cursor-builder__icon-grid button[data-active="true"] {
      border-color: rgba(8, 122, 70, 0.48);
      background: #e8f7ee;
      color: #087a46;
    }

    .cursor-builder__nested,
    .cursor-builder__text-tools {
      display: grid;
      gap: 12px;
      margin-top: 12px;
    }

    .cursor-builder__range {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      color: #454751;
      font-size: 13px;
      font-weight: 760;
    }

    .cursor-builder__range input {
      grid-column: 1 / -1;
      width: 100%;
      accent-color: #087a46;
    }

    .cursor-builder__range output {
      color: #087a46;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      font-weight: 800;
    }

    .cursor-builder__color-grid,
    .cursor-builder__param-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin-top: 12px;
    }

    .cursor-builder__param-grid .cursor-builder__range {
      margin-top: 0;
    }

    .cursor-builder__color,
    .cursor-builder__text-input,
    .cursor-builder__textarea {
      display: grid;
      gap: 8px;
      color: #454751;
      font-size: 13px;
      font-weight: 760;
    }

    .cursor-builder__color input,
    .cursor-builder__text-input input,
    .cursor-builder__textarea textarea {
      width: 100%;
      border: 1px solid #dfe1e7;
      border-radius: 6px;
      background: #ffffff;
      color: #14161d;
      outline: 0;
      font-weight: 760;
    }

    .cursor-builder__color input {
      height: 42px;
      cursor: pointer;
    }

    .cursor-builder__text-input input {
      min-height: 42px;
      padding: 0 12px;
    }

    .cursor-builder__textarea {
      margin-top: 12px;
    }

    .cursor-builder__textarea textarea {
      min-height: 120px;
      padding: 10px 12px;
      resize: vertical;
      font: 650 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    .cursor-builder__text-input input:focus,
    .cursor-builder__textarea textarea:focus {
      border-color: rgba(8, 122, 70, 0.58);
      box-shadow: 0 0 0 4px rgba(8, 122, 70, 0.1);
    }

    .cursor-builder__toggle {
      min-height: 38px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-top: 12px;
      color: #454751;
      font-size: 13px;
      font-weight: 760;
      cursor: pointer;
      position: relative;
    }

    .cursor-builder__toggle input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    }

    .cursor-builder__switch {
      width: 46px;
      height: 26px;
      flex: 0 0 auto;
      border-radius: 999px;
      background: #dfe2e6;
      box-shadow: inset 0 0 0 1px rgba(17, 19, 24, 0.08);
      position: relative;
      transition: background 160ms ease, box-shadow 160ms ease;
    }

    .cursor-builder__switch::before {
      content: "";
      position: absolute;
      top: 4px;
      left: 4px;
      width: 18px;
      height: 18px;
      border-radius: 999px;
      background: #ffffff;
      box-shadow: 0 2px 5px rgba(17, 19, 24, 0.18);
      transition: transform 160ms ease;
    }

    .cursor-builder__toggle input:checked + .cursor-builder__switch {
      background: #087a46;
      box-shadow: inset 0 0 0 1px rgba(8, 122, 70, 0.22), 0 8px 16px rgba(8, 122, 70, 0.14);
    }

    .cursor-builder__toggle input:checked + .cursor-builder__switch::before {
      transform: translateX(20px);
    }

    .cursor-builder__icon-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      margin-top: 12px;
    }

    .cursor-builder__icon-grid button {
      min-height: 60px;
      display: grid;
      place-items: center;
      gap: 4px;
      padding: 8px;
    }

    .cursor-builder__icon-grid span {
      font-size: 11px;
    }

    .cursor-builder__upload {
      display: grid;
      gap: 12px;
      margin-top: 12px;
    }

    .cursor-builder__upload label {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px dashed rgba(8, 122, 70, 0.34);
      border-radius: 7px;
      background: #f5fbf7;
      color: #087a46;
      cursor: pointer;
      font-weight: 800;
    }

    .cursor-builder__upload input {
      display: none;
    }

    .cursor-builder__upload p {
      margin: 0;
      color: #656770;
      font-size: 13px;
      line-height: 1.35;
    }

    .cursor-builder__logo-preview {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      color: #454751;
      font-size: 13px;
      font-weight: 760;
    }

    .cursor-builder__logo-preview img {
      width: 34px;
      height: 34px;
      border-radius: 999px;
      object-fit: cover;
      border: 1px solid #e1e2e9;
    }

    .cursor-builder__stage {
      min-width: 0;
      padding: 18px;
    }

    .cursor-builder__stage-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 24px;
      margin-bottom: 12px;
    }

    .cursor-builder__preview-shell {
      min-width: 0;
      overflow: hidden;
      border: 1px solid #dfe0e7;
      border-radius: 8px;
      background: #0d0f18;
      box-shadow: 0 24px 64px rgba(16, 19, 32, 0.16);
    }

    .cursor-builder__browser-bar {
      height: 48px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.09);
      background: #151824;
      padding: 0 16px;
      color: rgba(248, 250, 252, 0.58);
      font-size: 12px;
    }

    .cursor-builder__browser-bar span {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #ff6b6b;
    }

    .cursor-builder__browser-bar span:nth-child(2) {
      background: #f9c74f;
    }

    .cursor-builder__browser-bar span:nth-child(3) {
      background: #5dd39e;
      margin-right: 10px;
    }

    .cursor-builder__surface {
      position: relative;
      min-height: 580px;
      overflow: hidden;
      padding: clamp(20px, 2.7vw, 34px);
      background:
        linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px),
        linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        radial-gradient(circle at 84% 18%, rgba(254, 240, 138, 0.13), transparent 28%),
        radial-gradient(circle at 16% 78%, rgba(8, 122, 70, 0.18), transparent 28%),
        #0d0f18;
      background-size: 34px 34px, 34px 34px, auto, auto, auto;
      color: #f8fafc;
      isolation: isolate;
    }

    .cursor-builder__surface::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.11), transparent 36%, rgba(255, 255, 255, 0.04));
      opacity: 0.56;
      z-index: -1;
    }

    .cursor-builder__surface-nav {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      min-height: 40px;
    }

    .cursor-builder__surface-nav a,
    .cursor-builder__surface-nav button,
    .cursor-builder__actions a,
    .cursor-builder__actions button,
    .cursor-builder__example-grid a,
    .cursor-builder__example-grid button {
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 7px;
      background: rgba(255, 255, 255, 0.06);
      color: #f8fafc;
      cursor: pointer;
      text-decoration: none;
      transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease;
    }

    .cursor-builder__surface-nav a,
    .cursor-builder__surface-nav button {
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      padding: 0 14px;
      font-size: 13px;
      font-weight: 760;
    }

    .cursor-builder__surface-nav a:hover,
    .cursor-builder__surface-nav button:hover,
    .cursor-builder__actions a:hover,
    .cursor-builder__actions button:hover,
    .cursor-builder__example-grid a:hover,
    .cursor-builder__example-grid button:hover {
      border-color: color-mix(in srgb, var(--zider-hover-color, #fef08a) 58%, #ffffff);
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-2px);
    }

    .cursor-builder__hero-preview {
      max-width: 760px;
      padding: min(8vh, 78px) 0 58px;
    }

    .cursor-builder__hero-preview h3 {
      margin: 12px 0 0;
      color: #ffffff;
      font-size: clamp(40px, 5.6vw, 72px);
      line-height: 0.95;
    }

    .cursor-builder__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 30px;
    }

    .cursor-builder__actions a,
    .cursor-builder__actions button {
      min-height: 48px;
      display: inline-flex;
      align-items: center;
      padding: 0 20px;
      font-weight: 820;
    }

    .cursor-builder__actions button {
      background: #f8fafc;
      color: #0d0f18;
    }

    .cursor-builder__example-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }

    .cursor-builder__example-grid a,
    .cursor-builder__example-grid button {
      min-height: 120px;
      display: grid;
      align-content: end;
      gap: 8px;
      padding: 18px;
      text-align: left;
    }

    .cursor-builder__example-grid a:nth-child(1) {
      background: linear-gradient(135deg, rgba(8, 122, 70, 0.2), rgba(255, 255, 255, 0.06));
    }

    .cursor-builder__example-grid a:nth-child(2) {
      background: linear-gradient(135deg, rgba(34, 211, 238, 0.16), rgba(255, 255, 255, 0.055));
    }

    .cursor-builder__example-grid button {
      background: linear-gradient(135deg, rgba(250, 204, 21, 0.14), rgba(255, 255, 255, 0.06));
    }

    .cursor-builder__example-grid span {
      color: rgba(248, 250, 252, 0.6);
      font-size: 13px;
      font-weight: 760;
    }

    .cursor-builder__example-grid strong {
      color: #ffffff;
      font-size: 22px;
      line-height: 1.12;
    }

    .cursor-builder__mobile-note {
      margin: 20px 0 0;
      color: rgba(248, 250, 252, 0.56);
      font-size: 13px;
    }

    .cursor-builder__modal {
      position: fixed;
      inset: 0;
      z-index: 60;
      display: grid;
      place-items: center;
      padding: 24px;
      background: rgba(13, 18, 16, 0.42);
      backdrop-filter: blur(8px);
    }

    .cursor-builder__modal-sheet {
      width: min(880px, 100%);
      border: 1px solid rgba(225, 226, 233, 0.86);
      border-radius: 8px;
      background: #ffffff;
      box-shadow: 0 28px 80px rgba(13, 23, 19, 0.18);
      padding: 22px;
    }

    .cursor-builder__modal-sheet header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 18px;
      border-bottom: 1px solid #eceef1;
      padding-bottom: 18px;
      margin-bottom: 18px;
    }

    .cursor-builder__modal-sheet p {
      margin: 0 0 6px;
      color: #087a46;
      font-size: 12px;
      font-weight: 850;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .cursor-builder__modal-sheet h2 {
      margin: 0;
      color: #111318;
      font-size: 28px;
      line-height: 1.1;
    }

    .cursor-builder__modal-sheet header button {
      width: 42px;
      height: 42px;
      border: 0;
      border-radius: 7px;
      background: #f2f3f2;
      color: #60625f;
      cursor: pointer;
      font-size: 30px;
      line-height: 1;
    }

    .cursor-builder__modal-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    .cursor-builder__modal-grid button {
      min-height: 130px;
      display: grid;
      justify-items: start;
      align-content: start;
      gap: 10px;
      border: 1px solid #e1e2e9;
      border-radius: 8px;
      background: #ffffff;
      color: #111318;
      padding: 16px;
      text-align: left;
      cursor: pointer;
    }

    .cursor-builder__modal-grid button:hover,
    .cursor-builder__modal-grid button[data-active="true"] {
      border-color: rgba(8, 122, 70, 0.36);
      background: #f8fcfa;
      box-shadow: 0 14px 34px rgba(13, 23, 19, 0.08);
    }

    .cursor-builder__modal-grid strong {
      font-size: 16px;
    }

    .cursor-builder__modal-grid small {
      color: #656770;
      font-size: 13px;
      line-height: 1.35;
    }

    @media (max-width: 1380px) {
      .cursor-builder__layout {
        grid-template-columns: minmax(400px, 460px) minmax(0, 1fr);
      }
    }

    @media (max-width: 1080px) {
      .cursor-builder__layout {
        grid-template-columns: 1fr;
      }

      .cursor-builder__inspector {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 760px) {
      .cursor-builder__header,
      .cursor-builder__stage-head {
        display: grid;
        min-width: 0;
      }

      .cursor-builder__brandline {
        flex-wrap: wrap;
      }

      .cursor-builder__toolbar {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      .cursor-builder__save-state {
        grid-column: 1 / -1;
        min-height: 18px;
        text-align: left;
      }

      .cursor-builder__save-button {
        min-width: 0;
      }

      .cursor-builder__inspector,
      .cursor-builder__modal-grid {
        grid-template-columns: 1fr;
      }

      .cursor-builder__preset-list,
      .cursor-builder__color-grid,
      .cursor-builder__param-grid {
        grid-template-columns: 1fr;
      }

      .cursor-builder__surface {
        min-height: 540px;
      }

      .cursor-builder__surface-nav {
        justify-content: flex-start;
        overflow-x: auto;
      }

      .cursor-builder__hero-preview h3 {
        font-size: clamp(40px, 16vw, 60px);
      }

      .cursor-builder__example-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
}
