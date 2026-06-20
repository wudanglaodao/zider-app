# 模板中心与模板编辑器

版本：v0.3
更新日期：2026-05-29
来源：从 [Zider PrintOps 产品需求文档](../order-printing-product-requirements.md) 按模块拆分
模块说明：Template Center、Template Editor、组件模型、尺寸设置、技术要求和 AI 生成模板入口。
补充专项文档：详见 [模板专项需求文档](../order-printing-template-requirements.md) 和 [模板视觉与场景调研](../order-printing-template-visual-research.md)。

## 1. 模板中心与模板编辑器

### 8.4 模板中心（Template Center）

模板中心与模板编辑器的详细需求已整理到专项文档：[Zider PrintOps 模板专项需求文档](../order-printing-template-requirements.md)。

模板中心是商家选择、创建、预览和管理打印模板的主入口。P0 先做成清晰的后台管理页面，不做模板市场，不做复杂拖拽设计器，但需要为后续模板编辑器、共享模板和行业模板包预留结构。

职责边界：

- 模板中心负责模板发现、模板列表、内置模板库、复制创建、预览、默认模板和基础管理。
- 模板编辑器负责字段、组件、样式、文案和真实订单预览。
- 内置模板不可直接修改，商家必须先复制成当前店铺模板再编辑。
- 模板归属当前店铺，多店铺之间 P0 不自动共享。
- 订单打印流程只读取可用的店铺模板和系统内置 fallback 模板。

页面结构：

```text
Template Center
├── Header
│   ├── Current store
│   ├── Search templates
│   └── Create template
├── Tabs
│   ├── My Templates
│   └── Template Library
├── Future entry
│   └── AI Template Designer
├── Filters
│   ├── Document type
│   ├── Paper size
│   ├── Language
│   ├── Scenario
│   └── Status
├── Template list / cards
├── Template preview modal
└── Empty and error states
```

交互规则：

- 模板卡片区使用全宽列表 / 网格展示，不放常驻右侧详情栏。
- 点击模板卡片或 `Preview` 打开预览弹层。
- 预览弹层展示大尺寸纸张、模板基本信息、字段依赖、校验摘要和 `Use / Edit template` 操作。
- 列表页只负责浏览、筛选和进入预览，避免右侧详情栏挤压模板缩略图。
- 保存、复制、设为默认、删除等会修改数据的操作必须有明确状态反馈：操作中禁用重复提交，成功后展示成功提示，失败时展示原因并保留用户已输入内容。

P0 信息字段：

| 字段 | 说明 |
|---|---|
| Template name | 模板名称 |
| Description | 模板说明 |
| Document type | Packing Slip、Pick List、Production Sheet、Invoice Helper 等 |
| Category | Fulfillment、Production、Customer Documents、Store / POS 等 |
| Scenario | shipping、pickup、delivery、pos、custom、b2b 等 |
| Audience | customer、warehouse、production、finance、store_staff |
| Paper size | P0 固定 A4，不向商家开放修改 |
| Orientation | Portrait、Landscape，P0 默认 Portrait |
| Margin preset | Normal、Compact、Narrow |
| Layout preset | Branded、Compact、Table-first、Thermal |
| Default language | 默认打印语言 |
| Default font | 默认字体预设 |
| Store scope | 当前店铺 |
| Source | Built-in、Store copy、Duplicated |
| Status | Draft、Ready |
| Default badge | 是否为某个文档类型的默认模板 |
| Data requirements | 模板依赖的字段，如 tax_id、pickup_time、custom_fields |
| Updated at | 最近更新时间 |
| Validation summary | 缺字段、图片异常、分页溢出等校验摘要 |

P0：My Templates

- 默认显示当前店铺模板。
- 支持列表或卡片视图，首版可先使用卡片 + 表格信息。
- 支持搜索模板名称。
- 支持按文档类型、语言、场景筛选；纸张尺寸 P0 固定 A4，暂不作为核心筛选条件。
- 支持查看默认模板标识。
- 支持创建模板。
- 支持从 Template Library 创建模板。
- 支持复制当前店铺模板。
- 支持重命名模板。
- 支持进入模板编辑器。
- 支持打开模板预览。
- 支持删除非默认模板。
- 支持设置某个文档类型的默认模板。
- 当模板被订单打印流程使用过，删除前需要二次确认。

