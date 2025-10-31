export function GameOverView({ onReset }: { onReset: () => void }) {
  return (
    <div>
      <h2>ゲームオーバー</h2>
      <div>力尽きてしまった…</div>
      <div style={{ marginTop: "1rem" }}>
        <button onClick={onReset}>最初から</button>
      </div>
    </div>
  );
}

