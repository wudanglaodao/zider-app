const ziderLogoUrl = "https://assets.lopuo.com/app/zider/uploads/2024/07/zider-def.png";

const siteOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_ZIDER_SITE_URL) ?? "https://zider.ink";
const wixAppMarketUrl = process.env.NEXT_PUBLIC_PRINTOPS_WIX_APP_MARKET_URL?.trim() || "https://www.wix.com/app-market";

export function PrintOpsAccessGuide() {
  const accountHref = `${siteOrigin}/account?mode=signin&next=${encodeURIComponent("/account/center")}`;

  return (
    <main className="printOpsAccessShell">
      <header className="printOpsAccessHeader">
        <a className="printOpsAccessBrand" href={siteOrigin} aria-label="ZIDER home">
          <img alt="ZIDER" src={ziderLogoUrl} />
        </a>
        <nav className="printOpsAccessNav" aria-label="PrintOps access">
          <a href={accountHref}>Sign in</a>
          <a className="isPrimary" href={wixAppMarketUrl} target="_blank" rel="noreferrer">
            Install on Wix
          </a>
        </nav>
      </header>

      <section className="printOpsAccessHero" aria-labelledby="printops-access-title">
        <div className="printOpsAccessCopy">
          <p className="printOpsAccessEyebrow">Zider PrintOps</p>
          <h1 id="printops-access-title">Start PrintOps from your Wix store.</h1>
          <p>
            PrintOps connects to Wix orders through the Wix app installation flow. Install the app first so we can
            create the right workspace, store profile, and order sync context for your shop.
          </p>
          <div className="printOpsAccessActions">
            <a className="printOpsAccessPrimary" href={wixAppMarketUrl} target="_blank" rel="noreferrer">
              Open Wix App Market
            </a>
            <a className="printOpsAccessSecondary" href={accountHref}>
              Sign in to ZIDER
            </a>
          </div>
        </div>

        <div className="printOpsAccessCard" aria-label="PrintOps access flow">
          <div>
            <span>1</span>
            <strong>Install from Wix</strong>
            <p>Wix creates the app instance and grants order access for the connected store.</p>
          </div>
          <div>
            <span>2</span>
            <strong>Workspace is created automatically</strong>
            <p>We store the Wix site profile, language, currency, timezone, and PrintOps app instance.</p>
          </div>
          <div>
            <span>3</span>
            <strong>Claim your ZIDER account when needed</strong>
            <p>Merchants can later claim or merge their ZIDER account with Google or email verification.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function normalizeOrigin(value: string | undefined) {
  const trimmed = value?.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`).origin;
  } catch {
    return null;
  }
}
