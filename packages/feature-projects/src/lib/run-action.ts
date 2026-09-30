"use client";

import { toast } from "sonner";
import type { ActionState, ServerAction } from "@pathwayiq/ui/lib/action-state";

/** Calls a form-style Server Action with plain fields; failures become an error toast. */
export async function runAction(action: ServerAction, fields: Record<string, string>): Promise<ActionState> {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.set(k, v));
  const result = await action(undefined, form);
  if (!result.ok) toast.error(result.message);
  return result;
}
