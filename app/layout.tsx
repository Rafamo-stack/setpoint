import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://resumo-projeto-volei-rafa.rafinhao.chatgpt.site"),
  title: "SetMatch — Scout e análise de vôlei",
  description:
    "Uma plataforma completa de scout e análise para vôlei de quadra e praia.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "SetMatch — O jogo inteiro",
    description: "Scout vivo, análise profunda e gestão para vôlei de quadra e praia.",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "SetMatch: vôlei de quadra e praia conectado por inteligência tática" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SetMatch — O jogo inteiro",
    description: "Scout vivo, análise profunda e gestão para vôlei de quadra e praia.",
    images: ["/og.png"],
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
