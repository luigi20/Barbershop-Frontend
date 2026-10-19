export type EntityCustomerStatus = "ativo" | "inativo" | "bloqueado";

export interface EntityCustomer {
  entity_id: string;
  customer_id: string;
  profile_id: string | null;
  email: string | null;
  entity_name: string;
  profile_name: string;
  phone: string | null;
  photo: string | null;
  birth_date: string | null;
  notes: string | null;
  status: EntityCustomerStatus;
  created_at: string;
  updated_at: string;
}
