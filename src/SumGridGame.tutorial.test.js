import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SumGridGame from './SumGridGame';

function renderGame(ui = <SumGridGame />) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
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

function playFromTutorial(name) {
  const ready = screen.getByRole('heading', { name: /ready to play/i });
  fireEvent.click(within(ready.parentElement).getByRole('button', { name }));
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

test('opens the tutorial on a first visit and tracks tutorial_view', () => {
  renderGame();

  expect(screen.getByLabelText('Close instructions')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /daily number puzzle game/i })).toBeInTheDocument();
  expect(gtagCalls('tutorial_view')).toEqual([
    ['event', 'tutorial_view', { trigger: 'first_visit' }]
  ]);
});

test('records one first-visit view when Strict Mode replays the open', () => {
  renderGame(
    <React.StrictMode>
      <SumGridGame />
    </React.StrictMode>
  );

  expect(screen.getByLabelText('Close instructions')).toBeInTheDocument();
  expect(gtagCalls('tutorial_view')).toEqual([
    ['event', 'tutorial_view', { trigger: 'first_visit' }]
  ]);
});

test('closing on the first screen tracks the step and does not reopen', () => {
  const { unmount } = renderGame();

  fireEvent.click(screen.getByLabelText('Close instructions'));

  expect(gtagCalls('tutorial_close')).toEqual([
    ['event', 'tutorial_close', { trigger: 'first_visit', step: 0 }]
  ]);
  expect(gtagCalls('tutorial_complete')).toEqual([]);
  expect(localStorage.getItem('sums-tutorial-seen')).toBe('1');
  expect(screen.queryByLabelText('Close instructions')).not.toBeInTheDocument();

  unmount();
  renderGame();
  expect(screen.queryByLabelText('Close instructions')).not.toBeInTheDocument();
});

test('screen 2 keeps the selection after a gray-number mistake', () => {
  jest.useFakeTimers();
  renderGame();

  clickEnabledNext();
  advance(4500);
  clickEnabledNext();
  clickGridCell(0, 0);
  clickGridCell(1, 0);
  clickGridCell(0, 2);
  expect(screen.getByText('Put it in a square touching the last number you tapped.')).toBeInTheDocument();

  clickGridCell(2, 0);
  expect(screen.getByText('Not there. With 4 there, nothing touching the 5 could add up to 5.')).toBeInTheDocument();

  clickGridCell(1, 1);
  advance(200);
  expect(screen.getByText('Great move.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
});

test('screen 5 explains a wrong sum and then completes', () => {
  jest.useFakeTimers();
  renderGame();

  clickEnabledNext();
  advance(4500);
  clickEnabledNext();
  place([[0, 0], [1, 0], [1, 1]]);
  clickEnabledNext();
  expect(screen.getByText('1 + 4 = 5, and the 4 touches the 5')).toBeInTheDocument();
  clickEnabledNext();
  advance(4000);
  clickEnabledNext();

  clickGridCell(0, 0);
  clickGridCell(0, 1);
  expect(screen.getByText('Next number: 6 · Selected: 3')).toBeInTheDocument();
  clickGridCell(0, 2);
  expect(screen.getByText('That adds up to 3. You need 6.')).toBeInTheDocument();
  advance(2500);
  expect(screen.getByText('Next number: 6')).toBeInTheDocument();

  place([[0, 0], [0, 1], [1, 0], [2, 0]]);
  place([[1, 0], [1, 1], [1, 2]]);
  place([[0, 0], [1, 0], [1, 1], [0, 2]]);
  place([[0, 1], [1, 2], [2, 1]]);
  expect(screen.getByText('Grid complete.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
});

test('closing on screen 2 reports that step', () => {
  jest.useFakeTimers();
  renderGame();

  clickEnabledNext();
  advance(4500);
  clickEnabledNext();
  expect(screen.getByText('Tap 1 and 3 to make 4')).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText('Close instructions'));

  expect(gtagCalls('tutorial_close')).toEqual([
    ['event', 'tutorial_close', { trigger: 'first_visit', step: 2 }]
  ]);
  expect(localStorage.getItem('sums-tutorial-seen')).toBe('1');
});

test('does not auto-open when a game history exists', () => {
  localStorage.setItem('sums-game-history', '[]');

  renderGame();

  expect(screen.queryByLabelText('Close instructions')).not.toBeInTheDocument();
  expect(gtagCalls('tutorial_view')).toEqual([]);
});

test('does not auto-open when storage throws', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    if (key === 'sums-tutorial-seen') throw new Error('storage blocked');
    return null;
  });

  renderGame();

  expect(screen.queryByLabelText('Close instructions')).not.toBeInTheDocument();
  expect(gtagCalls('tutorial_view')).toEqual([]);
});

