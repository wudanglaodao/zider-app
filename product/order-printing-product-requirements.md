# 订单打印产品需求文档

版本：v0.4
更新日期：2026-05-25
文档类型：功能需求说明
当前范围：Wix Stores 首发，优先覆盖订单模板、字段映射、自定义样式、预览、PDF 和浏览器打印

## 1. 产品概述

订单打印产品为电商商家提供一个订单文档生成与打印工作台，把订单数据转换成商家履约、生产、打包、财务和门店作业需要的文档。

首发从 Wix Stores 订单打印切入。底层功能按多平台订单打印引擎设计，后续可扩展到 WordPress / WooCommerce、Shopify、Wix Restaurants、CSV 导入和 Direct API。

核心能力：

- 拉取和同步订单。
- 标准化订单字段。
- 配置订单文档模板。
- 映射自定义字段。
- 提供基础文档类型：Packing Slip、Pick List、Production Sheet、Invoice Helper、Receipt Helper、Thermal Receipt。
- 生成打印预览和 PDF。
- 批量打印和记录打印任务。
- 支持多语言、字体、纸张尺寸和热敏小票。

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
- 为 WooCommerce、Shopify、Wix Restaurants 和发货平台预留后续扩展点。

### 2.3 竞品调研转化原则

基于 Shopify 热门订单打印工具调研，第一版需求按以下原则优化：

- Invoice、Receipt、Packing Slip、PDF、批量打印、模板自定义、品牌样式是基础门槛，需要在 P0 覆盖。
- Product / variant fields、order custom fields、metafields 是高价值能力，P0 预留模型，P1 完善产品同步和产品打印字段。
- 多语言、多币种、税号、PO number、文件命名、批量 ZIP 是成长型商家的常见需求，P0 建模，P1 做成可配置能力。
- B2B、税务合规、电子发票、自动邮件、客户下载链接和发货回写是后续高级方向，不进入 P0。
- 我们的早期差异化不是“合规发票系统”，而是 Wix custom fields、产品打印字段、Production Sheet、80mm 热敏模板和多店铺订单打印工作台。

## 3. 平台范围

| 平台 / 来源 | 阶段 | 功能范围 |
|---|---|---|
| Wix Stores | P0 | 订单同步、模板、字段映射、PDF、浏览器打印、打印状态 |
| Wix Products | P1 | 产品同步、变体同步、产品级打印字段、变体级打印字段 |
| WordPress / WooCommerce | P2 | WooCommerce 订单、order meta、checkout fields、插件字段映射 |
| Wix Restaurants | P1.5 / P2 | 餐饮订单、厨房票、取餐票、配送票、80mm 热敏票 |
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
| 餐饮门店员工 | 处理取餐、配送、堂食、厨房分单 | 打印 kitchen ticket、pickup ticket、delivery ticket |
| 会计 / 财务 | 导出订单凭证 | 批量下载 invoice / receipt，检查 VAT / Tax ID |
| 多语言商家 | 面向不同国家客户出单 | 选择打印语言、维护模板翻译、设置字体 |
| 多店铺运营 | 管理多个平台或多个门店订单 | 切换店铺、复用模板、按平台查看打印状态 |
| 系统集成商 / Agency | 帮客户接入订单打印流程 | 配置字段映射、模板、API 或插件 |

## 5. 标准订单模型

模板系统只读取标准订单模型，不直接绑定平台原始字段。平台原始字段通过字段映射进入标准字段或自定义字段。

### 5.1 基础字段

| 字段 | 说明 |
|---|---|
| `organization_id` | 商家组织 ID |
| `store_id` | 系统内店铺 ID |
| `source_platform` | 订单来源，如 wix、woocommerce、shopify、csv、api |
| `source_store_id` | 来源店铺 ID |
| `source_order_id` | 平台原始订单 ID |
| `display_order_number` | 商家和客户看到的订单号 |
| `order_date` | 下单时间 |
| `updated_at` | 订单数据更新时间 |
| `currency` | 订单币种 |
| `tags` | 平台标签和内部标签 |
| `purchase_order_number` | PO number，如平台、B2B 或自定义字段可提供 |
| `customer_locale` | 订单或客户语言区域，如 en-US、zh-TW、de-DE |

### 5.2 客户字段

| 字段 | 说明 |
|---|---|
| `customer.name` | 客户姓名 |
| `customer.email` | 邮箱 |
| `customer.phone` | 电话 |
| `customer.company` | 公司名 |
| `customer.tax_id` | VAT ID / Tax ID |
| `customer.language` | 客户语言偏好，如平台可提供 |

### 5.3 地址字段

| 字段 | 说明 |
|---|---|
| `shipping_address` | 收货地址 |
| `billing_address` | 账单地址 |
| `pickup_location` | 自提地点 |
| `delivery_address` | 本地配送地址 |

### 5.4 商品字段

