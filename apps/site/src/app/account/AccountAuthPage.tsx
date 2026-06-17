"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Building2, KeyRound, Loader2, Mail } from "lucide-react";

import type { ZiderUser } from "@/lib/account/users";
import { sendAccountCodeAction, signOutAction, verifyAccountCodeAction } from "./actions";

export type AccountMode = "signin" | "register" | "forgot";

type AuthCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryAction: string;
  codeAction: string;
  codeSent: string;
  googleAction: string;
};

const authCopy: Record<AccountMode, AuthCopy> = {
  forgot: {
    codeAction: "Send recovery code",
    codeSent: "Recovery code sent. Enter it below to continue.",
    eyebrow: "Account recovery",
    googleAction: "Continue with Google",
    primaryAction: "Verify and continue",
    subtitle: "Use a one-time code to recover access to your Zider account.",
    title: "Forgot password?",
  },
  register: {
    codeAction: "Send code",
    codeSent: "Verification code sent. Finish the form when it arrives.",
    eyebrow: "Create account",
    googleAction: "Sign up with Google",
    primaryAction: "Create account",
    subtitle: "Start with Google or verify your email with a one-time code.",
    title: "Create your Zider account",
  },
  signin: {
    codeAction: "Send code",
    codeSent: "Verification code sent. Enter it below to sign in.",
    eyebrow: "Welcome back",
    googleAction: "Continue with Google",
    primaryAction: "Sign in",
    subtitle: "Use Google or an email verification code. No password required.",
    title: "Sign in to Zider",
  },
};

function accountHref(path: string, nextPath: string) {
  return nextPath === "/" ? path : `${path}?next=${encodeURIComponent(nextPath)}`;
}

