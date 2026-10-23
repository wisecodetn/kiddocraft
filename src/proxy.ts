import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { SESSION_COOKIE, readSessionToken } from "./lib/session";

const intl = createMiddleware(routing);

/**
 * - /admin (French only, no locale prefix): sends signed-out visitors to the login page.
 *   Pages and server actions check the session again; this only saves a render.
 * - Everything else: next-intl maps / to French and /ar to Arabic.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin")) {
    const signedIn = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value) !== null;
    if (!signedIn && pathname !== "/admin/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  return intl(request);
}

export const config = {
  // Everything except API routes, uploads, Next internals, generated icons and files with an extension.
  matcher: "/((?!api|uploads|_next|_vercel|icon|apple-icon|.*\\..*).*)",
};
