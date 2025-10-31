import type { Character, Enemy, Party } from './types'

export function createHero(): Character {
  return {
    id: 'hero',
    name: '勇者',
    maxHp: 40,
    hp: 40,
    atk: 8,
    spd: 6,
    isHero: true,
  }
}

export const hireCandidates: Character[] = [
  { id: 'warrior', name: '戦士', maxHp: 36, hp: 36, atk: 9, spd: 4 },
  { id: 'archer', name: '狩人', maxHp: 28, hp: 28, atk: 7, spd: 8 },
  { id: 'monk', name: '武僧', maxHp: 30, hp: 30, atk: 8, spd: 7 },
  { id: 'mage', name: '魔法使い', maxHp: 22, hp: 22, atk: 11, spd: 5 },
]

export function createInitialParty(): Party {
  return {
    hero: createHero(),
    companions: [],
  }
}

export function createCaveBoss(): Enemy {
  return {
    id: 'cave-boss',
    name: '洞窟の主',
    maxHp: 80,
    hp: 80,
    atk: 10,
    spd: 5,
    isBoss: true,
  }
}


