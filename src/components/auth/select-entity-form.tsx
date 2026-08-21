"use client";

import { Building2, Loader2, LogOut, Store } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { selectEntity, AuthClientError } from "@/services/auth.client";
import type { AuthEntity } from "@/types/auth";
import Link from "next/link";

interface SelectEntityFormProps {
  entities: AuthEntity[];
  loginToken: string;
}

export function SelectEntityForm({ entities, loginToken }: SelectEntityFormProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSelect(entityId: string) {
    if (isSubmitting) return;

    setGlobalError(null);
    setSelectedId(entityId);
    setIsSubmitting(true);

    try {
      const response = await selectEntity(entityId, loginToken);
      if (response.mfa_required) {
        router.push("/mfa");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setSelectedId(null);
      setIsSubmitting(false);

      if (error instanceof AuthClientError) {
        setGlobalError(error.message);
      } else {
        setGlobalError(
          "Ocorreu um erro ao selecionar o ambiente. Tente novamente.",
        );
      }
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
            <Building2 size={24} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Selecione o Ambiente
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Escolha qual barbearia você quer gerenciar
          </p>
        </div>

        {/* Global error */}
        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, height: 0 }}
              animate={{ opacity: 1, scale: 1, height: "auto" }}
              exit={{ opacity: 0, scale: 0.97, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4 overflow-hidden"
            >
              <div
                className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]"
                role="alert"
                aria-live="assertive"
              >
                {globalError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entity List */}
        <div className="flex flex-col gap-3">
          {entities.map((entity, index) => {
            const isSelectingThis = selectedId === entity.id;

            return (
              <motion.button
                key={entity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
                onClick={() => handleSelect(entity.id)}
                disabled={isSubmitting}
                className={cn(
                  "group relative flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition-all",
                  "hover:border-[var(--primary)] hover:bg-[var(--surface-hover)]",
                  "focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)]",
                  "disabled:pointer-events-none disabled:opacity-60",
                  isSelectingThis &&
                    "border-[var(--primary)] bg-[var(--surface-hover)] shadow-[0_0_15px_rgba(211,154,50,0.15)]",
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--surface-secondary)] text-[var(--muted-foreground)] transition-colors group-hover:bg-[var(--primary-soft)] group-hover:text-[var(--primary)]">
                    <Store size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--foreground)]">
                      {entity.entity_name || "Ambiente"}
                    </h3>
                    {entity.roles && entity.roles.length > 0 && (
                      <p className="text-xs text-[var(--muted)]">
                        {entity.roles
                          .map(
                            (r) =>
                              r.charAt(0).toUpperCase() +
                              r.slice(1).toLowerCase(),
                          )
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {isSelectingThis && (
                  <Loader2
                    className="animate-spin text-[var(--primary)]"
                    size={18}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Back/Cancel Link */}
        <p className="mt-8 text-center text-sm">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            <LogOut size={14} />
            Sair e voltar ao login
          </Link>
        </p>
      </motion.div>
    </MotionConfig>
  );
}
