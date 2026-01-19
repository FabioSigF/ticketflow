"use client";

import Image from "next/image";
import Link from "next/link";

export default function OtrsTicketSyncPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Sincronização com OTRS</h1>
        <p className="text-muted-foreground">
          Siga o passo a passo abaixo para baixar a extensão, instalá-la no
          Chrome e sincronizar seus tickets do OTRS com o Ticket Flow.
        </p>
      </header>

      {/* Step 1 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Baixar a extensão</h2>
        <p>
          Faça o download do arquivo da extensão OTRS Ticket Sync clicando no
          botão abaixo.
        </p>
        <Link
          href="https://github.com/FabioSigF/otrs-scraper-extension/archive/refs/heads/main.zip"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Baixar extensão
        </Link>
      </section>

      {/* Step 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          2. Instalar a extensão no Chrome
        </h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            Acesse <strong>chrome://extensions</strong> no navegador.
          </li>
          <li>
            Ative o <strong>Modo do desenvolvedor</strong> no canto superior
            direito.
          </li>
          <li>
            Clique em <strong>Carregar sem compactação</strong>.
          </li>
          <li>Selecione a pasta descompactada da extensão.</li>
        </ol>
        <div className="flex gap-8">
          <Image
            src="/images/tutorial/step2.png"
            alt="Instalar extensão no Chrome"
            width={400}
            height={450}
            className="rounded-lg border"
          />
          <i className="text-gray-600">
            *Você pode abrir a página de extensões pelos{" "}
            <strong>
              três pontos no canto superior direito &gt; Extensões &gt;
              Gerenciar Extensões
            </strong>
          </i>
        </div>
        <div className="mt-8 flex flex-col gap-4">
          <i className="text-gray-600">
            Habilite <strong>Modo do desenvolvedor</strong> para conseguir
            carregar a extensão.
          </i>
          <Image
            src="/images/tutorial/step2.2.png"
            alt="Instalar extensão no Chrome"
            width={1000}
            height={450}
            className="rounded-lg border"
          />
        </div>
        <div className="mt-8 flex flex-col gap-4">
          <i className="text-gray-600">
            Selecione a pasta onde você baixou o arquivo nos passos anteriores.
          </i>
          <Image
            src="/images/tutorial/step2.3.png"
            alt="Instalar extensão no Chrome"
            width={1000}
            height={450}
            className="rounded-lg border"
          />
        </div>
        <p>Pronto, agora a extensão está instalada no seu navegador!</p>
      </section>

      {/* Step 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3. Acessar o OTRS</h2>
        <p>
          Entre normalmente no sistema OTRS e abra a fila de tickets Bloqueados.
        </p>
        <Image
          src="/images/tutorial/step3.png"
          alt="Página do OTRS"
          width={1000}
          height={450}
          className="rounded-lg border"
        />
      </section>

      {/* Step 4 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          4. Sincronizar com o Ticket Flow
        </h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            Clique no ícone da extensão <strong>OTRS Ticket Sync</strong> no
            Chrome.
          </li>
          <li>
            Clique em <strong>Sincronizar tickets</strong>.
          </li>
        </ol>
        <Image
          src="/images/tutorial/step4.png"
          alt="Sincronizar com Ticket Flow"
          width={400}
          height={450}
          className="rounded-lg border"
        />
        <Image
          src="/images/tutorial/step4.2.png"
          alt="Sincronizar com Ticket Flow"
          width={400}
          height={450}
          className="rounded-lg border"
        />
      </section>

      {/* Step 5 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">5. Conferir os tickets</h2>
        <p>
          Após a sincronização, seus tickets aparecerão automaticamente na fila{" "}
          <strong>Em andamento</strong> do Ticket Flow. Tickets duplicados serão
          atualizados automaticamente.
        </p>
        <p>Agora já está tudo pronto para você começar a usar o Ticket Flow!</p>
        <Image
          src="/images/tutorial/step5.png"
          alt="Tickets sincronizados no Ticket Flow"
          width={1000}
          height={450}
          className="rounded-lg border"
        />
      </section>

      <footer className="pt-8 border-t text-sm text-muted-foreground">
        Em caso de dúvidas, entre em contato com o administrador da ferramenta
        ou consulte a documentação técnica.
      </footer>
    </div>
  );
}
