# Zider PrintOps Pricing Plan

版本：v0.1
更新日期：2026-06-22
适用阶段：Wix Stores 首发 / v0.1-v1.0

## 1. 定价结论

首发建议使用 **Free + Starter + Pro** 三档，先不要做复杂的按次扣费或模板市场。

推荐公开价格和单价：

| Plan | 月付单价 | 年付总价 | 年付折算月单价 | 年付折扣 | 每月打印订单额度 | 月付订单单价 | 年付订单单价 | 核心定位 |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Free | $0 | - | - | - | 50 | $0 | $0 | 小店试用、安装转化、模板预览 |
| Starter | $7 / month | $70 / year | $5.83 / month | 约 16.7% | 500 | $0.0140 / order | $0.0117 / order | 低订单量店铺的日常发票和装箱单打印 |
| Pro | $15 / month | $150 / year | $12.50 / month | 约 16.7% | 3,000 | $0.0050 / order | $0.0042 / order | 成长型店铺的批量打印、多模板、多店铺和字段映射 |
| Business | $29 / month | $290 / year | $24.17 / month | 约 16.7% | 10,000 | $0.0029 / order | $0.0024 / order | 后续开放给高订单量、多店铺、产品字段和团队流程 |

订单单价按“当月额度打满”估算，实际销售文案不建议强调单订单价格。年付统一采用“买 10 个月送 2 个月”的结构，折扣清晰，也方便后续统一调价。

首发时只在 Wix App Market 展示 Free、Starter、Pro。Business 先作为内部预留档，不必第一天公开，避免承诺 P1/P2 功能。

## 2. 定价原则

- 先按 **打印订单量 + 批量处理能力 + 模板/字段能力** 分层。
- 不把基础 PDF、浏览器打印、Logo、品牌色做成高阶付费点；这些是订单打印工具的基础门槛。
- 把高级价值放在批量效率、店铺数量、自定义字段、产品字段、打印历史、模板规则和未来自动化上。
- 不用“合规发票”做卖点，统一使用 `Invoice Helper` / `print-ready order documents`，避免税务合规期待。
- 首发价格要低于 Shopify 成熟工具的中高档，但高于纯低价 Wix 工具，给后续支持和模板维护留毛利。

## 3. 推荐套餐

### 3.1 Free

目标用户：

- 刚安装的 Wix 小店。
- 想确认订单字段和模板效果的商家。
- 每月订单量很低、暂时不愿付费的商家。

建议限制：

| 项目 | Free |
|---|---|
| 打印订单量 | 50 printed orders / month |
| 店铺数 | 1 store |
| 订单同步 | 最新订单 + 最近 7 天手动同步 |
| 模板 | 3 个内置发票模板，可复制 1 个店铺模板 |
| PDF / 打印 | 单订单 PDF、浏览器打印、每次最多 10 单批量 |
| 品牌 | 保留 `Powered by Zider PrintOps` 小水印 |
| 字段 | 基础订单字段、自定义字段预览 |
| 支持 | 文档和基础邮件支持 |

Free 的目的不是让用户长期免费使用全部能力，而是让用户完成：

```text
安装 -> 同步订单 -> 选择模板 -> 预览 -> 打印第一张单据
```

### 3.2 Starter

目标用户：

- 每月几十到几百单的 Wix Stores 商家。
- 主要需求是发票、装箱单、收据、PDF 下载和批量浏览器打印。
- 不需要多店铺、复杂产品字段或团队流程。

价格：

- $7 / month。
- $70 / year。
- 可在首发 60 天使用 launch price：$5 / month 或 $49 / year。

建议权益：

| 项目 | Starter |
|---|---|
| 打印订单量 | 500 printed orders / month |
| 店铺数 | 1 store |
| 模板 | 最多 5 个店铺模板 |
| 批量处理 | 每次最多 50 单批量 PDF / 浏览器打印 |
| 品牌 | 移除 Zider 水印 |
| 模板能力 | Logo、品牌色、商品图片开关、字段 label、自定义文案 |
| 文档类型 | Invoice Helper、Packing Slip、Receipt Helper |
| 多语言 | 常用打印语言标签和日期/货币格式 |
| 字段 | Wix checkout extra fields / custom fields 输出 |
| 支持 | 邮件支持 |

