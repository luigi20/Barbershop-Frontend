import type {
  AvailabilityTimezone,
  BlockInput,
  HourPeriod,
  HoursResponse,
  ProfessionalTimeBlock,
} from "@/types/availability";

async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`/api/availability${path}`, {
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
    throw new Error(message);
  }
  return data as T;
}

async function readHours(
  path: string,
  signal?: AbortSignal,
): Promise<HoursResponse> {
  const value = await request<HoursResponse | HourPeriod[]>(
    path,
    "GET",
    undefined,
    signal,
  );
  if (Array.isArray(value)) return { periods: value };
  if (value && Array.isArray(value.periods)) return value;
  throw new Error("Resposta de horários inválida.");
}

async function readBlocks(
  path: string,
  signal?: AbortSignal,
): Promise<ProfessionalTimeBlock[]> {
  const value = await request<ProfessionalTimeBlock[]>(
    path,
    "GET",
    undefined,
    signal,
  );
  if (Array.isArray(value)) return value;
  throw new Error("Resposta de bloqueios inválida.");
}

export const availabilityClient = {
  getTimezone: (signal?: AbortSignal) =>
    request<AvailabilityTimezone>("/timezone", "GET", undefined, signal),
  setTimezone: (timezone: string) =>
    request<AvailabilityTimezone>("/timezone", "PUT", { timezone }),
  getBusinessHours: (signal?: AbortSignal) =>
    readHours("/business-hours", signal),
  setBusinessHours: (periods: HourPeriod[]) =>
    request<HoursResponse>("/business-hours", "PUT", { periods }),
  getProfessionalHours: (profileId: string, signal?: AbortSignal) =>
    readHours(`/professionals/${encodeURIComponent(profileId)}/hours`, signal),
  setProfessionalHours: (profileId: string, periods: HourPeriod[]) =>
    request<HoursResponse>(
      `/professionals/${encodeURIComponent(profileId)}/hours`,
      "PUT",
      { periods },
    ),
  getBlocks: (
    profileId: string,
    from: string,
    to: string,
    signal?: AbortSignal,
  ) =>
    readBlocks(
      `/professionals/${encodeURIComponent(profileId)}/blocks?${new URLSearchParams({ from, to })}`,
      signal,
    ),
  createBlock: (profileId: string, input: BlockInput) =>
    request<ProfessionalTimeBlock>(
      `/professionals/${encodeURIComponent(profileId)}/blocks`,
      "POST",
      input,
    ),
  updateBlock: (profileId: string, blockId: string, input: BlockInput) =>
    request<ProfessionalTimeBlock>(
      `/professionals/${encodeURIComponent(profileId)}/blocks/${encodeURIComponent(blockId)}`,
      "PUT",
      input,
    ),
  deleteBlock: (profileId: string, blockId: string) =>
    request<unknown>(
      `/professionals/${encodeURIComponent(profileId)}/blocks/${encodeURIComponent(blockId)}`,
      "DELETE",
    ),
};
