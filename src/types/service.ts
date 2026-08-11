export interface Service {
  id: string;
  name: string;
  description?: string;

  durationMinutes: number;
  price: number;

  active: boolean;
}