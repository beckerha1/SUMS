import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import { initialGrid, puzzleNumber } from './puzzles/today';
import { initialGridMini, puzzleNumberMini } from './puzzles/todayMini';
import CanvasOverlay from "./components/CanvasOverlay";
import NumberOverlay from "./components/NumberOverlay";
import InteractiveTutorial from './components/InstructionExamples';
import {
  isValidCell,
  getAdjacent,
  isConnectedGroup,
  findConnectedGroupsThatSum,
  formatTime,
  getMaxSelection,
  getNextExpectedNumber,
  isNextNumberBlockedByClue
} from './utils/gameHelpers';

import StartScreen from './components/StartScreen';
import GameHeader from './components/GameHeader';
import WinScreen from './components/WinScreen';
import GameControls from './components/GameControls';
import PrivacyPolicyModal from './PrivacyPolicy';
import AboutModal from './About';
import Statistics from './components/Statistics';
import HighScores from './components/HighScores';

// Debug logging
console.log('initialGrid:', initialGrid);
console.log('initialGridMini:', initialGridMini);
console.log('puzzleNumber:', puzzleNumber);
console.log('puzzleNumberMini:', puzzleNumberMini);

export default function SumGridGame() {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [gameMode, setGameMode] = useState(null); // 'mini' or 'full'
  
  const puzzle = gameMode === 'mini' ? initialGridMini : (gameMode === 'full' ? initialGrid : initialGrid);
  const currentPuzzleNumber = gameMode === 'mini' ? puzzleNumberMini : puzzleNumber;
  const [grid, setGrid] = useState(initialGrid);
  const [selectedCells, setSelectedCells] = useState([]);
  const [history, setHistory] = useState([initialGrid]);
  const [gameWon, setGameWon] = useState(false);
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [bestTimeMini, setBestTimeMini] = useState(null);
  const [bestTimeFull, setBestTimeFull] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [flippingCells, setFlippingCells] = useState([]);
  const [placementPath, setPlacementPath] = useState([]);
  const timerRef = useRef(null);
  const [poppingCells, setPoppingCells] = useState([]);
  const [moveCount, setMoveCount] = useState(0);
  const GRID_SIZE = grid?.[0]?.length || 0;
  const [countdownToMidnight, setCountdownToMidnight] = useState("");
  const [hardMode, setHardMode] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [winScreenDismissed, setWinScreenDismissed] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [highScoresHighlight, setHighScoresHighlight] = useState(null);
  const cellSize = Math.min(80, Math.floor(window.innerWidth / (GRID_SIZE + 2)));

const todayStr = new Date().toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

const prefilledCells = useRef(new Set());
const [overlayPoints, setOverlayPoints] = useState([]);
const gridWrapperRef = useRef(null);

useEffect(() => {
  if (!gridWrapperRef.current) return;

  const points = placementPath.length > 0 
    ? [...selectedCells, ...placementPath.slice(1)]
    : selectedCells;

  setOverlayPoints(
    points.map(([r, c], idx, arr) => ({
      row: r,
      col: c,
      placed: idx === arr.length - 1 && placementPath.length > 0
    }))
  );

}, [selectedCells, placementPath]);

useEffect(() => {
  if (gameMode) {
    setGrid(puzzle);
    setHistory([puzzle]);
    setSelectedCells([]);
    setGameWon(false);
    setShowWinScreen(false);
    setMoveCount(0);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }
}, [gameMode, puzzle]);

useEffect(() => {
  const prefilled = new Set();
  for (let r = 0; r < puzzle.length; r++) {
    for (let c = 0; c < puzzle[r].length; c++) {
      if (typeof puzzle[r][c] === "number") {
        prefilled.add(`${r},${c}`);
      }
    }
  }
  prefilledCells.current = prefilled;
}, [puzzle]);

useEffect(() => {
  const updateCountdown = () => {
    const now = new Date();
    const nowUTC = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const midnightEST = new Date(nowUTC);
    midnightEST.setHours(24, 0, 0, 0);
    const diffMs = midnightEST - nowUTC;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);
    setCountdownToMidnight(
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    );
  };
  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const storedBestMini = localStorage.getItem("sums-best-time-mini");
  const storedBestFull = localStorage.getItem("sums-best-time-full");
  const storedHistory = localStorage.getItem("sums-game-history");
  
  if (storedBestMini) setBestTimeMini(Number(storedBestMini));
  if (storedBestFull) setBestTimeFull(Number(storedBestFull));
  if (storedHistory) setGameHistory(JSON.parse(storedHistory));
  
  const oldBest = localStorage.getItem("sums-best-time");
  if (oldBest && !storedBestFull) {
    setBestTimeFull(Number(oldBest));
    localStorage.setItem("sums-best-time-full", oldBest);
  }
}, []);

