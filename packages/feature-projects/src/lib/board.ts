/** Pure board helpers (no React), unit-tested; the server stays the source of truth for positions. */
export interface Placed { id: string; statusId: string; position: number }
export type Columns<T> = Record<string, T[]>;

export const COLUMN_PREFIX = "column:";

export function columns<T extends Placed>(statusIds: string[], tasks: T[]): Columns<T> {
  const out: Columns<T> = Object.fromEntries(statusIds.map((s) => [s, [] as T[]]));
  [...tasks].sort((a, b) => a.position - b.position).forEach((task) => out[task.statusId]?.push(task));
  return out;
}

/**
 * Where a drop lands. Over a column's empty area: its end. Over a card: before it, except when moving down within
 * the same column, where the card lands after it (dnd-kit shows it below the card it passed).
 */
export function dropTarget<T extends Placed>(cols: Columns<T>, activeId: string, overId: string):
  { statusId: string; beforeId: string | null } | null {
  if (overId === activeId) return null;
  if (overId.startsWith(COLUMN_PREFIX)) {
    const statusId = overId.slice(COLUMN_PREFIX.length);
    return cols[statusId] ? { statusId, beforeId: null } : null;
  }
  const statusId = Object.keys(cols).find((s) => cols[s].some((task) => task.id === overId));
  if (!statusId) return null;
  const col = cols[statusId];
  const overIndex = col.findIndex((task) => task.id === overId);
  const activeIndex = col.findIndex((task) => task.id === activeId);
  if (activeIndex !== -1 && activeIndex < overIndex) {
    return { statusId, beforeId: col[overIndex + 1]?.id ?? null };
  }
  return { statusId, beforeId: overId };
}

/** The board after moving taskId; unknown task or status ids return the same object. */
export function applyMove<T extends Placed>(cols: Columns<T>, taskId: string, statusId: string, beforeId: string | null): Columns<T> {
  const task = Object.values(cols).flat().find((x) => x.id === taskId);
  if (!task || !cols[statusId]) return cols;
  const next: Columns<T> = Object.fromEntries(Object.entries(cols).map(([s, ts]) => [s, ts.filter((x) => x.id !== taskId)]));
  const target = next[statusId];
  const index = beforeId ? target.findIndex((x) => x.id === beforeId) : -1;
  const moved = { ...task, statusId };
  if (index === -1) target.push(moved);
  else target.splice(index, 0, moved);
  return next;
}
