# Wix 首发版本发布与测试接入计划

模块说明：先发布 PrintOps v0.1 可测试版本，再接入 Wix 开发环境获取真实订单数据。P0 目标是验证“安装 Wix App -> 同步订单 -> 选择 Invoice 模板 -> 预览 / 下载 PDF / 打印”的最短闭环。

## 1. 发布策略

### 1.1 版本名称

- 产品名：Zider PrintOps
- 首发版本：`v0.1 Wix Preview`
- 发布目标：内部测试 / Wix 开发环境安装测试
- 不进入 Wix App Market 正式上架审核

### 1.2 发布范围

包含：

- PrintOps 工作台壳层。
- Orders 页面入口。
- Template Center。
- A4 Invoice 模板库。
- Big Brand Invoice 模板预览、下载 PDF、浏览器打印。
- 模板配置编辑器。
- 多语言打印标签、日期格式、地址格式、SKU、订单条形码、自定义字段承接。
- Wix 插件 dashboard 路由：`/apps/printops/wix`。

暂不包含：

- 长期历史订单同步。
- 发货回写 Wix。
- 打印机直连。
- 餐饮订单。
- 复杂拖拽式模板编辑器。
- 正式计费。

## 2. 发布前检查清单

### 2.1 技术检查

- `apps/workspace` typecheck 通过。
- `packages/platform-plugins` typecheck 通过。
- `/apps/printops/templates` 可打开。
- `/apps/printops/wix?instanceId=wix-dev-preview` 可打开。
- 下载 PDF 为单页 A4 Invoice。
- 浏览器打印预览尺寸正确。
- 切换模板打印语言后，预览、PDF、浏览器打印一致。
- Arabic 打印语言时，模板根节点使用 `dir="rtl"`。

### 2.2 配置检查

Workspace 发布环境需要：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WIX_PRINTOPS_APP_ID`
- `WIX_PRINTOPS_APP_SECRET`

如使用数据库保存 app secret，则写入：

- `app_platform_secrets.app_key = zider_printops`
- `app_platform_secrets.platform = wix`
- `oauth_client_id`
- `oauth_client_secret`
- `app_secret`
- `webhook_public_key`

### 2.3 Wix Developer Console 检查

Wix App 设置：

- App name：Zider PrintOps
- Dashboard URL：`https://workspace.zider.ink/apps/printops/wix`
- Redirect / allowed URLs：包含 workspace 发布域名
- App credentials：保存到环境变量或 `app_platform_secrets`

权限：

- Read Orders
- Read Stores / site info
- Read Products（P0 可选，后续产品字段和 SKU 补全需要）

Webhooks：

- App Instance Installed
- App Instance Removed
- Order Created
- Order Updated
- Order Canceled / Deleted，如 Wix 当前事件可用

## 3. Wix 订单接入方案

### 3.1 数据来源

Wix 是订单来源，PrintOps 是打印中转站和打印快照系统。

P0 不实时把每个页面请求都打到 Wix，而是：

1. 安装 / 首次打开时同步最近订单。
2. 列表和模板预览读取 PrintOps 数据库。
3. 打印 / 下载 PDF 前可按需刷新订单详情。
4. 订单变更通过 webhook 增量更新。

### 3.2 首次同步

首次同步策略：

- 默认同步最近 24 小时订单。
- 手动历史同步最多 7 天。
- 使用 `updatedDate` 倒序同步，保证订单状态变更、支付变更、履约变更可以覆盖旧记录。
- 每页默认 50 条。
- P0 最多连续同步 10 页，超过后保留 `nextCursor` 继续执行。

### 3.3 订单更新

订单状态更新必须覆盖当前订单主记录。

当前订单主记录更新：

- payment status
- fulfillment status
- order status
- customer
- billing address
- shipping address
- line items
- SKU
- item options
- checkout custom fields
- totals
- tax
- discount
- delivery method

打印快照不自动修改：

- 每次生成 PDF 或打开打印预览时生成独立 `print_snapshot`。
- 已生成的 PDF 记录使用当时订单数据。
- 后续如果订单变化，不回写历史打印文件。

P0 UI 不显示“需重打”状态，但底层预留：

