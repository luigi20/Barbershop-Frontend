import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Scissors,
  TrendingUp,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";

const stats = [
  {
    title: "Faturamento",
    value: "R$ 12.450",
    description: "+12,4% este mês",
    icon: WalletCards,
    positive: true,
  },
  {
    title: "Agendamentos",
    value: "128",
    description: "32 esta semana",
    icon: CalendarDays,
  },
  {
    title: "Clientes",
    value: "93",
    description: "+8 novos clientes",
    icon: UsersRound,
  },
  {
    title: "Ticket médio",
    value: "R$ 97,27",
    description: "+4,2% este mês",
    icon: TrendingUp,
    positive: true,
  },
];

const appointments = [
  {
    id: "1",
    client: "João Silva",
    service: "Corte + Barba",
    barber: "Carlos",
    time: "09:00",
    duration: "60 min",
  },
  {
    id: "2",
    client: "Pedro Santos",
    service: "Corte",
    barber: "Rafael",
    time: "10:30",
    duration: "45 min",
  },
  {
    id: "3",
    client: "Lucas Almeida",
    service: "Barba",
    barber: "Carlos",
    time: "11:30",
    duration: "30 min",
  },
  {
    id: "4",
    client: "Mateus Costa",
    service: "Corte degradê",
    barber: "Rafael",
    time: "14:00",
    duration: "45 min",
  },
];

export default function DashboardPage() {
  return (
    <div>
      {/* TÍTULO */}

      <section className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-[var(--primary)]">
            Segunda-feira
          </p>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Boa tarde, Emmanuel
          </h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Aqui está o resumo da sua barbearia hoje.
          </p>
        </div>

        <button className="hidden h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-black transition hover:bg-[var(--primary-hover)] sm:flex">
          <CalendarDays size={18} />
          Novo agendamento
        </button>
      </section>

      {/* CARDS */}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.title}
              className="relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 sm:p-5"
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <Icon size={18} />
                </div>

                {stat.positive && (
                  <ArrowUpRight size={16} className="text-[var(--success)]" />
                )}
              </div>

              <p className="text-xs text-[var(--muted)] sm:text-sm">
                {stat.title}
              </p>

              <p className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                {stat.value}
              </p>

              <p
                className={`mt-2 truncate text-[10px] sm:text-xs ${
                  stat.positive
                    ? "text-[var(--success)]"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                {stat.description}
              </p>
            </article>
          );
        })}
      </section>

      {/* GRID PRINCIPAL */}

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_390px]">
        {/* GRÁFICO */}

        <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 sm:p-6">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="font-medium">Faturamento</h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Desempenho dos últimos 7 dias
              </p>
            </div>

            <div className="rounded-lg bg-[var(--primary-soft)] px-2.5 py-1.5 text-xs text-[var(--primary)]">
              7 dias
            </div>
          </div>

          {/* MOCK DO GRÁFICO */}

          <div className="relative h-[210px]">
            <div className="absolute inset-0 flex flex-col justify-between">
              {[1, 2, 3, 4, 5].map((line) => (
                <div
                  key={line}
                  className="border-t border-dashed border-[#242424]"
                />
              ))}
            </div>

            <div className="absolute inset-x-1 bottom-0 flex h-full items-end justify-between gap-2 pt-8 sm:gap-4">
              {[42, 57, 38, 70, 62, 86, 76].map((height, index) => (
                <div key={index} className="flex h-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#9a6a1b] to-[#e0a943] opacity-90"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 text-center text-[10px] text-[var(--muted)] sm:text-xs">
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>
        </article>

        {/* PRÓXIMOS AGENDAMENTOS */}

        <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border-soft)] p-4 sm:p-5">
            <div>
              <h2 className="font-medium">Próximos horários</h2>

              <p className="mt-1 text-xs text-[var(--muted)]">Agenda de hoje</p>
            </div>

            <button className="flex size-9 items-center justify-center rounded-xl text-[var(--muted)] transition hover:bg-[var(--surface-secondary)] hover:text-white">
              <ChevronRight size={18} />
            </button>
          </div>

          <div>
            {appointments.map((appointment) => (
              <button
                key={appointment.id}
                className="flex w-full items-center gap-3 border-b border-[var(--border-soft)] p-4 text-left transition last:border-b-0 hover:bg-[var(--surface-hover)] sm:p-5"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <UserRound size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">
                      {appointment.client}
                    </p>

                    <p className="shrink-0 text-sm font-medium text-[var(--primary)]">
                      {appointment.time}
                    </p>
                  </div>

                  <p className="mt-1 truncate text-xs text-[var(--muted)]">
                    {appointment.service} • {appointment.barber}
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-[10px] text-[var(--muted-foreground)]">
                    <Clock3 size={11} />

                    {appointment.duration}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </article>
      </section>

      {/* RESUMO */}

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <Scissors size={18} />
            </div>

            <div>
              <p className="text-sm font-medium">Serviço mais vendido</p>

              <p className="text-xs text-[var(--muted)]">Neste mês</p>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-lg font-semibold">Corte + Barba</p>

              <p className="mt-1 text-xs text-[var(--muted)]">
                48 atendimentos
              </p>
            </div>

            <span className="text-sm text-[var(--primary)]">R$ 2.880</span>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <CalendarDays size={18} />
            </div>

            <div>
              <p className="text-sm font-medium">Agenda de hoje</p>

              <p className="text-xs text-[var(--muted)]">Segunda-feira</p>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-lg font-semibold">14 agendamentos</p>

              <p className="mt-1 text-xs text-[var(--muted)]">9 concluídos</p>
            </div>

            <span className="text-sm text-[var(--success)]">64%</span>
          </div>
        </article>
      </section>

      {/* BOTÃO MOBILE */}

      <button className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-sm font-semibold text-black sm:hidden">
        <CalendarDays size={18} />
        Novo agendamento
      </button>
    </div>
  );
}
