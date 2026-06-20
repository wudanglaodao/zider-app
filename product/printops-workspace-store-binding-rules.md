# PrintOps Workspace 与店铺绑定规则

版本：v0.2
更新日期：2026-06-17
适用范围：Zider PrintOps Wix 首发、后续多店铺、多渠道、大客户 Workspace 规划

## 1. 目标

PrintOps 第一版以 Wix App 安装使用为主。商家从 Wix 安装后，应能立即进入 PrintOps 同步订单、选择模板、下载 PDF 和打印，不强制先注册 Zider Account。

后续 PrintOps 仍需要支持大客户在一个 Workspace 下管理多个渠道店铺：

```text
Workspace
├── Team Members
├── Wix Store A
├── Wix Store B
├── Shopify Store C
└── Future Stores: WooCommerce / API / CSV
```

因此规则采用两阶段策略：

- P0：Wix install-first。Wix 安装时自动创建隔离的应用工作区和店铺上下文。
- P1+：Workspace-first expansion。用户认领账号后，再支持多店铺、团队、订阅和跨平台绑定。

## 2. 第一版决策

```text
Wix installation -> isolated PrintOps workspace context
```

第一版确认：

- Wix 安装时自动创建或解析当前 app instance 的工作区上下文。
- 不强制用户先注册或登录 Zider Account。
- 当前 Wix instance 可直接使用 PrintOps 的订单同步、模板和打印能力。
- 当需要账号能力时，再引导用户使用 Google 或邮箱验证码认领。
- 官网注册入口保留，后续作为统一用户中心入口。
- Wix 用户和官网用户只通过邮箱验证、Google 登录或 Wix 授权身份做安全合并。

## 3. 核心原则

### 3.1 平台安装可以创建隔离工作区

Wix 安装代表一个明确的 app instance。为了让商家即时可用，系统可以为这个 instance 创建：

- app installation。
- isolated workspace context。
- store profile。
- default PrintOps template scope。

这个工作区只服务当前 Wix app instance，不会自动并入用户已有的真实 Zider Workspace。

### 3.2 不自动合并真实账号

平台安装不是账号合并。

系统不能因为以下信息相同或相似就自动合并：

- 邮箱。
- 域名。
- 店铺名。
- 公司名。
- Wix owner id。
- 历史记录。

这些信息只能用于提示、默认值或安全校验，不能直接完成账号合并。

### 3.3 合并必须显式确认

连接或合并 Zider Account 时，必须由用户主动发起：

```text
Connect Zider account
```

并通过一次性 `account_link_intent` 校验。合并动作必须可审计、可回溯。

### 3.4 Workspace 仍是长期业务边界

P0 的自动工作区是为了 Wix 安装体验。长期仍以 Workspace 管理：

- 团队成员。
- 多店铺。
- 共享模板。
- 订阅权益。
- 权限。
- 审计日志。

## 4. 术语定义

### Zider Account

真实用户账号，可通过 Google、邮箱验证码或后续平台身份登录。

### App Workspace Context

由平台安装自动创建的应用工作区上下文。

第一版可以先用 `app_key + platform + instance_id` 作为运行时数据边界；后续再映射到显式 `workspace_id` 和 `store_id`。

### Workspace

Zider 内部的业务主体，用来管理团队、店铺、模板、订阅和权限。

产品界面对用户使用 `Workspace`，数据库内部可以使用 `tenant`。

### Store

一个被 Workspace 管理的外部渠道店铺。

示例：

```text
Wix Store = 一个 Wix site 上安装的 PrintOps app instance
Shopify Store = 一个 Shopify shop domain
```

### Platform Installation

平台侧安装事实。

Wix 示例：

```text
platform = wix
external_store_key = instanceId
```

Shopify 示例：

```text
platform = shopify
external_store_key = shop.myshopify.com
```

### Account Link Intent

用于把 Wix 自动创建的应用工作区认领到真实 Zider Account。

它必须至少包含：

```text
id
provider
app_key
instance_id
source_workspace_id
target_user_id
state / nonce
expires_at
consumed_at
status
```

### Connection Intent

用于把一个外部店铺连接到已有 Workspace。

第一版 Wix 安装自动创建工作区时不需要 connection intent。后续把店铺加入已有 Workspace、迁移店铺或添加多平台店铺时必须使用 connection intent。

### Workspace Store Connection

外部店铺与 Workspace 的明确绑定关系。

```text
workspace_id
store_id
platform_installation_id
platform
external_store_key
connected_by_user_id
connected_at
status
```

## 5. Wix P0 安装流程

```text
Wix installs PrintOps
-> Wix sends install event
-> Upsert app_installations
-> Merchant opens PrintOps from Wix
-> Verify signed Wix instance
-> Resolve instanceId / siteOwnerId / siteMemberId
-> Request Wix access token
-> Fetch Wix site profile
-> Upsert platform_store_profiles
-> Find or create isolated app workspace context
-> Find or create store context
-> Enter PrintOps without Zider login
```

当前实现可以继续以以下键作为数据隔离边界：

```text
app_key + platform + instance_id
```

后续补齐 Workspace 表后，应把当前 instance 关联到：

```text
workspace_id
store_id
platform_installation_id
```

## 6. 自动工作区的含义

自动创建的工作区：

