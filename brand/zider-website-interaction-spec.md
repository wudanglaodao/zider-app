# ZIDER 官网交互规范

更新日期：2026-05-23
适用范围：`zider.ink` 官网、Blog、Forum、Contact、Privacy、CMS 轻后台

## 1. 目标与气质

ZIDER 官网是品牌母站，不绑定单一产品。页面需要表达“组件开发 + 实用解决方案”的能力，同时保持轻量、克制、可信，适合后续持续迭代产品线、内容迁移和会员体系。

设计关键词：

- 轻量
- 精致
- 清晰
- 可信
- 创作者工具
- 组件与解决方案

避免：

- 大面积渐变光晕
- 装饰性球体或漂浮卡片堆叠
- 过度营销页感
- 复杂导航
- 过大的正文或按钮字号
- UI 卡片嵌套卡片

## 2. 信息架构

当前官网前台只保留必要入口：

```text
Home
Blog
Forum
Contact
Privacy
```

Header 只展示：

```text
Blog
Forum
Contact
```

Footer 展示：

```text
Blog
Forum
Contact
Privacy
```

约定：

- `Blog` 用于文章、教程、迁移后的内容资产。
- `Forum` 用于问答、支持内容、可搜索的知识沉淀。
- `Contact` 是当前唯一明确 CTA。
- 注册、登录、语言切换暂时不在前台展示，只保留后续技术准备。

## 3. 页面版心

桌面端统一版心：

```text
max-width: 1440px
horizontal gutter: clamp(192px, 18vw, 360px)
container width: min(1440px, 100% - gutter)
```

规则：

- Header、Hero 内容、Logo 滚动条、内容区、Footer 使用同一版心。
- Hero 背景可以铺满 100% 宽度，但 Hero 内容必须和 Header 对齐。
- 大屏幕不要让正文贴边，也不要让视觉图压到文字后面。
- 980px 以下进入单列布局，容器左右留白约 36px。
- 640px 以下移动端左右留白约 24px。

## 4. Header

桌面端：

- Logo 固定在左侧。
- Blog / Forum 居中。
- Contact 按钮固定在右侧。
- Header 使用半透明白底、轻微 blur、细分隔线。
- Header 与 Hero 内容起点必须对齐。

移动端：

- Logo 左侧。
- Contact 与菜单按钮整体靠右。
- 菜单按钮使用图标，不使用文字按钮。
- 菜单打开后使用全屏面板，参考 Stripe 的简单列表结构。
- 每个菜单项一行，右侧可用箭头表示可进入。
- 关闭按钮固定在右上角，不能和内容错位。

交互状态：

- 导航 hover：文字变为 ZIDER green。
- Contact hover：轻微上移，绿色略亮。
- focus-visible：使用绿色半透明描边，保证键盘可访问。

## 5. Hero

桌面端 Hero 使用左右分栏：

- 左侧：定位标签、标题、副标题、按钮。
- 右侧：图形视觉，不放解释性文字。

当前标题：

```text
Components and solutions for creator websites.
```

当前副标题：

```text
We build lightweight interactive components, app utilities, and practical solutions that help creators ship better sites faster.
```

布局规则：

- Hero 内容容器宽度必须和 Header 一致。
- 左侧文案区使用剩余空间，右侧视觉区使用独立宽度。
- 右侧图形区域建议：`clamp(430px, 35vw, 620px)`。
- Hero 高度保持克制，桌面端不超过首屏主要空间，避免像整屏海报。
- 图形卡片必须完整显示，不能被压成竖条。
- 图形不能作为文案背景，不能影响标题和正文阅读。
- 视觉图可以轻微浮动，但动画必须安静，不要抢内容焦点。

视觉规则：

- 使用粒子网格、模块面板、细线、轻微透明层。
- 主色使用 ZIDER green `#087a46`。
- 可用少量 `gold` / `coral` 做点缀。
- 不使用紫蓝大渐变、光晕、bokeh、装饰球体。

## 6. 按钮

主要按钮：

- 背景：ZIDER green `#087a46`
- 字色：白色
- 圆角：4px - 6px
- 可带一个箭头图标
- hover：轻微上移，绿色略亮
- active：轻微缩放

次要按钮：

- 白底
- 绿色文字
- 绿色细边框
- 不重复使用和主要按钮相同的箭头图标

按钮排布：

- 桌面端横向排列，间距 8px - 12px。
- 移动端在空间不足时允许换行或变成单列。
- 按钮文字不得溢出容器。

