import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezonePlugin from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezonePlugin);

export function entityWallTimeToIso(
  date: string,
  time: string,
  zone: string,
): string | null {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)
  )
    return null;
  try {
    const value = dayjs.tz(`${date} ${time}`, "YYYY-MM-DD HH:mm", zone);
    if (
      !value.isValid() ||
      value.format("YYYY-MM-DD HH:mm") !== `${date} ${time}`
    )
      return null;
    return value.toISOString();
  } catch {
    return null;
  }
}

export function isoToEntityFields(
  iso: string,
  zone: string,
): { date: string; time: string } {
  const value = dayjs.utc(iso).tz(zone);
  return { date: value.format("YYYY-MM-DD"), time: value.format("HH:mm") };
}

export function formatEntityBlock(iso: string, zone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: zone,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function entityDayRange(
  date: string,
  zone: string,
): { from: string; to: string } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const next = dayjs
    .utc(`${date}T00:00:00Z`)
    .add(1, "day")
    .format("YYYY-MM-DD");
  try {
    // A mudança de DST pode tornar 00:00 inexistente. dayjs.tz avança até
    // o primeiro horário válido, ainda no mesmo dia local.
    const start = dayjs.tz(`${date} 00:00`, "YYYY-MM-DD HH:mm", zone);
    const end = dayjs.tz(`${next} 00:00`, "YYYY-MM-DD HH:mm", zone);
    if (
      !start.isValid() ||
      !end.isValid() ||
      start.format("YYYY-MM-DD") !== date ||
      end.format("YYYY-MM-DD") !== next
    )
      return null;
    return { from: start.toISOString(), to: end.toISOString() };
  } catch {
    return null;
  }
}
