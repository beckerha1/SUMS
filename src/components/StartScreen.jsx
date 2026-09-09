import React from 'react';
import SiteLinks from './SiteLinks';

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
    maxWidth: "300px",
    boxSizing: "border-box",
  };

  const streakSuffix = (count) =>
    count > 0 ? ` (${count} day${count === 1 ? "" : "s"} streak)` : "";

  return (
    <main style={{ textAlign: 'center', padding: '50px 10px' }}>
      <header>
        <img
          src={`${process.env.PUBLIC_URL}/SUMS_logo.png`}
          alt="SUMS"
          style={{ maxWidth: "200px", marginBottom: "12px" }}
        />
        <h1 style={{
          fontSize: '1.2rem',
          fontWeight: 600,
          margin: '0 0 8px',
          color: '#303036',
          letterSpacing: '0.01em',
        }}>
          Daily Number Puzzle Game
        </h1>
        <p style={{
          maxWidth: '420px',
          margin: '0 auto 24px',
          color: '#555',
          fontSize: '0.95rem',
          lineHeight: 1.5,
        }}>
          A free logic puzzle that mixes addition with spatial reasoning. New Mini (5×5)
          and Full (7×7) boards every day — no account required.
        </p>
      </header>

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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <a
            href="https://puzzled.online/?ref=cert-badge&site=https%3A%2F%2Fsums.games"
            aria-label="Certified Independent Puzzler — puzzled.online"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'block', lineHeight: 0 }}
          >
            <img
              src="https://puzzled.online/badges/certified-slim-anim-light.svg"
              alt="Certified Independent Puzzler — puzzled.online"
              width="180"
              height="52"
              style={{ display: 'block', width: '180px', height: 'auto' }}
            />
          </a>
        </div>
        <SiteLinks />
        <p style={{ marginTop: '10px', fontSize: "clamp(14px, 2.5vw, 14px)", color: "#666" }}>
          © 2026 Xavier Games
        </p>
      </footer>
    </main>
  );
};

export default StartScreen;
