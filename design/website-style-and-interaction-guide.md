# 网站风格与交互规范

适用产品：Wix 订单打印自定义应用
参考风格：轻量 SaaS 后台、数据管理台、订单/商品列表工具
更新日期：2026-05-22

## 1. 设计定位

产品应呈现为一个专业、安静、高效率的商家后台工具。整体气质参考图中的 Square 风格：白色工作区、浅灰侧边栏、克制的蓝色主操作、清晰的数据卡片和表格。

关键词：

- 专业：像商家每天会使用的订单工作台，而不是营销落地页。
- 清晰：订单、模板、打印状态、错误提示必须一眼可扫。
- 克制：少装饰、少渐变、少大面积色块。
- 数据密集但不拥挤：支持批量处理，信息多但层级清楚。
- 可靠：打印前预览、字段缺失提示、操作确认要让商家放心。

## 2. 视觉基调

### 2.1 页面整体

- 页面背景使用深色外层背景时，仅作为产品展示包装；实际应用界面以浅色为主。
- 主应用窗口使用白色或极浅灰背景。
- 页面圆角克制，主容器可使用 16-20px 圆角，内部卡片使用 8px 圆角。
- 不使用大面积渐变、装饰光斑、插画式背景。
- 重点放在数据、表格、筛选和操作按钮上。

### 2.2 推荐色彩

| 用途 | 色值 | 使用场景 |
|---|---|---|
| Primary Blue | `#0F73FF` | 主按钮、当前导航、关键链接、选中态 |
| Primary Hover | `#005EDB` | 主按钮 hover |
| Success Green | `#20C997` | 已打印、已完成、成功状态 |
| Warning Amber | `#F59E0B` | 字段缺失、待确认、部分完成 |
| Danger Red | `#EF4444` | 错误、删除、打印失败 |
| Text Strong | `#171A1F` | 主标题、关键数字 |
| Text Default | `#3F4652` | 正文、表格主要文本 |
| Text Muted | `#7A8494` | 次要说明、辅助标签 |
| Border | `#E6EAF0` | 分割线、表格线、输入框边框 |
| Surface | `#FFFFFF` | 卡片、表格、面板 |
| Page BG | `#F6F8FB` | 应用背景 |
| Sidebar BG | `#F3F5F8` | 侧边栏 |
| Selected Row | `#EFFFF8` | 表格选中行 |
| Hover Row | `#F8FAFC` | 表格 hover 行 |

颜色使用规则：

- 蓝色只用于“可行动/当前状态”，不要把所有信息都染蓝。
- 绿色用于完成、成功、可继续，不用于普通装饰。
- 红色只用于错误、失败、删除、危险动作。
- 表格和卡片主要靠留白、边框、字号建立层级。

## 3. 字体与排版

推荐字体：

- 英文/数字：Inter、Geist Sans、system-ui。
- 繁体中文：优先 `Noto Sans TC`、`PingFang TC`、`Microsoft JhengHei`。

字号规范：

| 层级 | 字号 | 字重 | 用途 |
|---|---:|---:|---|
| Page Title | 20px | 700 | 页面标题，如 Orders、Templates |
| Section Title | 16px | 700 | 模块标题 |
| Card Metric | 22-28px | 700 | 关键数字 |
| Body | 14px | 400/500 | 正文、表格 |
| Table Header | 11-12px | 700 | 表头，建议大写或短标签 |
| Caption | 12px | 400 | 辅助说明、时间、状态 |
| Button | 13-14px | 600 | 按钮文字 |

排版规则：

- 不使用负字距。
- 不使用随视口缩放的字体。
- 表格内文字不宜超过两行；长文本用省略号，hover 或详情面板查看完整内容。
- 数字、金额、订单号需要易读，必要时使用等宽数字。

## 4. 布局规范

### 4.1 应用框架

使用三段式后台布局：

1. 顶部栏：全局搜索、通知、账户信息、站点/店铺切换。
2. 左侧导航：Overview、Orders、Templates、Print Jobs、Settings。
3. 主工作区：列表、报表、模板编辑器或打印预览。

建议尺寸：

- 左侧导航宽度：220-240px。
- 顶部栏高度：56-64px。
- 主内容左右内边距：24px。
- 卡片间距：16px。
- 表格行高：48-56px。

### 4.2 页面结构

常用页面应遵循：

- 页面标题行：标题 + 当前视图筛选 + 主操作按钮。
- 工具栏：搜索、筛选、排序、批量操作。
- 主内容：表格、卡片、预览区。
- 右侧抽屉或弹窗：详情、编辑、确认操作。

避免：

- 页面内大段介绍文案。
- 营销式 hero。
- 卡片套卡片。
- 过大的圆角按钮和装饰性阴影。

## 5. 组件风格

### 5.1 按钮

按钮类型：

- Primary：蓝底白字，用于页面唯一主操作，如 `Print Selected`、`Create Template`。
- Secondary：白底灰边，用于次要操作，如 `Preview`、`Export PDF`。
- Ghost：透明背景，用于表格行内更多操作、图标按钮。
- Danger：红色，仅用于删除、取消不可逆任务。

