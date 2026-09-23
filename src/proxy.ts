import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

// Checagem otimista (só a presença do cookie) para redirecionar rápido quem não está logado.
// A autorização real acontece no servidor, em cada página e server action (requireRole).
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  const url = new URL("/entrar", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/candidato/:path*", "/contratante/:path*", "/admin/:path*"] };
