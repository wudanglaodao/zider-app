# ZIDER Supabase Email Templates

These files are the source templates for Supabase Auth emails used by ZIDER account login.

## Where To Configure

Supabase Dashboard:

```text
Authentication > Emails > Templates
```

Current first version uses `signInWithOtp`, so the important template is:

```text
Magic Link
```

Set the Supabase email OTP length to:

```text
6 digits
```

Set the Magic Link subject to:

```text
{{ .Token }} is your ZIDER sign-in code
```

Paste the content from:

```text
apps/site/email-templates/supabase-magic-link-otp.html
```

## Future Templates

If registration changes from admin-created users to Supabase email confirmation, use:

```text
Confirm signup
apps/site/email-templates/supabase-confirm-signup.html
```

If we add password reset by link, use:

```text
Reset password
apps/site/email-templates/supabase-recovery.html
```

## Template Variables

Supabase Auth email templates use Go template variables. These templates rely on:

```text
{{ .Token }}
{{ .ConfirmationURL }}
{{ .Email }}
{{ .SiteURL }}
```

For the current ZIDER account flow, the email code is the primary path. The link remains as a fallback for users who prefer clicking.

## Design Rules

- Keep CSS inline and email-client safe.
- Do not depend on external fonts, JavaScript, or SVG rendering.
- Keep the OTP highly visible.
- Keep copy short and neutral.
- Use `support@zider.ink` as the default support mailbox.
- Use `https://www.zider.ink` as the default brand URL.
