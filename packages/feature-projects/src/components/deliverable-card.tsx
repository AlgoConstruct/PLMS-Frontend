"use client";

import { useMemo, useState } from "react";
import { ChevronDown, MessageSquareText, Send, ShieldCheck } from "lucide-react";
import { useCan } from "@pathwayiq/access/capabilities";
import { Files } from "@pathwayiq/collaboration/files";
import { Markdown } from "@pathwayiq/collaboration/markdown";
import { FormDialog } from "@pathwayiq/ui/blocks/form-dialog";
import { FormField } from "@pathwayiq/ui/blocks/page";
import { SelectField } from "@pathwayiq/ui/blocks/select-field";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Button } from "@pathwayiq/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { Input } from "@pathwayiq/ui/components/input";
import { Textarea } from "@pathwayiq/ui/components/textarea";
import type { Deliverable, Review } from "@pathwayiq/api/platform-types";
import type { Person } from "../lib/types";
import { deliverableLabel, scoreText } from "../lib/milestones";
import { listReviews, reviewDeliverable, submitDeliverable } from "../pages/_actions";

const VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACCEPTED: "default", SUBMITTED: "secondary", CHANGES_REQUESTED: "destructive", PENDING: "outline",
};

function History({ deliverableId, people }: { deliverableId: string; people: Map<string, string> }) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [open, setOpen] = useState(false);
  const toggle = async () => {
    if (!open && reviews === null) setReviews(await listReviews(deliverableId));
    setOpen(!open);
  };
  return (
    <div className="grid gap-2">
      <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => void toggle()}>
        <ChevronDown className={open ? "rotate-180" : ""} /> Review history
      </Button>
      {open && (reviews === null ? <p className="text-sm text-muted-foreground">Loading…</p>
        : reviews.length === 0 ? <p className="text-sm text-muted-foreground">No reviews yet.</p>
        : (
          <ol className="grid gap-2 border-l pl-3">
            {reviews.map((r) => (
              <li key={r.id} className="grid gap-1 text-sm">
                <span className="text-xs text-muted-foreground">
                  {people.get(r.reviewerId) ?? "Someone"} · {r.decision === "ACCEPT" ? "accepted" : r.decision === "CHANGES" ? "requested changes" : "feedback"}
                  {r.score != null ? ` · ${r.score}` : ""} · {new Date(r.createdAt).toLocaleString()}
                </span>
                {r.body && <Markdown>{r.body}</Markdown>}
              </li>
            ))}
          </ol>
        ))}
    </div>
  );
}

/** One deliverable: status, files, submit (team) and review (supervisors) actions, review history. */
export function DeliverableCard({ projectId, deliverable: d, milestoneTitle, people, writable }: {
  projectId: string; deliverable: Deliverable; milestoneTitle?: string; people: Person[]; writable: boolean;
}) {
  const canSubmit = useCan("project.deliverable.submit") && writable;
  const canApprove = useCan("project.review.approve") && writable;
  const canFeedback = useCan("project.review.create") && writable;
  const open = d.status === "PENDING" || d.status === "CHANGES_REQUESTED";
  const ctx = useMemo(() => ({ backend: "platform", type: "project", id: projectId }), [projectId]);
  const target = useMemo(() => ({ type: "deliverable", id: d.id }), [d.id]);
  const names = new Map(people.map((p) => [p.id, p.name]));
  const score = scoreText(d.score, d.maxScore);
  const ids = <><input type="hidden" name="projectId" value={projectId} /><input type="hidden" name="deliverableId" value={d.id} /></>;
  return (
    <Card data-deliverable={d.title}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="grid gap-1">
            <CardTitle>{d.title}</CardTitle>
            <span className="text-xs text-muted-foreground">
              {[milestoneTitle, d.dueOn && `due ${d.dueOn}`, d.maxScore != null && `out of ${d.maxScore}`].filter(Boolean).join(" · ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {score && <Badge variant="outline" data-score>{score}</Badge>}
            <Badge variant={VARIANT[d.status] ?? "outline"} data-status={d.status}>{deliverableLabel(d.status)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {d.description && <Markdown>{d.description}</Markdown>}
        {d.submissionNote && (
          <div className="rounded-md bg-muted p-3 text-sm">
            <span className="text-xs text-muted-foreground">Submission note</span>
            <p className="whitespace-pre-wrap">{d.submissionNote}</p>
          </div>
        )}
        <Files ctx={ctx} target={target} people={people} readOnly={!open || !writable} />
        <div className="flex flex-wrap gap-2">
          {canSubmit && open && (
            <FormDialog trigger={<Button size="sm"><Send /> Submit</Button>} title={`Submit ${d.title}`} action={submitDeliverable}
                        submitLabel="Submit" description="Files attached above are part of the submission; they freeze until the review.">
              {ids}
              <FormField label="Note" htmlFor={`note-${d.id}`}><Textarea id={`note-${d.id}`} name="note" rows={3} /></FormField>
            </FormDialog>
          )}
          {canApprove && d.status === "SUBMITTED" && (
            <FormDialog trigger={<Button size="sm"><ShieldCheck /> Review</Button>} title={`Review ${d.title}`} action={reviewDeliverable}
                        submitLabel="Save review">
              {ids}
              <FormField label="Decision" htmlFor={`dec-${d.id}`}>
                <SelectField id={`dec-${d.id}`} name="decision" defaultValue="ACCEPT"
                             options={[{ value: "ACCEPT", label: "Accept" }, { value: "CHANGES", label: "Request changes" }]} />
              </FormField>
              {d.maxScore != null && (
                <FormField label={`Score (0–${d.maxScore}, when accepting)`} htmlFor={`score-${d.id}`}>
                  <Input id={`score-${d.id}`} name="score" type="number" min={0} max={d.maxScore} />
                </FormField>
              )}
              <FormField label="Feedback" htmlFor={`body-${d.id}`}><Textarea id={`body-${d.id}`} name="body" rows={4} /></FormField>
            </FormDialog>
          )}
          {canFeedback && !canApprove && (
            <FormDialog trigger={<Button size="sm" variant="outline"><MessageSquareText /> Feedback</Button>}
                        title={`Feedback on ${d.title}`} action={reviewDeliverable} submitLabel="Send">
              {ids}
              <input type="hidden" name="decision" value="NONE" />
              <FormField label="Feedback" htmlFor={`fb-${d.id}`}><Textarea id={`fb-${d.id}`} name="body" rows={4} required /></FormField>
            </FormDialog>
          )}
        </div>
        <History key={`${d.id}${d.status}`} deliverableId={d.id} people={names} />
      </CardContent>
    </Card>
  );
}
