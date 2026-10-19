import { NextRequest } from "next/server";

import {
  invalidAppointmentId,
  validAppointmentId,
} from "@/lib/appointments-bff.server";
import { forwardManagement } from "@/lib/management-bff.server";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: Context) {
  const { id } = await context.params;
  if (!validAppointmentId(id)) return invalidAppointmentId();
  return forwardManagement(request, "PUT", `/appointments/${id}/complete`);
}
