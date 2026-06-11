import React, { useMemo, useState } from 'react';
import '@wix/design-system/styles.global.css';
import { withProviders } from '../../withProviders';

const workspaceUrl = 'https://workspace.zider.ink/apps/printops/wix';
const localWorkspaceUrl = 'http://localhost:3104/apps/printops/wix';

function PrintOpsDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasFrameError, setHasFrameError] = useState(false);
  const embeddedWorkspaceUrl = useMemo(() => buildWorkspaceUrl(), []);

  return (
    <main style={styles.page}>
      <style>{`@keyframes printops-spin { to { transform: rotate(360deg); } }`}</style>
      {isLoading ? (
        <div style={styles.loadingShell} aria-live="polite">
          <div style={styles.spinner} />
          <span>Loading PrintOps...</span>
        </div>
      ) : null}

      {hasFrameError ? (
        <div style={styles.fallbackShell}>
          <h1 style={styles.fallbackTitle}>PrintOps could not load inside this dashboard.</h1>
          <p style={styles.fallbackText}>Open the workspace in a new tab to continue managing order printing.</p>
          <a href={embeddedWorkspaceUrl} target="_blank" rel="noreferrer" style={styles.fallbackButton}>
            Open PrintOps
          </a>
        </div>
      ) : null}

      <iframe
        title="Zider PrintOps"
        src={embeddedWorkspaceUrl}
        style={styles.frame}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasFrameError(true);
        }}
      />
    </main>
  );
}

function buildWorkspaceUrl() {
  if (typeof window === 'undefined') {
    return workspaceUrl;
  }

  const baseUrl = window.location.hostname === 'localhost' ? localWorkspaceUrl : workspaceUrl;
  const target = new URL(baseUrl);
  const currentParams = new URLSearchParams(window.location.search);

  currentParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  if (window.location.hostname === 'localhost' && !target.searchParams.has('instance') && !target.searchParams.has('instanceId')) {
    target.searchParams.set('instanceId', 'wix-dev-preview');
  }

  return target.toString();
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    margin: 0,
    background: '#f8faf9',
    color: '#121817',
    overflow: 'hidden',
    fontFamily: 'Inter, Arial, sans-serif',
  },
  frame: {
    display: 'block',
    width: '100%',
    minHeight: '100vh',
    border: 0,
    background: '#f8faf9',
  },
  loadingShell: {
    position: 'absolute',
    inset: 0,
    zIndex: 2,
    display: 'grid',
    placeItems: 'center',
    gap: '14px',
    alignContent: 'center',
    background: '#f8faf9',
    color: '#53645d',
    fontSize: '14px',
    fontWeight: 700,
  },
  spinner: {
    width: '34px',
    height: '34px',
    border: '4px solid #d9e7df',
    borderTopColor: '#087d47',
    borderRadius: '999px',
    animation: 'printops-spin 900ms linear infinite',
  },
  fallbackShell: {
    position: 'absolute',
    inset: 0,
    zIndex: 3,
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '16px',
    padding: '32px',
    background: '#f8faf9',
    textAlign: 'center',
  },
  fallbackTitle: {
    margin: 0,
    color: '#121817',
    fontSize: '24px',
    lineHeight: 1.2,
    fontWeight: 800,
  },
  fallbackText: {
    margin: 0,
    maxWidth: '480px',
    color: '#53645d',
    fontSize: '15px',
    lineHeight: 1.5,
  },
  fallbackButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '44px',
    padding: '0 18px',
    borderRadius: '10px',
    background: '#087d47',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 800,
    textDecoration: 'none',
  },
};

export default withProviders(PrintOpsDashboard);
