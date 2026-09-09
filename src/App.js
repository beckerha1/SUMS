import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SumGridGame from './SumGridGame';
import PrivacyPolicy from './PrivacyPolicy';
import About from './About';
import Strategy from './Strategy';
import HowToPlay from './HowToPlay';
import Faq from './Faq';
import NotFound from './NotFound';
import Seo from './seo/Seo';

function App() {
  return (
    <BrowserRouter>
      <Seo />
      <Routes>
        <Route path="/" element={<SumGridGame />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/about" element={<About />} />
        <Route path="/strategy" element={<Strategy />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
