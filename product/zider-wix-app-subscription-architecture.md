# ZIDER Wix App Subscription Architecture

版本：v0.1
更新日期：2026-06-22
适用范围：ZIDER 通过 Wix App Market 发布的应用，包括 PrintOps 以及后续其它 Wix 应用

## 1. 结论

Wix 应用的订阅和升级应以 Wix 为支付和套餐变更入口。ZIDER 不直接收款，也不在应用内做独立信用卡订阅管理。

ZIDER 需要做的是：

- 保存每个 Wix app installation 的当前套餐快照。
- 保存 Wix 订阅事件日志，方便追踪和排错。
- 把 Wix package / plan 映射为 ZIDER 内部 plan。
- 按应用自己的业务口径计算当月用量和剩余额度。
- 给所有应用提供统一的计划展示、升级按钮和额度提醒组件。

这样后续其它 Wix 应用只需要定义自己的套餐配置和用量计算器，不需要重新做一套订阅系统。

## 2. 设计原则

- Wix 是 billing provider，ZIDER 是 subscription mirror。
- `app_installations` 记录安装实例和当前套餐状态。
- `app_billing_events` 记录不可变的 Wix billing 事件。
- 应用 UI 不出现独立付款管理页，只展示当前计划、用量和 Wix 升级入口。
- 套餐权益由 ZIDER 内部配置控制，不直接散落在页面组件里。
- 用量口径由应用定义。PrintOps 当前按当月订单数量计算，不考虑是否打印。
- 未来多应用、多店铺、多 workspace 时，订阅仍然优先绑定到 app installation，再映射到 workspace。

## 3. 核心对象

### 3.1 App Installation

`app_installations` 是订阅状态的主快照表。

它代表一个用户把某个 ZIDER app 安装到某个平台实例上。

关键字段：

| 字段 | 用途 |
|---|---|
| app_key | ZIDER 应用标识，例如 `zider_printops` |
| platform | 平台，例如 `wix` |
| instance_id | Wix app instance ID |
| billing_provider | 当前计费来源，Wix 应用固定为 `wix` |
| is_free | Wix 返回的免费状态 |
| current_plan_id | ZIDER 内部 plan id 或 Wix package id 映射结果 |
| current_plan_name | 展示名称 |
| member_id | 绑定后的 ZIDER member |
| workspace_id | 绑定后的 workspace |
| platform_store_profile_id | 当前安装对应的店铺资料 |

短期可以继续使用现有字段。后续建议补充：

| 字段 | 用途 |
|---|---|
| current_vendor_product_id | Wix package id / vendor product id |
| current_billing_cycle | `monthly` / `yearly` |
| subscription_status | `free` / `active` / `canceled` / `past_due` |
| plan_changed_at | 最近一次套餐变更时间 |

### 3.2 Billing Event

`app_billing_events` 是事件日志，不作为实时 UI 的唯一来源。

用途：

- 记录 Wix plan purchase / change / cancel 等事件。
- 绑定 `installation_id` 和 `instance_id`。
- 保存 Wix 原始 product/package id、cycle、coupon、invoice 等信息。
- 事件处理失败时可以重放或排查。

### 3.3 App Subscription Plan

每个应用定义自己的 plan 配置。

第一阶段可以使用代码配置，后续再迁移到数据库表。

推荐结构：

```ts
type AppSubscriptionPlan = {
  appKey: string;
  id: "free" | "starter" | "pro" | "business";
  name: string;
  provider: "wix";
  wixPackageIds: string[];
  limits: Record<string, number>;
  features: Record<string, boolean>;
  upgradeTarget?: string;
};
```

PrintOps 示例：

```ts
const printOpsPlans = [
  {
    appKey: "zider_printops",
    id: "free",
    name: "Free",
    provider: "wix",
    wixPackageIds: ["free"],
    limits: {
      monthlyOrders: 50,
      stores: 1,
      batchPrint: 10,
    },
    features: {
      watermark: true,
      customTemplates: false,
    },
  },
  {
    appKey: "zider_printops",
    id: "starter",
    name: "Starter",
    provider: "wix",
    wixPackageIds: ["wix-starter-package-id"],
    limits: {
      monthlyOrders: 500,
      stores: 1,
      batchPrint: 50,
    },
    features: {
      watermark: false,
      customTemplates: true,
    },
  },
];
```

其它应用只替换 `limits` 和 `features`，订阅读取、升级入口和 UI 可以共用。

## 4. 通用流程

### 4.1 安装

