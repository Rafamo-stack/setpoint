"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./design.module.css";
import smart from "./smart.module.css";

type Concept = "arena" | "tactical";
type View = "command" | "court" | "beach" | "analysis" | "management";
type RallyPhase = "ready" | "reception-player" | "contact-zone" | "setter-quality" | "attack-player" | "attack-target" | "block-result" | "attack-result" | "defense-player" | "rally-end";
type TeamSide = "home" | "away";
type RallyEvent = { tag: string; player: string; detail: string; grade: string; team: TeamSide };

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

function RosterMini({ number, role, name, team, active, onClick }: { number: number; role: string; name: string; team: "home" | "away"; active: boolean; onClick: () => void }) {
  return (
    <button className={`${styles.rosterMini} ${styles[team]} ${active ? styles.rosterActive : ""}`} onClick={onClick}>
      <span className={styles.miniPortrait}><i /><b>{number}</b></span>
      <span><strong>{name}</strong><small>{role}</small></span>
      <em>{active ? "SELEC." : "+"}</em>
    </button>
  );
}

function CourtToken({ number, role, x, y, team, active, suggested, onClick }: { number: number; role: string; x: number; y: number; team: TeamSide; active: boolean; suggested?: boolean; onClick: () => void }) {
  return (
    <button className={`${styles.courtToken} ${styles[team]} ${active ? styles.tokenActive : ""} ${suggested ? smart.suggestedToken : ""}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={onClick} aria-label={`${role} camisa ${number}`}>
      <span className={styles.tokenBody}><i /><b>{number}</b></span>
      <small>{role}</small>
    </button>
  );
}

const rosterNames: Record<number, string> = {
  2: "André Lima", 4: "Bruno Reis", 7: "Rafael Luz", 9: "Lucas Prado", 11: "Caio Mendes", 15: "Igor Nunes",
  22: "Tomás R.", 24: "Davi Costa", 27: "Enzo Melo", 29: "Nicolas S.", 31: "João Vitor", 35: "Matheus P.",
};

const nextRotationSlot: Record<number, number> = { 1: 6, 6: 5, 5: 4, 4: 3, 3: 2, 2: 1 };

function rotatedSlot(initial: number, steps: number) {
  let slot = initial;
  for (let index = 0; index < steps; index += 1) slot = nextRotationSlot[slot];
  return slot;
}

function slotPosition(slot: number, team: "home" | "away") {
  const home: Record<number, { x: number; y: number }> = {
    1: { x: 79, y: 87 }, 2: { x: 79, y: 69 }, 3: { x: 49, y: 66 },
    4: { x: 19, y: 68 }, 5: { x: 20, y: 87 }, 6: { x: 49, y: 85 },
  };
  const away: Record<number, { x: number; y: number }> = {
    1: { x: 20, y: 13 }, 2: { x: 20, y: 31 }, 3: { x: 50, y: 33 },
    4: { x: 80, y: 31 }, 5: { x: 80, y: 13 }, 6: { x: 50, y: 15 },
  };
  return team === "home" ? home[slot] : away[slot];
}

function ScoutCockpit({ beach = false }: { beach?: boolean }) {
  const [homeRotation, setHomeRotation] = useState(0);
  const [awayRotation, setAwayRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [command, setCommand] = useState("");
  const [lastCommand, setLastCommand] = useState("Atalhos prontos para uso");
  const [rallyPhase, setRallyPhase] = useState<RallyPhase>("ready");
  const [possession, setPossession] = useState<TeamSide>("away");
  const [contactKind, setContactKind] = useState<"reception" | "defense">("reception");
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [servingTeam, setServingTeam] = useState<TeamSide>("home");
  const [winner, setWinner] = useState<TeamSide | null>(null);
  const [beachAttacker, setBeachAttacker] = useState(8);
  const [homeScore, setHomeScore] = useState(beach ? 17 : 12);
  const [awayScore, setAwayScore] = useState(beach ? 16 : 10);
  const [events, setEvents] = useState<RallyEvent[]>([]);
  const setterHomeSlot = rotatedSlot(2, homeRotation);
  const setterAwaySlot = rotatedSlot(1, awayRotation);
  const teamHome = beach
    ? [{ n: 3, role: "BLOQ", x: 52, y: 69 }, { n: 12, role: "DEF", x: 24, y: 86 }]
    : [
        { n: 11, role: "PON", slot: 4 }, { n: 4, role: "CEN", slot: 3 },
        { n: 7, role: "LEV", slot: 2 }, { n: 15, role: "CEN", slot: 5 },
        { n: 2, role: "PON", slot: 6 }, { n: 9, role: "OPO", slot: 1 },
      ].map(player => ({ ...player, ...slotPosition(rotatedSlot(player.slot, homeRotation), "home") }));
  const teamAway = beach
    ? [{ n: 8, role: "BLOQ", x: 48, y: 31 }, { n: 14, role: "DEF", x: 76, y: 14 }]
    : [
        { n: 27, role: "LEV", slot: 1 }, { n: 31, role: "PON", slot: 2 },
        { n: 24, role: "CEN", slot: 3 }, { n: 29, role: "OPO", slot: 4 },
        { n: 22, role: "PON", slot: 5 }, { n: 35, role: "LIB", slot: 6 },
      ].map(player => ({ ...player, ...slotPosition(rotatedSlot(player.slot, awayRotation), "away") }));
  const [selected, setSelected] = useState(beach ? 12 : 15);
  const allPlayers = [...teamHome.map(p => ({ ...p, team: "home" as const })), ...teamAway.map(p => ({ ...p, team: "away" as const }))];
  const current = allPlayers.find(p => p.n === selected) ?? allPlayers[0];
  const homeLabel = beach ? "LUNA / BIA" : "SETMATCH";
  const awayLabel = beach ? "MAYA / CLARA" : "ATHLETIC";
  const playerName = rosterNames[selected] ?? (selected === 14 ? "Clara" : selected === 8 ? "Maya" : selected === 3 ? "Bia" : "Luna");
  const setterNumber = beach
    ? (possession === "home" ? (beachAttacker === 3 ? 12 : 3) : (beachAttacker === 8 ? 14 : 8))
    : (possession === "home" ? 7 : 27);
  const attackOptions = possession === "home" ? (beach ? [beachAttacker] : [11, 4, 9]) : (beach ? [beachAttacker] : [29, 31, 24]);
  const phaseStep: Record<RallyPhase, string> = {
    ready: "SAQUE", "reception-player": "RECEPÇÃO", "contact-zone": contactKind === "reception" ? "RECEPÇÃO" : "DEFESA",
    "setter-quality": "LEVANTAMENTO", "attack-player": "OPÇÕES DE ATAQUE", "attack-target": "DIREÇÃO DO ATAQUE",
    "block-result": "TOQUE NO BLOQUEIO", "attack-result": "RESULTADO", "defense-player": "DEFESA", "rally-end": "FIM DO RALLY",
  };
  const prompt: Record<RallyPhase, string> = {
    ready: "Pressione Enter para iniciar o saque",
    "reception-player": "Quem recebeu? Toque no atleta",
    "contact-zone": "Onde o passe terminou? Toque em uma das 9 zonas",
    "setter-quality": `Levantador #${setterNumber} aberto automaticamente`,
    "attack-player": "Escolha uma opção de ataque destacada",
    "attack-target": "Para onde foi o ataque? Escolha a zona",
    "block-result": "A bola tocou no bloqueio?",
    "attack-result": "Qual foi o resultado do ataque?",
    "defense-player": "Quem defendeu? Toque no atleta",
    "rally-end": `${winner === "home" ? homeLabel : awayLabel} marcou o ponto`,
  };

  function playerLabel(number: number) {
    return `#${number} ${rosterNames[number] ?? (number === 14 ? "Clara" : number === 8 ? "Maya" : number === 3 ? "Bia" : "Luna")}`;
  }

  function serverFor(team: TeamSide) {
    if (beach) return team === "home" ? 12 : 14;
    const source = team === "home" ? teamHome : teamAway;
    const rotation = team === "home" ? homeRotation : awayRotation;
    return source.find(player => "slot" in player && rotatedSlot(player.slot, rotation) === 1)?.n ?? (team === "home" ? 9 : 27);
  }

  function beginRally() {
    const server = serverFor(servingTeam);
    const receiverSide = servingTeam === "home" ? "away" : "home";
    setWinner(null);
    setSelected(server);
    setSelectedZone(null);
    setPossession(receiverSide);
    setContactKind("reception");
    setEvents([{ tag: "SAQ", player: playerLabel(server), detail: "Saque em jogo", grade: "+", team: servingTeam }]);
    setRallyPhase("reception-player");
  }

  function addEvent(event: RallyEvent) {
    setEvents(value => [...value, event]);
  }

  function finishRally(side: TeamSide, detail: string) {
    setWinner(side);
    addEvent({ tag: "PTO", player: side === "home" ? homeLabel : awayLabel, detail, grade: "●", team: side });
    if (side === "home") setHomeScore(value => value + 1); else setAwayScore(value => value + 1);
    if (side !== servingTeam) {
      if (!beach) {
        if (side === "home") setHomeRotation(value => (value + 1) % 6);
        else setAwayRotation(value => (value + 1) % 6);
      }
      setServingTeam(side);
    }
    setRallyPhase("rally-end");
  }

  function handlePlayerClick(player: typeof allPlayers[number]) {
    const validReceiver = beach || player.role === "PON" || player.role === "LIB";
    if (((rallyPhase === "reception-player" && validReceiver) || rallyPhase === "defense-player") && player.team === possession) {
      setSelected(player.n);
      if (beach) setBeachAttacker(player.n);
      setSelectedZone(null);
      setRallyPhase("contact-zone");
      return;
    }
    if (rallyPhase === "attack-player" && player.team === possession && attackOptions.includes(player.n)) {
      setSelected(player.n);
      setSelectedZone(null);
      setRallyPhase("attack-target");
    }
  }

  function gradeForZone(zone: number) {
    if (zone === 2) return { grade: "#", label: "perfeita" };
    if ([1, 3, 5].includes(zone)) return { grade: "+", label: "positiva" };
    if ([4, 6].includes(zone)) return { grade: "!", label: "fora do sistema" };
    return { grade: "-", label: "negativa" };
  }

  function handleZone(zone: number) {
    setSelectedZone(zone);
    if (rallyPhase === "contact-zone") {
      const result = gradeForZone(zone);
      addEvent({ tag: contactKind === "reception" ? "REC" : "DEF", player: playerLabel(selected), detail: `${contactKind === "reception" ? "Recepção" : "Defesa"} ${result.label} · Z${zone}`, grade: result.grade, team: possession });
      setSelected(setterNumber);
      setRallyPhase("setter-quality");
    } else if (rallyPhase === "attack-target") {
      addEvent({ tag: "ATA", player: playerLabel(selected), detail: `Ataque direcionado para Z${zone}`, grade: "→", team: possession });
      setRallyPhase("block-result");
    }
  }

  function chooseSet(grade: string, label: string) {
    addEvent({ tag: "LEV", player: playerLabel(setterNumber), detail: `Levantamento ${label.toLowerCase()}`, grade, team: possession });
    if (label === "Segunda") {
      setSelected(setterNumber);
      setRallyPhase("attack-target");
    } else setRallyPhase("attack-player");
  }

  function chooseBlock(kind: string) {
    const blocker = possession === "home" ? "away" : "home";
    if (kind === "Bloqueio ponto") {
      addEvent({ tag: "BLQ", player: blocker === "home" ? homeLabel : awayLabel, detail: kind, grade: "#", team: blocker });
      finishRally(blocker, "Ponto de bloqueio");
      return;
    }
    addEvent({ tag: "BLQ", player: blocker === "home" ? homeLabel : awayLabel, detail: kind, grade: kind === "Desviou" ? "+" : "·", team: blocker });
    setRallyPhase("attack-result");
  }

  function chooseAttackResult(kind: string) {
    if (kind === "Ponto") return finishRally(possession, "Ponto de ataque");
    if (kind === "Erro") return finishRally(possession === "home" ? "away" : "home", "Erro de ataque adversário");
    if (kind === "Defesa") {
      setPossession(possession === "home" ? "away" : "home");
      setContactKind("defense");
      setRallyPhase("defense-player");
    } else setRallyPhase("attack-player");
  }

  function isSuggested(player: typeof allPlayers[number]) {
    if (rallyPhase === "reception-player") return player.team === possession && (beach || player.role === "PON" || player.role === "LIB");
    if (rallyPhase === "defense-player") return player.team === possession;
    if (rallyPhase === "setter-quality") return player.n === setterNumber;
    if (rallyPhase === "attack-player") return player.team === possession && attackOptions.includes(player.n);
    return false;
  }

  useEffect(() => {
    function handleEnter(event: KeyboardEvent) {
      if ((event.target as HTMLElement)?.tagName === "INPUT") return;
      if (event.key === "Enter" && (rallyPhase === "ready" || rallyPhase === "rally-end")) beginRally();
    }
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  });

  const selectedPlayer = allPlayers.find(player => player.n === selected);
  const ballPosition = selectedPlayer ? { x: selectedPlayer.x, y: selectedPlayer.y - 5 } : { x: 50, y: 50 };
  const zoneSide: TeamSide = rallyPhase === "attack-target" ? (possession === "home" ? "away" : "home") : possession;

  function submitCommand() {
    const value = command.trim();
    if (!value) return;
    setLastCommand(`✓ “${value}” interpretado e adicionado ao rally`);
    setCommand("");
  }

  return (
    <section className={`${styles.simpleScout} ${fullscreen ? styles.simpleScoutFullscreen : ""}`}>
      <header className={styles.simpleScore}>
        <div className={styles.simpleTeam}><i className={styles.homeSwatch} /><span>{homeLabel}<small>{beach ? "Ordem 1" : `Levantador P${setterHomeSlot}`}</small></span><b>{homeScore}</b></div>
        <div className={styles.setBadge}><span>SET {beach ? 2 : 1}</span><strong>×</strong><small>Rally #{beach ? 41 : 28}</small></div>
        <div className={`${styles.simpleTeam} ${styles.simpleAway}`}><b>{awayScore}</b><span>{awayLabel}<small>{beach ? "Ordem 2" : `Levantador P${setterAwaySlot}`}</small></span><i className={styles.awaySwatch} /></div>
        <nav className={styles.simpleTools}>
          {!beach && <button onClick={() => setHomeRotation(value => (value + 1) % 6)}>↻ Rodízio</button>}
          <button onClick={() => setAdvanced(value => !value)}>{advanced ? "Ocultar detalhes" : "Mais detalhes"}</button>
          <button className={styles.fullscreenButton} onClick={() => setFullscreen(value => !value)}>{fullscreen ? "× Sair" : "⛶ Tela cheia"}</button>
        </nav>
      </header>

      <div className={styles.simpleStage}>
        <main className={styles.simpleCourtArea}>
          <div className={styles.simplePrompt}><span>{phaseStep[rallyPhase]}</span><strong>{prompt[rallyPhase]}</strong></div>
          <div className={`${styles.simpleCourt} ${beach ? styles.simpleBeachCourt : ""}`}>
            <div className={styles.courtGrid}>{[1,2,3,4,5,6,7,8,9].map(zone => <span key={zone}>{zone}</span>)}</div>
            <div className={styles.scoutNet}><i /><i /><i /><i /><i /><i /></div>
            <div className={styles.threeMeterTop} /><div className={styles.threeMeterBottom} />
            {allPlayers.map(player => <CourtToken key={`${player.team}-${player.n}`} number={player.n} role={player.role} x={player.x} y={player.y} team={player.team} active={selected === player.n} suggested={isSuggested(player)} onClick={() => handlePlayerClick(player)} />)}
            <span className={smart.smartBall} style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%` }}>●</span>
            {(rallyPhase === "contact-zone" || rallyPhase === "attack-target") && (
              <div className={`${smart.zonePicker} ${zoneSide === "away" ? smart.zoneTop : smart.zoneBottom}`}>
                {[1,2,3,4,5,6,7,8,9].map(zone => <button key={zone} className={selectedZone === zone ? smart.zoneSelected : ""} onClick={() => handleZone(zone)} aria-label={`Zona ${zone}`}><b>{zone}</b><small>{zone === 2 ? "ideal" : ""}</small></button>)}
              </div>
            )}
            {!beach && (homeRotation > 0 || awayRotation > 0) && <div key={`${homeRotation}-${awayRotation}`} className={styles.rotationMotion}>↻ Rodízio atualizado · P{setterHomeSlot}</div>}
          </div>
        </main>

        <aside className={styles.simpleHistory}>
          <div className={styles.simpleHistoryHead}><div><span>RALLY ATUAL</span><strong>Leitura automática</strong></div><em>● {rallyPhase === "rally-end" ? "FINALIZADO" : rallyPhase === "ready" ? "AGUARDANDO" : "BOLA VIVA"}</em></div>
          {events.length === 0 && <div className={smart.emptyRally}><b>ENTER</b><span>Inicia o saque e abre o fluxo visual.</span></div>}
          {events.map((event, index) => <article key={`${event.tag}-${index}`}><i className={event.team === "home" ? styles.homeCode : styles.awayCode}>{event.tag}</i><div><strong>{event.player}</strong><span>{event.detail}</span></div><b>{event.grade}</b></article>)}
          <button className={styles.undoSimple}>↶ Desfazer último</button>
          {advanced && <div className={styles.advancedDrawer}><strong>Detalhes avançados</strong><p>Código equivalente: <code>a31R+</code></p><p>Rotação: P{setterAwaySlot}</p><p>Trajetória: Z1 → Z5</p><button>Editar rally completo</button></div>}
        </aside>
      </div>

      <div className={`${styles.simpleActionDock} ${smart.actionDock}`}>
        <div className={styles.simpleSelected}>
          <span className={styles.consoleAvatar}><i /><b>{selected}</b></span>
          <div><small>{current.team === "home" ? homeLabel : awayLabel}</small><strong>{playerName}</strong><em>{phaseStep[rallyPhase]}</em></div>
        </div>
        <div className={smart.smartDecision}>
          <span>{phaseStep[rallyPhase]}</span><strong>{prompt[rallyPhase]}</strong>
          <div className={smart.decisionButtons}>
            {rallyPhase === "ready" && <button className={smart.primaryDecision} onClick={beginRally}>▶ Iniciar saque <kbd>Enter</kbd></button>}
            {rallyPhase === "setter-quality" && [["-","Ruim"],["+","Boa"],["#","Perfeita"],["↗","Segunda"]].map(([grade,label]) => <button key={label} onClick={() => chooseSet(grade,label)}><b>{grade}</b>{label}</button>)}
            {rallyPhase === "block-result" && ["Sem bloqueio","Desviou","Amorteceu","Bloqueio ponto"].map(label => <button key={label} onClick={() => chooseBlock(label)}>{label}</button>)}
            {rallyPhase === "attack-result" && ["Ponto","Defesa","Erro","Continua"].map(label => <button key={label} onClick={() => chooseAttackResult(label)}>{label}</button>)}
            {rallyPhase === "rally-end" && <button className={smart.primaryDecision} onClick={beginRally}>Novo rally <kbd>Enter</kbd></button>}
          </div>
        </div>
        <div className={smart.flowRail}><span className={events.some(event => event.tag === "SAQ") ? smart.flowDone : ""}>Saque</span><i>›</i><span className={events.some(event => event.tag === "REC" || event.tag === "DEF") ? smart.flowDone : ""}>Passe</span><i>›</i><span className={events.some(event => event.tag === "LEV") ? smart.flowDone : ""}>Levantamento</span><i>›</i><span className={events.some(event => event.tag === "ATA") ? smart.flowDone : ""}>Ataque</span></div>
      </div>

      <div className={styles.commandChat}>
        <div className={styles.commandStatus}><i>⌁</i><span><strong>Comando rápido</strong><small>{lastCommand}</small></span></div>
        <div className={styles.commandBox}>
          <input value={command} onChange={event => setCommand(event.target.value)} onKeyDown={event => event.key === "Enter" && submitCommand()} aria-label="Comando rápido de scout" placeholder='Digite: “31 recepção +” ou “ataque ponto do 9”' />
          <button onClick={submitCommand}>Enviar ↵</button>
        </div>
        <div className={styles.commandSuggestions}><button onClick={() => setCommand("31 rec +")}>31 rec +</button><button onClick={() => setCommand("9 ataque #")}>9 ataque #</button><button onClick={() => setCommand("ponto nosso")}>ponto nosso</button></div>
      </div>
    </section>
  );
}

function CourtView({ concept: _concept }: { concept: Concept }) {
  return <ScoutCockpit />;
}

function BeachView() {
  return <ScoutCockpit beach />;
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
