import React from 'react';
import { Link } from 'react-router-dom';
import PageNav from './components/PageNav';
import { HOW_TO_STEPS } from './seo/content';

const pageWrapStyle = {
  minHeight: '100vh',
  background: '#f7f7f8',
  padding: '20px 12px',
  boxSizing: 'border-box',
};

const modalCardStyle = {
  width: 'min(100%, 800px)',
  margin: '0 auto',
  padding: 'clamp(20px, 5vw, 40px) clamp(14px, 4vw, 20px)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  lineHeight: '1.6',
  color: '#333',
  background: '#fff',
  borderRadius: '12px',
  position: 'relative',
};

const homeLinkStyle = {
  display: 'inline-block',
  marginBottom: '16px',
  color: '#303036',
  fontWeight: 600,
  textDecoration: 'none',
};

const ctaStyle = {
  display: 'inline-block',
  marginTop: '8px',
  marginRight: '12px',
  padding: '10px 20px',
  borderRadius: '999px',
  background: '#303036',
  color: '#fff',
  fontWeight: 600,
  textDecoration: 'none',
};

export default function HowToPlay() {
  return (
    <main style={pageWrapStyle}>
      <article style={modalCardStyle}>
        <Link to="/" style={homeLinkStyle}>← Play today’s puzzle</Link>
        <PageNav />

        <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>How to Play SUMS</h1>
        <p>
          SUMS is a free daily number logic puzzle. You fill a grid by placing numbers
          in order — 1, then 2, then 3, and so on — using addition and adjacency.
          Select connected cells that sum to the next number, then place that number
          in a touching empty cell.
        </p>
        <p>
          There are two puzzles each day: <strong>Mini SUMS (5×5)</strong> for a short
          solve, and <strong>Full SUMS (7×7)</strong> for a longer challenge. No account
          is required.
        </p>

        <section style={{ marginTop: '28px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Rules, step by step</h2>
          <ol style={{ marginLeft: '20px', lineHeight: '1.8', paddingLeft: '8px' }}>
            {HOW_TO_STEPS.map((step, index) => (
              <li key={step.name} id={`step-${index + 1}`} style={{ marginBottom: '14px' }}>
                <strong>{step.name}.</strong> {step.text}
              </li>
            ))}
          </ol>
        </section>

        <section style={{ marginTop: '28px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>A simple example</h2>
          <p>
            If 1 and 2 are already on the board and they touch, you can select them
            because 1 + 2 = 3. Then tap an empty cell next to that selection to place 3.
            Longer chains work the same way: 1 + 2 + 3 = 6, as long as each selected
            cell touches the next.
          </p>
          <p>
            Gray numbers are clues. They already count as placed, so you must leave a
            legal path that still reaches them when that number comes up in the sequence.
          </p>
        </section>

        <section style={{ marginTop: '28px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Mini vs Full vs Hard mode</h2>
          <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
            <li><strong>Mini:</strong> 5×5 grid, usually solvable in a few minutes.</li>
            <li><strong>Full:</strong> 7×7 grid with more clues, walls, and planning.</li>
            <li><strong>Hard mode:</strong> limits a selection to three or four cells, so each sum has to be tighter.</li>
          </ul>
        </section>

        <section style={{ marginTop: '28px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Tips before you start</h2>
          <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
            <li>Work backward from gray clues when the next placement looks ambiguous.</li>
            <li>Black squares are walls. They create corridors where one wrong number can block a whole path.</li>
            <li>There is no time limit. Use Undo to test a different route.</li>
            <li>New puzzles publish every day at midnight Eastern Time.</li>
          </ul>
          <p>
            For a deeper look at what makes a board easy or hard, read the{' '}
            <Link to="/strategy" style={{ color: '#303036', fontWeight: 600 }}>SUMS strategy guide</Link>.
            Common questions are answered in the{' '}
            <Link to="/faq" style={{ color: '#303036', fontWeight: 600 }}>FAQ</Link>.
          </p>
        </section>

        <p style={{ marginTop: '28px' }}>
          <Link to="/" style={ctaStyle}>Play SUMS</Link>
        </p>
      </article>
    </main>
  );
}
