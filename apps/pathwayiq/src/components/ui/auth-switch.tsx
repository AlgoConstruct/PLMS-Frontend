"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Lightbulb, Network, ShieldCheck, Sparkles, Users } from "lucide-react";
import { cn } from "@pathwayiq/ui/lib/utils";
import styles from "./auth-switch.module.css";

export interface AuthSwitchProps {
  signIn: ReactNode;
  signUp: ReactNode;
  demoAccounts?: ReactNode;
  initialMode?: "signin" | "signup";
}

/** Sliding-panel authentication layout adapted from the supplied auth-switch. */
export default function AuthSwitch({ signIn, signUp, demoAccounts, initialMode = "signin" }: AuthSwitchProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const signInRef = useRef<HTMLDivElement>(null);
  const signUpRef = useRef<HTMLDivElement>(null);

  function switchMode(signUp: boolean) {
    setIsSignUp(signUp);
    // Wait for React to remove inert before moving keyboard focus into the active pane.
    requestAnimationFrame(() => {
      (signUp ? signUpRef : signInRef).current?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
    });
  }

  return <main className={styles.page}>
    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="Pathway IQ home">
        <span className={styles.brandMark}><Network size={23} strokeWidth={2.2} aria-hidden="true" /></span>
        <span>pathway<span className={styles.brandIq}>iq</span><span className={styles.brandDot}>.</span></span>
      </Link>
      <Link href="/" className={styles.back}><ArrowLeft size={14} aria-hidden="true" /> Back to home</Link>
    </header>

    <div className={styles.stage}>
      <div className={cn(styles.card, isSignUp && styles.signUpMode)}>
        <div className={styles.wash} aria-hidden="true" />
        <div className={styles.forms}>
          <div ref={signInRef} className={cn(styles.formPane, !isSignUp && styles.active)} aria-hidden={isSignUp} inert={isSignUp}>
            {signIn}
          </div>
          <div ref={signUpRef} className={cn(styles.formPane, isSignUp && styles.active)} aria-hidden={!isSignUp} inert={!isSignUp}>
            {signUp}
          </div>
        </div>

        <aside className={cn(styles.panel, styles.leftPanel)} aria-hidden={isSignUp} inert={isSignUp}>
          <div className={styles.panelIcon} aria-hidden="true"><Sparkles size={27} /></div>
          <p className={styles.panelEyebrow}>A WORLD OF POSSIBILITY</p>
          <h2>New here?<br /><span>Your journey starts here.</span></h2>
          <p>Learn with purpose, connect with your community, and see where curiosity takes you.</p>
          <button type="button" className={styles.switchButton} onClick={() => switchMode(true)}>Sign up <ArrowRight size={15} aria-hidden="true" /></button>
          <div className={styles.panelTags} aria-hidden="true"><span><BookOpen size={14} /> Learn</span><span><Lightbulb size={14} /> Create</span><span><Users size={14} /> Connect</span></div>
        </aside>
        <aside className={cn(styles.panel, styles.rightPanel)} aria-hidden={!isSignUp} inert={!isSignUp}>
          <div className={styles.panelIcon} aria-hidden="true"><BookOpen size={27} /></div>
          <p className={styles.panelEyebrow}>YOUR IDEAS BELONG HERE</p>
          <h2>Welcome back.<br /><span>Keep your curiosity going.</span></h2>
          <p>Your community, your learning, and your next big idea. Pick up where you left off.</p>
          <button type="button" className={styles.switchButton} onClick={() => switchMode(false)}>Sign in <ArrowRight size={15} aria-hidden="true" /></button>
          <div className={styles.panelTags} aria-hidden="true"><span><BookOpen size={14} /> Learn</span><span><Lightbulb size={14} /> Create</span><span><Users size={14} /> Connect</span></div>
        </aside>
      </div>
      <p className={styles.tagline}><ShieldCheck size={14} aria-hidden="true" /> Your learning. Your community. One connected space.</p>
      {demoAccounts && <div className={styles.demoArea} hidden={isSignUp}>{demoAccounts}</div>}
    </div>
    <footer className={styles.footer}><span>© {new Date().getFullYear()} Pathway IQ</span><span>Built for learning. Designed for what’s next.</span></footer>
  </main>;
}
