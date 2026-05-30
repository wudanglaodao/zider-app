import Link from "next/link";
import { ArrowRight, MousePointer2, PackageCheck, Printer, Sparkles } from "lucide-react";

const apps = [
  {
    name: "Zider PrintOps",
    scope: "Wix orders",
    description: "Invoice templates, order previews, PDF download, and print-ready workflows for store teams.",
    href: "/apps/printops/templates",
    cta: "Open PrintOps",
    status: "In development",
    icon: Printer,
  },
  {
    name: "Interactive Custom Cursor",
    scope: "Wix sites",
    description: "A lightweight visual interaction app for custom cursors, hover states, and click effects.",
    href: "/widget/interactive-custom-cursor",
    cta: "Open Cursor App",
    status: "Workspace",
    icon: MousePointer2,
  },
];

export default function WorkspaceHomePage() {
  return (
    <main className="landingShell">
      <header className="landingTopbar">
        <Link className="landingBrand" href="/">
          <span>Z</span>
          <strong>Zider</strong>
        </Link>
        <nav className="landingLinks" aria-label="Zider apps">
          <Link href="/apps/printops/templates">PrintOps</Link>
          <Link href="/widget/interactive-custom-cursor">Cursor</Link>
        </nav>
      </header>

      <section className="landingHero">
        <div className="landingHeroCopy">
          <p className="landingEyebrow">Zider Apps</p>
          <h1 className="landingTitle">Build focused tools for Wix merchants.</h1>
          <p className="landingIntro">
            Start with PrintOps for order printing, then grow into a small suite of practical store apps under one Zider brand.
          </p>
          <div className="landingActions">
            <Link className="landingPrimaryButton" href="/apps/printops/templates">
              <Printer size={18} aria-hidden />
              Open PrintOps
            </Link>
            <Link className="landingSecondaryButton" href="/apps/printops/wix?instance=wix-dev-preview">
              Wix preview
              <ArrowRight size={17} aria-hidden />
            </Link>
          </div>
        </div>

        <div className="landingPreview" aria-label="PrintOps product preview">
          <div className="landingPreviewChrome">
            <span />
            <span />
            <span />
          </div>
          <div className="landingPreviewBody">
            <aside className="landingPreviewSidebar">
              <strong>Zider PrintOps</strong>
              <span>Orders</span>
              <span className="isActive">Templates</span>
              <span>Print History</span>
            </aside>
            <div className="landingPreviewContent">
              <div className="landingPreviewHeader">
                <span>Template Center</span>
                <button type="button">
                  <Sparkles size={15} aria-hidden />
                  Create
                </button>
              </div>
              <div className="landingInvoiceMock">
                <div>
                  <strong>Hello</strong>
                  <span>GREEN STUDIO</span>
                  <span>INVOICE NO. #10059</span>
                </div>
                <div className="landingInvoiceGrid">
                  <span>Bill to</span>
                  <span>Ship to</span>
                </div>
                <div className="landingInvoiceLine" />
                <div className="landingInvoiceItem">
                  <PackageCheck size={24} aria-hidden />
                  <span>Custom order item</span>
                  <strong>$42.90</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landingApps" aria-label="Zider app entries">
        {apps.map((app) => {
          const Icon = app.icon;

          return (
            <article className="landingAppCard" key={app.name}>
              <span className="landingAppIcon">
                <Icon size={20} aria-hidden />
              </span>
              <small>{app.status}</small>
              <h2>{app.name}</h2>
              <p>{app.scope}</p>
              <p>{app.description}</p>
              <Link href={app.href}>
                {app.cta}
                <ArrowRight size={16} aria-hidden />
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
