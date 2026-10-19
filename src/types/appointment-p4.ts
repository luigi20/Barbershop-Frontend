export type AppointmentStatus = "agendado" | "cancelado" | "concluido";

export interface AppointmentResponse {
  id: string;
  entity_id: string;
  customer_id: string;
  customer_name: string | null;
  professional_profile_id: string;
  professional_name: string | null;
  service_id: string;
  service_name: string;
  price: string;
  duration_minutes: number;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentAvailabilitySlot {
  starts_at: string;
  ends_at: string;
}

export interface AppointmentAvailabilityResponse {
  date: string;
  timezone: string;
  professional_profile_id: string;
  service_id: string;
  duration_minutes: number;
  slot_interval_minutes: number;
  slots: AppointmentAvailabilitySlot[];
}

export interface CreateAppointmentInput {
  customer_id: string;
  professional_profile_id: string;
  service_id: string;
  starts_at: string;
  notes?: string | null;
}
