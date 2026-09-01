import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { http, HttpError } from "@/lib/http.server";
import type { SignInBackendResponse, SignInClientResponse } from "@/types/auth";

// ─── Validation schema ────────────────────────────────────────────────────────

const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email obrigatório")
    .email("Formato de email inválido")
    .trim(),
  password: z.string().min(1, "Senha obrigatória"),
});

// ─── Cookie configuration ─────────────────────────────────────────────────────

const CHALLENGE_COOKIE_NAME = "challenge_token";
/** 5 minutes — intentionally short; the user must select an entity quickly. */
const CHALLENGE_COOKIE_MAX_AGE = 60 * 5;

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body inválido." },
      { status: 400 },
    );
  }

  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return NextResponse.json({ message }, { status: 422 });
  }

  const { email, password } = parsed.data;

  // 2. Call NestJS backend
  let backendData: SignInBackendResponse;
  try {
    const result = await http.post<SignInBackendResponse>("/auth/signin", {
      body: { email, password },
    });

    if (!result || !result.login_token) {
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
          { message: "Email ou senha incorretos." },
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

    // Network / timeout error
    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  // 3. Build safe client response
  const clientResponse: SignInClientResponse = {
    requires_entity_selection: backendData.requires_entity_selection,
    entities: backendData.entities || [],
  };

  // 4. Set login_token as HttpOnly cookie (challenge phase)
  const response = NextResponse.json(clientResponse, { status: 200 });

  response.cookies.set(CHALLENGE_COOKIE_NAME, backendData.login_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth",
    maxAge: CHALLENGE_COOKIE_MAX_AGE,
  });

  // 5. Store non-sensitive entities in a hint cookie for the /select-entity page
  if (backendData.entities && backendData.entities.length > 0) {
    response.cookies.set(
      "entities_hint",
      JSON.stringify(backendData.entities),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/", // Available to the whole app to be read by Server Components
        maxAge: CHALLENGE_COOKIE_MAX_AGE,
      },
    );
  }

  return response;
}
