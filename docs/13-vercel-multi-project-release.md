# Zider 三项目发布手册

本文档用于发布 Zider 当前三个 Vercel 项目。三个项目共享同一个 GitHub 仓库 `wudanglaodao/zider-app`，但在 Vercel 中使用不同 Root Directory 和不同生产域名。

正式 Vercel 团队/账号固定为：

```text
https://vercel.com/duorouai-5425s-projects
```

## 1. 发布原则

- 生产发布以 GitHub `main` 分支为准。代码合并或推送到 `main` 后，由 Vercel Git 集成自动触发三个项目构建。
- 常规发布不使用 `vercel deploy --prod`。直接推送 GitHub，让 `duorouai-5425s-projects` 下绑定的正式项目自动部署。
- 不要把三个项目手动部署到错误的 Vercel scope。当前正式 scope 只认 `duorouai-5425s-projects`。
- 如果 CLI 登录账号不是正式 scope，立即停止，不要继续发布，也不要提交 `.vercel` 变更。
- 不要移动已经配置到 Wix 的公网回调地址，尤其是 `app.zider.ink/events/...` 和 `app.zider.ink/webhooks/...`。
- 发布提交只包含产品代码、文档、迁移和正式素材。外部参考模板、临时截图、本地 `.env`、`.vercel` 不进 Git。

## 2. 项目映射

| Vercel project | Root Directory | Production domain | 职责 |
| --- | --- | --- | --- |
| `zider-ink` | `apps/site` | `https://zider.ink` | 官网、Blog、Forum、Account、CMS |
| `zider-app` | `apps/app` | `https://app.zider.ink` | Wix 事件、Webhook、OAuth/API、安装和分析数据 |
| `zider-workspace` | `apps/workspace` | `https://workspace.zider.ink` | PrintOps 工作台、插件页面、Widget 运行时 |

边界约束：

- `zider.ink` 不承载 Wix webhook、插件工作台或 widget embed。
- `app.zider.ink` 不承载官网页面或 PrintOps UI，只承载服务端事件入口。
- `workspace.zider.ink` 不承载 Wix webhook，只承载商家工作台和 widget 相关页面/API。

## 3. 关键生产 URL

官网：

```text
https://zider.ink/
https://zider.ink/account?mode=signin
https://zider.ink/forum
https://zider.ink/api/health
```

App 服务：

```text
https://app.zider.ink/api/health?checks=1
https://app.zider.ink/events/wix/zider_printops
https://app.zider.ink/webhooks/printops/wix
```

Workspace：

```text
https://workspace.zider.ink/
https://workspace.zider.ink/apps/printops
https://workspace.zider.ink/apps/printops/templates
https://workspace.zider.ink/apps/printops/settings
https://workspace.zider.ink/apps/printops/wix
https://workspace.zider.ink/widget/interactive-custom-cursor
https://workspace.zider.ink/widget/interactive-custom-cursor/embed.js
```

Wix PrintOps 配置：

```text
Dashboard URL:
https://workspace.zider.ink/apps/printops/wix

App install/billing events:
https://app.zider.ink/events/wix/zider_printops

Order events:
https://app.zider.ink/webhooks/printops/wix
```

## 4. 环境变量

三个 Vercel 项目都需要：

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

`zider-ink` 可选：

```text
NEXT_PUBLIC_SITE_URL=https://zider.ink
```

`zider-app` 可选：

```text
ZIDER_WORKSPACE_URL=https://workspace.zider.ink
```

`zider-workspace` 可选：

```text
CURSOR_WIDGET_CONFIGS_TABLE=widget_configs
```

Wix app 的 OAuth 凭证和 webhook public key 优先放在 Supabase `app_platform_secrets` 表里，不要把新凭证散落到多个 Vercel 环境变量中。

## 5. 发布前检查

确认工作区状态：

```bash
git status --short --branch
```

发版前至少跑完整三项目检查：

```bash
npm --prefix apps/site run typecheck
npm --prefix apps/site run build

npm --prefix apps/app run typecheck
npm --prefix apps/app run build

npm --prefix apps/workspace run typecheck
npm --prefix apps/workspace run build
```

如果包含数据库变更：

- 确认迁移文件已放在 `supabase/migrations/`。
- 先在 Supabase 执行迁移，再发布依赖该表结构的代码。
- 如果涉及 Wix app secret，确认 `app_platform_secrets` 已有对应 `app_key/platform` 记录。

如果包含 Wix 插件变更：

- 确认 Wix app dashboard URL 仍指向 `https://workspace.zider.ink/apps/printops/wix`。
- 确认订单事件仍转发到 `https://app.zider.ink/webhooks/printops/wix`。
- 确认安装、卸载、付费等 app 管理事件仍走 `https://app.zider.ink/events/wix/zider_printops`。
- 如果改动涉及 PrintOps 主流程，发布前按 [19 PrintOps Main Flow Harness](./19-printops-main-flow-harness.md) 跑一遍核心用例。

## 6. GitHub 发版流程

只 stage 本次发布需要的文件：

```bash
git add <files>
git status --short
```

提交：

```bash
git commit -m "chore: release <scope>"
```

推送生产分支：

```bash
git push origin main
```

推送完成后不要再执行手动 Vercel 部署。等待 `duorouai-5425s-projects` 的 Vercel Git 集成自动创建 Production deployment。

如需要显式版本号，可以加 annotated tag：

