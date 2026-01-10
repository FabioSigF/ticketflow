'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Row,
} from '@tanstack/react-table'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { CSS } from '@dnd-kit/utilities'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { DragHandle } from './DragHandle'

import { Ticket } from '@/types/Ticket'
import { TicketColumns } from './TicketColumns'
import { reorder } from '@/utils/reorder'
import { TicketRow } from './TicketRow'

type TicketTableProps = {
  data: Ticket[]
  onChange?: (tickets: Ticket[]) => void
}

type DraggableRowProps = {
  row: Row<Ticket>
}


function DraggableRow({ row }: DraggableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: row.original.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TicketRow
      ref={setNodeRef}
      ticket={row.original}
      style={style}
      dragHandle={
        <DragHandle
          attributes={attributes}
          listeners={listeners}
        />
      }
    />
  )
}


export function TicketTable({ data, onChange }: TicketTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const table = useReactTable<Ticket>({
    data,
    columns: TicketColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = data.findIndex(
      ticket => ticket.id === active.id
    )
    const newIndex = data.findIndex(
      ticket => ticket.id === over.id
    )

    if (oldIndex === -1 || newIndex === -1) return

    const reorderedTickets = reorder(data, oldIndex, newIndex)
    onChange?.(reorderedTickets)
  }

  return (
    <div className="rounded-lg border bg-background shadow-sm">
      <div className="overflow-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={data.map(ticket => ticket.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id}>
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
                {table.getRowModel().rows.map(row => (
                  <DraggableRow key={row.id} row={row} />
                ))}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
