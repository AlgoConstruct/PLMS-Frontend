import "server-only";

import { serviceUrl } from "./service";

/** Anonymous GET for public endpoints (no token, no login redirect). */
export async function publicApi<T>(backend: string, path: string): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  const response = await fetch(`${serviceUrl(backend)}${path}`, { cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) return { ok: false, status: response.status };
  return { ok: true, data: (await response.json()) as T };
}
