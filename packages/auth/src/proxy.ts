import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE, API_URL, REFRESH_COOKIE, writeSessionCookies, type TokenPair } from "./session";

/**
 * Optimistic session gate. Authorization is never decided here: the IAM backend checks every call.
 *  - no session           -> /login
 *  - access token expired -> silently refresh with the httpOnly refresh cookie
 */
export async function proxy(request: NextRequest) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  if (access && !expiresWithin(access, 30)) {
    return NextResponse.next();
  }
  if (refresh) {
    const tokens = await refreshTokens(refresh);
    if (tokens) {
      // Make the new token visible to Server Components rendering this request...
      request.cookies.set(ACCESS_COOKIE, tokens.accessToken);
      request.cookies.set(REFRESH_COOKIE, tokens.refreshToken);
      const response = NextResponse.next({ request: { headers: request.headers } });
      // ...and store it in the browser for the next ones.
      writeSessionCookies(response.cookies, tokens);
      return response;
    }
  }
  const login = new URL("/login", request.url);
  if (request.nextUrl.pathname !== "/") login.searchParams.set("next", request.nextUrl.pathname);
  const response = NextResponse.redirect(login);
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

async function refreshTokens(refreshToken: string): Promise<TokenPair | null> {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    return response.ok ? ((await response.json()) as TokenPair) : null;
  } catch {
    return null;
  }
}

/** Reads `exp` without verifying the signature; only used to decide when to refresh. */
function expiresWithin(jwt: string, seconds: number): boolean {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp !== "number" || payload.exp * 1000 - Date.now() < seconds * 1000;
  } catch {
    return true;
  }
}
