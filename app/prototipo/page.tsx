"use client";

import { CSSProperties, useMemo, useState } from "react";
import styles from "./prototipo.module.css";

type Mode = "indoor" | "beach";
type Side = "home" | "away";
type Phase = "preServe" | "reception" | "setting" | "attacking" | "defending" | "ended";
type RotationName = "P1" | "P6" | "P5" | "P4" | "P3" | "P2";
type IndoorRole = "setter" | "outside1" | "middle1" | "opposite" | "outside2" | "middle2";

type Player = {
  id: string;
  side: Side;
  role: IndoorRole | "beach1" | "beach2";
  short: string;
  name: string;
  shirt: number;
  color: string;
};

type Position = { x: number; y: number };
type HistoryItem = { id: number; player: Player; action: string; result: string };

const ROTATION_ORDER: RotationName[] = ["P1", "P6", "P5", "P4", "P3", "P2"];
const ROTATIONS: Record<RotationName, Record<number, IndoorRole>> = {
  P1: { 1: "setter", 2: "outside1", 3: "middle1", 4: "opposite", 5: "outside2", 6: "middle2" },
  P6: { 1: "outside1", 2: "middle1", 3: "opposite", 4: "outside2", 5: "middle2", 6: "setter" },
  P5: { 1: "middle1", 2: "opposite", 3: "outside2", 4: "middle2", 5: "setter", 6: "outside1" },
  P4: { 1: "opposite", 2: "outside2", 3: "middle2", 4: "setter", 5: "outside1", 6: "middle1" },
  P3: { 1: "outside2", 2: "middle2", 3: "setter", 4: "outside1", 5: "middle1", 6: "opposite" },
  P2: { 1: "middle2", 2: "setter", 3: "outside1", 4: "middle1", 5: "opposite", 6: "outside2" },
};

const ROLE_DATA: Record<IndoorRole, Pick<Player, "short" | "name" | "shirt" | "color">> = {
  setter: { short: "LEV", name: "Levantador", shirt: 7, color: "#7259ff" },
  outside1: { short: "PT1", name: "Ponteiro 1", shirt: 11, color: "#ff725e" },
  middle1: { short: "C1", name: "Central 1", shirt: 4, color: "#20a878" },
  opposite: { short: "OPO", name: "Oposto", shirt: 9, color: "#eead2d" },
  outside2: { short: "PT2", name: "Ponteiro 2", shirt: 2, color: "#e25798" },
  middle2: { short: "C2", name: "Central 2", shirt: 15, color: "#1594bd" },
};

const RESULTS: Record<string, string[]> = {
  Saque: ["Ace", "Em jogo", "Erro"],
  Recepção: ["Perfeita", "Positiva", "Negativa", "Erro"],
  Levantamento: ["Em jogo", "Erro"],
  Ataque: ["Ponto", "Defendido", "Bloqueado (ponto)", "Erro"],
  Bloqueio: ["Ponto", "Toque", "Erro"],
  Defesa: ["Perfeita", "Positiva", "Negativa", "Falha"],
};

const SLOT_HOME: Record<number, Position> = {
  4: { x: 25, y: 61 }, 3: { x: 50, y: 60 }, 2: { x: 75, y: 61 },
  5: { x: 27, y: 83 }, 6: { x: 50, y: 84 }, 1: { x: 73, y: 83 },
};

const SLOT_AWAY: Record<number, Position> = {
  4: { x: 68, y: 42 }, 3: { x: 50, y: 40 }, 2: { x: 32, y: 42 },
  5: { x: 66, y: 23 }, 6: { x: 50, y: 20 }, 1: { x: 34, y: 23 },
};

function indoorPlayers(side: Side): Player[] {
  return (Object.keys(ROLE_DATA) as IndoorRole[]).map((role) => {
    const base = ROLE_DATA[role];
    return {
      ...base,
      id: `${side}-${role}`,
      side,
      role,
      shirt: side === "home" ? base.shirt : base.shirt + 20,
      color: side === "home" ? base.color : "#237f86",
    };
  });
}

