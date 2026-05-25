"use client";

import { type FormEvent, useMemo, useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

import type { ZiderUser } from "@/lib/account/users";
import { signInAction, signOutAction } from "./actions";

type AccountMode = "signin" | "signup";
type PasswordFieldName = "password" | "confirmPassword";

type AuthField = {
  autoComplete: string;
  label: string;
  name: "name" | "email" | PasswordFieldName;
  placeholder: string;
  type: "text" | "email" | "password";
};

const signInFields: AuthField[] = [
  {
    autoComplete: "email",
    label: "Email",
    name: "email",
    placeholder: "yancytien@gmail.com",
    type: "email",
  },
  {
    autoComplete: "current-password",
    label: "Password",
    name: "password",
    placeholder: "Password",
    type: "password",
  },
];

const signUpFields: AuthField[] = [
  { autoComplete: "name", label: "Name", name: "name", placeholder: "Your name", type: "text" },
  {
    autoComplete: "email",
    label: "Email",
    name: "email",
    placeholder: "you@example.com",
    type: "email",
  },
  {
    autoComplete: "new-password",
    label: "Password",
    name: "password",
    placeholder: "Password",
    type: "password",
  },
  {
    autoComplete: "new-password",
    label: "Confirm password",
    name: "confirmPassword",
    placeholder: "Confirm password",
    type: "password",
  },
];

const hiddenPasswords: Record<PasswordFieldName, boolean> = {
  confirmPassword: false,
  password: false,
};

function isPasswordFieldName(name: AuthField["name"]): name is PasswordFieldName {
  return name === "password" || name === "confirmPassword";
}

export function AccountAuthPage({
  error,
  isConfigured,
  loggedOut,
  mode,
  nextPath,
  user,
}: {
  error: string;
  isConfigured: boolean;
  loggedOut: boolean;
  mode: AccountMode;
  nextPath: string;
  user: ZiderUser | null;
}) {
  const [visiblePasswords, setVisiblePasswords] = useState(hiddenPasswords);
  const [signupNotice, setSignupNotice] = useState("");
  const isSignIn = mode === "signin";
  const authFields = isSignIn ? signInFields : signUpFields;
  const authModeLinks = useMemo(
    () => ({
      signin: `/account?mode=signin&next=${encodeURIComponent(nextPath)}`,
      signup: `/account?mode=signup&next=${encodeURIComponent(nextPath)}`,
    }),
    [nextPath],
  );

  function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignupNotice("Account creation is invite-only for now. Use the seeded admin account to manage CMS.");
  }

  function togglePassword(fieldName: PasswordFieldName) {
    setVisiblePasswords((current) => ({
      ...current,
      [fieldName]: !current[fieldName],
    }));
  }

  return (
    <main className="authPage">
      <style>{getAccountCss()}</style>

      <section className="authArt" aria-label="ZIDER account preview">
        <div className="authCanvas">
          <div className="deviceWindow">
            <span />
            <span />
            <span />
            <div className="avatarTile">
              <div />
              <span />
            </div>
            <div className="messageBubble">
              <i />
              <strong />
            </div>
            <div className="linePill">
              <span />
            </div>
            <div className="starPill">*****</div>
            <div className="paperPlane" />
          </div>
        </div>
      </section>

      <section className="authPanel" aria-labelledby="auth-title">
        {user ? (
          <form action={signOutAction} className="authForm">
            <p className="authKicker">Account</p>
            <h1 id="auth-title">Signed in as {user.displayName || user.email}.</h1>
            <div className="accountSummary">
              <span>{user.email}</span>
              <strong>{user.role}</strong>
            </div>
            <button className="submitButton" type="submit">
              Sign out
            </button>
          </form>
        ) : (
          <form action={isSignIn ? signInAction : undefined} className="authForm" onSubmit={isSignIn ? undefined : handleSignupSubmit}>
            <input name="next" type="hidden" value={nextPath} />
            <div className="authMode" aria-label="Account mode">
              <a className={`authModeItem ${!isSignIn ? "authModeItemActive" : ""}`} href={authModeLinks.signup}>
                Sign up
              </a>
              <a className={`authModeItem ${isSignIn ? "authModeItemActive" : ""}`} href={authModeLinks.signin}>
                Sign in
              </a>
            </div>

            <h1 id="auth-title">{isSignIn ? "Sign in to your ZIDER account." : "Create a ZIDER account."}</h1>

            {!isConfigured ? (
              <p className="authNotice authNoticeWarning">
                Add Supabase env vars, run the account migration, then seed the first admin user.
              </p>
            ) : null}
            {error === "invalid" ? <p className="authNotice">The email or password is incorrect.</p> : null}
            {error === "forbidden" ? <p className="authNotice">This account does not have admin access.</p> : null}
            {loggedOut ? <p className="authNotice authNoticeSuccess">Signed out successfully.</p> : null}
            {signupNotice ? <p className="authNotice authNoticeWarning">{signupNotice}</p> : null}

            <div className="fieldStack">
              {authFields.map((field) => {
                const passwordFieldName = isPasswordFieldName(field.name) ? field.name : null;
                const isVisible = passwordFieldName ? visiblePasswords[passwordFieldName] : false;
                const Icon: LucideIcon = isVisible ? EyeOff : Eye;

                return (
                  <label className="authField" key={field.name}>
                    <span>{field.label}</span>
                    <input
                      autoComplete={field.autoComplete}
                      disabled={!isConfigured}
                      name={field.name}
                      placeholder={field.placeholder}
                      required
                      type={passwordFieldName && isVisible ? "text" : field.type}
                    />
                    {passwordFieldName ? (
                      <button
                        aria-label={`${isVisible ? "Hide" : "Show"} ${field.label.toLowerCase()}`}
                        onClick={() => togglePassword(passwordFieldName)}
                        type="button"
                      >
                        <Icon size={15} />
                      </button>
                    ) : null}
                  </label>
                );
              })}
            </div>

            {!isSignIn ? (
              <label className="consentRow">
                <input name="updates" type="checkbox" />
                <span>Send me product updates, release notes, and learning tips.</span>
              </label>
            ) : null}

            <button className="submitButton" disabled={!isConfigured} type="submit">
              {isSignIn ? "Sign in" : "Request access"}
            </button>

            <p className="authSwitch">
              {isSignIn ? (
                <>
                  Need an account? <a href={authModeLinks.signup}>Request access</a>
                </>
              ) : (
                <>
                  Already have an account? <a href={authModeLinks.signin}>Sign in</a>
                </>
              )}
            </p>
          </form>
        )}

        <p className="authLegal">
          Protected by reCAPTCHA and subject to the Google <a href="/privacy">Privacy Policy</a> and{" "}
          <a href="/privacy">Terms of Service</a>.
        </p>
      </section>
    </main>
  );
}

