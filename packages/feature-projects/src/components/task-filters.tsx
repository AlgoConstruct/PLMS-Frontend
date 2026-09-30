"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@pathwayiq/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@pathwayiq/ui/components/select";
import type { Person } from "../lib/types";
import { PRIORITIES, priorityLabel } from "../lib/status";

/** Filters live in the URL so a filtered board can be shared and survives reloads. */
export function TaskFilters({ members, milestones = [], showAssignee = true }: {
  members: Person[]; milestones?: { id: string; title: string }[]; showAssignee?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete("task");
    router.replace(`${pathname}?${next}`);
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showAssignee && (
        <Select value={params.get("assignee") ?? "all"} onValueChange={(v) => set("assignee", v === "all" ? null : v)}>
          <SelectTrigger className="w-44" aria-label="Assignee"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Everyone</SelectItem>
            <SelectItem value="me">Me</SelectItem>
            {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
      <Select value={params.get("priority") ?? "all"} onValueChange={(v) => set("priority", v === "all" ? null : v)}>
        <SelectTrigger className="w-36" aria-label="Priority"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any priority</SelectItem>
          {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{priorityLabel(p)}</SelectItem>)}
        </SelectContent>
      </Select>
      {milestones.length > 0 && (
        <Select value={params.get("milestoneId") ?? "all"} onValueChange={(v) => set("milestoneId", v === "all" ? null : v)}>
          <SelectTrigger className="w-44" aria-label="Milestone"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any milestone</SelectItem>
            {milestones.map((m) => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
      <form onSubmit={(e) => { e.preventDefault(); set("q", q.trim() || null); }}>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks" aria-label="Search tasks" className="w-56" />
      </form>
    </div>
  );
}
