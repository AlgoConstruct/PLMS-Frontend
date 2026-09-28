import "server-only";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { problemMessage, type ApiResult } from "./iam";
import { failure, success, type ActionState } from "@pathwayiq/ui/lib/action-state";
import { ACCESS_COOKIE } from "@pathwayiq/auth/session";
import type { Problem } from "./iam-types";

export const PLATFORM_URL = process.env.PLATFORM_API_URL ?? "http://localhost:8082";

/** Calls the learning platform with the same IAM user token the console uses. */
export async function platformApi<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) redirect("/login");
  const response = await fetch(`${PLATFORM_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
  if (response.status === 401) redirect("/login?expired=1");
  if (!response.ok) {
    return { ok: false, status: response.status, problem: (await response.json().catch(() => ({}))) as Problem };
  }
  const data = response.status === 204 ? (undefined as T) : ((await response.json()) as T);
  return { ok: true, status: response.status, data };
}

export interface NavItem { key: string; label: string; icon: string; route: string }
export interface NavGroup { key: string; label: string; icon: string; items: NavItem[] }
export interface Navigation { context: string; groups: NavGroup[]; capabilities: string[] }

export async function getNavigation(context: string): Promise<Navigation> {
  const result = await platformApi<Navigation>(`/api/v1/navigation?context=${encodeURIComponent(context)}`);
  return result.ok ? result.data : { context, groups: [], capabilities: [] };
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
