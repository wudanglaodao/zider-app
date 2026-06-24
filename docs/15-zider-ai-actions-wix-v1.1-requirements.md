# Zider AI Actions Wix Free-First Requirements

Source: `/Users/yancy/Desktop/Zider_AI_Actions_Wix_V1.1_套餐与多语言需求.md`

This document reorganizes the package, multilingual, and App Market launch
requirements into an implementation-oriented source of truth.

## Product Goal

Zider AI Actions adds AI action buttons to a Wix site. A visitor clicks
ChatGPT, Claude, Gemini, or a custom AI provider, then the widget opens the
selected third-party AI service with a site-owner configured prompt.

V1.0 should deliver a Free-first Wix App Market app that is:

- installable,
- configurable,
- publishable.

Paid Plus is a post-launch release. V1.0 must not depend on Wix Billing,
checkout, subscription state, or paid feature unlocks.

The core Wix surface is one Site Widget with two layouts:

- Footer Bar
- Large Icons

## Release Strategy

Ship in three phases:

```text
V1.0 Free Launch
-> V1.1 Plus Foundation
-> V1.2 Plus Analytics
```

V1.0 Free Launch:

- Wix App Market submission,
- Free forever,
- no Wix Billing,
- no paid checkout,
- no active Plus subscription logic,
- 3 built-in providers: ChatGPT, Claude, Gemini,
- one shared Default Profile,
- one shared Prompt,
- Footer Bar and Large Icons,
- Prompt preview,
- draft / published config lifecycle,
- no `Powered by Zider`,
- no custom AI,
- no Language Profiles,
- no click reports.

V1.1 Plus Foundation:

- Wix Billing,
- Plus plan at `$4.99/month`,
- upgrade flow,
- backend paid feature enforcement,
- Custom AI,
- complete Language Profiles,
- language-specific Prompt, provider list, provider URL, and delivery mode.

V1.2 Plus Analytics:

- daily clicks,
- clicks by language / locale,
- clicks by provider,
- language + provider breakdowns.

Do not advertise Plus or analytics in the V1.0 App Market listing until those
features are implemented and ready for review.

## Implementation Shape And Data Hosting

Zider AI Actions uses a hybrid Wix implementation:

```text
Wix CLI app shell + Zider-hosted backend, workspace, and runtime APIs
```

Wix owns:

- App Market identity,
- Wix app installation flow,
- Wix permissions,
- Wix Billing in the post-launch Plus release,
- dashboard/page extension shell,
- site widget / extension shell,
- install and remove event sources,
- paid-plan event sources after Plus is enabled.

Zider owns and hosts:

- configuration storage,
- `draftConfig`,
- `publishedConfig`,
- prompts,
- Language Profiles,
- provider registry and custom provider config,
- Free package enforcement in V1.0,
- Free / Plus package enforcement after Plus is enabled,
- runtime config API,
- future Plus click report aggregates.

The Wix CLI project should stay thin. It should integrate with Wix-native app
surfaces and forward identity, installation, billing, and extension context to
Zider services. It should not become the primary business database or duplicate
Zider package enforcement logic.

Canonical data isolation key:

```text
app_key + platform + instance_id
```

Initial values:

```text
app_key = zider_ai_actions
platform = wix
instance_id = Wix installation instanceId
```

Zider AI Actions should use dedicated app data tables rather than the generic
`widget_configs` table. The configuration model includes profiles, providers,
package gates, draft/published lifecycle, uninstall retention, and future report
aggregates, so a typed schema is safer than a broad shared JSON bucket.

Required dedicated tables:

```text
ai_actions_installations
ai_actions_site_configs
ai_actions_provider_registry
ai_actions_click_daily_aggregates
ai_actions_click_events
```

`ai_actions_click_events` is only for future Plus analytics deduplication or
short retention. It is not required for the first App Market submission.

## Non-Negotiable Product Rules

- The app does not call AI APIs.
- The app does not generate summaries inside the site.
- The app does not read or scrape page body content in V1.
- The app does not auto-generate prompts.
- The app does not auto-translate prompts.
- The app does not auto-copy every provider setting across languages.
- Prompt content comes only from a static starter prompt or a site owner edit.
- Runtime replacement is limited to `{siteName}`, `{pageTitle}`, `{pageUrl}`,
  and `{language}`.
