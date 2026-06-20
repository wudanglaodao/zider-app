"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  CircleQuestionMark,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  type LucideIcon,
} from "lucide-react";

type WorkbenchSection = "dashboard" | "cursor" | "help";
type WorkbenchIconName = "close" | "dashboard" | "help" | "menu" | "panelClose" | "panelOpen";

const navSections: Array<{
  items: Array<{ href: string; icon: WorkbenchIconName; label: string; section?: WorkbenchSection }>;
  label: string;
}> = [
  {
    label: "Workspace",
    items: [{ href: "/", icon: "dashboard", label: "Dashboard", section: "dashboard" }],
  },
  {
    label: "Support",
    items: [{ href: "#help", icon: "help", label: "Help Center", section: "help" }],
  },
];

export function WorkbenchShell({
  active,
  children,
}: {
  active: WorkbenchSection;
  children: ReactNode;
  onCreate?: () => void;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const savedSidebar = window.localStorage.getItem("zider-workbench-sidebar-v1");

    if (savedSidebar === "collapsed") {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("zider-workbench-sidebar-v1", sidebarCollapsed ? "collapsed" : "expanded");
  }, [sidebarCollapsed]);

  function closeMobileSidebar() {
    setMobileSidebarOpen(false);
  }

  return (
    <div className="zider-workbench" data-mobile-sidebar={mobileSidebarOpen ? "open" : "closed"} data-sidebar={sidebarCollapsed ? "collapsed" : "expanded"}>
      <style>{getWorkbenchCss()}</style>

      <aside className="zider-workbench__sidebar" aria-label="Zider navigation">
        <div className="zider-workbench__brand-row">
          <a className="zider-workbench__logo" href="/" aria-label="Zider dashboard" onClick={closeMobileSidebar}>
            <span>Z</span>
          </a>
          <div className="zider-workbench__brand-copy">
            <strong>Zider</strong>
            <span>Widget Studio</span>
          </div>
          <button
            className="zider-workbench__icon-button"
            type="button"
            aria-label={mobileSidebarOpen ? "Close menu" : sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={mobileSidebarOpen ? "Close menu" : sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => {
              if (mobileSidebarOpen) {
                setMobileSidebarOpen(false);
                return;
              }
              setSidebarCollapsed((current) => !current);
            }}
          >
            <WorkbenchIcon name={mobileSidebarOpen ? "close" : sidebarCollapsed ? "panelOpen" : "panelClose"} />
          </button>
        </div>

        <nav className="zider-workbench__nav" aria-label="Workspace">
          {navSections.map((section) => (
            <div className="zider-workbench__nav-section" key={section.label}>
              <p className="zider-workbench__nav-title">{section.label}</p>
              {section.items.map((item) => {
                const isActive = item.section ? active === item.section : false;
                return (
                  <a
                    aria-current={isActive ? "page" : undefined}
                    className="zider-workbench__nav-item"
                    data-active={isActive}
                    href={item.href}
                    key={item.label}
                    onClick={closeMobileSidebar}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <span className="zider-workbench__nav-icon">
                      <WorkbenchIcon name={item.icon} />
                    </span>
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <button className="zider-workbench__mobile-backdrop" type="button" aria-label="Close menu" onClick={closeMobileSidebar} />

      <main className="zider-workbench__content">
        <button className="zider-workbench__mobile-menu" type="button" aria-label="Open menu" onClick={() => setMobileSidebarOpen(true)}>
          <WorkbenchIcon name="menu" />
        </button>
        {children}
      </main>
    </div>
  );
}

const workbenchIcons = {
  close: X,
  dashboard: LayoutDashboard,
  help: CircleQuestionMark,
  menu: Menu,
  panelClose: PanelLeftClose,
  panelOpen: PanelLeftOpen,
} satisfies Record<WorkbenchIconName, LucideIcon>;

function WorkbenchIcon({ name }: { name: WorkbenchIconName }) {
  const Icon = workbenchIcons[name];

  return <Icon aria-hidden="true" size={22} strokeWidth={2.2} />;
}

function getWorkbenchCss() {
  return `
    :root {
      color-scheme: light;
    }

    .zider-workbench,
    .zider-workbench *,
    .zider-workbench *::before,
    .zider-workbench *::after {
      box-sizing: border-box;
    }

    .zider-workbench {
      --zider-brand: #087a46;
      --zider-brand-strong: #046137;
      --zider-brand-soft: #e6f4ec;
      --zider-ink: #121817;
      --zider-muted: #65706d;
      --zider-line: #dde5df;
      --zider-sidebar-bg: #f8f9fa;
      --zider-surface: #ffffff;
      --zider-workspace-bg: #f8faf9;
      min-height: 100vh;
      display: grid;
      grid-template-columns: 264px minmax(0, 1fr);
      background:
        linear-gradient(90deg, rgba(13, 23, 19, 0.028) 1px, transparent 1px),
        linear-gradient(rgba(13, 23, 19, 0.02) 1px, transparent 1px),
        var(--zider-workspace-bg);
      background-size: 40px 40px;
      color: var(--zider-ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      overflow-x: hidden;
    }

    .zider-workbench[data-sidebar="collapsed"] {
      grid-template-columns: 88px minmax(0, 1fr);
    }

    .zider-workbench a {
      color: inherit;
      text-decoration: none;
    }

    .zider-workbench button,
    .zider-workbench input,
    .zider-workbench textarea {
      font: inherit;
    }

    .zider-workbench__sidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      gap: 28px;
      border-right: 1px solid var(--zider-line);
      background: var(--zider-sidebar-bg);
      padding: 24px 18px;
      z-index: 5;
    }

    .zider-workbench__brand-row {
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr) 34px;
      align-items: center;
      gap: 10px;
    }

    .zider-workbench__logo {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border: 4px solid var(--zider-brand);
      border-radius: 999px;
      color: transparent;
      background: transparent;
      font-size: 0;
      font-weight: 850;
    }

    .zider-workbench__logo span {
      width: 8px;
      height: 8px;
      display: block;
      border-radius: 999px;
      background: var(--zider-brand);
    }

    .zider-workbench__brand-copy {
      min-width: 0;
    }

    .zider-workbench__brand-copy strong,
    .zider-workbench__brand-copy span {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .zider-workbench__brand-copy strong {
      color: var(--zider-ink);
      font-size: 20px;
      line-height: 1.25;
    }

    .zider-workbench__brand-copy span {
      margin-top: 2px;
      color: var(--zider-muted);
      font-size: 12px;
      font-weight: 720;
    }

    .zider-workbench__icon-button,
    .zider-workbench__mobile-menu {
      width: 34px;
      height: 34px;
      display: inline-grid;
      place-items: center;
      border: 1px solid #dce4de;
      border-radius: 8px;
      background: var(--zider-surface);
      color: var(--zider-muted);
      cursor: pointer;
      transition: background 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease;
    }

    .zider-workbench__icon-button:hover,
    .zider-workbench__mobile-menu:hover {
      border-color: rgba(8, 122, 70, 0.28);
      color: var(--zider-brand);
      transform: translateY(-1px);
    }

    .zider-workbench__nav,
    .zider-workbench__nav-section {
      display: grid;
    }

    .zider-workbench__nav {
      gap: 24px;
    }

    .zider-workbench__nav-section {
      gap: 6px;
    }

    .zider-workbench__nav-title {
      margin: 0 0 6px;
      padding: 0 12px;
      color: var(--zider-muted);
      font-size: 11px;
      font-weight: 820;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .zider-workbench__nav-item {
      min-width: 0;
      height: 48px;
      display: flex;
      align-items: center;
      gap: 14px;
      border: 0;
      border-radius: 14px;
      background: transparent;
      color: var(--zider-muted);
      padding: 0 16px;
      text-align: left;
      cursor: pointer;
      font-size: 15px;
      font-weight: 650;
      transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
    }

    .zider-workbench__nav-icon {
      flex: 0 0 auto;
    }

    .zider-workbench__nav-icon {
      width: 22px;
      display: grid;
      place-items: center;
      color: currentColor;
    }

    .zider-workbench__nav-item > span:nth-child(2) {
      min-width: 0;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .zider-workbench__nav-item:hover,
    .zider-workbench__nav-item[data-active="true"] {
      background: var(--zider-surface);
      color: var(--zider-brand-strong);
      box-shadow: 0 12px 30px rgba(18, 24, 23, 0.05);
    }

    .zider-workbench__content {
      min-width: 0;
      min-height: 100vh;
      overflow-x: hidden;
      padding: 56px clamp(24px, 4.5vw, 72px);
    }

    .zider-workbench__mobile-backdrop,
    .zider-workbench__mobile-menu {
      display: none;
    }

    .zider-workbench[data-sidebar="collapsed"] .zider-workbench__sidebar {
      align-items: center;
      padding-inline: 20px;
    }

    .zider-workbench[data-sidebar="collapsed"] .zider-workbench__brand-row {
      grid-template-columns: 1fr;
      justify-items: center;
    }

    .zider-workbench[data-sidebar="collapsed"] .zider-workbench__brand-copy,
    .zider-workbench[data-sidebar="collapsed"] .zider-workbench__nav-title,
    .zider-workbench[data-sidebar="collapsed"] .zider-workbench__nav-item > span:nth-child(2) {
      display: none;
    }

    .zider-workbench[data-sidebar="collapsed"] .zider-workbench__nav-item {
      width: 42px;
      justify-content: center;
      padding: 0;
    }

    @media (max-width: 900px) {
      .zider-workbench,
      .zider-workbench[data-sidebar="collapsed"] {
        grid-template-columns: 1fr;
      }

      .zider-workbench__sidebar {
        position: fixed;
        inset: 0 auto 0 0;
        z-index: 50;
        width: min(280px, calc(100vw - 48px));
        height: 100dvh;
        align-items: stretch;
        padding: 24px 18px;
        transform: translateX(-105%);
        transition: transform 220ms ease;
        box-shadow: 28px 0 70px rgba(18, 24, 23, 0.18);
        overflow-y: auto;
      }

      .zider-workbench[data-mobile-sidebar="open"] .zider-workbench__sidebar {
        transform: translateX(0);
      }

      .zider-workbench__mobile-backdrop {
        position: fixed;
        inset: 0;
        z-index: 40;
        display: block;
        border: 0;
        background: rgba(18, 24, 23, 0.42);
        opacity: 0;
        pointer-events: none;
        transition: opacity 180ms ease;
      }

      .zider-workbench[data-mobile-sidebar="open"] .zider-workbench__mobile-backdrop {
        opacity: 1;
        pointer-events: auto;
      }

      .zider-workbench[data-sidebar="collapsed"] .zider-workbench__brand-row,
      .zider-workbench__brand-row {
        grid-template-columns: 34px minmax(0, 1fr) 34px;
        justify-items: initial;
      }

      .zider-workbench[data-sidebar="collapsed"] .zider-workbench__brand-copy,
      .zider-workbench[data-sidebar="collapsed"] .zider-workbench__nav-title,
      .zider-workbench[data-sidebar="collapsed"] .zider-workbench__nav-item > span:nth-child(2),
      .zider-workbench__brand-copy,
      .zider-workbench__nav-title,
      .zider-workbench__nav-item > span:nth-child(2) {
        display: block;
      }

      .zider-workbench[data-sidebar="collapsed"] .zider-workbench__nav-item,
      .zider-workbench__nav-item {
        width: auto;
        justify-content: flex-start;
        padding: 0 16px;
      }

      .zider-workbench__content {
        width: 100%;
        max-width: 100vw;
        min-width: 0;
        padding: 24px 16px 36px;
      }

      .zider-workbench__mobile-menu {
        display: inline-grid;
        margin: 0 0 18px;
      }
    }
  `;
}
