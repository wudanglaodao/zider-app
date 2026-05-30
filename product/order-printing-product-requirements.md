# Zider PrintOps 产品需求文档

版本：v0.13
更新日期：2026-05-30
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

P0 聚焦 Wix Stores：

- Orders 工作台：最新订单同步、最近 7 天历史订单手动同步、筛选、预览、批量打印。
- Template Center：My Templates、Template Library、模板详情和预览。
- Template Editor：内置风格模板 + 参数化配置 + 结构化模板 JSON。
- Field Mapping：Wix custom fields、checkout extra fields、buyer note、商品选项和上传文件。
- Output：打印预览、PDF、浏览器打印、Print History。
- 多店铺：组织下多个店铺隔离订单、模板、字段映射和打印记录。
- 多语言：站点语言和打印语言分开建模。

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

## 4. 专项文档

| 文档 | 用途 |
|---|---|
| [模板专项需求文档](./order-printing-template-requirements.md) | Template Center 和 Template Editor 的详细产品需求 |
| [模板视觉与场景调研](./order-printing-template-visual-research.md) | 模板截图、场景、尺寸、视觉样例和竞品观察 |
| [技术架构文档](./order-printing-technical-architecture.md) | 数据结构、系统模块、渲染链路和技术实现方向 |
| [系统结构文档](./order-printing-system-structure.md) | 页面结构、菜单结构、系统信息架构 |
| [设计语言文档](./order-printing-design-language.md) | 后台视觉语言、Light / Dark token、侧边栏和顶部栏风格 |
| [Shopify 竞品调研](./order-printing-shopify-competitor-research.md) | Shopify 生态竞品、目标客户、需求和商业场景 |
| [Haemess / Harness 文档](./order-printing-harness.md) | 早期调研和外部参考材料 |

## 5. 当前关键决策

- 应用名称：`Zider PrintOps`，路径使用 `/apps/printops`。
- Wix app key 使用 `zider_printops`；平台插件代码统一放入 `packages/platform-plugins/`。
- 早期入口取消 `/order-printer`，不做兼容跳转。
- P0 同步边界为最新订单 + 最近 7 天历史订单，暂不做任意历史全量导入。
- P0 优先做打印和模板，不做发货平台中转。
- 订单类型按模板理解，不单独做复杂订单类型系统。
- 不做打印机配置和连接，先用 PDF / Browser print。
- 前期不考虑“需重打”状态，重新输出按新的打印记录处理。
- Browser print 只能标记为 `sent_to_browser_print`，不保证真实打印成功。
- 模板编辑 P0 采用 Vify 式配置编辑器，不做完整拖拽式设计工具。
- 模板底层必须结构化，支持后续组件编辑、代码模式和 AI Template Designer。
- 餐饮 / Wix Restaurants 暂缓，不进入当前 P0 / P1。
