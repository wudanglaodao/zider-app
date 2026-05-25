# 订单打印系统结构文档

版本：v0.1
更新日期：2026-05-24
文档类型：页面结构与菜单结构
当前范围：Wix Stores 首发，优先覆盖订单模板、字段映射、自定义样式、预览、PDF 和打印记录

## 1. 结构原则

- 前期只围绕“订单打印”闭环设计，不把发货平台、打印机连接、云打印、本地代理放进主流程。
- 系统不单独维护复杂“订单类型”，用“模板场景 + 匹配规则 + 手动选择模板”处理。
- 模板编辑器按组件化数据结构设计，P0 不做复杂拖拽，但为后续拖拽和组件库预留。
- 支持多店铺概念。一个商家组织可以连接多个店铺，订单、模板、字段映射和默认设置都需要按店铺隔离或覆盖。
- 页面以工作台效率为主，优先表格、筛选、预览、批量操作和状态反馈。
- 所有主操作都应能回到订单、模板、打印任务三个核心对象。

## 2. 信息架构

核心对象：

| 对象 | 说明 | 主要页面 |
|---|---|---|
| Store | 当前连接的 Wix 店铺 | Settings |
| Organization | 商家组织，可包含多个店铺 | Settings |
| Store Location | 店铺下的门店 / 自提点 / 业务地点 | Settings |
| Order | 从 Wix 同步的订单 | Orders、Order Detail |
| Product | 从 Wix 同步的产品资料 | Products |
| Product Print Field | 我们系统内维护的产品/变体打印字段 | Products、Template Editor |
| Template | 可配置的打印模板 | Templates、Template Editor |
| Template Component | 模板里的 section / block / field component | Template Editor |
| Field Mapping | Wix 字段到标准字段或模板字段的映射 | Field Mapping、Template Editor |
| Print Job | PDF 生成、下载、浏览器打印记录 | Print Jobs |

前期不作为主对象：

| 对象 | 处理方式 |
|---|---|
| Printer | 不建主菜单，不做设备连接 |
| Shipment | P3 后续扩展，不进前期页面 |
| Order Type | 不建独立模型，由模板场景和匹配规则承担 |
| Shipping Platform | P3 后续扩展，不进前期页面 |

## 3. 主菜单结构

### 3.1 P0 主菜单

```text
Order Printer
├── Store Switcher
├── Overview
├── Orders
├── Templates
├── Print Jobs
└── Settings
```

### 3.2 P1 菜单扩展

```text
Order Printer
├── Store Switcher
├── Overview
├── Orders
├── Products
├── Templates
├── Print Jobs
├── Field Mapping
└── Settings
```

说明：

- P0 可以把 Field Mapping 放在 Settings 或 Template Editor 内。
- 当字段映射成为高频操作后，P1 再独立成主菜单。
- Products 在 P1 独立成菜单；P0 只使用订单行自带商品信息。
- Store Switcher 放在顶部导航或侧栏顶部，不作为主菜单项。
- 不设置 Printers 菜单。
- 不设置 Shipments 菜单。
- 不设置 Order Types 菜单。

### 3.3 Store Switcher

用途：切换当前操作上下文。

显示内容：

- 当前组织名称。
- 当前店铺名称。
- 店铺平台，如 Wix。
- 店铺同步状态。

操作：

- 切换店铺。
- 查看全部店铺。
- 进入 Settings / Stores。
- 连接新店铺。

切换影响：

- Orders 只显示当前店铺订单。
- Templates 默认显示当前店铺模板，同时可查看共享模板。
- Print Jobs 只显示当前店铺任务。
- Settings 默认进入当前店铺设置。
- Overview 显示当前店铺指标，P1 可增加 all stores 总览。

## 4. 路由结构

### 4.1 P0 路由

```text
/order-printer
/order-printer/stores/:storeId
/order-printer/orders
/order-printer/orders/:orderId
/order-printer/templates
/order-printer/templates/new
/order-printer/templates/:templateId
/order-printer/print-jobs
/order-printer/settings
```

### 4.2 P1 路由

```text
/order-printer/field-mapping
/order-printer/products
/order-printer/products/:productId
/order-printer/templates/:templateId/versions
/order-printer/templates/:templateId/preview
```

### 4.3 P2 / P3 预留路由

```text
/order-printer/integrations/woocommerce
/order-printer/integrations/shopify
/order-printer/integrations/shipping
```

预留路由不进入前期导航，只在后续阶段开放。

## 5. 页面结构

