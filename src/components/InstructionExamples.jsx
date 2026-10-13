import React, { useState, useEffect, useRef } from 'react';
import CanvasOverlay from './CanvasOverlay';
import NumberOverlay from './NumberOverlay';
import { getNextExpectedNumber } from '../utils/gameHelpers';

const InteractiveTutorial = ({ onComplete, onPlayMini, onPlayFull, onStepChange, showWarmupOffer = false, onPlayWarmup }) => {
  const [tutorialStep, setTutorialStep] = useState(0);
  const [autoPlayStep, setAutoPlayStep] = useState(0);
  const [autoPlayStep3, setAutoPlayStep3] = useState(0);
  const [grid, setGrid] = useState([[1, 2, null], [null, null, null], [null, null, 5]]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [placementPath, setPlacementPath] = useState([]);
  const [userSelectedCorrectly, setUserSelectedCorrectly] = useState(false);
  const [canPlaceNumber, setCanPlaceNumber] = useState(false);
  const [userCompletedPlacement, setUserCompletedPlacement] = useState(false);
  const [screen3Grid, setScreen3Grid] = useState([[1, 2, null], [3, 4, null], [null, null, 5]]);
  const [screen3Selected, setScreen3Selected] = useState([]);
  const [screen3PlacementPath, setScreen3PlacementPath] = useState([]);
  const [step4Grid, setStep4Grid] = useState([[1, 2, null], [3, 4, null], [null, null, 5]]);
  const [step4Selected, setStep4Selected] = useState([]);
  const [step4PlacementPath, setStep4PlacementPath] = useState([]);
  const [step4Complete, setStep4Complete] = useState(false);
  const [step4CanPlace, setStep4CanPlace] = useState(false);
  const [screen2Notice, setScreen2Notice] = useState(null);
  const [step4Feedback, setStep4Feedback] = useState(null);
  const step4FeedbackTimerRef = useRef(null);

  const puzzle = [[1, 2, null], [null, null, null], [null, null, 5]];
  const screen3Puzzle = [[1, 2, null], [null, null, null], [null, null, 5]];
  const step4Puzzle = [[1, 2, null], [null, null, null], [null, null, 5]];
  const cellSize = 60;
  const margin = 2;

  useEffect(() => {
    if (onStepChange) onStepChange(tutorialStep);
  }, [tutorialStep, onStepChange]);

  useEffect(() => {
    setStep4Feedback(null);
    return () => {
      if (step4FeedbackTimerRef.current) {
        clearTimeout(step4FeedbackTimerRef.current);
        step4FeedbackTimerRef.current = null;
      }
    };
  }, [tutorialStep]);

  // Screen 2 auto-play: 1 + 2 = 3
  useEffect(() => {
    if (tutorialStep !== 1) return undefined;

    const sequence = [
      { delay: 0, action: () => {
        setSelectedCells([]);
        setPlacementPath([]);
        setGrid([[1, 2, null], [null, null, null], [null, null, 5]]);
        setAutoPlayStep(0);
      } },
      { delay: 900, action: () => { setSelectedCells([[0, 0]]); setAutoPlayStep(1); } },
      { delay: 1800, action: () => { setSelectedCells([[0, 0], [0, 1]]); setAutoPlayStep(2); } },
      { delay: 2700, action: () => { setPlacementPath([[0, 1], [1, 0]]); setAutoPlayStep(3); } },
      { delay: 3000, action: () => {
        setPlacementPath([]);
        setSelectedCells([]);
        setGrid([[1, 2, null], [3, null, null], [null, null, 5]]);
      } },
      { delay: 4500, action: () => { setAutoPlayStep(4); } }
    ];

    const timeouts = sequence.map(({ delay, action }) => setTimeout(action, delay));
    return () => timeouts.forEach(clearTimeout);
  }, [tutorialStep]);

  // Screen 4 auto-play: 1 + 2 + 3 = 6
  useEffect(() => {
    if (tutorialStep !== 4) return undefined;

    setScreen3Grid([[1, 2, null], [3, 4, null], [null, null, 5]]);
    setScreen3Selected([]);
    setScreen3PlacementPath([]);
    setAutoPlayStep3(0);

    const sequence = [
      { delay: 0, action: () => {
        setScreen3Selected([]);
        setScreen3PlacementPath([]);
        setAutoPlayStep3(0);
      } },
      { delay: 900, action: () => { setScreen3Selected([[0, 0]]); setAutoPlayStep3(1); } },
      { delay: 1800, action: () => { setScreen3Selected([[0, 0], [0, 1]]); setAutoPlayStep3(2); } },
      { delay: 2700, action: () => { setScreen3Selected([[0, 0], [0, 1], [1, 0]]); setAutoPlayStep3(3); } },
      { delay: 3600, action: () => { setScreen3PlacementPath([[1, 0], [2, 0]]); setAutoPlayStep3(4); } },
      { delay: 3900, action: () => {
        setScreen3Grid([[1, 2, null], [3, 4, null], [6, null, 5]]);
        setScreen3PlacementPath([]);
        setScreen3Selected([]);
        setAutoPlayStep3(5);
      } }
    ];

    const timeouts = sequence.map(({ delay, action }) => setTimeout(action, delay));
    return () => timeouts.forEach(clearTimeout);
  }, [tutorialStep]);

  const handleCellClick = (r, c) => {
    if (tutorialStep !== 2) return;
    const cellValue = grid[r][c];

    if (canPlaceNumber && grid[r][c] === null) {
      if (r === 1 && c === 1) {
        const newGrid = [[1, 2, null], [3, 4, null], [null, null, 5]];
        setScreen2Notice(null);
        setPlacementPath([[1, 0], [r, c]]);
        setTimeout(() => {
          setGrid(newGrid);
          setSelectedCells([]);
          setPlacementPath([]);
          setCanPlaceNumber(false);
          setUserCompletedPlacement(true);
        }, 200);
        return;
      }

      const [lastR, lastC] = selectedCells[selectedCells.length - 1];
      const touchesLast = isAdjacentCell(lastR, lastC, r, c);
      setScreen2Notice(
        touchesLast
          ? "Not there. With 4 there, nothing touching the 5 could add up to 5."
          : "Put it in a square touching the last number you tapped."
      );
      return;
    }

    if (cellValue === null || cellValue === 5) return;

    setScreen2Notice(null);

    const selectedIndex = selectedCells.findIndex(([sr, sc]) => sr === r && sc === c);
    if (selectedIndex !== -1) {
      setSelectedCells(selectedIndex === 0 && selectedCells.length === 1 ? [] : selectedCells.slice(0, selectedIndex));
      setUserSelectedCorrectly(false);
      setCanPlaceNumber(false);
      return;
    }

    if (selectedCells.length === 0) {
      setSelectedCells([[r, c]]);
      return;
    }

    const [lastR, lastC] = selectedCells[selectedCells.length - 1];
    const dr = Math.abs(r - lastR);
    const dc = Math.abs(c - lastC);
    const isAdjacent = dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0);
    if (!isAdjacent) {
      setSelectedCells([]);
      setUserSelectedCorrectly(false);
      setCanPlaceNumber(false);
      return;
    }

    const newSelected = [...selectedCells, [r, c]];
    const hasOne = newSelected.some(([sr, sc]) => grid[sr][sc] === 1);
    const hasThree = newSelected.some(([sr, sc]) => grid[sr][sc] === 3);
    const isCorrectSelection = hasOne && hasThree && newSelected.length === 2;

    if (!isCorrectSelection && newSelected.length >= 2) {
      setSelectedCells([]);
      setUserSelectedCorrectly(false);
      setCanPlaceNumber(false);
      return;
    }

    setSelectedCells(newSelected);
    setUserSelectedCorrectly(isCorrectSelection);
    setCanPlaceNumber(isCorrectSelection);
  };

  const isAdjacentCell = (r1, c1, r2, c2) => {
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0);
  };

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

  const getNextExpected = (g) => getNextExpectedNumber(g, step4Puzzle);

  const showStep4Feedback = (message) => {
    if (step4FeedbackTimerRef.current) {
      clearTimeout(step4FeedbackTimerRef.current);
    }
    setStep4Feedback(message);
    step4FeedbackTimerRef.current = setTimeout(() => {
      setStep4Feedback(null);
      step4FeedbackTimerRef.current = null;
    }, 2500);
  };

  const handleStep4Click = (r, c) => {
    if (step4Complete) return;
    const g = step4Grid;
    const cellValue = g[r][c];
    const next = getNextExpected(g);

    if (cellValue === null && step4Selected.length > 0) {
      const sum = step4Selected.reduce((acc, [sr, sc]) => acc + g[sr][sc], 0);
      const [lr, lc] = step4Selected[step4Selected.length - 1];
      const adjToLast = isAdjacentCell(lr, lc, r, c);
      if (sum === next && isConnected(step4Selected) && adjToLast) {
        if (step4FeedbackTimerRef.current) {
          clearTimeout(step4FeedbackTimerRef.current);
          step4FeedbackTimerRef.current = null;
        }
        setStep4Feedback(null);
        setStep4PlacementPath([[lr, lc], [r, c]]);
        setTimeout(() => {
          const newGrid = g.map(row => [...row]);
          newGrid[r][c] = sum;
          setStep4Grid(newGrid);
          setStep4Selected([]);
          setStep4PlacementPath([]);
          setStep4CanPlace(false);
          const allFilled = newGrid.flat().every(v => v !== null);
          if (allFilled) setStep4Complete(true);
        }, 200);
      } else if (sum !== next) {
        setStep4Selected([]);
        setStep4CanPlace(false);
        showStep4Feedback(`That adds up to ${sum}. You need ${next}.`);
      } else if (!adjToLast) {
        showStep4Feedback("Put it in a square touching the last number you tapped.");
      } else {
        setStep4Selected([]);
        setStep4CanPlace(false);
      }
      return;
    }

    if (cellValue === null) return;
    if (step4Selected.length === 0) {
      setStep4Selected([[r, c]]);
      return;
    }

    const selIdx = step4Selected.findIndex(([sr, sc]) => sr === r && sc === c);
    if (selIdx !== -1) {
      setStep4Selected(selIdx === 0 && step4Selected.length === 1 ? [] : step4Selected.slice(0, selIdx));
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

  const resetTutorialState = () => {
    setTutorialStep(0);
    setUserCompletedPlacement(false);
    setUserSelectedCorrectly(false);
    setCanPlaceNumber(false);
    setAutoPlayStep(0);
    setAutoPlayStep3(0);
    setGrid([[1, 2, null], [null, null, null], [null, null, 5]]);
    setSelectedCells([]);
    setPlacementPath([]);
    setScreen3Grid([[1, 2, null], [3, 4, null], [null, null, 5]]);
    setScreen3Selected([]);
    setScreen3PlacementPath([]);
    setStep4Grid([[1, 2, null], [3, 4, null], [null, null, 5]]);
    setStep4Selected([]);
    setStep4PlacementPath([]);
    setStep4Complete(false);
    setStep4CanPlace(false);
    setScreen2Notice(null);
    setStep4Feedback(null);
  };

  const getDropTargetHighlight = (r, c) => canPlaceNumber && r === 1 && c === 1 && grid[r][c] === null;

  const overlayPoints = [...selectedCells, ...placementPath].map(([r, c], idx, arr) => ({
    row: r,
    col: c,
    placed: idx === arr.length - 1 && placementPath.length > 0
  }));

  const screen3OverlayPoints = [...screen3Selected, ...screen3PlacementPath.slice(screen3Selected.length > 0 ? 1 : 0)].map(([r, c], idx, arr) => ({
    row: r,
    col: c,
    placed: idx === arr.length - 1 && screen3PlacementPath.length > 0
  }));

  const step4OverlayPoints = [...step4Selected, ...step4PlacementPath.slice(step4Selected.length > 0 ? 1 : 0)].map(([r, c], idx, arr) => ({
    row: r,
    col: c,
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
        <CanvasOverlay
          overlayPoints={overlayPts}
          grid={g}
          cellSize={cellSize}
          margin={margin}
          clueFlashCells={[]}
        />
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

      {/* ── Screen 0: The Goal ───────────────────────────── */}
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
            Fill the grid by counting up: 1, 2, 3, 4 and so on.
            <br /><br />
            Each new number is built from numbers already on the board. In real puzzles, 1, 2 and 3 are already placed, so you start at 4.
          </p>
          <button onClick={() => setTutorialStep(1)} style={primaryButtonStyle}>
            Next
          </button>
        </>
      )}

      {/* ── Screen 1: Placement mechanic demo ────────────── */}
      {tutorialStep === 1 && (
        <>
          {renderGrid(
            grid,
            puzzle,
            null,
            null,
            overlayPoints,
            autoPlayStep === 0 ? "Watch this move..." :
            autoPlayStep === 1 ? "Tap 1..." :
            autoPlayStep === 2 ? "Then tap 2..." :
            autoPlayStep === 3 ? "Place 3 next to the 2" :
            "Nice."
          )}
          <p style={{
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '20px',
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            To make the next number, tap numbers that add up to it. Each one has to touch the one before, and <strong>diagonals count</strong>.
            <br /><br />
            Then tap an empty square <strong>touching the last number you tapped</strong>. Here, 1 + 2 = 3, so 3 goes diagonally next to the 2.
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

      {/* ── Screen 2: Interactive placement ──────────────── */}
      {tutorialStep === 2 && (
        <>
          {renderGrid(
            grid,
            puzzle,
            handleCellClick,
            getDropTargetHighlight,
            overlayPoints,
            screen2Notice
              ? screen2Notice
              : !userSelectedCorrectly && !userCompletedPlacement
                ? "Tap 1 and 3 to make 4"
                : userSelectedCorrectly && !userCompletedPlacement
                  ? "Now tap the highlighted square"
                  : "Great move."
          )}
          <p style={{
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '20px',
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            Your turn. Make 4 from 1 + 3, then place it.
            <br /><br />
            Watch the gray 5 in the corner. Gray numbers come with the puzzle, but you still have to earn them.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setTutorialStep(1);
                setUserCompletedPlacement(false);
                setUserSelectedCorrectly(false);
                setCanPlaceNumber(false);
                setGrid([[1, 2, null], [3, null, null], [null, null, 5]]);
                setSelectedCells([]);
                setPlacementPath([]);
                setScreen2Notice(null);
              }}
              style={secondaryButtonStyle}
            >
              Back
            </button>
            <button
              onClick={() => setTutorialStep(3)}
              disabled={!userCompletedPlacement}
              style={{
                ...primaryButtonStyle,
                backgroundColor: userCompletedPlacement ? '#303036' : '#e0e0e0',
                color: userCompletedPlacement ? '#fff' : '#999',
                cursor: userCompletedPlacement ? 'pointer' : 'not-allowed'
              }}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* ── Screen 3: Prefilled 5 transition ─────────────── */}
      {tutorialStep === 3 && (
        <>
          {renderGrid(
            grid,
            puzzle,
            null,
            null,
            [
              { row: 0, col: 0, placed: false },
              { row: 1, col: 1, placed: false },
              // The end stays unplaced so the line remains. A placed end point
              // plays the drop animation and then clears the chain.
              { row: 2, col: 2, placed: false }
            ],
            "1 + 4 = 5, and the 4 touches the 5"
          )}
          <p style={{
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '20px',
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            The 5 came with the puzzle, but it only counts because 1 + 4 = 5 and the 4 touches it. That's why the 4 had to go there.
            <br /><br />
            <strong>The one rule to remember: when you reach a gray number, a chain touching it has to add up to it.</strong> If nothing does, undo and try another route.
            <br /><br />
            With the 5 earned, the next number is 6.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => setTutorialStep(2)} style={secondaryButtonStyle}>Back</button>
            <button onClick={() => setTutorialStep(4)} style={primaryButtonStyle}>Next</button>
          </div>
        </>
      )}

      {/* ── Screen 4: Multi-number sequences ─────────────── */}
      {tutorialStep === 4 && (
        <>
          {renderGrid(
            screen3Grid,
            screen3Puzzle,
            null,
            null,
            screen3OverlayPoints,
            autoPlayStep3 === 0 ? "Watch this chain..." :
            autoPlayStep3 === 1 ? "Tap 1..." :
            autoPlayStep3 === 2 ? "Then 2..." :
            autoPlayStep3 === 3 ? "Then 3..." :
            autoPlayStep3 === 4 ? "Place 6!" :
            "Nice."
          )}
          <p style={{
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '20px',
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            Chains can be <strong>as long as you need</strong>.
            <br /><br />
            Here, 1 + 2 + 3 = 6. Each number touches the one before it (the 2 and 3 touch diagonally), and 6 goes in a square touching the 3.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setTutorialStep(3);
                setAutoPlayStep3(0);
              }}
              style={secondaryButtonStyle}
            >
              Back
            </button>
            <button
              onClick={() => {
                setStep4Grid([[1, 2, null], [3, 4, null], [null, null, 5]]);
                setStep4Selected([]);
                setStep4PlacementPath([]);
                setStep4Complete(false);
                setStep4CanPlace(false);
                setTutorialStep(5);
              }}
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

      {/* ── Screen 5: Practice puzzle completion ─────────── */}
      {tutorialStep === 5 && (
        <>
          {renderGrid(
            step4Grid,
            step4Puzzle,
            handleStep4Click,
            getStep4DropTarget,
            step4OverlayPoints,
            step4Feedback
              ? step4Feedback
              : step4Complete
                ? "Grid complete."
                : step4Selected.length === 0
                  ? `Next number: ${getNextExpected(step4Grid)}`
                  : `Next number: ${getNextExpected(step4Grid)} · Selected: ${step4Selected.reduce((acc, [sr, sc]) => acc + step4Grid[sr][sc], 0)}`
          )}
          <p style={{
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '20px',
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            <strong>Your turn. Fill the rest of the grid.</strong>
            <br /><br />
            Tap a chain that adds up to the next number, then tap an empty square touching the last number in your chain.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setStep4Selected([]);
                setStep4PlacementPath([]);
                setStep4CanPlace(false);
                setStep4Complete(false);
                setAutoPlayStep3(0);
                setTutorialStep(4);
              }}
              style={secondaryButtonStyle}
            >
              Back
            </button>
            <button
              onClick={() => setTutorialStep(6)}
              disabled={!step4Complete}
              style={{
                ...primaryButtonStyle,
                backgroundColor: step4Complete ? '#303036' : '#e0e0e0',
                color: step4Complete ? '#fff' : '#999',
                cursor: step4Complete ? 'pointer' : 'not-allowed'
              }}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* ── Screen 6: Choose your game ───────────────────── */}
      {tutorialStep === 6 && (
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
            There's a new Mini and a new full puzzle every day. Puzzles get harder through the week, and Mondays are the easiest.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {showWarmupOffer ? (
              <>
                <button
                  onClick={() => { onComplete(); onPlayWarmup(); }}
                  style={{ ...primaryButtonStyle, width: '100%', fontSize: '15px' }}
                >
                  Play a warm-up puzzle
                </button>
                <p style={{ margin: '-6px 0 0', fontSize: '0.88rem', color: '#666', textAlign: 'center' }}>
                  4×4, about a minute
                </p>
                <button
                  onClick={() => { onComplete(); onPlayMini(); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.88rem',
                    color: '#666',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  Skip to today's Mini
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { onComplete(); onPlayMini(); }}
                  style={{ ...primaryButtonStyle, width: '100%', fontSize: '15px' }}
                >
                  Play today's Mini
                </button>
                <p style={{ margin: '-6px 0 0', fontSize: '0.88rem', color: '#666', textAlign: 'center' }}>
                  5×5, a few minutes
                </p>

                <button
                  onClick={() => { onComplete(); onPlayFull(); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.88rem',
                    color: '#666',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  Or play the full 7×7
                </button>
              </>
            )}
          </div>

          <button
            onClick={resetTutorialState}
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