import type { Meta, StoryObj } from '@storybook/react';
import { BattleView } from './BattleView';
import type { GameState, Character, Enemy } from '../types';
import { createHero } from '../data';

const meta = {
  title: 'Game/BattleView',
  component: BattleView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BattleView>;

export default meta;
type Story = StoryObj<typeof meta>;

// ヘルパー関数：基本的な味方キャラクターを作成
function createWarrior(): Character {
  return {
    id: 'warrior',
    name: '戦士',
    maxHp: 36,
    hp: 36,
    maxMp: 20,
    mp: 20,
    atk: 9,
    spd: 4,
    skills: [
      { id: 'warrior-smash', name: 'パワースマッシュ', mpCost: 6, damage: 18, description: '重い一撃', type: 'attack' },
    ],
  };
}

function createMage(): Character {
  return {
    id: 'mage',
    name: '魔法使い',
    maxHp: 22,
    hp: 22,
    maxMp: 40,
    mp: 40,
    atk: 11,
    spd: 5,
    skills: [
      { id: 'mage-fire', name: 'ファイア', mpCost: 6, damage: 22, description: '火の魔法', type: 'attack' },
      { id: 'mage-heal', name: 'ヒール', mpCost: 10, damage: -30, description: '強力な回復魔法', type: 'heal' },
    ],
  };
}

// ヘルパー関数：敵キャラクターを作成
function createGoblin(): Enemy {
  return {
    id: 'goblin',
    name: 'ゴブリン',
    maxHp: 25,
    hp: 25,
    maxMp: 0,
    mp: 0,
    atk: 5,
    spd: 6,
    skills: [
      { id: 'goblin-attack', name: '噛みつき', mpCost: 0, damage: 5, description: '噛みつく', type: 'attack' },
    ],
  };
}

function createBoss(): Enemy {
  return {
    id: 'cave-boss',
    name: '洞窟の主',
    maxHp: 80,
    hp: 80,
    maxMp: 30,
    mp: 30,
    atk: 10,
    spd: 5,
    skills: [
      { id: 'boss-roar', name: '雄叫び', mpCost: 8, damage: 18, description: '強力な咆哮', type: 'attack' },
    ],
    isBoss: true,
  };
}

// 基本的なGameStateのモック
function createMockGameState(
  allies: Character[],
  enemies: Enemy[],
  turnIndex: number = 0,
  log: string[] = []
): GameState {
  const turnOrder = [
    ...allies.map((_, i) => ({ kind: 'ally' as const, index: i })),
    ...enemies.map((_, i) => ({ kind: 'enemy' as const, index: i })),
  ].sort(() => Math.random() - 0.5);

  return {
    location: 'CAVE',
    mode: 'BATTLE',
    party: {
      hero: allies[0],
      companions: allies.slice(1),
    },
    inventory: {
      items: [
        { itemId: 'potion', quantity: 3 },
        { itemId: 'mp_potion', quantity: 2 },
      ],
    },
    battle: {
      allies,
      enemies,
      turnOrder,
      turnIndex,
      log,
    },
  };
}

// ストーリー：コマンド選択画面（味方のターン）
export const AllyTurnCommandSelect: Story = {
  args: {
    state: createMockGameState([createHero(), createWarrior()], [createGoblin()]),
    onAllyAction: (actionType, targetIndex, skillId) => {
      console.log('Ally action:', { actionType, targetIndex, skillId });
    },
    onEnemyAuto: () => {
      console.log('Enemy auto action');
    },
    onUseItem: (itemId, targetIndex) => {
      console.log('Use item:', { itemId, targetIndex });
    },
  },
};

// ストーリー：敵のターン
export const EnemyTurn: Story = {
  args: {
    state: (() => {
      const gameState = createMockGameState([createHero()], [createGoblin()]);
      // 敵のターンに設定
      if (gameState.battle) {
        gameState.battle.turnOrder = [
          { kind: 'enemy', index: 0 },
          { kind: 'ally', index: 0 },
        ];
        gameState.battle.turnIndex = 0;
      }
      return gameState;
    })(),
    onAllyAction: (actionType, targetIndex, skillId) => {
      console.log('Ally action:', { actionType, targetIndex, skillId });
    },
    onEnemyAuto: () => {
      console.log('Enemy auto action');
    },
    onUseItem: (itemId, targetIndex) => {
      console.log('Use item:', { itemId, targetIndex });
    },
  },
};

// ストーリー：複数の敵との戦闘
export const MultipleEnemies: Story = {
  args: {
    state: createMockGameState(
      [createHero(), createWarrior(), createMage()],
      [createGoblin(), createGoblin()]
    ),
    onAllyAction: (actionType, targetIndex, skillId) => {
      console.log('Ally action:', { actionType, targetIndex, skillId });
    },
    onEnemyAuto: () => {
      console.log('Enemy auto action');
    },
    onUseItem: (itemId, targetIndex) => {
      console.log('Use item:', { itemId, targetIndex });
    },
  },
};

// ストーリー：ボス戦
export const BossBattle: Story = {
  args: {
    state: createMockGameState(
      [createHero(), createWarrior(), createMage()],
      [createBoss()],
      0,
      ['戦闘開始！', '洞窟の主が現れた！']
    ),
    onAllyAction: (actionType, targetIndex, skillId) => {
      console.log('Ally action:', { actionType, targetIndex, skillId });
    },
    onEnemyAuto: () => {
      console.log('Enemy auto action');
    },
    onUseItem: (itemId, targetIndex) => {
      console.log('Use item:', { itemId, targetIndex });
    },
  },
};

// ストーリー：ダメージを受けた状態
export const DamagedParty: Story = {
  args: {
    state: (() => {
      const hero = createHero();
      const warrior = createWarrior();
      const mage = createMage();

      // HPとMPを減らす
      hero.hp = 15;
      hero.mp = 10;
      warrior.hp = 20;
      warrior.mp = 8;
      mage.hp = 8;
      mage.mp = 25;

      return createMockGameState(
        [hero, warrior, mage],
        [createGoblin(), createGoblin()],
        0,
        ['戦闘が激化している！', '勇者が10のダメージを受けた！', '戦士が8のダメージを受けた！']
      );
    })(),
    onAllyAction: (actionType, targetIndex, skillId) => {
      console.log('Ally action:', { actionType, targetIndex, skillId });
    },
    onEnemyAuto: () => {
      console.log('Enemy auto action');
    },
    onUseItem: (itemId, targetIndex) => {
      console.log('Use item:', { itemId, targetIndex });
    },
  },
};

// ストーリー：味方が倒れた状態
export const AllyDefeated: Story = {
  args: {
    state: (() => {
      const hero = createHero();
      const warrior = createWarrior();
      const mage = createMage();

      // 戦士を倒す
      warrior.hp = 0;

      return createMockGameState(
        [hero, warrior, mage],
        [createBoss()],
        0,
        ['戦士が倒れた！']
      );
    })(),
    onAllyAction: (actionType, targetIndex, skillId) => {
      console.log('Ally action:', { actionType, targetIndex, skillId });
    },
    onEnemyAuto: () => {
      console.log('Enemy auto action');
    },
    onUseItem: (itemId, targetIndex) => {
      console.log('Use item:', { itemId, targetIndex });
    },
  },
};