## 7. Logo 滚动条

用途：

- 表达 ZIDER 可服务的工具生态。
- 当前可展示 Wix、Webflow、WordPress、Shopify、Codex、Framer、Figma。

规则：

- 只展示图标，不再使用大段说明文字。
- 使用低对比度图标，保持轻量。
- 滚动速度要慢，不能影响阅读。
- 移动端图标间距收窄，但仍保持可识别。

## 8. 内容区

首页当前保留三类内容：

```text
Components
Solutions
Resources
```

内容卡片规则：

- 卡片用于承载独立条目，不嵌套卡片。
- 标签使用小号胶囊样式。
- 标题字号比 Hero 明显小，适合扫描。
- 正文使用中低对比度，不要过粗。
- hover 只做轻微上移、边框高亮、阴影增强。
- 移动端必须单列，标签和标题不能错位。

## 9. Blog / Forum 页面

公共规则：

- Blog 和 Forum 必须共用官网 Header / Footer。
- 列表页使用大标题 + 简短说明 + 内容列表。
- 详情页正文阅读宽度控制在 760px 左右。
- 图片自适应容器宽度，带轻微圆角。
- 详情页支持 H1、H2、P、链接、图片。

Blog：

- 列表页标题只显示 `Blog`，不使用长句式营销标题。
- 列表页标题要小于官网首页 Hero 标题，保持内容页气质。
- 列表以简洁文章索引为主，封面图作为中小尺寸缩略图出现。
- 列表项包含分类、时间、标题、摘要和轻量标签；缩略图使用独立内框，不做大卡片。
- 列表 hover 只允许轻微背景变化、标题变色和缩略图轻微缩放。
- 详情页使用“左侧正文 + 右侧推荐文章列表”的阅读布局。
- 详情页标题不使用首页 Hero 级别字号，封面图控制高度，避免首屏只看到标题和大图。
- 详情页顶部的小号入口显示分类名，分类优先取第一条 tag；不要写死为 `Blog`。
- 可使用示例数据兜底。
- 后续从 CMS 读取迁移内容。

Forum：

- 从 CMS 读取已发布内容。
- 无内容时展示清晰空状态。
- 前台统一使用 `Forum`，不再显示旧中文导航名。

## 10. Footer

Footer 与 Header 共用品牌风格：

- Logo 左侧。
- 简短品牌说明。
- 链接保留 Blog、Forum、Contact、Privacy。
- 尽量紧凑，避免占用过多垂直空间。
- Footer 顶部使用细分隔线。

语言入口：

- 暂时隐藏。
- 只保留技术准备。
- 后续正式多语言上线后，再加入真实切换入口。

技术准备：

```text
locale: en / zh-Hant / zh-Hans
```

## 11. CMS 编辑器与媒体库

CMS 编辑器当前支持：

- H1
- H2
- P
- 文字链接
- 图片上传
- 媒体库选择插入

媒体库当前为本地预览实现：

```text
localStorage -> media item -> editor insert
```

后续接腾讯云 COS：

```text
File -> Tencent Cloud COS -> public URL -> media item.url
```

编辑器规则：

- 上传图片先进入媒体库，不直接插入正文。
- 从媒体库选择图片后再插入正文。
- 图片插入使用 `figure + img + figcaption`。
- 不在编辑界面显示 Source URL 字段。
- 保存内容后，Blog / Forum 列表和详情页必须能读取发布状态。

## 12. 响应式检查清单

每次调整官网样式后检查：

- 桌面端 1440px 以上：Header、Hero、Footer 是否同版心。
- 桌面端 Hero：右侧图形是否完整，不被压成竖条。
- 平板宽度：Hero 是否在合适时机切换为单列。
- 移动端 Header：Logo 左侧，Contact 和菜单按钮靠右。
- 移动端菜单：全屏打开，不错位，不遮挡关闭按钮。
- Hero 标题、副标题、按钮不重叠。
- 内容卡片标签不压住标题。
- Footer 是否紧凑。
- Blog / Forum / Contact / Privacy 是否共用公共 Header / Footer。

开发验证命令：

```bash
npm --prefix apps/site run typecheck
npm --prefix apps/site run build
```

本地预览地址：

```text
http://localhost:3100/
http://localhost:3100/blog
http://localhost:3100/forum
http://localhost:3100/admin/cms?token=local-cms-preview
```