### 3.3 Pro

目标用户：

- 每月几百到几千单的成长型商家。
- 有仓库、生产、定制商品、跨境语言或多模板需求。
- 愿意为批量效率和字段能力付费。

价格：

- $15 / month。
- $150 / year。

建议权益：

| 项目 | Pro |
|---|---|
| 打印订单量 | 3,000 printed orders / month |
| 店铺数 | 3 stores |
| 模板 | 无限店铺模板 |
| 批量处理 | 每次最多 250 单批量 PDF / 浏览器打印 |
| 文档类型 | Starter 全部 + Pick List、Production Sheet、Thermal Receipt |
| 字段 | 高级自定义字段、订单行 custom text / options、图片/文件字段降级展示 |
| 多语言 | 全部 P0 打印语言 |
| 打印记录 | Print job history、重印记录、失败订单提示 |
| 文件 | 自定义文件名规则、批量 ZIP 下载（P1 开放） |
| 支持 | 优先邮件支持 |

### 3.4 Business（后续开放）

目标用户：

- 多店铺商家、机构客户、B2B / wholesale、定制商品生产团队。
- 需要产品字段、变体字段、组织共享模板和更强批量工作流。

价格：

- $29 / month。
- $290 / year。
- 高量客户可单独报价。

建议权益：

| 项目 | Business |
|---|---|
| 打印订单量 | 10,000 printed orders / month，超出后软提醒 |
| 店铺数 | 10 stores |
| 模板 | 组织共享模板、模板版本、模板锁定 |
| 字段 | 产品打印字段、变体级字段、字段缺失率提示 |
| 自动化 | 模板自动匹配规则、按国家/语言选择打印语言 |
| 团队 | 角色权限、团队操作记录（后续） |
| 支持 | 优先支持和一次免费模板设置协助 |

Business 不建议在 P0 上架，因为当前路线图中产品字段、模板版本、组织共享模板和规则能力仍是 P1/P2。

## 4. 功能分层表

| 功能 | Free | Starter | Pro | Business |
|---|---:|---:|---:|---:|
| Printed orders / month | 50 | 500 | 3,000 | 10,000 |
| Stores | 1 | 1 | 3 | 10 |
| Active store templates | 1 | 5 | Unlimited | Unlimited |
| Built-in template library | Basic | Standard | All | All + packs |
| Remove watermark | - | Yes | Yes | Yes |
| Single PDF / browser print | Yes | Yes | Yes | Yes |
| Batch PDF / browser print | 10 / job | 50 / job | 250 / job | 500 / job |
| Invoice Helper | Yes | Yes | Yes | Yes |
| Packing Slip | Limited | Yes | Yes | Yes |
| Receipt Helper | - | Yes | Yes | Yes |
| Pick List | - | - | Yes | Yes |
| Production Sheet | - | - | Yes | Yes |
| Thermal Receipt | - | - | Yes | Yes |
| Wix custom fields | Preview | Yes | Yes | Yes |
| Line item custom fields | Preview | Basic | Advanced | Advanced |
| Product / variant print fields | - | - | P1 preview | Yes |
| Print job history | Basic | 30 days | 180 days | 1 year |
| Custom file naming | - | - | Yes | Yes |
| Batch ZIP download | - | - | P1 | Yes |
| Shared templates | - | - | - | Yes |
| Priority support | - | - | Yes | Yes |

## 5. 升级触发点

Free -> Starter：

- 想移除水印。
- 每月超过 50 单。
- 需要批量打印超过 10 单。
- 需要保存多个模板。

Starter -> Pro：

- 每月超过 500 单。
- 需要多个文档类型，如 Pick List、Production Sheet、Thermal Receipt。
- 需要更多店铺。
- 需要更完整的自定义字段、打印历史和文件命名。

Pro -> Business：

- 多店铺运营。
- 仓库或生产团队依赖产品/变体级打印字段。
- 需要组织共享模板、模板版本、模板规则和高优先级支持。

## 6. 超额后的业务限制策略

### 6.1 计费口径

