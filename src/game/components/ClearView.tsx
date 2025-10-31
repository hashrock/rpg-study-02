export function ClearView({ onReset }: { onReset: () => void }) {
  return (
    <div>
      <h2>クリア！</h2>
      <div>洞窟のボスを倒した！おめでとう！</div>
      <div style={{ marginTop: "1rem" }}>
        <button onClick={onReset}>最初から</button>
      </div>
    </div>
  );
}

