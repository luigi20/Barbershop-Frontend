"use client";

import { FormEvent, useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { CurrentEntity } from "@/types/entity";

type Field =
  | "name"
  | "document"
  | "email"
  | "phone"
  | "photo"
  | "zip_code"
  | "street"
  | "number"
  | "complement"
  | "neighborhood"
  | "city"
  | "state"
  | "country";
const fields: { key: Field; label: string }[] = [
  { key: "name", label: "Nome" },
  { key: "document", label: "Documento" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Telefone" },
  { key: "photo", label: "URL da foto" },
  { key: "zip_code", label: "CEP" },
  { key: "street", label: "Rua" },
  { key: "number", label: "Número" },
  { key: "complement", label: "Complemento" },
  { key: "neighborhood", label: "Bairro" },
  { key: "city", label: "Cidade" },
  { key: "state", label: "Estado" },
  { key: "country", label: "País" },
];

export function EntityView() {
  const user = useCurrentUser();
  const [entity, setEntity] = useState<CurrentEntity | null>(null);
  const [form, setForm] = useState<Record<Field, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/entity/current", { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(
            body.message ?? "Não foi possível carregar a barbearia.",
          );
        const value = body as CurrentEntity;
        setEntity(value);
        setForm(
          Object.fromEntries(
            fields.map(({ key }) => [key, value[key] ?? ""]),
          ) as Record<Field, string>,
        );
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted)
          setError(cause instanceof Error ? cause.message : "Erro de conexão.");
      });
    return () => controller.abort();
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!entity || !form) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch("/api/entity/current", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          type: entity.type,
          document: form.document || null,
          email: form.email || null,
          phone: form.phone || null,
          photo: form.photo || null,
        }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.message ?? "Não foi possível salvar.");
      const updated = body as CurrentEntity;
      setEntity(updated);
      setForm(
        Object.fromEntries(
          fields.map(({ key }) => [key, updated[key] ?? ""]),
        ) as Record<Field, string>,
      );
      setSuccess(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  const admin =
    user.status === "success" && user.profile.roles.includes("administrador");
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Minha barbearia</h1>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-emerald-400">
          Barbearia atualizada com sucesso.
        </p>
      )}
      {!entity && !error && <p>Carregando...</p>}
      {entity && (
        <p className="text-sm text-[var(--muted)]">
          ID: {entity.id} · Status: {entity.status} · Tipo: {entity.type}
        </p>
      )}
      {entity && form && admin && (
        <form
          onSubmit={save}
          className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:grid-cols-2"
        >
          {fields.map(({ key, label }) => (
            <label key={key} className="text-xs">
              {label}
              <input
                required={[
                  "name",
                  "zip_code",
                  "street",
                  "number",
                  "neighborhood",
                  "city",
                  "state",
                  "country",
                ].includes(key)}
                value={form[key]}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? { ...current, [key]: event.target.value }
                      : current,
                  )
                }
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent p-2"
              />
            </label>
          ))}
          <button
            disabled={saving}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50 sm:col-span-2"
          >
            {saving ? "Salvando..." : "Salvar barbearia"}
          </button>
        </form>
      )}
    </main>
  );
}
