import type { GameState } from "../types";

export function EventView({
  state,
  onContinue,
  onStartBattle,
  onCamp,
}: {
  state: GameState;
  onContinue: () => void;
  onStartBattle: () => void;
  onCamp: () => void;
}) {
  const event = state.event!;

  return (
    <div>
      <h2>イベント</h2>
      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          border: "1px solid #555",
          borderRadius: 8,
          minHeight: 200,
          whiteSpace: "pre-line",
        }}
      >
        {event.message}
      </div>

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
        {event.type === "water" && (
          <>
            <button onClick={onCamp}>キャンプする（HP/MP全回復）</button>
            <button onClick={onContinue}>そのまま進む</button>
          </>
        )}
        {(event.type === "midboss" || event.type === "finalboss" || event.type === "encounter") && (
          <button onClick={onStartBattle}>戦闘開始</button>
        )}
      </div>
    </div>
  );
}

