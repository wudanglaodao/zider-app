# Zider 域名、产品线与 Vercel 项目拆分规划

更新日期：2026-06-19  
主域名：`zider.ink`  
品牌名：Zider  
当前决策：**3 个 Vercel 项目 + 1 个 Supabase 数据库**

## 1. 当前结论

Zider 保持 3 个 Vercel 项目，不再继续拆成更多项目：

| Vercel 项目 | 域名 | Root Directory | 核心职责 |
|---|---|---|---|
| `zider-ink` | `zider.ink` | `apps/site` | 官网、Blog、Forum、Docs、Account、CMS、法律页面 |
| `zider-app` | `app.zider.ink` | `apps/app` | Wix webhook、平台 API、widget runtime、系统统计 |
| `zider-workspace` | `workspace.zider.ink`、`components.zider.ink` | `apps/workspace` | 登录后工作台、Components 后台、Solutions 后台 |

数据库继续使用一个 Supabase 项目：

```text
1 个 Supabase
├── Auth
├── 账号 / 用户资料 / 身份映射
├── Workspace / 成员 / 权限
├── 订阅 / entitlement / billing
├── CMS / Blog / Forum / Docs
├── 平台安装 / webhook / business events
├── Components 产品数据
└── Solutions 产品数据
```

关键判断：

- `zider.ink` 是唯一公开官网和内容主站。
- `workspace.zider.ink` 是主工作台域名，用于登录后的产品操作。
- `components.zider.ink` 可以作为 Components 产品线的工作台别名，但暂时不单独拆项目。
- `app.zider.ink` 是系统运行域名，主要服务平台事件、API、embed script 和内部统计。
- 不使用 `docs.zider.ink`，文档先放在 `zider.ink/docs`。
- 不把账号、订阅、账单主入口放进 Workspace；这些能力回到 `zider.ink/account`。

## 2. 产品线边界

Zider 现在按两条产品线组织：

```text
Zider
├── Components
│   └── Interactive Custom Cursor
└── Solutions
    └── Zider PrintOps
```

### 2.1 Components

定位：

```text
Lightweight interactive components for creator websites.
```

当前代表产品：

- Interactive Custom Cursor
- 后续可扩展为 hover effects、floating widgets、social widgets、视觉互动组件等。

公开页面放在：

```text
zider.ink/components
zider.ink/components/interactive-custom-cursor
```

工作台页面放在：

```text
workspace.zider.ink/components
workspace.zider.ink/widget/interactive-custom-cursor
workspace.zider.ink/widget/interactive-custom-cursor/wix
```

运行时 API 和 embed script 放在：

```text
app.zider.ink/api/widgets/interactive-custom-cursor/embed.js
app.zider.ink/api/widgets/interactive-custom-cursor/config
```

### 2.2 Solutions

定位：

```text
Practical workflow tools for stores, creators, and website operators.
```

当前代表产品：

- Zider PrintOps

公开页面放在：

```text
zider.ink/solutions
zider.ink/solutions/wix-order-printer
```

工作台页面放在：

```text
workspace.zider.ink/solutions
workspace.zider.ink/apps/printops
workspace.zider.ink/apps/printops/wix
workspace.zider.ink/apps/printops/templates
workspace.zider.ink/apps/printops/settings
```

系统 API 和 webhook 放在：

```text
app.zider.ink/webhooks/printops/wix
app.zider.ink/events/wix/zider_printops
workspace.zider.ink/api/apps/printops/wix/*
```

V1 规则：

- PrintOps 以 Wix 安装进入为主。
- 直接访问 `/apps/printops` 时展示安装和访问引导，不直接暴露订单、模板、设置等工作界面。
- Wix 安装成功后，系统自动创建或复用 workspace、store profile、app instance 和 Wix platform connection。
- 用户需要跨设备、团队、支持或账单能力时，再引导认领 Zider Account。

## 3. 域名职责

### 3.1 `zider.ink`

`zider.ink` 是公开入口，负责解释、转化、教育和账号中心。

推荐信息架构：

