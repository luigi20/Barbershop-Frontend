"use client";

import { useEffect, useState } from "react";

import { TimeBlocksManager } from "@/components/availability/time-blocks-manager";
import { TimezoneSettings } from "@/components/availability/timezone-settings";
import { WeeklyHoursEditor } from "@/components/availability/weekly-hours-editor";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  entityWallTimeToIso,
  isoToEntityFields,
} from "@/lib/availability-time";
import { availabilityClient } from "@/services/availability.client";
import { getMembers } from "@/services/members.client";
import type {
  BlockInput,
  HourPeriod,
  ProfessionalTimeBlock,
} from "@/types/availability";
import type { EntityMembershipListItem } from "@/types/entity-membership";

function message(cause: unknown): string {
  return cause instanceof Error
    ? cause.message
    : "Não foi possível carregar os dados.";
}

function nextDate(date: string): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

export function AvailabilityView() {
  const user = useCurrentUser();
  const admin =
    user.status === "success" && user.profile.roles.includes("administrador");
  const [timezone, setTimezone] = useState<string | null>(null);
  const [timezoneLoading, setTimezoneLoading] = useState(true);
  const [timezoneError, setTimezoneError] = useState<string | null>(null);
  const [businessHours, setBusinessHours] = useState<HourPeriod[] | null>(null);
  const [businessError, setBusinessError] = useState<string | null>(null);
  const [members, setMembers] = useState<EntityMembershipListItem[] | null>(
    null,
  );
  const [membersError, setMembersError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState("");
  const [professionalHours, setProfessionalHours] = useState<
    HourPeriod[] | null
  >(null);
  const [professionalError, setProfessionalError] = useState<string | null>(
    null,
  );
  const [blocks, setBlocks] = useState<ProfessionalTimeBlock[]>([]);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [blocksError, setBlocksError] = useState<string | null>(null);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [loadedBlockQuery, setLoadedBlockQuery] = useState("");

  useEffect(() => {
    if (!admin) return;
    const controller = new AbortController();
    availabilityClient
      .getTimezone(controller.signal)
      .then((value) => setTimezone(value.timezone))
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setTimezoneError(message(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted) setTimezoneLoading(false);
      });
    return () => controller.abort();
  }, [admin]);

  useEffect(() => {
    if (!admin || !timezone) return;
    const controller = new AbortController();
    availabilityClient
      .getBusinessHours(controller.signal)
      .then((value) => setBusinessHours(value.periods))
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setBusinessError(message(cause));
      });
    getMembers(controller.signal)
      .then((value) =>
        setMembers(
          value.filter(
            (member) =>
              member.status === "ativo" &&
              member.roles.includes("barbeiro") &&
              Boolean(member.profile_id),
          ),
        ),
      )
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setMembersError(message(cause));
      });
    return () => controller.abort();
  }, [admin, timezone]);

  useEffect(() => {
    if (!profileId) return;
    const controller = new AbortController();
    availabilityClient
      .getProfessionalHours(profileId, controller.signal)
      .then((value) => setProfessionalHours(value.periods))
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setProfessionalError(message(cause));
      });
    return () => controller.abort();
  }, [profileId]);

  const today = timezone
    ? isoToEntityFields(new Date().toISOString(), timezone).date
    : "";
  const defaultEnd = today ? new Date(`${today}T00:00:00Z`) : null;
  defaultEnd?.setUTCMonth(defaultEnd.getUTCMonth() + 3);
  const selectedFrom = rangeFrom || today;
  const selectedTo = rangeTo || defaultEnd?.toISOString().slice(0, 10) || "";

  const fromIso =
    timezone && selectedFrom
      ? entityWallTimeToIso(selectedFrom, "00:00", timezone)
      : null;
  const toIso =
    timezone && selectedTo
      ? entityWallTimeToIso(nextDate(selectedTo), "00:00", timezone)
      : null;
  const validRange = Boolean(fromIso && toIso && fromIso < toIso);
  const blockQuery = `${profileId}|${fromIso}|${toIso}`;

  useEffect(() => {
    if (!profileId || !fromIso || !toIso || fromIso >= toIso) return;
    const controller = new AbortController();
    availabilityClient
      .getBlocks(profileId, fromIso, toIso, controller.signal)
      .then((value) => {
        setBlocks(value);
        setBlocksError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setBlocksError(message(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted)
          setLoadedBlockQuery(`${profileId}|${fromIso}|${toIso}`);
      });
    return () => controller.abort();
  }, [profileId, fromIso, toIso]);

  async function reloadBlocks() {
    if (!profileId || !fromIso || !toIso) return;
    setBlocksLoading(true);
    setBlocksError(null);
    try {
      setBlocks(await availabilityClient.getBlocks(profileId, fromIso, toIso));
    } catch (cause) {
      setBlocksError(message(cause));
    } finally {
      setBlocksLoading(false);
    }
  }

  if (user.status === "loading")
    return <p role="status">Carregando permissões...</p>;
  if (!admin)
    return (
      <p role="status">
        Disponibilidade administrativa restrita a administradores.
      </p>
    );

  return (
    <main className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-semibold">Horários e disponibilidade</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Configure o expediente, a jornada da equipe e os bloqueios.
        </p>
      </div>
      {timezoneLoading && <p role="status">Carregando fuso horário...</p>}
      {timezoneError && (
        <p role="alert" className="text-[var(--danger)]">
          {timezoneError}
        </p>
      )}
      {!timezoneLoading && !timezoneError && (
        <TimezoneSettings
          timezone={timezone}
          onSave={async (value) => {
            const saved = await availabilityClient.setTimezone(value);
            setTimezone(saved.timezone);
          }}
        />
      )}
      {!timezoneLoading && !timezoneError && !timezone && (
        <p className="rounded-xl border border-[var(--border)] p-4 text-sm text-[var(--muted)]">
          Defina o fuso horário da barbearia antes de configurar os horários.
        </p>
      )}
      {timezone && (
        <>
          {businessError && (
            <p role="alert" className="text-[var(--danger)]">
              Expediente: {businessError}
            </p>
          )}
          {!businessHours && !businessError && (
            <p role="status">Carregando expediente...</p>
          )}
          {businessHours && (
            <WeeklyHoursEditor
              key={JSON.stringify(businessHours)}
              title="Expediente da barbearia"
              description="Adicione um ou mais períodos por dia. Salvar substitui o expediente completo."
              periods={businessHours}
              onSave={async (periods) => {
                await availabilityClient.setBusinessHours(periods);
                const current = await availabilityClient.getBusinessHours();
                setBusinessHours(current.periods);
              }}
            />
          )}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
            <h2 className="text-lg font-semibold">Profissional</h2>
            {membersError && (
              <p role="alert" className="mt-2 text-sm text-[var(--danger)]">
                {membersError}
              </p>
            )}
            {!members && !membersError && (
              <p role="status" className="mt-2 text-sm">
                Carregando equipe...
              </p>
            )}
            {members && members.length === 0 && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Nenhum barbeiro ativo disponível.
              </p>
            )}
            {members && members.length > 0 && (
              <label className="mt-4 block text-sm">
                Selecione um barbeiro
                <select
                  value={profileId}
                  onChange={(event) => {
                    setProfileId(event.target.value);
                    setProfessionalHours(null);
                    setProfessionalError(null);
                    setBlocks([]);
                    setLoadedBlockQuery("");
                  }}
                  className="mt-1 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] sm:max-w-md"
                >
                  <option value="">Selecione...</option>
                  {members.map((member) => (
                    <option key={member.profile_id} value={member.profile_id}>
                      {member.profile_name ?? member.email ?? member.profile_id}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </section>
          {profileId && (
            <>
              {professionalError && (
                <p role="alert" className="text-[var(--danger)]">
                  Jornada: {professionalError}
                </p>
              )}
              {!professionalHours && !professionalError && (
                <p role="status">Carregando jornada...</p>
              )}
              {professionalHours && businessHours && (
                <WeeklyHoursEditor
                  key={`${profileId}:${JSON.stringify(professionalHours)}`}
                  title="Jornada do profissional"
                  description="Os períodos devem ficar dentro do expediente da barbearia. Uma lista vazia limpa a jornada."
                  periods={professionalHours}
                  businessHours={businessHours}
                  onSave={async (periods) => {
                    await availabilityClient.setProfessionalHours(
                      profileId,
                      periods,
                    );
                    const current =
                      await availabilityClient.getProfessionalHours(profileId);
                    setProfessionalHours(current.periods);
                  }}
                />
              )}
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
                <h2 className="text-lg font-semibold">Período da consulta</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Datas no fuso {timezone}. O fim inclui o dia selecionado.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    De
                    <input
                      type="date"
                      value={selectedFrom}
                      onChange={(event) => setRangeFrom(event.target.value)}
                      className="mt-1 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3"
                    />
                  </label>
                  <label className="text-sm">
                    Até
                    <input
                      type="date"
                      value={selectedTo}
                      onChange={(event) => setRangeTo(event.target.value)}
                      className="mt-1 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3"
                    />
                  </label>
                </div>
                {!validRange && (
                  <p role="alert" className="mt-2 text-sm text-[var(--danger)]">
                    Selecione um intervalo válido.
                  </p>
                )}
              </section>
              {validRange && (
                <TimeBlocksManager
                  key={profileId}
                  timezone={timezone}
                  blocks={loadedBlockQuery === blockQuery ? blocks : []}
                  loading={blocksLoading || loadedBlockQuery !== blockQuery}
                  error={loadedBlockQuery === blockQuery ? blocksError : null}
                  onCreate={async (input: BlockInput) => {
                    await availabilityClient.createBlock(profileId, input);
                    await reloadBlocks();
                  }}
                  onUpdate={async (id: string, input: BlockInput) => {
                    await availabilityClient.updateBlock(profileId, id, input);
                    await reloadBlocks();
                  }}
                  onDelete={async (id: string) => {
                    await availabilityClient.deleteBlock(profileId, id);
                    setBlocks((current) =>
                      current.filter((block) => block.id !== id),
                    );
                  }}
                />
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