function getAccountCss() {
  return `
    .authPage,
    .authPage * {
      box-sizing: border-box;
    }

    .authPage {
      --auth-ink: #171a1f;
      --auth-muted: #7a8494;
      --auth-line: #e1e6ed;
      --auth-green: #54d49d;
      min-height: 100vh;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(440px, 1fr);
      background: #ffffff;
      color: var(--auth-ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .authArt {
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #e7f3d4;
      padding: 38px;
    }

    .authCanvas {
      width: min(100%, 830px);
      aspect-ratio: 1.04;
      display: grid;
      place-items: center;
      border: 2px dotted rgba(0, 122, 255, 0.78);
    }

    .deviceWindow {
      position: relative;
      width: 470px;
      height: 330px;
      border-radius: 8px 8px 0 0;
      background: #9fe0ad;
      border-bottom: 7px solid rgba(69, 198, 132, 0.45);
    }

    .deviceWindow > span {
      position: absolute;
      top: 25px;
      width: 12px;
      height: 12px;
      border-radius: 999px;
      background: #e7f3d4;
    }

    .deviceWindow > span:nth-child(1) {
      left: 26px;
    }

    .deviceWindow > span:nth-child(2) {
      left: 50px;
    }

    .deviceWindow > span:nth-child(3) {
      left: 74px;
    }

    .avatarTile {
      position: absolute;
      top: -28px;
      left: 143px;
      width: 96px;
      height: 96px;
      transform: rotate(14deg);
      border-radius: 22px;
      background: #56cf9b;
      display: grid;
      place-items: center;
    }

    .avatarTile div {
      position: absolute;
      top: 28px;
      width: 42px;
      height: 42px;
      border-radius: 999px;
      background: #ffffff;
    }

    .avatarTile span {
      position: absolute;
      bottom: 18px;
      width: 64px;
      height: 28px;
      border-radius: 50% 50% 0 0;
      background: #ffffff;
    }

    .messageBubble {
      position: absolute;
      top: -75px;
      right: -62px;
      width: 178px;
      height: 100px;
      display: grid;
      place-items: center;
      border-radius: 42px;
      background: #ffffff;
    }

    .messageBubble::after {
      position: absolute;
      right: 50px;
      bottom: -31px;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 32px 0 0 56px;
      border-color: transparent transparent transparent #ffffff;
      content: "";
    }

    .messageBubble i {
      width: 112px;
      height: 54px;
      display: block;
      clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
      background: #dcebbd;
    }

    .messageBubble strong {
      position: absolute;
      width: 31px;
      height: 31px;
      border: 10px solid #ffffff;
      border-radius: 999px;
      background: #bcd682;
    }

    .linePill {
      position: absolute;
      left: 168px;
      top: 166px;
      width: 165px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: #e7f3d4;
    }

    .linePill span {
      position: relative;
      width: 62px;
      height: 20px;
      border-bottom: 5px solid var(--auth-green);
      border-radius: 0 0 28px 28px;
    }

    .linePill span::before,
    .linePill span::after {
      position: absolute;
      top: -3px;
      width: 15px;
      height: 21px;
      border: 5px solid var(--auth-green);
      border-top: 0;
      border-radius: 0 0 18px 18px;
      content: "";
    }

    .linePill span::before {
      left: 13px;
      transform: rotate(-28deg);
    }

    .linePill span::after {
      right: 7px;
      transform: rotate(18deg);
    }

    .starPill {
      position: absolute;
      left: 112px;
      bottom: 47px;
      width: 136px;
      height: 29px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: #e7f3d4;
      color: #55d19a;
      font-size: 17px;
      font-weight: 800;
      line-height: 1;
    }

    .paperPlane {
      position: absolute;
      right: -14px;
      bottom: -4px;
      width: 90px;
      height: 84px;
      clip-path: polygon(0 0, 100% 12%, 58% 44%, 49% 100%);
      background: #55cf9b;
    }

    .authPanel {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 126px;
      padding: 56px 42px 34px;
    }

    .authForm {
      width: min(100%, 440px);
    }

    .authKicker {
      margin: 0 0 12px;
      color: #087a46;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-align: center;
      text-transform: uppercase;
    }

    .authMode {
      width: 164px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px;
      margin: 0 auto 24px;
      border: 1px solid var(--auth-line);
      border-radius: 6px;
      padding: 3px;
      background: #f7f9fb;
    }

    .authModeItem {
      min-height: 30px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      color: var(--auth-muted);
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
    }

    .authModeItemActive {
      background: #ffffff;
      color: #101317;
      box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1);
    }

    .authForm h1 {
      margin: 0 0 26px;
      text-align: center;
      color: #111418;
      font-size: 21px;
      line-height: 1.25;
      font-weight: 800;
    }

    .authNotice {
      border: 1px solid #fecaca;
      border-radius: 6px;
      background: #fef2f2;
      color: #991b1b;
      margin: 0 0 14px;
      padding: 10px 12px;
      font-size: 12px;
      font-weight: 700;
      line-height: 1.45;
    }

    .authNoticeSuccess {
      border-color: rgba(8, 122, 70, 0.2);
      background: #eef9f1;
      color: #087a46;
    }

    .authNoticeWarning {
      border-color: #fed7aa;
      background: #fff7ed;
      color: #9a3412;
    }

    .accountSummary {
      display: grid;
      gap: 8px;
      border: 1px solid var(--auth-line);
      border-radius: 8px;
      margin: 0 0 18px;
      padding: 16px;
      text-align: center;
    }

    .accountSummary span {
      color: var(--auth-muted);
      font-size: 13px;
      font-weight: 650;
    }

    .accountSummary strong {
      color: #087a46;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .fieldStack {
      display: grid;
      gap: 13px;
    }

    .authField {
      position: relative;
      display: block;
    }

    .authField span {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
    }

    .authField input {
      width: 100%;
      min-height: 42px;
      border: 1px solid #d9e0e8;
      border-radius: 5px;
      background: #ffffff;
      color: #161a21;
      padding: 0 42px 0 13px;
      font: inherit;
      font-size: 12px;
      font-weight: 650;
      outline: none;
      transition: border-color 160ms ease, box-shadow 160ms ease;
    }

    .authField input:focus {
      border-color: #151a21;
      box-shadow: 0 0 0 3px rgba(17, 20, 24, 0.08);
    }

    .authField input:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .authField button {
      position: absolute;
      top: 50%;
      right: 12px;
      width: 24px;
      height: 24px;
      display: grid;
      place-items: center;
      transform: translateY(-50%);
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: #78818d;
      cursor: pointer;
    }

    .authField button:hover {
      background: #f1f4f7;
      color: #171a1f;
    }

    .consentRow {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin: 22px 0 18px;
      color: var(--auth-muted);
      font-size: 11px;
      line-height: 1.45;
    }

    .consentRow input {
      width: 13px;
      height: 13px;
      flex: 0 0 auto;
      margin: 1px 0 0;
      accent-color: #111418;
    }

    .submitButton {
      width: 100%;
      min-height: 43px;
      border: 0;
      border-radius: 5px;
      background: #050506;
      color: #ffffff;
      font: inherit;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      transition: background 160ms ease, transform 160ms ease;
    }

    .submitButton:hover:not(:disabled) {
      background: #171a1f;
      transform: translateY(-1px);
    }

    .submitButton:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .authSwitch {
      margin: 18px 0 0;
      text-align: center;
      color: var(--auth-muted);
      font-size: 12px;
      line-height: 1.45;
    }

    .authSwitch a,
    .authLegal a {
      color: #101317;
      font-weight: 800;
    }

    .authLegal {
      max-width: 320px;
      margin: 0;
      text-align: center;
      color: #a0a8b3;
      font-size: 10px;
      line-height: 1.45;
    }

    @media (max-width: 980px) {
      .authPage {
        grid-template-columns: 1fr;
      }

      .authArt {
        min-height: auto;
        padding: 22px;
      }

      .authCanvas {
        width: min(100%, 520px);
        aspect-ratio: 1.45;
      }

      .deviceWindow {
        width: 300px;
        height: 210px;
        transform: scale(0.78);
      }

      .authPanel {
        min-height: auto;
        gap: 72px;
        padding: 38px 22px 30px;
      }
    }

    @media (max-width: 540px) {
      .authArt {
        padding: 12px;
      }

      .authCanvas {
        border-width: 1px;
      }

      .deviceWindow {
        transform: scale(0.58);
      }

      .authPanel {
        padding: 34px 18px 28px;
      }

      .authForm h1 {
        font-size: 20px;
      }
    }
  `;
}
