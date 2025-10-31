import type { DungeonState, EventState, Party } from "./types";
import { createDungeonEnemy, createMidBoss, createFinalBoss, WATER_STEPS } from "./data";
import { startBattle } from "./logic";

export function createDungeon(): DungeonState {
  return {
    step: 0,
    maxStep: 20,
    visitedSteps: [0],
  };
}

export function checkDungeonEvent(
  step: number,
  dungeon: DungeonState
): EventState | null {
  // 10ステップ目：中ボス
  if (step === 10) {
    return {
      type: "midboss",
      message:
        "大きな影が現れた...\n「ここから先は通さない。お前たちの力を見せてみろ！」",
      enemy: createMidBoss(),
    };
  }

  // 20ステップ目：大ボス
  if (step === 20) {
    return {
      type: "finalboss",
      message:
        "最深部に到達した...\n暗闇から響く声：「よくここまで来たな...しかし、これで終わりだ！」",
      enemy: createFinalBoss(),
    };
  }

  // 水場：キャンプ可能
  if (WATER_STEPS.includes(step)) {
    return {
      type: "water",
      message: "水場を見つけた！ここで休むことができる。",
    };
  }

  // 20%の確率で敵と遭遇（ボスステップ以外）
  if (Math.random() < 0.2) {
    return {
      type: "encounter",
      message: "敵が現れた！",
      enemy: createDungeonEnemy(),
    };
  }

  return null;
}

export function advanceDungeonStep(
  dungeon: DungeonState,
  direction: "forward" | "backward"
): DungeonState {
  if (direction === "forward" && dungeon.step < dungeon.maxStep) {
    const newStep = dungeon.step + 1;
    const visitedSteps = dungeon.visitedSteps.includes(newStep)
      ? dungeon.visitedSteps
      : [...dungeon.visitedSteps, newStep];
    return {
      ...dungeon,
      step: newStep,
      visitedSteps,
    };
  } else if (direction === "backward" && dungeon.step > 0) {
    const newStep = dungeon.step - 1;
    const visitedSteps = dungeon.visitedSteps.includes(newStep)
      ? dungeon.visitedSteps
      : [...dungeon.visitedSteps, newStep];
    return {
      ...dungeon,
      step: newStep,
      visitedSteps,
    };
  }
  return dungeon;
}

export function canMoveForward(dungeon: DungeonState): boolean {
  return dungeon.step < dungeon.maxStep;
}

export function canMoveBackward(dungeon: DungeonState): boolean {
  return dungeon.step > 0;
}

export function campAtWater(party: Party): Party {
  return {
    ...party,
    hero: {
      ...party.hero,
      hp: party.hero.maxHp,
      mp: party.hero.maxMp,
    },
    companions: party.companions.map((c) => ({
      ...c,
      hp: c.maxHp,
      mp: c.maxMp,
    })),
  };
}

