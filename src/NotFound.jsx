import React from 'react';
import { Link } from 'react-router-dom';
import SiteLinks from './components/SiteLinks';

const pageWrapStyle = {
  minHeight: '100vh',
  background: '#f7f7f8',
  padding: '40px 16px',
  boxSizing: 'border-box',
  display: 'flex',
  justifyContent: 'center',
};

const cardStyle = {
  width: 'min(100%, 560px)',
  margin: '0 auto',
  padding: '36px 24px',
  background: '#fff',
  borderRadius: '12px',
  textAlign: 'center',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: '#333',
  lineHeight: 1.6,
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

export default function NotFound() {
  return (
    <main style={pageWrapStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Page not found</h1>
        <p>
          That link does not go to a SUMS page. The daily number puzzle is still
          waiting on the home page.
        </p>
        <p>
          <Link to="/" style={ctaStyle}>Play SUMS</Link>
        </p>
        <div style={{ marginTop: '28px', fontSize: '0.95rem' }}>
          <SiteLinks />
        </div>
      </div>
    </main>
  );
}
