# PrintOps Workspace 与店铺绑定规则

版本：v0.1  
更新日期：2026-06-12  
适用范围：Zider PrintOps 多店铺、多渠道、大客户 Workspace 规划

## 1. 目标

PrintOps 后续需要支持大客户在一个 Workspace 下管理多个渠道店铺：

```text
Workspace
├── Team Members
├── Wix Store A
├── Wix Store B
├── Shopify Store C
└── Future Stores: WooCommerce / API / CSV
```

核心目标：

- 一个 Workspace 可以绑定多个平台店铺。
- Wix / Shopify 安装只代表平台授权，不代表业务归属。
- 店铺必须通过 Workspace 主动发起连接后，才建立绑定关系。
- 大客户可以使用 Workspace 级订阅统一管理多个店铺。
- 团队成员和店铺权限由 Workspace 管理。

## 2. 核心原则

```text
Platform installation != Workspace binding
```

平台安装不是绑定。只有从 Workspace 内主动发起授权，才允许创建绑定关系。

规则：

- Wix / Shopify 直接安装 app 时，不自动创建 Workspace 绑定。
- 不根据邮箱、owner id、域名、公司名或历史记录推断归属。
- 不提示“可能属于某个 Workspace”。
- 不做自动匹配，也不做半自动确认。
- 只有有效的 `connection_intent` 可以触发绑定。

## 3. 术语定义

### Workspace

Workspace 是 Zider 内部的业务主体，用来管理：

- 团队成员。
- 店铺列表。
- 店铺分组。
- 权限。
- 共享模板。
- Workspace 级订阅。
- 跨店铺汇总视图。

产品界面对用户使用 `Workspace`，数据库内部可以使用 `tenant`。

### Store

Store 是一个被 Workspace 管理的外部渠道店铺。

示例：

```text
Wix Store = 一个 Wix site 上安装的 PrintOps app instance
Shopify Store = 一个 Shopify shop domain
```

### Platform Installation

Platform Installation 只记录平台侧安装事实。

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

它不表示该店铺属于哪个 Workspace。

### Connection Intent

Connection Intent 表示某个 Workspace 主动发起一次店铺连接。

它必须至少包含：

```text
id
workspace_id
platform
state / nonce
created_by_user_id
expires_at
consumed_at
status
```

只有 `connection_intent` 有效时，平台授权回来后才允许创建绑定。

### Workspace Store Connection

Workspace Store Connection 是最终业务绑定关系。

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

它表示：这个外部店铺已经被明确绑定到这个 Workspace。

### Entitlement

Entitlement 是订阅权益，不等同于店铺绑定。

```text
workspace_id
billing_scope
billing_provider
plan
max_stores
max_members
features
```

大客户建议使用 Workspace 级 entitlement。

## 4. 平台安装规则

当用户直接从 Wix App Market 或 Shopify App Store 安装时：

```text
平台安装成功
-> 记录 platform_installation
-> 记录 external_store_key
-> 不创建 workspace_store_connection
-> 显示未连接 Workspace 状态
```

允许做：

- 保存平台安装记录。
- 保存平台授权标识。
- 保存原始安装事件。
- 标记安装状态为 `installed`。
- 后续用于平台 API 调用前的授权检查。

不允许做：

- 自动创建 Workspace 绑定。
- 自动创建店铺归属。
- 根据邮箱匹配 Workspace。
- 根据 Wix owner id 匹配 Workspace。
- 根据 Shopify owner email 匹配 Workspace。
- 根据店铺域名或企业名匹配 Workspace。
- 提示疑似 Workspace。
- 在没有 intent 的情况下把店铺挂到某个 Workspace。

## 5. 建立绑定的唯一流程

绑定必须从 Workspace 内主动发起：

```text
Workspace
-> Stores
-> Connect Store
-> Choose platform: Wix / Shopify
-> Create connection_intent
-> Redirect to platform install / authorize
-> Platform returns with instanceId / shop domain
-> Verify connection_intent
-> Verify platform identity
-> Create workspace_store_connection
```

后端必须强校验：

```text
if no valid connection_intent:
  reject binding
```

即使已经拿到 Wix `instanceId` 或 Shopify `shop`，没有有效 intent 也不能建立绑定。

## 6. 直接平台安装后的页面状态

