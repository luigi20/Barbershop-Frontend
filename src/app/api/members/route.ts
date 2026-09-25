import { NextRequest, NextResponse } from "next/server";

import { withAuthRoute } from "@/lib/auth-route.server";
import { http, HttpError } from "@/lib/http.server";
import type { EntityMembershipListItem } from "@/types/entity-membership";

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withAuthRoute(request, async (_request, accessToken) => {
    const members = await http.get<EntityMembershipListItem[]>(
      "/entity_membership/get_all",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!Array.isArray(members)) {
      throw new HttpError(502, "Resposta inesperada do servidor.");
    }

    const safeMembers: EntityMembershipListItem[] = members.map((member) => ({
      entity_name: member.entity_name ?? null,
      profile_name: member.profile_name ?? null,
      phone: member.phone ?? null,
      photo: member.photo ?? null,
      roles: Array.isArray(member.roles) ? member.roles : [],
      status: member.status,
      created_at: member.created_at,
      updated_at: member.updated_at,
    }));

    return NextResponse.json(safeMembers, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  });
}
