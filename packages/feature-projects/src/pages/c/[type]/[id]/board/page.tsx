import { Forbidden, PageHeader } from "@pathwayiq/ui/blocks/page";
import { Board } from "../../../../../components/board";
import { TaskDialogHost } from "../../../../../components/task-dialog-host";
import { TaskFilters } from "../../../../../components/task-filters";
import { filtersFrom, loadWorkspaceData } from "../../../../../lib/load";
import { isWritable } from "../../../../../lib/status";

export default async function BoardPage({ params, searchParams }: PageProps<"/app/c/[type]/[id]/board">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const data = await loadWorkspaceData(id, filtersFrom(sp));
  if (!data.project) return <Forbidden what="this project" />;
  const editable = isWritable(data.project.status);
  const signature = data.tasks.map((t) => `${t.id}:${t.statusId}:${t.position}`).join("|")
    + data.statuses.map((s) => s.id).join("|");
  return (
    <>
      <PageHeader title="Board" description={`${data.project.key} · ${data.tasks.length} tasks${editable ? "" : " · read-only"}`} />
      <TaskFilters members={data.members} milestones={data.milestones} />
      <Board key={signature} projectId={id} statuses={data.statuses} tasks={data.tasks} members={data.members} editable={editable}
             milestoneNames={Object.fromEntries(data.milestones.map((m) => [m.id, m.title]))} />
      <TaskDialogHost projectId={id} tasks={data.tasks} statuses={data.statuses} members={data.members} people={data.people}
                      milestones={data.milestones} editable={editable} />
    </>
  );
}
