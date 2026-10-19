import type { HourPeriod } from "@/types/availability";

export const weekdays = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

function minuteOfDay(value: string, allowEnd: boolean): number | null {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    return allowEnd && value === "24:00" ? 1440 : null;
  }
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function validatePeriods(
  periods: HourPeriod[],
  businessHours?: HourPeriod[],
): string | null {
  for (const [index, period] of periods.entries()) {
    const start = minuteOfDay(period.start_time, false);
    const end = minuteOfDay(period.end_time, true);
    if (
      !Number.isInteger(period.weekday) ||
      period.weekday < 0 ||
      period.weekday > 6
    )
      return `Período ${index + 1}: dia da semana inválido.`;
    if (start === null || end === null)
      return `${weekdays[period.weekday]}: use HH:mm; 24:00 só pode ser o fim.`;
    if (start >= end)
      return `${weekdays[period.weekday]}: o início deve ser anterior ao fim. Divida o horário entre dois dias.`;
    if (
      periods.some((other, otherIndex) => {
        if (index === otherIndex || other.weekday !== period.weekday)
          return false;
        const otherStart = minuteOfDay(other.start_time, false);
        const otherEnd = minuteOfDay(other.end_time, true);
        return (
          otherStart !== null &&
          otherEnd !== null &&
          start < otherEnd &&
          otherStart < end
        );
      })
    )
      return `${weekdays[period.weekday]}: há períodos sobrepostos.`;
    if (
      businessHours &&
      !businessHours.some((business) => {
        const businessStart = minuteOfDay(business.start_time, false);
        const businessEnd = minuteOfDay(business.end_time, true);
        return (
          business.weekday === period.weekday &&
          businessStart !== null &&
          businessEnd !== null &&
          start >= businessStart &&
          end <= businessEnd
        );
      })
    )
      return `${weekdays[period.weekday]}: a jornada deve ficar dentro de um período do expediente.`;
  }
  return null;
}
