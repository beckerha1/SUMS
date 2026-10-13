import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SumGridGame from './SumGridGame';
import * as dailyStreak from './utils/dailyStreak';

function renderGame() {
  return render(
    <MemoryRouter>
      <SumGridGame />
    </MemoryRouter>
  );
}

function gtagCalls(name) {
  return window.gtag.mock.calls.filter((call) => call[1] === name);
}

function advance(ms) {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
}

function clickGridCell(row, col) {
  const cells = [...document.querySelectorAll('div')].filter(
    (el) => el.style.width === '60px' && el.style.cursor === 'pointer' && el.style.position !== 'absolute'
  );
  if (cells.length !== 9) {
    throw new Error(`expected 9 tutorial cells, found ${cells.length}`);
  }
  fireEvent.click(cells[row * 3 + col]);
}

function place(cells) {
  cells.forEach(([row, col]) => clickGridCell(row, col));
  advance(200);
}

function clickEnabledNext() {
  const next = screen.getByRole('button', { name: 'Next' });
  expect(next).toBeEnabled();
  fireEvent.click(next);
}

function finishTutorial() {
  clickEnabledNext();
  advance(4500);
  clickEnabledNext();
  place([[0, 0], [1, 0], [1, 1]]);
  clickEnabledNext();
  clickEnabledNext();
  advance(4000);
  clickEnabledNext();
  place([[0, 0], [0, 1], [1, 0], [2, 0]]);
  place([[1, 0], [1, 1], [1, 2]]);
  place([[0, 0], [1, 0], [1, 1], [0, 2]]);
  place([[0, 1], [1, 2], [2, 1]]);
  clickEnabledNext();
  expect(screen.getByRole('heading', { name: /ready to play/i })).toBeInTheDocument();
}

function clickWarmupCell(row, col) {
  const cell = document.querySelector(`.cell-${row}-${col}`);
  if (!cell) throw new Error(`missing warm-up cell ${row},${col}`);
  fireEvent.click(cell);
}

const WARMUP_MOVES = [
  [[1, 2], [2, 2], [2, 1]],
  [[2, 1], [1, 2], [0, 1]],
  [[0, 1], [1, 2], [1, 3]],
  [[2, 1], [2, 2], [3, 2]],
  [[1, 3], [2, 2], [3, 1]],
  [[2, 0], [1, 1], [0, 0]],
  [[2, 1], [3, 2], [2, 3]],
  [[0, 0], [1, 1], [0, 2]],
  [[3, 1], [2, 1], [1, 0]]
];

function playWarmupMoves() {
  WARMUP_MOVES.forEach((move) => {
    move.forEach(([row, col]) => clickWarmupCell(row, col));
    advance(30);
  });
  advance(4000);
}

function boldClueNumbers() {
  return [...document.querySelectorAll('div')]
    .filter((el) => el.style.fontWeight === 'bold' && el.style.position === 'absolute' && /^\d+$/.test(el.textContent.trim()))
    .map((el) => el.textContent.trim())
    .sort();
}

function playWarmupWin() {
  fireEvent.click(screen.getByRole('button', { name: /play mini sums/i }));
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(16);
  playWarmupMoves();
}

beforeEach(() => {
  localStorage.clear();
  window.gtag = jest.fn();
  HTMLCanvasElement.prototype.getContext = jest.fn(() => null);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  localStorage.clear();
  delete window.gtag;
});

test('start screen has no warm-up link and the last tutorial screen shows the daily buttons', () => {
  jest.useFakeTimers();
  renderGame();

  expect(screen.queryByRole('button', { name: 'New here? Try a quick warm-up' })).not.toBeInTheDocument();

  finishTutorial();
  const ready = screen.getByRole('heading', { name: /ready to play/i });
  const lastScreen = within(ready.parentElement);
  expect(lastScreen.getByRole('button', { name: "Play today's Mini" })).toBeInTheDocument();
  expect(lastScreen.getByRole('button', { name: 'Or play the full 7×7' })).toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: 'Play a warm-up puzzle' })).not.toBeInTheDocument();
  expect(lastScreen.queryByText('4×4, about a minute')).not.toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: "Skip to today's Mini" })).not.toBeInTheDocument();
});

