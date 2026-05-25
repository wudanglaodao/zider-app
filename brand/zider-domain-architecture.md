# Zider 域名、产品线与 Vercel 项目拆分规划

更新日期：2026-05-22
主域名：`zider.ink`
品牌名：Zider
当前决策：**3 个 Vercel 项目 + 1 个 Supabase 数据库**

## 1. 最终项目结构

Zider 后续按 3 个 Vercel 项目组织：

| Vercel 项目 | 域名 | 职责 |
|---|---|---|
| `zider-ink` | `zider.ink` | 官网、Blog、Forum、Docs、Changelog、Account、CMS |
| `zider-app` | `app.zider.ink` | Wix webhook、API、统计、系统数据面板 |
| `zider-workspace` | `components.zider.ink`、`workspace.zider.ink` | Components 和 Solutions 两条产品线的登录后后台 |

数据库使用一个 Supabase 项目：

```text
1 个 Supabase
├── Auth
├── CMS 内容
├── Blog / Forum
├── 用户 / 组织 / 成员 / 权限
├── 订阅 / entitlement
├── Wix webhook 统计
├── Components 数据
└── Solutions 数据
```

关键结论：

- `zider.ink` 做唯一官网和内容主站。
- `app.zider.ink` 已经接 Wix webhook，保留为系统运行域名。
- `components.zider.ink` 和 `workspace.zider.ink` 都放在 `zider-workspace` 项目里，先共用一套登录后工作台代码。
- 不使用 `docs.zider.ink`，文档先放 `zider.ink/docs`。
- 不急着拆两个后台项目；如果 Solutions 以后复杂度明显高于 Components，再拆成第 4 个项目。

## 2. 域名与路径

### 2.1 官网项目：`zider-ink`

域名：

```text
zider.ink
```

信息架构：

```text
zider.ink
├── /
│   └── 品牌首页
├── /components
│   └── Components 产品线官网
├── /solutions
│   └── Solutions 产品线官网
├── /solutions/wix-order-printer
│   └── Wix 订单打印解决方案页
├── /blog
│   └── 教程、案例、SEO 内容
├── /forum
│   └── 迁移后的 Forum 问答
├── /docs
│   └── 使用文档、帮助中心、API、Troubleshooting
├── /changelog
│   └── 产品更新记录
├── /account
│   └── 统一登录中心、账号、组织、订阅、账单
├── /legal
│   └── Privacy、Terms、DPA
└── /admin/cms
    └── 轻量内容后台，后续接入账号权限
```

职责：

- 承载品牌和 SEO 权重。
- 承接 Blog / Forum 内容迁移。
- 承载文档中心。
- 承载统一登录中心和会员中心。
- 承载轻量 CMS 的内容展示和后台入口。

不负责：

- 不接 Wix webhook。
- 不做 Components / Solutions 的复杂后台。
- 不做长期系统 API。

### 2.2 系统项目：`zider-app`

域名：

```text
app.zider.ink
```

信息架构：

```text
app.zider.ink
├── /events/[platform]/[appKey]
│   └── Wix webhook，必须保持稳定
├── /api/*
│   └── 系统 API、widget config、embed script、health check
├── /dashboard
│   └── 安装、卸载、订阅、账单事件统计
└── /
    └── 后台入口或跳转，不做公开官网首页
```

职责：

- 保持 Wix webhook 路由稳定。
- 保存平台事件、安装、卸载、billing、plan change。
- 提供 widget runtime / embed 相关 API。
- 提供系统统计面板。

不负责：

- 不承载 SEO 页面。
- 不承载 Blog / Forum / Docs。
- 不做公开营销官网。
- 不做统一会员中心。

### 2.3 工作台项目：`zider-workspace`

域名：

```text
components.zider.ink
workspace.zider.ink
```

同一个 Vercel 项目绑定两个域名，并按 host 区分产品线：

```text
components.zider.ink
├── /dashboard
├── /widgets
├── /components
├── /interaction-settings
└── /settings

workspace.zider.ink
├── /dashboard
├── /wix-order-printer
├── /wix-order-printer/orders
├── /wix-order-printer/templates
├── /wix-order-printer/print-jobs
└── /settings
```

职责：

- 登录后产品工作台。
- Components 产品线管理。
- Solutions 产品线管理。
- 读取统一登录中心的用户、组织、权限和订阅。

不负责：

- 不接 Wix webhook。
- 不做公开 SEO 页面。
- 不做账号、账单、订阅的主入口；这些回到 `zider.ink/account`。

## 3. 为什么是 3 个项目

3 个项目是当前最平衡的方案：

