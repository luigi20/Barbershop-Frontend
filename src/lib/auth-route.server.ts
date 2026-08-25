import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { http, HttpError } from "@/lib/http.server";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

/** 60 minutes — provisional; confirm actual expiry with backend. */
const ACCESS_TOKEN_MAX_AGE = 60 * 60;

/**
 * Wrapper for BFF Route Handlers that require authentication.
 * Centralizes the automatic access token refresh logic.
 *
 * @param req The original NextRequest
 * @param handler The route logic that needs the access_token
 */
export async function withAuthRoute(
  req: NextRequest,
  handler: (req: NextRequest, accessToken: string) => Promise<NextResponse>,
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Sessão expirada. Faça login novamente." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    // 1. Executa o manipulador originalmente com o token atual
    return await handler(req, accessToken);
  } catch (error) {
    // Apenas tenta refresh se for um erro 401 explícito
    if (error instanceof HttpError && error.statusCode === 401) {
      const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

      if (!refreshToken) {
        return NextResponse.json(
          { message: "Sessão expirada. Faça login novamente." },
          { status: 401, headers: { "Cache-Control": "no-store" } },
        );
      }

      // 2. Tenta renovar o access_token chamando o NestJS
      let refreshResult: { access_token: string };
      try {
        const result = await http.post<{ access_token: string }>(
          "/auth/refreshtoken",
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
            body: { refresh_token: refreshToken },
          },
        );

        if (!result || !result.access_token) {
          throw new Error("Invalid response");
        }
        refreshResult = result;
      } catch {
        // Se a tentativa de refresh falhar (400, 401, erro de rede),
        // não entra em loop. Retorna sessão inválida direto.
        return NextResponse.json(
          { message: "Sessão inválida ou expirada. Faça login novamente." },
          { status: 401, headers: { "Cache-Control": "no-store" } },
        );
      }

      const newAccessToken = refreshResult.access_token;

      // 3. Tenta novamente a requisição original apenas UMA VEZ com o novo token
      let response: NextResponse;
      try {
        response = await handler(req, newAccessToken);
      } catch (retryError) {
        // Se a SEGUNDA tentativa falhar (mesmo sendo um 401), não faremos um novo refresh.
        // Apenas repassamos o erro ao frontend.
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

      // 4. Modifica o NextResponse para setar o novo access_token pro browser
      response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });

      return response;
    }

    // Se não for um erro tratável pelo refresh (ex: 403, 500, falhas de rede),
    // apenas retornamos o erro ao frontend.
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
