import { PageHeader } from "@pathwayiq/ui/blocks/page";
import { platformApi } from "@pathwayiq/api/platform";
import { CapabilitiesCard } from "./capabilities-card";

export async function WorkspaceOverview({ id }: { id: string }) {
  const details = await platformApi<{ name: string; description: string | null }>(`/api/v1/workspaces/${id}`);
  return (
    <>
      <PageHeader title={details.ok ? details.data.name : "Workspace"} description={details.ok ? details.data.description ?? undefined : undefined} />
      <CapabilitiesCard type="workspace" id={id} />
    </>
  );
}
