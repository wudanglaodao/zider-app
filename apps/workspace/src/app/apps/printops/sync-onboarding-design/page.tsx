import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  FileText,
  HelpCircle,
  MoreHorizontal,
  PackageCheck,
  Printer,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

import styles from "./sync-onboarding-design.module.css";

export const metadata = {
  title: "PrintOps order sync onboarding design - ZIDER",
  description: "Static design board for the first-run Wix order sync onboarding flow.",
};

const sampleOrders = [
  {
    customer: "Rou Duo",
    id: "#10001",
    items: "Green tote bag x 1",
    payment: "Unpaid",
    print: "Unprinted",
    template: "Invoice - Big Brand",
    time: "Jun 19 18:23",
  },
  {
    customer: "Yancy Tien",
    id: "#10002",
    items: "Digital gift card x 1",
    payment: "Paid",
    print: "Unprinted",
    template: "Invoice",
    time: "Jun 20 17:42",
  },
];

const flowSteps = [
  {
    body: "Wix is connected, but no initial order sync has been completed yet.",
    label: "First entry",
    tone: "ready",
  },
  {
    body: "The user starts the 7-day onboarding sync and the large guide stays visible.",
    label: "Syncing",
    tone: "syncing",
  },
  {
    body: "Orders are saved, the guide collapses, and the regular list becomes primary.",
    label: "Complete",
    tone: "done",
  },
  {
    body: "Errors keep the guide open with retry and help actions.",
    label: "Recover",
    tone: "error",
  },
];

