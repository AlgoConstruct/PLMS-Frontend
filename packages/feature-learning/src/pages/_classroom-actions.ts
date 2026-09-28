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
const api = (form: FormData, sub = "") => `/api/v1/classrooms/${field(form, "classroomId")}${sub}`;
const page = (form: FormData) => [`/app/c/classroom/${field(form, "classroomId")}`];

export async function createClassroom(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate<{ id: string; title: string }>("/api/v1/classrooms", "POST", {
    nodeId: field(form, "nodeId"),
    courseId: optional(form, "courseId"),
    code: field(form, "code"),
    title: field(form, "title"),
    section: field(form, "section"),
    startsOn: field(form, "startsOn"),
    endsOn: field(form, "endsOn"),
    timezone: field(form, "timezone") ?? "UTC",
  }, (c) => ({ message: `${c.title} created`, redirectTo: `/app/c/classroom/${c.id}` }), ["/app/classrooms"]);
}

export async function changeClassroomStatus(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(api(form, "/status"), "POST", { status: field(form, "status") }, () => "Status updated", page(form));
}

export async function changeContentVersion(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(api(form, "/content-version"), "POST", { versionId: field(form, "versionId") },
    () => "Classroom now uses the selected version", page(form));
}

export async function addSession(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(api(form, "/sessions"), "POST", {
    weekday: num(form, "weekday"), startTime: field(form, "startTime"), endTime: field(form, "endTime"), location: field(form, "location"),
  }, () => "Weekly session added", page(form));
}

export async function deleteSession(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(api(form, `/sessions/${field(form, "sessionId")}`), "DELETE", undefined, () => "Session removed", page(form));
}

export async function addOverride(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(api(form, "/session-overrides"), "POST", {
    date: field(form, "date"), kind: field(form, "kind"), startTime: field(form, "startTime"), endTime: field(form, "endTime"),
    note: field(form, "note"),
  }, () => "Exception added", page(form));
}

export async function deleteOverride(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(api(form, `/session-overrides/${field(form, "overrideId")}`), "DELETE", undefined,
    () => "Exception removed", page(form));
}

export async function createAssignment(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(api(form, "/assignments"), "POST", {
    templateId: optional(form, "templateId"),
    title: field(form, "title"),
    instructions: field(form, "instructions"),
    dueLocal: field(form, "dueLocal"),
    points: num(form, "points"),
    published: field(form, "visibility") === "published",
  }, () => "Assignment created", page(form));
}

export async function setAssignmentPublished(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const published = field(form, "published") === "true";
  return platformMutate(api(form, `/assignments/${field(form, "assignmentId")}`), "PATCH", { published },
    () => (published ? "Assignment published" : "Assignment hidden"), page(form));
}

export async function deleteAssignment(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(api(form, `/assignments/${field(form, "assignmentId")}`), "DELETE", undefined,
    () => "Assignment deleted", page(form));
}

export async function postAnnouncement(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(api(form, "/announcements"), "POST", {
    body: field(form, "body"), pinned: field(form, "pinned") === "yes",
  }, () => "Announcement posted", page(form));
}

export async function deleteAnnouncement(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(api(form, `/announcements/${field(form, "announcementId")}`), "DELETE", undefined,
    () => "Announcement deleted", page(form));
}
