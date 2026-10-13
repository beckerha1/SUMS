import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SumGridGame from './SumGridGame';
import GameHeader from './components/GameHeader';
import WarmupDoneScreen from './components/WarmupDoneScreen';
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

function clickPracticeCell(row, col) {
  const cell = document.querySelector(`.cell-${row}-${col}`);
  if (!cell) throw new Error(`missing practice cell ${row},${col}`);
  fireEvent.click(cell);
}

const PRACTICE_MOVES = [
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

function playPracticeMoves() {
  PRACTICE_MOVES.forEach((move) => {
    move.forEach(([row, col]) => clickPracticeCell(row, col));
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

function openHowToPlay() {
  fireEvent.click(screen.getByRole('button', { name: 'How to play' }));
}

function lastTutorialScreen() {
  const ready = screen.getByRole('heading', { name: /ready to play/i });
  return within(ready.parentElement);
}

function continuePractice() {
  fireEvent.click(lastTutorialScreen().getByRole('button', { name: /^Play$/ }));
}

function expectNoWarmupCopy(node = document.body) {
  expect(node.textContent).not.toMatch(/warm-?up/i);
}

function playMiniPracticeWin() {
  localStorage.setItem('sums-tutorial-seen', '1');
  fireEvent.click(screen.getByRole('button', { name: /play mini sums/i }));
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(16);
  playPracticeMoves();
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

test('a first visit does not auto-open the tutorial, and How to play ends with Back', () => {
  jest.useFakeTimers();
  renderGame();

  expect(screen.queryByLabelText('Close instructions')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'New here? Try a quick warm-up' })).not.toBeInTheDocument();
  expect(gtagCalls('tutorial_view')).toEqual([]);
  expectNoWarmupCopy();

  openHowToPlay();
  finishTutorial();
  const lastScreen = lastTutorialScreen();
  expect(lastScreen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: /^Play$/ })).not.toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: "Play today's Mini" })).not.toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: 'Or play the full 7×7' })).not.toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: 'Play a warm-up puzzle' })).not.toBeInTheDocument();
  expectNoWarmupCopy(lastScreen.getByRole('heading', { name: /ready to play/i }).parentElement);

  fireEvent.click(lastScreen.getByRole('button', { name: 'Back' }));
  expect(screen.queryByLabelText('Close instructions')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /daily number puzzle game/i })).toBeInTheDocument();
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(0);
  expect(gtagCalls('game_start')).toEqual([]);
  expect(localStorage.getItem('sums-warmup-done')).toBeNull();
  expect(localStorage.getItem('sums-game-history')).toBeNull();
});

test('How to play for a returning player keeps the daily buttons', () => {
  jest.useFakeTimers();
  localStorage.setItem('sums-warmup-done', '1');
  renderGame();

  expect(screen.queryByLabelText('Close instructions')).not.toBeInTheDocument();
  openHowToPlay();
  expect(gtagCalls('tutorial_view')).toEqual([
    ['event', 'tutorial_view', { trigger: 'start_screen' }]
  ]);
  finishTutorial();
  const lastScreen = lastTutorialScreen();
  expect(lastScreen.getByRole('button', { name: "Play today's Mini" })).toBeInTheDocument();
  expect(lastScreen.getByRole('button', { name: 'Or play the full 7×7' })).toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: 'Play a warm-up puzzle' })).not.toBeInTheDocument();
  expectNoWarmupCopy(lastScreen.getByRole('heading', { name: /ready to play/i }).parentElement);

  fireEvent.click(lastScreen.getByRole('button', { name: 'Or play the full 7×7' }));
  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'full' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(49);
  expect(boldClueNumbers()).not.toEqual(['1', '2', '3', '8']);
});

