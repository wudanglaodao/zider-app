# Zider PrintOps 总览、范围与角色

版本：v0.2
更新日期：2026-06-23
来源：从 [Zider PrintOps 产品需求文档](../order-printing-product-requirements.md) 按模块拆分
模块说明：产品定位、目标、命名、应用路径、界面结构、平台范围和用户角色。
## 1. 产品概述

Zider PrintOps 为电商商家提供一个订单文档生成与打印工作台，把订单数据转换成商家履约、生产、打包、财务和门店作业需要的文档。

首发从 Wix Stores 订单打印切入。底层功能按多平台订单打印引擎设计，后续可扩展到 WordPress / WooCommerce、Shopify、CSV 导入和 Direct API。Wix Restaurants / 餐饮场景暂缓，不进入当前需求范围。

核心能力：

- 拉取和同步订单。
- 标准化订单字段。
- 配置订单文档模板。
- 映射并打印订单自定义字段。
- 提供基础文档类型：Packing Slip、Pick List、Production Sheet、Invoice Helper、Receipt Helper、Thermal Receipt。
- 生成打印预览和 PDF。
- 批量打印和记录打印任务。
- 支持多语言、字体和 A4 纸张尺寸；热敏小票和更多纸张尺寸后续独立规划。

## 2. 产品目标

### 2.1 商家目标

- 快速筛选、预览和批量打印订单文档。
- 控制不同文档显示哪些订单字段。
- 把 custom fields、checkout extra fields、buyer note、variant、SKU、图片、上传文件等关键信息打印出来。
- 为不同订单场景选择不同打印模板。
- 为不同国家、客户、门店或内部流程选择不同打印语言。
- 通过字体和页面校验减少乱码、缺字、换行异常、漏字段和错发货。
- 记录打印状态，减少重复打印和漏打。

### 2.2 产品目标

- P0 成为 Wix Stores 商家的订单打印与生产单工具。
- 建立标准订单模型、字段映射模型、模板模型和 print job 模型。
- 用无代码配置覆盖大部分模板和字段需求。
- 支持一个商家组织管理多个店铺，订单、模板、字段映射和打印记录按店铺隔离。
- 为 WooCommerce、Shopify 和发货平台预留后续扩展点；餐饮 / Wix Restaurants 先不进入近期规划。

### 2.2.1 P0 安装与账号策略

第一版以 Wix 安装路径优先：

- Wix 安装 PrintOps 后先创建 pending installation，并解析当前 app instance。
- 不强制商家先注册 Zider Account。
- 商家可以直接在 Wix 内使用订单同步、模板、PDF 下载和打印。
- Wix 站点资料优先作为店铺和模板默认值，包括店铺名、网站、邮箱、logo、语言、时区和货币。
- Settings > Account binding 引导商家使用 Wix owner email 或手动邮箱发送验证码。
- 邮箱验证通过后才创建或绑定 ZIDER member、workspace 和 connected store。
- 官网注册入口保留，后续作为统一用户中心入口。
- Wix 用户和官网用户的合并必须通过邮箱验证、Google 登录或 Wix 授权身份确认，不根据邮箱、域名或店铺名自动合并。

### 2.3 竞品调研转化原则

基于 Shopify 热门订单打印工具调研，第一版需求按以下原则优化：

- Invoice、Receipt、Packing Slip、PDF、批量打印、模板自定义、品牌样式是基础门槛，需要在 P0 覆盖。
- Order custom fields、checkout extra fields 是 P0 必须接住并打印的核心能力；Product / variant fields、metafields 也要在 P0 预留模型，P1 完善产品同步和产品打印字段。
- 多语言、多币种、税号、PO number、文件命名、批量 ZIP 是成长型商家的常见需求，P0 建模，P1 做成可配置能力。
- B2B、税务合规、电子发票、自动邮件、客户下载链接和发货回写是后续高级方向，不进入 P0。
- 我们的早期差异化不是“合规发票系统”，而是 Wix custom fields、产品打印字段、Production Sheet、80mm 热敏模板和多店铺订单打印工作台。

### 2.3.1 模板设计调研结论

基于 Shopify Order Printer、Order Printer Pro、Vify、Order Printer Templates、OrderlyPrint、Sufio 和 WooCommerce PDF Invoices & Packing Slips 等同类产品调研，模板能力应从“单个发票样式”升级为“业务单据模板体系”。

调研转化：

