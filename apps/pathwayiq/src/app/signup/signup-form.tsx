"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Info, KeyRound, Mail, UserRound } from "lucide-react";
import authStyles from "@/components/ui/auth-switch.module.css";
import styles from "../login/login-form.module.css";

/** UI preview only. Public registration is intentionally not connected to IAM. */
export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  return <>
    <span className={authStyles.kicker}>YOUR NEXT CHAPTER</span>
    <h1 className={authStyles.title} tabIndex={-1}>Find your place.</h1>
    <p className={authStyles.subtitle}>Create space for learning, ideas, and connection.</p>
    <div className={styles.previewNote} id="signup-preview"><Info size={15} aria-hidden="true" /><p>Signup preview. Account creation will be available soon.</p></div>
    <form className={styles.form} aria-label="Sign up preview" aria-describedby="signup-preview" onSubmit={(event) => event.preventDefault()}>
      <div className={styles.field}>
        <label htmlFor="signup-username">Username</label>
        <div className={styles.inputWrap}><UserRound size={17} aria-hidden="true" /><input id="signup-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Choose your username" required /></div>
      </div>
      <div className={styles.field}>
        <label htmlFor="signup-email">Email</label>
        <div className={styles.inputWrap}><Mail size={17} aria-hidden="true" /><input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div>
      </div>
      <div className={styles.field}>
        <label htmlFor="signup-password">Password</label>
        <div className={styles.inputWrap}>
          <KeyRound size={17} aria-hidden="true" />
          <input id="signup-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Create a password" required />
          <button type="button" className={styles.reveal} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-controls="signup-password" aria-pressed={showPassword}>
            {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <button type="submit" className={`${authStyles.primary} ${styles.previewSubmit}`} disabled aria-describedby="signup-preview">Create account <ArrowRight size={16} aria-hidden="true" /></button>
    </form>
    <p className={authStyles.accountNote}>Your next discovery starts with a little curiosity.</p>
  </>;
}
