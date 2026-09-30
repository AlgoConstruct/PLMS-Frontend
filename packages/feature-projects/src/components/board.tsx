"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  closestCorners, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useDroppable, useSensor, useSensors,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useCan } from "@pathwayiq/access/capabilities";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { FormField } from "@pathwayiq/ui/blocks/page";
import { Button } from "@pathwayiq/ui/components/button";
import { Input } from "@pathwayiq/ui/components/input";
import type { ProjectTask, WorkflowStatus } from "@pathwayiq/api/platform-types";
import { applyMove, COLUMN_PREFIX, columns, dropTarget } from "../lib/board";
import type { Person } from "../lib/types";
import { createTask, moveTask } from "../pages/_actions";
import { TaskCard } from "./task-card";

function Column({ status, tasks, members, draggable, projectId, canCreate }: {
  status: WorkflowStatus; tasks: ProjectTask[]; members: Person[]; draggable: boolean; projectId: string; canCreate: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: COLUMN_PREFIX + status.id });
  return (
    <section ref={setNodeRef} data-column={status.name}
             className={`flex min-w-52 flex-1 basis-0 flex-col gap-2 rounded-lg border bg-muted/40 p-2 ${isOver ? "ring-2 ring-primary" : ""}`}>
      <header className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium">{status.name} <span className="text-muted-foreground">{tasks.length}</span></h3>
        {canCreate && (
          <FormDialog trigger={<Button size="icon" variant="ghost" aria-label={`Add task to ${status.name}`}><Plus /></Button>}
                      title={`New task in ${status.name}`} action={createTask} submitLabel="Add">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="statusId" value={status.id} />
            <FormField label="Title" htmlFor={`t-${status.id}`}><Input id={`t-${status.id}`} name="title" required maxLength={200} /></FormField>
          </FormDialog>
        )}
      </header>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-16 flex-col gap-2">
          {tasks.map((t) => <TaskCard key={t.id} task={t} members={members} draggable={draggable} />)}
        </div>
      </SortableContext>
    </section>
  );
}

/** Moves show at once; if the server refuses, the card goes back and the reason appears as a toast. */
export function Board({ projectId, statuses, tasks, members, editable }: {
  projectId: string; statuses: WorkflowStatus[]; tasks: ProjectTask[]; members: Person[]; editable: boolean;
}) {
  const [cols, setCols] = useState(() => columns(statuses.map((s) => s.id), tasks));
  const draggable = useCan("project.task.update") && editable;
  const canCreate = useCan("project.task.create") && editable;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || !draggable) return;
    const target = dropTarget(cols, String(active.id), String(over.id));
    if (!target) return;
    const before = cols;
    setCols(applyMove(cols, String(active.id), target.statusId, target.beforeId));
    // A network failure throws instead of returning a failed ActionState; treat both the same way.
    const result = await moveTask(projectId, String(active.id), target.statusId, target.beforeId)
      .catch(() => ({ ok: false, message: "The move could not be saved" }));
    if (!result.ok) {
      setCols(before);
      toast.error(result.message);
    }
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {statuses.map((s) => (
          <Column key={s.id} status={s} tasks={cols[s.id] ?? []} members={members} draggable={draggable}
                  projectId={projectId} canCreate={canCreate} />
        ))}
      </div>
    </DndContext>
  );
}