- `orders.updated_at`
- `print_documents.order_updated_at`
- `print_documents.created_at`

## 4. 数据库模型 P0

### 4.1 `platform_connections`

存储 Wix 安装站点。

关键字段：

- `id`
- `app_key`
- `platform`
- `instance_id`
- `site_id`
- `site_owner_id`
- `status`
- `access_token_status`
- `last_synced_at`
- `created_at`
- `updated_at`

### 4.2 `source_orders`

存储订单当前状态和原始 payload。

关键字段：

- `id`
- `connection_id`
- `source_platform`
- `source_order_id`
- `order_number`
- `created_at_source`
- `updated_at_source`
- `payment_status`
- `fulfillment_status`
- `order_status`
- `customer_snapshot`
- `billing_address_snapshot`
- `shipping_address_snapshot`
- `totals_snapshot`
- `raw_payload`
- `normalized_payload`
- `custom_fields`
- `line_items`
- `synced_at`

### 4.3 `print_documents`

存储一次打印或 PDF 生成的快照。

关键字段：

- `id`
- `connection_id`
- `source_order_id`
- `template_id`
- `print_language`
- `document_type`
- `order_updated_at_source`
- `snapshot_payload`
- `pdf_url`
- `status`
- `created_at`

### 4.4 `order_sync_runs`

存储同步任务状态。

关键字段：

- `id`
- `connection_id`
- `mode`
- `from`
- `to`
- `cursor`
- `next_cursor`
- `orders_seen`
- `orders_upserted`
- `status`
- `error_message`
- `started_at`
- `finished_at`

## 5. 开发任务拆分

### 5.1 v0.1 发布任务

- 更新 workspace 路由说明。
- 修复 PrintOps Wix dashboard 使用自己的 app secret。
- 补齐 `WIX_PRINTOPS_*` 环境变量说明。
- 跑 typecheck。
- 跑 workspace build。
- 发布 workspace preview。
- 用 preview URL 配置 Wix dashboard URL。

### 5.2 Wix 插件测试任务

- 在 Wix Developer Console 创建 Zider PrintOps app。
- 配置 dashboard URL。
- 配置权限。
- 安装到 Wix 测试站点。
- 获取真实 `instance` 参数并验证签名。
- 使用 `instance_id` 换取 access token。
- 调用 Wix Orders Search API 同步最近 24 小时订单。
- 保存 raw payload 和 normalized order。
- 在 Orders 页面展示同步订单。
- 用同步订单渲染 Big Brand Invoice。

### 5.3 Webhook 任务

- 接收 App Instance Installed。
- 接收 App Instance Removed。
- 接收 Order Created。
- 接收 Order Updated。
- Webhook 事件去重。
- Webhook 原始 payload 存档。
- Webhook 触发订单详情刷新或增量 upsert。

## 6. 测试场景

### 6.1 标准订单

1. Wix 测试站点创建普通商品订单。
2. PrintOps 同步订单。
3. Orders 页面显示订单号、客户、金额、状态。
4. 用 Big Brand Invoice 预览。
5. 下载 PDF。
6. 浏览器打印。

### 6.2 自定义字段订单

1. Wix checkout 添加 custom field。
2. 创建订单并填写字段。
3. PrintOps 同步 raw payload。
4. Template Field Registry 能发现字段。
5. Invoice 可打印自定义字段。

### 6.3 订单状态更新

1. 创建未履约订单。
2. PrintOps 同步。
3. Wix 后台修改支付 / 履约 / 地址 / 备注。
4. Webhook 或手动同步更新 PrintOps 当前订单。
5. 新 PDF 使用最新订单。
6. 老 PDF 快照保持不变。

## 7. 验收标准

P0 测试通过标准：

- Wix 测试站点可以打开 PrintOps dashboard。
- 可以识别真实 `instance_id`。
- 可以拿到 Wix access token。
- 可以同步最近 24 小时订单。
- 可以同步最多 7 天历史订单。
- 可以接住订单状态更新。
- 可以保留 raw payload。
- 可以提取 SKU、item options、自定义字段。
- 可以用真实订单生成 A4 Invoice PDF。
- 打印快照不被后续订单更新覆盖。
