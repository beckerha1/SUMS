import React, { useEffect, useState } from 'react';
import { formatTime } from '../utils/gameHelpers';
import { submitHighScore } from './HighScores';

const WinScreen = ({
  elapsedTime,
  countdownToMidnight,
  onClose,
  onShare,
  gameMode,
  onViewHighScores
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showNameEntry, setShowNameEntry] = useState(false);

  useEffect(() => {
    if (window.adsbygoogle && !window.adsbygoogle.initialized) {
      try {
        window.adsbygoogle.push({});
        window.adsbygoogle.initialized = true;
        setTimeout(() => {
          const adElement = document.querySelector('.adsbygoogle');
          if (adElement && adElement.getAttribute('data-ad-status') === 'filled') {
            setAdLoaded(true);
          }
        }, 1000);
      } catch (e) {
        console.error('Adsbygoogle push error:', e);
      }
    }
  }, []);

  const handleSubmitScore = async () => {
    if (!nameInput.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitHighScore(nameInput.trim(), elapsedTime, gameMode);
      setSubmitted(true);
    } catch (e) {
      setSubmitError('Could not submit score. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewScores = () => {
    onViewHighScores({
      name: submitted ? nameInput.trim() : null,
      time: elapsedTime,
      mode: gameMode
    });
    onClose();
  };

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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }}>
      <div style={{
        position: 'relative',
        background: '#fff',
        padding: '36px 28px 28px',
        borderRadius: '14px',
        boxShadow: '0 4px 30px rgba(0,0,0,0.25)',
        textAlign: 'center',
        width: 'min(92vw, 360px)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {adLoaded && (
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-9089968933343465"
            data-ad-slot="1840745997"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        )}

        <button
          onClick={onClose}
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
          aria-label="Close win screen"
        >✖</button>

        {/* Win Header */}
        <div style={{ marginBottom: '6px', fontSize: '2.2rem' }}>🎉</div>
        <h2 style={{ marginBottom: '6px', fontSize: '1.5rem', color: '#303036' }}>
          You Won!
        </h2>
        <p style={{
          fontSize: '1.3rem',
          fontWeight: '700',
          color: '#303036',
          marginBottom: '4px'
        }}>
          {formatTime(elapsedTime)}
        </p>
        <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '24px' }}>
          New puzzle in: <strong style={{ color: '#555' }}>{countdownToMidnight}</strong>
        </p>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid #eee', marginBottom: '20px' }} />

        {/* High Score Section */}
        {!submitted ? (
          <>
            {!showNameEntry ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => setShowNameEntry(true)}
                  style={fullWidthButton}
                >
                  🏆 Add to High Scores
                </button>
                <button
                  onClick={onShare}
                  style={outlineButton}
                >
                  📤 Share with a Friend
                </button>
                <button
                  onClick={handleViewScores}
                  style={{ ...outlineButton, borderColor: '#ddd', color: '#888', fontSize: '0.9rem', padding: '8px 20px' }}
                >
                  View Today's High Scores
                </button>
              </div>
            ) : (
              <div>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#555',
                  marginBottom: '12px',
                  fontWeight: '600'
                }}>
                  Enter your name for the leaderboard:
                </p>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value.slice(0, 10))}
                  onKeyDown={(e) => e.key === 'Enter' && nameInput.trim() && handleSubmitScore()}
                  placeholder="Your name (max 10)"
                  maxLength={10}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: '2px solid #ccc',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    marginBottom: '4px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    letterSpacing: '0.05em'
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: '#bbb', marginBottom: '14px' }}>
                  {nameInput.length}/10 characters
                </p>

                {submitError && (
                  <p style={{ color: '#e53935', fontSize: '0.85rem', marginBottom: '10px' }}>
                    {submitError}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={handleSubmitScore}
                    disabled={!nameInput.trim() || submitting}
                    style={{
                      ...fullWidthButton,
                      backgroundColor: nameInput.trim() && !submitting ? '#303036' : '#ccc',
                      cursor: nameInput.trim() && !submitting ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Score'}
                  </button>
                  <button
                    onClick={() => {
                      setShowNameEntry(false);
                      setNameInput('');
                      setSubmitError(null);
                    }}
                    style={{ ...outlineButton, fontSize: '0.9rem', padding: '8px 20px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Post-submission state */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '4px'
            }}>
              <p style={{ color: '#166534', fontWeight: '600', fontSize: '0.95rem', margin: 0 }}>
                ✅ Score submitted for <strong>{nameInput}</strong>!
              </p>
            </div>
            <button
              onClick={handleViewScores}
              style={fullWidthButton}
            >
              🏆 View High Scores
            </button>
            <button
              onClick={onShare}
              style={outlineButton}
            >
              📤 Share with a Friend
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WinScreen;