import { notFound } from "next/navigation";
import { Pin, Plus, Trash2 } from "lucide-react";
import { deleteAnnouncement, postAnnouncement } from "../../../../_classroom-actions";
import { Can } from "@pathwayiq/access/capabilities";
import { ConfirmAction } from "@pathwayiq/ui/blocks/confirm-action";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { EmptyState, Forbidden, FormField, PageHeader } from "@pathwayiq/ui/blocks/page";
import { SelectField } from "@pathwayiq/ui/blocks/select-field";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardContent, CardHeader } from "@pathwayiq/ui/components/card";
import { Textarea } from "@pathwayiq/ui/components/textarea";
import { getMe, getVisibleUsers } from "@pathwayiq/api/data";
import { platformApi } from "@pathwayiq/api/platform";
import type { Announcement } from "@pathwayiq/api/platform-types";

export default async function AnnouncementsPage({ params }: PageProps<"/app/c/[type]/[id]/announcements">) {
  const { type, id } = await params;
  if (type !== "classroom") notFound();
  const [me, users, list] = await Promise.all([
    getMe(),
    getVisibleUsers(),
    platformApi<Announcement[]>(`/api/v1/classrooms/${id}/announcements`),
  ]);
  if (!list.ok) return <Forbidden what="these announcements" />;
  const names = new Map(users.map((u) => [u.id, u.displayName]));
  const remove = (a: Announcement) => (
    <ConfirmAction trigger={<Button size="sm" variant="ghost" className="text-destructive" aria-label="Delete announcement"><Trash2 /></Button>}
                   title="Delete this announcement?" action={deleteAnnouncement} fields={{ classroomId: id, announcementId: a.id }} confirmLabel="Delete" />
  );
  return (
    <>
      <PageHeader title="Announcements" actions={
        <Can code="classroom.announcement.create">
          <FormDialog trigger={<Button><Plus /> Post</Button>} title="New announcement" action={postAnnouncement} submitLabel="Post">
            <input type="hidden" name="classroomId" value={id} />
            <FormField label="Message" htmlFor="n-body"><Textarea id="n-body" name="body" rows={5} required /></FormField>
            <FormField label="Pin" htmlFor="n-pin">
              <SelectField id="n-pin" name="pinned" defaultValue="no" options={[{ value: "no", label: "Not pinned" }, { value: "yes", label: "Pinned to the top" }]} />
            </FormField>
          </FormDialog>
        </Can>
      } />
      {list.data.length === 0 ? <EmptyState>No announcements yet.</EmptyState> : (
        <div className="grid gap-3">
          {list.data.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  {a.pinned && <Pin className="size-4" />}
                  {names.get(a.authorId) ?? "A staff member"} · {new Date(a.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                </span>
                {a.authorId === me.user.id ? remove(a) : <Can code="classroom.update">{remove(a)}</Can>}
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-sm">{a.body}</CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
