import React, { useState, useEffect } from 'react';
import CanvasOverlay from './CanvasOverlay';
import NumberOverlay from './NumberOverlay';

const InteractiveTutorial = ({ onComplete, onPlayMini, onPlayFull }) => {
  const [tutorialStep, setTutorialStep] = useState(0);
  const [autoPlayStep, setAutoPlayStep] = useState(0);
  const [autoPlayStep3, setAutoPlayStep3] = useState(0);
  const [grid, setGrid] = useState([[1, 2, null], [null, null, null], [null, null, 5]]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [placementPath, setPlacementPath] = useState([]);
  const [userSelectedCorrectly, setUserSelectedCorrectly] = useState(false);
  const [canPlaceNumber, setCanPlaceNumber] = useState(false);
  const [userCompletedPlacement, setUserCompletedPlacement] = useState(false);

  // Step 4 state: user fills out the rest of the grid
  const [step4Grid, setStep4Grid] = useState([[1, 2, null], [3, 4, null], [null, null, 5]]);
  const [step4Selected, setStep4Selected] = useState([]);
  const [step4PlacementPath, setStep4PlacementPath] = useState([]);
  const [step4Complete, setStep4Complete] = useState(false);
  const [step4CanPlace, setStep4CanPlace] = useState(false);
  const [step4PlaceTarget, setStep4PlaceTarget] = useState(null);

  const puzzle = [[1, 2, null], [null, null, null], [null, null, 5]];
  // Only 1, 2 (top row) and 5 (clue) are prefilled — 3, 4, 6+ are player-placed
  const step4Puzzle = [[1, 2, null], [null, null, null], [null, null, 5]];
  const cellSize = 60;
  const margin = 2;

  // Screen 1: Auto-play showing 1+2=3
  useEffect(() => {
    if (tutorialStep === 1) {
      const sequence = [
        { delay: 0, action: () => {
          setSelectedCells([]);
          setPlacementPath([]);
          setGrid([[1, 2, null], [null, null, null], [null, null, 5]]);
          setAutoPlayStep(0);
        }},
        { delay: 750,  action: () => { setSelectedCells([[0, 0]]); setAutoPlayStep(1); } },
        { delay: 1750, action: () => { setSelectedCells([[0, 0], [0, 1]]); setAutoPlayStep(2); } },
        { delay: 2750, action: () => { setPlacementPath([[0, 1], [1, 0]]); setAutoPlayStep(3); } },
        { delay: 3000, action: () => {
          setPlacementPath([]);
          setSelectedCells([]);
          setGrid([[1, 2, null], [3, null, null], [null, null, 5]]);
        }},
        { delay: 3500, action: () => { setAutoPlayStep(4); } }
      ];
      const timeouts = sequence.map(({ delay, action }) => setTimeout(action, delay));
      return () => timeouts.forEach(clearTimeout);
    }
  }, [tutorialStep]);

  // Screen 3: Auto-play showing 1+2+3=6
  useEffect(() => {
    if (tutorialStep === 3) {
      // Always reset to clean state when entering screen 3
      setStep4Grid([[1, 2, null], [3, 4, null], [null, null, 5]]);
      setStep4Selected([]);
      setStep4PlacementPath([]);
      setAutoPlayStep3(0);

      const sequence = [
        { delay: 0, action: () => {
          setStep4Selected([]);
          setStep4PlacementPath([]);
          setAutoPlayStep3(0);
        }},
        { delay: 750,  action: () => { setStep4Selected([[0, 0]]); setAutoPlayStep3(1); } },
        { delay: 1500, action: () => { setStep4Selected([[0, 0], [0, 1]]); setAutoPlayStep3(2); } },
        { delay: 2250, action: () => { setStep4Selected([[0, 0], [0, 1], [1, 0]]); setAutoPlayStep3(3); } },
        { delay: 3000, action: () => { setStep4PlacementPath([[1, 0], [2, 0]]); setAutoPlayStep3(4); } },
        { delay: 3300, action: () => {
          setStep4Grid([[1, 2, null], [3, 4, null], [6, null, 5]]);
          setStep4PlacementPath([]);
          setStep4Selected([]);
          setAutoPlayStep3(5);
        }}
      ];
      const timeouts = sequence.map(({ delay, action }) => setTimeout(action, delay));
      return () => timeouts.forEach(clearTimeout);
    }
  }, [tutorialStep]);

  // ── Step 2 handlers (place 4 by selecting 1+3) ──────────────────
  const handleCellClick = (r, c) => {
    if (tutorialStep === 2) {
      const cellValue = grid[r][c];

      if (canPlaceNumber && r === 1 && c === 1 && grid[r][c] === null) {
        setPlacementPath([[1, 0], [r, c]]);
        setTimeout(() => {
          setGrid([[1, 2, null], [3, 4, null], [null, null, 5]]);
          setSelectedCells([]);
          setPlacementPath([]);
          setCanPlaceNumber(false);
          setUserCompletedPlacement(true);
        }, 200);
        return;
      }

      if (cellValue === null || cellValue === 5) return;

      const selectedIndex = selectedCells.findIndex(([sr, sc]) => sr === r && sc === c);
      if (selectedIndex !== -1) {
        setSelectedCells(selectedIndex === 0 && selectedCells.length === 1
          ? [] : selectedCells.slice(0, selectedIndex));
        setUserSelectedCorrectly(false);
        setCanPlaceNumber(false);
        return;
      }

      if (selectedCells.length === 0) {
        setSelectedCells([[r, c]]);
        return;
      }

      const [lastR, lastC] = selectedCells[selectedCells.length - 1];
      const isAdjacent = Math.abs(r - lastR) + Math.abs(c - lastC) === 1;
      if (!isAdjacent) {
        setSelectedCells([[r, c]]);
        setUserSelectedCorrectly(false);
        setCanPlaceNumber(false);
        return;
      }

      const newSelected = [...selectedCells, [r, c]];
      setSelectedCells(newSelected);

      const hasOne   = newSelected.some(([sr, sc]) => grid[sr][sc] === 1);
      const hasThree = newSelected.some(([sr, sc]) => grid[sr][sc] === 3);
      if (hasOne && hasThree && newSelected.length === 2) {
        setUserSelectedCorrectly(true);
        setCanPlaceNumber(true);
      } else {
        setUserSelectedCorrectly(false);
        setCanPlaceNumber(false);
      }
    }
  };

  // ── Step 4 handlers (user completes the grid: place 5, 6, 7, 8, 9) ──
  // The grid starts as [[1,2,null],[3,4,null],[null,null,5]]
  // Next numbers to place: 5→ wait, 5 is a clue already. So next = 6, 7, 8, 9
  // Actually after 4 is placed, next expected = 5 (clue, already there), then 6, 7, 8, 9
  // We simplify: user places 6, 7, 8, 9 into the remaining 4 empty cells
  // For simplicity we track next expected manually
  const getNextExpected = (g) => {
    const flat = g.flat();
    const nums = flat.filter(v => typeof v === 'number').sort((a, b) => a - b);
    // find first gap starting from 1
    for (let i = 1; i <= 20; i++) {
      if (!nums.includes(i)) return i;
    }
    return null;
  };

  const isAdjacentCell = (r1, c1, r2, c2) =>
    Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;

  const isConnected = (cells) => {
    if (cells.length <= 1) return true;
    const visited = new Set();
    const queue = [cells[0]];
    visited.add(cells[0].join(','));
    while (queue.length) {
      const [cr, cc] = queue.shift();
      for (const [nr, nc] of cells) {
        const key = `${nr},${nc}`;
        if (!visited.has(key) && isAdjacentCell(cr, cc, nr, nc)) {
          visited.add(key);
          queue.push([nr, nc]);
        }
      }
    }
    return visited.size === cells.length;
  };

  const handleStep4Click = (r, c) => {
    if (step4Complete) return;
    const g = step4Grid;
    const cellValue = g[r][c];
    const next = getNextExpected(g);

    // Try placing sum on empty cell
    if (cellValue === null && step4Selected.length > 0) {
      const sum = step4Selected.reduce((acc, [sr, sc]) => acc + g[sr][sc], 0);
      const [lr, lc] = step4Selected[step4Selected.length - 1];
      const adjToLast = isAdjacentCell(lr, lc, r, c);
      if (sum === next && isConnected(step4Selected) && adjToLast) {
        // Place it
        setStep4PlacementPath([[lr, lc], [r, c]]);
        setTimeout(() => {
          const newGrid = g.map(row => [...row]);
          newGrid[r][c] = sum;
          setStep4Grid(newGrid);
          setStep4Selected([]);
          setStep4PlacementPath([]);
          setStep4CanPlace(false);
          // Check complete
          const allFilled = newGrid.flat().every(v => v !== null);
          if (allFilled) setStep4Complete(true);
        }, 200);
      } else {
        setStep4Selected([]);
        setStep4CanPlace(false);
      }
      return;
    }

    if (cellValue === null) return;
    // Selecting a numbered cell
    if (step4Selected.length === 0) {
      setStep4Selected([[r, c]]);
      return;
    }

    const selIdx = step4Selected.findIndex(([sr, sc]) => sr === r && sc === c);
    if (selIdx !== -1) {
      setStep4Selected(selIdx === 0 && step4Selected.length === 1
        ? [] : step4Selected.slice(0, selIdx));
      setStep4CanPlace(false);
      return;
    }

    const [lastR, lastC] = step4Selected[step4Selected.length - 1];
    if (!isAdjacentCell(lastR, lastC, r, c)) {
      setStep4Selected([[r, c]]);
      setStep4CanPlace(false);
      return;
    }

    const newSel = [...step4Selected, [r, c]];
    setStep4Selected(newSel);
    const sum = newSel.reduce((acc, [sr, sc]) => acc + g[sr][sc], 0);
    setStep4CanPlace(sum === next && isConnected(newSel));
  };

  const getStep4DropTarget = (r, c) => {
    if (step4Grid[r][c] !== null) return false;
    if (!step4Selected.length) return false;
    const g = step4Grid;
    const sum = step4Selected.reduce((acc, [sr, sc]) => acc + g[sr][sc], 0);
    const next = getNextExpected(g);
    const [lr, lc] = step4Selected[step4Selected.length - 1];
    return sum === next && isConnected(step4Selected) && isAdjacentCell(lr, lc, r, c);
  };

  const step4OverlayPoints = [
    ...step4Selected,
    ...step4PlacementPath.slice(step4Selected.length > 0 ? 1 : 0)
  ].map(([r, c], idx, arr) => ({
    row: r, col: c,
    placed: idx === arr.length - 1 && step4PlacementPath.length > 0
  }));

  const getDropTargetHighlight = (r, c) =>
    canPlaceNumber && r === 1 && c === 1 && grid[r][c] === null;

  const overlayPoints = [...selectedCells, ...placementPath].map(([r, c], idx, arr) => ({
    row: r, col: c,
    placed: idx === arr.length - 1 && placementPath.length > 0
  }));

  // Screen 3 overlay (auto-play 1+2+3=6 demo) — uses step4Grid so placed 6 appears
  const screen3Grid = step4Grid;
  const screen3Puzzle = [[1, 2, null], [null, null, null], [null, null, 5]];
  const screen3OverlayPoints = [
    ...step4Selected,
    ...step4PlacementPath.slice(step4Selected.length > 0 ? 1 : 0)
  ].map(([r, c], idx, arr) => ({
    row: r, col: c,
    placed: idx === arr.length - 1 && step4PlacementPath.length > 0
  }));

  // ── Shared styles ────────────────────────────────────────────────
  const buttonStyle = {
    padding: '12px 32px',
    fontSize: '16px',
    borderRadius: '24px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s'
  };
  const primaryButtonStyle = { ...buttonStyle, backgroundColor: '#303036', color: '#fff' };
  const secondaryButtonStyle = { ...buttonStyle, border: '1px solid #303036', backgroundColor: '#fff', color: '#303036' };

  const gridContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#f8f8f8',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '320px',
    margin: '0 auto 20px',
    boxSizing: 'border-box'
  };

  const renderGrid = (g, puz, onCellClick, dropTargetFn, overlayPts, statusText) => (
    <div style={gridContainerStyle}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <CanvasOverlay overlayPoints={overlayPts} grid={g} cellSize={cellSize} margin={margin} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          {g.map((row, rIdx) => (
            <div key={rIdx} style={{ display: 'flex' }}>
              {row.map((cell, cIdx) => {
                const isClue = puz[rIdx][cIdx] !== null && puz[rIdx][cIdx] !== undefined && typeof puz[rIdx][cIdx] === 'number';
                const isDrop = dropTargetFn ? dropTargetFn(rIdx, cIdx) : false;
                return (
                  <div
                    key={cIdx}
                    onClick={() => onCellClick && onCellClick(rIdx, cIdx)}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      margin,
                      backgroundColor: isDrop ? '#b3eaf2' : isClue && cell !== null ? '#e3e6ec' : '#fff',
                      border: '1px solid #999',
                      position: 'relative',
                      zIndex: 1,
                      cursor: onCellClick ? 'pointer' : 'default',
                      transform: isDrop ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.15s ease'
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <NumberOverlay grid={g} puzzle={puz} cellSize={cellSize} margin={margin} />
      </div>
      {statusText && (
        <p style={{
          marginTop: '16px',
          fontSize: '16px',
          fontWeight: '500',
          color: '#333',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          {statusText}
        </p>
      )}
    </div>
  );

  return (
    <div style={{ textAlign: 'center', padding: '20px', maxWidth: '500px', margin: '0 auto' }}>

      {/* ── Screen 0: Introduction ────────────────────────── */}
      {tutorialStep === 0 && (
        <>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: 'bold' }}>
            How to Play
          </h3>
          <p style={{
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '30px',
            lineHeight: '1.6',
            textAlign: 'left'
          }}>
            SUMS is a mathematical logic game with a sprinkle of spatial reasoning.
            <br /><br />
            The goal for each puzzle is to <strong>fill all empty squares with a number.</strong>
            <br /><br />
            Numbers can only be placed in <strong>numerical order</strong> and by selecting a sequence of <strong>two or more numbers</strong> that are touching one another and the cell for the next number.
          </p>
          <button onClick={() => setTutorialStep(1)} style={primaryButtonStyle}>
            Next
          </button>
        </>
      )}

      {/* ── Screen 1: Auto-play 1+2=3 ─────────────────────── */}
      {tutorialStep === 1 && (
        <>
          {renderGrid(
            grid,
            puzzle,
            null,
            null,
            overlayPoints,
            autoPlayStep === 0 ? "Next number: 3" :
            autoPlayStep === 1 ? "Select 1..." :
            autoPlayStep === 2 ? "Then select 2..." :
            autoPlayStep === 3 ? "1 + 2 = 3" :
            "3 is now placed!"
          )}
          <p style={{
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '20px',
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            In the example above, the <strong>next number is 3.</strong>
            <br /><br />
            To get there, <strong>select 1 and 2</strong> — they sum to 3 — then tap the adjacent empty cell to place it.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => setTutorialStep(0)} style={secondaryButtonStyle}>Back</button>
            <button
              onClick={() => setTutorialStep(2)}
              disabled={autoPlayStep < 4}
              style={{
                ...primaryButtonStyle,
                backgroundColor: autoPlayStep >= 4 ? '#303036' : '#e0e0e0',
                color: autoPlayStep >= 4 ? '#fff' : '#999',
                cursor: autoPlayStep >= 4 ? 'pointer' : 'not-allowed'
              }}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* ── Screen 2: User places 4 (1+3) ────────────────── */}
      {tutorialStep === 2 && (
        <>
          {renderGrid(
            grid,
            puzzle,
            handleCellClick,
            getDropTargetHighlight,
            overlayPoints,
            !userSelectedCorrectly && !userCompletedPlacement
              ? "Select 1 and 3 to make 4"
              : userSelectedCorrectly && !userCompletedPlacement
                ? "Great! Now tap the blue cell to place 4"
                : "Perfect! You placed 4! 🎉"
          )}
          <p style={{
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '20px',
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            Some numbers will already be placed as part of the starting grid.
            <br /><br />
            You must place 4 strategically so there is a valid path to reach the clue number 5.
            <br /><br />
            <strong>Please place 4</strong> using the grid above.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setTutorialStep(1);
                setUserCompletedPlacement(false);
                setUserSelectedCorrectly(false);
                setGrid([[1, 2, null], [3, null, null], [null, null, 5]]);
                setSelectedCells([]);
              }}
              style={secondaryButtonStyle}
            >
              Back
            </button>
            {userCompletedPlacement && (
              <button onClick={() => {
                setStep4Grid([[1, 2, null], [3, 4, null], [null, null, 5]]);
                setStep4Selected([]);
                setStep4Complete(false);
                setTutorialStep(3);
              }} style={primaryButtonStyle}>
                Next
              </button>
            )}
          </div>
        </>
      )}

      {/* ── Screen 3: Auto-play 1+2+3=6 (normal mode demo) ── */}
      {tutorialStep === 3 && (
        <>
          {renderGrid(
            screen3Grid,
            screen3Puzzle,
            null,
            null,
            screen3OverlayPoints,
            autoPlayStep3 === 0 ? "Next number: 6" :
            autoPlayStep3 === 1 ? "Select 1..." :
            autoPlayStep3 === 2 ? "Then 2..." :
            autoPlayStep3 === 3 ? "Then 3..." :
            autoPlayStep3 === 4 ? "1 + 2 + 3 = 6" :
            "6 is placed!"
          )}
          <p style={{
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '20px',
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            In normal mode, your sequence can include <strong>as many numbers as you need.</strong>
            <br /><br />
            In the example above, you can select <strong>1 + 2 + 3 to get 6</strong> — as long as each number touches the next.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setTutorialStep(2);
                setStep4Selected([]);
                setStep4PlacementPath([]);
                setAutoPlayStep3(0);
              }}
              style={secondaryButtonStyle}
            >
              Back
            </button>
            <button
              onClick={() => setTutorialStep(4)}
              disabled={autoPlayStep3 < 5}
              style={{
                ...primaryButtonStyle,
                backgroundColor: autoPlayStep3 >= 5 ? '#303036' : '#e0e0e0',
                color: autoPlayStep3 >= 5 ? '#fff' : '#999',
                cursor: autoPlayStep3 >= 5 ? 'pointer' : 'not-allowed'
              }}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* ── Screen 4: User completes the rest of the grid ── */}
      {tutorialStep === 4 && (
        <>
          {renderGrid(
            step4Grid,
            step4Puzzle,
            handleStep4Click,
            getStep4DropTarget,
            step4OverlayPoints,
            step4Complete
              ? "You did it! The grid is complete! 🎉"
              : `Next number to place: ${getNextExpected(step4Grid)}`
          )}
          <p style={{
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '20px',
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            Now it's your turn — <strong>fill out the rest of the grid</strong> using what you've learned.
            <br /><br />
            Select adjacent numbers that sum to the next number, then tap an empty cell to place it.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setStep4Grid([[1, 2, null], [3, 4, null], [null, null, 5]]);
                setStep4Selected([]);
                setStep4PlacementPath([]);
                setStep4Complete(false);
                setAutoPlayStep3(0);
                setTutorialStep(3);
              }}
              style={secondaryButtonStyle}
            >
              Back
            </button>
            {step4Complete && (
              <button onClick={() => setTutorialStep(5)} style={primaryButtonStyle}>
                Next
              </button>
            )}
          </div>
        </>
      )}

      {/* ── Screen 5: Choose your game ───────────────────── */}
      {tutorialStep === 5 && (
        <>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: 'bold' }}>
            Ready to Play! 🎉
          </h3>
          <p style={{
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '24px',
            lineHeight: '1.6',
            textAlign: 'left'
          }}>
            Now that you know the basics, it's your turn!
            <br /><br />
            Each day there are 2 new puzzles available:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            <button
              onClick={() => { onComplete(); onPlayMini(); }}
              style={{ ...primaryButtonStyle, width: '100%', fontSize: '15px' }}
            >
              Play Mini SUMS
            </button>
            <p style={{ margin: '-6px 0 0', fontSize: '0.88rem', color: '#666', textAlign: 'center' }}>
              5×5 grid for when you only have a few minutes
            </p>

            <button
              onClick={() => { onComplete(); onPlayFull(); }}
              style={{ ...primaryButtonStyle, width: '100%', fontSize: '15px' }}
            >
              Play SUMS
            </button>
            <p style={{ margin: '-6px 0 0', fontSize: '0.88rem', color: '#666', textAlign: 'center' }}>
              7×7 grid that may take you a full cup of coffee to finish
            </p>
          </div>

          <button
            onClick={() => {
              setTutorialStep(1);
              setUserCompletedPlacement(false);
              setUserSelectedCorrectly(false);
              setAutoPlayStep(0);
              setAutoPlayStep3(0);
              setGrid([[1, 2, null], [null, null, null], [null, null, 5]]);
              setSelectedCells([]);
              setPlacementPath([]);
              setStep4Grid([[1, 2, null], [3, 4, null], [null, null, 5]]);
              setStep4Selected([]);
              setStep4Complete(false);
            }}
            style={{ ...secondaryButtonStyle, fontSize: '14px', padding: '8px 20px' }}
          >
            Review Tutorial
          </button>
        </>
      )}
    </div>
  );
};

export default InteractiveTutorial;