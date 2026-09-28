import "server-only";

import { revalidatePath } from "next/cache";
import { api, problemMessage } from "./iam";
import { failure, success, type ActionState } from "@pathwayiq/ui/lib/action-state";

/** Calls the API and converts the outcome into an ActionState; revalidates the given paths on success. */
export async function mutate<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body: unknown,
  onSuccess: (data: T) => string | { message: string; redirectTo?: string },
  revalidate: string[] = [],
): Promise<ActionState> {
  const result = await api<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!result.ok) return failure(problemMessage(result));
  revalidate.forEach((p) => revalidatePath(p, "layout"));
  const outcome = onSuccess(result.data);
  return typeof outcome === "string" ? success(outcome) : success(outcome.message, outcome.redirectTo);
}

/** Trimmed form value, or null when empty. */
export function field(form: FormData, name: string): string | null {
  const value = form.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