test('How to play still opens the tutorial when a game history exists', () => {
  jest.useFakeTimers();
  localStorage.setItem('sums-game-history', '[]');
  renderGame();

  expect(screen.queryByLabelText('Close instructions')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'New here? Try a quick warm-up' })).not.toBeInTheDocument();

  openHowToPlay();
  finishTutorial();
  const lastScreen = lastTutorialScreen();
  expect(lastScreen.getByRole('button', { name: "Play today's Mini" })).toBeInTheDocument();
  expect(lastScreen.getByRole('button', { name: 'Or play the full 7×7' })).toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: 'Play a warm-up puzzle' })).not.toBeInTheDocument();

  fireEvent.click(lastScreen.getByRole('button', { name: "Play today's Mini" }));
  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'mini' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(25);
  expect(boldClueNumbers()).not.toEqual(['1', '2', '3', '8']);
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
  expectNoWarmupCopy();
});

test('first visit Play Mini opens the tutorial, then Play shows the 4×4 and does not write history', () => {
  jest.useFakeTimers();
  renderGame();

  fireEvent.click(screen.getByRole('button', { name: /play mini sums/i }));

  expect(screen.getByLabelText('Close instructions')).toBeInTheDocument();
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(0);
  expect(gtagCalls('tutorial_view')).toEqual([
    ['event', 'tutorial_view', { trigger: 'play_mini' }]
  ]);
  expect(gtagCalls('game_start')).toEqual([]);
  expect(localStorage.getItem('sums-game-history')).toBeNull();
  expect(localStorage.getItem('sums-warmup-done')).toBeNull();

  finishTutorial();
  const lastScreen = lastTutorialScreen();
  expect(lastScreen.getByRole('button', { name: /^Play$/ })).toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: "Play today's Mini" })).not.toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: 'Or play the full 7×7' })).not.toBeInTheDocument();
  expect(lastScreen.queryByText('5×5, a few minutes')).not.toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: 'Play a warm-up puzzle' })).not.toBeInTheDocument();
  expectNoWarmupCopy(lastScreen.getByRole('heading', { name: /ready to play/i }).parentElement);

  continuePractice();

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
  expectNoWarmupCopy();
});

test('first visit Play SUMS opens the tutorial, then Play shows the 7×7 practice board', () => {
  jest.useFakeTimers();
  renderGame();

  fireEvent.click(screen.getByRole('button', { name: /^Play SUMS/ }));

  expect(screen.getByLabelText('Close instructions')).toBeInTheDocument();
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(0);
  expect(gtagCalls('tutorial_view')).toEqual([
    ['event', 'tutorial_view', { trigger: 'play_full' }]
  ]);
  expect(gtagCalls('game_start')).toEqual([]);

  finishTutorial();
  const lastScreen = lastTutorialScreen();
  expect(lastScreen.getByRole('button', { name: /^Play$/ })).toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: 'Or play the full 7×7' })).not.toBeInTheDocument();
  expect(lastScreen.queryByRole('button', { name: "Play today's Mini" })).not.toBeInTheDocument();
  expectNoWarmupCopy(lastScreen.getByRole('heading', { name: /ready to play/i }).parentElement);

  continuePractice();

  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'warmupFull' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(49);
  expect(document.querySelector('.cell-0-4')).toHaveStyle({ backgroundColor: 'rgb(48, 48, 54)' });
  expect(document.querySelector('.cell-6-0')).toHaveStyle({ backgroundColor: 'rgb(48, 48, 54)' });
  expect(document.querySelector('.cell-6-6')).toHaveStyle({ backgroundColor: 'rgb(48, 48, 54)' });
  expect(document.querySelector('.cell-1-1')).toHaveStyle({ backgroundColor: 'rgb(227, 230, 236)' });
  expect(boldClueNumbers()).toEqual(['1', '2', '3', '8']);
  expect(screen.getByText(/Goal:/)).toHaveTextContent('Goal: 13');
  expect(localStorage.getItem('sums-game-history')).toBeNull();
  expectNoWarmupCopy();
});

