# Zider AI Actions Wix App Market Launch Addendum

This launch addendum supplements:

- [15 Zider AI Actions Wix V1.1 Requirements](./15-zider-ai-actions-wix-v1.1-requirements.md)
- [16 Zider AI Actions Pricing Plan](./16-zider-ai-actions-pricing-plan.md)

It captures the additional requirements needed to submit Zider AI Actions to the
Wix App Market. It is based on Wix launch, listing, pricing, guideline, and app
testing documentation checked on 2026-06-23.

## Official Wix References

- [About Launching Apps](https://dev.wix.com/docs/build-apps/launch-your-app/about-launching-apps)
- [Wix App Market Guidelines](https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/app-market-guidelines)
- [About Market Listings](https://dev.wix.com/docs/build-apps/launch-your-app/market-listing/about-market-listings)
- [About Pricing Plans and Business Models](https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/about-pricing-plans-and-business-models)
- [App Checks and Testing Guide](https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/test-your-app/app-checks-and-testing-guide)
- [Common Reasons for App Rejection](https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/common-reasons-for-app-rejection)

## What The Current PRD Still Needs

The existing requirements define the product behavior well, but before building
for App Market submission we still need explicit requirements for:

- app identity and distribution setup,
- Wix OAuth / instance identity,
- minimum permissions,
- App Installed / Removed / paid-plan webhooks,
- Wix Billing plan configuration,
- App Market listing copy and media,
- demo site and review notes,
- privacy / terms / third-party AI disclosure,
- accessibility and browser QA,
- upgrade, downgrade, cancellation, and site duplication flows,
- review rejection prevention.

## App Identity

Required decisions:

- final Wix app name,
- internal `app_key`, recommended: `zider_ai_actions`,
- Wix app type: Wix CLI app, self-managed app, or hybrid,
- dashboard URL,
- widget/runtime URL,
- support email,
- privacy policy URL,
- terms of use URL,
- demo site URL,
- App Market category,
- supported countries,
- supported listing languages.

Recommended public app name:

```text
Zider AI Actions
```

Recommended short teaser:

```text
Add AI action buttons for ChatGPT, Claude, Gemini, and custom AI workflows.
```

Review risk: the app name and listing mention third-party AI brands. The listing
must not imply official affiliation with OpenAI, Anthropic, Google, or any other
provider. Use compatibility wording and add a clear no-affiliation note where
appropriate.

## Wix Installation And Identity

The app must identify each installed site by Wix `instanceId`.

Requirements:

- resolve and persist `instanceId` after install,
- isolate all app data by `app_key + platform + instance_id`,
- do not identify installed sites by browser cookies,
- support the Manage Apps reopen flow,
- support installing on multiple Wix sites under the same owner,
- support site duplication where Wix may send `originInstanceId`,
- show a recovery or reinstall prompt if duplicated site access lacks needed
  credentials.

If the app uses OAuth:

- dashboard URL must not point to localhost,
- consent flow must open correctly,
- dashboard must load after consent,
- onboarding completion should send Wix's `APP_SETUP_FINISHED` BI event when
  setup is complete.

## Permissions

The app should request the minimum Wix permissions needed.

Expected V1.1 permission profile:

- read site identity / app instance data,
- install or manage the site widget / embedded script if required by the chosen
  Wix implementation,
- billing / plan reads if required to resolve Free vs Plus.

Out of scope permissions:

- contacts,
- orders,
- bookings,
- CRM,
- products,
- payments,
- visitor analytics.

If any broader scope becomes technically required, document the reason before
adding it. Wix review checks whether requested permissions are necessary.

## Webhooks

Add lifecycle and billing webhooks before submission:

- App Instance Installed
- App Instance Removed
- Paid Plan Purchased
- Paid Plan Changed
- Paid Plan Auto Renewal Cancelled
- Plan Converted to Paid
- Plan Reactivated
- Plan Transferred

The receiver should:

- verify Wix event signatures according to the shared Wix event contract,
- return `200` on successfully processed webhook events,
- deduplicate events,
- persist raw event payloads for review/debugging,
- update current installation state,
- update current plan state.

Use the existing contract as the shared boundary:

- [14 Wix Event Contract](./14-wix-event-contract.md)

## Billing And Pricing

Business model:

```text
Freemium
```

Plans:

| Plan | Billing | App Market role |
| --- | --- | --- |
| Free | Free | Default install plan |
| Plus | $4.99/month | Paid recurring plan |

Requirements:

- configure Free and Plus in the Wix app dashboard,
- map Wix billing plan IDs to internal plan IDs,
- route upgrade CTAs to Wix checkout / pricing flow,
- do not use external billing links or license-key unlocks,
- enforce Free / Plus limits in both UI and backend,
- test install, upgrade, cancellation, and paid-plan recognition,
- keep price copy consistent between app dashboard, pricing page, and in-app UI.

Wix pricing pages allow a limited benefit set per plan. Keep each plan's public
benefits tight:

Free benefits:

- 3 built-in AI tools
- 1 shared prompt
- 2 widget layouts
- Basic design controls

Plus benefits:

- Unlimited AI tools
- Custom AI providers
- Language Profiles
- Language-specific prompts and URLs

Do not allow downgrade directly inside a custom pricing page. Wix handles some
subscription changes through cancellation and repurchase, so downgrade behavior
must be documented in-app without bypassing Wix Billing.

## Market Listing Requirements

Required listing assets:

- app name,
- app icon,
- short teaser,
- full description,
- feature list,
- category,
- keywords,
- target audience,
- supported countries,
- supported languages,
- company info,
- support email,
- privacy policy link,
- terms link,
- at least 3 high-quality images,
- demo site using a real Wix site with the app installed.

Listing copy must match the product exactly:

- do not claim in-site AI generation,
- do not claim AI API integration,
- do not claim page body scraping,
- do not claim automatic translation,
- do not claim analytics, A/B testing, or conversion tracking,
- do not claim official partnership with AI providers.

Recommended positioning:

```text
Let visitors open your page in their preferred AI assistant with a prompt you
control.
```

Recommended feature bullets:

- Add AI action buttons to Wix pages
- Choose ChatGPT, Claude, and Gemini on Free
- Create custom AI destinations on Plus
- Configure different prompts for each site language on Plus
- Use URL prefill or copy prompt delivery

## Review Notes Package

Prepare App Review notes before submission.

Include:

- reviewer test account, if any,
- test Wix site URL,
- demo site URL,
- Free test path,
- Plus test path,
- upgrade flow steps,
- downgrade/cancellation behavior,
- language profile setup steps,
- custom AI setup steps,
- explanation that the app opens third-party AI sites only after user click,
- no-affiliation statement for AI provider brands,
- privacy summary: no page body scraping, no AI conversations collected.

This is important because the app's core behavior intentionally opens external
AI providers. The review notes should make the user-initiated flow and privacy
boundary explicit.

## Front-Site Widget Review Requirements

The live widget must:

- render on a published Wix site,
- render in Editor / preview without blank states,
- avoid horizontal overflow on mobile,
- avoid `<h1>` inside widget HTML,
- be accessible by keyboard where applicable,
- include readable labels/tooltips for icon-only controls,
- UTF-8 encode all user-entered text,
- avoid distracting animations,
- avoid ads and visitor-facing watermarks,
- open third-party AI providers only after explicit visitor action,
- use `noopener` and `noreferrer` for third-party links.

Potential review risk:

Wix generally discourages uncontrolled browser popups. AI provider navigation
must be user-initiated, predictable, and explained in the UI. If URL Prefill
fails, fallback to Copy Prompt + Open or a manual copy modal.

## Dashboard Review Requirements

The dashboard must:

- load from a public HTTPS URL,
- not require a separate Zider login for P0 unless there is a documented reason,
- show clear first-install onboarding,
- save and reload settings without manual refresh,
- expose all required configuration for the current plan,
- show Plus locks only in owner/editor/admin surfaces,
- never show upgrade prompts to site visitors,
- include support/help links,
- handle empty, invalid, and unsaved states.

If demo data is needed, use realistic fictional sample content. Do not use
Lorem ipsum.

## Legal And Privacy

Required:

- privacy policy,
- terms of use,
- support email,
- third-party AI disclosure,
- GDPR readiness if available in EU regions,
- cookie/consent compliance if any tracking or cookies are added later.

Privacy claims must match implementation:

- no visitor names,
- no visitor emails,
- no visitor AI accounts,
- no AI conversation content,
- no AI answer content,
- no page body content,
- no browsing history.

Third-party disclosure:

```text
When a visitor chooses an AI provider, the configured prompt and current page
URL may be opened in that third-party AI service.
```

## Security Requirements

- serve all app surfaces over HTTPS,
- validate all custom Provider URLs,
- reject non-HTTPS provider URLs,
- reject `javascript:`, `data:`, and `file:` schemes,
- protect against XSS in all user-entered title, prompt, URL, and label fields,
- protect save endpoints from CSRF where applicable,
- never store Wix app secret or refresh tokens in frontend code,
- encrypt or otherwise secure sensitive credentials,
- use per-instance authorization checks on every config read/write,
- do not request personal user information unless it is necessary.

## Performance Requirements

The widget runtime should target fast startup and avoid blocking page load.

Requirements:

- async script load where possible,
- small runtime bundle,
- no AI API calls in front-site runtime,
- no page body scraping,
- no synchronous third-party requests before render,
- graceful fallback if config fetch fails,
- cache published config where appropriate.

## QA Matrix Before Submission

Test on:

- Chrome,
- Safari,
- Edge,
- Firefox,
- iPhone Safari / Chrome,
- Android Chrome,
- iPad / tablet browser,
- Wix Editor,
- Wix preview,
- published live Wix site.

Test flows:

- fresh install,
- first onboarding,
- save Free settings,
- publish site,
- click each built-in provider,
- URL Prefill,
- Copy Prompt + Open,
- clipboard failure fallback,
- upgrade to Plus,
- create Language Profile,
- custom AI provider,
- Wix language switch,
- fallback profile,
- plan cancellation / return to Free,
- app removed webhook,
- site duplication,
- multiple Wix sites under one owner.

## Rejection Risks To Prevent

High-risk items:

- listing says a feature exists but the app does not implement it,
- dashboard or widget has broken buttons or stuck loading,
- app cannot be installed on a fresh Wix site,
- paid features are accessible on Free,
- app does not recognize Plus after upgrade,
- upgrade prompts appear to public site visitors,
- demo site is broken or empty,
- screenshots are low quality or not showing the app in use,
- privacy/terms links are missing,
- app references AI provider brands in a way that implies affiliation,
- app requests unnecessary permissions,
- app redirects users to external payment flows,
- app profile changes are saved as draft but not released before submission.

## P0 Additions To The Product Backlog

| ID | Requirement | Priority |
| --- | --- | --- |
| ZAA-MKT-001 | Finalize app name, app key, support email, privacy URL, terms URL | P0 |
| ZAA-MKT-002 | Choose Wix app implementation path and dashboard/widget URLs | P0 |
| ZAA-MKT-003 | Define minimum Wix permissions and document why each is needed | P0 |
| ZAA-MKT-004 | Add install, uninstall, and paid-plan webhooks | P0 |
| ZAA-MKT-005 | Configure Free and Plus in Wix Billing | P0 |
| ZAA-MKT-006 | Implement Wix checkout upgrade flow for Plus | P0 |
| ZAA-MKT-007 | Add plan recognition and backend enforcement by instanceId | P0 |
| ZAA-MKT-008 | Create market listing copy, keywords, audience, and benefit text | P0 |
| ZAA-MKT-009 | Produce at least 3 listing screenshots and a real Wix demo site | P0 |
| ZAA-MKT-010 | Write App Review notes with Free/Plus/language/custom AI test paths | P0 |
| ZAA-MKT-011 | Add third-party AI disclosure and no-affiliation language | P0 |
| ZAA-MKT-012 | Run the full Wix App Checks QA matrix before submission | P0 |

## Open Decisions

- Final app icon and listing visual direction.
- Final App Market category.
- Whether the listing language starts in English only or includes Chinese at
  launch.
- Whether Plus should include a free trial.
- Whether annual Plus pricing should be offered at launch.
- Whether app distribution starts as unlisted/private testing before App Market
  submission.
