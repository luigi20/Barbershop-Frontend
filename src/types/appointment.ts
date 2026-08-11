export type AppointmentStatus =
  "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";

export interface Appointment {
  id: string;

  date: string;

  startTime: string;
  endTime: string;

  customerName: string;

  professionalId: string;
  professionalName: string;

  serviceId: string;
  serviceName: string;

  price: number;

  status: AppointmentStatus;

  notes?: string;
}
