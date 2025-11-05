import type { Character, Enemy } from "./types";

type SpriteProps = {
  id: string;
  isBoss?: boolean;
  size?: number;
};

function CharacterSprite({ id, isBoss = false, size = 64 }: SpriteProps) {
  const scale = isBoss ? 1.5 : 1;
  const actualSize = size * scale;

  // 勇者
  if (id === "hero") {
    return (
      <svg width={actualSize} height={actualSize} viewBox="0 0 64 64">
        {/* 体 */}
        <rect x="24" y="28" width="16" height="24" fill="#4a90e2" rx="2" />
        {/* 頭 */}
        <circle cx="32" cy="20" r="8" fill="#fdbcb4" />
        {/* 剣 */}
        <rect x="30" y="32" width="4" height="20" fill="#c0c0c0" />
        <polygon points="28,32 36,32 34,36 30,36" fill="#ffd700" />
        {/* 目 */}
        <circle cx="29" cy="20" r="1.5" fill="#000" />
        <circle cx="35" cy="20" r="1.5" fill="#000" />
        {/* 胸当て */}
        <rect x="26" y="32" width="12" height="8" fill="#ffd700" rx="1" />
      </svg>
    );
  }

  // 戦士
  if (id === "warrior") {
    return (
      <svg width={actualSize} height={actualSize} viewBox="0 0 64 64">
        {/* 体 */}
        <rect x="20" y="28" width="24" height="24" fill="#8b4513" rx="2" />
        {/* 頭 */}
        <circle cx="32" cy="20" r="8" fill="#d4a574" />
        {/* 剣 */}
        <rect x="42" y="30" width="3" height="22" fill="#c0c0c0" />
        <polygon points="40,30 48,30 45,34 40,34" fill="#8b4513" />
        {/* 盾 */}
        <rect x="14" y="30" width="8" height="18" fill="#654321" rx="1" />
        <circle cx="18" cy="39" r="2" fill="#ffd700" />
        {/* 目 */}
        <circle cx="29" cy="20" r="1.5" fill="#000" />
        <circle cx="35" cy="20" r="1.5" fill="#000" />
        {/* 胸当て */}
        <rect x="22" y="32" width="20" height="10" fill="#654321" rx="2" />
      </svg>
    );
  }

  // 狩人
  if (id === "archer") {
    return (
      <svg width={actualSize} height={actualSize} viewBox="0 0 64 64">
        {/* 体 */}
        <rect x="24" y="28" width="16" height="24" fill="#2d5016" rx="2" />
        {/* 頭 */}
        <circle cx="32" cy="20" r="8" fill="#fdbcb4" />
        {/* 弓 */}
        <ellipse cx="46" cy="38" rx="6" ry="12" fill="#8b4513" stroke="#654321" strokeWidth="1" />
        <line x1="40" y1="38" x2="52" y2="38" stroke="#654321" strokeWidth="1.5" />
        {/* 矢 */}
        <line x1="36" y1="36" x2="42" y2="40" stroke="#654321" strokeWidth="2" />
        {/* 目 */}
        <circle cx="29" cy="20" r="1.5" fill="#000" />
        <circle cx="35" cy="20" r="1.5" fill="#000" />
        {/* 帽子 */}
        <ellipse cx="32" cy="14" rx="10" ry="6" fill="#8b4513" />
      </svg>
    );
  }

  // 武僧
  if (id === "monk") {
    return (
      <svg width={actualSize} height={actualSize} viewBox="0 0 64 64">
        {/* 体 */}
        <rect x="24" y="28" width="16" height="24" fill="#ff6347" rx="2" />
        {/* 頭 */}
        <circle cx="32" cy="20" r="8" fill="#d4a574" />
        {/* 帯 */}
        <rect x="20" y="38" width="24" height="4" fill="#ffd700" />
        {/* 腕（格闘ポーズ） */}
        <circle cx="18" cy="36" r="4" fill="#d4a574" />
        <circle cx="46" cy="36" r="4" fill="#d4a574" />
        {/* 目 */}
        <circle cx="29" cy="20" r="1.5" fill="#000" />
        <circle cx="35" cy="20" r="1.5" fill="#000" />
        {/* 気のエネルギー */}
        <circle cx="18" cy="36" r="3" fill="#ffff00" opacity="0.6" />
        <circle cx="46" cy="36" r="3" fill="#ffff00" opacity="0.6" />
      </svg>
    );
  }

  // 魔法使い
  if (id === "mage") {
    return (
      <svg width={actualSize} height={actualSize} viewBox="0 0 64 64">
        {/* 体 */}
        <rect x="24" y="28" width="16" height="24" fill="#6a0dad" rx="2" />
        {/* 頭 */}
        <circle cx="32" cy="20" r="8" fill="#fdbcb4" />
        {/* 杖 */}
        <rect x="42" y="18" width="2" height="34" fill="#8b7355" />
        <circle cx="43" cy="18" r="3" fill="#ffd700" />
        {/* 魔法の光 */}
        <circle cx="43" cy="18" r="2" fill="#00ffff" opacity="0.8" />
        {/* 目 */}
        <circle cx="29" cy="20" r="1.5" fill="#000" />
        <circle cx="35" cy="20" r="1.5" fill="#000" />
        {/* 帽子（とんがり帽子） */}
        <path d="M 32 12 L 28 22 L 36 22 Z" fill="#4b0082" />
        <rect x="26" y="22" width="12" height="4" fill="#4b0082" />
      </svg>
    );
  }

  // 洞窟の主（ボス）
  if (id === "cave-boss") {
    return (
      <svg width={actualSize} height={actualSize} viewBox="0 0 64 64">
        {/* 体（大きなモンスター） */}
        <ellipse cx="32" cy="40" rx="20" ry="18" fill="#654321" />
        {/* 頭 */}
        <ellipse cx="32" cy="20" rx="14" ry="12" fill="#8b4513" />
        {/* 口 */}
        <ellipse cx="32" cy="24" rx="8" ry="6" fill="#000" />
        {/* 牙 */}
        <polygon points="26,24 28,20 30,24" fill="#fff" />
        <polygon points="34,24 36,20 38,24" fill="#fff" />
        {/* 目 */}
        <circle cx="27" cy="18" r="3" fill="#ff0000" />
        <circle cx="37" cy="18" r="3" fill="#ff0000" />
        <circle cx="27" cy="18" r="1.5" fill="#fff" />
        <circle cx="37" cy="18" r="1.5" fill="#fff" />
        {/* 角 */}
        <path d="M 22 12 L 24 8 L 26 12" fill="#8b4513" />
        <path d="M 38 12 L 40 8 L 42 12" fill="#8b4513" />
        {/* 腕/爪 */}
        <ellipse cx="14" cy="38" rx="6" ry="8" fill="#654321" />
        <ellipse cx="50" cy="38" rx="6" ry="8" fill="#654321" />
        {/* 爪 */}
        <path d="M 10 38 L 12 34 L 14 38" fill="#000" />
        <path d="M 50 38 L 52 34 L 54 38" fill="#000" />
      </svg>
    );
  }

  // デフォルト（未知のキャラクター）
  return (
    <svg width={actualSize} height={actualSize} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="16" fill="#888" />
      <text x="32" y="36" textAnchor="middle" fontSize="12" fill="#fff">
        ?
      </text>
    </svg>
  );
}

export function CharacterSpriteComponent({ character, size }: { character: Character; size?: number }) {
  return <CharacterSprite id={character.id} size={size} />;
}

export function EnemySpriteComponent({ enemy, size }: { enemy: Enemy; size?: number }) {
  return <CharacterSprite id={enemy.id} isBoss={enemy.isBoss} size={size} />;
}

