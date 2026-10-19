import { NextRequest, NextResponse } from "next/server";
import { forwardManagement } from "@/lib/management-bff.server";

const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function GET(request: NextRequest): Promise<NextResponse> {
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  if (!from || !to || !LOCAL_DATE.test(from) || !LOCAL_DATE.test(to)) {
    return Promise.resolve(
      NextResponse.json(
        { message: "Período inválido." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      ),
    );
  }

  const params = new URLSearchParams({ from, to });
  return forwardManagement(
    request,
    "GET",
    `/dashboard/timeseries?${params.toString()}`,
  );
}
