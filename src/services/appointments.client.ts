import type {
  AppointmentAvailabilityResponse,
  AppointmentResponse,
  AppointmentStatus,
  CreateAppointmentInput,
} from "@/types/appointment-p4";

export class AppointmentClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "AppointmentClientError";
  }
}

async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`/api/appointments${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Não foi possível concluir a operação.";
    throw new AppointmentClientError(message, response.status);
  }
  return data as T;
}

export function listAppointments(
  query: {
    from: string;
    to: string;
    professional_profile_id?: string;
    customer_id?: string;
    status?: AppointmentStatus;
  },
  signal?: AbortSignal,
) {
  return request<AppointmentResponse[]>(
    `?${new URLSearchParams(query)}`,
    "GET",
    undefined,
    signal,
  );
}

export function getAppointment(id: string, signal?: AbortSignal) {
  return request<AppointmentResponse>(
    `/${encodeURIComponent(id)}`,
    "GET",
    undefined,
    signal,
  );
}

export function getAvailability(
  query: { date: string; professional_profile_id: string; service_id: string },
  signal?: AbortSignal,
) {
  return request<AppointmentAvailabilityResponse>(
    `/availability?${new URLSearchParams(query)}`,
    "GET",
    undefined,
    signal,
  );
}

export function createAppointment(input: CreateAppointmentInput) {
  return request<AppointmentResponse>("", "POST", input);
}

export function rescheduleAppointment(
  id: string,
  input: { starts_at: string; professional_profile_id?: string },
) {
  return request<AppointmentResponse>(
    `/${encodeURIComponent(id)}/reschedule`,
    "PUT",
    input,
  );
}

export function cancelAppointment(id: string, reason?: string | null) {
  return request<AppointmentResponse>(
    `/${encodeURIComponent(id)}/cancel`,
    "PUT",
    reason ? { reason } : {},
  );
}

export function completeAppointment(id: string) {
  return request<AppointmentResponse>(
    `/${encodeURIComponent(id)}/complete`,
    "PUT",
  );
}
