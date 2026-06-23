# Wix 首发版本发布与测试接入计划

版本：v0.2
更新日期：2026-06-23

模块说明：先发布 PrintOps v0.1 可测试版本，再接入 Wix 开发环境获取真实订单数据。P0 目标是验证“安装 Wix App -> 同步订单 -> 选择 Invoice 模板 -> 预览 / 下载 PDF / 打印”的最短闭环。

## 1. 发布策略

### 1.1 版本名称

- 产品名：Zider PrintOps
- 当前版本：`v0.5+ Wix Preview / Market readiness`
- 发布目标：Wix 开发环境、Wix 后台内嵌测试、App Market 上架前回归
- 部署目标 Vercel 账户：`duorouai-5425s-projects`
- 部署方式：推送 GitHub 主分支后由 Vercel 自动部署

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

当前已接入但仍需配置验证：

- Account binding 邮箱验证码。
- Wix billing plan 镜像和 Upgrade URL。
- Wix backend extension 订单事件转发。
- 每 3 分钟订单列表刷新。
- 订阅用量按当月订单数计算。

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

Workspace / App 接收端发布环境需要：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ZIDER_PRINTOPS_WIX_APP_ID`，用于生成 Wix upgrade URL；兼容旧名 `WIX_PRINTOPS_APP_ID`
- `WIX_PRINTOPS_APP_SECRET` 或数据库 `app_platform_secrets`，用于 Wix OAuth / instance 验证
- `ZIDER_WIX_EVENT_FORWARD_SECRETS={"zider_printops":"<random-secret>"}`
- `ZIDER_PRINTOPS_WIX_PLAN_IDS=free=basic,free;starter=starter;pro=pro;business=business`
- `BREVO_API_KEY`
- `ACCOUNT_BINDING_FROM_EMAIL=support@zider.ink`
- `ACCOUNT_BINDING_FROM_NAME=ZIDER`

Wix backend extension 环境需要：

- `ZIDER_WIX_EVENT_FORWARD_SECRETS={"zider_printops":"<same-random-secret>"}`
- `PRINTOPS_WIX_EVENT_INGEST_URL=https://app.zider.ink/webhooks/printops/wix`，默认值已指向生产接收端，但建议显式配置

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
- Order Approved / Payment / Fulfillment 相关事件，如 Wix 当前事件可用

Webhook 验收：

- Wix Developer Console 测试 Order Created / Updated 返回 2xx。
- Vercel 日志不再出现 `/webhooks/printops/wix` 401。
- 如果仍是 401，优先检查 Wix backend extension 和 Vercel 是否使用同一份 `ZIDER_WIX_EVENT_FORWARD_SECRETS`。
- app lifecycle / billing event 必须打到 `/events/wix/zider_printops` 或专用 billing endpoint，不能打到 `/webhooks/printops/wix`。

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

- 默认同步最近 3 天订单。
- 手动历史同步最多 7 天，并放入更多菜单。
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

- `printops_orders.source_updated_at`
- `printops_orders.updated_at`
- 后续 `print_documents.order_updated_at_source`
- 后续 `print_documents.created_at`

## 4. 数据库模型 P0

### 4.1 `printops_orders`

存储 PrintOps 当前可打印订单状态。P0 使用它作为 Orders 页面、模板预览、PDF 和浏览器打印的数据来源。

唯一键：

- `app_key`
- `platform`
- `instance_id`
- `source_order_id`

关键字段：

- `id`
- `app_key`
- `platform`
- `instance_id`
- `source_order_id`
- `source_order_number`
- `source_created_at`
- `source_updated_at`
- `payment_status`
- `fulfillment_status`
- `currency`
- `customer_name`
- `customer_email`
- `customer_phone`
- `delivery_method`
- `payment_method`
- `note`
- `total_item_quantity`
- `total_amount`
- `total_formatted`
- `line_item_count`
- `custom_field_count`
- `workspace_id`
- `store_id`
- `store_name`
- `normalized_order`
- `raw_order`
- `last_sync_mode`
- `last_event_type`
- `synced_at`
- `created_at`
- `updated_at`

写入来源：

