import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ApiResult } from "./api";
import { ACCESS_COOKIE } from "./session";
import type { Problem } from "./types";

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
