# Zider 用户中心、账号与 Workspace 规划

版本：v0.1  
更新日期：2026-06-20
适用范围：Zider 官网、Zider Workspace、PrintOps、Wix / Shopify / WooCommerce 等平台插件

## 1. 目标

Zider 后续会同时存在官网、Workspace 产品后台、Wix 插件、Shopify 插件、WooCommerce 插件和独立小组件。用户中心需要解决：

- 官网和 Workspace 使用同一套 Zider Account。
- 一个 Zider Account 可以加入多个 Workspace。
- 一个 Workspace 可以管理多个外部店铺。
- Wix / Shopify 安装后可以立即使用对应应用。
- 平台安装、平台账号、Zider 账号、Workspace 归属之间边界清晰。
- 后续支持将 Wix 自动创建的账号/工作区连接到真实 Zider 账号。

## 1.1 第一版产品决策

第一版以 Wix 安装使用为主：

- Wix 安装 PrintOps 时自动创建或解析工作区和应用实例。
- 不强制用户先注册 Zider Account。
- Wix 商家可以直接进入 PrintOps 同步订单、配置模板、下载 PDF 和打印。
- 当用户需要账号能力时，再引导使用 Google 或邮箱验证码认领。
- 官网注册入口保留，后续作为统一用户中心入口。
- Wix 用户和官网用户通过邮箱验证、Google 登录或 Wix 授权身份做安全合并。

第一版的关键边界：

```text
Wix app instance is usable immediately.
Zider Account ownership is claimed later.
Account merge requires explicit verified intent.
```

## 2. 核心原则

### 2.1 账号不是店铺

Zider Account 表示一个人或团队成员身份。

Store 表示一个外部销售渠道店铺，例如 Wix site、Shopify shop、WooCommerce site。

二者不能混用。

### 2.2 平台安装不是 Workspace 绑定

Wix / Shopify 安装只说明平台授权成功，不代表这个店铺属于某个已有 Zider Workspace。

不能根据邮箱、域名、店铺名、公司名、owner id 或历史记录自动匹配已有 Workspace。

### 2.3 平台安装可以自动创建独立 Workspace

为了让 Wix 用户安装后立即使用 PrintOps，允许系统为当前 Wix instance 自动创建一个独立 Workspace 和 Store。

这个自动 Workspace 只属于当前平台安装上下文，不会自动合并到用户已有 Workspace。

### 2.4 合并必须由用户主动确认

连接或合并 Zider 账号时，必须有明确用户动作：

```text
Connect Zider account
```

并且需要通过一次性 `account_link_intent` 校验。

### 2.5 保存操作必须有状态反馈

账号中心、Workspace 和各应用后台的保存类操作都必须提供明确反馈：

- 点击保存后按钮进入保存中状态，并禁用重复提交。
- 保存成功后展示明确成功提示，例如 `Saved successfully` / `已保存`。
- 保存失败或必填缺失时展示可理解的错误提示，并保留用户已输入内容。
- 保存后的预览、PDF、打印和页面展示必须读取同一份已保存数据，避免用户误以为保存成功但实际未生效。

## 3. 域名与产品关系

```text
www.zider.ink
  官网、品牌页、定价页、账号登录入口

workspace.zider.ink
  Zider Workspace 产品后台
  /apps/printops
  /apps/printops/wix
  /widget/interactive-custom-cursor

app.zider.ink
  平台事件、Webhooks、安装与业务事件接收
  /events/wix/{appKey}
  /webhooks/printops/wix
```

官网和 Workspace 应共享同一个 Zider Account session。`app.zider.ink` 主要作为服务端事件入口，不作为用户中心入口。

## 4. 核心对象定义

### Zider Account

一个真实用户账号，可通过 Google、邮箱验证码或后续平台身份登录。

### User Identity

账号的外部身份映射。

示例：

```text
email:yancy@example.com
wix:site_owner_id
wix:site_member_id
shopify:shop_owner_id
```

### Workspace

业务工作区，用于管理团队、店铺、订阅、模板、权限和应用数据。

### Workspace Member

用户在某个 Workspace 中的成员关系和权限。

### Store

Workspace 下管理的外部店铺。

示例：

```text
Wix Store = 一个 Wix site / app instance
Shopify Store = 一个 myshopify.com shop
WooCommerce Store = 一个 WordPress / WooCommerce site
```

### Platform Installation

平台侧安装事实，记录 Wix / Shopify / WooCommerce 插件授权信息。

它不直接表示 Workspace 归属。

### Workspace Store Connection

外部店铺与 Workspace 的明确绑定关系。

## 5. 推荐数据模型

### users

```text
id
email nullable
display_name
avatar_url
status
created_from              # email | wix | shopify | invite | system
merged_into_user_id
last_login_at
created_at
updated_at
```

### user_identities

```text
id
user_id
provider                  # email | google | wix | shopify
provider_subject
provider_account_id
email
instance_id
site_id
raw_identity
created_at
updated_at
unique(provider, provider_subject)
```

