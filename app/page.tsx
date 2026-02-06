"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TicketTable } from "@/components/TicketTable";
import { Ticket } from "@/types/Ticket";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OTRSTicket } from "@/types/OTRSTicket";
import { parseOTRSPriorityToTicket } from "@/utils/parseOTRSPriorityToTicket";
import {
  IN_PROGRESS_STATUSES,
  DONE_STATUSES,
} from "@/constants/ticketStatuses";

type TicketTab = "progress" | "done";

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return stored ? (JSON.parse(stored) as Ticket[]) : [];
  });

  const [activeTab, setActiveTab] = useState<TicketTab>("progress");
  const [search, setSearch] = useState("");

  // Undo clear state
  const [clearedTickets, setClearedTickets] = useState<Ticket[] | null>(null);
  const [undoVisible, setUndoVisible] = useState(false);
  const [undoSeconds, setUndoSeconds] = useState<number | null>(null);

  const undoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ouvir mensagens do OTRS Ticket Sync
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "OTRS_TICKETS_SYNC") {
        const otrsTickets = event.data.payload;

        setTickets((prev) => {
          const prevMap = new Map<string, Ticket>();

          prev.forEach((ticket) => {
            const key = ticket.ticketId || `local-${ticket.id}`;
            prevMap.set(key, ticket);
          });

          const mapped = mapOtrsToTickets(otrsTickets, prev);

          mapped.forEach((incoming) => {
            const key = incoming.ticketId || `local-${incoming.id}`;
            const existing = prevMap.get(key);

            prevMap.set(key, {
              ...(existing ?? incoming),
              age: incoming.age,
              lastSync: Date.now(), // 🔥 força re-render
            });
          });

          const merged = Array.from(prevMap.values());
          return merged.sort((a, b) => a.orderIndex - b.orderIndex);
        });

        console.log("OTRS tickets synced");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }, [tickets]);

  // Mapeia tickets do OTRS para o formato interno de Ticket
  function mapOtrsToTickets(
    otrsTickets: OTRSTicket[],
    currentTickets: Ticket[],
  ): Ticket[] {
    const ticketMap = new Map(
      currentTickets.filter((t) => t.ticketId).map((t) => [t.ticketId!, t]),
    );

    let nextId =
      currentTickets.length > 0
        ? Math.max(...currentTickets.map((t) => t.id)) + 1
        : 1;

    let nextOrder =
      currentTickets.length > 0
        ? Math.max(...currentTickets.map((t) => t.orderIndex)) + 1
        : 0;

    return otrsTickets.map((otrs) => {
      const existing = ticketMap.get(otrs.ticketId);

      if (existing) {
        return {
          ...existing,
          title: otrs.title,
          owner: otrs.owner,
          priority: parseOTRSPriorityToTicket(otrs.priority),
          age: otrs.age,
          lastSync: Date.now(),
        };
      }

      return {
        id: nextId++,
        ticketId: otrs.ticketId,
        title: otrs.title,
        owner: otrs.owner,
        priority: parseOTRSPriorityToTicket(otrs.priority),
        age: otrs.age,
        status: "Pendente",
        orderIndex: nextOrder++, // 🔥 NOVOS SEMPRE NO FINAL
        lastSync: Date.now(),
      };
    });
  }

  // Cria um ticket vazio
  function createEmptyTicket(id: number, orderIndex: number): Ticket {
    return {
      id,
      ticketId: "",
      priority: "Baixa",
      title: "",
      age: "0 min",
      owner: "",
      status: "Pendente",
      note: "",
      lastSync: Date.now(),
      orderIndex,
    };
  }

  // Persiste tickets no estado e no localStorage
  function persist(updated: Ticket[]) {
    setTickets(updated);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));
  }

  // Mescla um slice de tickets atualizados no estado
  const mergeTickets = useCallback((updater: (prev: Ticket[]) => Ticket[]) => {
    setTickets((prev) => {
      const updated = updater(prev).map((t) => ({ ...t }));
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Remove um ticket pelo ID
  function handleDeleteTicket(id: number) {
    setTickets((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));
      return updated;
    });
  }

  // Cria um novo ticket vazio
  function handleAddTicket() {
    const nextId =
      tickets.length > 0 ? Math.max(...tickets.map((t) => t.id)) + 1 : 1;

    const maxOrder =
      tickets.length > 0 ? Math.max(...tickets.map((t) => t.orderIndex)) : 0;

    persist([...tickets, createEmptyTicket(nextId, maxOrder + 1)]);
  }

  // ============ Funções relacionadas à limpeza de tabela ==================
  // Limpa todos os tickets da tabela
  function handleClearTable() {
    resetUndo();

    // Guarda TODOS os tickets atuais
    setClearedTickets(tickets);

    setUndoVisible(true);
    setUndoSeconds(30);

    setTickets([]);
    persist([]);

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
  // Restaura os tickets removidos na última limpeza
  function handleUndoClear() {
    if (!clearedTickets) return;

    setTickets((current) => {
      const restoredIds = new Set(clearedTickets.map((t) => t.id));

      // Mantém tickets criados depois da limpeza
      const newTickets = current.filter((t) => !restoredIds.has(t.id));

      const merged = [...clearedTickets, ...newTickets];
      persist(merged);
      return merged;
    });

    resetUndo();
  }
  // Reseta o estado do undo
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

  // ============ Funções relacionadas à troca de tabs (status) ==================
  function isInProgressStatus(
    status: Ticket["status"],
  ): status is (typeof IN_PROGRESS_STATUSES)[number] {
    return IN_PROGRESS_STATUSES.includes(
      status as (typeof IN_PROGRESS_STATUSES)[number],
    );
  }

  function isDoneStatus(
    status: Ticket["status"],
  ): status is (typeof DONE_STATUSES)[number] {
    return DONE_STATUSES.includes(status as (typeof DONE_STATUSES)[number]);
  }

  function handleTabChange(value: string) {
    if (value === "progress" || value === "done") {
      setActiveTab(value);
    }
  }

  // ============ Busca e filtragem de Tickets ==================
  const isSearching = search.trim().length > 0;

  const searchedTickets = tickets.filter((ticket) => {
    const q = search.toLowerCase();
    return (
      ticket.title?.toLowerCase().includes(q) ||
      ticket.owner?.toLowerCase().includes(q) ||
      ticket.priority?.toLowerCase().includes(q) ||
      ticket.ticketId?.toLowerCase().includes(q)
    );
  });

  const inProgressTickets = searchedTickets
    .filter((t) => isInProgressStatus(t.status))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const doneTickets = searchedTickets
    .filter((t) => isDoneStatus(t.status))
    .sort((a, b) => b.id - a.id);

  // ============ Reordenamento para TicketTable ==================
  function handleReorderInProgress(orderedIds: number[]) {
    setTickets((prev) => {
      const updated = prev.map((ticket) => {
        const index = orderedIds.indexOf(ticket.id);
        return index !== -1 ? { ...ticket, orderIndex: index } : ticket;
      });

      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));

      return updated;
    });
  }

  // ============ Auxiliares ==================
  // Componente para estado vazio de tickets
  function EmptyInProgressTicketsState() {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <p className="text-lg font-medium text-muted-foreground">
          Nenhum ticket encontrado
        </p>

        <p className="text-sm text-muted-foreground max-w-md">
          Você ainda não possui tickets. Você pode sincronizar seus chamados com
          o OTRS usando a extensão OTRS Ticket Sync ou criar um ticket
          manualmente.
        </p>

        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground">
            🔄 Sincronize pelo OTRS ou ➕ crie um ticket
          </span>
        </div>
      </div>
    );
  }

  function EmptyDoneTicketsState() {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <p className="text-lg font-medium text-muted-foreground">
          Nenhum ticket encontrado
        </p>

        <p className="text-sm text-muted-foreground max-w-md">
          Você ainda não possui tickets finalizados. Bora trabalhar nesses
          chamados em andamento!
        </p>
      </div>
    );
  }

  function EmptySearchState() {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
        <p className="text-lg font-medium text-muted-foreground">
          Nenhum resultado encontrado
        </p>

        <p className="text-sm text-muted-foreground max-w-md">
          Não encontramos tickets que correspondam à sua busca. Tente ajustar os
          termos ou limpar o filtro.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-semibold">Painel de Chamados</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seus tickets manualmente ou sincronize com o OTRS
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border-border border px-6 py-4">
        {/* Card Header */}
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
      </div>
      {/* Card Content */}
      <div>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="progress">
              Em andamento ({inProgressTickets.length})
            </TabsTrigger>
            <TabsTrigger value="done">
              Finalizados ({doneTickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="mt-4">
            {inProgressTickets.length === 0 ? (
              isSearching ? (
                <EmptySearchState />
              ) : (
                <EmptyInProgressTicketsState />
              )
            ) : (
              <TicketTable
                data={inProgressTickets}
                onChange={mergeTickets}
                disableDrag={isSearching}
                onReorder={handleReorderInProgress}
                onDeleteTicket={handleDeleteTicket}
              />
            )}
          </TabsContent>

          <TabsContent value="done" className="mt-4">
            {doneTickets.length === 0 ? (
              isSearching ? (
                <EmptySearchState />
              ) : (
                <EmptyDoneTicketsState />
              )
            ) : (
              <TicketTable
                data={doneTickets}
                onChange={mergeTickets}
                disableDrag
                onDeleteTicket={handleDeleteTicket}
                groupByClosedDate
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
