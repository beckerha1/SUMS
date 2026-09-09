import React, { useEffect, useRef } from 'react';

export const WIN_CELEBRATION_MS = 2600;
export const WIN_CELEBRATION_REDUCED_MS = 450;

const TAU = Math.PI * 2;
const PALETTE = [
  '#ffd700', '#fff4c2', '#ffffff', '#ff6b3d',
  '#ff2d95', '#7af7ff', '#7cff6b', '#b388ff',
  '#ff9f1c', '#00f5d4', '#ff4d6d'
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
  master.gain.value = 0.22;
  master.connect(ctx.destination);

  const resume = () => {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };
  resume();

  const now = ctx.currentTime;

  const tone = (freq, start, dur, type, peak) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain).connect(master);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  };

  // Bright opening fanfare
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    tone(freq, now + i * 0.07, 0.55, 'triangle', 0.22);
  });
  tone(261.63, now, 0.9, 'sine', 0.12);

  const crackle = (when, strength) => {
    const duration = 0.18;
    const buffer = ctx.createBuffer(1, Math.max(1, (ctx.sampleRate * duration) | 0), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.2);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = rand(700, 2400);
    filter.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(strength, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    src.connect(filter).connect(gain).connect(master);
    src.start(when);

    tone(rand(140, 280), when, 0.22, 'sine', strength * 0.45);
  };

  [0.12, 0.28, 0.5, 0.72, 1.05, 1.35, 1.7, 2.05, 2.45, 2.9, 3.4].forEach((offset, i) => {
    crackle(now + offset, i === 0 ? 0.28 : rand(0.1, 0.2));
  });

    return ctx;
  } catch (err) {
    return null;
  }
}

function spawnRocket(width, height) {
  const color = pick(PALETTE);
  return {
    kind: 'rocket',
    x: rand(width * 0.08, width * 0.92),
    y: height + 8,
    vx: rand(-1.1, 1.1),
    vy: -rand(9.5, 15.5) * Math.max(0.85, height / 900),
    targetY: rand(height * 0.1, height * 0.46),
    color,
    rgb: hexToRgb(color),
    trail: [],
    life: 1,
    exploded: false
  };
}

function spawnExplosion(x, y, color, style) {
  const rgb = hexToRgb(color);
  const sparks = [];
  const count = style === 'ring' ? 42 : style === 'willow' ? 55 : (70 + ((Math.random() * 40) | 0));
  const baseSpeed = style === 'willow' ? 3.2 : style === 'ring' ? 5.4 : rand(3.4, 6.6);

  for (let i = 0; i < count; i++) {
    const angle = style === 'ring'
      ? (i / count) * TAU + rand(-0.04, 0.04)
      : rand(0, TAU);
    const speed = style === 'ring'
      ? baseSpeed * rand(0.92, 1.08)
      : baseSpeed * rand(0.35, 1.25);
    sparks.push({
      kind: 'spark',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: style === 'willow' ? rand(0.008, 0.014) : rand(0.012, 0.024),
      gravity: style === 'willow' ? 0.065 : 0.045,
      size: rand(1.4, 3.1),
      rgb,
      glitter: style === 'willow' || Math.random() < 0.35
    });
  }

  // Inner white flash core
  for (let i = 0; i < 14; i++) {
    const angle = rand(0, TAU);
    const speed = rand(0.6, 2.4);
    sparks.push({
      kind: 'spark',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.04,
      gravity: 0.02,
      size: rand(2.2, 4.4),
      rgb: { r: 255, g: 255, b: 255 },
      glitter: false
    });
  }

  return sparks;
}

function drawParticle(ctx, p) {
  const alpha = Math.max(0, p.life);
  if (alpha <= 0) return;

  if (p.kind === 'rocket') {
    p.trail.forEach((t, i) => {
      const ta = (i / p.trail.length) * 0.55;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 1.6, 0, TAU);
      ctx.fillStyle = `rgba(${p.rgb.r},${p.rgb.g},${p.rgb.b},${ta})`;
      ctx.fill();
    });
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.4, 0, TAU);
    ctx.fillStyle = `rgba(255,255,240,${0.9 * alpha})`;
    ctx.fill();
    return;
  }

  const glow = p.size * (p.glitter ? 3.2 : 2.4);
  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glow);
  gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
  gradient.addColorStop(0.35, `rgba(${p.rgb.r},${p.rgb.g},${p.rgb.b},${alpha * 0.9})`);
  gradient.addColorStop(1, `rgba(${p.rgb.r},${p.rgb.g},${p.rgb.b},0)`);
  ctx.beginPath();
  ctx.arc(p.x, p.y, glow, 0, TAU);
  ctx.fillStyle = gradient;
  ctx.fill();
}

