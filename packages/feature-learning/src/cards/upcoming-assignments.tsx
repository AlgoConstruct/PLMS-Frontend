import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { platformApi } from "@pathwayiq/api/platform";
import type { Assignment, Classroom } from "@pathwayiq/api/platform-types";

const nowMs = () => Date.now();

/** Published assignments due from now on, across the caller's first ten classrooms. */
export async function UpcomingAssignmentsCard() {
  const mine = await platformApi<Classroom[]>("/api/v1/classrooms");
  const classrooms = mine.ok ? mine.data.slice(0, 10) : [];
  const lists = await Promise.all(classrooms.map(async (c) => {
    const r = await platformApi<Assignment[]>(`/api/v1/classrooms/${c.id}/assignments`);
    return r.ok ? r.data.map((a) => ({ ...a, classroom: c })) : [];
  }));
  const now = nowMs();
  const upcoming = lists.flat()
    .filter((a) => a.published && a.dueAt && Date.parse(a.dueAt) >= now)
    .sort((a, b) => Date.parse(a.dueAt ?? "") - Date.parse(b.dueAt ?? ""))
    .slice(0, 5);
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Upcoming assignments</CardTitle></CardHeader>
      <CardContent className="grid gap-2 text-sm">
        {upcoming.length === 0 && <p className="text-muted-foreground">Nothing due.</p>}
        {upcoming.map((a) => (
          <Link key={a.id} href={`/app/c/classroom/${a.classroom.id}/assignments`} className="rounded-md border px-3 py-2 hover:bg-muted">
            <div className="font-medium">{a.title}</div>
            <div className="text-xs text-muted-foreground">
              {a.classroom.title} · due {new Date(a.dueAt ?? "").toLocaleString("en-US", { timeZone: a.classroom.timezone, dateStyle: "medium", timeStyle: "short" })}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
