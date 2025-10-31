import { useState } from "react";
import type { GameState } from "./types";
import { type Character, type Enemy } from "./types";
import { createCaveBoss, createInitialParty } from "./data";
import {
  advanceTurn,
  applyAttack,
  isBattleOver,
  selectFirstAlive,
  startBattle,
  useSkill,
} from "./logic";
import { TownView } from "./components/TownView";
import { BattleView } from "./components/BattleView";
import { ClearView } from "./components/ClearView";
import { GameOverView } from "./components/GameOverView";

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
      {state.mode === "CLEAR" && <ClearView onReset={resetToTown} />}
      {state.mode === "GAMEOVER" && <GameOverView onReset={resetToTown} />}
    </div>
  );
}
