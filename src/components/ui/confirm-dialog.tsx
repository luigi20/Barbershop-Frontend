"use client";

import { motion, MotionConfig } from "motion/react";
import { useEffect, useId, useRef, type RefObject } from "react";

import { cn } from "@/lib/utils";

type ConfirmDialogVariant = "default" | "warning" | "destructive";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  isLoading?: boolean;
  error?: string | null;
  fallbackFocusRef?: RefObject<HTMLElement | null>;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  variant = "default",
  isLoading = false,
  error,
  fallbackFocusRef,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement;
    const fallbackFocus = fallbackFocusRef?.current;
    dialog.showModal();
    cancelRef.current?.focus();

    return () => {
      dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
      else fallbackFocus?.focus();
    };
  }, [open, fallbackFocusRef]);

  return (
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        if (!isLoading) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-0 text-[var(--foreground)] shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-[3px]"
    >
      {open && (
        <MotionConfig reducedMotion="user">
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-5 sm:p-6"
          >
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              {title}
            </h2>
            <p
              id={descriptionId}
              className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--muted)]"
            >
              {description}
            </p>
            {error && (
              <p role="alert" className="mt-4 text-sm text-[var(--danger)]">
                {error}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                ref={cancelRef}
                type="button"
                disabled={isLoading}
                onClick={onCancel}
                className="min-h-11 rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={onConfirm}
                className={cn(
                  "min-h-11 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60",
                  variant === "destructive"
                    ? "bg-[var(--danger)] text-black hover:bg-red-400 focus-visible:outline-[var(--danger)]"
                    : variant === "warning"
                      ? "border border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)] hover:bg-[var(--surface-hover)] focus-visible:outline-[var(--primary)]"
                      : "bg-[var(--primary)] text-black hover:bg-[var(--primary-hover)] focus-visible:outline-[var(--primary)]",
                )}
              >
                {isLoading ? "Aguarde..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </MotionConfig>
      )}
    </dialog>
  );
}
