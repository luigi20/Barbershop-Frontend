"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  CustomersClientError,
  getCustomers,
} from "@/services/customers.client";
import type { EntityCustomer } from "@/types/entity-customer";

type CustomersState =
  | { status: "loading"; customers: EntityCustomer[]; error: null }
  | { status: "success"; customers: EntityCustomer[]; error: null }
  | { status: "forbidden"; customers: EntityCustomer[]; error: string }
  | { status: "error"; customers: EntityCustomer[]; error: string };

export function useCustomers(): CustomersState {
  const router = useRouter();
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

        if (error instanceof CustomersClientError) {
          if (error.statusCode === 401) {
            router.replace("/login");
            router.refresh();
            return;
          }

          if (error.statusCode === 403) {
            setState({
              status: "forbidden",
              customers: [],
              error:
                "Você não possui permissão para acessar os clientes desta unidade.",
            });
            return;
          }
        }

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
  }, [router]);

  return state;
}
