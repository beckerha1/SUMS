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

function playWarmupWin() {
  fireEvent.click(screen.getByRole('button', { name: 'New here? Try a quick warm-up' }));
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(16);
  WARMUP_MOVES.forEach((move) => {
    move.forEach(([row, col]) => clickWarmupCell(row, col));
    advance(30);
  });
  advance(4000);
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

test('offers a warm-up on the first-visit last screen and the start screen', () => {
  jest.useFakeTimers();
  renderGame();

  expect(screen.getByRole('button', { name: 'New here? Try a quick warm-up' })).toBeInTheDocument();

  finishTutorial();
  const ready = screen.getByRole('heading', { name: /ready to play/i });
  const lastScreen = within(ready.parentElement);
  expect(lastScreen.getByRole('button', { name: 'Play a warm-up puzzle' })).toBeInTheDocument();
  expect(lastScreen.getByText('4×4, about a minute')).toBeInTheDocument();
  expect(lastScreen.getByRole('button', { name: "Skip to today's Mini" })).toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: "Play today's Mini" })).not.toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: 'Or play the full 7×7' })).not.toBeInTheDocument();
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

test('hides the warm-up offer when storage throws', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    if (key === 'sums-warmup-done') throw new Error('storage blocked');
    return null;
  });

  renderGame();

  expect(screen.queryByRole('button', { name: 'New here? Try a quick warm-up' })).not.toBeInTheDocument();
});

test('Play a warm-up puzzle fires game_start with warmup', () => {
  jest.useFakeTimers();
  renderGame();
  finishTutorial();

  const ready = screen.getByRole('heading', { name: /ready to play/i });
  fireEvent.click(within(ready.parentElement).getByRole('button', { name: 'Play a warm-up puzzle' }));

  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'warmup' }]
  ]);
  expect(gtagCalls('tutorial_close')).toEqual([]);
  expect(screen.queryByLabelText('Close instructions')).not.toBeInTheDocument();
  expect(localStorage.getItem('sums-tutorial-seen')).toBe('1');
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(16);
  const label = screen.getByText('Warm-up puzzle');
  expect(label).toHaveStyle({ fontSize: '13px', color: 'rgb(102, 102, 102)' });
});

test("Skip to today's Mini starts the mini puzzle", () => {
  jest.useFakeTimers();
  renderGame();
  finishTutorial();

  const ready = screen.getByRole('heading', { name: /ready to play/i });
  fireEvent.click(within(ready.parentElement).getByRole('button', { name: "Skip to today's Mini" }));

  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'mini' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(25);
  expect(localStorage.getItem('sums-warmup-done')).toBeNull();
});

test('the start screen warm-up link fires game_start with warmup', () => {
  renderGame();

  fireEvent.click(screen.getByRole('button', { name: 'New here? Try a quick warm-up' }));

  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'warmup' }]
  ]);
  expect(localStorage.getItem('sums-tutorial-seen')).toBe('1');
  expect(screen.getByText('Warm-up puzzle')).toBeInTheDocument();
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(16);
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

test('hint cooldown counts down during a warm-up', () => {
  jest.useFakeTimers();
  localStorage.setItem('sums-tutorial-seen', '1');
  renderGame();

  fireEvent.click(screen.getByRole('button', { name: 'New here? Try a quick warm-up' }));
  fireEvent.click(screen.getByRole('button', { name: 'Hint' }));
  advance(800);

  expect(screen.getByRole('button', { name: 'Hint (5)' })).toBeDisabled();
  advance(1000);
  expect(screen.getByRole('button', { name: 'Hint (4)' })).toBeDisabled();
});
