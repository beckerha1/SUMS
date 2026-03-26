#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ALL8 = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
function get8(r, c, size) {
  return ALL8.map(([dr, dc]) => [r + dr, c + dc]).filter(([nr, nc]) => nr >= 0 && nr < size && nc >= 0 && nc < size);
}
function openNeighborCount(grid, r, c) {
  let count = 0;
  for (const [nr, nc] of get8(r, c, grid.length)) {
    if (grid[nr][nc] !== "X") count++;
  }
  return count;
}
function estimateWallSnakeFactor(grid, size) {
  const seen = Array.from({ length: size }, () => Array(size).fill(false));
  const blackComponents = [];
  const cardinal = [[-1,0],[1,0],[0,-1],[0,1]];
  const inBounds = (r, c) => r >= 0 && r < size && c >= 0 && c < size;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== "X" || seen[r][c]) continue;
      const stack = [[r, c]];
      seen[r][c] = true;
      const cells = [];
      while (stack.length) {
        const [cr, cc] = stack.pop();
        cells.push([cr, cc]);
        for (const [dr, dc] of cardinal) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (!inBounds(nr, nc) || seen[nr][nc] || grid[nr][nc] !== "X") continue;
          seen[nr][nc] = true;
          stack.push([nr, nc]);
        }
      }
      blackComponents.push(cells);
    }
  }

  let longWallCells = 0;
  let wallTouchOpenCells = 0;
  let wallForcedCells = 0;
  let compCount = 0;
  for (const comp of blackComponents) {
    if (comp.length < 4) continue;
    compCount++;
    longWallCells += comp.length;
    const perimeterOpen = new Set();
    for (const [br, bc] of comp) {
      for (const [nr, nc] of get8(br, bc, size)) {
        if (grid[nr][nc] !== "X") perimeterOpen.add(`${nr},${nc}`);
      }
    }
    for (const key of perimeterOpen) {
      const [or, oc] = key.split(",").map(Number);
      wallTouchOpenCells++;
      if (openNeighborCount(grid, or, oc) <= 3) wallForcedCells++;
    }
  }

  const blackCount = blackComponents.reduce((sum, comp) => sum + comp.length, 0);
  const totalOpen = size * size - blackCount;
  const wallPressure = wallTouchOpenCells > 0 ? wallForcedCells / wallTouchOpenCells : 0;
  const wallCoverage = totalOpen > 0 ? Math.min(1, longWallCells / totalOpen) : 0;
  const compBonus = Math.min(1, compCount / 3);
  return wallPressure * 0.65 + wallCoverage * 0.25 + compBonus * 0.1;
}
function computeRawDifficulty(grid, size) {
  const total = size * size;
  let black = 0;
  let hints = 0;
  let lowHints = 0;
  let tightOpenCells = 0;
  let maxHint = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = grid[r][c];
      if (v === "X") {
        black++;
        continue;
      }
      if (typeof v === "number") {
        hints++;
        if (v > maxHint) maxHint = v;
      }
      if (openNeighborCount(grid, r, c) <= 3) tightOpenCells++;
    }
  }
  const N = maxHint;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = grid[r][c];
      if (typeof v === "number" && v <= Math.max(10, Math.floor(N * 0.35))) lowHints++;
    }
  }

  const openCells = total - black;
  const toPlace = Math.max(0, N - hints);
  const placeRatio = openCells > 0 ? toPlace / openCells : 0;
  const lowHintRatio = hints > 0 ? lowHints / hints : 0;
  const tightRatio = openCells > 0 ? tightOpenCells / openCells : 0;
  const blackRatio = black / total;
  const wallSnakeFactor = estimateWallSnakeFactor(grid, size);

  return (
    N * 1.35 +
    toPlace * 0.9 +
    placeRatio * 18 +
    lowHintRatio * 10 +
    tightRatio * 9 -
    blackRatio * 10 +
    wallSnakeFactor * 16
  );
}
function weekdayDifficulty(dateStr) {
  const dt = new Date(`${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}T00:00:00`);
  const day = dt.getDay();
  return day === 0 ? 7 : day;
}
function parseEntries(content, arrayName) {
  const marker = `export const ${arrayName} = [`;
  const start = content.indexOf(marker);
  if (start === -1) throw new Error(`Could not find ${arrayName} export`);
  const end = content.indexOf("];", start);
  if (end === -1) throw new Error(`Could not find end of ${arrayName}`);
  const block = content.slice(start, end + 2);
  const entryRegex = /\{\s*name:\s*"(\d{8})",\s*grid:\s*([A-Za-z0-9_]+),\s*number:\s*"([^"]+)"(?:,\s*difficulty:\s*(\d+))?\s*\}/g;
  const entries = [];
  let m;
  while ((m = entryRegex.exec(block)) !== null) {
    entries.push({ name: m[1], gridRef: m[2], number: m[3] });
  }
  return { entries, blockStart: start, blockEnd: end + 2 };
}
function extractGridLiteral(content, gridRef) {
  const rx = new RegExp(`export const ${gridRef} = \\[([\\s\\S]*?)\\n\\];`);
  const m = content.match(rx);
  if (!m) throw new Error(`Could not find grid definition for ${gridRef}`);
  return `[\n${m[1]}\n]`;
}
function evalGrid(literal) {
  return vm.runInNewContext(`(${literal})`);
}
function resortFile(filePath, arrayName, size) {
  const content = fs.readFileSync(filePath, "utf8");
  const { entries, blockStart, blockEnd } = parseEntries(content, arrayName);
  const puzzleUnits = entries.map((entry) => {
    const gridLiteral = extractGridLiteral(content, entry.gridRef);
    const grid = evalGrid(gridLiteral);
    return {
      ...entry,
      rawDifficulty: computeRawDifficulty(grid, size)
    };
  });

  const slots = entries.map((entry, idx) => ({
    index: idx,
    name: entry.name,
    difficulty: weekdayDifficulty(entry.name)
  }));
  const sortedSlots = [...slots].sort((a, b) => a.difficulty - b.difficulty || a.index - b.index);
  const sortedPuzzles = [...puzzleUnits].sort((a, b) => a.rawDifficulty - b.rawDifficulty);
  const assigned = Array(entries.length);
  for (let i = 0; i < sortedSlots.length; i++) {
    assigned[sortedSlots[i].index] = {
      slot: sortedSlots[i],
      puzzle: sortedPuzzles[i]
    };
  }

  const newBlock = `export const ${arrayName} = [\n` +
    assigned.map(({ slot, puzzle }) => `  { name: "${slot.name}", grid: ${puzzle.gridRef}, number: "${puzzle.number}", difficulty: ${slot.difficulty} }`).join(",\n") +
    `\n];`;

  const updated = content.slice(0, blockStart) + newBlock + content.slice(blockEnd);
  fs.writeFileSync(filePath, updated, "utf8");
  return assigned.length;
}

const root = path.resolve(__dirname, "..");
const fullPath = path.join(root, "src", "puzzles", "puzzles.js");
const miniPath = path.join(root, "src", "puzzles", "puzzlesMini.js");
const fullCount = resortFile(fullPath, "puzzles", 7);
const miniCount = resortFile(miniPath, "puzzlesMini", 5);
console.log(`Resorted full entries: ${fullCount}`);
console.log(`Resorted mini entries: ${miniCount}`);
