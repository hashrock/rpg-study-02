import { useMemo } from "react";
import type { GameState } from "../types";
import { type Character } from "../types";
import { hireCandidates } from "../data";
import { PartyView } from "./PartyView";
import { CharacterSpriteComponent } from "../CharacterSprite";

export function TownView({
  state,
  onEnterCave,
  onEnterDungeon,
  onHire,
}: {
  state: GameState;
  onEnterCave: () => void;
  onEnterDungeon: () => void;
  onHire: (c: Character) => void;
}) {
  const candidates = useMemo(() => hireCandidates, []);
  const hasRoom = state.party.companions.length < 3;

  return (
    <div>
      <h2>街</h2>
      <PartyView party={state.party} />
      <div style={{ marginTop: "1rem" }}>
        <h3>酒場（仲間を雇う）</h3>
        {!hasRoom && (
          <div style={{ color: "#aaa" }}>
            仲間はこれ以上雇えません（最大3人）
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {candidates.map((c) => {
            const alreadyIn = [
              state.party.hero,
              ...state.party.companions,
            ].some((m) => m.id === c.id);
            return (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <CharacterSpriteComponent character={c} size={56} />
                <button
                  disabled={!hasRoom || alreadyIn}
                  onClick={() => onHire(c)}
                >
                  {c.name} を雇う
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button onClick={onEnterCave}>洞窟へ行く</button>
        <button onClick={onEnterDungeon}>ダンジョンへ行く</button>
      </div>
    </div>
  );
}

