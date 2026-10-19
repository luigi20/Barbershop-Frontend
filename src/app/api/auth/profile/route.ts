import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { forwardManagement } from "@/lib/management-bff.server";

const schema = z
  .object({
    name: z.string().min(1).optional(),
    phone: z.string().nullable().optional(),
    photo_url: z.string().nullable().optional(),
    birth_date: z.string().nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0);

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Dados de perfil inválidos." },
      { status: 400 },
    );
  return forwardManagement(request, "PUT", "/auth/change_profile", parsed.data);
}
