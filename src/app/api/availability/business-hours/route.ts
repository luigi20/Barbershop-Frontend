import { NextRequest } from "next/server";
import { forwardManagement } from "@/lib/management-bff.server";
import { forwardValidated, hoursSchema } from "@/lib/availability-bff.server";

export function GET(request: NextRequest) {
  return forwardManagement(request, "GET", "/availability/business-hours");
}

export function PUT(request: NextRequest) {
  return forwardValidated(
    request,
    "PUT",
    "/availability/business-hours",
    hoursSchema,
  );
}
