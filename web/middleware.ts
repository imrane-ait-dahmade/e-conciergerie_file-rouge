import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  defaultLocale,
  isLocale,
  LOCALE_HEADER,
  type Locale,
} from "@/lib/i18n-config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  // Routes sans préfixe de langue : on laisse passer et on fixe la locale par défaut.
  if (pathname === "/login" || pathname === "/signup") {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(LOCALE_HEADER, defaultLocale);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  let locale: Locale = defaultLocale;

  if (first && isLocale(first)) {
    locale = first;
  } else {
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === "/"
        ? `/${defaultLocale}`
        : `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

