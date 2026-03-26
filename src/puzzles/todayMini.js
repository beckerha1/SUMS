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
const todayIndexMini = puzzlesMini.findIndex(p => p.name === todayName);
const safeIndexMini = todayIndexMini >= 0 ? todayIndexMini : puzzlesMini.length - 1;
const todayPuzzleMini = puzzlesMini[safeIndexMini];

export const initialGridMini = todayPuzzleMini.grid;
export const puzzleNameMini = todayPuzzleMini.name;
export const puzzleNumberMini = String(safeIndexMini + 1);