#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function parseGridDefs(content, mini) {
  const prefix = mini ? "puzzleMini" : "puzzle";
  const rx = new RegExp(`export const (${prefix}\\d+) = \\[([\\s\\S]*?)\\n\\];`, "g");
  const map = new Map();
  let m;
  while ((m = rx.exec(content)) !== null) {
    map.set(m[1], `[\n${m[2]}\n]`);
  }
  return map;
}

function parseEntries(content, arrayName) {
  const marker = `export const ${arrayName} = [`;
  const start = content.indexOf(marker);
  const end = content.indexOf("];", start);
  const block = content.slice(start, end + 2);
  const rx = /\{\s*name:\s*"(\d{8})",\s*grid:\s*([A-Za-z0-9_]+)(?:,\s*number:\s*"[^"]+")?\s*\}/g;
  const entries = [];
  let m;
  while ((m = rx.exec(block)) !== null) {
    entries.push({ name: m[1], gridRef: m[2] });
  }
  return entries;
}

function normalize(filePath, arrayName, mini) {
  const content = fs.readFileSync(filePath, "utf8");
  const grids = parseGridDefs(content, mini);
  const entries = parseEntries(content, arrayName);

  // Stable sort by date so index order matches chronological schedule.
  const withIdx = entries.map((e, i) => ({ ...e, i }));
  withIdx.sort((a, b) => a.name.localeCompare(b.name) || a.i - b.i);

  const out = [];
  out.push(`// ${mini ? "Mini" : "Full"} Game Puzzles (${mini ? "5x5" : "7x7"})`);
  out.push(`export const ${arrayName} = [`);
  for (const e of withIdx) {
    const literal = grids.get(e.gridRef);
    if (!literal) throw new Error(`Missing grid literal for ${e.gridRef}`);
    const grid = vm.runInNewContext(`(${literal})`);
    const gridStr = JSON.stringify(grid, null, 2).replace(/"/g, '"');
    out.push(`  { name: "${e.name}", grid: ${gridStr} },`);
  }
  // remove trailing comma from last entry
  if (out[out.length - 1].endsWith(",")) {
    out[out.length - 1] = out[out.length - 1].slice(0, -1);
  }
  out.push("];");
  out.push("");

  fs.writeFileSync(filePath, out.join("\n"), "utf8");
}

const root = path.resolve(__dirname, "..");
normalize(path.join(root, "src", "puzzles", "puzzles.js"), "puzzles", false);
normalize(path.join(root, "src", "puzzles", "puzzlesMini.js"), "puzzlesMini", true);
console.log("Normalized puzzles.js and puzzlesMini.js");
