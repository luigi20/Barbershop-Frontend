import { NextRequest } from "next/server";

import { forwardManagement } from "@/lib/management-bff.server";
import {
  invalidAppointmentId,
  validAppointmentId,
} from "@/lib/appointments-bff.server";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: Context) {
  const { id } = await context.params;
  if (!validAppointmentId(id)) return invalidAppointmentId();
  return forwardManagement(
    request,
    "GET",
    `/appointments/${encodeURIComponent(id)}`,
  );
}
