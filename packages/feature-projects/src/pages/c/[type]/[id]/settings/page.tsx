import { Pencil } from "lucide-react";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { Forbidden, FormField, PageHeader } from "@pathwayiq/ui/blocks/page";
import { SelectField } from "@pathwayiq/ui/blocks/select-field";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { Input } from "@pathwayiq/ui/components/input";
import { Textarea } from "@pathwayiq/ui/components/textarea";
import { platformApi } from "@pathwayiq/api/platform";
import type { Objective, ProjectTask, WorkflowStatus } from "@pathwayiq/api/platform-types";
import { WorkflowEditor } from "../../../../../components/workflow-editor";
import { loadProject } from "../../../../../lib/load";
import { isWritable } from "../../../../../lib/status";
import { saveObjectives, updateProject } from "../../../../_actions";

export default async function SettingsPage({ params }: PageProps<"/app/c/[type]/[id]/settings">) {
  const { id } = await params;
  const [project, statuses, tasks, objectives] = await Promise.all([
    loadProject(id),
    platformApi<WorkflowStatus[]>(`/api/v1/projects/${id}/workflow`),
    platformApi<ProjectTask[]>(`/api/v1/projects/${id}/tasks`),
    platformApi<Objective[]>(`/api/v1/projects/${id}/objectives`),
  ]);
  if (!project) return <Forbidden what="this project" />;
  if (!isWritable(project.status)) {
    return (<><PageHeader title="Settings" /><p className="text-sm text-muted-foreground">This project is {project.status.toLowerCase()}; reopen it to change its settings.</p></>);
  }
  const counts: Record<string, number> = {};
  (tasks.ok ? tasks.data : []).forEach((t) => { counts[t.statusId] = (counts[t.statusId] ?? 0) + 1; });
  const objectiveList = objectives.ok ? objectives.data : [];
  return (
    <>
      <PageHeader title="Settings" description={`${project.key} · ${project.title}`}
                  actions={
                    <FormDialog trigger={<Button variant="outline"><Pencil /> Edit details</Button>} title="Project details"
                                action={updateProject} wide>
                      <input type="hidden" name="projectId" value={id} />
                      <FormField label="Title" htmlFor="s-title"><Input id="s-title" name="title" defaultValue={project.title} required maxLength={200} /></FormField>
                      <FormField label="Summary" htmlFor="s-summary"><Textarea id="s-summary" name="summary" defaultValue={project.summary ?? ""} /></FormField>
                      <FormField label="Visibility" htmlFor="s-vis">
                        <SelectField id="s-vis" name="visibility" defaultValue={project.visibility} options={[
                          { value: "PRIVATE", label: "Members only" }, { value: "ORGANIZATION", label: "Organization unit can view" }]} />
                      </FormField>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Starts on" htmlFor="s-start"><Input id="s-start" name="startsOn" type="date" defaultValue={project.startsOn ?? ""} /></FormField>
                        <FormField label="Due on" htmlFor="s-due"><Input id="s-due" name="dueOn" type="date" defaultValue={project.dueOn ?? ""} /></FormField>
                      </div>
                    </FormDialog>
                  } />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Objectives</CardTitle>
            <FormDialog trigger={<Button size="sm" variant="outline"><Pencil /> Edit</Button>} title="Objectives" action={saveObjectives}
                        description="One objective per line. Unchanged lines keep their done state.">
              <input type="hidden" name="projectId" value={id} />
              <input type="hidden" name="doneTexts" value={JSON.stringify(objectiveList.filter((o) => o.done).map((o) => o.text))} />
              <Textarea name="objectives" rows={6} defaultValue={objectiveList.map((o) => o.text).join("\n")} aria-label="Objectives" />
            </FormDialog>
          </div>
        </CardHeader>
        <CardContent className="grid gap-1 text-sm">
          {objectiveList.length === 0 ? <p className="text-muted-foreground">No objectives yet.</p>
            : objectiveList.map((o) => <span key={o.id}>{o.done ? "✓ " : "• "}{o.text}</span>)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Workflow</CardTitle></CardHeader>
        <CardContent>
          <WorkflowEditor key={(statuses.ok ? statuses.data : []).map((s) => `${s.id}${s.name}${s.category}`).join("|")}
                          projectId={id} statuses={statuses.ok ? statuses.data : []} taskCounts={counts} />
        </CardContent>
      </Card>
    </>
  );
}
