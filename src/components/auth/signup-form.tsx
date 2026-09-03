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
  Image as ImageIcon,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { AuthClientError, signUp } from "@/services/auth.client";
import type { SignUpFormValues } from "@/types/auth";

const requiredText = (message: string) => z.string().min(1, message).trim();
const signUpSchema = z.object({
  email: z
    .string()
    .min(1, "Email obrigatório")
    .email("Formato de email inválido")
    .trim(),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").trim(),
  password: z
    .string()
    .min(10, "Mínimo 10 caracteres")
    .max(100, "Máximo 100 caracteres")
    .regex(/[A-Z]/, "Deve conter maiúscula")
    .regex(/[a-z]/, "Deve conter minúscula")
    .regex(/[0-9]/, "Deve conter número")
    .regex(/[^A-Za-z0-9]/, "Deve conter símbolo")
    .regex(/^\S+$/, "Não pode conter espaços"),
  entity_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .trim(),
  birth_date: requiredText("Data de nascimento obrigatória")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
    .refine(
      (value) => !Number.isNaN(Date.parse(`${value}T00:00:00`)),
      "Data inválida",
    )
    .refine(
      (value) => value <= new Date().toISOString().slice(0, 10),
      "Data não pode ser no futuro",
    ),
  phone: requiredText("Telefone obrigatório"),
  photo: requiredText("URL da foto obrigatória"),
  entity_type: z.literal("BARBERSHOP"),
  document: requiredText("Documento obrigatório"),
  zip_code: requiredText("CEP obrigatório"),
  street: requiredText("Rua obrigatória"),
  number: requiredText("Número obrigatório"),
  complement: z.string().trim().optional(),
  neighborhood: requiredText("Bairro obrigatório"),
  city: requiredText("Cidade obrigatória"),
  state: requiredText("Estado obrigatório"),
  country: requiredText("País obrigatório"),
});

