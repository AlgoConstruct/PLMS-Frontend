import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@pathwayiq/auth/session";
import { mergeNavigation, type Backend, type Navigation, type RawNavigation } from "./merge";

async function fetchOne(backend: Backend, context: string, token: string): Promise<{ nav: RawNavigation | null; unauthorized: boolean }> {
  try {
    const response = await fetch(`${backend.url}/api/v1/navigation?context=${encodeURIComponent(context)}`, {
      cache: "no-store",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) return { nav: null, unauthorized: true };
    return { nav: response.ok ? ((await response.json()) as RawNavigation) : null, unauthorized: false };
  } catch {
    return { nav: null, unauthorized: false };
  }
}

/** Menus, cards and capabilities from every backend of this product, merged; cached for one request. */
export const loadNavigation = cache(async (context: string, backends: readonly Backend[]): Promise<Navigation> => {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) redirect("/login");
  const results = await Promise.all(backends.map(async (b) => ({ backend: b.name, ...(await fetchOne(b, context, token)) })));
  if (results.some((r) => r.unauthorized)) redirect("/login?expired=1");
  return mergeNavigation(context, results);
});
