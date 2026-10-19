"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  entityDayRange,
  formatEntityBlock,
  isoToEntityFields,
} from "@/lib/availability-time";
import { cn } from "@/lib/utils";
import {
  AppointmentClientError,
  cancelAppointment,
  completeAppointment,
  createAppointment,
  getAppointment,
  getAvailability,
  listAppointments,
  rescheduleAppointment,
} from "@/services/appointments.client";
import { availabilityClient } from "@/services/availability.client";
import { getCustomers } from "@/services/customers.client";
import { getMembers } from "@/services/members.client";
import type {
  AppointmentAvailabilitySlot,
  AppointmentResponse,
} from "@/types/appointment-p4";
import type { EntityCustomer } from "@/types/entity-customer";
import type { EntityMembershipListItem } from "@/types/entity-membership";
import type { CatalogService } from "@/types/service";

type LoadState = "idle" | "loading" | "success" | "empty" | "error";
type EditorMode = "create" | "reschedule";
type Action = "cancel" | "complete";
type AgendaMode = "today" | "upcoming" | "calendar";
type Form = {
  customerId: string;
  serviceId: string;
  professionalId: string;
  date: string;
  slot: string;
  notes: string;
};

const statusLabel = {
  agendado: "Agendado",
  cancelado: "Cancelado",
  concluido: "Concluído",
};
const statusClass = {
  agendado:
    "border-[var(--primary)]/30 bg-[var(--primary-soft)] text-[var(--primary)]",
  concluido:
    "border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)]",
  cancelado:
    "border-[var(--danger)]/30 bg-[var(--danger)]/10 text-[var(--danger)]",
};
const fieldClass =
  "min-h-11 w-full rounded-xl border border-[var(--border)] bg-[#0b0b0b] px-3 text-sm text-white focus:border-[var(--primary)]";
const buttonClass =
  "min-h-11 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50";

