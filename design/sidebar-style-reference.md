# 侧边栏样式参考

更新时间：2026-05-24
参考来源：用户提供的 SPARK 侧边栏截图
相关文档：[Spark Dashboard 设计语言参考](spark-dashboard-design-language.md)

## 1. 风格关键词

- 窄侧栏：整体更像轻量 SaaS/学习社区后台，而不是宽大的企业管理台。
- 白色底：侧栏使用纯白或接近纯白背景，依靠留白和分组建立层级。
- 黑白为主：图标和文字以深灰/黑色为主，不依赖大面积品牌色。
- 分组清楚：导航按业务语义分组，每组之间用纵向留白分隔。
- 低装饰：没有阴影、渐变、背景块或复杂描边。
- 底部动作固定：`Log Out` 独立放在底部，和主导航保持距离。

## 2. 可借鉴的结构

截图中的信息架构：

- 顶部品牌：`SPARK` 字标，字距较大，体量小。
- 主导航：`Overview`、`Explore`、`My Courses`、`Favorite`。
- Mentors：`Top`、`Followed`。
- Community：`Forums`、`Events`、`Meetups`。
- Resources：`Tutorials`、`FAQ`。
- Support：`Contact Support`、`Help Center`。
- 底部：`Log Out`。

后续在 Zider 后台中可替换为：

- Workspace：`Overview`、`Orders`、`Templates`、`Print Jobs`。
- Automations：`Rules`、`History`。
- Resources：`Docs`、`FAQ`。
- Support：`Contact Support`、`Help Center`。
- Account：`Log Out` 固定底部。

## 3. 视觉规格建议

- 宽度：参考图偏窄，实际产品可用 `160-188px`，避免中文或较长英文溢出。
- 内边距：左右 `20-24px`，顶部 `24px`。
- 品牌区：高度约 `44-52px`，字标 `12px` 左右，使用 `letter-spacing: 0.24em`。
- 分组间距：`22-28px`。
- 分组标题：`10-11px`，灰色，常规字重，可用首字母大写。
- 导航项高度：`24-28px`，每项之间 `6-8px`。
- 图标：`14px`，线性图标，统一 stroke width。
- 导航文字：`11-12px`，默认 `500`，当前项可提升到 `600`。
- 背景：默认白色，hover 使用极浅灰 `#F6F7F9`。
- 当前项：优先用文字加粗、图标加深或轻微浅灰底，不使用醒目的整块高亮。

## 4. 交互与状态

- Hover：导航项出现浅灰背景，圆角 `6px` 以内。
- Active：保持克制，文字/图标更深，可配合轻浅背景。
- Focus：键盘聚焦需要有可见描边，建议 `#0F73FF` 的细描边或 outline。
- Collapsed：若后续支持折叠，保留图标和 tooltip；分组标题隐藏。
- Bottom action：退出、账户设置等低频动作固定在侧栏底部，不混入主流程导航。

## 5. 实现提示

- 图标优先使用 lucide icons，尺寸统一。
- 侧栏可以用 flex column：顶部品牌、可滚动导航区、底部账户区。
- 导航分组不要靠分割线堆叠，优先靠留白。
- 长文本使用 `white-space: nowrap`、`overflow: hidden`、`text-overflow: ellipsis`。
- 中文界面不要照搬截图的超窄尺寸，最小建议 `176px`。

## 6. 使用边界

- 适合：工作台、CMS、轻量管理后台、学习/资源型社区后台。
- 不适合：高密度订单表格主界面的唯一导航方案，如果导航项很多，应使用更宽的后台侧栏。
- 可混用：订单打印工具的主后台仍可沿用宽侧栏；个人工作台、组件库、资源中心可参考这张窄侧栏。
