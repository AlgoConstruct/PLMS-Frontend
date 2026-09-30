"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@pathwayiq/ui/components/button";
import { Input } from "@pathwayiq/ui/components/input";

type MilestoneRow = { key: string; title: string; dueDays: string };
type DeliverableRow = { title: string; description: string; milestoneKey: string; dueDays: string; maxScore: string };

const num = (v: string) => (v.trim() === "" ? null : Number(v));

/** Milestones and deliverables of a project template; sent as JSON in hidden inputs. */
export function TemplatePlanFields() {
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [deliverables, setDeliverables] = useState<DeliverableRow[]>([]);
  const [next, setNext] = useState(1);
  const setM = (i: number, patch: Partial<MilestoneRow>) => setMilestones((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const setD = (i: number, patch: Partial<DeliverableRow>) => setDeliverables((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const json = {
    milestones: milestones.filter((m) => m.title.trim()).map((m) => ({ key: m.key, title: m.title.trim(), dueDays: num(m.dueDays) })),
    deliverables: deliverables.filter((d) => d.title.trim()).map((d) => ({
      title: d.title.trim(), description: d.description.trim() || null, milestoneKey: d.milestoneKey || null,
      dueDays: num(d.dueDays), maxScore: num(d.maxScore),
    })),
  };
  return (
    <div className="grid gap-4">
      <input type="hidden" name="milestones" value={JSON.stringify(json.milestones)} />
      <input type="hidden" name="deliverables" value={JSON.stringify(json.deliverables)} />
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Milestones</legend>
        {milestones.map((m, i) => (
          <div key={m.key} className="flex gap-2">
            <Input aria-label="Milestone title" placeholder="Title" value={m.title} onChange={(e) => setM(i, { title: e.target.value })} />
            <Input aria-label="Milestone due after days" placeholder="Due after (days)" type="number" min={0} className="w-40"
                   value={m.dueDays} onChange={(e) => setM(i, { dueDays: e.target.value })} />
            <Button type="button" size="icon" variant="ghost" aria-label="Remove milestone"
                    onClick={() => setMilestones((rows) => rows.filter((_, j) => j !== i))}><Trash2 /></Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="w-fit"
                onClick={() => { setMilestones((rows) => [...rows, { key: `m${next}`, title: "", dueDays: "" }]); setNext((n) => n + 1); }}>
          <Plus /> Milestone
        </Button>
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Deliverables</legend>
        {deliverables.map((d, i) => (
          <div key={i} className="grid gap-2 rounded-md border p-2 sm:grid-cols-[1fr_10rem_7rem_7rem_auto]">
            <Input aria-label="Deliverable title" placeholder="Title" value={d.title} onChange={(e) => setD(i, { title: e.target.value })} />
            <select aria-label="Deliverable milestone" className="h-9 rounded-md border bg-transparent px-2 text-sm"
                    value={d.milestoneKey} onChange={(e) => setD(i, { milestoneKey: e.target.value })}>
              <option value="">No milestone</option>
              {milestones.filter((m) => m.title.trim()).map((m) => <option key={m.key} value={m.key}>{m.title}</option>)}
            </select>
            <Input aria-label="Deliverable due after days" placeholder="Due (days)" type="number" min={0}
                   value={d.dueDays} onChange={(e) => setD(i, { dueDays: e.target.value })} />
            <Input aria-label="Deliverable max score" placeholder="Max score" type="number" min={1}
                   value={d.maxScore} onChange={(e) => setD(i, { maxScore: e.target.value })} />
            <Button type="button" size="icon" variant="ghost" aria-label="Remove deliverable"
                    onClick={() => setDeliverables((rows) => rows.filter((_, j) => j !== i))}><Trash2 /></Button>
            <Input aria-label="Deliverable description" placeholder="Description (optional)" className="sm:col-span-5"
                   value={d.description} onChange={(e) => setD(i, { description: e.target.value })} />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="w-fit"
                onClick={() => setDeliverables((rows) => [...rows, { title: "", description: "", milestoneKey: "", dueDays: "", maxScore: "" }])}>
          <Plus /> Deliverable
        </Button>
      </fieldset>
    </div>
  );
}
