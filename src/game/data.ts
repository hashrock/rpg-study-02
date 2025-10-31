import type { Character, Enemy, Party, Skill } from './types'

// 共通スキル定義
const heroSkills: Skill[] = [
  { id: 'hero-strike', name: '勇者の一撃', mpCost: 5, damage: 15, description: '強力な一撃を放つ', type: 'attack' },
  { id: 'hero-heal', name: 'ヒール', mpCost: 8, damage: -20, description: 'HPを回復する', type: 'heal' },
]

const warriorSkills: Skill[] = [
  { id: 'warrior-smash', name: 'パワースマッシュ', mpCost: 6, damage: 18, description: '重い一撃', type: 'attack' },
  { id: 'warrior-guard', name: '防御の構え', mpCost: 4, damage: 0, description: '防御力を上げる（未実装）', type: 'buff' },
]

const archerSkills: Skill[] = [
  { id: 'archer-pierce', name: '貫通の矢', mpCost: 5, damage: 12, description: '複数敵を貫く（現在は単体）', type: 'attack' },
  { id: 'archer-aim', name: '精密射撃', mpCost: 7, damage: 16, description: '必中の一撃', type: 'attack' },
]

const monkSkills: Skill[] = [
  { id: 'monk-combo', name: '連撃', mpCost: 6, damage: 14, description: '連続攻撃', type: 'attack' },
  { id: 'monk-chi', name: '気功波', mpCost: 8, damage: 20, description: '気のエネルギーを放つ', type: 'attack' },
]

const mageSkills: Skill[] = [
  { id: 'mage-fire', name: 'ファイア', mpCost: 6, damage: 22, description: '火の魔法', type: 'attack' },
  { id: 'mage-thunder', name: 'サンダー', mpCost: 8, damage: 28, description: '雷の魔法', type: 'attack' },
  { id: 'mage-heal', name: 'ヒール', mpCost: 10, damage: -30, description: '強力な回復魔法', type: 'heal' },
]

export function createHero(): Character {
  return {
    id: 'hero',
    name: '勇者',
    maxHp: 40,
    hp: 40,
    maxMp: 30,
    mp: 30,
    atk: 8,
    spd: 6,
    skills: heroSkills,
    isHero: true,
  }
}

export const hireCandidates: Character[] = [
  { id: 'warrior', name: '戦士', maxHp: 36, hp: 36, maxMp: 20, mp: 20, atk: 9, spd: 4, skills: warriorSkills },
  { id: 'archer', name: '狩人', maxHp: 28, hp: 28, maxMp: 25, mp: 25, atk: 7, spd: 8, skills: archerSkills },
  { id: 'monk', name: '武僧', maxHp: 30, hp: 30, maxMp: 25, mp: 25, atk: 8, spd: 7, skills: monkSkills },
  { id: 'mage', name: '魔法使い', maxHp: 22, hp: 22, maxMp: 40, mp: 40, atk: 11, spd: 5, skills: mageSkills },
]

export function createInitialParty(): Party {
  return {
    hero: createHero(),
    companions: [],
  }
}

const bossSkills: Skill[] = [
  { id: 'boss-roar', name: '雄叫び', mpCost: 8, damage: 18, description: '強力な咆哮', type: 'attack' },
  { id: 'boss-charge', name: '突進', mpCost: 10, damage: 25, description: '体当たり攻撃', type: 'attack' },
]

export function createCaveBoss(): Enemy {
  return {
    id: 'cave-boss',
    name: '洞窟の主',
    maxHp: 80,
    hp: 80,
    maxMp: 30,
    mp: 30,
    atk: 10,
    spd: 5,
    skills: bossSkills,
    isBoss: true,
  }
}

// ダンジョン用の敵
const goblinSkills: Skill[] = [
  { id: 'goblin-attack', name: '噛みつき', mpCost: 0, damage: 5, description: '噛みつく', type: 'attack' },
]

const skeletonSkills: Skill[] = [
  { id: 'skeleton-slash', name: '骨切り', mpCost: 0, damage: 6, description: '骨の刃で切りつける', type: 'attack' },
]

const orcSkills: Skill[] = [
  { id: 'orc-smash', name: '殴りつけ', mpCost: 0, damage: 7, description: '力強い攻撃', type: 'attack' },
]

export function createDungeonEnemy(): Enemy {
  const types = [
    { id: 'goblin', name: 'ゴブリン', maxHp: 25, hp: 25, maxMp: 0, mp: 0, atk: 5, spd: 6, skills: goblinSkills },
    { id: 'skeleton', name: 'スケルトン', maxHp: 30, hp: 30, maxMp: 0, mp: 0, atk: 6, spd: 5, skills: skeletonSkills },
    { id: 'orc', name: 'オーク', maxHp: 35, hp: 35, maxMp: 0, mp: 0, atk: 7, spd: 4, skills: orcSkills },
  ]
  const enemy = types[Math.floor(Math.random() * types.length)]
  return { ...enemy }
}

// 中ボス
const midBossSkills: Skill[] = [
  { id: 'midboss-attack', name: '連撃', mpCost: 5, damage: 12, description: '連続攻撃', type: 'attack' },
  { id: 'midboss-roar', name: '威嚇', mpCost: 8, damage: 15, description: '強い攻撃', type: 'attack' },
]

export function createMidBoss(): Enemy {
  return {
    id: 'midboss',
    name: '守護者',
    maxHp: 60,
    hp: 60,
    maxMp: 25,
    mp: 25,
    atk: 9,
    spd: 6,
    skills: midBossSkills,
    isBoss: true,
  }
}

// 大ボス
const finalBossSkills: Skill[] = [
  { id: 'finalboss-fire', name: '地獄の業火', mpCost: 10, damage: 20, description: '強力な火の攻撃', type: 'attack' },
  { id: 'finalboss-thunder', name: '雷鳴', mpCost: 12, damage: 25, description: '雷の攻撃', type: 'attack' },
  { id: 'finalboss-heal', name: '再生', mpCost: 15, damage: -30, description: 'HPを回復', type: 'heal' },
]

export function createFinalBoss(): Enemy {
  return {
    id: 'finalboss',
    name: 'ダンジョンの主',
    maxHp: 120,
    hp: 120,
    maxMp: 50,
    mp: 50,
    atk: 12,
    spd: 7,
    skills: finalBossSkills,
    isBoss: true,
  }
}

// 水場があるステップ（5, 12, 17ステップ目）
export const WATER_STEPS = [5, 12, 17]