1. 用户从 Wix 安装 ZIDER app。
2. Wix 跳转到应用后台，带 signed instance。
3. ZIDER 验证 instance。
4. 创建或更新 `app_installations`。
5. 从 Wix instance / site profile 读取：
   - instance id
   - site id
   - owner email
   - app version
   - billing package
   - is free
6. 根据 Wix package 映射 ZIDER plan。
7. UI 展示当前计划和升级入口。

### 4.2 升级

1. 用户点击应用右上角 `Upgrade`。
2. 前端调用统一升级 API，例如：

```text
POST /api/platform/billing/upgrade
```

请求体：

```json
{
  "appKey": "zider_printops",
  "platform": "wix",
  "instanceId": "wix-instance-id",
  "targetPlanId": "pro"
}
```

3. 后端校验安装记录和目标套餐。
4. 后端交给 Wix billing adapter 生成升级动作。
5. 前端打开 Wix 提供的升级页面或触发 Wix dashboard 内置升级流程。
6. Wix 完成购买后发送 billing event。
7. ZIDER 验证事件，写入 `app_billing_events`，更新 `app_installations` 当前套餐快照。
8. 前端刷新订阅状态。

### 4.3 套餐变更事件

Wix billing event 到达后：

1. 验证事件签名或事件来源。
2. 根据 instance id 找到 `app_installations`。
3. 写入 `app_billing_events`。
4. 根据 Wix package id 映射内部 plan。
5. 更新 `app_installations`：
   - `billing_provider = 'wix'`
   - `is_free`
   - `current_plan_id`
   - `current_plan_name`
   - `last_event_at`
   - `updated_at`
6. 如果无法映射 plan，不要中断事件处理，先记录为 `unknown` 并给内部告警。

### 4.4 读取当前订阅

统一函数：

```ts
readAppSubscriptionUsage({
  appKey,
  platform,
  instanceId,
});
```

返回：

```ts
type AppSubscriptionUsage = {
  installation: {
    billingProvider: string;
    currentPlanId: string | null;
    currentPlanName: string | null;
    isFree: boolean | null;
  } | null;
  plan: AppSubscriptionPlan;
  usage: {
    periodStart: string;
    periodEnd: string;
    metric: string;
    used: number;
    limit: number;
    remaining: number;
  };
};
```

每个应用提供自己的 usage meter。

PrintOps：

```ts
metric = "monthlyOrders";
used = count(printops_orders where source_created_at in current month);
```

后续其它应用：

- Logo Loop 可以按 active widget 数、展示次数或站点数。
- Copy Button 可以按 active widgets 或 monthly clicks。
- Product Detail Enhancer 可以按 active blocks 或 product count。

## 5. 通用代码模块建议

建议从 PrintOps 专用文件抽象出平台模块：

```text
apps/workspace/src/lib/platform/subscriptions/
  app-subscription-plans.ts
  app-subscription-usage.ts
  app-subscription-types.ts
  providers/
    wix-subscription-provider.ts
  usage-meters/
    printops-usage-meter.ts
```

职责划分：

| 模块 | 职责 |
|---|---|
| app-subscription-types.ts | 定义通用 plan、usage、provider 类型 |
| app-subscription-plans.ts | 根据 appKey 读取应用套餐配置 |
| app-subscription-usage.ts | 读取 installation、resolve plan、调用 usage meter |
| wix-subscription-provider.ts | 处理 Wix package 映射、升级入口、billing event |
| printops-usage-meter.ts | PrintOps 当前月订单数量计算 |

UI 也建议抽象：

```text
apps/workspace/src/components/platform/AppSubscriptionControl.tsx
```

提供：

- 当前计划 badge。
- 剩余额度简短提示。
- Upgrade 按钮。
- 达到 70%、90%、100% 的提示状态。

## 6. PrintOps 当前接入方式

PrintOps 当前 UI 右上角展示：

- 当前计划。
- 当月剩余额度。
- Upgrade 按钮。

短期规则：

- 用量按当月订单数量计算，不考虑是否打印。
- Free 额度 50 orders / month。
- Starter 额度 500 orders / month。
- Pro 额度 3000 orders / month。
- Business 额度 10000 orders / month。

达到额度后，P0 先做提示和升级引导，不立即硬拦截同步。硬限制可以等套餐逻辑稳定后再加。

## 7. 数据库策略

第一阶段不强依赖新表，复用现有：

- `app_installations`
- `app_billing_events`
- 应用自己的业务表，例如 `printops_orders`

第二阶段可以新增：

