"use client";

import { FormEvent, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCurrentUser } from "@/hooks/use-current-user";
import type {
  EntityMembershipListItem,
  MemberRole,
  MembershipStatus,
} from "@/types/entity-membership";

const allRoles: MemberRole[] = ["administrador", "recepcionista", "barbeiro"];

export function MemberManager({
  members,
  onSaved,
}: {
  members: EntityMembershipListItem[];
  onSaved: () => void;
}) {
  const user = useCurrentUser();
  const admin =
    user.status === "success" && user.profile.roles.includes("administrador");
  const [selected, setSelected] = useState<EntityMembershipListItem | null>(
    null,
  );
  const [roles, setRoles] = useState<MemberRole[]>([]);
  const [status, setStatus] = useState<MembershipStatus>("ativo");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const busyRef = useRef(false);
  const memberSelectRef = useRef<HTMLSelectElement>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    birth_date: "",
    photo: "",
  });

  async function select(profileId: string) {
    setError(null);
    setSuccess(null);
    setLoadingDetail(true);
    try {
      const response = await fetch(`/api/members/${profileId}`);
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message ?? "Não foi possível abrir o membro.");
      }
      const member = body as EntityMembershipListItem;
      setSelected(member);
      setRoles(member.roles);
      setStatus(member.status);
      setCreating(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro de conexão.");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current) return;
    setError(null);
    setSuccess(null);
    if (!creating && status === "inativo" && selected?.status !== "inativo") {
      setConfirmOpen(true);
      return;
    }
    await persist();
  }

  async function persist() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const response = await fetch(
        creating ? "/api/members" : `/api/members/${selected?.profile_id}`,
        {
          method: creating ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            creating ? { ...form, roles } : { roles, status },
          ),
        },
      );
      const body = await response.json();
      if (!response.ok) {
        throw new Error(
          response.status === 409
            ? "Este membro já está vinculado à barbearia."
            : response.status === 403
              ? "Você não tem permissão para alterar a equipe."
              : (body.message ?? "Não foi possível salvar o membro."),
        );
      }
      setSuccess(
        creating
          ? "Membro criado com sucesso."
          : "Membro atualizado com sucesso.",
      );
      setConfirmOpen(false);
      setCreating(false);
      setSelected(null);
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        birth_date: "",
        photo: "",
      });
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro de conexão.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  const canEdit = admin || !selected?.roles.includes("administrador");
  return (
    <section className="mt-5 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <ConfirmDialog
        open={confirmOpen}
        title="Desativar membro"
        description={`Tem certeza que deseja desativar "${selected?.profile_name?.trim() || "este membro"}"?\nO acesso desse membro à barbearia ficará inativo.`}
        confirmLabel="Desativar membro"
        variant="destructive"
        isLoading={busy}
        error={error}
        fallbackFocusRef={memberSelectRef}
        onConfirm={() => void persist()}
        onCancel={() => setConfirmOpen(false)}
      />
      <h2 className="font-semibold">Gestão da equipe</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setCreating(true);
            setSelected(null);
            setRoles(["barbeiro"]);
            setError(null);
            setSuccess(null);
          }}
          className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-black"
        >
          Novo membro
        </button>
        <select
          ref={memberSelectRef}
          aria-label="Abrir detalhe do membro"
          value={selected?.profile_id ?? ""}
          onChange={(event) => {
            if (event.target.value) void select(event.target.value);
          }}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-xs"
        >
          <option value="">Selecionar membro da lista</option>
          {members.map((member) => (
            <option key={member.profile_id} value={member.profile_id}>
              {member.profile_name || member.email || member.profile_id}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-emerald-400">
          {success}
        </p>
      )}
      {loadingDetail && (
        <p role="status" className="text-xs text-[var(--muted)]">
          Carregando detalhe do membro...
        </p>
      )}
      {selected && (
        <p className="text-xs text-[var(--muted)]">
          {selected.profile_name} · {selected.email} · ID do perfil:{" "}
          {selected.profile_id}
        </p>
      )}
      {(creating || selected) && canEdit && (
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          {creating && (
            <>
              {(
                [
                  "name",
                  "email",
                  "phone",
                  "password",
                  "birth_date",
                  "photo",
                ] as const
              ).map((key) => (
                <label key={key} className="text-xs">
                  {
                    {
                      name: "Nome",
                      email: "Email",
                      phone: "Telefone",
                      password: "Senha inicial",
                      birth_date: "Nascimento",
                      photo: "URL da foto",
                    }[key]
                  }
                  <input
                    required={key !== "photo"}
                    type={
                      key === "password"
                        ? "password"
                        : key === "birth_date"
                          ? "date"
                          : key === "email"
                            ? "email"
                            : "text"
                    }
                    value={form[key]}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent p-2"
                  />
                </label>
              ))}
            </>
          )}
          <fieldset className="sm:col-span-2">
            <legend className="mb-1 text-xs">Funções</legend>
            <div className="flex flex-wrap gap-3">
              {allRoles
                .filter((role) => admin || role !== "administrador")
                .map((role) => (
                  <label key={role} className="text-xs">
                    <input
                      type="checkbox"
                      checked={roles.includes(role)}
                      onChange={(event) =>
                        setRoles((current) =>
                          event.target.checked
                            ? [...current, role]
                            : current.filter((item) => item !== role),
                        )
                      }
                    />{" "}
                    {role}
                  </label>
                ))}
            </div>
          </fieldset>
          {!creating && (
            <label className="text-xs">
              Status
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as MembershipStatus)
                }
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2"
              >
                <option value="ativo">Ativo</option>
                <option value="convidado">Convidado</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>
          )}
          <button
            disabled={busy || roles.length === 0}
            className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-black disabled:opacity-50 sm:col-span-2"
          >
            {busy
              ? "Salvando..."
              : creating
                ? "Criar membro"
                : "Salvar vínculo"}
          </button>
        </form>
      )}
      {selected && !canEdit && (
        <p className="text-xs text-[var(--muted)]">
          Somente administrador pode alterar outro administrador.
        </p>
      )}
    </section>
  );
}
