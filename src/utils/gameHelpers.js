// Game helper functions and utilities

export const isValidCell = (r, c, grid) => {
  return r >= 0 && c >= 0 && r < grid.length && c < grid[0].length;
};

export const getAdjacent = ([r, c], grid) => {
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ];
  return directions
    .map(([dr, dc]) => [r + dr, c + dc])
    .filter(([nr, nc]) => isValidCell(nr, nc, grid) && grid[nr][nc] !== undefined);
};

export const isConnectedGroup = (cells, grid) => {
  if (cells.length === 0) return false;
  const visited = new Set();
  const toVisit = [cells[0]];
  const cellSet = new Set(cells.map(([r, c]) => `${r},${c}`));

  while (toVisit.length) {
    const [r, c] = toVisit.pop();
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);
    
    for (const [nr, nc] of getAdjacent([r, c], grid)) {
      const nKey = `${nr},${nc}`;
      if (cellSet.has(nKey) && !visited.has(nKey)) {
        toVisit.push([nr, nc]);
      }
    }
  }
  
  return visited.size === cells.length;
};

export const findConnectedGroupsThatSum = (grid, candidates, target) => {
  const results = [];
  const visitedKeys = new Set();

  function dfs(path, sum, seen) {
    const last = path[path.length - 1];
    const key = last.join(",");
    if (sum > target || visitedKeys.has(key)) return;
    if (sum === target) {
      results.push([...path]);
      return;
    }

    for (const [nr, nc] of getAdjacent(last, grid)) {
      const nKey = `${nr},${nc}`;
      if (seen.has(nKey)) continue;
      if (!candidates.some(([r, c]) => r === nr && c === nc)) continue;

      seen.add(nKey);
      path.push([nr, nc]);
      dfs(path, sum + grid[nr][nc], seen);
      path.pop();
      seen.delete(nKey);
    }
  }

  for (const [r, c] of candidates) {
    const startKey = `${r},${c}`;
    dfs([[r, c]], grid[r][c], new Set([startKey]));
  }

  return results;
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const isPrefilledClue = (r, c, grid, puzzle) => {
  return puzzle[r][c] === grid[r][c] && typeof grid[r][c] === "number";
};

export const getMaxSelection = (hardMode, puzzle) => {
  if (!hardMode) return Infinity;
  const emptySpaces = puzzle.flat().filter(cell => cell === null).length;
  return emptySpaces <= 20 ? 3 : 4;
};

export const isClueReachable = (clueRow, clueCol, clueValue, grid, puzzle) => {
  // Build candidates (all numbers except the clue value)
  const candidates = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const val = grid[r][c];
      if (typeof val === "number" && val !== clueValue) {
        candidates.push([r, c]);
      }
    }
  }

  const groups = findConnectedGroupsThatSum(grid, candidates, clueValue);

  // Check if any group touches the clue and sums correctly
  for (const group of groups) {
    const sum = group.reduce((acc, [r, c]) => acc + grid[r][c], 0);
    const connected = isConnectedGroup(group, grid);
    const touchesClue = getAdjacent([clueRow, clueCol], grid).some(([ar, ac]) =>
      group.some(([gr, gc]) => gr === ar && gc === ac)
    );

    if (sum === clueValue && connected && touchesClue) {
      return true;
    }
  }

  return false;
};

// Simplified getNextExpectedNumber
export const getNextExpectedNumber = (grid, puzzle) => {
  let n = 4;

  while (true) {
    let foundAndSatisfied = false;

    // Check if number exists and is satisfied
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] === n) {
          // If player placed it, it's satisfied
          if (puzzle[r][c] === null || puzzle[r][c] === undefined) {
            foundAndSatisfied = true;
            break;
          }
          
          // If it's a clue, check if it's reachable
          if (isClueReachable(r, c, n, grid, puzzle)) {
            foundAndSatisfied = true;
            break;
          }
        }
      }
      if (foundAndSatisfied) break;
    }

    // If not found or not satisfied, this is the next expected number
    if (!foundAndSatisfied) return n;
    
    n++;
  }
};

