import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { forwardManagement } from "@/lib/management-bff.server";

const idSchema = z.uuid();
const updateSchema = z
  .object({
    roles: z
      .array(z.enum(["administrador", "recepcionista", "barbeiro"]))
      .min(1),
    status: z.enum(["ativo", "convidado", "inativo"]),
  })
  .strict();
type Context = { params: Promise<{ profileId: string }> };

export async function GET(
  request: NextRequest,
  context: Context,
): Promise<NextResponse> {
  const { profileId } = await context.params;
  if (!idSchema.safeParse(profileId).success)
    return NextResponse.json(
      { message: "profile_id inválido." },
      { status: 400 },
    );
  return forwardManagement(
    request,
    "GET",
    `/entity_membership/get_one?profile_id=${encodeURIComponent(profileId)}`,
  );
}

export async function PUT(
  request: NextRequest,
  context: Context,
): Promise<NextResponse> {
  const { profileId } = await context.params;
  if (!idSchema.safeParse(profileId).success)
    return NextResponse.json(
      { message: "profile_id inválido." },
      { status: 400 },
    );
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Dados do membro inválidos." },
      { status: 400 },
    );
  return forwardManagement(request, "PUT", "/entity_membership/update", {
    profile_id: profileId,
    ...parsed.data,
  });
}
