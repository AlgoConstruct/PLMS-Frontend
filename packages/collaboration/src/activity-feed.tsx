"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@pathwayiq/ui/components/button";
import { listActivity } from "./actions";
import { activitySentence } from "./activity-text";
import type { ActivityView, CollabContext, Person, Target } from "./types";

export function ActivityFeed({ ctx, target, people, limit = 20 }: {
  ctx: CollabContext; target?: Target; people: Person[]; limit?: number;
}) {
  const [items, setItems] = useState<ActivityView[] | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const names = new Map(people.map((p) => [p.id, p.name]));
  const nameOf = (id: string | null) => (id ? names.get(id) ?? "Someone" : "System");
  useEffect(() => {
    let alive = true;
    listActivity(ctx, target, undefined, limit).then((r) => {
      if (!alive) return;
      if (!r.ok) { toast.error(r.message); return; }
      setItems(r.data.items);
      setNext(r.data.next);
    });
    return () => { alive = false; };
  }, [ctx, target, limit]);

  const loadMore = async (before: string) => {
    const r = await listActivity(ctx, target, before, limit);
    if (!r.ok) { toast.error(r.message); return; }
    setItems((old) => [...(old ?? []), ...r.data.items]);
    setNext(r.data.next);
  };

  if (items === null) return <p className="text-sm text-muted-foreground">Loading activity…</p>;
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  return (
    <div className="grid gap-2">
      <ol className="grid gap-2">
        {items.map((a) => (
          <li key={a.id} className="flex items-baseline justify-between gap-3 text-sm" data-activity={a.verb}>
            <span>{activitySentence(a, nameOf)}</span>
            <time className="shrink-0 text-xs text-muted-foreground" dateTime={a.occurredAt}>{new Date(a.occurredAt).toLocaleString()}</time>
          </li>
        ))}
      </ol>
      {next && <Button variant="ghost" size="sm" className="w-fit" onClick={() => void loadMore(next)}>Load more</Button>}
    </div>
  );
}
