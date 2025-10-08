import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token-auth")?.value;

  if (!token) {
    console.log(`No token found, redirecting to /login from ${pathname}`);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  console.log(`Token found, allowing access to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile",
    "/dashboard",
    "/daftar-kiriman",
    "/status-lacak",
    "/sandbox/tsel/log-apis",
    "/sandbox/tsel/callbacks",
    "/prod/tsel/log-apis",
    "/prod/tsel/callbacks",
    "/sandbox/mandiri/log-apis-mandiri",
    "/sandbox/mandiri/callbacks-mandiri",
    "/sandbox/mandiri/callbacks-registrations-mandiri",
    "/prod/mandiri/log-apis-mandiri",
    "/prod/mandiri/callbacks-mandiri",
    "/prod/mandiri/callbacks-registrations-mandiri",
    "/user",
    "/role",
  ],
};