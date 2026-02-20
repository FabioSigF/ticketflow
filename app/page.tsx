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
import { ReopenTicketsDialog } from "@/components/ReopenTicketsDialog";

type TicketTab = "progress" | "done";

/* =========================================
   TYPE GUARDS
========================================= */

function isDoneStatus(
  status: Ticket["status"],
): status is (typeof DONE_STATUSES)[number] {
  return DONE_STATUSES.includes(status as (typeof DONE_STATUSES)[number]);
}

function isInProgressStatus(
  status: Ticket["status"],
): status is (typeof IN_PROGRESS_STATUSES)[number] {
  return IN_PROGRESS_STATUSES.includes(
    status as (typeof IN_PROGRESS_STATUSES)[number],
  );
}

/* =========================================
   MAP OTRS → TICKET
========================================= */

function mapOtrsToTickets(
  otrsTickets: OTRSTicket[],
  current: Ticket[],
): Ticket[] {
  const ticketMap = new Map(
    current.filter((t) => t.ticketId).map((t) => [t.ticketId!, t]),
  );

  let nextId =
    current.length > 0 ? Math.max(...current.map((t) => t.id)) + 1 : 1;

  let nextOrder =
    current.length > 0 ? Math.max(...current.map((t) => t.orderIndex)) + 1 : 0;

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
      note: "",
      orderIndex: nextOrder++,
      lastSync: Date.now(),
    };
  });
}

/* =========================================
   MERGE COM SUPORTE A REOPEN
========================================= */

function mergeOtrsTickets(
  current: Ticket[],
  mapped: Ticket[],
  reopenIds: number[] = [],
): Ticket[] {
  const map = new Map<string, Ticket>();

  current.forEach((ticket) => {
    const key = ticket.ticketId || `local-${ticket.id}`;
    map.set(key, ticket);
  });

  let nextOrder =
    current.length > 0 ? Math.max(...current.map((t) => t.orderIndex)) + 1 : 0;

  mapped.forEach((incoming) => {
    const existing = map.get(incoming.ticketId || "");

    if (!existing) {
      map.set(incoming.ticketId!, incoming);
      return;
    }

    const shouldReopen = reopenIds.includes(existing.id);

    map.set(incoming.ticketId!, {
      ...existing,
      ...incoming,
      status: shouldReopen ? "Pendente" : existing.status,
      orderIndex: shouldReopen ? nextOrder++ : existing.orderIndex,
      lastSync: Date.now(),
    });
  });

  return Array.from(map.values()).sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );
}

