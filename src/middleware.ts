import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Match next.config / withBasePath: leading slash, no trailing slash. */
function normalizedBasePath(): string {
  let b = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
  if (!b) return "";
  b = b.replace(/\/+$/, "");
  if (!b.startsWith("/")) b = `/${b}`;
  return b;
}

export function middleware(request: NextRequest) {
  const base = normalizedBasePath();
  if (!base) return NextResponse.next();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next")) return NextResponse.next();

  const underBase = pathname === base || pathname.startsWith(`${base}/`);
  if (underBase) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `${base}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  /** Include `/` so bare host redirects; skip `_next` in handler. */
  matcher: ["/", "/((?!_next/).*)"],
};