useEffect(() => {
  console.log('Timer useEffect:', { startTime, gameWon, hasTimer: !!timerRef.current });
  if (startTime && !gameWon && !timerRef.current) {
    console.log('Starting timer interval');
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      console.log('Timer tick:', elapsed);
      setElapsedTime(elapsed);
    }, 1000);
  }
  return () => {
    if (timerRef.current) {
      console.log('Clearing timer interval');
      clearInterval(timerRef.current);
    }
  };
}, [startTime, gameWon]);

useEffect(() => {
  if (showWinScreen && window.adsbygoogle && !window.adsbygoogle.initialized) {
    try {
      window.adsbygoogle.push({});
      window.adsbygoogle.initialized = true;
    } catch (e) {
      console.error("Adsbygoogle push error:", e);
    }
  }
}, [showWinScreen]);

useEffect(() => {
  const handleBeforeUnload = () => {
    if (startTime && !gameWon && window.gtag) {
      window.gtag('event', 'game_abandon', {
        game_mode: gameMode,
        time_played_seconds: elapsedTime,
        total_moves: moveCount
      });
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [startTime, gameWon, gameMode, elapsedTime, moveCount]);

const [lastSequence, setLastSequence] = useState(null);
const [lastPlacedPosition, setLastPlacedPosition] = useState(null);

const closeInstructions = () => setShowInstructions(false);

const getDropTargetHighlight = (r, c) => {
  if (!isValidCell(r, c, grid)) return false;
  if (grid[r][c] !== null) return false;
  if (!selectedCells.length) return false;

  const sum = selectedCells.reduce((acc, [sr, sc]) => acc + grid[sr][sc], 0);
  const expected = getNextExpectedNumber(grid, puzzle);

  const isAdjacentToLastSelected = (() => {
    const [lr, lc] = selectedCells[selectedCells.length - 1];
    return getAdjacent([lr, lc], grid).some(([ar, ac]) => ar === r && ac === c);
  })();

  return (
    isConnectedGroup(selectedCells, grid) &&
    sum === expected &&
    isAdjacentToLastSelected
  );
};

const triggerFlipAnimation = () => {
  const cellsToFlip = [];
  grid.forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      if (cell !== undefined && cell !== "X") {
        cellsToFlip.push([rIdx, cIdx]);
      }
    });
  });
  cellsToFlip.forEach(([r, c], idx) => {
    setTimeout(() => {
      setFlippingCells(prev => [...prev, `${r},${c}`]);
    }, idx * 40);
  });
  setTimeout(() => setFlippingCells([]), cellsToFlip.length * 30 + 400);
};

const shareWinMessage = () => {
  const sequence = lastSequence?.join(" + ") || "?";
  const sum = lastSequence?.reduce((a, b) => a + b, 0) || "?";
  const timeStr = formatTime(elapsedTime);
  const gameTitle = gameMode === 'mini' ? 'Mini SUMS' : 'SUMS';

  const message = `${gameTitle}: ${sequence} = ${sum} | ${timeStr}\nPlay at: https://sums.games`;

  if (navigator.share) {
    navigator.share({ text: message }).catch(err => console.error('Error sharing:', err));
  } else {
    alert(`Copy and share:\n${message}`);
  }
};

