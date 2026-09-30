"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Paperclip, Trash2, Upload } from "lucide-react";
import { useCan } from "@pathwayiq/access/capabilities";
import { Button } from "@pathwayiq/ui/components/button";
import { completeUpload, deleteFile, downloadUrl, listFiles, startUpload } from "./actions";
import type { CollabContext, FileView, Person, Target } from "./types";

const size = (n: number) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`);

/** PUTs the file straight to storage with progress; resolves when the upload finished. */
function put(url: string, headers: Record<string, string>, file: File, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed: storage unreachable"));
    xhr.send(file);
  });
}

/** Files of one target (or the whole context when target is omitted); upload, download, delete. */
export function Files({ ctx, target, people, labelOf }: {
  ctx: CollabContext; target?: Target; people: Person[]; labelOf?: (f: FileView) => string | null;
}) {
  const [files, setFiles] = useState<FileView[] | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const canUpload = useCan(`${ctx.type}.file.upload`);
  const names = new Map(people.map((p) => [p.id, p.name]));
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let alive = true;
    listFiles(ctx, target).then((r) => {
      if (!alive) return;
      if (r.ok) setFiles(r.data); else toast.error(r.message);
    });
    return () => { alive = false; };
  }, [ctx, target, version]);

  const upload = async (file: File) => {
    const started = await startUpload(ctx, { name: file.name, contentType: file.type || "application/octet-stream", size: file.size }, target);
    if (!started.ok) { toast.error(started.message); return; }
    try {
      setProgress(0);
      await put(started.data.uploadUrl, started.data.headers, file, setProgress);
      const done = await completeUpload(ctx, started.data.file.id);
      if (!done.ok) { toast.error(done.message); return; }
      toast.success(`${file.name} uploaded`);
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  };

  const open = async (f: FileView) => {
    const r = await downloadUrl(ctx, f.id);
    if (r.ok) window.open(r.data.url, "_blank", "noopener"); else toast.error(r.message);
  };

  return (
    <div className="grid gap-3">
      {canUpload && (
        <div className="flex items-center gap-2">
          <input ref={input} type="file" className="hidden" aria-label="Choose a file"
                 onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
          <Button type="button" variant="outline" size="sm" disabled={progress !== null} onClick={() => input.current?.click()}>
            <Upload /> {progress === null ? "Upload file" : `Uploading ${progress}%`}
          </Button>
        </div>
      )}
      {files === null ? <p className="text-sm text-muted-foreground">Loading files…</p>
        : files.length === 0 ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><Paperclip className="size-4" /> No files yet.</p>
        : (
          <ul className="grid gap-2">
            {files.map((f) => (
              <li key={f.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm" data-file={f.name}>
                <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{f.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {[size(f.size), names.get(f.uploaderId), new Date(f.createdAt).toLocaleDateString(), labelOf?.(f)].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <Button size="icon" variant="ghost" aria-label={`Download ${f.name}`} onClick={() => void open(f)}><Download /></Button>
                {f.deletable && (
                  <Button size="icon" variant="ghost" className="text-destructive" aria-label={`Delete ${f.name}`}
                          onClick={async () => { const r = await deleteFile(ctx, f.id); if (!r.ok) toast.error(r.message); reload(); }}>
                    <Trash2 />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
