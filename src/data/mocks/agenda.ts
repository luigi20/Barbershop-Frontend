import { Appointment } from "@/types/appointment";
import { Professional } from "@/types/professional";
import { Service } from "@/types/service";

function getDateKey(offset = 0) {
  const date = new Date();

  date.setDate(date.getDate() + offset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export const professionals: Professional[] = [
  {
    id: "professional-1",
    name: "Carlos Henrique",
    role: "Barbeiro",
    active: true,
  },
  {
    id: "professional-2",
    name: "Rafael Souza",
    role: "Barbeiro",
    active: true,
  },
  {
    id: "professional-3",
    name: "Matheus Lima",
    role: "Barbeiro",
    active: true,
  },
];

export const services: Service[] = [
  {
    id: "service-1",
    name: "Corte",
    description: "Corte masculino",
    durationMinutes: 45,
    price: 35,
    active: true,
  },
  {
    id: "service-2",
    name: "Corte + Barba",
    description: "Corte masculino e barba",
    durationMinutes: 60,
    price: 60,
    active: true,
  },
  {
    id: "service-3",
    name: "Barba",
    description: "Barba completa",
    durationMinutes: 30,
    price: 30,
    active: true,
  },
  {
    id: "service-4",
    name: "Corte degradê",
    description: "Corte com degradê",
    durationMinutes: 45,
    price: 45,
    active: true,
  },
];

export const initialAppointments: Appointment[] = [
  {
    id: "appointment-1",
    date: getDateKey(),
    startTime: "09:00",
    endTime: "10:00",
    customerName: "João Silva",
    professionalId: "professional-1",
    professionalName: "Carlos Henrique",
    serviceId: "service-2",
    serviceName: "Corte + Barba",
    price: 60,
    status: "confirmed",
  },
  {
    id: "appointment-2",
    date: getDateKey(),
    startTime: "10:30",
    endTime: "11:15",
    customerName: "Pedro Santos",
    professionalId: "professional-2",
    professionalName: "Rafael Souza",
    serviceId: "service-1",
    serviceName: "Corte",
    price: 35,
    status: "scheduled",
  },
  {
    id: "appointment-3",
    date: getDateKey(),
    startTime: "11:30",
    endTime: "12:00",
    customerName: "Lucas Almeida",
    professionalId: "professional-1",
    professionalName: "Carlos Henrique",
    serviceId: "service-3",
    serviceName: "Barba",
    price: 30,
    status: "confirmed",
  },
  {
    id: "appointment-4",
    date: getDateKey(),
    startTime: "14:00",
    endTime: "14:45",
    customerName: "Mateus Costa",
    professionalId: "professional-3",
    professionalName: "Matheus Lima",
    serviceId: "service-4",
    serviceName: "Corte degradê",
    price: 45,
    status: "scheduled",
  },

  // Amanhã
  {
    id: "appointment-5",
    date: getDateKey(1),
    startTime: "09:30",
    endTime: "10:15",
    customerName: "Gabriel Ferreira",
    professionalId: "professional-2",
    professionalName: "Rafael Souza",
    serviceId: "service-1",
    serviceName: "Corte",
    price: 35,
    status: "scheduled",
  },
];