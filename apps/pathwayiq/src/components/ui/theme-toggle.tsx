"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import styles from "./theme-toggle.module.css";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function ThemeToggle() {
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const label = mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Switch color theme";
  return <button type="button" className={styles.toggle} disabled={!mounted} onClick={() => setTheme(isDark ? "light" : "dark")} aria-label={label} title={label}>
    <Moon size={18} className={styles.moon} aria-hidden="true" />
    <Sun size={18} className={styles.sun} aria-hidden="true" />
  </button>;
}
