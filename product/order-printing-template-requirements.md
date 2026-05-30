# Zider PrintOps 模板专项需求文档

版本：v0.5
更新日期：2026-05-29
文档类型：模板中心与模板编辑器产品需求
当前范围：Wix Stores P0，优先完成模板中心、内置风格模板、Vify 式配置编辑器、预览和结构化模板保存

视觉样例和场景图片已整理到调研文档：[Zider PrintOps 模板视觉与场景调研](./order-printing-template-visual-research.md)。

范围更新：餐饮 / Wix Restaurants / Kitchen Ticket 暂缓，不进入当前 P0 / P1 模板中心和模板编辑器需求。

## 1. 背景与目标

PrintOps 的模板系统不是单纯的“发票样式管理”，而是订单打印产品的核心资产。模板决定订单数据如何被转换成仓库、生产、打包、门店和客户可阅读的文档。

P0 目标：

- 让商家可以从内置模板库选择一个可用模板。
- 让商家通过配置完成品牌、尺寸、字段、文案和样式调整。
- 让模板可以预览、保存、设为默认，并被订单打印流程复用。
- 从第一版开始保存结构化模板 JSON，避免后续升级组件编辑器、拖拽编辑器和代码模式时推翻重做。
- 从第一版开始让底层模型具备 AI-ready 能力：AI 后续只能生成结构化模板草稿、设计 token、组件树和字段绑定建议，不能绕过模板引擎。
- 支持站点多语言和打印模板多语言的基础模型。

P0 不追求一次做成完整设计工具。第一版采用 `Vify 式配置编辑器`：内置风格模板 + 参数设置 + 实时预览。

## 2. 产品定位

模板系统分为两个核心页面：

| 页面 | 定位 | 用户任务 |
|---|---|---|
| Template Center | 发现、管理和选择模板 | 浏览模板库、搜索筛选、复制模板、查看预览、设为默认 |
| Template Editor | 配置模板参数和字段 | 修改品牌、尺寸、字段、商品表格、文案、语言、预览并保存 |

模板中心解决“我应该用哪个模板”。模板编辑器解决“这个模板如何适配我的店铺和订单数据”。

## 3. 阶段路线

| 阶段 | 参考形态 | 产品定义 | 核心目标 |
|---|---|---|---|
| P0 | Vify 式配置编辑器 | 内置风格模板 + 参数设置 + 预览 | 快速让商家选模板、改品牌、开关字段并打印 |
| P1 | Documint 式组件 / 变量 / 循环 | 组件树、变量绑定、line items 循环、Field Registry | 支持更复杂的订单数据和可复用组件 |
| P2 | Beefree 式内容块和条件显示 | 内容块库、条件显示、区块复制、模板片段 | 让运营用户组合业务块，而不是写代码 |
| P3 | Printout Designer 式高级拖拽和精细布局 | 自由拖拽、精细坐标、特殊纸张布局 | 覆盖高阶定制、Agency 和复杂打印生产场景 |

## 4. 用户与场景

| 用户 | 核心诉求 | 典型模板 |
|---|---|---|
| 店主 / 运营 | 快速打印订单、减少漏打 | Packing Slip、Order Print |
| 仓库人员 | 拣货、打包、复核 | Pick List、Packing Slip |
| 生产人员 | 制作定制商品 | Production Sheet |
| 门店员工 | 自提、线下订单、小票 | Pickup Slip、Thermal Receipt |
| 财务 / B2B | 对账、付款凭证、税号展示 | Invoice Helper、Receipt Helper |
| 售后人员 | 退货和换货说明 | Return Form、Refund Note |

P0 优先覆盖 Wix Stores 的通用电商打印场景：Packing Slip、Pick List、Production Sheet、Invoice Helper、Receipt Helper、Thermal Receipt。
餐饮、厨房票、Wix Restaurants 数据结构和餐饮专用 80mm 出单后续单独评估。

### 4.1 P0 默认模板样式与场景

P0 模板库不追求“模板数量很多”，而是先提供一组覆盖核心业务动作的默认模板。每个默认模板都必须可直接打印，也必须能通过 Vify 式配置编辑器修改品牌、字段、文案和尺寸。

P0 梳理原则：

