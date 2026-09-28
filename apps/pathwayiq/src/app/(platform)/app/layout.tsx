import Link from "next/link";
import { logout } from "@/app/actions";
import { DynamicNav } from "@/components/dynamic-nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { getMe } from "@/lib/data";
import { getNavigation } from "@/lib/platform";

export default async function PlatformLayout({ children }: LayoutProps<"/app">) {
  const [me, nav] = await Promise.all([getMe(), getNavigation("global")]);
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href="/app" className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">PQ</span>
            Pathway IQ
          </Link>
        </SidebarHeader>
        <SidebarContent><DynamicNav groups={nav.groups} /></SidebarContent>
        <SidebarFooter>
          <form action={logout}><Button variant="ghost" size="sm" className="w-full justify-start">Sign out</Button></form>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <span className="text-sm text-muted-foreground">{me.user.displayName}</span>
          <Link href="/" className="ml-auto text-sm text-muted-foreground hover:text-foreground">Admin console</Link>
        </header>
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
