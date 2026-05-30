# 模板场景与文档类型

版本：v0.3
更新日期：2026-05-29
来源：从 [Zider PrintOps 产品需求文档](../order-printing-product-requirements.md) 按模块拆分
模块说明：模板场景、文档类型、模板库业务场景矩阵，以及餐饮 Deferred 说明。
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

- P0 默认先聚焦 `Invoice` 模板，覆盖 Wix 默认订单字段和优化样式。
- 商家可以手动选择模板。
- 系统可以为常见场景推荐默认模板。
- 模板选择不改变订单原始数据。
- 打印状态按订单 + 文档类型 + 模板记录。
- P0 打印状态只保留：未打印、已生成、已发送打印、已标记已打印、失败。
- 字段缺失、模板校验、订单异常作为校验提示展示，不作为独立打印状态。
- 前期不设计“需重打”状态；如商家需要再次输出，按新的打印记录处理。

P1 要求：

- 支持模板自动匹配规则。
- 支持规则优先级。
- 支持规则预览：显示某个订单为什么匹配某个模板。
- 支持模板 fallback：没有命中规则时使用默认模板。

### 6.1 标准邮寄模板场景

功能要求：

- P0 首先以 `Invoice` 模板覆盖 Wix 默认订单字段，渲染为客户可见发票样式，包含订单号、客户联系信息、商品选项、金额汇总、付款方式、配送 / 账单地址、配送方式和店铺页脚。
- 显示商品名称、SKU、variant、数量、图片。
- 显示 shipping address、billing address。
- 支持 buyer note、gift note。
- 显示 payment status、fulfillment status。
- 支持配置是否显示价格。
- 打印后可标记为已打印。

推荐模板：

- Order
- Packing Slip
- Pick List

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

### 6.10 餐饮 / 外卖 / 堂食模板场景（Deferred）

当前处理：

- 餐饮 / Wix Restaurants 暂缓，不进入当前 P0 / P1 模板、字段、打印链路需求。
- 暂不设计 Kitchen Ticket、餐饮 Pickup Ticket、餐饮 Delivery Ticket、KDS、厨房状态或餐饮 modifier / allergy note 字段。
- 后续如果重启餐饮行业包，再单独调研 Wix Restaurants 数据读取、厨房票和热敏打印流程。

## 7. 文档类型

| 文档类型 | 主要对象 | 是否面向客户 | 核心字段 |
|---|---|---|---|
| Invoice | 客户 / 商家通用发票打印 | 视配置 | 订单号、下单时间、客户联系信息、商品选项、金额、付款方式、配送 / 账单地址、配送方式、店铺页脚 |
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
P0 内置模板库：

- Invoice。
- 其他 Packing Slip、Pick List、Production Sheet、Invoice Helper、Receipt Helper、Thermal Receipt 作为后续模板类型预留，不进入当前首批实现重点。

P0 默认模板与场景：

| 模板 | 文档类型 | 场景 | 默认尺寸 | 受众 | 默认风格 |
|---|---|---|---|---|---|
| Wix Invoice - Big Brand | Invoice | Wix 默认订单字段渲染为发票样式，客户可见 | A4 | 客户 / 商家 | Big Brand |
| Wix Invoice - Market | Invoice | 零售履约、门店复核、随箱发票 | A4 | 门店员工 / 仓库 | Retail Compact |
| Wix Invoice - Mono | Invoice | 付款、税费、礼品卡等金额核对和低墨量打印 | A4 | 门店员工 / 财务 | Mono Sharp |
| Wix Invoice - Modern | Invoice | 客户可见发票 / 随箱凭证 | A4 | 客户 | Brand Standard |
| Wix Invoice - Minimal | Invoice | 低墨量归档 / 快速打印 | A4 | 商家内部 | Plain Default |
| Wix Invoice - Field Map | Invoice | 字段映射验收样例 | A4 | 开发 / 配置人员 | Field Reference |

P0 默认风格：

| 风格 | 用途 |
|---|---|
| Big Brand | 更好看的客户发票，保留大品牌字标、商品图片、双地址区、品牌页脚和社交媒体信息 |
| Retail Compact | 零售 / 履约复核，强调 Logo、商品图、客户信息块和社媒页脚 |
| Mono Sharp | 高对比低墨量，强调商品缩略图、金额和付款方式 |
| Plain Default | 系统 fallback，黑白、低装饰、信息完整 |
| Brand Standard | 客户随箱和客户凭证，强调 logo、品牌色和页脚文案 |
| Warehouse Compact | 仓库拣货和打包复核，强调 SKU、qty 和高密度表格 |
| Production Focus | 定制生产，强调商品图片、custom fields 和备注区 |
| Finance Simple | 财务辅助，强调金额汇总、税号、PO number 和付款状态 |
| Thermal Basic | 80mm 输出，强调短字段、粗分隔线和无图片 |

