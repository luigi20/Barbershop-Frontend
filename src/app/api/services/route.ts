import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { forwardManagement } from "@/lib/management-bff.server";

const createSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    description: z.string().max(500).nullable().optional(),
    price: z.string().regex(/^(0|[1-9]\d{0,7})\.\d{2}$/),
    duration_minutes: z.number().int().min(1).max(1440),
  })
  .strict();

export function GET(request: NextRequest): Promise<NextResponse> {
  return forwardManagement(request, "GET", "/service/get_all");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Dados do serviço inválidos." },
      { status: 400 },
    );
  return forwardManagement(request, "POST", "/service/create", parsed.data);
}
