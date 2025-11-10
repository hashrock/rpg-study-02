import type { Meta, StoryObj } from '@storybook/react-vite';
import { DungeonView } from './DungeonView';
import type { GameState, Character } from '../types';
import { createHero } from '../data';

const meta = {
  title: 'Game/DungeonView',
  component: DungeonView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DungeonView>;

export default meta;
type Story = StoryObj<typeof meta>;

// ヘルパー関数：基本的なGameStateのモック
function createMockDungeonState(
  step: number = 0,
  maxStep: number = 20,
  visitedSteps: number[] = [],
  canCollectItem: boolean = false,
  heroHp?: number,
  heroMp?: number,
  companions: Character[] = [],
  inventoryItems: { itemId: string; quantity: number }[] = [],
  collectedItem?: { itemId: string; timestamp: number } | null
): GameState {
  const hero = createHero();
  if (heroHp !== undefined) hero.hp = heroHp;
  if (heroMp !== undefined) hero.mp = heroMp;

  return {
    location: 'DUNGEON',
    mode: 'FIELD',
    party: {
      hero,
      companions,
    },
    inventory: {
      items: inventoryItems,
    },
    dungeon: {
      step,
      maxStep,
      visitedSteps,
      canCollectItem,
    },
    collectedItem,
  };
}

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

// ストーリー：ダンジョンの開始地点
export const DungeonStart: Story = {
  args: {
    state: createMockDungeonState(0, 20, [0]),
    onMoveForward: () => {
      console.log('Move forward');
    },
    onMoveBackward: () => {
      console.log('Move backward');
    },
    onReturnToTown: () => {
      console.log('Return to town');
    },
    onUseItem: (itemId: string, targetIndex?: number) => {
      console.log('Use item:', { itemId, targetIndex });
    },
    onCollectItem: () => {
      console.log('Collect item');
    },
    onClearCollectedItem: () => {
      console.log('Clear collected item');
    },
  },
};

// ストーリー：ダンジョンの途中
export const DungeonMidway: Story = {
  args: {
    state: createMockDungeonState(
      8,
      20,
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      false,
      undefined,
      undefined,
      [createWarrior(), createMage()],
      [
        { itemId: 'potion', quantity: 3 },
        { itemId: 'herb', quantity: 5 },
      ]
    ),
    onMoveForward: () => {
      console.log('Move forward');
    },
    onMoveBackward: () => {
      console.log('Move backward');
    },
    onReturnToTown: () => {
      console.log('Return to town');
    },
    onUseItem: (itemId: string, targetIndex?: number) => {
      console.log('Use item:', { itemId, targetIndex });
    },
    onCollectItem: () => {
      console.log('Collect item');
    },
    onClearCollectedItem: () => {
      console.log('Clear collected item');
    },
  },
};

// ストーリー：水場のステップ
export const WaterStep: Story = {
  args: {
    state: createMockDungeonState(
      5,
      20,
      [0, 1, 2, 3, 4, 5],
      false,
      undefined,
      undefined,
      [createWarrior()],
      [{ itemId: 'potion', quantity: 2 }]
    ),
    onMoveForward: () => {
      console.log('Move forward');
    },
    onMoveBackward: () => {
      console.log('Move backward');
    },
    onReturnToTown: () => {
      console.log('Return to town');
    },
    onUseItem: (itemId: string, targetIndex?: number) => {
      console.log('Use item:', { itemId, targetIndex });
    },
    onCollectItem: () => {
      console.log('Collect item');
    },
    onClearCollectedItem: () => {
      console.log('Clear collected item');
    },
  },
};

// ストーリー：中ボスエリア
export const MidBossArea: Story = {
  args: {
    state: createMockDungeonState(
      10,
      20,
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      false,
      undefined,
      undefined,
      [createWarrior(), createMage()],
      [
        { itemId: 'potion', quantity: 5 },
        { itemId: 'high_potion', quantity: 2 },
        { itemId: 'mp_potion', quantity: 3 },
      ]
    ),
    onMoveForward: () => {
      console.log('Move forward');
    },
    onMoveBackward: () => {
      console.log('Move backward');
    },
    onReturnToTown: () => {
      console.log('Return to town');
    },
    onUseItem: (itemId: string, targetIndex?: number) => {
      console.log('Use item:', { itemId, targetIndex });
    },
    onCollectItem: () => {
      console.log('Collect item');
    },
    onClearCollectedItem: () => {
      console.log('Clear collected item');
    },
  },
};

// ストーリー：大ボスエリア
export const FinalBossArea: Story = {
  args: {
    state: createMockDungeonState(
      20,
      20,
      Array.from({ length: 21 }, (_, i) => i),
      false,
      undefined,
      undefined,
      [createWarrior(), createMage()],
      [
        { itemId: 'potion', quantity: 8 },
        { itemId: 'high_potion', quantity: 4 },
        { itemId: 'mp_potion', quantity: 5 },
        { itemId: 'herb', quantity: 10 },
      ]
    ),
    onMoveForward: () => {
      console.log('Move forward');
    },
    onMoveBackward: () => {
      console.log('Move backward');
    },
    onReturnToTown: () => {
      console.log('Return to town');
    },
    onUseItem: (itemId: string, targetIndex?: number) => {
      console.log('Use item:', { itemId, targetIndex });
    },
    onCollectItem: () => {
      console.log('Collect item');
    },
    onClearCollectedItem: () => {
      console.log('Clear collected item');
    },
  },
};

// ストーリー：アイテム採集可能な状態
export const CanCollectItem: Story = {
  args: {
    state: createMockDungeonState(
      7,
      20,
      [0, 1, 2, 3, 4, 5, 6, 7],
      true,
      undefined,
      undefined,
      [createWarrior()],
      [{ itemId: 'potion', quantity: 1 }]
    ),
    onMoveForward: () => {
      console.log('Move forward');
    },
    onMoveBackward: () => {
      console.log('Move backward');
    },
    onReturnToTown: () => {
      console.log('Return to town');
    },
    onUseItem: (itemId: string, targetIndex?: number) => {
      console.log('Use item:', { itemId, targetIndex });
    },
    onCollectItem: () => {
      console.log('Collect item');
    },
    onClearCollectedItem: () => {
      console.log('Clear collected item');
    },
  },
};

// ストーリー：アイテム採集後のポップアップ表示
export const CollectedItemPopup: Story = {
  args: {
    state: createMockDungeonState(
      7,
      20,
      [0, 1, 2, 3, 4, 5, 6, 7],
      false,
      undefined,
      undefined,
      [createWarrior()],
      [
        { itemId: 'potion', quantity: 1 },
        { itemId: 'herb', quantity: 1 },
      ],
      { itemId: 'herb', timestamp: Date.now() }
    ),
    onMoveForward: () => {
      console.log('Move forward');
    },
    onMoveBackward: () => {
      console.log('Move backward');
    },
    onReturnToTown: () => {
      console.log('Return to town');
    },
    onUseItem: (itemId: string, targetIndex?: number) => {
      console.log('Use item:', { itemId, targetIndex });
    },
    onCollectItem: () => {
      console.log('Collect item');
    },
    onClearCollectedItem: () => {
      console.log('Clear collected item');
    },
  },
};

// ストーリー：パーティがダメージを受けている状態
export const DamagedParty: Story = {
  args: {
    state: (() => {
      const warrior = createWarrior();
      const mage = createMage();
      warrior.hp = 18;
      warrior.mp = 8;
      mage.hp = 10;
      mage.mp = 25;

      return createMockDungeonState(
        12,
        20,
        Array.from({ length: 13 }, (_, i) => i),
        false,
        25,
        15,
        [warrior, mage],
        [
          { itemId: 'potion', quantity: 3 },
          { itemId: 'mp_potion', quantity: 2 },
        ]
      );
    })(),
    onMoveForward: () => {
      console.log('Move forward');
    },
    onMoveBackward: () => {
      console.log('Move backward');
    },
    onReturnToTown: () => {
      console.log('Return to town');
    },
    onUseItem: (itemId: string, targetIndex?: number) => {
      console.log('Use item:', { itemId, targetIndex });
    },
    onCollectItem: () => {
      console.log('Collect item');
    },
    onClearCollectedItem: () => {
      console.log('Clear collected item');
    },
  },
};

// ストーリー：インベントリが空
export const EmptyInventory: Story = {
  args: {
    state: createMockDungeonState(3, 20, [0, 1, 2, 3], false),
    onMoveForward: () => {
      console.log('Move forward');
    },
    onMoveBackward: () => {
      console.log('Move backward');
    },
    onReturnToTown: () => {
      console.log('Return to town');
    },
    onUseItem: (itemId: string, targetIndex?: number) => {
      console.log('Use item:', { itemId, targetIndex });
    },
    onCollectItem: () => {
      console.log('Collect item');
    },
    onClearCollectedItem: () => {
      console.log('Clear collected item');
    },
  },
};

// ストーリー：水場でアイテム採集可能
export const WaterStepWithItem: Story = {
  args: {
    state: createMockDungeonState(
      12,
      20,
      Array.from({ length: 13 }, (_, i) => i),
      true,
      undefined,
      undefined,
      [createWarrior(), createMage()],
      [
        { itemId: 'potion', quantity: 4 },
        { itemId: 'herb', quantity: 6 },
        { itemId: 'mp_potion', quantity: 2 },
      ]
    ),
    onMoveForward: () => {
      console.log('Move forward');
    },
    onMoveBackward: () => {
      console.log('Move backward');
    },
    onReturnToTown: () => {
      console.log('Return to town');
    },
    onUseItem: (itemId: string, targetIndex?: number) => {
      console.log('Use item:', { itemId, targetIndex });
    },
    onCollectItem: () => {
      console.log('Collect item');
    },
    onClearCollectedItem: () => {
      console.log('Clear collected item');
    },
  },
};