### workspaces

```text
id
name
slug
owner_user_id
created_from              # manual | wix_install | shopify_install | invite
status
created_at
updated_at
```

### workspace_members

```text
id
workspace_id
user_id
role                      # owner | admin | manager | operator | viewer
status
invited_by_user_id
joined_at
created_at
updated_at
unique(workspace_id, user_id)
```

### stores

```text
id
workspace_id
platform                  # wix | shopify | woocommerce | api | csv
name
site_url
status
created_at
updated_at
```

### platform_installations

可继续复用当前 `app_installations`，后续如需跨应用统一，可迁移为通用安装表。

```text
id
app_key
platform
instance_id / external_store_key
site_id
site_owner_id
account_id
site_url
status
installed_at
uninstalled_at
raw_installation
```

### workspace_store_connections

```text
id
workspace_id
store_id
platform_installation_id
platform
external_store_key
connected_by_user_id
connected_at
status
```

### account_link_intents

用于 Wix 自动账号连接真实 Zider Account。

```text
id
provider                  # wix | shopify
app_key
instance_id
source_user_id
source_workspace_id
target_user_id nullable
state
status                    # pending | consumed | expired | cancelled
expires_at
consumed_at
created_at
updated_at
```

### account_merge_events

审计账号连接和工作区接管。

```text
id
source_user_id
target_user_id
workspace_id
store_id
action                    # connect_identity | transfer_workspace_owner | merge_shadow_user
metadata
created_at
```

## 6. Wix 安装后自动创建工作区逻辑

当用户从 Wix 安装并首次打开 PrintOps：

```text
Wix opens PrintOps
-> workspace.zider.ink/apps/printops/wix?instance=...
-> Verify signed instance
-> Resolve instanceId / siteOwnerId / siteMemberId
-> Upsert app_installations
-> Request Wix access token
-> Fetch Wix site profile
-> Upsert platform_store_profiles
-> Find or create Wix installation identity
-> Find or create unclaimed workspace for this instance
-> Find or create store for this instance
-> Create or confirm workspace_store_connection
-> Enter PrintOps
```

这个流程不要求商家先注册 Zider Account。第一版可以先用 Wix `instance_id` 作为运行时数据边界，后续再把它映射到显式 `workspace_id`、`store_id` 和真实用户成员关系。

### Shadow user

如果用户还没有连接 Zider Account，系统可以创建一个 shadow user：

```text
email = null 或 business_email
created_from = wix
status = active
```

并创建对应 `user_identities`：

```text
provider = wix
provider_subject = siteOwnerId 或 instanceId
instance_id = Wix instanceId
```

shadow user 只用于承接当前 Wix 安装上下文，不应作为完整官网登录账号，也不应要求用户感知或主动管理。

## 7. Wix 站点资料默认值

安装后应自动拉取 Wix 站点资料，保存到 `platform_store_profiles`，作为多个 Wix app 可共享的平台店铺资料缓存。

建议字段：

```text
site_url
business_name
business_email
logo_media_path
logo_url
phone
address
language
locale
timezone
currency
```

这些资料用于 PrintOps 默认值：

- 模板 Logo。
- 店铺名称。
- 页脚网站。
- 页脚邮箱。
- 默认语言。
- 日期格式。
- 时区。
- 货币格式。

如果 Wix 没有设置 Logo 或邮箱，保持为空，并引导用户在模板编辑器里上传或手动填写。

## 8. 连接 / 合并 Zider 账号流程

用户在 Wix 内打开 PrintOps 后，页面提供：

```text
Connect Zider account
```

流程：

```text
1. 创建 account_link_intent
2. 跳转到 www.zider.ink/account 登录或注册
3. 登录成功后回到 workspace.zider.ink
4. 校验 account_link_intent
5. 校验 Wix instance 仍然有效
6. 校验当前 store 未被其他真实 Workspace 绑定
7. 用户确认连接
8. 把 Wix identity 挂到目标 Zider Account
9. 把当前 Workspace owner 转移给真实 Zider Account
10. shadow user 标记为 merged
```

### 合并后的数据变化

```text
user_identities
  user_id = real_zider_user
  provider = wix
  provider_subject = wix_site_owner_or_member
  instance_id = wix_instance_id

workspace_members
  workspace_id = auto_created_wix_workspace
  user_id = real_zider_user
  role = owner

users
  shadow_user.status = merged
  shadow_user.merged_into_user_id = real_zider_user
```

## 9. 两种连接模式

### P0：接管当前 Wix Workspace

用户登录 Zider Account 后，接管 Wix 自动创建的 Workspace。

特点：

- 风险低。
- 数据归属清晰。
- 不需要处理多 Workspace 迁移。
- 适合第一版。

### P1：合并到已有 Workspace

用户可以选择把当前 Wix Store 加入已有 Workspace。

必须校验：

