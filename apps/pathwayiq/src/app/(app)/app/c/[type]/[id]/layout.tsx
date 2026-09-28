import { notFound } from "next/navigation";
import { CapabilityProvider } from "@pathwayiq/access/capabilities";
import { DynamicNav } from "@pathwayiq/access/dynamic-nav";
import { loadNavigation } from "@pathwayiq/access/navigation";
import { Forbidden } from "@pathwayiq/ui/blocks/page";
import { Card, CardContent } from "@pathwayiq/ui/components/card";
import { SidebarProvider } from "@pathwayiq/ui/components/sidebar";
import { backendsFor } from "@/backends";
import { registry } from "@/registry";

export default async function ContextLayout({ children, params }: LayoutProps<"/app/c/[type]/[id]">) {
  const { type, id } = await params;
  if (!/^[a-z][a-z0-9_]*$/.test(type) || !/^[0-9a-f-]{36}$/.test(id)) notFound();
  const owners = backendsFor(type);
  if (owners.length === 0) notFound();
  const nav = await loadNavigation(`${type}:${id}`, owners);
  const groups = registry.resolveGroups(nav.groups, { type, id });
  if (groups.length === 0) return <Forbidden what={`this ${type}`} />;
  return (
    <CapabilityProvider capabilities={nav.capabilities}>
      <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardContent className="p-2">
            <SidebarProvider className="min-h-0">
              <div className="w-full"><DynamicNav groups={groups} /></div>
            </SidebarProvider>
          </CardContent>
        </Card>
        <div className="min-w-0">{children}</div>
      </div>
    </CapabilityProvider>
  );
}
