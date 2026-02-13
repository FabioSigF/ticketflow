"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useMemo, useState } from "react";
import { Ticket } from "@/types/Ticket";

type Props = {
  open: boolean;
  tickets: Ticket[];
  onConfirm: (ids: number[]) => void;
  onClose: () => void;
};

export function ReopenTicketsDialog({
  open,
  tickets,
  onConfirm,
  onClose,
}: Props) {
  // IDs padrão derivados das props
  const defaultSelected = useMemo(
    () => new Set<number>(tickets.map((t) => t.id)),
    [tickets]
  );

  const [selected, setSelected] = useState<Set<number>>(defaultSelected);

  // Sempre que abrir o modal, resetamos a seleção
  if (open && selected.size === 0 && tickets.length > 0) {
    setSelected(defaultSelected);
  }

  function toggle(id: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Esses chamados já foram finalizados
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="max-h-80 overflow-auto border rounded-md">
          {tickets.map((t) => (
            <label key={t.id} className="flex gap-2 items-center p-2 border-b">
              <Checkbox
                checked={selected.has(t.id)}
                onCheckedChange={(v) => toggle(t.id, Boolean(v))}
              />
              <span>
                #{t.ticketId} — {t.title}
              </span>
            </label>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Ignorar</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm([...selected])}>
            Trazer para atendimento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