function beachPlayers(side: Side): Player[] {
  const home = side === "home";
  return [
    { id: `${side}-beach1`, side, role: "beach1", short: home ? "RAFA" : "D1", name: home ? "Rafa" : "Adversário 1", shirt: 1, color: home ? "#7259ff" : "#237f86" },
    { id: `${side}-beach2`, side, role: "beach2", short: home ? "LEO" : "D2", name: home ? "Leo" : "Adversário 2", shirt: 2, color: home ? "#ff725e" : "#237f86" },
  ];
}

const PHASE_COPY: Record<Phase, { title: string; detail: string }> = {
  preServe: { title: "Pré-saque", detail: "Toque no sacador destacado para iniciar o rally." },
  reception: { title: "Saque em jogo", detail: "Recepção adversária pronta; nosso time assumiu bloqueio e defesa." },
  setting: { title: "Bola controlada", detail: "O levantador provável foi aberto automaticamente." },
  attacking: { title: "Organização de ataque", detail: "Escolha um dos atacantes destacados." },
  defending: { title: "Ataque defendido", detail: "A posse mudou. Toque em quem realizou a defesa." },
  ended: { title: "Rally encerrado", detail: "O placar foi atualizado. Reinicie para demonstrar outro rally." },
};

export default function PrototypePage() {
  const [mode, setMode] = useState<Mode>("indoor");
  const [rotation, setRotation] = useState<RotationName>("P2");
  const [phase, setPhase] = useState<Phase>("preServe");
  const [expectedSide, setExpectedSide] = useState<Side>("home");
  const [expectedAction, setExpectedAction] = useState("Saque");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [ourScore, setOurScore] = useState(12);
  const [theirScore, setTheirScore] = useState(10);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const players = useMemo(() => mode === "indoor"
    ? [...indoorPlayers("home"), ...indoorPlayers("away")]
    : [...beachPlayers("home"), ...beachPlayers("away")], [mode]);
  const selectedPlayer = players.find((player) => player.id === selectedPlayerId) ?? null;
  const serverRole = ROTATIONS[rotation][1];
  const serverId = mode === "indoor" ? `home-${serverRole}` : "home-beach2";

  function resetRally(nextMode = mode, nextRotation = rotation) {
    setMode(nextMode);
    setRotation(nextRotation);
    setPhase("preServe");
    setExpectedSide("home");
    setExpectedAction("Saque");
    setSelectedPlayerId(null);
    setSelectedAction(null);
    setHistory([]);
  }

  function positionFor(player: Player): Position {
    if (mode === "beach") {
      if (phase === "preServe") {
        if (player.id === "home-beach2") return { x: 72, y: 89 };
        if (player.id === "home-beach1") return { x: 50, y: 61 };
        return player.role === "beach1" ? { x: 35, y: 25 } : { x: 65, y: 25 };
      }
      const possession = expectedSide;
      if (player.side === possession) {
        if (phase === "reception" || phase === "defending") return player.role === "beach1" ? { x: 35, y: player.side === "home" ? 80 : 23 } : { x: 65, y: player.side === "home" ? 80 : 23 };
        if (phase === "setting") return player.id === selectedPlayerId ? { x: 52, y: player.side === "home" ? 62 : 39 } : { x: 32, y: player.side === "home" ? 65 : 36 };
        if (phase === "attacking") return player.role === "beach1" ? { x: 34, y: player.side === "home" ? 61 : 40 } : { x: 66, y: player.side === "home" ? 61 : 40 };
      }
      return player.role === "beach1" ? { x: 50, y: player.side === "home" ? 62 : 39 } : { x: 55, y: player.side === "home" ? 84 : 17 };
    }

    if (phase === "preServe" || phase === "ended") {
      const slot = Number(Object.entries(ROTATIONS[player.side === "home" ? rotation : "P1"]).find(([, role]) => role === player.role)?.[0] ?? 1);
      return player.side === "home" ? SLOT_HOME[slot] : SLOT_AWAY[slot];
    }

    const homeTactical: Record<IndoorRole, Position> = {
      outside1: { x: 25, y: 61 }, middle1: { x: 50, y: 59 }, setter: { x: 75, y: 61 },
      middle2: { x: 27, y: 82 }, outside2: { x: 50, y: 84 }, opposite: { x: 73, y: 82 },
    };
    const awayReception: Record<IndoorRole, Position> = {
      outside1: { x: 31, y: 23 }, outside2: { x: 69, y: 23 }, middle2: { x: 50, y: 19 },
      setter: { x: 65, y: 40 }, middle1: { x: 50, y: 40 }, opposite: { x: 35, y: 40 },
    };
    const attack: Record<IndoorRole, Position> = {
      outside1: { x: 28, y: 61 }, middle1: { x: 50, y: 59 }, opposite: { x: 73, y: 61 },
      setter: { x: 64, y: 63 }, outside2: { x: 39, y: 81 }, middle2: { x: 58, y: 83 },
    };
    const mirror = (p: Position): Position => ({ x: 100 - p.x, y: 101 - p.y });
    if (player.side === "home") {
      if (expectedSide === "home" && (phase === "setting" || phase === "attacking")) return attack[player.role as IndoorRole];
      return homeTactical[player.role as IndoorRole];
    }
    if (expectedSide === "away" && (phase === "setting" || phase === "attacking")) return mirror(attack[player.role as IndoorRole]);
    return awayReception[player.role as IndoorRole];
  }

  function isRecommended(player: Player) {
    if (phase === "ended") return false;
    if (phase === "preServe") return player.id === serverId;
    if (player.side !== expectedSide) return false;
    if (phase === "setting") return player.id === selectedPlayerId;
    if (phase === "attacking") return mode === "beach" || ["outside1", "middle1", "opposite"].includes(player.role);
    if (phase === "reception") return mode === "beach" || ["outside1", "outside2", "middle2"].includes(player.role);
    return phase === "defending";
  }

  function choosePlayer(player: Player) {
    if (phase === "ended") return;
    setSelectedPlayerId(player.id);
    setSelectedAction(player.side === expectedSide ? expectedAction : null);
  }

  function autoOpenSetter(side: Side, actor: Player) {
    let setter: Player | undefined;
    if (mode === "indoor") setter = players.find((player) => player.side === side && player.role === "setter");
    else setter = players.find((player) => player.side === side && player.id !== actor.id);
    setExpectedSide(side);
    setExpectedAction("Levantamento");
    setPhase("setting");
    setSelectedPlayerId(setter?.id ?? null);
    setSelectedAction("Levantamento");
  }

  function addHistory(player: Player, action: string, result: string) {
    setHistory((current) => [{ id: Date.now(), player, action, result }, ...current].slice(0, 6));
  }

  function endRally(winner: Side) {
    if (winner === "home") setOurScore((score) => score + 1);
    else setTheirScore((score) => score + 1);
    setPhase("ended");
    setSelectedPlayerId(null);
    setSelectedAction(null);
  }

  function registerResult(result: string) {
    if (!selectedPlayer || !selectedAction) return;
    addHistory(selectedPlayer, selectedAction, result);
    const side = selectedPlayer.side;
    const other: Side = side === "home" ? "away" : "home";

    if (selectedAction === "Saque") {
      if (result === "Ace") return endRally(side);
      if (result === "Erro") return endRally(other);
      setPhase("reception"); setExpectedSide(other); setExpectedAction("Recepção");
    } else if (selectedAction === "Recepção" || selectedAction === "Defesa") {
      if (result === "Erro" || result === "Falha") return endRally(other);
      return autoOpenSetter(side, selectedPlayer);
    } else if (selectedAction === "Levantamento") {
      if (result === "Erro") return endRally(other);
      setPhase("attacking"); setExpectedSide(side); setExpectedAction("Ataque");
    } else if (selectedAction === "Ataque") {
      if (result === "Ponto") return endRally(side);
      if (result === "Erro" || result === "Bloqueado (ponto)") return endRally(other);
      setPhase("defending"); setExpectedSide(other); setExpectedAction("Defesa");
    } else if (selectedAction === "Bloqueio") {
      if (result === "Ponto") return endRally(side);
      if (result === "Erro") return endRally(other);
      setPhase("defending"); setExpectedSide(side); setExpectedAction("Defesa");
    }
    setSelectedPlayerId(null);
    setSelectedAction(null);
  }

  const server = players.find((player) => player.id === serverId);
  const phaseCopy = PHASE_COPY[phase];

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div><div className={styles.eyebrow}><span /> Protótipo de fluxo</div><h1>Scout visual de vôlei</h1><p>Os atletas mudam de formação e o próximo contato é sugerido pelo rally.</p></div>
        <div className={styles.prototypeFlag}>Em construção</div>
      </header>

      <section className={styles.modeSwitch} aria-label="Escolha da modalidade">
        <button className={mode === "indoor" ? styles.activeMode : ""} onClick={() => resetRally("indoor")}>🏐 Quadra 5x1</button>
        <button className={mode === "beach" ? styles.activeMode : ""} onClick={() => resetRally("beach")}>🏖️ Vôlei de praia</button>
        <span>Modelos táticos diferentes, mesmo fluxo simples.</span>
      </section>

      <section className={styles.scoreboard} aria-label="Placar demonstrativo">
        <div className={styles.teamScore}><span>Nosso time</span><button onClick={() => setOurScore((s) => Math.max(0, s - 1))}>−</button><strong>{ourScore}</strong><button onClick={() => setOurScore((s) => s + 1)}>+</button></div>
        <div className={styles.setBadge}>1º set</div>
        <div className={`${styles.teamScore} ${styles.opponentScore}`}><button onClick={() => setTheirScore((s) => Math.max(0, s - 1))}>−</button><strong>{theirScore}</strong><button onClick={() => setTheirScore((s) => s + 1)}>+</button><span>Adversário</span></div>
      </section>

      {mode === "indoor" ? (
        <section className={styles.rotationBar}>
          <div><span className={styles.label}>Preset inicial</span><strong>5x1 · levantador em {rotation}</strong></div>
          <div className={styles.rotationButtons}>{ROTATION_ORDER.map((item) => <button key={item} className={item === rotation ? styles.activeRotation : ""} onClick={() => resetRally("indoor", item)}>{item}</button>)}</div>
          <div className={styles.serverInfo}><span>🏐</span><div><small>Sacador</small><strong>{server?.name} #{server?.shirt}</strong></div></div>
        </section>
      ) : (
        <section className={styles.rotationBar}><div><span className={styles.label}>Praia</span><strong>Dupla e ordem de saque</strong></div><div className={styles.beachRule}>Sem P1–P6: receptor → parceiro levanta; sacador → parceiro bloqueia</div><div className={styles.serverInfo}><span>🏐</span><div><small>Sacador</small><strong>{server?.name} #{server?.shirt}</strong></div></div></section>
      )}

      <section className={`${styles.phaseBanner} ${styles[`phase_${phase}`]}`}><div><small>Estado do rally</small><strong>{phaseCopy.title}</strong></div><p>{phaseCopy.detail}</p>{phase === "ended" && <button onClick={() => resetRally()}>Novo rally</button>}</section>

      <div className={styles.workspace}>
        <section className={styles.courtPanel}>
          <div className={styles.formationLabels}>
            <span>{phase === "preServe" ? "Adversário · posição inicial" : expectedSide === "away" ? (phase === "reception" ? (mode === "beach" ? "Adversário · dupla na recepção" : "Adversário · recepção com 3 passadores") : "Adversário · posse") : (mode === "beach" ? "Adversário · bloqueador + defensor" : "Adversário · bloqueio + defesa")}</span>
            <span>{phase === "preServe" ? (mode === "beach" ? "Nossa dupla · ordem de saque" : "Nosso time · rodízio legal") : expectedSide === "home" ? "Nosso time · posse" : (mode === "beach" ? "Nossa dupla · bloqueador + defensor" : "Nosso time · defesa 6-fundo")}</span>
          </div>
          <div className={`${styles.courtStage} ${mode === "beach" ? styles.beachStage : ""}`}>
            <div className={styles.courtSurface} aria-hidden="true"><div className={styles.attackLineTop} /><div className={styles.attackLineBottom} /><div className={styles.net}><i /><i /><i /><i /></div></div>
            {players.map((player) => {
              const position = positionFor(player);
              const recommended = isRecommended(player);
              const style = { left: `${position.x}%`, top: `${position.y}%`, "--player-color": player.color } as CSSProperties;
              return <button key={player.id} className={`${styles.player} ${player.side === "away" ? styles.awayPlayer : ""} ${selectedPlayerId === player.id ? styles.selectedPlayer : ""} ${recommended ? styles.recommendedPlayer : ""} ${player.id === serverId && phase === "preServe" ? styles.servingPlayer : ""}`} style={style} onClick={() => choosePlayer(player)}>
                <span className={styles.playerHead} /><span className={styles.playerBody}>{player.shirt}</span><span className={styles.playerLabel}><strong>{player.short}</strong><small>{player.side === "home" ? "NOS" : "ADV"}</small></span>
              </button>;
            })}
          </div>
          <div className={styles.courtLegend}><span><i className={styles.ourDot} /> Nosso time</span><span><i className={styles.theirDot} /> Adversário</span><span>✨ atleta recomendado</span><span>Formações são presets editáveis, não uma verdade universal.</span></div>
        </section>

        <aside className={styles.actionPanel} aria-live="polite">
          {!selectedPlayer ? <div className={styles.emptyAction}><div className={styles.tapIcon}>☝</div><h2>{expectedAction}</h2><p>Toque em um atleta destacado. O sistema já prevê a ação pelo estado do rally.</p></div> : <>
            <div className={styles.selectedHeader}><div className={styles.miniAvatar} style={{ "--player-color": selectedPlayer.color } as CSSProperties}>{selectedPlayer.shirt}</div><div><small>{selectedPlayer.side === "home" ? "Nosso time" : "Adversário"}</small><h2>{selectedPlayer.name}</h2></div><button onClick={() => { setSelectedPlayerId(null); setSelectedAction(null); }}>×</button></div>
            {!selectedAction ? <div className={styles.actionStep}><span className={styles.stepLabel}>Corrigir: o que ele fez?</span><div className={styles.actionGrid}>{Object.keys(RESULTS).map((action) => <button key={action} onClick={() => setSelectedAction(action)}>{action}</button>)}</div></div> : <div className={styles.actionStep}><button className={styles.backAction} onClick={() => setSelectedAction(null)}>← {selectedAction}</button><span className={styles.stepLabel}>{selectedAction === expectedAction ? "Ação prevista · escolha o resultado" : "Ação corrigida · escolha o resultado"}</span><div className={styles.resultGrid}>{RESULTS[selectedAction].map((result) => <button key={result} onClick={() => registerResult(result)}>{result}</button>)}</div></div>}
          </>}
          <div className={styles.history}><div className={styles.historyTitle}><strong>Contatos do rally</strong><span>{history.length}</span></div>{history.length === 0 ? <p>Comece pelo sacador destacado.</p> : history.map((item) => <div className={styles.historyItem} key={item.id}><span style={{ background: item.player.color }}>{item.player.shirt}</span><div><strong>{item.action} · {item.result}</strong><small>{item.player.side === "home" ? "Nosso" : "Adversário"} · {item.player.short}</small></div></div>)}</div>
        </aside>
      </div>

      <footer className={styles.footer}><strong>Agora demonstrado:</strong> saque → reposicionamento → recepção/defesa → levantador automático → ataque → troca de posse, tanto na quadra quanto na praia. Ainda é um protótipo para validar o fluxo com treinadores.</footer>
    </main>
  );
}
