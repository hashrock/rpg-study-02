import type { BattleActor, BattleState, Character, Enemy, Party } from './types'

export function deepCopyCharacter<T extends Character | Enemy>(c: T): T {
  return { ...c }
}

export function isAlive(u: Character | Enemy): boolean {
  return u.hp > 0
}

export function alliesFromParty(party: Party): Character[] {
  return [deepCopyCharacter(party.hero), ...party.companions.map(deepCopyCharacter)]
}

export function computeTurnOrder(allies: Character[], enemies: Enemy[]): BattleActor[] {
  const order: BattleActor[] = []
  for (let i = 0; i < allies.length; i++) order.push({ kind: 'ally', index: i })
  for (let i = 0; i < enemies.length; i++) order.push({ kind: 'enemy', index: i })
  order.sort((a, b) => {
    const sa = a.kind === 'ally' ? allies[a.index].spd : enemies[a.index].spd
    const sb = b.kind === 'ally' ? allies[b.index].spd : enemies[b.index].spd
    if (sa !== sb) return sb - sa
    // stable random-ish but deterministic fallback by index and kind
    return a.kind === b.kind ? a.index - b.index : a.kind === 'ally' ? -1 : 1
  })
  return order
}

export function startBattle(party: Party, foes: Enemy[]): BattleState {
  const allies = alliesFromParty(party)
  const enemies = foes.map(deepCopyCharacter)
  return {
    allies,
    enemies,
    turnOrder: computeTurnOrder(allies, enemies),
    turnIndex: 0,
    log: ['戦いが始まった！'],
  }
}

export function selectFirstAlive<T extends Character | Enemy>(units: T[]): number | null {
  for (let i = 0; i < units.length; i++) {
    if (isAlive(units[i])) return i
  }
  return null
}

export function applyAttack(attacker: Character | Enemy, target: Character | Enemy): number {
  const damage = Math.max(1, attacker.atk)
  target.hp = Math.max(0, target.hp - damage)
  return damage
}

export function isBattleOver(state: BattleState): { over: boolean; winner: 'allies' | 'enemies' | null } {
  const alliesAlive = state.allies.some(isAlive)
  const enemiesAlive = state.enemies.some(isAlive)
  if (alliesAlive && enemiesAlive) return { over: false, winner: null }
  if (alliesAlive) return { over: true, winner: 'allies' }
  if (enemiesAlive) return { over: true, winner: 'enemies' }
  return { over: true, winner: null }
}

export function advanceTurn(state: BattleState): BattleState {
  let nextIndex = state.turnIndex
  for (let i = 0; i < state.turnOrder.length; i++) {
    nextIndex = (nextIndex + 1) % state.turnOrder.length
    const actor = state.turnOrder[nextIndex]
    if (actor.kind === 'ally') {
      if (isAlive(state.allies[actor.index])) return { ...state, turnIndex: nextIndex }
    } else {
      if (isAlive(state.enemies[actor.index])) return { ...state, turnIndex: nextIndex }
    }
  }
  return { ...state, turnIndex: nextIndex }
}


