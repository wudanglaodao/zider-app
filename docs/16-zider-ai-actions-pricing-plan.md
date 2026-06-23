# Zider AI Actions Pricing Plan

Source requirements:

- [15 Zider AI Actions Wix V1.1 Requirements](./15-zider-ai-actions-wix-v1.1-requirements.md)
- `/Users/yancy/Desktop/Zider_AI_Actions_Wix_V1.1_套餐与多语言需求.md`

This document defines the commercial plan boundary for Zider AI Actions V1.1.
It focuses on what Free and Plus mean, what should be gated, and how upgrade
messages should be explained to Wix site owners.

## Pricing Structure

V1.1 uses two plans:

| Plan | Billing | Role |
| --- | --- | --- |
| Free | Free forever | Lets a site owner add a simple AI action widget quickly |
| Plus | Paid plan, price TBD | Unlocks multilingual audience-specific AI experiences |

The exact monthly / yearly price is not defined in the current requirement
document. Do not hard-code a price until the Wix billing plan IDs and App Market
pricing are finalized.

## Positioning

Free is the entry plan:

```text
Add basic AI action buttons to one Wix site with one shared prompt.
```

Plus is the professional plan:

```text
Create different AI action experiences for different languages, regions, and
audiences.
```

The main paid value is not "more translations." The paid value is letting a
merchant configure different prompts, AI tools, custom AI destinations, and
provider behavior for each Wix language / locale.

## Free Plan

Free should feel useful on day one. It must not be a blank demo.

Included:

- one Wix Site Widget,
- Footer Bar layout,
- Large Icons layout,
- built-in ChatGPT provider,
- built-in Claude provider,
- built-in Gemini provider,
- maximum 2 enabled providers at any time,
- one shared `Default Profile`,
- one widget title,
- one optional description,
- one prompt,
- one copied message,
- provider sorting for the enabled built-in providers,
- prompt variable replacement,
- prompt preview,
- reset to default prompt,
- basic design options,
- `Powered by Zider` branding.

Free limits:

- no third enabled AI provider,
- no custom AI provider,
- no custom provider URL,
- no provider-specific delivery mode editing,
- no Language Profiles,
- no language-specific prompt,
- no language-specific provider list,
- no language-specific provider order,
- no language-specific title / description / copied message,
- no branding removal,
- no advanced styling.

Important clarification:

Free can use any language in its single prompt and title. A Chinese, Japanese,
Spanish, or bilingual prompt is allowed. The limit is that Free cannot store
different configurations for different Wix languages.

## Plus Plan

Plus unlocks the full configuration model.

Included:

- everything in Free,
- unlimited enabled AI providers,
- unlimited custom AI providers,
- Language Profiles,
- full locale support such as `en-US`, `zh-CN`, `zh-TW`, and `pt-BR`,
- language-specific widget title,
- language-specific optional description,
- language-specific prompt,
- language-specific copied message,
- language-specific provider list,
- language-specific provider order,
- language-specific provider label,
- language-specific provider URL template,
- language-specific delivery mode,
- language-specific custom AI providers,
- fallback profile selection,
- duplicate Language Profile,
- remove `Powered by Zider`,
- advanced styling.

Plus should be described as:

```text
Build a different AI action entry point for every audience your Wix site serves.
```

## Free vs Plus Difference

| Category | Free | Plus |
| --- | --- | --- |
| Best for | Simple sites and first-time users | Multilingual sites, agencies, international businesses |
| Configuration model | One shared Default Profile | Multiple Language Profiles |
| Built-in AI providers | ChatGPT, Claude, Gemini | ChatGPT, Claude, Gemini |
| Enabled provider count | Up to 2 | Unlimited |
| Custom AI | Not available | Unlimited |
| Prompt | One shared prompt | One prompt per Language Profile |
| Widget title | One shared title | One title per Language Profile |
| Optional description | One shared description | One description per Language Profile |
| Copied message | One shared copied message | One copied message per Language Profile |
| Provider order | One shared order | Separate order per Language Profile |
| Provider labels | Default labels only | Editable per Language Profile |
| Provider URL template | Built-in defaults only | Editable per Language Profile |
| Delivery mode | Built-in defaults | Editable per provider and profile |
| Wix multilingual behavior | Same config on every language page | Match current Wix language / locale |
| Fallback profile | Not needed | Supported |
| Branding | Shows `Powered by Zider` | Can remove branding |
| Styling | Basic | Advanced |

## Upgrade Triggers

Show an upgrade prompt when a Free user tries to:

- enable a third AI provider,
- add Custom AI,
- create or enable Language Profiles,
- configure AI providers by language,
- edit provider URLs,
- edit provider delivery mode,
- remove `Powered by Zider`,
- use advanced styling.

Upgrade copy:

```text
Upgrade to Plus

Create independent AI experiences for every site language.
Configure different prompts, AI tools and custom providers for different audiences.
```

Do not discard user input when showing the upgrade prompt.

## Enforcement Rules

Plan limits must be enforced in both the UI and the backend.

Free backend validation:

- enabled provider count must be <= 2,
- custom AI count must be 0,
- profile count must be 1,
- locale-specific provider config must be rejected,
- remove branding must be rejected.

Plus backend validation:

- provider count is unlimited,
- custom AI count is unlimited,
- profile count is unlimited,
- locale-specific provider config is allowed,
- remove branding is allowed.

Do not rely on hidden UI controls as the only enforcement layer.

## Upgrade And Downgrade Behavior

Free -> Plus:

- keep existing title,
- keep existing description,
- keep existing prompt,
- keep existing copied message,
- keep existing 2 enabled providers,
- keep provider order,
- keep appearance settings,
- convert Default Profile to the site default language profile,
- unlock Language Profiles and Custom AI.

Plus -> Free:

- do not delete Plus configuration,
- require the site owner to choose one profile and up to 2 built-in providers,
- if the owner does not choose, use the fallback profile and first 2 built-in
  providers,
- disable custom AI in the Free runtime,
- keep extra Plus settings read-only for future re-upgrade,
- show `Powered by Zider`.

## Suggested App Market Plan Summary

Free:

```text
Add AI action buttons to your site with one shared prompt and up to two built-in
AI tools.
```

Plus:

```text
Unlock unlimited AI tools, custom AI providers, and independent language
profiles for multilingual Wix sites.
```

Short comparison:

```text
Free = one site-wide AI action setup.
Plus = separate AI action setups for every language and audience.
```

## Open Pricing Decisions

- Final Plus monthly price.
- Final Plus yearly price and discount.
- Whether to offer a Wix free trial for Plus.
- Final Wix billing plan IDs.
- Whether App Market copy should call the paid plan `Plus`, `Pro`, or
  `Premium`. Current requirements use `Plus`.
- Whether future higher tiers are needed for analytics, A/B testing, or
  per-page profiles. These are out of scope for V1.1.
