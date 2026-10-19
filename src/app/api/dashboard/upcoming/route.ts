import { NextRequest, NextResponse } from "next/server";
import { forwardManagement } from "@/lib/management-bff.server";

export function GET(request: NextRequest): Promise<NextResponse> {
  const rawLimit = request.nextUrl.searchParams.get("limit") ?? "5";
  const limit = Number(rawLimit);
  if (!/^[1-9]\d*$/.test(rawLimit) || limit > 20) {
    return Promise.resolve(
      NextResponse.json(
        { message: "Limite inválido." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      ),
    );
  }
  return forwardManagement(
    request,
    "GET",
    `/dashboard/upcoming?limit=${limit}`,
  );
}
