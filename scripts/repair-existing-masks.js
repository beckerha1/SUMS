#!/usr/bin/env node
const fs = require("fs");
const vm = require("vm");

function parsePuzzleArrayFromFile(filePath, exportName) {
  const text = fs.readFileSync(filePath, "utf8");
  const marker = `export const ${exportName} =`;
  const i = text.indexOf(marker);
  if (i === -1) throw new Error(`Missing export ${exportName} in ${filePath}`);
  const start = text.indexOf("[", i);
  let depth = 0;
  let end = -1;
  for (let k = start; k < text.length; k++) {
    const ch = text[k];
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        end = k;
        break;
      }
    }
  }
  if (end === -1) throw new Error(`Could not parse array in ${filePath}`);
  const arrLiteral = text.slice(start, end + 1);
  const arr = vm.runInNewContext(`(${arrLiteral})`);
  return arr;
}

function countOpens(grid) {
  const size = grid.length;
  const rowOpen = Array(size).fill(0);
  const colOpen = Array(size).fill(0);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== "X") {
        rowOpen[r]++;
        colOpen[c]++;
      }
    }
  }
  return { rowOpen, colOpen };
}

function isBoringMask(grid) {
  const { rowOpen, colOpen } = countOpens(grid);
  const fullRow = rowOpen.some((v) => v === 0);
  const fullCol = colOpen.some((v) => v === 0);
  const nearRows = rowOpen.filter((v) => v <= 2).length;
  const nearCols = colOpen.filter((v) => v <= 2).length;
  return fullRow || fullCol || nearRows > 1 || nearCols > 1;
}

function chooseXInRow(grid, r) {
  const size = grid.length;
  const order = [];
  const mid = (size - 1) / 2;
  for (let c = 0; c < size; c++) order.push(c);
  order.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
  return order.find((c) => grid[r][c] === "X");
}

function chooseXInCol(grid, c) {
  const size = grid.length;
  const order = [];
  const mid = (size - 1) / 2;
  for (let r = 0; r < size; r++) order.push(r);
  order.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
  return order.find((r) => grid[r][c] === "X");
}

function repairMask(grid) {
  const g = grid.map((row) => [...row]);
  const size = g.length;

  for (let iter = 0; iter < 32; iter++) {
    const { rowOpen, colOpen } = countOpens(g);
    const fullRows = rowOpen.map((v, i) => (v === 0 ? i : -1)).filter((v) => v >= 0);
    const fullCols = colOpen.map((v, i) => (v === 0 ? i : -1)).filter((v) => v >= 0);
    const nearRows = rowOpen.map((v, i) => ({ v, i })).filter((x) => x.v <= 2);
    const nearCols = colOpen.map((v, i) => ({ v, i })).filter((x) => x.v <= 2);

    if (fullRows.length === 0 && fullCols.length === 0 && nearRows.length <= 1 && nearCols.length <= 1) {
      return g;
    }

    let changed = false;

    for (const r of fullRows) {
      const c = chooseXInRow(g, r);
      if (c !== undefined) {
        g[r][c] = null;
        changed = true;
      }
    }
    for (const c of fullCols) {
      const r = chooseXInCol(g, c);
      if (r !== undefined) {
        g[r][c] = null;
        changed = true;
      }
    }

    if (!changed) {
      const extraNearRows = nearRows.slice(1).sort((a, b) => a.v - b.v);
      for (const { i: r } of extraNearRows) {
        const c = chooseXInRow(g, r);
        if (c !== undefined) {
          g[r][c] = null;
          changed = true;
        }
      }
      const extraNearCols = nearCols.slice(1).sort((a, b) => a.v - b.v);
      for (const { i: c } of extraNearCols) {
        const r = chooseXInCol(g, c);
        if (r !== undefined) {
          g[r][c] = null;
          changed = true;
        }
      }
    }

    if (!changed) break;
  }
  return g;
}

function formatPuzzles(filePath, exportName, label, puzzles) {
  const lines = [];
  lines.push(`// ${label}`);
  lines.push(`export const ${exportName} = [`);
  for (let i = 0; i < puzzles.length; i++) {
    const p = puzzles[i];
    lines.push(`  { name: "${p.name}", grid: [`);
    for (let r = 0; r < p.grid.length; r++) {
      const row = p.grid[r]
        .map((v) => (v === null ? "null" : typeof v === "string" ? `"${v}"` : String(v)))
        .join(", ");
      lines.push(`    [${row}]${r === p.grid.length - 1 ? "" : ","}`);
    }
    lines.push(`  ] }${i === puzzles.length - 1 ? "" : ","}`);
  }
  lines.push("];");
  lines.push("");
  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
}

function processFile(filePath, exportName, label) {
  const puzzles = parsePuzzleArrayFromFile(filePath, exportName);
  let repaired = 0;
  for (const p of puzzles) {
    if (isBoringMask(p.grid)) {
      p.grid = repairMask(p.grid);
      repaired++;
    }
  }
  const remaining = puzzles.filter((p) => isBoringMask(p.grid)).length;
  formatPuzzles(filePath, exportName, label, puzzles);
  return { repaired, remaining, total: puzzles.length };
}

const full = processFile("src/puzzles/puzzles.js", "puzzles", "Full Game Puzzles (7x7)");
const mini = processFile("src/puzzles/puzzlesMini.js", "puzzlesMini", "Mini Game Puzzles (5x5)");

console.log(`Full repaired: ${full.repaired}/${full.total}, remaining offenders: ${full.remaining}`);
console.log(`Mini repaired: ${mini.repaired}/${mini.total}, remaining offenders: ${mini.remaining}`);
