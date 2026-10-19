import { NextRequest, NextResponse } from "next/server";

import { withAuthRoute } from "@/lib/auth-route.server";
import { http, HttpError } from "@/lib/http.server";
import type { EntityMembershipListItem } from "@/types/entity-membership";
import { z } from "zod";
import { forwardManagement } from "@/lib/management-bff.server";

const createSchema = z
  .object({
    email: z.email(),
    password: z.string().min(1),
    name: z.string().min(1),
    phone: z.string(),
    photo: z.string().optional(),
    birth_date: z.string().min(1),
    roles: z
      .array(z.enum(["administrador", "recepcionista", "barbeiro"]))
      .min(1),
  })
  .strict();

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
      entity_id: member.entity_id,
      profile_id: member.profile_id,
      identity_id: member.identity_id ?? null,
      email: member.email ?? null,
      entity_name: member.entity_name ?? null,
      profile_name: member.profile_name ?? null,
      phone: member.phone ?? null,
      photo: member.photo ?? null,
      birth_date: member.birth_date ?? null,
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Dados do membro inválidos." },
      { status: 400 },
    );
  return forwardManagement(request, "POST", "/entity_membership/create", {
    ...parsed.data,
    mfa_required: false,
  });
}
