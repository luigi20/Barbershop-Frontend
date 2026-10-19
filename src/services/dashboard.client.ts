import type {
  DashboardOperationsResponse,
  DashboardSummaryResponse,
  DashboardTimeseriesResponse,
  DashboardUpcomingResponse,
  LocalDate,
} from "@/types/dashboard-p5";

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/dashboard${path}`, {
    headers: { Accept: "application/json" },
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
        : "Não foi possível carregar os dados do Dashboard.";
    throw new Error(message);
  }
  return data as T;
}

export function getDashboardOperations(signal?: AbortSignal) {
  return request<DashboardOperationsResponse>("/operations", signal);
}

export function getDashboardSummary(signal?: AbortSignal) {
  return request<DashboardSummaryResponse>("/summary", signal);
}

export function getDashboardUpcoming(limit = 5, signal?: AbortSignal) {
  return request<DashboardUpcomingResponse>(`/upcoming?limit=${limit}`, signal);
}

export function getDashboardTimeseries(
  from: LocalDate,
  to: LocalDate,
  signal?: AbortSignal,
) {
  return request<DashboardTimeseriesResponse>(
    `/timeseries?${new URLSearchParams({ from, to })}`,
    signal,
  );
}
