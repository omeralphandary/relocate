import { auth } from "@/auth";
import { NextResponse, NextRequest } from "next/server";

// ─── Maintenance mode ────────────────────────────────────────────────────────
// To enable: set NEXT_PUBLIC_MAINTENANCE_MODE=true in Vercel env vars + redeploy
const MAINTENANCE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

const MAINTENANCE_BYPASS = ["/maintenance", "/_next", "/favicon.ico"];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;

  // Maintenance check first — applies to everyone including logged-in users
  if (MAINTENANCE && !MAINTENANCE_BYPASS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/maintenance", req.nextUrl.origin));
  }

  // Auth guard — redirect unauthenticated users away from /journey
  const isLoggedIn = !!(req as { auth?: unknown }).auth;
  const isJourneyRoute = pathname.startsWith("/journey");

  if (isJourneyRoute && !isLoggedIn) {
    const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