test('a seen tutorial skips straight to the matching practice board', () => {
  localStorage.setItem('sums-tutorial-seen', '1');
  const first = renderGame();

  fireEvent.click(screen.getByRole('button', { name: /play mini sums/i }));
  expect(screen.queryByLabelText('Close instructions')).not.toBeInTheDocument();
  expect(gtagCalls('tutorial_view')).toEqual([]);
  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'warmup' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(16);
  expect(localStorage.getItem('sums-game-history')).toBeNull();
  expectNoWarmupCopy();
  first.unmount();

  window.gtag = jest.fn();
  renderGame();
  fireEvent.click(screen.getByRole('button', { name: /^Play SUMS/ }));
  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'warmupFull' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(49);
  expect(boldClueNumbers()).toEqual(['1', '2', '3', '8']);
  expect(localStorage.getItem('sums-game-history')).toBeNull();
});

test('winning the 4×4 practice board does not record a daily result and shows Nice work', () => {
  jest.useFakeTimers();
  const recordSpy = jest.spyOn(dailyStreak, 'recordDailyPuzzleWin');
  localStorage.setItem('sums-best-time-mini', '99');
  localStorage.setItem('sums-best-time-full', '50');
  renderGame();

  playMiniPracticeWin();

  expect(recordSpy).not.toHaveBeenCalled();
  expect(localStorage.getItem('sums-warmup-done')).toBe('1');
  expect(localStorage.getItem('sums-game-history')).toBeNull();
  expect(localStorage.getItem('sums-best-time-mini')).toBe('99');
  expect(localStorage.getItem('sums-best-time-full')).toBe('50');
  expect(localStorage.getItem('sums-best-time')).toBeNull();
  expect(localStorage.getItem('sums-daily-streak-mini-count')).toBeNull();
  expect(localStorage.getItem('sums-daily-streak-full-count')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Nice work' })).toBeInTheDocument();
  expect(screen.getByText("That's the whole game. Daily puzzles are bigger, and they get harder through the week. Mondays are the easiest.")).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Play SUMS' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Play Mini SUMS' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /you won/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /high scores/i })).not.toBeInTheDocument();
  expectNoWarmupCopy();
  expect(gtagCalls('game_complete')).toEqual([
    ['event', 'game_complete', expect.objectContaining({ game_mode: 'warmup' })]
  ]);

  fireEvent.click(screen.getByRole('button', { name: 'Back to home' }));

  expect(screen.getByRole('heading', { name: /daily number puzzle game/i })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Nice work' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'New here? Try a quick warm-up' })).not.toBeInTheDocument();
});

test('Play SUMS on the done screen starts today\'s full puzzle', () => {
  jest.useFakeTimers();
  renderGame();
  playMiniPracticeWin();

  fireEvent.click(screen.getByRole('button', { name: 'Play SUMS' }));

  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'warmup' }],
    ['event', 'game_start', { game_mode: 'full' }]
  ]);
  expect(screen.queryByRole('heading', { name: 'Nice work' })).not.toBeInTheDocument();
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(49);
  expect(boldClueNumbers()).not.toEqual(['1', '2', '3', '8']);
  expectNoWarmupCopy();
});

