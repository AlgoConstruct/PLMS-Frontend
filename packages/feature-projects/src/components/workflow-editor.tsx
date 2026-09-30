"use client";

import { startTransition, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@pathwayiq/ui/components/button";
import { Input } from "@pathwayiq/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@pathwayiq/ui/components/select";
import type { WorkflowStatus } from "@pathwayiq/api/platform-types";
import { runAction } from "../lib/run-action";
import { saveWorkflow } from "../pages/_actions";

type Row = { key: string; id?: string; name: string; category: string };
const CATEGORIES = [["TODO", "To do"], ["IN_PROGRESS", "In progress"], ["DONE", "Done"]] as const;

/** Edits the whole workflow; removed statuses that still hold tasks need a destination. */
export function WorkflowEditor({ projectId, statuses, taskCounts }: {
  projectId: string; statuses: WorkflowStatus[]; taskCounts: Record<string, number>;
}) {
  const [rows, setRows] = useState<Row[]>(statuses.map((s) => ({ key: s.id, id: s.id, name: s.name, category: s.category })));
  const [remap, setRemap] = useState<Record<string, string>>({});
  const kept = rows.filter((r) => r.id);
  const removed = statuses.filter((s) => !rows.some((r) => r.id === s.id) && (taskCounts[s.id] ?? 0) > 0);
  const update = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const swap = (i: number, j: number) => setRows((rs) => {
    if (j < 0 || j >= rs.length) return rs;
    const next = [...rs];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });
  const save = () => startTransition(async () => {
    const body = { statuses: rows.map(({ id, name, category }) => ({ id, name, category })), remap };
    const result = await runAction(saveWorkflow, { projectId, workflow: JSON.stringify(body) });
    if (result.ok) toast.success(result.message);
  });
  return (
    <div className="grid gap-3">
      {rows.map((r, i) => (
        <div key={r.key} className="flex flex-wrap items-center gap-2" data-status-row={r.name}>
          <Input value={r.name} onChange={(e) => update(i, { name: e.target.value })} aria-label="Status name" className="w-48" maxLength={50} />
          <Select value={r.category} onValueChange={(v) => update(i, { category: v })}>
            <SelectTrigger className="w-36" aria-label="Category"><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
          </Select>
          <Button type="button" size="icon" variant="ghost" aria-label="Move up" onClick={() => swap(i, i - 1)}><ArrowUp /></Button>
          <Button type="button" size="icon" variant="ghost" aria-label="Move down" onClick={() => swap(i, i + 1)}><ArrowDown /></Button>
          <Button type="button" size="icon" variant="ghost" aria-label={`Remove ${r.name}`}
                  onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}><Trash2 /></Button>
          {r.id && taskCounts[r.id] ? <span className="text-xs text-muted-foreground">{taskCounts[r.id]} tasks</span> : null}
        </div>
      ))}
      {removed.map((s) => (
        <div key={s.id} className="flex flex-wrap items-center gap-2 text-sm">
          <span>Move the {taskCounts[s.id]} tasks in <strong>{s.name}</strong> to</span>
          <Select value={remap[s.id] ?? ""} onValueChange={(v) => setRemap((m) => ({ ...m, [s.id]: v }))}>
            <SelectTrigger className="w-44" aria-label={`Destination for ${s.name}`}><SelectValue placeholder="Choose a status" /></SelectTrigger>
            <SelectContent>{kept.map((k) => <SelectItem key={k.id} value={k.id!}>{k.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      ))}
      <div className="flex gap-2">
        <Button type="button" variant="outline"
                onClick={() => setRows((rs) => [...rs, { key: crypto.randomUUID(), name: "New status", category: "IN_PROGRESS" }])}>
          <Plus /> Add status
        </Button>
        <Button type="button" onClick={save}>Save workflow</Button>
      </div>
    </div>
  );
}
