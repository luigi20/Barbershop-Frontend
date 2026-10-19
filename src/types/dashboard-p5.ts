export type LocalDate = string;
export type UtcIsoTimestamp = string;
export type MoneyDecimal = string;

export interface DashboardTodayCounts {
  appointments_total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  upcoming: number;
}

export interface DashboardOperationsResponse {
  timezone: string;
  date: LocalDate;
  today: DashboardTodayCounts;
}

export interface DashboardSummaryResponse {
  timezone: string;
  date: LocalDate;
  today: DashboardTodayCounts & {
    revenue: MoneyDecimal;
  };
  month: {
    completed_appointments: number;
    cancelled_appointments: number;
    revenue: MoneyDecimal;
  };
  customers: {
    active: number;
  };
  professionals: {
    active_barbers: number;
  };
  services: {
    active: number;
  };
}

export interface UpcomingAppointment {
  appointment_id: string;
  customer_id: string;
  customer_name: string | null;
  professional_profile_id: string;
  professional_name: string | null;
  service_id: string;
  service_name_snapshot: string;
  starts_at: UtcIsoTimestamp;
  ends_at: UtcIsoTimestamp;
  status: "agendado";
  price_snapshot: MoneyDecimal;
}

export interface DashboardUpcomingResponse {
  timezone: string;
  appointments: UpcomingAppointment[];
}

export interface DashboardDayPoint {
  date: LocalDate;
  appointments: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  revenue: MoneyDecimal;
}

export interface DashboardTimeseriesResponse {
  timezone: string;
  from: LocalDate;
  to: LocalDate;
  points: DashboardDayPoint[];
}
