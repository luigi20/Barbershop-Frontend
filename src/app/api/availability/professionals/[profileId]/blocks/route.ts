import { NextRequest, NextResponse } from "next/server";
import { forwardManagement } from "@/lib/management-bff.server";
import {
  blockSchema,
  forwardValidated,
  invalidId,
  validProfileId,
} from "@/lib/availability-bff.server";
import { z } from "zod";

interface Context {
  params: Promise<{ profileId: string }>;
}
const isoInstant = z.iso.datetime({ offset: true });

export async function GET(request: NextRequest, context: Context) {
  const { profileId } = await context.params;
  if (!validProfileId(profileId)) return invalidId();
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  if (
    !isoInstant.safeParse(from).success ||
    !isoInstant.safeParse(to).success ||
    Date.parse(from!) >= Date.parse(to!)
  ) {
    return NextResponse.json(
      { message: "Intervalo inválido." },
      { status: 400 },
    );
  }
  const query = new URLSearchParams({ from: from!, to: to! });
  return forwardManagement(
    request,
    "GET",
    `/availability/professionals/${profileId}/blocks?${query}`,
  );
}

export async function POST(request: NextRequest, context: Context) {
  const { profileId } = await context.params;
  if (!validProfileId(profileId)) return invalidId();
  return forwardValidated(
    request,
    "POST",
    `/availability/professionals/${profileId}/blocks`,
    blockSchema,
  );
}
