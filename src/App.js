import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SumGridGame from './SumGridGame';
import PrivacyPolicy from './PrivacyPolicy';
import About from './About';
import Strategy from './Strategy';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SumGridGame />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/about" element={<About />} />
        <Route path="/strategy" element={<Strategy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;