export default function AppHomePage() {
  return (
    <main className="appShell">
      <section className="notFoundPanel" aria-labelledby="not-found-title">
        <p className="eyebrow">404</p>
        <h1 id="not-found-title">Page not found.</h1>
        <p>The page you are looking for is not available.</p>
        <a className="homeLink" href="https://zider.ink">
          Visit ZIDER
        </a>
      </section>
    </main>
  );
}
