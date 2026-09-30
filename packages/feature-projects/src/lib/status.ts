export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const priorityLabel = (p: string) => p.charAt(0) + p.slice(1).toLowerCase();

/** Completed and archived projects are read-only (the API answers 422); hide editing controls. */
export const isWritable = (status: string) => status === "DRAFT" || status === "ACTIVE";

export const percent = (done: number, total: number) => (total === 0 ? 0 : Math.round((done / total) * 100));
