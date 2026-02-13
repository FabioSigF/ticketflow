"use client";

import { useEffect, useState } from "react";
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
   TYPE GUARDS (SEM ANY)
========================================= */

function isDoneStatus(
  status: Ticket["status"],
): status is (typeof DONE_STATUSES)[number] {
  return DONE_STATUSES.includes(
    status as (typeof DONE_STATUSES)[number],
  );
}

function isInProgressStatus(
  status: Ticket["status"],
): status is (typeof IN_PROGRESS_STATUSES)[number] {
  return IN_PROGRESS_STATUSES.includes(
    status as (typeof IN_PROGRESS_STATUSES)[number],
  );
}

/* =========================================
   MERGE ÚNICO DE SINCRONIZAÇÃO
========================================= */

function mergeOtrsTickets(
  current: Ticket[],
  otrsTickets: OTRSTicket[],
  reopenIds: number[] = [],
): Ticket[] {
  const map = new Map<string, Ticket>();

  current.forEach((ticket) => {
    const key = ticket.ticketId || `local-${ticket.id}`;
    map.set(key, ticket);
  });

  let nextId =
    current.length > 0
      ? Math.max(...current.map((t) => t.id)) + 1
      : 1;

  let nextOrder =
    current.length > 0
      ? Math.max(...current.map((t) => t.orderIndex)) + 1
      : 0;

  otrsTickets.forEach((otrs) => {
    const existing = map.get(otrs.ticketId);

    if (!existing) {
      const newTicket: Ticket = {
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

      map.set(otrs.ticketId, newTicket);
      return;
    }

    const shouldReopen = reopenIds.includes(existing.id);

    const updated: Ticket = {
      ...existing,
      title: otrs.title,
      owner: otrs.owner,
      priority: parseOTRSPriorityToTicket(otrs.priority),
      age: otrs.age,
      status: shouldReopen ? "Pendente" : existing.status,
      orderIndex: shouldReopen ? nextOrder++ : existing.orderIndex,
      lastSync: Date.now(),
    };

    map.set(otrs.ticketId, updated);
  });

  return Array.from(map.values()).sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );
}

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return stored ? (JSON.parse(stored) as Ticket[]) : [];
  });

  const [activeTab, setActiveTab] =
    useState<TicketTab>("progress");

  const [search, setSearch] = useState("");

  const [reopenCandidates, setReopenCandidates] =
    useState<Ticket[]>([]);

  const [pendingOtrsSync, setPendingOtrsSync] =
    useState<OTRSTicket[] | null>(null);

  const [reopenDialogOpen, setReopenDialogOpen] =
    useState(false);

  /* =========================================
     OTRS SYNC LISTENER
  ========================================= */

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type !== "OTRS_TICKETS_SYNC") return;

      const otrsTickets: OTRSTicket[] =
        event.data.payload;

      setTickets((prev) => {
        const conflicts = prev.filter(
          (ticket) =>
            isDoneStatus(ticket.status) &&
            otrsTickets.some(
              (otrs) => otrs.ticketId === ticket.ticketId,
            ),
        );

        if (conflicts.length > 0) {
          setReopenCandidates(conflicts);
          setPendingOtrsSync(otrsTickets);
          setReopenDialogOpen(true);
          return prev;
        }

        return mergeOtrsTickets(prev, otrsTickets);
      });
    }

    window.addEventListener("message", handleMessage);

    return () =>
      window.removeEventListener("message", handleMessage);
  }, []);

  /* =========================================
     PERSISTÊNCIA CENTRALIZADA
  ========================================= */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.TICKETS,
      JSON.stringify(tickets),
    );
  }, [tickets]);

  function confirmReopen(ids: number[]) {
    if (!pendingOtrsSync) return;

    setTickets((prev) =>
      mergeOtrsTickets(prev, pendingOtrsSync, ids),
    );

    setPendingOtrsSync(null);
    setReopenCandidates([]);
    setReopenDialogOpen(false);
  }

  function handleDeleteTicket(id: number) {
    setTickets((prev) =>
      prev.filter((ticket) => ticket.id !== id),
    );
  }

  function handleReorderInProgress(orderedIds: number[]) {
    setTickets((prev) =>
      prev.map((ticket) => {
        const index = orderedIds.indexOf(ticket.id);
        return index !== -1
          ? { ...ticket, orderIndex: index }
          : ticket;
      }),
    );
  }

  /* =========================================
     BUSCA
  ========================================= */

  const isSearching = search.trim().length > 0;

  const searchedTickets = tickets.filter((ticket) => {
    const q = search.toLowerCase();

    return (
      ticket.title.toLowerCase().includes(q) ||
      ticket.owner.toLowerCase().includes(q) ||
      ticket.priority.toLowerCase().includes(q) ||
      ticket.ticketId.toLowerCase().includes(q)
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
        <h1 className="text-2xl font-semibold">
          Painel de Chamados
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seus tickets manualmente ou sincronize
          com o OTRS
        </p>
      </div>

      <div className="rounded-xl border-border border px-6 py-4">
        <Input
          className="max-w-sm"
          placeholder="Buscar por ticket, título, proprietário ou criticidade…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          setActiveTab(v as TicketTab)
        }
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
            disableDrag={isSearching}
            onReorder={handleReorderInProgress}
            onDeleteTicket={handleDeleteTicket}
          />
        </TabsContent>

        <TabsContent value="done" className="mt-4">
          <TicketTable
            data={doneTickets}
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