- 比 1 个项目清晰：官网、系统运行、产品后台边界分明。
- 比 4 个项目轻：Components 和 Solutions 后台先共用登录、权限、布局、UI。
- `app.zider.ink` 可以稳定保护 Wix webhook。
- `zider.ink` 可以专心做内容、SEO 和账号中心。
- 后续如果某条产品线变复杂，可以再拆第 4 个项目。

不建议现在拆 4 个项目，因为：

- Components / Solutions 后台还没有复杂到需要独立发布节奏。
- 统一登录、workspace、权限、订阅逻辑还在早期，放一起更省。
- 当前最重要的是先把官网、内容迁移、webhook 统计和账号体系跑通。

## 4. 目标代码结构

建议最终改成 monorepo：

```text
zider/
├── apps/
│   ├── site
│   │   └── zider.ink
│   ├── app
│   │   └── app.zider.ink
│   └── workspace
│       ├── components.zider.ink
│       └── workspace.zider.ink
├── packages/
│   ├── ui
│   ├── auth
│   ├── db
│   ├── cms
│   └── config
├── supabase/
│   ├── migrations
│   └── schema.sql
└── brand/
```

Vercel Root Directory：

| Vercel 项目 | Root Directory |
|---|---|
| `zider-ink` | `apps/site` |
| `zider-app` | `apps/app` |
| `zider-workspace` | `apps/workspace` |

## 5. 旧根项目的拆分路线

当前 `zider-ink` 项目已经不是纯小组件项目，它同时包含：

- 官网首页。
- Wix webhook。
- Supabase admin client。
- widget runtime API。
- Interactive Custom Cursor 预览和配置。
- CMS 草稿代码。
- 统计基础表和迁移。

所以不能把它整体当成 Components 后台。更合理的处理是：

```text
旧根项目
├── 保留 webhook / API / 统计核心
│   └── 迁移为 apps/app
├── 官网 / Blog / Forum / Docs / CMS
│   └── 迁移为 apps/site
└── 组件配置后台 / Cursor Lab / 产品工作台
    └── 迁移为 apps/workspace
```

### 5.1 留在 `apps/app` 的代码

从旧根项目保留到 `zider-app`：

```text
src/app/events/[platform]/[appKey]/route.ts
src/app/api/health/route.ts
src/app/api/widgets/interactive-custom-cursor/embed.js/route.ts
src/app/api/widgets/interactive-custom-cursor/config/route.ts
src/lib/webhooks/*
src/lib/wix/*
src/lib/supabase/server.ts
supabase/*
scripts/import-wix-payout-csv.mjs
```

原因：

- 这些是系统运行能力。
- `app.zider.ink` 已经接入 Wix webhook。
- webhook 和统计需要稳定发布，不应该被官网样式迭代影响。

### 5.2 迁移到 `apps/site` 的代码

从旧根项目拆到官网项目：

```text
src/app/page.tsx
src/app/admin/cms/*
src/lib/cms/*
brand/*
design/*
product/*
```

后续新增：

```text
apps/site/src/app/blog
apps/site/src/app/forum
apps/site/src/app/docs
apps/site/src/app/changelog
apps/site/src/app/account
```

原因：

- 官网、内容、文档、账号中心都属于 `zider.ink`。
- 这些页面需要 SEO 和更频繁的内容迭代。
- 它们不应该和 Wix webhook 的稳定性绑在一起。

### 5.3 迁移到 `apps/workspace` 的代码

从旧根项目拆到工作台项目：

```text
src/app/interactive-custom-cursor/page.tsx
src/app/wix/interactive-custom-cursor/page.tsx
src/app/_components/WorkbenchShell.tsx
src/cursor/*
src/lib/cursor/*
```

原因：

- 这些更像登录后的产品配置与工作台能力。
- `components.zider.ink` 和 `workspace.zider.ink` 可以共用它们。
- 工作台项目未来会接统一登录、workspace、entitlement。

注意：

- Cursor runtime embed script 如果被线上 Wix 页面引用，继续由 `apps/app` 提供。
- Cursor 配置编辑界面可以在 `apps/workspace`，保存后写入同一个 Supabase。

## 6. 迁移步骤

### Phase 0：冻结关键路由

先列出不能断的路由：

```text
app.zider.ink/events/[platform]/[appKey]
app.zider.ink/api/widgets/interactive-custom-cursor/embed.js
app.zider.ink/api/widgets/interactive-custom-cursor/config
app.zider.ink/api/health
```

这些路由迁移时必须保持路径不变。

### Phase 1：建立 monorepo 骨架

建立：

```text
apps/site
apps/app
apps/workspace
packages/ui
packages/auth
packages/db
packages/config
```

先不要改业务逻辑，只把构建跑通。

### Phase 2：把旧项目复制成 `apps/app`

把旧根项目先作为 `apps/app` 的基础。

然后删除不属于 app 的部分：

