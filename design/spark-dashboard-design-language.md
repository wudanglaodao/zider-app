# Spark Dashboard 设计语言参考

更新时间：2026-05-24
参考来源：[Spark Figma](https://www.figma.com/design/b1Bbma7zQXExBtuQiIMvTI/Spark?node-id=3003-6055&t=QTncskFRZRRYvAaM-0)、用户提供的侧边栏截图
备注：当前 Figma 连接器需要重新授权，本记录基于 Chrome 中可读取的 Figma 图层、属性面板和截图观察整理；后续可补充完整颜色、字体和组件 token。

## 1. 总体方向

Spark 的设计语言更接近学习社区 / 创作者工具 / 轻量工作台，而不是传统企业后台。

- 气质：干净、轻、安静、偏产品化。
- 结构：固定左侧栏 + 顶部 header + 右侧内容区。
- 装饰：很少使用阴影、渐变和大面积色块。
- 层级：依靠留白、分组标题、细边框和字体权重建立。
- 颜色：黑白灰为主，品牌色和强调色克制使用。
- 圆角：克制，不走过度圆润的消费级风格。

对 Zider dashboard 的启发：

- dashboard 不要做成营销落地页。
- 不需要强烈科技感或大面积蓝紫渐变。
- 更适合“可长期使用的工作台”：轻、清楚、可扫读。

## 2. 从 Figma 读到的结构信息

当前选中 frame：

- `Account_Notification Settings 1440x870`
- 整体画板：`1440 x 870`
- `Sidebar`：`270 x 870`
- `Body`：宽度 `1170 Fill`，高度 `870`
- `header`：宽度 `1170 Fill`，高度 `72`
- `Body` 底部边框：`1px`，颜色 `#E1E1E1`

文件中存在的页面/场景包括：

- `Overview_Notifications`
- `Explore_About`
- `Explore_Assignment`
- `Explore_Tools`
- `Explore_Review`
- `My courses`
- `Tutorials`
- `FAQ`
- `Meetups`
- `Contact Support`
- `Help Center`
- `Account_Profile`
- `Account_Notification Settings`
- `Privacy Policy`
- `Terms of Service`
- `Sign in`
- `Sign Up`

响应式规格：

- 桌面：`1440x870`、`1920x1080`
- 移动：`375`

## 3. 布局语言

### Desktop

- 左侧栏固定，宽度参考 `270px`。
- 顶部 header 固定在内容区顶部，高度参考 `72px`。
- 主内容区占剩余宽度，避免过宽文本，可通过内容容器限制阅读宽度。
- 页面整体以白底为主，外层画布不需要明显色块。
- 分隔线使用极浅灰，优先 `#E1E1E1` 一类的 1px 边框。

### Mobile

- Spark 文件有 `375` 移动稿，说明核心 dashboard 需要移动可访问。
- 移动端不应完整保留桌面侧栏，建议改为顶部栏 + 抽屉导航或底部关键入口。
- 复杂编辑/批量操作可以降级为查看、轻设置、帮助与账户管理。

## 4. 侧边栏语言

侧边栏是 Spark 最明显的识别点：

- 顶部小字标：`SPARK`，字距较大，存在感克制。
- 导航按语义分组，而不是单一长列表。
- 图标为线性图标，尺寸偏小。
- 文本尺寸偏小，视觉上精密、轻量。
- 分组之间依靠纵向留白，不依赖重分割线。
- `Log Out` 独立放到底部。

Zider 可借鉴：

- 产品工作台侧栏可以采用 `240-270px`。
- 内部轻量工具、资源中心、CMS 可采用更窄版本 `176-220px`。
- 导航分组建议：`Workspace`、`Products`、`Resources`、`Support`、`Account`。
- 当前态保持克制：轻灰底、文字加粗、图标加深即可。

## 5. 视觉 Tokens 初稿

这些 token 是为了让后续 dashboard 往 Spark 靠近，不是最终品牌规范。

| 用途 | 建议值 | 说明 |
|---|---|---|
| Page BG | `#FFFFFF` | 主应用背景 |
| Soft BG | `#F7F7F5` / `#F8F8F8` | 页面次级区域、hover |
| Border | `#E1E1E1` | Figma 中读到的 body border |
| Border Soft | `#ECECEC` | 卡片、输入框弱边框 |
| Text Strong | `#111111` | 标题、当前导航 |
| Text Default | `#333333` | 正文 |
| Text Muted | `#8A8A8A` | 分组标题、说明文字 |
| Icon Default | `#161616` | 线性图标 |
| Active BG | `#F2F2F2` | 当前导航、hover |
| Accent | 待定 | Zider 可保留蓝色，但降低面积 |

使用规则：

- 蓝色只用于主操作、链接、选中或关键状态。
- 不用大面积品牌色铺背景。
- 避免深色 dashboard 作为默认主题。
- 阴影少用，优先细边框。

## 6. 字体与尺寸

建议沿用 Inter / Geist Sans / system-ui。

- Sidebar brand：`12px`，`letter-spacing: 0.24em` 左右。
- Sidebar item：`12-13px`，`500`。
- Sidebar group label：`10-11px`，灰色。
- Header title：`18-22px`，`600-700`。
- Body text：`14px`。
- Caption / metadata：`12px`。
- Button：`13-14px`，`600`。

排版原则：

- 不使用负字距。
- 不使用随 viewport 缩放的字体。
- 标题不要过大，dashboard 第一屏应服务于操作，而不是宣传。

## 7. 组件语言

### Header

- 高度参考 `72px`。
- 1px 底部分隔线。
- 左侧放页面标题、当前位置或轻量 breadcrumb。
- 右侧放搜索、通知、账户、帮助等工具。
- 不使用厚重 top nav。

### Cards

- 卡片只用于承载独立内容块，不嵌套卡片。
- 圆角建议 `8px` 以内。
- 背景白色，边框 `#E1E1E1` / `#ECECEC`。
- 适合：课程、资源、任务、模板、帮助入口。
- 订单/数据列表仍优先表格或紧凑列表。

### Buttons

- 主按钮克制，不需要大圆角和强阴影。
- 次按钮使用白底灰边。
- 图标按钮使用 `32-36px` 方形点击区。
- 危险操作不放在主按钮位置。

### Forms / Settings

- 设置页适合左右结构：左侧设置组，右侧表单内容。
- 字段之间留白充足，但不要把每个字段都做成卡片。
- 开关、选择器、输入框保持轻边框。

## 8. Zider Dashboard 适配建议

适合直接往 Spark 靠近的区域：

- workspace 首页。
- 组件库 dashboard。
- CMS / 内容管理。
- 帮助中心、文档、FAQ。
- 账户与通知设置。
- 产品资源中心。

需要谨慎混用的区域：

- 订单打印、webhook analytics、批量任务表格等高密度页面，仍应保留更强的信息密度和表格能力。
- 数据型页面可以使用 Spark 的框架和视觉气质，但不要牺牲筛选、批量操作和状态可读性。

推荐方向：

- 外框、侧栏、header 学 Spark。
- 数据表格、批量操作、状态 badge 继续沿用当前后台规范。
- 首页/资源/帮助页更轻、更白、更克制。

## 9. 开发验收清单

- 首屏像一个可长期使用的 dashboard，而不是 landing page。
- 左侧栏有清晰分组，底部账户动作独立。
- Header 高度稳定，内容区从 header 下方开始。
- 页面主色不超过两种，默认不出现大面积渐变。
- 卡片没有套卡片，页面 section 不做成浮动大卡片。
- 文字、图标、分隔线都偏轻，但 hover/focus/active 状态完整。
- 1440 桌面和 375 移动都有明确布局策略。
