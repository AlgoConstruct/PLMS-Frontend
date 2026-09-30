"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, ListChecks, MessageSquare, Paperclip } from "lucide-react";
import { Badge } from "@pathwayiq/ui/components/badge";
import type { ProjectTask } from "@pathwayiq/api/platform-types";
import type { Person } from "../lib/types";
import { priorityLabel } from "../lib/status";
import { Avatars } from "./avatars";

export function useTaskHref() {
  const pathname = usePathname();
  const params = useSearchParams();
  return (number: number) => {
    const next = new URLSearchParams(params);
    next.set("task", String(number));
    return `${pathname}?${next}`;
  };
}

export function TaskCard({ task, members, draggable }: { task: ProjectTask; members: Person[]; draggable: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, disabled: !draggable });
  const href = useTaskHref();
  const done = task.checklist.filter((c) => c.done).length;
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes} {...listeners}
         data-task-key={task.key}
         className={`rounded-md border bg-card p-2 text-sm shadow-xs ${isDragging ? "opacity-50" : ""} ${draggable ? "cursor-grab" : ""}`}>
      <Link href={href(task.number)} className="grid gap-1" scroll={false}>
        <span className="text-xs text-muted-foreground">{task.key}</span>
        <span className="font-medium">{task.title}</span>
        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {task.priority !== "MEDIUM" && <Badge variant={task.priority === "URGENT" ? "destructive" : "outline"}>{priorityLabel(task.priority)}</Badge>}
          {task.dueOn && <span className="flex items-center gap-1"><CalendarDays className="size-3" />{task.dueOn}</span>}
          {task.checklist.length > 0 && <span className="flex items-center gap-1"><ListChecks className="size-3" />{done}/{task.checklist.length}</span>}
          {task.commentCount > 0 && <span className="flex items-center gap-1" title="Comments"><MessageSquare className="size-3" />{task.commentCount}</span>}
          {task.fileCount > 0 && <span className="flex items-center gap-1" title="Files"><Paperclip className="size-3" />{task.fileCount}</span>}
          <span className="ml-auto"><Avatars ids={task.assigneeIds} people={members} /></span>
        </span>
      </Link>
    </div>
  );
}