- 先按业务动作定义模板，再按视觉风格包装模板，不为了“好看”新增无明确场景的模板。
- 风格家族是可复用的 `base template`，不是静态图片；同一风格可以派生 Packing Slip、Receipt Helper 等不同文档。
- 默认模板必须有样例订单数据、真实纸张缩略图、字段依赖说明和可预览输出。
- 首版以 Wix Stores 通用电商订单为准，不覆盖餐饮、厨房票、KDS 或餐饮 modifier 字段。
- P0 编辑方式是参数化配置：品牌、尺寸、字段开关、商品表格、文案和预览，不做自由拖拽。

#### P0 默认风格家族

| 风格家族 | 用途 | 默认视觉 | 适合模板 |
|---|---|---|---|
| Plain Default | 系统 fallback，任何店铺都能直接打印 | 黑白、低装饰、信息完整、可读性优先 | Compact Packing Slip、Invoice Helper |
| Brand Standard | 客户随箱和客户凭证 | Logo、品牌色、页脚文案、适中留白 | Branded Packing Slip、Receipt Helper |
| Warehouse Compact | 仓库拣货和打包复核 | 高密度表格、SKU / qty 强调、少装饰 | Compact Packing Slip、Pick List |
| Production Focus | 定制生产和备货 | 商品图片、custom fields、备注区突出 | Production Sheet |
| Finance Simple | 财务辅助和 B2B 对账 | 金额汇总、税号、PO number、付款状态清楚 | Invoice Helper、Receipt Helper |
| Thermal Basic | 门店小票和 80mm 输出 | 窄幅、短字段、粗分隔线、无图片 | Thermal Receipt |

#### P0 风格参数

每个风格家族必须沉淀为可配置参数，不能只体现在一张截图里。

| 参数组 | P0 配置项 | 默认规则 |
|---|---|---|
| Brand | Logo、店铺名、品牌主色、辅助色、页脚品牌文案 | 客户文档默认显示，内部文档可弱化 |
| Typography | 默认字体、字号层级、表格字号、重点字段粗细 | A4 / Letter 可读性优先，80mm 使用更短 label |
| Paper | A4、Letter、4x6、80mm、边距、方向字段 | P0 默认 Portrait，保留 Landscape 字段 |
| Density | Comfortable、Compact、Table-first、Thermal | 客户文档默认 Comfortable，仓库文档默认 Compact |
| Sections | Header、Address、Items、Totals、Notes、Footer | 按模板受众默认开关 |
| Items table | 图片、商品名、SKU、variant、qty、price、tax、custom fields | 客户随箱默认隐藏价格，财务凭证默认显示金额 |
| Copy | 标题、字段 label、感谢语、退换货说明、免责声明 | 需要支持多语言 localized text map |
| Validation | 缺字段、图片失败、文本溢出、分页风险、字体风险 | Ready 模板必须通过关键校验 |

#### P0 必做默认模板

| 模板 key | 模板名称 | 文档类型 | 场景 | 默认尺寸 | 默认风格 | 面向对象 | P0 状态 |
|---|---|---|---|---|---|---|---|
| `packing_slip.branded` | Branded Packing Slip | Packing Slip | 客户随箱、品牌化打包单 | A4、Letter | Brand Standard | 客户 / 仓库 | 必做 |
| `packing_slip.compact` | Compact Packing Slip | Packing Slip | 仓库打包、复核、fallback | A4、Letter | Warehouse Compact / Plain Default | 仓库 | 必做 |
| `pick_list.batch` | Batch Pick List | Pick List | 多订单拣货、按 SKU / 商品聚合 | A4、Letter | Warehouse Compact | 仓库 | 必做 |
| `production_sheet.custom` | Custom Production Sheet | Production Sheet | 定制商品制作、备货、图片和字段核对 | A4、Letter | Production Focus | 生产人员 | 必做 |
| `invoice_helper.simple` | Simple Invoice Helper | Invoice Helper | 客户凭证、B2B 对账辅助 | A4、Letter | Finance Simple | 财务 / 客户 | 必做 |
| `receipt_helper.paid` | Paid Receipt Helper | Receipt Helper | 已付款订单凭证 | A4、Letter | Brand Standard / Finance Simple | 客户 / 财务 | 必做 |
| `thermal_receipt.basic` | Basic Thermal Receipt | Thermal Receipt | 门店小票、自提说明、简短订单 | 80mm | Thermal Basic | 门店员工 / 客户 | 必做 |
| `handoff_slip.4x6` | 4x6 Handoff Slip | Order Print / Handoff | 取货、配送交接、手工贴箱 | 4x6 | Plain Default | 仓库 / 门店 | P0.1 可选 |

