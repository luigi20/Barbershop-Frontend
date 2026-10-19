import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { forwardManagement } from "@/lib/management-bff.server";

const uuid = z.uuid();
const instant = z.iso.datetime({ offset: true });

export const createSchema = z
  .object({
    customer_id: uuid,
    professional_profile_id: uuid,
    service_id: uuid,
    starts_at: instant,
    notes: z.string().nullable().optional(),
  })
  .strict();

export const rescheduleSchema = z
  .object({
    starts_at: instant,
    professional_profile_id: uuid.optional(),
  })
  .strict();

export const cancelSchema = z
  .object({ reason: z.string().nullable().optional() })
  .strict();

export function validAppointmentId(id: string): boolean {
  return uuid.safeParse(id).success;
}

export async function forwardAppointmentBody(
  request: NextRequest,
  path: string,
  method: "POST" | "PUT",
  schema: z.ZodType,
): Promise<NextResponse> {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  return forwardManagement(request, method, path, parsed.data);
}

export function invalidAppointmentId(): NextResponse {
  return NextResponse.json(
    { message: "Identificador inválido." },
    { status: 400 },
  );
}
