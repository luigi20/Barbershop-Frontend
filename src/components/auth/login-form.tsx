"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { signIn, AuthClientError } from "@/services/auth.client";
import type { LoginFormValues } from "@/types/auth";

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email obrigatório")
    .email("Formato de email inválido")
    .trim(),
  password: z.string().min(1, "Senha obrigatória"),
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="mt-1.5 text-xs text-[var(--danger)]"
          role="alert"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setGlobalError(null);
    try {
      await signIn(values);
      // Redirect to entity selection — the challenge cookie is already set by the BFF.
      router.push("/select-entity");
    } catch (error) {
      if (error instanceof AuthClientError) {
        setGlobalError(error.message);
      } else {
        setGlobalError("Ocorreu um erro inesperado. Tente novamente.");
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
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)]">
            <span className="text-xl font-bold text-[var(--primary)]">B</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Bem-vindo de volta
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Acesse sua barbearia
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          {/* Global error */}
          <AnimatePresence>
            {globalError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]"
                role="alert"
                aria-live="assertive"
              >
                {globalError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                aria-hidden="true"
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={cn(
                  "h-12 w-full rounded-xl border bg-[var(--surface)] pl-11 pr-4 text-sm outline-none transition",
                  "placeholder:text-[var(--muted-foreground)]",
                  "focus:border-[var(--primary)]",
                  errors.email
                    ? "border-[var(--danger)]"
                    : "border-[var(--border)]",
                )}
                {...register("email")}
              />
            </div>
            <span id="email-error">
              <FieldError message={errors.email?.message} />
            </span>
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
            >
              Senha
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                aria-hidden="true"
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className={cn(
                  "h-12 w-full rounded-xl border bg-[var(--surface)] pl-11 pr-12 text-sm outline-none transition",
                  "placeholder:text-[var(--muted-foreground)]",
                  "focus:border-[var(--primary)]",
                  errors.password
                    ? "border-[var(--danger)]"
                    : "border-[var(--border)]",
                )}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span id="password-error">
              <FieldError message={errors.password?.message} />
            </span>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={isSubmitting ? {} : { scale: 1.015 }}
            whileTap={isSubmitting ? {} : { scale: 0.97 }}
            className={cn(
              "mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition",
              "bg-[var(--primary)] text-black",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                  aria-hidden="true"
                />
                Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </motion.button>
        </form>
      </motion.div>
    </MotionConfig>
  );
}