const isNextToLastSelected = (r, c) => {
  if (!selectedCells.length) return false;
  const [lr, lc] = selectedCells[selectedCells.length - 1];
  return getAdjacent([lr, lc], grid).some(([ar, ac]) => ar === r && ac === c);
};

const handleCellClick = (r, c, event) => {
  if (!grid || !grid.length || !grid[0]) {
    console.error('Grid not loaded yet');
    return;
  }
  
  if (event) event.preventDefault();

  const next = getNextExpectedNumber(grid, puzzle);
  const clueBlocked = puzzle.flat().includes(next) && isNextNumberBlockedByClue(grid, puzzle);
  if (clueBlocked) return;

  if (grid[r][c] === null && puzzle?.[r]?.[c] !== null && puzzle?.[r]?.[c] !== undefined) {
    return;
  }

  if (!startTime) {
    console.log('Setting startTime:', Date.now());
    setStartTime(Date.now());
  }

  const cellValue = grid[r][c];
  if (cellValue === "X") return;

  if (cellValue !== null) {
    const selectedIndex = selectedCells.findIndex(([sr, sc]) => sr === r && sc === c);

    if (selectedIndex !== -1) {
      if (selectedIndex === 0 && selectedCells.length === 1) {
        setSelectedCells([]);
      } else {
        setSelectedCells(selectedCells.slice(0, selectedIndex));
      }
      return;
    }

    if (selectedCells.length === 0) {
      setSelectedCells([[r, c]]);
      return;
    }

    const [lastR, lastC] = selectedCells[selectedCells.length - 1];
    const isAdjacent = getAdjacent([lastR, lastC], grid).some(
      ([ar, ac]) => ar === r && ac === c
    );

    if (isAdjacent) {
      if (hardMode && selectedCells.length >= getMaxSelection(hardMode, puzzle)) {
        setAlertMessage(`Max ${getMaxSelection(hardMode, puzzle)} selections reached! Try a different combination.`);
        setShowAlertModal(true);
        setSelectedCells([]);
        return;
      }
      setSelectedCells([...selectedCells, [r, c]]);
    }

  } else {
    const sum = selectedCells.reduce((acc, [sr, sc]) => acc + grid[sr][sc], 0);
    const expected = getNextExpectedNumber(grid, puzzle);
    const canPlace = isConnectedGroup(selectedCells, grid) &&
      sum === expected &&
      isNextToLastSelected(r, c);

    if (!canPlace && selectedCells.length > 0) {
      setSelectedCells([]);
      return;
    }

    if (canPlace) {
      const nextAfter = expected + 1;
      const clueIsBlocked = puzzle.flat().includes(nextAfter) && isNextNumberBlockedByClue(grid, puzzle);

      if (clueIsBlocked) {
        setAlertMessage(`Cannot continue: ${nextAfter} is prefilled but not reachable by any valid sum.`);
        setShowAlertModal(true);
        return;
      }
      if (clueIsBlocked) return;

      const placedKey = `${r},${c}`;
      const newGrid = grid.map(row => [...row]);
      newGrid[r][c] = sum;

      const sequence = selectedCells.map(([r, c]) => grid[r][c]);
      setLastSequence(sequence);

      setGrid(newGrid);
      setHistory([...history, newGrid]);
      setLastPlacedPosition([r, c]);
      setMoveCount(prev => prev + 1);

      const lastSelected = selectedCells[selectedCells.length - 1];
      setPlacementPath([lastSelected, [r, c]]);
      setPoppingCells((prev) => [...prev, placedKey]);

      setTimeout(() => {
        setPoppingCells((prev) => prev.filter((k) => k !== placedKey));
        setPlacementPath([]);
        setSelectedCells([]);
        setOverlayPoints([]);
      }, 10);

      const nextNum = expected + 1;
      const nextIsClue = puzzle.flat().includes(nextNum);
      if (nextIsClue) {
        const tempGrid = newGrid;
        const nextClueCells = [];
        for (let r = 0; r < tempGrid.length; r++) {
          for (let c = 0; c < tempGrid[r].length; c++) {
            if (tempGrid[r][c] === nextNum && puzzle?.[r]?.[c] === nextNum) {
              nextClueCells.push([r, c]);
            }
          }
        }
        
        if (nextClueCells.length > 0) {
          const candidates = [];
          for (let r = 0; r < tempGrid.length; r++) {
            for (let c = 0; c < tempGrid[r].length; c++) {
              const val = tempGrid[r][c];
              if (typeof val === "number" && val !== nextNum) {
                candidates.push([r, c]);
              }
            }
          }
          
          const groups = findConnectedGroupsThatSum(tempGrid, candidates, nextNum);
          let hasValidGroup = false;
          
          for (const [cr, cc] of nextClueCells) {
            for (const group of groups) {
              const gsum = group.reduce((acc, [gr, gc]) => acc + tempGrid[gr][gc], 0);
              const connected = isConnectedGroup(group, grid);
              const touchesClue = getAdjacent([cr, cc], tempGrid).some(([ar, ac]) =>
                group.some(([gr, gc]) => gr === ar && gc === ac)
              );
              
              if (gsum === nextNum && connected && touchesClue) {
                hasValidGroup = true;
                break;
              }
            }
            if (hasValidGroup) break;
          }
          
          if (!hasValidGroup) {
            setAlertMessage(`Your next SUM ${nextNum} is pre-populated but does not have a legal SUMS chain. Your last move has been undone. Please create a valid path to ${nextNum}.`);
            setShowAlertModal(true);
            
            if (history.length > 0) {
              setGrid(history[history.length - 1]);
            }
            setSelectedCells([]);
            return;
          }
        }
      }

      const allFilled = newGrid.every(row => row.every(cell => cell === "X" || cell !== null));
      if (allFilled) {
        clearInterval(timerRef.current);     
        triggerFlipAnimation();
        const cellsToFlip = grid.flat().filter(cell => cell !== undefined && cell !== "X").length;
        const delay = cellsToFlip * 80 + 500; 

        const finalTime = Math.floor((Date.now() - startTime) / 1000);
        const finalMoves = moveCount + 1;

        console.log('Game Complete Analytics:', {
          game_mode: gameMode,
          completion_time_seconds: finalTime,
          total_moves: finalMoves,
          startTime,
          now: Date.now()
        });

        setTimeout(() => {
          setGameWon(true);
          setShowWinScreen(true);
          
          if (window.gtag) {
            window.gtag('event', 'game_complete', {
              game_mode: gameMode,
              completion_time_seconds: finalTime,
              total_moves: finalMoves
            });
          }
        }, delay);

        if (gameMode === 'mini') {
          if (!bestTimeMini || finalTime < bestTimeMini) {
            setBestTimeMini(finalTime);
            localStorage.setItem("sums-best-time-mini", finalTime.toString());
          }
        } else if (gameMode === 'full') {
          if (!bestTimeFull || finalTime < bestTimeFull) {
            setBestTimeFull(finalTime);
            localStorage.setItem("sums-best-time-full", finalTime.toString());
          }
        }

        const updatedHistory = [...gameHistory, { time: finalTime, mode: gameMode, date: new Date().toISOString() }];
        setGameHistory(updatedHistory);
        localStorage.setItem("sums-game-history", JSON.stringify(updatedHistory));
      }
    }
  }
};