test('keeps the everyday last screen after the warm-up is finished', () => {
  jest.useFakeTimers();
  localStorage.setItem('sums-warmup-done', '1');
  renderGame();

  expect(screen.queryByRole('button', { name: 'New here? Try a quick warm-up' })).not.toBeInTheDocument();

  finishTutorial();
  const ready = screen.getByRole('heading', { name: /ready to play/i });
  const lastScreen = within(ready.parentElement);
  expect(lastScreen.getByRole('button', { name: "Play today's Mini" })).toBeInTheDocument();
  expect(lastScreen.getByRole('button', { name: 'Or play the full 7×7' })).toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: 'Play a warm-up puzzle' })).not.toBeInTheDocument();
});

test('keeps the everyday last screen when a game history exists', () => {
  jest.useFakeTimers();
  localStorage.setItem('sums-game-history', '[]');
  renderGame();

  expect(screen.queryByLabelText('Close instructions')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'New here? Try a quick warm-up' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'How to play' }));
  finishTutorial();
  expect(screen.getByRole('button', { name: "Play today's Mini" })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Or play the full 7×7' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Play a warm-up puzzle' })).not.toBeInTheDocument();
});

test('storage errors send Play Mini and Play SUMS to the daily puzzles', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    if (key === 'sums-warmup-done') throw new Error('storage blocked');
    return null;
  });

  const first = renderGame();
  expect(screen.queryByRole('button', { name: 'New here? Try a quick warm-up' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /play mini sums/i }));
  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'mini' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(25);
  first.unmount();

  window.gtag.mockClear();
  renderGame();
  fireEvent.click(screen.getByRole('button', { name: /^Play SUMS/ }));
  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'full' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(49);
  expect(screen.queryByText('Warm-up puzzle')).not.toBeInTheDocument();
});

test("Play today's Mini on a first visit starts the 4x4 warm-up", () => {
  jest.useFakeTimers();
  renderGame();
  finishTutorial();

  const ready = screen.getByRole('heading', { name: /ready to play/i });
  fireEvent.click(within(ready.parentElement).getByRole('button', { name: "Play today's Mini" }));

  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'warmup' }]
  ]);
  expect(gtagCalls('tutorial_close')).toEqual([]);
  expect(screen.queryByLabelText('Close instructions')).not.toBeInTheDocument();
  expect(localStorage.getItem('sums-tutorial-seen')).toBe('1');
  expect(localStorage.getItem('sums-game-history')).toBeNull();
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(16);
  expect(document.querySelector('.cell-0-3')).toHaveStyle({ backgroundColor: 'rgb(48, 48, 54)' });
  expect(document.querySelector('.cell-1-1')).toHaveStyle({ backgroundColor: 'rgb(227, 230, 236)' });
  expect(boldClueNumbers()).toEqual(['1', '2', '3', '8']);
  expect(screen.getByText(/Goal:/)).toHaveTextContent('Goal: 13');
  const label = screen.getByText('Warm-up puzzle');
  expect(label).toHaveStyle({ fontSize: '13px', color: 'rgb(102, 102, 102)' });
});

test('Or play the full 7×7 on a first visit starts the 7×7 warm-up', () => {
  jest.useFakeTimers();
  renderGame();
  finishTutorial();

  const ready = screen.getByRole('heading', { name: /ready to play/i });
  fireEvent.click(within(ready.parentElement).getByRole('button', { name: 'Or play the full 7×7' }));

  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'warmupFull' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(49);
  expect(document.querySelector('.cell-0-4')).toHaveStyle({ backgroundColor: 'rgb(48, 48, 54)' });
  expect(document.querySelector('.cell-6-6')).toHaveStyle({ backgroundColor: 'rgb(48, 48, 54)' });
  expect(document.querySelector('.cell-1-1')).toHaveStyle({ backgroundColor: 'rgb(227, 230, 236)' });
  expect(boldClueNumbers()).toEqual(['1', '2', '3', '8']);
  expect(screen.getByText(/Goal:/)).toHaveTextContent('Goal: 13');
  expect(screen.getByText('Warm-up puzzle')).toBeInTheDocument();
  expect(localStorage.getItem('sums-game-history')).toBeNull();
});