P0：Template Library

- 提供系统内置模板库。
- 当前首批内置模板先聚焦 `Invoice`，使用 Wix 订单数据渲染客户可见发票样式。
- 当前首批 `Invoice` 模板必须支持打印订单同步过来的自定义字段，包含订单级 custom fields 和订单行级 custom text / options 字段。
- 其他分类 Fulfillment、Picking、Production、Customer Documents、Finance Helper、Store / POS 保留为后续扩展。
- 内置模板使用视觉卡片展示，缩略图需要清晰体现版式风格，而不只是显示模板名称。
- 支持类似 All designs / Invoice designs / Packing Slip designs / Returns Form designs / Gift Receipt designs 的文档类型筛选。
- 支持筛选文档类型、使用场景。
- 支持筛选模板受众：客户、仓库、生产、财务、门店员工。
- 支持查看模板依赖字段，如是否需要 tax ID、pickup time、custom fields、product image。
- 支持预览内置模板的样例效果。
- 支持 `Use this template`，复制为当前店铺模板。
- 复制时需要让商家确认模板名称、默认语言和默认字体；纸张尺寸第一版固定 A4。
- 复制成功后进入模板编辑器或停留在模板中心并高亮新模板。
- 内置模板更新不自动覆盖商家已复制的店铺模板。

P0：默认内置模板卡片

| 卡片名称 | 分类 | 文档类型 | 默认尺寸 | 卡片重点信息 | 默认操作 |
|---|---|---|---|---|---|
| Wix Invoice - Big Brand | Customer Documents | Invoice | A4 | 大品牌字标客户发票、双地址区、商品图、金额汇总、社媒页脚 | Use this template |
| Wix Invoice - Market | Fulfillment | Invoice | A4 | 零售感发票、Logo 卡片、商品图、客户信息块、紧凑社媒页脚 | Use this template |
| Wix Invoice - Mono | Customer Documents | Invoice | A4 | 高对比黑白发票、商品缩略图、付款摘要、社媒页脚 | Use this template |
| Wix Invoice - Modern | Customer Documents | Invoice | A4 | 客户可见发票确认、品牌化视觉 | Use this template |
| Wix Invoice - Minimal | Customer Documents | Invoice | A4 | 低墨量打印、归档、内部查看 | Use this template |
| Wix Invoice - Field Map | Customer Documents | Invoice | A4 | 字段映射验收样例，覆盖 Wix 默认订单字段 | Use this template |

卡片规则：

- 卡片必须显示真实纸张缩略图、文档类型、默认尺寸、适用场景和字段依赖。
- 卡片必须显示 `Built-in` 来源标识，避免用户误以为可以直接修改系统模板。
- `Wix Invoice - Big Brand` 是当前系统 fallback 模板；如果店铺没有默认模板，批量打印优先使用它。
- 4x6、80mm、餐饮厨房票和官方物流面单不进入当前 Invoice P0。

P0 第一版模板库落地：

| 开发切片 | 页面表现 | 编辑器表现 | 验收点 |
|---|---|---|---|
| First visual template | `Wix Invoice - Big Brand`、`Wix Invoice - Market`、`Wix Invoice - Mono` 出现在 My Templates | 可以配置 logo 文本、布局风格、商品图开关和社媒页脚；纸张尺寸固定 A4 | 三款模板在卡片和预览弹层里有明显不同布局风格，不只是换色或换名称 |
| Default field coverage | `Wix Invoice - Field Map` 覆盖 Wix 默认订单字段 | 可以查看字段依赖：订单号、客户、商品选项、金额、支付、地址、配送方式、店铺页脚 | 使用样例订单能看到 `order_10059.pdf` 中的默认字段 |
| Custom field printing | P0 Invoice 模板显示 custom fields 依赖 | 可以选择订单级自定义字段和订单行自定义字段，支持 label、排序、隐藏空字段、必填校验 | 样例订单中的 buyer note、gift note、custom text / options 能出现在预览、PDF 和浏览器打印中 |
| Product image support | 三款 P0 Invoice 模板默认展示商品缩略图 | 可以打开 / 关闭商品图显示 | 关闭后商品表格仍能正常排版 |
| Logo and social support | 三款 P0 Invoice 模板都有 Logo 区和社媒页脚 | 可以设置 Logo 文本、社媒页脚内容，并打开 / 关闭社媒页脚 | 预览和卡片缩略图能看到 Logo 和社媒页脚 |

