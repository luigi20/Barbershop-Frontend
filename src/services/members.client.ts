import type { ApiErrorResponse } from "@/types/auth";
import type { EntityMembershipListItem } from "@/types/entity-membership";

export class MembersClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "MembersClientError";
  }
}

export async function getMembers(
  signal?: AbortSignal,
): Promise<EntityMembershipListItem[]> {
  const response = await fetch("/api/members", {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    let message = "Não foi possível carregar a equipe.";
    try {
      const errorBody = (await response.json()) as ApiErrorResponse;
      if (errorBody.message) message = errorBody.message;
    } catch {
      // Resposta sem JSON: mantém a mensagem segura para a interface.
    }
    throw new MembersClientError(message, response.status);
  }

  return response.json() as Promise<EntityMembershipListItem[]>;
}
