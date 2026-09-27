"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, Home, Settings, Users, type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { resolveRoute } from "@/lib/route-registry";

const ICONS: Record<string, LucideIcon> = { home: Home, users: Users, folder: Folder, settings: Settings };

interface Item { key: string; label: string; icon: string; route: string }
interface Group { key: string; label: string; icon: string; items: Item[] }

/** Renders whatever navigation tree the platform returned; no role names anywhere. */
export function DynamicNav({ groups, context }: { groups: Group[]; context?: { type: string; id: string } }) {
  const pathname = usePathname();
  return (
    <>
      {groups.map((group) => {
        const items = group.items
          .map((item) => ({ item, href: resolveRoute(item.key, item.route, context) }))
          .filter((x): x is { item: Item; href: string } => x.href !== null);
        if (items.length === 0) return null;
        return (
          <SidebarGroup key={group.key}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {items.map(({ item, href }) => {
                const Icon = ICONS[item.icon] ?? Folder;
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild isActive={pathname === href} tooltip={item.label}>
                      <Link href={href} data-nav-key={item.key}><Icon /><span>{item.label}</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </>
  );
}
