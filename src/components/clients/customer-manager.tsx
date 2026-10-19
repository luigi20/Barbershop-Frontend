"use client";

import { FormEvent, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type {
  EntityCustomer,
  EntityCustomerStatus,
} from "@/types/entity-customer";

export function CustomerManager({
  customers,
  onSaved,
}: {
  customers: EntityCustomer[];
  onSaved: () => void;
}) {
  const [selected, setSelected] = useState<EntityCustomer | null>(null);
  const [creating, setCreating] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<EntityCustomerStatus>("ativo");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const busyRef = useRef(false);
  const customerSelectRef = useRef<HTMLSelectElement>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    birth_date: "",
    photo: "",
  });

  async function select(customerId: string) {
    setError(null);
    setSuccess(null);
    setLoadingDetail(true);
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message ?? "Não foi possível abrir o cliente.");
      }
      const customer = body as EntityCustomer;
      setSelected(customer);
      setNotes(customer.notes ?? "");
      setStatus(customer.status);
      setCreating(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro de conexão.");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current) return;
    setError(null);
    setSuccess(null);
    if (!creating && status === "inativo" && selected?.status !== "inativo") {
      setConfirmOpen(true);
      return;
    }
    await persist();
  }

  async function persist() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const response = await fetch(
        creating ? "/api/customers" : `/api/customers/${selected?.customer_id}`,
        {
          method: creating ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            creating ? { ...form, notes } : { notes, status },
          ),
        },
      );
      const body = await response.json();
      if (!response.ok) {
        throw new Error(
          response.status === 409
            ? "Este cliente já está vinculado à barbearia."
            : response.status === 403
              ? "Você não tem permissão para alterar clientes."
              : (body.message ?? "Não foi possível salvar o cliente."),
        );
      }
      setSuccess(
        creating
          ? "Cliente criado com sucesso."
          : "Cliente atualizado com sucesso.",
      );
      setConfirmOpen(false);
      setCreating(false);
      setSelected(null);
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        birth_date: "",
        photo: "",
      });
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro de conexão.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="mt-5 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <ConfirmDialog
        open={confirmOpen}
        title="Desativar cliente"
        description={`Tem certeza que deseja desativar "${selected?.profile_name?.trim() || "este cliente"}"?\nO vínculo desse cliente com a barbearia ficará inativo.`}
        confirmLabel="Desativar cliente"
        variant="destructive"
        isLoading={busy}
        error={error}
        fallbackFocusRef={customerSelectRef}
        onConfirm={() => void persist()}
        onCancel={() => setConfirmOpen(false)}
      />
      <h2 className="font-semibold">Gestão de clientes</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setCreating(true);
            setSelected(null);
            setNotes("");
            setError(null);
            setSuccess(null);
          }}
          className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-black"
        >
          Novo cliente
        </button>
        <select
          ref={customerSelectRef}
          aria-label="Abrir detalhe do cliente"
          value={selected?.customer_id ?? ""}
          onChange={(event) => {
            if (event.target.value) void select(event.target.value);
          }}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-xs"
        >
          <option value="">Selecionar cliente da lista</option>
          {customers.map((customer) => (
            <option key={customer.customer_id} value={customer.customer_id}>
              {customer.profile_name || customer.email || customer.customer_id}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-emerald-400">
          {success}
        </p>
      )}
      {loadingDetail && (
        <p role="status" className="text-xs text-[var(--muted)]">
          Carregando detalhe do cliente...
        </p>
      )}
      {selected && (
        <p className="text-xs text-[var(--muted)]">
          {selected.profile_name} · {selected.email} · customer_id:{" "}
          {selected.customer_id}
        </p>
      )}
      {(creating || selected) && (
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          {creating && (
            <>
              {(
                [
                  "name",
                  "email",
                  "phone",
                  "password",
                  "birth_date",
                  "photo",
                ] as const
              ).map((key) => (
                <label key={key} className="text-xs">
                  {
                    {
                      name: "Nome",
                      email: "Email",
                      phone: "Telefone",
                      password: "Senha inicial",
                      birth_date: "Nascimento",
                      photo: "URL da foto",
                    }[key]
                  }
                  <input
                    required={key !== "photo"}
                    type={
                      key === "password"
                        ? "password"
                        : key === "birth_date"
                          ? "date"
                          : key === "email"
                            ? "email"
                            : "text"
                    }
                    value={form[key]}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent p-2"
                  />
                </label>
              ))}
            </>
          )}
          <label className="text-xs sm:col-span-2">
            Notas
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent p-2"
            />
          </label>
          {!creating && (
            <label className="text-xs">
              Status
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as EntityCustomerStatus)
                }
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </label>
          )}
          <button
            disabled={busy}
            className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-black disabled:opacity-50 sm:col-span-2"
          >
            {busy
              ? "Salvando..."
              : creating
                ? "Criar cliente"
                : "Salvar vínculo"}
          </button>
        </form>
      )}
    </section>
  );
}