```sql
create table public.app_subscription_plans (
  id uuid primary key default gen_random_uuid(),
  app_key text not null,
  platform text not null default 'wix',
  plan_id text not null,
  plan_name text not null,
  vendor_product_ids text[] not null default '{}',
  limits jsonb not null default '{}',
  features jsonb not null default '{}',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform, plan_id)
);
```

什么时候需要新表：

- 套餐经常调整。
- 多个应用需要运营后台配置套餐。
- Wix package id 与内部 plan 需要非开发人员维护。

当前 P0 可以先用代码配置，减少表结构和后台复杂度。

## 8. UI 规则

所有 Wix app 后台统一：

- 右上角显示当前计划和升级按钮。
- Settings 不做独立 billing 页面。
- 达到 70% 用量时轻提示。
- 达到 90% 用量时显示明显提醒。
- 达到 100% 时提示升级，具体限制由应用决定。
- Upgrade 跳转 Wix 升级流程，不跳 ZIDER 自建支付页。

文案示例：

```text
Free plan
18 orders left this month
Upgrade
```

达到 90%：

```text
5 orders left this month. Upgrade to keep processing new orders.
```

## 9. 后续实施顺序

### Phase 1：抽象读取层

- 保留 PrintOps 现有 UI。
- 把 `printops/subscription.ts` 抽象为通用 `platform/subscriptions`。
- PrintOps 用量计算变成一个 usage meter。
- UI 继续展示 current plan、remaining、upgrade。

### Phase 2：接入 Wix 升级入口

- 增加统一升级 API。
- `targetPlanId` 映射到 Wix package。
- 前端点击 Upgrade 后进入 Wix 订阅升级流程。
- 处理 Wix billing event 并更新 `app_installations`。

### Phase 3：多应用复用

- 新应用只注册：
  - appKey
  - plan config
  - usage meter
  - upgrade target package id
- 复用同一套右上角订阅控件。
- 复用同一套 billing event 处理和 installation 更新逻辑。

## 10. 当前 PrintOps 接入状态

已接入：

- 通用订阅读取模块：`apps/workspace/src/lib/platform/subscriptions`。
- PrintOps usage meter：当月 `printops_orders` 数量。
- PrintOps API 返回 `subscription.upgrade.href`。
- PrintOps 右上角 Upgrade 按钮使用后端返回的 upgrade action。
- Billing event 接收路由：

```text
POST /api/apps/printops/wix/billing/events
```

Billing event 路由用于 Wix 事件转发服务。请求必须带其中一个密钥：

```text
x-zider-wix-event-forward-secret: <secret>
x-zider-event-secret: <secret>
?secret=<secret>
```

服务端环境变量：

```text
ZIDER_WIX_EVENT_FORWARD_SECRETS=secret1,secret2
```

PrintOps Wix Product ID 默认映射：

| Wix Product ID | ZIDER 内部 plan |
|---|---|
| `basic` | `free` |
| `starter` | `starter` |
| `pro` | `pro` |
| `business` | `business` |

如果 Wix 后台后续改了 Product ID，一个应用只用一个环境变量覆盖：

```text
ZIDER_PRINTOPS_WIX_PLAN_IDS=free=basic,free;starter=starter;pro=pro;business=business
```

也支持 JSON，适合在 Vercel 环境变量里统一管理：

```json
{"free":["basic","free"],"starter":["starter"],"pro":["pro"],"business":["business"]}
```

Upgrade 跳转 URL 不需要手动配置。系统会从 `app_platforms.platform_app_id` 读取 Wix App ID，并结合当前 Wix `instanceId` 自动生成：

```text
https://www.wix.com/apps/upgrade/<WIX_APP_ID>?appInstanceId=<INSTANCE_ID>
```

生产环境应在 `app_platforms` 中维护：

| 字段 | 值 |
|---|---|
| app_key | `zider_printops` |
| platform | `wix` |
| platform_app_id | Wix Developers 里的 App ID |

本地开发可用环境变量兜底：

```text
ZIDER_PRINTOPS_WIX_APP_ID=<Wix App ID>
```

## 11. 当前不做的事

- 不接 Stripe。
- 不做 ZIDER 自建付款页面。
- 不做 workspace 级统一扣费。
- 不做复杂的团队账单管理。
- 不把 billing 作为 Settings 的主菜单功能。

这些都可以等 ZIDER workspace 独立商业化后再做。Wix App Market 阶段先保持简单：Wix 负责订阅，ZIDER 负责套餐权益和用量。