- 手动同步 API：`/api/apps/printops/wix/orders/sync`
- PrintOps 业务 webhook：`/webhooks/printops/wix`

读取来源：

- Orders 页面 API：`/api/apps/printops/wix/orders`

订单列表验收：

- 页面刷新后，同步过的订单仍能从数据库读取。
- 新订单若 webhook 成功，应入库并在 3 分钟内被前端刷新展示。
- 列表字段来自 `normalized_order`，不得显示 mock customer / item 文案。
- 订单必须可追溯所属 Wix instance，绑定后还需可追溯 workspace / store。

### 4.2 `printops_templates`

存储 My Templates、默认模板、模板参数和打印语言。

验收：

- 保存模板后刷新页面，模板名称、语言、品牌、logo、财务行开关、SKU 条形码和社媒页脚不丢失。
- 设置默认模板后，订单打印使用数据库中最新默认模板。
- PDF、Browser print 和屏幕预览共用同一份模板结构。

### 4.3 `printops_settings`

存储 PrintOps 偏好设置，如界面语言、默认打印语言、时区和区域预览。

验收：

- Settings 保存后刷新页面不丢失。
- 设置不覆盖模板自己的打印语言；模板语言优先用于订单打印。

### 4.4 `app_business_event_logs`

存储 PrintOps 业务事件日志，用于订单事件追踪、调试和后续重放。

关键字段：

- `id`
- `app_key`
- `platform`
- `business_domain`
- `instance_id`
- `event_type`
- `event_id`
- `event_time`
- `source_entity_type`
- `source_entity_id`
- `source_entity_number`
- `dedupe_key`
- `raw_body`
- `raw_jwt`
- `decoded_payload`
- `event_data`
- `verification_status`
- `processing_status`
- `received_at`
- `processed_at`

### 4.5 后续增强表

以下表 P0 先不强依赖，后续在正式打印记录、增量补偿任务和多平台连接管理时再引入：

- `platform_connections`
- `print_documents`
- `order_sync_runs`

`print_documents` 计划用于存储一次打印或 PDF 生成的快照。

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

## 5. 开发任务拆分

### 5.1 v0.1 发布任务

- 更新 workspace 路由说明。
- 修复 PrintOps Wix dashboard 使用自己的 app secret。
- 补齐 `ZIDER_WIX_EVENT_FORWARD_SECRETS`、`ZIDER_PRINTOPS_WIX_PLAN_IDS`、Brevo 邮件环境变量说明。
- 跑 typecheck。
- 跑 workspace build。
- 推送 GitHub 主分支，由 `duorouai-5425s-projects` 下的 Vercel 项目自动部署。
- 用生产 URL 配置 Wix dashboard URL。

### 5.2 Wix 插件测试任务

- 在 Wix Developer Console 创建 Zider PrintOps app。
- 配置 dashboard URL。
- 配置权限。
- 安装到 Wix 测试站点。
- 获取真实 `instance` 参数并验证签名。
- 打开 readiness 检查：`/api/apps/printops/wix/readiness?verifyOAuth=1`，确认 instance、OAuth credentials、`printops_orders`、access token 均已就绪。
- 使用 `instance_id` 换取 access token。
- 调用 Wix Orders Search API 同步最近 3 天订单。
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
5. Orders 工作台右侧预览显示订单级和商品级自定义字段。
6. Invoice 模板的 `Additional details / Custom fields` 区块可打印自定义字段。
7. PDF 下载和浏览器打印预览中的自定义字段与 Orders 预览一致。

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
- 可以同步最近 3 天订单。
- 可以同步最多 7 天历史订单。
- 可以接住订单状态更新。
- 可以保留 raw payload。
- 可以提取 SKU、item options、自定义字段。
- Orders 预览、Invoice 模板预览、PDF 和浏览器打印使用同一份自定义字段结果。
- 可以用真实订单生成 A4 Invoice PDF。
- 打印快照不被后续订单更新覆盖。
- PDF 不是空白，且顶部品牌线、RTL 方向、财务行开关与预览一致。
- Account binding 可以发送验证码；缺少 Brevo 配置时显示明确错误。
- 当前计划显示 Basic / Starter / Pro / Business，hover 显示当月订单用量。
