# Zider PrintOps 产品需求文档

版本：v0.20
更新日期：2026-06-23
文档类型：功能需求入口 / 模块索引
当前范围：Wix Stores 首发，优先覆盖订单模板、字段映射、自定义样式、预览、PDF 和浏览器打印；餐饮 / Wix Restaurants 暂缓，后续单独评估

## 1. 文档使用方式

这份文档现在作为 PrintOps 产品需求入口，不再承载所有详细需求。详细内容按模块拆分到 [printops-requirements](./printops-requirements/) 目录，避免一个 PRD 持续膨胀。

更新规则：

- 产品定位、范围、模块索引和跨模块决策写在本文件。
- 具体功能需求写入对应模块文档。
- 模板中心和模板编辑器的详细需求优先维护专项文档。
- 调研图片和竞品截图只放在调研文档，不直接塞回主 PRD。

## 2. 当前产品判断

Zider PrintOps 为电商商家提供一个订单文档生成与打印工作台，把订单数据转换成商家履约、生产、打包、财务和门店作业需要的文档。

P0 聚焦 Wix Stores，当前已落地的 V1 闭环包括：

- Wix Dashboard 入口：`/apps/printops/wix` 作为 Wix 后台内嵌工作台。
- Account Binding：Wix 安装后先创建 pending installation，邮箱验证码通过后再绑定 ZIDER member、workspace 和 connected store。
- Orders 工作台：默认同步最近 3 天订单，更多菜单提供最近 7 天同步；订单列表每 3 分钟刷新一次缓存；支持已打印 / 未打印筛选、搜索、单订单 PDF / Print / Preview 和批量 PDF / 浏览器打印 / 标记已打印。
- Wix 订单事件：Wix backend extension 转发 Order Created / Updated / Approved 等业务事件到 `app.zider.ink/webhooks/printops/wix`，接收端用 `ZIDER_WIX_EVENT_FORWARD_SECRETS` 校验。
- Template Center：My Templates、Template Library、A4 Invoice 内置模板、模板预览、复制、删除、设置默认模板。
- Template Editor：内置风格模板 + 参数化配置 + 结构化模板 JSON；右侧 A4 预览在编辑滚动时吸附；保存失败不关闭编辑器。
- Template Persistence：模板、默认模板、PrintOps 设置均以 Supabase 为准；页面加载先读数据库，没有记录再创建默认模板，不再把 localStorage 当正式数据源。
- Field / Output：支持订单字段、订单行、SKU、商品图、订单条形码、SKU 条形码、财务汇总行开关、社媒页脚和品牌 logo / text logo。
- 多语言：界面语言与打印语言分开；打印语言支持主流语言和 Arabic RTL；固定 label 自动切换，订单原始内容不自动翻译。
- Subscription：右上角显示当前 Wix 套餐和 Upgrade；本月用量按当月同步订单数计算，不按是否打印计算。
- Support / Help：左侧 Support 入口使用 `mailto:support@zider.ink`，Help 入口跳转社区 / 帮助页。

P0 不做：

- 打印机配置和连接。
- 发货平台对接和 tracking 回写。
- WooCommerce / Shopify 生产级接入。
- AI 图片生成模板。
- 复杂拖拽式设计工具。
- 餐饮 / Wix Restaurants / Kitchen Ticket。

## 3. 模块文档

