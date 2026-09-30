"use client";

import { startTransition } from "react";
import { toast } from "sonner";
import { useCan } from "@pathwayiq/access/capabilities";
import { Checkbox } from "@pathwayiq/ui/components/checkbox";
import type { Objective } from "@pathwayiq/api/platform-types";
import type { ServerAction } from "@pathwayiq/ui/lib/action-state";

export function ObjectiveToggle({ projectId, objective, action, editable }: {
  projectId: string; objective: Objective; action: ServerAction; editable: boolean;
}) {
  const can = useCan("project.task.update") && editable;
  const toggle = (done: boolean) => startTransition(async () => {
    const form = new FormData();
    form.set("projectId", projectId);
    form.set("objectiveId", objective.id);
    form.set("done", String(done));
    const result = await action(undefined, form);
    if (!result.ok) toast.error(result.message);
  });
  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={objective.done} disabled={!can} onCheckedChange={(v) => toggle(v === true)} />
      <span className={objective.done ? "text-muted-foreground line-through" : ""}>{objective.text}</span>
    </label>
  );
}
