# Zider 账号邮件模板规划

版本：v0.1  
更新日期：2026-06-18  
适用范围：Zider 官网注册/登录、用户中心、后续 Workspace 账号认领

## 1. 目标

优化 Zider 账号体系里的验证码邮件体验，让用户通过 Google 或邮箱验证码登录时，收到的邮件与官网视觉一致，并且可直接配置到 Supabase Auth。

## 2. 当前登录策略

第一版账号登录采用：

- Google 登录。
- 邮箱一次性验证码登录。
- 不使用传统密码。

当前代码中 `signInWithOtp` 会触发 Supabase 的 `Magic Link` 邮件模板。因此第一优先级是优化 `Magic Link / OTP` 模板。

注册第一版暂时通过服务端创建账号后，引导用户回到登录页使用验证码登录。后续如改为邮箱确认注册，可启用 `Confirm signup` 模板。

## 3. 模板清单

| 场景 | Supabase 模板 | 项目文件 | 状态 |
| --- | --- | --- | --- |
| 登录验证码 | Magic Link | `apps/site/email-templates/supabase-magic-link-otp.html` | P0 |
| 邮箱确认注册 | Confirm signup | `apps/site/email-templates/supabase-confirm-signup.html` | P1 |
| 账号恢复 | Reset password | `apps/site/email-templates/supabase-recovery.html` | P1 |

## 4. 视觉要求

- 使用 ZIDER 品牌绿色 `#087a46`。
- 邮件背景使用浅绿色灰 `#f4f8f5`。
- 主体卡片保持简洁，不使用复杂图像。
- Logo 采用邮件安全的文字标识，不依赖 SVG 渲染。
- 验证码必须是邮件首屏最突出元素。
- CTA 链接保留为辅助入口，主要引导用户复制验证码。

## 5. 邮件文案

登录验证码主题：

```text
{{ .Token }} is your ZIDER sign-in code
```

核心文案：

```text
Sign in to ZIDER
Use this one-time code to finish signing in. It expires shortly and can only be used once.
```

## 6. 配置入口

Supabase Dashboard:

```text
Authentication > Emails > Templates
```

第一版需要配置：

```text
Magic Link
```

后续再配置：

```text
Confirm signup
Reset password
```

## 7. 注意事项

- 邮件模板使用 Supabase Go Template 变量：`{{ .Token }}`、`{{ .ConfirmationURL }}`、`{{ .Email }}`、`{{ .SiteURL }}`。
- 为避免邮件客户端预加载链接导致链接失效，登录邮件优先展示 OTP 验证码。
- 如果接入外部邮件服务，关闭邮件链接追踪，避免改写 Supabase 链接。
- 线上配置前确认 Site URL 和 Redirect URL 都指向 `https://www.zider.ink`。
