import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { platformApi } from "@pathwayiq/api/platform";
import type { Course } from "@pathwayiq/api/platform-types";

export async function CoursesCard() {
  const result = await platformApi<Course[]>("/api/v1/courses");
  const count = result.ok ? result.data.length : 0;
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Courses</CardTitle></CardHeader>
      <CardContent className="grid gap-1 text-sm">
        <span className="text-3xl font-semibold">{count}</span>
        <span className="text-muted-foreground">in your scope</span>
        <Link href="/app/courses" className="text-primary hover:underline">Open courses</Link>
      </CardContent>
    </Card>
  );
}
