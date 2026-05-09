#!/usr/bin/env node
// ================================================================
// SUMS Puzzle Generator - correct chain mechanic, optimized DFS
//
// To place N: build a chain through placed numbers where each step
// is 8-adjacent to the previous, chain sums to N, then place N in
// any empty cell 8-adjacent to the last element of the chain.
// ================================================================

const ALL8 = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const readline = require('readline');

function get8(r, c, SIZE) {
  return ALL8.map(([dr,dc])=>[r+dr,c+dc])
    .filter(([nr,nc])=>nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE);
}

function shuffle(arr) {
  for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
  return arr;
}

// Find all empty cells where N can be placed.
// DFS through placed numbers forming a chain summing to N.
// Pruning: sum > N, or remaining unreachable.
function countNulls(grid) {
  let n = 0;
  for (const row of grid) for (const v of row) if (v === null) n++;
  return n;
}

function findPlacementCells(grid, SIZE, N) {
  const result = new Set();
  const ROWS = SIZE, COLS = SIZE;

  function dfs(r, c, sum, visited) {
    if (sum === N) {
      // Collect empty 8-neighbours as valid placement cells
      for (const [nr,nc] of get8(r,c,SIZE)) {
        if (grid[nr][nc] === null) result.add(`${nr},${nc}`);
      }
      return;
    }
    // Extend chain to 8-adjacent placed numbers not yet visited
    for (const [nr,nc] of get8(r,c,SIZE)) {
      const val = grid[nr][nc];
      if (val === null || val === 'X') continue;
      if (typeof val !== 'number' || val >= N) continue;
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;
      const newSum = sum + val;
      if (newSum > N) continue; // prune
      visited.add(key);
      dfs(nr, nc, newSum, visited);
      visited.delete(key);
    }
  }

  // Start chain from every placed number
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) {
    const val = grid[r][c];
    if (typeof val !== 'number' || val >= N) continue;
    const visited = new Set([`${r},${c}`]);
    dfs(r, c, val, visited);
  }

  return [...result].map(k=>k.split(',').map(Number));
}

// Find all non-wall cells that can be touched by a valid chain summing to N.
// Used to validate whether a prefilled clue N is "currently reachable".
function findReachableNeighborCells(grid, SIZE, N) {
  const result = new Set();

  function dfs(r, c, sum, visited) {
    if (sum === N) {
      for (const [nr, nc] of get8(r, c, SIZE)) {
        if (grid[nr][nc] !== 'X') result.add(`${nr},${nc}`);
      }
      return;
    }
    for (const [nr, nc] of get8(r, c, SIZE)) {
      const val = grid[nr][nc];
      if (val === null || val === 'X') continue;
      if (typeof val !== 'number' || val >= N) continue;
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;
      const newSum = sum + val;
      if (newSum > N) continue;
      visited.add(key);
      dfs(nr, nc, newSum, visited);
      visited.delete(key);
    }
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const val = grid[r][c];
      if (typeof val !== 'number' || val >= N) continue;
      const visited = new Set([`${r},${c}`]);
      dfs(r, c, val, visited);
    }
  }

  return [...result].map(k => k.split(',').map(Number));
}

const DIR8 = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];

function tryInitial123(SIZE) {
  for (let attempt = 0; attempt < 120; attempt++) {
    const cr = Math.floor(Math.random() * SIZE);
    const cc = Math.floor(Math.random() * SIZE);
    const dirs = shuffle(DIR8.map(d => [...d]));
    for (let i = 0; i < dirs.length; i++) {
      for (let j = 0; j < dirs.length; j++) {
        if (i === j) continue;
        const p1 = [cr + dirs[i][0], cc + dirs[i][1]];
        const p2 = [cr, cc];
        const p3 = [cr + dirs[j][0], cc + dirs[j][1]];
        if (p1[0] < 0 || p1[0] >= SIZE || p1[1] < 0 || p1[1] >= SIZE) continue;
        if (p3[0] < 0 || p3[0] >= SIZE || p3[1] < 0 || p3[1] >= SIZE) continue;
        if ((p1[0] === p2[0] && p2[0]=== p3[0]) || (p1[1] === p2[1] && p2[1] === p3[1])) continue;
        if (Math.abs(p1[0] - p3[0]) > 1 || Math.abs(p1[1] - p3[1]) > 1) continue;
        const occupied = new Set([`${p1[0]},${p1[1]}`, `${p2[0]},${p2[1]}`, `${p3[0]},${p3[1]}`]);
        const neigh = new Set();
        for (const p of [p1, p3]) {
          for (const [r, c] of get8(p[0], p[1], SIZE)) neigh.add(`${r},${c}`);
        }
        const hasEmpty = [...neigh].some(k => !occupied.has(k));
        if (!hasEmpty) continue;
        return [p1, p2, p3];
      }
    }
  }
  return null;
}

