"use client";

import { useActionState, useRef, useState } from "react";
import { ArrowRight, Eye, EyeOff, KeyRound, LoaderCircle, ShieldAlert, UserRound } from "lucide-react";
import { login } from "@pathwayiq/auth/actions";
import { Alert, AlertDescription } from "@pathwayiq/ui/components/alert";
import AuthSwitch from "@/components/ui/auth-switch";
import { SignupForm } from "../signup/signup-form";
import authStyles from "@/components/ui/auth-switch.module.css";
import styles from "./login-form.module.css";

export interface DemoUser {
  username: string;
  role: string;
  scope: string;
}

export function LoginForm({ next, demoUsers, expired = false, initialMode = "signin" }: {
  next: string;
  demoUsers: DemoUser[];
  expired?: boolean;
  initialMode?: "signin" | "signup";
}) {
  const [state, action, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const signInAs = (username: string) => {
    if (!usernameRef.current || !passwordRef.current || pending) return;
    usernameRef.current.value = username;
    passwordRef.current.value = "Password123!";
    passwordRef.current.form?.requestSubmit();
  };

  return <AuthSwitch initialMode={initialMode} signUp={<SignupForm />} signIn={<>
    <span className={authStyles.kicker}>YOUR LEARNING, CONNECTED</span>
    <h1 className={authStyles.title} tabIndex={-1}>Good to see you.</h1>
    <p className={authStyles.subtitle}>Sign in to your Pathway IQ workspace.</p>
    {expired && <p className={styles.expired} role="status">Your session ended. Please sign in again.</p>}
    <form action={action} className={styles.form} aria-label="Sign in">
      <input type="hidden" name="next" value={next} />
      <div className={styles.field}>
        <label htmlFor="username">Username</label>
        <div className={styles.inputWrap}>
          <UserRound size={17} aria-hidden="true" />
          <input ref={usernameRef} id="username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required placeholder="Your username" defaultValue={state?.username} aria-describedby={state?.error ? "login-error" : undefined} />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="password">Password</label>
        <div className={styles.inputWrap}>
          <KeyRound size={17} aria-hidden="true" />
          <input ref={passwordRef} id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required placeholder="Your password" aria-describedby={state?.error ? "login-error" : undefined} />
          <button type="button" className={styles.reveal} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-controls="password" aria-pressed={showPassword}>
            {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {state?.error && <Alert variant="destructive" className={styles.error} id="login-error"><ShieldAlert /><AlertDescription>{state.error}</AlertDescription></Alert>}
      <button type="submit" disabled={pending} className={authStyles.primary}>
        {pending ? <><LoaderCircle size={16} className={styles.spinner} aria-hidden="true" /> Signing in…</> : <>Sign in <ArrowRight size={16} aria-hidden="true" /></>}
      </button>
      <span className={styles.srOnly} role="status">{pending ? "Signing in. Please wait." : ""}</span>
    </form>
    <details className={styles.help}>
      <summary>Need help signing in?</summary>
      <p>For your username, password, or account access, contact your institution’s academic team or platform administrator.</p>
    </details>
    <p className={authStyles.accountNote}>A little curiosity can take you a long way.</p>
  </>} demoAccounts={demoUsers.length > 0 ? <section className={styles.demo} aria-labelledby="demo-title">
    <div className={styles.demoHeading}><h2 id="demo-title">Demo accounts</h2><span>Development access</span></div>
    <ul className={styles.demoList}>
      {demoUsers.map((user) => <li key={user.username}><button type="button" onClick={() => signInAs(user.username)} disabled={pending}>
        <strong>{user.username}</strong><span>{user.scope}</span><small>{user.role}</small>
      </button></li>)}
    </ul>
    <p>Select an account to sign in with its demo credentials.</p>
  </section> : undefined} />;
}
