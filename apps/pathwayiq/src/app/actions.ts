"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, API_URL, REFRESH_COOKIE, writeSessionCookies, type TokenPair } from "@/lib/session";

export interface LoginState {
  error?: string;
  username?: string;
}

export async function login(_: LoginState | undefined, form: FormData): Promise<LoginState> {
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/");
  if (!username || !password) {
    return { error: "Enter your username and password.", username };
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
  } catch {
    return { error: "The IAM service is not reachable. Is the backend running on " + API_URL + "?", username };
  }
  if (response.status === 429) {
    return { error: "Too many failed attempts. Try again in a few minutes.", username };
  }
  if (!response.ok) {
    return { error: "Invalid username or password.", username };
  }
  writeSessionCookies(await cookies(), (await response.json()) as TokenPair);
  // Only allow same-site relative paths to avoid open redirects.
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout() {
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;
  const access = store.get(ACCESS_COOKIE)?.value;
  if (refresh && access) {
    await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${access}` },
      body: JSON.stringify({ refreshToken: refresh }),
    }).catch(() => undefined);
  }
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  redirect("/login");
}
