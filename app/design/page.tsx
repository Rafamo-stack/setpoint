"use client";

import { useMemo, useState } from "react";
import styles from "./design.module.css";

type Concept = "arena" | "tactical";
type View = "command" | "court" | "beach" | "analysis" | "management";

const views: Array<{ id: View; label: string; icon: string }> = [
  { id: "command", label: "Central", icon: "⌂" },
  { id: "court", label: "Scout quadra", icon: "◫" },
  { id: "beach", label: "Scout praia", icon: "≈" },
  { id: "analysis", label: "Análises", icon: "↗" },
  { id: "management", label: "Gestão", icon: "◎" },
];

const homePlayers = [
  { n: 11, role: "PON", x: 17, y: 35 },
  { n: 4, role: "CEN", x: 38, y: 31 },
  { n: 7, role: "LEV", x: 61, y: 34 },
  { n: 15, role: "CEN", x: 20, y: 73 },
  { n: 2, role: "PON", x: 43, y: 71 },
  { n: 9, role: "OPO", x: 68, y: 75 },
];

const awayPlayers = [
  { n: 29, role: "OPO", x: 25, y: 25 },
  { n: 24, role: "CEN", x: 49, y: 29 },
  { n: 31, role: "PON", x: 72, y: 24 },
  { n: 22, role: "PON", x: 19, y: 67 },
  { n: 35, role: "CEN", x: 46, y: 70 },
  { n: 27, role: "LEV", x: 71, y: 65 },
];

function Mark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={styles.mark}>
      <span className={styles.markBall}>V</span>
      {!compact && <strong>SET<span>MATCH</span></strong>}
    </div>
  );
}

