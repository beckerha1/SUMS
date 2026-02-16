import React, { useEffect, useState } from 'react';
import { formatTime } from '../utils/gameHelpers';

const WinScreen = ({ 
  elapsedTime, 
  countdownToMidnight,
  onClose,
  onShare
}) => {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (window.adsbygoogle && !window.adsbygoogle.initialized) {
      try {
        window.adsbygoogle.push({});
        window.adsbygoogle.initialized = true;
        // Check if ad loaded after a short delay
        setTimeout(() => {
          const adElement = document.querySelector('.adsbygoogle');
          if (adElement && adElement.getAttribute('data-ad-status') === 'filled') {
            setAdLoaded(true);
          }
        }, 1000);
      } catch (e) {
        console.error("Adsbygoogle push error:", e);
      }
    }
  }, []);

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
      zIndex: 2000
    }}>
      <div style={{
        position: "relative",
        background: "#fff",
        padding: "40px 30px",
        borderRadius: "12px",
        boxShadow: "0 0 20px rgba(0,0,0,0.3)",
        textAlign: "center",
        maxWidth: "300px",
        width: "90%"
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

        <p style={{ marginTop: "20px", fontSize: "0.9rem", color: "#555" }}>
          New puzzle in: <strong>{countdownToMidnight}</strong>
        </p>

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "transparent",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
            touchAction: "manipulation"
          }}
          aria-label="Close win screen"
        >
          ✖
        </button>

        <h2 style={{ marginBottom: "10px" }}>
          <span role="img" aria-label="party popper">🎉</span> You Won!
        </h2>
        
        <p style={{ 
          fontSize: window.innerWidth < 600 ? '1.2rem' : '1rem', 
          lineHeight: '1.4', 
          marginBottom: '10px' 
        }}>
          Finished in {formatTime(elapsedTime)}
        </p>

        <div style={{ 
          display: "flex", 
          gap: "10px", 
          justifyContent: "center", 
          marginTop: "20px" 
        }}>
          <button
            onClick={onShare}
            style={{
              ...fullWidthButton,
              flex: 1
            }}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinScreen;