export type Character = {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  atk: number;
  spd: number;
  isHero?: boolean;
};

export type Enemy = {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  atk: number;
  spd: number;
  isBoss?: boolean;
};

export type Location = "TOWN" | "CAVE";
export type Mode = "FIELD" | "BATTLE" | "CLEAR" | "GAMEOVER";

export type Party = {
  hero: Character;
  companions: Character[]; // up to 3 companions
};

export type BattleActor = {
  kind: "ally" | "enemy";
  index: number; // index within allies or enemies array
};

export type BattleState = {
  allies: Character[];
  enemies: Enemy[];
  turnOrder: BattleActor[];
  turnIndex: number;
  log: string[];
};

export type GameState = {
  location: Location;
  mode: Mode;
  party: Party;
  battle?: BattleState;
};
