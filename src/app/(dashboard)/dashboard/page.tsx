"use client";

import {
  CalendarDays,
  Clock3,
  Scissors,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatEntityBlock } from "@/lib/availability-time";
import { cn } from "@/lib/utils";
import {
  getDashboardOperations,
  getDashboardSummary,
  getDashboardTimeseries,
  getDashboardUpcoming,
} from "@/services/dashboard.client";
import type {
  DashboardOperationsResponse,
  DashboardSummaryResponse,
  DashboardTimeseriesResponse,
  DashboardUpcomingResponse,
  LocalDate,
  MoneyDecimal,
} from "@/types/dashboard-p5";

type LoadState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

type Metrics = DashboardOperationsResponse | DashboardSummaryResponse;

function subtractCivilDays(date: LocalDate, days: number): LocalDate {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
}

function formatCivilDate(date: LocalDate, options: Intl.DateTimeFormatOptions) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatMoney(value: MoneyDecimal) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Não foi possível carregar esta seção.";
}

function SectionSkeleton({ label }: { label: string }) {
  return (
    <div role="status" className="animate-pulse space-y-3" aria-label={label}>
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <div className="h-24 rounded-xl bg-[var(--surface-secondary)]" />
    </div>
  );
}

export default function DashboardPage() {
  const user = useCurrentUser();
  const isAdmin = user.profile?.roles.includes("administrador") ?? false;
  const isReceptionist =
    !isAdmin && (user.profile?.roles.includes("recepcionista") ?? false);
  const role = isAdmin ? "admin" : isReceptionist ? "receptionist" : null;
  const [metrics, setMetrics] = useState<LoadState<Metrics>>({
    status: "loading",
  });
  const [upcoming, setUpcoming] = useState<
    LoadState<DashboardUpcomingResponse>
  >({ status: "loading" });
  const [timeseries, setTimeseries] = useState<
    LoadState<DashboardTimeseriesResponse>
  >({ status: "loading" });

  useEffect(() => {
    if (!role) return;
    const controller = new AbortController();
    const signal = controller.signal;

    async function loadMetrics() {
      setMetrics({ status: "loading" });
      if (role === "admin") setTimeseries({ status: "loading" });
      try {
        const data =
          role === "admin"
            ? await getDashboardSummary(signal)
            : await getDashboardOperations(signal);
        if (signal.aborted) return;
        setMetrics({ status: "success", data });

        if (role === "admin") {
          try {
            const series = await getDashboardTimeseries(
              subtractCivilDays(data.date, 6),
              data.date,
              signal,
            );
            if (!signal.aborted)
              setTimeseries({ status: "success", data: series });
          } catch (error) {
            if (!signal.aborted)
              setTimeseries({ status: "error", message: errorMessage(error) });
          }
        }
      } catch (error) {
        if (!signal.aborted) {
          setMetrics({ status: "error", message: errorMessage(error) });
          if (role === "admin")
            setTimeseries({
              status: "error",
              message:
                "O gráfico depende da data do resumo, que não foi carregado.",
            });
        }
      }
    }

    async function loadUpcoming() {
      setUpcoming({ status: "loading" });
      try {
        const data = await getDashboardUpcoming(5, signal);
        if (!signal.aborted) setUpcoming({ status: "success", data });
      } catch (error) {
        if (!signal.aborted)
          setUpcoming({ status: "error", message: errorMessage(error) });
      }
    }

    void loadMetrics();
    void loadUpcoming();
    return () => controller.abort();
  }, [role]);

  if (!role) return null;

  const summary =
    isAdmin && metrics.status === "success" && "month" in metrics.data
      ? metrics.data
      : null;
  const today = metrics.status === "success" ? metrics.data.today : null;
  const cards = today
    ? [
        {
          title: "Agendamentos hoje",
          value: today.appointments_total,
          icon: CalendarDays,
        },
        { title: "Agendados", value: today.scheduled, icon: Clock3 },
        { title: "Concluídos", value: today.completed, icon: CalendarDays },
        { title: "Cancelados", value: today.cancelled, icon: CalendarDays },
        { title: "Próximos", value: today.upcoming, icon: Clock3 },
        ...(summary
          ? [
              {
                title: "Clientes ativos",
                value: summary.customers.active,
                icon: UsersRound,
              },
              {
                title: "Barbeiros ativos",
                value: summary.professionals.active_barbers,
                icon: UserRound,
              },
              {
                title: "Serviços ativos",
                value: summary.services.active,
                icon: Scissors,
              },
            ]
          : []),
      ]
    : [];
  const maxAppointments =
    timeseries.status === "success"
      ? Math.max(
          0,
          ...timeseries.data.points.map((point) => point.appointments),
        )
      : 0;

  return (
    <div>
      <section className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-[var(--primary)]">
            {metrics.status === "success"
              ? formatCivilDate(metrics.data.date, { dateStyle: "full" })
              : "Dashboard"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Olá{user.profile?.name ? `, ${user.profile.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Resumo dos atendimentos da sua barbearia.
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/agenda"
            className="flex h-11 items-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-semibold"
          >
            <CalendarDays size={18} /> Agenda
          </Link>
          <Link
            href="/agenda?new=1"
            className="flex h-11 items-center rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-black transition hover:bg-[var(--primary-hover)]"
          >
            Novo agendamento
          </Link>
        </div>
      </section>

      <section aria-labelledby="today-heading">
        <h2 id="today-heading" className="mb-3 text-base font-medium">
          {isAdmin ? "Hoje e gestão" : "Operação de hoje"}
        </h2>
        {metrics.status === "loading" ? (
          <SectionSkeleton label="Carregando indicadores de hoje" />
        ) : metrics.status === "error" ? (
          <p
            role="alert"
            className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 text-sm text-[var(--danger)]"
          >
            Não foi possível carregar os indicadores. {metrics.message}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.title}
                  className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 sm:p-5"
                >
                  <div className="mb-5 flex size-9 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <p className="text-xs text-[var(--muted)] sm:text-sm">
                    {card.title}
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                    {card.value}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {isAdmin && (
        <section
          className="mt-4 grid gap-3 sm:grid-cols-2"
          aria-labelledby="revenue-heading"
        >
          <h2 id="revenue-heading" className="sr-only">
            Receita operacional
          </h2>
          {summary ? (
            [
              {
                title: "Receita de atendimentos concluídos hoje",
                value: summary.today.revenue,
              },
              {
                title: "Receita de atendimentos concluídos no mês",
                value: summary.month.revenue,
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5"
              >
                <div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <WalletCards size={18} aria-hidden="true" />
                </div>
                <p className="text-sm text-[var(--muted)]">{item.title}</p>
                <p className="mt-1 text-2xl font-semibold">
                  {formatMoney(item.value)}
                </p>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Baseada nos atendimentos concluídos.
                </p>
              </article>
            ))
          ) : metrics.status === "loading" ? (
            <div className="sm:col-span-2">
              <SectionSkeleton label="Carregando receita operacional" />
            </div>
          ) : null}
        </section>
      )}

      <section
        className={cn("mt-4 grid gap-4", isAdmin && "xl:grid-cols-[1fr_390px]")}
      >
        {isAdmin && (
          <article
            className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 sm:p-6"
            aria-labelledby="chart-heading"
          >
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h2 id="chart-heading" className="font-medium">
                  Agendamentos
                </h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Últimos 7 dias civis da barbearia
                </p>
              </div>
              <span className="rounded-lg bg-[var(--primary-soft)] px-2.5 py-1.5 text-xs text-[var(--primary)]">
                7 dias
              </span>
            </div>
            {timeseries.status === "loading" ? (
              <SectionSkeleton label="Carregando gráfico de agendamentos" />
            ) : timeseries.status === "error" ? (
              <p role="alert" className="text-sm text-[var(--danger)]">
                Não foi possível carregar o gráfico. {timeseries.message}
              </p>
            ) : timeseries.data.points.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                Não há dados de agendamentos para este período.
              </p>
            ) : (
              <div>
                {timeseries.data.points.every(
                  (point) => point.appointments === 0,
                ) && (
                  <p className="mb-3 text-sm text-[var(--muted)]">
                    Nenhum agendamento nos últimos 7 dias.
                  </p>
                )}
                <div
                  className="flex h-[210px] items-end gap-2 border-b border-[var(--border-soft)] sm:gap-4"
                  role="img"
                  aria-label="Gráfico de agendamentos dos últimos 7 dias"
                >
                  {timeseries.data.points.map((point) => {
                    return (
                      <div
                        key={point.date}
                        className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                      >
                        <span className="text-xs text-[var(--muted)]">
                          {point.appointments}
                        </span>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-[#9a6a1b] to-[#e0a943] opacity-90"
                          style={{
                            height:
                              maxAppointments === 0
                                ? 0
                                : `${(point.appointments / maxAppointments) * 75}%`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex gap-2 text-center text-[10px] text-[var(--muted)] sm:gap-4 sm:text-xs">
                  {timeseries.data.points.map((point) => (
                    <span
                      key={point.date}
                      className="min-w-0 flex-1"
                      title={`${formatCivilDate(point.date, { dateStyle: "short" })}: ${point.appointments} agendamentos`}
                    >
                      {formatCivilDate(point.date, {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  ))}
                </div>
                <ul className="sr-only">
                  {timeseries.data.points.map((point) => (
                    <li key={point.date}>
                      {formatCivilDate(point.date, { dateStyle: "long" })}:{" "}
                      {point.appointments} agendamentos
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        )}

        <article
          className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)]"
          aria-labelledby="upcoming-heading"
        >
          <div className="border-b border-[var(--border-soft)] p-4 sm:p-5">
            <h2 id="upcoming-heading" className="font-medium">
              Próximos atendimentos
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Agenda da barbearia
            </p>
          </div>
          <div className="p-4 sm:p-5">
            {upcoming.status === "loading" ? (
              <SectionSkeleton label="Carregando próximos atendimentos" />
            ) : upcoming.status === "error" ? (
              <p role="alert" className="text-sm text-[var(--danger)]">
                Não foi possível carregar os próximos atendimentos.{" "}
                {upcoming.message}
              </p>
            ) : upcoming.data.appointments.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                Não há próximos atendimentos.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border-soft)]">
                {upcoming.data.appointments.map((appointment) => (
                  <li
                    key={appointment.appointment_id}
                    className="py-4 first:pt-0 last:pb-0"
                  >
                    <Link
                      href={`/agenda?appointment=${encodeURIComponent(appointment.appointment_id)}`}
                      className="flex items-start gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
                    >
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                        <UserRound size={18} aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {appointment.customer_name ??
                            "Cliente não identificado"}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {appointment.service_name_snapshot} ·{" "}
                          {appointment.professional_name ??
                            "Profissional não identificado"}
                        </p>
                        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                          <Clock3
                            size={12}
                            className="mr-1 inline"
                            aria-hidden="true"
                          />
                          <span>
                            Início:{" "}
                            {formatEntityBlock(
                              appointment.starts_at,
                              upcoming.data.timezone,
                            )}
                          </span>
                          <span className="block pl-4">
                            Fim:{" "}
                            {formatEntityBlock(
                              appointment.ends_at,
                              upcoming.data.timezone,
                            )}
                          </span>
                        </p>
                        <p className="mt-2 text-sm font-medium text-[var(--primary)]">
                          {formatMoney(appointment.price_snapshot)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
        <Link
          href="/agenda"
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border)] text-sm font-semibold"
        >
          <CalendarDays size={18} /> Agenda
        </Link>
        <Link
          href="/agenda?new=1"
          className="flex min-h-12 items-center justify-center rounded-xl bg-[var(--primary)] px-2 text-center text-sm font-semibold text-black"
        >
          Novo agendamento
        </Link>
      </div>
    </div>
  );
}
