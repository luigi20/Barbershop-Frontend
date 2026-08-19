export type CustomerStatus = "active" | "inactive";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  status: CustomerStatus;
  createdAt: string;
  totalAppointments: number;
  totalSpent: number;
}
