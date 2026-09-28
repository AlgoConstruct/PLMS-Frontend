export { proxy } from "@pathwayiq/auth/proxy";

// Only the signed-in area is gated; the landing page and /login stay public.
export const config = { matcher: ["/app/:path*"] };
