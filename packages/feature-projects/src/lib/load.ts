import "server-only";

import { getVisibleUsers } from "@pathwayiq/api/data";
import { platformApi } from "@pathwayiq/api/platform";
import type { Member, Project, ProjectTask, WorkflowStatus } from "@pathwayiq/api/platform-types";

export type Person = { id: string; name: string };
export interface TaskFilters { assignee?: string; priority?: string; q?: string }

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
  const [project, statuses, tasks, members, users] = await Promise.all([
    loadProject(id),
    platformApi<WorkflowStatus[]>(`/api/v1/projects/${id}/workflow`),
    platformApi<ProjectTask[]>(`/api/v1/projects/${id}/tasks?${query}`),
    platformApi<Member[]>(`/api/v1/contexts/project/${id}/members`),
    getVisibleUsers(),
  ]);
  const names = new Map(users.map((u) => [u.id, u.displayName]));
  const people: Person[] = (members.ok ? members.data : [])
    .filter((m, i, all) => all.findIndex((o) => o.userId === m.userId) === i)
    .map((m) => ({ id: m.userId, name: names.get(m.userId) ?? m.userId.slice(0, 8) }));
  return {
    project,
    statuses: statuses.ok ? statuses.data : [],
    tasks: tasks.ok ? tasks.data : [],
    members: people,
  };
}
