const ziderLogoUrl = "https://assets.lopuo.com/app/zider/uploads/2024/07/zider-def.png";

export default function WorkspaceHomePage() {
  return (
    <main className="landingShell">
      <section className="workspaceLanding" aria-labelledby="workspace-landing-title">
        <img className="workspaceLandingLogo" alt="Zider" src={ziderLogoUrl} />
        <p className="landingEyebrow">Zider Workspace</p>
        <h1 className="landingTitle" id="workspace-landing-title">
          Components and solutions for creator websites.
        </h1>
        <p className="landingIntro">
          Lightweight interactive components, app utilities, and practical tools for modern websites.
        </p>
      </section>
    </main>
  );
}