/* =========================================
   COMPONENT
========================================= */

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return stored ? (JSON.parse(stored) as Ticket[]) : [];
  });

  const [activeTab, setActiveTab] = useState<TicketTab>("progress");
  const [search, setSearch] = useState("");

  const [reopenCandidates, setReopenCandidates] = useState<Ticket[]>([]);
  const [pendingMapped, setPendingMapped] = useState<Ticket[] | null>(null);
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);

  // Undo state
  const [clearedTickets, setClearedTickets] = useState<Ticket[] | null>(null);
  const [undoVisible, setUndoVisible] = useState(false);
  const [undoSeconds, setUndoSeconds] = useState<number | null>(null);

  const undoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* =========================================
     OTRS SYNC
  ========================================= */

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type !== "OTRS_TICKETS_SYNC") return;

      const otrsTickets: OTRSTicket[] = event.data.payload;
      const mapped = mapOtrsToTickets(otrsTickets, tickets);

      setTickets((prev) => {
        const conflicts = mapped.filter((incoming) => {
          const existing = prev.find(
            (t) => t.ticketId === incoming.ticketId,
          );
          return existing && isDoneStatus(existing.status);
        });

        if (conflicts.length > 0) {
          setReopenCandidates(conflicts);
          setPendingMapped(mapped);
          setReopenDialogOpen(true);
          return prev;
        }

        return mergeOtrsTickets(prev, mapped);
      });
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [tickets]);

  /* =========================================
     PERSISTÊNCIA
  ========================================= */

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }, [tickets]);

  /* =========================================
     REOPEN CONFIRM
  ========================================= */

  function confirmReopen(ids: number[]) {
    if (!pendingMapped) return;

    setTickets((prev) => mergeOtrsTickets(prev, pendingMapped, ids));

    setPendingMapped(null);
    setReopenCandidates([]);
    setReopenDialogOpen(false);
  }

  /* =========================================
     CRUD
  ========================================= */

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

  function handleAddTicket() {
    const nextId =
      tickets.length > 0 ? Math.max(...tickets.map((t) => t.id)) + 1 : 1;

    const maxOrder =
      tickets.length > 0 ? Math.max(...tickets.map((t) => t.orderIndex)) : 0;

    setTickets([
      ...tickets,
      createEmptyTicket(nextId, maxOrder + 1),
    ]);
  }

  function handleDeleteTicket(id: number) {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  }

  const mergeTickets = useCallback(
    (updater: (prev: Ticket[]) => Ticket[]) => {
      setTickets((prev) => updater(prev).map((t) => ({ ...t })));
    },
    [],
  );

  function handleReorderInProgress(orderedIds: number[]) {
    setTickets((prev) =>
      prev.map((ticket) => {
        const index = orderedIds.indexOf(ticket.id);
        return index !== -1 ? { ...ticket, orderIndex: index } : ticket;
      }),
    );
  }

  /* =========================================
     CLEAR + UNDO
  ========================================= */

  function handleClearTable() {
    resetUndo();

    setClearedTickets(tickets);
    setUndoVisible(true);
    setUndoSeconds(30);
    setTickets([]);

    undoIntervalRef.current = setInterval(() => {
      setUndoSeconds((prev) => {
        if (!prev || prev <= 1) {
          resetUndo();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    undoTimeoutRef.current = setTimeout(resetUndo, 30000);
  }

  function handleUndoClear() {
    if (!clearedTickets) return;

    setTickets((current) => {
      const restoredIds = new Set(clearedTickets.map((t) => t.id));
      const newTickets = current.filter((t) => !restoredIds.has(t.id));
      return [...clearedTickets, ...newTickets];
    });

    resetUndo();
  }

  function resetUndo() {
    if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);

    undoIntervalRef.current = null;
    undoTimeoutRef.current = null;

    setUndoVisible(false);
    setUndoSeconds(null);
    setClearedTickets(null);
  }

  /* =========================================
     FILTERS
  ========================================= */

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

  /* =========================================
     UI
  ========================================= */

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Painel de Chamados</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seus tickets manualmente ou sincronize com o OTRS
        </p>
      </div>

      <div className="rounded-xl border-border border px-6 py-4">
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

              <Button onClick={handleAddTicket}>
                + Novo ticket
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TicketTab)}
      >
        <TabsList>
          <TabsTrigger value="progress">
            Em andamento ({inProgressTickets.length})
          </TabsTrigger>
          <TabsTrigger value="done">
            Finalizados ({doneTickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-4">
          <TicketTable
            data={inProgressTickets}
            onChange={mergeTickets}
            disableDrag={isSearching}
            onReorder={handleReorderInProgress}
            onDeleteTicket={handleDeleteTicket}
          />
        </TabsContent>

        <TabsContent value="done" className="mt-4">
          <TicketTable
            data={doneTickets}
            onChange={mergeTickets}
            disableDrag
            onDeleteTicket={handleDeleteTicket}
            groupByClosedDate
          />
        </TabsContent>
      </Tabs>

      <ReopenTicketsDialog
        open={reopenDialogOpen}
        tickets={reopenCandidates}
        onConfirm={confirmReopen}
        onClose={() => setReopenDialogOpen(false)}
      />
    </section>
  );
}