| 字段 | 说明 |
|---|---|
| `line_items[].source_product_id` | 平台商品 ID |
| `line_items[].source_variant_id` | 平台变体 ID |
| `line_items[].title` | 商品名称 |
| `line_items[].sku` | SKU |
| `line_items[].variant` | Variant，如尺码、颜色 |
| `line_items[].quantity` | 数量 |
| `line_items[].price` | 单价 |
| `line_items[].discount` | 折扣 |
| `line_items[].tax` | 税 |
| `line_items[].image_url` | 商品图片 |
| `line_items[].options` | 商品选项 |
| `line_items[].fulfillment_source` | 履约来源 |
| `line_items[].custom_fields` | 商品级自定义字段 |
| `line_items[].product_print_fields` | 从产品资料合并进来的打印字段 |

### 5.4.1 产品资料模型

产品资料用于补充订单行信息。P0 可只使用订单行自带商品信息；P1 支持同步产品目录，并允许商家在我们系统内为产品或变体添加打印专用字段。

| 字段 | 说明 |
|---|---|
| `products[].store_id` | 所属店铺 |
| `products[].source_product_id` | 平台商品 ID |
| `products[].title` | 商品名称 |
| `products[].sku` | 默认 SKU |
| `products[].image_url` | 商品主图 |
| `products[].options` | Wix product options |
| `products[].custom_text_fields` | Wix custom text fields，如个性化文字 |
| `products[].variants` | 变体列表 |
| `products[].print_fields` | 我们系统内维护的产品级打印字段 |
| `products[].sync_status` | 同步状态 |
| `products[].updated_at` | 产品资料更新时间 |

变体资料：

| 字段 | 说明 |
|---|---|
| `variants[].source_variant_id` | 平台变体 ID |
| `variants[].sku` | 变体 SKU |
| `variants[].barcode` | 条码 / GTIN |
| `variants[].options` | 尺码、颜色、材质等选项 |
| `variants[].image_url` | 变体图片，如平台可提供 |
| `variants[].weight` | 重量 |
| `variants[].print_fields` | 我们系统内维护的变体级打印字段 |

产品打印字段示例：

- Bin location / shelf location。
- Production note。
- Packing instruction。
- Material。
- Care instruction。
- Internal SKU。
- Supplier SKU。
- Default production image。
- Product label text。
- HS code / country of origin。
- Fragile / keep upright / cold storage。

### 5.5 履约与支付字段

| 字段 | 说明 |
|---|---|
| `fulfillment.method` | shipping、pickup、delivery、pos、restaurant、custom |
| `fulfillment.status` | unfulfilled、partial、fulfilled、cancelled |
| `fulfillment.pickup_time` | 自提时间 |
| `fulfillment.delivery_window` | 配送时间窗 |
| `payment.status` | paid、unpaid、partially_paid、refunded |
| `payment.subtotal` | 商品小计 |
| `payment.shipping_total` | 运费 |
| `payment.fee_total` | 手续费或额外费用 |
| `payment.total` | 总金额 |
| `payment.tax_total` | 税额 |
| `payment.discount_total` | 折扣总额 |
| `payment.refund_total` | 已退款金额 |
| `payment.payment_method` | 支付方式，如平台可提供 |

### 5.6 发货与物流字段

| 字段 | 说明 |
|---|---|
| `shipments[].id` | 发货记录 ID |
| `shipments[].source_platform` | 发货来源平台，如 wix、shippo、shipstation、easyship、manual |
| `shipments[].carrier` | 承运商，如 USPS、UPS、FedEx、DHL、local delivery |
| `shipments[].service_level` | 服务类型，如 standard、express、overnight |
| `shipments[].tracking_number` | 物流追踪号 |
| `shipments[].tracking_url` | 物流追踪链接 |
| `shipments[].label_url` | 面单文件地址 |
| `shipments[].status` | pending、label_created、shipped、delivered、failed |
| `shipments[].line_item_ids` | 本次发货包含的商品行 |
| `shipments[].write_back_status` | 回写到订单平台的状态 |

### 5.7 自定义字段

自定义字段用于承接不同平台的 checkout extra fields、order meta、metafields、buyer note、gift note、上传文件和第三方插件字段。

字段结构：

| 字段 | 说明 |
|---|---|
| `key` | 原始字段 key |
| `label` | 商家可读名称 |
| `value` | 字段值 |
| `type` | text、number、date、url、image、file、boolean、json |
| `source` | 字段来源，如 checkout、order_meta、metafield、plugin |
| `scope` | order、line_item、customer、fulfillment |

### 5.8 文档输出元数据

文档输出元数据不改变订单本身，只用于 PDF、浏览器打印、下载归档和 print job 记录。

| 字段 | 说明 |
|---|---|
| `document_type` | packing_slip、pick_list、production_sheet、invoice_helper、receipt_helper、thermal_receipt 等 |
| `document_title` | 打印文档标题 |
| `template_id` | 使用的模板 ID |
| `template_version` | 使用的模板版本 |
| `print_language` | 本次打印语言 |
| `paper_size` | A4、Letter、4x6、80mm |
| `file_name` | 生成 PDF 或 ZIP 内文件名 |
| `sequence_number` | 顺序编号，P1 / P2 用于 invoice helper 或内部归档 |
| `generated_at` | 文档生成时间 |
| `generated_by` | 生成人员 |

