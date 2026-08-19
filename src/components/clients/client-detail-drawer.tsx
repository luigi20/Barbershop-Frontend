"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Calendar,
  DollarSign,
  Mail,
  Pencil,
  Phone,
  StickyNote,
  X,
} from "lucide-react";

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
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--border-soft)] bg-[#0c0c0c] p-4">
      <div className="mt-0.5 shrink-0 text-[var(--muted)]">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

interface ClientDetailDrawerProps {
  customer: Customer | null;
  onClose: () => void;
  onEdit: () => void;
}

export function ClientDetailDrawer({
  customer,
  onClose,
  onEdit,
}: ClientDetailDrawerProps) {
  if (!customer) return null;

  const isActive = customer.status === "active";

  const initials = customer.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <AnimatePresence>
      {customer && (
        <motion.div
          key="detail-drawer"
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6 lg:items-stretch lg:justify-end lg:p-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Fechar detalhes"
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 32,
              ease: smoothEase,
            }}
            className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-y-auto rounded-t-[28px] border border-[var(--border)] bg-[#111111] sm:max-w-md sm:rounded-2xl lg:max-h-full lg:rounded-none lg:rounded-l-2xl lg:border-r-0"
          >
            {/* Drag handle (mobile) */}
            <div className="mx-auto mt-4 h-1 w-10 rounded-full bg-[#333] lg:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border-soft)] px-5 py-4 sm:px-6">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--primary)]">
                Detalhes do cliente
              </p>
              <button
                type="button"
                onClick={onClose}
                className="flex size-9 items-center justify-center rounded-xl bg-[var(--surface-secondary)] text-[var(--muted)] transition hover:text-white"
                aria-label="Fechar detalhes"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div
                  className={`flex size-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold ${
                    isActive
                      ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                      : "bg-white/5 text-[var(--muted)]"
                  }`}
                >
                  {initials}
                </div>

                <div>
                  <h2 className="text-lg font-semibold">{customer.name}</h2>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`size-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-zinc-500"}`}
                    />
                    <span
                      className={`text-xs ${isActive ? "text-emerald-400" : "text-[var(--muted)]"}`}
                    >
                      {isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                  Contato
                </p>

                <DetailRow
                  icon={Phone}
                  label="Telefone"
                  value={customer.phone}
                />

                {customer.email && (
                  <DetailRow
                    icon={Mail}
                    label="E-mail"
                    value={customer.email}
                  />
                )}
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                  Histórico
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-[var(--border-soft)] bg-[#0c0c0c] p-4">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]">
                      <Calendar size={12} />
                      Agendamentos
                    </div>
                    <p className="mt-2 text-xl font-semibold">
                      {customer.totalAppointments}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border-soft)] bg-[#0c0c0c] p-4">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]">
                      <DollarSign size={12} />
                      Total gasto
                    </div>
                    <p className="mt-2 text-xl font-semibold text-[var(--primary)]">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                  </div>
                </div>

                <DetailRow
                  icon={Calendar}
                  label="Cliente desde"
                  value={formatDate(customer.createdAt)}
                />
              </div>

              {/* Notes */}
              {customer.notes && (
                <div className="space-y-2">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                    Observações
                  </p>
                  <div className="flex items-start gap-3 rounded-xl border border-[var(--border-soft)] bg-[#0c0c0c] p-4">
                    <StickyNote
                      size={16}
                      className="mt-0.5 shrink-0 text-[var(--muted)]"
                    />
                    <p className="text-sm leading-5 text-[var(--muted-foreground)]">
                      {customer.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer action */}
            <div className="border-t border-[var(--border-soft)] px-5 py-4 sm:px-6">
              <motion.button
                type="button"
                onClick={onEdit}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-sm font-semibold text-black"
              >
                <Pencil size={17} />
                Editar cliente
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
