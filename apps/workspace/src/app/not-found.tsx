import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="workspaceNotFoundShell workspaceNotFoundShell--simple">
      <section className="workspaceNotFoundSimple" aria-labelledby="workspace-not-found-title">
        <p className="workspaceNotFoundEyebrow">404</p>
        <h1 id="workspace-not-found-title">Page not available.</h1>
        <p>This workspace link is not ready or no longer exists. Return to the dashboard to continue.</p>
        <a className="workspaceNotFoundPrimary" href="/">
          <Home size={17} />
          Back to dashboard
          <ArrowRight size={17} />
        </a>
      </section>
    </main>
  );
}
