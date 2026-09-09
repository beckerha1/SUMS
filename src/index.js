import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const crawler = document.getElementById('crawler-content');
if (crawler) {
  crawler.setAttribute('hidden', '');
  crawler.setAttribute('aria-hidden', 'true');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
