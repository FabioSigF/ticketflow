import { Ticket } from "@/types/Ticket";

export function parseOTRSPriorityToTicket(priority: string): Ticket["priority"] {
  switch (priority.toLowerCase()) {
    case '3 Normal':
      return 'Baixa';
    case '5 Muito Alto':
      return 'Incidente';
    default:
      return 'Baixa';
  }
}