test('Play Mini SUMS on a first visit uses the 4×4 warm-up and does not write history', () => {
  renderGame();

  fireEvent.click(screen.getByRole('button', { name: /play mini sums/i }));

  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'warmup' }]
  ]);
  expect(localStorage.getItem('sums-tutorial-seen')).toBe('1');
  expect(localStorage.getItem('sums-game-history')).toBeNull();
  expect(screen.getByText('Warm-up puzzle')).toBeInTheDocument();
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(16);
  expect(document.querySelector('.cell-0-3')).toHaveStyle({ backgroundColor: 'rgb(48, 48, 54)' });
  expect(document.querySelector('.cell-1-1')).toHaveStyle({ backgroundColor: 'rgb(227, 230, 236)' });
  expect(boldClueNumbers()).toEqual(['1', '2', '3', '8']);
});

test('Play SUMS on a first visit uses the 7×7 warm-up grid', () => {
  renderGame();

  fireEvent.click(screen.getByRole('button', { name: /^Play SUMS/ }));

  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'warmupFull' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(49);
  expect(document.querySelector('.cell-6-0')).toHaveStyle({ backgroundColor: 'rgb(48, 48, 54)' });
  expect(document.querySelector('.cell-1-1')).toHaveStyle({ backgroundColor: 'rgb(227, 230, 236)' });
  expect(boldClueNumbers()).toEqual(['1', '2', '3', '8']);
  expect(screen.getByText('Warm-up puzzle')).toBeInTheDocument();
  expect(screen.getByText(/Goal:/)).toHaveTextContent('Goal: 13');
  expect(localStorage.getItem('sums-game-history')).toBeNull();
});

test('winning a warm-up does not record a daily result and shows the done screen', () => {
  jest.useFakeTimers();
  const recordSpy = jest.spyOn(dailyStreak, 'recordDailyPuzzleWin');
  localStorage.setItem('sums-best-time-mini', '99');
  localStorage.setItem('sums-best-time-full', '50');
  renderGame();

  playWarmupWin();

  expect(recordSpy).not.toHaveBeenCalled();
  expect(localStorage.getItem('sums-warmup-done')).toBe('1');
  expect(localStorage.getItem('sums-game-history')).toBeNull();
  expect(localStorage.getItem('sums-best-time-mini')).toBe('99');
  expect(localStorage.getItem('sums-best-time-full')).toBe('50');
  expect(localStorage.getItem('sums-best-time')).toBeNull();
  expect(localStorage.getItem('sums-daily-streak-mini-count')).toBeNull();
  expect(localStorage.getItem('sums-daily-streak-full-count')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Warm-up done' })).toBeInTheDocument();
  expect(screen.getByText("That's the whole game. Daily puzzles are bigger, and they get harder through the week. Mondays are the easiest.")).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /you won/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /high scores/i })).not.toBeInTheDocument();
  expect(gtagCalls('game_complete')).toEqual([
    ['event', 'game_complete', expect.objectContaining({ game_mode: 'warmup' })]
  ]);

  fireEvent.click(screen.getByRole('button', { name: 'Back to home' }));

  expect(screen.getByRole('heading', { name: /daily number puzzle game/i })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Warm-up done' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'New here? Try a quick warm-up' })).not.toBeInTheDocument();
});

test("Play today's Mini on the done screen starts today's Mini", () => {
  jest.useFakeTimers();
  renderGame();
  playWarmupWin();

  fireEvent.click(screen.getByRole('button', { name: "Play today's Mini" }));

  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'warmup' }],
    ['event', 'game_start', { game_mode: 'mini' }]
  ]);
  expect(screen.queryByRole('heading', { name: 'Warm-up done' })).not.toBeInTheDocument();
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(25);
});

test('Close on the done screen returns home and drops the offer', () => {
  jest.useFakeTimers();
  renderGame();
  playWarmupWin();

  fireEvent.click(screen.getByRole('button', { name: 'Close' }));

  expect(screen.getByRole('heading', { name: /daily number puzzle game/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'New here? Try a quick warm-up' })).not.toBeInTheDocument();
});

