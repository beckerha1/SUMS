import React from 'react';
import { render, screen } from '@testing-library/react';
import FireworksCelebration, { prefersReducedMotion } from './FireworksCelebration';

const makeCtx = () => ({
  setTransform: jest.fn(),
  scale: jest.fn(),
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
});

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => makeCtx());
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(16), 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
});

afterEach(() => {
  jest.clearAllTimers();
});

test('renders nothing when inactive', () => {
  const { container } = render(<FireworksCelebration active={false} />);
  expect(container.firstChild).toBeNull();
});

test('renders canvas and win banner when a game is completed', () => {
  render(<FireworksCelebration active showBanner />);
  expect(screen.getByTestId('fireworks-celebration')).toBeInTheDocument();
  expect(screen.getByTestId('fireworks-canvas')).toBeInTheDocument();
  expect(screen.getByText(/you won/i)).toBeInTheDocument();
  expect(screen.getByText(/puzzle complete/i)).toBeInTheDocument();
});

test('hides the banner once the win modal takes over', () => {
  render(<FireworksCelebration active showBanner={false} linger />);
  expect(screen.queryByText(/you won/i)).not.toBeInTheDocument();
  expect(screen.getByTestId('fireworks-canvas')).toBeInTheDocument();
});

test('skips canvas animation when the player prefers reduced motion', () => {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: String(query).includes('prefers-reduced-motion'),
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
  render(<FireworksCelebration active showBanner />);
  expect(prefersReducedMotion()).toBe(true);
  expect(screen.getByText(/you won/i)).toBeInTheDocument();
  expect(screen.getByTestId('fireworks-canvas')).toHaveStyle({ visibility: 'hidden' });
});
