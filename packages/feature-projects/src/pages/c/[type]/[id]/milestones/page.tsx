import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Can } from "@pathwayiq/access/capabilities";
import { ConfirmAction } from "@pathwayiq/ui/blocks/confirm-action";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { EmptyState, Forbidden, FormField, PageHeader } from "@pathwayiq/ui/blocks/page";
import { SelectField } from "@pathwayiq/ui/blocks/select-field";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { Input } from "@pathwayiq/ui/components/input";
import { platformApi } from "@pathwayiq/api/platform";
import type { Milestone } from "@pathwayiq/api/platform-types";
import { ProgressBar } from "../../../../../components/progress-bar";
import { loadProject } from "../../../../../lib/load";
import { deliverableLabel, milestoneState, today } from "../../../../../lib/milestones";
import { isWritable } from "../../../../../lib/status";
import { createMilestone, deleteMilestone, updateMilestone } from "../../../../_actions";

const STATE = { done: { label: "Done", variant: "default" }, overdue: { label: "Overdue", variant: "destructive" },
  open: { label: "Open", variant: "outline" } } as const;

export default async function MilestonesPage({ params }: PageProps<"/app/c/[type]/[id]/milestones">) {
  const { id } = await params;
  const [project, milestones] = await Promise.all([loadProject(id), platformApi<Milestone[]>(`/api/v1/projects/${id}/milestones`)]);
  if (!project) return <Forbidden what="this project" />;
  const writable = isWritable(project.status);
  const now = today();
  const items = milestones.ok ? milestones.data : [];
  return (
    <>
      <PageHeader title="Milestones" description={`${project.key} · checkpoints and what is due at each`}
                  actions={writable && (
                    <Can code="project.milestone.manage">
                      <FormDialog trigger={<Button><Plus /> New milestone</Button>} title="New milestone" action={createMilestone} submitLabel="Add">
                        <input type="hidden" name="projectId" value={id} />
                        <FormField label="Title" htmlFor="m-title"><Input id="m-title" name="title" required maxLength={200} /></FormField>
                        <FormField label="Due on" htmlFor="m-due"><Input id="m-due" name="dueOn" type="date" /></FormField>
                      </FormDialog>
                    </Can>
                  )} />
      {items.length === 0 ? <EmptyState>No milestones yet.</EmptyState> : (
        <ol className="grid gap-4">
          {items.map((m) => {
            const state = STATE[milestoneState(m, now)];
            return (
              <li key={m.id} data-milestone={m.title}>
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="flex items-center gap-2">
                        {m.title} <Badge variant={state.variant}>{state.label}</Badge>
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">{m.dueOn ? `due ${m.dueOn}` : "no due date"}</span>
                        {writable && (
                          <Can code="project.milestone.manage">
                            <FormDialog trigger={<Button size="icon" variant="ghost" aria-label={`Edit ${m.title}`}><Pencil /></Button>}
                                        title={`Edit ${m.title}`} action={updateMilestone}>
                              <input type="hidden" name="projectId" value={id} />
                              <input type="hidden" name="milestoneId" value={m.id} />
                              <FormField label="Title" htmlFor={`mt-${m.id}`}><Input id={`mt-${m.id}`} name="title" defaultValue={m.title} required /></FormField>
                              <FormField label="Due on" htmlFor={`md-${m.id}`}><Input id={`md-${m.id}`} name="dueOn" type="date" defaultValue={m.dueOn ?? ""} /></FormField>
                              <FormField label="Status" htmlFor={`ms-${m.id}`}>
                                <SelectField id={`ms-${m.id}`} name="status" defaultValue={m.status}
                                             options={[{ value: "OPEN", label: "Open" }, { value: "DONE", label: "Done" }]} />
                              </FormField>
                            </FormDialog>
                            <ConfirmAction trigger={<Button size="icon" variant="ghost" className="text-destructive" aria-label={`Delete ${m.title}`}><Trash2 /></Button>}
                                           title={`Delete ${m.title}?`} description="Its tasks and deliverables stay, without a milestone."
                                           action={deleteMilestone} fields={{ projectId: id, milestoneId: m.id }} confirmLabel="Delete" />
                          </Can>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <ProgressBar done={m.tasksDone} total={m.tasksTotal} label="Tasks" />
                    {m.deliverables.length > 0 && (
                      <ul className="grid gap-1 text-sm">
                        {m.deliverables.map((d) => (
                          <li key={d.id} className="flex items-center justify-between gap-2">
                            <Link href={`/app/c/project/${id}/deliverables`} className="hover:underline">{d.title}</Link>
                            <Badge variant="outline">{deliverableLabel(d.status)}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
