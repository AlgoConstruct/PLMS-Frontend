import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@pathwayiq/auth/session";
import type { ApiResult } from "./iam";
import type { Problem } from "./iam-types";

const DEFAULTS: Record<string, string> = { platform: "http://localhost:8082", iam: "http://localhost:8080" };

/** Base URL of a backend: env <NAME>_API_URL (e.g. PLATFORM_API_URL), else a local default. */
export function serviceUrl(backend: string): string {
  const url = process.env[`${backend.toUpperCase()}_API_URL`] ?? DEFAULTS[backend];
  if (!url) throw new Error(`No URL for backend "${backend}" (set ${backend.toUpperCase()}_API_URL)`);
  return url;
}

/** Calls any backend with the signed-in user's IAM token. */
export async function serviceApi<T>(backend: string, path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) redirect("/login");
  const response = await fetch(`${serviceUrl(backend)}${path}`, {
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
