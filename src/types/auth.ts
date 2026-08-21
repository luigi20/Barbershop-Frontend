// ─── Backend contract types ───────────────────────────────────────────────────
// Reflect exactly the confirmed backend response shapes.
// These types are used only on the server (Route Handlers / BFF).
// The browser never receives the raw backend response.

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthEntity {
  id: string;
  entity_name: string;
  roles: string[];
}

/** Raw response from POST /auth/signin on the NestJS backend. */
export interface SignInBackendResponse {
  /** Challenge token — NOT the access token. Used as Bearer in /auth/select-entity. */
  login_token: string;
  requires_entity_selection: boolean;
  entities: AuthEntity[];
}

// ─── BFF public contract ──────────────────────────────────────────────────────
// What the Next.js Route Handler returns to the browser.
// login_token is intentionally excluded — it is stored server-side as HttpOnly cookie.

export interface SignInClientResponse {
  requires_entity_selection: boolean;
  entities: AuthEntity[];
}

// ─── Form types ───────────────────────────────────────────────────────────────

export interface LoginFormValues {
  email: string;
  password: string;
}

// ─── Error types ──────────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
}

// ─── Signup types ─────────────────────────────────────────────────────────────

export type EntityType = "barbearia" | "studio";

/** Raw request body sent to POST /auth/signup on the NestJS backend. */
export interface SignUpRequest {
  name: string;
  password: string;
  entity_type: EntityType;
  entity_name: string;
  email: string;
  phone: string;
  photo?: string;
  document: string;
  /** Expected format: YYYY-MM-DD */
  birth_date: string;
}

/** Form values — mirrors SignUpRequest fields that the user fills in. */
export interface SignUpFormValues {
  name: string;
  email: string;
  password: string;
  birth_date: string;
  entity_type: EntityType;
  entity_name: string;
  phone: string;
  document: string;
}
