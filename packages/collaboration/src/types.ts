export interface CollabContext { backend: string; type: string; id: string }
export interface Target { type: string; id: string }
export interface Person { id: string; name: string }

export interface CommentView {
  id: string; targetType: string; targetId: string; parentId: string | null; authorId: string; body: string | null;
  deleted: boolean; editable: boolean; deletable: boolean; createdAt: string; editedAt: string | null; replies: CommentView[];
}
export interface FileView {
  id: string; targetType: string | null; targetId: string | null; uploaderId: string; name: string; contentType: string;
  size: number; deletable: boolean; createdAt: string;
}
export interface ActivityView {
  id: string; actorId: string | null; verb: string; targetType: string | null; targetId: string | null;
  data: Record<string, unknown>; occurredAt: string;
}
export interface ActivityPage { items: ActivityView[]; next: string | null }
export type Result<T> = { ok: true; data: T } | { ok: false; message: string };
