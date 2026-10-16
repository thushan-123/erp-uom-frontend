import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  isTokenExpired,
} from "@/lib/auth/cookies";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, internal routes, and auth APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const isAuth = Boolean(accessToken && !isTokenExpired(accessToken));
  const isLoginPage = pathname === "/login";

  // If already authenticated and on /login, redirect to /inventory/item-details
  if (isLoginPage && isAuth) {
    return NextResponse.redirect(
      new URL("/inventory/item-details", request.url)
    );
  }

  // If not authenticated and not on /login
  if (!isLoginPage && !isAuth) {
    // If we have a refresh token, we can continue and let client/BFF rotate or redirect
    if (refreshToken && !isTokenExpired(refreshToken)) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
