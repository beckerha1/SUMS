import React from 'react';

const StartScreen = ({ 
  onPlayMini,
  onPlayFull, 
  onShowInstructions,
  onShowStats,
  onShowHighScores,
  todayStr,
  puzzleNumber,
  puzzleNumberMini,
  streakMini = { count: 0, wonToday: false, needsPlayToday: false },
  streakFull = { count: 0, wonToday: false, needsPlayToday: false },
  onShowPrivacy,
  onShowAbout,
  onShowStrategy
}) => {
  const mobileButton = {
    padding: "10px 20px",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "#303036",
    color: "white",
    width: "100%",
    maxWidth: "300px",
    cursor: "pointer",
    touchAction: "manipulation",
    transition: "background 0.2s, transform 0.1s",
    display: "block",
    margin: "0 auto",
  };

  const playButtonStyle = {
    ...mobileButton,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "min(100%, 320px)",
    boxSizing: "border-box",
  };

  const streakSuffix = (count) =>
    count > 0 ? ` (${count} day${count === 1 ? "" : "s"} streak)` : "";

  return (
    <div style={{ textAlign: 'center', padding: '50px 10px' }}>
      <img
        src={`${process.env.PUBLIC_URL}/SUMS_logo.png`}
        alt="Sums Logo"
        style={{ maxWidth: "200px", marginBottom: "20px" }}
      />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <button onClick={onPlayMini} style={playButtonStyle}>
          Play Mini SUMS{streakSuffix(streakMini.count)}
        </button>

        <button onClick={onPlayFull} style={playButtonStyle}>
          Play SUMS{streakSuffix(streakFull.count)}
        </button>

        <button onClick={onShowInstructions} style={mobileButton}>
          How to play
        </button>

        <button onClick={onShowStats} style={mobileButton}>
          Personal Statistics
        </button>

        <button onClick={onShowHighScores} style={mobileButton}>
          Today's High Scores
        </button>
      </div>

      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{todayStr}</div>
        <div style={{ marginTop: 3, fontSize: "1rem", color: "#666" }}>
          Mini #{puzzleNumberMini} • Full #{puzzleNumber}
        </div>
        <div style={{ marginTop: 3, fontSize: "0.8rem", color: "#666" }}>By HXB</div>
      </div>

      <footer style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.9rem' }}>
        <img
          src={`${process.env.PUBLIC_URL}/certified-slim-anim-light.svg`}
          alt="Certified Independent Puzzler badge"
          style={{ display: 'block', margin: '0 auto 12px', maxWidth: '240px', width: '100%', height: 'auto' }}
        />
        <span 
          onClick={(e) => {
            e.stopPropagation();
            onShowPrivacy();
          }}
          style={{ margin: '0 10px', color: '#666', textDecoration: 'none', cursor: 'pointer' }}
        >
          Privacy Policy
        </span>
        <span 
          onClick={(e) => {
            e.stopPropagation();
            onShowAbout();
          }}
          style={{ margin: '0 10px', color: '#666', textDecoration: 'none', cursor: 'pointer' }}
        >
          About
        </span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onShowStrategy();
          }}
          style={{ margin: '0 10px', color: '#666', textDecoration: 'none', cursor: 'pointer' }}
        >
          Strategy
        </span>
        <p style={{ marginTop: '10px', fontSize: "clamp(14px, 2.5vw, 14px)", color: "#666" }}>
          © 2026 Xavier Games
        </p>
      </footer>
    </div>
  );
};

export default StartScreen;
