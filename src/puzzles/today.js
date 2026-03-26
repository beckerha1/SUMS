import { puzzles } from './puzzles';

const getTodayPuzzleName = () => {
  const now = new Date();
  const est = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const year = est.getFullYear();
  const month = String(est.getMonth() + 1).padStart(2, '0');
  const day = String(est.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const todayName = getTodayPuzzleName();
const todayIndex = puzzles.findIndex(p => p.name === todayName);
const safeIndex = todayIndex >= 0 ? todayIndex : puzzles.length - 1;
const todayPuzzle = puzzles[safeIndex];

export const initialGrid = todayPuzzle.grid;
export const puzzleName = todayPuzzle.name;
export const puzzleNumber = String(safeIndex + 1);
