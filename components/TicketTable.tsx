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
import { useCallback, useState } from "react";

type TicketTableProps = {
  data: Ticket[];
  onChange?: (tickets: Ticket[]) => void;
  disableDrag?: boolean;
};

type DraggableRowProps = {
  row: Row<Ticket>;
  data: Ticket[];
  onUpdateTicket?: (ticket: Ticket) => void;
  disableDrag?: boolean;
};

function DraggableRow({
  row,
  data,
  onUpdateTicket,
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
    />
  );
}

export function TicketTable({
  data,
  onChange,
  disableDrag = false,
}: TicketTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
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

    const oldIndex = data.findIndex((ticket) => ticket.id === active.id);
    const newIndex = data.findIndex((ticket) => ticket.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    onChange?.(reorder(data, oldIndex, newIndex));
  }

  const handleUpdateTicket = useCallback(
    (updated: Ticket) => {
      onChange?.(data.map((t) => (t.id === updated.id ? updated : t)));
    },
    [data, onChange]
  );

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
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <DraggableRow
                    key={row.original.id}
                    row={row}
                    data={data}
                    onUpdateTicket={handleUpdateTicket}
                    disableDrag={disableDrag}
                  />
                ))}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
