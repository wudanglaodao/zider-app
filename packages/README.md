# Zider Packages

Shared packages will be extracted after the three apps can build independently.

Avoid extracting too early. The first migration goal is clean app boundaries.

## Planned Packages

| Package | Purpose |
|---|---|
| `@zider/ui` | Shared UI primitives and layout patterns |
| `@zider/auth` | Supabase Auth helpers, session checks, role helpers |
| `@zider/db` | Supabase clients, database types, shared queries |
| `@zider/cms` | CMS content queries and validators |
| `@zider/config` | Domain constants, product-line constants, env helpers |
| `@zider/platform-plugins` | PrintOps platform adapters for Wix, WordPress / WooCommerce, Shopify, CSV and Direct API |
