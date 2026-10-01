"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, ChevronDown, ChevronRight, LogOut, Network, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { logout } from "@pathwayiq/auth/actions";
import type { ResolvedGroup } from "@pathwayiq/access/registry";
import { cn } from "@pathwayiq/ui/lib/utils";
import { useIsMobile } from "@pathwayiq/ui/hooks/use-mobile";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@pathwayiq/ui/components/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@pathwayiq/ui/components/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@pathwayiq/ui/components/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@pathwayiq/ui/components/dropdown-menu";
import { activeNavigationItem, NavigationIcon, SidebarNav } from "./dashboard-sidebar";
import styles from "./dashboard.module.css";

export function DashboardShell({ groups, displayName, username, children }: {
  groups: ResolvedGroup[];
  displayName: string;
  username: string;
  children: ReactNode;
}) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchButton = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();
  const active = activeNavigationItem(groups, pathname);
  const initials = displayName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "PQ";
  const sectionTitle = active?.label ?? (pathname.startsWith("/app/c/") ? "Learning space" : pathname.startsWith("/app/admin") ? "Administration" : "Workspace");

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMobileOpen(false);
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function openSearch() { setMobileOpen(false); setSearchOpen(true); }
  const sidebar = <>
    <div className={styles.sidebarHeader}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><button type="button" className={styles.workspaceButton} aria-label="Pathway IQ quick navigation">
          <span className={styles.brandMark}><Network size={22} aria-hidden="true" /></span><span><strong>pathway<span>iq.</span></strong><small>Your learning workspace</small></span><ChevronDown size={15} aria-hidden="true" />
        </button></DropdownMenuTrigger>
        <DropdownMenuContent className={cn(styles.theme, styles.quickMenu)} align="start">
          <DropdownMenuLabel>Quick navigation</DropdownMenuLabel>
          {groups.map((group) => <DropdownMenuItem key={group.key} asChild><Link href={group.items[0].href} onClick={() => setMobileOpen(false)}><NavigationIcon name={group.icon} />{group.label}</Link></DropdownMenuItem>)}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link href="/" onClick={() => setMobileOpen(false)}>Pathway IQ home<ArrowUpRight size={14} aria-hidden="true" /></Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <SidebarNav groups={groups} onSearch={openSearch} onNavigate={() => setMobileOpen(false)} />
    <div className={styles.sidebarFooter}>
      <div className={styles.profile}><span className={styles.avatar}>{initials}</span><div><strong>{displayName}</strong><span>@{username}</span></div></div>
      <form action={logout}><button type="submit" className={styles.logout}><LogOut size={16} aria-hidden="true" /><span>Sign out</span></button></form>
    </div>
  </>;

  return <div className={cn(styles.theme, styles.shell, !desktopOpen && styles.sidebarCollapsed)}>
    <a href="#dashboard-content" className={styles.skipLink}>Skip to dashboard content</a>
    <aside id="dashboard-navigation" className={styles.desktopSidebar} aria-label="Workspace sidebar" aria-hidden={!desktopOpen || isMobile} inert={!desktopOpen || isMobile}><div className={styles.sidebarInner}>{sidebar}</div></aside>
    <Sheet open={mobileOpen && isMobile} onOpenChange={setMobileOpen}>
      <SheetContent id="dashboard-mobile-navigation" side="left" className={cn(styles.theme, styles.mobileSidebar)}>
        <SheetHeader className="sr-only"><SheetTitle>Workspace navigation</SheetTitle><SheetDescription>Navigate your learning workspace and manage your session.</SheetDescription></SheetHeader>
        {sidebar}
      </SheetContent>
    </Sheet>
    <div className={styles.mainColumn}>
      <header className={styles.topbar}>
        <div className={styles.breadcrumbs}>
          <button type="button" className={styles.iconButton} onClick={() => isMobile ? setMobileOpen(!mobileOpen) : setDesktopOpen(!desktopOpen)} aria-label={isMobile ? "Open navigation" : desktopOpen ? "Collapse sidebar" : "Expand sidebar"} aria-expanded={isMobile ? mobileOpen : desktopOpen} aria-controls={isMobile ? "dashboard-mobile-navigation" : "dashboard-navigation"}>
            {!isMobile && desktopOpen ? <PanelLeftClose size={18} aria-hidden="true" /> : <PanelLeftOpen size={18} aria-hidden="true" />}
          </button>
          <span className={styles.breadcrumbRoot}>Workspace</span><ChevronRight className={styles.breadcrumbSeparator} size={13} aria-hidden="true" /><span className={styles.breadcrumbCurrent}>{sectionTitle}</span>
        </div>
        <div className={styles.topbarActions}>
          <button ref={searchButton} type="button" onClick={openSearch} className={styles.topSearch} aria-label="Search navigation"><Search size={15} aria-hidden="true" /><span>Jump to a page…</span><kbd>⌘ K</kbd></button>
          <span className={styles.topAvatar} title={displayName} aria-label={`Signed in as ${displayName}`}>{initials}</span>
        </div>
      </header>
      <main id="dashboard-content" tabIndex={-1} className={styles.content}>{children}</main>
      <footer className={styles.footer}><span>Pathway IQ</span><span>A space to learn, create, and connect.</span></footer>
    </div>
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className={cn(styles.theme, styles.searchDialog)} onCloseAutoFocus={(event) => { event.preventDefault(); searchButton.current?.focus(); }}>
        <DialogHeader className={styles.searchHeader}><DialogTitle>Find your next destination</DialogTitle><DialogDescription>Search the pages available in your workspace.</DialogDescription></DialogHeader>
        <Command className={styles.command}>
          <CommandInput placeholder="Search navigation…" aria-label="Search navigation" />
          <CommandList><CommandEmpty>No matching pages found.</CommandEmpty>
            {groups.map((group) => <CommandGroup key={group.key} heading={group.label}>
              {group.items.map((item) => <CommandItem key={item.key} value={`${group.label} ${item.label} ${item.key}`} onSelect={() => { setSearchOpen(false); router.push(item.href); }}><NavigationIcon name={item.icon} /><span>{item.label}</span></CommandItem>)}
            </CommandGroup>)}
          </CommandList>
        </Command>
        <p className={styles.searchHint}>↑ ↓ to browse · Enter to open · Esc to close</p>
      </DialogContent>
    </Dialog>
  </div>;
}
