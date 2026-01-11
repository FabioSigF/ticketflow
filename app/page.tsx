"use client";

import { useRef, useState } from "react";
import { TicketTable } from "@/components/TicketTable";
import { Ticket } from "@/types/Ticket";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { Button } from "@/components/ui/button";
import { createEmptyTicket } from "@/utils/createEmptyTicket";

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

  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clearedAtRef = useRef<number | null>(null);

  // Persistência
  function persist(updated: Ticket[]) {
    setTickets(updated);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));
  }

  // Novo ticket
  function handleAddTicket() {
    const nextId =
      tickets.length > 0 ? Math.max(...tickets.map((t) => t.id)) + 1 : 1;

    const newTicket = {
      ...createEmptyTicket(nextId),
      createdAt: Date.now(),
    };

    persist([...tickets, newTicket]);
  }

  // Limpar tabela
  function handleClearTable() {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
    }

    setClearedTickets(tickets);
    clearedAtRef.current = Date.now();

    const freshTicket = {
      ...createEmptyTicket(1),
      createdAt: Date.now(),
    };

    persist([freshTicket]);

    setUndoVisible(true);
    setUndoSeconds(30);

    // ⏱️ Contagem regressiva
    const interval = setInterval(() => {
      setUndoSeconds((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(interval);
          setUndoVisible(false);
          setClearedTickets(null);
          clearedAtRef.current = null;
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    clearTimeoutRef.current = setTimeout(() => {
      clearInterval(interval);
    }, 30_000);
  }

  // Reverter limpeza
  function handleUndoClear() {
    if (!clearedTickets || !clearedAtRef.current) return;

    const addedAfterClear = tickets.filter(
      (t) =>
        (t as Ticket).age && (t as Ticket).age > clearedAtRef.current!
    );

    const restored = [...clearedTickets, ...addedAfterClear];

    persist(restored);

    setClearedTickets(null);
    setUndoVisible(false);
    setUndoSeconds(null);
    clearedAtRef.current = null;

    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
    }
  }

  return (
    <main className="py-6 px-6 space-y-4">
      <h1 className="text-2xl font-semibold">Painel de Chamados</h1>

      {/* Painel de comandos */}
      <div className="flex items-center justify-between">
        <div>
          {undoVisible && undoSeconds !== null && (
            <Button variant="secondary" onClick={handleUndoClear}>
              Reverter limpeza ({undoSeconds}s)
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleClearTable}>
            Limpar tabela
          </Button>

          <Button onClick={handleAddTicket}>+ Novo ticket</Button>
        </div>
      </div>

      {/* Tabela */}
      <TicketTable data={tickets} onChange={persist} />
    </main>
  );
}