P0 要求：

- 系统提供默认文件名规则。
- 默认文件名包含店铺、文档类型、订单号和生成日期。
- 文件名不得依赖平台不可控字段。
- 同一批次内文件名冲突时自动追加序号。

P1 要求：

- 支持自定义文件名规则。
- 支持按模板、语言、日期、订单号、客户名组合文件名。
- 支持 ZIP 内按文档类型或语言分目录。

P2 要求：

- 支持顺序编号规则。
- 支持 invoice helper 的编号预留，但不承诺合法税务发票编号。

## 6. 模板场景

系统不需要在 P0 单独维护复杂的“订单类型”实体。实际产品里先以“模板场景”理解：不同订单在打印时选择不同文档模板。

模板场景由规则匹配，不强制改变订单本身的数据结构。规则可基于：

- fulfillment method，如 shipping、pickup、delivery、pos、restaurant。
- payment status。
- fulfillment status。
- shipping country / billing country。
- order tags。
- custom fields 是否存在。
- line item fields，如 SKU、variant、product option、fulfillment source。
- 手动选择。

P0 要求：

- 商家可以手动选择模板。
- 系统可以为常见场景推荐默认模板。
- 模板选择不改变订单原始数据。
- 打印状态按订单 + 文档类型 + 模板记录。

P1 要求：

- 支持模板自动匹配规则。
- 支持规则优先级。
- 支持规则预览：显示某个订单为什么匹配某个模板。
- 支持模板 fallback：没有命中规则时使用默认模板。

### 6.1 标准邮寄模板场景

功能要求：

- 显示商品名称、SKU、variant、数量、图片。
- 显示 shipping address、billing address。
- 支持 buyer note、gift note。
- 显示 payment status、fulfillment status。
- 支持配置是否显示价格。
- 打印后可标记为已打印。

推荐模板：

- Packing Slip
- Pick List
- Order Print

### 6.2 本地自提模板场景

功能要求：

- 显示 pickup location。
- 显示 pickup date / time。
- 显示 customer phone。
- 显示 payment status。
- 支持 customer-facing order note 和内部备注。

推荐模板：

- Pickup Slip
- Store Order Summary
- Thermal Receipt

### 6.3 本地配送模板场景

功能要求：

- 显示 delivery address。
- 显示 delivery date / time window。
- 显示 delivery note。
- 显示 contact phone。
- 显示 payment status。
- 支持签收说明。

推荐模板：

- Delivery Note
- Packing Slip
- Address Label

### 6.4 POS / 线下门店模板场景

功能要求：

- 显示线下订单标题。
- 显示客户可见描述。
- 显示付款状态。
- 支持已付、未付、定金、尾款。
- 显示 pickup date、due date。
- 支持门店员工备注。

推荐模板：

- POS Order Slip
- Payment Receipt
- Pickup Slip

### 6.5 定制商品模板场景

功能要求：

- 支持商品图片放大显示。
- 支持 variant 矩阵，如尺码、颜色、数量。
- 支持 product options。
- 支持 checkout custom fields。
- 支持上传文件链接或缩略图。
- 支持设计位置、文字内容、生产说明。
- 支持 due date / event date。

推荐模板：

- Production Sheet
- Internal Order Print
- Packing Slip

### 6.6 混合履约模板场景

功能要求：

- 显示 fulfillment source。
- 显示 fulfillment status。
- 支持 partial fulfillment。
- 支持只打印当前需要处理的商品。
- 支持按供应商、仓库或履约来源拆分文档。

推荐模板：

- Split Packing Slip
- Supplier Sheet
- Pick List

### 6.7 B2B / 含税号模板场景

功能要求：

- 显示 company name。
- 显示 VAT ID / Tax ID。
- 显示 PO number。
- 显示 billing address。
- 显示 tax summary。
- 支持多语言税务标签。

说明：

- P0 不承诺完整税务合规开票。
- P0 需要预留公司名、税号、PO number 和税务字段映射能力。

推荐模板：

- Invoice Helper
- Receipt Helper
- Order Confirmation

### 6.8 礼品模板场景

功能要求：

- 支持隐藏价格。
- 显示 gift message。
- 显示 return policy。
- 支持 QR code / coupon。

推荐模板：

- Gift Receipt
- No-price Packing Slip

### 6.9 退款、退货、换货模板场景

功能要求：

- 显示 refund status。
- 显示 returned items。
- 显示 return reason。
- 显示 RMA / return number。
- 支持 replacement shipment note。

推荐模板：

- Return Form
- Refund Note
- Replacement Slip

### 6.10 餐饮 / 外卖 / 堂食模板场景

功能要求：

- 支持 fulfillment method：pickup、delivery、dine-in、catering、meal prep。
- 显示 prep time、pickup time、delivery time window、scheduled order。
- 显示 table / seating info。
- 显示 menu item、modifier、option、special instruction、allergy note。
- 支持 kitchen note、customer note、payment status。
- 支持 80mm 热敏 ticket、厨房票、打包票、配送票。
- 支持打印失败、重印、已出餐、已打包等状态追踪。

