"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
} from "motion/react";
import { Plus, Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";

import { initialCustomers } from "@/data/mocks/customers";
import { Customer, CustomerStatus } from "@/types/customer";
import { ClientCard } from "@/components/clients/client-card";
import { ClientFormModal } from "@/components/clients/client-form-modal";
import { ClientDetailDrawer } from "@/components/clients/client-detail-drawer";

const smoothEase = [0.22, 1, 0.36, 1] as const;

type CustomerFilter = "all" | CustomerStatus;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 sm:p-5"
    >
      <p className="text-xs text-[var(--muted)]">{title}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[10px] text-[var(--muted-foreground)] sm:text-xs">
        {description}
      </p>
    </motion.article>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`relative h-11 min-w-[86px] overflow-hidden rounded-xl border px-4 text-xs font-medium transition-colors ${
        active
          ? "border-[var(--primary)] text-[var(--primary)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
      }`}
    >
      {active && (
        <motion.span
          layoutId="client-filter-active"
          className="absolute inset-0 bg-[var(--primary-soft)]"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ClientsView() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);

  // ── Derived state ──────────────────────────────────────────────────────────

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !normalizedSearch ||
        customer.name.toLowerCase().includes(normalizedSearch) ||
        customer.phone.includes(normalizedSearch);

      const matchesFilter = filter === "all" || customer.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [customers, search, filter]);

  const stats = useMemo(() => {
    const active = customers.filter((c) => c.status === "active");
    const totalSpent = customers.reduce((acc, c) => acc + c.totalSpent, 0);
    const totalAppointments = customers.reduce(
      (acc, c) => acc + c.totalAppointments,
      0,
    );
    return {
      total: customers.length,
      active: active.length,
      totalSpent,
      totalAppointments,
    };
  }, [customers]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function openCreateModal() {
    setEditingCustomer(null);
    setModalOpen(true);
  }

  function openEditModal(customer: Customer) {
    setDetailCustomer(null);
    setEditingCustomer(customer);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    window.setTimeout(() => setEditingCustomer(null), 200);
  }

  function openDetail(customer: Customer) {
    setDetailCustomer(customer);
  }

  function closeDetail() {
    setDetailCustomer(null);
  }

  function handleFormSubmit(
    data: Omit<
      Customer,
      "id" | "createdAt" | "totalAppointments" | "totalSpent"
    >,
  ) {
    if (editingCustomer) {
      setCustomers((current) =>
        current.map((c) =>
          c.id === editingCustomer.id ? { ...c, ...data } : c,
        ),
      );
      // Sync detail drawer if this customer is open
      setDetailCustomer((current) =>
        current?.id === editingCustomer.id ? { ...current, ...data } : current,
      );
    } else {
      const newCustomer: Customer = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString().split("T")[0],
        totalAppointments: 0,
        totalSpent: 0,
        ...data,
      };
      setCustomers((current) => [newCustomer, ...current]);
    }
    closeModal();
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: smoothEase }}
      >
        {/* HEADER */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--primary)]">
              Cadastro
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Clientes
            </h1>
            <p className="mt-1 max-w-lg text-sm text-[var(--muted)]">
              Gerencie os dados e o histórico dos seus clientes.
            </p>
          </div>

          <motion.button
            onClick={openCreateModal}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
            className="hidden h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-black sm:flex"
          >
            <Plus size={18} />
            Novo cliente
          </motion.button>
        </section>

        {/* STATS */}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="Clientes"
            value={String(stats.total)}
            description="Cadastrados"
          />
          <StatCard
            title="Ativos"
            value={String(stats.active)}
            description="Em atendimento"
          />
          <StatCard
            title="Agendamentos"
            value={String(stats.totalAppointments)}
            description="Total histórico"
          />
          <StatCard
            title="Total gerado"
            value={formatCurrency(stats.totalSpent)}
            description="Receita acumulada"
          />
        </section>

        {/* SEARCH + FILTER */}
        <section className="mt-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou telefone..."
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm outline-none transition placeholder:text-[#555] focus:border-[var(--primary)]"
              />
            </div>

            <LayoutGroup id="client-filter">
              <div className="flex w-full gap-2 overflow-x-auto lg:w-auto">
                <FilterButton
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                >
                  Todos
                </FilterButton>
                <FilterButton
                  active={filter === "active"}
                  onClick={() => setFilter("active")}
                >
                  Ativos
                </FilterButton>
                <FilterButton
                  active={filter === "inactive"}
                  onClick={() => setFilter("inactive")}
                >
                  Inativos
                </FilterButton>
              </div>
            </LayoutGroup>
          </div>
        </section>

        {/* LIST */}
        <section className="mt-5">
          <AnimatePresence mode="popLayout">
            {filteredCustomers.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center"
              >
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <UsersRound size={21} />
                </div>
                <h2 className="mt-4 text-sm font-semibold">
                  Nenhum cliente encontrado
                </h2>
                <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--muted)]">
                  Tente alterar os filtros ou cadastrar um novo cliente.
                </p>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredCustomers.map((customer, index) => (
                    <ClientCard
                      key={customer.id}
                      customer={customer}
                      index={index}
                      onEdit={() => openEditModal(customer)}
                      onViewDetails={() => openDetail(customer)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* FAB MOBILE */}
        <motion.button
          onClick={openCreateModal}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-24 right-5 z-30 flex size-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-black shadow-xl shadow-black/30 sm:hidden"
          aria-label="Novo cliente"
        >
          <Plus size={24} />
        </motion.button>
      </motion.div>

      {/* MODALS / DRAWERS */}
      <ClientFormModal
        open={modalOpen}
        editingCustomer={editingCustomer}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
      />

      <ClientDetailDrawer
        customer={detailCustomer}
        onClose={closeDetail}
        onEdit={() => detailCustomer && openEditModal(detailCustomer)}
      />
    </MotionConfig>
  );
}
