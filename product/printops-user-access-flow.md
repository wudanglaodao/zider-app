# PrintOps User Access Flow

## Scope

PrintOps V1 is a Wix-first order printing app. The merchant should primarily enter PrintOps from the Wix app installation and dashboard flow. Direct visits to the workspace app URL should not expose the working app without a connected Wix app instance.

## Entry Points

### Wix Installation

This is the primary V1 entry point.

1. Merchant installs Zider PrintOps from Wix.
2. Wix redirects into the PrintOps app with a signed app instance.
3. PrintOps validates the Wix instance.
4. PrintOps creates or reuses:
   - workspace
   - site profile
   - PrintOps app instance
   - Wix platform connection
5. PrintOps pulls the store profile and order data needed for invoice printing.

### Direct Workspace Visit

When a user opens `/apps/printops` directly, the page should show an access guide instead of the app workspace.

The guide should:

- Explain that PrintOps runs through Wix installation for V1.
- Offer a ZIDER sign-in / registration entry.
- Guide the user to install PrintOps from the Wix App Market.
- Avoid showing order, template, or settings screens without a Wix app instance.

### Website Registration

The website registration entry remains available as the future unified ZIDER account center.

For V1, a website-created account does not automatically create a PrintOps app instance. If the user wants to use PrintOps, they still need to install the Wix app so the system can connect store permissions and create the app instance.

## Account Relationship

### ZIDER Account

The ZIDER account represents the person identity.

It owns:

- login methods
- profile name
- email identity
- future account-level billing and security controls

It should not directly replace app-specific permissions.

### Workspace

The workspace groups business resources across ZIDER products.

For Wix-first PrintOps, the workspace is created automatically during Wix installation. A user may later claim or connect this workspace with a ZIDER account.

### App Instance

The PrintOps app instance represents one installed app connection for one Wix site.

It owns:

- platform: `wix`
- Wix instance ID
- connected site ID
- order sync state
- templates
- print status records
- store profile defaults

App permissions and app data should remain app-instance scoped.

## Claiming And Merging

PrintOps should not force a merchant to create a ZIDER account before installing from Wix.

When account-level actions are needed, such as cross-device access, support, billing, or managing multiple stores, the app can prompt the merchant to claim the workspace.

Safe matching rules:

- Prefer verified Wix identity or Wix account email when available.
- If the merchant signs in with Google or email code using the same verified email, link the ZIDER account to the existing Wix-created workspace.
- If emails differ, require an explicit confirmation flow before linking.
- Never merge two workspaces silently.

## Store Profile Defaults

After Wix installation, PrintOps should pull site and business metadata when available and store it in a site or PrintOps store profile.

Recommended fields:

- site URL
- business name
- business email
- logo media path
- phone
- address
- language
- locale
- timezone
- currency

Template defaults should prefer this profile data. Merchants can still override values inside each template.

If Wix does not provide a logo, email, or address, keep the value empty and guide the merchant to fill it in from the template editor.

## V1 Rule

Direct app access is an onboarding guide. Wix app access is the actual product surface.
