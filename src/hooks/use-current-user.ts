"use client";

import { useEffect, useState } from "react";
import type { MeProfile } from "@/types/auth";

type ProfileState =
  | { status: "loading"; profile: null; error: null }
  | { status: "success"; profile: MeProfile; error: null }
  | { status: "unauthenticated"; profile: null; error: null }
  | { status: "error"; profile: null; error: string };

export function useCurrentUser() {
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

  return state;
}
