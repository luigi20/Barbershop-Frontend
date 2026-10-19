import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { withAuthRoute } from "@/lib/auth-route.server";
import { http } from "@/lib/http.server";

type Method = "GET" | "POST" | "PUT" | "DELETE";

export function forwardManagement(
  request: NextRequest,
  method: Method,
  path: string,
  body?: unknown,
): Promise<NextResponse> {
  return withAuthRoute(request, async (_request, accessToken) => {
    const options = {
      headers: { Authorization: `Bearer ${accessToken}` },
      ...(body === undefined ? {} : { body }),
    };
    const data =
      method === "GET"
        ? await http.get<unknown>(path, options)
        : method === "POST"
          ? await http.post<unknown>(path, options)
          : method === "PUT"
            ? await http.put<unknown>(path, options)
            : await http.delete<unknown>(path, options);
    return NextResponse.json(data, {
      status: method === "POST" ? 201 : 200,
      headers: { "Cache-Control": "no-store" },
    });
  });
}