```text
zider.ink
├── /
│   └── 品牌首页
├── /components
│   └── Components 产品线官网
├── /components/interactive-custom-cursor
│   └── Interactive Custom Cursor 产品页
├── /solutions
│   └── Solutions 产品线官网
├── /solutions/wix-order-printer
│   └── Zider PrintOps / Wix Order Printer 产品页
├── /blog
│   └── SEO、教程、案例、迁移内容
├── /forum
│   └── 问答、用户问题、社区内容
├── /docs
│   └── 使用文档、帮助中心、Troubleshooting
├── /changelog
│   └── 产品更新记录
├── /account
│   └── 登录、注册、找回密码、统一账号入口
├── /account/center
│   └── 账号资料、头像、身份、后续订阅和工作区入口
├── /contact
│   └── 支持、合作、反馈
├── /privacy
├── /terms
└── /admin/cms
    └── 轻量内容后台
```

负责：

- 品牌定位和产品转化。
- Blog / Forum / Docs / Changelog 的内容承载。
- 账号登录、注册、账号中心。
- CMS 内容编辑和公开展示。
- 产品官网页到 Workspace 或 Wix App Market 的导流。

不负责：

- 不接 Wix webhook。
- 不承载订单、模板、组件配置等复杂后台。
- 不作为长期系统 API 域名。

### 3.2 `workspace.zider.ink`

`workspace.zider.ink` 是登录后产品工作台，负责让用户完成实际操作。

推荐信息架构：

```text
workspace.zider.ink
├── /
│   └── Workspace 首页或跳转 Dashboard
├── /dashboard
│   └── 总览：已安装应用、最近操作、状态提醒
├── /components
│   └── Components 产品列表与管理入口
├── /widget/interactive-custom-cursor
│   └── Cursor Lab：配置、预览、保存、发布
├── /widget/interactive-custom-cursor/wix
│   └── Wix 上下文的 Cursor 配置页
├── /solutions
│   └── Solutions 产品列表与管理入口
├── /apps/printops
│   └── PrintOps 访问引导或产品入口
├── /apps/printops/wix
│   └── Wix 店铺连接后的 PrintOps 工作台
├── /apps/printops/templates
│   └── 模板中心、模板编辑、预览
├── /apps/printops/settings
│   └── 店铺资料、品牌信息、打印设置
└── /settings
    └── Workspace、成员、权限、集成设置
```

负责：

- 登录后的产品操作界面。
- Components 和 Solutions 的统一工作台 shell。
- Workspace、Store、App Instance 的选择与上下文展示。
- 产品权限和 entitlement 检查。
- 保存、预览、发布、同步、打印等用户动作。

不负责：

- 不做公开 SEO 页面。
- 不作为账号、账单、订阅的主入口。
- 不直接接平台 webhook。

### 3.3 `components.zider.ink`

`components.zider.ink` 暂时作为 `zider-workspace` 的别名或 Components 产品线入口。

建议策略：

- 短期可以绑定到同一个 `apps/workspace` 项目。
- 如果访问 `components.zider.ink`，默认进入 Components 相关视图。
- 不为它单独新建 Vercel 项目。
- 如果 Components 后续成为独立 SaaS，且发布节奏、权限、计费明显不同，再考虑拆第 4 个项目。

### 3.4 `app.zider.ink`

`app.zider.ink` 是系统运行域名，不做公开官网。

推荐信息架构：

```text
app.zider.ink
├── /events/[platform]/[appKey]
│   └── 平台事件入口，尤其是 Wix webhook
├── /webhooks/printops/wix
│   └── PrintOps Wix 业务 webhook
├── /api/widgets/interactive-custom-cursor/embed.js
│   └── Cursor widget embed script
├── /api/widgets/interactive-custom-cursor/config
│   └── Cursor widget config API
├── /api/health
│   └── health check
└── /dashboard
    └── 内部统计：安装、卸载、订阅、事件、错误
```

负责：

