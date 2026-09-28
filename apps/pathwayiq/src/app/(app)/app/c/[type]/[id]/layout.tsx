import { notFound } from "next/navigation";
import { CapabilityProvider } from "@pathwayiq/access/capabilities";
import { DynamicNav } from "@pathwayiq/access/dynamic-nav";
import { Forbidden } from "@pathwayiq/ui/blocks/page";
import { Card, CardContent } from "@pathwayiq/ui/components/card";
import { SidebarProvider } from "@pathwayiq/ui/components/sidebar";
import { getNavigation } from "@pathwayiq/api/platform";

export default async function ContextLayout({ children, params }: LayoutProps<"/app/c/[type]/[id]">) {
  const { type, id } = await params;
  if (!/^[a-z][a-z0-9_]*$/.test(type) || !/^[0-9a-f-]{36}$/.test(id)) notFound();
  const nav = await getNavigation(`${type}:${id}`);
  if (nav.groups.length === 0) return <Forbidden what={`this ${type}`} />;
  return (
    <CapabilityProvider capabilities={nav.capabilities}>
      <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardContent className="p-2">
            <SidebarProvider className="min-h-0">
              <div className="w-full"><DynamicNav groups={nav.groups} context={{ type, id }} /></div>
            </SidebarProvider>
          </CardContent>
        </Card>
        <div className="min-w-0">{children}</div>
      </div>
    </CapabilityProvider>
  );
}
