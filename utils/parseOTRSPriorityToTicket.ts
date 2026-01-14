import { Ticket } from "@/types/Ticket";

export function parseOTRSPriorityToTicket(priority: string): Ticket["priority"] {
  switch (priority.toLowerCase()) {
    case '3 Normal':
      return 'Baixa';
    case '2 High':
      return 'Média';
    case '1 Very High':
      return 'Alta';
    case '0 Critical':
      return 'Incidente';
    default:
      return 'Baixa';
  }
}