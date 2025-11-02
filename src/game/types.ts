export type Skill = {
  id: string;
  name: string;
  mpCost: number;
  damage: number; // 0なら回復系など
  description: string;
  type: "attack" | "heal" | "buff";
};

export type Character = {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  maxMp: number;
  mp: number;
  atk: number;
  spd: number;
  skills: Skill[];
  isHero?: boolean;
};

export type Enemy = {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  maxMp: number;
  mp: number;
  atk: number;
  spd: number;
  skills: Skill[];
  isBoss?: boolean;
};

export type Location = "TOWN" | "CAVE" | "DUNGEON";
export type Mode = "FIELD" | "BATTLE" | "CLEAR" | "GAMEOVER" | "EVENT";
export type DungeonEventType =
  | "water"
  | "midboss"
  | "finalboss"
  | "encounter"
  | "none";

export type Party = {
  hero: Character;
  companions: Character[]; // up to 3 companions
};

export type BattleActor = {
  kind: "ally" | "enemy";
  index: number; // index within allies or enemies array
};

export type BattleAction = {
  type: "attack" | "skill";
  skillId?: string;
  targetIndex: number;
};

export type BattleState = {
  allies: Character[];
  enemies: Enemy[];
  turnOrder: BattleActor[];
  turnIndex: number;
  log: string[];
  pendingAction?: BattleAction;
};

export type DungeonState = {
  step: number; // 0-20
  maxStep: number;
  visitedSteps: number[]; // 訪れたステップのリスト
  canCollectItem: boolean; // このマスでアイテム採集が可能かどうか
};

export type EventState = {
  type: DungeonEventType;
  message: string;
  enemy?: Enemy;
};

export type Item = {
  id: string;
  name: string;
  description: string;
  effect: {
    type: "heal" | "mp_heal";
    value: number;
  };
};

export type Inventory = {
  items: { itemId: string; quantity: number }[];
};

export type GameState = {
  location: Location;
  mode: Mode;
  party: Party;
  inventory: Inventory;
  battle?: BattleState;
  dungeon?: DungeonState;
  event?: EventState;
  collectedItem?: { itemId: string; timestamp: number } | null;
};
