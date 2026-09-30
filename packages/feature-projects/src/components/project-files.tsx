"use client";

import { useMemo } from "react";
import { Files } from "@pathwayiq/collaboration/files";
import type { Person } from "@pathwayiq/collaboration/types";

/** All files of the project; uploads here attach to the project itself. Task files show their task. */
export function ProjectFiles({ projectId, people, taskKeys }: { projectId: string; people: Person[]; taskKeys: Record<string, string> }) {
  const ctx = useMemo(() => ({ backend: "platform", type: "project", id: projectId }), [projectId]);
  return <Files ctx={ctx} people={people} labelOf={(f) => (f.targetType === "task" && f.targetId ? taskKeys[f.targetId] ?? "task" : null)} />;
}