/**
 * Greedy + one-step lookahead: fast for most of the grid; prefers tight early placements
 * and high branching for the next value when the board fills in (high N / few nulls).
 */
function fillGreedyLookahead(grid, placedPos, SIZE, fromN, targetN) {
  function twoStepBranchScore(r, c, n) {
    grid[r][c] = n;
    const next1 = findPlacementCells(grid, SIZE, n + 1);
    if (next1.length === 0) {
      grid[r][c] = null;
      return 0;
    }
    let score = 0;
    const sample = shuffle(next1).slice(0, 8);
    for (const [r1, c1] of sample) {
      grid[r1][c1] = n + 1;
      score +=
        n + 1 < targetN
          ? findPlacementCells(grid, SIZE, n + 2).length
          : 1;
      grid[r1][c1] = null;
    }
    grid[r][c] = null;
    return score;
  }

  for (let n = fromN; n <= targetN; n++) {
    const cands = findPlacementCells(grid, SIZE, n);
    if (cands.length === 0) return false;

    const nulls = countNulls(grid);
    const stepsLeft = targetN - n + 1;
    const late =
      stepsLeft <= 16 || nulls <= Math.min(SIZE * SIZE, stepsLeft + 16);

    const scored = cands.map(([r, c]) => {
      const free = get8(r, c, SIZE).filter(([nr, nc]) => grid[nr][nc] === null).length;
      let nextOptions = 0;
      if (n < targetN) {
        grid[r][c] = n;
        nextOptions = findPlacementCells(grid, SIZE, n + 1).length;
        grid[r][c] = null;
      } else {
        nextOptions = 999;
      }
      return { r, c, free, nextOptions };
    });

    if (late) {
      scored.sort(
        (a, b) =>
          b.nextOptions - a.nextOptions ||
          a.free - b.free ||
          Math.random() - 0.5
      );
      if (n >= targetN - 5 && n < targetN && targetN >= 38) {
        const refine = Math.min(14, scored.length);
        for (let i = 0; i < refine; i++) {
          const t = scored[i];
          t.nextOptions = twoStepBranchScore(t.r, t.c, n);
        }
        scored.sort(
          (a, b) =>
            b.nextOptions - a.nextOptions ||
            a.free - b.free ||
            Math.random() - 0.5
        );
      }
    } else {
      scored.sort(
        (a, b) =>
          a.free - b.free ||
          Math.random() - 0.5
      );
    }

    const poolLate = targetN >= 42 ? 24 : targetN >= 38 ? 20 : 16;
    const poolEarly = targetN >= 42 ? 12 : 9;
    const pool = late
      ? Math.min(poolLate, scored.length)
      : Math.min(poolEarly, scored.length);
    const pick = scored[Math.floor(Math.random() * pool)];
    grid[pick.r][pick.c] = n;
    placedPos.push([pick.r, pick.c]);
  }
  return true;
}

function fillRemaining(grid, placedPos, SIZE, targetN) {
  return fillGreedyLookahead(grid, placedPos, SIZE, 4, targetN);
}

// Reject masks that feel like deleted rows/columns.
function isInterestingMask(grid, SIZE) {
  const rowOpen = Array(SIZE).fill(0);
  const colOpen = Array(SIZE).fill(0);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] !== 'X') {
        rowOpen[r]++;
        colOpen[c]++;
      }
    }
  }

  // Hard reject: fully deleted row/column.
  if (rowOpen.some(v => v === 0) || colOpen.some(v => v === 0)) return false;

  // Also reject near-deleted bands to avoid "5x7" style feel.
  const nearDeletedRows = rowOpen.filter(v => v <= 2).length;
  const nearDeletedCols = colOpen.filter(v => v <= 2).length;
  if (nearDeletedRows > 1 || nearDeletedCols > 1) return false;

  return true;
}

