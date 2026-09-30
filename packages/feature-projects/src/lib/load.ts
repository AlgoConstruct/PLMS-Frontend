import "server-only";

import { getVisibleUsers } from "@pathwayiq/api/data";
import { platformApi } from "@pathwayiq/api/platform";
import type { Member, Milestone, Project, ProjectTask, WorkflowStatus } from "@pathwayiq/api/platform-types";

import type { Person, TaskFilters } from "./types";

export type { Person, TaskFilters } from "./types";

type Search = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (typeof v === "string" && v !== "" ? v : undefined);

export function filtersFrom(sp: Search): TaskFilters {
  return { assignee: str(sp.assignee), priority: str(sp.priority), q: str(sp.q), milestoneId: str(sp.milestoneId) };
}

export async function loadProject(id: string) {
  const result = await platformApi<Project>(`/api/v1/projects/${id}`);
  return result.ok ? result.data : null;
}

/** Everything the board and list views need, in one round of parallel calls. */
export async function loadWorkspaceData(id: string, filters: TaskFilters) {
  const query = new URLSearchParams();
  if (filters.assignee) query.set("assignee", filters.assignee);
  if (filters.priority) query.set("priority", filters.priority);
  if (filters.q) query.set("q", filters.q);
  if (filters.milestoneId) query.set("milestoneId", filters.milestoneId);
  const [project, statuses, tasks, members, users, milestones] = await Promise.all([
    loadProject(id),
    platformApi<WorkflowStatus[]>(`/api/v1/projects/${id}/workflow`),
    platformApi<ProjectTask[]>(`/api/v1/projects/${id}/tasks?${query}`),
    platformApi<Member[]>(`/api/v1/contexts/project/${id}/members`),
    getVisibleUsers(),
    platformApi<Milestone[]>(`/api/v1/projects/${id}/milestones`),
  ]);
  const names = new Map(users.map((u) => [u.id, u.displayName]));
  const people: Person[] = (members.ok ? members.data : [])
    .filter((m, i, all) => all.findIndex((o) => o.userId === m.userId) === i)
    .map((m) => ({ id: m.userId, name: names.get(m.userId) ?? m.userId.slice(0, 8) }));
  return {
    project,
    statuses: statuses.ok ? statuses.data : [],
    tasks: tasks.ok ? tasks.data : [],
    milestones: milestones.ok ? milestones.data : [],
    members: people,
    // members first, then every other visible user (supervisors comment through inheritance)
    people: [...people, ...users.filter((u) => !people.some((p) => p.id === u.id)).map((u) => ({ id: u.id, name: u.displayName }))],
  };
}
