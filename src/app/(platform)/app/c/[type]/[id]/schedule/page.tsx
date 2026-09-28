import { notFound } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { addOverride, addSession, deleteOverride, deleteSession } from "@/app/(platform)/app/_classroom-actions";
import { Can } from "@/components/capabilities";
import { ConfirmAction } from "@/components/confirm-action";
import { FormDialog } from "@/components/form-dialog";
import { EmptyState, Forbidden, FormField, PageHeader } from "@/components/iam";
import { SelectField } from "@/components/select-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { platformApi } from "@/lib/platform";
import type { ClassSession, Occurrence, SessionOverride } from "@/lib/platform-types";

const WEEKDAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const isoDate = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);
const hm = (t: string | null) => (t ? t.slice(0, 5) : "");

export default async function SchedulePage({ params }: PageProps<"/app/c/[type]/[id]/schedule">) {
  const { type, id } = await params;
  if (type !== "classroom") notFound();
  const [sessions, overrides, upcoming] = await Promise.all([
    platformApi<ClassSession[]>(`/api/v1/classrooms/${id}/sessions`),
    platformApi<SessionOverride[]>(`/api/v1/classrooms/${id}/session-overrides`),
    platformApi<Occurrence[]>(`/api/v1/classrooms/${id}/schedule?from=${isoDate(0)}&to=${isoDate(28)}`),
  ]);
  if (!sessions.ok) return <Forbidden what="this schedule" />;
  const classroomId = <input type="hidden" name="classroomId" value={id} />;
  return (
    <>
      <PageHeader title="Schedule" actions={
        <Can code="classroom.update">
          <FormDialog trigger={<Button><Plus /> Weekly session</Button>} title="Add a weekly session" action={addSession} submitLabel="Add">
            {classroomId}
            <FormField label="Day" htmlFor="s-day">
              <SelectField id="s-day" name="weekday" defaultValue="1" options={WEEKDAYS.slice(1).map((d, i) => ({ value: String(i + 1), label: d }))} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Starts" htmlFor="s-start"><Input id="s-start" name="startTime" type="time" required /></FormField>
              <FormField label="Ends" htmlFor="s-end"><Input id="s-end" name="endTime" type="time" required /></FormField>
            </div>
            <FormField label="Location" htmlFor="s-loc"><Input id="s-loc" name="location" /></FormField>
          </FormDialog>
          <FormDialog trigger={<Button variant="outline"><Plus /> Exception</Button>} title="Add an exception" action={addOverride} submitLabel="Add"
                      description="Cancel every session on a date, or add an extra meeting.">
            {classroomId}
            <FormField label="Date" htmlFor="o-date"><Input id="o-date" name="date" type="date" required /></FormField>
            <FormField label="Kind" htmlFor="o-kind">
              <SelectField id="o-kind" name="kind" defaultValue="CANCELLED"
                           options={[{ value: "CANCELLED", label: "Cancelled" }, { value: "EXTRA", label: "Extra meeting" }]} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Starts" htmlFor="o-start"><Input id="o-start" name="startTime" type="time" /></FormField>
              <FormField label="Ends" htmlFor="o-end"><Input id="o-end" name="endTime" type="time" /></FormField>
            </div>
            <FormField label="Note" htmlFor="o-note"><Input id="o-note" name="note" /></FormField>
          </FormDialog>
        </Can>
      } />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Weekly sessions</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {sessions.data.length === 0 ? <EmptyState>No weekly sessions.</EmptyState> : sessions.data.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border p-2">
                <span>{WEEKDAYS[s.weekday]} {hm(s.startTime)}–{hm(s.endTime)} {s.location && <span className="text-muted-foreground">· {s.location}</span>}</span>
                <Can code="classroom.update">
                  <ConfirmAction trigger={<Button size="sm" variant="ghost" className="text-destructive" aria-label="Remove session"><Trash2 /></Button>}
                                 title="Remove this session?" action={deleteSession} fields={{ classroomId: id, sessionId: s.id }} confirmLabel="Remove" />
                </Can>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Exceptions</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {!overrides.ok || overrides.data.length === 0 ? <EmptyState>No exceptions.</EmptyState> : overrides.data.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border p-2">
                <span>
                  {o.date} <Badge variant="outline">{o.kind === "EXTRA" ? "extra" : "cancelled"}</Badge>
                  {o.kind === "EXTRA" && ` ${hm(o.startTime)}–${hm(o.endTime)}`} {o.note && <span className="text-muted-foreground">· {o.note}</span>}
                </span>
                <Can code="classroom.update">
                  <ConfirmAction trigger={<Button size="sm" variant="ghost" className="text-destructive" aria-label="Remove exception"><Trash2 /></Button>}
                                 title="Remove this exception?" action={deleteOverride} fields={{ classroomId: id, overrideId: o.id }} confirmLabel="Remove" />
                </Can>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Next four weeks</CardTitle></CardHeader>
        <CardContent className="grid gap-1 text-sm">
          {!upcoming.ok || upcoming.data.length === 0 ? <EmptyState>No meetings in the next four weeks.</EmptyState> : upcoming.data.map((o) => (
            <div key={`${o.date}-${o.startTime}`}>
              {o.date} · {hm(o.startTime)}–{hm(o.endTime)} {o.location ?? ""} {o.kind === "EXTRA" && <Badge variant="outline">extra</Badge>}
              {o.note && <span className="text-muted-foreground"> · {o.note}</span>}
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
