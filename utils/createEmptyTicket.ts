import { Ticket } from '@/types/Ticket'

export function createEmptyTicket(id: number): Ticket {
  return {
    id,
    ticketId: "",
    priority: 'Baixa',
    title: '',
    age: 0,
    owner: '',
    status: 'Pendente',
    note: '',
  }
}
