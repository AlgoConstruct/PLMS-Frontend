import { notFound } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createAssignment, deleteAssignment, setAssignmentPublished } from "../../../../_classroom-actions";
import { Can } from "@pathwayiq/access/capabilities";
import { ConfirmAction } from "@pathwayiq/ui/blocks/confirm-action";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { EmptyState, Forbidden, FormField, PageHeader } from "@pathwayiq/ui/blocks/page";
import { SelectField } from "@pathwayiq/ui/blocks/select-field";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardContent } from "@pathwayiq/ui/components/card";
import { Input } from "@pathwayiq/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@pathwayiq/ui/components/table";
import { Textarea } from "@pathwayiq/ui/components/textarea";
import { platformApi } from "@pathwayiq/api/platform";
import type { Assignment, ClassroomDetail, CourseVersion } from "@pathwayiq/api/platform-types";

export default async function AssignmentsPage({ params }: PageProps<"/app/c/[type]/[id]/assignments">) {
  const { type, id } = await params;
  if (type !== "classroom") notFound();
  const [detail, list, content] = await Promise.all([
    platformApi<ClassroomDetail>(`/api/v1/classrooms/${id}`),
    platformApi<Assignment[]>(`/api/v1/classrooms/${id}/assignments`),
    platformApi<CourseVersion>(`/api/v1/classrooms/${id}/content`),
  ]);
  if (!detail.ok || !list.ok) return <Forbidden what="these assignments" />;
  const timezone = detail.data.classroom.timezone;
  const templates = content.ok ? content.data.assignmentTemplates : [];
  const due = (a: Assignment) => a.dueAt
    ? new Date(a.dueAt).toLocaleString("en-US", { timeZone: timezone, dateStyle: "medium", timeStyle: "short" })
    : "—";
  return (
    <>
      <PageHeader title="Assignments" description={`Due dates in ${timezone}`} actions={
        <Can code="classroom.assignment.manage">
          <FormDialog trigger={<Button><Plus /> New assignment</Button>} title="New assignment" action={createAssignment} submitLabel="Create"
                      description="From a course template, or from scratch." wide>
            <input type="hidden" name="classroomId" value={id} />
            {templates.length > 0 && (
              <FormField label="Template" htmlFor="a-template" hint="Fills title, instructions, points and due date">
                <SelectField id="a-template" name="templateId" defaultValue="none"
                             options={[{ value: "none", label: "No template" }, ...templates.map((t) => ({ value: t.id, label: t.title }))]} />
              </FormField>
            )}
            <FormField label="Title" htmlFor="a-title"><Input id="a-title" name="title" /></FormField>
            <FormField label="Instructions" htmlFor="a-instr"><Textarea id="a-instr" name="instructions" /></FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Due" htmlFor="a-due"><Input id="a-due" name="dueLocal" type="datetime-local" /></FormField>
              <FormField label="Points" htmlFor="a-points"><Input id="a-points" name="points" type="number" min={0} /></FormField>
            </div>
            <FormField label="Visibility" htmlFor="a-vis">
              <SelectField id="a-vis" name="visibility" defaultValue="draft"
                           options={[{ value: "draft", label: "Draft (staff only)" }, { value: "published", label: "Published to students" }]} />
            </FormField>
          </FormDialog>
        </Can>
      } />
      <Card>
        <CardContent>
          {list.data.length === 0 ? <EmptyState>No assignments yet.</EmptyState> : (
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Due</TableHead><TableHead>Points</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {list.data.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="font-medium">{a.title}</div>
                      {a.instructions && <div className="max-w-md truncate text-xs text-muted-foreground">{a.instructions}</div>}
                    </TableCell>
                    <TableCell>{due(a)}</TableCell>
                    <TableCell>{a.points ?? "—"}</TableCell>
                    <TableCell><Badge variant={a.published ? "default" : "outline"}>{a.published ? "published" : "draft"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Can code="classroom.assignment.manage">
                        <ConfirmAction trigger={<Button size="sm" variant="ghost">{a.published ? "Hide" : "Publish"}</Button>}
                                       title={a.published ? `Hide ${a.title} from students?` : `Publish ${a.title}?`}
                                       action={setAssignmentPublished} fields={{ classroomId: id, assignmentId: a.id, published: String(!a.published) }}
                                       confirmLabel={a.published ? "Hide" : "Publish"} destructive={false} />
                        <ConfirmAction trigger={<Button size="sm" variant="ghost" className="text-destructive" aria-label="Delete assignment"><Trash2 /></Button>}
                                       title={`Delete ${a.title}?`} action={deleteAssignment} fields={{ classroomId: id, assignmentId: a.id }} confirmLabel="Delete" />
                      </Can>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
