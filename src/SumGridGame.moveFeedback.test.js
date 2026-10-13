import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SumGridGame from './SumGridGame';

jest.mock('./puzzles/today', () => ({
  initialGrid: [
    [1, 3, null],
    [2, 6, 7],
    [9, null, null],
  ],
  puzzleNumber: '1',
}));

jest.mock('./puzzles/todayMini', () => ({
  initialGridMini: [
    [1, 3, null],
    [2, 6, 7],
    [9, null, null],
  ],
  puzzleNumberMini: '1',
}));

const rejectedEvents = () =>
  window.gtag.mock.calls.filter((call) => call[1] === 'move_rejected');

const messageLine = (container) => container.querySelector('[aria-live="polite"]');

const clickCell = (container, row, col) => {
  fireEvent.click(container.querySelector(`.cell-${row}-${col}`));
};

const playMini = () => {
  fireEvent.click(screen.getByRole('button', { name: /play mini sums/i }));
};

const renderGame = () => render(
  <MemoryRouter>
    <SumGridGame />
  </MemoryRouter>
);

const currentSum = () => screen.getByText(/Current:/).textContent.replace(/\s+/g, ' ').trim();

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('sums-warmup-done', '1');
  window.gtag = jest.fn();
  jest.useFakeTimers();
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

