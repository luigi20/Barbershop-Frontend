import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { forwardManagement } from "@/lib/management-bff.server";

const schema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().max(500).nullable().optional(),
    price: z
      .string()
      .regex(/^(0|[1-9]\d{0,7})\.\d{2}$/)
      .optional(),
    duration_minutes: z.number().int().min(1).max(1440).optional(),
    status: z.enum(["ativo", "inativo"]).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0);
type Context = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  context: Context,
): Promise<NextResponse> {
  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success)
    return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  return forwardManagement(
    request,
    "GET",
    `/service/get_one/${encodeURIComponent(id)}`,
  );
}

export async function PUT(
  request: NextRequest,
  context: Context,
): Promise<NextResponse> {
  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success)
    return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Dados do serviço inválidos." },
      { status: 400 },
    );
  return forwardManagement(
    request,
    "PUT",
    `/service/update/${encodeURIComponent(id)}`,
    parsed.data,
  );
}
