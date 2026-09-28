import type { Backend } from "@pathwayiq/access/merge";

/** The backends of Pathway IQ, in sidebar order. Another product lists its own. */
export const BACKENDS: readonly Backend[] = [
  { name: "platform", url: process.env.PLATFORM_API_URL ?? "http://localhost:8082" },
  { name: "iam", url: process.env.IAM_API_URL ?? "http://localhost:8080" },
];

const CONTEXT_OWNERS: Record<string, string> = { classroom: "platform", workspace: "platform" };

/** Only the backend that owns a context type answers for its menus and capabilities. */
export function backendsFor(contextType: string): readonly Backend[] {
  return BACKENDS.filter((b) => b.name === CONTEXT_OWNERS[contextType]);
}
