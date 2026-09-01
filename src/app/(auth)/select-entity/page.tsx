import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SelectEntityForm } from "@/components/auth/select-entity-form";
import type { AuthEntity } from "@/types/auth";

export const metadata = {
  title: "Selecionar Ambiente | BarberPro",
  description: "Escolha o ambiente para gerenciar",
};

export default async function SelectEntityPage() {
  const cookieStore = await cookies();
  const entitiesHintCookie = cookieStore.get("entities_hint")?.value;

  // If no entities hint or challenge token is found, redirect back to login
  const challengeToken = cookieStore.get("challenge_token")?.value;
  if (!entitiesHintCookie || !challengeToken) {
    redirect("/login");
  }

  let entities: AuthEntity[] = [];
  try {
    entities = JSON.parse(entitiesHintCookie);
  } catch {
    redirect("/login");
  }

  // If there are no entities or only one, the login page should have handled it.
  // But just in case they reached here with <= 1 entity somehow:
  if (!Array.isArray(entities) || entities.length <= 1) {
    redirect("/login");
  }

  return (
    <div className="flex w-full items-center justify-center p-4">
      <SelectEntityForm entities={entities} />
    </div>
  );
}
