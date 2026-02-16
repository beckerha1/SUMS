import React from "react";

const NumberOverlay = ({ grid, puzzle, cellSize, margin = 2 }) => {
  const getCellPosition = (row, col) => {
const spacing = cellSize + margin * 3.05;
const x = Math.round(col * spacing + margin);
const y = Math.round(row * spacing + margin);

    return { x, y };
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 30000, // above canvas and cells
        width: grid[0].length * (cellSize + margin * 2),
        height: grid.length * (cellSize + margin * 2),
      }}
    >
      {grid.map((row, rIdx) =>
        row.map((cell, cIdx) => {
          if (cell === null || cell === "X") return null;

          const { x, y } = getCellPosition(rIdx, cIdx);
          const isPrefilled = puzzle[rIdx][cIdx] === cell && typeof cell === "number";

          return (
            <div
              key={`${rIdx}-${cIdx}`}
              style={{
                position: "absolute",
                top: y,
                left: x,
                width: cellSize,
                height: cellSize,
                lineHeight: `${cellSize}px`,
                fontSize: Math.floor(cellSize / 2.5),
                textAlign: "center",
                fontWeight: isPrefilled ? "bold" : "normal",
                color: "#303036",
              }}
            >
              {cell}
            </div>
          );
        })
      )}
    </div>
  );
};

export default NumberOverlay;