- 保持平台 webhook 路由稳定。
- 保存安装、卸载、billing、plan change、business event 等事件。
- 提供 widget runtime / embed script。
- 提供系统统计和运维数据。

不负责：

- 不做 SEO。
- 不做 Blog / Forum / Docs。
- 不做公开营销首页。
- 不做统一账号中心。

## 4. 为什么继续保持 3 个项目

3 个项目是当前最平衡的拆分：

- 比 1 个项目清晰：官网、系统运行、产品后台边界分明。
- 比 4 个项目轻：Components 和 Solutions 还可以共用登录、权限、布局和 UI。
- `app.zider.ink` 能保护已接入的 Wix webhook 和 runtime API。
- `zider.ink` 可以专心做内容、SEO、账号和 CMS。
- `workspace.zider.ink` 可以承载多个产品的登录后工作流。

暂不拆第 4 个项目的原因：

- Components / Solutions 后台仍处于早期，不需要独立发布节奏。
- 统一账号、Workspace、权限、订阅还在形成中，放在一起更省。
- 当前最重要的是把官网入口、账号闭环、PrintOps Wix 流程和 Cursor 配置闭环跑通。

未来考虑拆第 4 个项目的触发条件：

- Solutions 的数据模型、权限、API 和发布节奏明显复杂于 Components。
- Components 有独立的组件市场、模板市场或高频 runtime 发布需求。
- 两条产品线的团队、计费、客户群明显分开。

## 5. 当前代码结构

当前 repo 已经进入 monorepo 形态：

```text
zider-ink/
├── apps/
│   ├── site
│   │   └── zider.ink
│   ├── app
│   │   └── app.zider.ink
│   └── workspace
│       ├── workspace.zider.ink
│       └── components.zider.ink
├── packages/
│   ├── auth
│   ├── cms
│   ├── config
│   ├── db
│   ├── platform-plugins
│   └── ui
├── supabase/
│   ├── migrations
│   └── schema.sql
├── brand/
├── docs/
└── product/
```

项目职责：

| 目录 | 职责 |
|---|---|
| `apps/site` | 官网、账号、Blog、Forum、Docs、CMS |
| `apps/app` | 系统 API、webhook、平台运行能力 |
| `apps/workspace` | Workspace、Cursor Lab、PrintOps 工作台 |
| `packages/platform-plugins` | Wix / Shopify / WooCommerce 等平台适配 |
| `supabase` | 统一数据库 schema 和 migrations |
| `brand` / `docs` / `product` | 品牌、技术、产品规划文档 |

## 6. 路由保护规则

以下路由必须保持稳定，迁移或重构时不能随意改路径：

```text
app.zider.ink/events/[platform]/[appKey]
app.zider.ink/webhooks/printops/wix
app.zider.ink/api/widgets/interactive-custom-cursor/embed.js
app.zider.ink/api/widgets/interactive-custom-cursor/config
app.zider.ink/api/health
```

工作台路由可以迭代，但要保持产品语义稳定：

```text
workspace.zider.ink/widget/interactive-custom-cursor
workspace.zider.ink/apps/printops
workspace.zider.ink/apps/printops/wix
workspace.zider.ink/apps/printops/templates
workspace.zider.ink/apps/printops/settings
```

官网路由需要考虑 SEO 稳定性：

```text
zider.ink/blog
zider.ink/forum
zider.ink/docs
zider.ink/components
zider.ink/solutions
zider.ink/solutions/wix-order-printer
```

## 7. 账号、Workspace 与平台安装关系

核心原则：

- Zider Account 表示一个人。
- Workspace 表示一个业务空间或团队。
- Store 表示一个外部店铺，例如 Wix site、Shopify shop、WooCommerce site。
- Platform Installation 表示平台安装事实，不等于用户手动绑定 Workspace。
- App Instance 表示某个产品在某个外部店铺中的实际安装和数据范围。

推荐关系：

```text
Zider Account
└── Workspace Membership
    └── Workspace
        ├── Store
        │   └── Platform Installation
        │       └── App Instance
        └── Entitlements
```

PrintOps V1 规则：

