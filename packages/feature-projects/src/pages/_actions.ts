"use server";

import type { ActionState } from "@pathwayiq/ui/lib/action-state";
import { failure } from "@pathwayiq/ui/lib/action-state";
import { field } from "@pathwayiq/api/mutate";
import { platformApi, platformMutate } from "@pathwayiq/api/platform";
import type { Review } from "@pathwayiq/api/platform-types";

const page = (id: string | null) => [`/app/c/project/${id}`];
const num = (form: FormData, name: string) => {
  const v = field(form, name);
  return v === null ? null : Number(v);
};
const optional = (form: FormData, name: string) => {
  const v = field(form, name);
  return v === null || v === "none" ? null : v;
};

export async function createProject(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate<{ id: string; title: string }>("/api/v1/projects", "POST", {
    title: field(form, "title"),
    key: field(form, "key")?.toUpperCase() ?? null,
    summary: field(form, "summary"),
    nodeId: optional(form, "nodeId"),
    visibility: field(form, "visibility") ?? "PRIVATE",
    startsOn: field(form, "startsOn"),
    dueOn: field(form, "dueOn"),
  }, (p) => ({ message: `${p.title} created`, redirectTo: `/app/c/project/${p.id}` }), ["/app/projects"]);
}

export async function changeProjectStatus(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const id = field(form, "projectId");
  return platformMutate(`/api/v1/projects/${id}/status`, "POST", { status: field(form, "status") },
    () => "Project status updated", [...page(id), "/app/projects"]);
}

export async function updateProject(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const id = field(form, "projectId");
  return platformMutate(`/api/v1/projects/${id}`, "PATCH", {
    title: field(form, "title"), summary: field(form, "summary") ?? "", visibility: field(form, "visibility"),
    startsOn: field(form, "startsOn"), dueOn: field(form, "dueOn"),
  }, () => "Project updated", page(id));
}

export async function toggleObjective(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/objectives/${field(form, "objectiveId")}`, "PATCH", { done: field(form, "done") === "true" },
    () => "Objective updated", page(field(form, "projectId")));
}

/** One objective per line; lines that match an existing objective keep its done flag. */
export async function saveObjectives(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const id = field(form, "projectId");
  const done = new Set(JSON.parse(field(form, "doneTexts") ?? "[]") as string[]);
  const items = (field(form, "objectives") ?? "").split("\n").map((t) => t.trim()).filter(Boolean)
    .map((text) => ({ text, done: done.has(text) }));
  return platformMutate(`/api/v1/projects/${id}/objectives`, "PUT", { items }, () => "Objectives saved", page(id));
}

export async function createTask(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const id = field(form, "projectId");
  return platformMutate(`/api/v1/projects/${id}/tasks`, "POST", {
    title: field(form, "title"), statusId: optional(form, "statusId"), priority: field(form, "priority") ?? "MEDIUM",
    milestoneId: optional(form, "milestoneId"),
  }, () => "Task added", page(id));
}

export async function updateTask(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const assignees = form.getAll("assigneeIds").filter((v): v is string => typeof v === "string");
  const dueOn = field(form, "dueOn");
  const estimate = num(form, "estimatePoints");
  return platformMutate(`/api/v1/tasks/${field(form, "taskId")}`, "PATCH", {
    title: field(form, "title"),
    description: field(form, "description") ?? "",
    statusId: field(form, "statusId"),
    priority: field(form, "priority"),
    ...(form.has("assigneesShown") ? { assigneeIds: assignees } : {}),
    dueOn, clearDueOn: dueOn === null,
    estimatePoints: estimate, clearEstimate: estimate === null,
    ...(form.has("milestoneId") ? { milestoneId: optional(form, "milestoneId"), clearMilestone: field(form, "milestoneId") === "none" } : {}),
  }, () => "Task saved", page(field(form, "projectId")));
}

export async function deleteTask(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/tasks/${field(form, "taskId")}`, "DELETE", undefined, () => "Task deleted",
    page(field(form, "projectId")));
}

export async function addChecklistItem(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/tasks/${field(form, "taskId")}/checklist`, "POST", { text: field(form, "text") },
    () => "Checklist item added", page(field(form, "projectId")));
}

export async function toggleChecklistItem(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/checklist-items/${field(form, "itemId")}`, "PATCH", { done: field(form, "done") === "true" },
    () => "Checklist updated", page(field(form, "projectId")));
}