交互状态：

- Default：清晰可见。
- Hover：背景或边框加深。
- Active：轻微下压或颜色加深。
- Disabled：透明度降低，鼠标不可点击，并给出原因提示。
- Loading：按钮内显示 spinner，文案变为动作进行中，如 `Generating...`。

按钮规范：

- 主按钮高度 36-40px。
- 图标按钮 32-36px 正方形。
- 操作类按钮优先使用图标 + 简短文字。
- 表格行内操作使用省略号菜单，避免每行堆多个按钮。

### 5.2 导航

侧边栏补充参考：窄白底、轻分组的 SPARK 风格侧栏已沉淀在 [sidebar-style-reference.md](sidebar-style-reference.md)。更完整的 dashboard 方向参考见 [spark-dashboard-design-language.md](spark-dashboard-design-language.md)，适合后续工作台、CMS、资源中心等轻量后台界面参考。

左侧导航：

- 当前项：蓝色图标 + 蓝色文字 + 浅蓝背景或左侧短条。
- Hover：浅灰背景。
- 分组标题使用 11px 大写灰字。
- 有未处理事项时使用小圆点或数字徽标。

建议导航项：

- Overview
- Orders
- Templates
- Print Jobs
- Automations
- Settings
- Help

### 5.3 表格

订单类产品的核心界面应以表格为主。

表格列建议：

- Checkbox
- Order
- Customer
- Items
- Template
- Payment
- Fulfillment
- Print Status
- Date
- Actions

表格规则：

- 表头背景使用极浅灰。
- 行 hover 使用 `#F8FAFC`。
- 选中行使用浅绿色或浅蓝色背景，并显示勾选状态。
- 批量选中后，顶部工具栏切换为批量操作状态。
- 重要状态使用 badge，不直接用整行强色。
- 行内更多操作使用三点菜单。

状态 badge：

- Unprinted：灰色。
- Ready：蓝色。
- Printed：绿色。
- Needs Review：黄色。
- Failed：红色。

### 5.4 卡片

卡片用于总览页指标，不用于包装整个页面。

卡片规范：

- 背景白色。
- 边框 `#E6EAF0` 或极轻阴影。
- 圆角 8px。
- 内边距 16-20px。
- 卡片标题小、数字大、趋势信息弱化。

指标卡示例：

- Orders Today
- PDFs Generated
- Unprinted Orders
- Print Failures

### 5.5 输入与筛选

搜索框：

- 左侧搜索图标。
- 占位文案具体，如 `Search by order, customer, SKU...`。
- 输入后右侧显示清除按钮。

筛选：

- 使用下拉菜单、日期范围、状态多选。
- 已启用筛选以 chip 显示，可单独移除。
- 有筛选时提供 `Clear all`。

排序：

- 表格列排序用表头点击。
- 工具栏排序适合更复杂条件，如 `Sort by: Newest`。

### 5.6 弹窗与抽屉

使用场景：

- 轻确认：弹窗。
- 订单详情、模板设置、打印预览：右侧抽屉。
- 复杂模板编辑：独立页面或全屏编辑器。

抽屉规范：

- 宽度 420-640px。
- 右侧滑入。
- 顶部固定标题和关闭按钮。
- 底部固定操作区。

确认弹窗：

- 标题明确动作结果。
- 正文说明影响范围。
- 危险操作按钮用红色。

## 6. 核心交互规范

### 6.1 订单批量打印流程

标准流程：

1. 用户进入 Orders。
2. 使用筛选找到待处理订单。
3. 勾选订单。
4. 顶部出现批量操作栏。
5. 用户选择模板。
6. 点击 `Preview` 或 `Generate PDF`。
7. 系统检查字段缺失、图片缺失、分页溢出。
8. 无问题则进入预览；有问题则显示 review 面板。
9. 用户确认后打印或下载 PDF。
10. 系统记录 print status。

交互要求：

- 任何批量操作都要显示选中数量。
- 打印前必须有预览或至少有检查结果。
- 打印完成后以 toast 提示，并更新表格状态。
- 失败订单要单独列出，不能让整个批量任务静默失败。

### 6.2 模板编辑流程

模板编辑器应分三栏：

1. 左栏：模板结构和字段库。
2. 中间：打印预览画布。
3. 右栏：当前元素属性。

字段库分类：

- Order fields
- Customer fields
- Shipping / Pickup
- Product fields
- Custom checkout fields
- Payment / Tax
- Store branding

交互要求：

- 字段可以开关显示。
- 关键字段支持拖拽排序。
- 图片尺寸支持小/中/大或具体数值。
- 纸张尺寸切换后预览实时更新。
- 保存前提示未映射字段和溢出风险。

### 6.3 打印预览

预览必须表达真实纸张边界。

预览规范：

- 白色纸张放在浅灰背景上。
- 显示页面尺寸，如 `A4`、`4x6`、`80mm`。
- 多页时显示页码。
- 溢出内容用红色边界或警告标记。
- 字段缺失用黄色提示，不直接替换为空白。

