"use client";

import { motion } from "motion/react";
import { Calendar, DollarSign, Pencil, Phone } from "lucide-react";

import { Customer } from "@/types/customer";

const smoothEase = [0.22, 1, 0.36, 1] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

interface ClientCardProps {
  customer: Customer;
  index: number;
  onEdit: () => void;
  onViewDetails: () => void;
}

export function ClientCard({
  customer,
  index,
  onEdit,
  onViewDetails,
}: ClientCardProps) {
  const initials = customer.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const isActive = customer.status === "active";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.04, 0.2),
        ease: smoothEase,
      }}
      whileHover={{ y: -3 }}
      className="group rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 transition-colors hover:border-[#353535]"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={onViewDetails}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-label={`Ver detalhes de ${customer.name}`}
        >
          {/* Avatar */}
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
              isActive
                ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                : "bg-white/5 text-[var(--muted)]"
            }`}
          >
            {initials}
          </div>

          {/* Name + status */}
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{customer.name}</h2>

            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-zinc-500"}`}
              />
              <span
                className={`text-[10px] ${isActive ? "text-emerald-400" : "text-[var(--muted)]"}`}
              >
                {isActive ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        </button>

        {/* Edit button */}
        <motion.button
          type="button"
          onClick={onEdit}
          whileTap={{ scale: 0.9 }}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-transparent text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface-secondary)] hover:text-white"
          aria-label={`Editar ${customer.name}`}
        >
          <Pencil size={16} />
        </motion.button>
      </div>

      {/* Phone */}
      <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]">
        <Phone size={13} className="shrink-0" />
        <span className="truncate">{customer.phone}</span>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[var(--border-soft)] bg-[#0c0c0c] p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]">
            <Calendar size={12} />
            Agendamentos
          </div>
          <p className="mt-2 text-sm font-semibold">
            {customer.totalAppointments}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-soft)] bg-[#0c0c0c] p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]">
            <DollarSign size={12} />
            Total gasto
          </div>
          <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
            {formatCurrency(customer.totalSpent)}
          </p>
        </div>
      </div>

      {/* Since */}
      <div className="mt-4 border-t border-[var(--border-soft)] pt-4">
        <p className="text-[10px] text-[var(--muted)]">
          Cliente desde{" "}
          <span className="text-[var(--muted-foreground)]">
            {formatDate(customer.createdAt)}
          </span>
        </p>
      </div>
    </motion.article>
  );
}
