import Link from "next/link";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { platformApi } from "@pathwayiq/api/platform";
import type { Classroom } from "@pathwayiq/api/platform-types";

export async function MyClassroomsCard() {
  const result = await platformApi<Classroom[]>("/api/v1/classrooms");
  const items = result.ok ? result.data.slice(0, 5) : [];
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>My classrooms</CardTitle></CardHeader>
      <CardContent className="grid gap-2 text-sm">
        {items.length === 0 && <p className="text-muted-foreground">You are not in any classroom yet.</p>}
        {items.map((c) => (
          <Link key={c.id} href={`/app/c/classroom/${c.id}`} className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted">
            <span>{c.title}</span>
            <Badge variant="outline">{c.status.toLowerCase()}</Badge>
          </Link>
        ))}
        <Link href="/app/classrooms" className="text-primary hover:underline">All classrooms</Link>
      </CardContent>
    </Card>
  );
}
