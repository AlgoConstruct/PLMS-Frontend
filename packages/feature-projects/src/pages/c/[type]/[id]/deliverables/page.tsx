import { Plus } from "lucide-react";
import { Can } from "@pathwayiq/access/capabilities";
import { loadPeople } from "@pathwayiq/collaboration/people";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { EmptyState, Forbidden, FormField, PageHeader } from "@pathwayiq/ui/blocks/page";
import { SelectField } from "@pathwayiq/ui/blocks/select-field";
import { Button } from "@pathwayiq/ui/components/button";
import { Input } from "@pathwayiq/ui/components/input";
import { Textarea } from "@pathwayiq/ui/components/textarea";
import { platformApi } from "@pathwayiq/api/platform";
import type { Deliverable, Milestone } from "@pathwayiq/api/platform-types";
import { DeliverableCard } from "../../../../../components/deliverable-card";
import { loadProject } from "../../../../../lib/load";
import { isWritable } from "../../../../../lib/status";
import { createDeliverable } from "../../../../_actions";

export default async function DeliverablesPage({ params }: PageProps<"/app/c/[type]/[id]/deliverables">) {
  const { id } = await params;
  const [project, deliverables, milestones, people] = await Promise.all([
    loadProject(id),
    platformApi<Deliverable[]>(`/api/v1/projects/${id}/deliverables`),
    platformApi<Milestone[]>(`/api/v1/projects/${id}/milestones`),
    loadPeople("platform", "project", id),
  ]);
  if (!project) return <Forbidden what="this project" />;
  const writable = isWritable(project.status);
  const ms = milestones.ok ? milestones.data : [];
  const titles = new Map(ms.map((m) => [m.id, m.title]));
  const items = deliverables.ok ? deliverables.data : [];
  return (
    <>
      <PageHeader title="Deliverables" description={`${project.key} · submit work for review`}
                  actions={writable && (
                    <Can code="project.milestone.manage">
                      <FormDialog trigger={<Button><Plus /> New deliverable</Button>} title="New deliverable" action={createDeliverable}
                                  submitLabel="Add" wide>
                        <input type="hidden" name="projectId" value={id} />
                        <FormField label="Title" htmlFor="d-title"><Input id="d-title" name="title" required maxLength={200} /></FormField>
                        <FormField label="Description" htmlFor="d-desc"><Textarea id="d-desc" name="description" rows={3} /></FormField>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <FormField label="Milestone" htmlFor="d-ms">
                            <SelectField id="d-ms" name="milestoneId" defaultValue="none"
                                         options={[{ value: "none", label: "None" }, ...ms.map((m) => ({ value: m.id, label: m.title }))]} />
                          </FormField>
                          <FormField label="Due on" htmlFor="d-due"><Input id="d-due" name="dueOn" type="date" /></FormField>
                          <FormField label="Max score" htmlFor="d-max" hint="Empty = not scored">
                            <Input id="d-max" name="maxScore" type="number" min={1} max={1000} />
                          </FormField>
                        </div>
                      </FormDialog>
                    </Can>
                  )} />
      {items.length === 0 ? <EmptyState>No deliverables yet.</EmptyState> : (
        <div className="grid gap-4">
          {items.map((d) => (
            <DeliverableCard key={`${d.id}${d.status}${d.fileCount}`} projectId={id} deliverable={d}
                             milestoneTitle={d.milestoneId ? titles.get(d.milestoneId) : undefined} people={people} writable={writable} />
          ))}
        </div>
      )}
    </>
  );
}