P0.1 可选表示：数据模型和尺寸预设先保留，若首版 UI / 渲染成本可控，则一并提供；若时间紧，不能阻塞 P0 上线。

#### P0 开发优先级

| 顺序 | 模板 | 为什么先做 | 交付要求 |
|---|---|---|---|
| T0.1 | Branded Packing Slip | 最常用、最容易让商家感知品牌价值，也是第一张可视化模板 | 完整纸张预览、真实缩略图、品牌参数、商品表格、隐藏价格开关 |
| T0.2 | Compact Packing Slip | 系统 fallback，保证没有配置时也能打印 | 高密度表格、SKU / qty 强调、无品牌也可读 |
| T0.3 | Batch Pick List | 覆盖仓库批量拣货，比单订单打印更有业务价值 | 按 SKU 聚合、订单号列表、总数量、货位预留 |
| T0.4 | Custom Production Sheet | 覆盖定制商品场景，是 PrintOps 差异化方向 | 商品图片、custom fields、上传文件、生产备注 |
| T0.5 | Simple Invoice Helper / Paid Receipt Helper | 覆盖客户凭证和 B2B 辅助，但不承诺税务发票 | 金额汇总、付款状态、tax id / PO number 预留、免责声明 |
| T0.6 | Basic Thermal Receipt | 覆盖 80mm 输出和门店自提，但不做设备连接 | 窄幅预览、短字段、无图片、溢出提示 |
| T0.7 | 4x6 Handoff Slip | 有价值但不是首发阻塞项 | 作为 P0.1，先保留尺寸和字段模型 |

#### 默认模板字段策略

| 模板 | 默认显示 | 默认隐藏 | 关键配置 |
|---|---|---|---|
| Branded Packing Slip | Logo、店铺信息、订单号、下单日期、收货地址、商品图片、商品名、SKU、variant、qty、buyer note、页脚感谢语 | 商品价格、税费、付款明细 | 商品图片开关、隐藏价格、页脚文案、退换货说明 |
| Compact Packing Slip | 订单号、收货地址、商品名、SKU、variant、qty、custom fields、buyer note | 商品图片、价格、营销文案 | 高密度表格、SKU / qty 强调、可选商品图片 |
| Batch Pick List | SKU、商品名、variant、总数量、订单号列表、商品图片小图、货位 / bin location | 客户完整地址、价格、付款信息 | 按 SKU 聚合、按订单分组、显示缺货 / 异常提示 |
| Custom Production Sheet | 商品图片大图、商品名、variant、qty、line item custom fields、上传文件、buyer note、internal note、due date | 价格、税费、付款方式 | custom fields 分组、图片大小、备注区、生产确认区 |
| Simple Invoice Helper | 公司 / 店铺信息、账单地址、收货地址、订单号、金额汇总、折扣、税费、total、payment status、tax id、PO number | 商品图片默认隐藏、内部备注 | 税号字段映射、PO number、免责声明文案 |
| Paid Receipt Helper | 店铺信息、订单号、paid status、paid at、payment method、金额汇总、商品名、qty、total | 内部备注、生产字段 | 已付款标识、支付方式、收据感谢语 |
| Basic Thermal Receipt | 店铺名、订单号、时间、客户名 / 电话、商品名、qty、total、payment status、简短备注 | 商品图片、长地址、长政策文案、多列表格 | 80mm 字段裁剪、短字段 label、分页和溢出提示 |
| 4x6 Handoff Slip | 订单号、客户名、电话、收货 / 取货信息、商品数量、简短备注、条码 / 二维码预留 | 金额、税费、长商品明细 | 4x6 尺寸、地址块、交接备注、非承运商面单声明 |

#### P0 默认模板最小可交付定义

