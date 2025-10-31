import { useEffect, useMemo, useState } from "react";
import type { GameState } from "./types";
import { type Character, type Enemy, type Party } from "./types";
import { createCaveBoss, createInitialParty, hireCandidates } from "./data";
import {
  advanceTurn,
  applyAttack,
  isBattleOver,
  selectFirstAlive,
  startBattle,
  useSkill,
} from "./logic";
import {
  CharacterSpriteComponent,
  EnemySpriteComponent,
} from "./CharacterSprite";

function PartyView({ party }: { party: Party }) {
  const members: Character[] = [party.hero, ...party.companions];
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

function TownView({
  state,
  onEnterCave,
  onHire,
}: {
  state: GameState;
  onEnterCave: () => void;
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
      <div style={{ marginTop: "1.5rem" }}>
        <button onClick={onEnterCave}>洞窟へ行く</button>
      </div>
    </div>
  );
}

function BattleView({
  state,
  onAllyAction,
  onEnemyAuto,
}: {
  state: GameState;
  onAllyAction: (
    actionType: "attack" | "skill",
    targetIndex?: number,
    skillId?: string
  ) => void;
  onEnemyAuto: () => void;
}) {
  const battle = state.battle!;
  const actor = battle.turnOrder[battle.turnIndex];
  const isAllyTurn = actor.kind === "ally" && battle.allies[actor.index].hp > 0;
  const isEnemyTurn =
    actor.kind === "enemy" && battle.enemies[actor.index].hp > 0;
  const currentActor = isAllyTurn ? battle.allies[actor.index] : null;
  const [commandMode, setCommandMode] = useState<"select" | "skill" | "target">(
    "select"
  );
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  // ターンが変わったらコマンドモードをリセット
  useEffect(() => {
    setCommandMode("select");
    setSelectedSkillId(null);
  }, [battle.turnIndex]);

  if (isAllyTurn && currentActor && commandMode === "select") {
    return (
      <div>
        <h2>バトル</h2>
        <div
          style={{
            display: "flex",
            gap: "3rem",
            justifyContent: "center",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3>味方</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              {battle.allies.map((a, i) => (
                <div
                  key={`a-${i}`}
                  style={{
                    opacity: a.hp > 0 ? 1 : 0.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    border: a.hp > 0 ? "2px solid #4a90e2" : "2px solid #888",
                    borderRadius: 8,
                    padding: "0.75rem",
                  }}
                >
                  <CharacterSpriteComponent character={a} size={64} />
                  <div>{a.name}</div>
                  <div>
                    HP {a.hp}/{a.maxHp}
                  </div>
                  <div>
                    MP {a.mp}/{a.maxMp}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3>敵</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              {battle.enemies.map((e, i) => (
                <div
                  key={`e-${i}`}
                  style={{
                    opacity: e.hp > 0 ? 1 : 0.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    border: e.hp > 0 ? "2px solid #ff4444" : "2px solid #888",
                    borderRadius: 8,
                    padding: "0.75rem",
                  }}
                >
                  <EnemySpriteComponent enemy={e} size={e.isBoss ? 96 : 64} />
                  <div>
                    {e.name}
                    {e.isBoss ? "（ボス）" : ""}
                  </div>
                  <div>
                    HP {e.hp}/{e.maxHp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1rem", minHeight: 80 }}>
          <div>
            <div>行動選択：{currentActor.name}</div>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: "0.5rem",
              }}
            >
              <button onClick={() => setCommandMode("target")}>こうげき</button>
              <button onClick={() => setCommandMode("skill")}>特技</button>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "1rem",
            textAlign: "left",
            maxWidth: 640,
            marginInline: "auto",
          }}
        >
          <h4>ログ</h4>
          <div
            style={{
              border: "1px solid #444",
              padding: "0.5rem",
              borderRadius: 8,
              minHeight: 80,
            }}
          >
            {battle.log.slice(-6).map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isAllyTurn && currentActor && commandMode === "skill") {
    return (
      <div>
        <h2>バトル</h2>
        <div
          style={{
            display: "flex",
            gap: "3rem",
            justifyContent: "center",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3>味方</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              {battle.allies.map((a, i) => (
                <div
                  key={`a-${i}`}
                  style={{
                    opacity: a.hp > 0 ? 1 : 0.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    border: a.hp > 0 ? "2px solid #4a90e2" : "2px solid #888",
                    borderRadius: 8,
                    padding: "0.75rem",
                  }}
                >
                  <CharacterSpriteComponent character={a} size={64} />
                  <div>{a.name}</div>
                  <div>
                    HP {a.hp}/{a.maxHp}
                  </div>
                  <div>
                    MP {a.mp}/{a.maxMp}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3>敵</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              {battle.enemies.map((e, i) => (
                <div
                  key={`e-${i}`}
                  style={{
                    opacity: e.hp > 0 ? 1 : 0.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    border: e.hp > 0 ? "2px solid #ff4444" : "2px solid #888",
                    borderRadius: 8,
                    padding: "0.75rem",
                  }}
                >
                  <EnemySpriteComponent enemy={e} size={e.isBoss ? 96 : 64} />
                  <div>
                    {e.name}
                    {e.isBoss ? "（ボス）" : ""}
                  </div>
                  <div>
                    HP {e.hp}/{e.maxHp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1rem", minHeight: 80 }}>
          <div>
            <div>特技選択：{currentActor.name}</div>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: "0.5rem",
              }}
            >
              <button onClick={() => setCommandMode("select")}>戻る</button>
              {currentActor.skills.map((skill) => {
                const canUse = currentActor.mp >= skill.mpCost;
                return (
                  <button
                    key={skill.id}
                    disabled={!canUse}
                    onClick={() => {
                      setSelectedSkillId(skill.id);
                      setCommandMode("target");
                    }}
                    title={skill.description}
                  >
                    {skill.name} (MP {skill.mpCost})
                  </button>
                );
              })}
            </div>
            {currentActor.skills.length === 0 && (
              <div>使用可能な特技がありません</div>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: "1rem",
            textAlign: "left",
            maxWidth: 640,
            marginInline: "auto",
          }}
        >
          <h4>ログ</h4>
          <div
            style={{
              border: "1px solid #444",
              padding: "0.5rem",
              borderRadius: 8,
              minHeight: 80,
            }}
          >
            {battle.log.slice(-6).map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (
    isAllyTurn &&
    currentActor &&
    commandMode === "target" &&
    selectedSkillId
  ) {
    const skill = currentActor.skills.find((s) => s.id === selectedSkillId);
    const isHeal = skill?.type === "heal";
    return (
      <div>
        <h2>バトル</h2>
        <div
          style={{
            display: "flex",
            gap: "3rem",
            justifyContent: "center",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3>味方</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              {battle.allies.map((a, i) => (
                <div
                  key={`a-${i}`}
                  style={{
                    opacity: a.hp > 0 ? 1 : 0.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    border: a.hp > 0 ? "2px solid #4a90e2" : "2px solid #888",
                    borderRadius: 8,
                    padding: "0.75rem",
                  }}
                >
                  <CharacterSpriteComponent character={a} size={64} />
                  <div>{a.name}</div>
                  <div>
                    HP {a.hp}/{a.maxHp}
                  </div>
                  <div>
                    MP {a.mp}/{a.maxMp}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3>敵</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              {battle.enemies.map((e, i) => (
                <div
                  key={`e-${i}`}
                  style={{
                    opacity: e.hp > 0 ? 1 : 0.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    border: e.hp > 0 ? "2px solid #ff4444" : "2px solid #888",
                    borderRadius: 8,
                    padding: "0.75rem",
                  }}
                >
                  <EnemySpriteComponent enemy={e} size={e.isBoss ? 96 : 64} />
                  <div>
                    {e.name}
                    {e.isBoss ? "（ボス）" : ""}
                  </div>
                  <div>
                    HP {e.hp}/{e.maxHp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1rem", minHeight: 80 }}>
          <div>
            <div>
              ターゲット選択：{currentActor.name}の{skill?.name}
            </div>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: "0.5rem",
              }}
            >
              <button
                onClick={() => {
                  setCommandMode("skill");
                  setSelectedSkillId(null);
                }}
              >
                戻る
              </button>
              {isHeal
                ? battle.allies.map((a, i) => (
                    <button
                      key={`heal-${i}`}
                      disabled={a.hp <= 0 || a.hp >= a.maxHp}
                      onClick={() => onAllyAction("skill", i, selectedSkillId)}
                    >
                      {skill?.name} → {a.name}
                    </button>
                  ))
                : battle.enemies.map((e, i) => (
                    <button
                      key={`attack-${i}`}
                      disabled={e.hp <= 0}
                      onClick={() => onAllyAction("skill", i, selectedSkillId)}
                    >
                      {skill?.name} → {e.name}
                    </button>
                  ))}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "1rem",
            textAlign: "left",
            maxWidth: 640,
            marginInline: "auto",
          }}
        >
          <h4>ログ</h4>
          <div
            style={{
              border: "1px solid #444",
              padding: "0.5rem",
              borderRadius: 8,
              minHeight: 80,
            }}
          >
            {battle.log.slice(-6).map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (
    isAllyTurn &&
    currentActor &&
    commandMode === "target" &&
    !selectedSkillId
  ) {
    return (
      <div>
        <h2>バトル</h2>
        <div
          style={{
            display: "flex",
            gap: "3rem",
            justifyContent: "center",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3>味方</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              {battle.allies.map((a, i) => (
                <div
                  key={`a-${i}`}
                  style={{
                    opacity: a.hp > 0 ? 1 : 0.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    border: a.hp > 0 ? "2px solid #4a90e2" : "2px solid #888",
                    borderRadius: 8,
                    padding: "0.75rem",
                  }}
                >
                  <CharacterSpriteComponent character={a} size={64} />
                  <div>{a.name}</div>
                  <div>
                    HP {a.hp}/{a.maxHp}
                  </div>
                  <div>
                    MP {a.mp}/{a.maxMp}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3>敵</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              {battle.enemies.map((e, i) => (
                <div
                  key={`e-${i}`}
                  style={{
                    opacity: e.hp > 0 ? 1 : 0.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    border: e.hp > 0 ? "2px solid #ff4444" : "2px solid #888",
                    borderRadius: 8,
                    padding: "0.75rem",
                  }}
                >
                  <EnemySpriteComponent enemy={e} size={e.isBoss ? 96 : 64} />
                  <div>
                    {e.name}
                    {e.isBoss ? "（ボス）" : ""}
                  </div>
                  <div>
                    HP {e.hp}/{e.maxHp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1rem", minHeight: 80 }}>
          <div>
            <div>ターゲット選択：{currentActor.name}</div>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: "0.5rem",
              }}
            >
              <button onClick={() => setCommandMode("select")}>戻る</button>
              {battle.enemies.map((e, i) => (
                <button
                  key={`t-${i}`}
                  disabled={e.hp <= 0}
                  onClick={() => onAllyAction("attack", i)}
                >
                  こうげき → {e.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "1rem",
            textAlign: "left",
            maxWidth: 640,
            marginInline: "auto",
          }}
        >
          <h4>ログ</h4>
          <div
            style={{
              border: "1px solid #444",
              padding: "0.5rem",
              borderRadius: 8,
              minHeight: 80,
            }}
          >
            {battle.log.slice(-6).map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>バトル</h2>
      <div
        style={{
          display: "flex",
          gap: "3rem",
          justifyContent: "center",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3>味方</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            {battle.allies.map((a, i) => (
              <div
                key={`a-${i}`}
                style={{
                  opacity: a.hp > 0 ? 1 : 0.5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  border: a.hp > 0 ? "2px solid #4a90e2" : "2px solid #888",
                  borderRadius: 8,
                  padding: "0.75rem",
                }}
              >
                <CharacterSpriteComponent character={a} size={64} />
                <div>{a.name}</div>
                <div>
                  HP {a.hp}/{a.maxHp}
                </div>
                <div>
                  MP {a.mp}/{a.maxMp}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3>敵</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            {battle.enemies.map((e, i) => (
              <div
                key={`e-${i}`}
                style={{
                  opacity: e.hp > 0 ? 1 : 0.5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  border: e.hp > 0 ? "2px solid #ff4444" : "2px solid #888",
                  borderRadius: 8,
                  padding: "0.75rem",
                }}
              >
                <EnemySpriteComponent enemy={e} size={e.isBoss ? 96 : 64} />
                <div>
                  {e.name}
                  {e.isBoss ? "（ボス）" : ""}
                </div>
                <div>
                  HP {e.hp}/{e.maxHp}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "1rem", minHeight: 80 }}>
        {isEnemyTurn && (
          <div>
            <div>敵の行動待ち…</div>
            <div style={{ marginTop: "0.5rem" }}>
              <button onClick={onEnemyAuto}>進める</button>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "1rem",
          textAlign: "left",
          maxWidth: 640,
          marginInline: "auto",
        }}
      >
        <h4>ログ</h4>
        <div
          style={{
            border: "1px solid #444",
            padding: "0.5rem",
            borderRadius: 8,
            minHeight: 80,
          }}
        >
          {battle.log.slice(-6).map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Game() {
  const [state, setState] = useState<GameState>(() => ({
    location: "TOWN",
    mode: "FIELD",
    party: createInitialParty(),
  }));

  function resetToTown() {
    setState({ location: "TOWN", mode: "FIELD", party: createInitialParty() });
  }

  function handleHire(c: Character) {
    setState((prev) => {
      if (prev.party.companions.length >= 3) return prev;
      if (
        [prev.party.hero, ...prev.party.companions].some((m) => m.id === c.id)
      )
        return prev;
      return {
        ...prev,
        party: {
          ...prev.party,
          companions: [...prev.party.companions, { ...c }],
        },
      };
    });
  }

  function enterCave() {
    const boss: Enemy = createCaveBoss();
    setState((prev) => ({
      ...prev,
      location: "CAVE",
      mode: "BATTLE",
      battle: startBattle(prev.party, [boss]),
    }));
  }

  function runEnemyTurn() {
    setState((prev) => {
      if (prev.mode !== "BATTLE" || !prev.battle) return prev;
      const b = {
        ...prev.battle,
        allies: prev.battle.allies.map((a) => ({ ...a })),
        enemies: prev.battle.enemies.map((e) => ({ ...e })),
      };
      const actor = b.turnOrder[b.turnIndex];
      if (actor.kind !== "enemy" || b.enemies[actor.index].hp <= 0) return prev;
      const attacker = b.enemies[actor.index];
      const targetIndex = selectFirstAlive(b.allies);
      if (targetIndex == null) return prev;
      const target = b.allies[targetIndex];
      const dmg = applyAttack(attacker, target);
      b.log = [
        ...b.log,
        `${attacker.name} のこうげき！ ${target.name} に ${dmg} ダメージ！`,
      ];

      const over = isBattleOver(b);
      if (over.over) {
        if (over.winner === "allies") {
          return { ...prev, mode: "CLEAR", battle: { ...b } };
        } else {
          return { ...prev, mode: "GAMEOVER", battle: { ...b } };
        }
      }
      const next = advanceTurn(b);
      return { ...prev, battle: next };
    });
  }

  function runAllyAction(
    actionType: "attack" | "skill",
    targetIndex?: number,
    skillId?: string
  ) {
    setState((prev) => {
      if (prev.mode !== "BATTLE" || !prev.battle) return prev;
      const b = {
        ...prev.battle,
        allies: prev.battle.allies.map((a) => ({
          ...a,
          skills: [...a.skills],
        })),
        enemies: prev.battle.enemies.map((e) => ({
          ...e,
          skills: [...e.skills],
        })),
      };
      const actor = b.turnOrder[b.turnIndex];
      if (actor.kind !== "ally" || b.allies[actor.index].hp <= 0) return prev;
      const attacker = b.allies[actor.index];

      if (actionType === "attack") {
        if (targetIndex == null) return prev;
        const target = b.enemies[targetIndex];
        if (!target || target.hp <= 0) return prev;
        const dmg = applyAttack(attacker, target);
        b.log = [
          ...b.log,
          `${attacker.name} のこうげき！ ${target.name} に ${dmg} ダメージ！`,
        ];
      } else if (actionType === "skill") {
        if (targetIndex == null || !skillId) return prev;
        const skill = attacker.skills.find((s) => s.id === skillId);
        if (!skill) return prev;

        const isHeal = skill.type === "heal";
        const target = isHeal ? b.allies[targetIndex] : b.enemies[targetIndex];
        if (
          !target ||
          (isHeal && target.hp <= 0) ||
          (!isHeal && target.hp <= 0)
        )
          return prev;

        const result = useSkill(attacker, skill, target);
        if (result.success) {
          b.log = [...b.log, result.message];
        } else {
          b.log = [...b.log, result.message];
          // MP不足の場合はターンが進まない
          return { ...prev, battle: b };
        }
      }

      const over = isBattleOver(b);
      if (over.over) {
        if (over.winner === "allies") {
          return { ...prev, mode: "CLEAR", battle: { ...b } };
        } else {
          return { ...prev, mode: "GAMEOVER", battle: { ...b } };
        }
      }
      const next = advanceTurn(b);
      return { ...prev, battle: next };
    });
  }

  return (
    <div>
      <h1>コマンドRPG（街と洞窟）</h1>
      {state.mode === "FIELD" && state.location === "TOWN" && (
        <TownView state={state} onEnterCave={enterCave} onHire={handleHire} />
      )}
      {state.mode === "BATTLE" && state.battle && (
        <BattleView
          state={state}
          onAllyAction={runAllyAction}
          onEnemyAuto={runEnemyTurn}
        />
      )}
      {state.mode === "CLEAR" && (
        <div>
          <h2>クリア！</h2>
          <div>洞窟のボスを倒した！おめでとう！</div>
          <div style={{ marginTop: "1rem" }}>
            <button onClick={resetToTown}>最初から</button>
          </div>
        </div>
      )}
      {state.mode === "GAMEOVER" && (
        <div>
          <h2>ゲームオーバー</h2>
          <div>力尽きてしまった…</div>
          <div style={{ marginTop: "1rem" }}>
            <button onClick={resetToTown}>最初から</button>
          </div>
        </div>
      )}
    </div>
  );
}