```bash
git tag -a zider-YYYY.MM.DD-N -m "Zider release YYYY.MM.DD-N"
git push origin zider-YYYY.MM.DD-N
```

版本号建议：

```text
zider-2026.06.11-1
zider-2026.06.11-printops-wix-sync
```

## 7. Vercel 自动部署检查

推送后进入 `https://vercel.com/duorouai-5425s-projects`，分别检查：

```text
zider-ink       -> Deployments -> latest main commit -> Ready
zider-app       -> Deployments -> latest main commit -> Ready
zider-workspace -> Deployments -> latest main commit -> Ready
```

三项都要确认：

- Commit SHA 等于刚推送的 `main` 最新提交。
- Root Directory 分别是 `apps/site`、`apps/app`、`apps/workspace`。
- Production alias 已指向最新 Ready deployment。
- Build Logs 没有 TypeScript、env、route generation 错误。

不要在错误 scope 下执行 `vercel --prod`。常规发版只检查 Dashboard 的自动部署结果。

如果必须排查 Vercel CLI，先确认账号：

```bash
npx vercel@latest whoami
```

只有确认当前 CLI 能看到 `duorouai-5425s-projects` 下的 `zider-ink`、`zider-app`、`zider-workspace` 时，才允许用于只读检查。不要用 CLI 做常规生产部署。

## 8. 发布后 Smoke Test

用 `curl` 检查健康接口。带 `?` 的 URL 在 zsh 中要加引号：

```bash
curl -I https://zider.ink/api/health
curl -I "https://app.zider.ink/api/health?checks=1"
curl -I https://workspace.zider.ink/api/health
```

浏览器检查：

```text
https://zider.ink/
https://zider.ink/account?mode=signin
https://zider.ink/forum
https://workspace.zider.ink/apps/printops
https://workspace.zider.ink/apps/printops/templates
https://workspace.zider.ink/apps/printops/wix?instanceId=wix-dev-preview
```

Widget 检查：

```bash
curl -I "https://workspace.zider.ink/widget/interactive-custom-cursor/embed.js?instanceId=test"
```

Wix PrintOps 检查：

完整主流程以 [19 PrintOps Main Flow Harness](./19-printops-main-flow-harness.md) 为准。这里保留最小发布后 smoke test：

1. 从 Wix Studio 打开 Zider PrintOps。
2. 确认 dashboard iframe 正常加载 `workspace.zider.ink/apps/printops/wix`。
3. 在 Orders 页面确认 Setup readiness 都是 Ready。
4. 点击 `Sync latest`，再点击 `Sync last 7 days`。
5. 确认订单列表能读取缓存订单，自定义字段计数正常。
6. 打开模板预览，确认下载 PDF 和打印预览可用。

## 9. 回滚方案

优先使用 Vercel Dashboard 回滚：

1. 进入对应项目的 Deployments。
2. 找到上一条 Ready 的生产部署。
3. Promote / Redeploy 到 Production。
4. 三个项目需要分别回滚，顺序建议：
   - `zider-app`
   - `zider-workspace`
   - `zider-ink`

如果是代码问题，也可以用 Git revert：

```bash
git revert <bad_commit_sha>
git push origin main
```

如果涉及数据库迁移，先确认迁移是否可逆；不可逆迁移不要只回滚代码。

## 10. 常见问题

### CLI 发布到错误项目

现象：

- `vercel projects ls` 看不到 `duorouai-5425s-projects` 下的 `zider-ink`、`zider-app`、`zider-workspace`。
- CLI 自动 link 到名为 `app` 或其他临时项目。
- 部署日志出现非正式账号，例如个人账号或临时 project URL。

处理：

- 立即停止 CLI 发布。
- 不提交 `.vercel` 变更。
- 回到 `https://vercel.com/duorouai-5425s-projects`，用已绑定的三个正式项目查看 Git 自动部署。
- 如果错误账号已产生 deployment，不把它视为正式发布；以 GitHub `main` 在正式 scope 的自动部署结果为准。

### 本地 build 通过，Vercel build 失败

优先检查：

- Vercel Root Directory 是否正确。
- Production 环境变量是否齐全。
- 是否有本地 `.env.local` 依赖没有同步到 Vercel。
- 是否有未提交文件导致本地和远端代码不一致。

### Wix 订单同步失败

优先检查：

- `app_platform_secrets` 是否存在 `app_key=zider_printops`、`platform=wix`。
- `client_id/client_secret/webhook_public_key` 是否存在。
- 当前 Wix `instance` 是否属于 PrintOps 的 AppDefId。
- Orders Search filter 是否仍使用 `$and` 拆分日期条件。

### Wix webhook 验证失败

优先检查：

- App 管理事件是否走 `https://app.zider.ink/events/wix/zider_printops`。
- 订单事件是否走 `https://app.zider.ink/webhooks/printops/wix`。
- `app_platform_secrets.webhook_public_key` 是否是 Wix 提供的 public key。
- 不要把 install/billing event 和 order event 混到同一张处理表或同一套语义里。

## 11. 发版记录模板

每次发布后在项目日志或 PR 描述里记录：

```text
Release:
Commit:
Tag:
Projects:
- zider-ink:
- zider-app:
- zider-workspace:
Database migrations:
Wix app version:
Smoke tests:
- zider.ink:
- app.zider.ink:
- workspace.zider.ink:
Notes:
Rollback target:
```