function nextDate(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function localToday(zone: string) {
  return isoToEntityFields(new Date().toISOString(), zone).date;
}

function displayDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function groupDateLabel(date: string, today: string) {
  if (date === today) return "Hoje";
  if (date === nextDate(today, 1)) return "Amanhã";
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function displayPrice(price: string) {
  const [integer, cents = "00"] = price.split(".");
  return `R$ ${integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${cents.padEnd(2, "0")}`;
}

function errorMessage(cause: unknown) {
  return cause instanceof Error
    ? cause.message
    : "Não foi possível concluir a operação.";
}

async function getServices(signal: AbortSignal): Promise<CatalogService[]> {
  const response = await fetch("/api/services", {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Não foi possível carregar os serviços.");
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("Resposta de serviços inválida.");
  return data as CatalogService[];
}

export function AgendaView({ canManage }: { canManage: boolean }) {
  const [mode, setMode] = useState<AgendaMode>(
    canManage ? "upcoming" : "today",
  );
  const [zone, setZone] = useState<string | null>(null);
  const [zoneError, setZoneError] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [reload, setReload] = useState(0);
  const [items, setItems] = useState<AppointmentResponse[]>([]);
  const [loadedRange, setLoadedRange] = useState<string | null>(null);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  const initialLinkHandled = useRef(false);
  const [listState, setListState] = useState<LoadState>("idle");
  const [listError, setListError] = useState<string | null>(null);
  const [professionalFilter, setProfessionalFilter] = useState("");
  const [customers, setCustomers] = useState<EntityCustomer[]>([]);
  const [members, setMembers] = useState<EntityMembershipListItem[]>([]);
  const [services, setServices] = useState<CatalogService[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(canManage);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AppointmentResponse | null>(null);
  const [detailState, setDetailState] = useState<LoadState>("idle");
  const [detailError, setDetailError] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorMode | null>(null);
  const [form, setForm] = useState<Form>({
    customerId: "",
    serviceId: "",
    professionalId: "",
    date: "",
    slot: "",
    notes: "",
  });
  const [slots, setSlots] = useState<AppointmentAvailabilitySlot[]>([]);
  const [availabilityState, setAvailabilityState] = useState<LoadState>("idle");
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );
  const [availabilityReload, setAvailabilityReload] = useState(0);
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<Action | null>(null);
  const [actionSaving, setActionSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    availabilityClient
      .getTimezone(controller.signal)
      .then((result) => {
        if (!result.timezone)
          throw new Error("O fuso horário da unidade não está configurado.");
        setZone(result.timezone);
        setDate(localToday(result.timezone));
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setZoneError(errorMessage(cause));
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!canManage) return;
    const controller = new AbortController();
    Promise.all([
      getCustomers(controller.signal),
      getMembers(controller.signal),
      getServices(controller.signal),
    ])
      .then(([customerList, memberList, serviceList]) => {
        setCustomers(customerList.filter((item) => item.status === "ativo"));
        setMembers(
          memberList.filter(
            (item) =>
              item.status === "ativo" && item.roles.includes("barbeiro"),
          ),
        );
        setServices(serviceList.filter((item) => item.status === "ativo"));
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setCatalogError(errorMessage(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted) setCatalogLoading(false);
      });
    return () => controller.abort();
  }, [canManage]);

  useEffect(() => {
    if (!zone || !date || initialLinkHandled.current) return;
    let active = true;
    queueMicrotask(() => {
      if (!active || initialLinkHandled.current) return;
      initialLinkHandled.current = true;
      const params = new URLSearchParams(window.location.search);
      const appointmentId = params.get("appointment");
      if (appointmentId) setDetailId(appointmentId);
      if (canManage && params.get("new") === "1") {
        setForm({
          customerId: "",
          serviceId: "",
          professionalId: "",
          date: localToday(zone),
          slot: "",
          notes: "",
        });
        setEditor("create");
      }
    });
    return () => {
      active = false;
    };
  }, [canManage, date, zone]);

  const today = zone ? localToday(zone) : "";
  const rangeDate = mode === "calendar" ? date : today;
  const rangeKey = `${mode}:${rangeDate}`;

  useEffect(() => {
    if (!zone || !rangeDate) return;
    const firstDay = entityDayRange(rangeDate, zone);
    const lastDay =
      mode === "upcoming"
        ? entityDayRange(nextDate(rangeDate, 30), zone)
        : null;
    const range =
      firstDay && (mode !== "upcoming" || lastDay)
        ? { from: firstDay.from, to: lastDay?.from ?? firstDay.to }
        : null;
    if (!range) {
      queueMicrotask(() => {
        setListState("error");
        setListError("Data inválida para o fuso da unidade.");
      });
      return;
    }
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setListState("loading");
        setListError(null);
      }
    });
    // Barbeiro never sends professional_profile_id; the backend scopes the result.
    listAppointments(range, controller.signal)
      .then((value) => {
        if (!Array.isArray(value))
          throw new Error("Resposta de agendamentos inválida.");
        setItems(value);
        setLoadedRange(rangeKey);
        if (mode === "upcoming") {
          setHighlightedDates(
            Array.from(
              new Set(
                value.map(
                  (item) => isoToEntityFields(item.starts_at, zone).date,
                ),
              ),
            ).sort(),
          );
        }
        setListState(value.length ? "success" : "empty");
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setListError(errorMessage(cause));
          setListState("error");
        }
      });
    return () => controller.abort();
  }, [zone, rangeDate, rangeKey, mode, reload]);

  useEffect(() => {
    if (!detailId) return;
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setDetailState("loading");
        setDetailError(null);
      }
    });
    getAppointment(detailId, controller.signal)
      .then((value) => {
        setDetail(value);
        setDetailState("success");
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setDetailError(errorMessage(cause));
          setDetailState("error");
        }
      });
    return () => controller.abort();
  }, [detailId]);

  useEffect(() => {
    if (!editor) return;
    if (!form.date || !form.professionalId || !form.serviceId) {
      queueMicrotask(() => setAvailabilityState("idle"));
      return;
    }
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setSlots([]);
        setAvailabilityState("loading");
        setAvailabilityError(null);
      }
    });
    getAvailability(
      {
        date: form.date,
        professional_profile_id: form.professionalId,
        service_id: form.serviceId,
      },
      controller.signal,
    )
      .then((value) => {
        if (!Array.isArray(value.slots))
          throw new Error("Resposta de disponibilidade inválida.");
        setSlots(value.slots);
        setAvailabilityState(value.slots.length ? "success" : "empty");
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setAvailabilityError(errorMessage(cause));
          setAvailabilityState("error");
        }
      });
    return () => controller.abort();
  }, [
    editor,
    form.date,
    form.professionalId,
    form.serviceId,
    availabilityReload,
  ]);

  const shownItems = useMemo(
    () =>
      items
        .filter(
          (item) =>
            !professionalFilter ||
            item.professional_profile_id === professionalFilter,
        )
        .sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    [items, professionalFilter],
  );
  const groups = useMemo(() => {
    const byDate = new Map<string, AppointmentResponse[]>();
    if (!zone) return [];
    for (const item of shownItems) {
      const day = isoToEntityFields(item.starts_at, zone).date;
      const group = byDate.get(day) ?? [];
      group.push(item);
      byDate.set(day, group);
    }
    return Array.from(byDate, ([day, appointments]) => ({
      day,
      appointments,
    })).sort((a, b) => a.day.localeCompare(b.day));
  }, [shownItems, zone]);

  const refresh = useCallback(() => setReload((value) => value + 1), []);

  function openCreate() {
    setEditorError(null);
    setForm({
      customerId: "",
      serviceId: "",
      professionalId: "",
      date: mode === "calendar" ? date : today,
      slot: "",
      notes: "",
    });
    setEditor("create");
  }

  function openReschedule() {
    if (!detail || detail.status !== "agendado" || !zone) return;
    setEditorError(null);
    setForm({
      customerId: detail.customer_id,
      serviceId: detail.service_id,
      professionalId: detail.professional_profile_id,
      date: isoToEntityFields(detail.starts_at, zone).date,
      slot: "",
      notes: "",
    });
    setEditor("reschedule");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.slot || !editor) return;
    setSaving(true);
    setEditorError(null);
    try {
      const result =
        editor === "create"
          ? await createAppointment({
              customer_id: form.customerId,
              professional_profile_id: form.professionalId,
              service_id: form.serviceId,
              starts_at: form.slot,
              ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
            })
          : await rescheduleAppointment(detail!.id, {
              starts_at: form.slot,
              professional_profile_id: form.professionalId,
            });
      setEditor(null);
      if (editor === "reschedule") setDetail(result);
      if (zone) {
        setDate(isoToEntityFields(result.starts_at, zone).date);
        setMode("calendar");
      }
      refresh();
    } catch (cause) {
      if (cause instanceof AppointmentClientError && cause.statusCode === 409) {
        setEditorError("O horário selecionado não está mais disponível.");
        setForm((current) => ({ ...current, slot: "" }));
        setAvailabilityReload((value) => value + 1);
      } else setEditorError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function runAction() {
    if (!detail || !confirmAction) return;
    setActionSaving(true);
    setActionError(null);
    try {
      const result =
        confirmAction === "cancel"
          ? await cancelAppointment(detail.id)
          : await completeAppointment(detail.id);
      setDetail(result);
      setConfirmAction(null);
      refresh();
    } catch (cause) {
      setActionError(
        cause instanceof AppointmentClientError && cause.statusCode === 409
          ? "O estado do agendamento mudou. Atualize o detalhe e tente novamente."
          : errorMessage(cause),
      );
    } finally {
      setActionSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--primary)]">
            Gestão de horários
          </p>
          <h1 className="mt-1 text-3xl font-semibold">Agenda</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Agendamentos da unidade
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={openCreate}
            disabled={!zone || catalogLoading}
            className={cn(buttonClass, "hidden items-center gap-2 lg:flex")}
          >
            <Plus size={18} /> Novo agendamento
          </button>
        )}
      </header>

      {canManage && !editor && !detailId && (
        <button
          type="button"
          onClick={openCreate}
          disabled={!zone || catalogLoading}
          className={cn(
            buttonClass,
            "fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-30 flex items-center gap-2 shadow-lg lg:hidden",
          )}
        >
          <Plus size={18} /> Novo agendamento
        </button>
      )}

      <nav
        aria-label="Visão da Agenda"
        className="grid grid-cols-3 gap-2 rounded-2xl bg-[var(--surface)] p-1"
      >
        {(
          [
            ["today", "Hoje"],
            ["upcoming", "Próximos"],
            ["calendar", "Calendário"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-current={mode === value ? "page" : undefined}
            onClick={() => setMode(value)}
            className={cn(
              "min-h-11 rounded-xl px-2 text-sm font-medium transition-colors",
              mode === value
                ? "bg-[var(--primary)] text-black"
                : "text-[var(--muted)] hover:text-white",
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      {mode === "calendar" && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-label="Dia anterior"
            onClick={() => setDate(nextDate(date, -1))}
            disabled={!date}
            className={cn(fieldClass, "w-11")}
          >
            <ChevronLeft className="mx-auto" size={18} />
          </button>
          <input
            aria-label="Data da agenda"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={cn(fieldClass, "w-auto flex-1 sm:flex-none")}
          />
          <button
            type="button"
            aria-label="Próximo dia"
            onClick={() => setDate(nextDate(date, 1))}
            disabled={!date}
            className={cn(fieldClass, "w-11")}
          >
            <ChevronRight className="mx-auto" size={18} />
          </button>
          {zone && (
            <button
              type="button"
              onClick={() => setDate(localToday(zone))}
              className={cn(fieldClass, "w-auto px-4")}
            >
              Hoje
            </button>
          )}
        </div>
      )}
      {canManage && members.length > 0 && (
        <select
          aria-label="Filtrar profissional"
          value={professionalFilter}
          onChange={(event) => setProfessionalFilter(event.target.value)}
          className={cn(fieldClass, "sm:w-auto")}
        >
          <option value="">Todos os profissionais</option>
          {members.map((member) => (
            <option key={member.profile_id} value={member.profile_id}>
              {member.profile_name ?? member.email ?? member.profile_id}
            </option>
          ))}
        </select>
      )}
      {mode === "calendar" && highlightedDates.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-[var(--muted)]">
            Dias com atendimentos nos próximos 30 dias
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {highlightedDates.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setDate(day)}
                aria-pressed={date === day}
                className={cn(
                  "min-h-11 shrink-0 rounded-xl border px-3 text-sm",
                  date === day
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--muted)]",
                )}
              >
                {groupDateLabel(day, today)}
              </button>
            ))}
          </div>
        </div>
      )}
      {rangeDate && (
        <p className="text-sm capitalize text-[var(--muted)]">
          {mode === "upcoming"
            ? `${displayDate(rangeDate)} até ${displayDate(nextDate(rangeDate, 29))}`
            : displayDate(rangeDate)}{" "}
          · {zone}
        </p>
      )}
      {zoneError && (
        <p role="alert" className="text-sm text-red-400">
          {zoneError}
        </p>
      )}
      {catalogError && canManage && (
        <p role="alert" className="text-sm text-red-400">
          Cadastros indisponíveis: {catalogError}
        </p>
      )}
      {listState === "loading" && (
        <p role="status">
          Carregando{" "}
          {mode === "upcoming" ? "próximos atendimentos" : "atendimentos"}...
        </p>
      )}
      {listState === "error" && (
        <div
          role="alert"
          className="rounded-2xl border border-red-500/30 bg-[var(--surface)] p-5"
        >
          {listError}
          <button
            type="button"
            onClick={refresh}
            className="ml-3 text-[var(--primary)]"
          >
            Tentar novamente
          </button>
        </div>
      )}
      {loadedRange === rangeKey &&
        (listState === "empty" || listState === "success") &&
        shownItems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
            <CalendarDays className="mx-auto text-[var(--muted)]" />
            <p className="mt-3">
              {mode === "today"
                ? "Nenhum atendimento agendado para hoje."
                : mode === "upcoming"
                  ? "Nenhum atendimento nos próximos 30 dias."
                  : "Nenhum atendimento nesta data."}
            </p>
          </div>
        )}
      {loadedRange === rangeKey &&
        (listState === "success" ||
          listState === "loading" ||
          listState === "error") &&
        shownItems.length > 0 && (
          <div className="space-y-6">
            {groups.map(({ day, appointments }) => (
              <section key={day} aria-label={groupDateLabel(day, today)}>
                <h2 className="mb-3 border-b border-[var(--border)] pb-2 text-sm font-semibold capitalize">
                  {groupDateLabel(day, today)}
                </h2>
                <div className="space-y-2">
                  {appointments.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setDetail(null);
                        setDetailId(item.id);
                      }}
                      className="block min-h-20 w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 text-left transition-colors hover:border-[var(--primary)] focus-visible:border-[var(--primary)]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-lg font-semibold text-[var(--primary)]">
                          {zone && isoToEntityFields(item.starts_at, zone).time}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-1 text-xs",
                            statusClass[item.status],
                          )}
                        >
                          {statusLabel[item.status]}
                        </span>
                      </div>
                      <p className="mt-3 font-semibold">
                        {item.customer_name ?? "Cliente"}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {item.service_name}
                      </p>
                      <p className="mt-3 text-xs text-[var(--muted)]">
                        {item.professional_name ?? "Profissional"} ·{" "}
                        {item.duration_minutes} min
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

      {detailId && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailId(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Detalhe do agendamento"
            className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-[var(--border)] bg-[#111] p-5 sm:max-w-lg sm:rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Agendamento</h2>
              <button
                type="button"
                aria-label="Fechar detalhe"
                onClick={() => setDetailId(null)}
              >
                <X size={20} />
              </button>
            </div>
            {detailState === "loading" && (
              <p role="status" className="mt-5">
                Carregando detalhe...
              </p>
            )}
            {detailState === "error" && (
              <p role="alert" className="mt-5 text-red-400">
                {detailError}
              </p>
            )}
            {detailState === "success" && detail && zone && (
              <div className="mt-5 space-y-3 text-sm">
                <DetailRow
                  label="Cliente"
                  value={detail.customer_name ?? "Não informado"}
                />
                <DetailRow
                  label="Profissional"
                  value={detail.professional_name ?? "Não informado"}
                />
                <DetailRow label="Serviço" value={detail.service_name} />
                <DetailRow label="Valor" value={displayPrice(detail.price)} />
                <DetailRow
                  label="Duração"
                  value={`${detail.duration_minutes} min`}
                />
                <DetailRow
                  label="Início"
                  value={formatEntityBlock(detail.starts_at, zone)}
                />
                <DetailRow
                  label="Fim"
                  value={formatEntityBlock(detail.ends_at, zone)}
                />
                <DetailRow label="Status" value={statusLabel[detail.status]} />
                {detail.notes && (
                  <DetailRow label="Observações" value={detail.notes} />
                )}
                {detail.cancellation_reason && (
                  <DetailRow
                    label="Motivo do cancelamento"
                    value={detail.cancellation_reason}
                  />
                )}
                {detail.cancelled_at && (
                  <DetailRow
                    label="Cancelado em"
                    value={formatEntityBlock(detail.cancelled_at, zone)}
                  />
                )}
                {detail.completed_at && (
                  <DetailRow
                    label="Concluído em"
                    value={formatEntityBlock(detail.completed_at, zone)}
                  />
                )}
                {canManage && detail.status === "agendado" && (
                  <div className="flex flex-wrap gap-2 pt-4">
                    <button
                      type="button"
                      onClick={openReschedule}
                      className={buttonClass}
                    >
                      Reagendar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionError(null);
                        setConfirmAction("complete");
                      }}
                      className={cn(fieldClass, "w-auto px-4")}
                    >
                      Concluir
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionError(null);
                        setConfirmAction("cancel");
                      }}
                      className="min-h-11 rounded-xl border border-red-500/40 px-4 text-sm text-red-400"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {editor && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 sm:items-center sm:p-5">
          <form
            onSubmit={save}
            className="max-h-[92dvh] w-full space-y-4 overflow-y-auto rounded-t-3xl border border-[var(--border)] bg-[#111] p-5 sm:max-w-lg sm:rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editor === "create" ? "Novo agendamento" : "Reagendar"}
              </h2>
              <button
                type="button"
                aria-label="Fechar formulário"
                disabled={saving}
                onClick={() => setEditor(null)}
              >
                <X size={20} />
              </button>
            </div>
            {editor === "create" && (
              <label className="block space-y-2 text-sm">
                <span>Cliente</span>
                <select
                  required
                  value={form.customerId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      customerId: event.target.value,
                    }))
                  }
                  className={fieldClass}
                >
                  <option value="">Selecione</option>
                  {customers.map((customer) => (
                    <option
                      key={customer.customer_id}
                      value={customer.customer_id}
                    >
                      {customer.profile_name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {editor === "create" && (
              <label className="block space-y-2 text-sm">
                <span>Serviço ativo</span>
                <select
                  required
                  value={form.serviceId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      serviceId: event.target.value,
                      slot: "",
                    }))
                  }
                  className={fieldClass}
                >
                  <option value="">Selecione</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} · {service.duration_minutes} min ·{" "}
                      {displayPrice(service.price)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="block space-y-2 text-sm">
              <span>Barbeiro</span>
              <select
                required
                value={form.professionalId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    professionalId: event.target.value,
                    slot: "",
                  }))
                }
                className={fieldClass}
              >
                <option value="">Selecione</option>
                {members.map((member) => (
                  <option key={member.profile_id} value={member.profile_id}>
                    {member.profile_name ?? member.email ?? member.profile_id}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2 text-sm">
              <span>Data da unidade</span>
              <input
                required
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    date: event.target.value,
                    slot: "",
                  }))
                }
                className={fieldClass}
              />
            </label>
            {editor === "create" && (
              <label className="block space-y-2 text-sm">
                <span>Observações (opcional)</span>
                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  className={fieldClass}
                />
              </label>
            )}
            <div>
              <p className="mb-2 text-sm">Horários disponíveis</p>
              {availabilityState === "idle" && (
                <p className="text-sm text-[var(--muted)]">
                  Selecione serviço, barbeiro e data.
                </p>
              )}
              {availabilityState === "loading" && (
                <p role="status">Buscando horários...</p>
              )}
              {availabilityState === "error" && (
                <p role="alert" className="text-red-400">
                  {availabilityError}
                </p>
              )}
              {availabilityState === "empty" && (
                <p>Não há horários disponíveis para esta combinação.</p>
              )}
              {availabilityState === "success" && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => (
                    <button
                      key={slot.starts_at}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          slot: slot.starts_at,
                        }))
                      }
                      className={cn(
                        "min-h-11 rounded-xl border text-sm",
                        form.slot === slot.starts_at
                          ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                          : "border-[var(--border)]",
                      )}
                      aria-pressed={form.slot === slot.starts_at}
                    >
                      {zone && isoToEntityFields(slot.starts_at, zone).time}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {editorError && (
              <p role="alert" className="text-sm text-red-400">
                {editorError}
              </p>
            )}
            <button
              type="submit"
              disabled={saving || !form.slot || availabilityState !== "success"}
              className={cn(buttonClass, "w-full")}
            >
              {saving
                ? "Salvando..."
                : editor === "create"
                  ? "Criar agendamento"
                  : "Confirmar reagendamento"}
            </button>
          </form>
        </div>
      )}
      <ConfirmDialog
        open={confirmAction !== null}
        title={
          confirmAction === "cancel"
            ? "Cancelar agendamento?"
            : "Concluir agendamento?"
        }
        description={
          confirmAction === "cancel"
            ? "O agendamento será marcado como cancelado."
            : "O atendimento será marcado como concluído."
        }
        confirmLabel={
          confirmAction === "cancel" ? "Cancelar agendamento" : "Concluir"
        }
        variant={confirmAction === "cancel" ? "destructive" : "default"}
        isLoading={actionSaving}
        error={actionError}
        onCancel={() => setConfirmAction(null)}
        onConfirm={runAction}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-soft)] bg-[#0c0c0c] p-3">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 break-words font-medium">{value}</p>
    </div>
  );
}