- 只对应当前 Wix app instance。
- 默认没有真实 Zider Account owner。
- 可以使用 Wix instance 授权访问 PrintOps。
- 可以同步订单、保存模板、记录打印状态。
- 可以从 Wix site profile 初始化店铺名、网站、邮箱、logo、语言、时区和货币。
- 卸载 app 后可以标记为 inactive 或 suspended。

自动创建的工作区不代表：

- 已经属于某个官网注册账号。
- 已经加入某个大客户 Workspace。
- 已经开通 Workspace 级订阅。
- 可以被其他用户或其他店铺访问。

## 7. 账号认领流程

当用户需要账号能力时，例如团队协作、跨店铺管理、账单、模板跨店铺复用或统一用户中心，应提示：

```text
Connect Zider account
```

流程：

```text
Wix PrintOps
-> User clicks Connect Zider account
-> Create account_link_intent
-> Redirect to www.zider.ink/account
-> User signs in with Google or email OTP
-> Verify account_link_intent
-> Verify Wix instance is still valid
-> Attach Wix identity to Zider Account
-> Transfer app workspace ownership to Zider Account
-> Write account_merge_events
-> Return to PrintOps
```

安全规则：

- 邮箱相同只可提示，不可自动合并。
- Wix owner id 相同只可作为校验因子，不可绕过用户确认。
- `account_link_intent` 过期后必须重新发起。
- 合并必须记录审计事件。

## 8. 什么时候需要 Connection Intent

以下场景必须使用 `connection_intent`：

- 把当前 Wix Store 加入一个已有 Zider Workspace。
- 一个 Workspace 添加第二个 Wix Store。
- 添加 Shopify / WooCommerce / API / CSV 店铺。
- 店铺从一个 Workspace 迁移到另一个 Workspace。
- 大客户或代理商批量连接多个店铺。

后端必须强校验：

```text
if connecting to existing workspace and no valid connection_intent:
  reject binding
```

## 9. 多店铺与团队权限

大客户推荐先创建或认领 Enterprise Workspace，再逐个连接店铺。

建议角色：

```text
Workspace Owner
- 管订阅、团队、全部店铺、账单

Workspace Admin
- 管店铺连接、模板、成员分配

Store Manager
- 管指定店铺设置、模板、字段

Operator
- 同步订单、打印、下载 PDF

Viewer
- 只读查看
```

Store Switcher 只显示当前成员有权限访问的店铺。

## 10. 订阅规则

Workspace 绑定和订阅权益分开处理。

平台订阅规则：

```text
Wix App Market subscription
-> 默认只覆盖对应 Wix store / app instance

Shopify App Store subscription
-> 默认只覆盖对应 Shopify store

Zider Enterprise subscription
-> 覆盖整个 Workspace 下允许数量内的多个 stores
```

因此：

- P0 Wix 安装只解锁对应 Wix app instance 的 PrintOps 能力。
- 平台安装不自动解锁 Workspace 多店铺权益。
- 大客户统一订阅必须走 Workspace 级 entitlement。

## 11. 推荐数据关系

```text
users
  id
  email
  status
  created_from
  merged_into_user_id

user_identities
  user_id
  provider
  provider_subject
  email
  instance_id
  site_id

workspaces
  id
  name
  owner_user_id nullable
  created_from = wix_install | manual | shopify_install
  claim_status = unclaimed | claimed | merged
  status

stores
  id
  workspace_id
  platform
  name
  site_url
  status

app_installations
  id
  app_key
  platform
  instance_id
  workspace_id nullable
  store_id nullable
  status
  raw_installation

workspace_store_connections
  id
  workspace_id
  store_id
  platform_installation_id
  platform
  external_store_key
  connected_by_user_id nullable
  connected_at
  status

account_link_intents
  id
  provider
  app_key
  instance_id
  source_workspace_id
  target_user_id
  state
  status
  expires_at
  consumed_at

account_merge_events
  id
  source_user_id
  target_user_id
  workspace_id
  store_id
  action
  metadata
  created_at
```

## 12. P0 范围

P0 先实现：

- Wix 安装后自动创建或解析 app workspace context。
- 不强制 Zider Account 登录。
- 保存 Wix site profile。
- 使用 Wix site profile 作为模板默认值。
- PrintOps 订单同步、模板、PDF、打印和打印状态按 `instance_id` 隔离。
- Google / 邮箱验证码认领入口的产品与数据模型预留。

P0 不做：

- 自动合并已有 Zider Account。
- 自动匹配已有 Workspace。
- 多 Workspace 迁移。
- Store Groups。
- Shopify OAuth。
- WooCommerce OAuth。
- 跨店铺批量打印。

## 13. P1 范围

P1 再实现：

- 真实 Zider Account 接管 Wix 自动工作区。
- `account_link_intent`。
- `user_identities`。
- 显式 `workspace_id` / `store_id` 映射。
- 把 Wix Store 加入已有 Workspace。
- 团队成员邀请和权限。
- Store Switcher。

## 14. P2 范围

P2 面向大客户和多平台增强：

- Shopify OAuth 绑定。
- WooCommerce 绑定。
- Store Groups。
- All stores 汇总视图。
- 共享模板复制到多个店铺。
- Workspace 级订阅权益。
- 审计日志。
- Enterprise onboarding。

## 15. 最终判断

PrintOps 应采用：

```text
P0: Wix install-first isolated workspace context
P1+: claim, merge, and multi-store by verified intent
```

最终原则：

```text
Install first, use immediately.
Claim later, merge only by explicit verified intent.
```
