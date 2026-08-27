/**
 * Auth service — client side.
 *
 * Calls same-origin Next.js Route Handlers only.
 * Never imports from http.server.ts or accesses the NestJS backend directly.
 */

import type {
  ApiErrorResponse,
  LoginFormValues,
  SelectEntityClientResponse,
  SignInClientResponse,
  SignUpFormValues,
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

/**
 * Sends signup data to the BFF Route Handler.
 * On success (2xx), the caller should redirect to /login.
 */
export async function signUp(data: SignUpFormValues): Promise<void> {
  const response = await fetch("/api/auth/signup", {
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
}

/**
 * Sends the selected entity ID to the BFF Route Handler.
 * challenge_token is automatically sent via HttpOnly cookie.
 */
export async function selectEntity(
  entityId: string,
  loginToken: string,
): Promise<SelectEntityClientResponse> {
  const response = await fetch("/api/auth/select-entity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity_id: entityId, login_token: loginToken }),
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

  return response.json() as Promise<SelectEntityClientResponse>;
}

/**
 * Ends the session through the BFF. Tokens remain in HttpOnly cookies and are
 * never read or sent by browser JavaScript.
 */
export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });

  if (!response.ok) {
    let message = "Não foi possível encerrar a sessão. Tente novamente.";
    try {
      const errorBody = (await response.json()) as ApiErrorResponse;
      if (errorBody?.message) message = errorBody.message;
    } catch {
      // response body is not JSON - use default message
    }
    throw new AuthClientError(message, response.status);
  }
}