const passwordRules = [
  {
    label: "10 a 100 caracteres",
    test: (value: string) => value.length >= 10 && value.length <= 100,
  },
  { label: "Letra maiúscula", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Letra minúscula", test: (value: string) => /[a-z]/.test(value) },
  { label: "Número", test: (value: string) => /[0-9]/.test(value) },
  { label: "Símbolo", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
  {
    label: "Sem espaços",
    test: (value: string) => value.length > 0 && /^\S+$/.test(value),
  },
];

interface InputFieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          id={id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="mt-1.5 text-xs text-[var(--danger)]"
          role="alert"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function InputField({
  id,
  label,
  icon,
  error,
  optional,
  children,
}: InputFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
      >
        {label}{" "}
        {optional && (
          <span className="font-normal text-[var(--muted)]">(opcional)</span>
        )}
      </label>
      <div className="relative">
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          aria-hidden="true"
        >
          {icon}
        </span>
        {children}
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

const STEP_FIELDS = {
  1: ["name", "email", "phone", "birth_date", "password", "photo"],
  2: ["entity_name", "entity_type", "document"],
} as const satisfies Record<1 | 2, readonly (keyof SignUpFormValues)[]>;

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { entity_type: "BARBERSHOP", country: "BR", complement: "" },
  });
  const passwordValue = useWatch({ control, name: "password" }) ?? "";
  const inputClass = (hasError: boolean) =>
    cn(
      "h-12 w-full rounded-xl border bg-[var(--surface)] pl-11 pr-4 text-sm outline-none transition",
      "placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)]",
      hasError ? "border-[var(--danger)]" : "border-[var(--border)]",
    );

  async function advance(from: 1 | 2) {
    setGlobalError(null);
    if (await trigger([...STEP_FIELDS[from]])) setStep((from + 1) as 2 | 3);
  }

  async function onSubmit(values: SignUpFormValues) {
    setGlobalError(null);
    try {
      await signUp(values);
      setSuccess(true);
      window.setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      setGlobalError(
        error instanceof AuthClientError
          ? error.message
          : "Ocorreu um erro inesperado. Tente novamente.",
      );
    }
  }

  if (success)
    return (
      <MotionConfig reducedMotion="user">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
          role="status"
          aria-live="polite"
        >
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--success)]/15 text-2xl text-[var(--success)]">
            ✓
          </div>
          <h2 className="text-xl font-semibold">Cadastro realizado!</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Redirecionando para o login…
          </p>
        </motion.div>
      </MotionConfig>
    );

  const stepTitle =
    step === 1
      ? "Seus dados pessoais"
      : step === 2
        ? "Sua empresa"
        : "Endereço da empresa";
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl font-bold text-[var(--primary)]">
            B
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{stepTitle}</p>
        </div>
        <div
          className="mb-6 flex items-center gap-2"
          aria-label={`Etapa ${step} de 3`}
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                item <= step ? "bg-[var(--primary)]" : "bg-[var(--border)]",
              )}
            />
          ))}
        </div>
        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]"
              role="alert"
              aria-live="assertive"
            >
              {globalError}
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <input type="hidden" {...register("entity_type")} />
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="flex flex-col gap-4"
              >
                <InputField
                  id="name"
                  label="Nome completo"
                  icon={<User size={16} />}
                  error={errors.name?.message}
                >
                  <input
                    id="name"
                    autoComplete="name"
                    placeholder="Seu nome"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={inputClass(!!errors.name)}
                    {...register("name")}
                  />
                </InputField>
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
                <div className="grid gap-4 sm:grid-cols-2">
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
                      placeholder="+5579999999999"
                      aria-invalid={!!errors.phone}
                      aria-describedby={
                        errors.phone ? "phone-error" : undefined
                      }
                      className={inputClass(!!errors.phone)}
                      {...register("phone")}
                    />
                  </InputField>
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
                      className={inputClass(!!errors.birth_date)}
                      {...register("birth_date")}
                    />
                  </InputField>
                </div>
                <div>
                  <label
                    htmlFor="signup-password"
                    className="mb-1.5 block text-sm font-medium"
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
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <FieldError
                    id="signup-password-error"
                    message={errors.password?.message}
                  />
                  {passwordValue && (
                    <ul
                      className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1"
                      aria-label="Requisitos de senha"
                    >
                      {passwordRules.map((rule) => {
                        const valid = rule.test(passwordValue);
                        return (
                          <li
                            key={rule.label}
                            className={cn(
                              "text-[11px]",
                              valid
                                ? "text-[var(--success)]"
                                : "text-[var(--muted)]",
                            )}
                          >
                            {valid ? "✓" : "·"} {rule.label}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <InputField
                  id="photo"
                  label="Foto (URL)"
                  icon={<ImageIcon size={16} />}
                  error={errors.photo?.message}
                >
                  <input
                    id="photo"
                    type="url"
                    autoComplete="url"
                    placeholder="https://..."
                    aria-invalid={!!errors.photo}
                    aria-describedby={
                      errors.photo ? "photo-error" : "photo-help"
                    }
                    className={inputClass(!!errors.photo)}
                    {...register("photo")}
                  />
                </InputField>
                <p
                  id="photo-help"
                  className="-mt-2 text-xs text-[var(--muted)]"
                >
                  O cadastro atual exige uma URL de foto. Upload não está
                  disponível nesta etapa.
                </p>
                <NextButton onClick={() => advance(1)} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="company"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="flex flex-col gap-4"
              >
                <div>
                  <span className="mb-1.5 block text-sm font-medium">
                    Tipo de estabelecimento
                  </span>
                  <div className="flex h-14 items-center gap-3 rounded-xl border border-[var(--primary)] bg-[var(--primary-soft)] px-4 text-sm font-medium text-[var(--primary)]">
                    <Building2 size={18} aria-hidden="true" /> Barbearia
                  </div>
                </div>
                <InputField
                  id="entity_name"
                  label="Nome da empresa"
                  icon={<Building2 size={16} />}
                  error={errors.entity_name?.message}
                >
                  <input
                    id="entity_name"
                    autoComplete="organization"
                    placeholder="Barbearia do Luís"
                    aria-invalid={!!errors.entity_name}
                    aria-describedby={
                      errors.entity_name ? "entity_name-error" : undefined
                    }
                    className={inputClass(!!errors.entity_name)}
                    {...register("entity_name")}
                  />
                </InputField>
                <InputField
                  id="document"
                  label="Documento"
                  icon={<FileText size={16} />}
                  error={errors.document?.message}
                >
                  <input
                    id="document"
                    inputMode="numeric"
                    placeholder="CPF ou CNPJ"
                    aria-invalid={!!errors.document}
                    aria-describedby={
                      errors.document ? "document-error" : undefined
                    }
                    className={inputClass(!!errors.document)}
                    {...register("document")}
                  />
                </InputField>
                <StepActions onBack={() => setStep(1)}>
                  <NextButton onClick={() => advance(2)} />
                </StepActions>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    id="zip_code"
                    label="CEP"
                    icon={<MapPin size={16} />}
                    error={errors.zip_code?.message}
                  >
                    <input
                      id="zip_code"
                      autoComplete="postal-code"
                      placeholder="49000-000"
                      aria-invalid={!!errors.zip_code}
                      aria-describedby={
                        errors.zip_code ? "zip_code-error" : undefined
                      }
                      className={inputClass(!!errors.zip_code)}
                      {...register("zip_code")}
                    />
                  </InputField>
                  <InputField
                    id="number"
                    label="Número"
                    icon={<MapPin size={16} />}
                    error={errors.number?.message}
                  >
                    <input
                      id="number"
                      autoComplete="address-line2"
                      placeholder="123"
                      aria-invalid={!!errors.number}
                      aria-describedby={
                        errors.number ? "number-error" : undefined
                      }
                      className={inputClass(!!errors.number)}
                      {...register("number")}
                    />
                  </InputField>
                </div>
                <InputField
                  id="street"
                  label="Rua"
                  icon={<MapPin size={16} />}
                  error={errors.street?.message}
                >
                  <input
                    id="street"
                    autoComplete="address-line1"
                    placeholder="Rua João Pessoa"
                    aria-invalid={!!errors.street}
                    aria-describedby={
                      errors.street ? "street-error" : undefined
                    }
                    className={inputClass(!!errors.street)}
                    {...register("street")}
                  />
                </InputField>
                <InputField
                  id="complement"
                  label="Complemento"
                  optional
                  icon={<MapPin size={16} />}
                  error={errors.complement?.message}
                >
                  <input
                    id="complement"
                    placeholder="Sala 2"
                    className={inputClass(!!errors.complement)}
                    {...register("complement")}
                  />
                </InputField>
                <InputField
                  id="neighborhood"
                  label="Bairro"
                  icon={<MapPin size={16} />}
                  error={errors.neighborhood?.message}
                >
                  <input
                    id="neighborhood"
                    placeholder="Centro"
                    aria-invalid={!!errors.neighborhood}
                    aria-describedby={
                      errors.neighborhood ? "neighborhood-error" : undefined
                    }
                    className={inputClass(!!errors.neighborhood)}
                    {...register("neighborhood")}
                  />
                </InputField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    id="city"
                    label="Cidade"
                    icon={<MapPin size={16} />}
                    error={errors.city?.message}
                  >
                    <input
                      id="city"
                      autoComplete="address-level2"
                      placeholder="Aracaju"
                      aria-invalid={!!errors.city}
                      aria-describedby={errors.city ? "city-error" : undefined}
                      className={inputClass(!!errors.city)}
                      {...register("city")}
                    />
                  </InputField>
                  <InputField
                    id="state"
                    label="Estado"
                    icon={<MapPin size={16} />}
                    error={errors.state?.message}
                  >
                    <input
                      id="state"
                      autoComplete="address-level1"
                      placeholder="SE"
                      aria-invalid={!!errors.state}
                      aria-describedby={
                        errors.state ? "state-error" : undefined
                      }
                      className={inputClass(!!errors.state)}
                      {...register("state")}
                    />
                  </InputField>
                </div>
                <InputField
                  id="country"
                  label="País"
                  icon={<MapPin size={16} />}
                  error={errors.country?.message}
                >
                  <input
                    id="country"
                    autoComplete="country"
                    aria-invalid={!!errors.country}
                    aria-describedby={
                      errors.country ? "country-error" : "country-help"
                    }
                    className={inputClass(!!errors.country)}
                    {...register("country")}
                  />
                </InputField>
                <p
                  id="country-help"
                  className="-mt-2 text-xs text-[var(--muted)]"
                >
                  Preenchido como BR para o contexto atual e disponível para
                  edição.
                </p>
                <StepActions onBack={() => setStep(2)}>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={isSubmitting ? {} : { scale: 1.015 }}
                    whileTap={isSubmitting ? {} : { scale: 0.97 }}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
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
                </StepActions>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
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

function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      className="mt-2 flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-sm font-semibold text-black"
    >
      Continuar <ArrowRight size={16} aria-hidden="true" />
    </motion.button>
  );
}
function StepActions({
  onBack,
  children,
}: {
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-2 flex gap-3">
      <button
        type="button"
        onClick={onBack}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
        aria-label="Voltar"
      >
        <ArrowLeft size={18} aria-hidden="true" />
      </button>
      {children}
    </div>
  );
}
