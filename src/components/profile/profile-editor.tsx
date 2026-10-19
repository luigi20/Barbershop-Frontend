"use client";

import { FormEvent, useState } from "react";
import type { MeProfile } from "@/types/auth";

export function ProfileEditor({ profile }: { profile: MeProfile }) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [photo, setPhoto] = useState(profile.photo ?? "");
  const [birthDate, setBirthDate] = useState(
    profile.birth_date?.slice(0, 10) ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          photo_url: photo.trim() || null,
          birth_date: birthDate || null,
        }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { message?: string };
        throw new Error(body.message ?? "Não foi possível salvar o perfil.");
      }
      window.location.reload();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar o perfil.",
      );
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="mt-4 space-y-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5"
    >
      <h2 className="font-semibold">Editar perfil</h2>
      <p className="text-xs text-[var(--muted)]">
        Email: {profile.email ?? "Não informado"} (somente leitura)
      </p>
      <label className="block text-xs">
        Nome
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent p-2"
        />
      </label>
      <label className="block text-xs">
        Telefone
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent p-2"
        />
      </label>
      <label className="block text-xs">
        URL da foto
        <input
          value={photo}
          onChange={(event) => setPhoto(event.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent p-2"
        />
      </label>
      <label className="block text-xs">
        Nascimento
        <input
          type="date"
          value={birthDate}
          onChange={(event) => setBirthDate(event.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent p-2"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <button
        disabled={saving}
        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Salvar perfil"}
      </button>
    </form>
  );
}
