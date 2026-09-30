"use server";

import { problemMessage } from "@pathwayiq/api/iam";
import { serviceApi } from "@pathwayiq/api/service";
import type { ActivityPage, CollabContext, CommentView, FileView, Result, Target } from "./types";

const base = (ctx: CollabContext) => `/api/v1/contexts/${ctx.type}/${ctx.id}`;
const targetQuery = (target?: Target) => (target ? `targetType=${target.type}&targetId=${target.id}` : "");

async function call<T>(ctx: CollabContext, path: string, init: RequestInit = {}): Promise<Result<T>> {
  const result = await serviceApi<T>(ctx.backend, path, init);
  return result.ok ? { ok: true, data: result.data } : { ok: false, message: problemMessage(result) };
}

export async function listComments(ctx: CollabContext, target: Target) {
  return call<CommentView[]>(ctx, `${base(ctx)}/comments?${targetQuery(target)}`);
}

export async function addComment(ctx: CollabContext, target: Target, body: string, parentId?: string) {
  return call<CommentView>(ctx, `${base(ctx)}/comments`, {
    method: "POST", body: JSON.stringify({ targetType: target.type, targetId: target.id, parentId, body }),
  });
}

export async function editComment(ctx: CollabContext, id: string, body: string) {
  return call<CommentView>(ctx, `/api/v1/comments/${id}`, { method: "PATCH", body: JSON.stringify({ body }) });
}

export async function deleteComment(ctx: CollabContext, id: string) {
  return call<void>(ctx, `/api/v1/comments/${id}`, { method: "DELETE" });
}

export async function listFiles(ctx: CollabContext, target?: Target) {
  return call<FileView[]>(ctx, `${base(ctx)}/files?${targetQuery(target)}`);
}

export async function startUpload(ctx: CollabContext, file: { name: string; contentType: string; size: number }, target?: Target) {
  return call<{ file: FileView; uploadUrl: string; headers: Record<string, string> }>(ctx, `${base(ctx)}/files`, {
    method: "POST",
    body: JSON.stringify({ ...file, targetType: target?.type, targetId: target?.id }),
  });
}

export async function completeUpload(ctx: CollabContext, fileId: string) {
  return call<FileView>(ctx, `/api/v1/files/${fileId}/complete`, { method: "POST" });
}

export async function downloadUrl(ctx: CollabContext, fileId: string) {
  return call<{ url: string }>(ctx, `/api/v1/files/${fileId}/download`);
}

export async function deleteFile(ctx: CollabContext, fileId: string) {
  return call<void>(ctx, `/api/v1/files/${fileId}`, { method: "DELETE" });
}

export async function listActivity(ctx: CollabContext, target?: Target, before?: string, limit = 30) {
  const query = [targetQuery(target), before ? `before=${encodeURIComponent(before)}` : "", `limit=${limit}`].filter(Boolean).join("&");
  return call<ActivityPage>(ctx, `${base(ctx)}/activity?${query}`);
}