P0：模板创建入口

- 从内置模板创建。
- 复制当前店铺已有模板。
- 新建空白模板可以作为 P0 可选能力。如果实现成本高，首版只提供从内置模板创建。
- 创建模板时必须绑定文档类型。
- 创建模板时系统自动绑定 A4，P0 不让商家选择纸张尺寸。
- 创建模板时必须绑定默认语言和默认字体。
- 创建后生成结构化模板 JSON，而不是保存 HTML 字符串。

P0：模板详情与预览

- 显示模板基本信息、默认设置、校验摘要和最近更新时间。
- 支持选择当前店铺的一笔订单作为预览数据。
- 真实订单预览必须展示该订单已同步到系统的自定义字段样本，便于商家判断字段是否要加入模板。
- 没有真实订单时使用系统样例订单预览。
- 预览必须与后续 PDF / 浏览器打印使用同一渲染链路。
- 显示缺失字段、图片加载失败、内容溢出和字体风险提示。
- 支持从详情页进入编辑器。
- 支持从详情页生成一次测试 PDF，测试 PDF 不改变订单打印状态。

P0：默认模板规则

- 每个店铺可以为每个文档类型设置一个默认模板。
- 订单批量打印默认使用当前店铺对应文档类型的默认模板。
- 如果当前店铺没有默认模板，系统使用内置 fallback 模板。
- 设置新默认模板时，需要替换同一文档类型下的旧默认模板。
- 删除默认模板前必须先选择新的默认模板，或恢复系统 fallback。

P0：页面状态

- 当前店铺没有模板：展示 Template Library 入口和推荐内置模板。
- 搜索无结果：展示清空筛选和进入模板库入口。
- 模板校验失败：允许保存为 Draft，但不能设为默认模板。
- 内置模板复制失败：保留用户输入，并展示失败原因。
- 店铺切换：清空当前筛选、预览订单和未保存的选择状态。
- 字段映射缺失：在模板卡片和预览中提示，但不阻断进入编辑器。

P0 不做：

- 模板市场购买。
- 组织共享模板。
- 模板复制到其他店铺。
- 模板版本管理。
- 模板自动匹配规则。
- 模板启用 / 停用。
- 行业模板包管理。
- 模板导入 / 导出。
- 任意 HTML / CSS 编辑。
- 复杂拖拽式设计工具。

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

P2：

- 模板导入 / 导出。
- 代码模板或 Liquid-like 语法。
- 模板包发布和安装。
- Agency / 白标模板分发。

P3：

- AI Template Designer：根据用户上传图片、截图或品牌素材生成模板草稿。
- AI 生成模板必须先保存为 Draft，不允许直接成为默认模板。
- AI 生成模板必须进入与普通模板一致的字段映射、预览、PDF 和浏览器打印校验链路。
- AI 生成历史需要记录输入素材、生成时间、生成参数和用户最终选择的模板草稿。

验收标准：

- 新店铺在没有任何模板时，可以从 Template Library 创建一个 Packing Slip 模板并设为默认。
- 商家可以在 My Templates 中找到、预览、复制、编辑和删除当前店铺模板。
- 商家可以按文档类型快速筛选模板；纸张尺寸筛选后续在多尺寸模板上线后再增强。
- 内置模板不能被直接修改。
- 模板保存后会生成结构化 JSON，并能被预览、PDF 和浏览器打印复用。
- 模板校验失败时，系统明确提示原因，并阻止设为默认模板。
- 切换店铺后，只显示目标店铺的 My Templates。

### 8.5 模板编辑器

模板编辑器采用分层设计：P0 先做“风格模板 + 参数化配置”，不直接进入复杂拖拽画布。模板库里的每个设计不是静态图片，而是一个可配置的 `base template`。商家使用模板后，系统保存基底模板、参数覆盖、组件配置和字段绑定，后续可以在同一结构上升级组件编辑器、拖拽编辑器、代码模式和 AI 生成。

分层策略：

