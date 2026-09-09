import React from 'react';
import { Link } from 'react-router-dom';

const linkStyle = {
  margin: '0 10px',
  color: '#666',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
};

export default function SiteLinks() {
  return (
    <nav
      aria-label="About this site"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        rowGap: '8px',
      }}
    >
      <Link to="/how-to-play" style={linkStyle}>How to Play</Link>
      <Link to="/strategy" style={linkStyle}>Strategy</Link>
      <Link to="/faq" style={linkStyle}>FAQ</Link>
      <Link to="/about" style={linkStyle}>About</Link>
      <Link to="/privacy" style={linkStyle}>Privacy Policy</Link>
    </nav>
  );
}