/**
 * Prefilled clue values strictly between the number just placed and the solver's
 * next unsatisfied target — these are satisfied clues the player does not place.
 * Each entry lists all grid positions for that clue value.
 */
export const getPrefilledCluesSkippedBeforeNext = (grid, puzzle, placedExpected, nextExpected) => {
  const chain = [];
  for (let n = placedExpected + 1; n < nextExpected; n++) {
    const positions = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] === n && puzzle[r][c] === n) {
          positions.push([r, c]);
        }
      }
    }
    if (positions.length > 0) {
      chain.push({ value: n, positions });
    }
  }
  return chain;
};

export const isNextNumberBlockedByClue = (grid, puzzle) => {
  const next = getNextExpectedNumber(grid, puzzle);

  // Find all clue cells with the next number
  const clueCells = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === next && puzzle[r][c] === next) {
        clueCells.push([r, c]);
      }
    }
  }

  if (clueCells.length === 0) return false;

  // Check if any clue is reachable
  for (const [cr, cc] of clueCells) {
    if (isClueReachable(cr, cc, next, grid, puzzle)) {
      return false; // At least one clue is reachable
    }
  }

  return true; // No clue is reachable
};

const getCellKey = (r, c) => `${r},${c}`;

const getEmptyDensityScore = (grid, row, col, radius = 2) => {
  let score = 0;
  for (let r = Math.max(0, row - radius); r <= Math.min(grid.length - 1, row + radius); r++) {
    for (let c = Math.max(0, col - radius); c <= Math.min(grid[0].length - 1, col + radius); c++) {
      if (r === row && c === col) continue;
      if (grid[r][c] === null) score += 1;
    }
  }
  return score;
};

const getBlackWallScore = (grid, row, col) => {
  let score = 0;
  for (const [ar, ac] of getAdjacent([row, col], grid)) {
    if (grid[ar][ac] === "X") score += 2;
  }
  return score;
};

const getPlacementFutureScore = (grid, row, col) => {
  let score = 0;
  for (const [ar, ac] of getAdjacent([row, col], grid)) {
    const v = grid[ar][ac];
    if (v === null) score += 2;
    if (typeof v === "number") score += 1;
  }
  return score;
};

const getNumberCellsForTarget = (grid, target) => {
  const cells = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const v = grid[r][c];
      if (typeof v === "number" && v > 0 && v <= target) {
        cells.push([r, c]);
      }
    }
  }
  return cells;
};

// Lightweight "can this target be built?" probe used for strategic hint ranking.
const estimateTargetFlexibility = (grid, puzzle, target, hardMode) => {
  const maxSelection = getMaxSelection(hardMode, puzzle);
  const dynamicCap = Math.max(4, Math.min(8, target));
  const depthCap = Number.isFinite(maxSelection) ? Math.min(maxSelection, dynamicCap) : dynamicCap;
  const numberCells = getNumberCellsForTarget(grid, target);
  const pathLimit = 48;
  let legalPlacements = 0;

  const maybeCollectPlacement = (path) => {
    const [lr, lc] = path[path.length - 1];
    for (const [ar, ac] of getAdjacent([lr, lc], grid)) {
      if (grid[ar][ac] !== null) continue;
      if (puzzle?.[ar]?.[ac] !== null && puzzle?.[ar]?.[ac] !== undefined) continue;
      legalPlacements++;
      if (legalPlacements >= pathLimit) return true;
    }
    return false;
  };

  const dfs = (path, sum, visited) => {
    if (sum > target) return false;
    if (path.length > depthCap) return false;
    if (sum === target) return maybeCollectPlacement(path);

    const [lr, lc] = path[path.length - 1];
    for (const [nr, nc] of getAdjacent([lr, lc], grid)) {
      const key = getCellKey(nr, nc);
      if (visited.has(key)) continue;
      const v = grid[nr][nc];
      if (typeof v !== "number") continue;
      if (v <= 0 || v > target) continue;
      visited.add(key);
      path.push([nr, nc]);
      const hitLimit = dfs(path, sum + v, visited);
      path.pop();
      visited.delete(key);
      if (hitLimit) return true;
    }
    return false;
  };

  for (const [sr, sc] of numberCells) {
    const visited = new Set([getCellKey(sr, sc)]);
    const hitLimit = dfs([[sr, sc]], grid[sr][sc], visited);
    if (hitLimit) break;
  }

  return legalPlacements;
};

