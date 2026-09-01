import { NextRequest, NextResponse } from "next/server";

import { withAuthRoute } from "@/lib/auth-route.server";
import { http, HttpError } from "@/lib/http.server";
import type { EntityCustomer } from "@/types/entity-customer";

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
      entity_name: customer.entity_name,
      profile_name: customer.profile_name,
      phone: customer.phone ?? null,
      photo: customer.photo ?? null,
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
