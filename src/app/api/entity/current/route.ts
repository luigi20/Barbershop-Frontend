import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { forwardManagement } from "@/lib/management-bff.server";

const schema = z
  .object({
    name: z.string().min(1),
    type: z.enum([
      "barbearia",
      "studio",
      "BARBERSHOP",
      "BARBEARIA",
      "barbershop",
    ]),
    document: z.string().nullable().optional(),
    email: z.email().nullable().optional(),
    phone: z.string().nullable().optional(),
    photo: z.string().nullable().optional(),
    zip_code: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string().nullable().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
  })
  .strict();

export function GET(request: NextRequest): Promise<NextResponse> {
  return forwardManagement(request, "GET", "/entity/current");
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Dados da barbearia inválidos." },
      { status: 400 },
    );
  return forwardManagement(request, "PUT", "/entity/current", {
    ...parsed.data,
    type: ["BARBERSHOP", "BARBEARIA", "barbershop"].includes(parsed.data.type)
      ? "barbearia"
      : parsed.data.type,
  });
}
