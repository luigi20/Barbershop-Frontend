"use client";

import { AgendaView } from "@/components/appointments/agenda-view";
import { useCurrentUser } from "@/hooks/use-current-user";

const agendaRoles = ["administrador", "recepcionista", "barbeiro"];

export function AgendaAccess() {
  const user = useCurrentUser();

  if (user.status === "loading") {
    return <p role="status">Carregando permissões da Agenda...</p>;
  }

  if (
    user.status !== "success" ||
    !user.profile.roles.some((role) => agendaRoles.includes(role))
  ) {
    return (
      <p role="status">
        A Agenda administrativa não está disponível para este perfil.
      </p>
    );
  }

  return (
    <AgendaView
      canManage={user.profile.roles.some((role) =>
        ["administrador", "recepcionista"].includes(role),
      )}
    />
  );
}
