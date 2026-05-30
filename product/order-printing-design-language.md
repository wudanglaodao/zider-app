# Zider PrintOps 设计语言

版本：v0.1
更新日期：2026-05-26
文档类型：设计语言与 UI 规划
参考方向：Venture CRM Dashboard UI Kit 的干净后台、组件化布局、轻量边框、黑白主题和可复用页面体系；Taskily 的固定侧栏、分组菜单、顶部全局搜索和 appearance 偏好体系

## 1. 设计目标

订单打印不是营销网站，而是高频工作台。设计应优先服务商家每天反复处理订单、筛选、预览、生成 PDF、浏览器打印和查看记录。

核心目标：

- 快速扫描：订单、打印状态、模板、异常提示必须一眼可读。
- 低干扰：界面以黑白灰为基础，绿色只作为品牌和成功状态，不做大面积装饰。
- 高密度：表格、筛选、抽屉、右侧预览并列展示，减少页面跳转。
- 可配置：主题、侧栏、语言和预览尺寸都作为系统能力规划；阅读方向只做后续能力预留。
- 可扩展：后续模板编辑器、拖拽组件、打印设备和多平台订单接入可以复用同一套组件语言。

## 2. 视觉原则

### 2.1 整体风格

- 采用 CRM / SaaS 后台风格，而不是电商营销页风格。
- 页面以左侧导航、顶部工具条、主表格、右侧预览、操作抽屉组成。
- 使用 8px 以内圆角，保持克制、专业、可扫描。
- 不使用装饰性渐变、漂浮卡片、球形光斑或大幅插画背景。
- 图标按钮优先使用 lucide 图标；文字按钮只用于明确命令。

### 2.2 色彩

基础色：

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `surface` | `#FFFFFF` | `#141817` | 面板、表格、输入 |
| `workspace-bg` | `#F3F4F2` | `#0B0D0C` | 页面背景 |
| `ink` | `#121817` | `#F5F7F4` | 主文字 |
| `muted` | `#65706D` | `#9BA59F` | 次级文字 |
| `line` | `#DDE5DF` | `#29302D` | 边框 |
| `brand` | `#087A46` | `#41C981` | 主操作、成功状态 |

状态色：

- 成功 / 已打印：绿色。
- 进行中 / 已生成 / 已发送：黄色或中性色，不与成功混淆。
- 失败：红色。
- 字段缺失：作为校验提示，不作为打印状态。

### 2.3 主题

P0 需要覆盖 Light / Dark 两套主题能力：

- Light theme：默认主题，适合办公环境和 PDF 预览。
- Dark theme：适合长时间后台操作，但打印预览纸张仍保持白底黑字，避免误解真实输出。
- 主题切换作为用户偏好保存，默认跟随系统可作为 P1。
- 主题 token 必须集中定义，不允许组件中散落硬编码颜色。

## 3. 布局语言

### 3.1 侧边栏

侧边栏支持两种状态：

| 状态 | 宽度 | 展示内容 | 使用场景 |
|---|---:|---|---|
| Expanded | 240-260px | Logo、产品名、菜单文字、主题切换 | 默认后台工作台 |
| Collapsed | 80-88px | Logo、图标、收起按钮、主题切换 | 小屏、专注表格、右侧预览 |

要求：

- 收起后菜单文字隐藏，但图标和 tooltip 语义保留。
- 菜单按工作区分组，P0 使用 `Workbench` 和 `Setup` 两组。
- 高频菜单可显示数量 badge，如未打印订单数、模板数、今日生成数。
- 当前菜单高亮使用白色面板 / 轻阴影 / 品牌色文字，不使用大面积高饱和背景。
- Store Switcher 不放在侧栏菜单项里，保持为当前上下文选择器。
- 侧栏状态是用户偏好，P0 可先前端状态，P1 保存到用户设置。

移动端规则：

- 侧边栏不占据页面布局空间，改为左侧 overlay drawer。
- 顶部栏左侧显示菜单按钮，点击打开侧边栏。
- 打开侧边栏时显示半透明遮罩，点击遮罩关闭。
- 移动端顶部栏保留：菜单按钮、搜索框、消息、通知、头像。
- 移动端隐藏用户名称和店铺副标题，只保留头像入口。