推荐使用 `printed orders / month` 作为主额度，不使用同步订单数、预览次数或 PDF 生成次数计费。

定义：

- 一个订单在当前账期内首次进入成功的 PDF 下载、批量 PDF、浏览器打印或标记打印任务后，计为 1 个 printed order。
- 同一个订单在同一账期内重复下载、重印或切换模板重印，不重复消耗 printed order 额度。
- 订单同步、订单列表查看、模板预览、字段映射预览、测试样例订单预览不消耗额度。
- 如果同一订单需要同时输出 Invoice、Packing Slip、Pick List，仍按 1 个 printed order 计。这样更符合商家的理解，也减少客服争议。

这个口径比“每生成一份 PDF 就计费”更友好。成本控制主要通过每次批量上限、历史文件保留时间和异常频率监控来做。

### 6.2 额度提醒

| 使用进度 | 系统动作 | 用户体验 |
|---|---|---|
| 70% | Dashboard 顶部轻提示 | 告知本月已使用额度和剩余额度 |
| 90% | 明显提示 + 邮件提醒 | 建议升级或切换年付/更高套餐 |
| 100% | 进入宽限区 | 继续允许少量新订单输出，提示即将限制 |
| 110% | 硬限制 | 阻止新订单输出，只允许重印已计入额度的订单 |

Free 可以不提供 10% 宽限，达到 50 单后直接进入输出限制。Starter 和 Pro 建议提供 10% 宽限，避免商家在发货高峰被突然中断。

### 6.3 超出打印订单额度后的限制

达到硬限制后，继续开放：

- 打开 Dashboard。
- 查看订单列表和订单详情。
- 同步最新订单。
- 查看和编辑模板。
- 预览模板和订单。
- 查看历史 print jobs。
- 重印本账期内已经计入额度的订单。
- 删除模板、修改字段、调整店铺设置。

达到硬限制后，限制：

- 不能生成包含“本账期未计入额度的新订单”的 PDF。
- 不能对“本账期未计入额度的新订单”执行浏览器打印。
- 不能把“本账期未计入额度的新订单”标记为已打印。
- 批量任务中如果混有已计入订单和未计入订单，只允许继续输出已计入订单；未计入订单需要升级或等下个账期。

推荐提示文案：

```text
You have reached this month's printed order limit. You can still sync orders, edit templates, preview documents, and reprint orders already counted this month. Upgrade to continue printing new orders.
```

### 6.4 超出店铺数量后的限制

店铺数量不建议做突然断开。应该使用 `active stores` 口径：

| 场景 | 处理方式 |
|---|---|
| 当前套餐店铺数已满，用户连接新店铺 | 阻止新增 active store，提示升级 |
| 用户从 Pro 降级到 Starter，但已有 3 个店铺 | 要求选择 1 个 active store，其余变成 inactive |
| inactive store | 可查看历史设置，不同步新订单，不生成新打印任务 |
| 升级后 | 允许重新激活 inactive store |

不要删除店铺数据。降级或超额时只改变 active / inactive 状态，保留订单、模板和配置，减少用户恐慌。

### 6.5 超出模板数量后的限制

模板也建议使用 `active templates` 口径：

- 超出套餐数量后，允许继续查看和复制历史模板，但不能把新模板设为 active。
- inactive template 可以编辑草稿，但不能设为默认模板，不能用于正式打印。
- 如果用户从高阶套餐降级，保留所有模板数据，但要求选择当前套餐允许数量的 active templates。
- 内置模板不计入 active template 数量；只有用户复制到店铺里的模板计数。

### 6.6 超出批量任务上限后的限制

批量任务上限是体验限制，不是账期额度。

| Plan | 每次批量上限 | 超出处理 |
|---|---:|---|
| Free | 10 orders / job | 要求拆分任务或升级 Starter |
| Starter | 50 orders / job | 要求拆分任务或升级 Pro |
| Pro | 250 orders / job | 要求拆分任务或升级 Business |
| Business | 500 orders / job | 超出后自动拆分为多个 print jobs |

批量任务超出时不需要阻止用户继续使用，只要提供“拆分任务”按钮即可。这个限制主要用于控制 PDF 生成稳定性。

### 6.7 Business 的超额策略