const handleUndo = () => {
  if (history.length > 1) {
    const newHistory = [...history];
    newHistory.pop();
    setGrid(newHistory[newHistory.length - 1]);
    setHistory(newHistory);
    setSelectedCells([]);
    setGameWon(false);
  }
};

const handleClear = () => {
  setShowClearConfirm(true);
};

const confirmClear = () => {
  const clearedGrid = puzzle.map(row => [...row]);
  setGrid(clearedGrid);
  setHistory([clearedGrid]);
  setSelectedCells([]);
  setGameWon(false);
  setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
  setShowClearConfirm(false);
};

const handleResetStats = () => {
  setBestTimeMini(null);
  setBestTimeFull(null);
  setGameHistory([]);
  localStorage.removeItem('sums-best-time-mini');
  localStorage.removeItem('sums-best-time-full');
  localStorage.removeItem('sums-game-history');
  localStorage.removeItem('sums-best-time');
};

if (showStartScreen) {
  return (
    <>
      <StartScreen
        onPlayMini={() => {
          setGameMode('mini');
          setShowStartScreen(false);
          setStartTime(null);
          setElapsedTime(0);
          if (window.gtag) window.gtag('event', 'game_start', { game_mode: 'mini' });
        }}
        onPlayFull={() => {
          setGameMode('full');
          setShowStartScreen(false);
          setStartTime(null);
          setElapsedTime(0);
          if (window.gtag) window.gtag('event', 'game_start', { game_mode: 'full' });
        }}
        onShowInstructions={() => setShowInstructions(true)}
        onShowStats={() => setShowStats(true)}
        onShowHighScores={() => {
          setHighScoresHighlight(null);
          setShowHighScores(true);
        }}
        todayStr={todayStr}
        puzzleNumber={puzzleNumber}
        puzzleNumberMini={puzzleNumberMini}
        onShowPrivacy={() => setShowPrivacyModal(true)}
        onShowAbout={() => setShowAboutModal(true)}
      />

      {showInstructions && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          overflowY: "auto",
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 1000,
          padding: "40px 16px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          touchAction: "manipulation"
        }}>
          <div style={{
            background: "#fff",
            padding: window.innerWidth < 480 ? 16 : 20,
            borderRadius: 8,
            width: "100%",
            maxWidth: "420px",
            boxSizing: "border-box",
            textAlign: "left",
            position: "relative"
          }}>
            <button
              onClick={closeInstructions}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "transparent",
                border: "none",
                fontSize: "1.4rem",
                cursor: "pointer",
                lineHeight: "1",
                padding: 0
              }}
              aria-label="Close instructions"
            >✖</button>

            <InteractiveTutorial 
              onComplete={() => {
                setShowInstructions(false);
                setShowStartScreen(false);
              }}
              onPlayMini={() => {
                setGameMode('mini');
                setShowStartScreen(false);
                setStartTime(null);
                setElapsedTime(0);
                setShowInstructions(false);
              }}
              onPlayFull={() => {
                setGameMode('full');
                setShowStartScreen(false);
                setStartTime(null);
                setElapsedTime(0);
                setShowInstructions(false);
              }}
            />

            <p style={{ marginTop: 20, fontSize: '0.9rem', color: '#666' }}>
              Black squares are blocked. Gray areas aren't part of the grid.
            </p>
          </div>
        </div>
      )}

      {showPrivacyModal && (
        <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />
      )}

      {showAboutModal && (
        <AboutModal onClose={() => setShowAboutModal(false)} />
      )}

      {showStats && (
        <Statistics 
          onClose={() => setShowStats(false)}
          bestTimeMini={bestTimeMini}
          bestTimeFull={bestTimeFull}
          gameHistory={gameHistory}
          onResetStats={handleResetStats}
        />
      )}

      {showHighScores && (
        <HighScores
          onClose={() => setShowHighScores(false)}
          highlightEntry={highScoresHighlight}
        />
      )}
    </>
  );
}

