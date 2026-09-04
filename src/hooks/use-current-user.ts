"use client";

import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import type { MeProfile } from "@/types/auth";

type ProfileState =
  | { status: "loading"; profile: null; error: null }
  | { status: "success"; profile: MeProfile; error: null }
  | { status: "unauthenticated"; profile: null; error: null }
  | { status: "forbidden"; profile: null; error: string }
  | { status: "error"; profile: null; error: string };

const CurrentUserContext = createContext<ProfileState | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProfileState>({
    status: "loading",
    profile: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (response.status === 401) {
          setState({
            status: "unauthenticated",
            profile: null,
            error: null,
          });
          return;
        }

        if (response.status === 403) {
          setState({
            status: "forbidden",
            profile: null,
            error: "Seu acesso a este perfil não foi autorizado.",
          });
          return;
        }

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          const errMsg =
            errBody?.message || `Erro do servidor: ${response.status}`;
          throw new Error(errMsg);
        }

        const profile = (await response.json()) as MeProfile;

        setState({
          status: "success",
          profile,
          error: null,
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        setState({
          status: "error",
          profile: null,
          error:
            error instanceof Error
              ? error.message
              : "Não foi possível carregar o perfil.",
        });
      }
    }

    loadProfile();

    return () => controller.abort();
  }, []);

  return createElement(CurrentUserContext.Provider, { value: state }, children);
}

export function useCurrentUser() {
  const state = useContext(CurrentUserContext);

  if (!state) {
    throw new Error(
      "useCurrentUser deve ser usado dentro de CurrentUserProvider.",
    );
  }

  return state;
}
