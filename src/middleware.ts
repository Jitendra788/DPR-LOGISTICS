import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const url = new URL(req.url);
  const { pathname } = url;
  const isPublic =
    pathname === "/login" ||
    pathname.startsWith("/customer-booking") ||
    pathname.startsWith("/api/public/") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
