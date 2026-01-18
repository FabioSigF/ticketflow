# TicketFlow - gerenciamento de Tickets para Analistas

**TicketFlow** é uma ferramenta web para gerenciamento de chamados para Analistas. Tem integração com o OTRS via extensão do Chrome, permitindo sincronizar tickets automaticamente para uma fila visual, organizada e priorizada.

A ferramenta foi criada com o objetivo de **aumentar a produtividade dos Analistas de Suporte do Service Desk da Callink** e outras equipes que tenham demanda similar.

## 🚀 Visão Geral

O projeto é composto por duas partes principais:

1. **Frontend Web (Next.js)** – Interface para gerenciar os tickets
2. **Extensão Chrome (OTRS Ticket Sync)** – Faz o scraping do OTRS e envia os dados para o frontend

Toda a persistência é feita no **localStorage do navegador**, sem backend ou banco de dados.


## 🧱 Arquitetura

```
OTRS (Web)
   ↓ (scraping via content-otrs.js)
Extensão Chrome
   ↓ (chrome.runtime messaging)
Frontend Next.js (TicketFlow)
   ↓
localStorage (persistência)
```


## 🛠️ Tecnologias

### Frontend

* Next.js 14 (App Router)
* React + TypeScript
* Tailwind CSS + shadcn/ui
* Drag and Drop (Sortable)
* localStorage

### Extensão Chrome

* Manifest V3
* JavaScript puro
* Content Scripts
* Background Service Worker
* Messaging API


## 🔌 Extensão Chrome – OTRS Ticket Sync

### Estrutura

```
otrs-scraper-extension/
├─ manifest.json
├─ background.js
├─ content-otrs.js
├─ content-frontend.js
├─ popup.html
├─ popup.js
└─ icons/
```

### Funcionamento

1. O usuário abre o OTRS já logado (Sistema exige login OAuth2 Microsoft) e vai até a página de tickets "Bloqueados"
2. Clica na extensão → **Sincronizar tickets**
3. `popup.js` envia mensagem com tipo "START_SCRAPING", que é recebida pelo `content-otrs.js`
4. `content-otrs.js` faz scraping de tickets e envia mensagem "SCRAPED_TICKETS_RESPONSE"
5. Os dados são enviados ao `background.js`, que envia nova mensagem "SCRAPED_TICKETS"
6. O `background.js` recebe a mensagem e envia os tickets para `content-frontend.js`, através da mensagem "OTRS_TICKETS_SYNC"
7. Os tickets são enviados para o TicketFlow, com o tipo "OTRS_TICKETS_SYNC"
8. O frontend recebe via `window.postMessage` e persiste

### Campos coletados

| Campo OTRS | Campo TicketFlow |
| ---------- | ---------------- |
| Prioridade   | priority         |
| Ticket#  | ticketId         |
| Idade        | age              |
| Remetente      | owner            |
| Titulo      | title            |

## 🌐 Frontend – TicketFlow

### Estrutura Principal

```
app/
 ├─ global.css
 ├─ layout.tsx
 ├─ page.tsx
components/
 ├─ DragHandle.tsx
 ├─ SortableHeader.tsx
 ├─ TicketColumns.tsx
 ├─ TicketRow.tsx
 ├─ TicketTable.tsx
 ├─ ui/
constants/
types/
utils/
```

### Funcionalidades

* Filas **Em andamento** e **Finalizados**
* Drag and drop para ordenação
* Busca por ticket, título, prioridade e responsável
* Criação manual de tickets
* **Sincronização com OTRS**
* Limpar tabela e desfazer ação
* Detecção de duplicados por `ticketId`
* Atualização de idade ao sincronizar


## 🔁 Regras de Sincronização

* Tickets são identificados pelo `ticketId`
* Se o ticket já existir → **atualiza a idade**
* Se não existir → **cria novo ticket em Em atendimento**
* Tickets são ordenados por idade automaticamente
* Tickets que foram finalizados não são alterados durante sincronização.

### Ordenação por idade

Formato recebido: `"3 d 10 h"`

Conversão:

```
3 d 10 h → 82 horas
```


## 📦 Persistência

Todos os dados são armazenados em:

```
localStorage[STORAGE_KEYS.TICKETS]
```

Para maior eficiência e proteção de informações, não há banco de dados ou qualquer persistência permanente.



## 🧪 Como Rodar Localmente

### Frontend

```bash
npm install
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Extensão Chrome

1. Abra `chrome://extensions`
2. Ative **Modo do desenvolvedor**
3. Clique em **Carregar sem compactação**
4. Selecione a pasta [`otrs-scraper-extension`](https://github.com/FabioSigF/otrs-scraper-extension)


## 🔐 Segurança

* Nenhuma credencial é armazenada
* O scraping ocorre somente no navegador do usuário, já autenticado
* Comunicação isolada por domínio


## 👨‍💻 Autor

Criado por **Fábio Signorini de Freitas**, Analista de Suporte de TI do Service Desk Callink.

* GitHub: [https://github.com/FabioSigF](https://github.com/FabioSigF)
* LinkedIn: [https://www.linkedin.com/in/fabio-signorini/](https://www.linkedin.com/in/fabio-signorini/)


## 📄 Licença

MIT License
