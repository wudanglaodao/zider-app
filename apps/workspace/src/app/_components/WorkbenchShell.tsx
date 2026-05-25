import type { ReactNode } from "react";

type WorkbenchSection = "dashboard" | "cursor" | "help";

const navItems: { href: string; icon: WorkbenchIconName; label: string; section: WorkbenchSection }[] = [
  { href: "/", icon: "dashboard", label: "Dashboard", section: "dashboard" },
  { href: "#help", icon: "help", label: "Help Center", section: "help" },
];

export function WorkbenchShell({
  active,
  children,
  onCreate,
}: {
  active: WorkbenchSection;
  children: ReactNode;
  onCreate?: () => void;
}) {
  return (
    <div className="zider-workbench">
      <style>{getWorkbenchCss()}</style>

      <aside className="zider-workbench__sidebar" aria-label="Zider navigation">
        <a className="zider-workbench__logo" href="/" aria-label="Zider dashboard">
          <span>Z</span>
        </a>

        <nav className="zider-workbench__nav" aria-label="Workspace">
          {navItems.map((item) => (
            <a
              aria-label={item.label}
              data-active={active === item.section}
              href={item.href}
              key={item.section}
              title={item.label}
            >
              <WorkbenchIcon name={item.icon} />
            </a>
          ))}
        </nav>

        <div className="zider-workbench__bottom">
          {onCreate ? (
            <button
              className="zider-workbench__create"
              data-active={active === "cursor"}
              onClick={onCreate}
              type="button"
              aria-label="Create widget"
              title="Create widget"
            >
              <WorkbenchIcon name="plus" />
            </button>
          ) : (
            <a
              className="zider-workbench__create"
              data-active={active === "cursor"}
              href="/interactive-custom-cursor"
              aria-label="Create widget"
              title="Create widget"
            >
              <WorkbenchIcon name="plus" />
            </a>
          )}
          <button className="zider-workbench__avatar" type="button" aria-label="Account">
            YC
          </button>
        </div>
      </aside>

      <main className="zider-workbench__content">{children}</main>
    </div>
  );
}

type WorkbenchIconName = "dashboard" | "help" | "plus";

