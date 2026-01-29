import { Ticket } from "@/types/Ticket";

export function parseOTRSPriorityToTicket(priority: string): Ticket["priority"] {
  switch (priority.toLowerCase()) {
    case "3 normal":
      return "Baixa";
    case "5 muito alto":
      return "Incidente";
    default:
      return "Baixa";
  }
}