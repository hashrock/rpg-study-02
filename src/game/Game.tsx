import { useState } from "react";
import type { GameState } from "./types";
import { type Character, type Enemy } from "./types";
import { createCaveBoss, createInitialParty, createEmptyInventory, getItemById, removeItemFromInventory, getRandomItem, addItemToInventory } from "./data";
import {
  advanceTurn,
  applyAttack,
  isBattleOver,
  selectFirstAlive,
  startBattle,
  useSkill,
} from "./logic";
import {
  createDungeon,
  advanceDungeonStep,
  checkDungeonEvent,
  campAtWater,
} from "./dungeonLogic";
import { TownView } from "./components/TownView";
import { BattleView } from "./components/BattleView";
import { ClearView } from "./components/ClearView";
import { GameOverView } from "./components/GameOverView";
import { DungeonView } from "./components/DungeonView";
import { EventView } from "./components/EventView";

export default function Game() {
  const [state, setState] = useState<GameState>(() => ({
    location: "TOWN",
    mode: "FIELD",
    party: createInitialParty(),
    inventory: createEmptyInventory(),
  }));

  function resetToTown() {
    setState({ location: "TOWN", mode: "FIELD", party: createInitialParty(), inventory: createEmptyInventory() });
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

  function enterDungeon() {
    setState((prev) => ({
      ...prev,
      location: "DUNGEON",
      mode: "FIELD",
      dungeon: createDungeon(),
    }));
  }

  function handleDungeonMoveForward() {
    setState((prev) => {
      if (!prev.dungeon) return prev;
      const newDungeon = advanceDungeonStep(prev.dungeon, "forward");
      const event = checkDungeonEvent(newDungeon.step, newDungeon, prev.inventory);

      if (event.event) {
        return {
          ...prev,
          dungeon: newDungeon,
          mode: "EVENT",
          event: event.event,
          inventory: event.inventory,
        };
      }

      return {
        ...prev,
        dungeon: newDungeon,
        inventory: event.inventory,
      };
    });
  }

  function handleDungeonMoveBackward() {
    setState((prev) => {
      if (!prev.dungeon) return prev;
      const newDungeon = advanceDungeonStep(prev.dungeon, "backward");
      const event = checkDungeonEvent(newDungeon.step, newDungeon, prev.inventory);

      if (event.event) {
        return {
          ...prev,
          dungeon: newDungeon,
          mode: "EVENT",
          event: event.event,
          inventory: event.inventory,
        };
      }

      return {
        ...prev,
        dungeon: newDungeon,
        inventory: event.inventory,
      };
    });
  }

  function handleEventContinue() {
    setState((prev) => ({
      ...prev,
      mode: "FIELD",
      event: undefined,
    }));
  }

  function handleEventBattle() {
    setState((prev) => {
      if (!prev.event || !prev.event.enemy) return prev;
      return {
        ...prev,
        mode: "BATTLE",
        battle: startBattle(prev.party, [prev.event.enemy]),
        event: undefined,
      };
    });
  }

  function handleCamp() {
    setState((prev) => ({
      ...prev,
      party: campAtWater(prev.party),
      mode: "FIELD",
      event: undefined,
    }));
  }

  function returnToTownFromDungeon() {
    setState((prev) => ({
      ...prev,
      location: "TOWN",
      mode: "FIELD",
      dungeon: undefined,
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
          // ダンジョンの大ボスを倒した場合はクリア
          const isFinalBoss = b.enemies.some((e) => e.id === "finalboss");
          if (isFinalBoss && prev.location === "DUNGEON") {
            return { ...prev, mode: "CLEAR", battle: { ...b } };
          }
          // ダンジョンのバトル終了後はダンジョンに戻る
          if (prev.location === "DUNGEON") {
            return { ...prev, mode: "FIELD", battle: undefined };
          }
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
          // ダンジョンの大ボスを倒した場合はクリア
          const isFinalBoss = b.enemies.some((e) => e.id === "finalboss");
          if (isFinalBoss && prev.location === "DUNGEON") {
            return { ...prev, mode: "CLEAR", battle: { ...b } };
          }
          // ダンジョンのバトル終了後はダンジョンに戻る
          if (prev.location === "DUNGEON") {
            return { ...prev, mode: "FIELD", battle: undefined };
          }
          return { ...prev, mode: "CLEAR", battle: { ...b } };
        } else {
          return { ...prev, mode: "GAMEOVER", battle: { ...b } };
        }
      }
      const next = advanceTurn(b);
      return { ...prev, battle: next };
    });
  }

  function handleUseItem(itemId: string, targetIndex?: number) {
    setState((prev) => {
      const item = getItemById(itemId);
      if (!item) return prev;

      // アイテムの所持数を確認
      const currentQuantity = prev.inventory.items.find(i => i.itemId === itemId)?.quantity || 0;
      if (currentQuantity <= 0) return prev; // アイテムが無い場合は何もしない

      // インベントリからアイテムを削除
      const newInventory = removeItemFromInventory(prev.inventory, itemId, 1);

      // 戦闘中の場合
      if (prev.mode === "BATTLE" && prev.battle) {
        const b = {
          ...prev.battle,
          allies: prev.battle.allies.map((a) => ({ ...a })),
          enemies: prev.battle.enemies.map((e) => ({ ...e })),
        };

        // ターゲットが指定されていない場合、最初の生きている味方を選択
        let actualTargetIndex = targetIndex;
        if (actualTargetIndex == null) {
          const firstAlive = selectFirstAlive(b.allies);
          if (firstAlive == null) return prev;
          actualTargetIndex = firstAlive;
        }

        const target = b.allies[actualTargetIndex];
        if (!target || target.hp <= 0) return prev;

        let message = "";
        if (item.effect.type === "heal") {
          const oldHp = target.hp;
          target.hp = Math.min(target.maxHp, target.hp + item.effect.value);
          const actualHeal = target.hp - oldHp;
          message = `${item.name}を使用！${target.name}のHPが${actualHeal}回復！`;
        } else if (item.effect.type === "mp_heal") {
          const oldMp = target.mp;
          target.mp = Math.min(target.maxMp, target.mp + item.effect.value);
          const actualHeal = target.mp - oldMp;
          message = `${item.name}を使用！${target.name}のMPが${actualHeal}回復！`;
        }

        b.log = [...b.log, message];
        const next = advanceTurn(b);
        return { ...prev, battle: next, inventory: newInventory };
      }

      // 移動中の場合
      if (prev.mode === "FIELD") {
        const party = { ...prev.party };
        let target: Character;
        
        if (targetIndex != null && targetIndex < [party.hero, ...party.companions].length) {
          const members = [party.hero, ...party.companions];
          target = members[targetIndex];
        } else {
          target = party.hero; // デフォルトは主人公
        }

        if (item.effect.type === "heal") {
          target.hp = Math.min(target.maxHp, target.hp + item.effect.value);
        } else if (item.effect.type === "mp_heal") {
          target.mp = Math.min(target.maxMp, target.mp + item.effect.value);
        }

        // パーティを更新
        if (targetIndex === 0 || targetIndex == null) {
          party.hero = target;
        } else {
          party.companions[targetIndex - 1] = target;
        }

        return { ...prev, party, inventory: newInventory };
      }

      return prev;
    });
  }

  function handleCollectItem() {
    setState((prev) => {
      if (!prev.dungeon || !prev.dungeon.canCollectItem) return prev;
      
      const collectedItem = getRandomItem();
      const newInventory = addItemToInventory(prev.inventory, collectedItem.id, 1);
      
      return {
        ...prev,
        dungeon: {
          ...prev.dungeon,
          canCollectItem: false, // 採集後は採集不可にする
        },
        inventory: newInventory,
        collectedItem: {
          itemId: collectedItem.id,
          timestamp: Date.now(),
        },
      };
    });
  }

  function clearCollectedItem() {
    setState((prev) => ({
      ...prev,
      collectedItem: null,
    }));
  }

  return (
    <div>
      <h1>コマンドRPG（街と洞窟とダンジョン）</h1>
      {state.mode === "FIELD" && state.location === "TOWN" && (
        <TownView
          state={state}
          onEnterCave={enterCave}
          onEnterDungeon={enterDungeon}
          onHire={handleHire}
        />
      )}
      {state.mode === "FIELD" && state.location === "DUNGEON" && state.dungeon && (
        <DungeonView
          state={state}
          onMoveForward={handleDungeonMoveForward}
          onMoveBackward={handleDungeonMoveBackward}
          onReturnToTown={returnToTownFromDungeon}
          onUseItem={handleUseItem}
          onCollectItem={handleCollectItem}
          onClearCollectedItem={clearCollectedItem}
        />
      )}
      {state.mode === "EVENT" && state.event && (
        <EventView
          state={state}
          onContinue={handleEventContinue}
          onStartBattle={handleEventBattle}
          onCamp={handleCamp}
        />
      )}
      {state.mode === "BATTLE" && state.battle && (
        <BattleView
          state={state}
          onAllyAction={runAllyAction}
          onEnemyAuto={runEnemyTurn}
          onUseItem={handleUseItem}
        />
      )}
      {state.mode === "CLEAR" && <ClearView onReset={resetToTown} />}
      {state.mode === "GAMEOVER" && <GameOverView onReset={resetToTown} />}
    </div>
  );
}
