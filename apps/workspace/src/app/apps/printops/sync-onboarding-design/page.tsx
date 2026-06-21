import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  DatabaseZap,
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
    customer: "Wix customer",
    id: "#10001",
    items: "Wix order item x 1",
    payment: "Unpaid",
    print: "Unprinted",
    time: "Jun 20 18:23",
  },
  {
    customer: "Green Studio",
    id: "#10002",
    items: "Gift card x 1",
    payment: "Paid",
    print: "Unprinted",
    time: "Jun 20 17:42",
  },
];

export default function PrintOpsSyncOnboardingDesignPage() {
  return (
    <main className={styles.board}>
      <section className={styles.hero}>
        <p>ZIDER PRINTOPS</p>
        <h1>First order sync onboarding</h1>
        <span>Design direction for guiding first-time Wix installs through a 7-day order sync, then collapsing into a compact 3-day default sync control.</span>
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
            <a data-active="true" href="#first-sync">
              <PackageCheck size={17} />
              Orders
              <small>0</small>
            </a>
            <a href="#first-sync">
              <DatabaseZap size={17} />
              Templates
            </a>
          </nav>
          <div className={styles.helpLink}>Help center</div>
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
                <small>Unprinted</small>
                <strong>0</strong>
              </span>
              <span>
                <small>Printed</small>
                <strong>0</strong>
              </span>
            </div>
          </header>

          <section className={styles.stateGrid}>
            <article className={styles.stateCard} id="first-sync">
              <div className={styles.stateLabel}>
                <span>01</span>
                <strong>First install, expanded guide</strong>
              </div>
              <div className={styles.ordersFrame}>
                <FirstSyncPanel />
                <EmptyOrderTable />
              </div>
            </article>

            <article className={styles.stateCard}>
              <div className={styles.stateLabel}>
                <span>02</span>
                <strong>Syncing keeps the guide open</strong>
              </div>
              <div className={styles.ordersFrame}>
                <SyncingPanel />
                <EmptyOrderTable muted />
              </div>
            </article>

            <article className={styles.stateCard}>
              <div className={styles.stateLabel}>
                <span>03</span>
                <strong>Success collapses to a compact strip</strong>
              </div>
              <div className={styles.ordersFrame}>
                <CollapsedSyncStrip />
                <OrderTable />
              </div>
            </article>

            <article className={styles.stateCard}>
              <div className={styles.stateLabel}>
                <span>04</span>
                <strong>Failure stays visible and actionable</strong>
              </div>
              <div className={styles.ordersFrame}>
                <ErrorSyncPanel />
                <EmptyOrderTable message="No orders can be shown until the Wix sync succeeds." />
              </div>
            </article>
          </section>

          <section className={styles.rules} aria-label="Interaction rules">
            <h2>Interaction rules</h2>
            <div>
              <RuleItem title="First run" body="Show the expanded guide only until the first sync attempt is completed." />
              <RuleItem title="7-day onboarding" body="The onboarding CTA syncs the last 7 days so the user can see real orders immediately." />
              <RuleItem title="3-day default" body="After onboarding, manual sync defaults to the last 3 days and lives in the compact strip." />
              <RuleItem title="Collapse behavior" body="On success or no orders found, collapse the big guide and keep the order table as the primary surface." />
              <RuleItem title="Failure behavior" body="If permissions, token, or API calls fail, keep the large guide open with retry and help actions." />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function FirstSyncPanel() {
  return (
    <section className={styles.onboardingPanel} data-state="ready">
      <span className={styles.panelIcon}>
        <Sparkles size={19} />
      </span>
      <div className={styles.panelCopy}>
        <div className={styles.panelTitle}>
          <strong>Sync recent Wix orders</strong>
          <span>First setup</span>
        </div>
        <p>Start with orders from the last 7 days so PrintOps can prepare invoice previews right away. Future manual syncs default to 3 days.</p>
        <div className={styles.panelSteps}>
          <span>
            <CheckCircle2 size={14} />
            Pull Wix orders
          </span>
          <span>
            <CheckCircle2 size={14} />
            Save to PrintOps cache
          </span>
          <span>
            <CheckCircle2 size={14} />
            Collapse this guide after sync
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
          <strong>Syncing recent Wix orders</strong>
          <span>In progress</span>
        </div>
        <p>We are pulling orders, payment status, fulfillment status, and required fields from Wix. Keep this panel open until the sync result is known.</p>
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
        <p>Check the Wix connection, app permissions, and access token. Keep this larger panel visible until the user can retry successfully.</p>
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
    <section className={styles.syncStrip}>
      <div>
        <span>
          <CheckCircle2 size={15} />
        </span>
        <strong>Wix order sync</strong>
        <small>Connected · Last synced just now · Default sync window: 3 days</small>
      </div>
      <div>
        <button type="button" className={styles.secondaryButton}>
          Sync latest
        </button>
        <button type="button" className={styles.primaryButton}>
          Sync last 3 days
        </button>
      </div>
    </section>
  );
}

function EmptyOrderTable({ message = "No synced orders yet. Start the first sync to load Wix orders into PrintOps.", muted = false }: { message?: string; muted?: boolean }) {
  return (
    <div className={styles.tableShell} data-muted={muted}>
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
      </div>
      {sampleOrders.map((order) => (
        <div className={styles.tableRow} key={order.id}>
          <span>
            <strong>{order.id}</strong>
            <small>{order.time}</small>
          </span>
          <span>{order.customer}</span>
          <span>{order.items}</span>
          <span data-pill="true">{order.print}</span>
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
