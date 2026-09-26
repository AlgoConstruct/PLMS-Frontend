// Shared by the proxy, Server Components and Server Actions. Contains no secrets.

/**
 * Tokens live in httpOnly cookies: browser JavaScript never sees them. Every API call is made
 * server-side (Server Components, Server Actions, proxy), which is the backend-for-frontend pattern.
 */
export const ACCESS_COOKIE = "iam_access";
export const REFRESH_COOKIE = "iam_refresh";

export const API_URL = process.env.IAM_API_URL ?? "http://localhost:8080";

const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

export interface TokenPair {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
}

export interface CookieWriter {
  set(options: {
    name: string;
    value: string;
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
    path: string;
    maxAge: number;
  }): unknown;
}

export function writeSessionCookies(cookies: CookieWriter, tokens: TokenPair) {
  const secure = process.env.NODE_ENV === "production";
  const accessMaxAge = Math.max(
    1,
    Math.floor((new Date(tokens.accessTokenExpiresAt).getTime() - Date.now()) / 1000),
  );
  cookies.set({ name: ACCESS_COOKIE, value: tokens.accessToken, httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: accessMaxAge });
  cookies.set({ name: REFRESH_COOKIE, value: tokens.refreshToken, httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: REFRESH_MAX_AGE });
}
