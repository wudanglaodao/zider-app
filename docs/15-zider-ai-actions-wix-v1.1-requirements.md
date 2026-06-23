# Zider AI Actions Wix V1.1 Requirements

Source: `/Users/yancy/Desktop/Zider_AI_Actions_Wix_V1.1_套餐与多语言需求.md`

This document reorganizes the V1.1 package and multilingual requirements into
an implementation-oriented source of truth.

## Product Goal

Zider AI Actions adds AI action buttons to a Wix site. A visitor clicks
ChatGPT, Claude, Gemini, or a custom AI provider, then the widget opens the
selected third-party AI service with a site-owner configured prompt.

V1.1 should deliver a Wix App Market app that is:

- installable,
- configurable,
- subscribable,
- publishable,
- limited by Free / Plus package rules.

The core Wix surface is one Site Widget with two layouts:

- Footer Bar
- Large Icons

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

Plus is a language-profile system. Each language or locale can have a different
audience experience, including different text, prompts, providers, ordering,
custom AI providers, URLs, and delivery modes.

| Capability | Free | Plus |
| --- | --- | --- |
| Footer Bar layout | Yes | Yes |
| Large Icons layout | Yes | Yes |
| Built-in providers | ChatGPT, Claude, Gemini | ChatGPT, Claude, Gemini |
| Enabled provider count | Max 2 | Unlimited |
| Custom AI providers | No | Unlimited |
| Single prompt | Yes | Yes |
| Language-specific prompts | No | Yes |
| Language-specific provider list | No | Yes |
| Language-specific provider order | No | Yes |
| Language-specific custom AI | No | Yes |
| Language-specific provider URL | No | Yes |
| Language-specific delivery mode | No | Yes |
| Multilingual widget title / description | No | Yes |
| Remove `Powered by Zider` | No | Yes |
| Advanced styling | No | Yes |

## Free Requirements

Free stores one `Default Profile` for the whole site.

The profile includes:

- site or brand name,
- widget title,
- optional description,
- prompt,
- copied message,
- up to 2 built-in AI providers,
- provider order,
- widget appearance.

Initial Free install writes:

- plan: `free`,
- profile: `Default Profile`,
- title: `Get an AI summary of {siteName}`,
- static default prompt,
- enabled providers: ChatGPT and Claude,
- language mode: single profile,
- layout: Footer Bar,
- theme: follow site theme,
- branding: `Powered by Zider`.

Free restrictions:

- at most 2 enabled AI providers,
- no custom AI,
- no custom provider URL,
- no locale-specific provider settings,
- no language profiles,
- no branding removal.

If a Free user tries to enable a third provider, show:

```text
Free plan supports up to 2 AI tools.
Upgrade to Plus to add more tools.
```

## Plus Requirements

Plus supports unlimited providers and multiple `Language Profiles`.

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

Built-in providers for V1.1:

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

Free users can select, enable, disable, sort, show names, and set icon style for
up to 2 built-in providers. Free users cannot modify built-in provider URLs.

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
- tooltips,
- optional `Powered by Zider`.

Large Icons includes:

- title,
- optional description,
- large provider cards,
- provider icons,
- provider names,
- optional `Powered by Zider`.

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
- Upgrade to Plus

Free General fields:

- site / brand name,
- widget title,
- optional description.

Free AI Tools:

- ChatGPT,
- Claude,
- Gemini,
- maximum 2 enabled.

Free Design:

- Footer Bar / Large Icons,
- theme,
- alignment,
- icon style,
- icon size,
- show provider name.

Plus dashboard sections:

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
up to 2 built-in providers
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

## Suggested Data Model

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

## Package Enforcement

Package checks must run in both the UI and the backend. Hidden or disabled UI is
not sufficient because users can still call save endpoints directly.

Free backend rules:

- enabled providers <= 2,
- custom AI count = 0,
- language profile count = 1,
- locale-specific provider config is rejected,
- remove branding is rejected.

Plus backend rules:

- provider count is unlimited,
- custom AI count is unlimited,
- language profile count is unlimited,
- locale-specific provider config is allowed,
- remove branding is allowed.

## Upgrade And Downgrade

Free -> Plus:

- keep existing title,
- keep existing prompt,
- keep existing 2 providers,
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
- require the owner to choose one Default Profile and up to 2 built-in providers,
- if no choice is made, use the fallback profile and the first 2 built-in
  providers,