- Third-party AI answers are produced by the visitor's selected AI platform.

## Plan Definition

Free is a single-language, single-audience configuration. It may be written in
any language, but it cannot store different configurations for different Wix
languages.

Plus is a post-launch language-profile system. Each language or locale can have
a different audience experience, including different text, prompts, providers,
ordering, custom AI providers, URLs, and delivery modes.

| Capability | V1.0 Free | Post-launch Plus |
| --- | --- | --- |
| Footer Bar layout | Yes | Yes |
| Large Icons layout | Yes | Yes |
| Built-in providers | ChatGPT, Claude, Gemini | ChatGPT, Claude, Gemini |
| Enabled provider count | Max 3 built-in providers | Unlimited |
| Custom AI providers | No | Unlimited |
| Single prompt | Yes | Yes |
| Language-specific prompts | No | Yes |
| Language-specific provider list | No | Yes |
| Language-specific provider order | No | Yes |
| Language-specific custom AI | No | Yes |
| Language-specific provider URL | No | Yes |
| Language-specific delivery mode | No | Yes |
| Multilingual widget title / description | No | Yes |
| Zider branding in widget | Not shown | Not shown |
| Advanced styling | No | Yes |

## Free Requirements

Free stores one `Default Profile` for the whole site.

The profile includes:

- site or brand name,
- widget title,
- optional description,
- prompt,
- copied message,
- up to 3 built-in AI providers,
- provider order,
- widget appearance.

Initial Free install writes:

- plan: `free`,
- profile: `Default Profile`,
- title: `Get an AI summary of {siteName}`,
- static default prompt,
- enabled providers: ChatGPT, Claude, and Gemini,
- language mode: single profile,
- layout: Footer Bar,
- theme: follow site theme,
- branding: none.

Free restrictions:

- at most 3 enabled built-in AI providers,
- no custom AI,
- no custom provider URL,
- no locale-specific provider settings,
- no language profiles.

If future built-in providers are added and a Free user tries to enable a fourth
provider, show:

```text
Free plan supports up to 3 built-in AI tools.
Upgrade to Plus to add more tools.
```

## Post-Launch Plus Requirements

Plus is not required for the V1.0 App Market submission. These requirements
define the V1.1 Plus Foundation release.

When Plus ships, it should support unlimited providers and multiple
`Language Profiles`.

Plus should ship the complete Language Profile configuration model in the first
Plus release. Do not split core multilingual configuration across multiple paid
releases unless App Market review or implementation constraints force it.

Each Language Profile contains:

- profile language / locale,
- enabled status,
- widget title,
- optional description,
- prompt,
- copied message,
- AI provider list,
- provider order,
- provider labels,
- provider icons,
- custom AI providers,
- provider URL templates,
- prompt delivery modes.

Complete Plus multilingual scope for V1.1:

- create multiple Language Profiles,
- duplicate a Language Profile,
- enable / disable a Language Profile,
- set fallback profile,
- configure title, description, Prompt, copied message per profile,
- configure provider list and order per profile,
- configure provider label per profile,
- configure provider URL template per profile,
- configure delivery mode per provider and profile,
- configure custom AI per profile,
- resolve runtime profile by Wix language / locale.

Plus should use full locales where possible, not only language codes:

```text
en-US
en-GB
zh-CN
zh-TW
pt-BR
pt-PT
```

This allows different regions that share a language to have different provider
sets and prompts.

## Multilingual Runtime Logic

Free runtime:

```text
Visitor opens any Wix language page
-> widget always reads Default Profile
-> widget displays the same title, prompt, and providers
```

Plus runtime:

```text
Read current Wix page language / locale
-> find matching Language Profile
-> load profile title, description, prompt, providers, and order
-> replace supported variables
-> open or copy prompt for the selected AI provider
```

Plus fallback order:

```text
Current language profile
-> site default language profile
-> first enabled profile
```

If no profile is available, the front-site widget should not render. The editor
should show a configuration error.

## Prompt Requirements

Default prompt is static and shipped with the product. It should ask the AI
platform to explain the current page using the configured prompt and official
sources where available, then respond in `{language}`.

Supported variables:

```text
{siteName}
{pageTitle}
{pageUrl}
{language}
```

Free editor:

- one prompt editor,
- one preview,
- reset to default.

Plus editor:

- one prompt editor per Language Profile,
- one preview per profile,
- reset per profile.

Editing one Plus profile must not change any other profile.

## AI Provider Requirements

Built-in providers for V1.0:

- ChatGPT
- Claude
- Gemini

Each built-in provider should define:

- provider ID,
- provider name,
- brand icon,
- monochrome icon,
- default URL,
- default delivery mode.

Use brand icons for the three built-in providers in V1.0:

```text
ChatGPT
Claude
Gemini
```

Brand icons should be bundled as product assets where possible so the widget
does not depend on third-party image hosts at runtime. Listing, UI copy, and
review notes must avoid implying official partnership or endorsement by the AI
providers.

Free users can select, enable, disable, sort, show names, and set icon style for
up to 3 built-in providers. Free users cannot modify built-in provider URLs.

Plus users can:

- enable all built-in providers,
- create unlimited custom AI providers,
- enable providers per Language Profile,
- order providers per profile,
- edit labels per profile,
- configure URL templates per profile,
- configure delivery mode per profile.

Custom AI fields:

- provider name,
- button label,
- provider icon,
- URL template,
- delivery mode,
- enabled status,
- order,
- language profile.

URL Template variables:

```text
{prompt}
{siteName}
{pageTitle}
{pageUrl}
{language}
```

URL validation:

- require HTTPS,
- reject `javascript:`,
- reject `data:`,
- reject `file:`,
- require `{prompt}` for URL Prefill mode,
- validate URL format before save.

## Prompt Delivery Modes

URL Prefill:

```text
Generate finalPrompt
-> URL encode it
-> inject into provider URL template
-> open in a new tab
```

Copy Prompt + Open:

```text
Generate finalPrompt
-> copy to clipboard
-> open AI provider
-> show copied confirmation
```

Fallback to Copy Prompt + Open when:

- provider does not support prefill,
- prompt exceeds safe URL length,
- browser blocks the generated URL,
- URL template configuration fails.

If clipboard copy fails, show a manual prompt modal with Copy and Open AI
actions.

## Front-Site Widget Requirements

Footer Bar includes:

- title,
- optional description,
- AI icons,
- optional provider names,
- tooltips.

Large Icons includes:

- title,
- optional description,
- large provider cards,
- provider icons,
- provider names.

Responsive rules:

- desktop: horizontal layout with wrapping,
- tablet: automatic wrapping,
- mobile: 1 to 2 tools per row,
- no horizontal overflow,
- Plus provider counts must wrap across multiple lines.

## Dashboard Requirements

Free dashboard sections:

- General
- AI Tools
- Prompt
- Design
- Plus coming soon / upgrade entry

Free General fields:

- site / brand name,
- widget title,
- optional description.

Free AI Tools:

- ChatGPT,
- Claude,
- Gemini,
- maximum 3 enabled.

Free Design:

- Footer Bar / Large Icons,
- theme,
- alignment,
- icon style,
- icon size,
- show provider name.

Post-launch Plus dashboard sections:

- General
- Language Profiles
- AI Tools
- Prompt
- Design
- Subscription

Language Profile list item fields:

- locale,
- profile name,
- enabled status,
- AI tool count,
- last updated.

Language Profile list actions:

- add profile,
- edit,
- duplicate,
- enable / disable,
- delete,
- set as fallback.

Language Profile editor fields:

- profile language / locale,
- widget title,
- optional description,
- prompt,
- copied message,
- AI tool list,
- custom AI,
- provider order,
- provider label,
- provider URL,
- delivery mode,
- preview.

## Configuration Scope

Free site-level configuration:

```text
1 profile
1 prompt
up to 3 built-in providers
1 title set
1 message set
```

Plus site-level configuration:

```text
multiple Language Profiles
profile-specific prompt
profile-specific title and description
profile-specific providers and order
profile-specific custom AI
profile-specific provider URL
profile-specific delivery mode
profile-specific messages
```

Widget-instance configuration remains separate:

- Footer Bar / Large Icons,
- theme,
- alignment,
- icon size,
- show provider name.

## Configuration Lifecycle

The app must separate editable configuration from published runtime
configuration.

Required states:

```text
draftConfig
publishedConfig
lastPublishedAt
lastSavedAt
configVersion
```

Dashboard behavior:

