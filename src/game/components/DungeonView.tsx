import type { GameState } from "../types";
import { PartyView } from "./PartyView";
import { WATER_STEPS } from "../data";

export function DungeonView({
  state,
  onMoveForward,
  onMoveBackward,
  onReturnToTown,
}: {
  state: GameState;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onReturnToTown: () => void;
}) {
  const dungeon = state.dungeon!;
  const isWaterStep = WATER_STEPS.includes(dungeon.step);
  const canMoveForward = dungeon.step < dungeon.maxStep;
  const canMoveBackward = dungeon.step > 0;

  return (
    <div>
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
        </div>
      </div>

      <PartyView party={state.party} />

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
      </div>

      <div style={{ marginTop: "1rem", fontSize: "0.9em", color: "#888" }}>
        <div>進むと20%の確率で敵と遭遇します</div>
        {isWaterStep && <div>水場で休むことができます</div>}
      </div>
    </div>
  );
}