优先级：

- 不进入 P0 Wix Stores MVP。
- P1.5 / P2 验证 Wix Restaurants 数据读取和热敏厨房票原型。

推荐模板：

- Kitchen Ticket
- Pickup Ticket
- Delivery Ticket
- Dine-in Ticket
- Catering Production Sheet
- Thermal Receipt

## 7. 文档类型

| 文档类型 | 主要对象 | 是否面向客户 | 核心字段 |
|---|---|---|---|
| Packing Slip | 打包 / 客户随箱 | 是 | 订单号、地址、商品、数量、SKU、备注 |
| Pick List | 仓库拣货 | 否 | SKU、商品位置、数量、variant、订单分组 |
| Production Sheet | 生产 / 制作 | 否 | 图片、custom fields、设计文件、尺寸颜色、due date |
| Order Print | 内部订单详情 | 视配置 | 完整订单、支付、履约、客户、备注 |
| Thermal Receipt | 门店 / 小票 | 视配置 | 简短商品、数量、状态、时间、电话 |
| Delivery Note | 配送人员 | 视配置 | 地址、电话、配送时间、备注、签收 |
| Invoice Helper | 财务 / 客户 | 是 | 公司名、税号、金额、税、PO number、订单号 |
| Receipt Helper | 客户 / 财务 | 是 | 付款状态、金额、税、支付方式、订单号 |
| Gift Receipt | 收礼人 | 是 | 商品、礼品留言、无价格 |
| Return Form | 客户 / 售后 | 是 | 订单号、退货地址、退货说明 |
| Refund Note | 客户 / 售后 | 是 | 退款商品、退款金额、退款原因、退款日期 |
| Quote Helper | B2B / 客户 | 是 | 商品、报价有效期、公司信息、税号、备注 |
| Credit Note Helper | 财务 / 客户 | 是 | 原订单号、抵扣金额、退货 / 退款原因 |
| Kitchen Ticket | 厨房 / 备餐 | 否 | 菜品、modifier、特殊要求、时间、桌号 / 取餐号 |
| Catering Production Sheet | 餐饮制作 / 备货 | 否 | 菜单组合、人数、日期、分批制作、配送 / 自提说明 |

P0 内置模板库：

- Packing Slip。
- Pick List。
- Production Sheet。
- Invoice Helper。
- Receipt Helper。
- Thermal Receipt。

P1 / P2 扩展模板库：

- Gift Receipt。
- Return Form。
- Delivery Note。
- Refund Note。
- Quote Helper。
- Credit Note Helper。
- 细分行业模板包，如定制商品、花店、蛋糕、活动用品、餐饮预订单。

说明：

- Invoice Helper、Receipt Helper、Quote Helper、Credit Note Helper 是订单凭证和内部协助文档，不承诺合法税务开票、电子发票或本地税务合规。

## 8. 功能模块

### 8.1 店铺连接与订单同步

P0：

- 支持连接 Wix Stores。
- 支持一个商家组织下连接多个 Wix 店铺。
- 支持顶部或侧栏店铺切换器。
- 支持拉取订单列表。
- 支持拉取订单详情。
- 支持保存平台原始订单 payload。
- 支持记录订单同步时间。
- 支持手动刷新单个订单。
- 支持同步失败提示。
- 支持订单按店铺隔离。

P1：

- 支持增量同步。
- 支持 webhook 事件处理。
- 支持首次导入最近 N 天订单。
- 支持同步失败重试队列。
- 支持 all stores 汇总视图。

P2：

- 支持多平台、多店铺连接。
- 支持 WooCommerce 来源。
- 支持 CSV 来源。

P3：

- 支持 Shopify 来源。
- 支持 Direct API 来源。

### 8.2 订单列表与筛选

P0：

- 显示订单号、客户、日期、金额、支付状态、履约状态、打印状态。
- 默认只显示当前店铺订单。
- 支持按日期筛选。
- 支持按支付状态筛选。
- 支持按履约状态筛选。
- 支持按打印状态筛选。
- 支持搜索订单号、客户名、邮箱、SKU。
- 支持批量选择订单。
- 显示每单推荐模板和打印语言。
- 切换店铺后清空已选订单。

P1：

- 支持按模板场景筛选：shipping、pickup、delivery、POS、custom、B2B。
- 支持按 custom field 是否存在筛选。
- 支持按国家 / 语言筛选。
- 支持按 fulfillment source 筛选。
- 支持保存常用筛选。

### 8.3 订单详情

P0：

- 显示客户、地址、商品、金额、支付、履约、备注。
- 显示 custom fields。
- 显示推荐文档类型。
- 显示打印历史。
- 支持从详情页预览和打印。
- 支持手动刷新订单数据。

P1：

- 显示原始字段和映射状态。
- 显示字段缺失提示。
- 支持订单级打印语言覆盖。
- 支持订单级手动选择模板。

