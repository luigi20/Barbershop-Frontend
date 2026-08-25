import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { http, HttpError } from "@/lib/http.server";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

/** 60 minutes — provisional; confirm actual expiry with backend. */
const ACCESS_TOKEN_MAX_AGE = 60 * 60;

/** Executa POST /auth/refreshtoken e retorna o novo access_token. */
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const result = await http.post<{ access_token: string }>(
    "/auth/refreshtoken",
    {
      headers: { Authorization: `Bearer ${refreshToken}` },
      body: { refresh_token: refreshToken },
    },
  );

  if (!result?.access_token) {
    throw new Error("Resposta de refresh inválida.");
  }

  return result.access_token;
}

/** Grava o novo access_token como cookie HttpOnly na resposta. */
function setAccessTokenCookie(response: NextResponse, token: string): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
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
  handler: (req: NextRequest, accessToken: string) => Promise<NextResponse>,
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
    let newToken: string;
    try {
      newToken = await refreshAccessToken(refreshToken);
    } catch {
      return NextResponse.json(
        { message: "Sessão inválida ou expirada. Faça login novamente." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    // Executar o handler UMA VEZ com o novo token. Sem segundo refresh.
    let response: NextResponse;
    try {
      response = await handler(req, newToken);
    } catch (handlerError) {
      if (handlerError instanceof HttpError) {
        return NextResponse.json(
          { message: handlerError.message },
          {
            status: handlerError.statusCode,
            headers: { "Cache-Control": "no-store" },
          },
        );
      }
      return NextResponse.json(
        { message: "Erro interno do servidor. Tente novamente." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    setAccessTokenCookie(response, newToken);
    return response;
  }

  // ─── CASO A — access_token presente ───────────────────────────────────────
  try {
    return await handler(req, accessToken);
  } catch (error) {
    // Tenta refresh somente para 401 — 403 e outros erros passam direto.
    if (error instanceof HttpError && error.statusCode === 401) {
      if (!refreshToken) {
        return NextResponse.json(
          { message: "Sessão expirada. Faça login novamente." },
          { status: 401, headers: { "Cache-Control": "no-store" } },
        );
      }

      let newToken: string;
      try {
        newToken = await refreshAccessToken(refreshToken);
      } catch {
        return NextResponse.json(
          { message: "Sessão inválida ou expirada. Faça login novamente." },
          { status: 401, headers: { "Cache-Control": "no-store" } },
        );
      }

      // Retry UMA única vez com o novo token. Sem segundo refresh.
      let response: NextResponse;
      try {
        response = await handler(req, newToken);
      } catch (retryError) {
        if (retryError instanceof HttpError) {
          return NextResponse.json(
            { message: retryError.message },
            {
              status: retryError.statusCode,
              headers: { "Cache-Control": "no-store" },
            },
          );
        }
        return NextResponse.json(
          { message: "Erro interno do servidor. Tente novamente." },
          { status: 502, headers: { "Cache-Control": "no-store" } },
        );
      }

      setAccessTokenCookie(response, newToken);
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