- editing writes `draftConfig`,
- preview uses `draftConfig`,
- publish copies validated `draftConfig` to `publishedConfig`,
- reset to default updates only the current draft until published,
- unsaved changes must be clearly indicated,
- leaving the dashboard with unsaved changes should warn the site owner.

Front-site behavior:

- the live widget reads only `publishedConfig`,
- if no published config exists, the live widget does not render,
- if published config is invalid, the live widget does not render,
- owner/editor surfaces should show the configuration error.

This avoids showing half-configured prompts or invalid provider URLs to visitors.

## API Contract Requirements

Exact route names can follow the existing app conventions, but the following
capabilities are required:

- read current installation and plan by Wix `instanceId`,
- create first-install default config,
- read draft config,
- save draft config,
- validate draft config,
- publish draft config,
- read published runtime config from the front-site widget,
- receive Wix install/remove/paid-plan events,
- resolve current Free / Plus feature gates on save and publish.

Runtime config responses must not expose:

- Wix access tokens,
- app secrets,
- billing event payloads,
- unpublished draft config,
- inactive Plus-only profile data while the installation is Free.

Save and publish endpoints must run the same package validation rules as the UI.

## Validation Limits

Use explicit limits so the dashboard, API, and widget agree.

| Field | Limit |
| --- | ---: |
| Widget title | 120 characters |
| Optional description | 240 characters |
| Prompt | 8,000 characters |
| Copied message | 160 characters |
| Provider label | 40 characters |
| Provider name | 60 characters |
| URL Template | 2,000 characters |
| Language Profile name | 80 characters |

Plus does not have a hard provider count limit. However, the dashboard should
show a usability warning when a single profile has more than 12 visible
providers, because the front-site widget may become noisy even though it remains
valid.

Generated URL Prefill links should fall back to `Copy Prompt + Open` when the
final encoded URL is longer than 1,800 characters.

## Suggested Data Model

Storage owner:

```text
Zider-hosted database
```

Primary scope key:

```text
app_key + platform + instance_id
```

Dedicated table ownership:

| Table | Purpose |
| --- | --- |
| `ai_actions_installations` | Current Wix installation, plan state, and lifecycle metadata |
| `ai_actions_site_configs` | Draft and published AI Actions site configuration |
| `ai_actions_provider_registry` | Versioned built-in provider defaults and icon metadata |
| `ai_actions_click_daily_aggregates` | Future Plus aggregate reports by date, locale, provider, and delivery mode |
| `ai_actions_click_events` | Future short-retention click events for dedupe/replay only |

Subscription:

```json
{
  "plan": "free",
  "status": "active"
}
```

SiteConfig:

```json
{
  "configVersion": 2,
  "initialized": true,
  "siteName": "Respan",
  "defaultLocale": "en-US",
  "fallbackProfileId": "profile-en-us",
  "profiles": [],
  "updatedAt": "ISO_DATE"
}
```

Free Profile:

```json
{
  "id": "default-profile",
  "mode": "single",
  "locale": null,
  "title": "Get an AI summary of {siteName}",
  "description": "",
  "prompt": "As a potential visitor or customer...",
  "copiedMessage": "Prompt copied. Paste it into the AI assistant to continue.",
  "providers": [
    {
      "providerId": "chatgpt",
      "enabled": true,
      "order": 1
    },
    {
      "providerId": "claude",
      "enabled": true,
      "order": 2
    },
    {
      "providerId": "gemini",
      "enabled": true,
      "order": 3
    }
  ]
}
```

Plus Language Profile:

```json
{
  "id": "profile-zh-cn",
  "mode": "locale",
  "locale": "zh-CN",
  "enabled": true,
  "title": "使用 AI 快速了解 {siteName}",
  "description": "",
  "prompt": "请从潜在客户的角度解释此页面...",
  "copiedMessage": "提示词已复制，请粘贴到 AI 助手中继续。",
  "providers": [
    {
      "instanceId": "provider-deepseek-zh",
      "providerId": "custom",
      "name": "DeepSeek",
      "label": "DeepSeek",
      "iconUrl": "https://...",
      "enabled": true,
      "order": 1,
      "urlTemplate": "https://example.ai/?q={prompt}",
      "deliveryMode": "urlPrefill"
    }
  ]
}
```

## Provider Registry

Built-in providers should live in a versioned registry rather than hard-coded
inside UI components.