| 模板 | 必备区块 | 必备配置 | 必备预览数据 |
|---|---|---|---|
| Branded Packing Slip | Header、Ship to、Order info、Items table、Buyer note、Footer | Logo、品牌色、商品图片、隐藏价格、页脚文案、退换货说明 | 1 个含图片商品、1 个 variant、1 条 buyer note |
| Compact Packing Slip | Order summary、Ship to、Items table、Custom fields、Note | 密度、SKU / qty 强调、商品图片开关、字段排序 | 2 个商品、SKU、variant、custom field |
| Batch Pick List | Batch header、SKU group table、Order refs、Exception note | 按 SKU 聚合、货位字段、缺货提示、排序方式 | 3 个订单、重复 SKU、货位缺失样例 |
| Custom Production Sheet | Product image、Production fields、Uploaded file、Buyer note、Internal note、Approval area | 图片大小、custom fields 分组、备注区、生产确认区 | 1 个定制商品、上传文件、生产说明 |
| Simple Invoice Helper | Company header、Bill to、Ship to、Items / totals、Tax / PO fields、Disclaimer | 金额列、税号、PO number、免责声明文案 | B2B 客户、tax id、折扣、税费 |
| Paid Receipt Helper | Store header、Paid status、Payment summary、Items、Thank-you copy | 支付状态样式、支付方式、收据文案、价格列 | 已付款订单、支付方式、金额汇总 |
| Basic Thermal Receipt | Store header、Order no、Customer short info、Items、Total、Short note | 80mm 字段裁剪、短 label、粗分隔线、溢出提示 | 2 个短商品名、1 个长商品名溢出样例 |
| 4x6 Handoff Slip | Order no、Customer、Phone、Address / pickup、Item count、Handoff note | 4x6 尺寸、地址块、条码 / QR 预留、非面单声明 | 自提或配送交接样例 |

#### 默认模板规则

- 新店铺第一次进入 Template Center 时，系统优先推荐 `Branded Packing Slip`、`Compact Packing Slip`、`Batch Pick List`、`Custom Production Sheet` 四张模板。
- 没有任何店铺模板时，订单打印使用系统内置 fallback：`packing_slip.compact`。
- 每个文档类型只能有一个店铺默认模板。
- `Invoice Helper` 和 `Receipt Helper` 的文案必须避免承诺合法税务发票；默认说明为“用于订单凭证和内部辅助，不替代本地税务发票”。
- `Thermal Receipt` 只做浏览器 / PDF 预览和 80mm 版式，不做打印机连接、自动出单或设备状态。
- P0 默认模板都必须支持样例订单预览、真实订单预览、PDF 生成和 Browser print。
- P0 默认模板都必须生成真实缩略图，Template Library 卡片不能只用图标。

## 5. 模板信息架构

### 5.1 主菜单

```text
PrintOps
├── Orders
├── Templates
│   ├── My Templates
│   └── Template Library
├── Print History
└── Settings
```

`Templates` 是 P0 主菜单。`Fields` 暂放在 Settings 和 Template Editor 内，不在 P0 作为主菜单独立暴露。

### 5.2 页面路径

```text
/apps/printops/templates
/apps/printops/templates/new
/apps/printops/templates/:templateId
/apps/printops/templates/:templateId/edit
/apps/printops/templates/library
/apps/printops/templates/library/:libraryTemplateId
```

P0 可以先用 drawer 或同页 panel 完成创建 / 编辑，但数据结构和路由命名按独立页面预留。

## 6. Template Center 需求

### 6.1 页面结构

```text
Template Center
├── Header
│   ├── Current store
│   ├── Search templates
│   └── Create template
├── Tabs
│   ├── My Templates
│   └── Template Library
├── Filters
│   ├── Document type
│   ├── Paper size
│   ├── Language
│   ├── Scenario
│   └── Status
├── Template cards / list
├── Template detail / preview panel
└── Empty, loading and error states
```

### 6.2 My Templates

P0 功能：

