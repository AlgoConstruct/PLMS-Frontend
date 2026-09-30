import { ConfirmAction } from "@pathwayiq/ui/blocks/confirm-action";
import { Forbidden, PageHeader } from "@pathwayiq/ui/blocks/page";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { Can } from "@pathwayiq/access/capabilities";
import { platformApi } from "@pathwayiq/api/platform";
import type { Objective, ProjectProgress, ProjectTask } from "@pathwayiq/api/platform-types";
import { loadProject } from "../lib/load";
import { isWritable } from "../lib/status";
import { changeProjectStatus, toggleObjective } from "../pages/_actions";
import { ProgressBar } from "./progress-bar";
import { ObjectiveToggle } from "./objective-toggle";

const TRANSITIONS: Record<string, { status: string; label: string; destructive?: boolean }[]> = {
  DRAFT: [{ status: "ACTIVE", label: "Start" }, { status: "ARCHIVED", label: "Archive", destructive: true }],
  ACTIVE: [{ status: "COMPLETED", label: "Complete" }, { status: "ARCHIVED", label: "Archive", destructive: true }],
  COMPLETED: [{ status: "ACTIVE", label: "Reopen" }, { status: "ARCHIVED", label: "Archive", destructive: true }],
  ARCHIVED: [],
};

export async function ProjectOverview({ id }: { id: string }) {
  const [project, progress, objectives, mine] = await Promise.all([
    loadProject(id),
    platformApi<ProjectProgress>(`/api/v1/projects/${id}/progress`),
    platformApi<Objective[]>(`/api/v1/projects/${id}/objectives`),
    platformApi<ProjectTask[]>(`/api/v1/projects/${id}/tasks?assignee=me`),
  ]);
  if (!project) return <Forbidden what="this project" />;
  const writable = isWritable(project.status);
  const openMine = mine.ok ? mine.data.filter((t) => !t.completedAt).length : 0;
  return (
    <>
      <PageHeader
        title={<span className="flex items-center gap-2">{project.title}<Badge variant="outline">{project.key}</Badge></span>}
        description={project.summary ?? undefined}
        actions={<Can code="project.complete">
          <div className="flex gap-2">
            {TRANSITIONS[project.status]?.map((t) => (
              <ConfirmAction key={t.status} trigger={<Button variant={t.destructive ? "outline" : "default"}>{t.label}</Button>}
                             title={`${t.label} ${project.title}?`} action={changeProjectStatus}
                             description={t.status === "COMPLETED" ? "A completed project is read-only until it is reopened."
                               : t.status === "ARCHIVED" ? "Archived projects stay read-only for good." : undefined}
                             fields={{ projectId: id, status: t.status }} confirmLabel={t.label} destructive={!!t.destructive} />
            ))}
          </div>
        </Can>} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <ProgressBar done={progress.ok ? progress.data.tasksDone : 0} total={progress.ok ? progress.data.tasksTotal : 0} label="Tasks" />
            <div className="grid gap-2">
              <span className="text-sm font-medium">Objectives</span>
              {!objectives.ok || objectives.data.length === 0
                ? <p className="text-sm text-muted-foreground">No objectives yet.</p>
                : objectives.data.map((o) => (
                  <ObjectiveToggle key={o.id} projectId={id} objective={o} action={toggleObjective} editable={writable} />
                ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline">{project.status.toLowerCase()}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Starts</span><span>{project.startsOn ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Due</span><span>{project.dueOn ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">My open tasks</span><span data-testid="my-open-tasks">{openMine}</span></div>
            {!writable && <p className="text-muted-foreground">This project is {project.status.toLowerCase()} and read-only.</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