### 8.4 模板管理

P0：

- 提供内置模板库。
- 创建模板。
- 复制模板。
- 编辑模板。
- 删除模板。
- 设置默认模板。
- 每个模板绑定文档类型。
- 每个模板绑定纸张尺寸。
- 每个模板绑定默认打印语言。
- 每个模板绑定默认字体。
- 模板默认归属当前店铺。
- 支持从内置模板创建店铺模板。
- 支持模板按文档类型筛选。

P1：

- 模板启用 / 停用。
- 模板版本管理。
- 模板自动匹配规则。
- 多语言文案完整性检查。
- 模板复制到其他店铺。
- 组织共享模板。
- 店铺默认模板优先于组织默认模板。
- 支持行业模板包。
- 支持模板锁定：防止仓库误改生产模板。

### 8.5 模板编辑器

P0：

- 支持 logo、店铺名、店铺地址配置。
- 支持字段显示 / 隐藏。
- 支持字段排序。
- 支持字段 label 自定义。
- 支持商品表格列显示 / 隐藏。
- 支持商品表格列排序。
- 支持 line item custom fields 显示 / 隐藏。
- 支持基础样式：字体、字号、粗细、对齐、颜色。
- 支持页眉、页脚。
- 支持客户备注、内部备注、政策文案。
- 支持商品图片显示开关。
- 支持价格显示开关。
- 支持感谢语、退换货说明、客服联系方式等固定文案。
- 支持打印预览。

P1：

- 支持字段分组。
- 支持条件显示，如礼品订单隐藏价格。
- 支持二维码 / 条码。
- 支持多语言文案编辑。
- 支持复制某语言内容到另一语言。
- 支持 80mm 热敏模板专用布局。
- 支持产品打印字段分组，如生产字段、打包字段、售后字段。
- 支持模板级水印或内部标识，如 draft、reprint。

P2：

- 支持高级布局能力。
- 支持代码模板或 Liquid-like 语法。
- 支持模板导入 / 导出。

### 8.5.1 模板组件模型

P0 不做复杂拖拽式设计工具，但模板编辑器需要按组件化模型设计，避免后续升级拖拽编辑器时推翻数据结构。

模板由多个 section / block / field component 组成：

| 层级 | 说明 | 示例 |
|---|---|---|
| Template | 一个完整打印模板 | Packing Slip - A4 |
| Section | 页面区域 | Header、Customer Info、Line Items、Footer |
| Block | 区域内的模块 | Logo Block、Address Block、Items Table、Note Block |
| Field Component | 绑定订单字段的最小展示组件 | Order Number、SKU、Quantity、Custom Field |
| Static Component | 不绑定订单字段的固定内容 | Thank-you text、Return policy、Divider |
| Table Component | 列表型数据组件 | Line Items Table、Tax Summary、Payment Summary |
| Media Component | 图片或文件组件 | Product Image、Uploaded File Preview、Logo |
| Code Component | 机器可读组件 | Barcode、QR Code |

组件基础属性：

| 属性 | 说明 |
|---|---|
| `id` | 组件 ID |
| `type` | 组件类型 |
| `label` | 后台显示名称 |
| `data_binding` | 绑定的标准字段或自定义字段 |
| `visibility` | 显示规则 |
| `style` | 样式配置 |
| `children` | 子组件 |
| `order` | 当前容器内排序 |

P0 组件能力：

- 支持 section 排序。
- 支持 block 显示 / 隐藏。
- 支持字段显示 / 隐藏。
- 支持字段排序。
- 支持字段 label 自定义。
- 支持表格列配置。
- 支持固定文案组件。
- 支持图片组件显示 / 隐藏。
- 支持基础样式配置。
- 支持条件显示的结构预留。

P1 组件能力：

- 支持更多组件类型，如二维码、条码、图片、金额汇总、备注块。
- 支持组件复制。
- 支持 section / block 级样式。
- 支持条件显示规则。
- 支持 repeat 组件，用于 line items、shipments、refund items。
- 支持组件预设，如 B2B Header、No-price Items Table、Production Notes。
- 支持模板版本保存。

P2 组件能力：

- 支持拖拽排序。
- 支持可视化布局编辑。
- 支持组件库。
- 支持组件导入 / 导出。
- 支持高级模板代码和组件结构互转。

技术要求：

- 模板保存为结构化 JSON，不只保存 HTML 字符串。
- PDF / 预览渲染由模板 JSON 生成。
- 所有组件样式使用受控 schema，避免任意 CSS 破坏分页和打印。
- 字段绑定必须通过标准订单模型和字段映射层，不直接绑定平台原始字段。
- 模板渲染需要支持 fallback：字段不存在、字段为空、图片失败、语言缺失。
- 样式 schema 需要预留 responsive / paper-size override，用于 A4、Letter、4x6、80mm。
- 组件 schema 版本化，后续升级编辑器时可迁移旧模板。

### 8.6 字段映射

P0：

