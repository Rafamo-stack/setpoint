"use client";

import { CSSProperties, useMemo, useState } from "react";
import styles from "./prototipo.module.css";

type PlayerId = "setter" | "outside1" | "middle1" | "opposite" | "outside2" | "middle2";
type RotationName = "P1" | "P6" | "P5" | "P4" | "P3" | "P2";

type Player = {
  id: PlayerId;
  short: string;
  role: string;
  shirt: number;
  color: string;
};

const PLAYERS: Record<PlayerId, Player> = {
  setter: { id: "setter", short: "LEV", role: "Levantador", shirt: 7, color: "#7259ff" },
  outside1: { id: "outside1", short: "P1", role: "Ponteiro 1", shirt: 11, color: "#ff725e" },
  middle1: { id: "middle1", short: "C1", role: "Central 1", shirt: 4, color: "#20a878" },
  opposite: { id: "opposite", short: "OPO", role: "Oposto", shirt: 9, color: "#eead2d" },
  outside2: { id: "outside2", short: "P2", role: "Ponteiro 2", shirt: 2, color: "#e25798" },
  middle2: { id: "middle2", short: "C2", role: "Central 2", shirt: 15, color: "#1594bd" },
};

const ROTATIONS: Record<RotationName, Record<number, PlayerId>> = {
  P1: { 1: "setter", 2: "outside1", 3: "middle1", 4: "opposite", 5: "outside2", 6: "middle2" },
  P6: { 1: "outside1", 2: "middle1", 3: "opposite", 4: "outside2", 5: "middle2", 6: "setter" },
  P5: { 1: "middle1", 2: "opposite", 3: "outside2", 4: "middle2", 5: "setter", 6: "outside1" },
  P4: { 1: "opposite", 2: "outside2", 3: "middle2", 4: "setter", 5: "outside1", 6: "middle1" },
  P3: { 1: "outside2", 2: "middle2", 3: "setter", 4: "outside1", 5: "middle1", 6: "opposite" },
  P2: { 1: "middle2", 2: "setter", 3: "outside1", 4: "middle1", 5: "opposite", 6: "outside2" },
};

const ROTATION_ORDER: RotationName[] = ["P1", "P6", "P5", "P4", "P3", "P2"];

const SLOT_POSITION: Record<number, { x: number; y: number }> = {
  4: { x: 25, y: 61 },
  3: { x: 50, y: 59 },
  2: { x: 75, y: 61 },
  5: { x: 28, y: 82 },
  6: { x: 50, y: 84 },
  1: { x: 72, y: 82 },
};

const RESULTS: Record<string, string[]> = {
  Saque: ["Ace", "Em jogo", "Erro"],
  Recepção: ["Perfeita", "Positiva", "Negativa", "Erro"],
  Levantamento: ["Em jogo", "Erro"],
  Ataque: ["Ponto", "Defendido", "Bloqueado", "Erro"],
  Bloqueio: ["Ponto", "Toque", "Sem toque", "Erro"],
  Defesa: ["Perfeita", "Positiva", "Negativa", "Falha"],
};

type HistoryItem = { id: number; player: Player; action: string; result: string };