## 5.1 Overview

用途：快速查看订单打印工作状态。

路径：

```text
/order-printer
```

页面模块：

| 模块 | 内容 |
|---|---|
| Summary Metrics | 今日订单数、未打印订单数、PDF 生成数、失败任务数 |
| Quick Actions | Print unprinted orders、Create template、Review missing fields |
| Recent Print Jobs | 最近打印任务、状态、下载入口 |
| Template Shortcuts | 常用模板入口 |
| Alerts | 字段缺失、同步失败、模板未配置提醒 |

P0 操作：

- 切换当前店铺。
- 进入 Orders。
- 进入 Templates。
- 下载最近 PDF。
- 查看失败 print job。

多店铺规则：

- P0 Overview 默认显示当前店铺数据。
- P1 可增加 `All stores` 视图，显示所有店铺汇总。
- 当前店铺无订单时，引导同步当前店铺订单。

## 5.2 Orders

用途：订单筛选、批量选择、预览和打印。

路径：

```text
/order-printer/orders
```

页面结构：

```text
Orders
├── Header
│   ├── Page title
│   ├── Current store
│   ├── Sync status
│   └── Refresh orders
├── Filter bar
│   ├── Search
│   ├── Date range
│   ├── Payment status
│   ├── Fulfillment status
│   ├── Print status
│   └── Template scenario
├── Orders table
├── Bulk action bar
└── Order detail drawer
```

订单表格字段：

| 字段 | P0 |
|---|---|
| Checkbox | 是 |
| Order number | 是 |
| Customer | 是 |
| Order date | 是 |
| Total | 是 |
| Payment status | 是 |
| Fulfillment status | 是 |
| Print status | 是 |
| Recommended template | 是 |
| Print language | 是 |
| Missing fields warning | 是 |

批量操作：

- Preview。
- Generate PDF。
- Browser print。
- Mark as printed。
- Change template。
- Change print language。

多店铺规则：

- Orders P0 只显示当前店铺订单。
- 订单不能跨店铺批量打印。
- 切换店铺后保留通用筛选项，但清空已选订单。
- Print status 按店铺隔离。

订单详情抽屉：

| 区域 | 内容 |
|---|---|
| Summary | 订单号、客户、金额、状态 |
| Customer | 姓名、邮箱、电话、公司、税号 |
| Addresses | Shipping、Billing、Pickup、Delivery |
| Line Items | 商品、SKU、variant、数量、图片、自定义字段 |
| Product Fields | 产品打印字段、变体打印字段、合并来源 |
| Notes | Buyer note、gift note、internal note |
| Custom Fields | 字段 key、label、value、映射状态 |
| Print History | 已生成 PDF、已打印、失败记录 |
| Actions | Preview、Generate PDF、Mark as printed、Refresh order |

## 5.3 Order Detail

用途：查看单个订单完整信息和打印历史。

路径：

```text
/order-printer/orders/:orderId
```

说明：

- P0 可先用 drawer 实现，不一定需要独立页面。
- 如果订单字段和打印历史较复杂，P1 再开放独立详情页。

页面模块：

- Order summary。
- Customer and address。
- Line items。
- Product print fields。
- Custom fields。
- Recommended templates。
- Print preview entry。
- Print job history。

## 5.4 Templates

用途：管理打印模板。

路径：

```text
/order-printer/templates
```

页面结构：

```text
Templates
├── Header
│   ├── Page title
│   └── New template
├── Template filters
├── Template list
└── Empty state
```

模板列表字段：

| 字段 | 说明 |
|---|---|
| Template name | 模板名称 |
| Document type | Packing Slip、Production Sheet、Thermal Receipt 等 |
| Paper size | A4、Letter、4x6、80mm |
| Default language | 默认打印语言 |
| Scenario | 模板场景 |
| Scope | 当前店铺模板或组织共享模板 |
| Status | Active、Draft、Inactive |
| Last updated | 最近更新时间 |

模板操作：

- Edit。
- Duplicate。
- Preview。
- Set as default。
- Share to organization。
- Copy to current store。
- Disable。
- Delete。

多店铺规则：

- P0 模板默认归属当前店铺。
- P1 支持组织共享模板。
- 共享模板可复制到具体店铺后单独修改。
- 店铺默认模板优先于组织默认模板。

## 5.5 Template Editor

用途：编辑模板字段、样式、文案和预览。

路径：

```text
/order-printer/templates/new
/order-printer/templates/:templateId
```

页面结构：