- Wix 安装 PrintOps 后可以立即使用，不强制先注册 Zider Account。
- Wix 安装上下文可以自动创建 workspace、store、app instance。
- 用户后续需要账号能力时，再通过邮箱验证码、Google 或 Wix 身份认领。
- 不根据邮箱、域名、店铺名自动合并 workspace。
- 合并必须由用户主动确认，并使用明确的 account link intent。

## 8. Supabase 规划

三个 Vercel 项目共用一个 Supabase。

数据库 migration 只放在根目录：

```text
supabase/migrations
supabase/schema.sql
```

不要让三个 app 各自维护 migrations。

推荐 schema 方向：

```text
auth.users
zider_users
user_identities

workspaces
workspace_members
stores
workspace_store_connections

subscriptions
product_entitlements
billing_customers

cms_entries
forum_threads
forum_replies

app_installations
platform_event_logs
app_business_event_logs
app_billing_events
app_daily_metrics
webhook_ingress_logs

component_projects
component_configs
cursor_configs

platform_store_profiles
printops_order_cache
printops_order_print_status
order_printer_templates
```

权限原则：

- 用户、Workspace、订阅统一。
- 产品后台根据 workspace membership 和 entitlement 授权。
- webhook/API 写入通过 `zider-app` 服务端完成。
- Workspace 只读写当前用户有权限的 workspace / store / app instance。
- CMS 短期可以保留 admin token，长期接入账号权限。

## 9. 环境变量规划

### 9.1 共用变量

三个项目都需要：

```text
SUPABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_ZIDER_SITE_URL=https://zider.ink
NEXT_PUBLIC_ZIDER_APP_URL=https://app.zider.ink
NEXT_PUBLIC_ZIDER_WORKSPACE_URL=https://workspace.zider.ink
```

### 9.2 `zider-ink`

```text
SUPABASE_SERVICE_ROLE_KEY
CMS_ADMIN_TOKEN
```

账号系统继续使用：

```text
NEXT_PUBLIC_ZIDER_SITE_URL=https://zider.ink
```

### 9.3 `zider-app`

```text
SUPABASE_SERVICE_ROLE_KEY
WIX_WEBHOOK_PUBLIC_KEY
WIX_WEBHOOK_PUBLIC_KEYS
WIX_INTERACTIVE_CUSTOM_CURSOR_APP_ID
WIX_INTERACTIVE_CUSTOM_CURSOR_APP_SECRET
WIX_PRINTOPS_APP_ID
WIX_PRINTOPS_APP_SECRET
```

### 9.4 `zider-workspace`

```text
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_COMPONENTS_URL=https://components.zider.ink
NEXT_PUBLIC_WORKSPACE_URL=https://workspace.zider.ink
```

长期建议：

- 前端只使用 anon key。
- 敏感写入通过 server actions / route handlers 完成。
- service role 只存在服务端环境。

## 10. 部署与发布策略

三个 Vercel 项目连接同一个 GitHub repo。

Vercel Root Directory：

```text
zider-ink        -> apps/site
zider-app        -> apps/app
zider-workspace  -> apps/workspace
```

发布原则：

- 每个项目只构建自己的目录。
- 共用包放在 `packages/*`。
- Supabase migration 走单独流程，不在三个项目里重复跑。
- `zider-app` 的 webhook 和 runtime API 变更要最谨慎。
- `apps/site` 的内容和样式迭代不应该影响 webhook。
- `apps/workspace` 的产品后台迭代不应该影响公开官网 SEO。

建议验证顺序：

1. `apps/app`：验证 health、webhook、widget runtime API。
2. `apps/site`：验证首页、账号、Blog / Forum / Docs、CMS。
3. `apps/workspace`：验证 dashboard、Cursor Lab、PrintOps Wix 流程。

## 11. 网页功能优先级

### Phase 1：入口清晰

目标：让用户知道每个入口去哪里。

