import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TicketFlow",
  description:
    "TicketFlow - Your Ultimate Ticket Management Solution, by Fábio Signorini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className="bg-muted/40 text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background">
          <div className="mx-auto flex h-16 items-center justify-between px-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold">
                TF
              </div>
              <span className="text-lg font-semibold">Ticket Flow</span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition">
                Tickets
              </Link>
              <Link href="#" className="hover:text-foreground transition">
                OTRS Ticket Sync
              </Link>
              <Link href="#" className="hover:text-foreground transition">
                Documentação
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto px-6 py-6">{children}</main>

        <footer className="border-t bg-background">
          <div className="mx-auto flex flex-col items-center justify-between gap-2 px-6 py-4 text-sm text-muted-foreground md:flex-row">
            <span>
              © {new Date().getFullYear()} TicketFlow — Criado por{" "}
              <strong className="font-medium text-foreground">
                Fábio Signorini
              </strong>
            </span>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/FabioSigF"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/fabio-signorini/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
