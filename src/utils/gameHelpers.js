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

export const isCellEmpty = (r, c, grid) => {
  return grid[r][c] === null;
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