export function AccountAuthPage({
  error,
  initialEmail,
  isConfigured,
  loggedOut,
  mode,
  nextPath,
  sent,
  user,
}: {
  error: string;
  initialEmail: string;
  isConfigured: boolean;
  loggedOut: boolean;
  mode: AccountMode;
  nextPath: string;
  sent: boolean;
  user: ZiderUser | null;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const copy = authCopy[mode];
  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  const googleHref = `/api/account/google/start?mode=${encodeURIComponent(mode)}&next=${encodeURIComponent(nextPath)}`;
  const modeLinks = useMemo(
    () => ({
      forgot: accountHref("/forgot-password", nextPath),
      register: accountHref("/register", nextPath),
      signin: accountHref("/account", nextPath),
    }),
    [nextPath],
  );

  return (
    <main className="authPage">
      <style>{getAccountCss()}</style>

      <aside className="authIntro">
        <a className="authLogo" href="/" aria-label="ZIDER home">
          <ZiderLogo />
        </a>
        <p className="authTagline">Components and solutions for creator websites.</p>
      </aside>

      <section className="authPanel">
        <div className="authCard">

        {user ? (
          <form action={signOutAction} className="authForm">
            <p className="authEyebrow">Account</p>
            <h1 id="auth-title">Signed in as {user.displayName || user.email}</h1>
            <div className="accountSummary">
              <span>{user.email}</span>
              <strong>{user.role}</strong>
            </div>
            <a className="secondaryButton" href="/account/center">Account center</a>
            <button className="primaryButton" type="submit">Sign out</button>
          </form>
        ) : (
          <form action={verifyAccountCodeAction} className="authForm">
            <input name="mode" type="hidden" value={mode} />
            <input name="next" type="hidden" value={nextPath} />

            {!isForgot ? (
              <div className="authMode" aria-label="Account mode">
                <a className={`authModeItem ${mode === "signin" ? "authModeItemActive" : ""}`} href={modeLinks.signin}>Sign in</a>
                <a className={`authModeItem ${isRegister ? "authModeItemActive" : ""}`} href={modeLinks.register}>Register</a>
              </div>
            ) : null}

            <p className="authEyebrow">{copy.eyebrow}</p>
            <h1 id="auth-title">{copy.title}</h1>
            <p className="authSubtitle">{copy.subtitle}</p>

            {error === "config" ? <p className="authNotice">Account service configuration is missing.</p> : null}
            {error === "invalid" ? <p className="authNotice">The account credentials are incorrect.</p> : null}
            {error === "invalid_code" ? <p className="authNotice">The verification code is invalid or expired.</p> : null}
            {error === "name_required" ? <p className="authNotice">Enter your name to create an account.</p> : null}
            {error === "code_send_failed" ? <p className="authNotice">Verification email could not be sent. Check email delivery configuration.</p> : null}
            {error === "google_config" ? <p className="authNotice">Google sign-in is not configured yet.</p> : null}
            {error === "google_failed" ? <p className="authNotice">Google sign-in failed. Try again or use an email code.</p> : null}
            {error === "google_email_unverified" ? <p className="authNotice">Google did not confirm this email address.</p> : null}
            {error === "forbidden" ? <p className="authNotice">This account does not have workspace access.</p> : null}
            {loggedOut ? <p className="authNotice authNoticeSuccess">Signed out successfully.</p> : null}
            {sent ? <p className="authNotice authNoticeSuccess">{copy.codeSent}</p> : null}

            <a className="googleButton" href={googleHref}>
              <GoogleLogo />
              {copy.googleAction}
            </a>

            <div className="divider"><span>or use email code</span></div>

            <div className="fieldStack">
              {isRegister ? (
                <label className="authField">
                  <span>用户名</span>
                  <div>
                    <Building2 size={18} />
                    <input autoComplete="name" name="name" onChange={(event) => setFullName(event.target.value)} placeholder="输入你的用户名" required type="text" value={fullName} />
                  </div>
                </label>
              ) : null}

              <label className="authField">
                <span>Email</span>
                <div>
                  <Mail size={18} />
                  <input autoComplete="email" name="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required type="email" value={email} />
                </div>
              </label>

              <label className="authField">
                <span>Verification code</span>
                <div className="codeField">
                  <KeyRound size={18} />
                  <input autoComplete="one-time-code" inputMode="numeric" name="code" onChange={(event) => setCode(event.target.value)} placeholder="6-digit code" required type="text" value={code} />
                  <SendCodeButton codeAction={copy.codeAction} disabled={!isConfigured || !email.trim()} />
                </div>
              </label>
            </div>

            <SubmitButton disabled={!isConfigured} label={copy.primaryAction} />

            <div className="authLinks">
              {mode === "signin" ? (
                <>
                  <a href={modeLinks.forgot}>Forgot password?</a>
                  <a href={modeLinks.register}>Create account</a>
                </>
              ) : null}
              {mode === "register" ? (
                <>
                  <span>Already have an account?</span>
                  <a href={modeLinks.signin}>Sign in</a>
                </>
              ) : null}
              {isForgot ? (
                <>
                  <span>Remembered it?</span>
                  <a href={modeLinks.signin}>Back to sign in</a>
                </>
              ) : null}
            </div>
          </form>
        )}
        </div>
      </section>
    </main>
  );
}

function SendCodeButton({ codeAction, disabled }: { codeAction: string; disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="codeButton"
      disabled={disabled || pending}
      formAction={sendAccountCodeAction}
      formNoValidate
      type="submit"
    >
      {pending ? <Loader2 size={14} className="spin" /> : null}
      {pending ? "Sending…" : codeAction}
    </button>
  );
}

function SubmitButton({ disabled, label }: { disabled: boolean; label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="primaryButton" disabled={disabled || pending} type="submit">
      {pending ? <Loader2 size={17} className="spin" /> : <ArrowRight size={17} />}
      {pending ? "Verifying…" : label}
    </button>
  );
}

function ZiderLogo() {
  return (
    <svg aria-hidden="true" className="ziderLogo" xmlns="http://www.w3.org/2000/svg" width="163.1" height="43.5" viewBox="0 0 163.1 43.5">
      <path
        d="M155,2.1,133.8,35.5h21.1v7.8H119.8l21-33.4H128.2a6.31,6.31,0,0,1-3.7-1.2,3.62,3.62,0,0,1-1.8-2.8h0V0h7.4V.8a2,2,0,0,0,.2,1.1,1.94,1.94,0,0,0,.7.2Zm5.3,0h8.1V43.3h-8.1Zm16,41.3V2.2h12.3c5.3,0,9.6,1,13,3.1a18,18,0,0,1,7.3,7.9,23.23,23.23,0,0,1,2.3,10.4h0a19.5,19.5,0,0,1-2.8,10.5,18.72,18.72,0,0,1-7.5,7,22.1,22.1,0,0,1-10.4,2.4l-14.2-.1Zm8.1-7.9h4.8c4.2,0,7.6-1.1,10-3.2s3.7-5.3,3.7-9.4h0a13.85,13.85,0,0,0-2.1-7.9,10.42,10.42,0,0,0-4.8-4,13,13,0,0,0-5.1-1.1h-6.6ZM216.7,2.1h28.1V10h-20v8.8h17.7v7.8H224.8v8.9h20.8v7.8H216.7Zm66.2,41.3h-9.5l-8.7-13.1h-5.4V43.4h-8.1V2.2h12.5c5.1,0,9.1,1.2,11.9,3.7s4.2,5.9,4.2,10.2h0a16.46,16.46,0,0,1-1.6,7.2,12.29,12.29,0,0,1-4.9,5.2h0ZM259.3,10V22.4h5.8a5.8,5.8,0,0,0,4.8-1.9,6.51,6.51,0,0,0,1.5-4.2h0a7.73,7.73,0,0,0-1.3-4.2c-.9-1.4-2.5-2-5-2Z"
        fill="#ffffff"
        transform="translate(-119.8 0)"
      />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg aria-hidden="true" className="googleLogo" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function getAccountCss() {
  return `
    .authPage,
    .authPage * {
      box-sizing: border-box;
    }

    .authPage {
      --auth-ink: #0a2540;
      --auth-muted: #63758a;
      --auth-line: #d9e4ec;
      --auth-green: #087a46;
      --auth-green-dark: #065f38;
      min-height: 100vh;
      display: grid;
      grid-template-columns: minmax(0, 0.95fr) minmax(380px, 1.05fr);
      background: #ffffff;
      color: var(--auth-ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    /* ---- Left intro ---- */
    .authIntro {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding: 48px clamp(32px, 8vw, 96px);
      background: #087a46;
      overflow: hidden;
    }

    .authIntro::before {
      content: "";
      position: absolute;
      inset: 0;
      opacity: 0.1;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E");
      pointer-events: none;
    }

    .authLogo {
      position: relative;
      display: block;
      text-decoration: none;
      margin-bottom: 28px;
    }

    .ziderLogo {
      display: block;
      width: 130px;
      height: auto;
    }

    .authTagline {
      position: relative;
      max-width: 340px;
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      line-height: 1.22;
      font-weight: 650;
      letter-spacing: -0.01em;
    }

    /* ---- Right panel ---- */
    .authPanel {
      display: grid;
      align-content: center;
      padding: 42px clamp(20px, 5vw, 64px);
      background: #ffffff;
    }

    .authCard {
      width: min(100%, 420px);
      justify-self: center;
    }

    .authForm {
      margin: 0;
    }

    .authMode {
      width: 100%;
      min-height: 44px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px;
      margin-bottom: 24px;
      padding: 4px;
      border: 1px solid var(--auth-line);
      border-radius: 8px;
      background: #f5f7fa;
    }

    .authModeItem {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      color: var(--auth-muted);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
    }

    .authModeItem:hover {
      color: var(--auth-ink);
    }

    .authModeItemActive {
      background: #ffffff;
      color: var(--auth-green);
      font-weight: 700;
      box-shadow: 0 1px 4px rgba(10, 37, 64, 0.06);
    }

    .authEyebrow {
      margin: 0 0 8px;
      color: var(--auth-green);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .authForm h1 {
      margin: 0;
      color: var(--auth-ink);
      font-size: 26px;
      line-height: 1.15;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .authSubtitle {
      margin: 8px 0 20px;
      color: var(--auth-muted);
      font-size: 14px;
      line-height: 1.5;
      font-weight: 400;
    }

    .authNotice {
      margin: 0 0 14px;
      padding: 10px 12px;
      border: 1px solid #f2b8b5;
      border-radius: 8px;
      background: #fff5f4;
      color: #8c1d18;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.4;
    }

    .authNoticeSuccess {
      border-color: #bddfcd;
      background: #f0faf4;
      color: #06723f;
    }

    .googleButton,
    .secondaryButton,
    .primaryButton,
    .codeField button {
      appearance: none;
      border: 0;
      font: inherit;
      cursor: pointer;
    }

    .googleButton {
      width: 100%;
      min-height: 46px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      border: 1px solid var(--auth-line);
      border-radius: 8px;
      background: #ffffff;
      color: #0a2540;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .googleButton:hover {
      border-color: #b0bec5;
      box-shadow: 0 2px 8px rgba(10, 37, 64, 0.06);
    }

    .secondaryButton {
      width: 100%;
      min-height: 46px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-top: 16px;
      border: 1px solid var(--auth-line);
      border-radius: 8px;
      background: #ffffff;
      color: var(--auth-ink);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .secondaryButton:hover {
      border-color: #b0bec5;
      box-shadow: 0 2px 8px rgba(10, 37, 64, 0.06);
    }

    .googleLogo {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
    }

    .divider {
      position: relative;
      display: flex;
      justify-content: center;
      margin: 18px 0;
      color: #8f9ca8;
      font-size: 12px;
      font-weight: 500;
    }

    .divider::before {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--auth-line);
      content: "";
    }

    .divider span {
      position: relative;
      padding: 0 12px;
      background: #ffffff;
    }

    .fieldStack {
      display: grid;
      gap: 14px;
    }

    .authField {
      display: grid;
      gap: 6px;
    }

    .authField > span {
      color: #4f5e68;
      font-size: 13px;
      font-weight: 600;
    }

    .authField > div {
      min-height: 48px;
      display: grid;
      grid-template-columns: 20px minmax(0, 1fr);
      align-items: center;
      gap: 10px;
      padding: 0 14px;
      border: 1px solid var(--auth-line);
      border-radius: 8px;
      background: #ffffff;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .authField > div:focus-within {
      border-color: var(--auth-green);
      box-shadow: 0 0 0 3px rgba(8, 122, 70, 0.1);
    }

    .authField svg {
      color: #8f9ca8;
      flex-shrink: 0;
    }

    .authField input {
      min-width: 0;
      width: 100%;
      height: 46px;
      border: 0;
      outline: 0;
      background: transparent;
      color: var(--auth-ink);
      font-size: 15px;
      font-weight: 400;
    }

    .authField input::placeholder {
      color: #a0aeb8;
    }

    .authField .codeField {
      grid-template-columns: 20px minmax(0, 1fr) auto;
      padding-right: 6px;
    }

    .codeField button {
      min-height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      border-radius: 6px;
      padding: 0 12px;
      background: #e8f5ee;
      color: var(--auth-green);
      font-size: 12px;
      font-weight: 600;
      transition: background 0.15s ease;
    }

    .codeField button:hover {
      background: #d4ece0;
    }

    .primaryButton {
      width: 100%;
      min-height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 16px;
      border-radius: 8px;
      background: var(--auth-green);
      color: #ffffff;
      font-size: 15px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(8, 122, 70, 0.18);
      transition: background 0.15s ease, box-shadow 0.15s ease;
    }

    .primaryButton:hover {
      background: var(--auth-green-dark);
      box-shadow: 0 4px 14px rgba(8, 122, 70, 0.24);
    }

    .primaryButton:disabled,
    .codeField button:disabled {
      cursor: not-allowed;
      opacity: 0.55;
      box-shadow: none;
    }

    .authLinks {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 16px;
      color: var(--auth-muted);
      font-size: 13px;
      font-weight: 500;
    }

    .authLinks a {
      color: var(--auth-green);
      font-weight: 600;
      text-decoration: none;
    }

    .authLinks a:hover {
      text-decoration: underline;
    }

    .accountSummary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin: 18px 0 4px;
      padding: 12px 14px;
      border: 1px solid var(--auth-line);
      border-radius: 8px;
      background: #f8fafb;
      color: var(--auth-muted);
      font-size: 14px;
      font-weight: 500;
    }

    .accountSummary strong {
      color: var(--auth-green);
      text-transform: capitalize;
    }

    @media (max-width: 780px) {
      .authPage {
        grid-template-columns: 1fr;
      }

      .authIntro {
        min-height: auto;
        align-items: center;
        text-align: center;
        padding: 36px 24px;
      }

      .authTagline {
        font-size: 20px;
        max-width: 280px;
      }

      .authPanel {
        padding: 24px 20px 40px;
      }
    }

    @media (max-width: 480px) {
      .authField .codeField {
        grid-template-columns: 20px minmax(0, 1fr);
        padding-right: 14px;
      }

      .codeField button {
        grid-column: 1 / -1;
        margin-bottom: 6px;
      }
    }

    .spin {
      animation: ziderSpin 0.8s linear infinite;
    }

    @keyframes ziderSpin {
      to { transform: rotate(360deg); }
    }

    .codeButton {
      min-height: 36px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      border-radius: 6px;
      padding: 0 12px;
      border: 0;
      background: #e8f5ee;
      color: var(--auth-green);
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease, opacity 0.15s ease;
    }

    .codeButton:hover:not(:disabled) {
      background: #d4ece0;
    }

    .codeButton:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .primaryButton:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  `;
}
