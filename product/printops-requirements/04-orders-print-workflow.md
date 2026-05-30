# 订单工作台、打印链路与关键流程

版本：v0.2
更新日期：2026-05-30
来源：从 [Zider PrintOps 产品需求文档](../order-printing-product-requirements.md) 按模块拆分
模块说明：店铺连接、订单列表、订单详情、打印预览、批量 PDF、Print Job、发货扩展和关键用户流程。
## 1. 店铺、订单与打印链路

### 8.1 店铺连接与订单同步

P0：

- 支持连接 Wix Stores。
- 支持一个商家组织下连接多个 Wix 店铺。
- 支持顶部或侧栏店铺切换器。
- 支持最新订单同步：按 `lastSyncedAt` 拉取变更订单；如果当前店铺从未同步，默认回看最近 24 小时。
- 支持最近 7 天历史订单手动同步，用于新安装店铺补齐近期订单和测试模板。
- 不支持超过 7 天的历史回溯；如果商家需要更久历史，先作为 P1 / P2 导入能力评估。
- 支持拉取订单列表和订单详情。
- 支持保存平台原始订单 payload。
- 支持将原始 payload 转换为标准订单模型，并保留订单级和订单行级自定义字段。
- 支持记录订单同步时间。
- 支持手动刷新单个订单。
- 支持同步失败提示。
- 支持订单按店铺隔离。

P1：

- 支持 webhook 事件驱动增量同步。
- 支持 webhook 事件处理。
- 支持首次导入最近 N 天订单或更长历史订单导入任务。
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

## 2. 打印输出、记录与发货扩展

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

1. 商家进入 Product Fields。
2. 系统同步当前 Wix 店铺产品和变体。
3. 商家打开某个产品。
4. 商家添加产品级打印字段，如 packing instruction、material、care instruction。
5. 商家为某个变体添加变体级打印字段，如 bin location、supplier SKU。
6. 商家在 Production Sheet 模板中开启这些字段。
7. 后续订单打印时，订单行自动带出产品和变体打印字段。

### 9.8 餐饮厨房热敏出单（Deferred）

餐饮 / Wix Restaurants 暂缓，当前不设计用户流程。后续如重启，需要重新确认数据可读性、厨房票字段、热敏打印链路和门店作业状态。

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
