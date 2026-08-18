import { Service } from "@/types/service";

export const initialServices: Service[] = [
  {
    id: "service-1",
    name: "Corte",
    description: "Corte masculino tradicional.",
    durationMinutes: 45,
    price: 35,
    active: true,
  },
  {
    id: "service-2",
    name: "Corte + Barba",
    description: "Corte masculino acompanhado de barba completa.",
    durationMinutes: 60,
    price: 60,
    active: true,
  },
  {
    id: "service-3",
    name: "Barba",
    description: "Modelagem e acabamento completo da barba.",
    durationMinutes: 30,
    price: 30,
    active: true,
  },
  {
    id: "service-4",
    name: "Corte degradê",
    description: "Corte com degradê e acabamento.",
    durationMinutes: 45,
    price: 45,
    active: true,
  },
  {
    id: "service-5",
    name: "Sobrancelha",
    description: "Acabamento e alinhamento da sobrancelha.",
    durationMinutes: 15,
    price: 15,
    active: false,
  },
];