- 成熟订单打印工具会覆盖多种文档类型，不只覆盖 invoice。常见模板族包括 invoice、receipt、packing slip、pick list、return form、refund / credit note、quote / pro forma、gift receipt、thermal receipt。
- 模板编辑能力通常分三层：无代码样式配置、字段 / 区块显示配置、高级代码或 HTML / CSS / Liquid 配置。我们 P0 只做前两层，但底层必须用组件化 JSON 保存。
- 商家最常见的模板差异不是“好不好看”，而是业务字段不同：B2B 税号、PO number、礼品订单隐藏价格、仓库拣货字段、定制商品生产字段、退货说明、门店取货时间。
- 订单模板需要同时服务客户外部文档和内部作业文档，两类模板的视觉优先级不同。客户文档重视品牌、金额、政策和联系方式；内部文档重视 SKU、数量、位置、备注、生产图片和异常提示。
- 模板库应按业务场景和文档类型双维度组织，不能只按纸张尺寸或模板名称展示。
- Order Printer Templates 这类产品的模板中心偏“视觉卡片库”：用大缩略图展示设计风格，并通过 Invoice designs、Packing Slip designs、Returns Form designs、Gift Receipt designs 等分类快速筛选。我们的 Template Library 也需要保留视觉浏览体验，不能只做后台表格。
- Vify 这类产品更接近“内置风格模板 + 选用 / 应用 + 编辑”的工作流，适合我们 P0 参考：先让商家选择一个成熟的视觉模板，再通过受控参数完成品牌、字段、尺寸和文案调整。
- 大部分竞品把自动邮件、下载链接、税务合规、电子发票作为高级能力。我们 P0 不进入这些能力，但模板模型要预留 customer-facing、downloadable、emailable、tax-related 等标识。
- 热敏小票和标签类模板不是 A4 模板缩小版，需要独立尺寸、密度、分页和字段裁剪规则。

调研参考：

- Shopify Order Printer 支持通过模板输出 invoices、packing slips 和 returns forms，并允许自定义模板。
- Shopify packing slip 模板可编辑，适合验证基础字段和品牌信息的默认能力。
- Order Printer Pro、Vify、Sufio 等产品强化 PDF invoice、packing slip、quote、refund / credit note、多语言、多币种和自动发送。
- Order Printer Templates、OrderlyPrint 等产品强调无代码模板、批量打印、pick / pack / invoice 工作流。
- WooCommerce PDF Invoices & Packing Slips 生态里常见 document types 包括 invoice、packing slip、proforma、credit note 和 delivery note。

调研来源：

- Shopify Order Printer：https://help.shopify.com/en/manual/fulfillment/managing-orders/printing-orders/shopify-order-printer
- Shopify Packing Slips：https://help.shopify.com/en/manual/fulfillment/managing-orders/packing-slips
- Order Printer Pro：https://apps.shopify.com/order-printer-pro
- Vify Order Printer：https://apps.shopify.com/vify-order-printer
- Order Printer Templates：https://apps.shopify.com/order-printer-templates
- OrderlyPrint：https://apps.shopify.com/orderlyprint
- Sufio：https://sufio.com/shopify/invoice/
- WooCommerce PDF Invoices & Packing Slips：https://wordpress.org/plugins/woocommerce-pdf-invoices-packing-slips/

### 2.3.2 AI 图片生成模板需求分析

后续可拓展 `AI Template Designer`：用户上传品牌图片、现有发票 / 小票截图、包装设计、logo、店铺视觉参考图或竞品模板截图，系统自动识别视觉风格并生成可编辑的订单打印模板。

产品判断：

- 这不是 P0 必做能力，但它可以成为 PrintOps 的长期差异化：竞品多提供固定模板库，我们可以从“选择模板”升级到“根据商家品牌自动生成模板”。
- AI 输出不能是一张静态图片，也不能直接输出不可控 HTML / CSS。AI 必须生成结构化模板 JSON、设计 token、组件树和字段绑定建议。
- AI 生成结果应进入 Template Editor，由用户确认、编辑、预览和保存后才能成为 My Templates。
- AI 适合解决“模板好看但不会设计”的问题，不应替代字段映射、订单数据校验、PDF 渲染和打印分页规则。
- 上传图片可能包含客户信息、订单号、地址、电话等敏感数据，需要在交互上提示用户，并在系统上支持临时处理、权限控制和可删除记录。

典型输入：

- 品牌 logo、店铺 banner、包装图片、产品吊牌。
- 现有 invoice、packing slip、receipt、return form 截图或 PDF 首页。
- 商家喜欢的模板风格截图。
- 线下门店小票、标签纸照片。
- 网站首页或产品页截图，用于提取品牌色、字体气质和留白比例。

AI 可生成内容：

- 品牌色、辅助色、灰阶、边框、分割线、状态色等设计 token。
- logo 位置、页眉、页脚、地址块、商品表格、金额汇总、备注区、政策文案区。
- 文档类型建议，如 Invoice Helper、Packing Slip、Gift Receipt、Thermal Receipt。
- 纸张尺寸建议，如 A4、Letter、4x6、80mm。
- 字体和字号层级建议。
- 字段显示建议和字段缺失提醒。
- 2-3 个模板草稿方案，供用户选择后进入编辑器。

AI 不应自动完成的内容：

