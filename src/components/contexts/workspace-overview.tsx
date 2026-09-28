import { PageHeader } from "@/components/iam";
import { platformApi } from "@/lib/platform";
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
