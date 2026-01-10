import { forwardRef } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ticket } from "@/types/Ticket";
import { formatAge } from "@/utils/formatAge";

type TicketRowProps = {
  ticket: Ticket;
  style?: React.CSSProperties;
  dragHandle?: React.ReactNode;
  onUpdate: (updated: Ticket) => void;
};

const criticidadeColorMap = {
  Baixa: "bg-slate-100 text-slate-700",
  Média: "bg-yellow-100 text-yellow-800",
  Alta: "bg-orange-100 text-orange-800",
  Incidente: "bg-red-100 text-red-800",
} as const;

const statusColorMap = {
  Pendente: "text-status-open",
  "Em atendimento": "text-status-progress",
  "Aguardando resposta": "text-status-progress",
  Finalizado: "text-status-closed",
} as const;

const PRIORITIES = ["Baixa", "Média", "Alta", "Incidente"] as const;
const STATUSES = [
  "Pendente",
  "Em atendimento",
  "Aguardando resposta",
  "Finalizado",
] as const;

export const TicketRow = forwardRef<HTMLTableRowElement, TicketRowProps>(
  ({ ticket, style, dragHandle, onUpdate }, ref) => {
    return (
      <TableRow ref={ref} style={style} className="hover:bg-slate-50">
        {/* Drag */}
        <TableCell className="w-8">{dragHandle}</TableCell>

        {/* Criticidade */}
        <TableCell>
          <Select
            value={ticket.priority}
            onValueChange={(value) => {
              if (PRIORITIES.includes(value as Ticket["priority"])) {
                onUpdate({
                  ...ticket,
                  priority: value as Ticket["priority"],
                });
              }
            }}
          >
            <SelectTrigger>
              <Badge className={criticidadeColorMap[ticket.priority]}>
                <SelectValue />
              </Badge>
            </SelectTrigger>
            <SelectContent>
              {["Baixa", "Média", "Alta", "Incidente"].map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>

        {/* Ticket ID */}
        <TableCell className="w-30 font-mono">
          <input
            type="text"
            value={ticket.ticketId}
            onChange={(e) =>
              onUpdate({
                ...ticket,
                ticketId: e.target.value,
              })
            }
            className="
            w-full outline-none border-none bg-transparent rounded-md px-2 py-1 focus:bg-muted/40 transition-colors duration-150"
          />
        </TableCell>

        {/* Idade (read-only formatada) */}
        <TableCell>{formatAge(ticket.age)}</TableCell>

        {/* Título */}
        <TableCell>
          <Input
            value={ticket.title}
            onChange={(e) => onUpdate({ ...ticket, title: e.target.value })}
          />
        </TableCell>

        {/* Proprietário */}
        <TableCell className="hidden md:table-cell">
          <Input
            value={ticket.owner}
            onChange={(e) => onUpdate({ ...ticket, owner: e.target.value })}
          />
        </TableCell>

        {/* Status */}
        <TableCell className={statusColorMap[ticket.status]}>
          <Select
            value={ticket.status}
            onValueChange={(value) => {
              if (STATUSES.includes(value as Ticket["status"])) {
                onUpdate({
                  ...ticket,
                  status: value as Ticket["status"],
                });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "Pendente",
                "Em atendimento",
                "Aguardando resposta",
                "Finalizado",
              ].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>

        {/* Nota */}
        <TableCell className="hidden lg:table-cell">
          <Input
            placeholder="Adicionar nota…"
            value={ticket.note ?? ""}
            onChange={(e) => onUpdate({ ...ticket, note: e.target.value })}
          />
        </TableCell>
      </TableRow>
    );
  }
);

TicketRow.displayName = "TicketRow";
