"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";
import { FormEvent, useState } from "react";

import { Customer, CustomerStatus } from "@/types/customer";

interface CustomerForm {
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: CustomerStatus;
}

const emptyForm: CustomerForm = {
  name: "",
  phone: "",
  email: "",
  notes: "",
  status: "active",
};

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-[var(--muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}

interface ClientFormModalProps {
  open: boolean;
  editingCustomer: Customer | null;
  onClose: () => void;
  onSubmit: (
    data: Omit<
      Customer,
      "id" | "createdAt" | "totalAppointments" | "totalSpent"
    >,
  ) => void;
}

export function ClientFormModal({
  open,
  editingCustomer,
  onClose,
  onSubmit,
}: ClientFormModalProps) {
  const [form, setForm] = useState<CustomerForm>(() =>
    editingCustomer
      ? {
          name: editingCustomer.name,
          phone: editingCustomer.phone,
          email: editingCustomer.email ?? "",
          notes: editingCustomer.notes ?? "",
          status: editingCustomer.status,
        }
      : emptyForm,
  );

  // Sync form when editingCustomer changes (modal opens with different customer)
  const prevCustomerId = editingCustomer?.id;
  if (
    open &&
    editingCustomer &&
    editingCustomer.id !== prevCustomerId &&
    form.name !== editingCustomer.name
  ) {
    setForm({
      name: editingCustomer.name,
      phone: editingCustomer.phone,
      email: editingCustomer.email ?? "",
      notes: editingCustomer.notes ?? "",
      status: editingCustomer.status,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const phone = form.phone.trim();

    if (!name || !phone) return;

    onSubmit({
      name,
      phone,
      email: form.email.trim() || undefined,
      notes: form.notes.trim() || undefined,
      status: form.status,
    });
  }

  function update<K extends keyof CustomerForm>(
    key: K,
    value: CustomerForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Fechar modal"
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 50, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 35, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-[var(--border)] bg-[#111111] p-5 sm:max-w-lg sm:rounded-2xl sm:p-6"
          >
            {/* Drag handle (mobile) */}
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#333] sm:hidden" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--primary)]">
                  Clientes
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {editingCustomer ? "Editar cliente" : "Novo cliente"}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex size-10 items-center justify-center rounded-xl bg-[var(--surface-secondary)] text-[var(--muted)] transition hover:text-white"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Fields */}
            <div className="mt-6 space-y-4">
              <FormField label="Nome *">
                <input
                  autoFocus
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Nome completo"
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-[#0b0b0b] px-4 text-sm outline-none transition placeholder:text-[#555] focus:border-[var(--primary)]"
                />
              </FormField>

              <FormField label="Telefone *">
                <input
                  required
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  inputMode="tel"
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-[#0b0b0b] px-4 text-sm outline-none transition placeholder:text-[#555] focus:border-[var(--primary)]"
                />
              </FormField>

              <FormField label="E-mail">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="email@exemplo.com"
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-[#0b0b0b] px-4 text-sm outline-none transition placeholder:text-[#555] focus:border-[var(--primary)]"
                />
              </FormField>

              <FormField label="Status">
                <div className="flex gap-3">
                  {(
                    [
                      { value: "active", label: "Ativo" },
                      { value: "inactive", label: "Inativo" },
                    ] as const
                  ).map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => update("status", value)}
                      className={`flex h-11 flex-1 items-center justify-center rounded-xl border text-xs font-medium transition ${
                        form.status === value
                          ? value === "active"
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                            : "border-red-500/40 bg-red-500/10 text-red-400"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label="Observações">
                <textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={3}
                  placeholder="Preferências, alergias, observações internas..."
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-[#0b0b0b] p-4 text-sm outline-none transition placeholder:text-[#555] focus:border-[var(--primary)]"
                />
              </FormField>
            </div>

            {/* Actions */}
            <div className="mt-7 flex gap-3">
              <motion.button
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.97 }}
                className="h-12 flex-1 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--muted)]"
              >
                Cancelar
              </motion.button>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-sm font-semibold text-black"
              >
                <Check size={18} />
                {editingCustomer ? "Salvar alterações" : "Criar cliente"}
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
