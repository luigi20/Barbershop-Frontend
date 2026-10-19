"use client";

import {
  AlertCircle,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import { useMemo, useState } from "react";

import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { useMembers } from "@/hooks/use-members";
import { formatProfileRole } from "@/lib/profile";
import type { EntityMembershipListItem } from "@/types/entity-membership";
import { MemberManager } from "@/components/members/member-manager";

const smoothEase = [0.22, 1, 0.36, 1] as const;

function formatStatus(status: string): string {
  if (!status.trim()) return "Não informado";

  return status
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

function MemberCard({ member }: { member: EntityMembershipListItem }) {
  const memberName = member.profile_name?.trim() || "Nome não informado";

  return (
    <motion.article
      layout
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5"
    >
      <div className="flex items-start gap-3">
        <ProfileAvatar
          name={memberName}
          photo={member.photo}
          className="size-12 rounded-xl text-sm"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="min-w-0 break-words text-sm font-semibold">
              {memberName}
            </h2>
            <span className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface-secondary)] px-2.5 py-1 text-[10px] text-[var(--muted)]">
              {formatStatus(member.status)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {member.roles.length > 0 ? (
              member.roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] text-[var(--primary)]"
                >
                  <ShieldCheck size={11} />
                  {formatProfileRole(role)}
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

      <div className="mt-5 border-t border-[var(--border-soft)] pt-4">
        <p className="flex min-w-0 items-center gap-2 text-xs text-[var(--muted)]">
          <Phone size={14} className="shrink-0" />
          <span className="break-all">
            {member.phone?.trim() || "Telefone não informado"}
          </span>
        </p>
      </div>
    </motion.article>
  );
}

export function MembersView() {
  const { status, members, error, reload } = useMembers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const availableRoles = useMemo(
    () => Array.from(new Set(members.flatMap((member) => member.roles))).sort(),
    [members],
  );

  const availableStatuses = useMemo(
    () =>
      Array.from(new Set(members.map((member) => member.status))).sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      ),
    [members],
  );

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");

    return members.filter((member) => {
      const matchesSearch =
        !term ||
        [member.profile_name, member.phone, member.status, ...member.roles]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLocaleLowerCase("pt-BR").includes(term));
      const matchesRole =
        !roleFilter || member.roles.some((role) => role === roleFilter);
      const matchesStatus = !statusFilter || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, roleFilter, search, statusFilter]);

  const hasActiveFilters = Boolean(search.trim() || roleFilter || statusFilter);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: smoothEase }}
      >
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--primary)]">
            Pessoas
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Equipe
          </h1>
          <p className="mt-1 max-w-lg text-sm text-[var(--muted)]">
            Consulte os membros vinculados ao ambiente atual.
          </p>
        </section>

        {status === "success" && (
          <MemberManager members={members} onSaved={reload} />
        )}

        <section className="mt-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 sm:p-5">
          <p className="text-xs text-[var(--muted)]">Membros carregados</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {status === "loading" ? "—" : members.length}
          </p>
        </section>

        <section className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <label className="relative block">
            <span className="sr-only">Buscar membros</span>
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, telefone, função ou status..."
              className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm outline-none transition placeholder:text-[#555] focus:border-[var(--primary)]"
            />
          </label>

          <label className="relative block">
            <span className="sr-only">Filtrar por função</span>
            <SlidersHorizontal
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
            >
              <option value="">Todas as funções</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {formatProfileRole(role)}
                </option>
              ))}
            </select>
          </label>

          <label className="relative block">
            <span className="sr-only">Filtrar por status</span>
            <SlidersHorizontal
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
            >
              <option value="">Todos os status</option>
              {availableStatuses.map((memberStatus) => (
                <option key={memberStatus} value={memberStatus}>
                  {formatStatus(memberStatus)}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="mt-5" aria-live="polite">
          {status === "loading" && (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)]"
                />
              ))}
            </div>
          )}

          {(status === "error" || status === "forbidden") && (
            <div className="rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-6 py-12 text-center">
              <AlertCircle className="mx-auto text-[var(--danger)]" size={24} />
              <h2 className="mt-3 text-sm font-semibold">
                {status === "forbidden"
                  ? "Acesso à equipe negado"
                  : "Não foi possível carregar a equipe"}
              </h2>
              <p className="mt-1 text-xs text-[var(--muted)]">{error}</p>
            </div>
          )}

          {status === "success" && filteredMembers.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <UsersRound size={21} />
              </div>
              <h2 className="mt-4 text-sm font-semibold">
                {hasActiveFilters
                  ? "Nenhum membro encontrado"
                  : "Nenhum membro cadastrado"}
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--muted)]">
                {hasActiveFilters
                  ? "Tente alterar os termos ou filtros selecionados."
                  : "Ainda não há membros vinculados a este ambiente."}
              </p>
            </div>
          )}

          {status === "success" && filteredMembers.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredMembers.map((member) => (
                <MemberCard key={member.profile_id} member={member} />
              ))}
            </div>
          )}
        </section>
      </motion.div>
    </MotionConfig>
  );
}
