import Link from "next/link";
import { logout } from "@pathwayiq/auth/actions";
import { CapabilityProvider } from "@pathwayiq/access/capabilities";
import { DynamicNav } from "@pathwayiq/access/dynamic-nav";
import { loadNavigation } from "@pathwayiq/access/navigation";
import { getMe } from "@pathwayiq/api/data";
import { Button } from "@pathwayiq/ui/components/button";
import { Separator } from "@pathwayiq/ui/components/separator";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger,
} from "@pathwayiq/ui/components/sidebar";
import { BACKENDS } from "@/backends";
import { registry } from "@/registry";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const [me, nav] = await Promise.all([getMe(), loadNavigation("global", BACKENDS)]);
  const groups = registry.resolveGroups(nav.groups);
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href="/app" className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">PQ</span>
            Pathway IQ
          </Link>
        </SidebarHeader>
        <SidebarContent><DynamicNav groups={groups} /></SidebarContent>
        <SidebarFooter>
          <form action={logout}><Button variant="ghost" size="sm" className="w-full justify-start">Sign out</Button></form>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <span className="text-sm text-muted-foreground">{me.user.displayName}</span>
        </header>
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6">
          {nav.unavailable.length > 0 && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Some menus are missing: {nav.unavailable.join(", ")} did not respond.
            </p>
          )}
          <CapabilityProvider capabilities={nav.capabilities}>{children}</CapabilityProvider>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