- 当前用户是目标 Workspace 的 owner 或 admin。
- 当前 Wix Store 没有绑定到其他真实 Workspace。
- 目标 Workspace 的订阅允许添加更多 Store。
- 用户明确确认迁移。

## 10. 不允许的自动行为

以下行为禁止：

- 因为邮箱相同自动合并账号。
- 因为域名相似自动绑定 Workspace。
- 因为店铺名相同自动关联团队。
- 在没有 `account_link_intent` 的情况下完成账号连接。
- 在没有用户确认的情况下转移 Workspace owner。
- 删除 shadow user 造成审计断链。

## 11. 权限角色

建议 Workspace 角色：

```text
owner
  管理账单、团队、所有店铺、连接平台、删除 Workspace

admin
  管理团队、店铺、模板和应用设置

manager
  管理指定店铺、模板和字段配置

operator
  同步订单、打印、下载 PDF、标记已打印

viewer
  只读查看
```

## 12. 官网与 Workspace 登录体验

### 官网

入口：

```text
www.zider.ink/account
```

功能：

- 登录。
- 注册。
- 找回密码。
- 查看账号资料。
- 跳转 Workspace。

### Account Center P0 交互骨架

第一版 Account Center 只服务账号资料和登录身份管理，不承载 Workspace 账单、成员、邀请链接或多组织管理。

页面结构：

```text
Topbar
  ZIDER logo
  Home icon link
  Account avatar menu

Sidebar
  Account Center
  Help center -> /forum
  current account summary

Main
  page title
  signed-in summary
  sign-in method summary
  profile form
  login info
  social logins
```

版心规则：

- 操作型账号页面在桌面端使用比官网内容页更宽的版心。
- 常规桌面主内容最大宽度约 `1280px`。
- `1680px` 以上大屏可扩展到约 `1480px`，避免卡片挤在页面中央。
- `1120px` 以下切换为单列布局，移动端最大宽度约 `680px`。
- 顶部栏不重复展示已登录账号卡片，用户身份在右侧头像菜单和页面摘要卡片中展示即可。

交互规则：

- `Save changes` 是 Profile 区唯一主操作。
- 保存中需要禁用重复提交。
- 保存成功展示明确成功提示。
- 保存失败保留用户已输入内容，并指出可修正原因。
- 刷新页面后必须读取已保存账号资料，不能回退到旧值。

### Workspace

入口：

```text
workspace.zider.ink
```

P0 功能：

- 静态展示 Workspace 壳层。
- 提供 `Sign in` 登录入口。
- 提供 `Account Center` / 用户中心入口。
- 保留 Help center 入口。
- 左侧菜单只保留 `Account Center`。
- 使用 ZIDER micro Z 标识作为后台左侧品牌符号。

P0 暂不在 Workspace 根页面承载：

- 账单管理。
- 成员和权限。
- 邀请链接。
- 当前 Workspace 切换。
- 当前 Store 切换。
- 应用市场或多应用管理。
- 订阅权益。

说明：PrintOps / Wix 的实际业务工作流继续放在 `/apps/printops/*`，Workspace 根页面只作为账号入口和后续工作台骨架。

### Wix iframe

Wix 内打开 PrintOps 时：

- 优先使用 Wix instance 上下文进入。
- 如果已连接 Zider Account，显示真实用户与 Workspace。
- 如果未连接，显示当前 Wix Workspace，并提示可连接 Zider Account。

## 13. P0 实施范围

P0 需要完成：

- 统一账号模型草案。
- Wix 安装后自动创建 shadow user。
- Wix 安装后自动创建 Workspace。
- Wix 安装后自动创建 Store。
- 保存 Wix site profile。
- PrintOps 使用 Store profile 作为模板默认值。
- 提供 `Connect Zider account` 入口。
- 实现 account_link_intent。
- 支持真实账号接管自动创建的 Wix Workspace。

P0 暂不做：

- 合并到已有 Workspace。
- 跨 Workspace 迁移 Store。
- 企业多店铺权限。
- Shopify / WooCommerce 账号合并。
- Workspace 根页面账单、成员、邀请链接、多 Workspace 管理。
- 复杂 SSO。

## 14. P1 / P2 规划

### P1

- 合并 Wix Store 到已有 Workspace。
- 团队邀请。
- Workspace 成员权限。
- Store Switcher。
- Workspace 级订阅权益。

### P2

- Shopify OAuth 账号连接。
- WooCommerce 站点连接。
- 多 Workspace 组织管理。
- 企业客户 SSO。
- 审计日志和安全中心。

## 15. 与现有文档关系

本文件是 Zider 用户中心与账号体系的源文档。

相关文档：

- `product/printops-workspace-store-binding-rules.md`
- `docs/14-wix-event-contract.md`
- `product/printops-requirements/08-wix-release-test-plan.md`

如果未来修改 Wix 安装、账号连接、Workspace 绑定或 Store 归属规则，应先更新本文档。
