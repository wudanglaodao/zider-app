export default function WorkspaceHomePage() {
  return (
    <main className="workspaceShell">
      <header className="topbar">
        <a className="brand" href="/">
          ZIDER Workspace
        </a>
        <nav className="links" aria-label="Workspace">
          <a href="/components">Components</a>
          <a href="/solutions">Solutions</a>
        </nav>
      </header>
      <section className="panel">
        <p className="eyebrow">components.zider.ink / workspace.zider.ink</p>
        <h1>One workspace project for two product lines.</h1>
        <p>
          This app will route Components and Solutions by domain while sharing auth, billing, teams, and product
          settings.
        </p>
      </section>
    </main>
  );
}
