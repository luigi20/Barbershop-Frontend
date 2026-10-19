import { NextRequest } from "next/server";

import {
  cancelSchema,
  forwardAppointmentBody,
  invalidAppointmentId,
  validAppointmentId,
} from "@/lib/appointments-bff.server";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: Context) {
  const { id } = await context.params;
  if (!validAppointmentId(id)) return invalidAppointmentId();
  return forwardAppointmentBody(
    request,
    `/appointments/${id}/cancel`,
    "PUT",
    cancelSchema,
  );
}
