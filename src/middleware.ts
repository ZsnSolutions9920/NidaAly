import { NextRequest, NextResponse } from "next/server";
import { detectLocaleFromHost, LOCALES, type LocaleCode } from "@/lib/locale";

/**
 * Middleware handles:
 * 1. Locale detection from subdomain (pk.nidaaly.com -> pk)
 * 2. Setting locale cookie for SSR/client access
 * 3. Admin route protection (basic redirect, full auth check in API)
 */
export function middleware(req: NextRequest) {
  const response = NextResponse.next();
  const hostname = req.headers.get("host") ?? "localhost";

  // Detect locale from subdomain
  const locale = detectLocaleFromHost(hostname);
  const config = LOCALES[locale];

  // Set locale headers for downstream use
  response.headers.set("x-locale", locale);
  response.headers.set("x-currency", config.currency);

  // Set locale cookie if not set or different
  const currentLocale = req.cookies.get("locale")?.value;
  if (currentLocale !== locale) {
    response.cookies.set("locale", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    response.cookies.set("currency", config.currency, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes that handle their own auth
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)",
  ],
};
