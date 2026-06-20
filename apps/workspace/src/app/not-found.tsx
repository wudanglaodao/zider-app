import { ArrowRight, Home, LayoutTemplate, Package, Search, Settings } from "lucide-react";

const quickLinks = [
  {
    description: "Return to the main workspace entry.",
    href: "/",
    icon: Home,
    label: "Workspace home",
  },
  {
    description: "Manage widgets, component settings, and customer instances.",
    href: "/components",
    icon: LayoutTemplate,
    label: "Components",
  },
  {
    description: "Manage solution tools and customer workflows.",
    href: "/solutions",
    icon: Settings,
    label: "Solutions",
  },
  {
    description: "Open the PrintOps app access page.",
    href: "/apps/printops",
    icon: Package,
    label: "PrintOps",
  },
];

export default function NotFound() {
  return (
    <main className="workspaceNotFoundShell">
      <section className="workspaceNotFoundHero" aria-labelledby="workspace-not-found-title">
        <div className="workspaceNotFoundCode" aria-label="Error code">
          404
        </div>
        <div className="workspaceNotFoundCopy">
          <p className="workspaceNotFoundEyebrow">Link not found</p>
          <h1 id="workspace-not-found-title">This workspace page is not available.</h1>
          <p>
            The link may be outdated, mistyped, or not ready yet. Use one of the workspace entries below to continue.
          </p>
          <div className="workspaceNotFoundActions" aria-label="Helpful actions">
            <a className="workspaceNotFoundPrimary" href="/">
              Back to workspace
              <ArrowRight size={17} />
            </a>
            <a className="workspaceNotFoundSecondary" href="/apps/printops">
              <Search size={17} />
              Open PrintOps
            </a>
          </div>
        </div>
      </section>

      <section className="workspaceNotFoundLinks" aria-label="Workspace destinations">
        {quickLinks.map((link) => {
          const Icon = link.icon;

          return (
            <a className="workspaceNotFoundLink" href={link.href} key={link.href}>
              <span className="workspaceNotFoundLinkIcon">
                <Icon size={19} />
              </span>
              <span>
                <strong>{link.label}</strong>
                <small>{link.description}</small>
              </span>
              <ArrowRight className="workspaceNotFoundLinkArrow" size={17} />
            </a>
          );
        })}
      </section>
    </main>
  );
}
