import { NextResponse } from "next/server";
import { isMarketingRoute } from "@/lib/marketing-routes";

export function middleware(req: Request) {
  const url = new URL(req.url);
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
    pathname.startsWith("/api/tracking/ingest") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(png|jpe?g|svg|webp|gif|ico|js)$/i.test(pathname);

  if (isPublic) return NextResponse.next();

  const cookie = req.headers.get("cookie") ?? "";
  const hasSession = cookie.split(";").some((part) => part.trim().startsWith("dpr_session="));
  if (!hasSession) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", url.origin));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js)$).*)"],
};
