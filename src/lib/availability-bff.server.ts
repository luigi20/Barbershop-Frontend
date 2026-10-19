import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { forwardManagement } from "@/lib/management-bff.server";

const periodSchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    start_time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
    end_time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$|^24:00$/),
  })
  .strict();

export const hoursSchema = z
  .object({ periods: z.array(periodSchema) })
  .strict();
export const timezoneSchema = z
  .object({ timezone: z.string().min(1) })
  .strict();
export const blockSchema = z
  .object({
    starts_at: z.iso.datetime({ offset: true }),
    ends_at: z.iso.datetime({ offset: true }),
    reason: z.string().optional(),
  })
  .strict()
  .refine((value) => Date.parse(value.starts_at) < Date.parse(value.ends_at));

export function validProfileId(profileId: string): boolean {
  return z.uuid().safeParse(profileId).success;
}

export function validBlockId(blockId: string): boolean {
  return z.uuid().safeParse(blockId).success;
}

export async function forwardValidated(
  request: NextRequest,
  method: "POST" | "PUT",
  path: string,
  schema: z.ZodType,
): Promise<NextResponse> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  }
  return forwardManagement(request, method, path, parsed.data);
}

export function invalidId(): NextResponse {
  return NextResponse.json(
    { message: "Identificador inválido." },
    { status: 400 },
  );
}
