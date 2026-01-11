import { Column } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";

type Props<T> = {
  column: Column<T, unknown>;
  title: string;
};

export function SortableHeader<T>({ column, title }: Props<T>) {
  const sorted = column.getIsSorted();

  return (
    <button
      onClick={column.getToggleSortingHandler()}
      className="
        flex items-center gap-1
        text-sm font-medium
        text-muted-foreground
        hover:text-foreground
        transition-colors
      "
    >
      {title}

      {!sorted && <ChevronsUpDown className="h-4 w-4 opacity-50" />}
      {sorted === "asc" && <ArrowUp className="h-4 w-4" />}
      {sorted === "desc" && <ArrowDown className="h-4 w-4" />}
    </button>
  );
}