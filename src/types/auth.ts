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

export type EntityType = "BARBERSHOP";

/** Raw request body sent to POST /auth/signup on the NestJS backend. */
export interface SignUpRequest {
  email: string;
  name: string;
  password: string;
  entity_name: string;
  birth_date: string;
  phone: string;
  photo: string;
  entity_type: EntityType;
  document: string;
  zip_code: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
}

/** Form values — mirrors SignUpRequest fields that the user fills in. */
export type SignUpFormValues = SignUpRequest;

// ─── Select Entity types ──────────────────────────────────────────────────────

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

// ─── Profile types ────────────────────────────────────────────────────────────

export interface MeProfile {
  id: string;
  identity_id: string;
  name: string;
  photo: string | null;
  phone: string | null;
  roles: string[];
  created_at: string;
  updated_at: string;
}
