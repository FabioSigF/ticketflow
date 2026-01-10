import { forwardRef } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatAge } from '@/utils/formatAge'
import { Ticket } from '@/types/Ticket'

type TicketRowProps = {
  ticket: Ticket
  style?: React.CSSProperties
  dragHandle?: React.ReactNode
}

const criticidadeColorMap = {
  Baixa: 'bg-slate-100 text-slate-700',
  Média: 'bg-yellow-100 text-yellow-800',
  Alta: 'bg-orange-100 text-orange-800',
  Incidente: 'bg-red-100 text-red-800',
} as const

const statusColorMap = {
  Pendente: 'text-status-open',
  'Em atendimento': 'text-status-progress',
  'Aguardando resposta': 'text-status-progress',
  Finalizado: 'text-status-closed',
} as const

export const TicketRow = forwardRef<HTMLTableRowElement, TicketRowProps>(
  ({ ticket, style, dragHandle }, ref) => {
    return (
      <TableRow
        ref={ref}
        style={style}
        className="hover:bg-slate-50 transition-colors"
      >
        {/* Drag */}
        <TableCell className="w-8">
          {dragHandle}
        </TableCell>

        {/* Criticidade */}
        <TableCell className="whitespace-nowrap">
          <Badge
            className={`${criticidadeColorMap[ticket.priority]} font-medium`}
          >
            {ticket.priority}
          </Badge>
        </TableCell>

        {/* Ticket */}
        <TableCell className="font-mono text-sm text-text-muted">
          #{ticket.id}
        </TableCell>

        {/* Idade */}
        <TableCell className="whitespace-nowrap text-text-secondary">
          {formatAge(ticket.age)}
        </TableCell>

        {/* Título */}
        <TableCell className="max-w-70 truncate font-medium">
          {ticket.title}
        </TableCell>

        {/* Proprietário */}
        <TableCell className="hidden md:table-cell text-text-secondary">
          {ticket.owner}
        </TableCell>

        {/* Estado */}
        <TableCell
          className={`whitespace-nowrap font-medium ${statusColorMap[ticket.status]}`}
        >
          {ticket.status}
        </TableCell>

        {/* Nota */}
        <TableCell className="hidden lg:table-cell max-w-55 truncate text-text-muted">
          {ticket.note || '—'}
        </TableCell>
      </TableRow>
    )
  }
)

TicketRow.displayName = 'TicketRow'
