"use client";

import { Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { validatePeriods, weekdays } from "@/lib/availability";
import type { HourPeriod } from "@/types/availability";

interface Props {
  title: string;
  description: string;
  periods: HourPeriod[];
  onSave: (periods: HourPeriod[]) => Promise<void>;
  businessHours?: HourPeriod[];
  disabled?: boolean;
}

export function WeeklyHoursEditor({
  title,
  description,
  periods,
  onSave,
  businessHours,
  disabled,
}: Props) {
  const [draft, setDraft] = useState(periods);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const id = useId();

  function update(
    index: number,
    field: "start_time" | "end_time",
    value: string,
  ) {
    setDraft((current) =>
      current.map((period, position) =>
        position === index ? { ...period, [field]: value } : period,
      ),
    );
    setSuccess(false);
    setError(null);
  }

  async function save() {
    const validation = validatePeriods(draft, businessHours);
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await onSave(draft);
      setSuccess(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar os horários.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6"
      aria-labelledby={`${id}-title`}
    >
      <div className="mb-5">
        <h2 id={`${id}-title`} className="text-lg font-semibold">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {weekdays.map((day, weekday) => (
          <div
            key={day}
            className="rounded-xl border border-[var(--border-soft)] bg-[var(--background)] p-4"
          >
            <h3 className="font-medium">{day}</h3>
            {draft.every((period) => period.weekday !== weekday) && (
              <p className="mt-3 text-sm text-[var(--muted)]">Sem expediente</p>
            )}
            <div className="mt-3 space-y-3">
              {draft.map(
                (period, index) =>
                  period.weekday === weekday && (
                    <div key={index} className="flex flex-wrap items-end gap-2">
                      <label className="min-w-25 flex-1 text-xs text-[var(--muted)]">
                        Início
                        <input
                          aria-describedby={error ? `${id}-error` : undefined}
                          type="time"
                          step="60"
                          value={period.start_time}
                          disabled={saving || disabled}
                          onChange={(event) =>
                            update(index, "start_time", event.target.value)
                          }
                          className="mt-1 min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
                        />
                      </label>
                      <span
                        className="pb-3 text-[var(--muted)]"
                        aria-hidden="true"
                      >
                        —
                      </span>
                      <label className="min-w-25 flex-1 text-xs text-[var(--muted)]">
                        Fim
                        <input
                          aria-describedby={error ? `${id}-error` : undefined}
                          type="text"
                          inputMode="numeric"
                          placeholder="HH:mm"
                          value={period.end_time}
                          disabled={saving || disabled}
                          onChange={(event) =>
                            update(index, "end_time", event.target.value)
                          }
                          className="mt-1 min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
                        />
                      </label>
                      <button
                        type="button"
                        aria-label={`Remover período de ${day}`}
                        disabled={saving || disabled}
                        onClick={() => {
                          setDraft((current) =>
                            current.filter((_, position) => position !== index),
                          );
                          setSuccess(false);
                        }}
                        className="flex size-11 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--danger)] focus-visible:outline-2 focus-visible:outline-[var(--primary)] disabled:opacity-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ),
              )}
            </div>
            <button
              type="button"
              disabled={saving || disabled}
              onClick={() => {
                setDraft((current) => [
                  ...current,
                  { weekday, start_time: "09:00", end_time: "18:00" },
                ]);
                setSuccess(false);
              }}
              className="mt-4 flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-[var(--primary)] disabled:opacity-50"
            >
              <Plus size={17} />
              Adicionar período
            </button>
          </div>
        ))}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-4 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mt-4 text-sm text-[var(--success)]">
          Horários salvos com sucesso.
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)]">
          24:00 é permitido somente como fim. Para atravessar a meia-noite,
          divida entre dois dias.
        </p>
        <button
          type="button"
          disabled={saving || disabled}
          onClick={save}
          className={cn(
            "min-h-11 rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
            (saving || disabled) && "opacity-50",
          )}
        >
          {saving ? "Salvando..." : "Salvar horários"}
        </button>
      </div>
    </section>
  );
}