- 不自动发布或替换默认模板。
- 不承诺税务合规发票设计。
- 不自动改写订单、客户、商品或税务数据。
- 不绕过模板校验、字段映射和打印预览。
- 不生成任意不受控 CSS 直接进入生产渲染链路。

### 2.4 产品命名与应用路径

推荐产品名：`Zider PrintOps`。

对外表达：

- 完整名称：`Zider PrintOps`。
- 短名称：`PrintOps`。
- 中文说明：订单打印与履约文档工作台。
- 核心心智：不只是打印发票，而是把订单变成仓库、生产、打包、门店和财务可执行的文档。

命名理由：

- `Print` 明确当前 P0 的订单打印主场景。
- `Ops` 承接后续 Production Sheet、Pick List、多店铺、发货信息、履约协同等扩展。
- 相比 `Order Printer`，`PrintOps` 更像一个可长期经营的应用品牌。
- 在 Zider 后续多应用体系中，可以形成 `Zider PrintOps`、`Zider ShipOps`、`Zider Fields` 等命名家族。

应用路径：

```text
/apps/printops
```

路径原则：

- 所有独立应用统一放在 `/apps/:appSlug` 下。
- 当前应用 slug 使用 `printops`。
- 取消早期开发入口 `/order-printer`，不做兼容跳转。
- 后续新增应用继续使用同级路径，如 `/apps/shipops`、`/apps/automations`、`/apps/fields`。
- API 路径也按应用收敛，使用 `/api/apps/printops/...`。

### 2.5 界面结构原则

P0 界面应围绕订单打印闭环展开，默认入口优先进入 Orders，而不是 Overview。

P0 主菜单：

```text
PrintOps
├── Orders
├── Templates
├── Settings
├── Help
└── Support
```

P0 菜单命名原则：

- `Store Switcher` 是全局上下文，不作为普通菜单项。
- `Orders` 是第一工作入口，承接筛选、批量选择、预览、生成 PDF 和浏览器打印。
- `Templates` 内部使用 `My Templates` 和 `Template Library`，不要用偏技术的 `Store templates / Built-in library` 作为用户主表达。
- `Print Jobs` / `Print History` 当前不做主菜单，内部仍可保留 print job 或打印状态数据模型。
- `Field Mapping` 对外命名为 `Fields`，P0 放在 Settings 和 Template Editor 内，P1 再独立为主菜单。
- `Products` 对外优先命名为 `Product Fields`，避免让用户误解为商品管理系统。
- P0 不设置 `Invoices`、`Printers`、`Shipments`、`Order Types` 主菜单。
- `Support` 使用邮件入口，当前跳转 `mailto:support@zider.ink`。

P1 主菜单扩展：

```text
PrintOps
├── Store Switcher
├── Orders
├── Product Fields
├── Templates
├── Fields
├── Print History
└── Settings
```

Overview 可以作为轻量工作台或后续 all stores 汇总页，但不应阻断第一版用户从订单进入打印流程。

## 3. 平台范围

| 平台 / 来源 | 阶段 | 功能范围 |
|---|---|---|
| Wix Stores | P0 | 最新订单同步、最近 7 天历史订单手动同步、模板、字段映射、PDF、浏览器打印、打印状态 |
| Wix Products | P1 | 产品同步、变体同步、产品级打印字段、变体级打印字段 |
| WordPress / WooCommerce | P2 | WooCommerce 订单、order meta、checkout fields、插件字段映射 |
| Wix Restaurants | Deferred | 餐饮订单、厨房票、取餐票、配送票、80mm 热敏票暂缓，后续单独评估 |
| 发货平台 / Shipping Platform | P3 | 发货单同步、tracking number、label、fulfillment 回写 |
| Shopify | P3 | Shopify 订单、metafields、fulfillment、POS / 多店铺模板复用 |
| CSV 导入 | P2 | 上传订单表、字段映射、批量生成文档 |
| Direct API | P3 | 外部系统通过 API 创建订单、生成 PDF、创建打印任务 |

## 4. 用户角色

| 角色 | 目标 | 典型操作 |
|---|---|---|
| 店主 / 运营 | 快速处理订单，减少手工步骤 | 筛选订单、批量生成 PDF、查看打印状态 |
| 仓库人员 | 拣货、打包、复核 | 打印 packing slip、pick list、mark as printed |
| 生产人员 | 根据定制信息制作商品 | 打印 production sheet、查看图片/尺寸/设计备注 |
| 门店员工 | 处理自提、线下付款、POS 订单 | 打印取货单、小票、客户订单说明 |
| 会计 / 财务 | 导出订单凭证 | 批量下载 invoice / receipt，检查 VAT / Tax ID |
| 多语言商家 | 面向不同国家客户出单 | 选择打印语言、维护模板翻译、设置字体 |
| 多店铺运营 | 管理多个平台或多个门店订单 | 切换店铺、复用模板、按平台查看打印状态 |
| 系统集成商 / Agency | 帮客户接入订单打印流程 | 配置字段映射、模板、API 或插件 |