if (!gameMode) return null;
if (!grid || !Array.isArray(grid) || grid.length === 0) return null;
if (!puzzle || puzzle.length !== grid.length || puzzle[0]?.length !== grid[0]?.length) {
  console.warn('Puzzle and grid size mismatch, waiting for sync...');
  return null;
}

return (
  <>
    <div className="game-wrapper"
      style={{
        position: "relative",
        textAlign: "center",
        padding: "25px",
        maxWidth: "600px",
        margin: "auto"
      }}
    >
      <GameHeader
        elapsedTime={elapsedTime}
        nextExpectedNumber={getNextExpectedNumber(grid, puzzle)}
        currentSum={selectedCells.length > 0
          ? selectedCells.reduce((acc, [r, c]) => acc + grid[r][c], 0)
          : 0}
        showHelpDropdown={showHelpDropdown}
        setShowHelpDropdown={setShowHelpDropdown}
        setShowInstructions={setShowInstructions}
        hardMode={hardMode}
        setHardMode={setHardMode}
        setSelectedCells={setSelectedCells}
        onReturnHome={() => {
          if (startTime && !gameWon && window.gtag) {
            window.gtag('event', 'game_abandon', {
              game_mode: gameMode,
              time_played_seconds: elapsedTime,
              total_moves: moveCount
            });
          }
          setShowStartScreen(true);
          setGameMode(null);
        }}
        gameMode={gameMode}
        puzzleNumber={currentPuzzleNumber}
      />

      <div ref={gridWrapperRef} style={{ 
        position: "relative", 
        display: "inline-block", 
        zIndex: 1
      }}>
        <CanvasOverlay
          overlayPoints={overlayPoints}
          grid={grid}
          cellSize={cellSize}
          margin={2}
        />
        <div className="grid" style={{ 
          position: "relative", 
          zIndex: 2,
          overflow: "visible"
        }}>
          {grid && grid.length > 0 && grid.map((row, rIdx) => (
            <div key={rIdx} style={{ display: "flex" }}>
              {row.map((cell, cIdx) => {
                const key = `${rIdx},${cIdx}`;
                const isPopping = poppingCells.includes(key);
                const isFlipping = flippingCells.includes(key); 
                const isDropTarget = getDropTargetHighlight(rIdx, cIdx);
                const isPrefilledClue = puzzle?.[rIdx]?.[cIdx] === cell && typeof cell === "number";
                const cellStyle = {
                  width: cellSize,
                  height: cellSize,
                  margin: 2,
                  lineHeight: `${cellSize}px`,
                  fontSize: Math.floor(cellSize / 2.5),
                  textAlign: "center",
                  borderRadius: 0,
                  backgroundColor:
                    cell === "X" ? "#303036" :
                    isPopping ? "#d4f8d4" :
                    isDropTarget ? "#b3eaf2" :
                    isPrefilledClue ? "#e3e6ec" :
                    "#fff",
                  color: "#303036",
                  fontWeight: isPrefilledClue ? "bold" : "normal",
                  border: cell === "X" ? "1px solid #303036" : "1px solid #999",
                  transition: "transform 0.2s ease, background-color 0.3s ease",
                  transform: isFlipping ? "rotateY(180deg)" : "scale(1)",
                  cursor: "pointer",
                  position: "relative",
                  zIndex: 1,
                  WebkitTapHighlightColor: "transparent",
                  userSelect: "none",
                  touchAction: "manipulation"
                };

                return (
                  <div 
                    key={key}
                    className={`cell-${rIdx}-${cIdx}`}
                    style={cellStyle}
                    onClick={(e) => handleCellClick(rIdx, cIdx, e)}
                    onTouchEnd={(e) => handleCellClick(rIdx, cIdx, e)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <NumberOverlay
          grid={grid}
          puzzle={puzzle}
          cellSize={cellSize}
          margin={2}
        />
      </div>

      <GameControls
        hardMode={hardMode}
        puzzle={puzzle}
        onUndo={handleUndo}
        onClear={handleClear}
        canUndo={history.length > 1}
        gameWon={gameWon}
      />

      {showWinScreen && (
        <WinScreen
          elapsedTime={elapsedTime}
          countdownToMidnight={countdownToMidnight}
          onClose={() => {
            setShowWinScreen(false);
            setWinScreenDismissed(true);
          }}
          onShare={shareWinMessage}
          gameMode={gameMode}
          onViewHighScores={(highlight) => {
            setHighScoresHighlight(highlight);
            setShowHighScores(true);
          }}
        />
      )}

      {showInstructions && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          overflowY: "auto",
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 1000,
          padding: "40px 16px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          touchAction: "manipulation"
        }}>
          <div style={{
            background: "#fff",
            padding: window.innerWidth < 480 ? 16 : 20,
            borderRadius: 8,
            width: "100%",
            maxWidth: "420px",
            boxSizing: "border-box",
            textAlign: "left",
            position: "relative"
          }}>
            <button
              onClick={closeInstructions}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "transparent",
                border: "none",
                fontSize: "1.4rem",
                cursor: "pointer",
                lineHeight: "1",
                padding: 0
              }}
              aria-label="Close instructions"
            >✖</button>

            <h2 style={{ marginBottom: 16 }}>How to Play</h2>
            <p style={{ marginBottom: 20 }}>Build a number chain: 1 → 2 → 3 → 4 → …</p>

            <InteractiveTutorial 
              onComplete={() => setShowInstructions(false)}
              onPlayMini={() => {
                setGameMode('mini');
                setShowStartScreen(false);
                setStartTime(null);
                setElapsedTime(0);
                setShowInstructions(false);
              }}
              onPlayFull={() => {
                setGameMode('full');
                setShowStartScreen(false);
                setStartTime(null);
                setElapsedTime(0);
                setShowInstructions(false);
              }}
            />

            <p style={{ marginTop: 20, fontSize: '0.9rem', color: '#666' }}>
              Black squares are blocked. Gray areas aren't part of the grid.
            </p>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.9rem' }}>
        <span 
          onClick={(e) => {
            e.stopPropagation();
            setShowPrivacyModal(true);
          }}
          style={{ margin: '0 10px', color: '#666', textDecoration: 'none', cursor: 'pointer' }}
        >
          Privacy Policy
        </span>
        <span 
          onClick={(e) => {
            e.stopPropagation();
            setShowAboutModal(true);
          }}
          style={{ margin: '0 10px', color: '#666', textDecoration: 'none', cursor: 'pointer' }}
        >
          About
        </span>
        <p style={{ marginTop: '10px', fontSize: "clamp(14px, 2.5vw, 14px)", color: "#666" }}>
          © 2025 Xavier Games
        </p>
      </footer>
    </div>

    {showPrivacyModal && (
      <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />
    )}

    {showAboutModal && (
      <AboutModal onClose={() => setShowAboutModal(false)} />
    )}

    {showHighScores && (
      <HighScores
        onClose={() => setShowHighScores(false)}
        highlightEntry={highScoresHighlight}
      />
    )}

    {showClearConfirm && (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 3000
      }}>
        <div style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          textAlign: "center",
          maxWidth: "400px",
          width: "90%"
        }}>
          <h3 style={{ marginBottom: "20px", fontSize: "1.3rem", color: "#303036" }}>
            Clear Puzzle?
          </h3>
          <p style={{ marginBottom: "25px", fontSize: "1rem", lineHeight: "1.5", color: "#555" }}>
            You are about to clear the puzzle of all selections and restart. Are you sure you want to continue?
          </p>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => setShowClearConfirm(false)}
              style={{
                padding: "10px 24px",
                fontSize: "1rem",
                borderRadius: "24px",
                border: "2px solid #303036",
                backgroundColor: "#fff",
                color: "#303036",
                cursor: "pointer",
                fontWeight: "600",
                minWidth: "100px"
              }}
            >
              No
            </button>
            <button
              onClick={confirmClear}
              style={{
                padding: "10px 24px",
                fontSize: "1rem",
                borderRadius: "24px",
                border: "none",
                backgroundColor: "#e53935",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "600",
                minWidth: "100px"
              }}
            >
              Yes, Clear
            </button>
          </div>
        </div>
      </div>
    )}

    {showAlertModal && (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 3000
      }}>
        <div style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          textAlign: "center",
          maxWidth: "400px",
          width: "90%"
        }}>
          <h3 style={{ marginBottom: "20px", fontSize: "1.3rem", color: "#303036" }}>
            Notice
          </h3>
          <p style={{ marginBottom: "25px", fontSize: "1rem", lineHeight: "1.5", color: "#555" }}>
            {alertMessage}
          </p>
          
          <button
            onClick={() => setShowAlertModal(false)}
            style={{
              padding: "10px 24px",
              fontSize: "1rem",
              borderRadius: "24px",
              border: "none",
              backgroundColor: "#303036",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600",
              minWidth: "100px"
            }}
          >
            OK
          </button>
        </div>
      </div>
    )}
  </>
);
}