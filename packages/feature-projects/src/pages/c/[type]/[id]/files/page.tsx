import { loadPeople } from "@pathwayiq/collaboration/people";
import { Forbidden, PageHeader } from "@pathwayiq/ui/blocks/page";
import { Card, CardContent } from "@pathwayiq/ui/components/card";
import { platformApi } from "@pathwayiq/api/platform";
import type { ProjectTask } from "@pathwayiq/api/platform-types";
import { ProjectFiles } from "../../../../../components/project-files";
import { loadProject } from "../../../../../lib/load";

export default async function FilesPage({ params }: PageProps<"/app/c/[type]/[id]/files">) {
  const { id } = await params;
  const [project, people, tasks] = await Promise.all([
    loadProject(id), loadPeople("platform", "project", id), platformApi<ProjectTask[]>(`/api/v1/projects/${id}/tasks`),
  ]);
  if (!project) return <Forbidden what="this project" />;
  const taskKeys = Object.fromEntries((tasks.ok ? tasks.data : []).map((t) => [t.id, `${t.key} · ${t.title}`]));
  return (
    <>
      <PageHeader title="Files" description={`${project.key} · files on the project and its tasks`} />
      <Card><CardContent className="pt-6"><ProjectFiles projectId={id} people={people} taskKeys={taskKeys} /></CardContent></Card>
    </>
  );
}