预览操作：

- Zoom in/out。
- Fit to width。
- Previous/Next page。
- Download PDF。
- Print。

### 6.4 状态反馈

Toast：

- 右上角或右下角。
- 成功 3-4 秒自动消失。
- 错误需要保留更久，并提供 `View details`。

Loading：

- 列表加载使用 skeleton。
- PDF 生成使用进度状态，如 `Generating 12 PDFs...`。
- 大批量任务不要只显示全屏 spinner。

Empty State：

- 说明当前为空的原因。
- 给出一个明确动作，如 `Clear filters`、`Create template`。
- 不使用大插画。

Error State：

- 说明发生了什么。
- 告诉用户可以重试、跳过或查看详情。
- 技术错误放在可展开详情中，不直接暴露大段日志。

### 6.5 表格选择与批量操作

规则：

- 单击行：打开订单详情抽屉。
- 勾选 checkbox：进入批量选择。
- Shift + click：连续选择。
- 表头 checkbox：选择当前页订单。
- 若支持跨页选择，必须显示 `Select all matching orders`。

批量栏操作：

- Selected count。
- Template selector。
- Preview。
- Generate PDF。
- Mark as printed。
- More actions。

### 6.6 危险操作

危险操作包括：

- 删除模板。
- 取消批量生成任务。
- 清除打印记录。
- 覆盖已有模板。

规范：

- 必须二次确认。
- 明确影响对象数量。
- 不把危险操作放在主按钮位置。

## 7. 响应式规范

桌面端优先，最低适配到 1280px 宽度。

桌面：

- 左侧导航常驻。
- 表格完整展示。
- 详情使用右侧抽屉。

平板：

- 左侧导航可折叠为图标栏。
- 表格隐藏次要列。
- 批量操作栏保持可见。

移动端：

- 不作为主要生产力场景，但要能查看订单和下载 PDF。
- 表格转为紧凑列表。
- 模板编辑器不建议在移动端开放完整编辑能力。

## 8. 可访问性规范

- 所有可点击元素必须有 hover、focus、active 状态。
- 键盘可操作：Tab 聚焦、Enter 确认、Esc 关闭弹窗/抽屉。
- 颜色不能作为唯一状态表达，badge 需有文字。
- 正文文本对比度至少达到 WCAG AA。
- 图标按钮必须有 tooltip 或 aria-label。
- 表单错误提示应靠近对应字段。

## 9. 文案规范

文案风格：

- 简短、明确、工具化。
- 不使用营销口吻。
- 优先说明动作结果。

推荐文案：

- `Generate PDF`
- `Print selected`
- `Preview template`
- `12 orders selected`
- `3 orders need review`
- `Missing VAT number`
- `Image may overflow this page`

避免文案：

- `Make your documents beautiful`
- `Unlock your business potential`
- `Oops, something went wrong` 单独出现
- `Submit` 这种不明确按钮

## 10. 页面示例规范

### Overview

用途：快速看今日打印与订单处理状态。

包含：

- 今日订单数。
- 未打印订单数。
- PDF 生成数。
- 打印失败数。
- 最近打印任务。
- 常用模板入口。

### Orders

用途：订单筛选、预览、批量打印。

包含：

- 搜索。
- 日期、状态、履约方式、打印状态筛选。
- 订单表格。
- 批量操作栏。
- 订单详情抽屉。

### Templates

用途：管理打印模板。

包含：

- 模板列表。
- 模板类型标签：Packing Slip、Production Sheet、Thermal Receipt。
- 纸张尺寸。
- 最近更新时间。
- 复制、编辑、删除。

### Print Jobs

用途：查看批量生成和打印历史。

包含：

- 任务状态。
- 订单数量。
- 模板。
- 创建时间。
- 下载 PDF。
- 错误详情。

### Settings

用途：品牌、默认模板、字段映射和打印偏好。

包含：

- Logo。
- Store address。
- Default template。
- Custom field mapping。
- Print status behavior。
- PDF naming convention。

## 11. 实现提示

如果后续进入前端实现：

- 图标优先使用 lucide icons。
- 表格、菜单、弹窗、tooltip 使用成熟组件库。
- 布局使用稳定尺寸，避免 hover 或加载状态导致内容跳动。
- 打印预览使用真实页面尺寸和 CSS print rules。
- PDF 生成前做字段和分页校验。

## 12. 设计验收清单

- 页面第一眼像专业订单后台，而不是营销页面。
- 左侧导航、顶部栏、表格、筛选、主按钮层级清楚。
- 表格可以快速扫描订单状态和打印状态。
- 批量打印流程不需要用户猜下一步。
- 字段缺失、图片缺失、分页溢出都有明确提示。
- A4、4x6、80mm 模板在预览中边界清楚。
- 所有主要操作都有 loading、success、error 状态。
- 长文本不会撑破表格或按钮。
- 移动端至少能查看订单和下载 PDF。
