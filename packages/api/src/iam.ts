import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, API_URL } from "@pathwayiq/auth/session";
import type { Problem } from "./iam-types";

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; problem: Problem };

/**
 * Calls the IAM API with the session's access token. 401 sends the user to the login page;
 * every other failure (notably 403) is returned so the page can explain it.
 */
export async function api<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) {
    redirect("/login");
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
  if (response.status === 401) {
    redirect("/login?expired=1");
  }
  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as Problem;
    return { ok: false, status: response.status, problem };
  }
  const data = response.status === 204 ? (undefined as T) : ((await response.json()) as T);
  return { ok: true, status: response.status, data };
}

/** For page loads: unwrap the data or null when the caller is not permitted. */
export async function apiOrNull<T>(path: string): Promise<T | null> {
  const result = await api<T>(path);
  return result.ok ? result.data : null;
}

export function problemMessage(result: { ok: false; status: number; problem: Problem }): string {
  const { problem, status } = result;
  if (problem.errors) {
    return Object.entries(problem.errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(" · ");
  }
  if (status === 403) return "Denied: you do not hold this permission in this scope.";
  return problem.detail ?? `Request failed (${status})`;
}
