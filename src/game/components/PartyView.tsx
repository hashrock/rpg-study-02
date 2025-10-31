import type { Party } from "../types";
import { CharacterSpriteComponent } from "../CharacterSprite";

export function PartyView({ party }: { party: Party }) {
  const members = [party.hero, ...party.companions];
  return (
    <div>
      <h3>パーティ</h3>
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {members.map((m) => (
          <div
            key={m.id}
            style={{
              border: "1px solid #555",
              borderRadius: 8,
              padding: "0.5rem 0.75rem",
              minWidth: 120,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CharacterSpriteComponent character={m} size={48} />
            <div style={{ marginTop: "0.5rem" }}>
              {m.name}
              {m.isHero ? "（主人公）" : ""}
            </div>
            <div>
              HP {m.hp}/{m.maxHp}
            </div>
            <div>
              MP {m.mp}/{m.maxMp}
            </div>
            <div>
              攻:{m.atk} 速:{m.spd}
            </div>
          </div>
        ))}
        {Array.from({ length: Math.max(0, 3 - party.companions.length) }).map(
          (_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                border: "1px dashed #444",
                borderRadius: 8,
                padding: "0.5rem 0.75rem",
                minWidth: 120,
                color: "#888",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 140,
              }}
            >
              空き枠
            </div>
          )
        )}
      </div>
    </div>
  );
}