| 层级 | 用户心智 | 能力 | 阶段 |
|---|---|---|---|
| L0 内置风格模板 | 选择一个好看的模板 | 模板库、视觉卡片、文档类型筛选、Use / Apply | P0 |
| L1 参数化配置 | 改成我的店铺样式 | Logo、品牌色、字体、纸张、边距、密度、字段开关、文案 | P0 |
| L2 组件级配置 | 控制每个区块显示什么 | Header、Address、Items Table、Totals、Notes、Footer 的字段、排序、样式 | P1 |
| L3 可视化布局编辑 | 调整模块位置和结构 | 拖拽排序、组件库、区块复制、布局预设 | P2 |
| L4 高级代码模式 | 开发者深度定制 | HTML / CSS / Liquid-like / JSON schema 互转、版本回滚 | P2 / P3 |
| L5 AI 模板设计 | 上传图片生成模板 | 识别品牌图 / 单据截图，生成 token、组件树和字段绑定建议 | P3 |

竞品能力路线参考：

| 阶段 | 参考形态 | 产品定义 | 核心目标 |
|---|---|---|---|
| P0 | Vify 式配置编辑器 | 内置风格模板 + 参数设置 + 预览 | 快速让商家选模板、改品牌、开关字段并打印 |
| P1 | Documint 式组件 / 变量 / 循环 | 组件树、变量绑定、line items 循环、字段 Registry | 支持更复杂的订单数据和可复用组件 |
| P2 | Beefree 式内容块和条件显示 | 内容块库、条件显示、区块复制、模板片段 | 让运营用户组合业务块，而不是写代码 |
| P3 | Printout Designer 式高级拖拽和精细布局 | 自由拖拽、精细坐标、标签 / 小票 / 特殊纸张布局 | 覆盖高阶定制、Agency 和复杂打印生产场景 |

P0 产品原则：

- 模板编辑默认从内置风格模板开始，减少空白画布压力。
- `Create template` 可以先引导用户选择内置模板；空白模板作为可选能力。
- 编辑界面优先展示可理解的参数：品牌、尺寸、字段、文案、预览。
- 对外表达用 `Customize` / `Edit`，对内保存为 `base_template_key + template_params + component_tree`。
- 内置模板更新不覆盖商家的参数和组件覆盖。
- 同一个 base template 可以派生多个店铺模板，如 `Leopard - Packing Slip`、`Leopard - Gift Receipt`。
- 高级代码模式必须位于模板下层，只作为高级入口，不影响普通商家的无代码路径。

P0 默认字段开关：

| 模板 | 默认显示 | 默认隐藏 |
|---|---|---|
| Wix Invoice - Big Brand | 大品牌字标、店铺信息、订单号、订单条形码、件数、下单时间、客户姓名 / 邮箱 / 电话、商品图、商品名、SKU、商品选项、price、qty、line total、Items、Shipping、Tax、Total、Paid、Paid with、Delivery Address、Billing Address、Delivery Method、社媒页脚 | 内部备注 |
| Wix Invoice - Market | Logo、订单号、订单条形码、下单时间、客户姓名 / 电话、商品图、商品名、SKU、商品选项、qty、total、付款状态、配送方式、收货地址、社媒页脚 | 长政策文案 |
| Wix Invoice - Mono | Logo、订单号、订单条形码、客户、商品图、商品、SKU、金额、支付、配送方式、社媒页脚 | 品牌大图、长文案 |
| Wix Invoice - Modern | 品牌页眉、订单元信息、客户概览、商品表、金额汇总、地址、页脚联系方式 | 内部备注、生产字段 |
| Wix Invoice - Minimal | 订单号、客户、商品、金额、支付、配送方式 | 品牌大图、商品图片、长文案 |
| Wix Invoice - Field Map | 全量 Wix 默认订单字段 | 无 |

P0：

- 采用 Vify 式配置编辑器作为第一版交互目标。
- 支持模板基础设置：名称、说明、文档类型、场景、受众。
- P0 模板尺寸固定为 A4，不支持商家修改尺寸；Letter、4x6、80mm 作为后续能力预留。
- 支持模板方向字段，P0 默认 Portrait。
- 支持边距预设：Normal、Compact、Narrow。
- 支持版式预设：Branded、Compact、Table-first、Thermal。
- 支持日期格式预设：`MM-DD-YYYY`、`DD-MM-YYYY`、`YYYY-MM-DD`、`MM/DD/YYYY`、`DD/MM/YYYY`、`YYYY/MM/DD`、`MMM D, YYYY`、`D MMM, YYYY`。
- 支持地址格式预设：欧美多行、中国 / 台湾多行、紧凑格式、单行格式；P0 先用于预览和模板参数，后续接国家 / 地区地址 formatter。
- 支持选择内置风格模板，并保存为当前店铺模板。
- 支持品牌参数：logo、品牌色、辅助色、页眉风格、页脚风格。
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
- 支持订单条形码显示开关，并以订单号作为 P0 条码内容。
- 支持 SKU 显示开关，SKU 位于商品名称和商品选项之间。
- 支持价格显示开关。
- 支持感谢语、退换货说明、客服联系方式等固定文案。
- 支持打印预览。
- 支持根据模板受众展示推荐字段，如客户文档推荐显示政策文案，仓库文档推荐显示 SKU / 数量 / 货位。