test('Close on the done screen returns home', () => {
  jest.useFakeTimers();
  renderGame();
  playMiniPracticeWin();

  fireEvent.click(screen.getByRole('button', { name: 'Close' }));

  expect(screen.getByRole('heading', { name: /daily number puzzle game/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'New here? Try a quick warm-up' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Nice work' })).not.toBeInTheDocument();
});

test('after the practice board is done, Play Mini and Play SUMS are the daily puzzles', () => {
  localStorage.setItem('sums-warmup-done', '1');
  localStorage.setItem('sums-tutorial-seen', '1');
  const first = renderGame();

  fireEvent.click(screen.getByRole('button', { name: /play mini sums/i }));
  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'mini' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(25);
  expectNoWarmupCopy();
  expect(boldClueNumbers()).not.toEqual(['1', '2', '3', '8']);
  first.unmount();

  window.gtag = jest.fn();
  renderGame();
  fireEvent.click(screen.getByRole('button', { name: /^Play SUMS/ }));
  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'full' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(49);
  expectNoWarmupCopy();
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
  expectNoWarmupCopy();
  first.unmount();

  window.gtag = jest.fn();
  renderGame();
  fireEvent.click(screen.getByRole('button', { name: /^Play SUMS/ }));
  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'full' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(49);
  expectNoWarmupCopy();
  expect(boldClueNumbers()).not.toEqual(['1', '2', '3', '8']);
});

test('winning the 7×7 practice board skips daily records and offers today\'s Mini', () => {
  jest.useFakeTimers();
  const recordSpy = jest.spyOn(dailyStreak, 'recordDailyPuzzleWin');
  localStorage.setItem('sums-best-time-mini', '99');
  localStorage.setItem('sums-best-time-full', '50');
  localStorage.setItem('sums-tutorial-seen', '1');
  renderGame();

  fireEvent.click(screen.getByRole('button', { name: /^Play SUMS/ }));
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(49);
  playPracticeMoves();

  expect(recordSpy).not.toHaveBeenCalled();
  expect(localStorage.getItem('sums-warmup-done')).toBe('1');
  expect(localStorage.getItem('sums-game-history')).toBeNull();
  expect(localStorage.getItem('sums-best-time-mini')).toBe('99');
  expect(localStorage.getItem('sums-best-time-full')).toBe('50');
  expect(localStorage.getItem('sums-daily-streak-mini-count')).toBeNull();
  expect(localStorage.getItem('sums-daily-streak-full-count')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Nice work' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Play Mini SUMS' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Play SUMS' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /you won/i })).not.toBeInTheDocument();
  expectNoWarmupCopy();
  expect(gtagCalls('game_complete')).toEqual([
    ['event', 'game_complete', expect.objectContaining({ game_mode: 'warmupFull' })]
  ]);

  fireEvent.click(screen.getByRole('button', { name: 'Play Mini SUMS' }));
  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'warmupFull' }],
    ['event', 'game_start', { game_mode: 'mini' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(25);
  expect(boldClueNumbers()).not.toEqual(['1', '2', '3', '8']);
  expectNoWarmupCopy();
});

test('header and done screen copy does not say warm-up', () => {
  const header = render(
    <GameHeader
      elapsedTime={0}
      nextExpectedNumber={4}
      currentSum={0}
      lastSum={13}
      showHelpDropdown={false}
      setShowHelpDropdown={() => {}}
      hardMode={false}
      setHardMode={() => {}}
      setSelectedCells={() => {}}
      gameMode="warmup"
      puzzleNumber="warm-up"
    />
  );
  expectNoWarmupCopy();
  header.unmount();

  const fullHeader = render(
    <GameHeader
      elapsedTime={0}
      nextExpectedNumber={4}
      currentSum={0}
      lastSum={13}
      showHelpDropdown={false}
      setShowHelpDropdown={() => {}}
      hardMode={false}
      setHardMode={() => {}}
      setSelectedCells={() => {}}
      gameMode="warmupFull"
      puzzleNumber="warm-up"
    />
  );
  expectNoWarmupCopy();
  fullHeader.unmount();

  const fullDone = render(
    <WarmupDoneScreen offer="full" onPlayNext={() => {}} onReturnHome={() => {}} />
  );
  expect(screen.getByRole('heading', { name: 'Nice work' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Play SUMS' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Back to home' })).toBeInTheDocument();
  expectNoWarmupCopy();
  fullDone.unmount();

  render(<WarmupDoneScreen offer="mini" onPlayNext={() => {}} onReturnHome={() => {}} />);
  expect(screen.getByRole('button', { name: 'Play Mini SUMS' })).toBeInTheDocument();
  expectNoWarmupCopy();
});

test('hint cooldown counts down during a 4×4 practice board', () => {
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

test('hint cooldown counts down during a 7×7 practice board', () => {
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
