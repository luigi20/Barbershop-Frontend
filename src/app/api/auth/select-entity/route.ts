import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { http, HttpError } from "@/lib/http.server";
import type {
  SelectEntityBackendResponse,
  SelectEntityClientResponse,
} from "@/types/auth";

// ─── Validation schema ────────────────────────────────────────────────────────

const selectEntitySchema = z.object({
  entity_id: z.string().uuid("entity_id deve ser um UUID válido"),
  login_token: z.string(),
});

// ─── Cookie names ─────────────────────────────────────────────────────────────

const CHALLENGE_COOKIE = "challenge_token";
const ENTITIES_HINT_COOKIE = "entities_hint";
const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const MFA_TOKEN_COOKIE = "mfa_token";

/** 60 minutes — provisional; confirm actual expiry with backend. */
const ACCESS_TOKEN_MAX_AGE = 60 * 60;
/** 30 days — provisional; confirm actual expiry with backend. */
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;
/** 10 minutes for the MFA challenge window. */
const MFA_TOKEN_MAX_AGE = 60 * 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function removeChallengeAndHint(response: NextResponse): void {
  // Overwrite with empty value + maxAge=0 using the same path used at creation.
  response.cookies.set(CHALLENGE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 0,
  });
  response.cookies.set(ENTITIES_HINT_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const isProduction = process.env.NODE_ENV === "production";

  // 1. Read challenge_token from HttpOnly cookie — never from the browser body
  const cookieStore = await cookies();
  const challengeToken = cookieStore.get(CHALLENGE_COOKIE)?.value;

  // We still check for the cookie to ensure a session was initiated,
  // even though the frontend now explicitly sends the login_token as well.
  if (!challengeToken) {
    return NextResponse.json(
      { message: "Sessão expirada. Faça login novamente." },
      { status: 401 },
    );
  }

  // 2. Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body inválido." },
      { status: 400 },
    );
  }

  const parsed = selectEntitySchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return NextResponse.json({ message }, { status: 422 });
  }

  const { entity_id, login_token } = parsed.data;

  // 3. Call NestJS backend
  // The backend requires both Authorization header AND login_token in the body.
  let backendData: SelectEntityBackendResponse;
  try {
    const result = await http.post<SelectEntityBackendResponse>(
      "/auth/select-entity",
      {
        body: { login_token, entity_id },
        headers: { Authorization: `Bearer ${login_token}` },
      },
    );

    // Guard against the known backend bug (controller may return no body)
    if (result === null || result.mfa_required === undefined) {
      return NextResponse.json(
        { message: "Resposta inesperada do servidor. Tente novamente." },
        { status: 502 },
      );
    }

    backendData = result;
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.statusCode === 401 || error.statusCode === 403) {
        return NextResponse.json(
          { message: "Sessão inválida ou expirada. Faça login novamente." },
          { status: 401 },
        );
      }
      if (error.statusCode >= 500) {
        return NextResponse.json(
          { message: "Erro interno do servidor. Tente novamente." },
          { status: 502 },
        );
      }
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  // 4. Build safe client response — no tokens
  const clientResponse: SelectEntityClientResponse = {
    mfa_required: backendData.mfa_required,
  };

  const response = NextResponse.json(clientResponse, { status: 200 });

  // Always remove challenge cookie and entities hint
  removeChallengeAndHint(response);

  if (backendData.mfa_required) {
    // 5a. MFA path — store mfa_token in HttpOnly cookie
    response.cookies.set(MFA_TOKEN_COOKIE, backendData.mfa_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/api/auth",
      maxAge: MFA_TOKEN_MAX_AGE,
    });
  } else {
    // 5b. Session path — store access_token and refresh_token in HttpOnly cookies
    response.cookies.set(ACCESS_TOKEN_COOKIE, backendData.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    // Limpar cookies legados com paths anteriores para evitar duplicatas
    response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/api/auth",
      maxAge: 0,
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/api",
      maxAge: 0,
    });

    // Gravar o refresh_token em path "/" para que o proxy possa verificar
    // sua existência em rotas como /dashboard, /agenda, etc.
    response.cookies.set(REFRESH_TOKEN_COOKIE, backendData.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }

  return response;
}