test('still closes when marking the tutorial seen throws', () => {
  renderGame();
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('storage blocked');
  });

  fireEvent.click(screen.getByLabelText('Close instructions'));

  expect(screen.queryByLabelText('Close instructions')).not.toBeInTheDocument();
});

test('How to play and in-game instructions use their own triggers', () => {
  localStorage.setItem('sums-tutorial-seen', '1');
  renderGame();

  fireEvent.click(screen.getByRole('button', { name: 'How to play' }));
  expect(gtagCalls('tutorial_view')).toEqual([
    ['event', 'tutorial_view', { trigger: 'start_screen' }]
  ]);

  fireEvent.click(screen.getByLabelText('Close instructions'));
  expect(gtagCalls('tutorial_close')).toEqual([
    ['event', 'tutorial_close', { trigger: 'start_screen', step: 0 }]
  ]);

  fireEvent.click(screen.getByRole('button', { name: /play mini sums/i }));
  fireEvent.click(screen.getByRole('button', { name: 'Help' }));
  fireEvent.click(screen.getByText('Instructions'));

  expect(screen.getAllByRole('heading', { name: /^how to play$/i })).toHaveLength(1);
  expect(screen.queryByText(/build a number chain/i)).not.toBeInTheDocument();
  expect(gtagCalls('tutorial_view')).toEqual([
    ['event', 'tutorial_view', { trigger: 'start_screen' }],
    ['event', 'tutorial_view', { trigger: 'in_game' }]
  ]);

  fireEvent.click(screen.getByLabelText('Close instructions'));
  expect(gtagCalls('tutorial_close')).toContainEqual(
    ['event', 'tutorial_close', { trigger: 'in_game', step: 0 }]
  );
});

test('reaching the last screen tracks completion once and a later close does not', () => {
  jest.useFakeTimers();
  renderGame();
  finishTutorial();

  expect(gtagCalls('tutorial_complete')).toEqual([
    ['event', 'tutorial_complete', { trigger: 'first_visit' }]
  ]);

  fireEvent.click(screen.getByRole('button', { name: 'Review Tutorial' }));
  fireEvent.click(screen.getByLabelText('Close instructions'));

  expect(gtagCalls('tutorial_complete')).toHaveLength(1);
  expect(gtagCalls('tutorial_close')).toEqual([]);
  expect(gtagCalls('game_start')).toEqual([]);
  expect(localStorage.getItem('sums-tutorial-seen')).toBe('1');
});

test('Play Mini SUMS on the last screen starts the mini puzzle', () => {
  jest.useFakeTimers();
  renderGame();
  finishTutorial();
  playFromTutorial("Play today's Mini");

  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'mini' }]
  ]);
  expect(gtagCalls('tutorial_close')).toEqual([]);
  expect(screen.queryByLabelText('Close instructions')).not.toBeInTheDocument();
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(25);
});

test('Play SUMS on the last screen starts the full puzzle', () => {
  jest.useFakeTimers();
  renderGame();
  finishTutorial();
  playFromTutorial('Or play the full 7×7');

  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'full' }]
  ]);
  expect(document.querySelectorAll('[class^="cell-"]')).toHaveLength(49);
});

test('resuming the same mode from the tutorial does not fire game_start again', () => {
  jest.useFakeTimers();
  renderGame();
  finishTutorial();
  playFromTutorial("Play today's Mini");

  fireEvent.click(screen.getByRole('button', { name: 'Help' }));
  fireEvent.click(screen.getByText('Return to home'));
  fireEvent.click(screen.getByRole('button', { name: 'How to play' }));
  finishTutorial();
  playFromTutorial("Play today's Mini");

  expect(gtagCalls('game_start')).toEqual([
    ['event', 'game_start', { game_mode: 'mini' }]
  ]);
  expect(gtagCalls('tutorial_complete')).toEqual([
    ['event', 'tutorial_complete', { trigger: 'first_visit' }],
    ['event', 'tutorial_complete', { trigger: 'start_screen' }]
  ]);
});
