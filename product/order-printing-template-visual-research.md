# Zider PrintOps 模板视觉与场景调研

版本：v0.3
更新日期：2026-05-29
文档类型：模板视觉参考、场景收集、尺寸需求调研
当前用途：为 Template Library、Template Editor、模板缩略图、AI Template Designer 和后续模板包设计收集参考

## 1. 使用说明

本调研收集公开页面中的订单打印模板、模板编辑器、标签和小票截图。图片只用于内部需求分析和版式观察，不作为可直接复制的设计资产。

范围更新：餐饮 / Wix Restaurants / 厨房票据需求暂缓，不进入当前模板中心和模板编辑器规划；已收集到的餐饮样例仅作为后续可回看的暂存素材。

收集原则：

- 优先使用官方应用页面、应用市场截图和公开产品截图。
- 只记录图片来源、适用场景、纸张尺寸判断和对 PrintOps 的需求启发。
- 不照搬竞品模板视觉，不复刻 logo、文案、配色和完整布局。
- 后续 AI Template Designer 可以把这些作为“场景分类参考”，不能把竞品截图作为默认生成素材。

## 2. 场景与尺寸总览

| 场景 | 常见文档 | 典型尺寸 | P0 / 后续判断 |
|---|---|---|---|
| 客户凭证 | Invoice、Receipt、Order Print | A4、Letter | P0 必做 |
| 随箱打包 | Packing Slip、No-price Packing Slip | A4、Letter | P0 必做 |
| 仓库拣货 | Pick List、Batch Pick List | A4、Letter | P0 必做 |
| 定制生产 | Production Sheet、Work Order | A4、Letter | P0 必做 |
| 门店 / 小票 | Thermal Receipt、Pickup Ticket | 80mm | P0 做基础模板，P1 完善热敏细节 |
| 标签 | Product Label、Barcode Label、Shelf Label | 4x6、Avery、多栏标签 | P1 / P2 |
| 售后 | Return Form、Refund Note、Gift Receipt | A4、Letter | P1 |
| B2B / 财务 | Invoice Helper、Quote、Credit Note | A4、Letter | P1，P0 只做 helper，不承诺合规开票 |
| 餐饮（后续暂存） | Kitchen Ticket、Order Ticket、KDS Handoff | 80mm、屏幕票据 | Deferred，当前不规划 |

## 3. 核心观察

- 模板库必须可视化展示真实版式。用户需要像看“设计卡片”一样判断模板是否适合自己的品牌，而不是只看模板名称。
- A4 / Letter 文档的差异主要在信息密度和品牌感：客户文档重品牌、金额、政策；内部文档重 SKU、数量、图片和备注。
- 80mm 小票不是 A4 缩小版，需要独立的字段裁剪、字号、行距、分组和分页策略。
- 标签类模板更接近“网格和条码布局”，需要支持多栏、多张一页和条码组件。
- 餐饮场景暂缓，不作为当前模板优先级和数据模型验收依据；相关截图只保留为后续行业包参考。
- 模板编辑器的 P0 应该像 Vify / Order Printer Templates 一样以参数化配置为主；高级拖拽和精细布局可以放到 P3。
- WooCommerce 插件生态普遍把 invoice、packing slip、delivery note、shipping label、RTL、多文档批量打印放在同一产品里，这对 PrintOps 后续拓展 WordPress / WooCommerce 很有参考价值。

## 4. 图片样例库

### 4.1 Template Library / 视觉卡片库

