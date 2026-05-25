# 订单打印 Product Harness

版本：v0.1
更新日期：2026-05-24
文档类型：系统边界与模块契约
当前范围：Wix Stores 首发，优先订单模板、字段映射、自定义样式、预览、PDF 和打印记录

## 1. 目的

订单打印产品先从 Wix Stores 开始，但架构不能写成 Wix-only。

这份 Harness 定义订单打印系统的边界、核心模块、适配层契约和安全规则，确保后续可以扩展到：

- 多个 Wix 店铺。
- Wix Products。
- Wix Restaurants。
- WooCommerce。
- Shopify。
- CSV / Direct API。
- 发货平台和设备打印等后续能力。

核心原则：

```text
订单打印核心能力必须平台中立。
平台适配层只负责连接、同步、授权、原始数据读取和回写。
模板、字段映射、预览、PDF 和 print job 不应依赖单个平台的原始数据结构。
```

## 2. 产品边界

订单打印系统提供：

- 订单同步。
- 产品资料同步。
- 标准订单模型。
- 标准产品模型。
- 字段映射。
- 模板组件模型。
- 模板场景和匹配规则。
- 打印预览。
- PDF 生成。
- 浏览器打印。
- Print job 记录。
- 多店铺上下文。

前期不提供：

- 复杂拖拽式设计工具。
- 打印机连接。
- 云打印。
- 本地打印代理。
- 完整发货平台。
- 合规电子发票。
- 库存、价格和商品上下架管理。
- AI 自动改写订单数据。

## 3. 层级模型

推荐结构：

```text
Workspace UI
↓
Store Context
↓
Platform Adapter
↓
Normalized Data Layer
↓
Field Mapping Layer
↓
Template Engine
↓
Preview / PDF Renderer
↓
Print Job Layer
```

## 4. 核心层

核心层是平台无关的订单打印能力。

### 4.1 Normalized Data Layer

职责：

- 保存标准订单模型。
- 保存标准产品模型。
- 保存订单行和产品 / 变体的关联。
- 保存字段映射结果。
- 保存平台原始 payload。
- 支持多店铺隔离。

核心对象：

```text
Organization
Store
Order
OrderLineItem
Product
ProductVariant
CustomField
ProductPrintField
Template
TemplateComponent
PrintJob
```

不得：

- 直接在模板里读取 Wix 原始字段。
- 把 WooCommerce / Shopify 字段写死到核心模板逻辑。
- 把店铺上下文存在前端临时状态里作为唯一来源。

### 4.2 Field Mapping Layer

职责：

- 将平台字段映射到标准字段。
- 将平台字段映射到模板自定义字段。
- 将产品字段映射到订单行可打印字段。
- 保存字段来源、类型、scope 和样本值。
- 支持按店铺隔离。

字段 scope：

```text
order
customer
address
line_item
product
variant
fulfillment
payment
store
```

字段类型：

```text
text
number
date
url
image
file
boolean
select
json
```

### 4.3 Product Print Field Layer

职责：

- 同步产品和变体资料。
- 维护产品级打印字段。
- 维护变体级打印字段。
- 在订单打印时把产品字段合并到订单行。

合并优先级：

1. 手动订单字段。
2. 订单行原始字段。
3. 变体级打印字段。
4. 产品级打印字段。
5. 模板 fallback 文案。

前期规则：

- 产品打印字段保存在 Zider，不写回 Wix 商品资料。
- 产品同步只补充打印，不替代产品管理。
- 模板引用产品字段时使用字段 key，不绑定具体产品 ID。

### 4.4 Template Engine

职责：

- 读取模板 JSON。
- 读取标准订单、订单行、产品打印字段。
- 处理字段显示、排序、样式、语言和 fallback。
- 生成预览和 PDF 渲染输入。

模板必须保存为结构化 JSON，不只保存 HTML 字符串。

模板层级：

```text
Template
└── Section
    └── Block
        └── Field Component / Static Component
```

组件基础属性：