/**
 * Finds a legal, strategic hint move for the next expected number.
 * Returns:
 *  - selectedPath: ordered list of number cells to "select"
 *  - placeCell: [r,c] where the next number should be placed
 */
export const getHintMove = (grid, puzzle, hardMode) => {
  const target = getNextExpectedNumber(grid, puzzle);
  const maxSelection = getMaxSelection(hardMode, puzzle);
  const dynamicCap = Math.max(4, Math.min(8, target));
  const depthCap = Number.isFinite(maxSelection) ? Math.min(maxSelection, dynamicCap) : dynamicCap;

  const numberCells = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const v = grid[r][c];
      if (typeof v === "number" && v > 0 && v <= target) {
        numberCells.push([r, c]);
      }
    }
  }

  const results = [];

  const scorePlacement = (path, placeRow, placeCol) => {
    const nextGrid = grid.map((row) => [...row]);
    nextGrid[placeRow][placeCol] = target;
    const nextTarget = target + 1;
    const nextIsClue = puzzle.flat().includes(nextTarget);
    if (nextIsClue && isNextNumberBlockedByClue(nextGrid, puzzle)) {
      return Number.NEGATIVE_INFINITY;
    }

    const emptyDensity = getEmptyDensityScore(grid, placeRow, placeCol, 2);
    const blackWall = getBlackWallScore(grid, placeRow, placeCol);
    const future = getPlacementFutureScore(nextGrid, placeRow, placeCol);
    const shorterPathBonus = Math.max(0, 10 - path.length);

    // Stronger strategic signal: prefer states with many legal next-target continuations.
    const nextFlex = estimateTargetFlexibility(nextGrid, puzzle, nextTarget, hardMode);
    // Also probe one more target ahead, but keep it cheap by only checking if next has any options.
    const twoStepFlex = nextFlex > 0
      ? estimateTargetFlexibility(nextGrid, puzzle, nextTarget + 1, hardMode)
      : 0;

    return (emptyDensity * 1.5) +
      (blackWall * 3) +
      (future * 1.5) +
      (shorterPathBonus * 0.5) +
      (nextFlex * 4) +
      (twoStepFlex * 1.75);
  };

  const maybeCollectPlacement = (path) => {
    const [lr, lc] = path[path.length - 1];
    for (const [ar, ac] of getAdjacent([lr, lc], grid)) {
      if (grid[ar][ac] !== null) continue;
      if (puzzle?.[ar]?.[ac] !== null && puzzle?.[ar]?.[ac] !== undefined) continue;
      const score = scorePlacement(path, ar, ac);
      if (Number.isFinite(score)) {
        results.push({
          selectedPath: [...path],
          placeCell: [ar, ac],
          score
        });
      }
    }
  };

  const dfs = (path, sum, visited) => {
    if (sum > target) return;
    if (path.length > depthCap) return;
    if (sum === target) {
      maybeCollectPlacement(path);
      return;
    }

    const [lr, lc] = path[path.length - 1];
    for (const [nr, nc] of getAdjacent([lr, lc], grid)) {
      const key = getCellKey(nr, nc);
      if (visited.has(key)) continue;
      const v = grid[nr][nc];
      if (typeof v !== "number") continue;
      if (v <= 0 || v > target) continue;
      visited.add(key);
      path.push([nr, nc]);
      dfs(path, sum + v, visited);
      path.pop();
      visited.delete(key);
    }
  };

  for (const [sr, sc] of numberCells) {
    const startVal = grid[sr][sc];
    const startPath = [[sr, sc]];
    const visited = new Set([getCellKey(sr, sc)]);
    dfs(startPath, startVal, visited);
  }

  if (!results.length) return null;
  results.sort((a, b) => b.score - a.score);
  return results[0];
};
