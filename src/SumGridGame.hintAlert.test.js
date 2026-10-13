import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SumGridGame from './SumGridGame';

jest.mock('./puzzles/today', () => ({
  initialGrid: [
    [8, 'X'],
    ['X', 'X'],
  ],
  puzzleNumber: '1',
}));

jest.mock('./puzzles/todayMini', () => ({
  initialGridMini: [
    [8, 'X'],
    ['X', 'X'],
  ],
  puzzleNumberMini: '1',
}));

beforeEach(() => {
  localStorage.clear();
  window.gtag = jest.fn();
  jest.useFakeTimers();
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

test('explains a missing hint in plain language', () => {
  render(
    <MemoryRouter>
      <SumGridGame />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole('button', { name: /play mini sums/i }));
  fireEvent.click(screen.getByRole('button', { name: 'Hint' }));

  act(() => {
    jest.advanceTimersByTime(80);
  });

  expect(screen.getByRole('heading', { name: 'No hint' })).toBeInTheDocument();
  expect(screen.getByText("Hint couldn't find a move from here. Undo a few moves and try again.")).toBeInTheDocument();
});
