import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createSchema,
  forwardAppointmentBody,
} from "@/lib/appointments-bff.server";
import { forwardManagement } from "@/lib/management-bff.server";

const instant = z.iso.datetime({ offset: true });
const querySchema = z
  .object({
    from: instant,
    to: instant,
    professional_profile_id: z.uuid().optional(),
    customer_id: z.uuid().optional(),
    status: z.enum(["agendado", "cancelado", "concluido"]).optional(),
  })
  .strict();

export function GET(
  request: NextRequest,
): Promise<NextResponse> | NextResponse {
  const values = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(values);
  if (
    !parsed.success ||
    Date.parse(parsed.data.from) >= Date.parse(parsed.data.to) ||
    Date.parse(parsed.data.to) - Date.parse(parsed.data.from) >
      31 * 24 * 60 * 60 * 1000
  )
    return NextResponse.json({ message: "Período inválido." }, { status: 400 });
  return forwardManagement(
    request,
    "GET",
    `/appointments?${new URLSearchParams(parsed.data)}`,
  );
}

export function POST(request: NextRequest): Promise<NextResponse> {
  return forwardAppointmentBody(request, "/appointments", "POST", createSchema);
}
