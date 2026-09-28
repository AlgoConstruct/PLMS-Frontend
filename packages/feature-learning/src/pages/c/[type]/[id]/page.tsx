import { CapabilitiesCard } from "../../../../components/contexts/capabilities-card";
import { ClassroomOverview } from "../../../../components/contexts/classroom-overview";
import { WorkspaceOverview } from "../../../../components/contexts/workspace-overview";
import { PageHeader } from "@pathwayiq/ui/blocks/page";

export default async function ContextOverview({ params }: PageProps<"/app/c/[type]/[id]">) {
  const { type, id } = await params;
  if (type === "classroom") return <ClassroomOverview id={id} />;
  if (type === "workspace") return <WorkspaceOverview id={id} />;
  return (
    <>
      <PageHeader title={`${type} ${id.slice(0, 8)}`} />
      <CapabilitiesCard type={type} id={id} />
    </>
  );
}
