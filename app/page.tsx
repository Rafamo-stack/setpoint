import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resumo do projeto de vôlei",
  description:
    "Uma visão simples do aplicativo de scout para vôlei de quadra e praia.",
};

export default function Home() {
  return (
    <main>
      <iframe
        className="visualization-frame"
        src="/resumo-projeto-volei.html"
        title="Resumo visual do projeto de vôlei"
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
      />
    </main>
  );
}
