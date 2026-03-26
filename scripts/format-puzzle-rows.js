#!/usr/bin/env node
const fs = require("fs");
const vm = require("vm");

const files = [
  { path: "src/puzzles/puzzles.js", name: "puzzles", label: "Full Game Puzzles (7x7)" },
  { path: "src/puzzles/puzzlesMini.js", name: "puzzlesMini", label: "Mini Game Puzzles (5x5)" }
];

for (const f of files) {
  const text = fs.readFileSync(f.path, "utf8");
  const marker = `export const ${f.name} =`;
  const i = text.indexOf(marker);
  if (i === -1) throw new Error(`marker not found: ${f.path}`);
  const arrStart = text.indexOf("[", i);
  let depth = 0;
  let end = -1;
  for (let k = arrStart; k < text.length; k++) {
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
  if (end === -1) throw new Error(`array end not found: ${f.path}`);
  const arrLiteral = text.slice(arrStart, end + 1);
  const arr = vm.runInNewContext(`(${arrLiteral})`);

  const lines = [];
  lines.push(`// ${f.label}`);
  lines.push(`export const ${f.name} = [`);
  for (let idx = 0; idx < arr.length; idx++) {
    const p = arr[idx];
    lines.push(`  { name: "${p.name}", grid: [`);
    for (let r = 0; r < p.grid.length; r++) {
      const row = p.grid[r]
        .map((v) => (v === null ? "null" : typeof v === "string" ? `"${v}"` : String(v)))
        .join(", ");
      lines.push(`    [${row}]${r === p.grid.length - 1 ? "" : ","}`);
    }
    lines.push(`  ] }${idx === arr.length - 1 ? "" : ","}`);
  }
  lines.push("];");
  lines.push("");
  fs.writeFileSync(f.path, lines.join("\n"), "utf8");
  console.log("formatted", f.path);
}