test('after the warm-up is done, Play Mini and Play SUMS are the daily puzzles', () => {
  localStorage.setItem('sums-warmup-done', '1');
  localStorage.setItem('sums-tutorial-seen', '1');
  const first = renderGame();

  fireEvent.click(screen.getByRole('button', { name: /play mini sums/i }));
  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'mini' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(25);
  expect(screen.queryByText('Warm-up puzzle')).not.toBeInTheDocument();
  expect(boldClueNumbers()).not.toEqual(['1', '2', '3', '8']);
  first.unmount();

  window.gtag = jest.fn();
  renderGame();
  fireEvent.click(screen.getByRole('button', { name: /^Play SUMS/ }));
  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'full' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(49);
  expect(screen.queryByText('Warm-up puzzle')).not.toBeInTheDocument();
  expect(boldClueNumbers()).not.toEqual(['1', '2', '3', '8']);
});

test('when a game history exists, Play Mini and Play SUMS are the daily puzzles', () => {
  localStorage.setItem('sums-game-history', '[]');
  const first = renderGame();

  fireEvent.click(screen.getByRole('button', { name: /play mini sums/i }));
  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'mini' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(25);
  expect(screen.queryByText('Warm-up puzzle')).not.toBeInTheDocument();
  first.unmount();

  window.gtag = jest.fn();
  renderGame();
  fireEvent.click(screen.getByRole('button', { name: /^Play SUMS/ }));
  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'full' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(49);
  expect(screen.queryByText('Warm-up puzzle')).not.toBeInTheDocument();
  expect(boldClueNumbers()).not.toEqual(['1', '2', '3', '8']);
});

test('winning the 7×7 warm-up skips daily records and shows the done screen', () => {
  jest.useFakeTimers();
  const recordSpy = jest.spyOn(dailyStreak, 'recordDailyPuzzleWin');
  localStorage.setItem('sums-best-time-mini', '99');
  localStorage.setItem('sums-best-time-full', '50');
  renderGame();

  fireEvent.click(screen.getByRole('button', { name: /^Play SUMS/ }));
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(49);
  playWarmupMoves();

  expect(recordSpy).not.toHaveBeenCalled();
  expect(localStorage.getItem('sums-warmup-done')).toBe('1');
  expect(localStorage.getItem('sums-game-history')).toBeNull();
  expect(localStorage.getItem('sums-best-time-mini')).toBe('99');
  expect(localStorage.getItem('sums-best-time-full')).toBe('50');
  expect(localStorage.getItem('sums-daily-streak-mini-count')).toBeNull();
  expect(localStorage.getItem('sums-daily-streak-full-count')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Warm-up done' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /you won/i })).not.toBeInTheDocument();
  expect(gtagCalls('game_complete')).toEqual([
    ['event', 'game_complete', expect.objectContaining({ game_mode: 'warmupFull' })]
  ]);

  fireEvent.click(screen.getByRole('button', { name: "Play today's Mini" }));
  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'warmupFull' }],
    ['event', 'game_start', { game_mode: 'mini' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(25);
  expect(screen.queryByText('Warm-up puzzle')).not.toBeInTheDocument();
});

test('hint cooldown counts down during a 4×4 warm-up', () => {
  jest.useFakeTimers();
  localStorage.setItem('sums-tutorial-seen', '1');
  renderGame();

  fireEvent.click(screen.getByRole('button', { name: /play mini sums/i }));
  fireEvent.click(screen.getByRole('button', { name: 'Hint' }));
  advance(800);

  expect(screen.getByRole('button', { name: 'Hint (5)' })).toBeDisabled();
  advance(1000);
  expect(screen.getByRole('button', { name: 'Hint (4)' })).toBeDisabled();
});

test('hint cooldown counts down during a 7×7 warm-up', () => {
  jest.useFakeTimers();
  localStorage.setItem('sums-tutorial-seen', '1');
  renderGame();

  fireEvent.click(screen.getByRole('button', { name: /^Play SUMS/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Hint' }));
  advance(800);

  expect(screen.getByRole('button', { name: 'Hint (5)' })).toBeDisabled();
  advance(1000);
  expect(screen.getByRole('button', { name: 'Hint (4)' })).toBeDisabled();
});
