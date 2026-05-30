# 字段映射、产品字段、多语言与字体

版本：v0.1
更新日期：2026-05-29
来源：从 [Zider PrintOps 产品需求文档](../order-printing-product-requirements.md) 按模块拆分
模块说明：字段映射、产品同步、产品打印字段、站点语言、打印语言、阅读方向和字体 fallback。
## 1. 字段、产品字段、多语言与字体

### 8.6 字段映射

P0：

- 支持 Wix checkout extra fields / custom fields 映射。
- 支持订单同步后自动发现订单级自定义字段和订单行级自定义字段，并保存样本值。
- 支持将平台字段映射到标准字段。
- 支持将平台字段映射到模板自定义字段。
- 支持模板选择自定义字段并在 PDF / 浏览器打印中输出。
- 支持自定义字段 label、显示 / 隐藏、排序和空值隐藏。
- 支持 text、number、date、url、file、image、boolean 基础类型；文件和图片字段 P0 至少输出文件名 / 链接 / 缩略图之一。
- 显示字段样本值。
- 显示字段是否在当前模板中使用。
- 显示自定义字段缺失或文件不可访问提示。
- 字段映射按店铺隔离。

P1：

- 支持字段缺失率统计。
- 支持字段来源标识。
- 支持 line item 级字段的批量规则、推荐映射和缺失率统计。
- 支持字段显示名多语言配置。
- 支持更完整的 Wix pickup、delivery、POS、custom order 字段映射。

P2：

- 支持 WooCommerce order meta 映射。

P3：

- 支持 Shopify metafields 映射。

### 8.6.1 产品同步与产品打印字段

P1：

- 支持同步当前店铺的 Wix 产品列表。
- 支持同步产品图片、SKU、options、variants、custom text fields。
- 支持按产品名、SKU、标签或同步状态搜索产品。
- 支持产品级打印字段。
- 支持变体级打印字段。
- 支持为产品字段设置字段类型：text、number、date、url、image、file、boolean、select。
- 支持产品字段在模板里作为 line item 字段使用。
- 支持订单行根据 `source_product_id` 和 `source_variant_id` 自动合并产品打印字段。
- 支持产品字段缺失提示。
- 支持产品字段批量编辑。
- 支持产品资料手动刷新。

字段合并规则：

1. 订单行原始字段优先。
2. 变体级打印字段覆盖产品级打印字段。
3. 产品级打印字段作为 fallback。
4. 手动订单字段覆盖产品同步字段。

P1 不做：

- 不把产品打印字段写回 Wix 商品资料。
- 不替代 Wix 产品管理。
- 不处理库存、价格和商品上下架管理。

P2：

- 支持 CSV 批量导入产品打印字段。
- 支持复制产品打印字段到其他店铺。
- 支持从 WooCommerce 产品 meta 同步产品打印字段。

### 8.7 多语言

P0：

- 系统语言支持 English、繁体中文。
- 打印语言 P0 支持 English、Spanish、German、Japanese、French、Portuguese、Simplified Chinese、繁体中文、Arabic、Dutch、Italian、Korean。
- 打印语言选项优先覆盖主流跨境商家语言：English、Spanish、German、Japanese、French、Portuguese、Chinese，并预留 Arabic RTL 场景。
- 系统语言不影响已保存模板的打印语言。
- 打印语言不自动翻译订单原始数据。
- 订单数据默认原样输出。
- 打印语言和阅读方向分开建模，避免把语言选择等同于版式方向。
- P0 模型预留阅读方向字段，但界面不提供独立 `Reading order` 设置。
- English、Spanish、German、Japanese、French、Portuguese、Simplified Chinese、繁体中文、Dutch、Italian、Korean 默认 `Left to right`。
- Arabic 默认 `Right to left`，P0 需要让预览、PDF、浏览器打印共用 `dir="rtl"` 结构；P1 再补完整阿拉伯语语言包、RTL 精细排版和 PDF 验证。

打印语言影响：

- 文档标题。
- 字段标签。
- 状态文本。
- 日期格式。
- 数字和货币格式。
- 地址展示规则。
- 固定文案，如感谢语、退换政策。

P0 模板编辑器必须支持：

- 模板默认打印语言设置。
- 字段 label 的模板内多语言覆盖。
- 预览、PDF、浏览器打印共用同一套 label resolver。
- 内置模板固定标签提供主流语言 fallback；缺失时回退到英文或模板默认文案。
- 日期格式作为模板参数保存，不只依赖浏览器 locale。
- 地址格式作为模板参数保存，先支持预设，后续接国家 / 地区规则。

后续阅读方向影响：

- 文档根节点 `dir`。
- 文字对齐。
- Header logo 和店铺信息顺序。
- 表格列阅读顺序。
- 行项目图标与内容顺序。
- 页眉、页脚和签名区方向。

阅读方向不影响：

- SKU。
- 订单号。
- 金额。
- 邮箱。
- 平台原始订单内容。

打印语言优先级：

1. 单次打印手动覆盖。
2. 订单级自动规则。
3. 模板默认语言。
4. 全局默认语言。

P1：

- 支持模板多语言文案配置。
- 支持按 shipping country 自动选择打印语言。
- 支持按 billing country 自动选择打印语言。
- 支持按站点语言或客户语言偏好选择打印语言。
- 支持缺失翻译提示。

### 8.7.1 地址格式需求分析

地址格式不能只做成纯文本拼接，因为不同平台、国家和配送场景的字段顺序不同。P0 先使用模板参数承接地址格式，保证订单数据进来后能稳定打印；P1 再升级为国家 / 地区规则。

P0 地址格式预设：

| 预设 | 适用场景 | 输出方式 |
|---|---|---|
| 欧美多行 | 美国、加拿大、欧洲常见地址 | name、street、city、region、country、phone 分行 |
| 中国 / 台湾多行 | 中文地址、港澳台及中文商家 | country、region + city、street、name、phone |
| 紧凑格式 | 发票空间较紧、内部单据 | name、street + city、country / phone |
| 单行格式 | 表格、摘要、标签预览 | 全部字段用逗号连接 |

地址 formatter 输入字段：

- name / company。
- address_line_1 / address_line_2。
- city。
- province / state / region。
- postal_code。
- country / country_code。
- phone。
- delivery note 或 pickup location。

地址格式规则：

- Billing address 和 shipping / delivery address 独立开关。
- 若账单地址和收货地址相同，可以后续支持“same as shipping”简化显示。
- 电话号码作为独立显示项，不能强绑定在地址文本中。
- 空字段必须自动隐藏，避免打印空行。
- 原始订单地址数据不自动翻译，只改变标签和排列方式。
- P0 不做国家级完整地址校验，只保证格式预设、空值隐藏和预览一致。

### 8.8 字体

P0：

- 提供 Latin、CJK、Mono number 字体预设。
- PDF 生成时稳定引用或嵌入字体。
- 打印预览和 PDF 输出尽量一致。
- 热敏模板默认使用清晰无衬线字体。

推荐字体：

| 语言 / 文字 | 推荐字体 |
|---|---|
| Latin | Inter 或 Noto Sans |
| 繁体中文 | Noto Sans TC |
| 日文 | Noto Sans JP |
| 韩文 | Noto Sans KR |
| 等宽数字 / 条码文本 | Roboto Mono 或 Noto Sans Mono |

P1：

- 支持每种打印语言设置默认字体。
- 支持模板级字体覆盖。
- 支持字体预览。
- 支持缺字检测提示。

P2：

- 支持上传品牌字体。
- 支持 RTL 语言字体与排版。