- 支持 Wix checkout extra fields / custom fields 映射。
- 支持将平台字段映射到标准字段。
- 支持将平台字段映射到模板自定义字段。
- 显示字段样本值。
- 显示字段是否在当前模板中使用。
- 字段映射按店铺隔离。

P1：

- 支持字段缺失率统计。
- 支持字段来源标识。
- 支持 line item 级字段映射。
- 支持字段显示名多语言配置。
- 支持更完整的 Wix pickup、delivery、POS、custom order 字段映射。

P2：

- 支持 WooCommerce order meta 映射。

P3：

- 支持 Shopify metafields 映射。

### 8.6.1 产品同步与产品打印字段

P1：

- 支持同步当前店铺的 Wix 产品列表。
- 支持同步产品图片、SKU、options、variants、custom text fields。
- 支持按产品名、SKU、标签或同步状态搜索产品。
- 支持产品级打印字段。
- 支持变体级打印字段。
- 支持为产品字段设置字段类型：text、number、date、url、image、file、boolean、select。
- 支持产品字段在模板里作为 line item 字段使用。
- 支持订单行根据 `source_product_id` 和 `source_variant_id` 自动合并产品打印字段。
- 支持产品字段缺失提示。
- 支持产品字段批量编辑。
- 支持产品资料手动刷新。

字段合并规则：

1. 订单行原始字段优先。
2. 变体级打印字段覆盖产品级打印字段。
3. 产品级打印字段作为 fallback。
4. 手动订单字段覆盖产品同步字段。

P1 不做：

- 不把产品打印字段写回 Wix 商品资料。
- 不替代 Wix 产品管理。
- 不处理库存、价格和商品上下架管理。

P2：

- 支持 CSV 批量导入产品打印字段。
- 支持复制产品打印字段到其他店铺。
- 支持从 WooCommerce 产品 meta 同步产品打印字段。

### 8.7 多语言

P0：

- 系统语言支持 English、繁体中文。
- 打印语言支持 English、繁体中文、German、Dutch、French、Spanish。
- 系统语言不影响已保存模板的打印语言。
- 打印语言不自动翻译订单原始数据。
- 订单数据默认原样输出。

打印语言影响：

- 文档标题。
- 字段标签。
- 状态文本。
- 日期格式。
- 数字和货币格式。
- 地址展示规则。
- 固定文案，如感谢语、退换政策。

打印语言优先级：

1. 单次打印手动覆盖。
2. 订单级自动规则。
3. 模板默认语言。
4. 全局默认语言。

P1：

- 支持模板多语言文案配置。
- 支持按 shipping country 自动选择打印语言。
- 支持按 billing country 自动选择打印语言。
- 支持按站点语言或客户语言偏好选择打印语言。
- 支持缺失翻译提示。

### 8.8 字体

P0：

- 提供 Latin、CJK、Mono number 字体预设。
- PDF 生成时稳定引用或嵌入字体。
- 打印预览和 PDF 输出尽量一致。
- 热敏模板默认使用清晰无衬线字体。

推荐字体：

| 语言 / 文字 | 推荐字体 |
|---|---|
| Latin | Inter 或 Noto Sans |
| 繁体中文 | Noto Sans TC |
| 日文 | Noto Sans JP |
| 韩文 | Noto Sans KR |
| 等宽数字 / 条码文本 | Roboto Mono 或 Noto Sans Mono |

P1：

- 支持每种打印语言设置默认字体。
- 支持模板级字体覆盖。
- 支持字体预览。
- 支持缺字检测提示。

P2：

- 支持上传品牌字体。
- 支持 RTL 语言字体与排版。

### 8.9 打印预览与校验

P0：

- 支持单订单预览。
- 支持批量预览。
- 预览使用真实纸张尺寸。
- 支持 A4、Letter、4x6、80mm。
- 校验必填字段缺失。
- 校验图片无法加载。
- 校验内容溢出页面。
- 校验当前字体可能缺字。
- 校验未设置打印语言。

P1：

- 校验多语言翻译缺失。
- 校验 VAT / Tax ID 缺失。
- 校验订单数据过旧。
- 校验 partial fulfillment 商品数量不一致。

### 8.10 批量打印与 PDF

P0：

- 支持批量选择订单。
- 支持批量生成 PDF。
- 支持浏览器打印。
- 支持批量标记为已打印。
- 支持失败订单单独提示。
- 支持按模板和语言生成打印结果。

P1：

- 支持批量 ZIP 下载。
- 支持自定义文件命名规则。
- 支持按语言 / 模板拆分 PDF。
- 支持重印。

### 8.11 Print Job

每次生成、下载或浏览器打印，都需要创建 print job。

Print job 字段：

| 字段 | 说明 |
|---|---|
| `id` | 打印任务 ID |
| `organization_id` | 商家组织 ID |
| `store_id` | 店铺 ID |
| `source_platform` | 来源平台 |
| `order_ids` | 订单 ID 列表 |
| `template_id` | 模板 ID |
| `document_type` | 文档类型 |
| `print_language` | 打印语言 |
| `paper_size` | 纸张尺寸 |
| `output_type` | pdf、browser_print |
| `status` | pending、generated、downloaded、printed、failed、review_required |
| `file_url` | 生成文件地址 |
| `created_by` | 发起人 |
| `created_at` | 创建时间 |
| `error_message` | 错误信息 |

