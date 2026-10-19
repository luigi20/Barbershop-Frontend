"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
} from "motion/react";

import { Check, Clock3, Pencil, Plus, Search, Scissors, X } from "lucide-react";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { CatalogService as Service } from "@/types/service";

const smoothEase = [0.22, 1, 0.36, 1] as const;

type ServiceFilter = "all" | "active" | "inactive";

interface ServiceForm {
  name: string;
  description: string;
  durationMinutes: string;
  price: string;
}

const emptyForm: ServiceForm = {
  name: "",
  description: "",
  durationMinutes: "45",
  price: "",
};

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

export function ServicesView() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [pendingService, setPendingService] = useState<Service | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const actionInFlight = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/services", { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(
            body.message ?? "Não foi possível carregar os serviços.",
          );
        setServices(body as Service[]);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted)
          setError(cause instanceof Error ? cause.message : "Erro de conexão.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<ServiceFilter>("all");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingService, setEditingService] = useState<Service | null>(null);

  const [form, setForm] = useState<ServiceForm>(emptyForm);

  const filteredServices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(normalizedSearch) ||
        service.description?.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && service.status === "ativo") ||
        (filter === "inactive" && service.status === "inativo");

      return matchesSearch && matchesFilter;
    });
  }, [services, search, filter]);

  const stats = useMemo(() => {
    const active = services.filter((service) => service.status === "ativo");

    const averagePrice =
      active.length > 0
        ? active.reduce((total, service) => total + Number(service.price), 0) /
          active.length
        : 0;

    const averageDuration =
      active.length > 0
        ? active.reduce(
            (total, service) => total + service.duration_minutes,
            0,
          ) / active.length
        : 0;

    return {
      total: services.length,
      active: active.length,
      averagePrice,
      averageDuration,
    };
  }, [services]);

  function openCreateModal() {
    setError(null);
    setSuccess(null);
    setEditingService(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  async function openEditModal(service: Service) {
    setError(null);
    setSuccess(null);
    setLoadingDetailId(service.id);
    try {
      const response = await fetch(`/api/services/${service.id}`);
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message ?? "Não foi possível abrir o serviço.");
      }
      const detail = body as Service;
      setEditingService(detail);
      setForm({
        name: detail.name,
        description: detail.description ?? "",
        durationMinutes: String(detail.duration_minutes),
        price: detail.price,
      });
      setModalOpen(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro de conexão.");
    } finally {
      setLoadingDetailId(null);
    }
  }

  function closeModal() {
    setModalOpen(false);

    window.setTimeout(() => {
      setEditingService(null);
      setForm(emptyForm);
    }, 200);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();

    const durationMinutes = Number(form.durationMinutes);

    const normalized = form.price.trim().replace(",", ".");
    const [whole, fraction = ""] = normalized.split(".");
    const price = `${whole}.${fraction.padEnd(2, "0")}`;

    if (
      !name ||
      !Number.isInteger(durationMinutes) ||
      durationMinutes <= 0 ||
      durationMinutes > 1440 ||
      !/^(0|[1-9]\d{0,7})\.\d{2}$/.test(price)
    ) {
      setError(
        "Informe nome, preço decimal válido e duração de 1 a 1440 minutos.",
      );
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(
        editingService ? `/api/services/${editingService.id}` : "/api/services",
        {
          method: editingService ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description: form.description.trim() || null,
            duration_minutes: durationMinutes,
            price,
          }),
        },
      );
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.message ?? "Não foi possível salvar o serviço.");
      const saved = body as Service;
      setServices((current) =>
        editingService
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved],
      );
      setSuccess(
        editingService
          ? "Serviço atualizado com sucesso."
          : "Serviço criado com sucesso.",
      );
      closeModal();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  function requestToggle(service: Service) {
    if (actionInFlight.current) return;
    setActionError(null);
    setPendingService(service);
  }

  async function toggleService() {
    const current = pendingService;
    if (!current || actionInFlight.current) return;
    actionInFlight.current = true;
    setError(null);
    setSuccess(null);
    setActionError(null);
    setTogglingId(current.id);
    try {
      const response = await fetch(`/api/services/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: current.status === "ativo" ? "inativo" : "ativo",
        }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.message ?? "Não foi possível alterar o status.");
      setServices((items) =>
        items.map((item) =>
          item.id === current.id ? (body as Service) : item,
        ),
      );
      setSuccess(
        current.status === "ativo"
          ? "Serviço desativado."
          : "Serviço reativado.",
      );
      setPendingService(null);
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : "Erro de conexão.",
      );
    } finally {
      actionInFlight.current = false;
      setTogglingId(null);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          ease: smoothEase,
        }}
      >
        {/* HEADER */}

        <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--primary)]">
              Catálogo
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Serviços
            </h1>

            <p className="mt-1 max-w-lg text-sm text-[var(--muted)]">
              Gerencie os serviços, preços e duração dos atendimentos.
            </p>
          </div>

          <motion.button
            onClick={openCreateModal}
            whileHover={{
              scale: 1.015,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className="hidden h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-black sm:flex"
          >
            <Plus size={18} />
            Novo serviço
          </motion.button>
        </section>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="mt-4 text-sm text-emerald-400">
            {success}
          </p>
        )}
        {loadingDetailId && (
          <p role="status" className="mt-2 text-xs text-[var(--muted)]">
            Carregando detalhe do serviço...
          </p>
        )}

        {/* INDICADORES */}

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="Serviços"
            value={String(stats.total)}
            description="Cadastrados"
          />

          <StatCard
            title="Ativos"
            value={String(stats.active)}
            description="Disponíveis"
          />

          <StatCard
            title="Preço médio"
            value={formatCurrency(stats.averagePrice)}
            description="Serviços ativos"
          />

          <StatCard
            title="Duração média"
            value={`${Math.round(stats.averageDuration)} min`}
            description="Por atendimento"
          />
        </section>

        {/* BUSCA */}

        <section className="mt-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar serviço..."
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm outline-none transition placeholder:text-[#555] focus:border-[var(--primary)]"
              />
            </div>

            <LayoutGroup id="service-filter">
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

        {/* LISTAGEM */}

        <section className="mt-5">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <p className="text-sm text-[var(--muted)]">
                Carregando serviços...
              </p>
            ) : error &&
              services.length === 0 ? null : filteredServices.length === 0 ? (
              <motion.div
                key="empty"
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                }}
                className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center"
              >
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <Scissors size={21} />
                </div>

                <h2 className="mt-4 text-sm font-semibold">
                  {services.length === 0
                    ? "Nenhum serviço cadastrado"
                    : "Nenhum serviço encontrado"}
                </h2>

                <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--muted)]">
                  {services.length === 0
                    ? "Cadastre o primeiro serviço para começar."
                    : "Tente alterar os filtros selecionados."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredServices.map((service, index) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      index={index}
                      onEdit={() => void openEditModal(service)}
                      onToggle={() => requestToggle(service)}
                      busy={
                        togglingId === service.id ||
                        loadingDetailId === service.id
                      }
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
          initial={{
            opacity: 0,
            scale: 0.7,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          whileTap={{
            scale: 0.9,
          }}
          className="fixed bottom-24 right-5 z-30 flex size-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-black shadow-xl shadow-black/30 sm:hidden"
          aria-label="Novo serviço"
        >
          <Plus size={24} />
        </motion.button>

        <ConfirmDialog
          open={pendingService !== null}
          title={
            pendingService?.status === "ativo"
              ? "Desativar serviço"
              : "Reativar serviço"
          }
          description={
            pendingService?.status === "ativo"
              ? `Tem certeza que deseja desativar "${pendingService.name}"?\nO serviço permanecerá cadastrado e poderá ser reativado depois.`
              : `Tem certeza que deseja reativar "${pendingService?.name ?? ""}"?\nO serviço voltará a ficar disponível para atendimentos.`
          }
          confirmLabel={
            pendingService?.status === "ativo"
              ? "Desativar serviço"
              : "Reativar serviço"
          }
          variant={
            pendingService?.status === "ativo" ? "destructive" : "default"
          }
          isLoading={togglingId !== null}
          error={actionError}
          onConfirm={() => void toggleService()}
          onCancel={() => {
            setPendingService(null);
            setActionError(null);
          }}
        />

        {/* MODAL */}

        <AnimatePresence>
          {modalOpen && (
            <motion.div
              className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            >
              <motion.button
                type="button"
                aria-label="Fechar modal"
                onClick={closeModal}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
              />

              <motion.form
                onSubmit={handleSubmit}
                initial={{
                  opacity: 0,
                  y: 50,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 35,
                  scale: 0.98,
                }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 32,
                }}
                className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-[var(--border)] bg-[#111111] p-5 sm:max-w-lg sm:rounded-2xl sm:p-6"
              >
                <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#333] sm:hidden" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--primary)]">
                      Serviços
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                      {editingService ? "Editar serviço" : "Novo serviço"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex size-10 items-center justify-center rounded-xl bg-[var(--surface-secondary)] text-[var(--muted)] transition hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  <FormField label="Nome">
                    <input
                      autoFocus
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Ex.: Corte + Barba"
                      className="h-12 w-full rounded-xl border border-[var(--border)] bg-[#0b0b0b] px-4 text-sm outline-none transition placeholder:text-[#555] focus:border-[var(--primary)]"
                    />
                  </FormField>

                  <FormField label="Descrição">
                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="Descreva o serviço..."
                      className="w-full resize-none rounded-xl border border-[var(--border)] bg-[#0b0b0b] p-4 text-sm outline-none transition placeholder:text-[#555] focus:border-[var(--primary)]"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Duração">
                      <div className="relative">
                        <Clock3
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                        />

                        <input
                          type="number"
                          min={5}
                          step={5}
                          value={form.durationMinutes}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              durationMinutes: event.target.value,
                            }))
                          }
                          className="h-12 w-full rounded-xl border border-[var(--border)] bg-[#0b0b0b] pl-10 pr-9 text-sm outline-none focus:border-[var(--primary)]"
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">
                          min
                        </span>
                      </div>
                    </FormField>

                    <FormField label="Preço">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">
                          R$
                        </span>

                        <input
                          inputMode="decimal"
                          value={form.price}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              price: event.target.value,
                            }))
                          }
                          placeholder="0,00"
                          className="h-12 w-full rounded-xl border border-[var(--border)] bg-[#0b0b0b] pl-10 pr-4 text-sm outline-none placeholder:text-[#555] focus:border-[var(--primary)]"
                        />
                      </div>
                    </FormField>
                  </div>
                </div>

                {error && (
                  <p role="alert" className="mt-4 text-sm text-red-400">
                    {error}
                  </p>
                )}
                <div className="mt-7 flex gap-3">
                  <motion.button
                    type="button"
                    onClick={closeModal}
                    whileTap={{
                      scale: 0.97,
                    }}
                    className="h-12 flex-1 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--muted)]"
                  >
                    Cancelar
                  </motion.button>

                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={{
                      scale: 1.01,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-sm font-semibold text-black"
                  >
                    <Check size={18} />

                    {editingService ? "Salvar alterações" : "Criar serviço"}
                  </motion.button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  );
}

function ServiceCard({
  service,
  index,
  onEdit,
  onToggle,
  busy,
}: {
  service: Service;
  index: number;
  onEdit: () => void;
  onToggle: () => void;
  busy: boolean;
}) {
  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 15,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.97,
      }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.04, 0.2),
        ease: smoothEase,
      }}
      whileHover={{
        y: -3,
      }}
      className="group rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 transition-colors hover:border-[#353535]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
              service.status === "ativo"
                ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                : "bg-white/5 text-[var(--muted)]"
            }`}
          >
            <Scissors size={19} />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{service.name}</h2>

            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full ${
                  service.status === "ativo" ? "bg-emerald-400" : "bg-zinc-500"
                }`}
              />

              <span
                className={`text-[10px] ${
                  service.status === "ativo"
                    ? "text-emerald-400"
                    : "text-[var(--muted)]"
                }`}
              >
                {service.status === "ativo" ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onEdit}
          whileTap={{
            scale: 0.9,
          }}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-transparent text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface-secondary)] hover:text-white"
          aria-label="Editar serviço"
        >
          <Pencil size={16} />
        </motion.button>
      </div>

      <p className="mt-4 min-h-10 text-xs leading-5 text-[var(--muted)]">
        {service.description || "Nenhuma descrição cadastrada."}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[var(--border-soft)] bg-[#0c0c0c] p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]">
            <Clock3 size={12} />
            Duração
          </div>

          <p className="mt-2 text-sm font-semibold">
            {service.duration_minutes} min
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-soft)] bg-[#0c0c0c] p-3">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]">
            Valor
          </p>

          <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
            {formatCurrency(service.price)}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-[var(--border-soft)] pt-4">
        <motion.button
          type="button"
          onClick={onToggle}
          disabled={busy}
          whileTap={{
            scale: 0.98,
          }}
          className={`flex h-10 w-full items-center justify-center rounded-xl text-xs font-medium transition disabled:opacity-50 ${
            service.status === "ativo"
              ? "bg-red-500/5 text-red-400 hover:bg-red-500/10"
              : "bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
          }`}
        >
          {busy
            ? "Aguarde..."
            : service.status === "ativo"
              ? "Desativar serviço"
              : "Reativar serviço"}
        </motion.button>
      </div>
    </motion.article>
  );
}

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
      whileHover={{
        y: -2,
      }}
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
      whileTap={{
        scale: 0.96,
      }}
      className={`relative h-11 min-w-[86px] overflow-hidden rounded-xl border px-4 text-xs font-medium transition-colors ${
        active
          ? "border-[var(--primary)] text-[var(--primary)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
      }`}
    >
      {active && (
        <motion.span
          layoutId="service-filter-active"
          className="absolute inset-0 bg-[var(--primary-soft)]"
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 34,
          }}
        />
      )}

      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

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
