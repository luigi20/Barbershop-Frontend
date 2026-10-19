import { NextRequest, NextResponse } from "next/server";
import { forwardManagement } from "@/lib/management-bff.server";

export function GET(request: NextRequest): Promise<NextResponse> {
  return forwardManagement(request, "GET", "/dashboard/operations");
}
