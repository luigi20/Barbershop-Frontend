export interface AvailabilityTimezone {
  timezone: string | null;
}

export interface HourPeriod {
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface HoursResponse {
  periods: HourPeriod[];
}

export interface BlockInput {
  starts_at: string;
  ends_at: string;
  reason?: string;
}

export interface ProfessionalTimeBlock {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
}
