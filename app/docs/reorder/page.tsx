import { DocSection } from "@/components/DocSection";

export default function ReorderDocumentationPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Reordenação de Tickets</h1>
        <p className="text-muted-foreground">
          Esta seção explica como funciona a reordenação de tickets no Ticket
          Flow e quais são as formas disponíveis para organizar seus chamados.
        </p>
      </header>

      <DocSection title="Objetivo da reordenação">
        <p>
          A reordenação permite que o analista organize visualmente seus tickets
          de acordo com prioridade, contexto ou andamento do atendimento,
          reduzindo a necessidade de controle mental.
        </p>
      </DocSection>

      <DocSection title="Ordenação inicial">
        <p>
          Ao carregar a aplicação, os tickets são exibidos na ordem em que foram
          criados ou sincronizados, respeitando o estado atual do atendimento.
        </p>
      </DocSection>

      <DocSection title="Reordenando por arrastar e soltar">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Localize o ticket que deseja mover.</li>
          <li>Clique e segure sobre o ticket.</li>
          <li>Arraste para a posição desejada na lista.</li>
          <li>Solte o ticket para confirmar a nova ordem.</li>
        </ol>

        <p className="text-muted-foreground mt-4">
          Imagens ilustrativas demonstram o processo nesta seção.
        </p>
      </DocSection>

      <DocSection title="Reordenação por colunas ou critérios">
        <p>
          Dependendo da visualização ativa, é possível reorganizar os tickets
          automaticamente com base em critérios como status ou prioridade.
        </p>
      </DocSection>

      <DocSection title="Persistência da ordem">
        <p>
          A ordem definida pelo analista é salva localmente no navegador,
          garantindo que a organização seja mantida mesmo após recarregar a
          página.
        </p>
      </DocSection>
    </div>
  );
}