test('shows a fixed message line and explains an empty tap with nothing selected', () => {
  const { container } = renderGame();
  playMini();

  const line = messageLine(container);
  const grid = container.querySelector('.grid');
  expect(line).toHaveStyle({
    height: '22px',
    fontSize: '14px',
    color: '#555',
    textAlign: 'center'
  });
  expect(screen.getByAltText('SUMS').compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(line.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

  clickCell(container, 0, 2);
  expect(line).toHaveTextContent('Tap numbers that add up to 4 first, then an empty square.');
  expect(rejectedEvents()).toEqual([
    ['event', 'move_rejected', { game_mode: 'mini', reason: 'empty_first', next_number: 4 }]
  ]);

  clickCell(container, 0, 2);
  expect(rejectedEvents()).toHaveLength(1);

  act(() => {
    jest.advanceTimersByTime(2499);
  });
  expect(line).toHaveTextContent('Tap numbers that add up to 4 first, then an empty square.');
  act(() => {
    jest.advanceTimersByTime(1);
  });
  expect(line).toHaveTextContent('');
});

test('explains a wrong sum and clears the selection', () => {
  const { container } = renderGame();
  playMini();

  clickCell(container, 0, 0);
  expect(currentSum()).toBe('Current: 1');
  clickCell(container, 0, 2);

  expect(messageLine(container)).toHaveTextContent('That adds up to 1. You need 4.');
  expect(currentSum()).toBe('Current: 0');
  expect(rejectedEvents().map((call) => call[2].reason)).toEqual(['wrong_sum']);
});

test('keeps a correct sum selected when the empty square does not touch', () => {
  const { container } = renderGame();
  playMini();

  clickCell(container, 0, 0);
  clickCell(container, 0, 1);
  expect(currentSum()).toBe('Current: 4');
  clickCell(container, 2, 2);

  expect(messageLine(container)).toHaveTextContent('Put 4 in a square touching the last number you tapped.');
  expect(currentSum()).toBe('Current: 4');
  expect(container.querySelector('.cell-0-2').style.backgroundColor).toBe('rgb(179, 234, 242)');
  expect(container.querySelector('.cell-2-2').style.backgroundColor).not.toBe('rgb(179, 234, 242)');
  expect(rejectedEvents().map((call) => call[2].reason)).toEqual(['not_touching_last']);
});

test('explains a number that does not touch the last one and leaves the selection', () => {
  const { container } = renderGame();
  playMini();

  clickCell(container, 0, 0);
  clickCell(container, 2, 0);

  expect(messageLine(container)).toHaveTextContent("That number doesn't touch your last one. Diagonals count.");
  expect(currentSum()).toBe('Current: 1');

  clickCell(container, 1, 0);
  expect(currentSum()).toBe('Current: 3');
  expect(rejectedEvents().map((call) => call[2].reason)).toEqual(['chain_gap']);
});

test('replaces the hard-mode cap modal with a short message and clears the chain', () => {
  const { container } = renderGame();
  playMini();

  fireEvent.click(screen.getByRole('button', { name: 'Help' }));
  fireEvent.click(screen.getByRole('img', { name: 'fire' }));
  expect(screen.getByText(/HARD MODE \(Max 3 selections\)/)).toBeInTheDocument();

  clickCell(container, 0, 1);
  clickCell(container, 0, 0);
  clickCell(container, 1, 0);
  clickCell(container, 1, 1);

  expect(messageLine(container)).toHaveTextContent('Hard mode: chains can be at most 3 numbers.');
  expect(currentSum()).toBe('Current: 0');
  expect(screen.queryByRole('heading', { name: 'Notice' })).not.toBeInTheDocument();
  expect(rejectedEvents().map((call) => call[2].reason)).toEqual(['hard_mode_cap']);

  clickCell(container, 0, 1);
  clickCell(container, 0, 0);
  clickCell(container, 1, 0);
  clickCell(container, 1, 1);
  expect(rejectedEvents().filter((call) => call[2].reason === 'hard_mode_cap')).toHaveLength(1);
});

test('clears the message on undo without allowing the same rejection to be tracked again', () => {
  const { container } = renderGame();
  playMini();

  clickCell(container, 0, 2);
  expect(rejectedEvents()).toHaveLength(1);

  clickCell(container, 0, 0);
  clickCell(container, 0, 1);
  clickCell(container, 0, 2);
  act(() => {
    jest.advanceTimersByTime(20);
  });
  expect(screen.getByText(/Next:/)).toHaveTextContent('Next: 5');

  clickCell(container, 2, 1);
  expect(messageLine(container)).toHaveTextContent('Tap numbers that add up to 5 first, then an empty square.');
  expect(rejectedEvents()).toHaveLength(1);

  fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
  expect(messageLine(container)).toHaveTextContent('');
  expect(screen.getByText(/Next:/)).toHaveTextContent('Next: 4');

  clickCell(container, 0, 2);
  expect(messageLine(container)).toHaveTextContent('Tap numbers that add up to 4 first, then an empty square.');
  expect(rejectedEvents()).toHaveLength(1);
});

test('lets the same rejection be tracked again after Clear restarts the board', () => {
  const { container } = renderGame();
  playMini();

  clickCell(container, 0, 0);
  clickCell(container, 0, 1);
  clickCell(container, 0, 2);
  act(() => {
    jest.advanceTimersByTime(20);
  });

  clickCell(container, 2, 1);
  expect(rejectedEvents()).toEqual([
    ['event', 'move_rejected', { game_mode: 'mini', reason: 'empty_first', next_number: 5 }]
  ]);

  fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
  fireEvent.click(screen.getByRole('button', { name: 'Yes, Clear' }));

  clickCell(container, 0, 2);
  expect(rejectedEvents()).toEqual([
    ['event', 'move_rejected', { game_mode: 'mini', reason: 'empty_first', next_number: 5 }],
    ['event', 'move_rejected', { game_mode: 'mini', reason: 'empty_first', next_number: 4 }]
  ]);
});

test('resets tracked rejections when the game mode changes', () => {
  const { container } = renderGame();
  playMini();
  clickCell(container, 0, 2);
  expect(messageLine(container)).toHaveTextContent('Tap numbers that add up to 4 first, then an empty square.');

  fireEvent.click(screen.getByRole('button', { name: 'Help' }));
  fireEvent.click(screen.getByText('Return to home'));
  fireEvent.click(screen.getByRole('button', { name: /^play sums/i }));

  expect(messageLine(container)).toHaveTextContent('');
  clickCell(container, 0, 2);
  expect(rejectedEvents()).toEqual([
    ['event', 'move_rejected', { game_mode: 'mini', reason: 'empty_first', next_number: 4 }],
    ['event', 'move_rejected', { game_mode: 'full', reason: 'empty_first', next_number: 4 }]
  ]);
});