- 官网 landing。
- CMS 后台。
- Blog / Forum / Docs 页面。
- 纯营销样式。
- 与 webhook/API 无关的产品页。

保留：

- webhook。
- API。
- Supabase server client。
- Wix 相关 lib。
- 统计相关表和脚本。

目标：

```text
apps/app = 干净的 app.zider.ink 系统项目
```

### Phase 3：新建 `apps/site`

把官网首页、CMS、Blog / Forum / Docs 迁移进去。

目标：

```text
apps/site = 干净的 zider.ink 官网项目
```

优先做：

- `/`
- `/blog`
- `/forum`
- `/docs`
- `/admin/cms`

稍后做：

- `/components`
- `/solutions`
- `/solutions/wix-order-printer`
- `/account`
- `/changelog`

### Phase 4：新建 `apps/workspace`

把产品工作台代码迁移进去。

目标：

```text
apps/workspace = components.zider.ink + workspace.zider.ink
```

先做：

- host 判断。
- `components.zider.ink/dashboard`
- `workspace.zider.ink/dashboard`
- 统一 layout。

后续做：

- Components 配置。
- Solutions / Order Printer 后台。
- workspace 切换。
- entitlement 检查。

### Phase 5：抽公共包

迁移稳定后再抽：

```text
packages/ui
packages/auth
packages/db
packages/cms
packages/config
```

不要一开始就过度抽象。先让 3 个 app 都能独立构建。

## 7. 环境变量规划

### 7.1 共用变量

三个项目都需要：

```text
SUPABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_ZIDER_SITE_URL=https://zider.ink
NEXT_PUBLIC_ZIDER_APP_URL=https://app.zider.ink
```

### 7.2 `zider-ink`

```text
CMS_ADMIN_TOKEN
SUPABASE_SERVICE_ROLE_KEY
```

后续 Account 接入后：

```text
AUTH_REDIRECT_URL=https://zider.ink/account
```

### 7.3 `zider-app`

```text
SUPABASE_SERVICE_ROLE_KEY
WIX_WEBHOOK_PUBLIC_KEY
WIX_WEBHOOK_PUBLIC_KEYS
WIX_INTERACTIVE_CUSTOM_CURSOR_APP_ID
WIX_INTERACTIVE_CUSTOM_CURSOR_APP_SECRET
```

### 7.4 `zider-workspace`

```text
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_COMPONENTS_URL=https://components.zider.ink
NEXT_PUBLIC_WORKSPACE_URL=https://workspace.zider.ink
```

后续可改成只通过 server actions / API 使用 service role，前端只用 anon key。

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
profiles
organizations
organization_members
product_entitlements
subscriptions
billing_customers

cms_entries
forum_threads
forum_replies

app_installations
platform_event_logs
app_billing_events
app_daily_metrics

component_projects
component_configs
solution_workspaces
order_printer_templates
```

权限原则：

- 用户、组织、订阅统一。
- 产品后台根据 entitlement 授权。
- webhook/API 写入通过 `zider-app` 服务端完成。
- CMS 短期 token，长期账号权限。

## 9. 部署与发布策略

三个 Vercel 项目都连接同一个 GitHub repo。

每个项目设置自己的 Root Directory：

```text
zider-ink        -> apps/site
zider-app        -> apps/app
zider-workspace  -> apps/workspace
```

发布不复杂的前提：

- 每个项目只构建自己的目录。
- 共用包放在 `packages/*`。
- Supabase migration 走单独流程，不在三个项目里重复跑。
- `zider-app` 的 webhook 变更要更谨慎，必要时单独分支或预览验证。

建议上线顺序：

1. 先部署 `zider-app`，确认 webhook 路径不变。
2. 再部署 `zider-ink`，绑定 `zider.ink`。
3. 最后部署 `zider-workspace`，绑定 `components.zider.ink` 和 `workspace.zider.ink`。

## 10. 当前执行建议

现在先做代码拆分的第一步：

1. 建立 monorepo 目录结构。
2. 把旧根项目复制为 `apps/app`。
3. 清理 `apps/app` 里的官网和 CMS 代码。
4. 新建 `apps/site`，迁移当前 landing page 和 CMS。
5. 新建 `apps/workspace`，迁移 Cursor / Workbench 相关代码。
6. 三个项目分别能 `npm run build`。

建议不要一步到位抽 packages。先完成“项目边界干净”，再抽公共代码。

## 11. 最终目标

```text
zider.ink
  品牌官网、内容、文档、账号中心、CMS

app.zider.ink
  Wix webhook、API、统计、系统数据面板

components.zider.ink
  Components 后台

workspace.zider.ink
  Solutions 后台
```

这版结构既保护当前已经运行的 Wix webhook，又能让官网、内容迁移和产品后台各自保持清晰边界。
