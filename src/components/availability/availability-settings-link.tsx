"use client";

import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";

export function AvailabilitySettingsLink() {
  const user = useCurrentUser();
  if (
    user.status !== "success" ||
    !user.profile.roles.includes("administrador")
  )
    return null;
  return (
    <Link
      href="/configuracoes/horarios"
      className="mt-6 block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--primary)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
    >
      <span className="block text-lg font-semibold text-[var(--primary)]">
        Horários e disponibilidade
      </span>
      <span className="mt-1 block text-sm text-[var(--muted)]">
        Fuso horário, expediente, jornadas e bloqueios da equipe.
      </span>
    </Link>
  );
}
