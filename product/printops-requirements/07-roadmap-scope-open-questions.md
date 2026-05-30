# MVP 范围、路线图与待确认问题

版本：v0.1
更新日期：2026-05-30
来源：从 [Zider PrintOps 产品需求文档](../order-printing-product-requirements.md) 按模块拆分
模块说明：P0 必做 / 暂缓、后续阶段、非目标范围和待确认问题。
## 10. MVP 范围

### 10.1 P0 必做

- Wix Stores 订单拉取：默认同步最新订单，历史订单仅支持最近 7 天手动回溯。
- 多店铺连接和店铺切换器。
- Orders 列表与批量选择。
- Template Center：My Templates、Template Library、模板详情 / 预览。
- Packing Slip、Pick List、Production Sheet、Invoice Helper、Receipt Helper、Thermal Receipt 六类内置模板。
- 从内置模板创建当前店铺模板。
- 当前店铺模板复制、重命名、删除和设为默认。
- A4、Letter、4x6、80mm 纸张尺寸。
- 模板尺寸、边距预设、密度和版式 preset。
- 字段显示开关。
- 商品表格列显示 / 隐藏。
- 字段 label 自定义。
- Wix custom fields / checkout extra fields 映射。
- Wix custom fields / checkout extra fields / 订单行 custom text 字段打印输出。
- 自定义字段样本发现、空值隐藏、缺失提示和文件 / 图片字段降级展示。
- 系统语言：English、繁体中文。
- 打印语言：English、Spanish、German、Japanese、French、Portuguese、Simplified Chinese、繁体中文、Arabic、Dutch、Italian、Korean。
- 字体预设：Latin、CJK fallback、mono number。
- 打印预览。
- 基础校验。
- 批量 PDF。
- 浏览器打印。
- 默认文件名规则。
- 打印状态记录。
- Print job 状态模型。
- 标准订单模型。
- 平台原始 payload 保存。

### 10.2 P0 暂缓

- 任意时间范围历史订单全量导入。
- 自动翻译订单数据。
- 合规电子发票。
- 供应商采购单流程。
- 自动邮件。
- 复杂自动化。
- 自定义字体上传。
- 产品同步和产品打印字段维护。
- 组织共享模板。
- 模板复制到其他店铺。
- 模板版本管理。
- 模板自动匹配规则。
- 模板市场和行业模板包管理。
- AI 图片生成模板。
- WooCommerce / Shopify 生产级接入。
- 餐饮 / Wix Restaurants 深度接入和餐饮厨房分单（暂缓）。
- 发货平台连接和 fulfillment 回写。
- 打印机连接。
- 云打印。
- 本地打印代理。
- 设备级协议。

## 11. 后续阶段

### 11.1 P1：完善 Wix Stores 订单打印

- 增量同步和 webhook。
- 更长时间范围的历史订单同步策略、分页进度和重试恢复。
- Wix Orders 字段覆盖验证。
- pickup / local delivery 字段支持。
- POS / custom order 字段支持。
- 字段样本识别。
- 字段缺失率提示。
- 模板版本管理。
- 模板启用 / 停用。
- 多语言模板文案。
- 批量 ZIP 下载。
- 自定义文件名规则。
- Wix 产品同步。
- 产品打印字段维护。
- 变体级打印字段。
- 产品字段在模板中引用。
- Print job history。

### 11.2 Deferred：Wix Restaurants / 餐饮

- 暂不启动 Wix Restaurants 数据读取验证。
- 暂不设计 Kitchen Ticket、餐饮 Pickup Ticket / Delivery Ticket。
- 暂不纳入餐饮特殊要求、modifier、过敏提醒字段。
- 后续如进入餐饮行业包，再单独开需求文档和技术验证。

### 11.3 P2：WooCommerce 与打印工作流扩展

- WooCommerce 插件 PoC。
- WooCommerce order meta 字段映射。
- WooCommerce checkout fields 映射。
- WooCommerce 产品 meta 字段同步。
- WordPress 插件安装和授权流程。
- CSV 导入。
- 基础行业模板包。

### 11.4 P3：Shopify、API 与高级扩展

- Shopify connector 验证。
- Shopify metafields 映射。
- Shopify fulfillment / POS 字段映射。
- 发货平台 connector PoC。
- Wix fulfillment / tracking number 回写 PoC。
- Shipment 状态模型。
- 多店铺模板复用。
- Direct API。
- 白标模板和打印服务。
- Agency 客户工作区。
- 自动邮件和客户下载链接。
- AI Template Designer：根据用户上传的品牌图片、单据截图或模板参考图生成可编辑模板草稿。

## 12. 非目标范围

第一版不做：

- 完整合法税务开票系统。
- 自动翻译客户备注、商品名或生产说明。
- 静默直连实体打印机。
- 深度 POS 收款闭环。
- 完整 shipping label 购买流程。
- AI 自动改写订单数据。
- AI 直接生成不可编辑图片作为打印模板。
- AI 自动发布或自动替换默认模板。
- 复杂拖拽式设计工具；但 P0 模板组件模型必须为后续拖拽编辑器预留。

## 13. 待确认问题

### 13.1 Wix 技术问题

- Wix Orders API 是否可读取 checkout extra fields。
- 是否可读取 uploaded files / product options。
- 是否可读取 pickup / local delivery 字段。
- 是否可读取 POS / custom order 相关字段。
- 是否可通过 Wix API 创建 fulfillment、写入 tracking number 和 tracking URL。
- Wix fulfillment 回写是否支持 partial fulfillment 和多包裹。
- 是否支持 order tags 或自定义 app 数据记录打印状态。
- 是否能通过 Wix App 在 dashboard 提供自然的订单选择入口。

### 13.2 产品问题

- 商家最常用的前三种文档类型是什么。
- 多语言商家希望按客户国家、站点语言还是手动选择打印语言。
- AI 图片生成模板是否作为高级付费能力、按生成次数计费，还是包含在高阶套餐中。
- AI 模板生成的主要输入优先支持品牌素材、现有单据截图，还是网站截图。
- AI 生成模板是否需要支持 Agency 批量为多个客户生成品牌模板包。
- 字体设置需要暴露到模板级，还是预设足够。
- 发票 / 收据辅助能力是否会引发合规期待。
- 80mm 热敏模板在浏览器打印下是否能满足门店出单需求。
- 商家是否希望订单打印工具继续承担发货中转、tracking 回写和发货异常处理。
- 发货平台优先对接 Shippo、ShipStation、Easyship、AfterShip，还是商家所在地区的本地物流平台。