```text
Template Editor
├── Top bar
│   ├── Template name
│   ├── Template scope
│   ├── Document type
│   ├── Paper size
│   ├── Preview order selector
│   ├── Save
│   └── Preview / Generate PDF
├── Left panel
│   ├── Sections
│   ├── Blocks
│   └── Fields
├── Center canvas
│   └── Print preview
└── Right panel
    ├── Settings
    ├── Style
    ├── Visibility
    └── Field binding
```

P0 编辑能力：

- 选择文档类型。
- 选择纸张尺寸。
- 设置默认打印语言。
- 设置默认字体。
- 配置 logo、店铺名称、店铺地址。
- 开关字段显示。
- 调整字段排序。
- 配置基础样式：字体、字号、粗细、颜色、对齐。
- 编辑页眉、页脚、固定文案。
- 设置商品图片显示。
- 设置价格显示。
- 选择预览订单。
- 查看分页和溢出提示。

P0 不做：

- 自由拖拽定位。
- 任意 CSS 编辑。
- 任意 HTML 编辑。
- 复杂画布设计工具。

技术结构要求：

- 模板保存为结构化 JSON。
- 左侧 section / block / field 操作应对应模板 JSON。
- 中间预览由模板 JSON 渲染。
- 右侧属性面板只修改受控 schema。
- 即使 P0 只是表单式配置，也要使用组件模型保存。

多店铺规则：

- 模板可绑定当前店铺品牌信息。
- 共享模板应使用变量引用品牌信息，如 `store.logo`、`store.name`、`store.address`。
- 预览订单只能选择当前店铺订单。
- 复制模板到其他店铺时，需要提示字段映射和品牌变量是否可用。

## 5.6 Products

用途：同步产品资料，维护产品级和变体级打印字段。

路径：

```text
/order-printer/products
/order-printer/products/:productId
```

阶段：

- P0：不独立做 Products 页面，只使用订单行自带商品信息。
- P1：独立为 Products 菜单。

页面结构：

```text
Products
├── Header
│   ├── Current store
│   ├── Sync status
│   └── Sync products
├── Filter bar
│   ├── Search
│   ├── SKU
│   ├── Product status
│   └── Missing print fields
├── Products table
└── Product detail drawer / page
```

产品列表字段：

| 字段 | 说明 |
|---|---|
| Product image | 商品图片 |
| Product name | 商品名称 |
| SKU | 默认 SKU |
| Variants | 变体数量 |
| Print fields | 产品打印字段数量 |
| Missing fields | 缺失字段提示 |
| Sync status | 同步状态 |
| Updated at | 更新时间 |

产品详情模块：

| 模块 | 内容 |
|---|---|
| Product summary | 图片、名称、SKU、平台商品 ID |
| Variants | 变体、SKU、选项、图片 |
| Wix fields | options、custom text fields、图片等同步字段 |
| Product print fields | 产品级打印字段 |
| Variant print fields | 变体级打印字段 |
| Usage | 被哪些模板使用 |

产品打印字段示例：

- Bin location。
- Production note。
- Packing instruction。
- Material。
- Care instruction。
- Internal SKU。
- Supplier SKU。
- Default production image。
- Product label text。
- HS code / country of origin。

多店铺规则：

- Products 只显示当前店铺产品。
- 产品打印字段按 store 保存。
- P1 支持复制产品打印字段配置到其他店铺。
- 模板引用产品字段时，应使用字段 key，而不是固定产品 ID。

## 5.7 Template Preview

用途：在真实订单数据下检查模板输出。

路径：

```text
/order-printer/templates/:templateId/preview
```

P0 可作为 Template Editor 内的 preview mode，不一定独立页面。

预览功能：

- 选择预览订单。
- 切换打印语言。
- 切换纸张尺寸。
- 显示分页边界。
- 显示字段缺失 warning。
- 显示图片加载 warning。
- 显示文本溢出 warning。
- Generate PDF。

## 5.8 Print Jobs

用途：查看 PDF 生成、下载、浏览器打印和失败记录。

路径：

```text
/order-printer/print-jobs
```

页面结构：

```text
Print Jobs
├── Header
├── Filters
├── Jobs table
└── Job detail drawer
```

Print jobs 表格字段：

| 字段 | 说明 |
|---|---|
| Job ID | 打印任务 ID |
| Created at | 创建时间 |
| Created by | 发起人 |
| Orders | 订单数量 |
| Template | 使用模板 |
| Document type | 文档类型 |
| Language | 打印语言 |
| Paper size | 纸张尺寸 |
| Status | pending、generated、downloaded、printed、failed、review_required |
| Actions | Download、Preview、Mark as printed、Retry |

