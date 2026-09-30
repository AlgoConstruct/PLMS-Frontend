import "server-only";

import { getVisibleUsers } from "@pathwayiq/api/data";
import { serviceApi } from "@pathwayiq/api/service";
import type { Person } from "./types";

/**
 * Names for a context's people: its members first, then every other user the caller can see (supervisors who act
 * through inheritance are not members but still write comments and appear in the history).
 */
export async function loadPeople(backend: string, type: string, id: string): Promise<Person[]> {
  const [members, users] = await Promise.all([
    serviceApi<{ userId: string }[]>(backend, `/api/v1/contexts/${type}/${id}/members`),
    getVisibleUsers(),
  ]);
  const names = new Map(users.map((u) => [u.id, u.displayName]));
  const seen = new Set<string>();
  const people: Person[] = [];
  for (const m of members.ok ? members.data : []) {
    if (seen.has(m.userId)) continue;
    seen.add(m.userId);
    people.push({ id: m.userId, name: names.get(m.userId) ?? m.userId.slice(0, 8) });
  }
  users.forEach((u) => { if (!seen.has(u.id)) people.push({ id: u.id, name: u.displayName }); });
  return people;
}