// Ensure all non-wall cells are in one 8-connected region.
// This prevents isolated "islands" that can become unreachable.
function hasSingleOpenComponent(grid, SIZE) {
  let start = null;
  let totalOpen = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] !== 'X') {
        totalOpen++;
        if (!start) start = [r, c];
      }
    }
  }
  if (!start) return false;

  const seen = new Set();
  const stack = [start];
  seen.add(`${start[0]},${start[1]}`);

  while (stack.length) {
    const [r, c] = stack.pop();
    for (const [nr, nc] of get8(r, c, SIZE)) {
      if (grid[nr][nc] === 'X') continue;
      const key = `${nr},${nc}`;
      if (seen.has(key)) continue;
      seen.add(key);
      stack.push([nr, nc]);
    }
  }

  return seen.size === totalOpen;
}

function tryGenerate(SIZE, targetN, density) {
  const seed = tryInitial123(SIZE);
  if (!seed) return null;
  const [pos1, pos2, pos3] = seed;

  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  grid[pos1[0]][pos1[1]] = 1;
  grid[pos2[0]][pos2[1]] = 2;
  grid[pos3[0]][pos3[1]] = 3;
  const placedPos = [pos1, pos2, pos3];

  if (!fillRemaining(grid, placedPos, SIZE, targetN)) return null;

  const finalGrid=grid.map(row=>row.map(v=>v===null?'X':v));

  // Pick hints and verify the hint grid is still fully solvable
  const hintIndices = pickHints(targetN, density);
  const hintGrid=finalGrid.map(row=>row.map(v=>v==='X'?'X':null));
  for(const idx of hintIndices){
    const[r,c]=placedPos[idx]; hintGrid[r][c]=idx+1;
  }

  if(!isInterestingMask(finalGrid, SIZE)) return null;
  if(!hasSingleOpenComponent(finalGrid, SIZE)) return null;
  if(!verifyPlayable(hintGrid, finalGrid, SIZE, targetN, placedPos)) return null;

  return{grid:hintGrid,solution:finalGrid,placedPos,N:targetN};
}

// Simulate play: starting from hints only, place 4..N in order using
// the solution's positions. Each must be reachable via chain mechanic.
function verifyPlayable(hintGrid, solution, SIZE, N, placedPos) {
  const sim = hintGrid.map(row => [...row]);

  function isClueSatisfied(val) {
    const [r, c] = placedPos[val - 1];
    if (hintGrid[r][c] !== val || sim[r][c] !== val) return false;
    const reachable = findReachableNeighborCells(sim, SIZE, val);
    return reachable.some(([rr, cc]) => rr === r && cc === c);
  }

  function getNextExpected() {
    let val = 4;
    while (val <= N) {
      const [r, c] = placedPos[val - 1];
      if (sim[r][c] !== val) return val;
      const isClue = hintGrid[r][c] === val;
      if (!isClue) {
        val++;
        continue;
      }
      if (!isClueSatisfied(val)) return val;
      val++;
    }
    return N + 1;
  }

  while (true) {
    const val = getNextExpected();
    if (val > N) return true;

    const [solR, solC] = placedPos[val - 1];
    const isClue = hintGrid[solR][solC] === val;
    if (isClue) {
      // Clue exists on board but is not currently reachable.
      return false;
    }

    const cands = findPlacementCells(sim, SIZE, val);
    if (!cands.some(([r, c]) => r === solR && c === solC)) return false;
    sim[solR][solC] = val;
  }
}

function pickHints(N, density) {
  const h=new Set([0,1,2]);
  h.add(N-1);
  if(density==='medium'||density==='dense'){
    if(N>=10) h.add(Math.round(N*0.4));
    if(N>=18) h.add(Math.round(N*0.65));
    if(N>=28) h.add(Math.round(N*0.25));
  }
  if(density==='dense'){
    if(N>=15) h.add(Math.round(N*0.55));
    if(N>=25) h.add(Math.round(N*0.75));
    if(N>=35) h.add(Math.round(N*0.85));
  }
  return h;
}