P1：

- 向 Documint 式组件 / 变量 / 循环能力升级。
- 支持字段分组。
- 支持条件显示，如礼品订单隐藏价格。
- 支持二维码、产品条码、批次条码等更丰富的机器可读字段。
- 支持多语言文案编辑。
- 支持复制某语言内容到另一语言。
- P0 不支持 80mm 热敏模板专用布局；后续独立设计，不从 A4 缩放。
- 支持自定义尺寸和标签纸预设。
- 支持产品打印字段分组，如生产字段、打包字段、售后字段。
- 支持模板级水印或内部标识，如 draft、internal。

P2：

- 向 Beefree 式内容块和条件显示升级。
- 支持高级布局能力。
- 支持代码模板或 Liquid-like 语法。
- 支持模板导入 / 导出。
- 支持从组件模板进入代码模式，并保留回退到上一个组件版本的能力。

P3：

- 向 Printout Designer 式高级拖拽和精细布局升级。
- 支持 AI 根据图片生成模板草稿。
- 支持 AI 根据现有模板截图生成相似风格但非完全复制的版式方案。
- 支持 AI 根据品牌素材生成颜色、字体、边框、页眉页脚和组件样式建议。
- 支持用户选择 AI 方案后进入普通模板编辑器继续调整。

### 8.5.1 模板组件模型

P0 不做复杂拖拽式设计工具，但模板编辑器需要按组件化模型设计，避免后续升级拖拽编辑器时推翻数据结构。

模板由 `base template`、`template params` 和多个 section / block / field component 组成：

| 层级 | 说明 | 示例 |
|---|---|---|
| Base Template | 系统内置或模板包提供的风格基底 | Leopard、Wolf、Minimal Invoice |
| Template Params | 商家对基底模板的参数覆盖 | 品牌色、字体、Logo、密度；纸张尺寸 P0 固定 A4 |
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

模板参数基础属性：

| 属性 | 说明 |
|---|---|
| `base_template_key` | 内置风格模板 key |
| `customization_level` | preset、parameterized、component、code |
| `design_tokens` | 品牌色、字体、字号、边框、间距 |
| `document_settings` | 文档类型、纸张、方向、边距、密度 |
| `content_settings` | 字段开关、表格列、文案、隐藏价格 |
| `locale_settings` | 默认打印语言、多语言文案完整性 |
| `component_overrides` | 对 base template 组件的显示、排序和样式覆盖 |

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

### 8.5.2 模板尺寸与版式设置

尺寸是模板的基础属性，不是打印时才选择的临时参数。模板保存、预览、PDF 和浏览器打印必须读取同一套尺寸配置。

P0 尺寸能力：

| 配置 | P0 规则 |
|---|---|
| Paper size | P0 固定 A4；后续再支持 Letter、4x6、80mm |
| Orientation | 字段预留，默认 Portrait |
| Margin preset | Normal、Compact、Narrow |
| Density | Comfortable、Compact |
| Layout preset | Branded、Compact、Table-first、Thermal |
| Page break | 默认按 section / table row 避免截断 |
| Preview scale | 只影响屏幕预览，不影响真实输出 |

尺寸使用规则：

- A4 适合 invoice helper、packing slip、production sheet、B2B helper。
- 4x6 适合 label、handoff note、简短取货 / 配送单，不把它作为 shipping label 购买功能。
- 80mm 适合 thermal receipt、pickup ticket、restaurant ticket，需要专用字段裁剪和紧凑样式。
- 80mm 模板不从 A4 模板缩放生成，必须使用独立布局 preset。
- 纸张尺寸会影响默认字体大小、边距、表格列数量、图片大小和分页策略；P0 先只实现 A4 规则。
- P0 模板预览固定显示 `A4`；后续开放尺寸后再显示 `Letter`、`4x6`、`80mm`。