Each registry entry must include:

- provider ID,
- public display name,
- brand icon asset key,
- monochrome icon asset key,
- default delivery mode,
- default URL template,
- prefill support status,
- fallback delivery mode,
- provider terms / brand reference link for internal review,
- no-affiliation copy note for listing and review materials.

Initial provider IDs:

```text
chatgpt
claude
gemini
```

If a provider changes its URL or prefill behavior, update the registry and ship
it as a config/versioned product update. Do not require site owners to fix
built-in provider URLs manually.

## Error And Empty States

Front-site widget:

- no published config: render nothing,
- config fetch failure: render nothing and log an operational error,
- no enabled provider in selected profile: render nothing,
- current language profile disabled: use fallback profile,
- all fallback profiles invalid: render nothing,
- third-party URL blocked: show manual copy modal,
- clipboard failure: show manual copy modal.

Dashboard:

- no config: create default config automatically,
- invalid Prompt: block save and publish,
- invalid Provider URL: block save and publish,
- Free user attempts Plus feature: show upgrade prompt,
- subscription status unavailable: use last confirmed plan; if none exists,
  default to Free until billing is resolved,
- webhook/billing delay after upgrade: show a retry/check status action.

Do not show owner-facing errors or upgrade prompts to public site visitors.

## Package Enforcement

Package checks must run in both the UI and the backend. Hidden or disabled UI is
not sufficient because users can still call save endpoints directly.

V1.0 only enforces Free rules. Plus rules become active after Wix Billing and
the Plus release are implemented.

V1.0 Free backend rules:

- enabled providers <= 3,
- custom AI count = 0,
- language profile count = 1,
- locale-specific provider config is rejected.

Post-launch Plus backend rules:

- provider count is unlimited,
- custom AI count is unlimited,
- language profile count is unlimited,
- locale-specific provider config is allowed.

## Upgrade And Downgrade

Upgrade and downgrade behavior is post-launch Plus scope. V1.0 Free Launch does
not include Wix Billing, paid checkout, or active subscription transitions.

Free -> Plus:

- keep existing title,
- keep existing prompt,
- keep existing 3 built-in providers,
- keep appearance,
- convert Default Profile into the site default language profile,
- unlock Language Profiles,
- unlock Custom AI,
- remove provider count limit.

When adding a new Plus language profile, provide three initialization choices:

- Use Zider starter template,
- Duplicate another language profile,
- Start blank.

Starter templates are static product templates. Duplicate does not translate.

Plus -> Free:

- do not delete Plus configuration,
- require the owner to choose one Default Profile and up to 3 built-in providers,
- if no choice is made, use the fallback profile and the first 3 built-in
  providers,
- disable custom AI in the Free runtime,
- keep other Plus settings read-only for future re-upgrade.

## Paid Feature Locks

Paid feature locks are passive in V1.0. The dashboard may show Plus as coming
soon, but must not route users to checkout or claim that Plus is available until
Wix Billing and Plus are implemented.

Show an upgrade prompt when Free users try to:

- add Custom AI,
- enable Language Profiles,
- configure AI by language,
- use advanced styling.

Upgrade prompt:

```text
Upgrade to Plus

Create independent AI experiences for every site language.
Configure different prompts, AI tools and custom providers for different audiences.
```

Do not discard unsaved user input when presenting a paid lock.

## Privacy And Security

V1 does not collect:

- visitor names,
- visitor emails,
- visitor AI accounts,
- AI conversation content,
- AI answer content,
- page body content,
- browsing history.

Operational logs may store app health data such as `app_key`, `instance_id`,
provider ID, error code, and timestamp. They must not store final Prompt text,
visitor AI responses, visitor identifiers, or page body content.

On uninstall:

- mark the installation as removed,
- stop serving the widget runtime config for that `instanceId`,
- retain configuration for 30 days for accidental reinstall recovery,
- delete or anonymize retained configuration earlier if required by user request
  or policy.

Before opening a third-party AI provider, communicate that the configured prompt
and current page URL will be opened in a third-party AI service.

External links must:

- open in a new tab,
- use `noopener`,
- use `noreferrer`,
- pass HTTPS validation.

## Future Plus Analytics

Click analytics is a post-V1.1 feature. It should be designed now so the data
boundary is clear, but it is not required for the first App Market submission.