P0 开发顺序：

| 顺序 | 模板 | 对应场景 | 说明 |
|---|---|---|---|
| T0.1 | Wix Invoice - Big Brand | Wix 默认订单 / 客户可见 | 第一张可视化模板，保留大品牌字标发票风格，验证 Logo、商品图、订单字段、金额和社媒页脚 |
| T0.2 | Wix Invoice - Market | 零售履约 / 门店复核 | 第二张可视化模板，验证商品图、紧凑信息块和社媒页脚 |
| T0.3 | Wix Invoice - Mono | 付款核对 / 低墨量打印 | 第三张可视化模板，验证商品缩略图、金额汇总和黑白高对比风格 |
| T0.4 | Custom Production Sheet | 定制商品 | 验证 custom fields、商品图片、上传文件和生产备注 |
| T0.5 | Simple Invoice Helper / Paid Receipt Helper | 财务 / 客户凭证 | 验证金额汇总、付款状态、tax id 和 PO number 预留 |
| T0.6 | Basic Thermal Receipt | 门店 / 自提 | 验证 80mm 窄幅、短字段和溢出提示，不做设备连接 |
| T0.7 | 4x6 Handoff Slip | 交接 / 手工贴箱 | P0.1 可选，只作为内部交接文档，不是承运商面单 |

P0 场景边界：

- P0 模板场景覆盖 Wix Stores 通用电商订单，不覆盖餐饮和厨房出单。
- 模板场景用于推荐和筛选模板，不需要创建独立“订单类型”实体。
- 一个订单可以按不同文档类型多次输出，如 Packing Slip、Pick List、Receipt Helper。
- 模板选择和打印记录不能修改订单原始数据。
- 发货平台对接、tracking 回写和承运商面单属于后续 Shipping Bridge，不进入 P0。

P1 / P2 扩展模板库：

- Gift Receipt。
- Return Form。
- Delivery Note。
- Refund Note。
- Quote Helper。
- Credit Note Helper。
- 细分行业模板包，如定制商品、花店、蛋糕、活动用品。

说明：

- Invoice Helper、Receipt Helper、Quote Helper、Credit Note Helper 是订单凭证和内部协助文档，不承诺合法税务开票、电子发票或本地税务合规。

### 7.1 模板库业务场景矩阵

模板库不按“好看的样式列表”组织，而按商家的业务动作组织。每个模板需要标记 `document_type`、`scenario`、`audience`、`paper_size`、`data_requirements` 和 `recommended_use`。

| 场景分类 | 业务动作 | 推荐模板 | 受众 | 阶段 |
|---|---|---|---|---|
| Fulfillment | 打包、随箱、配送交接 | Packing Slip、Delivery Note | 仓库 / 客户 / 配送员 | P0 / P1 |
| Picking | 按 SKU / 货位拣货 | Pick List、Batch Pick List | 仓库 | P0 / P1 |
| Production | 定制商品制作、备货 | Production Sheet、Internal Order Print | 生产人员 | P0 |
| Customer Documents | 客户凭证、付款记录 | Receipt Helper、Gift Receipt、Return Form | 客户 / 售后 | P0 / P1 |
| Finance Helper | 财务辅助、B2B 对账 | Invoice Helper、Quote Helper、Credit Note Helper | 财务 / B2B 客户 | P0 / P1 |
| Store / POS | 门店自提、线下小票 | Thermal Receipt、Pickup Slip | 门店员工 / 客户 | P0 / P1 |
| Returns | 退货、换货、退款说明 | Return Form、Refund Note、Replacement Slip | 客户 / 售后 | P1 |
| Shipping Bridge | 发货平台交接、tracking 回写 | Shipment Summary、Carrier Handoff Sheet | 仓库 / 物流 | P3 |

模板设计差异：

- 客户文档：强调品牌、金额、政策、联系方式、语言和可读性。
- 内部作业文档：强调 SKU、数量、商品图片、custom fields、产品打印字段、异常提示和大字号关键字段。
- B2B / 财务辅助文档：强调 tax ID、VAT、PO number、公司信息、付款状态和金额汇总。
- 热敏 / 门店文档：强调 80mm 宽度、紧凑排版、短字段、时间和取货 / 配送状态。
