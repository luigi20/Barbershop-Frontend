import { NextRequest } from "next/server";
import { forwardManagement } from "@/lib/management-bff.server";
import {
  forwardValidated,
  timezoneSchema,
} from "@/lib/availability-bff.server";

export function GET(request: NextRequest) {
  return forwardManagement(request, "GET", "/availability/timezone");
}

export function PUT(request: NextRequest) {
  return forwardValidated(
    request,
    "PUT",
    "/availability/timezone",
    timezoneSchema,
  );
}
