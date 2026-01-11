"use client";

import { useRef, useState } from "react";
import { TicketTable } from "@/components/TicketTable";
import { Ticket } from "@/types/Ticket";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { Button } from "@/components/ui/button";
import { createEmptyTicket } from "@/utils/createEmptyTicket";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    if (typeof window === "undefined") {
      return [createEmptyTicket(1)];
    }

    const stored = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return stored ? (JSON.parse(stored) as Ticket[]) : [createEmptyTicket(1)];
  });

  const [clearedTickets, setClearedTickets] = useState<Ticket[] | null>(null);
  const [undoVisible, setUndoVisible] = useState(false);
  const [undoSeconds, setUndoSeconds] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // 🔑 Refs separadas (SEM reaproveitar)
  const undoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clearedAtRef = useRef<number | null>(null);

  // Persistência
  function persist(updated: Ticket[]) {
    setTickets(updated);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));
  }

  // 🔄 Limpa qualquer estado/timer de undo ativo
  function resetUndo() {
    if (undoIntervalRef.current) {
      clearInterval(undoIntervalRef.current);
      undoIntervalRef.current = null;
    }

    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }

    setUndoVisible(false);
    setUndoSeconds(null);
    setClearedTickets(null);
    clearedAtRef.current = null;
  }

  // ➕ Novo ticket
  function handleAddTicket() {
    const nextId =
      tickets.length > 0 ? Math.max(...tickets.map((t) => t.id)) + 1 : 1;

    const newTicket = {
      ...createEmptyTicket(nextId),
      createdAt: Date.now(),
    };

    persist([...tickets, newTicket]);
  }

  // 🧹 Limpar tabela (com undo)
  function handleClearTable() {
    resetUndo(); // 🔑 evita bugs ao clicar novamente

    setClearedTickets(tickets);
    clearedAtRef.current = Date.now();

    const freshTicket = {
      ...createEmptyTicket(1),
      createdAt: Date.now(),
    };

    persist([freshTicket]);

    setUndoVisible(true);
    setUndoSeconds(30);

    // ⏳ Contagem regressiva
    undoIntervalRef.current = setInterval(() => {
      setUndoSeconds((prev) => {
        if (!prev || prev <= 1) {
          resetUndo();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    // ⌛ Expiração final
    undoTimeoutRef.current = setTimeout(() => {
      resetUndo();
    }, 30_000);
  }

  // ↩️ Reverter limpeza
  function handleUndoClear() {
    if (!clearedTickets) return;

    persist(clearedTickets);
    resetUndo(); // 🔑 cancela tudo corretamente
  }

  // 🔍 Busca
  const filteredTickets = tickets.filter((ticket) => {
    const query = search.toLowerCase();

    return (
      ticket.title?.toLowerCase().includes(query) ||
      ticket.owner?.toLowerCase().includes(query) ||
      ticket.priority?.toLowerCase().includes(query) ||
      ticket.ticketId?.toLowerCase().includes(query)
    );
  });

  return (
    <main className="py-6 px-6 space-y-4">
      <h1 className="text-2xl font-semibold">Painel de Chamados</h1>

      {/* Painel de comandos */}
      <div className="flex items-center gap-4 justify-between">
        <div className="w-full sm:max-w-sm">
          <Input
            placeholder="Buscar por ticket, título, proprietário ou criticidade…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 justify-end">
          {undoVisible && undoSeconds !== null ? (
            <Button variant="secondary" onClick={handleUndoClear}>
              Reverter limpeza ({undoSeconds}s)
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClearTable}>
              Limpar tabela
            </Button>
          )}

          <Button onClick={handleAddTicket}>+ Novo ticket</Button>
        </div>
      </div>

      {/* Tabela */}
      <TicketTable
        data={filteredTickets}
        onChange={persist}
        disableDrag={search.trim().length > 0}
      />
    </main>
  );
}
