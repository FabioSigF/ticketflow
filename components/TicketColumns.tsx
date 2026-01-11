import { ColumnDef } from "@tanstack/react-table";
import { Ticket } from "@/types/Ticket";
import { sortByPriority, sortByAge } from "@/utils/ticketSorting";
import { SortableHeader } from "./SortableHeader";

export const TicketColumns: ColumnDef<Ticket>[] = [
  {
    id: "drag",
    header: "",
    enableSorting: false,
    size: 32,
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <SortableHeader column={column} title="Criticidade" />
    ),
    sortingFn: (rowA, rowB) => sortByPriority(rowA.original, rowB.original),
  },
  {
    accessorKey: "ticketId",
    header: "Ticket",
    enableSorting: false,
  },
  {
    accessorKey: "age",
    header: ({ column }) => <SortableHeader column={column} title="Idade" />,
    sortingFn: (rowA, rowB) => sortByAge(rowA.original, rowB.original),
  },
  {
    accessorKey: "title",
    header: "Título",
    enableSorting: false,
  },
  {
    accessorKey: "owner",
    header: "Responsável",
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
  },
  {
    accessorKey: "note",
    header: "Nota",
    enableSorting: false,
  },
];
