"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getMembers, MembersClientError } from "@/services/members.client";
import type { EntityMembershipListItem } from "@/types/entity-membership";

type MembersState =
  | { status: "loading"; members: EntityMembershipListItem[]; error: null }
  | { status: "success"; members: EntityMembershipListItem[]; error: null }
  | { status: "forbidden"; members: EntityMembershipListItem[]; error: string }
  | { status: "error"; members: EntityMembershipListItem[]; error: string };

export function useMembers(): MembersState & { reload: () => void } {
  const router = useRouter();
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<MembersState>({
    status: "loading",
    members: [],
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    getMembers(controller.signal)
      .then((members) => {
        setState({ status: "success", members, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;

        if (error instanceof MembersClientError) {
          if (error.statusCode === 401) {
            router.replace("/login");
            router.refresh();
            return;
          }

          if (error.statusCode === 403) {
            setState({
              status: "forbidden",
              members: [],
              error:
                "Você não possui permissão para acessar a equipe desta unidade.",
            });
            return;
          }
        }

        setState({
          status: "error",
          members: [],
          error:
            error instanceof Error
              ? error.message
              : "Não foi possível carregar a equipe.",
        });
      });

    return () => controller.abort();
  }, [router, reloadKey]);

  return { ...state, reload: () => setReloadKey((key) => key + 1) };
}
