"use client";

import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { motion, MotionConfig } from "motion/react";

import { useCurrentUser } from "@/hooks/use-current-user";
import { ProfileAvatar } from "@/components/profile/profile-avatar";

const smoothEase = [0.22, 1, 0.36, 1] as const;

function formatBirthDate(value: string | null): string {
  if (!value) return "Não informada";

  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    !year ||
    !month ||
    !day ||
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "Não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatRole(role: string): string {
  return role
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse" aria-label="Carregando perfil">
      <div className="h-4 w-24 rounded bg-[var(--primary-soft)]" />
      <div className="mt-3 h-9 w-48 rounded bg-[var(--surface-secondary)]" />
      <div className="mt-7 h-56 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)]" />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="h-48 rounded-2xl bg-[var(--surface)]" />
        <div className="h-48 rounded-2xl bg-[var(--surface)]" />
      </div>
    </div>
  );
}

export function ProfileView() {
  const user = useCurrentUser();

  if (user.status === "loading" || user.status === "unauthenticated") {
    return <ProfileSkeleton />;
  }

  if (user.status === "error" || user.status === "forbidden") {
    const forbidden = user.status === "forbidden";

    return (
      <section className="rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-6 py-16 text-center">
        <AlertCircle className="mx-auto text-[var(--danger)]" size={26} />
        <h1 className="mt-4 text-lg font-semibold">
          {forbidden
            ? "Acesso ao perfil negado"
            : "Não foi possível carregar seu perfil"}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
          {user.error}
        </p>
      </section>
    );
  }

  const { profile } = user;

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: smoothEase }}
      >
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--primary)]">
            Conta
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Meu perfil
          </h1>
          <p className="mt-1 max-w-lg text-sm text-[var(--muted)]">
            Consulte seus dados pessoais e funções no BarberPro.
          </p>
        </section>

        <section className="relative mt-6 overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 sm:p-7">
          <div className="absolute -right-16 -top-20 size-56 rounded-full bg-[var(--primary)]/8 blur-3xl" />
          <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <ProfileAvatar
              name={profile.name}
              photo={profile.photo}
              className="size-24 border border-[var(--primary)]/25 text-2xl shadow-lg shadow-black/30 sm:size-28"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Perfil pessoal
              </p>
              <h2 className="mt-1 break-words text-2xl font-semibold tracking-tight">
                {profile.name}
              </h2>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                {profile.roles.length > 0 ? (
                  profile.roles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-3 py-1.5 text-xs text-[var(--primary)]"
                    >
                      <BadgeCheck size={14} />
                      {formatRole(role)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--muted)]">
                    Função não informada
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <UserRound size={18} />
              </div>
              <div>
                <h2 className="text-sm font-medium">Dados pessoais</h2>
                <p className="text-xs text-[var(--muted)]">
                  Informações do seu perfil
                </p>
              </div>
            </div>

            <dl className="mt-6 space-y-5">
              <div className="flex items-start gap-3">
                <Phone
                  size={17}
                  className="mt-0.5 shrink-0 text-[var(--primary)]"
                />
                <div>
                  <dt className="text-xs text-[var(--muted)]">Telefone</dt>
                  <dd className="mt-1 text-sm">
                    {profile.phone ?? "Não informado"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays
                  size={17}
                  className="mt-0.5 shrink-0 text-[var(--primary)]"
                />
                <div>
                  <dt className="text-xs text-[var(--muted)]">
                    Data de nascimento
                  </dt>
                  <dd className="mt-1 text-sm capitalize">
                    {formatBirthDate(profile.birth_date)}
                  </dd>
                </div>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-sm font-medium">Gerenciamento do perfil</h2>
                <p className="text-xs text-[var(--muted)]">
                  Disponibilidade atual
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/40 p-4">
              <p className="text-sm font-medium">Edição indisponível</p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                A atualização dos dados será liberada quando a persistência do
                perfil estiver disponível com segurança.
              </p>
            </div>
          </article>
        </section>
      </motion.div>
    </MotionConfig>
  );
}
