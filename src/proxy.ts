import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin area is not localized — guard it with the signed cookie.
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin" || pathname === "/admin/login") {
      return NextResponse.next();
    }
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const valid = token ? await verifyAdminToken(token) : false;
    if (!valid) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Skip api, static assets, files with extensions. Match everything else.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
