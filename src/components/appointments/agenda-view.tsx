"use client";

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Scissors,
  UserRound,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  initialAppointments,
  professionals,
  services,
} from "@/data/mocks/agenda";

import { Appointment, AppointmentStatus } from "@/types/appointment";

const START_HOUR = 8;
const END_HOUR = 20;

function dateToKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function keyToInputDate(date: Date) {
  return dateToKey(date);
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);

  result.setDate(result.getDate() + amount);

  return result;
}

function isSameDay(a: Date, b: Date) {
  return dateToKey(a) === dateToKey(b);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);

  return hour * 60 + minute;
}

function minutesToTime(total: number) {
  const hour = Math.floor(total / 60);
  const minute = total % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function addMinutes(time: string, amount: number) {
  return minutesToTime(timeToMinutes(time) + amount);
}

function createTimeSlots() {
  const slots: string[] = [];

  for (let minutes = START_HOUR * 60; minutes < END_HOUR * 60; minutes += 15) {
    slots.push(minutesToTime(minutes));
  }

  return slots;
}

const timeSlots = createTimeSlots();

const statusConfig: Record<
  AppointmentStatus,
  {
    label: string;
    className: string;
  }
> = {
  scheduled: {
    label: "Agendado",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },

  confirmed: {
    label: "Confirmado",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },

  completed: {
    label: "Concluído",
    className: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  },

  cancelled: {
    label: "Cancelado",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },

  no_show: {
    label: "Faltou",
    className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
};

interface NewAppointmentForm {
  customerName: string;
  serviceId: string;
  professionalId: string;
  date: string;
  time: string;
}

export function AgendaView() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);

  const [selectedProfessional, setSelectedProfessional] = useState("all");

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);

  const [form, setForm] = useState<NewAppointmentForm>({
    customerName: "",
    serviceId: services[0]?.id ?? "",
    professionalId: professionals[0]?.id ?? "",
    date: keyToInputDate(new Date()),
    time: "09:00",
  });

  const selectedDateKey = dateToKey(selectedDate);

  const dayAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => appointment.date === selectedDateKey)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [appointments, selectedDateKey]);

  const mobileAppointments = useMemo(() => {
    if (selectedProfessional === "all") {
      return dayAppointments;
    }

    return dayAppointments.filter(
      (appointment) => appointment.professionalId === selectedProfessional,
    );
  }, [dayAppointments, selectedProfessional]);

  function previousDay() {
    setSelectedDate((current) => addDays(current, -1));
  }

  function nextDay() {
    setSelectedDate((current) => addDays(current, 1));
  }

  function goToday() {
    setSelectedDate(new Date());
  }

  function openNewAppointment() {
    setForm((current) => ({
      ...current,
      date: selectedDateKey,
    }));

    setNewAppointmentOpen(true);
  }

  function handleCreateAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const professional = professionals.find(
      (item) => item.id === form.professionalId,
    );

    const service = services.find((item) => item.id === form.serviceId);

    if (!professional || !service || !form.customerName.trim()) {
      return;
    }

    const appointment: Appointment = {
      id: crypto.randomUUID(),

      date: form.date,

      startTime: form.time,
      endTime: addMinutes(form.time, service.durationMinutes),

      customerName: form.customerName.trim(),

      professionalId: professional.id,
      professionalName: professional.name,

      serviceId: service.id,
      serviceName: service.name,

      price: service.price,

      status: "scheduled",
    };

    setAppointments((current) => [...current, appointment]);

    setNewAppointmentOpen(false);

    setSelectedDate(new Date(`${form.date}T12:00:00`));

    setForm({
      customerName: "",
      serviceId: services[0]?.id ?? "",
      professionalId: professionals[0]?.id ?? "",
      date: form.date,
      time: "09:00",
    });
  }

  return (
    <>
      <div>
        {/* CABEÇALHO */}

        <section className="mb-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--primary)]">
                Gestão de horários
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Agenda
              </h1>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Gerencie os horários e atendimentos da equipe.
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={goToday}
                className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--muted)] transition hover:text-white"
              >
                Hoje
              </button>

              <button
                onClick={openNewAppointment}
                className="flex h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-black transition hover:bg-[var(--primary-hover)]"
              >
                <Plus size={18} />
                Novo agendamento
              </button>
            </div>
          </div>

          {/* NAVEGAÇÃO DE DATA */}

          <div className="mt-6 flex items-center justify-between rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-2 sm:inline-flex">
            <button
              onClick={previousDay}
              className="flex size-10 items-center justify-center rounded-xl text-[var(--muted)] transition hover:bg-[var(--surface-secondary)] hover:text-white"
              aria-label="Dia anterior"
            >
              <ChevronLeft size={19} />
            </button>

            <button
              onClick={goToday}
              className="min-w-0 flex-1 px-3 text-center sm:min-w-[240px]"
            >
              <p className="truncate text-sm font-medium capitalize">
                {formatDate(selectedDate)}
              </p>

              {isSameDay(selectedDate, new Date()) && (
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-[var(--primary)]">
                  Hoje
                </p>
              )}
            </button>

            <button
              onClick={nextDay}
              className="flex size-10 items-center justify-center rounded-xl text-[var(--muted)] transition hover:bg-[var(--surface-secondary)] hover:text-white"
              aria-label="Próximo dia"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </section>

        {/* ================================================= */}
        {/* MOBILE */}
        {/* ================================================= */}

        <section className="lg:hidden">
          {/* FILTRO PROFISSIONAIS */}

          <div className="-mx-4 mb-4 overflow-x-auto px-4 scrollbar-none sm:-mx-6 sm:px-6">
            <div className="flex w-max gap-2">
              <button
                onClick={() => setSelectedProfessional("all")}
                className={`h-10 rounded-full border px-4 text-xs font-medium transition ${
                  selectedProfessional === "all"
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
                }`}
              >
                Todos
              </button>

              {professionals.map((professional) => {
                const active = selectedProfessional === professional.id;

                return (
                  <button
                    key={professional.id}
                    onClick={() => setSelectedProfessional(professional.id)}
                    className={`h-10 rounded-full border px-4 text-xs font-medium transition ${
                      active
                        ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
                    }`}
                  >
                    {professional.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LISTA MOBILE */}

          <div className="space-y-3">
            {mobileAppointments.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
                <CalendarDays
                  size={28}
                  className="mx-auto text-[var(--muted-foreground)]"
                />

                <p className="mt-4 text-sm font-medium">Nenhum agendamento</p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Não existem horários agendados para este dia.
                </p>

                <button
                  onClick={openNewAppointment}
                  className="mt-5 text-sm font-medium text-[var(--primary)]"
                >
                  Criar agendamento
                </button>
              </div>
            )}

            {mobileAppointments.map((appointment) => {
              const status = statusConfig[appointment.status];

              return (
                <button
                  key={appointment.id}
                  onClick={() => setSelectedAppointment(appointment)}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 text-left transition active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex min-w-[52px] flex-col items-center rounded-xl bg-[var(--primary-soft)] px-2 py-2 text-[var(--primary)]">
                      <Clock3 size={16} />

                      <span className="mt-1 text-xs font-semibold">
                        {appointment.startTime}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {appointment.customerName}
                          </p>

                          <p className="mt-1 truncate text-xs text-[var(--muted)]">
                            {appointment.serviceName}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                          <UserRound size={12} />

                          {appointment.professionalName.split(" ")[0]}
                        </div>

                        <span className="text-[11px] text-[var(--muted)]">
                          {appointment.startTime} - {appointment.endTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================================================= */}
        {/* DESKTOP */}
        {/* ================================================= */}

        <section className="hidden lg:block">
          <div className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)]">
            <div className="overflow-x-auto">
              <div
                className="grid min-w-[950px]"
                style={{
                  gridTemplateColumns: `76px repeat(${professionals.length}, minmax(250px, 1fr))`,
                  gridTemplateRows: `72px repeat(${timeSlots.length}, 24px)`,
                }}
              >
                {/* CANTO SUPERIOR */}

                <div
                  className="sticky left-0 z-30 border-b border-r border-[var(--border-soft)] bg-[#101010]"
                  style={{
                    gridColumn: 1,
                    gridRow: 1,
                  }}
                />

                {/* CABEÇALHO PROFISSIONAIS */}

                {professionals.map((professional, index) => (
                  <div
                    key={professional.id}
                    className="z-20 flex items-center gap-3 border-b border-r border-[var(--border-soft)] bg-[#101010] px-4 last:border-r-0"
                    style={{
                      gridColumn: index + 2,
                      gridRow: 1,
                    }}
                  >
                    <div className="flex size-9 items-center justify-center rounded-full bg-[var(--primary-soft)] text-xs font-semibold text-[var(--primary)]">
                      {professional.name
                        .split(" ")
                        .slice(0, 2)
                        .map((name) => name[0])
                        .join("")}
                    </div>

                    <div>
                      <p className="text-sm font-medium">{professional.name}</p>

                      <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                        {professional.role}
                      </p>
                    </div>
                  </div>
                ))}

                {/* HORÁRIOS */}

                {timeSlots.map((time, index) => {
                  const minute = timeToMinutes(time) % 60;

                  const showLabel = minute === 0;

                  return (
                    <div
                      key={`time-${time}`}
                      className={`sticky left-0 z-10 border-r border-[var(--border-soft)] bg-[#101010] pr-3 text-right text-[10px] text-[var(--muted)] ${
                        minute === 0
                          ? "border-t border-[#292929]"
                          : minute === 30
                            ? "border-t border-[#1d1d1d]"
                            : ""
                      }`}
                      style={{
                        gridColumn: 1,
                        gridRow: index + 2,
                      }}
                    >
                      {showLabel && (
                        <span className="relative -top-2">{time}</span>
                      )}
                    </div>
                  );
                })}

                {/* GRID BACKGROUND */}

                {professionals.flatMap((professional, professionalIndex) =>
                  timeSlots.map((time, slotIndex) => {
                    const minute = timeToMinutes(time) % 60;

                    return (
                      <div
                        key={`${professional.id}-${time}`}
                        className={`border-r border-[var(--border-soft)] last:border-r-0 ${
                          minute === 0
                            ? "border-t border-[#292929]"
                            : minute === 30
                              ? "border-t border-[#1d1d1d]"
                              : ""
                        }`}
                        style={{
                          gridColumn: professionalIndex + 2,
                          gridRow: slotIndex + 2,
                        }}
                      />
                    );
                  }),
                )}

                {/* AGENDAMENTOS */}

                {dayAppointments.map((appointment) => {
                  const professionalIndex = professionals.findIndex(
                    (professional) =>
                      professional.id === appointment.professionalId,
                  );

                  if (professionalIndex < 0) {
                    return null;
                  }

                  const startIndex = timeSlots.indexOf(appointment.startTime);

                  if (startIndex < 0) {
                    return null;
                  }

                  const duration =
                    timeToMinutes(appointment.endTime) -
                    timeToMinutes(appointment.startTime);

                  const rowSpan = Math.max(1, Math.ceil(duration / 15));

                  const status = statusConfig[appointment.status];

                  return (
                    <button
                      key={appointment.id}
                      onClick={() => setSelectedAppointment(appointment)}
                      className="z-10 m-1 overflow-hidden rounded-lg border border-[var(--primary)]/20 bg-[#211a0f] p-2 text-left transition hover:border-[var(--primary)]/50 hover:bg-[#271f12]"
                      style={{
                        gridColumn: professionalIndex + 2,

                        gridRow: `${startIndex + 2} / span ${rowSpan}`,
                      }}
                    >
                      <div className="flex h-full flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-xs font-semibold text-white">
                            {appointment.customerName}
                          </p>

                          <span className="text-[9px] text-[var(--primary)]">
                            {appointment.startTime}
                          </span>
                        </div>

                        {rowSpan >= 2 && (
                          <p className="mt-1 truncate text-[10px] text-[#c7a66a]">
                            {appointment.serviceName}
                          </p>
                        )}

                        {rowSpan >= 3 && (
                          <span
                            className={`mt-auto w-fit rounded-full border px-1.5 py-0.5 text-[8px] ${status.className}`}
                          >
                            {status.label}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ================================================= */}
      {/* FAB MOBILE */}
      {/* ================================================= */}

      <button
        onClick={openNewAppointment}
        className="fixed bottom-24 right-5 z-30 flex size-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-black shadow-xl shadow-black/30 transition active:scale-95 sm:hidden"
        aria-label="Novo agendamento"
      >
        <Plus size={24} />
      </button>

      {/* ================================================= */}
      {/* DETALHES DO AGENDAMENTO */}
      {/* ================================================= */}

      {selectedAppointment && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6">
          <button
            onClick={() => setSelectedAppointment(null)}
            className="absolute inset-0"
            aria-label="Fechar detalhes"
          />

          <div className="relative z-10 w-full rounded-t-[28px] border border-[var(--border)] bg-[#111111] p-5 sm:max-w-md sm:rounded-2xl sm:p-6">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#333] sm:hidden" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--primary)]">
                  Agendamento
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {selectedAppointment.customerName}
                </h2>
              </div>

              <button
                onClick={() => setSelectedAppointment(null)}
                className="flex size-10 items-center justify-center rounded-xl bg-[var(--surface-secondary)] text-[var(--muted)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <DetailRow
                icon={<Scissors size={17} />}
                label="Serviço"
                value={selectedAppointment.serviceName}
              />

              <DetailRow
                icon={<UserRound size={17} />}
                label="Profissional"
                value={selectedAppointment.professionalName}
              />

              <DetailRow
                icon={<Clock3 size={17} />}
                label="Horário"
                value={`${selectedAppointment.startTime} - ${selectedAppointment.endTime}`}
              />

              <DetailRow
                icon={<CalendarDays size={17} />}
                label="Data"
                value={new Intl.DateTimeFormat("pt-BR").format(
                  new Date(`${selectedAppointment.date}T12:00:00`),
                )}
              />
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl border border-[var(--border-soft)] bg-[#0c0c0c] p-4">
              <span className="text-sm text-[var(--muted)]">Valor</span>

              <span className="font-semibold text-[var(--primary)]">
                {formatCurrency(selectedAppointment.price)}
              </span>
            </div>

            <div className="mt-4">
              <span
                className={`inline-flex rounded-full border px-3 py-1.5 text-xs ${
                  statusConfig[selectedAppointment.status].className
                }`}
              >
                {statusConfig[selectedAppointment.status].label}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* NOVO AGENDAMENTO */}
      {/* ================================================= */}

      {newAppointmentOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6">
          <button
            className="absolute inset-0"
            onClick={() => setNewAppointmentOpen(false)}
            aria-label="Fechar novo agendamento"
          />

          <form
            onSubmit={handleCreateAppointment}
            className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-[var(--border)] bg-[#111111] p-5 sm:max-w-lg sm:rounded-2xl sm:p-6"
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#333] sm:hidden" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--primary)]">
                  Agenda
                </p>

                <h2 className="mt-1 text-xl font-semibold">Novo agendamento</h2>
              </div>

              <button
                type="button"
                onClick={() => setNewAppointmentOpen(false)}
                className="flex size-10 items-center justify-center rounded-xl bg-[var(--surface-secondary)] text-[var(--muted)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {/* CLIENTE */}

              <div>
                <label className="mb-2 block text-xs font-medium text-[var(--muted)]">
                  Cliente
                </label>

                <input
                  value={form.customerName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      customerName: event.target.value,
                    }))
                  }
                  placeholder="Nome do cliente"
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-[#0b0b0b] px-4 text-sm outline-none transition placeholder:text-[#555] focus:border-[var(--primary)]"
                />
              </div>

              {/* SERVIÇO */}

              <div>
                <label className="mb-2 block text-xs font-medium text-[var(--muted)]">
                  Serviço
                </label>

                <select
                  value={form.serviceId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      serviceId: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-[#0b0b0b] px-4 text-sm outline-none focus:border-[var(--primary)]"
                >
                  {services.map((service) => (
                    <option value={service.id} key={service.id}>
                      {service.name} • {service.durationMinutes} min •{" "}
                      {formatCurrency(service.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* PROFISSIONAL */}

              <div>
                <label className="mb-2 block text-xs font-medium text-[var(--muted)]">
                  Profissional
                </label>

                <select
                  value={form.professionalId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      professionalId: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-[#0b0b0b] px-4 text-sm outline-none focus:border-[var(--primary)]"
                >
                  {professionals.map((professional) => (
                    <option value={professional.id} key={professional.id}>
                      {professional.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DATA + HORA */}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-xs font-medium text-[var(--muted)]">
                    Data
                  </label>

                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-xl border border-[var(--border)] bg-[#0b0b0b] px-3 text-sm outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[var(--muted)]">
                    Horário
                  </label>

                  <input
                    type="time"
                    value={form.time}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        time: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-xl border border-[var(--border)] bg-[#0b0b0b] px-3 text-sm outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setNewAppointmentOpen(false)}
                className="h-12 flex-1 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--muted)]"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-sm font-semibold text-black"
              >
                <Check size={18} />
                Criar agendamento
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border-soft)] bg-[#0c0c0c] p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