```ts
type TemplateComponent = {
  id: string;
  type: string;
  label: string;
  dataBinding?: string;
  visibility?: VisibilityRule;
  style?: ComponentStyle;
  children?: TemplateComponent[];
  order: number;
};
```

### 4.5 Preview / PDF Renderer

职责：

- 使用同一份模板 JSON 渲染预览和 PDF。
- 支持 A4、Letter、4x6、80mm。
- 显示分页边界。
- 显示字段缺失、图片失败、文本溢出、字体缺字提示。
- 输出 PDF 文件。

不得：

- 预览一套逻辑，PDF 另一套逻辑。
- 允许任意 CSS 破坏分页。
- 依赖浏览器当前缩放作为最终输出尺寸。

### 4.6 Print Job Layer

职责：

- 记录 PDF 生成、下载和浏览器打印。
- 记录订单、模板、语言、纸张、发起人和状态。
- 支持失败重试。
- 支持按店铺隔离。

状态：

```text
pending
generated
downloaded
printed
failed
review_required
```

P0 output type：

```text
pdf
browser_print
```

## 5. Store Context

多店铺是前期基础能力。

Store Context 决定：

- 当前订单列表。
- 当前模板列表。
- 当前字段映射。
- 当前品牌设置。
- 当前默认模板。
- 当前 print jobs。
- 当前产品资料。

规则：

- 所有查询必须带 `organization_id`。
- 店铺级数据必须带 `store_id`。
- 切换店铺后清空已选订单。
- 批量打印不能跨店铺执行。
- 组织共享模板只能作为模板来源，打印时仍落到具体店铺。

## 6. 平台适配层

平台适配层只处理平台差异。

每个适配层需要回答：

- 如何授权？
- 如何识别店铺？
- 如何同步订单？
- 如何同步产品？
- 如何读取自定义字段？
- 如何保存原始 payload？
- 哪些字段能映射到标准模型？
- 是否支持 webhook？
- 是否支持回写？

### 6.1 Wix Stores Adapter

P0 适配层。

职责：

- 连接 Wix 店铺。
- 同步 Wix Orders。
- 同步订单详情。
- 读取 checkout extra fields / custom fields。
- 读取商品、SKU、variant、图片等订单行字段。
- 保存 Wix 原始 payload。
- 支持手动刷新订单。
- 后续支持 webhook 增量同步。

### 6.2 Wix Products Adapter

P1 适配层。

职责：

- 同步 Wix 产品列表。
- 同步产品图片、SKU、options、variants、custom text fields。
- 保存产品原始 payload。
- 将产品和订单行通过 product id / variant id 关联。
- 支持手动刷新产品资料。

不负责：

- 写回产品资料。
- 管理库存。
- 管理价格。
- 管理商品上下架。

### 6.3 Wix Restaurants Adapter

P1.5 / P2 适配层。

职责：

- 验证是否可读取餐饮订单。
- 读取 pickup、delivery、dine-in、scheduled order。
- 读取 menu item、modifier、special instruction、allergy note。
- 支持 Kitchen Ticket / Pickup Ticket / Delivery Ticket 模板场景。

### 6.4 WooCommerce Adapter

P2 适配层。

职责：

- WordPress 插件安装和授权。
- 同步 WooCommerce Orders。
- 读取 order meta、checkout fields、line item meta。
- 同步 WooCommerce products / product meta。
- 将 WooCommerce 字段映射到标准模型。

### 6.5 Shopify Adapter

P3 适配层。

职责：

- 同步 Shopify Orders。
- 读取 metafields、fulfillment、POS 字段。
- 同步 Shopify Products。
- 支持多店铺模板复用。

### 6.6 Shipping Adapter

P3 适配层。

职责：

- 连接发货平台。
- 创建 shipment。
- 获取 label、carrier、tracking number。
- 回写 tracking 到订单平台。

该能力不进入前期订单打印闭环。

## 7. 模板场景规则

系统不维护复杂订单类型实体。

模板场景由规则匹配：

- fulfillment method。
- payment status。
- fulfillment status。
- shipping country。
- billing country。
- order tags。
- custom fields 是否存在。
- product print fields 是否存在。
- line item SKU / variant / option。
- 手动选择。

