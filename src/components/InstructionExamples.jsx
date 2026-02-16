import React, { useState, useEffect } from 'react';
import CanvasOverlay from './CanvasOverlay';
import NumberOverlay from './NumberOverlay';

const InteractiveTutorial = ({ onComplete, onPlayMini, onPlayFull }) => {
  const [tutorialStep, setTutorialStep] = useState(0);
  const [autoPlayStep, setAutoPlayStep] = useState(0);
  const [grid, setGrid] = useState([[1, 2, null], [null, null, null], [null, null, 5]]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [placementPath, setPlacementPath] = useState([]);
  const [userSelectedCorrectly, setUserSelectedCorrectly] = useState(false);
  const [canPlaceNumber, setCanPlaceNumber] = useState(false);
  const [userCompletedPlacement, setUserCompletedPlacement] = useState(false);
  
  const puzzle = [[1, 2, null], [null, null, null], [null, null, 5]]; // 5 is a clue
  const cellSize = 60;
  const margin = 2;

  // Step 1: Auto-play showing selection and placement of 3
  useEffect(() => {
    if (tutorialStep === 1) {
      const sequence = [
        { delay: 0, action: () => { 
          setSelectedCells([]); 
          setPlacementPath([]);
          setGrid([[1, 2, null], [null, null, null], [null, null, 5]]); 
          setAutoPlayStep(0); 
        }},
                { delay: 750, action: () => { setSelectedCells([[0, 0]]); setAutoPlayStep(1); } },
        { delay: 1750, action: () => { setSelectedCells([[0, 0], [0, 1]]); setAutoPlayStep(2); } },
        { delay: 2750, action: () => { 
          // Show placement path animation
          setPlacementPath([[0, 1], [1, 0]]);
          setAutoPlayStep(3); 
        }},
        { delay: 3000, action: () => {
          // Complete placement
          setPlacementPath([]);
          setSelectedCells([]);
          setGrid([[1, 2, null], [3, null, null], [null, null, 5]]) 
        }},
        { delay: 3500, action: () => {
          setAutoPlayStep(4)
        }}
      ];


      const timeouts = sequence.map(({ delay, action }) => 
        setTimeout(action, delay)
      );

      return () => timeouts.forEach(clearTimeout);
    }
  }, [tutorialStep]);

  const handleCellClick = (r, c) => {
    if (tutorialStep === 2) {
      const cellValue = grid[r][c];
      
      // User can click placement cell if they've selected correctly
      if (canPlaceNumber && r === 1 && c === 1 && grid[r][c] === null) {
        // Show placement animation
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
      
      // Ignore clicks on clue (5) or X cells
      if (cellValue === null || cellValue === 5) return;
      
      // Handle selection/deselection of numbered cells
      const selectedIndex = selectedCells.findIndex(([sr, sc]) => sr === r && sc === c);
      
      if (selectedIndex !== -1) {
        // Clicking an already selected cell - deselect it and everything after
        if (selectedIndex === 0 && selectedCells.length === 1) {
          // If it's the only selection, clear all
          setSelectedCells([]);
        } else {
          // Otherwise, keep everything up to (but not including) this cell
          setSelectedCells(selectedCells.slice(0, selectedIndex));
        }
        setUserSelectedCorrectly(false);
        setCanPlaceNumber(false);
        return;
      }
      
      // If no selection yet, allow any number
      if (selectedCells.length === 0) {
        setSelectedCells([[r, c]]);
        return;
      }
      
      // Only allow selecting if adjacent to the last selected cell
      const [lastR, lastC] = selectedCells[selectedCells.length - 1];
      const isAdjacent = Math.abs(r - lastR) + Math.abs(c - lastC) === 1;
      
      if (!isAdjacent) {
        // Not adjacent - start a new selection
        setSelectedCells([[r, c]]);
        setUserSelectedCorrectly(false);
        setCanPlaceNumber(false);
        return;
      }
      
      // Add to selection
      const newSelected = [...selectedCells, [r, c]];
      setSelectedCells(newSelected);
      
      // Check if they selected 1 and 3 (the correct answer)
      const hasOne = newSelected.some(([sr, sc]) => grid[sr][sc] === 1);
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

  const getDropTargetHighlight = (r, c) => {
    return canPlaceNumber && r === 1 && c === 1 && grid[r][c] === null;
  };

  const overlayPoints = [...selectedCells, ...placementPath].map(([r, c], idx, arr) => ({
    row: r,
    col: c,
    placed: idx === arr.length - 1 && placementPath.length > 0
  }));

  const buttonStyle = {
    padding: '12px 32px',
    fontSize: '16px',
    borderRadius: '24px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#303036',
    color: '#fff'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    border: '1px solid #303036',
    backgroundColor: '#fff',
    color: '#303036'
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      {/* Screen 0: Introduction */}
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

          <button
            onClick={() => setTutorialStep(1)}
            style={primaryButtonStyle}
          >
            Next
          </button>
        </>
      )}

      {/* Screen 1: Auto-play demonstration */}
      {tutorialStep === 1 && (
        <>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#333', 
            marginBottom: '20px', 
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            In the example below, the <strong>next numerical number is 3.</strong> 
            <br /><br />
            To get there, you need to <strong>select 1 and 2 to SUM to 3</strong> which is then placed that connects the SUM sequence.
          </p>

          <div style={{ 
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
          }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <CanvasOverlay
                overlayPoints={overlayPoints}
                grid={grid}
                cellSize={cellSize}
                margin={margin}
              />

              <div style={{ position: 'relative', zIndex: 2 }}>
                {grid.map((row, rIdx) => (
                  <div key={rIdx} style={{ display: 'flex' }}>
                    {row.map((cell, cIdx) => {
                      const isClue = puzzle[rIdx][cIdx] === 5 && cell === 5;
                      return (
                        <div
                          key={cIdx}
                          style={{
                            width: cellSize,
                            height: cellSize,
                            margin: margin,
                            backgroundColor: 
                              isClue ? '#e3e6ec' :
                              cell === null ? '#fff' : '#fff',
                            border: '1px solid #999',
                            borderRadius: '0px',
                            position: 'relative',
                            zIndex: 1,
                            transition: 'all 0.3s ease'
                          }}
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
                margin={margin}
              />
            </div>

            <p style={{ 
              marginTop: '16px', 
              fontSize: '16px',
              fontWeight: '500',
              color: '#333',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {autoPlayStep === 0 && "Next number: 3"}
              {autoPlayStep === 1 && "Select 1..."}
              {autoPlayStep === 2 && "Then select 2..."}
              {autoPlayStep === 3 && "1 + 2 = 3"}
              {autoPlayStep === 4 && "3 is now placed!"}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => setTutorialStep(0)}
              style={secondaryButtonStyle}
            >
              Back
            </button>
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

      {/* Screen 2: User's turn */}
      {tutorialStep === 2 && (
        <>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#333', 
            marginBottom: '20px', 
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            Some numbers will already be placed as part of the starting grid.
            <br /><br />
            In situations like this, you must place the 4 strategically such that there is a valid sequence of numbers to SUM to 5.
            <br /><br />
            Please place 4 to create a SUM to 5.
          </p>

          <div style={{ 
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
          }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <CanvasOverlay
                overlayPoints={overlayPoints}
                grid={grid}
                cellSize={cellSize}
                margin={margin}
              />

              <div style={{ position: 'relative', zIndex: 2 }}>
                {grid.map((row, rIdx) => (
                  <div key={rIdx} style={{ display: 'flex' }}>
                    {row.map((cell, cIdx) => {
                      const isClickable = (cell !== null && cell !== 5) || getDropTargetHighlight(rIdx, cIdx);
                      const isClue = puzzle[rIdx][cIdx] === 5 && cell === 5;
                      const isDropTarget = getDropTargetHighlight(rIdx, cIdx);
                      
                      return (
                        <div
                          key={cIdx}
                          onClick={() => handleCellClick(rIdx, cIdx)}
                          style={{
                            width: cellSize,
                            height: cellSize,
                            margin: margin,
                            backgroundColor: 
                              isDropTarget ? '#b3eaf2' :
                              isClue ? '#e3e6ec' :
                              cell === null ? '#fff' : '#fff',
                            border: '1px solid #999',
                            borderRadius: '0px',
                            position: 'relative',
                            zIndex: 1,
                            cursor: isClickable ? 'pointer' : 'default',
                            transition: 'all 0.3s ease',
                            transform: isDropTarget ? 'scale(1.05)' : 'scale(1)'
                          }}
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
                margin={margin}
              />
            </div>

            <p style={{ 
              marginTop: '16px', 
              fontSize: '16px',
              fontWeight: '500',
              color: '#333',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {!userSelectedCorrectly && !userCompletedPlacement && "Select 1 and 3 to make 4"}
              {userSelectedCorrectly && !userCompletedPlacement && "Great! Now tap the blue cell to place 4"}
              {userCompletedPlacement && "Perfect! You placed 4 successfully! 🎉"}
            </p>
          </div>

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
              <button
                onClick={() => setTutorialStep(3)}
                style={primaryButtonStyle}
              >
                Next
              </button>
            )}
          </div>
        </>
      )}

      {/* Screen 3: Completion and game selection */}
      {tutorialStep === 3 && (
        <>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: 'bold' }}>
            Ready to Play! 🎉
          </h3>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#333', 
            marginBottom: '30px', 
            lineHeight: '1.6',
            textAlign: 'left'
          }}>
            Now that you know the basics, it is now your turn! 
            <br /><br />
            Each day there will be 2 new puzzles available:
             <ul>
            <li><strong>Mini SUMS</strong> which will be a 5×5 grid and should take less than 2 minutes</li>
            <br />
            <li><strong>Full SUMS</strong> game which is 7×7 and may take longer</li>
            </ul>
            Let the games begin!
          </p>

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => {
                onComplete();
                onPlayMini();
              }}
              style={{
                ...primaryButtonStyle,
                flex: 1,
                maxWidth: '180px',
                fontSize: '14px'
              }}
            >
              Play Mini SUMS
            </button>
            <button
              onClick={() => {
                onComplete();
                onPlayFull();
              }}
              style={{
                ...primaryButtonStyle,
                flex: 1,
                maxWidth: '180px',
                fontSize: '14px'
              }}
            >
              Play SUMS
            </button>
          </div>

          <button
            onClick={() => {
              setTutorialStep(1);
              setUserCompletedPlacement(false);
              setUserSelectedCorrectly(false);
              setAutoPlayStep(0);
              setGrid([[1, 2, null], [null, null, null], [null, null, 5]]);
              setSelectedCells([]);
              setPlacementPath([]);
            }}
            style={{
              ...secondaryButtonStyle,
              fontSize: '14px',
              padding: '8px 20px'
            }}
          >
            Review Tutorial
          </button>
        </>
      )}
    </div>
  );
};

export default InteractiveTutorial;