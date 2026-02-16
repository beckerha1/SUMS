import React, { useState } from 'react';
import { formatTime } from '../utils/gameHelpers';

const Statistics = ({ onClose, bestTimeMini, bestTimeFull, gameHistory, onResetStats }) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  // Only count completed games (games with recorded times)
  const miniGames = gameHistory.filter(g => g.mode === 'mini' && g.time);
  const fullGames = gameHistory.filter(g => g.mode === 'full' && g.time);
  
  const avgTimeMini = miniGames.length > 0 
    ? Math.floor(miniGames.reduce((sum, g) => sum + g.time, 0) / miniGames.length)
    : null;
    
  const avgTimeFull = fullGames.length > 0
    ? Math.floor(fullGames.reduce((sum, g) => sum + g.time, 0) / fullGames.length)
    : null;

  const totalCompleted = miniGames.length + fullGames.length;

  const statBoxStyle = {
    backgroundColor: '#f8f8f8',
    padding: 'clamp(10px, 3vw, 14px)',
    borderRadius: '8px',
    marginBottom: 'clamp(10px, 3vw, 14px)'
  };

  const statRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'clamp(8px, 2vw, 12px)',
    fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
    gap: '8px'
  };

  const labelStyle = {
    color: '#666',
    fontWeight: '500',
    flex: '1',
    textAlign: 'left'
  };

  const valueStyle = {
    color: '#303036',
    fontWeight: 'bold',
    fontSize: 'clamp(0.95rem, 2.8vw, 1.15rem)',
    whiteSpace: 'nowrap'
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
      padding: "16px"
    }}>
      <div style={{
        position: "relative",
        background: "#fff",
        padding: "clamp(16px, 4vw, 24px) clamp(12px, 3vw, 20px)",
        borderRadius: "12px",
        boxShadow: "0 0 20px rgba(0,0,0,0.3)",
        maxWidth: "420px",
        width: "100%",
        maxHeight: "85vh",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        boxSizing: "border-box"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "transparent",
            border: "none",
            fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
            cursor: "pointer",
            color: "#666",
            lineHeight: "1",
            padding: "4px"
          }}
          aria-label="Close statistics"
        >
          ✖
        </button>

        <h2 style={{ 
          marginBottom: "clamp(12px, 3vw, 18px)", 
          fontSize: "clamp(1.2rem, 4vw, 1.5rem)", 
          color: "#303036",
          textAlign: "center",
          fontWeight: "bold",
          paddingRight: "24px"
        }}>
          Statistics 📊
        </h2>

        {/* Mini SUMS Stats */}
        <div style={statBoxStyle}>
          <h3 style={{ 
            marginBottom: "clamp(8px, 2vw, 12px)", 
            fontSize: "clamp(0.95rem, 3vw, 1.1rem)", 
            color: "#303036",
            borderBottom: "2px solid #303036",
            paddingBottom: "4px",
            fontWeight: "bold"
          }}>
            Mini SUMS (5×5)
          </h3>
          
          <div style={statRowStyle}>
            <span style={labelStyle}>Best Time:</span>
            <span style={valueStyle}>
              {bestTimeMini && miniGames.length > 0 ? formatTime(bestTimeMini) : "—"}
            </span>
          </div>
          
          <div style={statRowStyle}>
            <span style={labelStyle}>Average Time:</span>
            <span style={valueStyle}>
              {avgTimeMini ? formatTime(avgTimeMini) : "—"}
            </span>
          </div>
          
          <div style={{...statRowStyle, marginBottom: 0}}>
            <span style={labelStyle}>Games Played:</span>
            <span style={valueStyle}>{miniGames.length}</span>
          </div>
        </div>

        {/* Full SUMS Stats */}
        <div style={statBoxStyle}>
          <h3 style={{ 
            marginBottom: "clamp(8px, 2vw, 12px)", 
            fontSize: "clamp(0.95rem, 3vw, 1.1rem)", 
            color: "#303036",
            borderBottom: "2px solid #303036",
            paddingBottom: "4px",
            fontWeight: "bold"
          }}>
            Full SUMS (7×7)
          </h3>
          
          <div style={statRowStyle}>
            <span style={labelStyle}>Best Time:</span>
            <span style={valueStyle}>
              {bestTimeFull && fullGames.length > 0 ? formatTime(bestTimeFull) : "—"}
            </span>
          </div>
          
          <div style={statRowStyle}>
            <span style={labelStyle}>Average Time:</span>
            <span style={valueStyle}>
              {avgTimeFull ? formatTime(avgTimeFull) : "—"}
            </span>
          </div>
          
          <div style={{...statRowStyle, marginBottom: 0}}>
            <span style={labelStyle}>Games Played:</span>
            <span style={valueStyle}>{fullGames.length}</span>
          </div>
        </div>

        {totalCompleted === 0 && (
          <p style={{
            textAlign: 'center',
            color: '#999',
            marginTop: '8px',
            marginBottom: '0',
            fontSize: 'clamp(0.8rem, 2.2vw, 0.9rem)',
            fontStyle: 'italic'
          }}>
            Complete your first game to see stats!
          </p>
        )}

        {/* Reset Statistics Button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          style={{
            width: '100%',
            padding: 'clamp(10px, 2.5vw, 12px)',
            marginTop: 'clamp(10px, 2.5vw, 14px)',
            marginBottom: '4px',
            fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
            borderRadius: '8px',
            border: '2px solid #e53935',
            backgroundColor: '#fff',
            color: '#e53935',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e53935';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.color = '#e53935';
          }}
        >
          Reset Statistics
        </button>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 3001,
            padding: "16px"
          }}>
            <div style={{
              background: "#fff",
              padding: "clamp(20px, 5vw, 30px)",
              borderRadius: "12px",
              boxShadow: "0 0 20px rgba(0,0,0,0.3)",
              textAlign: "center",
              maxWidth: "380px",
              width: "100%",
              boxSizing: "border-box"
            }}>
              <h3 style={{ 
                marginBottom: "16px", 
                fontSize: "clamp(1.1rem, 3.5vw, 1.3rem)", 
                color: "#303036" 
              }}>
                Reset Statistics?
              </h3>
              <p style={{ 
                marginBottom: "20px", 
                fontSize: "clamp(0.9rem, 2.8vw, 1rem)", 
                lineHeight: "1.5", 
                color: "#555" 
              }}>
                Are you sure you want to reset all of your historical game progress?
              </p>
              
              <div style={{ 
                display: "flex", 
                gap: "10px", 
                justifyContent: "center",
                flexWrap: "wrap"
              }}>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  style={{
                    padding: "10px 20px",
                    fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
                    borderRadius: "24px",
                    border: "2px solid #303036",
                    backgroundColor: "#fff",
                    color: "#303036",
                    cursor: "pointer",
                    fontWeight: "600",
                    minWidth: "90px",
                    flex: "1",
                    maxWidth: "120px"
                  }}
                >
                  No
                </button>
                <button
                  onClick={() => {
                    onResetStats();
                    setShowResetConfirm(false);
                    onClose();
                  }}
                  style={{
                    padding: "10px 20px",
                    fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
                    borderRadius: "24px",
                    border: "none",
                    backgroundColor: "#e53935",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "600",
                    minWidth: "90px",
                    flex: "1",
                    maxWidth: "120px"
                  }}
                >
                  Yes, Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;