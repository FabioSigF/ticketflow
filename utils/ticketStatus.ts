import { Ticket } from "@/types/Ticket";

export const DONE_STATUSES = [
  "Encerrado",
  "Movido",
  "Desbloqueado",
] as const;

export type DoneStatus = typeof DONE_STATUSES[number];

export function isDoneStatus(
  status: Ticket["status"]
): status is DoneStatus {
  return DONE_STATUSES.includes(status as DoneStatus);
}
