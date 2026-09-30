"use server";

import type { ActionState } from "@pathwayiq/ui/lib/action-state";
import { field } from "@pathwayiq/api/mutate";
import { platformMutate } from "@pathwayiq/api/platform";

const num = (form: FormData, name: string) => {
  const value = field(form, name);
  return value === null ? null : Number(value);
};
const optional = (form: FormData, name: string) => {
  const value = field(form, name);
  return value === null || value === "none" ? null : value;
};
const coursePage = (form: FormData) => [`/app/courses/${field(form, "courseId")}`];

export async function createCourse(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate<{ id: string; title: string }>("/api/v1/courses", "POST", {
    nodeId: field(form, "nodeId"),
    code: field(form, "code"),
    title: field(form, "title"),
    description: field(form, "description"),
    credits: num(form, "credits"),
  }, (c) => ({ message: `${c.title} created`, redirectTo: `/app/courses/${c.id}` }), ["/app/courses"]);
}

export async function newDraft(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const courseId = field(form, "courseId");
  return platformMutate<{ id: string; version: number }>(`/api/v1/courses/${courseId}/drafts`, "POST", {},
    (d) => ({ message: `Draft version ${d.version} created`, redirectTo: `/app/courses/${courseId}?v=${d.id}` }), coursePage(form));
}

export async function publishVersion(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/course-versions/${field(form, "versionId")}/publish`, "POST",
    { changelog: field(form, "changelog") }, () => "Version published", coursePage(form));
}

export async function addUnit(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/course-versions/${field(form, "versionId")}/units`, "POST",
    { title: field(form, "title"), summary: field(form, "summary") }, () => "Unit added", coursePage(form));
}

export async function deleteUnit(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/course-units/${field(form, "unitId")}`, "DELETE", undefined, () => "Unit deleted", coursePage(form));
}

export async function addLesson(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/course-units/${field(form, "unitId")}/lessons`, "POST", {
    title: field(form, "title"), body: field(form, "body"), durationMin: num(form, "durationMin"),
  }, () => "Lesson added", coursePage(form));
}

export async function deleteLesson(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/course-lessons/${field(form, "lessonId")}`, "DELETE", undefined, () => "Lesson deleted", coursePage(form));
}

export async function addMaterial(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/course-lessons/${field(form, "lessonId")}/materials`, "POST", {
    kind: field(form, "kind"), title: field(form, "title"), ref: field(form, "ref"),
  }, () => "Material added", coursePage(form));
}

export async function deleteMaterial(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/course-materials/${field(form, "materialId")}`, "DELETE", undefined, () => "Material removed", coursePage(form));
}

export async function addTemplate(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/course-versions/${field(form, "versionId")}/assignment-templates`, "POST", {
    unitId: optional(form, "unitId"),
    title: field(form, "title"),
    instructions: field(form, "instructions"),
    points: num(form, "points"),
    relativeDueDays: num(form, "relativeDueDays"),
  }, () => "Assignment template added", coursePage(form));
}

export async function deleteTemplate(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/assignment-templates/${field(form, "templateId")}`, "DELETE", undefined,
    () => "Assignment template removed", coursePage(form));
}

export async function addProjectTemplate(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const team = field(form, "teamMode") === "TEAM";
  return platformMutate(`/api/v1/course-versions/${field(form, "versionId")}/project-templates`, "POST", {
    title: field(form, "title"),
    brief: field(form, "brief"),
    objectives: (field(form, "objectives") ?? "").split("\n").map((t) => t.trim()).filter(Boolean),
    teamMode: team ? "TEAM" : "INDIVIDUAL",
    minTeamSize: team ? num(form, "minTeamSize") : null,
    maxTeamSize: team ? num(form, "maxTeamSize") : null,
    durationDays: num(form, "durationDays"),
    milestones: JSON.parse(field(form, "milestones") ?? "[]"),
    deliverables: JSON.parse(field(form, "deliverables") ?? "[]"),
  }, () => "Project template added", coursePage(form));
}

export async function deleteProjectTemplate(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/project-templates/${field(form, "projectTemplateId")}`, "DELETE", undefined,
    () => "Project template removed", coursePage(form));
}