P0 状态：

- pending
- generated
- downloaded
- printed
- failed
- review_required

P1：

- 支持 print job history。
- 支持错误详情。
- 支持重新生成。
- 支持重印记录。

### 8.12 发货平台与履约回写

该模块把订单打印工作台扩展为履约中转站。系统从 Wix 等订单平台读取订单，协助商家把订单发送到发货平台或物流工具，再把发货结果回写到订单平台。

P3：

- 支持配置发货平台连接。
- 支持把已选订单发送到发货平台。
- 支持选择需要发货的 line items。
- 支持 partial fulfillment。
- 支持从发货平台同步 tracking number。
- 支持从发货平台同步 label URL。
- 支持把 tracking number 回写到 Wix 订单 fulfillment。
- 支持回写成功、失败、重试状态。
- 支持在订单详情和 print job 中显示 shipment 状态。
- 支持打印 packing slip 后继续创建 shipment。
- 支持多发货平台连接。
- 支持运费报价和服务等级选择。
- 支持批量创建 shipping label。
- 支持退货面单。
- 支持国际运单和报关字段。
- 支持发货规则自动化，如按国家、重量、订单金额选择发货平台。

不进入前期范围的内容：

- 不直接成为承运商账户系统。
- 不承担运费结算和保险责任。
- 不承诺完整 customs / tax 合规。
- 不替代专业 WMS / ERP。

## 9. 关键流程

### 9.1 批量打印待发货订单

1. 商家进入 Orders。
2. 筛选 `Fulfillment: Unfulfilled` 和 `Print Status: Unprinted`。
3. 勾选多个订单。
4. 系统推荐 `Packing Slip - A4`。
5. 系统按规则选择打印语言。
6. 系统执行字段、图片、字体、分页校验。
7. 商家查看异常提示。
8. 商家确认生成 PDF。
9. 系统创建 print job。
10. 商家下载、浏览器打印或标记为已打印。

### 9.2 定制商品生产单

1. 商家筛选定制商品订单。
2. 选择 `Production Sheet` 模板。
3. 系统根据订单行匹配产品和变体资料。
4. 系统合并产品打印字段，如 production note、material、care instruction、bin location。
5. 系统显示商品大图、尺寸颜色、上传设计、生产说明、due date。
6. 商家确认预览。
7. 系统生成 PDF。
8. 生产人员按生产单制作。

### 9.3 多语言 Packing Slip

1. 订单 shipping country 命中语言规则。
2. 系统选择对应打印语言。
3. 模板标题、字段标签、状态文本使用打印语言。
4. 商品名、客户备注和订单原始数据保持原文。
5. 如模板文案缺失，系统提示 fallback。

### 9.4 门店自提小票

1. 员工筛选今日 pickup orders。
2. 选择 `Pickup Slip - 80mm`。
3. 系统显示客户姓名、电话、取货时间、付款状态、商品摘要。
4. 未付款订单显示 `Payment due`。
5. 员工打印或下载。
6. 系统记录 pickup slip printed。

### 9.5 B2B 凭证导出

1. 财务筛选 B2B 订单。
2. 选择 `Invoice Helper`。
3. 系统检查 company name、VAT ID、PO number。
4. 缺字段订单进入 review list。
5. 财务批量生成 PDF 或 ZIP。

### 9.6 WooCommerce 自定义字段打印（P2）

1. 商家安装 WordPress / WooCommerce 插件。
2. 系统同步订单和字段样本。
3. 系统发现 order meta 字段。
4. 商家把字段映射到 Production Sheet 或 Packing Slip。
5. 新订单通过 webhook 增量同步。
6. 仓库人员按模板批量打印。

### 9.7 产品打印字段维护（P1）

1. 商家进入 Products。
2. 系统同步当前 Wix 店铺产品和变体。
3. 商家打开某个产品。
4. 商家添加产品级打印字段，如 packing instruction、material、care instruction。
5. 商家为某个变体添加变体级打印字段，如 bin location、supplier SKU。
6. 商家在 Production Sheet 模板中开启这些字段。
7. 后续订单打印时，订单行自动带出产品和变体打印字段。

### 9.8 餐饮厨房热敏出单

1. 餐厅收到 Wix Restaurants 订单。
2. 系统识别订单为 pickup、delivery 或 dine-in。
3. 系统按菜品分类生成 Kitchen Ticket、Pickup Ticket 或 Delivery Ticket。
4. 厨房票显示菜品、modifier、特殊要求、过敏提醒、取餐 / 配送时间。
5. 门店小票机或浏览器输出 80mm 热敏票。
6. 如果打印失败，前台可看到失败状态并重新出单。

### 9.9 打印后创建发货并回写（P3）

