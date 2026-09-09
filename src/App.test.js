import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the SUMS start screen', () => {
  render(<App />);
  expect(screen.getByAltText(/sums logo/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /play mini sums/i })).toBeInTheDocument();
});
