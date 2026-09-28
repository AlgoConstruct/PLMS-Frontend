import { CardGrid } from "@pathwayiq/access/card-grid";
import { loadNavigation } from "@pathwayiq/access/navigation";
import { getMe } from "@pathwayiq/api/data";
import { EmptyState, PageHeader } from "@pathwayiq/ui/blocks/page";
import { BACKENDS } from "@/backends";
import { registry } from "@/registry";

export default async function Home() {
  const [me, nav] = await Promise.all([getMe(), loadNavigation("global", BACKENDS)]);
  return (
    <>
      <PageHeader title={`Welcome, ${me.user.displayName}`} description="Your home page follows your permissions." />
      {nav.cards.length > 0
        ? <CardGrid cards={nav.cards} component={registry.card} />
        : <EmptyState>Nothing here yet. Use the menu on the left to get started.</EmptyState>}
    </>
  );
}