export async function deleteChecklistItem(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/checklist-items/${field(form, "itemId")}`, "DELETE", undefined,
    () => "Checklist item removed", page(field(form, "projectId")));
}

/** Called directly by the board after an optimistic move; a failure makes the board put the card back. */
export async function moveTask(projectId: string, taskId: string, statusId: string, beforeTaskId: string | null): Promise<ActionState> {
  return platformMutate(`/api/v1/tasks/${taskId}/move`, "POST", { statusId, beforeTaskId }, () => "Task moved", page(projectId));
}

export async function saveWorkflow(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const id = field(form, "projectId");
  const body = field(form, "workflow");
  if (!body) return failure("Nothing to save");
  return platformMutate(`/api/v1/projects/${id}/workflow`, "PUT", JSON.parse(body), () => "Workflow saved", page(id));
}

export async function startProjects(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const classroomId = field(form, "classroomId");
  const teams = JSON.parse(field(form, "teams") ?? "[]") as string[][];
  return platformMutate<unknown[]>(`/api/v1/classrooms/${classroomId}/projects/from-template`, "POST", {
    templateId: field(form, "templateId"),
    startsOn: field(form, "startsOn"),
    teams: teams.filter((t) => t.length > 0).map((memberIds) => ({ memberIds })),
  }, (created) => `${created.length} project${created.length === 1 ? "" : "s"} started`,
  [`/app/c/classroom/${classroomId}/projects`]);
}

export async function createMilestone(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const id = field(form, "projectId");
  return platformMutate(`/api/v1/projects/${id}/milestones`, "POST", { title: field(form, "title"), dueOn: field(form, "dueOn") },
    () => "Milestone added", page(id));
}

export async function updateMilestone(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/milestones/${field(form, "milestoneId")}`, "PATCH", {
    title: field(form, "title"), dueOn: field(form, "dueOn"), status: field(form, "status"),
  }, () => "Milestone saved", page(field(form, "projectId")));
}

export async function deleteMilestone(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/milestones/${field(form, "milestoneId")}`, "DELETE", undefined, () => "Milestone removed",
    page(field(form, "projectId")));
}

export async function createDeliverable(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const id = field(form, "projectId");
  return platformMutate(`/api/v1/projects/${id}/deliverables`, "POST", {
    title: field(form, "title"), description: field(form, "description"), milestoneId: optional(form, "milestoneId"),
    dueOn: field(form, "dueOn"), maxScore: num(form, "maxScore"),
  }, () => "Deliverable added", page(id));
}

export async function deleteDeliverable(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/deliverables/${field(form, "deliverableId")}`, "DELETE", undefined,
    () => "Deliverable removed", page(field(form, "projectId")));
}

export async function submitDeliverable(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return platformMutate(`/api/v1/deliverables/${field(form, "deliverableId")}/submit`, "POST", { note: field(form, "note") },
    () => "Submitted for review", page(field(form, "projectId")));
}

export async function reviewDeliverable(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const decision = field(form, "decision") ?? "NONE";
  return platformMutate(`/api/v1/deliverables/${field(form, "deliverableId")}/review`, "POST", {
    decision, score: decision === "ACCEPT" ? num(form, "score") : null, body: field(form, "body") ?? "",
  }, () => (decision === "ACCEPT" ? "Deliverable accepted" : decision === "CHANGES" ? "Changes requested" : "Feedback sent"),
  page(field(form, "projectId")));
}

export async function completeProject(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const id = field(form, "projectId");
  return platformMutate(`/api/v1/projects/${id}/status`, "POST", {
    status: "COMPLETED", finalScore: num(form, "finalScore"), comment: field(form, "comment"),
  }, () => "Project completed", [...page(id), "/app/projects"]);
}

export async function publishShowcase(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const id = field(form, "projectId");
  return platformMutate(`/api/v1/projects/${id}/showcase`, "POST", { showTeam: field(form, "showTeam") === "on" },
    () => "Published to the showcase", page(id));
}

export async function unpublishShowcase(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const id = field(form, "projectId");
  return platformMutate(`/api/v1/projects/${id}/showcase`, "DELETE", undefined, () => "Removed from the showcase", page(id));
}

/** Review history of a deliverable, for client components (newest first). */
export async function listReviews(deliverableId: string): Promise<Review[]> {
  const result = await platformApi<Review[]>(`/api/v1/deliverables/${deliverableId}/reviews`);
  return result.ok ? result.data : [];
}
