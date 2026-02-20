export type Ticket = {
  id: number
  ticketId: string
  priority: 'Baixa' | 'Média' | 'Alta' | 'Incidente'
  title: string
  age: string
  owner: string
  status: 'Pendente' | 'Em atendimento' | 'Aguardando resposta' | 'Encerrado' | 'Movido' | 'Desbloqueado'
  note?: string
  lastSync?: number
  orderIndex: number;
  closedAt?: number;
}