详情抽屉：

- 订单列表。
- 错误详情。
- 文件链接。
- 任务时间线。
- 重新生成。

## 5.9 Field Mapping

用途：管理平台字段、标准字段和模板字段的映射。

路径：

```text
/order-printer/field-mapping
```

阶段：

- P0：放在 Settings 或 Template Editor 内。
- P1：独立页面。

页面模块：

| 模块 | 内容 |
|---|---|
| Field Sources | Wix order fields、checkout extra fields、custom fields |
| Product Fields | Wix product fields、variant fields、product print fields |
| Field Samples | 最近订单样本值 |
| Mapping Table | source field、target field、label、type、scope |
| Missing Fields | 模板使用但订单缺失的字段 |
| Display Names | 字段显示名称、多语言 label |

操作：

- 创建映射。
- 编辑映射。
- 删除映射。
- 查看样本值。
- 设置字段显示名。
- 标记字段为常用。

## 5.10 Settings

用途：组织、店铺、品牌、默认模板、语言、PDF 和打印偏好设置。

路径：

```text
/order-printer/settings
```

页面结构：

```text
Settings
├── Organization
├── Stores
├── Current Store
├── Brand
├── Defaults
├── Languages
├── PDF
└── Data sync
```

设置项：

| 分组 | 内容 |
|---|---|
| Organization | 组织名称、成员、默认语言 |
| Stores | 已连接店铺列表、连接新店铺、店铺同步状态 |
| Current Store | 当前店铺名称、平台、店铺 URL、同步状态 |
| Store Locations | 门店、自提点、业务地点、地址、联系方式 |
| Brand | 当前店铺 Logo、品牌色、店铺地址、联系方式 |
| Defaults | 当前店铺默认模板、默认打印语言、默认纸张尺寸 |
| Languages | 系统语言、打印语言、fallback 语言 |
| PDF | 文件命名规则、分页偏好、图片显示偏好 |
| Data sync | 手动同步、最近同步时间、同步错误 |

多店铺设置规则：

- 一个 organization 可以拥有多个 stores。
- 每个 store 有独立订单、打印记录、字段映射和默认模板。
- Brand 设置默认按 store 保存。
- Defaults 设置默认按 store 保存。
- P1 支持 organization shared templates。
- P1 支持把模板从一个 store 复制到另一个 store。
- P1 支持 all stores 汇总视图，但批量打印仍按单个 store 执行。

不放入 Settings 的内容：

- 打印机连接。
- 发货平台连接。
- 承运商账户。
- 高级设备协议。

## 6. 菜单权限与状态

### 6.1 空状态

| 页面 | 空状态 |
|---|---|
| Overview | 引导连接 Wix 店铺、选择店铺或同步订单 |
| Orders | 当前店铺暂无订单，提供 Refresh orders |
| Templates | 当前店铺暂无模板，提供 Create template 或复制共享模板 |
| Print Jobs | 当前店铺暂无打印任务，引导从 Orders 生成 PDF |
| Settings | 显示基础配置 checklist |

### 6.2 Loading 状态

- 订单同步中。
- 店铺切换中。
- PDF 生成中。
- 模板保存中。
- 预览加载中。
- 字段样本加载中。

### 6.3 Error 状态

- Wix 授权失效。
- 当前店铺授权失效。
- 订单同步失败。
- 图片加载失败。
- 字段缺失。
- PDF 生成失败。
- 模板保存失败。

## 7. P0 页面优先级

P0 必须实现：

1. Store Switcher。
2. Orders。
3. Template Editor。
4. Templates。
5. Print Jobs。
6. Settings。
7. Overview。

说明：

- Orders 和 Template Editor 是核心页面。
- 多店铺会影响所有数据查询，Store Switcher 必须早做。
- Overview 可以先做轻量版本。
- Field Mapping P0 可以内嵌在 Template Editor 和 Settings。
- Order Detail P0 可以先用 drawer。

## 8. 后续预留

P1：

- Products 独立页面。
- Field Mapping 独立页面。
- 模板版本页。
- 模板规则页。
- 模板多语言文案页。
- All stores overview。
- Organization shared templates。

P1.5 / P2：

- Wix Restaurants 模板场景。
- WooCommerce integration setup。
- CSV import mapping。

P3：

- Shopify integration setup。
- Shipping integration setup。
- API keys。
- Agency workspace。