/**
 * Full-screen fireworks overlay shown after a puzzle is solved.
 * pointer-events none when linger is true so the win modal stays clickable.
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
    if (!active || reduced) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let particles = [];
    let bloom = 0.9;
    let lastLaunch = 0;
    let start = performance.now();
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    audioRef.current = playCelebrationAudio();

    const launchSalvo = (count) => {
      for (let i = 0; i < count; i++) {
        particles.push(spawnRocket(width, height));
      }
    };

    launchSalvo(5);
    const delayedBursts = [];

    const queueSecondaryBurst = (x, y) => {
      const id = window.setTimeout(() => {
        if (!running) return;
        particles.push(...spawnExplosion(
          x + rand(-28, 28),
          y + rand(-24, 24),
          pick(PALETTE),
          'burst'
        ));
        bloom = Math.min(1, bloom + 0.18);
      }, rand(180, 420));
      delayedBursts.push(id);
    };

    const tick = (now) => {
      if (!running) return;
      const elapsed = now - start;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      const intense = elapsed < 2800;
      const lingering = lingerRef.current;
      const launchGap = intense ? rand(140, 280) : lingering ? rand(420, 820) : rand(260, 500);
      if (now - lastLaunch > launchGap && particles.length < 1100 && elapsed < (lingering ? 14000 : 7000)) {
        launchSalvo(intense ? (Math.random() < 0.5 ? 2 : 1) : 1);
        lastLaunch = now;
      }

      const next = [];
      for (const p of particles) {
        if (p.kind === 'rocket' && !p.exploded) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.085;
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 14) p.trail.shift();
          if (p.y <= p.targetY || p.vy >= -0.6) {
            p.exploded = true;
            const style = pick(['burst', 'burst', 'ring', 'willow']);
            next.push(...spawnExplosion(p.x, p.y, p.color, style));
            bloom = Math.min(1, bloom + (style === 'willow' ? 0.22 : 0.38));
            if (Math.random() < 0.45) queueSecondaryBurst(p.x, p.y);
          } else {
            next.push(p);
          }
        } else if (p.kind === 'spark') {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.life -= p.decay;
          if (p.glitter && Math.random() < 0.08 && next.length < 1100) {
            next.push({
              kind: 'spark',
              x: p.x,
              y: p.y,
              vx: rand(-0.4, 0.4),
              vy: rand(0.2, 0.9),
              life: 0.6,
              decay: 0.03,
              gravity: 0.02,
              size: 1.1,
              rgb: p.rgb,
              glitter: false
            });
          }
          if (p.life > 0) next.push(p);
        }
        drawParticle(ctx, p);
      }
      particles = next;

      if (bloom > 0.002) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = `rgba(255, 236, 180, ${bloom * 0.22})`;
        ctx.fillRect(0, 0, width, height);
        bloom *= 0.86;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      running = false;
      window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      delayedBursts.forEach((id) => window.clearTimeout(id));
      if (audioRef.current) {
        const ctxToClose = audioRef.current;
        audioRef.current = null;
        window.setTimeout(() => {
          ctxToClose.close().catch(() => {});
        }, 4000);
      }
    };
  }, [active, reduced]);

  if (!active) return null;

  return (
    <div
      className={`fireworks-celebration${reduced ? ' fireworks-celebration--reduced' : ''}${linger ? ' fireworks-celebration--linger' : ''}`}
      data-testid="fireworks-celebration"
      aria-hidden="true"
    >
      <div className="fireworks-sky" />
      <div className="fireworks-flash" />
      {!reduced && (
        <canvas
          ref={canvasRef}
          className="fireworks-canvas"
          data-testid="fireworks-canvas"
        />
      )}
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
