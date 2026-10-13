import React from 'react';

const WarmupDoneScreen = ({ offer = 'full', onPlayNext, onReturnHome }) => {
  const nextLabel = offer === 'mini' ? 'Play Mini SUMS' : 'Play SUMS';
  const fullWidthButton = {
    width: '100%',
    padding: '10px 20px',
    fontSize: 'clamp(14px, 2.5vw, 16px)',
    borderRadius: '999px',
    border: 'none',
    backgroundColor: '#303036',
    color: '#fff',
    cursor: 'pointer',
    touchAction: 'manipulation',
    transition: 'background 0.2s, transform 0.1s',
    fontWeight: '600'
  };

  const outlineButton = {
    ...fullWidthButton,
    backgroundColor: '#fff',
    color: '#303036',
    border: '2px solid #303036'
  };

  return (
    <div
      className="win-screen-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000
      }}
    >
      <div
        className="win-screen-card"
        style={{
          position: 'relative',
          background: '#fff',
          padding: '36px 28px 28px',
          borderRadius: '14px',
          textAlign: 'center',
          width: 'min(92vw, 360px)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <button
          onClick={onReturnHome}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#aaa',
            lineHeight: 1,
            touchAction: 'manipulation'
          }}
          aria-label="Close"
        >✖</button>

        <h2 className="win-screen-title" style={{ margin: '8px 0 12px', fontSize: '1.85rem' }}>
          Nice work
        </h2>
        <p style={{
          fontSize: '1rem',
          color: '#333',
          lineHeight: 1.5,
          margin: '0 0 24px'
        }}>
          That's the whole game. Daily puzzles are bigger, and they get harder through the week. Mondays are the easiest.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={onPlayNext} style={fullWidthButton}>
            {nextLabel}
          </button>
          <button onClick={onReturnHome} style={outlineButton}>
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarmupDoneScreen;
