import React from "react";

const StrategyModal = React.memo(({ onClose }) => {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      overflowY: "auto",
      backgroundColor: "rgba(0,0,0,0.6)",
      zIndex: 2000,
      padding: "16px",
      boxSizing: "border-box",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      touchAction: "manipulation"
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: "1.6",
        color: "#333",
        background: "#fff",
        borderRadius: "12px",
        position: "relative",
        width: "100%",
        textAlign: "left"
      }}>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#666",
              lineHeight: "1",
              padding: 0
            }}
            aria-label="Close"
          >
            ✖
          </button>
        )}

        <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>Strategy Guide</h1>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>How difficulty is shaped</h2>
          <p>
            SUMS difficulty comes from how many decisions are truly available at each step, not just how many open cells exist.
            Easy boards usually offer many legal continuations, while hard boards force narrow paths and long-range planning.
          </p>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>Key factors that increase difficulty</h2>
          <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
            <li><strong>Higher target range:</strong> Reaching larger numbers adds dependency on earlier placements.</li>
            <li><strong>More numbers to place:</strong> Fewer clues means more player-built structure.</li>
            <li><strong>Low-number clue pressure:</strong> Early clues can constrain your route before the board opens up.</li>
            <li><strong>Tight local geometry:</strong> Cells with few neighbors reduce legal continuation options.</li>
            <li><strong>Wall and snake effects:</strong> Black-square barriers can force detours where one placement determines an entire corridor.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>Typical easy puzzle patterns</h2>
          <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
            <li>More forgiving space with multiple valid endpoints.</li>
            <li>Helpful clue placement that anchors your route.</li>
            <li>Lower chance of dead-ends from a single misplacement.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>Typical hard puzzle patterns</h2>
          <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
            <li>Forced sequences around black-square walls or channels.</li>
            <li>Critical junctions where one wrong placement blocks later sums.</li>
            <li>Long planning windows where you must reserve future adjacency.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>Weekly difficulty ramp</h2>
          <p>
            Puzzles are scheduled from easier to harder across the week, with Monday at difficulty 1 and Sunday at difficulty 7.
            This keeps weekday play approachable while preserving deep challenge for weekend solvers.
          </p>
        </section>
      </div>
    </div>
  );
});

export default StrategyModal;
