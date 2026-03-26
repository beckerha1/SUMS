#!/usr/bin/env node
// ================================================================
// SUMS Puzzle Generator - correct chain mechanic, optimized DFS
//
// To place N: build a chain through placed numbers where each step
// is 8-adjacent to the previous, chain sums to N, then place N in
// any empty cell 8-adjacent to the last element of the chain.
// ================================================================

const ALL8 = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

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

  if(!verifyPlayable(hintGrid, finalGrid, SIZE, targetN, placedPos)) return null;

  return{grid:hintGrid,solution:finalGrid,placedPos,N:targetN};
}

// Simulate play: starting from hints only, place 4..N in order using
// the solution's positions. Each must be reachable via chain mechanic.
function verifyPlayable(hintGrid, solution, SIZE, N, placedPos) {
  const sim = hintGrid.map(row=>[...row]);
  for(let val=4;val<=N;val++) {
    const [solR,solC] = placedPos[val-1];
    // Is solution cell already a hint? If so skip (it's pre-placed)
    if(sim[solR][solC]===val) continue;
    // Check it's reachable as a placement via chain
    const cands = findPlacementCells(sim, SIZE, val);
    if(!cands.some(([r,c])=>r===solR&&c===solC)) return false;
    sim[solR][solC]=val;
  }
  return true;
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

function addDays(s,d){const dt=new Date(s.slice(0,4)+'-'+s.slice(4,6)+'-'+s.slice(6,8));dt.setDate(dt.getDate()+d);return`${dt.getFullYear()}${String(dt.getMonth()+1).padStart(2,'0')}${String(dt.getDate()).padStart(2,'0')}`;}
function formatGrid(g){return'[\n'+g.map(row=>'  ['+row.map(c=>c==='X'?'"X"':c===null?'null':String(c)).join(', ')+']').join(',\n')+'\n]';}

const FULL_COUNT=15,MINI_COUNT=15;
console.log('Generating full 7x7 puzzles (correct chain mechanic)...');
const fullResults=[];
for(let i=0;i<FULL_COUNT;i++){
  const{N,density}=fullConfigs[i];
  process.stdout.write(`  [${i+1}] N=${N} ${density}... `);
  const r=generatePuzzle(7,N,density);
  if(r){fullResults.push(r);process.stdout.write(`OK (N=${r.N}) ✓\n`);}
  else process.stdout.write(`FAILED\n`);
}
console.log('\nGenerating mini 5x5 puzzles...');
const miniResults=[];
for(let i=0;i<MINI_COUNT;i++){
  const{N,density}=miniConfigs[i];
  process.stdout.write(`  [${i+1}] N=${N} ${density}... `);
  const r=generatePuzzle(5,N,density);
  if(r){miniResults.push(r);process.stdout.write(`OK (N=${r.N}) ✓\n`);}
  else process.stdout.write(`FAILED\n`);
}

const FULL_START=22,MINI_START=24;
let fullDate='20260304',miniDate='20260306';
let fullCode='',miniCode='';
const fullEntries=[],miniEntries=[];
for(let i=0;i<fullResults.length;i++){
  const num=FULL_START+i,name=fullDate;fullDate=addDays(fullDate,1);
  fullCode+=`export const puzzle${num} = ${formatGrid(fullResults[i].grid)};\n\n`;
  fullEntries.push(`  { name: "${name}", grid: puzzle${num}, number: "${num}" }`);
}
for(let i=0;i<miniResults.length;i++){
  const num=MINI_START+i,name=miniDate;miniDate=addDays(miniDate,1);
  miniCode+=`export const puzzleMini${num} = ${formatGrid(miniResults[i].grid)};\n\n`;
  miniEntries.push(`  { name: "${name}", grid: puzzleMini${num}, number: "${num}" }`);
}
const fs=require('fs');
const path=require('path');
const outDir=__dirname;
fs.writeFileSync(path.join(outDir,'new-full-puzzles.js'),fullCode+`\n// ENTRIES:\n// ${fullEntries.join(',\n// ')}\n`);
fs.writeFileSync(path.join(outDir,'new-mini-puzzles.js'),miniCode+`\n// ENTRIES:\n// ${miniEntries.join(',\n// ')}\n`);
console.log(`\n✅ Full: ${fullResults.length}/15, Mini: ${miniResults.length}/15`);