Business 不建议做硬封顶。更适合使用 fair use：

- 超过 10,000 printed orders / month 后继续允许打印。
- Dashboard 显示高用量提示。
- 邮件提醒用户联系支持或升级 custom plan。
- 如果连续 2 个账期超过 15,000 printed orders / month，再要求升级高量套餐。
- 如果出现异常频率、自动化滥用或影响系统稳定，再做临时限速。

Business 用户通常是高价值客户，突然阻断打印会造成真实履约风险，不适合用免费层那种硬限制。

### 6.8 支付失败和账期重置

支付失败不等同于用量超额，但限制逻辑可以共用。

- 支付失败后给 3 天宽限期。
- 宽限期内保留当前套餐能力，并提示更新付款方式。
- 3 天后降为 Free-like 输出限制：可查看、同步、编辑、预览、重印已计入订单，但不能打印新订单。
- 账期重置时 printed order 额度归零。
- 升级套餐后立即生效，不要求等到下个账期。
- 降级套餐在当前已付账期结束后生效，避免用户刚付款就失去能力。

## 7. 后续加购项

这些能力不建议首发就做，但可以作为后续收入层。

| Add-on | 建议价格 | 开放时机 |
|---|---:|---|
| Extra store | $3 / store / month | Pro/Business 店铺数不够时 |
| Custom template setup | $99-$299 one-time | 有稳定人工服务流程后 |
| Industry template pack | $19-$49 one-time | P2 模板包上线后 |
| AI Template Designer credits | $10 / 50 credits | P3 AI 模板生成上线后 |
| Agency workspace | Custom | 多客户白标工作区上线后 |

## 8. 首发上架文案建议

推荐主文案：

```text
Custom invoice templates and print-ready order documents for Wix Stores.
```

Free：

```text
Start free with 50 printed orders per month, basic invoice templates, order sync, PDF preview, and browser printing.
```

Starter：

```text
For small stores that need branded invoices, packing slips, custom fields, and everyday batch printing.
```

Pro：

```text
For growing stores that need more templates, bulk PDF workflows, production documents, print history, and multi-store operations.
```

避免使用：

- `tax compliant invoice`。
- `legal invoice`。
- `certified e-invoicing`。
- `shipping label purchase`。
- `direct printer integration`。

这些都不在当前 P0/P1 范围内，容易引发用户误解和支持风险。

## 9. 竞品价格锚点

调研时间：2026-06-12。

| 产品 | 平台 | 价格锚点 | 对 PrintOps 的启发 |
|---|---|---|---|
| Invoice Webplanex | Wix | Free 200 orders/month；Standard $4/month unlimited orders | Wix 生态存在低价锚点，PrintOps 不能只靠基础发票/PDF 收高价 |
| Webplanex Invoices & Labels | Shopify | Free 200 orders/month；Advanced $5/month；$49/year | 低价竞品会把自动 PDF、模板、邮件、装箱单打包 |
| Order Printer Pro | Shopify | Free to 50 orders；$10 / $20 / $40 by monthly order volume | 成熟工具可按订单量分层，$10-$40 是可接受区间 |
| Vify Order Printer | Shopify | Free；$10.99 / $29.99 / $69.99 | 更高阶功能放在模板、自动邮件、产品字段和支持上 |
| AG Order Printer | Shopify | Free；$15 / $39 / $49 | B2B、POS、多语言、多币种可支撑更高价格 |
| Sufio | Shopify | $7 / $19 / $49 / $129；Plus from $499 | 合规发票是另一条高价值但高复杂度路线，PrintOps 当前不应承诺 |

参考来源：

- Wix App Market: Invoice Webplanex, https://www.wix.com/app-market/invoice-webplanex
- Shopify App Store: Webplanex Invoices & Labels, https://apps.shopify.com/invoice-sales-tax-usa
- Shopify App Store: Order Printer Pro, https://apps.shopify.com/order-printer-pro
- Shopify App Store: Vify Order Printer PDF Invoice, https://apps.shopify.com/vify-order-printer
- Shopify App Store: AG Order Printer PDF Invoice, https://apps.shopify.com/avada-pdf-invoice
- Sufio Pricing, https://sufio.com/pricing

