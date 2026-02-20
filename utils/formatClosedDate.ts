export function formatClosedDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffDays =
    (startOfToday.getTime() - startOfDate.getTime()) / 86400000;

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });
}