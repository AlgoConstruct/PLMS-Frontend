"use client";

import { startTransition, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useCan } from "@pathwayiq/access/capabilities";
import { ActivityFeed } from "@pathwayiq/collaboration/activity-feed";
import { Comments } from "@pathwayiq/collaboration/comments";
import { Files } from "@pathwayiq/collaboration/files";
import { ConfirmAction } from "@pathwayiq/ui/blocks/confirm-action";
import { FormField } from "@pathwayiq/ui/blocks/page";
import { SelectField } from "@pathwayiq/ui/blocks/select-field";
import { Button } from "@pathwayiq/ui/components/button";
import { Checkbox } from "@pathwayiq/ui/components/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@pathwayiq/ui/components/dialog";
import { Input } from "@pathwayiq/ui/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@pathwayiq/ui/components/tabs";
import { Textarea } from "@pathwayiq/ui/components/textarea";
import type { ProjectTask, WorkflowStatus } from "@pathwayiq/api/platform-types";
import type { Person } from "../lib/types";
import { PRIORITIES, priorityLabel } from "../lib/status";
import { runAction } from "../lib/run-action";
import { addChecklistItem, deleteChecklistItem, deleteTask, toggleChecklistItem, updateTask } from "../pages/_actions";

export function TaskDialog({ projectId, task, statuses, members, people, milestones, editable, onClose }: {
  projectId: string; task: ProjectTask; statuses: WorkflowStatus[]; members: Person[]; people: Person[];
  milestones: { id: string; title: string }[]; editable: boolean; onClose: () => void;
}) {
  const ctx = useMemo(() => ({ backend: "platform", type: "project", id: projectId }), [projectId]);
  const target = useMemo(() => ({ type: "task", id: task.id }), [task.id]);
  const canEdit = useCan("project.task.update") && editable;
  const canAssign = useCan("project.task.assign") && editable;
  const [item, setItem] = useState("");
  const ids = { projectId, taskId: task.id };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    Object.entries(ids).forEach(([k, v]) => form.set(k, v));
    startTransition(async () => {
      const result = await updateTask(undefined, form);
      if (result.ok) toast.success(result.message); else toast.error(result.message);
    });
  };
  const addItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item.trim()) return;
    startTransition(async () => {
      if ((await runAction(addChecklistItem, { ...ids, text: item.trim() })).ok) setItem("");
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task.key} · {task.title}</DialogTitle>
          <DialogDescription>{canEdit ? "Changes are saved when you press Save." : "You can view this task."}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments ({task.commentCount})</TabsTrigger>
            <TabsTrigger value="files">Files ({task.fileCount})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="grid gap-4 pt-2">
            <form onSubmit={save} className="grid gap-4">
              <fieldset disabled={!canEdit} className="grid gap-4">
                <FormField label="Title" htmlFor="td-title"><Input id="td-title" name="title" defaultValue={task.title} required maxLength={200} /></FormField>
                <FormField label="Description" htmlFor="td-desc"><Textarea id="td-desc" name="description" defaultValue={task.description ?? ""} rows={4} /></FormField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Status" htmlFor="td-status">
                    <SelectField id="td-status" name="statusId" defaultValue={task.statusId} options={statuses.map((s) => ({ value: s.id, label: s.name }))} />
                  </FormField>
                  <FormField label="Priority" htmlFor="td-priority">
                    <SelectField id="td-priority" name="priority" defaultValue={task.priority} options={PRIORITIES.map((p) => ({ value: p, label: priorityLabel(p) }))} />
                  </FormField>
                  <FormField label="Milestone" htmlFor="td-milestone">
                    <SelectField id="td-milestone" name="milestoneId" defaultValue={task.milestoneId ?? "none"}
                                 options={[{ value: "none", label: "No milestone" }, ...milestones.map((m) => ({ value: m.id, label: m.title }))]} />
                  </FormField>
                  <FormField label="Due on" htmlFor="td-due"><Input id="td-due" name="dueOn" type="date" defaultValue={task.dueOn ?? ""} /></FormField>
                  <FormField label="Estimate (points)" htmlFor="td-est"><Input id="td-est" name="estimatePoints" type="number" min={0} defaultValue={task.estimatePoints ?? ""} /></FormField>
                </div>
              </fieldset>
              <fieldset disabled={!canAssign} className="grid gap-1">
                <legend className="text-sm font-medium">Assignees</legend>
                {canAssign && <input type="hidden" name="assigneesShown" value="yes" />}
                <div className="flex flex-wrap gap-3">
                  {members.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="assigneeIds" value={m.id} defaultChecked={task.assigneeIds.includes(m.id)} />
                      {m.name}
                    </label>
                  ))}
                </div>
              </fieldset>
              {canEdit && <div className="flex justify-end"><Button type="submit">Save</Button></div>}
            </form>

            <div className="grid gap-2">
              <span className="text-sm font-medium">Checklist</span>
              {task.checklist.map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={c.done} disabled={!canEdit} aria-label={c.text}
                            onCheckedChange={(v) => startTransition(async () => { await runAction(toggleChecklistItem, { ...ids, itemId: c.id, done: String(v === true) }); })} />
                  <span className={c.done ? "text-muted-foreground line-through" : ""}>{c.text}</span>
                  {canEdit && (
                    <Button size="icon" variant="ghost" className="ml-auto" aria-label={`Remove ${c.text}`}
                            onClick={() => startTransition(async () => { await runAction(deleteChecklistItem, { ...ids, itemId: c.id }); })}>
                      <Trash2 />
                    </Button>
                  )}
                </div>
              ))}
              {canEdit && (
                <form onSubmit={addItem} className="flex gap-2">
                  <Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Add a checklist item" aria-label="New checklist item" maxLength={500} />
                  <Button type="submit" variant="outline">Add</Button>
                </form>
              )}
            </div>

            {canEdit && (
              <div className="flex justify-start border-t pt-3">
                <ConfirmAction trigger={<Button variant="ghost" className="text-destructive"><Trash2 /> Delete task</Button>}
                               title={`Delete ${task.key}?`} action={deleteTask} fields={ids} confirmLabel="Delete" />
              </div>
            )}
          </TabsContent>
          <TabsContent value="comments" className="pt-2"><Comments ctx={ctx} target={target} people={people} /></TabsContent>
          <TabsContent value="files" className="pt-2"><Files ctx={ctx} target={target} people={people} /></TabsContent>
          <TabsContent value="history" className="pt-2"><ActivityFeed ctx={ctx} target={target} people={people} /></TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
