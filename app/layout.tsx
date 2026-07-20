import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://resumo-projeto-volei-rafa.rafinhao.chatgpt.site"),
  title: "SetPoint — Cada toque vira decisão",
  description:
    "Uma plataforma completa de scout e análise para vôlei de quadra e praia.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "SetPoint — Cada toque vira decisão",
    description: "Scout vivo, análise profunda e gestão para vôlei de quadra e praia.",
    images: [{ url: "/og-setpoint.png", width: 1536, height: 1024, alt: "SetPoint: inteligência tática para vôlei de quadra e praia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SetPoint — Cada toque vira decisão",
    description: "Scout vivo, análise profunda e gestão para vôlei de quadra e praia.",
    images: ["/og-setpoint.png"],
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
