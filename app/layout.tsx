import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resumo do projeto de vôlei",
  description:
    "Uma visão simples do aplicativo de scout para vôlei de quadra e praia.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
