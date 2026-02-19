import { NextRequest, NextResponse } from "next/server";

// ─── Maintenance mode ────────────────────────────────────────────────────────
// To enable: set NEXT_PUBLIC_MAINTENANCE_MODE=true in your environment
// (Vercel dashboard → Settings → Environment Variables, or .env.local)
// All traffic is redirected to /maintenance except:
//   - /maintenance itself (avoid redirect loop)
//   - Next.js internals (_next/*)
//   - Static files (favicon, images, etc.)

const MAINTENANCE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

const BYPASS = [
  "/maintenance",
  "/_next",
  "/favicon.ico",
];

export function middleware(req: NextRequest) {
  if (!MAINTENANCE) return NextResponse.next();

  const { pathname } = req.nextUrl;

  if (BYPASS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/maintenance", req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
