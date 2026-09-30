"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Menu, X, type LucideIcon } from "lucide-react";
import styles from "./dropdown-navigation.module.css";

type NavigationLink = {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  onSelect?: () => void;
};

export type NavigationItem = { id: string; label: string } & (
  | { subMenus: { title: string; items: NavigationLink[] }[]; href?: never }
  | { href: string; subMenus?: never }
);

/** Branded adaptation of the supplied dropdown navigation, with disclosure semantics. */
export function DropdownNavigation({ navItems }: { navItems: NavigationItem[] }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const instanceId = useId();
  const reducedMotion = useReducedMotion();
  const listId = `${instanceId}-navigation`;
  const panelId = (id: string) => `${instanceId}-${id}-panel`;
  const triggerId = (id: string) => `${instanceId}-${id}-trigger`;

  function close() {
    setOpenMenu(null);
    setHovered(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setOpenMenu(null);
        setHovered(null);
        setMobileOpen(false);
      }
    }
    const breakpoint = window.matchMedia("(max-width: 900px)");
    function reset() {
      setOpenMenu(null);
      setHovered(null);
      setMobileOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    breakpoint.addEventListener("change", reset);
    return () => {
      document.removeEventListener("pointerdown", outside);
      breakpoint.removeEventListener("change", reset);
    };
  }, []);

  function canHover() {
    return window.matchMedia("(min-width: 901px) and (hover: hover)").matches;
  }

  function openWithKeyboard(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    setOpenMenu(id);
    requestAnimationFrame(() => {
      const links = document.getElementById(panelId(id))?.querySelectorAll<HTMLAnchorElement>("a");
      if (links?.length) links[event.key === "ArrowUp" ? links.length - 1 : 0].focus();
    });
  }

  return (
    <nav
      ref={root}
      className={styles.navigation}
      aria-label="Main navigation"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        if (openMenu) {
          document.getElementById(triggerId(openMenu))?.focus();
          setOpenMenu(null);
          setHovered(null);
        } else if (mobileOpen) {
          close();
          toggle.current?.focus();
        }
      }}
    >
      <button
        ref={toggle}
        type="button"
        className={styles.mobileToggle}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        aria-controls={listId}
        onClick={() => { setMobileOpen(!mobileOpen); setOpenMenu(null); }}
      >
        {mobileOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
      </button>
      <LayoutGroup id={instanceId}>
        <ul id={listId} className={`${styles.list} ${mobileOpen ? styles.mobileOpen : ""}`}>
          {navItems.map((item) => {
            const expanded = openMenu === item.id;
            const highlighted = hovered === item.id || expanded;
            return (
              <li
                key={item.id}
                className={styles.item}
                onPointerEnter={(event) => {
                  if (event.pointerType !== "mouse" || !canHover()) return;
                  setHovered(item.id);
                  setOpenMenu(item.subMenus ? item.id : null);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType !== "mouse" || !canHover()) return;
                  setHovered(null);
                  if (!event.currentTarget.contains(document.activeElement)) setOpenMenu(null);
                }}
              >
                {item.subMenus ? (
                  <button
                    id={triggerId(item.id)}
                    className={styles.trigger}
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId(item.id)}
                    onClick={(event) => setOpenMenu(event.detail > 0 && canHover() ? item.id : expanded ? null : item.id)}
                    onKeyDown={(event) => openWithKeyboard(event, item.id)}
                  >
                    <span>{item.label}</span>
                    <ChevronDown size={14} className={styles.chevron} aria-hidden="true" />
                    {highlighted && <motion.span layoutId="nav-highlight" className={styles.highlight} transition={{ duration: reducedMotion ? 0 : 0.18 }} aria-hidden="true" />}
                  </button>
                ) : (
                  <a href={item.href} className={styles.trigger} onClick={close}>
                    <span>{item.label}</span><ArrowUpRight size={13} aria-hidden="true" />
                    {highlighted && <motion.span layoutId="nav-highlight" className={styles.highlight} transition={{ duration: reducedMotion ? 0 : 0.18 }} aria-hidden="true" />}
                  </a>
                )}
                <AnimatePresence initial={false}>
                  {expanded && item.subMenus && (
                    <motion.div
                      id={panelId(item.id)}
                      aria-labelledby={triggerId(item.id)}
                      className={styles.panelPosition}
                      initial={reducedMotion ? false : { opacity: 0, y: 7 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.16 }}
                    >
                      <motion.div className={styles.panel} layout={!reducedMotion}>
                        {item.subMenus.map((group) => (
                          <div key={group.title} className={styles.group}>
                            <h2>{group.title}</h2>
                            <ul>
                              {group.items.map((link) => (
                                <li key={link.label}>
                                  <a href={link.href} className={styles.subLink} onClick={() => { link.onSelect?.(); close(); }}>
                                    <span className={styles.icon}><link.icon size={19} aria-hidden="true" /></span>
                                    <span><strong>{link.label}</strong><small>{link.description}</small></span>
                                    <ArrowUpRight size={14} className={styles.linkArrow} aria-hidden="true" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </LayoutGroup>
    </nav>
  );
}