1. 商家筛选待发货订单。
2. 商家批量打印 Packing Slip。
3. 系统创建 print job 并记录已打印状态。
4. 商家选择 `Create shipment`。
5. 系统把订单、地址、商品行、重量和备注发送到发货平台。
6. 发货平台返回 label、carrier、tracking number。
7. 系统保存 shipment 记录。
8. 系统把 tracking number 和 fulfillment 信息回写到 Wix。
9. 如果回写失败，订单进入 shipment review list。

## 10. MVP 范围

### 10.1 P0 必做

- Wix Stores 订单拉取。
- 多店铺连接和店铺切换器。
- Orders 列表与批量选择。
- Packing Slip、Order Print、Production Sheet、Thermal Receipt 四类模板。
- A4、Letter、4x6、80mm 纸张尺寸。
- 字段显示开关。
- Wix custom fields / checkout extra fields 映射。
- 系统语言：English、繁体中文。
- 打印语言：English、繁体中文、German、Dutch、French、Spanish。
- 字体预设：Latin、CJK fallback、mono number。
- 打印预览。
- 基础校验。
- 批量 PDF。
- 浏览器打印。
- 打印状态记录。
- Print job 状态模型。
- 标准订单模型。
- 平台原始 payload 保存。

### 10.2 P0 暂缓

- 自动翻译订单数据。
- 合规电子发票。
- 供应商 PO。
- 自动邮件。
- 复杂自动化。
- 自定义字体上传。
- 产品同步和产品打印字段维护。
- WooCommerce / Shopify 生产级接入。
- Wix Restaurants 深度接入和餐饮厨房分单。
- 发货平台连接和 fulfillment 回写。
- 打印机连接。
- 云打印。
- 本地打印代理。
- 设备级协议。

## 11. 后续阶段

### 11.1 P1：完善 Wix Stores 订单打印

- 增量同步和 webhook。
- Wix Orders 字段覆盖验证。
- pickup / local delivery 字段支持。
- POS / custom order 字段支持。
- 字段样本识别。
- 字段缺失率提示。
- 模板版本管理。
- 模板启用 / 停用。
- 多语言模板文案。
- 批量 ZIP 下载。
- Wix 产品同步。
- 产品打印字段维护。
- 变体级打印字段。
- 产品字段在模板中引用。
- Print job history。

### 11.2 P1.5

- Wix Restaurants 数据读取验证。
- 餐饮 80mm Kitchen Ticket 原型。
- Pickup Ticket / Delivery Ticket。
- 餐饮特殊要求、modifier、过敏提醒字段。

### 11.3 P2：WooCommerce 与打印工作流扩展

- WooCommerce 插件 PoC。
- WooCommerce order meta 字段映射。
- WooCommerce checkout fields 映射。
- WooCommerce 产品 meta 字段同步。
- WordPress 插件安装和授权流程。
- CSV 导入。

### 11.4 P3：Shopify、API 与高级扩展

- Shopify connector 验证。
- Shopify metafields 映射。
- Shopify fulfillment / POS 字段映射。
- 发货平台 connector PoC。
- Wix fulfillment / tracking number 回写 PoC。
- Shipment 状态模型。
- 多店铺模板复用。
- Direct API。
- 白标模板和打印服务。
- Agency 客户工作区。
- 行业模板包。

## 12. 非目标范围

第一版不做：

- 完整合法税务开票系统。
- 自动翻译客户备注、商品名或生产说明。
- 静默直连实体打印机。
- 深度 POS 收款闭环。
- 完整 shipping label 购买流程。
- AI 自动改写订单数据。
- 复杂拖拽式设计工具；但 P0 模板组件模型必须为后续拖拽编辑器预留。

## 13. 待确认问题

### 13.1 Wix 技术问题

- Wix Orders API 是否可读取 checkout extra fields。
- 是否可读取 uploaded files / product options。
- 是否可读取 pickup / local delivery 字段。
- 是否可读取 POS / custom order 相关字段。
- 是否可读取 Wix Restaurants 订单、菜单 modifier、堂食、时间窗和门店字段。
- 是否可通过 Wix API 创建 fulfillment、写入 tracking number 和 tracking URL。
- Wix fulfillment 回写是否支持 partial fulfillment 和多包裹。
- 是否支持 order tags 或自定义 app 数据记录打印状态。
- 是否能通过 Wix App 在 dashboard 提供自然的订单选择入口。

### 13.2 产品问题

- 商家最常用的前三种文档类型是什么。
- 多语言商家希望按客户国家、站点语言还是手动选择打印语言。
- 字体设置需要暴露到模板级，还是预设足够。
- 发票 / 收据辅助能力是否会引发合规期待。
- 80mm 热敏模板在浏览器打印下是否能满足门店出单需求。
- 餐饮商家真正缺的是模板自定义、厨房分单、自动打印、打印失败追踪，还是多平台统一。
- 商家是否希望订单打印工具继续承担发货中转、tracking 回写和发货异常处理。
- 发货平台优先对接 Shippo、ShipStation、Easyship、AfterShip，还是商家所在地区的本地物流平台。
