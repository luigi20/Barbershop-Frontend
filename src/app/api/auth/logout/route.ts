import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { withAuthRoute } from "@/lib/auth-route.server";
import { http } from "@/lib/http.server";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const CHALLENGE_TOKEN_COOKIE = "challenge_token";
const MFA_TOKEN_COOKIE = "mfa_token";
const ENTITIES_HINT_COOKIE = "entities_hint";

interface CookieToRemove {
  name: string;
  path: string;
}

const COOKIES_TO_REMOVE: CookieToRemove[] = [
  { name: ACCESS_TOKEN_COOKIE, path: "/" },
  { name: REFRESH_TOKEN_COOKIE, path: "/" },
  { name: REFRESH_TOKEN_COOKIE, path: "/api" },
  { name: REFRESH_TOKEN_COOKIE, path: "/api/auth" },
  { name: CHALLENGE_TOKEN_COOKIE, path: "/api/auth" },
  { name: MFA_TOKEN_COOKIE, path: "/api/auth" },
  { name: ENTITIES_HINT_COOKIE, path: "/" },
];

function removeAuthCookies(response: NextResponse): void {
  for (const cookie of COOKIES_TO_REMOVE) {
    response.cookies.set(cookie.name, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: cookie.path,
      maxAge: 0,
    });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  // Remote revocation is best-effort. withAuthRoute centralizes access-token
  // refresh and retries this call once when the backend responds with 401.
  if (refreshToken) {
    try {
      await withAuthRoute(request, async (_request, accessToken) => {
        await http.post<void>("/auth/logout", {
          headers: { Authorization: `Bearer ${accessToken}` },
          body: { refresh_token: refreshToken },
        });

        return new NextResponse(null, {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        });
      });
    } catch {
      // Backend and network failures must not prevent local logout.
    }
  }

  const response = NextResponse.json(
    { success: true },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );

  removeAuthCookies(response);
  return response;
}
