import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { http, HttpError } from "@/lib/http.server";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

const ACCESS_TOKEN_MAX_AGE = 60 * 15;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

interface RotatedSession {
  access_token: string;
  refresh_token: string;
}

/** Rotação de sessão: o refresh antigo deixa de ser válido. */
async function refreshAccessToken(
  refreshToken: string,
): Promise<RotatedSession> {
  const result = await http.post<RotatedSession>("/auth/refreshtoken", {
    headers: { Authorization: `Bearer ${refreshToken}` },
    body: { refresh_token: refreshToken },
  });

  if (!result?.access_token || !result?.refresh_token) {
    throw new Error("Resposta de refresh inválida.");
  }

  return result;
}

/** Atualiza os dois cookies HttpOnly da sessão na mesma resposta. */
function setSessionCookies(
  response: NextResponse,
  session: RotatedSession,
): void {
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
  response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, {
    ...options,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, {
    ...options,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

function failedRequest(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    { message: "Erro interno do servidor. Tente novamente." },
    { status: 502, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Wrapper for BFF Route Handlers that require authentication.
 * Centralizes the automatic access token refresh logic.
 *
 * Supports two flows:
 *
 * CASE A — access_token present:
 *   Executes handler. If backend returns 401, attempts one refresh and retries.
 *
 * CASE B — access_token absent:
 *   If refresh_token exists, calls /auth/refreshtoken directly,
 *   then executes the handler once with the new token.
 *   No second refresh is attempted if the handler fails after refresh.
 *
 * @param req The original NextRequest
 * @param handler The route logic that receives a valid access_token
 */
export async function withAuthRoute(
  req: NextRequest,
  handler: (
    req: NextRequest,
    accessToken: string,
    refreshToken: string,
  ) => Promise<NextResponse>,
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  // ─── CASO B — access_token ausente ────────────────────────────────────────
  if (!accessToken) {
    if (!refreshToken) {
      return NextResponse.json(
        { message: "Sessão expirada. Faça login novamente." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    // Tentar renovar o access_token antes mesmo de chamar o handler.
    let session: RotatedSession;
    try {
      session = await refreshAccessToken(refreshToken);
    } catch {
      return NextResponse.json(
        { message: "Sessão inválida ou expirada. Faça login novamente." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    // Executar o handler UMA VEZ com o novo token. Sem segundo refresh.
    let response: NextResponse;
    try {
      response = await handler(
        req,
        session.access_token,
        session.refresh_token,
      );
    } catch (handlerError) {
      response = failedRequest(handlerError);
    }

    setSessionCookies(response, session);
    return response;
  }

  // ─── CASO A — access_token presente ───────────────────────────────────────
  try {
    return await handler(req, accessToken, refreshToken ?? "");
  } catch (error) {
    // Tenta refresh somente para 401 — 403 e outros erros passam direto.
    if (error instanceof HttpError && error.statusCode === 401) {
      if (!refreshToken) {
        return NextResponse.json(
          { message: "Sessão expirada. Faça login novamente." },
          { status: 401, headers: { "Cache-Control": "no-store" } },
        );
      }

      let session: RotatedSession;
      try {
        session = await refreshAccessToken(refreshToken);
      } catch {
        return NextResponse.json(
          { message: "Sessão inválida ou expirada. Faça login novamente." },
          { status: 401, headers: { "Cache-Control": "no-store" } },
        );
      }

      // Retry UMA única vez com o novo token. Sem segundo refresh.
      let response: NextResponse;
      try {
        response = await handler(
          req,
          session.access_token,
          session.refresh_token,
        );
      } catch (retryError) {
        response = failedRequest(retryError);
      }

      setSessionCookies(response, session);
      return response;
    }

    // Erros não tratáveis pelo refresh (403, 500, falhas de rede).
    if (error instanceof HttpError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { message: "Erro interno do servidor. Tente novamente." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