### 3.2 工作区

工作区结构：

```text
Sidebar
└── Workspace
    ├── Topbar
    │   ├── Store Switcher
    │   ├── Global Search
    │   ├── Theme Toggle
    │   ├── Refresh
    │   └── Print selected
    ├── Summary metrics
    └── Main split
        ├── Orders table
        └── Preview / History panel
```

设计规则：

- Orders 是默认入口。
- Topbar 提供全局搜索入口，搜索范围包括 orders、templates、print history。
- 表格和预览并列，避免用户在订单与预览之间频繁跳转。
- 批量操作使用右侧 Drawer，保持当前列表上下文。
- 所有面板只做一级容器，不做卡片套卡片。

## 4. 组件语言

### 4.1 表格

- 表头使用小字号大写标签。
- 行高保持 64-72px，支持订单号、客户、商品、金额、模板和状态。
- 行选中使用非常浅的背景色，不使用高饱和色块。
- 打印状态使用 pill badge。
- 字段缺失显示在状态下方作为 warning text。

### 4.2 筛选

- 高频筛选使用 chip。
- 复杂筛选 P1 放入 Filter popover。
- 搜索框支持订单号、客户、邮箱、SKU。

### 4.3 预览

- 右侧预览默认展示首个选中订单。
- 批量打印 Drawer 内展示当前批次预览。
- 预览纸张始终模拟真实输出，Light / Dark theme 不改变纸张底色。
- 预览需要显示当前纸张尺寸，如 `A4`、`Letter`、`80mm`。

### 4.4 Drawer

- 用于批量打印、订单详情、打印任务详情。
- Drawer 内左侧为配置，右侧为预览。
- 重要校验在配置区顶部或中部展示，不阻断预览。

## 5. 多语言与阅读顺序

多语言分为三个层级：

| 层级 | 说明 |
|---|---|
| System language | 后台界面语言，如 English、繁体中文 |
| Print language | 打印文档语言，如 English、German、French |
| Reading direction | 文档阅读顺序，如 LTR、RTL |

P0 规划：

- 支持打印语言选择。
- 不暴露 Reading order 设置，默认使用 LTR。
- PDF 渲染需要接收 `language` 和 `direction` 两个参数。
- 英文、中文、德文、法文默认 LTR。
- RTL 语言先做结构准备，真实语言包可 P1 扩展。

阅读方向影响：

- 文档根节点 `dir`。
- 文字对齐。
- Header logo 和品牌信息顺序。
- 表格列阅读顺序。
- 行项目图标与内容顺序。
- 页眉、页脚和签名区的方向。

不影响：

- 原始订单内容不自动翻译。
- SKU、订单号、金额、邮箱保持原始格式。
- 打印状态和系统操作不跟随打印语言自动改变，除非切换系统语言。

## 6. 设计 Token 规划

P0 先在 CSS module 中定义局部 token。

P1 抽象为全局 token：

```text
color.background.workspace
color.background.surface
color.background.surfaceElevated
color.text.primary
color.text.secondary
color.border.default
color.brand.primary
color.status.success
color.status.warning
color.status.error
radius.control
radius.panel
shadow.panel
height.control
height.tableRow
width.sidebar.expanded
width.sidebar.collapsed
```

## 7. 当前 UI 骨架落地

已覆盖：

- 左侧菜单 Expanded / Collapsed。
- 左侧菜单分组、数量 badge、当前菜单高亮。
- 顶部全局搜索入口。
- Light / Dark theme 切换。
- 主题与侧栏状态的本地偏好保存。
- Store Switcher 固定在 Topbar。
- Orders 表格 + 右侧 Preview / History。
- 批量打印 Drawer。
- 打印语言选择。
- 打印预览默认 LTR，阅读方向控件后续再做。

后续需要补齐：

- 主题偏好持久化。
- 侧栏状态持久化。
- 预览阅读方向选择。
- 模板编辑器中的组件级 direction 继承作为后续能力预留。
- RTL 表格列顺序完整验证。
- Figma 组件库中的 Light / Dark variants。
- 移动端侧栏从 collapse 升级为 overlay drawer。