function WorkbenchIcon({ name }: { name: WorkbenchIconName }) {
  const common = {
    "aria-hidden": true,
    fill: "none",
    height: 22,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2.2,
    viewBox: "0 0 24 24",
    width: 22,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect height="7" rx="1.6" width="7" x="3.5" y="3.5" />
          <rect height="7" rx="1.6" width="7" x="13.5" y="3.5" />
          <rect height="7" rx="1.6" width="7" x="3.5" y="13.5" />
          <rect height="7" rx="1.6" width="7" x="13.5" y="13.5" />
        </svg>
      );
    case "help":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9.8 9.4a2.4 2.4 0 0 1 4.5 1.2c0 1.9-2.3 2.1-2.3 3.8" />
          <path d="M12 17.4h.01" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
  }
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
      --zider-brand-strong: #045f35;
      --zider-brand-soft: #e8f7ee;
      --zider-ink: #0d1713;
      --zider-accent: #f6b84b;
      min-height: 100vh;
      display: block;
      padding-left: 80px;
      background:
        linear-gradient(115deg, rgba(8, 122, 70, 0.075) 0 1px, transparent 1px 148px),
        linear-gradient(90deg, rgba(13, 23, 19, 0.035) 1px, transparent 1px),
        linear-gradient(rgba(13, 23, 19, 0.025) 1px, transparent 1px),
        #f7f8f5;
      background-size: 40px 40px;
      color: #0d1713;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      overflow-x: hidden;
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
      position: fixed;
      left: 0;
      top: 0;
      width: 80px;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 26px;
      border-right: 1px solid #e4e5eb;
      background: rgba(255, 255, 255, 0.88);
      padding: 28px 0 22px;
      backdrop-filter: blur(18px);
      z-index: 5;
    }

    .zider-workbench__logo {
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      border: 1px solid rgba(8, 122, 70, 0.18);
      background:
        linear-gradient(145deg, #ffffff 0 52%, rgba(232, 247, 238, 0.95) 52%),
        #ffffff;
      color: #ffffff;
      box-shadow: 0 13px 28px rgba(8, 122, 70, 0.12);
      transform: rotate(-2deg);
      transition: transform 180ms ease, box-shadow 180ms ease;
    }

    .zider-workbench__logo:hover {
      box-shadow: 0 16px 34px rgba(8, 122, 70, 0.18);
      transform: translateY(-1px) rotate(0deg);
    }

    .zider-workbench__logo span {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border-radius: 6px;
      background: var(--zider-brand);
      font-size: 18px;
      font-weight: 850;
      letter-spacing: 0;
      color: #ffffff;
    }

    .zider-workbench__nav {
      width: 100%;
      display: grid;
      justify-items: center;
      gap: 10px;
    }

    .zider-workbench__nav a,
    .zider-workbench__create,
    .zider-workbench__avatar {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 8px;
      color: #85868d;
      background: transparent;
      cursor: pointer;
      position: relative;
      transition:
        background 160ms ease,
        color 160ms ease,
        transform 160ms ease,
        box-shadow 160ms ease;
    }

    .zider-workbench__nav a::before {
      content: "";
      position: absolute;
      left: -18px;
      top: 10px;
      width: 4px;
      height: 24px;
      border-radius: 0 999px 999px 0;
      background: var(--zider-brand);
      opacity: 0;
      transform: translateX(-4px);
      transition: opacity 160ms ease, transform 160ms ease;
    }

    .zider-workbench__nav a:hover,
    .zider-workbench__nav a[data-active="true"] {
      color: var(--zider-brand);
      background: var(--zider-brand-soft);
      transform: translateY(-1px);
    }

    .zider-workbench__nav a[data-active="true"]::before {
      opacity: 1;
      transform: translateX(0);
    }

    .zider-workbench__bottom {
      width: 100%;
      margin-top: auto;
      display: grid;
      justify-items: center;
      gap: 20px;
    }

    .zider-workbench__create {
      color: #ffffff;
      background: var(--zider-brand);
      box-shadow: 0 12px 24px rgba(8, 122, 70, 0.24);
    }

    .zider-workbench__create:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 16px 28px rgba(8, 122, 70, 0.32);
    }

    .zider-workbench__avatar {
      color: #2f3138;
      background: #f1f2f5;
      font-size: 12px;
      font-weight: 750;
    }

    .zider-workbench__avatar:hover {
      color: #0d1713;
      background: var(--zider-brand-soft);
    }

    .zider-workbench__content {
      min-width: 0;
      min-height: 100vh;
      overflow-x: hidden;
      padding: 56px clamp(24px, 4.5vw, 72px);
    }

    @media (max-width: 760px) {
      .zider-workbench {
        padding-left: 0;
      }

      .zider-workbench__sidebar {
        width: 100%;
        max-width: 100vw;
        position: sticky;
        left: auto;
        height: auto;
        min-height: 64px;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-right: 0;
        border-bottom: 1px solid #e4e5eb;
        overflow: hidden;
      }

      .zider-workbench__nav {
        width: auto;
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        justify-content: flex-start;
        gap: 4px;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .zider-workbench__nav::-webkit-scrollbar {
        display: none;
      }

      .zider-workbench__nav a {
        width: 38px;
        height: 38px;
      }

      .zider-workbench__nav a::before {
        display: none;
      }

      .zider-workbench__bottom {
        width: auto;
        margin: 0;
        flex: 0 0 auto;
        display: flex;
        gap: 8px;
      }

      .zider-workbench__create,
      .zider-workbench__avatar {
        width: 38px;
        height: 38px;
      }

      .zider-workbench__avatar {
        display: none;
      }

      .zider-workbench__content {
        width: 100%;
        max-width: 100vw;
        min-width: 0;
        padding: 24px 16px 36px;
      }
    }
  `;
}
