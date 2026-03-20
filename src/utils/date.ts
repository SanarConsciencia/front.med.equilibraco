import { format } from "date-fns";
import { es } from "date-fns/locale";

export const formatDateColombian = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd/MM/yyyy", { locale: es });
};

export const formatDateTimeColombian = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd/MM/yyyy HH:mm", { locale: es });
};

/** Returns today's date in Colombia as YYYY-MM-DD */
export const todayColombia = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(
    new Date(),
  );

/** Formats a YYYY-MM-DD string to a human-readable date in Spanish */
export const formatDayLabel = (dateStr: string): string => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return format(date, "EEEE d 'de' MMMM", { locale: es });
};

/** Advances a YYYY-MM-DD date by `days` (can be negative) */
export const shiftDate = (dateStr: string, days: number): string => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  return new Intl.DateTimeFormat("en-CA").format(date);
};