- 显示当前店铺模板。
- 支持搜索模板名称、文档类型、场景标签。
- 支持按文档类型、纸张尺寸、语言、状态筛选。
- 支持卡片视图，卡片中展示模板缩略图、名称、文档类型、纸张尺寸、状态、默认标识。
- 支持进入模板详情。
- 支持进入模板编辑器。
- 支持复制当前店铺模板。
- 支持删除非默认模板。
- 支持设为某个文档类型的默认模板。
- 模板被历史 print job 使用过时，删除前需要二次确认。

### 6.3 Template Library

P0 功能：

- 提供系统内置模板库。
- 内置模板以视觉卡片展示，缩略图必须体现真实版式，不只显示图标或模板名称。
- 支持按文档类型筛选：All、Packing Slip、Pick List、Production Sheet、Invoice Helper、Receipt Helper、Thermal Receipt。
- 支持按场景筛选：Fulfillment、Picking、Production、Customer Documents、Finance Helper、Store / POS。
- 支持按纸张筛选：A4、Letter、4x6、80mm。
- 支持查看模板依赖字段，如 tax id、pickup time、custom fields、product image。
- 支持 `Use this template`，将内置模板复制为当前店铺模板。
- 复制时确认模板名称、纸张尺寸、默认打印语言和字体。
- 内置模板不可直接修改。
- 内置模板更新不自动覆盖商家已复制模板。

### 6.4 模板详情

模板详情展示：

- 模板名称、说明、文档类型、场景、受众。
- 纸张尺寸、方向、边距、密度、默认语言、默认字体。
- 来源：Built-in、Store copy、Duplicated。
- 状态：Draft、Ready。
- 是否默认模板。
- 数据依赖和字段映射提醒。
- 校验结果：字段缺失、图片失败、文本溢出、字体风险。
- 样例订单预览。
- 真实订单预览入口。

P0 允许从详情页进入编辑器和生成测试预览。测试预览不改变订单打印状态。

## 7. Template Editor 需求

### 7.1 P0 编辑器定位

P0 编辑器采用 Vify 式配置体验：

```text
Choose base template
↓
Configure template params
↓
Preview with sample or real order
↓
Save as Draft / Ready
↓
Set as default
```

P0 不做自由画布，不做复杂拖拽，不做任意 HTML / CSS 编辑。

### 7.2 推荐界面结构

```text
Template Editor
├── Top bar
│   ├── Template name
│   ├── Status
│   ├── Preview order selector
│   ├── Save draft
│   └── Save / Set ready
├── Left panel
│   ├── Basic
│   ├── Brand
│   ├── Layout
│   ├── Fields
│   ├── Items table
│   ├── Text
│   └── Validation
├── Center preview
│   ├── Paper preview
│   ├── Zoom controls
│   └── Page / overflow hints
└── Right panel
    ├── Current section settings
    ├── Field mapping hints
    └── Language preview
```

P0 可以先合并左右面板，做成 drawer 或双栏配置；但必须保留上述信息分组。

### 7.3 P0 配置项

Basic：

- 模板名称。
- 模板说明。
- 文档类型。
- 场景标签。
- 受众。
- 状态：Draft / Ready。

Brand：

- Logo 显示 / 隐藏。
- Logo 位置。
- 店铺名显示 / 隐藏。
- 店铺地址显示 / 隐藏。
- 品牌主色。
- 辅助色。
- 默认字体。

Layout：

- Paper size：A4、Letter、4x6、80mm。
- Orientation：P0 默认 Portrait，字段预留 Landscape。
- Margin preset：Normal、Compact、Narrow。
- Density：Comfortable、Compact。
- Layout preset：Branded、Compact、Table-first、Thermal。

Fields：

- 订单号显示 / 隐藏。
- 下单日期显示 / 隐藏。
- 客户信息显示 / 隐藏。
- Shipping address 显示 / 隐藏。
- Billing address 显示 / 隐藏。
- Buyer note 显示 / 隐藏。
- Internal note 显示 / 隐藏。
- Custom fields 显示 / 隐藏。
- 字段 label 自定义。
- 字段排序。

Items table：

- 商品图片显示 / 隐藏。
- 商品名称显示 / 隐藏。
- SKU 显示 / 隐藏。
- Variant / options 显示 / 隐藏。
- Quantity 显示 / 隐藏。
- Price 显示 / 隐藏。
- Discount 显示 / 隐藏。
- Tax 显示 / 隐藏。
- Line item custom fields 显示 / 隐藏。
- 列排序。

