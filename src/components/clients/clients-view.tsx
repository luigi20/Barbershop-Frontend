"use client";

import { AlertCircle, Phone, Search, UsersRound } from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import { useMemo, useState } from "react";

import { useCustomers } from "@/hooks/use-customers";
import type { EntityCustomer } from "@/types/entity-customer";

const smoothEase = [0.22, 1, 0.36, 1] as const;

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Data não informada"
    : new Intl.DateTimeFormat("pt-BR").format(date);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function CustomerCard({ customer }: { customer: EntityCustomer }) {
  return (
    <motion.article
      layout
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--primary-soft)] text-sm font-semibold text-[var(--primary)]">
          {customer.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={customer.photo}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            getInitials(customer.profile_name)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="truncate text-sm font-semibold">
              {customer.profile_name}
            </h2>
            <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-1 text-[10px] text-[var(--muted)]">
              {customer.status}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-[var(--muted)]">
            {customer.entity_name}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 border-t border-[var(--border-soft)] pt-4 text-xs text-[var(--muted)]">
        <p className="flex items-center gap-2">
          <Phone size={14} />
          {customer.phone ?? "Telefone não informado"}
        </p>
        {customer.notes && (
          <p className="line-clamp-2 text-[var(--muted-foreground)]">
            {customer.notes}
          </p>
        )}
        <p className="text-[10px] text-[var(--muted-foreground)]">
          Cliente desde {formatDate(customer.created_at)}
        </p>
      </div>
    </motion.article>
  );
}

export function ClientsView() {
  const { status, customers, error } = useCustomers();
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;

    return customers.filter((customer) =>
      [customer.profile_name, customer.phone, customer.notes, customer.status]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [customers, search]);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: smoothEase }}
      >
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--primary)]">
            Cadastro
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Clientes
          </h1>
          <p className="mt-1 max-w-lg text-sm text-[var(--muted)]">
            Consulte os clientes vinculados ao ambiente atual.
          </p>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Cadastro e edição estão indisponíveis até a escrita multi-tenant ser
            corrigida no backend.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 sm:p-5">
          <p className="text-xs text-[var(--muted)]">Clientes encontrados</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {status === "loading" ? "—" : customers.length}
          </p>
        </section>

        <section className="mt-5">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, telefone, observação ou status..."
              className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm outline-none transition placeholder:text-[#555] focus:border-[var(--primary)]"
            />
          </div>
        </section>

        <section className="mt-5" aria-live="polite">
          {status === "loading" && (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-44 animate-pulse rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)]"
                />
              ))}
            </div>
          )}

          {status === "error" && (
            <div className="rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-6 py-12 text-center">
              <AlertCircle className="mx-auto text-[var(--danger)]" size={24} />
              <h2 className="mt-3 text-sm font-semibold">
                Não foi possível carregar os clientes
              </h2>
              <p className="mt-1 text-xs text-[var(--muted)]">{error}</p>
            </div>
          )}

          {status === "success" && filteredCustomers.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <UsersRound size={21} />
              </div>
              <h2 className="mt-4 text-sm font-semibold">
                Nenhum cliente encontrado
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--muted)]">
                {customers.length === 0
                  ? "Ainda não há clientes vinculados a este ambiente."
                  : "Tente alterar o termo da busca."}
              </p>
            </div>
          )}

          {status === "success" && filteredCustomers.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredCustomers.map((customer, index) => (
                <CustomerCard
                  key={`${customer.profile_name}-${customer.created_at}-${index}`}
                  customer={customer}
                />
              ))}
            </div>
          )}
        </section>
      </motion.div>
    </MotionConfig>
  );
}
