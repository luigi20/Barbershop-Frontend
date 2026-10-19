import { NextRequest, NextResponse } from "next/server";

import { withAuthRoute } from "@/lib/auth-route.server";
import { http, HttpError } from "@/lib/http.server";
import type { EntityCustomer } from "@/types/entity-customer";
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
    notes: z.string(),
  })
  .strict();

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withAuthRoute(request, async (_request, accessToken) => {
    const customers = await http.get<EntityCustomer[]>(
      "/entity_customer/get_all",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!Array.isArray(customers)) {
      throw new HttpError(502, "Resposta inesperada do servidor.");
    }

    const safeCustomers: EntityCustomer[] = customers.map((customer) => ({
      entity_id: customer.entity_id,
      customer_id: customer.customer_id,
      profile_id: customer.profile_id ?? null,
      email: customer.email ?? null,
      entity_name: customer.entity_name ?? "",
      profile_name: customer.profile_name ?? "",
      phone: customer.phone ?? null,
      photo: customer.photo ?? null,
      birth_date: customer.birth_date ?? null,
      notes: customer.notes ?? null,
      status: customer.status,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    }));

    return NextResponse.json(safeCustomers, {
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
      { message: "Dados do cliente inválidos." },
      { status: 400 },
    );
  return forwardManagement(request, "POST", "/entity_customer/create", {
    ...parsed.data,
    photo: parsed.data.photo ?? "",
    mfa_required: false,
  });
}
