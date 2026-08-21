"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Lock,
  Mail,
  Phone,
  Scissors,
  User,
} from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { signUp, AuthClientError } from "@/services/auth.client";
import type { SignUpFormValues } from "@/types/auth";

// ─── Schema ───────────────────────────────────────────────────────────────────

const signUpSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").trim(),
  email: z
    .string()
    .min(1, "Email obrigatório")
    .email("Formato de email inválido")
    .trim(),
  password: z
    .string()
    .min(10, "Mínimo 10 caracteres")
    .max(100, "Máximo 100 caracteres")
    .regex(/[A-Z]/, "Deve conter maiúscula")
    .regex(/[a-z]/, "Deve conter minúscula")
    .regex(/[0-9]/, "Deve conter número")
    .regex(/[^A-Za-z0-9]/, "Deve conter símbolo")
    .regex(/^\S+$/, "Não pode conter espaços"),
  birth_date: z
    .string()
    .min(1, "Data de nascimento obrigatória")
    .refine((val) => !isNaN(new Date(val).getTime()), "Data inválida")
    .refine(
      (val) => new Date(val) <= new Date(),
      "Data não pode ser no futuro",
    ),
  entity_type: z.enum(["barbearia", "studio"], {
    error: "Selecione o tipo de estabelecimento",
  }),
  entity_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .trim(),
  phone: z.string().min(1, "Telefone obrigatório").trim(),
  document: z.string().min(1, "Documento obrigatório").trim(),
});

// ─── Password strength checker ────────────────────────────────────────────────