export default function PrintOpsSyncOnboardingDesignPage() {
  return (
    <main className={styles.board}>
      <section className={styles.hero}>
        <p>ZIDER PRINTOPS</p>
        <h1>First order sync onboarding</h1>
        <span>
          A focused Orders-page design for first-time Wix installs: lead with a 7-day first sync, then collapse into a compact 3-day default sync control.
        </span>
      </section>

      <section className={styles.canvas} aria-label="PrintOps order sync onboarding design">
        <aside className={styles.sidebar}>
          <div className={styles.appBrand}>
            <span>
              <Printer size={18} />
            </span>
            <strong>PrintOps</strong>
          </div>
          <nav aria-label="PrintOps navigation">
            <a data-active="true" href="#mockup">
              <PackageCheck size={17} />
              Orders
              <small>0</small>
            </a>
            <a href="#states">
              <DatabaseZap size={17} />
              Templates
            </a>
          </nav>
          <div className={styles.helpLink}>
            <HelpCircle size={15} />
            Help center
          </div>
        </aside>

        <div className={styles.workspace}>
          <header className={styles.header}>
            <div>
              <p>ZIDER PRINTOPS</p>
              <h2>Orders</h2>
              <span>Review synced Wix orders, validate fields, and prepare print-ready documents.</span>
            </div>
            <div className={styles.metrics}>
              <span>
                <small>Printed</small>
                <strong>0</strong>
              </span>
              <span>
                <small>Unprinted</small>
                <strong>0</strong>
              </span>
            </div>
          </header>

          <section className={styles.designHero} id="mockup">
            <div className={styles.flowRail} aria-label="First sync flow">
              {flowSteps.map((step, index) => (
                <article data-tone={step.tone} key={step.label}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step.label}</strong>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>

            <div className={styles.primaryMockup}>
              <div className={styles.mockupTopbar}>
                <span>First install state</span>
                <strong>Expanded onboarding card</strong>
              </div>
              <FirstSyncPanel />
              <EmptyOrderTable />
            </div>
          </section>

          <section className={styles.stateGrid} id="states" aria-label="Sync states">
            <article className={styles.stateCard}>
              <div className={styles.stateLabel}>
                <span>01</span>
                <strong>First install guide</strong>
              </div>
              <div className={styles.ordersFrame}>
                <FirstSyncPanel compact />
                <EmptyOrderTable compact />
              </div>
            </article>

            <article className={styles.stateCard}>
              <div className={styles.stateLabel}>
                <span>02</span>
                <strong>Syncing state</strong>
              </div>
              <div className={styles.ordersFrame}>
                <SyncingPanel />
                <EmptyOrderTable compact muted />
              </div>
            </article>

            <article className={styles.stateCard}>
              <div className={styles.stateLabel}>
                <span>03</span>
                <strong>Collapsed after success</strong>
              </div>
              <div className={styles.ordersFrame}>
                <CollapsedSyncStrip />
                <OrderTable />
              </div>
            </article>

            <article className={styles.stateCard}>
              <div className={styles.stateLabel}>
                <span>04</span>
                <strong>Recoverable error</strong>
              </div>
              <div className={styles.ordersFrame}>
                <ErrorSyncPanel />
                <EmptyOrderTable compact message="No orders can be shown until the Wix sync succeeds." />
              </div>
            </article>
          </section>

          <section className={styles.rules} aria-label="Interaction rules">
            <h2>Implementation notes</h2>
            <div>
              <RuleItem title="First run flag" body="Show the expanded guide only when initial_orders_synced_at is empty." />
              <RuleItem title="7-day first sync" body="The first primary CTA syncs the last 7 days to give the user enough real orders." />
              <RuleItem title="3-day default" body="After onboarding, Sync latest uses 3 days by default and stays compact." />
              <RuleItem title="No channel column" body="Orders keep channel data internally, but the list does not show a channel column." />
              <RuleItem title="Template source" body="Rows and previews use the current default invoice template unless the user selects another template." />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function FirstSyncPanel({ compact = false }: { compact?: boolean }) {
  return (
    <section className={styles.onboardingPanel} data-compact={compact} data-state="ready">
      <span className={styles.panelIcon}>
        <Sparkles size={19} />
      </span>
      <div className={styles.panelCopy}>
        <div className={styles.panelTitle}>
          <strong>Sync recent Wix orders</strong>
          <span>First setup</span>
        </div>
        <p>Pull orders from the last 7 days so PrintOps can prepare invoice previews right away. Future manual syncs default to 3 days.</p>
        <div className={styles.panelSteps}>
          <span>
            <CheckCircle2 size={14} />
            Pull Wix orders
          </span>
          <span>
            <CheckCircle2 size={14} />
            Save order cache
          </span>
          <span>
            <CheckCircle2 size={14} />
            Apply default template
          </span>
        </div>
      </div>
      <div className={styles.panelActions}>
        <button type="button" className={styles.secondaryButton}>
          Not now
        </button>
        <button type="button" className={styles.primaryButton}>
          Sync last 7 days
        </button>
      </div>
    </section>
  );
}

function SyncingPanel() {
  return (
    <section className={styles.onboardingPanel} data-state="syncing">
      <span className={styles.panelIcon}>
        <RefreshCw size={18} />
      </span>
      <div className={styles.panelCopy}>
        <div className={styles.panelTitle}>
          <strong>Syncing Wix orders</strong>
          <span>In progress</span>
        </div>
        <p>Orders, payment status, fulfillment status, and print fields are being prepared.</p>
        <small>Syncing last 7 days...</small>
      </div>
      <div className={styles.panelActions}>
        <button type="button" className={styles.secondaryButton} disabled>
          Not now
        </button>
        <button type="button" className={styles.primaryButton} disabled>
          Syncing...
        </button>
      </div>
    </section>
  );
}

function ErrorSyncPanel() {
  return (
    <section className={styles.onboardingPanel} data-state="error">
      <span className={styles.panelIcon}>
        <AlertTriangle size={18} />
      </span>
      <div className={styles.panelCopy}>
        <div className={styles.panelTitle}>
          <strong>We could not sync Wix orders</strong>
          <span>Needs attention</span>
        </div>
        <p>Keep this larger panel visible until the user can retry successfully.</p>
        <small>Last attempt failed: Wix order API permission was not available.</small>
      </div>
      <div className={styles.panelActions}>
        <button type="button" className={styles.secondaryButton}>
          Open help
        </button>
        <button type="button" className={styles.primaryButton}>
          Retry sync
        </button>
      </div>
    </section>
  );
}

function CollapsedSyncStrip() {
  return (
    <section className={styles.syncStrip} data-menu-preview="true">
      <div>
        <span aria-hidden="true" />
        <strong>Connected</strong>
        <small>Synced just now · Default 3 days</small>
      </div>
      <div className={styles.syncActions}>
        <button type="button" className={styles.secondaryButton}>
          Sync latest
        </button>
        <div className={styles.moreMenuWrap}>
          <button aria-label="More sync actions" className={styles.iconButton} type="button">
            <MoreHorizontal size={16} />
          </button>
          <div className={styles.moreMenu}>
            <button type="button">Sync last 7 days</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyOrderTable({
  compact = false,
  message = "No synced orders yet. Start the first sync to load Wix orders into PrintOps.",
  muted = false,
}: {
  compact?: boolean;
  message?: string;
  muted?: boolean;
}) {
  return (
    <div className={styles.tableShell} data-compact={compact} data-muted={muted}>
      <div className={styles.toolbar}>
        <span>
          <Search size={16} />
          Search orders, customer, SKU
        </span>
        <button type="button">Unprinted</button>
      </div>
      <div className={styles.tableHeader}>
        <span>Order</span>
        <span>Customer</span>
        <span>Items</span>
        <span>Print</span>
        <span>Template</span>
      </div>
      <div className={styles.emptyState}>
        <Clock3 size={18} />
        <strong>No synced orders yet</strong>
        <span>{message}</span>
      </div>
    </div>
  );
}

function OrderTable() {
  return (
    <div className={styles.tableShell}>
      <div className={styles.toolbar}>
        <span>
          <Search size={16} />
          Search orders, customer, SKU
        </span>
        <button type="button">Unprinted</button>
      </div>
      <div className={styles.tableHeader}>
        <span>Order</span>
        <span>Customer</span>
        <span>Items</span>
        <span>Print</span>
        <span>Template</span>
      </div>
      {sampleOrders.map((order) => (
        <div className={styles.tableRow} key={order.id}>
          <span>
            <strong>{order.id}</strong>
            <small>{order.time}</small>
          </span>
          <span className={styles.truncateCell}>{order.customer}</span>
          <span className={styles.truncateCell}>{order.items}</span>
          <span data-pill="true">{order.print}</span>
          <span>
            <FileText size={14} />
            {order.template}
          </span>
        </div>
      ))}
    </div>
  );
}

function RuleItem({ body, title }: { body: string; title: string }) {
  return (
    <article>
      <span aria-hidden="true" />
      <strong>{title}</strong>
      <p>{body}</p>
    </article>
  );
}
