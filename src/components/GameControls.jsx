import React from 'react';
import { getMaxSelection } from '../utils/gameHelpers';

const GameControls = ({ 
  hardMode,
  puzzle,
  maxSelections,
  onUndo, 
  onClear,
  onHint,
  hintInProgress,
  hintCooldownRemaining,
  hintDisabled,
  canUndo,
  gameWon 
}) => {
  const fullWidthButton = {
    width: "100%",
    padding: "7px 20px",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "#303036",
    color: "#fff",
    cursor: "pointer",
    touchAction: "manipulation",
    transition: "background 0.2s, transform 0.1s",
  };

  return (
    <>
      {hardMode && (
        <div style={{
          marginTop: '12px',
          backgroundColor: '#e53935',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'inline-block'
        }}>
          <span role="img" aria-label="fire">🔥</span> HARD MODE (Max {getMaxSelection(hardMode, puzzle)} selections)
        </div>
      )}

      <div style={{
        display: "flex",
        width: "100%",
        maxWidth: "600px",
        margin: "20px auto 0",
        gap: "8px"
      }}>
        <button
          onClick={onUndo}
          disabled={!canUndo || gameWon}
          style={{
            ...fullWidthButton,
            flex: 1,
            backgroundColor: (!canUndo || gameWon) ? "#e0e0e0" : "#303036",
            color: (!canUndo || gameWon) ? "#999" : "#fff",
            cursor: (!canUndo || gameWon) ? "not-allowed" : "pointer"
          }}
        >
          Undo
        </button>

        <button
          onClick={onClear}
          disabled={!canUndo || gameWon}
          style={{
            ...fullWidthButton,
            flex: 1,
            backgroundColor: (!canUndo || gameWon) ? "#e0e0e0" : "#303036",
            color: (!canUndo || gameWon) ? "#999" : "#fff",
            cursor: (!canUndo || gameWon) ? "not-allowed" : "pointer"
          }}
        >
          Clear
        </button>

        <button
          onClick={onHint}
          disabled={hintDisabled || hintInProgress || hintCooldownRemaining > 0}
          style={{
            ...fullWidthButton,
            flex: 1,
            backgroundColor: (hintDisabled || hintInProgress || hintCooldownRemaining > 0) ? "#e0e0e0" : "#303036",
            color: (hintDisabled || hintInProgress || hintCooldownRemaining > 0) ? "#999" : "#fff",
            cursor: (hintDisabled || hintInProgress || hintCooldownRemaining > 0) ? "not-allowed" : "pointer"
          }}
        >
          {hintInProgress
            ? "Finding..."
            : hintCooldownRemaining > 0
              ? `Hint (${Math.ceil(hintCooldownRemaining / 1000)})`
              : "Hint"}
        </button>
      </div>
    </>
  );
};

export default GameControls;