- disable custom AI in the Free runtime,
- keep other Plus settings read-only for future re-upgrade,
- show `Powered by Zider`.

## Paid Feature Locks

Show an upgrade prompt when Free users try to:

- add a third AI provider,
- add Custom AI,
- enable Language Profiles,
- configure AI by language,
- remove Zider branding,
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

Before opening a third-party AI provider, communicate that the configured prompt
and current page URL will be opened in a third-party AI service.

External links must:

- open in a new tab,
- use `noopener`,
- use `noreferrer`,
- pass HTTPS validation.

## Out Of Scope For V1.1

- AI-generated prompts
- AI-translated prompts
- AI-recommended regional provider sets
- country detection by IP
- page body scraping
- in-site generated summaries
- in-site AI chatbot
- AI API keys
- token credits
- click analytics
- conversion analytics
- A/B testing
- per-page profiles
- identity-based profiles
- AI answer archives
- automatic provider URL sync

Plus Language Profiles are driven by Wix language / locale, not visitor IP.

## Acceptance Criteria

Free:

- initial install writes one static default prompt,
- initial install enables 2 built-in providers,
- at most 2 providers can be enabled,
- owner can choose among ChatGPT, Claude, and Gemini,
- custom AI cannot be added,
- language profiles cannot be created,
- all Wix language pages share one configuration,
- `Powered by Zider` is displayed.

Plus:

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
- `Powered by Zider` can be removed.

Common:

- variables are replaced correctly,
- page body is not scraped,
- AI APIs are not called,
- providers open in a new tab,
- URL Prefill works,
- Copy Prompt + Open works,
- mobile multi-provider layout wraps correctly,
- upgrade keeps Free configuration,
- downgrade preserves Plus configuration.

## Implementation Backlog

| ID | Feature | Plan | Priority |
| --- | --- | --- | --- |
| ZAA-001 | Initial install writes static default prompt | All | P0 |
| ZAA-002 | Manual prompt editing | All | P0 |
| ZAA-003 | Prompt variable replacement | All | P0 |
| ZAA-004 | Footer Bar | All | P0 |
| ZAA-005 | Large Icons | All | P0 |
| ZAA-006 | ChatGPT provider | All | P0 |
| ZAA-007 | Claude provider | All | P0 |
| ZAA-008 | Gemini provider | All | P0 |
| ZAA-009 | Free max 2 AI providers | Free | P0 |
| ZAA-010 | Unlimited providers | Plus | P0 |
| ZAA-011 | Custom AI providers | Plus | P0 |
| ZAA-012 | Language Profiles | Plus | P0 |
| ZAA-013 | Language-specific prompts | Plus | P0 |
| ZAA-014 | Language-specific provider lists | Plus | P0 |
| ZAA-015 | Language-specific provider order | Plus | P0 |
| ZAA-016 | Language-specific provider URL | Plus | P0 |
| ZAA-017 | Language-specific delivery mode | Plus | P0 |
| ZAA-018 | Wix current-language matching | Plus | P0 |
| ZAA-019 | Fallback profile | Plus | P0 |
| ZAA-020 | URL Prefill | All | P0 |
| ZAA-021 | Copy Prompt + Open | All | P0 |
| ZAA-022 | Provider safety validation | All | P0 |
| ZAA-023 | Backend package enforcement | All | P0 |
| ZAA-024 | Free -> Plus migration | All | P0 |
| ZAA-025 | Plus -> Free preservation | All | P0 |
| ZAA-026 | Responsive multi-line layout | All | P0 |
| ZAA-027 | Prompt Preview | All | P1 |
| ZAA-028 | Duplicate Language Profile | Plus | P1 |
| ZAA-029 | Remove Zider branding | Plus | P1 |
| ZAA-030 | Advanced styling | Plus | P1 |

## Open Implementation Questions

- What is the final internal `app_key` for this Wix app?
- Is the Wix app implemented as a Wix CLI project, a self-hosted app, or a
  hybrid like PrintOps?
- Should configuration reuse `widget_configs`, or should AI Actions get its own
  typed table?
- What are the final Wix billing plan IDs for Free and Plus?
- Which locales should ship with static starter prompt templates on day one?
- What URL length threshold should trigger Copy Prompt + Open fallback?
- Which provider icon assets should be bundled, and which should be remote?
