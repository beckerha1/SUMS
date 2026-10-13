import React from 'react';
import { render, screen } from '@testing-library/react';
import GameHeader from './GameHeader';

const renderHeader = (overrides = {}) => {
  const props = {
    elapsedTime: 0,
    nextExpectedNumber: 4,
    currentSum: 0,
    lastSum: 25,
    showHelpDropdown: false,
    setShowHelpDropdown: jest.fn(),
    setShowInstructions: jest.fn(),
    hardMode: false,
    setHardMode: jest.fn(),
    setSelectedCells: jest.fn(),
    gameMode: 'mini',
    puzzleNumber: '1',
    ...overrides
  };
  return render(<GameHeader {...props} />);
};

test('labels the puzzle length as Goal', () => {
  renderHeader({ lastSum: 25 });
  expect(screen.getByText(/Goal:/)).toHaveTextContent('Goal: 25');
  expect(screen.queryByText(/Last:/)).not.toBeInTheDocument();
});

test('turns the current sum red when it is past the next number', () => {
  renderHeader({ nextExpectedNumber: 4, currentSum: 9 });
  expect(screen.getByText('9')).toHaveStyle({ color: '#e53935' });
});

test('leaves the current sum uncolored when it is not past the next number', () => {
  renderHeader({ nextExpectedNumber: 4, currentSum: 4 });
  expect(screen.getByText(/Current:/).querySelector('strong')).not.toHaveStyle({ color: '#e53935' });
});

test('leaves the current sum uncolored when the next number is unknown', () => {
  renderHeader({ nextExpectedNumber: null, currentSum: 9 });
  expect(screen.getByText('9')).not.toHaveStyle({ color: '#e53935' });
});
