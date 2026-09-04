import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isMarketingRoute } from "@/lib/marketing-routes";
import { verifySessionTokenEdge } from "@/lib/auth-session-edge";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;
  const isPublic =
    isMarketingRoute(pathname) ||
    pathname === "/login" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.endsWith(".html") ||
    pathname.startsWith("/customer-booking") ||
    pathname.startsWith("/live-track") ||
    pathname.startsWith("/track/") ||
    pathname.startsWith("/sim-consent/") ||
    pathname.startsWith("/api/public/") ||
    (pathname.startsWith("/api/marketing-media/") && req.method === "GET") ||
    pathname.startsWith("/api/tracking/ingest") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/bookings/print-data") ||
    pathname.startsWith("/booking/lr/print") ||
    pathname.startsWith("/roadways/lr/print") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(png|jpe?g|svg|webp|gif|ico|js)$/i.test(pathname);

  if (isPublic) return NextResponse.next();

  const raw = req.cookies.get("dpr_session")?.value;
  const session = await verifySessionTokenEdge(raw);
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/login", url.origin);
    login.searchParams.set("next", pathname);
    const res = NextResponse.redirect(login);
    res.cookies.set("dpr_session", "", { path: "/", maxAge: 0 });
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js)$).*)"],
};
