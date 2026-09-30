"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, CalendarDays, Cable, ClipboardList, Flag, Folder, GraduationCap, Home, Kanban, KeyRound, Layers, List, Megaphone,
  Network, Package, Paperclip, ScrollText, Settings, Shield, ShieldCheck, UserCheck, Users, type LucideIcon,
} from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@pathwayiq/ui/components/sidebar";
import type { ResolvedGroup } from "./registry";

const ICONS: Record<string, LucideIcon> = {
  home: Home, users: Users, folder: Folder, settings: Settings, book: BookOpen, school: GraduationCap,
  calendar: CalendarDays, clipboard: ClipboardList, megaphone: Megaphone, layers: Layers,
  shield: Shield, key: KeyRound, network: Network, check: ShieldCheck, plug: Cable, scroll: ScrollText,
  kanban: Kanban, list: List, "user-check": UserCheck, flag: Flag, package: Package, paperclip: Paperclip,
};

/** Renders whatever navigation the backends returned; no role names anywhere. */
export function DynamicNav({ groups }: { groups: ResolvedGroup[] }) {
  const pathname = usePathname();
  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.key}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => {
              const Icon = ICONS[item.icon] ?? Folder;
              return (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                    <Link href={item.href} data-nav-key={item.key}><Icon /><span>{item.label}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
