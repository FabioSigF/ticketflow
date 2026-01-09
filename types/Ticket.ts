export type Ticket = {
  id: number
  priority: 'Baixa' | 'Média' | 'Alta' | 'Incidente'
  title: string
  age: number
  owner: string
  status: 'Pendente' | 'Em atendimento' | 'Aguardando resposta' | 'Finalizado'
  note?: string
}