import Link from "next/link";
import { DocActionCard } from "@/components/DocActionCard";

export default function DocumentationPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Documentação do Ticket Flow</h1>
        <p className="text-muted-foreground">
          Esta documentação apresenta as funcionalidades do Ticket Flow e
          direciona para o passo a passo detalhado de cada ação disponível na
          ferramenta.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          O que você pode fazer no Ticket Flow
        </h2>

        <div className="grid gap-4">
          <DocActionCard
            title="Reordenar tickets"
            description="Aprenda a reorganizar seus tickets para priorizar atendimentos."
            href="/docs/reorder"
          />

          <DocActionCard
            title="Sincronizar tickets com o OTRS"
            description="Veja como integrar o OTRS ao Ticket Flow usando a extensão."
            href="/docs/sync-otrs"
          />
        </div>
      </section>
    </div>
  );
}
