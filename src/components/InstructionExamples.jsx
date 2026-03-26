import React, { useState, useEffect } from 'react';
import CanvasOverlay from './CanvasOverlay';
import NumberOverlay from './NumberOverlay';
import { getNextExpectedNumber, getPrefilledCluesSkippedBeforeNext } from '../utils/gameHelpers';

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
  const [clueFlashCells, setClueFlashCells] = useState([]);
  const [screen3Grid, setScreen3Grid] = useState([[1, 2, null], [3, 4, null], [null, null, 5]]);
  const [screen3Selected, setScreen3Selected] = useState([]);
  const [screen3PlacementPath, setScreen3PlacementPath] = useState([]);

  const puzzle = [[1, 2, null], [null, null, null], [null, null, 5]];
  const screen3Puzzle = [[1, 2, null], [null, null, null], [null, null, 5]];
  const cellSize = 60;
  const margin = 2;

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

  useEffect(() => {
    setClueFlashCells([]);
  }, [tutorialStep]);

  // Screen 4 auto-play: 1 + 2 + 3 = 6
  useEffect(() => {
    if (tutorialStep !== 3) return undefined;

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

    if (canPlaceNumber && r === 1 && c === 1 && grid[r][c] === null) {
      const prevGrid = grid;
      const newGrid = [[1, 2, 3], [null, 4, null], [null, null, 5]];
      const placedExpected = getNextExpectedNumber(prevGrid, puzzle);
      const solverNext = getNextExpectedNumber(newGrid, puzzle);
      const skipChain = getPrefilledCluesSkippedBeforeNext(newGrid, puzzle, placedExpected, solverNext);

      setPlacementPath([[1, 0], [r, c]]);
      setTimeout(() => {
        setGrid(newGrid);
        setSelectedCells([]);
        setPlacementPath([]);
        setCanPlaceNumber(false);
        setUserCompletedPlacement(true);

        if (skipChain.length > 0) {
          const PRE_CLUE_FLASH_PAUSE_MS = 500;
          const CLUE_SKIP_STEP_MS = 500;
          const CLUE_FLASH_MS = 260;

          skipChain.forEach((seg, idx) => {
            setTimeout(() => {
              setClueFlashCells(seg.positions.map(([sr, sc]) => ({ row: sr, col: sc })));
              setTimeout(() => setClueFlashCells([]), CLUE_FLASH_MS);
            }, PRE_CLUE_FLASH_PAUSE_MS + idx * CLUE_SKIP_STEP_MS);
          });
        }
      }, 200);
      return;
    }

    if (cellValue === null || cellValue === 5) return;

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
    setClueFlashCells([]);
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
          clueFlashCells={clueFlashCells}
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
            SUMS is a mathematical logic game with a sprinkle of spatial reasoning.
            <br /><br />
            Fill every empty cell by placing numbers <strong>one at a time, in order</strong> - 1, 2, 3, 4, and so on.
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
            autoPlayStep === 1 ? "Select 1..." :
            autoPlayStep === 2 ? "Then select 2..." :
            autoPlayStep === 3 ? "Place 3!" :
            "Done."
          )}
          <p style={{
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '20px',
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            To place the next number, <strong>select cells that add up to it</strong>, then tap an empty cell next to your selection.
            <br /><br />
            Here, 1 + 2 = 3 - so <strong>3</strong> is placed next to them.
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
            !userSelectedCorrectly && !userCompletedPlacement
              ? "Select 1 and 3 to make 4"
              : userSelectedCorrectly && !userCompletedPlacement
                ? "Place 4!"
                : "Nice move!"
          )}
          <p style={{
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '20px',
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            Some numbers are already placed as part of the starting grid.
            <br /><br />
            You must place <strong>4</strong> strategically so there is a valid path to reach the gray <strong>5</strong>.
            <br /><br />
            <strong>Place 4</strong> using the grid above.
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

      {/* ── Screen 3: Multi-number sequences ─────────────── */}
      {tutorialStep === 3 && (
        <>
          {renderGrid(
            screen3Grid,
            screen3Puzzle,
            null,
            null,
            screen3OverlayPoints,
            autoPlayStep3 === 0 ? "Watch this chain..." :
            autoPlayStep3 === 1 ? "Select 1..." :
            autoPlayStep3 === 2 ? "Then select 2..." :
            autoPlayStep3 === 3 ? "Then select 3..." :
            autoPlayStep3 === 4 ? "Place 6!" :
            "Done."
          )}
          <p style={{
            fontSize: '1.1rem',
            color: '#333',
            marginBottom: '20px',
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            Your selection can include <strong>as many numbers as you need</strong>.
            <br /><br />
            Here, 1 + 2 + 3 = 6 - as long as each selected cell <strong>touches the next</strong> in the chain.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setTutorialStep(2);
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

      {/* ── Screen 4: Choose your game ───────────────────── */}
      {tutorialStep === 4 && (
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