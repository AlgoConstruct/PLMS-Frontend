"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { MessageSquare, Pencil, Reply, Trash2 } from "lucide-react";
import { useCan } from "@pathwayiq/access/capabilities";
import { Button } from "@pathwayiq/ui/components/button";
import { Textarea } from "@pathwayiq/ui/components/textarea";
import { addComment, deleteComment, editComment, listComments } from "./actions";
import { Markdown } from "./markdown";
import type { CollabContext, CommentView, Person, Target } from "./types";

function Composer({ placeholder, onSubmit, initial = "", onCancel }: {
  placeholder: string; onSubmit: (body: string) => Promise<boolean>; initial?: string; onCancel?: () => void;
}) {
  const [body, setBody] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <form className="grid gap-2" onSubmit={(e) => {
      e.preventDefault();
      if (!body.trim()) return;
      start(async () => { if (await onSubmit(body.trim())) setBody(""); });
    }}>
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={placeholder} rows={3} maxLength={10000}
                aria-label={placeholder} />
      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" size="sm" disabled={pending || !body.trim()}>{initial ? "Save" : "Comment"}</Button>
      </div>
    </form>
  );
}

function CommentItem({ c, people, ctx, reload, onReply }: {
  c: CommentView; people: Map<string, string>; ctx: CollabContext; reload: () => void; onReply?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const when = new Date(c.createdAt).toLocaleString();
  if (c.deleted) return <p className="text-sm italic text-muted-foreground">Comment deleted</p>;
  return (
    <div className="grid gap-1" data-comment={c.id}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{people.get(c.authorId) ?? "Someone"}</span>
        <span>{when}{c.editedAt ? " · edited" : ""}</span>
        <span className="ml-auto flex gap-1">
          {onReply && <Button size="icon" variant="ghost" className="size-7" aria-label="Reply" onClick={onReply}><Reply /></Button>}
          {c.editable && <Button size="icon" variant="ghost" className="size-7" aria-label="Edit" onClick={() => setEditing(true)}><Pencil /></Button>}
          {c.deletable && (
            <Button size="icon" variant="ghost" className="size-7 text-destructive" aria-label="Delete comment"
                    onClick={async () => { const r = await deleteComment(ctx, c.id); if (!r.ok) toast.error(r.message); reload(); }}>
              <Trash2 />
            </Button>
          )}
        </span>
      </div>
      {editing
        ? <Composer placeholder="Edit comment" initial={c.body ?? ""} onCancel={() => setEditing(false)} onSubmit={async (body) => {
            const r = await editComment(ctx, c.id, body);
            if (!r.ok) { toast.error(r.message); return false; }
            setEditing(false); reload(); return true;
          }} />
        : <Markdown>{c.body ?? ""}</Markdown>}
    </div>
  );
}

/** Threaded comments on one target; loads itself and reloads after every change. */
export function Comments({ ctx, target, people }: { ctx: CollabContext; target: Target; people: Person[] }) {
  const [threads, setThreads] = useState<CommentView[] | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const canComment = useCan(`${ctx.type}.comment.create`);
  const names = new Map(people.map((p) => [p.id, p.name]));
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let alive = true;
    listComments(ctx, target).then((r) => {
      if (!alive) return;
      if (r.ok) setThreads(r.data); else toast.error(r.message);
    });
    return () => { alive = false; };
  }, [ctx, target, version]);

  const post = async (body: string, parentId?: string) => {
    const r = await addComment(ctx, target, body, parentId);
    if (!r.ok) { toast.error(r.message); return false; }
    setReplyTo(null); reload(); return true;
  };

  if (threads === null) return <p className="text-sm text-muted-foreground">Loading comments…</p>;
  return (
    <div className="grid gap-4">
      {threads.length === 0 && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><MessageSquare className="size-4" /> No comments yet.</p>
      )}
      {threads.map((t) => (
        <div key={t.id} className="grid gap-3 rounded-lg border p-3">
          <CommentItem c={t} people={names} ctx={ctx} reload={reload} onReply={canComment && !t.deleted ? () => setReplyTo(t.id) : undefined} />
          {t.replies.length > 0 && (
            <div className="grid gap-3 border-l pl-3">
              {t.replies.map((r) => <CommentItem key={r.id} c={r} people={names} ctx={ctx} reload={reload} />)}
            </div>
          )}
          {replyTo === t.id && <Composer placeholder="Write a reply" onCancel={() => setReplyTo(null)} onSubmit={(b) => post(b, t.id)} />}
        </div>
      ))}
      {canComment && <Composer placeholder="Write a comment (Markdown)" onSubmit={(b) => post(b)} />}
    </div>
  );
}
