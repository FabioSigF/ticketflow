import { forwardRef, useEffect, useRef, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Ticket } from "@/types/Ticket";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { useDebouncedEffect } from "@/hooks/useDebouncedEffect";
import { isDoneStatus } from "@/utils/ticketStatus";

type TicketRowProps = {
  ticket: Ticket;
  style?: React.CSSProperties;
  dragHandle?: React.ReactNode;
  onUpdate: (updated: Ticket) => void;
  onDelete?: (id: number) => void;
  disableDrag?: boolean;
};

const criticidadeColorMap = {
  Baixa: "bg-slate-100 text-slate-700",
  Média: "bg-yellow-100 text-yellow-800",
  Alta: "bg-orange-100 text-orange-800",
  Incidente: "bg-red-100 text-red-800",
} as const;

const statusBadgeColorMap = {
  Pendente: "bg-blue-100 text-blue-800",
  "Em atendimento": "bg-amber-100 text-amber-800",
  "Aguardando resposta": "bg-teal-100 text-teal-800",
  Encerrado: "bg-green-100 text-green-800",
  Movido: "bg-purple-100 text-purple-800",
  Desbloqueado: "bg-slate-100 text-slate-700",
} as const;

const PRIORITIES = ["Baixa", "Média", "Alta", "Incidente"] as const;
const STATUSES = [
  "Pendente",
  "Em atendimento",
  "Aguardando resposta",
  "Encerrado",
  "Movido",
  "Desbloqueado",
] as const;

export const TicketRow = forwardRef<HTMLTableRowElement, TicketRowProps>(
  ({ ticket, style, dragHandle, onUpdate, disableDrag, onDelete }, ref) => {
    const cellDivider = "border-r border-border last:border-r-0";

    const [localTicket, setLocalTicket] = useState(ticket);

    useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalTicket(ticket);
    }, [
      ticket,
      ticket.age,
      ticket.priority,
      ticket.status,
      ticket.title,
      ticket.owner,
      ticket.note,
    ]);

    const lastSent = useRef<Ticket>(localTicket);

    useDebouncedEffect(
      () => {
        if (JSON.stringify(lastSent.current) !== JSON.stringify(localTicket)) {
          onUpdate(localTicket);
          lastSent.current = localTicket;
        }
      },
      [localTicket],
      300,
    );

    return (
      <TableRow ref={ref} style={style} className="hover:bg-slate-50">
        {disableDrag ? (
          <TableCell className={`w-8 shrink-0 ${cellDivider}`} />
        ) : (
          <TableCell className={`w-8 shrink-0 ${cellDivider}`}>
            {dragHandle}
          </TableCell>
        )}
        {/* Criticidade */}
        <TableCell className={`w-28 shrink-0 ${cellDivider}`}>
          <Select
            value={localTicket.priority}
            onValueChange={(value) => {
              if (PRIORITIES.includes(value as Ticket["priority"])) {
                setLocalTicket({
                  ...localTicket,
                  priority: value as Ticket["priority"],
                });
                onUpdate({
                  ...localTicket,
                  priority: value as Ticket["priority"],
                });
              }
            }}
          >
            <SelectTrigger>
              <Badge
                className={`${criticidadeColorMap[localTicket.priority]} w-20`}
              >
                <SelectValue />
              </Badge>
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>

        {/* Ticket ID */}
        <TableCell className={`w-32 shrink-0 ${cellDivider}`}>
          <Input
            value={localTicket.ticketId}
            onChange={(e) =>
              setLocalTicket({ ...localTicket, ticketId: e.target.value })
            }
            onBlur={() => onUpdate(localTicket)}
          />
        </TableCell>

        {/* Idade */}
        <TableCell className={`w-24 shrink-0 ${cellDivider}`}>
          {localTicket.age}
        </TableCell>

        {/* Título */}
        <TableCell className={`lg:table-cell w-72 shrink-0 ${cellDivider}`}>
          <Input
            value={localTicket.title}
            onChange={(e) =>
              setLocalTicket({ ...localTicket, title: e.target.value })
            }
            onBlur={() => onUpdate(localTicket)}
          />
        </TableCell>

        {/* Proprietário */}
        <TableCell className={`md:table-cell w-52 shrink-0 ${cellDivider}`}>
          <Input
            value={localTicket.owner}
            onChange={(e) =>
              setLocalTicket({ ...localTicket, owner: e.target.value })
            }
            onBlur={() => onUpdate(localTicket)}
          />
        </TableCell>

        {/* Status */}
        <TableCell className={`w-36 shrink-0 ${cellDivider}`}>
          <Select
            value={localTicket.status}
            onValueChange={(value) => {
              if (!STATUSES.includes(value as Ticket["status"])) return;

              const wasDone = isDoneStatus(localTicket.status);
              const isDone = isDoneStatus(value as Ticket["status"]);

              const updated: Ticket = {
                ...localTicket,
                status: value as Ticket["status"],
                ...(isDone && !wasDone ? { closedAt: Date.now() } : {}),
                ...(!isDone && wasDone ? { closedAt: undefined } : {}),
              };

              setLocalTicket(updated);
              onUpdate(updated);
            }}
          >
            <SelectTrigger>
              <Badge
                className={`${
                  statusBadgeColorMap[localTicket.status]
                } w-32 justify-center`}
              >
                <SelectValue />
              </Badge>
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>

        {/* Nota — COLUNA PRIORITÁRIA */}
        <TableCell
          className={`xl:table-cell flex-1 min-w-[300px] ${cellDivider}`}
        >
          <Textarea
            placeholder="Adicionar nota…"
            value={localTicket.note ?? ""}
            onChange={(e) =>
              setLocalTicket({ ...localTicket, note: e.target.value })
            }
            onBlur={() => onUpdate(localTicket)}
            className="
              w-full
              min-h-[44px]
              leading-relaxed
            "
            rows={2}
          />
        </TableCell>

        <TableCell className={`text-center w-14 shrink-0`}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(ticket.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </TableCell>
      </TableRow>
    );
  },
);

TicketRow.displayName = "TicketRow";
