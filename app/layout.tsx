import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin } from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "TicketFlow",
  description:
    "TicketFlow - Your Ultimate Ticket Management Solution, by Fábio Signorini",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className="min-h-screen flex flex-col bg-muted/40 text-foreground">
        <ThemeProvider>
          {/* Header */}
          <header className="sticky top-0 z-50 border-border border-b bg-background">
            <div className="mx-auto flex h-16 items-center justify-between px-6">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/images/otrs-synchronizer-logo.png"
                  alt="TicketFlow Logo"
                  width={32}
                  height={32}
                  priority
                />
                <span className="text-lg font-semibold">Ticket Flow</span>
              </Link>

              {/* Navigation */}
              <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <Link href="/" className="hover:text-foreground transition">
                  Tickets
                </Link>
                <Link
                  href="/otrs-ticket-sync"
                  className="hover:text-foreground transition"
                >
                  Como sincronizar com OTRS?
                </Link>
                <Link href="/docs" className="hover:text-foreground transition">
                  Documentação
                </Link>
                <Link
                  href="/updates"
                  className="hover:text-foreground transition"
                >
                  Atualizações
                </Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>

          <main className="flex-1 mx-auto w-full px-6 py-6 pb-12">{children}</main>

          <footer className="border-border border-t bg-background">
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
                  className="flex items-center gap-2 hover:text-foreground transition"
                >
                  <Github className="w-5 h-5" />
                  <span>GitHub</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/fabio-signorini/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-foreground transition"
                >
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
