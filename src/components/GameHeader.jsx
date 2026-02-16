import React, { useEffect, useRef } from 'react';
import { formatTime } from '../utils/gameHelpers';

const GameHeader = ({
  elapsedTime,
  nextExpectedNumber,
  currentSum,
  showHelpDropdown,
  setShowHelpDropdown,
  setShowInstructions,
  hardMode,
  setHardMode,
  setSelectedCells,
  onReturnHome,
  gameMode,
  puzzleNumber
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowHelpDropdown(false);
      }
    };

    if (showHelpDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHelpDropdown, setShowHelpDropdown]);

  return (
    <>
      <img
        src={`${process.env.PUBLIC_URL}/SUMS_logo.png`}
        alt="Sums Logo"
        style={{ maxWidth: "200px" }}
      />

      <div style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2px 5vw",
        marginBottom: "7px",
        minHeight: "32px"
      }}>
        {/* Clock */}
        <div style={{
          position: "absolute",
          left: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "clamp(14px, 2.5vw, 16px)",
          color: "var(--charcoal)"
        }}>
          <span role="img" aria-label="clock">🕒</span> {formatTime(elapsedTime)}
        </div>

        {/* Centered Info */}
        <div style={{
          fontSize: "clamp(14px, 2.5vw, 18px)",
          display: "flex",
          gap: "12px",
          color: "#333",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <span style={{ color: "var(--charcoal)" }}>
            Next SUM: <strong>{nextExpectedNumber}</strong>
          </span>
          <span style={{ color: "#666" }}>
            Current SUM: <strong>{currentSum}</strong>
          </span>
        </div>

        {/* Help icon */}
        <div 
          ref={dropdownRef}
          style={{
            position: "absolute",
            right: 0,
            display: "flex",
            alignItems: "center",
            color: "var(--charcoal)"
          }}>
          <button
            onClick={() => setShowHelpDropdown(prev => !prev)}
            style={{
              width: "clamp(24px, 6vw, 25px)",
              height: "clamp(24px, 6vw, 25px)",
              fontSize: "clamp(14px, 3vw, 18px)",
              borderRadius: "50%",
              border: "2px solid #303036",
              backgroundColor: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              padding: 0,
              lineHeight: "1",
              textAlign: "center"
            }}
            aria-label="Help"
          >
            <span style={{ color: "#303036" }}><strong>?</strong></span>
          </button>

          {showHelpDropdown && (
            <div
              style={{
                position: "absolute",
                top: "36px",
                right: 0,
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "6px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                zIndex: 101,
                minWidth: "160px",
                textAlign: "left"
              }}
            >
              <div
                onClick={() => {
                  setShowHelpDropdown(false);
                  setShowInstructions(true);
                }}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  borderBottom: "1px solid #eee"
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f0f0f0"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
              >
                Instructions
              </div>

              <div style={{
                padding: "10px",
                fontSize: "0.95rem",
                borderBottom: "1px solid #eee"
              }}>
                <div
                  onClick={() => {
                    setHardMode(!hardMode);
                    setSelectedCells([]);
                    setShowHelpDropdown(false);
                  }}
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "32px",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "16px",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background-color 0.3s"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: hardMode ? "calc(50% - 2px)" : "2px",
                      width: "calc(50% - 2px)",
                      height: "28px",
                      backgroundColor: hardMode ? "#e53935" : "#4caf50",
                      borderRadius: "14px",
                      transition: "all 0.3s ease",
                      zIndex: 1
                    }}
                  />

                  <div style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    color: !hardMode ? "#fff" : "#666",
                    zIndex: 2,
                    transition: "color 0.3s"
                  }}>
                    Normal
                  </div>

                  <div style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    color: hardMode ? "#fff" : "#666",
                    zIndex: 2,
                    transition: "color 0.3s"
                  }}>
                    <span role="img" aria-label="fire">🔥</span> Hard
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setShowHelpDropdown(false);
                  if (onReturnHome) onReturnHome();
                }}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  borderBottom: "1px solid #eee"
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f0f0f0"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
              >
                Return to home
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GameHeader;