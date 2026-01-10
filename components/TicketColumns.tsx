import { ColumnDef } from "@tanstack/react-table";
import { Ticket } from "@/types/Ticket";

export const TicketColumns: ColumnDef<Ticket>[] = [
  {
    id: "drag",
    header: "",
    size: 32,
  },
  { accessorKey: "priority", header: "Criticidade" },
  { accessorKey: "id", header: "Ticket" },
  { accessorKey: "age", header: "Idade" },
  { accessorKey: "title", header: "Título" },
  { accessorKey: "owner", header: "Responsável" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "note", header: "Nota" },
];