Report access:

- only active Plus subscribers can view click reports,
- Free users cannot view reports,
- Free dashboards may show a locked Reports entry with an upgrade CTA,
- public site visitors never see reports or analytics notices in the widget UI.

Minimum report metrics:

- total AI action clicks by day,
- AI action clicks by Wix language / locale,
- AI action clicks by provider,
- AI action clicks by language and provider.

Default report date ranges:

- last 7 days,
- last 30 days,
- last 90 days.

Date grouping should use the Wix site timezone when available. If unavailable,
use UTC and show that timezone in the report UI.

Click event collection:

- collect click analytics only when the installation has active Plus and the
  reports feature is enabled,
- Free installations do not collect click analytics by default,
- record a click only after a visitor intentionally selects an AI provider,
- count the visitor action once even if the delivery mode falls back,
- never block opening the AI provider if analytics recording fails,
- prefer `sendBeacon` or `fetch` with keepalive for front-site recording,
- use an event ID for deduplication, not a visitor ID.

Allowed analytics fields:

```text
app_key
platform
instance_id
event_id
clicked_at
event_date
provider_id
provider_type
profile_locale
effective_locale
delivery_mode
plan_at_click
```

Analytics must not store:

- final Prompt text,
- configured Prompt text,
- AI response content,
- visitor name,
- visitor email,
- visitor account,
- visitor ID,
- IP address,
- user agent,
- page body,
- full page URL.

Suggested aggregate table:

```text
app_key
platform
instance_id
event_date
profile_locale
provider_id
delivery_mode
click_count
updated_at
```

Suggested unique aggregate key:

```text
app_key + platform + instance_id + event_date + profile_locale + provider_id + delivery_mode
```

Raw minimal click events, if stored for deduplication or replay, should be
retained for no more than 30 days. Aggregated daily counts may be retained while
the app is installed.

Report UI requirements for Plus:

- daily clicks chart,
- language / locale breakdown table,
- provider breakdown table,
- empty state when no clicks exist,
- clear timezone label,
- no visitor-level drilldown.

If click analytics becomes part of a submitted App Market listing, update the
privacy policy, review notes, and listing copy before claiming analytics.

## Out Of Scope For V1.0 Free Launch

- AI-generated prompts
- AI-translated prompts
- AI-recommended regional provider sets
- country detection by IP
- page body scraping
- in-site generated summaries
- in-site AI chatbot
- AI API keys
- token credits
- click report dashboard
- conversion analytics
- A/B testing
- per-page profiles
- identity-based profiles
- AI answer archives
- automatic provider URL sync
- storing final generated prompts for analytics
- tracking visitor-level AI provider clicks
- visitor-level analytics
- page-level click analytics

Plus Language Profiles are driven by Wix language / locale, not visitor IP.

## Accessibility Requirements

The widget must support:

- keyboard focus on every provider action,
- visible focus states,
- accessible names for icon-only buttons,
- tooltip text that is not the only source of information,
- sufficient color contrast for text and icons,
- responsive layout without text overlap,
- no required hover-only interaction on mobile.

The dashboard must keep form labels programmatically associated with inputs and
must surface validation errors near the relevant field.

## Acceptance Criteria

V1.0 Free Launch:

- initial install writes one static default prompt,
- initial install enables 3 built-in providers,
- at most 3 built-in providers can be enabled,
- owner can choose among ChatGPT, Claude, and Gemini,
- custom AI cannot be added,
- language profiles cannot be created,
- all Wix language pages share one configuration,
- no `Powered by Zider` label is displayed.

V1.0 common:

- variables are replaced correctly,
- page body is not scraped,
- AI APIs are not called,
- providers open in a new tab,
- URL Prefill works,
- URL Prefill falls back when the encoded URL exceeds 1,800 characters,
- Copy Prompt + Open works,
- clipboard failure shows a manual copy modal,
- mobile multi-provider layout wraps correctly,
- draft config does not affect the live widget until publish,
- invalid config cannot be published,
- public visitors never see upgrade prompts,
- App Market listing does not advertise Plus or analytics.

Post-launch Plus:

