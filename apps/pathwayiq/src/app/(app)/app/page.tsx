import Link from "next/link";
import { ArrowUpRight, Compass, LayoutDashboard, Sparkles } from "lucide-react";
import { CardGrid } from "@pathwayiq/access/card-grid";
import { loadNavigation } from "@pathwayiq/access/navigation";
import { getMe } from "@pathwayiq/api/data";
import { EmptyState } from "@pathwayiq/ui/blocks/page";
import { NavigationIcon } from "@/components/ui/dashboard-sidebar";
import { BACKENDS } from "@/backends";
import { registry } from "@/registry";
import styles from "./dashboard-home.module.css";

export default async function Home() {
  const [me, nav] = await Promise.all([getMe(), loadNavigation("global", BACKENDS)]);
  const groups = registry.resolveGroups(nav.groups);
  const destinations = groups.flatMap((group) => group.items).filter((item) => item.href !== "/app").slice(0, 4);
  return <div className={styles.home}>
    <header className={styles.heading}><div><p>YOUR PERSONAL WORKSPACE</p><h1>Welcome back, {me.user.displayName}.</h1><span>Pick up where you left off. Make room for something new.</span></div><span className={styles.overviewBadge}><LayoutDashboard size={13} aria-hidden="true" /> Overview</span></header>
    <section className={styles.welcome} aria-labelledby="welcome-title">
      <div className={styles.welcomeCopy}><span className={styles.eyebrow}><Sparkles size={13} aria-hidden="true" /> EVERY DAY, A NEW POSSIBILITY</span><h2 id="welcome-title">A little curiosity.<br />A whole world of discovery.</h2><p>Your learning, projects, and people — all connected in one place.</p></div>
      <div className={styles.welcomeArt} aria-hidden="true"><span className={styles.orbit} /><span className={styles.compass}><Compass size={61} strokeWidth={1} /></span><span className={styles.artLabel}>Find your next direction.</span><span className={styles.spark}><Sparkles size={20} /></span></div>
    </section>
    {destinations.length > 0 && <section aria-labelledby="quick-access-title"><div className={styles.sectionHeading}><h2 id="quick-access-title">Make your next move</h2><span>A shortcut to your everyday essentials</span></div><div className={styles.shortcuts}>
      {destinations.map((item) => <Link key={item.key} href={item.href} className={styles.shortcut}><span className={styles.shortcutIcon}><NavigationIcon name={item.icon} size={19} /></span><span>{item.label}</span><ArrowUpRight size={15} aria-hidden="true" /></Link>)}
    </div></section>}
    <section className={styles.cards} aria-labelledby="workspace-overview-title"><div className={styles.sectionHeading}><h2 id="workspace-overview-title">Your workspace at a glance</h2><span>Learning and activity, together</span></div>
      {nav.cards.length > 0 ? <CardGrid cards={nav.cards} component={registry.card} /> : <EmptyState>Nothing here yet. Explore the navigation to get started.</EmptyState>}
    </section>
  </div>;
}
