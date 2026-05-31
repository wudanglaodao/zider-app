import React from 'react';
import '@wix/design-system/styles.global.css';
import { withProviders } from '../../withProviders';

const workspaceUrl = 'https://workspace.zider.ink/apps/printops/wix';
const localWorkspaceUrl = 'http://localhost:3102/apps/printops/wix?instanceId=wix-dev-preview';

function PrintOpsDashboard() {
  const openWorkspace = () => {
    window.open(workspaceUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>Zider PrintOps</p>
          <h1 style={styles.title}>Order printing for Wix merchants</h1>
          <p style={styles.copy}>
            Sync recent Wix orders, preview A4 invoice templates, download PDFs, and print customer documents from Zider Workspace.
          </p>
        </div>
        <button type="button" style={styles.primaryButton} onClick={openWorkspace}>
          Open PrintOps
        </button>
      </section>

      <section style={styles.grid} aria-label="PrintOps setup status">
        <article style={styles.card}>
          <span style={styles.cardLabel}>Orders</span>
          <h2 style={styles.cardTitle}>Latest + 7-day sync</h2>
          <p style={styles.cardText}>Use the workspace sync panel to pull the newest Wix order first, then backfill recent orders for testing.</p>
        </article>
        <article style={styles.card}>
          <span style={styles.cardLabel}>Templates</span>
          <h2 style={styles.cardTitle}>A4 invoice templates</h2>
          <p style={styles.cardText}>Start with the Big Brand invoice layout and keep custom order fields available for printing.</p>
        </article>
        <article style={styles.card}>
          <span style={styles.cardLabel}>Output</span>
          <h2 style={styles.cardTitle}>PDF + browser print</h2>
          <p style={styles.cardText}>Download PDFs or open print preview from the same invoice renderer used in the workspace.</p>
        </article>
      </section>

      <section style={styles.devPanel}>
        <strong>Local test URL</strong>
        <code style={styles.code}>{localWorkspaceUrl}</code>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: '40px',
    background: '#f7faf8',
    color: '#0d1b16',
    fontFamily: 'Inter, Arial, sans-serif',
  },
  hero: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '32px',
    padding: '36px',
    border: '1px solid #d9e7df',
    borderRadius: '16px',
    background: '#ffffff',
  },
  eyebrow: {
    margin: '0 0 12px',
    color: '#067a46',
    fontSize: '13px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    maxWidth: '720px',
    fontSize: '44px',
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: 0,
  },
  copy: {
    margin: '18px 0 0',
    maxWidth: '680px',
    color: '#51635c',
    fontSize: '18px',
    lineHeight: 1.55,
  },
  primaryButton: {
    flex: '0 0 auto',
    border: 0,
    borderRadius: '10px',
    background: '#087d47',
    color: '#ffffff',
    padding: '14px 20px',
    fontSize: '16px',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 14px 28px rgba(8, 125, 71, 0.18)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '16px',
    marginTop: '20px',
  },
  card: {
    minHeight: '172px',
    padding: '24px',
    border: '1px solid #d9e7df',
    borderRadius: '14px',
    background: '#ffffff',
  },
  cardLabel: {
    color: '#087d47',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  cardTitle: {
    margin: '14px 0 10px',
    fontSize: '22px',
    lineHeight: 1.15,
  },
  cardText: {
    margin: 0,
    color: '#53645d',
    fontSize: '15px',
    lineHeight: 1.55,
  },
  devPanel: {
    display: 'grid',
    gap: '10px',
    marginTop: '20px',
    padding: '20px 24px',
    border: '1px solid #d9e7df',
    borderRadius: '14px',
    background: '#edf5f0',
  },
  code: {
    display: 'block',
    maxWidth: '100%',
    overflowX: 'auto',
    color: '#12352a',
    fontSize: '14px',
  },
};

export default withProviders(PrintOpsDashboard);
