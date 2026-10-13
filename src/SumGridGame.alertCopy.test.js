import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SumGridGame from './SumGridGame';

jest.mock('./puzzles/today', () => ({
  initialGrid: [
    [1, 3, null, null],
    [2, 'X', 'X', 'X'],
    [9, 'X', 5, 'X'],
  ],
  puzzleNumber: '1',
}));

jest.mock('./puzzles/todayMini', () => ({
  initialGridMini: [
    [1, 3, null, null],
    [2, 'X', 'X', 'X'],
    [9, 'X', 5, 'X'],
  ],
  puzzleNumberMini: '1',
}));

const rejectedEvents = () =>
  window.gtag.mock.calls.filter((call) => call[1] === 'move_rejected');

const clickCell = (container, row, col) => {
  fireEvent.click(container.querySelector(`.cell-${row}-${col}`));
};

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

test('explains an unreachable gray number in plain language and tracks it once', () => {
  const { container } = render(
    <MemoryRouter>
      <SumGridGame />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole('button', { name: /play mini sums/i }));

  clickCell(container, 0, 0);
  clickCell(container, 0, 1);
  clickCell(container, 0, 2);

  expect(screen.getByRole('heading', { name: 'Not there' })).toBeInTheDocument();
  expect(screen.getByText('If 4 goes there, no chain touching the gray 5 can add up to 5. Try another square, or undo a few moves.')).toBeInTheDocument();
  expect(screen.getAllByText('4')).toHaveLength(1);
  expect(rejectedEvents()).toEqual([
    ['event', 'move_rejected', { game_mode: 'mini', reason: 'gray_unreachable', next_number: 4 }]
  ]);

  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  clickCell(container, 0, 0);
  clickCell(container, 0, 1);
  clickCell(container, 0, 2);

  expect(screen.getByRole('heading', { name: 'Not there' })).toBeInTheDocument();
  expect(rejectedEvents()).toHaveLength(1);
});
