"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  entityWallTimeToIso,
  formatEntityBlock,
  isoToEntityFields,
} from "@/lib/availability-time";
import type { BlockInput, ProfessionalTimeBlock } from "@/types/availability";

interface Props {
  timezone: string;
  blocks: ProfessionalTimeBlock[];
  loading: boolean;
  error: string | null;
  onCreate: (input: BlockInput) => Promise<void>;
  onUpdate: (id: string, input: BlockInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function BlockForm({
  block,
  timezone,
  onClose,
  onSave,
}: {
  block: ProfessionalTimeBlock | null;
  timezone: string;
  onClose: () => void;
  onSave: (input: BlockInput) => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const errorId = useId();
  const start = block
    ? isoToEntityFields(block.starts_at, timezone)
    : { date: "", time: "" };
  const end = block
    ? isoToEntityFields(block.ends_at, timezone)
    : { date: "", time: "" };
  const [startDate, setStartDate] = useState(start.date);
  const [startTime, setStartTime] = useState(start.time);
  const [endDate, setEndDate] = useState(end.date);
  const [endTime, setEndTime] = useState(end.time);
  const [reason, setReason] = useState(block?.reason ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
    };
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const starts_at = entityWallTimeToIso(startDate, startTime, timezone);
    const ends_at = entityWallTimeToIso(endDate, endTime, timezone);
    if (!starts_at || !ends_at) {
      setError("Informe datas e horários válidos no fuso da barbearia.");
      return;
    }
    if (starts_at >= ends_at) {
      setError("O fim deve ser posterior ao início.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        starts_at,
        ends_at,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar o bloqueio.",
      );
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    "mt-1 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-white focus-visible:outline-2 focus-visible:outline-[var(--primary)]";
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-0 text-white backdrop:bg-black/75"
    >
      <form onSubmit={save} className="space-y-4 p-5 sm:p-6">
        <div>
          <h3 id={titleId} className="text-lg font-semibold">
            {block ? "Editar bloqueio" : "Novo bloqueio"}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Horários em {timezone}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Data inicial
            <input
              required
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="text-sm">
            Hora inicial
            <input
              required
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="text-sm">
            Data final
            <input
              required
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="text-sm">
            Hora final
            <input
              required
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
        <label className="block text-sm">
          Motivo opcional
          <input
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className={fieldClass}
          />
        </label>
        {error && (
          <p id={errorId} role="alert" className="text-sm text-[var(--danger)]">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="min-h-11 rounded-xl border border-[var(--border)] px-4 text-sm focus-visible:outline-2 focus-visible:outline-[var(--primary)] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="min-h-11 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-black focus-visible:outline-2 focus-visible:outline-[var(--primary)] disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar bloqueio"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export function TimeBlocksManager({
  timezone,
  blocks,
  loading,
  error,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState<ProfessionalTimeBlock | null | "new">(
    null,
  );
  const [removing, setRemoving] = useState<ProfessionalTimeBlock | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const removeButton = useRef<HTMLButtonElement>(null);

  async function remove() {
    if (!removing || deleting) return;
    setDeleting(true);
    setActionError(null);
    try {
      await onDelete(removing.id);
      setRemoving(null);
      setSuccess("Bloqueio removido.");
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível remover o bloqueio.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Bloqueios e folgas</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Horários apresentados em {timezone}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing("new");
            setSuccess(null);
          }}
          className="min-h-11 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-black focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
        >
          Adicionar bloqueio
        </button>
      </div>
      {loading && (
        <p role="status" className="mt-4 text-sm text-[var(--muted)]">
          Carregando bloqueios...
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mt-4 text-sm text-[var(--success)]">
          {success}
        </p>
      )}
      {!loading && !error && blocks.length === 0 && (
        <p className="mt-4 text-sm text-[var(--muted)]">
          Nenhum bloqueio cadastrado.
        </p>
      )}
      <div className="mt-4 space-y-3">
        {blocks.map((block) => (
          <article
            key={block.id}
            className="rounded-xl border border-[var(--border-soft)] bg-[var(--background)] p-4"
          >
            <p className="font-medium">
              {formatEntityBlock(block.starts_at, timezone)} —{" "}
              {formatEntityBlock(block.ends_at, timezone)}
            </p>
            {block.reason && (
              <p className="mt-1 text-sm text-[var(--muted)]">{block.reason}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(block);
                  setSuccess(null);
                }}
                className="min-h-11 rounded-lg border border-[var(--border)] px-3 text-sm focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
              >
                Editar
              </button>
              <button
                ref={removeButton}
                type="button"
                onClick={() => {
                  setRemoving(block);
                  setActionError(null);
                }}
                className="min-h-11 rounded-lg border border-[var(--danger)]/40 px-3 text-sm text-[var(--danger)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
              >
                Remover bloqueio
              </button>
            </div>
          </article>
        ))}
      </div>
      {editing && (
        <BlockForm
          key={editing === "new" ? "new" : editing.id}
          block={editing === "new" ? null : editing}
          timezone={timezone}
          onClose={() => setEditing(null)}
          onSave={async (input) => {
            if (editing === "new") await onCreate(input);
            else await onUpdate(editing.id, input);
            setSuccess("Bloqueio salvo com sucesso.");
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(removing)}
        title="Remover bloqueio"
        description="Tem certeza que deseja remover este período de indisponibilidade?"
        confirmLabel="Remover bloqueio"
        variant="destructive"
        isLoading={deleting}
        error={actionError}
        fallbackFocusRef={removeButton}
        onConfirm={remove}
        onCancel={() => setRemoving(null)}
      />
    </section>
  );
}