P0：

- 手动选择模板。
- 常见场景推荐模板。
- 默认模板 fallback。

P1：

- 自动匹配规则。
- 规则优先级。
- 规则预览。

## 8. 数据安全与隔离规则

必须遵守：

- 组织数据按 `organization_id` 隔离。
- 店铺数据按 `store_id` 隔离。
- 模板读取订单时必须校验同一 store。
- Print job 不能跨 store 混合订单。
- 字段映射不能跨 store 自动复用，除非用户显式复制。
- 共享模板不能包含某个店铺的固定敏感字段值。
- 平台 access token 只存在服务端。
- 原始 payload 仅用于排查和字段映射，不直接暴露给普通用户。

## 9. 渲染安全规则

模板渲染必须稳定、可预期。

规则：

- 不允许用户输入任意脚本。
- 不允许模板执行任意 JavaScript。
- P0 不开放任意 CSS。
- 所有样式通过受控 schema。
- 图片加载失败必须 fallback。
- 长文本必须截断、换行或提示溢出。
- 货币、日期、地址格式必须由打印语言和订单 locale 决定。
- PDF 和预览使用同一份模板结构。

## 10. 推荐文件结构

```text
src/
  order-printing/
    core/
      normalized-order.ts
      normalized-product.ts
      field-mapping.ts
      template-schema.ts
      template-engine.ts
      print-job.ts
    rendering/
      preview-renderer.tsx
      pdf-renderer.ts
      print-css.ts
    adapters/
      wix/
        wix-orders.ts
        wix-products.ts
        wix-field-mapping.ts
      woocommerce/
        README.md
      shopify/
        README.md
      shipping/
        README.md
    ui/
      orders/
      products/
      templates/
      print-jobs/
      settings/
```

实际项目结构可以调整，但边界应保持。

## 11. MVP Harness Milestones

### Milestone 1：Store Context

结果：

- Organization / Store 模型存在。
- 店铺切换器存在。
- Orders、Templates、Print Jobs 按 store 隔离。

### Milestone 2：Wix Orders Adapter

结果：

- 可以连接 Wix 店铺。
- 可以同步订单列表和订单详情。
- 可以保存原始 payload。
- 可以映射基础字段。

### Milestone 3：Template Schema

结果：

- 模板保存为结构化 JSON。
- 支持 section、block、field component。
- 支持字段显示、排序、基础样式。
- 支持 A4、Letter、4x6、80mm。

### Milestone 4：Preview and PDF

结果：

- 预览和 PDF 使用同一模板结构。
- 可以选择订单预览。
- 可以生成 PDF。
- 可以显示字段缺失、图片失败、文本溢出提示。

### Milestone 5：Print Job

结果：

- PDF 生成创建 print job。
- 下载、浏览器打印、失败状态可记录。
- Print Jobs 页面可查看历史。

### Milestone 6：Product Print Fields

结果：

- 可以同步 Wix 产品。
- 可以维护产品级和变体级打印字段。
- 订单行可以合并产品打印字段。
- 模板可以引用产品打印字段。

## 12. Acceptance Checklist

- 核心模板逻辑不依赖 Wix 原始字段。
- 所有订单查询带 store context。
- 模板、字段映射、print job 按 store 隔离。
- 模板保存为 JSON schema。
- PDF 和预览由同一模板结构生成。
- P0 不需要拖拽编辑器，但组件模型已预留。
- P0 不连接打印机。
- P0 不连接发货平台。
- 产品打印字段不写回 Wix。
- 后续 WooCommerce / Shopify adapter 可复用核心模板和渲染层。

## 13. Open Questions

- Wix Orders 中哪些 checkout extra fields 可以稳定读取？
- Wix Products 中 product options、variants、custom text fields 的 API 覆盖是否足够？
- 订单行能否稳定拿到 source product id 和 variant id？
- 上传文件字段是订单级、商品级，还是 checkout field？
- 80mm 模板在浏览器打印下是否能满足门店打印需求？
- 产品打印字段需要先支持哪些类型？
