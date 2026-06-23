# 订单数据模型与模板渲染上下文

版本：v0.2
更新日期：2026-06-23
来源：从 [Zider PrintOps 产品需求文档](../order-printing-product-requirements.md) 按模块拆分
模块说明：标准订单模型、产品资料、履约支付、物流、自定义字段、输出元数据和 Template Render Context。
## 5. 标准订单模型

模板系统只读取标准订单模型，不直接绑定平台原始字段。平台原始字段通过字段映射进入标准字段或自定义字段。

### 5.1 基础字段

| 字段 | 说明 |
|---|---|
| `organization_id` | 商家组织 ID |
| `workspace_id` | ZIDER workspace ID；账户绑定后必须写入 |
| `store_id` | 系统内店铺 ID |
| `app_key` | 应用 key，如 `zider_printops` |
| `platform` | 平台，如 `wix` |
| `instance_id` | Wix app instance ID；未绑定账户前用于兼容读取 |
| `source_platform` | 订单来源，如 wix、woocommerce、shopify、csv、api |
| `source_store_id` | 来源店铺 ID |
| `store_name` | 同步时的店铺名快照，用于列表和多店铺区分 |
| `source_order_id` | 平台原始订单 ID |
| `display_order_number` | 商家和客户看到的订单号 |
| `order_date` | 下单时间 |
| `updated_at` | 订单数据更新时间 |
| `currency` | 订单币种 |
| `tags` | 平台标签和内部标签 |
| `purchase_order_number` | PO number，如平台、B2B 或自定义字段可提供 |
| `customer_locale` | 订单或客户语言区域，如 en-US、zh-TW、de-DE |

当前 V1 约束：

- `app_key + platform + instance_id + source_order_id` 是未绑定账户时的兼容唯一定位。
- 账户绑定后，新订单必须同时保留 `workspace_id` 和 `store_id`。
- 多店铺 UI 暂未完全展开，但订单数据必须先记录店铺上下文，后续才能筛选、合并和隔离。
- 真实订单列表只能使用同步订单字段，不得使用模板样例数据或 mock 文案。

### 5.1.1 Wix 默认订单打印字段基线

P0 首先覆盖 Wix 默认 Order 打印模板，而不是先做完整发票、餐饮票据或复杂生产单。基于 Wix 默认订单打印样例 `order_10059.pdf`，Order 模板需要优先映射以下字段：

| Wix 默认打印信息 | 标准模型 / 渲染上下文字段 | P0 展示要求 |
|---|---|---|
| Order #10059 | `display_order_number` | 页眉强展示 |
| 1 item | `line_items.length` / `line_items[].quantity` | 与订单号同区展示 |
| Placed on Jan 14, 2026, 4:24 PM | `order_date` | 页眉订单元信息 |
| Customer name | `customer.name` | 客户信息区展示 |
| Customer email | `customer.email` | 客户信息区展示 |
| Customer phone | `customer.phone` | 客户信息区展示 |
| Product title | `line_items[].title` | 商品表主字段 |
| Product options，如 Size、Color | `line_items[].options` | 商品名下方展示 |
| Price / Qty / Total | `line_items[].price`、`line_items[].quantity`、行小计 | 商品表列展示 |
| Items / Shipping / Tax / Total | `payment.subtotal`、`payment.shipping_total`、`payment.tax_total`、`payment.total` | 金额汇总区展示 |
| Paid | `payment.status` / `payment.paid_total` | 付款区展示 |
| Paid with Gift card | `payment.payment_method` | 付款方式展示 |
| Delivery Address | `delivery_address` 或 `shipping_address` | Customer Details 区展示 |
| Billing Address | `billing_address` | 若与配送地址一致，展示 Same as delivery address |
| Delivery Method | `fulfillment.method_label` / `shipping_method` | 配送方式区展示 |
| Store footer | `store.name`、`store.address`、`store.phone`、`store.email` | 页脚展示 |

P0 样式优化目标：

- 保留 Wix 默认订单字段完整性，不因美化隐藏关键金额、地址或付款信息。
- 将原始默认打印中的松散信息重组为：页眉、客户概览、商品表、金额汇总、客户详情、配送方式、店铺页脚。
- Order 模板优先支持 A4 / Letter；热敏、餐饮厨房票和高级标签暂不进入当前 Order P0。
- 如果字段缺失，模板仍可预览，但需要在模板校验中提示缺失字段。

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

P0 自定义字段打印要求：

- 订单同步时必须从平台原始 payload 中抽取可识别的自定义字段，至少覆盖 Wix checkout extra fields、order custom fields、buyer note、gift note，以及订单行上随订单传递的 custom text / options 字段。
- 标准订单模型必须同时保存 `custom_fields` 和 `line_items[].custom_fields`，保留原始 `key`、用户可读 `label`、`value`、`type`、`source`、`scope` 和原始路径，避免后续模板无法追溯字段来源。
- `Template Render Context` 必须暴露订单级自定义字段和订单行级自定义字段，模板预览、PDF 下载和浏览器打印必须使用同一份字段结果。
- P0 模板编辑器必须允许商家选择常用自定义字段并打印出来，支持修改 label、排序、隐藏空字段和设置是否必填。
- P0 默认 Invoice 模板至少提供一个可开关的 `Additional details / Custom fields` 区块；如果订单没有对应字段，该区块默认隐藏。
- 商品表格 P0 必须支持把订单行自定义字段作为商品行明细显示，例如定制文字、尺寸、颜色、礼品留言、生产备注。
- `url`、`file`、`image` 类型字段如果平台提供可访问地址，P0 需要在 PDF / 打印里输出链接文本、文件名或缩略图；如果不可访问，需要显示字段缺失 / 文件不可用提示。
- 自定义字段可包含客户隐私信息，字段注册时需要标记隐私等级；默认样例和调试日志不得泄露真实敏感字段。

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

