import { CalendarDays } from "lucide-react";
import { changeClassroomStatus } from "../../pages/_classroom-actions";
import { Can } from "@pathwayiq/access/capabilities";
import { ConfirmAction } from "@pathwayiq/ui/blocks/confirm-action";
import { EmptyState, PageHeader } from "@pathwayiq/ui/blocks/page";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { platformApi } from "@pathwayiq/api/platform";
import type { ClassroomDetail, Occurrence } from "@pathwayiq/api/platform-types";
import { CapabilitiesCard } from "./capabilities-card";

const NEXT: Record<string, { status: string; label: string } | undefined> = {
  PLANNED: { status: "ACTIVE", label: "Start classroom" },
  ACTIVE: { status: "COMPLETED", label: "Complete classroom" },
};

const isoDate = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);

export async function ClassroomOverview({ id }: { id: string }) {
  const [detail, schedule] = await Promise.all([
    platformApi<ClassroomDetail>(`/api/v1/classrooms/${id}`),
    platformApi<Occurrence[]>(`/api/v1/classrooms/${id}/schedule?from=${isoDate(0)}&to=${isoDate(14)}`),
  ]);
  if (!detail.ok) return <EmptyState>This classroom is not available to you.</EmptyState>;
  const { classroom: c, courseTitle, courseVersion } = detail.data;
  const next = NEXT[c.status];
  return (
    <>
      <PageHeader
        title={c.title}
        description={[c.code, c.section].filter(Boolean).join(" · ")}
        actions={
          <>
            <Badge variant="outline">{c.status.toLowerCase()}</Badge>
            {next && (
              <Can code="classroom.update">
                <ConfirmAction trigger={<Button size="sm">{next.label}</Button>} title={`${next.label}?`}
                               description="Members see the new status immediately." action={changeClassroomStatus}
                               fields={{ classroomId: c.id, status: next.status }} confirmLabel={next.label} destructive={false} />
              </Can>
            )}
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="grid gap-1 text-sm">
            <div>Course: {courseTitle ? `${courseTitle} (version ${courseVersion})` : "none"}</div>
            <div>Dates: {c.startsOn ?? "not set"} – {c.endsOn ?? "not set"}</div>
            <div>Timezone: {c.timezone}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Next two weeks</CardTitle></CardHeader>
          <CardContent className="grid gap-1 text-sm">
            {schedule.ok && schedule.data.length > 0 ? schedule.data.slice(0, 6).map((o) => (
              <div key={`${o.date}-${o.startTime}`} className="flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" />
                {o.date} {o.startTime.slice(0, 5)}–{o.endTime.slice(0, 5)} {o.location ?? ""}
                {o.kind === "EXTRA" && <Badge variant="outline">extra</Badge>}
              </div>
            )) : <span className="text-muted-foreground">No meetings scheduled.</span>}
          </CardContent>
        </Card>
      </div>
      <CapabilitiesCard type="classroom" id={id} />
    </>
  );
}