function stubPuzzle(SIZE, targetN) {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  grid[0][0] = 1;
  grid[0][1] = 2;
  grid[1][1] = 3;
  return {
    grid,
    placedPos: [[0, 0], [0, 1], [1, 1]],
    N: targetN,
    _stub: true
  };
}

function generatePuzzle(SIZE, targetN, density) {
  const tries =
    targetN >= 45 ? 12000 :
    targetN >= 40 ? 9000 :
    targetN >= 35 ? 6000 :
    targetN >= 25 ? 2500 :
    1200;
  const targets=[targetN,targetN-2,targetN-4,targetN-6].filter(n=>n>=Math.max(6,SIZE+3));
  for(const N of targets){
    for(let i=0;i<tries;i++){
      const r=tryGenerate(SIZE,N,density);
      if(r) return r;
    }
    if(N<targetN) process.stdout.write(`(->N=${N}) `);
  }
  return null;
}

const fullConfigs=[
  {N:30,density:'medium'},{N:36,density:'medium'},{N:28,density:'sparse'},
  {N:38,density:'dense'}, {N:26,density:'dense'}, {N:33,density:'medium'},
  {N:31,density:'dense'}, {N:35,density:'medium'},{N:29,density:'sparse'},
  {N:34,density:'dense'}, {N:32,density:'medium'},{N:37,density:'sparse'},
  {N:27,density:'dense'}, {N:39,density:'medium'},{N:33,density:'medium'},
];
const miniConfigs=[
  {N:18,density:'medium'},{N:21,density:'dense'}, {N:16,density:'sparse'},
  {N:23,density:'medium'},{N:14,density:'dense'}, {N:20,density:'sparse'},
  {N:19,density:'medium'},{N:12,density:'dense'}, {N:24,density:'medium'},
  {N:17,density:'sparse'},{N:22,density:'dense'}, {N:15,density:'medium'},
  {N:25,density:'dense'}, {N:13,density:'sparse'},{N:21,density:'medium'},
];