### 5.9 模板渲染数据上下文

为了支持更丰富的模板自定义、可视化模板编辑、AI 生成模板和多平台字段映射，模板系统不直接读取平台原始订单，也不只读取标准订单模型。模板渲染统一读取 `Template Render Context`。

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

定义原则：

- `Raw Source Payload` 保存 Wix、WooCommerce、Shopify、CSV、Direct API 等平台原始数据，用于追溯和重新映射。
- `Normalized Order Model` 是系统标准订单模型，用于跨平台统一订单、客户、地址、商品、支付、履约和自定义字段。
- `Field Registry` 是模板编辑器可用字段的注册表，描述字段类型、来源、可打印性、样本值、隐私风险和缺失策略。
- `Template Render Context` 是最终给模板组件读取的数据上下文，包含标准字段、自定义字段、计算字段、品牌设置、店铺设置和模板设置。
- Template Editor、PDF 渲染、浏览器打印、AI Template Designer 必须使用同一份 `Template Render Context`。
- 模板组件不允许直接绑定平台原始字段，必须通过字段注册表和渲染上下文读取数据。

Template Render Context 范围：

| 数据域 | 示例字段 |
|---|---|
| `store` | 店铺名、logo、地址、电话、邮箱、网站、品牌色、政策文案 |
| `order` | 订单号、下单时间、订单状态、标签、客户语言、订单备注 |
| `customer` | 姓名、邮箱、电话、公司、tax id、语言偏好 |
| `addresses` | shipping address、billing address、pickup location、delivery address |
| `line_items` | 商品名、SKU、variant、数量、价格、折扣、税、图片、商品选项、custom fields、product print fields |
| `payment` | subtotal、shipping、discount、tax、total、payment status、payment method |
| `fulfillment` | shipping、pickup、delivery、POS、restaurant、pickup time、delivery window、tracking info |
| `shipments` | carrier、service level、tracking number、tracking URL、label URL、shipment status |
| `custom_fields` | checkout extra fields、order meta、metafields、buyer note、gift note、上传文件、第三方插件字段 |
| `computed` | 是否礼品订单、是否 B2B、是否包含定制商品、商品总数量、缺失字段、分组商品 |
| `template` | 文档类型、纸张尺寸、语言、字体、边距、密度、当前模板配置 |

Field Registry 字段结构：

```json
{
  "key": "customer.tax_id",
  "label": "VAT ID",
  "scope": "customer",
  "type": "text",
  "source": "wix.checkout_custom_field",
  "required": false,
  "printable": true,
  "nullable": true,
  "sampleValue": "DE123456789",
  "fallback": "Not provided",
  "privacy": "business"
}
```

Field Registry 要求：

- 字段必须有唯一 `key` 和用户可读 `label`。
- 字段必须声明 `scope`：store、order、customer、address、line_item、payment、fulfillment、shipment、custom、computed、template。
- 字段必须声明 `type`：text、number、money、date、datetime、url、image、file、boolean、enum、json、array。
- 字段必须声明 `source`，用于追溯字段来自标准模型、平台字段、产品字段、计算字段或用户配置。
- 字段必须声明是否 `printable`，避免模板组件使用不可打印或高风险字段。
- 字段应提供 `sampleValue`，用于无真实订单时的模板预览。
- 字段应提供 `fallback`，用于字段为空或缺失时的显示策略。
- 涉及客户姓名、电话、地址、邮箱、税号、上传文件的字段需要标记隐私等级。

组件绑定示例：

```json
{
  "type": "line_items_table",
  "dataScope": "line_items",
  "columns": [
    { "field": "image_url", "label": "Image", "visible": true },
    { "field": "title", "label": "Product", "visible": true },
    { "field": "sku", "label": "SKU", "visible": true },
    { "field": "quantity", "label": "Qty", "visible": true },
    { "field": "custom_fields.production_note", "label": "Production note", "visible": true }
  ]
}
```

地址组件示例：

```json
{
  "type": "address_block",
  "dataBinding": "addresses.shipping",
  "props": {
    "title": "Ship to",
    "showPhone": true,
    "showCompany": true,
    "hideWhenEmpty": true
  }
}
```

计算字段示例：

- `computed.is_gift_order`。
- `computed.is_b2b_order`。
- `computed.has_custom_product`。
- `computed.total_item_quantity`。
- `computed.grouped_items_by_sku`。
- `computed.grouped_items_by_supplier`。
- `computed.missing_required_fields`。
- `computed.should_hide_prices`。

P0 要求：

- 建立 `Template Render Context` 的基础结构。
- 模板预览、PDF 和浏览器打印使用同一份渲染上下文。
- 支持 store、order、customer、addresses、line_items、payment、fulfillment、custom_fields、template 基础数据域。
- 支持订单级和订单行级自定义字段进入模板渲染，且可以在 P0 模板中打印。
- 支持基础 Field Registry，用于字段显示、字段隐藏、字段 label 和字段缺失提示。
- 支持字段样本值，用于没有真实订单时的模板预览。

P1 要求：

- 支持 computed 字段。
- 支持产品字段进入 line_items 数据域。
- 支持字段隐私等级。
- 支持字段缺失率统计。
- 支持字段分组和推荐字段。

P2 / P3 要求：

- 支持 Shopify metafields、WooCommerce order meta、CSV columns 和 Direct API 字段统一注册。
- 支持 AI Template Designer 基于 Field Registry 生成字段绑定建议。
- 支持复杂条件显示和分组渲染。
