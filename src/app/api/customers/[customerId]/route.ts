import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { forwardManagement } from "@/lib/management-bff.server";

const idSchema = z.uuid();
const updateSchema = z
  .object({
    notes: z.string().optional(),
    status: z.enum(["ativo", "inativo", "bloqueado"]),
  })
  .strict();
type Context = { params: Promise<{ customerId: string }> };

export async function GET(
  request: NextRequest,
  context: Context,
): Promise<NextResponse> {
  const { customerId } = await context.params;
  if (!idSchema.safeParse(customerId).success)
    return NextResponse.json(
      { message: "customer_id inválido." },
      { status: 400 },
    );
  return forwardManagement(
    request,
    "GET",
    `/entity_customer/get_one?customer_id=${encodeURIComponent(customerId)}`,
  );
}

export async function PUT(
  request: NextRequest,
  context: Context,
): Promise<NextResponse> {
  const { customerId } = await context.params;
  if (!idSchema.safeParse(customerId).success)
    return NextResponse.json(
      { message: "customer_id inválido." },
      { status: 400 },
    );
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Dados do cliente inválidos." },
      { status: 400 },
    );
  return forwardManagement(request, "PUT", "/entity_customer/update", {
    customer_id: customerId,
    ...parsed.data,
  });
}
