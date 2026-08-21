import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { http, HttpError } from "@/lib/http.server";
import type { SignUpRequest } from "@/types/auth";

// ─── Validation schema ────────────────────────────────────────────────────────

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
    .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "Deve conter pelo menos um símbolo")
    .regex(/^\S+$/, "Não pode conter espaços"),
  birth_date: z
    .string()
    .min(1, "Data de nascimento obrigatória")
    .refine((val) => !isNaN(new Date(val).getTime()), "Data inválida")
    .refine(
      (val) => new Date(val) <= new Date(),
      "Data de nascimento não pode ser no futuro",
    ),
  entity_type: z.enum(["barbearia", "studio"], {
    error: "Tipo de estabelecimento inválido",
  }),
  entity_name: z
    .string()
    .min(2, "Nome do estabelecimento deve ter pelo menos 2 caracteres")
    .trim(),
  phone: z.string().min(1, "Telefone obrigatório").trim(),
  document: z.string().min(1, "Documento obrigatório").trim(),
});

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body inválido." },
      { status: 400 },
    );
  }

  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return NextResponse.json({ message }, { status: 422 });
  }

  const data = parsed.data;

  // 2. Build backend payload — photo is optional and omitted when not provided
  const backendPayload: SignUpRequest = {
    name: data.name,
    email: data.email,
    password: data.password,
    birth_date: data.birth_date,
    entity_type: data.entity_type,
    entity_name: data.entity_name,
    phone: data.phone,
    document: data.document,
  };

  // 3. Call NestJS backend
  try {
    await http.post<unknown>("/auth/signup", { body: backendPayload });
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.statusCode === 409) {
        return NextResponse.json(
          { message: "Este email já está cadastrado." },
          { status: 409 },
        );
      }
      if (error.statusCode >= 500) {
        return NextResponse.json(
          { message: "Erro interno do servidor. Tente novamente." },
          { status: 502 },
        );
      }
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    // Network / timeout error
    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  // 4. Success — response body from /auth/signup is not confirmed; return 201
  return NextResponse.json(
    { message: "Cadastro realizado com sucesso." },
    { status: 201 },
  );
}