Text：

- 页眉固定文案。
- 页脚固定文案。
- 感谢语。
- 退换货说明。
- 客服联系方式。
- 礼品订单文案。

Validation：

- 必填字段缺失提示。
- 图片加载失败提示。
- 文本过长提示。
- 字体缺字风险提示。
- 80mm 宽度溢出提示。
- 字段映射缺失提示。

### 7.4 保存规则

- Draft 模板可以保存和预览。
- Ready 模板必须通过关键校验。
- 只有 Ready 模板可以设为默认模板。
- 内置模板不能被直接编辑，必须先复制为当前店铺模板。
- 保存时生成结构化 JSON，不保存为单一 HTML 字符串。
- 每次保存记录 `schema_version`。
- 切换店铺时清空未保存编辑状态，或提示用户保存草稿。

## 8. 模板数据模型

### 8.1 分层结构

模板不是一张静态图片，也不是一段 HTML。模板由四层组成：

```text
Base Template
↓
Template Params
↓
Component Tree
↓
Field Binding / Render Context
```

| 层 | 说明 |
|---|---|
| Base Template | 系统内置或模板包提供的风格基底，如 Leopard、Wolf、Minimal、Thermal |
| Template Params | 商家配置的品牌、尺寸、字段开关、文案和密度 |
| Component Tree | section、block、field、table、media 等组件结构 |
| Field Binding | 组件绑定 Field Registry 中的可打印字段 |

### 8.2 核心字段

```text
templates
- id
- organization_id
- store_id
- source_template_id
- base_template_key
- name
- description
- document_type
- template_family
- category
- scenario_tags
- audience
- scope
- customization_level
- paper_size
- default_language
- default_font
- status
- thumbnail_url
- validation_status
- validation_summary
- schema_version
- design_tokens
- template_params
- component_tree
- advanced_code
- created_by
- created_at
- updated_at
```

`customization_level`：

| 值 | 说明 | 阶段 |
|---|---|---|
| preset | 仅使用内置模板，不做深度配置 | P0 |
| parameterized | 参数化配置，P0 默认能力 | P0 |
| component | 组件级编辑 | P1 |
| block | 内容块和条件显示 | P2 |
| code | 高级代码模式 | P2 / P3 |

### 8.3 Template JSON 示例

```json
{
  "schemaVersion": "1.0",
  "baseTemplateKey": "leopard.invoice.a4",
  "customizationLevel": "parameterized",
  "documentType": "packing_slip",
  "paper": {
    "size": "A4",
    "orientation": "portrait",
    "marginPreset": "normal"
  },
  "designTokens": {
    "primaryColor": "#111111",
    "accentColor": "#0f766e",
    "fontFamily": "Inter",
    "density": "comfortable"
  },
  "templateParams": {
    "logoPlacement": "header_left",
    "showPrices": true,
    "showProductImages": true,
    "footerMessage": {
      "default": "Thank you for your order.",
      "zh-Hant": "感謝您的訂購。"
    }
  },
  "componentOverrides": [
    {
      "componentId": "line-items-table",
      "visible": true,
      "columns": ["image", "name", "sku", "quantity", "price"]
    }
  ]
}
```

## 9. Field Registry 与数据上下文

模板组件不能直接读取 Wix / Shopify / WooCommerce 原始 payload。模板只能读取 `Template Render Context` 中的数据，并通过 `Field Registry` 绑定字段。

数据链路：

```text
Raw Source Payload
↓
Field Mapping
↓
Normalized Order Model
↓
Field Registry
↓
Template Render Context
↓
Template Components
```

P0 数据域：

| 数据域 | 示例 |
|---|---|
| store | 店铺名、logo、地址、电话、邮箱、品牌色 |
| order | 订单号、下单时间、订单状态、订单备注 |
| customer | 姓名、邮箱、电话、公司、tax id |
| addresses | shipping address、billing address、pickup location |
| line_items | 商品名、SKU、variant、数量、价格、图片、custom fields |
| payment | subtotal、shipping、discount、tax、total、payment status |
| fulfillment | shipping、pickup、delivery、fulfillment status |
| custom_fields | checkout extra fields、buyer note、gift note、上传文件 |
| template | 文档类型、纸张尺寸、语言、字体、边距、密度 |

