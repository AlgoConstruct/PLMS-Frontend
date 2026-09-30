import Link from "next/link";
import { EmptyState } from "@pathwayiq/ui/blocks/page";
import { Badge } from "@pathwayiq/ui/components/badge";
import type { Project } from "@pathwayiq/api/platform-types";
import { ProgressBar } from "./progress-bar";

export function ProjectList({ items, empty }: { items: Project[]; empty: string }) {
  if (items.length === 0) return <EmptyState>{empty}</EmptyState>;
  return (
    <div className="grid gap-2">
      {items.map((p) => (
        <Link key={p.id} href={`/app/c/project/${p.id}`} className="grid gap-2 rounded-lg border p-3 hover:bg-muted sm:grid-cols-[1fr_200px]">
          <span>
            <span className="font-medium">{p.title}</span>
            <span className="block text-xs text-muted-foreground">{[p.key, p.dueOn && `due ${p.dueOn}`].filter(Boolean).join(" · ")}</span>
          </span>
          <span className="grid gap-1">
            <Badge variant="outline" className="w-fit">{p.status.toLowerCase()}</Badge>
            <ProgressBar done={p.tasksDone} total={p.tasksTotal} />
          </span>
        </Link>
      ))}
    </div>
  );
}
