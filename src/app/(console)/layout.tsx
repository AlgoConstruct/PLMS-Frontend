import { logout } from "@/app/actions";
import { AppSidebar, type NavGroup } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getMe } from "@/lib/data";

export default async function ConsoleLayout({ children }: LayoutProps<"/">) {
  const me = await getMe();
  const has = (code: string) => me.permissions.includes(code);
  const effective = me.assignments.filter((a) => a.effective);
  const primary = effective[0];
  const scopeSummary = primary
    ? `${primary.role.code} · ${primary.scopeType === "GLOBAL" ? "Global" : primary.node?.name}${effective.length > 1 ? ` +${effective.length - 1}` : ""}`
    : "No active roles";

  // Menus follow effective permissions for convenience only; the API decides on every request.
  const groups: NavGroup[] = [
    { label: "Overview", items: [{ href: "/", label: "Dashboard", icon: "overview" }, { href: "/access", label: "Access check", icon: "access" }] },
    {
      label: "Organization",
      items: [
        ...(has("organization.read") ? [{ href: "/hierarchy", label: "Hierarchy", icon: "hierarchy" as const }] : []),
        ...(has("organization.read") ? [{ href: "/hierarchy/types", label: "Node types", icon: "types" as const }] : []),
      ],
    },
    {
      label: "Access control",
      items: [
        ...(has("iam.user.read") ? [{ href: "/users", label: "Users", icon: "users" as const }] : []),
        ...(has("iam.role.read") ? [{ href: "/roles", label: "Roles", icon: "roles" as const }] : []),
        ...(has("iam.permission.read") ? [{ href: "/permissions", label: "Permissions", icon: "permissions" as const }] : []),
      ],
    },
    {
      label: "Platform",
      items: [
        ...(has("iam.client.manage") ? [{ href: "/service-clients", label: "Service clients", icon: "clients" as const }] : []),
        ...(has("iam.audit.read") ? [{ href: "/audit", label: "Audit log", icon: "audit" as const }] : []),
      ],
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar groups={groups} user={me.user} scopeSummary={scopeSummary} logoutAction={logout} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <span className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{me.user.username}</span>
          </span>
        </header>
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
