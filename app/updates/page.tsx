import { UpdateItem } from "@/components/UpdateItem";

export default function UpdatesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Notas de Atualização</h1>
        <p className="text-muted-foreground">
          Aqui você encontra todas as atualizações, melhorias e correções
          realizadas no Ticket Flow.
        </p>
      </header>

      <UpdateItem
        version="Versão 1.1.0"
        date="02 de fevereiro de 2026"
        news={[
          "Sincronização automática de chamados com o OTRS via extensão",
          "Organização visual dos tickets em “Em andamento” e “Finalizados”",
          "Página dedicada com passo a passo para usar a integração com o OTRS",
        ]}
        fixes={[
          "Correção na duplicação de tickets sincronizados",
          "Ajuste na ordenação correta por idade do chamado",
        ]}
      />

      <UpdateItem
        version="Versão 1.0.0"
        date="28 de janeiro de 2026"
        news={[
          "Lançamento inicial do Ticket Flow",
          "Criação e edição manual de tickets",
          "Persistência dos dados no navegador",
        ]}
        fixes="Esta foi a versão inicial da aplicação."
      />
    </div>
  );
}