function addDays(s, d) {
  const y = +s.slice(0, 4);
  const m = +s.slice(4, 6) - 1;
  const day = +s.slice(6, 8);
  const dt = new Date(Date.UTC(y, m, day + d));
  return `${dt.getUTCFullYear()}${String(dt.getUTCMonth() + 1).padStart(2, '0')}${String(dt.getUTCDate()).padStart(2, '0')}`;
}
function formatGrid(g){return'[\n'+g.map(row=>'  ['+row.map(c=>c==='X'?'"X"':c===null?'null':String(c)).join(', ')+']').join(',\n')+'\n]';}
function toYYYYMMDD(s){return s.replace(/-/g,'').trim();}
function isValidDateString(s){return /^\d{8}$/.test(s);}
function isValidNumberString(s){return /^\d+$/.test(s);}
function pickConfig(configs, index) {
  return configs[index % configs.length];
}
function weekdayDifficulty(dateStr) {
  // 0=Sun..6=Sat -> Mon=1 ... Sun=7 (calendar date in UTC, matches addDays)
  const y = +dateStr.slice(0, 4);
  const m = +dateStr.slice(4, 6) - 1;
  const day = +dateStr.slice(6, 8);
  const dow = new Date(Date.UTC(y, m, day)).getUTCDay();
  return dow === 0 ? 7 : dow;
}
function openNeighborCount(grid, r, c) {
  let count = 0;
  for (const [nr, nc] of get8(r, c, grid.length)) {
    if (grid[nr][nc] !== 'X') count++;
  }
  return count;
}
function estimateWallSnakeFactor(grid, size) {
  const seen = Array.from({ length: size }, () => Array(size).fill(false));
  const blackComponents = [];
  const cardinal = [[-1,0],[1,0],[0,-1],[0,1]];

  function inBounds(r, c) {
    return r >= 0 && r < size && c >= 0 && c < size;
  }

  // Find connected black-square components (4-dir connectivity).
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== 'X' || seen[r][c]) continue;
      const stack = [[r, c]];
      seen[r][c] = true;
      const cells = [];
      while (stack.length) {
        const [cr, cc] = stack.pop();
        cells.push([cr, cc]);
        for (const [dr, dc] of cardinal) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (!inBounds(nr, nc)) continue;
          if (seen[nr][nc] || grid[nr][nc] !== 'X') continue;
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
    // Only treat larger components as "walls".
    if (comp.length < 4) continue;
    compCount++;
    longWallCells += comp.length;

    const perimeterOpen = new Set();
    for (const [br, bc] of comp) {
      for (const [nr, nc] of get8(br, bc, size)) {
        if (grid[nr][nc] !== 'X') perimeterOpen.add(`${nr},${nc}`);
      }
    }

    for (const key of perimeterOpen) {
      const [or, oc] = key.split(',').map(Number);
      wallTouchOpenCells++;
      const exits = openNeighborCount(grid, or, oc);
      if (exits <= 3) wallForcedCells++;
    }
  }

  const totalOpen = size * size - blackComponents.reduce((sum, comp) => sum + comp.length, 0);
  const wallPressure = wallTouchOpenCells > 0 ? wallForcedCells / wallTouchOpenCells : 0;
  const wallCoverage = totalOpen > 0 ? Math.min(1, longWallCells / totalOpen) : 0;
  const compBonus = Math.min(1, compCount / 3);

  // Higher means stronger "snake around wall" pressure.
  return wallPressure * 0.65 + wallCoverage * 0.25 + compBonus * 0.1;
}
function computeRawDifficulty(result, size) {
  const total = size * size;
  let black = 0;
  let hints = 0;
  let lowHints = 0;
  let tightOpenCells = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = result.grid[r][c];
      if (v === 'X') {
        black++;
        continue;
      }
      if (typeof v === 'number') {
        hints++;
        if (v <= Math.max(10, Math.floor(result.N * 0.35))) lowHints++;
      }
      if (openNeighborCount(result.grid, r, c) <= 3) tightOpenCells++;
    }
  }
  const openCells = total - black;
  const toPlace = Math.max(0, result.N - hints);
  const placeRatio = openCells > 0 ? toPlace / openCells : 0;
  const lowHintRatio = hints > 0 ? lowHints / hints : 0;
  const tightRatio = openCells > 0 ? tightOpenCells / openCells : 0;
  const blackRatio = black / total;
  const wallSnakeFactor = estimateWallSnakeFactor(result.grid, size);

  // Higher = harder
  return (
    result.N * 1.35 +
    toPlace * 0.9 +
    placeRatio * 18 +
    lowHintRatio * 10 +
    tightRatio * 9 -
    blackRatio * 10 +
    wallSnakeFactor * 16
  );
}
function assignByWeekdayDifficulty(results, startDate, size) {
  const slots = results.map((_, i) => {
    const date = addDays(startDate, i);
    return {
      index: i,
      date,
      difficulty: weekdayDifficulty(date)
    };
  });
  const puzzles = results.map((r, i) => ({
    ...r,
    rawDifficulty: computeRawDifficulty(r, size),
    sourceIndex: i
  }));

  // Match easier puzzles to easier weekdays, harder to harder weekdays.
  const sortedSlots = [...slots].sort((a, b) => a.difficulty - b.difficulty || a.index - b.index);
  const sortedPuzzles = [...puzzles].sort((a, b) => a.rawDifficulty - b.rawDifficulty);
  const assigned = Array(results.length);
  for (let i = 0; i < sortedSlots.length; i++) {
    const slot = sortedSlots[i];
    assigned[slot.index] = {
      ...sortedPuzzles[i],
      date: slot.date,
      difficulty: slot.difficulty
    };
  }
  return assigned;
}
async function promptWithDefault(rl, prompt, fallback) {
  const value = await new Promise(resolve => rl.question(`${prompt} [${fallback}]: `, resolve));
  const trimmed = (value || '').trim();
  return trimmed || fallback;
}
async function collectStartInputs() {
  const cliStartDateInput = process.argv[2];
  const cliPuzzleCountInput = process.argv[3];
  if (cliStartDateInput || cliPuzzleCountInput) {
    const startDate = toYYYYMMDD(cliStartDateInput || '20260304');
    const puzzleCountRaw = (cliPuzzleCountInput || '15').trim();
    if (!isValidDateString(startDate)) {
      throw new Error('Invalid date format. Use YYYYMMDD or YYYY-MM-DD.');
    }
    if (!isValidNumberString(puzzleCountRaw)) {
      throw new Error('Invalid number input. Use positive integer values.');
    }
    const puzzleCount = Number(puzzleCountRaw);
    if (puzzleCount < 1) throw new Error('Puzzle count must be at least 1.');
    return { startDate, puzzleCount };
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  try {
    const startDateInput = await promptWithDefault(rl, 'Next start date for BOTH FULL and MINI (YYYYMMDD or YYYY-MM-DD)', '20260304');
    const puzzleCountInput = await promptWithDefault(rl, 'How many puzzles to generate for EACH mode (full + mini)', '15');

    const startDate = toYYYYMMDD(startDateInput);
    if (!isValidDateString(startDate)) {
      throw new Error('Invalid date format. Use YYYYMMDD or YYYY-MM-DD.');
    }
    if (!isValidNumberString(puzzleCountInput)) {
      throw new Error('Invalid number input. Use positive integer values.');
    }
    const puzzleCount = Number(puzzleCountInput);
    if (puzzleCount < 1) throw new Error('Puzzle count must be at least 1.');

    return {
      startDate,
      puzzleCount
    };
  } finally {
    rl.close();
  }
}

async function main() {
  const {
    startDate,
    puzzleCount
  } = await collectStartInputs();

  console.log('\nGenerating full 7x7 puzzles (correct chain mechanic)...');
  const fullResults=[];
  for(let i=0;i<puzzleCount;i++){
    const{N,density}=pickConfig(fullConfigs, i);
    process.stdout.write(`  [${i+1}] N=${N} ${density}... `);
    let r=generatePuzzle(7,N,density);
    if(!r){r=stubPuzzle(7,N);process.stdout.write(`stub (replace manually) `);}
    fullResults.push(r);
    process.stdout.write(`OK (N=${r.N}) ✓\n`);
  }

  console.log('\nGenerating mini 5x5 puzzles...');
  const miniResults=[];
  for(let i=0;i<puzzleCount;i++){
    const{N,density}=pickConfig(miniConfigs, i);
    process.stdout.write(`  [${i+1}] N=${N} ${density}... `);
    let r=generatePuzzle(5,N,density);
    if(!r){r=stubPuzzle(5,N);process.stdout.write(`stub (replace manually) `);}
    miniResults.push(r);
    process.stdout.write(`OK (N=${r.N}) ✓\n`);
  }

  const scheduledFull = assignByWeekdayDifficulty(fullResults, startDate, 7);
  const scheduledMini = assignByWeekdayDifficulty(miniResults, startDate, 5);
  let fullCode='',miniCode='';
  const fullEntries=[],miniEntries=[];

  for(let i=0;i<scheduledFull.length;i++){
    const p = scheduledFull[i];
    fullEntries.push(`  { name: "${p.date}", grid: ${formatGrid(p.grid)} }`);
  }

  for(let i=0;i<scheduledMini.length;i++){
    const p = scheduledMini[i];
    miniEntries.push(`  { name: "${p.date}", grid: ${formatGrid(p.grid)} }`);
  }

  const fs=require('fs');
  const path=require('path');
  const outDir=__dirname;
  fullCode = `export const newFullPuzzles = [\n${fullEntries.join(',\n')}\n];\n`;
  miniCode = `export const newMiniPuzzles = [\n${miniEntries.join(',\n')}\n];\n`;
  fs.writeFileSync(path.join(outDir,'new-full-puzzles.js'),fullCode);
  fs.writeFileSync(path.join(outDir,'new-mini-puzzles.js'),miniCode);

  const stubFull = fullResults.filter(p => p._stub).length;
  const stubMini = miniResults.filter(p => p._stub).length;
  console.log(`\n✅ Full: ${fullResults.length}/${puzzleCount}${stubFull ? ` (${stubFull} stub)` : ''}, Mini: ${miniResults.length}/${puzzleCount}${stubMini ? ` (${stubMini} stub)` : ''}`);
  console.log('✅ Output written to src/puzzles/new-full-puzzles.js and src/puzzles/new-mini-puzzles.js');
  console.log('✅ Output now uses compact entries: { name, grid }');
}

main().catch(err => {
  console.error('\nGenerator failed:', err.message);
  process.exit(1);
});
