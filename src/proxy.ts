import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy para proteção de rotas autenticadas — Next.js 16.3.
 *
 * Responsabilidade:
 *   Verificar APENAS a possibilidade de existência de sessão,
 *   com base na presença dos cookies access_token ou refresh_token.
 *
 * O que este proxy NÃO faz:
 *   - Validar ou decodificar JWT.
 *   - Chamar o backend ou /auth/refreshtoken.
 *   - Validar roles ou permissões.
 *
 * A validação real da sessão pertence ao BFF (withAuthRoute)
 * e, em última instância, ao NestJS.
 */
export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Sessão potencialmente recuperável se qualquer um dos tokens existir.
  // Se apenas o refresh_token estiver presente, o BFF executará o refresh
  // automaticamente via withAuthRoute quando /api/auth/me for chamado.
  if (accessToken || refreshToken) {
    return NextResponse.next();
  }

  // Nenhum token de sessão presente — redirecionar para login.
  // Nota: challenge_token sozinho NÃO representa uma sessão autenticada
  // e não é verificado aqui, resultando no redirecionamento correto.
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

// Proteger somente as rotas privadas do domínio.
// /login, /cadastro, /select-entity, /api/* e arquivos estáticos
// ficam explicitamente fora deste matcher.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/agenda/:path*",
    "/clientes/:path*",
    "/servicos/:path*",
    "/financeiro/:path*",
    "/configuracoes/:path*",
    "/perfil/:path*",
  ],
};
