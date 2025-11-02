import type { GameState } from "../types";
import { PartyView } from "./PartyView";
import { WATER_STEPS, items, getItemQuantity, getItemById } from "../data";
import { useState, useEffect } from "react";

function ItemUseView({
  inventory,
  party,
  onBack,
  onUseItem,
}: {
  inventory: GameState["inventory"];
  party: GameState["party"];
  onBack: () => void;
  onUseItem: (itemId: string, targetIndex?: number) => void;
}) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const availableItems = items.filter(item => getItemQuantity(inventory, item.id) > 0);
  const members = [party.hero, ...party.companions];

  if (selectedItemId) {
    const item = items.find(i => i.id === selectedItemId);
    const isHeal = item?.effect.type === "heal" || item?.effect.type === "mp_heal";

    return (
      <div style={{ marginTop: "1rem", border: "1px solid #555", padding: "1rem", borderRadius: 8 }}>
        <div>ターゲット選択：{item?.name}</div>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap", marginTop: "0.5rem" }}>
          <button onClick={() => setSelectedItemId(null)}>戻る</button>
          {isHeal && members.map((m, i) => (
            <button
              key={`item-heal-${i}`}
              disabled={m.hp <= 0 || (item?.effect.type === "heal" && m.hp >= m.maxHp) || (item?.effect.type === "mp_heal" && m.mp >= m.maxMp)}
              onClick={() => {
                onUseItem(selectedItemId, i);
                setSelectedItemId(null);
              }}
            >
              {item?.name} → {m.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "1rem", border: "1px solid #555", padding: "1rem", borderRadius: 8 }}>
      <div>アイテム使用</div>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap", marginTop: "0.5rem" }}>
        <button onClick={onBack}>閉じる</button>
        {availableItems.map((item) => {
          const quantity = getItemQuantity(inventory, item.id);
          return (
            <button
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              title={item.description}
            >
              {item.name} ×{quantity}
            </button>
          );
        })}
      </div>
      {availableItems.length === 0 && (
        <div style={{ marginTop: "0.5rem" }}>使用可能なアイテムがありません</div>
      )}
    </div>
  );
}

function CollectedItemPopup({
  itemId,
  onClose,
}: {
  itemId: string;
  onClose: () => void;
}) {
  const item = getItemById(itemId);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#1a1a1a",
        border: "3px solid #4ade80",
        borderRadius: 12,
        padding: "2rem",
        zIndex: 1000,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
        textAlign: "center",
        minWidth: 300,
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌿</div>
      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4ade80", marginBottom: "0.5rem" }}>
        アイテムを採集しました！
      </div>
      <div style={{ fontSize: "1.2rem", color: "#fff", marginBottom: "0.5rem" }}>
        {item.name}
      </div>
      <div style={{ fontSize: "0.9rem", color: "#aaa" }}>
        {item.description}
      </div>
    </div>
  );
}

function InventoryView({
  inventory,
}: {
  inventory: GameState["inventory"];
}) {
  const hasItems = inventory.items.length > 0;

  if (!hasItems) {
    return (
      <div style={{ marginTop: "1rem", fontSize: "0.9em", color: "#888" }}>
        インベントリ：空
      </div>
    );
  }

  return (
    <div style={{ marginTop: "1rem", fontSize: "0.9em" }}>
      <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>インベントリ</div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        {inventory.items.map((item) => {
          const itemData = items.find(i => i.id === item.itemId);
          return (
            <div key={item.itemId} style={{ border: "1px solid #555", padding: "0.25rem 0.5rem", borderRadius: 4 }}>
              {itemData?.name || item.itemId} ×{item.quantity}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DungeonView({
  state,
  onMoveForward,
  onMoveBackward,
  onReturnToTown,
  onUseItem,
  onCollectItem,
  onClearCollectedItem,
}: {
  state: GameState;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onReturnToTown: () => void;
  onUseItem: (itemId: string, targetIndex?: number) => void;
  onCollectItem: () => void;
  onClearCollectedItem: () => void;
}) {
  const [showItemMenu, setShowItemMenu] = useState(false);
  const dungeon = state.dungeon!;
  const isWaterStep = WATER_STEPS.includes(dungeon.step);
  const canMoveForward = dungeon.step < dungeon.maxStep;
  const canMoveBackward = dungeon.step > 0;

  return (
    <div>
      {state.collectedItem && (
        <CollectedItemPopup
          itemId={state.collectedItem.itemId}
          onClose={onClearCollectedItem}
        />
      )}
      <h2>ダンジョン</h2>
      <div style={{ marginBottom: "1rem" }}>
        <div>
          ステップ: {dungeon.step} / {dungeon.maxStep}
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          {isWaterStep && (
            <div style={{ color: "#4a90e2", fontWeight: "bold" }}>
              💧 水場があります
            </div>
          )}
          {dungeon.step === 10 && (
            <div style={{ color: "#ff4444", fontWeight: "bold" }}>
              ⚠️ 中ボスエリア
            </div>
          )}
          {dungeon.step === 20 && (
            <div style={{ color: "#ff0000", fontWeight: "bold" }}>
              ⚠️ 大ボスエリア
            </div>
          )}
          {dungeon.canCollectItem && (
            <div style={{ color: "#4ade80", fontWeight: "bold" }}>
              🌿 アイテムを採集できます
            </div>
          )}
        </div>
      </div>

      <PartyView party={state.party} />

      <InventoryView inventory={state.inventory} />

      {showItemMenu && (
        <ItemUseView
          inventory={state.inventory}
          party={state.party}
          onBack={() => setShowItemMenu(false)}
          onUseItem={onUseItem}
        />
      )}

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        {dungeon.step === 0 && (
          <button onClick={onReturnToTown}>街に戻る</button>
        )}
        <button disabled={!canMoveBackward} onClick={onMoveBackward}>
          ← 戻る
        </button>
        <button disabled={!canMoveForward} onClick={onMoveForward}>
          進む →
        </button>
        {dungeon.canCollectItem && (
          <button onClick={onCollectItem} style={{ backgroundColor: "#4ade80", color: "#000" }}>
            🌿 アイテムを採集する
          </button>
        )}
        <button onClick={() => setShowItemMenu(!showItemMenu)}>
          {showItemMenu ? "アイテムメニューを閉じる" : "アイテムを使用"}
        </button>
      </div>

      <div style={{ marginTop: "1rem", fontSize: "0.9em", color: "#888" }}>
        <div>進むと20%の確率で敵と遭遇します</div>
        <div>マスに到着時、20%の確率でアイテム採集が可能になります</div>
        {isWaterStep && <div>水場で休むことができます</div>}
      </div>
    </div>
  );
}