来源：[Order Printer Templates](https://apps.shopify.com/order-printer-templates)

![Order Printer Templates - template gallery](https://cdn.shopify.com/app-store/listing_images/63c32315f5f5f0511ebb523baf68e186/promotional_image/COK-jNO4pIoDEAE=.jpeg?height=720&quality=90&width=1280)

观察：

- 用大缩略图展示多个 invoice / packing slip 设计。
- 分类维度包括 invoice、packing slip、return form、gift receipt。
- 对 PrintOps 的启发：Template Library 的卡片必须展示真实纸张缩略图，不能只用图标。

需求转化：

- P0 Template Library 需要支持 `All / Invoice Helper / Packing Slip / Pick List / Production Sheet / Thermal Receipt` 分类。
- 每张模板卡片需要展示纸张预览、文档类型、尺寸、场景、字段依赖和 `Use this template`。

### 4.2 A4 / Letter 品牌发票与商品图片

来源：[Order Printer Templates](https://apps.shopify.com/order-printer-templates)

![Order Printer Templates - branded invoice with product images](https://cdn.shopify.com/app-store/listing_images/63c32315f5f5f0511ebb523baf68e186/desktop_screenshot/CJiOntO4pIoDEAE=.jpeg?height=720&quality=90&width=1280)

观察：

- Invoice 使用大标题、地址块、商品图片、商品表格、金额汇总和页脚社交信息。
- 商品图片提升品牌体验，适合美妆、服饰、礼品等 DTC 商家。
- 版式留白较大，偏客户文档。

需求转化：

- P0 需要商品图片显示开关。
- P0 需要店铺 logo / 店铺名 / 地址 / 社交信息字段。
- P0 需要品牌色、字体、分割线和表格头样式配置。

### 4.3 P0 参数化编辑器参考

来源：[Order Printer Templates](https://apps.shopify.com/order-printer-templates)

![Order Printer Templates - no-code editor](https://cdn.shopify.com/app-store/listing_images/63c32315f5f5f0511ebb523baf68e186/desktop_screenshot/CJbGp9O4pIoDEAE=.jpeg?height=720&quality=90&width=1280)

观察：

- 右侧配置区分为 brand & styling、options & formats、text & language。
- 中间是实时预览。
- 用户不需要拖拽组件，也能完成大部分配置。

需求转化：

- PrintOps P0 编辑器采用 Vify 式 / 参数化配置，不做拖拽画布。
- 配置分组建议：Basic、Brand、Layout、Fields、Items table、Text、Validation。

### 4.4 多语言与本地化编辑

来源：[Order Printer Templates](https://apps.shopify.com/order-printer-templates)

![Order Printer Templates - text and language](https://cdn.shopify.com/app-store/listing_images/63c32315f5f5f0511ebb523baf68e186/desktop_screenshot/CKLzsNO4pIoDEAE=.jpeg?height=720&quality=90&width=1280)

观察：

- 多语言编辑不是简单切换界面语言，而是让模板固定文案可翻译。
- 可编辑字段包括店铺信息、联系方式、税务信息和固定标题。

需求转化：

- PrintOps 要区分 `site_locale` 和 `print_locale`。
- 模板固定文案用 localized text map 保存。
- P0 先支持固定文案跟随 print locale，P1 做完整多语言文案完整性检查。

### 4.5 Vify 式配置编辑器和 PDF 发票

来源：[Vify Order Printer PDF Invoice](https://apps.shopify.com/vify-order-printer)

![Vify - invoice editor and preview](https://cdn.shopify.com/app-store/listing_images/c162e01b4102134e35abffc3194cb4f8/desktop_screenshot/CKP27-OYtZEDEAE=.jpeg?height=720&quality=90&width=1280)

观察：

- 左侧配置 logo、颜色、字体、订单信息，右侧实时预览 PDF。
- 这是最接近 PrintOps P0 的形态：配置比拖拽更轻，用户学习成本低。

需求转化：

- P0 编辑器重点是模板参数，而不是自由拖拽。
- `Logo width`、`Lock aspect ratio`、`Enable` 这类简单控件可以明显降低编辑成本。
- 右侧预览必须和实际 PDF / Browser print 使用同一渲染链路。

### 4.6 Vify 多模板与多文档类型

来源：[Vify Order Printer PDF Invoice](https://apps.shopify.com/vify-order-printer)

![Vify - customizable template examples](https://cdn.shopify.com/app-store/listing_images/c162e01b4102134e35abffc3194cb4f8/desktop_screenshot/CISY-eOYtZEDEAE=.jpeg?height=720&quality=90&width=1280)

观察：

- 同一个工具覆盖 invoice、packing slip、refund、draft order。
- 模板的变化主要是信息组合、字段显隐和品牌参数，不一定需要完全不同的编辑器。

需求转化：

- PrintOps 的 `base template` 可以派生不同文档类型。
- `document_type`、`template_family`、`scenario_tags` 必须独立保存。

### 4.7 A4 / Letter 专业订单文件

来源：[Order Printer Pro](https://apps.shopify.com/order-printer-pro)

![Order Printer Pro - professional paperwork](https://cdn.shopify.com/app-store/listing_images/07a676cdf2f73a0075dd2921b7429d4c/desktop_screenshot/CPbZ88abpIoDEAE=.jpeg?height=720&quality=90&width=1280)

观察：

- 展示 invoice、receipt、packing slip、credit note 等多类纸质文档。
- 模板更偏业务文档而非营销视觉，黑白清晰、表格密集、可打印性强。

需求转化：

- P0 需要 `Invoice Helper`、`Receipt Helper`、`Packing Slip` 三类客户 / 财务文档。
- P1 可以增加 `Credit Note Helper`、`Refund Note`、`Return Form`。

### 4.8 高级拖拽 / 字段插入编辑器

来源：[Printout Designer](https://apps.shopify.com/printout-designer)

![Printout Designer - advanced editor with data fields](https://cdn.shopify.com/app-store/listing_images/00f4ab9aa170dd7934b5b0ed0799dcfd/desktop_screenshot/CL668MSGiIcDEAE=.png?height=720&width=1280)

观察：

- 左侧是 data fields，中心是纸张画布，右侧是属性面板。
- 支持选中组件、插入字段、调整格式和布局。
- 学习成本高，但覆盖复杂定制场景。

需求转化：

- PrintOps P3 才进入这种高级拖拽和精细布局。
- P0 底层必须先保存 `component_tree`、`field_binding`、`style schema`，为未来升级保留路径。

### 4.9 商品标签 / 条码标签

来源：[Printout Designer](https://apps.shopify.com/printout-designer)

![Printout Designer - product barcode labels](https://cdn.shopify.com/app-store/listing_images/00f4ab9aa170dd7934b5b0ed0799dcfd/desktop_screenshot/CP3Fieqgm4wDEAE=.png?height=720&width=1280)

观察：

- 标签类文档是多栏 / 多张一页布局。
- 核心组件是 barcode、商品名、variant、价格、SKU。
- 与订单 A4 文档完全不同。

需求转化：

- P1 / P2 需要支持 Barcode / QR Code 组件。
- 标签类模板需要独立 `paper_size` 和 `grid_layout`。
- P0 不做完整标签编辑，但数据模型保留 4x6 和标签纸预设。

### 4.10 打印按钮和按场景分组

来源：[Printrooster Order Printer](https://apps.shopify.com/printrooster-order-printer)

![Printrooster - group printing buttons](https://cdn.shopify.com/app-store/listing_images/54a136b7c20b26afb771b36a0806001e/desktop_screenshot/CKj1q4W62IUDEAE=.jpeg?height=720&quality=90&width=1280)

观察：

- 打印入口按 Packing slips、Invoices、Product labels 等场景分组。
- 按 warehouse / shipping location 过滤后再打印。

需求转化：

- PrintOps Orders 页面未来可以按文档类型和履约位置提供快捷打印。
- 模板默认规则需要支持 `document_type + store/location + fulfillment method`。

### 4.11 Pick List / Packing Slip / 小票混合模板

来源：[Printrooster Order Printer](https://apps.shopify.com/printrooster-order-printer)

![Printrooster - unlimited templates](https://cdn.shopify.com/app-store/listing_images/54a136b7c20b26afb771b36a0806001e/desktop_screenshot/CN3uoYW62IUDEAE=.jpeg?height=720&quality=90&width=1280)

观察：

- 同一产品里同时出现 invoice、packing slip、receipt、pick list 和热敏小票。
- Pick List 更关注 SKU / 数量 / 商品分组，视觉上更像内部表格。

需求转化：

- P0 模板库需要覆盖 `Pick List` 和 `Production Sheet`，不是只做客户单据。
- 内部作业模板默认隐藏客户营销信息，突出 SKU、数量、图片、custom fields。

### 4.12 后续暂存：餐饮 modifiers / prep area 场景

来源：[POS Cafe](https://apps.shopify.com/poscafe)

![POS Cafe - modifiers](https://cdn.shopify.com/app-store/listing_images/c59a66349002aaa7fb6ae9393d6ce7da/desktop_screenshot/CJ2Q0ezFxI0DEAE=.png?height=720&width=1280)

观察：

- 餐饮订单的核心是 modifier、加价项、prep area、取餐/堂食/外带等信息。
- 这类数据不是普通商品 variant 可以完全表达的。

当前处理：

- 不进入当前 P0 / P1 模板中心需求。
- 不作为当前 Field Registry、Template Editor 或 80mm 模板验收依据。
- 后续如果重启餐饮行业包，再单独调研 Wix Restaurants 数据结构。

### 4.13 后续暂存：餐饮订单票据 / 80mm 方向

来源：[POS Cafe](https://apps.shopify.com/poscafe)

![POS Cafe - order tickets](https://cdn.shopify.com/app-store/listing_images/c59a66349002aaa7fb6ae9393d6ce7da/desktop_screenshot/CM798OzFxI0DEAE=.png?height=720&width=1280)

观察：

- Order Ticket 视觉方向接近 80mm 小票，内容通常按菜品、数量、modifier、prep area 分组。
- 需要清晰的大字号、短字段和分隔线。

当前处理：

- 当前只保留门店小票 / 普通 Thermal Receipt 的版式能力。
- Kitchen Ticket / 餐饮 Pickup Ticket 不进入当前开发范围。

### 4.14 后续暂存：KDS 与打印票据关系

来源：[POS Cafe](https://apps.shopify.com/poscafe)

![POS Cafe - KDS integration](https://cdn.shopify.com/app-store/listing_images/c59a66349002aaa7fb6ae9393d6ce7da/desktop_screenshot/CJSg5uzFxI0DEAE=.png?height=720&width=1280)

观察：

- 餐饮不仅是打印，还有厨房屏幕、订单优先级、hold、prep state。
- 对 PrintOps 当前版本来说，KDS 和餐饮票据不进入模板结构和验收范围。

当前处理：

- 暂不设计厨房状态、出餐状态、KDS 或餐饮打印状态。
- 保留结论：未来如进入餐饮场景，打印状态和厨房状态不能混为一谈。

### 4.15 WooCommerce 简洁发票 / 装箱单

来源：[WooCommerce PDF Invoices & Packing Slips](https://wordpress.org/plugins/woocommerce-pdf-invoices-packing-slips/)

![WooCommerce PDF Invoices & Packing Slips - simple invoice PDF](https://ps.w.org/woocommerce-pdf-invoices-packing-slips/assets/screenshot-1.jpg?rev=2669669)

![WooCommerce PDF Invoices & Packing Slips - simple packing slip PDF](https://ps.w.org/woocommerce-pdf-invoices-packing-slips/assets/screenshot-2.jpg?rev=2669669)

观察：

- 发票和装箱单共享同一套黑白业务版式：店铺信息、账单 / 收货地址、订单信息、商品表格和页脚。
- Invoice 保留金额和税费；Packing Slip 重点转向商品、数量和收货信息。
- 视觉不复杂，但稳定、清楚、适合大多数商家作为默认 fallback 模板。

需求转化：

- P0 内置模板必须有一套“朴素可靠”的基础样式，不只追求品牌感。
- 同一个 `template_family` 可以派生 `invoice_helper` 和 `packing_slip`，通过字段开关控制价格、税费和付款信息。
- 预览缩略图要区分文档类型，避免用户以为只是同一张模板改标题。

### 4.16 WooCommerce 配送单 / 物流面单方向

来源：[WebToffee WooCommerce PDF Invoices, Packing Slips, Delivery Notes and Shipping Labels](https://wordpress.org/plugins/print-invoices-packing-slip-labels-for-woocommerce/)

![WebToffee - delivery note](https://ps.w.org/print-invoices-packing-slip-labels-for-woocommerce/assets/screenshot-4.png?rev=3142949)

![WebToffee - shipping label](https://ps.w.org/print-invoices-packing-slip-labels-for-woocommerce/assets/screenshot-5.png?rev=3142949)

观察：

- Delivery Note 介于 Packing Slip 和本地配送单之间，保留地址、商品、订单号和签收类信息。
- Shipping Label 更接近 4x6 / 标签纸场景，核心是收发件地址、订单号、条码 / 追踪号和可裁切区域。
- 这类模板不一定等同于“发货平台面单”，但能满足商家内部配送、门店自配送和手工交接需求。

需求转化：

- P1 模板库应增加 `Delivery Note`，尺寸支持 A4 / Letter / 4x6。
- P1 / P2 增加 `Address Label` / `Shipping Label Helper`，定位为内部标签和交接单，不承诺承运商官方面单。
- 数据层预留 shipment、tracking_number、delivery_window、pickup_location、recipient_phone。

### 4.17 RTL / 多语言阅读方向参考

来源：[WebToffee WooCommerce PDF Invoices, Packing Slips, Delivery Notes and Shipping Labels](https://wordpress.org/plugins/print-invoices-packing-slip-labels-for-woocommerce/)

![WebToffee - RTL invoice](https://ps.w.org/print-invoices-packing-slip-labels-for-woocommerce/assets/screenshot-2.png?rev=2735319)

观察：

- RTL 不只是把固定文案翻译成另一种语言，地址块、表格阅读顺序、金额汇总位置和对齐方式都会变化。
- 发票类文档尤其需要处理税号、公司信息、货币格式、日期格式和数字方向。

需求转化：

- P0 先支持模板固定文案多语言和 `print_locale`；不要在设置页暴露复杂 reading order。
- 模板 JSON 从第一版预留 `direction: ltr | rtl` 和 locale-aware formatting。
- P1 做语言完整性检查和 RTL 预览；P2 再考虑按语言切换布局规则。

### 4.18 WooCommerce 自定义器 / 文档类型覆盖

来源：[WebToffee WooCommerce PDF Invoices, Packing Slips, Delivery Notes and Shipping Labels](https://wordpress.org/plugins/print-invoices-packing-slip-labels-for-woocommerce/)

![WebToffee - customizer](https://ps.w.org/print-invoices-packing-slip-labels-for-woocommerce/assets/screenshot-13.png?rev=3142949)

![WebToffee - supported document types](https://ps.w.org/print-invoices-packing-slip-labels-for-woocommerce/assets/screenshot-16.png?rev=3142949)

观察：

- WooCommerce 场景里，模板编辑通常和文档类型设置放在一起：invoice、packing slip、delivery note、dispatch label 等。
- 自定义器更像表单配置 + 预览，不是完整自由拖拽。
- 插件会把 company info、address、invoice number、email attachment、bulk print 等能力串联在同一配置流程中。

需求转化：

- PrintOps P0 Template Editor 保持“参数配置 + 预览”的路线是合理的。
- Template Center 需要按文档类型清楚分类，而不是把所有模板混在一起。
- Settings 里应预留 Company / Store Profile、Numbering、Email Attachment、Bulk Print Entry 的能力位，但 P0 先聚焦打印。

### 4.19 订单列表 / 批量打印入口

来源：[WooCommerce PDF Invoices & Packing Slips](https://wordpress.org/plugins/woocommerce-pdf-invoices-packing-slips/)、[WebToffee WooCommerce PDF Invoices, Packing Slips, Delivery Notes and Shipping Labels](https://wordpress.org/plugins/print-invoices-packing-slip-labels-for-woocommerce/)

![WooCommerce PDF Invoices & Packing Slips - print from order list](https://ps.w.org/woocommerce-pdf-invoices-packing-slips/assets/screenshot-3.jpg?rev=2669669)

![WooCommerce PDF Invoices & Packing Slips - bulk print](https://ps.w.org/woocommerce-pdf-invoices-packing-slips/assets/screenshot-4.jpg?rev=2669669)

![WebToffee - bulk print options](https://ps.w.org/print-invoices-packing-slip-labels-for-woocommerce/assets/screenshot-9.png?rev=3142949)

观察：

- 打印能力不只在模板中心里发生，用户更多时候从订单列表、订单详情和批量操作中触发打印。
- 不同文档类型通常作为批量操作菜单出现。
- 这能减少用户进入模板中心的频率，让模板中心回归“设计和管理”。

需求转化：

- P0 Orders 页面需要有单订单打印和批量打印入口。
- 批量打印时选择 `document_type`，系统使用该类型默认模板。
- 打印后记录 `print_job` 和 `printed_at`，但 Browser print 场景只能标记为 `sent_to_browser_print`，不能保证真实打印成功。

## 5. PrintOps 模板库建议

### 5.1 P0 模板库首批

| 模板 | 场景 | 尺寸 | 视觉方向 |
|---|---|---|---|
| Branded Packing Slip | 随箱打包 / 客户文档 | A4、Letter | 品牌感、商品图片、地址清晰 |
| Compact Packing Slip | 仓库打包 | A4、Letter | 高密度、少装饰、SKU / qty 优先 |
| Pick List | 仓库拣货 | A4、Letter | 表格优先、按 SKU / 商品分组 |
| Production Sheet | 定制商品生产 | A4、Letter | 商品图片大、custom fields 大字号 |
| Invoice Helper | 财务辅助 / 客户凭证 | A4、Letter | 金额、税、公司信息清晰 |
| Receipt Helper | 付款记录 | A4、Letter | 已付款状态、金额汇总、支付方式 |
| Thermal Receipt | 门店小票 | 80mm | 紧凑、短字段、清晰分隔 |

### 5.2 P1 / P2 模板库扩展

| 模板 | 场景 | 尺寸 | 视觉方向 |
|---|---|---|---|
| Gift Receipt | 礼品随箱 | A4、Letter、80mm | 隐藏价格、礼品留言 |
| Return Form | 售后退货 | A4、Letter | 退货说明、RMA、客户填写区 |
| Delivery Note | 本地配送 | A4、Letter、4x6 | 地址、电话、配送时间、签收 |
| Shipping Label Helper | 内部发货 / 自配送交接 | 4x6、A4 多栏 | 地址、电话、订单号、条码 / 追踪号 |
| Pickup Ticket | 自提 | 80mm、4x6 | 取货号、时间、电话 |
| Product Label | 商品标签 | 4x6、Avery | 条码、SKU、价格、variant |
| Barcode Sheet | 仓库标签 | A4、Letter、多栏标签纸 | 多栏条码、商品名、SKU |

## 6. 对模板编辑器的影响

P0 必须支持：

- 选择内置风格模板。
- Logo、品牌色、字体。
- 纸张尺寸和密度。
- 字段显示 / 隐藏。
- 商品图片显示 / 隐藏。
- 商品表格列配置。
- 固定文案和多语言文案。
- 样例订单预览。
- 订单列表和订单详情中的打印入口。

P1 需要准备：

- 组件级变量绑定。
- Repeat component：line items、shipments、refund items。
- Barcode / QR Code。
- Field Registry 字段搜索。
- 模板版本。
- Delivery Note / Shipping Label Helper。
- RTL 预览和语言完整性检查。

P2 / P3 需要准备：

- 内容块库。
- 条件显示。
- 高级拖拽。
- 精细布局和坐标。
- 自定义纸张 / 标签纸。

## 7. 尚未充分收集的图片类型

下一轮继续补：

- 更多真实 4x6 delivery / pickup note，尤其是实际打印纸照片。
- Production Sheet / Work Order 的公开截图。
- Return Form / Gift Receipt 的具体版式截图。
- WooCommerce Pro 模板包和更多 WordPress 生态高级模板截图。
- 餐饮 / Wix Restaurants 暂缓，不继续作为当前轮收集重点。

## 8. 来源索引

- [Order Printer Templates](https://apps.shopify.com/order-printer-templates)
- [Vify Order Printer PDF Invoice](https://apps.shopify.com/vify-order-printer)
- [Order Printer Pro](https://apps.shopify.com/order-printer-pro)
- [Printout Designer](https://apps.shopify.com/printout-designer)
- [Printrooster Order Printer](https://apps.shopify.com/printrooster-order-printer)
- [POS Cafe](https://apps.shopify.com/poscafe)（餐饮样例，后续暂存）
- [WooCommerce PDF Invoices & Packing Slips](https://wordpress.org/plugins/woocommerce-pdf-invoices-packing-slips/)
- [WebToffee WooCommerce PDF Invoices, Packing Slips, Delivery Notes and Shipping Labels](https://wordpress.org/plugins/print-invoices-packing-slip-labels-for-woocommerce/)
