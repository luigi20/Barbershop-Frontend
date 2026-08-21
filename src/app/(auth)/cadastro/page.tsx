import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Cadastro | BarberPro",
  description: "Crie sua conta e comece a gerenciar sua barbearia.",
};

export default function CadastroPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <SignupForm />
    </main>
  );
}
