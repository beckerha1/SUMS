import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/how-to-play', label: 'How to Play' },
  { to: '/strategy', label: 'Strategy' },
  { to: '/faq', label: 'FAQ' },
  { to: '/about', label: 'About' },
];

const linkStyle = {
  color: '#303036',
  fontWeight: 600,
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
};

export default function PageNav() {
  const { pathname } = useLocation();
  const current = pathname.replace(/\/$/, '') || '/';

  return (
    <nav aria-label="Learn SUMS" style={{ margin: '0 0 22px', fontSize: '0.95rem' }}>
      {links.map((item, index) => (
        <span key={item.to}>
          {index > 0 && <span style={{ color: '#ccc' }}> · </span>}
          {current === item.to ? (
            <strong>{item.label}</strong>
          ) : (
            <Link to={item.to} style={linkStyle}>{item.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
