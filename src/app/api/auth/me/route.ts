import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { http, HttpError } from "@/lib/http.server";
import type { MeProfile } from "@/types/auth";

const ACCESS_TOKEN_COOKIE = "access_token";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Sessão expirada. Faça login novamente." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const backendProfile = await http.get<MeProfile>("/me_profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!backendProfile) {
      return NextResponse.json(
        { message: "Resposta inesperada do servidor." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    // Retorne explicitamente apenas campos permitidos e presentes na interface MeProfile.
    const profile: MeProfile = {
      id: backendProfile.id,
      identity_id: backendProfile.identity_id,
      name: backendProfile.name,
      photo: backendProfile.photo ?? null,
      phone: backendProfile.phone ?? null,
      roles: backendProfile.roles || [],
      created_at: backendProfile.created_at,
      updated_at: backendProfile.updated_at,
    };

    return NextResponse.json(profile, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.statusCode === 401 || error.statusCode === 403) {
        return NextResponse.json(
          { message: "Sessão inválida ou expirada. Faça login novamente." },
          { status: 401, headers: { "Cache-Control": "no-store" } },
        );
      }
      if (error.statusCode >= 500) {
        return NextResponse.json(
          { message: "Erro interno do servidor. Tente novamente." },
          { status: 502, headers: { "Cache-Control": "no-store" } },
        );
      }
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor. Tente novamente." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
