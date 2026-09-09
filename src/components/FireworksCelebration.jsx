import React, { useEffect, useRef } from 'react';

export const WIN_CELEBRATION_MS = 3800;
export const WIN_CELEBRATION_REDUCED_MS = 450;

const TAU = Math.PI * 2;
const PALETTE = [
  '#e8b923', '#f4d35e', '#f7a072', '#ee6c4d',
  '#7ebdc2', '#5c9ead', '#c084fc', '#f472b6',
  '#86efac', '#fde68a', '#fb923c'
];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pick(list) {
  return list[(Math.random() * list.length) | 0];
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function playCelebrationAudio() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0.1;
    master.connect(ctx.destination);

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const tone = (freq, start, dur, peak) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain).connect(master);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    };

    // Soft, unhurried chime — no crackles
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      tone(freq, now + i * 0.16, 0.9, 0.16);
    });
    tone(392.0, now, 1.3, 0.07);

    return ctx;
  } catch (err) {
    return null;
  }
}

function spawnPiece(width, height, mode) {
  const color = pick(PALETTE);
  const fromTop = mode === 'fall';
  return {
    x: fromTop ? rand(-12, width + 12) : width * 0.5 + rand(-width * 0.18, width * 0.18),
    y: fromTop ? rand(-80, -12) : height * 0.22 + rand(-20, 24),
    vx: fromTop ? rand(-0.35, 0.35) : rand(-1.6, 1.6),
    vy: fromTop ? rand(0.55, 1.15) : rand(-1.1, 0.55),
    gravity: rand(0.006, 0.012),
    sway: rand(0.35, 0.9),
    wobble: rand(0, TAU),
    wobbleSpeed: rand(0.018, 0.04),
    rotation: rand(0, TAU),
    spin: rand(-0.035, 0.035),
    w: rand(5, 11),
    h: rand(8, 15),
    rgb: hexToRgb(color),
    alpha: rand(0.78, 1)
  };
}

function drawPiece(ctx, p) {
  if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return;
  const flutter = 0.55 + 0.45 * Math.cos(p.wobble);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = `rgb(${p.rgb.r},${p.rgb.g},${p.rgb.b})`;
  ctx.fillRect(-p.w * 0.5, -p.h * 0.5, p.w * flutter, p.h);
  ctx.restore();
}

/**
 * Slow confetti overlay shown after a puzzle is solved.
 * pointer-events none so the win modal stays clickable while pieces linger.
 */
export default function FireworksCelebration({
  active = false,
  showBanner = true,
  linger = false
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const audioRef = useRef(null);
  const lingerRef = useRef(linger);
  const reduced = prefersReducedMotion();
  lingerRef.current = linger;

  useEffect(() => {
    if (!active || prefersReducedMotion()) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let particles = [];
    let start = performance.now();
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(2, window.innerWidth);
      height = Math.max(2, window.innerHeight);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    audioRef.current = playCelebrationAudio();

    const drop = (count, mode) => {
      for (let i = 0; i < count; i++) {
        particles.push(spawnPiece(width, height, mode));
      }
    };

    drop(36, 'fall');
    drop(22, 'burst');

    const spawnId = window.setInterval(() => {
      if (!running) return;
      const elapsed = performance.now() - start;
      const lingering = lingerRef.current;
      const until = lingering ? 14000 : 8000;
      if (elapsed > until) return;
      drop(elapsed < 2500 ? 7 : 4, 'fall');
    }, 320);

    let lastTs = start;
    const FRAME = 16.667;
    let lastTickAt = start;

    const tick = (now) => {
      if (!running) return;
      lastTickAt = now;
      const liveCanvas = canvasRef.current;
      const liveCtx = liveCanvas ? liveCanvas.getContext('2d') : null;
      if (!liveCanvas || !liveCtx) {
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      try {
        let dt = (now - lastTs) / FRAME;
        lastTs = now;
        if (!Number.isFinite(dt) || dt <= 0) dt = 1;
        dt = Math.min(dt, 2.5);

        if (liveCanvas.width !== Math.floor(width * Math.min(window.devicePixelRatio || 1, 2))) {
          resize();
        }

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        liveCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        liveCtx.clearRect(0, 0, width, height);
        liveCtx.globalCompositeOperation = 'source-over';

        const next = [];
        for (const p of particles) {
          p.wobble += p.wobbleSpeed * dt;
          p.x += (p.vx + Math.sin(p.wobble) * p.sway) * dt;
          p.y += p.vy * dt;
          p.vy += p.gravity * dt;
          p.rotation += p.spin * dt;
          if (p.y < height + 24) next.push(p);
        }
        particles = next.slice(-900);

        for (let i = 0; i < particles.length; i++) {
          drawPiece(liveCtx, particles[i]);
        }
      } catch (err) {
        // Keep the loop alive even if a single frame fails to draw.
      }

      if (running) {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    rafRef.current = window.requestAnimationFrame(tick);
    const watchdogId = window.setInterval(() => {
      if (!running) return;
      if (performance.now() - lastTickAt > 90) {
        tick(performance.now());
      }
    }, 50);

    return () => {
      running = false;
      window.cancelAnimationFrame(rafRef.current);
      window.clearInterval(watchdogId);
      window.clearInterval(spawnId);
      window.removeEventListener('resize', resize);
      if (audioRef.current) {
        const ctxToClose = audioRef.current;
        audioRef.current = null;
        window.setTimeout(() => {
          ctxToClose.close().catch(() => {});
        }, 2500);
      }
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      className={`fireworks-celebration${reduced ? ' fireworks-celebration--reduced' : ''}${linger ? ' fireworks-celebration--linger' : ''}`}
      data-testid="fireworks-celebration"
      aria-hidden="true"
    >
      <div className="fireworks-sky" />
      <canvas
        ref={canvasRef}
        className="fireworks-canvas"
        data-testid="fireworks-canvas"
        style={reduced ? { visibility: 'hidden' } : undefined}
      />
      {showBanner && (
        <div className="fireworks-banner">
          <div className="fireworks-banner-kicker">Puzzle complete</div>
          <div className="fireworks-banner-title">YOU WON!</div>
        </div>
      )}
    </div>
  );
}

export { prefersReducedMotion };
