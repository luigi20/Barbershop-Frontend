export interface Service {
  id: string;
  name: string;
  description?: string;

  durationMinutes: number;
  price: number;

  active: boolean;
}

/** P2 backend catalog contract. Legacy Service remains for Agenda mocks. */
export interface CatalogService {
  id: string;
  entity_id: string;
  name: string;
  description: string | null;
  price: string;
  duration_minutes: number;
  status: "ativo" | "inativo";
  created_at: string;
  updated_at: string;
}
