import Link from "next/link";
import { notFound } from "next/navigation";
import { Copy, Plus, Send, Trash2 } from "lucide-react";
import { ConfirmAction } from "@pathwayiq/ui/blocks/confirm-action";
import { CourseOutline } from "../../../components/course-outline";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { EmptyState, Forbidden, FormField, PageHeader } from "@pathwayiq/ui/blocks/page";
import { SelectField } from "@pathwayiq/ui/blocks/select-field";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { Input } from "@pathwayiq/ui/components/input";
import { Textarea } from "@pathwayiq/ui/components/textarea";
import { platformApi } from "@pathwayiq/api/platform";
import type { CourseDetail, CourseVersion } from "@pathwayiq/api/platform-types";
import {
  addLesson, addMaterial, addProjectTemplate, addTemplate, addUnit, deleteProjectTemplate, deleteLesson, deleteMaterial, deleteTemplate, deleteUnit, newDraft, publishVersion,
} from "../../_course-actions";

const hidden = (fields: Record<string, string>) =>
  Object.entries(fields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />);

export default async function CoursePage({ params, searchParams }: PageProps<"/app/courses/[id]">) {
  const { id } = await params;
  const { v } = await searchParams;
  const detail = await platformApi<CourseDetail>(`/api/v1/courses/${id}`);
  if (!detail.ok) {
    if (detail.status === 404) notFound();
    return <Forbidden what="this course" />;
  }
  const { course, versions, capabilities } = detail.data;
  const selected = versions.find((x) => x.id === v) ?? versions[0];
  const version = await platformApi<CourseVersion>(`/api/v1/course-versions/${selected.id}`);
  if (!version.ok) return <Forbidden what="this course version" />;

  const draft = selected.status === "DRAFT";
  const canEdit = draft && capabilities.includes("course.update");
  const canPublish = draft && capabilities.includes("course.publish");
  const canStartDraft = !versions.some((x) => x.status === "DRAFT") && capabilities.includes("course.update");
  const ids = { courseId: course.id, versionId: selected.id };
  const units = version.data.units;

  return (
    <>
      <PageHeader
        title={course.title}
        description={`${course.code}${course.credits != null ? ` · ${course.credits} credits` : ""}`}
        actions={
          <>
            {canStartDraft && (
              <ConfirmAction trigger={<Button variant="outline"><Copy /> New draft</Button>} title="Start a new draft?"
                             description={`Copies version ${versions[0].version}. Classrooms keep using their published version.`}
                             action={newDraft} fields={{ courseId: course.id }} confirmLabel="Create draft" destructive={false} />
            )}
            {canPublish && (
              <FormDialog trigger={<Button><Send /> Publish</Button>} title={`Publish version ${selected.version}?`}
                          description="Published versions are frozen; classrooms can then use them." action={publishVersion} submitLabel="Publish">
                {hidden(ids)}
                <FormField label="Changelog" htmlFor="p-log"><Textarea id="p-log" name="changelog" /></FormField>
              </FormDialog>
            )}
          </>
        }
      />
      <div className="flex flex-wrap gap-2">
        {versions.map((x) => (
          <Link key={x.id} href={`/app/courses/${course.id}?v=${x.id}`}>
            <Badge variant={x.id === selected.id ? "default" : "outline"}>v{x.version} · {x.status.toLowerCase()}</Badge>
          </Link>
        ))}
      </div>
      {course.description && <p className="text-sm text-muted-foreground">{course.description}</p>}

      <CourseOutline
        version={version.data}
        unitActions={canEdit ? (unit) => (
          <div className="flex gap-1">
            <FormDialog trigger={<Button size="sm" variant="outline"><Plus /> Lesson</Button>} title={`New lesson in ${unit.title}`}
                        action={addLesson} submitLabel="Add">
              {hidden({ ...ids, unitId: unit.id })}
              <FormField label="Title" htmlFor={`l-title-${unit.id}`}><Input id={`l-title-${unit.id}`} name="title" required /></FormField>
              <FormField label="Content" htmlFor={`l-body-${unit.id}`}><Textarea id={`l-body-${unit.id}`} name="body" rows={6} /></FormField>
              <FormField label="Duration (minutes)" htmlFor={`l-min-${unit.id}`}>
                <Input id={`l-min-${unit.id}`} name="durationMin" type="number" min={1} />
              </FormField>
            </FormDialog>
            <ConfirmAction trigger={<Button size="sm" variant="ghost" className="text-destructive" aria-label="Delete unit"><Trash2 /></Button>}
                           title={`Delete ${unit.title}?`} description="Its lessons and materials are deleted too."
                           action={deleteUnit} fields={{ ...ids, unitId: unit.id }} confirmLabel="Delete" />
          </div>
        ) : undefined}
        lessonActions={canEdit ? (lesson) => (
          <div className="flex gap-1">
            <FormDialog trigger={<Button size="sm" variant="ghost"><Plus /> Material</Button>} title={`Material for ${lesson.title}`}
                        action={addMaterial} submitLabel="Add">
              {hidden({ ...ids, lessonId: lesson.id })}
              <FormField label="Kind" htmlFor={`m-kind-${lesson.id}`}>
                <SelectField id={`m-kind-${lesson.id}`} name="kind" defaultValue="LINK"
                             options={[{ value: "LINK", label: "Link" }, { value: "FILE", label: "File" }, { value: "VIDEO", label: "Video" }]} />
              </FormField>
              <FormField label="Title" htmlFor={`m-title-${lesson.id}`}><Input id={`m-title-${lesson.id}`} name="title" required /></FormField>
              <FormField label="URL" htmlFor={`m-ref-${lesson.id}`}>
                <Input id={`m-ref-${lesson.id}`} name="ref" type="url" required placeholder="https://" />
              </FormField>
            </FormDialog>
            <ConfirmAction trigger={<Button size="sm" variant="ghost" className="text-destructive" aria-label="Delete lesson"><Trash2 /></Button>}
                           title={`Delete ${lesson.title}?`} description="Its materials are deleted too."
                           action={deleteLesson} fields={{ ...ids, lessonId: lesson.id }} confirmLabel="Delete" />
            {lesson.materials.map((m) => (
              <ConfirmAction key={m.id} trigger={<Button size="sm" variant="ghost" className="text-destructive">Remove {m.title}</Button>}
                             title={`Remove ${m.title}?`} action={deleteMaterial} fields={{ ...ids, materialId: m.id }} confirmLabel="Remove" />
            ))}
          </div>
        ) : undefined}
      />

      {canEdit && (
        <FormDialog trigger={<Button variant="outline" className="w-fit"><Plus /> Add unit</Button>} title="New unit" action={addUnit} submitLabel="Add">
          {hidden(ids)}
          <FormField label="Title" htmlFor="u-title"><Input id="u-title" name="title" required /></FormField>
          <FormField label="Summary" htmlFor="u-summary"><Textarea id="u-summary" name="summary" /></FormField>
        </FormDialog>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Assignment templates</CardTitle>
            {canEdit && (
              <FormDialog trigger={<Button size="sm" variant="outline"><Plus /> Template</Button>} title="New assignment template"
                          action={addTemplate} submitLabel="Add" description="Classrooms create assignments from these; the due date is counted from the classroom's start.">
                {hidden(ids)}
                <FormField label="Title" htmlFor="t-title"><Input id="t-title" name="title" required /></FormField>
                <FormField label="Unit" htmlFor="t-unit">
                  <SelectField id="t-unit" name="unitId" defaultValue="none"
                               options={[{ value: "none", label: "No unit" }, ...units.map((u) => ({ value: u.id, label: u.title }))]} />
                </FormField>
                <FormField label="Instructions" htmlFor="t-instr"><Textarea id="t-instr" name="instructions" /></FormField>
                <FormField label="Points" htmlFor="t-points"><Input id="t-points" name="points" type="number" min={0} /></FormField>
                <FormField label="Due after (days from start)" htmlFor="t-days"><Input id="t-days" name="relativeDueDays" type="number" min={0} /></FormField>
              </FormDialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-2">
          {version.data.assignmentTemplates.length === 0 ? <EmptyState>No assignment templates.</EmptyState> : version.data.assignmentTemplates.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span>
                <span className="font-medium">{t.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {t.points != null ? `${t.points} points` : "ungraded"}
                  {t.relativeDueDays != null ? ` · due ${t.relativeDueDays} days after start` : ""}
                </span>
              </span>
              {canEdit && (
                <ConfirmAction trigger={<Button size="sm" variant="ghost" className="text-destructive" aria-label="Delete template"><Trash2 /></Button>}
                               title={`Delete ${t.title}?`} action={deleteTemplate} fields={{ ...ids, templateId: t.id }} confirmLabel="Delete" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Project templates</CardTitle>
            {canEdit && (
              <FormDialog trigger={<Button size="sm" variant="outline"><Plus /> Project template</Button>} title="New project template"
                          action={addProjectTemplate} submitLabel="Add" wide
                          description="Classrooms start projects from these, one per student or one per team.">
                {hidden(ids)}
                <FormField label="Title" htmlFor="pt-title"><Input id="pt-title" name="title" required maxLength={200} /></FormField>
                <FormField label="Brief" htmlFor="pt-brief"><Textarea id="pt-brief" name="brief" /></FormField>
                <FormField label="Objectives" htmlFor="pt-obj" hint="One per line"><Textarea id="pt-obj" name="objectives" rows={4} /></FormField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Who works on it" htmlFor="pt-mode">
                    <SelectField id="pt-mode" name="teamMode" defaultValue="INDIVIDUAL"
                                 options={[{ value: "INDIVIDUAL", label: "Each student" }, { value: "TEAM", label: "Teams" }]} />
                  </FormField>
                  <FormField label="Duration (days)" htmlFor="pt-days"><Input id="pt-days" name="durationDays" type="number" min={1} /></FormField>
                  <FormField label="Min team size" htmlFor="pt-min" hint="Teams only"><Input id="pt-min" name="minTeamSize" type="number" min={1} /></FormField>
                  <FormField label="Max team size" htmlFor="pt-max" hint="Teams only"><Input id="pt-max" name="maxTeamSize" type="number" min={1} /></FormField>
                </div>
              </FormDialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-2">
          {version.data.projectTemplates.length === 0 ? <EmptyState>No project templates.</EmptyState> : version.data.projectTemplates.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span>
                <span className="font-medium">{t.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {t.teamMode === "TEAM" ? `teams of ${t.minTeamSize ?? 1}–${t.maxTeamSize ?? "any"}` : "each student"}
                  {t.durationDays != null ? ` · ${t.durationDays} days` : ""}
                  {t.objectives.length > 0 ? ` · ${t.objectives.length} objectives` : ""}
                </span>
              </span>
              {canEdit && (
                <ConfirmAction trigger={<Button size="sm" variant="ghost" className="text-destructive" aria-label="Delete project template"><Trash2 /></Button>}
                               title={`Delete ${t.title}?`} action={deleteProjectTemplate} fields={{ ...ids, projectTemplateId: t.id }} confirmLabel="Delete" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
