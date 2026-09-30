import "server-only";

import { revalidatePath } from "next/cache";
import { problemMessage, type ApiResult } from "./iam";
import { failure, success, type ActionState } from "@pathwayiq/ui/lib/action-state";
import { serviceApi } from "./service";

export const PLATFORM_URL = process.env.PLATFORM_API_URL ?? "http://localhost:8082";

/** Calls the learning platform with the same IAM user token the console uses. */
export async function platformApi<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  return serviceApi<T>("platform", path, init);
}

/** Calls the platform and converts the outcome into an ActionState; revalidates the given paths on success. */
export async function platformMutate<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body: unknown,
  onSuccess: (data: T) => string | { message: string; redirectTo?: string },
  revalidate: string[] = [],
): Promise<ActionState> {
  const result = await platformApi<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!result.ok) return failure(problemMessage(result));
  revalidate.forEach((p) => revalidatePath(p, "layout"));
  const outcome = onSuccess(result.data);
  return typeof outcome === "string" ? success(outcome) : success(outcome.message, outcome.redirectTo);
}
