/** Shared shapes safe for client components (load.ts is server-only). */
export type Person = { id: string; name: string };
export interface TaskFilters { assignee?: string; priority?: string; q?: string }