function Athlete({
  number,
  role,
  x,
  y,
  team,
  active,
  onClick,
  beach,
}: {
  number: number;
  role: string;
  x: number;
  y: number;
  team: "home" | "away";
  active?: boolean;
  onClick?: () => void;
  beach?: boolean;
}) {
  return (
    <button
      className={`${styles.athlete} ${styles[team]} ${active ? styles.activeAthlete : ""} ${beach ? styles.beachAthlete : ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onClick}
      aria-label={`${role}, camisa ${number}`}
    >
      <span className={styles.aura} />
      <span className={styles.person}>
        <span className={styles.head} />
        <span className={styles.hair} />
        <span className={styles.torso}><b>{number}</b></span>
        <span className={styles.armLeft} />
        <span className={styles.armRight} />
        <span className={styles.legLeft} />
        <span className={styles.legRight} />
      </span>
      <span className={styles.playerTag}><b>{role}</b><small>#{number}</small></span>
    </button>
  );
}

function Metric({ label, value, detail, tone }: { label: string; value: string; detail: string; tone?: string }) {
  return (
    <article className={styles.metric} data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function CourtView({ concept }: { concept: Concept }) {
  const [selected, setSelected] = useState(27);
  const selectedPlayer = awayPlayers.find((player) => player.n === selected);
  return (
    <section className={styles.liveGrid}>
      <div className={styles.liveMain}>
        <div className={styles.scoreRibbon}>
          <div><span>SET 1</span><strong>12</strong><small>SETMATCH</small></div>
          <span className={styles.livePulse}>● AO VIVO</span>
          <div><small>ATHLETIC VÔLEI</small><strong>10</strong><span>0:18</span></div>
        </div>
        <div className={styles.indoorScene}>
          <div className={styles.arenaLights}><i /><i /><i /><i /><i /></div>
          <div className={styles.crowd} />
          <div className={styles.courtPerspective}>
            <div className={styles.net}><i /><i /><i /><i /><i /></div>
            <div className={styles.attackLineTop} />
            <div className={styles.attackLineBottom} />
            <div className={styles.courtHalfTop}>
              {awayPlayers.map((p) => (
                <Athlete key={p.n} number={p.n} role={p.role} x={p.x} y={p.y} team="away" active={selected === p.n} onClick={() => setSelected(p.n)} />
              ))}
            </div>
            <div className={styles.courtHalfBottom}>
              {homePlayers.map((p) => (
                <Athlete key={p.n} number={p.n} role={p.role} x={p.x} y={p.y} team="home" active={selected === p.n} onClick={() => setSelected(p.n)} />
              ))}
            </div>
            <span className={styles.ball}>●</span>
          </div>
          <div className={styles.sceneCaption}>
            <span>FASE ATUAL</span>
            <strong>Levantamento adversário</strong>
            <small>Toque no atleta que fará a próxima ação</small>
          </div>
        </div>
      </div>
      <aside className={styles.actionPanel}>
        <div className={styles.panelEyebrow}>PRÓXIMA AÇÃO</div>
        <div className={styles.selectedProfile}>
          <div className={styles.profileAvatar}>{selected}</div>
          <div><span>ATHLETIC VÔLEI</span><strong>{selectedPlayer?.role ?? "ATLETA"} #{selected}</strong><small>Recomendado pelo sistema</small></div>
        </div>
        <h3>O que aconteceu?</h3>
        <div className={styles.actionButtons}>
          <button className={styles.primaryAction}>Levantar <kbd>Q</kbd></button>
          <button>Passar de segunda <kbd>W</kbd></button>
          <button>Corrigir atleta <kbd>E</kbd></button>
        </div>
        <div className={styles.quality}>
          <span>QUALIDADE DO CONTATO</span>
          <div><button>—</button><button>!</button><button className={styles.qualityActive}>+</button><button>#</button></div>
        </div>
        <div className={styles.timeline}>
          <span>ÚLTIMOS CONTATOS</span>
          <p><b>SAQ</b> #15 Central 2 <em>em jogo</em></p>
          <p><b>REC</b> #31 Ponteiro <em>positiva</em></p>
          <p className={styles.pending}><b>LEV</b> aguardando registro</p>
        </div>
        <button className={styles.undo}>↶ Desfazer último contato</button>
        {concept === "arena" && <div className={styles.coachHint}>IA TÁTICA · chance de ataque pela saída <b>42%</b></div>}
      </aside>
    </section>
  );
}

function BeachView() {
  const [selected, setSelected] = useState(14);
  return (
    <section className={styles.liveGrid}>
      <div className={styles.liveMain}>
        <div className={styles.scoreRibbon}>
          <div><span>SET 2</span><strong>17</strong><small>LUNA / BIA</small></div>
          <span className={styles.weather}>↗ 24 km/h · ☀ 31°</span>
          <div><small>MAYA / CLARA</small><strong>16</strong><span>LADO MAR</span></div>
        </div>
        <div className={styles.beachScene}>
          <div className={styles.sun} />
          <div className={styles.sea}><i /><i /><i /></div>
          <div className={styles.sandCourt}>
            <div className={styles.beachNet} />
            <div className={styles.beachTop}>
              <Athlete number={8} role="BLOQ" x={48} y={29} team="away" beach active={selected === 8} onClick={() => setSelected(8)} />
              <Athlete number={14} role="DEF" x={72} y={68} team="away" beach active={selected === 14} onClick={() => setSelected(14)} />
            </div>
            <div className={styles.beachBottom}>
              <Athlete number={3} role="BLOQ" x={51} y={31} team="home" beach active={selected === 3} onClick={() => setSelected(3)} />
              <Athlete number={12} role="DEF" x={27} y={72} team="home" beach active={selected === 12} onClick={() => setSelected(12)} />
            </div>
            <span className={styles.ballBeach}>●</span>
          </div>
          <div className={styles.windCard}><span>VENTO</span><strong>↗ Lateral forte</strong><small>Rajadas para o fundo da quadra</small></div>
        </div>
      </div>
      <aside className={styles.actionPanel}>
        <div className={styles.panelEyebrow}>SCOUT PRAIA · ORDEM 2</div>
        <div className={styles.selectedProfile}>
          <div className={styles.profileAvatar}>{selected}</div>
          <div><span>DUPLA MAYA / CLARA</span><strong>Atleta #{selected}</strong><small>Lado mar · defendendo</small></div>
        </div>
        <h3>Defesa registrada</h3>
        <div className={styles.actionButtons}>
          <button className={styles.primaryAction}>Positiva <kbd>Q</kbd></button>
          <button>Negativa <kbd>W</kbd></button>
          <button>Perfeita <kbd>E</kbd></button>
          <button>Falha <kbd>R</kbd></button>
        </div>
        <div className={styles.beachRead}>
          <span>LEITURA DA JOGADA</span>
          <p><b>Defensor:</b> Clara #14</p>
          <p><b>Chamada:</b> linha</p>
          <p><b>Ataque:</b> largada curta</p>
        </div>
        <div className={styles.timeline}>
          <span>SEQUÊNCIA</span>
          <p><b>SAQ</b> Luna #12 <em>zona curta</em></p>
          <p><b>REC</b> Maya #8 <em>perfeita</em></p>
          <p><b>ATA</b> Maya #8 <em>largada</em></p>
        </div>
      </aside>
    </section>
  );
}

function CommandView() {
  return (
    <section className={styles.dashboard}>
      <header className={styles.heroHeader}>
        <div><span>SÁBADO, 18 DE JULHO</span><h1>Boa noite, Rafa.</h1><p>Seu próximo jogo começa em 2 horas. A preparação está pronta.</p></div>
        <button className={styles.newMatch}>＋ Nova partida</button>
      </header>
      <div className={styles.heroMatch}>
        <div className={styles.matchGlow} />
        <div className={styles.matchMeta}><span>SUPERLIGA B · HOJE 20:30</span><b>GINÁSIO MUNICIPAL · CASA</b></div>
        <div className={styles.versus}>
          <div><i className={styles.teamBadge}>SM</i><strong>SetMatch</strong><span>8 V · 2 D</span></div>
          <section><small>PRÓXIMA PARTIDA</small><b>VS</b><em>02:14:37</em></section>
          <div><i className={styles.teamBadgeAlt}>AV</i><strong>Athletic Vôlei</strong><span>7 V · 3 D</span></div>
        </div>
        <div className={styles.matchActions}><button>Ver preparação</button><button className={styles.startScout}>▶ Iniciar scout</button></div>
      </div>
      <div className={styles.commandColumns}>
        <div className={styles.card}>
          <div className={styles.cardTitle}><div><span>DESEMPENHO</span><h3>Últimos 8 jogos</h3></div><button>Temporada ▾</button></div>
          <div className={styles.sparkChart}>
            {[42,56,49,71,64,82,75,91].map((h,i)=><i key={i} style={{height:`${h}%`}}><b>{i === 7 ? "3–1" : ""}</b></i>)}
          </div>
          <div className={styles.miniMetrics}><span><b>71%</b> aproveitamento</span><span><b>+8</b> saldo de sets</span><span><b>4</b> sequência atual</span></div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}><div><span>FOCO DA SEMANA</span><h3>Alertas táticos</h3></div><b className={styles.aiBadge}>✦ IA</b></div>
          <div className={styles.alertRow}><b>01</b><div><strong>Recepção na P5 caiu 12%</strong><span>Priorizar treino com saque flutuante na zona 1.</span></div><em>ALTO</em></div>
          <div className={styles.alertRow}><b>02</b><div><strong>Oposto em alta no contra-ataque</strong><span>Eficiência de 58% nos últimos três jogos.</span></div><em>INFO</em></div>
          <div className={styles.alertRow}><b>03</b><div><strong>Adversário força saída de rede</strong><span>42% dos ataques com recepção quebrada.</span></div><em>MÉDIO</em></div>
        </div>
      </div>
      <div className={styles.lowerGrid}>
        <div className={styles.card}><div className={styles.cardTitle}><div><span>AGENDA</span><h3>Esta semana</h3></div><button>Ver tudo</button></div><div className={styles.schedule}><p><b>18</b><span>JUL<br/><small>HOJE</small></span><strong>Athletic Vôlei</strong><em>20:30</em></p><p><b>20</b><span>JUL<br/><small>TREINO</small></span><strong>Recepção + side-out</strong><em>18:00</em></p></div></div>
        <div className={styles.card}><div className={styles.cardTitle}><div><span>ELENCO</span><h3>Disponibilidade</h3></div></div><div className={styles.rosterFaces}>{[7,11,4,9,2,15].map((n)=><i key={n}>{n}</i>)}<span><b>11</b> disponíveis<small>1 em recuperação</small></span></div></div>
        <div className={styles.card}><div className={styles.cardTitle}><div><span>ÚLTIMO JOGO</span><h3>SetMatch 3 × 1 Orion</h3></div></div><div className={styles.lastGame}><b>53%</b><span>eficiência de ataque</span><div><i style={{width:"78%"}} /></div><small>Relatório completo →</small></div></div>
      </div>
    </section>
  );
}

function AnalysisView() {
  return (
    <section className={styles.analysis}>
      <header className={styles.sectionHeader}><div><span>ANÁLISE PÓS-JOGO</span><h1>SetMatch 3 × 1 Orion</h1><p>18 jul 2026 · 1h42 · Superliga B</p></div><div><button>Compartilhar</button><button className={styles.export}>Exportar relatório</button></div></header>
      <div className={styles.metricsRow}>
        <Metric label="EFICIÊNCIA DE ATAQUE" value="53%" detail="+8% vs. média" tone="green" />
        <Metric label="SIDE-OUT" value="68%" detail="42 de 62 rallies" tone="blue" />
        <Metric label="BREAK POINT" value="39%" detail="+5% vs. adversário" tone="purple" />
        <Metric label="RECEPÇÃO POSITIVA" value="71%" detail="12 perfeitas" tone="orange" />
      </div>
      <div className={styles.analysisGrid}>
        <article className={`${styles.card} ${styles.rotationCard}`}>
          <div className={styles.cardTitle}><div><span>EFICIÊNCIA POR ROTAÇÃO</span><h3>Onde o jogo virou</h3></div><button>Ataque ▾</button></div>
          <div className={styles.rotationChart}>
            {[{r:"P1",v:48},{r:"P2",v:62},{r:"P3",v:51},{r:"P4",v:67},{r:"P5",v:39},{r:"P6",v:58}].map((x)=><div key={x.r}><span>{x.v}%</span><i><b style={{height:`${x.v}%`}} /></i><strong>{x.r}</strong></div>)}
          </div>
          <div className={styles.insight}><b>✦ Leitura automática</b><p>A P5 perdeu eficiência quando o passe afastou o levantador. O adversário concentrou 64% dos saques em #11.</p></div>
        </article>
        <article className={`${styles.card} ${styles.heatCard}`}>
          <div className={styles.cardTitle}><div><span>MAPA DE ATAQUE</span><h3>Distribuição e resultado</h3></div><button>Todos atletas ▾</button></div>
          <div className={styles.miniCourt}>
            <span className={styles.heatOne}>14<small>72%</small></span><span className={styles.heatTwo}>9<small>56%</small></span><span className={styles.heatThree}>21<small>43%</small></span><span className={styles.heatFour}>7<small>61%</small></span>
          </div>
          <div className={styles.legend}><span>● Ponto</span><span>● Em jogo</span><span>● Erro</span></div>
        </article>
      </div>
      <div className={styles.playerTable}>
        <div className={styles.cardTitle}><div><span>DESEMPENHO INDIVIDUAL</span><h3>Atletas em destaque</h3></div><button>Ver scout completo</button></div>
        <div className={styles.tableHead}><span>ATLETA</span><span>ATAQUES</span><span>PONTOS</span><span>EFICIÊNCIA</span><span>SAQUE</span><span>RECEPÇÃO</span></div>
        {[
          ["#9 Lucas Prado","Oposto","28","17","61%","2 aces","—"],
          ["#11 Caio Mendes","Ponteiro","24","13","48%","1 ace","74%"],
          ["#4 Bruno Reis","Central","14","9","57%","0","—"],
          ["#2 André Lima","Ponteiro","19","8","37%","2 aces","68%"],
        ].map((row)=><div className={styles.tableRow} key={row[0]}>{row.map((cell,i)=><span key={cell}>{i===0?<><i>{cell.slice(1,3)}</i><b>{cell}<small>{row[1]}</small></b></>:cell}</span>)}</div>)}
      </div>
    </section>
  );
}

function ManagementView() {
  return (
    <section className={styles.management}>
      <header className={styles.sectionHeader}><div><span>PREPARAÇÃO E GESTÃO</span><h1>Plano de jogo · Athletic Vôlei</h1><p>Atualizado há 12 minutos pela comissão técnica</p></div><div><button>Convidar comissão</button><button className={styles.export}>Apresentar plano</button></div></header>
      <div className={styles.managementGrid}>
        <article className={`${styles.card} ${styles.opponentCard}`}>
          <div className={styles.opponentHead}><i className={styles.teamBadgeAlt}>AV</i><div><span>PRÓXIMO ADVERSÁRIO</span><h2>Athletic Vôlei</h2><p>7 vitórias · 3 derrotas · 4º lugar</p></div><b>HOJE<br/><small>20:30</small></b></div>
          <div className={styles.tendencies}><span><b>42%</b><small>ataques pela saída</small></span><span><b>31%</b><small>saques na zona 1</small></span><span><b>64%</b><small>side-out na P4</small></span></div>
          <h3>Padrões identificados</h3>
          <div className={styles.pattern}><b>01</b><p><strong>Levantador acelera com passe A</strong><span>Central #24 recebe 38% das bolas em recepção perfeita.</span></p><em>8 clipes</em></div>
          <div className={styles.pattern}><b>02</b><p><strong>Oposto explora diagonal curta</strong><span>Principal saída em contra-ataques após defesa na zona 5.</span></p><em>12 clipes</em></div>
          <div className={styles.pattern}><b>03</b><p><strong>Recepção vulnerável entre #22 e #31</strong><span>19% de conflito em saques flutuantes curtos.</span></p><em>6 clipes</em></div>
        </article>
        <div className={styles.planStack}>
          <article className={styles.card}>
            <div className={styles.cardTitle}><div><span>PLANO DO JOGO</span><h3>Três prioridades</h3></div><button>Editar</button></div>
            <div className={styles.priority}><i>1</i><p><strong>Forçar recepção na zona de conflito</strong><span>Saque flutuante entre 5 e 6, alternando curto.</span></p><b>SAQUE</b></div>
            <div className={styles.priority}><i>2</i><p><strong>Fechar diagonal do oposto</strong><span>Bloqueio orientado e defesa longa na linha.</span></p><b>DEFESA</b></div>
            <div className={styles.priority}><i>3</i><p><strong>Acelerar primeiro tempo</strong><span>Usar central #4 para segurar o bloqueio.</span></p><b>ATAQUE</b></div>
          </article>
          <article className={styles.card}>
            <div className={styles.cardTitle}><div><span>ESCALAÇÃO PROVÁVEL</span><h3>5x1 · P2 inicial</h3></div><button>Alterar</button></div>
            <div className={styles.lineup}>
              {homePlayers.map((p)=><span key={p.n} style={{left:`${12 + p.x * .75}%`,top:`${10 + p.y * .65}%`}}><b>{p.n}</b><small>{p.role}</small></span>)}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default function DesignConcepts() {
  const [concept, setConcept] = useState<Concept>("arena");
  const [view, setView] = useState<View>("command");
  const title = useMemo(() => concept === "arena" ? "Arena Intelligence" : "Tactical Command", [concept]);
  return (
    <main className={`${styles.app} ${styles[concept]}`}>
      <aside className={styles.sidebar}>
        <Mark />
        <nav>
          {views.map((item) => (
            <button key={item.id} className={view === item.id ? styles.navActive : ""} onClick={() => setView(item.id)}>
              <i>{item.icon}</i><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <button><i>⚙</i><span>Configurações</span></button>
          <div className={styles.user}><b>RF</b><span>Rafa<small>Administrador</small></span></div>
        </div>
      </aside>
      <div className={styles.shell}>
        <div className={styles.conceptBar}>
          <div><span>EXPLORAÇÃO VISUAL</span><strong>{title}</strong><small>Conceito {concept === "arena" ? "01" : "02"} de 02</small></div>
          <div className={styles.conceptSwitch}>
            <button className={concept === "arena" ? styles.conceptActive : ""} onClick={() => setConcept("arena")}><b>01</b><span>Arena<small>cinematográfico</small></span></button>
            <button className={concept === "tactical" ? styles.conceptActive : ""} onClick={() => setConcept("tactical")}><b>02</b><span>Tactical<small>precisão técnica</small></span></button>
          </div>
        </div>
        <div className={styles.mobileTabs}>
          {views.map((item)=><button key={item.id} className={view === item.id ? styles.navActive : ""} onClick={()=>setView(item.id)}>{item.icon}<small>{item.label}</small></button>)}
        </div>
        <div className={styles.content}>
          {view === "command" && <CommandView />}
          {view === "court" && <CourtView concept={concept} />}
          {view === "beach" && <BeachView />}
          {view === "analysis" && <AnalysisView />}
          {view === "management" && <ManagementView />}
        </div>
      </div>
    </main>
  );
}
