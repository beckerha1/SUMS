import React from 'react';

const AboutModal = React.memo(({ onClose }) => {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      overflowY: "auto",
      backgroundColor: "rgba(0,0,0,0.6)",
      zIndex: 2000,
      padding: "16px",
      boxSizing: "border-box",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      touchAction: "manipulation"
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: '1.6',
        color: '#333',
        background: '#fff',
        borderRadius: '12px',
        position: 'relative',
        width: '100%',
        textAlign: 'left'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666',
            lineHeight: '1',
            padding: 0
          }}
          aria-label="Close"
        >
          ✖
        </button>

        <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>About SUMS</h1>
      
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>What is SUMS?</h2>
        <p>
          Sums is a daily number logic puzzle game that challenges you with spatial reasoning and addition.
          Each day brings a new puzzle with a unique solution path.
        </p>
        <p>
          The goal is simple: fill every empty cell by placing numbers in order (1, 2, 3, 4, 5...) 
          using addition. Select adjacent numbers that sum to your target, then place the result 
          in an empty cell touching your selection.
        </p>
      </section>

            <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>History of SUMS</h2>
        <p>
          When I was a kid, I always was playing around with puzzles and numbers and loved trying to find order in chaos. My father was a woodworker and always had graph paper lying around that he would use for work.
          With these two things happening, I began tinkering with the idea for SUMS. In between playing games of Sodoku and others, I would be playing my own SUMS games by hand.
          Given my continued love for games, and how much I play daily puzzles on other sites, I realized I wanted to share this same game with others. 
          I hope you enjoy playing as much as I do and have the same satisfaction as I do in solving puzzles!
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Game Features</h2>
        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li><strong>Daily Puzzles:</strong> A new challenge every day</li>
          <li><strong>Difficulty Modes:</strong> Normal mode or Hard mode with selection limits</li>
          <li><strong>Statistics Tracking:</strong> Track your wins, streaks, and completion times</li>
          <li><strong>Mobile Friendly:</strong> Play seamlessly on any device</li>
          <li><strong>No Account Required:</strong> Jump in and start playing immediately</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>How to Play</h2>
        <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>Look at the grid with pre-filled clue numbers (shown in gray)</li>
          <li>Start by placing the number 1, then 2, then 3, and so on in sequence</li>
          <li>To create each number, select 2 or more adjacent cells whose values add up to your target</li>
          <li>Click an empty cell touching the start or end of your selection to place the number</li>
          <li>Plan ahead! Some numbers are pre-filled and you must create valid paths to reach them</li>
          <li>Fill every empty cell to win!</li>
        </ol>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Tips & Strategies</h2>
        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>Gray numbers are pre-filled clues - work backwards from them to plan your path</li>
          <li>In Hard mode, you're limited to 3-4 selections, so choose combinations wisely</li>
          <li>Sometimes you need to place numbers in unexpected locations to maintain valid paths</li>
          <li>Use the Undo button to try different approaches</li>
          <li>Take your time - there's no time limit for solving</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>About Xavier Games</h2>
        <p>
          Sums is created by Xavier Games, dedicated to bringing you engaging daily puzzle 
          experiences. We believe in simple, elegant games that challenge your mind without 
          overwhelming you.
        </p>
        <p>
          Our games are free to play, ad-supported, and respect your privacy. We don't collect 
          personal information or require accounts - just open and play.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Contact</h2>
        <p>
          Have feedback, found a bug, or just want to say hi? We'd love to hear from you!
        </p>
        <p>
          Email us at: <a href="mailto:contact@sums.games" style={{ color: '#007bff' }}>contact@sums.games</a>
        </p>
      </section>
    </div>
    </div>
  );
});

export default AboutModal;