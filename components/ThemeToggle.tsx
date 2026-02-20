"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  if (!resolvedTheme) return null;

  return (
    <button
      onClick={() =>
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }
      className="p-2 rounded-md border border-border hover:bg-muted transition"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
