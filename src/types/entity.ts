export interface CurrentEntity {
  id: string;
  name: string;
  type: "barbearia" | "studio" | "BARBERSHOP" | "BARBEARIA" | "barbershop";
  status: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  photo: string | null;
  zip_code: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}
