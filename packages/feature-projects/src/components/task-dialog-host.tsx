"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProjectTask, WorkflowStatus } from "@pathwayiq/api/platform-types";
import type { Person } from "../lib/types";
import { TaskDialog } from "./task-dialog";

/** Opens the dialog for ?task=<number>; closing removes the parameter. */
export function TaskDialogHost({ projectId, tasks, statuses, members, people, editable }: {
  projectId: string; tasks: ProjectTask[]; statuses: WorkflowStatus[]; members: Person[]; people: Person[]; editable: boolean;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const task = tasks.find((t) => String(t.number) === params.get("task"));
  if (!task) return null;
  const close = () => {
    const next = new URLSearchParams(params);
    next.delete("task");
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  };
  return <TaskDialog key={task.id + task.checklist.length} projectId={projectId} task={task} statuses={statuses}
                     members={members} people={people} editable={editable} onClose={close} />;
}
