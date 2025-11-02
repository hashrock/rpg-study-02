import type { DungeonState, EventState, Inventory, Party } from "./types";
import { createDungeonEnemy, createMidBoss, createFinalBoss, WATER_STEPS } from "./data";

export function createDungeon(): DungeonState {
  return {
    step: 0,
    maxStep: 20,
    visitedSteps: [0],
    canCollectItem: false,
  };
}

export function checkDungeonEvent(
  step: number,
  _dungeon: DungeonState,
  inventory: Inventory
): { event: EventState | null; inventory: Inventory } {
  let newInventory = inventory;

  // 10ステップ目：中ボス
  if (step === 10) {
    return {
      event: {
        type: "midboss",
        message:
          "大きな影が現れた...\n「ここから先は通さない。お前たちの力を見せてみろ！」",
        enemy: createMidBoss(),
      },
      inventory: newInventory,
    };
  }

  // 20ステップ目：大ボス
  if (step === 20) {
    return {
      event: {
        type: "finalboss",
        message:
          "最深部に到達した...\n暗闇から響く声：「よくここまで来たな...しかし、これで終わりだ！」",
        enemy: createFinalBoss(),
      },
      inventory: newInventory,
    };
  }

  // 水場：キャンプ可能
  if (WATER_STEPS.includes(step)) {
    return {
      event: {
        type: "water",
        message: "水場を見つけた！ここで休むことができる。",
      },
      inventory: newInventory,
    };
  }

  // 20%の確率で敵と遭遇（ボスステップ以外）
  if (Math.random() < 0.2) {
    return {
      event: {
        type: "encounter",
        message: "敵が現れた！",
        enemy: createDungeonEnemy(),
      },
      inventory: newInventory,
    };
  }

  return {
    event: null,
    inventory: newInventory,
  };
}

export function advanceDungeonStep(
  dungeon: DungeonState,
  direction: "forward" | "backward"
): DungeonState {
  let newStep: number;
  if (direction === "forward" && dungeon.step < dungeon.maxStep) {
    newStep = dungeon.step + 1;
  } else if (direction === "backward" && dungeon.step > 0) {
    newStep = dungeon.step - 1;
  } else {
    return dungeon;
  }

  // ボスステップ（10, 20）や水場ステップでは採集不可
  const isBossStep = newStep === 10 || newStep === 20;
  const isWaterStep = WATER_STEPS.includes(newStep);
  const canCollectItem = !isBossStep && !isWaterStep && Math.random() < 0.2;

  const visitedSteps = dungeon.visitedSteps.includes(newStep)
    ? dungeon.visitedSteps
    : [...dungeon.visitedSteps, newStep];
  
  return {
    ...dungeon,
    step: newStep,
    visitedSteps,
    canCollectItem,
  };
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