## 10. 推荐执行节奏

### Phase 1：首发验证

- 上架 Free、Starter、Pro。
- Starter 可用 launch price：$5/month 或 $49/year，持续 60 天。
- Pro 保持 $15/month，不打太低，避免后续涨价困难。
- 免费层保留水印和订单量限制，但允许用户完整体验一次订单打印闭环。

### Phase 2：有 20-30 个真实付费用户后

- 观察 Free -> Starter 转化、Starter -> Pro 转化、退款原因和支持工单。
- 如果大量用户只因水印升级，Starter 价格可以维持。
- 如果大量用户因订单量升级，Pro 可以提高到 $19/month。
- 如果用户频繁要求产品字段、共享模板、模板规则，再公开 Business。

### Phase 3：P1/P2 功能成熟后

- Starter 调整到 $9/month。
- Pro 调整到 $19/month。
- Business 上架 $29/month 或 $39/month。
- 人工模板设置、模板包和 AI Template Designer 作为独立收入层。

## 11. 当前建议

如果只做一个最简决策，建议：

```text
Free: $0, 50 printed orders/month
Starter: $7/month or $70/year, 500 printed orders/month
Pro: $15/month or $150/year, 3,000 printed orders/month
Business: $29/month or $290/year, 10,000 printed orders/month
```

这套价格的好处是：

- 对 Wix 小商家足够低门槛。
- 不和 $4/month 的低价竞品硬拼无限功能。
- 又不会低到无法承担 PDF、模板维护、客服和未来 AI/字段能力成本。
- Business 用 10,000 单作为高量入口，足够大方，但不会把 100,000 单高价值客户卖得太便宜。

## 12. Wix Pricing Copy

Use this section when maintaining the Wix pricing page. Feature titles are kept under 40 characters. Plan comparison values are kept short enough for Wix custom text fields.

### 12.1 Plan descriptions

| Plan | English description |
|---|---|
| Free | Try branded order printing with 50 printed orders per month, basic invoice templates, PDF preview, and browser printing. |
| Starter | For small stores that need 500 printed orders per month, branded invoices, packing slips, custom fields, and everyday batch printing. |
| Pro | For growing stores that need 3,000 printed orders per month, more stores, all document templates, print history, and larger bulk jobs. |
| Business | For high-volume stores that need 10,000 printed orders per month, multi-store workflows, shared templates, and priority support. |

### 12.2 Plan short bullets

Use these as short plan highlights.

| Plan | Bullet 1 | Bullet 2 | Bullet 3 |
|---|---|---|---|
| Free | 50 printed orders/month | 1 store, 1 template | PDF preview and browser print |
| Starter | 500 printed orders/month | Branded invoices and slips | Custom fields and batch print |
| Pro | 3,000 printed orders/month | 3 stores, unlimited templates | Print history and larger jobs |
| Business | 10,000 printed orders/month | 10 stores and shared templates | Priority support for teams |

### 12.3 Feature comparisons

#### Feature 1

Title:

```text
Printed orders
```

Description:

```text
Unique orders you can print or export each month. Reprints of counted orders do not use extra quota.
```

Comparison values:

| Free | Starter | Pro | Business |
|---|---|---|---|
| 50 / month | 500 / month | 3,000 / month | 10,000 / month |

#### Feature 2

Title:

```text
Active stores
```

Description:

```text
Wix Stores that can sync orders and create new print jobs. Extra stores stay inactive until upgraded.
```

Comparison values:

| Free | Starter | Pro | Business |
|---|---|---|---|
| 1 store | 1 store | 3 stores | 10 stores |

#### Feature 3

Title:

```text
Store templates
```

Description:

```text
Editable templates saved for your store. Built-in templates remain available for preview and copying.
```

Comparison values:

| Free | Starter | Pro | Business |
|---|---|---|---|
| 1 template | 5 templates | Unlimited | Shared templates |

#### Feature 4

Title:

```text
Bulk print jobs
```

Description:

```text
Maximum orders you can include in one PDF download or browser print job.
```

Comparison values:

| Free | Starter | Pro | Business |
|---|---|---|---|
| 10 / job | 50 / job | 250 / job | 500 / job |
