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
  login_token: string;
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

// ─── Select Entity types ──────────────────────────────────────────────────────

/** What the browser sends to POST /api/auth/select-entity (BFF). */
export interface SelectEntityClientRequest {
  entity_id: string;
  login_token: string;
}

/** What the BFF sends to POST /auth/select-entity (NestJS backend). */
export interface SelectEntityBackendRequest {
  /** The challenge token, read from the HttpOnly cookie by the BFF. */
  login_token: string;
  entity_id: string;
}

/** Backend response when MFA is required. */
export interface SelectEntityMfaResponse {
  mfa_required: true;
  mfa_token: string;
}

/** Backend response when MFA is NOT required. */
export interface SelectEntitySessionResponse {
  mfa_required: false;
  access_token: string;
  refresh_token: string;
}

/** Discriminated union of all confirmed backend responses. */
export type SelectEntityBackendResponse =
  SelectEntityMfaResponse | SelectEntitySessionResponse;

/** Safe response returned by the BFF to the browser — no tokens exposed. */
export interface SelectEntityClientResponse {
  mfa_required: boolean;
}
