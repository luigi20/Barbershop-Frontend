"use client";

import { useId, useMemo, useState } from "react";

interface Props {
  timezone: string | null;
  onSave: (timezone: string) => Promise<void>;
}

export function TimezoneSettings({ timezone, onSave }: Props) {
  const [draft, setDraft] = useState(timezone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const listId = useId();
  const errorId = useId();
  const suggested = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );
  const zones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return [];
    }
  }, []);

  async function save() {
    const selected = draft.trim();
    try {
      new Intl.DateTimeFormat("pt-BR", { timeZone: selected });
    } catch {
      setError("Escolha um fuso horário IANA válido.");
      return;
    }
    if (!selected) {
      setError("Escolha um fuso horário.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await onSave(selected);
      setSuccess(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar o fuso horário.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
      <h2 className="text-lg font-semibold">Fuso horário da barbearia</h2>
      {!timezone && (
        <p className="mt-2 rounded-xl border border-[var(--primary)]/40 bg-[var(--primary-soft)] p-3 text-sm text-[var(--primary)]">
          Defina o fuso horário da barbearia antes de configurar os horários.
        </p>
      )}
      <p className="mt-2 text-sm text-[var(--muted)]">
        Atual: {timezone ?? "Não configurado"}. Os bloqueios serão exibidos
        neste fuso.
      </p>
      {suggested && (
        <p className="mt-1 text-xs text-[var(--muted)]">
          Sugestão deste dispositivo: {suggested}. Nada será salvo
          automaticamente.
        </p>
      )}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm">
          Fuso horário IANA
          <input
            type="text"
            list={listId}
            autoComplete="off"
            value={draft}
            disabled={saving}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(null);
              setSuccess(false);
            }}
            placeholder="Ex.: America/Belem"
            className="mt-1 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-white focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          />
        </label>
        <datalist id={listId}>
          {zones.map((zone) => (
            <option key={zone} value={zone} />
          ))}
          {suggested && !zones.includes(suggested) && (
            <option value={suggested} />
          )}
        </datalist>
        <button
          type="button"
          onClick={save}
          disabled={saving || draft.trim() === timezone}
          className="min-h-11 rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar fuso"}
        </button>
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-3 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mt-3 text-sm text-[var(--success)]">
          Fuso horário salvo.
        </p>
      )}
    </section>
  );
}