| 模块 | 文档 | 维护内容 |
|---|---|---|
| 01 | [总览、范围与角色](./printops-requirements/01-overview-scope.md) | 产品概述、目标、竞品转化、命名、路径、界面结构、平台范围、用户角色 |
| 02 | [订单数据模型与模板渲染上下文](./printops-requirements/02-order-data-model.md) | 标准订单模型、产品资料、履约支付、物流、自定义字段、Template Render Context |
| 03 | [模板场景与文档类型](./printops-requirements/03-template-scenarios-document-types.md) | 模板场景、文档类型、业务场景矩阵、Deferred 餐饮说明 |
| 04 | [订单工作台、打印链路与关键流程](./printops-requirements/04-orders-print-workflow.md) | 店铺连接、订单列表、订单详情、打印预览、批量 PDF、Print Job、关键流程 |
| 05 | [模板中心与模板编辑器](./printops-requirements/05-template-center-editor.md) | Template Center、Template Editor、组件模型、尺寸设置、AI 生成模板入口 |
| 06 | [字段映射、产品字段、多语言与字体](./printops-requirements/06-fields-localization-fonts.md) | 字段映射、产品同步、产品打印字段、站点语言、打印语言、字体 fallback |
| 07 | [MVP 范围、路线图与待确认问题](./printops-requirements/07-roadmap-scope-open-questions.md) | P0 必做 / 暂缓、P1/P2/P3、非目标范围、待确认问题 |
| 08 | [Wix 首发版本发布与测试接入计划](./printops-requirements/08-wix-release-test-plan.md) | Wix 发布、环境变量、Webhook、同步、PDF 和回归测试清单 |

## 4. 专项文档

| 文档 | 用途 |
|---|---|
| [模板专项需求文档](./order-printing-template-requirements.md) | Template Center 和 Template Editor 的详细产品需求 |
| [模板视觉与场景调研](./order-printing-template-visual-research.md) | 模板截图、场景、尺寸、视觉样例和竞品观察 |
| [技术架构文档](./order-printing-technical-architecture.md) | 数据结构、系统模块、渲染链路和技术实现方向 |
| [系统结构文档](./order-printing-system-structure.md) | 页面结构、菜单结构、系统信息架构 |
| [设计语言文档](./order-printing-design-language.md) | 后台视觉语言、Light / Dark token、侧边栏和顶部栏风格 |
| [Shopify 竞品调研](./order-printing-shopify-competitor-research.md) | Shopify 生态竞品、目标客户、需求和商业场景 |
| [Harness 文档](./order-printing-harness.md) | 系统边界、运行契约、数据同步、模板、PDF 和发布验收清单 |

## 5. 当前关键决策

- 应用名称：`Zider PrintOps`，路径使用 `/apps/printops`。
- Wix app key 使用 `zider_printops`；平台插件代码统一放入 `packages/platform-plugins/`。
- 早期入口取消 `/order-printer`，不做兼容跳转。
- P0 默认同步边界为最近 3 天订单；最近 7 天同步放在更多菜单，暂不做任意历史全量导入。
- 新订单进入列表依赖业务 webhook 入库；前端只做每 3 分钟轻量刷新，不作为唯一同步机制。
- Wix backend extension 和 Vercel 接收端必须使用同一个 `ZIDER_WIX_EVENT_FORWARD_SECRETS={"zider_printops":"<secret>"}`，401 视为密钥不一致或缺失。
- App lifecycle / billing event 与 order business webhook 分开处理，不能写进同一条业务同步链路。
- Wix owner email 只作为默认待验证邮箱；邮箱验证码通过前不创建正式 ZIDER member / workspace 归属。
- 订单、模板、设置、订阅快照的正式来源是 Supabase；localStorage 只能作为临时 UI 状态或开发 fallback。
- 订单数据必须记录所属 store / workspace 上下文，为后续多店铺筛选、隔离和合并做准备。
- 打印订单永远使用数据库里的当前默认模板语言和设置，不使用前端缓存里的旧模板。
- P0 优先做打印和模板，不做发货平台中转。
- 订单类型按模板理解，不单独做复杂订单类型系统。
- 不做打印机配置和连接，先用 PDF / Browser print。
- 前期不考虑“需重打”状态，重新输出按新的打印记录处理。
- Browser print 只能标记为 `sent_to_browser_print`，不保证真实打印成功。
- 模板编辑 P0 采用 Vify 式配置编辑器，不做完整拖拽式设计工具。
- 模板底层必须结构化，支持后续组件编辑、代码模式和 AI Template Designer。
- PDF、浏览器打印和屏幕预览必须共用同一份 A4 模板结构；绿色品牌线、RTL 对齐、财务行开关等样式不能只存在于预览。
- 餐饮 / Wix Restaurants 暂缓，不进入当前 P0 / P1。
