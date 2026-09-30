import { ActivityFeed } from "@pathwayiq/collaboration/activity-feed";
import { Comments } from "@pathwayiq/collaboration/comments";
import { Files } from "@pathwayiq/collaboration/files";
import { loadPeople } from "@pathwayiq/collaboration/people";
import { PageHeader } from "@pathwayiq/ui/blocks/page";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { platformApi } from "@pathwayiq/api/platform";
import { CapabilitiesCard } from "./capabilities-card";

export async function WorkspaceOverview({ id }: { id: string }) {
  const [details, people] = await Promise.all([
    platformApi<{ name: string; description: string | null }>(`/api/v1/workspaces/${id}`),
    loadPeople("platform", "workspace", id),
  ]);
  const ctx = { backend: "platform", type: "workspace", id };
  const target = { type: "workspace", id };
  return (
    <>
      <PageHeader title={details.ok ? details.data.name : "Workspace"} description={details.ok ? details.data.description ?? undefined : undefined} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Discussion</CardTitle></CardHeader>
          <CardContent><Comments ctx={ctx} target={target} people={people} /></CardContent>
        </Card>
        <div className="grid h-fit gap-4">
          <Card>
            <CardHeader><CardTitle>Files</CardTitle></CardHeader>
            <CardContent><Files ctx={ctx} target={target} people={people} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
            <CardContent><ActivityFeed ctx={ctx} people={people} limit={15} /></CardContent>
          </Card>
        </div>
      </div>
      <CapabilitiesCard type="workspace" id={id} />
    </>
  );
}
