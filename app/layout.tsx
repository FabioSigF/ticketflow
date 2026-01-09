import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "TicketFlow",
  description: "TicketFlow - Your Ultimate Ticket Management Solution, by Fábio Signorini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
      >
        {children}
      </body>
    </html>
  );
}
