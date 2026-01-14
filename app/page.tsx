"use client";

import { useEffect, useRef, useState } from "react";
import { TicketTable } from "@/components/TicketTable";
import { Ticket } from "@/types/Ticket";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { Button } from "@/components/ui/button";
import { createEmptyTicket } from "@/utils/createEmptyTicket";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OTRSTicket } from "@/types/OTRSTicket";
import { parseOTRSPriorityToTicket } from "@/utils/parseOTRSPriorityToTicket";

type TicketTab = "progress" | "done";

const IN_PROGRESS_STATUSES = [
  "Pendente",
  "Em atendimento",
  "Aguardando resposta",
] as const;

const DONE_STATUSES = ["Encerrado", "Movido", "Desbloqueado"] as const;

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    if (typeof window === "undefined") {
      return [createEmptyTicket(1)];
    }

    const stored = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return stored ? (JSON.parse(stored) as Ticket[]) : [createEmptyTicket(1)];
  });

  const [activeTab, setActiveTab] = useState<TicketTab>("progress");
  const [search, setSearch] = useState("");

  // Undo
  const [clearedTickets, setClearedTickets] = useState<Ticket[] | null>(null);
  const [undoVisible, setUndoVisible] = useState(false);
  const [undoSeconds, setUndoSeconds] = useState<number | null>(null);

  const undoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "OTRS_TICKETS_SYNC") {
        const otrsTickets = event.data.payload;

        setTickets((prev) => {
          const mapped = mapOtrsToTickets(otrsTickets, prev);

          // evita duplicar pelo ticketId
          const existingTicketIds = new Set(prev.map((t) => t.ticketId));

          const filtered = mapped.filter(
            (t) => !existingTicketIds.has(t.ticketId)
          );

          const merged = [...filtered, ...prev];

          localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(merged));

          return merged;
        });

        console.log("OTRS tickets persisted in progress queue");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function mapOtrsToTickets(
    otrsTickets: OTRSTicket[],
    currentTickets: Ticket[]
  ): Ticket[] {
    const lastId =
      currentTickets.length > 0
        ? Math.max(...currentTickets.map((t) => t.id))
        : 0;

    let nextId = lastId + 1;

    return otrsTickets.map((otrs) => ({
      id: nextId++,
      ticketId: otrs.ticketId,
      title: otrs.title,
      owner: otrs.owner,
      priority: parseOTRSPriorityToTicket(otrs.priority),
      age: otrs.age,
      status: "Em atendimento",
    }));
  }

  function persist(updated: Ticket[]) {
    setTickets(updated);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));
  }

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
  }

  function isInProgressStatus(
    status: Ticket["status"]
  ): status is (typeof IN_PROGRESS_STATUSES)[number] {
    return IN_PROGRESS_STATUSES.includes(
      status as (typeof IN_PROGRESS_STATUSES)[number]
    );
  }

  function isDoneStatus(
    status: Ticket["status"]
  ): status is (typeof DONE_STATUSES)[number] {
    return DONE_STATUSES.includes(status as (typeof DONE_STATUSES)[number]);
  }

  function handleAddTicket() {
    const nextId =
      tickets.length > 0 ? Math.max(...tickets.map((t) => t.id)) + 1 : 1;

    persist([
      ...tickets,
      {
        ...createEmptyTicket(nextId),
        age: "0 min",
      },
    ]);
  }

  function handleClearTable() {
    resetUndo();

    // Guarda TODOS os tickets atuais
    setClearedTickets(tickets);

    // Limpa tudo e deixa apenas uma linha vazia
    persist([
      {
        ...createEmptyTicket(1),
        age: "0 min",
      },
    ]);

    setUndoVisible(true);
    setUndoSeconds(30);

    undoIntervalRef.current = setInterval(() => {
      setUndoSeconds((prev) => {
        if (!prev || prev <= 1) {
          resetUndo();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    undoTimeoutRef.current = setTimeout(resetUndo, 30_000);
  }

  function handleUndoClear() {
    if (!clearedTickets) return;

    setTickets((current) => {
      const restoredIds = new Set(clearedTickets.map((t) => t.id));

      // Mantém tickets criados depois da limpeza
      const newTickets = current.filter((t) => !restoredIds.has(t.id));

      const merged = [...clearedTickets, ...newTickets];
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(merged));
      return merged;
    });

    resetUndo();
  }

  const searchedTickets = tickets.filter((ticket) => {
    const q = search.toLowerCase();
    return (
      ticket.title?.toLowerCase().includes(q) ||
      ticket.owner?.toLowerCase().includes(q) ||
      ticket.priority?.toLowerCase().includes(q) ||
      ticket.ticketId?.toLowerCase().includes(q)
    );
  });

  const inProgressTickets = searchedTickets.filter((t) =>
    isInProgressStatus(t.status)
  );

  const doneTickets = searchedTickets
    .filter((t) => isDoneStatus(t.status))
    .sort((a, b) => b.id - a.id);

  function handleTabChange(value: string) {
    if (value === "progress" || value === "done") {
      setActiveTab(value);
    }
  }

  function mergeTickets(updatedSlice: Ticket[]) {
    setTickets((prev) => {
      const map = new Map(prev.map((t) => [t.id, t]));

      updatedSlice.forEach((ticket) => {
        map.set(ticket.id, ticket);
      });

      const merged = Array.from(map.values());
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(merged));

      return merged;
    });
  }

  function handleReorderInProgress(orderedIds: number[]) {
    setTickets((prev) => {
      const inProgress = prev.filter((t) => isInProgressStatus(t.status));
      const others = prev.filter((t) => !isInProgressStatus(t.status));

      const ordered = orderedIds
        .map((id) => inProgress.find((t) => t.id === id))
        .filter(Boolean) as Ticket[];

      const updated = [...ordered, ...others];
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));
      return updated;
    });
  }

  function handleDeleteTicket(id: number) {
    setTickets((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <main className="py-6 px-6 space-y-4">
      <h1 className="text-2xl font-semibold">Painel de Chamados</h1>

      <div className="flex items-center justify-between gap-4">
        <Input
          className="max-w-sm"
          placeholder="Buscar por ticket, título, proprietário ou criticidade…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {activeTab === "progress" && (
          <div className="flex gap-2">
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
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="progress">
            Em andamento ({inProgressTickets.length})
          </TabsTrigger>
          <TabsTrigger value="done">
            Finalizados ({doneTickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <TicketTable
            data={inProgressTickets}
            onChange={mergeTickets}
            disableDrag={search.trim().length > 0}
            onReorder={handleReorderInProgress}
            onDeleteTicket={handleDeleteTicket}
          />
        </TabsContent>

        <TabsContent value="done">
          <TicketTable
            data={doneTickets}
            onChange={mergeTickets}
            disableDrag
            onDeleteTicket={handleDeleteTicket}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
