import type { ApiErrorResponse } from "@/types/auth";
import type { EntityCustomer } from "@/types/entity-customer";

export class CustomersClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "CustomersClientError";
  }
}

export async function getCustomers(
  signal?: AbortSignal,
): Promise<EntityCustomer[]> {
  const response = await fetch("/api/customers", {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    let message = "Não foi possível carregar os clientes.";
    try {
      const errorBody = (await response.json()) as ApiErrorResponse;
      if (errorBody.message) message = errorBody.message;
    } catch {
      // Resposta sem JSON: mantém a mensagem segura para a interface.
    }
    throw new CustomersClientError(message, response.status);
  }

  return response.json() as Promise<EntityCustomer[]>;
}