- 官网首页补齐 `Components`、`Solutions`、`Docs`、`Sign in`、`Workspace` 导航。
- 官网首页的 CTA 明确分流：
  - 了解产品：去 `/components` 或 `/solutions`。
  - 使用产品：去 `workspace.zider.ink` 或 Wix App Market。
  - 登录账号：去 `/account`。
- Workspace 首页从单纯品牌页升级为 dashboard 或产品入口页。

### Phase 2：账号闭环

目标：让官网账号和 Workspace 感觉是一套系统。

- `zider.ink/account` 负责登录、注册、找回密码。
- `zider.ink/account/center` 负责用户资料、头像、账号设置。
- Workspace 右上角账号菜单能回到账号中心。
- 官网登录后能进入 Workspace。
- Wix 自动创建的 workspace 后续可以被 Zider Account 安全认领。

### Phase 3：产品闭环

目标：每个产品都有“官网介绍 + 文档 + 工作台操作”。

Interactive Custom Cursor：

- 官网产品页：`zider.ink/components/interactive-custom-cursor`
- 文档页：`zider.ink/docs/interactive-custom-cursor`
- 工作台：`workspace.zider.ink/widget/interactive-custom-cursor`
- Runtime：`app.zider.ink/api/widgets/interactive-custom-cursor/*`

Zider PrintOps：

- 官网产品页：`zider.ink/solutions/wix-order-printer`
- 文档页：`zider.ink/docs/printops`
- 访问引导：`workspace.zider.ink/apps/printops`
- Wix 工作台：`workspace.zider.ink/apps/printops/wix`
- 模板中心：`workspace.zider.ink/apps/printops/templates`
- 设置：`workspace.zider.ink/apps/printops/settings`

### Phase 4：内容增长

目标：让 Blog / Forum / Docs 服务 SEO 和用户支持。

优先内容主题：

- Wix order printing
- Wix invoice template
- Wix packing slip
- Custom cursor for Wix
- Website interaction components
- PrintOps setup guide
- Troubleshooting webhook / order sync / template preview

内容分工：

- Blog 写教程、案例、对比和 SEO。
- Forum 承接问答和长尾问题。
- Docs 写安装、配置、错误处理和产品说明。
- Changelog 写更新记录和版本说明。

## 12. 当前执行建议

当前 monorepo 已经存在，下一步不要再以“拆项目”为主，而是以“入口和闭环”为主。

建议顺序：

1. 更新官网导航和首页 CTA，让 Components / Solutions / Docs / Account / Workspace 入口清晰。
2. 把 `workspace.zider.ink` 首页改成真正 dashboard 或产品入口。
3. 完善 PrintOps 直接访问引导，确保没有 Wix instance 时不暴露工作台数据。
4. 补齐 `/components`、`/solutions` 的官网产品线页面。
5. 补齐 Cursor 和 PrintOps 的产品页、docs 页、workspace 页之间的互相链接。
6. 逐步把账号中心和 Workspace 的用户状态打通。
7. 再考虑 packages 抽象和更细的权限模型。

短期不要做：

- 不要拆第 4 个 Vercel 项目。
- 不要把 Docs 单独拆到 `docs.zider.ink`。
- 不要把账号中心搬到 Workspace。
- 不要让 `app.zider.ink` 变成公开官网。
- 不要过早抽象复杂平台层，先保证 Wix-first 的 PrintOps 和 Cursor 跑通。

## 13. 最终目标

```text
zider.ink
  公开官网、产品介绍、Blog、Forum、Docs、账号中心、CMS

workspace.zider.ink
  登录后工作台、Components 后台、Solutions 后台、产品操作界面

components.zider.ink
  Components 产品线的工作台别名或定向入口

app.zider.ink
  Wix webhook、平台 API、widget runtime、系统事件与统计
```

一句话原则：

```text
公开展示、SEO、教育内容放官网；
登录后配置、订单、模板、店铺数据放 Workspace；
平台回调、runtime API、系统事件放 app.zider.ink。
```

这版结构保护当前已经运行的 Wix webhook，也给官网内容增长、账号中心、Cursor 和 PrintOps 后续迭代留下清晰边界。
