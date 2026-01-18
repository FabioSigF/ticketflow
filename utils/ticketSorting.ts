import { Ticket } from "@/types/Ticket";

export const PRIORITY_ORDER: Record<Ticket["priority"], number> = {
  Incidente: 4,
  Alta: 3,
  Média: 2,
  Baixa: 1,
};

export function sortByPriority(a: Ticket, b: Ticket) {
  return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
}

export function parseAgeToMinutes(age?: string): number {
  if (!age) return 0;

  let minutes = 0;

  const dayMatch = age.match(/(\d+)\s*d/);
  const hourMatch = age.match(/(\d+)\s*h/);
  const minuteMatch = age.match(/(\d+)\s*m/);

  if (dayMatch) {
    minutes += parseInt(dayMatch[1], 10) * 24 * 60;
  }

  if (hourMatch) {
    minutes += parseInt(hourMatch[1], 10) * 60;
  }

  if (minuteMatch) {
    minutes += parseInt(minuteMatch[1], 10);
  }

  return minutes;
}

export function sortByAge(a: Ticket, b: Ticket) {
  return parseAgeToMinutes(b.age) - parseAgeToMinutes(a.age);
}
