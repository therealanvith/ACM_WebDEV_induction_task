import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public authentication routes, next static files, and assets
  if (
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Require authentication for all application routes and API endpoints
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized access. Please sign in." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/auth/signin", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Enforce Role-Based Access Control (RBAC) for /admin and /api/admin
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (token.role !== "MODERATOR") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Forbidden: Moderator role required" },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