P1 / P2 尺寸能力：

- 自定义宽高。
- 标签纸尺寸库。
- 横向 Landscape。
- 多栏布局。
- 集成标签纸，如 invoice + peel-off label。
- 按打印机 / 门店保存推荐尺寸。

P0 不做：

- 任意自定义宽高。
- 静默读取实体打印机纸张。
- 按打印机自动切换模板。
- Shipping label 购买和承运商面单生成。

### 8.5.3 模板技术要求

技术要求：

- 模板保存为结构化 JSON，不只保存 HTML 字符串。
- PDF / 预览渲染由模板 JSON 生成。
- 所有组件样式使用受控 schema，避免任意 CSS 破坏分页和打印。
- 字段绑定必须通过标准订单模型和字段映射层，不直接绑定平台原始字段。
- 模板组件必须绑定 `Template Render Context` 和 `Field Registry`，不能直接读取 Wix / Shopify / WooCommerce 原始 payload。
- 模板渲染需要支持 fallback：字段不存在、字段为空、图片失败、语言缺失。
- 样式 schema 需要预留 responsive / paper-size override，但 P0 只启用 A4。
- 组件 schema 版本化，后续升级编辑器时可迁移旧模板。

### 8.5.4 AI 图片生成模板

阶段定位：

- P0 不做 AI 生成。
- P1 / P2 继续完善模板组件模型、视觉卡片库、字段映射和预览链路。
- P3 启动 AI Template Designer PoC。

交互流程：

1. 用户从 Template Center 点击 `Create with AI`。
2. 用户上传 logo、品牌图片、现有单据截图、模板风格截图或小票照片。
3. 用户选择目标文档类型：Invoice Helper、Packing Slip、Pick List、Production Sheet、Gift Receipt、Thermal Receipt 等。
4. P3 生成时可选择纸张尺寸；P0 普通模板编辑器固定 A4。
5. 系统分析图片，提取品牌 token、视觉风格、版式结构和可识别文字区域。
6. 系统生成 2-3 个模板草稿方案，以视觉卡片展示。
7. 用户选择一个方案进入 Template Editor。
8. 系统展示字段映射建议和缺失字段提醒。
9. 用户预览真实订单或样例订单。
10. 用户保存为 My Templates 的 Draft 或 Ready 模板。

输入处理要求：

- 支持 PNG、JPG、WebP，后续可支持 PDF 首页截图。
- 图片上传前提示用户避免上传包含敏感客户信息的文件。
- 如图片包含订单号、姓名、电话、地址等疑似敏感信息，系统需要提示用户确认。
- 图片仅用于本次模板生成和历史追溯，不默认用于模型训练。
- 用户可以删除 AI 生成历史和上传素材。

AI 输出结构：

| 输出 | 说明 |
|---|---|
| `design_tokens` | 品牌色、辅助色、字体建议、字号层级、边框、间距 |
| `layout_intent` | 版式意图，如 minimal、branded、editorial、table-first、thermal |
| `template_json` | 可渲染的结构化模板 JSON |
| `component_tree` | section、block、field component、table component |
| `field_binding_suggestions` | 推荐绑定的标准字段或自定义字段 |
| `paper_size` | 推荐尺寸 |
| `document_type` | 推荐文档类型 |
| `validation_summary` | 字段缺失、图片风险、分页风险、字体风险 |

生成边界：

- AI 只能生成受控 schema 内的模板组件和样式。
- AI 不能直接写入生产 HTML / CSS。
- AI 不能跳过模板校验。
- AI 不能自动设为默认模板。
- AI 不能承诺生成合法税务发票。
- AI 不修改订单数据，只生成模板结构和样式建议。

验收标准：

- 用户上传一张品牌 / 单据参考图后，系统可以生成至少 2 个可预览模板草稿。
- 生成草稿可以被保存为 My Templates，并进入普通模板编辑器继续修改。
- 生成草稿可以用样例订单和真实订单预览。
- 生成草稿如果缺字段，必须明确提示字段映射需求。
- 生成草稿的输出链路与普通模板一致：模板 JSON -> 预览 -> PDF -> 浏览器打印。
