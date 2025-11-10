import { useEffect, useState } from "react";
import type { GameState } from "../types";
import {
  CharacterSpriteComponent,
  EnemySpriteComponent,
} from "../CharacterSprite";
import { items, getItemQuantity } from "../data";

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
  onSelectItem,
}: {
  currentActor: NonNullable<GameState["battle"]>["allies"][number];
  inventory?: GameState["inventory"];
  onSelectAttack: () => void;
  onSelectSkill: () => void;
  onSelectItem: () => void;
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
          <button onClick={onSelectItem}>アイテム</button>
        </div>
      </div>
    </div>
  );
}

function SkillSelectView({
  currentActor,
  onBack,
  onSelectSkill,
}: {
  currentActor: NonNullable<GameState["battle"]>["allies"][number];
  battle?: NonNullable<GameState["battle"]>;
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

function ItemSelectView({
  inventory,
  onBack,
  onSelectItem,
}: {
  inventory: GameState["inventory"];
  battle?: NonNullable<GameState["battle"]>;
  onBack: () => void;
  onSelectItem: (itemId: string) => void;
}) {
  const availableItems = items.filter(
    (item) => getItemQuantity(inventory, item.id) > 0
  );

  return (
    <div style={{ marginTop: "1rem", minHeight: 80 }}>
      <div>
        <div>アイテム選択</div>
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
          {availableItems.map((item) => {
            const quantity = getItemQuantity(inventory, item.id);
            return (
              <button
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                title={item.description}
              >
                {item.name} ×{quantity}
              </button>
            );
          })}
        </div>
        {availableItems.length === 0 && (
          <div style={{ marginTop: "0.5rem" }}>
            使用可能なアイテムがありません
          </div>
        )}
      </div>
    </div>
  );
}

function ItemTargetSelectView({
  itemId,
  battle,
  onBack,
  onSelectTarget,
}: {
  itemId: string;
  battle: NonNullable<GameState["battle"]>;
  onBack: () => void;
  onSelectTarget: (targetIndex: number) => void;
}) {
  const item = items.find((i) => i.id === itemId);
  const isHeal =
    item?.effect.type === "heal" || item?.effect.type === "mp_heal";

  return (
    <div style={{ marginTop: "1rem", minHeight: 80 }}>
      <div>
        <div>ターゲット選択：{item?.name}</div>
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
          {isHeal &&
            battle.allies.map((a, i) => (
              <button
                key={`item-heal-${i}`}
                disabled={
                  a.hp <= 0 ||
                  (item?.effect.type === "heal" && a.hp >= a.maxHp) ||
                  (item?.effect.type === "mp_heal" && a.mp >= a.maxMp)
                }
                onClick={() => onSelectTarget(i)}
              >
                {item?.name} → {a.name}
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
  onUseItem,
}: {
  state: GameState;
  onAllyAction: (
    actionType: "attack" | "skill",
    targetIndex?: number,
    skillId?: string
  ) => void;
  onEnemyAuto: () => void;
  onUseItem: (itemId: string, targetIndex?: number) => void;
}) {
  const battle = state.battle!;
  const actor = battle.turnOrder[battle.turnIndex];
  const isAllyTurn = actor.kind === "ally" && battle.allies[actor.index].hp > 0;
  const isEnemyTurn =
    actor.kind === "enemy" && battle.enemies[actor.index].hp > 0;
  const currentActor = isAllyTurn ? battle.allies[actor.index] : null;
  const [commandMode, setCommandMode] = useState<
    "select" | "skill" | "target" | "item" | "itemTarget"
  >("select");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // ターンが変わったらコマンドモードをリセット
  useEffect(() => {
    setCommandMode("select");
    setSelectedSkillId(null);
    setSelectedItemId(null);
  }, [battle.turnIndex]);

  const handleSelectAttack = () => setCommandMode("target");
  const handleSelectSkill = () => setCommandMode("skill");
  const handleSelectItem = () => setCommandMode("item");
  const handleBackToSelect = () => {
    setCommandMode("select");
    setSelectedSkillId(null);
    setSelectedItemId(null);
  };
  const handleBackToSkill = () => {
    setCommandMode("skill");
    setSelectedSkillId(null);
  };
  const handleBackToItem = () => {
    setCommandMode("item");
    setSelectedItemId(null);
  };
  const handleSkillSelect = (skillId: string) => {
    setSelectedSkillId(skillId);
    setCommandMode("target");
  };
  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    setCommandMode("itemTarget");
  };
  const handleTargetSelect = (targetIndex: number, skillId?: string) => {
    if (skillId) {
      onAllyAction("skill", targetIndex, skillId);
    } else {
      onAllyAction("attack", targetIndex);
    }
  };
  const handleItemTargetSelect = (targetIndex: number) => {
    if (selectedItemId) {
      onUseItem(selectedItemId, targetIndex);
    }
  };

  if (isAllyTurn && currentActor && commandMode === "select") {
    return (
      <div>
        <BattleStatus allies={battle.allies} enemies={battle.enemies} />
        <CommandSelectView
          currentActor={currentActor}
          inventory={state.inventory}
          onSelectAttack={handleSelectAttack}
          onSelectSkill={handleSelectSkill}
          onSelectItem={handleSelectItem}
        />
        <BattleLog log={battle.log} />
      </div>
    );
  }

  if (isAllyTurn && currentActor && commandMode === "item") {
    return (
      <div>
        <BattleStatus allies={battle.allies} enemies={battle.enemies} />
        <ItemSelectView
          inventory={state.inventory}
          onBack={handleBackToSelect}
          onSelectItem={handleItemSelect}
        />
        <BattleLog log={battle.log} />
      </div>
    );
  }

  if (
    isAllyTurn &&
    currentActor &&
    commandMode === "itemTarget" &&
    selectedItemId
  ) {
    return (
      <div>
        <BattleStatus allies={battle.allies} enemies={battle.enemies} />
        <ItemTargetSelectView
          itemId={selectedItemId}
          battle={battle}
          onBack={handleBackToItem}
          onSelectTarget={handleItemTargetSelect}
        />
        <BattleLog log={battle.log} />
      </div>
    );
  }

  if (isAllyTurn && currentActor && commandMode === "skill") {
    return (
      <div>
        <BattleStatus allies={battle.allies} enemies={battle.enemies} />
        <SkillSelectView
          currentActor={currentActor}
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
      <BattleStatus allies={battle.allies} enemies={battle.enemies} />
      {isEnemyTurn && <EnemyTurnView onAdvance={onEnemyAuto} />}
      <BattleLog log={battle.log} />
    </div>
  );
}