字段要求：

- 字段必须有唯一 key。
- 字段必须有多语言 label fallback。
- 字段必须声明类型、来源、是否可打印、样本值和缺失策略。
- 涉及姓名、电话、地址、邮箱、税号、上传文件的字段必须标记隐私等级。
- 没有真实订单时，预览使用 Field Registry 的 sample value。

## 10. AI-ready 底层要求

P0 不做 AI 生成功能，但模板底层必须支持后续 AI Template Designer。AI 生成模板的输出必须进入普通模板编辑器和同一条预览 / PDF / 浏览器打印链路。

AI 后续允许生成：

| 输出 | 说明 |
|---|---|
| `design_tokens` | 品牌色、辅助色、字体建议、字号层级、边框、间距 |
| `template_params` | 纸张、密度、logo 位置、字段开关、文案建议 |
| `component_tree` | section、block、field、table、media 组件结构 |
| `field_binding_suggestions` | 基于 Field Registry 的字段绑定建议 |
| `localized_text` | 多语言固定文案草稿 |
| `validation_summary` | 缺字段、分页、字体、图片和隐私风险提示 |

AI 后续不允许：

- 不生成不可编辑的静态图片作为最终模板。
- 不直接写入任意生产 HTML / CSS。
- 不直接绑定平台 raw payload。
- 不跳过 Field Registry、Template Render Context 和 Validation Service。
- 不自动设为默认模板。
- 不自动修改订单、客户、商品、税务或发货数据。
- 不承诺税务合规发票。

P0 需要预留的底层能力：

- 模板 JSON 必须有 `schemaVersion`，支持未来 AI 生成版本迁移。
- 模板必须有 `baseTemplateKey`，AI 草稿可以使用 `ai.generated` 或推荐一个内置 base template。
- 模板必须有 `customizationLevel`，AI 草稿初始为 `parameterized` 或 `component`。
- 模板必须保存 `designTokens`、`templateParams`、`componentOverrides` 或 `componentTree`。
- Field Registry 必须提供字段 label、sample value、字段类型、隐私等级和可打印性。
- 预览必须支持 sample order，让 AI 草稿不依赖真实订单也能展示。
- Validation 必须能对 AI 草稿输出 warning / error。
- AI 草稿只能保存为 Draft，用户确认后才能 Ready。

建议未来流程：

```text
Upload brand image / document screenshot
↓
AI extracts visual intent and data needs
↓
AI generates template draft JSON
↓
Validation Service checks fields, layout, privacy and language
↓
User reviews in Template Editor
↓
User saves Draft or marks Ready
```

## 11. 多语言要求

PrintOps 需要区分站点语言和打印语言。

| 类型 | 影响范围 | P0 要求 |
|---|---|---|
| Site Locale | 后台 UI、菜单、按钮、提示 | English、繁体中文 |
| Print Locale | 模板标题、字段 label、固定文案、PDF / 浏览器打印输出 | English、繁体中文、German、Dutch、French、Spanish |

规则：

- 站点语言切换不改变模板默认打印语言。
- 打印语言切换不自动翻译订单原始数据。
- 模板固定文案使用 localized text map 保存。
- 字段 label 优先读取模板配置，没有配置时回退 Field Registry label。
- P0 不提供独立 Reading order 设置，模型预留 direction。
- RTL 语言 P1 再做真实语言包和 PDF 验证。

## 12. 模板尺寸要求

P0 支持：

| 尺寸 | 场景 |
|---|---|
| A4 | Packing Slip、Production Sheet、Invoice Helper |
| Letter | 北美商家常见打印 |
| 4x6 | 简短取货 / 配送单、标签类预留 |
| 80mm | Thermal Receipt、小票、门店票据 |

规则：

- 尺寸是模板属性，不是打印时才临时选择。
- 80mm 不是 A4 缩小版，需要独立 layout preset。
- 纸张尺寸影响字体大小、边距、列数量、图片大小和分页策略。
- 预览必须显示当前纸张尺寸。
- P0 不读取实体打印机纸张，不做按打印机自动切换模板。

