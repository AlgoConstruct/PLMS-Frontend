import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { platformApi } from "@pathwayiq/api/platform";
import type { Project } from "@pathwayiq/api/platform-types";
import { ProgressBar } from "../components/progress-bar";

export async function MyProjectsCard() {
  const result = await platformApi<Project[]>("/api/v1/projects?status=ACTIVE");
  const items = result.ok ? result.data.slice(0, 5) : [];
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>My projects</CardTitle></CardHeader>
      <CardContent className="grid gap-3 text-sm">
        {items.length === 0 && <p className="text-muted-foreground">No active projects.</p>}
        {items.map((p) => (
          <Link key={p.id} href={`/app/c/project/${p.id}`} className="grid gap-1 rounded-md border px-3 py-2 hover:bg-muted">
            <span className="font-medium">{p.title}</span>
            <ProgressBar done={p.tasksDone} total={p.tasksTotal} />
          </Link>
        ))}
        <Link href="/app/projects" className="text-primary hover:underline">All projects</Link>
      </CardContent>
    </Card>
  );
}
