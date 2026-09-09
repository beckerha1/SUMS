import React from 'react';
import { Link } from 'react-router-dom';
import PageNav from './components/PageNav';
import { FAQ_ITEMS } from './seo/content';

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
  padding: '10px 20px',
  borderRadius: '999px',
  background: '#303036',
  color: '#fff',
  fontWeight: 600,
  textDecoration: 'none',
};

export default function Faq() {
  return (
    <main style={pageWrapStyle}>
      <article style={modalCardStyle}>
        <Link to="/" style={homeLinkStyle}>← Play today’s puzzle</Link>
        <PageNav />

        <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>SUMS FAQ</h1>
        <p>
          SUMS is a free daily number puzzle at sums.games. These are the questions
          people ask most often about how the game works.
        </p>

        {FAQ_ITEMS.map((item) => (
          <section key={item.question} style={{ marginTop: '28px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '10px' }}>{item.question}</h2>
            <p>{item.answer}</p>
          </section>
        ))}

        <p style={{ marginTop: '32px' }}>
          Want the full walkthrough? See{' '}
          <Link to="/how-to-play" style={{ color: '#303036', fontWeight: 600 }}>how to play SUMS</Link>
          {' '}or start a puzzle now.
        </p>
        <p>
          <Link to="/" style={ctaStyle}>Play today’s SUMS</Link>
        </p>
      </article>
    </main>
  );
}