## 13. P0 不做范围

- 不做模板市场购买。
- 不做组织共享模板。
- 不做模板复制到其他店铺。
- 不做模板版本管理。
- 不做复杂拖拽式设计工具。
- 不做任意 HTML / CSS 编辑。
- 不做代码模板或 Liquid-like 语法。
- 不做 AI 图片生成模板功能，但底层 schema 必须 AI-ready。
- 不做打印机配置和连接。
- 不做发货平台对接和 tracking 回写。
- 不承诺合法税务发票或电子发票合规能力。

## 14. P0 验收标准

Template Center：

- 新店铺没有模板时，可以看到 Template Library 推荐入口。
- 商家可以从 Template Library 复制一个 Packing Slip 模板到 My Templates。
- 商家可以搜索、筛选模板。
- 商家可以查看模板预览和字段依赖。
- 商家可以设置某个文档类型的默认模板。
- 内置模板不能被直接编辑。

Template Editor：

- 商家可以修改模板名称、文档类型、纸张、默认打印语言和字体。
- 商家可以配置 logo、品牌色、店铺信息、页眉页脚。
- 商家可以开关订单字段、地址字段和商品表格列。
- 商家可以自定义字段 label 和固定文案。
- 商家可以使用样例订单预览模板。
- 商家可以选择真实订单预览模板。
- 模板保存后生成结构化 JSON。
- Draft 模板可以保存但不能设为默认。
- Ready 模板可以设为默认，并被 Orders 打印流程读取。
- 字段缺失、图片失败、文本溢出和字体风险能在编辑器中提示。

多语言：

- 后台 UI 语言可以在 English / 繁体中文之间切换。
- 模板默认打印语言可以独立选择。
- 打印预览中的固定文案跟随 print locale。
- 订单数据原值不被自动翻译。

AI-ready 底层：

- 模板保存结构中存在 `designTokens`、`templateParams` 和组件结构字段。
- Field Registry 提供 sample value 和隐私等级。
- 模板草稿可以用 sample order 预览。
- Validation 可以对结构化模板草稿返回 warning / error。

## 15. 开发优先级

### Milestone T1：模板中心骨架

- My Templates / Template Library tabs。
- 搜索和筛选。
- 模板卡片和详情预览。
- Use this template。
- 当前店铺隔离。

### Milestone T2：P0 配置编辑器

- Basic / Brand / Layout / Fields / Items table / Text 配置。
- 样例订单预览。
- 保存 Draft / Ready。
- 设置默认模板。

### Milestone T3：结构化模板引擎准备

- `base_template_key`。
- `template_params`。
- `component_tree`。
- `Field Registry`。
- `Template Render Context`。
- 校验 warning。
- AI-ready template draft schema。
- Sample order preview context。

### Milestone T4：订单打印链路接入

- Orders 选择模板。
- 批量打印读取默认模板。
- Browser print / PDF 复用同一模板结构。
- Print History 记录 template id、template version、print locale。

## 16. 后续拓展

P1：

- Documint 式组件、变量、循环。
- Repeat component：line items、shipments、refund items。
- 模板版本。
- 条码 / 二维码。
- 模板复制到其他店铺。
- 多语言文案完整性检查。

P2：

- Beefree 式内容块库。
- 条件显示。
- 模板片段。
- 导入 / 导出。
- 高级代码模式。

P3：

- Printout Designer 式高级拖拽。
- 精细坐标和特殊纸张。
- AI Template Designer。
- AI 根据品牌图片、现有单据截图、模板风格图生成结构化模板草稿。
- AI 根据 Field Registry 推荐字段绑定和缺失字段补充。
- Agency / 白标模板分发。

## 17. 待确认问题

- P0 是否只允许从内置模板创建，还是同时保留空白模板？
- P0 是否需要独立模板详情页，还是先用右侧详情面板？
- Ready 模板的最小校验规则是什么？
- 80mm 模板是否在 P0 做完整预览，还是先作为数据结构和样式预设？
- 模板缩略图由设计稿静态生成，还是由渲染引擎动态截图生成？
- 模板删除后历史 print job 是否保留模板快照？
- 内置模板更新时，是否提供“一键升级基底模板”的合并能力？