- provider count is unlimited,
- unlimited Custom AI providers can be added,
- multiple Language Profiles can be created,
- each profile can use a different prompt,
- each profile can use different providers,
- each profile can use different provider order,
- each profile can use different provider URL,
- each profile can use different delivery mode,
- Wix language changes load the matching profile,
- missing current-language profile uses fallback,
- upgrade keeps Free configuration,
- downgrade preserves Plus configuration.

Future Plus analytics:

- Free users cannot view reports,
- active Plus users can view daily clicks,
- active Plus users can view clicks by language / locale,
- active Plus users can view clicks by provider,
- analytics never stores Prompt text or visitor identifiers,
- analytics recording failure does not block opening the AI provider.

## Implementation Backlog

| ID | Feature | Plan | Phase |
| --- | --- | --- | --- |
| ZAA-001 | Initial install writes static default prompt | Free | V1.0 |
| ZAA-002 | Manual prompt editing | Free | V1.0 |
| ZAA-003 | Prompt variable replacement | Free | V1.0 |
| ZAA-004 | Footer Bar | Free | V1.0 |
| ZAA-005 | Large Icons | Free | V1.0 |
| ZAA-006 | ChatGPT provider | Free | V1.0 |
| ZAA-007 | Claude provider | Free | V1.0 |
| ZAA-008 | Gemini provider | Free | V1.0 |
| ZAA-009 | Free max 3 built-in AI providers | Free | V1.0 |
| ZAA-010 | URL Prefill | Free | V1.0 |
| ZAA-011 | Copy Prompt + Open | Free | V1.0 |
| ZAA-012 | Provider safety validation | Free | V1.0 |
| ZAA-013 | Free backend package enforcement | Free | V1.0 |
| ZAA-014 | Responsive multi-line layout | Free | V1.0 |
| ZAA-015 | Prompt Preview | Free | V1.0 |
| ZAA-016 | No forced Zider branding | Free | V1.0 |
| ZAA-017 | Draft / published config lifecycle | Free | V1.0 |
| ZAA-018 | Runtime config API hides draft and secret data | Free | V1.0 |
| ZAA-019 | Field length validation | Free | V1.0 |
| ZAA-020 | Provider registry with versioned defaults | Free | V1.0 |
| ZAA-021 | Manual copy modal fallback | Free | V1.0 |
| ZAA-022 | Accessibility baseline | Free | V1.0 |
| ZAA-023 | Uninstall retention and runtime disable behavior | Free | V1.0 |
| ZAA-024 | Hybrid Wix CLI shell integration | Free | V1.0 |
| ZAA-025 | Zider-hosted typed AI Actions data schema | Free | V1.0 |
| ZAA-026 | Built-in provider brand icons | Free | V1.0 |
| ZAA-027 | Wix Billing and Plus plan recognition | Plus | V1.1 |
| ZAA-028 | Upgrade flow and Plus feature locks | Plus | V1.1 |
| ZAA-029 | Unlimited providers | Plus | V1.1 |
| ZAA-030 | Custom AI providers | Plus | V1.1 |
| ZAA-031 | Complete Language Profiles | Plus | V1.1 |
| ZAA-032 | Language-specific prompts | Plus | V1.1 |
| ZAA-033 | Language-specific provider lists | Plus | V1.1 |
| ZAA-034 | Language-specific provider order | Plus | V1.1 |
| ZAA-035 | Language-specific provider URL | Plus | V1.1 |
| ZAA-036 | Language-specific delivery mode | Plus | V1.1 |
| ZAA-037 | Wix current-language matching | Plus | V1.1 |
| ZAA-038 | Fallback profile | Plus | V1.1 |
| ZAA-039 | Duplicate Language Profile | Plus | V1.1 |
| ZAA-040 | Free -> Plus migration | Plus | V1.1 |
| ZAA-041 | Plus -> Free preservation | Plus | V1.1 |
| ZAA-042 | Advanced styling | Plus | V1.1 |
| ZAA-043 | Plus-only daily click reports | Plus | V1.2 |
| ZAA-044 | Plus-only click reports by language / locale | Plus | V1.2 |
| ZAA-045 | Plus-only click reports by provider | Plus | V1.2 |
| ZAA-046 | Anonymous aggregate click event collection | Plus | V1.2 |

## Open Implementation Questions

- What are the final Wix billing plan IDs for Free and Plus?
- Which locales should ship with static starter prompt templates on day one?
- Should dashboard UI localization launch in English only, or include Chinese at
  first release?
