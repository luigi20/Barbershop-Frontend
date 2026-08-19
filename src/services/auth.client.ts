/**
 * Auth service — client side.
 *
 * Calls same-origin Next.js Route Handlers only.
 * Never imports from http.server.ts or accesses the NestJS backend directly.
 */

import type {
  ApiErrorResponse,
  LoginFormValues,
  SignInClientResponse,
} from "@/types/auth";

export class AuthClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "AuthClientError";
  }
}

/**
 * Sends login credentials to the BFF Route Handler.
 * On success, returns entity data for the selection step.
 * login_token is handled server-side and never exposed to the browser.
 */
export async function signIn(
  data: LoginFormValues,
): Promise<SignInClientResponse> {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = "Ocorreu um erro inesperado. Tente novamente.";
    try {
      const errorBody = (await response.json()) as ApiErrorResponse;
      if (errorBody?.message) message = errorBody.message;
    } catch {
      // response body is not JSON — use default message
    }
    throw new AuthClientError(message, response.status);
  }

  return response.json() as Promise<SignInClientResponse>;
}
