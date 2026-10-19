import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { forwardManagement } from "@/lib/management-bff.server";

const querySchema = z
  .object({
    date: z.iso.date(),
    professional_profile_id: z.uuid(),
    service_id: z.uuid(),
  })
  .strict();

export function GET(
  request: NextRequest,
): Promise<NextResponse> | NextResponse {
  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success)
    return NextResponse.json(
      { message: "Consulta inválida." },
      { status: 400 },
    );
  return forwardManagement(
    request,
    "GET",
    `/appointments/availability?${new URLSearchParams(parsed.data)}`,
  );
}
