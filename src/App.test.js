import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import HowToPlay from './HowToPlay';
import Faq from './Faq';

test('renders the SUMS start screen', () => {
  render(<App />);
  expect(screen.getByAltText(/^sums$/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /daily number puzzle game/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /play mini sums/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /how to play/i })).toBeInTheDocument();
});

test('how to play page explains the rules', () => {
  render(
    <MemoryRouter>
      <HowToPlay />
    </MemoryRouter>
  );
  expect(screen.getByRole('heading', { name: /how to play sums/i })).toBeInTheDocument();
  expect(screen.getByText(/select connected cells that sum to the next number/i)).toBeInTheDocument();
});

test('faq page answers whether SUMS is free', () => {
  render(
    <MemoryRouter>
      <Faq />
    </MemoryRouter>
  );
  expect(screen.getByRole('heading', { name: /is sums free to play/i })).toBeInTheDocument();
});
