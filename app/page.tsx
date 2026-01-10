"use client";

import { useState } from "react";
import { TicketTable } from "@/components/TicketTable";
import { Ticket } from "@/types/Ticket";
import { STORAGE_KEYS } from "@/constants/storageKeys";

const defaultTickets: Ticket[] = [
  {
    id: 1,
    priority: "Alta",
    title: "Usuário não consegue logar",
    age: 90,
    owner: "Fabio",
    status: "Pendente",
  },
  {
    id: 2,
    priority: "Incidente",
    title: "Servidor fora",
    age: 1440,
    owner: "Infra",
    status: "Em atendimento",
  },
];

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    if (typeof window === "undefined") {
      return defaultTickets;
    }

    const stored = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return stored ? (JSON.parse(stored) as Ticket[]) : defaultTickets;
  });

  // 💾 Save
  function handleTicketsChange(updated: Ticket[]) {
    setTickets(updated);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));
  }

  return (
    <main className="container py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Painel de Chamados</h1>

      <TicketTable data={tickets} onChange={handleTicketsChange} />
    </main>
  );
}
