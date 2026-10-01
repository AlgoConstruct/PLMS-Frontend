"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, CalendarDays, Cable, ChevronDown, ChevronRight, ClipboardList, Flag, Folder, GraduationCap,
  Home, Kanban, KeyRound, Layers, List, Megaphone, Network, Package, Paperclip, ScrollText, Search,
  Settings, Shield, ShieldCheck, UserCheck, Users, type LucideIcon,
} from "lucide-react";
import type { ResolvedGroup, ResolvedItem } from "@pathwayiq/access/registry";
import { cn } from "@pathwayiq/ui/lib/utils";
import styles from "./dashboard.module.css";

const ICONS: Record<string, LucideIcon> = {
  home: Home, users: Users, folder: Folder, settings: Settings, book: BookOpen, school: GraduationCap,
  calendar: CalendarDays, clipboard: ClipboardList, megaphone: Megaphone, layers: Layers,
  shield: Shield, key: KeyRound, network: Network, check: ShieldCheck, plug: Cable, scroll: ScrollText,
  kanban: Kanban, list: List, "user-check": UserCheck, flag: Flag, package: Package, paperclip: Paperclip,
};

export function NavigationIcon({ name, size = 17 }: { name: string; size?: number }) {
  const Icon = ICONS[name] ?? Folder;
  return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />;
}

/** Prefer the most specific route; home and context overview links match only exactly. */
export function activeNavigationItem(groups: ResolvedGroup[], pathname: string) {
  return groups.flatMap((group) => group.items)
    .filter((item) => pathname === item.href || (item.href !== "/app" && !/^\/app\/c\/[^/]+\/[^/]+$/.test(item.href) && pathname.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

function NavigationGroup({ group, active, onNavigate }: { group: ResolvedGroup; active?: ResolvedItem; onNavigate?: () => void }) {
  const [open, setOpen] = useState(true);
  const id = useId();
  return <div className={styles.navGroup}>
    <button type="button" className={styles.groupHeading} onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={id}>
      <span>{group.label}</span><ChevronDown size={13} className={cn(!open && styles.closedChevron)} aria-hidden="true" />
    </button>
    <ul id={id} className={styles.navItems} hidden={!open}>
      {group.items.map((item) => <li key={item.key}>
        <Link href={item.href} className={cn(styles.navLink, active?.key === item.key && styles.activeLink)} aria-current={active?.key === item.key ? "page" : undefined} data-nav-key={item.key} onClick={onNavigate}>
          <NavigationIcon name={item.icon} /><span>{item.label}</span>{active?.key === item.key && <ChevronRight size={13} className={styles.activeArrow} aria-hidden="true" />}
        </Link>
      </li>)}
    </ul>
  </div>;
}

/** Reference sidebar adapted to real backend-authorized menu groups. */
export function SidebarNav({ groups, onNavigate, onSearch, label = "Main navigation", className }: {
  groups: ResolvedGroup[];
  onNavigate?: () => void;
  onSearch?: () => void;
  label?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const active = activeNavigationItem(groups, pathname);
  return <nav className={cn(styles.navigation, className)} aria-label={label}>
    {onSearch && <button type="button" className={styles.searchNav} onClick={onSearch}><Search size={16} aria-hidden="true" /><span>Search navigation</span><kbd>⌘ K</kbd></button>}
    {groups.map((group) => <NavigationGroup key={`${group.key}:${active?.key ?? "none"}`} group={group} active={active} onNavigate={onNavigate} />)}
    {groups.length === 0 && <p className={styles.noMenus}>No navigation is available for this account yet.</p>}
  </nav>;
}
