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

export function sortByAge(a: Ticket, b: Ticket) {
  return parseInt(a.age) - parseInt(b.age);
}
