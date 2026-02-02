"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  type Row,
} from "@tanstack/react-table";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DragHandle } from "./DragHandle";

import { Ticket } from "@/types/Ticket";
import { TicketColumns } from "./TicketColumns";
import { reorder } from "@/utils/reorder";
import { TicketRow } from "./TicketRow";
import React, { useCallback, useState } from "react";
import { formatClosedDate } from "@/utils/formatClosedDate";

type TicketTableProps = {
  data: Ticket[];
  onReorder?: (orderedIds: number[]) => void;
  onChange?: (updater: (prev: Ticket[]) => Ticket[]) => void;
  disableDrag?: boolean;
  onDeleteTicket?: (id: number) => void;
  groupByClosedDate?: boolean;
};

type DraggableRowProps = {
  row: Row<Ticket>;
  data: Ticket[];
  onUpdateTicket?: (ticket: Ticket) => void;
  onDeleteTicket?: (id: number) => void;
  disableDrag?: boolean;
};

const DraggableRow = React.memo(function DraggableRow({
  row,
  data,
  onUpdateTicket,
  onDeleteTicket,
  disableDrag,
}: DraggableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: row.original.id,
      disabled: disableDrag,
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleUpdate(updated: Ticket) {
    onUpdateTicket?.(updated);
  }

  return (
    <TicketRow
      ref={disableDrag ? undefined : setNodeRef}
      ticket={row.original}
      style={style}
      disableDrag={disableDrag}
      dragHandle={
        disableDrag ? null : (
          <DragHandle attributes={attributes} listeners={listeners} />
        )
      }
      onUpdate={handleUpdate}
      onDelete={onDeleteTicket}
    />
  );
});

export function TicketTable({
  data,
  onChange,
  disableDrag = false,
  onReorder,
  onDeleteTicket,
  groupByClosedDate = false,
}: TicketTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const table = useReactTable<Ticket>({
    data,
    columns: TicketColumns,
    getRowId: (originalRow) => originalRow.id.toString(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const orderedIds = reorder(
      data.map((t) => t.id),
      data.findIndex((t) => t.id === active.id),
      data.findIndex((t) => t.id === over.id),
    );

    onReorder?.(orderedIds);
  }

  const handleUpdateTicket = useCallback(
    (updated: Ticket) => {
      onChange?.((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      );
    },
    [onChange],
  );

  const groupedRows = React.useMemo(() => {
    const rows = table.getRowModel().rows;

    if (!groupByClosedDate) {
      return [{ label: null, rows }];
    }

    // 1️⃣ Ordena por closedAt (desc), sem data por último
    const sortedRows = [...rows].sort((a, b) => {
      const aDate = a.original.closedAt;
      const bDate = b.original.closedAt;

      if (aDate && bDate) return bDate - aDate; // mais recente primeiro
      if (aDate) return -1; // a tem data, b não
      if (bDate) return 1; // b tem data, a não
      return 0; // ambos sem data
    });

    // 2️⃣ Agrupa após ordenação
    const groups = new Map<string, Row<Ticket>[]>();

    sortedRows.forEach((row) => {
      const label = row.original.closedAt
        ? formatClosedDate(row.original.closedAt)
        : "Sem data";

      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(row);
    });

    return Array.from(groups.entries()).map(([label, rows]) => ({
      label,
      rows,
    }));
  }, [data, groupByClosedDate]);

  return (
    <div className="rounded-lg border bg-background shadow-sm">
      {/* Scroll container */}
      <div className="overflow-x-auto overscroll-x-contain">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={data.map((ticket) => ticket.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table className="min-w-[1400px]">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="
                          border-r border-border last:border-r-0
                          whitespace-nowrap
                          text-muted-foreground
                          font-medium
                        "
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {groupedRows.map((group) => (
                  <React.Fragment key={group.label ?? "default"}>
                    {group.label && (
                      <TableRow>
                        <td
                          colSpan={TicketColumns.length}
                          className="
              bg-muted/50
              text-xs
              font-semibold
              uppercase
              text-muted-foreground
              px-4
              py-2
            "
                        >
                          {group.label}
                        </td>
                      </TableRow>
                    )}

                    {group.rows.map((row) => (
                      <DraggableRow
                        key={row.original.id}
                        row={row}
                        data={data}
                        onUpdateTicket={handleUpdateTicket}
                        disableDrag={disableDrag}
                        onDeleteTicket={onDeleteTicket}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
