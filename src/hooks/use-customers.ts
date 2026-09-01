"use client";

import { useEffect, useState } from "react";

import { getCustomers } from "@/services/customers.client";
import type { EntityCustomer } from "@/types/entity-customer";

type CustomersState =
  | { status: "loading"; customers: EntityCustomer[]; error: null }
  | { status: "success"; customers: EntityCustomer[]; error: null }
  | { status: "error"; customers: EntityCustomer[]; error: string };

export function useCustomers(): CustomersState {
  const [state, setState] = useState<CustomersState>({
    status: "loading",
    customers: [],
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    getCustomers(controller.signal)
      .then((customers) => {
        setState({ status: "success", customers, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          customers: [],
          error:
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os clientes.",
        });
      });

    return () => controller.abort();
  }, []);

  return state;
}
