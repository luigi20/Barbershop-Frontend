/**
 * Server-only HTTP wrapper for NestJS backend calls.
 *
 * This module must never be imported from client components.
 * It reads API_URL from process.env (server-only — no NEXT_PUBLIC_ prefix).
 */

import "server-only";

const DEFAULT_TIMEOUT_MS = 10_000;

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

function getBaseUrl(): string {
  const url = process.env.API_URL;
  if (!url) {
    throw new Error(
      "API_URL environment variable is not set. Add it to .env.local.",
    );
  }
  return url.replace(/\/$/, "");
}

/**
 * Safely reads the response body as JSON.
 * Returns null when the body is empty (guards against the confirmed
 * /auth/select-entity controller bug that may return no body).
 */
async function safeJsonParse<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text || text.trim() === "") return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(
      502,
      `Backend returned invalid JSON. Status: ${response.status}`,
    );
  }
}

interface RequestOptions {
  /** Request body — will be JSON-serialised. */
  body?: unknown;
  /** Additional headers to merge. */
  headers?: Record<string, string>;
  /** Timeout in milliseconds. Defaults to 10 000. */
  timeoutMs?: number;
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers = {}, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const url = `${getBaseUrl()}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const errorBody = await safeJsonParse<{ message?: string }>(response);
    const message =
      errorBody?.message ?? `Request failed with status ${response.status}`;
    throw new HttpError(response.status, message);
  }

  const data = await safeJsonParse<T>(response);

  if (data === null) {
    // Successful response but no body — expected for some endpoints (known backend bug).
    // Callers that need a body should handle null explicitly.
    return null as T;
  }

  return data;
}

export const http = {
  post: <T>(path: string, options?: RequestOptions) =>
    request<T>("POST", path, options),
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, options),
};