export default function PrototypePage() {
  const [rotation, setRotation] = useState<RotationName>("P2");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerId | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [ourScore, setOurScore] = useState(12);
  const [theirScore, setTheirScore] = useState(10);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const playersOnCourt = useMemo(
    () => Object.entries(ROTATIONS[rotation]).map(([slot, id]) => ({ slot: Number(slot), player: PLAYERS[id] })),
    [rotation],
  );

  const server = PLAYERS[ROTATIONS[rotation][1]];
  const chosenPlayer = selectedPlayer ? PLAYERS[selectedPlayer] : null;

  function choosePlayer(id: PlayerId) {
    setSelectedPlayer(id);
    setSelectedAction(null);
  }

  function chooseRotation(next: RotationName) {
    setRotation(next);
    setSelectedPlayer(null);
    setSelectedAction(null);
  }

  function registerResult(result: string) {
    if (!chosenPlayer || !selectedAction) return;
    setHistory((current) => [
      { id: Date.now(), player: chosenPlayer, action: selectedAction, result },
      ...current,
    ].slice(0, 4));
    if (result === "Ponto" || result === "Ace") setOurScore((score) => score + 1);
    if (result === "Erro" || result === "Falha") setTheirScore((score) => score + 1);
    setSelectedPlayer(null);
    setSelectedAction(null);
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}><span /> Protótipo inicial</div>
          <h1>Scout visual de vôlei</h1>
          <p>Toque no jogador, escolha a ação e registre o resultado.</p>
        </div>
        <div className={styles.prototypeFlag}>Em construção</div>
      </header>

      <section className={styles.scoreboard} aria-label="Placar demonstrativo">
        <div className={styles.teamScore}>
          <span>Nosso time</span>
          <button aria-label="Diminuir nosso placar" onClick={() => setOurScore((score) => Math.max(0, score - 1))}>−</button>
          <strong>{ourScore}</strong>
          <button aria-label="Aumentar nosso placar" onClick={() => setOurScore((score) => score + 1)}>+</button>
        </div>
        <div className={styles.setBadge}>1º set</div>
        <div className={`${styles.teamScore} ${styles.opponentScore}`}>
          <button aria-label="Diminuir placar adversário" onClick={() => setTheirScore((score) => Math.max(0, score - 1))}>−</button>
          <strong>{theirScore}</strong>
          <button aria-label="Aumentar placar adversário" onClick={() => setTheirScore((score) => score + 1)}>+</button>
          <span>Adversário</span>
        </div>
      </section>

      <section className={styles.rotationBar} aria-label="Escolha do rodízio">
        <div>
          <span className={styles.label}>5x1 padrão</span>
          <strong>Levantador em {rotation}</strong>
        </div>
        <div className={styles.rotationButtons}>
          {ROTATION_ORDER.map((item) => (
            <button
              key={item}
              className={item === rotation ? styles.activeRotation : ""}
              onClick={() => chooseRotation(item)}
              aria-pressed={item === rotation}
            >
              {item}
            </button>
          ))}
        </div>
        <div className={styles.serverInfo}><span>🏐</span><div><small>Sacador</small><strong>{server.role} #{server.shirt}</strong></div></div>
      </section>

      <div className={styles.workspace}>
        <section className={styles.courtPanel} aria-label="Quadra interativa">
          <div className={styles.hint}>Clique em um jogador</div>
          <div className={styles.courtStage}>
            <div className={styles.courtSurface} aria-hidden="true">
              <div className={styles.attackLineTop} />
              <div className={styles.attackLineBottom} />
              <div className={styles.net}><i /><i /><i /><i /><i /></div>
              <span className={`${styles.zoneNumber} ${styles.zone4}`}>4</span>
              <span className={`${styles.zoneNumber} ${styles.zone3}`}>3</span>
              <span className={`${styles.zoneNumber} ${styles.zone2}`}>2</span>
              <span className={`${styles.zoneNumber} ${styles.zone5}`}>5</span>
              <span className={`${styles.zoneNumber} ${styles.zone6}`}>6</span>
              <span className={`${styles.zoneNumber} ${styles.zone1}`}>1</span>
            </div>

            <div className={styles.opponents} aria-hidden="true">
              {[22, 50, 78].map((x) => <span key={`front-${x}`} style={{ left: `${x}%`, top: "31%" }} />)}
              {[28, 50, 72].map((x) => <span key={`back-${x}`} style={{ left: `${x}%`, top: "17%" }} />)}
            </div>

            {playersOnCourt.map(({ slot, player }) => {
              const position = SLOT_POSITION[slot];
              const style = {
                left: `${position.x}%`,
                top: `${position.y}%`,
                "--player-color": player.color,
              } as CSSProperties;
              return (
                <button
                  key={player.id}
                  className={`${styles.player} ${selectedPlayer === player.id ? styles.selectedPlayer : ""} ${slot === 1 ? styles.servingPlayer : ""}`}
                  style={style}
                  onClick={() => choosePlayer(player.id)}
                  aria-label={`${player.role}, camisa ${player.shirt}, posição ${slot}`}
                >
                  <span className={styles.playerHead} />
                  <span className={styles.playerBody}>{player.shirt}</span>
                  <span className={styles.playerLabel}><strong>{player.short}</strong><small>P{slot}</small></span>
                </button>
              );
            })}
          </div>
          <div className={styles.courtLegend}>
            <span><i className={styles.ourDot} /> Nosso time</span>
            <span><i className={styles.theirDot} /> Adversário</span>
            <span>Visual de rodízio — posições táticas virão na próxima etapa</span>
          </div>
        </section>

        <aside className={styles.actionPanel} aria-live="polite">
          {!chosenPlayer ? (
            <div className={styles.emptyAction}>
              <div className={styles.tapIcon}>☝</div>
              <h2>Escolha um atleta</h2>
              <p>As ações aparecem aqui sem precisar decorar códigos.</p>
            </div>
          ) : (
            <>
              <div className={styles.selectedHeader}>
                <div className={styles.miniAvatar} style={{ "--player-color": chosenPlayer.color } as CSSProperties}>{chosenPlayer.shirt}</div>
                <div><small>Atleta selecionado</small><h2>{chosenPlayer.role}</h2></div>
                <button onClick={() => { setSelectedPlayer(null); setSelectedAction(null); }} aria-label="Fechar seleção">×</button>
              </div>

              {!selectedAction ? (
                <div className={styles.actionStep}>
                  <span className={styles.stepLabel}>1. O que ele fez?</span>
                  <div className={styles.actionGrid}>
                    {Object.keys(RESULTS).map((action) => (
                      <button key={action} onClick={() => setSelectedAction(action)}>{action}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.actionStep}>
                  <button className={styles.backAction} onClick={() => setSelectedAction(null)}>← {selectedAction}</button>
                  <span className={styles.stepLabel}>2. Qual foi o resultado?</span>
                  <div className={styles.resultGrid}>
                    {RESULTS[selectedAction].map((result) => (
                      <button key={result} onClick={() => registerResult(result)}>{result}</button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className={styles.history}>
            <div className={styles.historyTitle}><strong>Últimas ações</strong><span>{history.length}</span></div>
            {history.length === 0 ? <p>Nenhuma ação registrada ainda.</p> : history.map((item) => (
              <div className={styles.historyItem} key={item.id}>
                <span style={{ background: item.player.color }}>{item.player.shirt}</span>
                <div><strong>{item.action}</strong><small>{item.player.short} · {item.result}</small></div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <footer className={styles.footer}>
        <strong>O que este protótipo demonstra:</strong> o fluxo visual principal. Formações de recepção, praia, relatórios e salvamento ainda serão construídos e testados com treinadores.
      </footer>
    </main>
  );
}
