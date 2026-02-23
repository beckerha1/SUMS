import React, { useState, useEffect } from 'react';
import { formatTime } from '../utils/gameHelpers';

const SUPABASE_URL = 'https://kepmuolarwiurltzoeml.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcG11b2xhcndpdXJsdHpvZW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzAyNTksImV4cCI6MjA4NzQ0NjI1OX0.m1Rbatkncsa81P9xMCJgTHrimBHrGDBgWUednpN6Zow';

const MEDAL_LABELS = ['🥇', '🥈', '🥉', '4', '5'];
const MEDAL_COLORS = ['#b8860b', '#888', '#a0522d', '#555', '#555'];

const getTodayET = () => {
  const now = new Date();
  const est = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const year = est.getFullYear();
  const month = String(est.getMonth() + 1).padStart(2, '0');
  const day = String(est.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fetchScores = async (mode) => {
  const today = getTodayET();
  const url = `${SUPABASE_URL}/rest/v1/high_scores` +
    `?puzzle_date=eq.${today}` +
    `&mode=eq.${mode}` +
    `&order=time_seconds.asc` +
    `&limit=5` +
    `&select=name,time_seconds,mode`;

  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });

  if (!res.ok) throw new Error(`Failed to fetch scores: ${res.status}`);
  return await res.json();
};

export const submitHighScore = async (name, timeSeconds, mode) => {
  const today = getTodayET();
  const url = `${SUPABASE_URL}/rest/v1/high_scores`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      name: name.trim().slice(0, 10),
      time_seconds: timeSeconds,
      mode,
      puzzle_date: today
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to submit score: ${err}`);
  }

  return await fetchScores(mode);
};

const HighScores = ({ onClose, highlightEntry = null }) => {
  const [activeMode, setActiveMode] = useState(highlightEntry?.mode || 'mini');
  const [miniScores, setMiniScores] = useState([]);
  const [fullScores, setFullScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadScores = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mini, full] = await Promise.all([
        fetchScores('mini'),
        fetchScores('full')
      ]);
      setMiniScores(mini);
      setFullScores(full);
    } catch (e) {
      console.error('Error loading scores:', e);
      setError('Could not load scores. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScores();
  }, []);

  const currentScores = activeMode === 'mini' ? miniScores : fullScores;

  const tabStyle = (isActive) => ({
    flex: 1,
    padding: '10px 0',
    fontSize: '0.95rem',
    fontWeight: isActive ? '700' : '500',
    cursor: 'pointer',
    border: 'none',
    borderBottom: isActive ? '3px solid #303036' : '3px solid transparent',
    backgroundColor: 'transparent',
    color: isActive ? '#303036' : '#888',
    transition: 'all 0.2s',
    touchAction: 'manipulation'
  });

  const rankBadgeStyle = (rank) => ({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: rank < 3 ? '1.3rem' : '0.85rem',
    fontWeight: 'bold',
    color: MEDAL_COLORS[rank],
    flexShrink: 0,
    backgroundColor: rank >= 3 ? '#f0f0f0' : 'transparent'
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: 0
    }}>
      <div style={{
        position: 'relative',
        background: '#fff',
        padding: '24px 20px 28px',
        borderRadius: '14px',
        boxShadow: '0 4px 30px rgba(0,0,0,0.25)',
        width: 'min(92vw, 420px)',
        maxHeight: '90vh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        margin: 'auto'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'transparent', border: 'none',
            fontSize: '1.4rem', cursor: 'pointer',
            color: '#888', lineHeight: 1, padding: 0
          }}
          aria-label="Close"
        >✖</button>

        <h2 style={{
          textAlign: 'center',
          fontSize: '1.4rem',
          fontWeight: 'bold',
          color: '#303036',
          marginBottom: '4px'
        }}>
          🏆 Today's High Scores
        </h2>
        <p style={{
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#aaa',
          marginBottom: '18px'
        }}>
          Resets every day at midnight ET
        </p>

        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e0e0e0',
          marginBottom: '20px'
        }}>
          <button style={tabStyle(activeMode === 'mini')} onClick={() => setActiveMode('mini')}>
            Mini SUMS (5×5)
          </button>
          <button style={tabStyle(activeMode === 'full')} onClick={() => setActiveMode('full')}>
            SUMS (7×7)
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#888', fontSize: '0.95rem' }}>
            Loading scores...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '30px 20px' }}>
            <p style={{ color: '#e53935', fontSize: '0.9rem', marginBottom: '14px' }}>{error}</p>
            <button
              onClick={loadScores}
              style={{
                padding: '8px 20px',
                borderRadius: '999px',
                border: '2px solid #303036',
                backgroundColor: '#fff',
                color: '#303036',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              Try Again
            </button>
          </div>
        ) : currentScores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎯</div>
            <p style={{ fontSize: '1rem', fontWeight: '500', color: '#888', marginBottom: '8px' }}>
              No scores yet today!
            </p>
            <p style={{ fontSize: '0.85rem', color: '#aaa' }}>
              Be the first to set a high score.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentScores.map((entry, idx) => {
              const isHighlighted = highlightEntry &&
                entry.name === highlightEntry.name &&
                entry.time_seconds === highlightEntry.time &&
                entry.mode === highlightEntry.mode;

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: isHighlighted ? '#e8f4fd' : idx === 0 ? '#fffbec' : '#f8f8f8',
                    border: isHighlighted
                      ? '2px solid #2196F3'
                      : idx === 0
                        ? '1.5px solid #FFD700'
                        : '1.5px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={rankBadgeStyle(idx)}>
                    {MEDAL_LABELS[idx]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '1rem',
                      color: '#303036',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {entry.name}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: '700',
                    fontSize: '1.05rem',
                    color: idx === 0 ? '#b8860b' : '#303036',
                    fontVariantNumeric: 'tabular-nums',
                    flexShrink: 0
                  }}>
                    {formatTime(entry.time_seconds)}
                  </div>
                  {isHighlighted && (
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#2196F3',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      YOU
                    </div>
                  )}
                </div>
              );
            })}

            {currentScores.length < 5 && (
              <div style={{
                textAlign: 'center',
                padding: '8px 0 0',
                color: '#ccc',
                fontSize: '0.8rem'
              }}>
                {5 - currentScores.length} spot{5 - currentScores.length !== 1 ? 's' : ''} remaining today
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HighScores;