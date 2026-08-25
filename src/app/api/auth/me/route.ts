import { NextRequest, NextResponse } from "next/server";

import { http, HttpError } from "@/lib/http.server";
import { withAuthRoute } from "@/lib/auth-route.server";
import type { MeProfile } from "@/types/auth";

export async function GET(req: NextRequest) {
  return withAuthRoute(req, async (req, accessToken) => {
    const backendProfile = await http.get<MeProfile>("/me_profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!backendProfile) {
      throw new HttpError(502, "Resposta inesperada do servidor.");
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
  });
}
