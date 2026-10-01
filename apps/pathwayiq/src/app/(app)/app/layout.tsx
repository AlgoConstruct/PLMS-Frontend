import { CapabilityProvider } from "@pathwayiq/access/capabilities";
import { loadNavigation } from "@pathwayiq/access/navigation";
import { getMe } from "@pathwayiq/api/data";
import { DashboardShell } from "@/components/ui/dashboard-shell";
import { BACKENDS } from "@/backends";
import { registry } from "@/registry";
import styles from "@/components/ui/dashboard.module.css";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const [me, nav] = await Promise.all([getMe(), loadNavigation("global", BACKENDS)]);
  const groups = registry.resolveGroups(nav.groups);
  return <DashboardShell groups={groups} displayName={me.user.displayName} username={me.user.username}>
    {nav.unavailable.length > 0 && <p role="status" className={styles.notice}>Some workspace sections are temporarily unavailable. Please try again later.</p>}
    <CapabilityProvider capabilities={nav.capabilities}>{children}</CapabilityProvider>
  </DashboardShell>;
}
