import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TicketRow } from "./TicketRow";
import { Ticket } from "@/types/Ticket";

type Props = {
  tickets: Ticket[];
};

export function TicketTable({ tickets }: Props) {
  return (
    <div className="rounded-lg border border-border bg-background-card shadow-card">
      {/* Wrapper para scroll horizontal */}
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Criticidade</TableHead>
              <TableHead>Ticket</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">
                Proprietário
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Nota</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <td colSpan={7} className="h-24 text-center text-text-muted">
                  Nenhum chamado encontrado
                </td>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TicketRow key={ticket.id} ticket={ticket} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
