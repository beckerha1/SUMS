// Mini Game Puzzle (5x5)
// This should be placed in src/puzzles/todayMini.js

import { puzzlesMini } from './puzzlesMini';

const getTodayPuzzleName = () => {
  const now = new Date();
  const est = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const year = est.getFullYear();
  const month = String(est.getMonth() + 1).padStart(2, '0');
  const day = String(est.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const todayName = getTodayPuzzleName();
const todayPuzzleMini = puzzlesMini.find(p => p.name === todayName) || puzzlesMini[puzzlesMini.length - 1];

export const initialGridMini = todayPuzzleMini.grid;
export const puzzleNameMini = todayPuzzleMini.name;
export const puzzleNumberMini = todayPuzzleMini.number;