const passwordRules = [
  {
    label: "10 a 100 caracteres",
    test: (v: string) => v.length >= 10 && v.length <= 100,
  },
  { label: "Letra maiúscula", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Letra minúscula", test: (v: string) => /[a-z]/.test(v) },
  { label: "Número", test: (v: string) => /[0-9]/.test(v) },
  { label: "Símbolo", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
  {
    label: "Sem espaços",
    test: (v: string) => v.length > 0 && /^\S+$/.test(v),
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ id, message }: { id?: string; message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          id={id}
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

interface InputFieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}

function InputField({ id, label, icon, error, children }: InputFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
      >
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
          {icon}
        </span>
        {children}
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { entity_type: "barbearia" },
  });

  const passwordValue = watch("password") ?? "";
  const entityType = watch("entity_type");

  async function goToStep2() {
    const valid = await trigger(["name", "email", "password", "birth_date"]);
    if (valid) setStep(2);
  }

  async function onSubmit(values: SignUpFormValues) {
    setGlobalError(null);
    try {
      await signUp(values);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      if (error instanceof AuthClientError) {
        setGlobalError(error.message);
      } else {
        setGlobalError("Ocorreu um erro inesperado. Tente novamente.");
      }
    }
  }

  const inputClass = (hasError: boolean) =>
    cn(
      "h-12 w-full rounded-xl border bg-[var(--surface)] pl-11 pr-4 text-sm outline-none transition",
      "placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)]",
      hasError ? "border-[var(--danger)]" : "border-[var(--border)]",
    );

  // ── Success state ──────────────────────────────────────────────────────────

  if (success) {
    return (
      <MotionConfig reducedMotion="user">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--success)]/15">
            <span className="text-2xl text-[var(--success)]">✓</span>
          </div>
          <h2 className="text-xl font-semibold">Cadastro realizado!</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Redirecionando para o login…
          </p>
        </motion.div>
      </MotionConfig>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="w-full max-w-sm"
      >
        {/* Brand */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)]">
            <span className="text-xl font-bold text-[var(--primary)]">B</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {step === 1 ? "Seus dados pessoais" : "Seu estabelecimento"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2">
          {[1, 2].map((n) => (
            <div
              key={n}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                n <= step ? "bg-[var(--primary)]" : "bg-[var(--border)]",
              )}
            />
          ))}
        </div>

        {/* Global error */}
        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="mb-4 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]"
              role="alert"
              aria-live="assertive"
            >
              {globalError}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <AnimatePresence mode="wait">
            {/* ── Step 1: Personal data ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="flex flex-col gap-4"
              >
                {/* Name */}
                <InputField
                  id="name"
                  label="Nome completo"
                  icon={<User size={16} />}
                  error={errors.name?.message}
                >
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Seu nome"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={inputClass(!!errors.name)}
                    {...register("name")}
                  />
                </InputField>

                {/* Email */}
                <InputField
                  id="signup-email"
                  label="Email"
                  icon={<Mail size={16} />}
                  error={errors.email?.message}
                >
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? "signup-email-error" : undefined
                    }
                    className={inputClass(!!errors.email)}
                    {...register("email")}
                  />
                </InputField>

                {/* Password */}
                <div>
                  <label
                    htmlFor="signup-password"
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
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••••"
                      aria-invalid={!!errors.password}
                      aria-describedby={
                        errors.password ? "signup-password-error" : undefined
                      }
                      className={cn(inputClass(!!errors.password), "pr-12")}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-[var(--foreground)]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <FieldError
                    id="signup-password-error"
                    message={errors.password?.message}
                  />

                  {/* Password strength indicators */}
                  {passwordValue.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1"
                      aria-label="Requisitos de senha"
                    >
                      {passwordRules.map((rule) => {
                        const ok = rule.test(passwordValue);
                        return (
                          <li
                            key={rule.label}
                            className={cn(
                              "flex items-center gap-1.5 text-[11px] transition-colors",
                              ok
                                ? "text-[var(--success)]"
                                : "text-[var(--muted)]",
                            )}
                          >
                            <span aria-hidden="true">{ok ? "✓" : "·"}</span>
                            {rule.label}
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </div>

                {/* Birth date */}
                <InputField
                  id="birth_date"
                  label="Data de nascimento"
                  icon={<Calendar size={16} />}
                  error={errors.birth_date?.message}
                >
                  <input
                    id="birth_date"
                    type="date"
                    aria-invalid={!!errors.birth_date}
                    aria-describedby={
                      errors.birth_date ? "birth_date-error" : undefined
                    }
                    className={cn(
                      inputClass(!!errors.birth_date),
                      "text-[var(--foreground)]",
                    )}
                    {...register("birth_date")}
                  />
                </InputField>

                {/* Next button */}
                <motion.button
                  type="button"
                  onClick={goToStep2}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-sm font-semibold text-black"
                >
                  Continuar
                  <ArrowRight size={16} aria-hidden="true" />
                </motion.button>
              </motion.div>
            )}

            {/* ── Step 2: Business data ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="flex flex-col gap-4"
              >
                {/* Entity type */}
                <div>
                  <p className="mb-2 text-sm font-medium text-[var(--foreground)]">
                    Tipo de estabelecimento
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["barbearia", "studio"] as const).map((type) => {
                      const active = entityType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setValue("entity_type", type, {
                              shouldValidate: true,
                            })
                          }
                          className={cn(
                            "relative flex h-14 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border text-xs font-medium transition",
                            active
                              ? "border-[var(--primary)] text-[var(--primary)]"
                              : "border-[var(--border)] text-[var(--muted)]",
                          )}
                        >
                          {active && (
                            <motion.span
                              layoutId="entity-type-bg"
                              className="absolute inset-0 bg-[var(--primary-soft)]"
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 32,
                              }}
                            />
                          )}
                          <span className="relative z-10">
                            {type === "barbearia" ? (
                              <Scissors size={16} aria-hidden="true" />
                            ) : (
                              <Building2 size={16} aria-hidden="true" />
                            )}
                          </span>
                          <span className="relative z-10 capitalize">
                            {type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <FieldError message={errors.entity_type?.message} />
                </div>

                {/* Entity name */}
                <InputField
                  id="entity_name"
                  label="Nome do estabelecimento"
                  icon={<Building2 size={16} />}
                  error={errors.entity_name?.message}
                >
                  <input
                    id="entity_name"
                    type="text"
                    placeholder="Ex: Barbearia do João"
                    aria-invalid={!!errors.entity_name}
                    aria-describedby={
                      errors.entity_name ? "entity_name-error" : undefined
                    }
                    className={inputClass(!!errors.entity_name)}
                    {...register("entity_name")}
                  />
                </InputField>

                {/* Phone */}
                <InputField
                  id="phone"
                  label="Telefone"
                  icon={<Phone size={16} />}
                  error={errors.phone?.message}
                >
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(11) 99999-9999"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    className={inputClass(!!errors.phone)}
                    {...register("phone")}
                  />
                </InputField>

                {/* Document */}
                <InputField
                  id="document"
                  label="CPF / CNPJ"
                  icon={<FileText size={16} />}
                  error={errors.document?.message}
                >
                  <input
                    id="document"
                    type="text"
                    placeholder="000.000.000-00"
                    aria-invalid={!!errors.document}
                    aria-describedby={
                      errors.document ? "document-error" : undefined
                    }
                    className={inputClass(!!errors.document)}
                    {...register("document")}
                  />
                </InputField>

                {/* Actions */}
                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    aria-label="Voltar"
                  >
                    <ArrowLeft size={18} aria-hidden="true" />
                  </button>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={isSubmitting ? {} : { scale: 1.015 }}
                    whileTap={isSubmitting ? {} : { scale: 0.97 }}
                    className={cn(
                      "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition",
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
                        Criando conta…
                      </>
                    ) : (
                      "Criar conta"
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Link to login */}
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--primary)] underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </p>
      </motion.div>
    </MotionConfig>
  );
}
