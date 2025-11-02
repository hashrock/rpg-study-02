import { useEffect, useState } from "react";
import type { GameState } from "../types";
import {
  CharacterSpriteComponent,
  EnemySpriteComponent,
} from "../CharacterSprite";

function BattleStatus({
  allies,
  enemies,
}: {
  allies: NonNullable<GameState["battle"]>["allies"];
  enemies: NonNullable<GameState["battle"]>["enemies"];
}) {
  return (
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
          {allies.map((a, i) => (
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
          {enemies.map((e, i) => (
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
  );
}

function BattleLog({ log }: { log: string[] }) {
  return (
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
        {log.slice(-6).map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
    </div>
  );
}

function CommandSelectView({
  currentActor,
  onSelectAttack,
  onSelectSkill,
}: {
  currentActor: NonNullable<GameState["battle"]>["allies"][number];
  onSelectAttack: () => void;
  onSelectSkill: () => void;
}) {
  return (
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
          <button onClick={onSelectAttack}>こうげき</button>
          <button onClick={onSelectSkill}>特技</button>
        </div>
      </div>
    </div>
  );
}

function SkillSelectView({
  currentActor,
  battle,
  onBack,
  onSelectSkill,
}: {
  currentActor: NonNullable<GameState["battle"]>["allies"][number];
  battle: NonNullable<GameState["battle"]>;
  onBack: () => void;
  onSelectSkill: (skillId: string) => void;
}) {
  return (
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
          <button onClick={onBack}>戻る</button>
          {currentActor.skills.map((skill) => {
            const canUse = currentActor.mp >= skill.mpCost;
            return (
              <button
                key={skill.id}
                disabled={!canUse}
                onClick={() => onSelectSkill(skill.id)}
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
  );
}

function TargetSelectView({
  currentActor,
  battle,
  selectedSkillId,
  isHeal,
  onBack,
  onSelectTarget,
}: {
  currentActor: NonNullable<GameState["battle"]>["allies"][number];
  battle: NonNullable<GameState["battle"]>;
  selectedSkillId: string | null;
  isHeal: boolean;
  onBack: () => void;
  onSelectTarget: (targetIndex: number, skillId?: string) => void;
}) {
  const skill = selectedSkillId
    ? currentActor.skills.find((s) => s.id === selectedSkillId)
    : null;

  return (
    <div style={{ marginTop: "1rem", minHeight: 80 }}>
      <div>
        <div>
          {selectedSkillId
            ? `ターゲット選択：${currentActor.name}の${skill?.name}`
            : `ターゲット選択：${currentActor.name}`}
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
          <button onClick={onBack}>戻る</button>
          {isHeal
            ? battle.allies.map((a, i) => (
                <button
                  key={`heal-${i}`}
                  disabled={a.hp <= 0 || a.hp >= a.maxHp}
                  onClick={() =>
                    onSelectTarget(i, selectedSkillId || undefined)
                  }
                >
                  {skill?.name} → {a.name}
                </button>
              ))
            : selectedSkillId
            ? battle.enemies.map((e, i) => (
                <button
                  key={`attack-${i}`}
                  disabled={e.hp <= 0}
                  onClick={() => onSelectTarget(i, selectedSkillId)}
                >
                  {skill?.name} → {e.name}
                </button>
              ))
            : battle.enemies.map((e, i) => (
                <button
                  key={`t-${i}`}
                  disabled={e.hp <= 0}
                  onClick={() => onSelectTarget(i)}
                >
                  こうげき → {e.name}
                </button>
              ))}
        </div>
      </div>
    </div>
  );
}

function EnemyTurnView({ onAdvance }: { onAdvance: () => void }) {
  return (
    <div style={{ marginTop: "1rem", minHeight: 80 }}>
      <div>
        <div>敵の行動待ち…</div>
        <div style={{ marginTop: "0.5rem" }}>
          <button onClick={onAdvance}>進める</button>
        </div>
      </div>
    </div>
  );
}

export function BattleView({
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

  const handleSelectAttack = () => setCommandMode("target");
  const handleSelectSkill = () => setCommandMode("skill");
  const handleBackToSelect = () => {
    setCommandMode("select");
    setSelectedSkillId(null);
  };
  const handleBackToSkill = () => {
    setCommandMode("skill");
    setSelectedSkillId(null);
  };
  const handleSkillSelect = (skillId: string) => {
    setSelectedSkillId(skillId);
    setCommandMode("target");
  };
  const handleTargetSelect = (targetIndex: number, skillId?: string) => {
    if (skillId) {
      onAllyAction("skill", targetIndex, skillId);
    } else {
      onAllyAction("attack", targetIndex);
    }
  };

  if (isAllyTurn && currentActor && commandMode === "select") {
    return (
      <div>
        <h2>バトル</h2>
        <BattleStatus allies={battle.allies} enemies={battle.enemies} />
        <CommandSelectView
          currentActor={currentActor}
          onSelectAttack={handleSelectAttack}
          onSelectSkill={handleSelectSkill}
        />
        <BattleLog log={battle.log} />
      </div>
    );
  }

  if (isAllyTurn && currentActor && commandMode === "skill") {
    return (
      <div>
        <h2>バトル</h2>
        <BattleStatus allies={battle.allies} enemies={battle.enemies} />
        <SkillSelectView
          currentActor={currentActor}
          battle={battle}
          onBack={handleBackToSelect}
          onSelectSkill={handleSkillSelect}
        />
        <BattleLog log={battle.log} />
      </div>
    );
  }

  if (isAllyTurn && currentActor && commandMode === "target") {
    const skill = selectedSkillId
      ? currentActor.skills.find((s) => s.id === selectedSkillId)
      : null;
    const isHeal = skill?.type === "heal";
    return (
      <div>
        <h2>バトル</h2>
        <BattleStatus allies={battle.allies} enemies={battle.enemies} />
        <TargetSelectView
          currentActor={currentActor}
          battle={battle}
          selectedSkillId={selectedSkillId}
          isHeal={isHeal}
          onBack={selectedSkillId ? handleBackToSkill : handleBackToSelect}
          onSelectTarget={handleTargetSelect}
        />
        <BattleLog log={battle.log} />
      </div>
    );
  }

  return (
    <div>
      <h2>バトル</h2>
      <BattleStatus allies={battle.allies} enemies={battle.enemies} />
      {isEnemyTurn && <EnemyTurnView onAdvance={onEnemyAuto} />}
      <BattleLog log={battle.log} />
    </div>
  );
}
