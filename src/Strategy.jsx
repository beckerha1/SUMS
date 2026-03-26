import React from "react";
import { Link } from 'react-router-dom';

const overlayStyle = {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100dvh",
  overflowY: "auto",
  backgroundColor: "rgba(0,0,0,0.6)",
  zIndex: 2000,
  padding: "max(8px, env(safe-area-inset-top)) 12px max(8px, env(safe-area-inset-bottom))",
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  touchAction: "manipulation"
};

const modalCardStyle = {
  width: "min(100%, 800px)",
  maxHeight: "calc(100dvh - 16px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  margin: "0 auto",
  padding: "clamp(20px, 5vw, 40px) clamp(14px, 4vw, 20px)",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  lineHeight: "1.6",
  color: "#333",
  background: "#fff",
  borderRadius: "12px",
  position: "relative",
  textAlign: "left"
};

const closeButtonStyle = {
  position: "absolute",
  top: "14px",
  right: "14px",
  background: "transparent",
  border: "none",
  fontSize: "1.5rem",
  cursor: "pointer",
  color: "#666",
  lineHeight: "1",
  padding: 0
};

const pageWrapStyle = {
  minHeight: "100vh",
  background: "#f7f7f8",
  padding: "20px 12px",
  boxSizing: "border-box"
};

const homeLinkStyle = {
  display: "inline-block",
  marginBottom: "16px",
  color: "#303036",
  fontWeight: 600,
  textDecoration: "none"
};

const StrategyContent = React.memo(({ onClose, modal = false }) => {
  const body = (
    <div style={modalCardStyle}>
      {modal ? (
        onClose && (
          <button
            onClick={onClose}
            style={closeButtonStyle}
            aria-label="Close"
          >
            ✖
          </button>
        )
      ) : (
        <Link to="/" style={homeLinkStyle}>← Back to home</Link>
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
  );

  if (modal) return <div style={overlayStyle}>{body}</div>;
  return <main style={pageWrapStyle}>{body}</main>;
});

export default StrategyContent;
