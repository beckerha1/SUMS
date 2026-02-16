import React from 'react';
import { useEffect, useRef } from "react";

const CanvasOverlay = ({ overlayPoints, grid, cellSize, margin = 2 }) => {
  const canvasRef = useRef(null);

const padding = cellSize * 0.5; // Extra space around edges for animations
const canvasWidth = grid[0].length * (cellSize + margin * 2) + padding * 2;
const canvasHeight = grid.length * (cellSize + margin * 2) + padding * 2;

useEffect(() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;

  canvas.width = canvasWidth * dpr;
  canvas.height = canvasHeight * dpr;

  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;

  ctx.scale(dpr, dpr);

  const frozenPoints = [...overlayPoints];
  const frozenGrid = grid.map(row => [...row]);
  if (!frozenPoints.length) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const turquoise_blue = "#00bcd4";
  const radius = cellSize * 0.2;
  const lineThickness = cellSize * 0.3;

  const clearCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

const getCellPosition = (row, col) => {
  const spacing = cellSize + margin * 3.05;
  const x = Math.round(col * spacing + margin + cellSize / 2 + padding);
  const y = Math.round(row * spacing + margin + cellSize / 2 + padding);
  return { x, y };
};

  const drawStaticPath = (points) => {
    const path = new Path2D();

    // Lines
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      if (frozenGrid[a.row]?.[a.col] === "X" || frozenGrid[b.row]?.[b.col] === "X") continue;

      const start = getCellPosition(a.row, a.col);
      const end = getCellPosition(b.row, b.col);

      path.moveTo(start.x, start.y);
      path.lineTo(end.x, end.y);
    }

    // Circles
    points.forEach((p) => {
      if (frozenGrid[p.row]?.[p.col] === "X") return;
      const { x, y } = getCellPosition(p.row, p.col);
      path.moveTo(x + radius, y);
      path.arc(x, y, radius, 0, 2 * Math.PI);
    });

// Turquoise stroke (no black border)
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.strokeStyle = turquoise_blue;
ctx.lineWidth = lineThickness;
ctx.stroke(path);

// Fill circles
ctx.fillStyle = turquoise_blue;
ctx.fill(path);
  };

const animatePop = (lastPoint, onDone) => {
  const { x, y } = getCellPosition(lastPoint.row, lastPoint.col);
  const start = performance.now();

  const animate = (now) => {
    const progress = Math.min((now - start) / 200, 1);
    const scale = 1 + 0.6 * Math.sin(progress * Math.PI);

    clearCanvas();
    drawStaticPath(frozenPoints); // full static path

// Only draw the expanding turquoise stroke (no black border)
ctx.beginPath();
ctx.arc(x, y, radius * scale, 0, 2 * Math.PI);
ctx.lineWidth = lineThickness;
ctx.strokeStyle = turquoise_blue;
ctx.stroke();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      clearCanvas();
      drawStaticPath([]); // erase everything after
      if (onDone) onDone();
    }
  };

  requestAnimationFrame(animate);
};

if (!frozenPoints.length) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return;
}


  const last = frozenPoints[frozenPoints.length - 1];
  const isPlacement = last?.placed;

  if (frozenPoints.length === 1 || !isPlacement) {
    clearCanvas();
    drawStaticPath(frozenPoints);
  } else {
    animatePop(last);
  }
}, [overlayPoints, grid, cellSize, margin, canvasHeight, canvasWidth, padding]);

  return (
    <canvas
  ref={canvasRef}
  style={{
    position: "absolute",
    top: -padding,
    left: -padding,
    zIndex: 1000,
    pointerEvents: "none"
  }}
    />
  );
};

export default CanvasOverlay;