如果没有有效 `connection_intent`：

```text
This store is installed, but it is not connected to a Zider Workspace.
Open Zider Workspace and connect this store from Stores > Connect Store.
```

页面可以提供：

```text
Sign in to Zider
Create Workspace
```

但登录或创建 Workspace 后，仍然不能自动绑定当前平台店铺。用户必须在 Workspace 内重新进入：

```text
Stores -> Connect Store
```

## 7. 已绑定店铺的处理

系统可以检查已有绑定，用于防重复和路由，但不能用检查结果创建新绑定。

当有效 `connection_intent` 授权回来后：

```text
检查 external_store_key 是否已存在 active connection
```

如果未绑定：

```text
创建 workspace_store_connection
```

如果已绑定到同一个 Workspace：

```text
返回已连接状态
允许进入当前 Workspace
```

如果已绑定到其他 Workspace：

```text
拒绝绑定
显示店铺已连接到其他 Workspace
不显示目标 Workspace 名称
不显示疑似 owner 信息
```

## 8. 大客户多店铺管理

大客户推荐先创建 Enterprise Workspace，再逐个连接店铺。

```text
Enterprise Workspace
-> Stores
-> Connect Store
-> Wix / Shopify authorization
-> Store connected
-> Assign team members
-> Add to store group
```

一个 Workspace 下可以有：

```text
Store Groups
- US Stores
- EU Stores
- Retail
- Wholesale
- Test Stores
```

每个 Store 可以配置：

- 店铺资料。
- 同步状态。
- 默认模板。
- 字段映射。
- 品牌设置。
- 成员权限。
- 打印记录。

## 9. 团队权限规则

Workspace 管团队，Store 管业务数据边界。

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

大客户推荐：

```text
billing_scope = workspace
billing_provider = stripe | manual | enterprise_contract
plan = enterprise
max_stores = custom
max_members = custom
```

平台订阅规则：

```text
Wix App Market subscription
-> 默认只覆盖对应 Wix store

Shopify App Store subscription
-> 默认只覆盖对应 Shopify store

Zider Enterprise subscription
-> 覆盖整个 Workspace 下允许数量内的多个 stores
```

因此：

- 店铺绑定不自动产生 Workspace 级订阅。
- 平台安装不自动解锁 Workspace 多店铺权益。
- 大客户统一订阅必须走 Workspace 级 entitlement。

## 11. 推荐数据关系

```text
workspaces
  id
  name
  status

workspace_members
  workspace_id
  user_id
  role

platform_installations
  id
  platform
  external_store_key
  status
  raw_identity
  installed_at

connection_intents
  id
  workspace_id
  platform
  state
  created_by_user_id
  expires_at
  consumed_at
  status

stores
  id
  workspace_id
  platform
  name
  status

workspace_store_connections
  id
  workspace_id
  store_id
  platform_installation_id
  platform
  external_store_key
  connected_by_user_id
  connected_at
  status

workspace_entitlements
  workspace_id
  billing_scope
  billing_provider
  plan
  max_stores
  max_members
  features
```

## 12. P0 范围

P0 先实现：

- Workspace 模型。
- Store 模型。
- Platform Installation 记录。
- Connection Intent。
- Wix 店铺通过 Workspace 主动授权绑定。
- Store Switcher。
- Stores 管理页。
- Workspace entitlement 基础字段。

P0 不做：

- 自动匹配 Workspace。
- 疑似 Workspace 提示。
- 批量授权。
- Store Groups。
- Shopify OAuth。
- 跨店铺批量打印。

## 13. P1 范围

P1 再实现：

- Shopify OAuth 绑定。
- Store Groups。
- 成员按店铺授权。
- All stores 汇总视图。
- 共享模板复制到多个店铺。
- 批量 pending store slots。

## 14. P2 范围

P2 面向大客户增强：

- Enterprise onboarding。
- 批量邀请店铺管理员。
- 手动账单或合同订阅。
- 跨店铺报表。
- 模板和字段规则跨店铺复用。
- 审计日志。

## 15. 最终判断

PrintOps 应该采用：

```text
Workspace-first multi-store model
```

平台安装只负责授权，Workspace 才负责归属、团队、权限、订阅和多店铺管理。

最终绑定原则：

```text
Install first, bind only by intent.
```
