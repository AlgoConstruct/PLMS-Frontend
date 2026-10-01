import { notFound } from "next/navigation";
import { CapabilityProvider } from "@pathwayiq/access/capabilities";
import { SidebarNav } from "@/components/ui/dashboard-sidebar";
import styles from "@/components/ui/dashboard.module.css";
import { loadNavigation } from "@pathwayiq/access/navigation";
import { Forbidden } from "@pathwayiq/ui/blocks/page";
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
      <div className={styles.contextLayout}>
        <aside className={styles.contextNav} aria-label="Learning space navigation">
          <SidebarNav groups={groups} label="Context navigation" />
        </aside>
        <div className={styles.contextContent}>{children}</div>
      </div>
    </CapabilityProvider>
  );
}
