import { useEffect, useRef } from 'react';

interface AmbientBackdropProps {
  mode: 'gate' | 'celebration';
  isGrandAnniversary: boolean;
  reduceMotion: boolean;
}

interface FloatingHeart {
  x: number;
  y: number;
  size: number;
  speedY: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  rotation: number;
  rotSpeed: number;
  alpha: number;
  color: string;
}

interface SparkParticle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  size: number;
  color: string;
  gravity: number;
  drag: number;
  twinkle: boolean;
}

interface BurstFlash {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  color: string;
}

type BurstStyle = 'chrysanthemum' | 'willow' | 'heart' | 'double';

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  vx: number;
  color: string;
  style: BurstStyle;
  grand: boolean;
}

const HEART_COLORS = [
  'rgba(196, 77, 103, 1)',
  'rgba(216, 122, 141, 1)',
  'rgba(219, 148, 120, 1)',
  'rgba(214, 166, 98, 1)',
];

const FIREWORK_PALETTES: ReadonlyArray<readonly string[]> = [
  ['#A82443', '#D4881F', '#C44D67'],
  ['#9E354D', '#E09A3E', '#C44D67'],
  ['#B84637', '#D99332', '#9E354D'],
  ['#4F6952', '#D4881F', '#C44D67'],
  ['#7B284F', '#E2A43B', '#C44D67'],
];

const MAX_SPARKS = 1100;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function drawHeartPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const s = size / 16;
  ctx.beginPath();
  ctx.moveTo(0, 4 * s);
  ctx.bezierCurveTo(0, 1.5 * s, -4 * s, -3 * s, -8 * s, -3 * s);
  ctx.bezierCurveTo(-13 * s, -3 * s, -13 * s, 4 * s, -13 * s, 4 * s);
  ctx.bezierCurveTo(-13 * s, 9 * s, -7 * s, 13 * s, 0, 17 * s);
  ctx.bezierCurveTo(7 * s, 13 * s, 13 * s, 9 * s, 13 * s, 4 * s);
  ctx.bezierCurveTo(13 * s, 4 * s, 13 * s, -3 * s, 8 * s, -3 * s);
  ctx.bezierCurveTo(4 * s, -3 * s, 0, 1.5 * s, 0, 4 * s);
  ctx.closePath();
  ctx.restore();
}

export function AmbientBackdrop({
  mode,
  isGrandAnniversary,
  reduceMotion,
}: AmbientBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const isMobile = () => width < 640;

    const createHeart = (spawnAtBottom: boolean): FloatingHeart => ({
      x: rand(16, Math.max(32, width - 16)),
      y: spawnAtBottom ? height + rand(10, 90) : rand(0, height),
      size: rand(7, isGrandAnniversary ? 16 : 14),
      speedY: rand(18, isGrandAnniversary ? 42 : 36),
      swayAmp: rand(10, 26),
      swayFreq: rand(0.6, 1.3),
      phase: rand(0, Math.PI * 2),
      rotation: rand(-0.28, 0.28),
      rotSpeed: rand(-0.22, 0.22),
      alpha:
        mode === 'celebration'
          ? rand(0.18, isGrandAnniversary ? 0.36 : 0.32)
          : rand(0.13, 0.24),
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
    });

    const heartCount = isMobile()
      ? isGrandAnniversary
        ? 14
        : 11
      : isGrandAnniversary
        ? 22
        : 18;
    const hearts: FloatingHeart[] = Array.from({ length: heartCount }, () =>
      createHeart(false)
    );

    const rockets: Rocket[] = [];
    const sparks: SparkParticle[] = [];
    const flashes: BurstFlash[] = [];

    const pickStyle = (grand: boolean): BurstStyle => {
      if (!grand) return 'chrysanthemum';
      const styles: BurstStyle[] = [
        'chrysanthemum',
        'heart',
        'double',
        'willow',
      ];
      return styles[Math.floor(Math.random() * styles.length)];
    };

    const spawnRocket = (
      xFraction?: number,
      forcedStyle?: BurstStyle,
      grand = isGrandAnniversary
    ) => {
      const palette =
        FIREWORK_PALETTES[
          Math.floor(Math.random() * FIREWORK_PALETTES.length)
        ];
      const x =
        xFraction !== undefined
          ? width * xFraction
          : rand(width * 0.1, width * 0.9);

      rockets.push({
        x,
        y: height + 12,
        targetY: rand(height * 0.12, height * 0.46),
        vy: -rand(grand ? 460 : 350, grand ? 610 : 450),
        vx: rand(-28, 28),
        color: palette[0],
        style: forcedStyle ?? pickStyle(grand),
        grand,
      });
    };

    const pushSpark = (spark: SparkParticle) => {
      if (sparks.length < MAX_SPARKS) {
        sparks.push(spark);
      }
    };

    const burstAt = (
      x: number,
      y: number,
      style: BurstStyle,
      grand: boolean
    ) => {
      const palette =
        FIREWORK_PALETTES[
          Math.floor(Math.random() * FIREWORK_PALETTES.length)
        ];

      flashes.push({
        x,
        y,
        radius: grand ? 96 : 48,
        alpha: grand ? 0.42 : 0.22,
        color: palette[1],
      });

      if (style === 'heart') {
        const count = isMobile() ? 42 : 64;
        const scale = grand ? (isMobile() ? 8.2 : 12.2) : 7.5;
        for (let i = 0; i < count; i += 1) {
          const t = (Math.PI * 2 * i) / count;
          const hx = 16 * Math.pow(Math.sin(t), 3);
          const hy = -(
            13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t)
          );
          pushSpark({
            x,
            y,
            prevX: x,
            prevY: y,
            vx: hx * scale + rand(-10, 10),
            vy: hy * scale + rand(-10, 10),
            alpha: rand(0.9, 1),
            decay: rand(0.38, 0.56),
            size: rand(2.5, 3.9),
            color: i % 3 === 0 ? palette[1] : '#A82443',
            gravity: 40,
            drag: 1.48,
            twinkle: true,
          });
        }
        return;
      }

      if (style === 'willow') {
        const count = isMobile() ? 44 : 72;
        for (let i = 0; i < count; i += 1) {
          const angle = (Math.PI * 2 * i) / count + rand(-0.09, 0.09);
          const speed = rand(95, grand ? 290 : 180);
          pushSpark({
            x,
            y,
            prevX: x,
            prevY: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: rand(0.88, 1),
            decay: rand(0.3, 0.46),
            size: rand(2.1, 3.4),
            color: i % 2 === 0 ? '#D4881F' : palette[0],
            gravity: 118,
            drag: 1.2,
            twinkle: true,
          });
        }
        return;
      }

      if (style === 'double') {
        const outerCount = isMobile() ? 42 : 66;
        for (let i = 0; i < outerCount; i += 1) {
          const angle = (Math.PI * 2 * i) / outerCount + rand(-0.07, 0.07);
          const speed = rand(165, grand ? 310 : 200);
          pushSpark({
            x,
            y,
            prevX: x,
            prevY: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: rand(0.9, 1),
            decay: rand(0.42, 0.66),
            size: rand(2.4, 3.8),
            color: palette[i % palette.length],
            gravity: 86,
            drag: 1.4,
            twinkle: i % 2 === 0,
          });
        }
        const innerCount = isMobile() ? 22 : 34;
        for (let j = 0; j < innerCount; j += 1) {
          const angle = (Math.PI * 2 * j) / innerCount + rand(-0.1, 0.1);
          const speed = rand(65, 130);
          pushSpark({
            x,
            y,
            prevX: x,
            prevY: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 0.98,
            decay: rand(0.5, 0.74),
            size: rand(2.1, 3.2),
            color: '#D4881F',
            gravity: 66,
            drag: 1.45,
            twinkle: true,
          });
        }
        return;
      }

      // Default chrysanthemum
      const count = isMobile() ? 28 : grand ? 54 : 34;
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + rand(-0.12, 0.12);
        const speed = rand(75, grand ? 260 : 175);
        pushSpark({
          x,
          y,
          prevX: x,
          prevY: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: rand(0.84, 0.98),
          decay: rand(0.48, 0.78),
          size: rand(2.0, grand ? 3.6 : 3.0),
          color: palette[i % palette.length],
          gravity: 88,
          drag: 1.42,
          twinkle: grand && i % 3 === 0,
        });
      }
    };

    interface ScheduledLaunch {
      delayRemaining: number;
      xFraction?: number;
      style?: BurstStyle;
    }

    const salvoQueue: ScheduledLaunch[] = [];
    if (isGrandAnniversary && mode === 'celebration') {
      salvoQueue.push(
        { delayRemaining: 0.08, xFraction: 0.18, style: 'double' },
        { delayRemaining: 0.2, xFraction: 0.82, style: 'double' },
        { delayRemaining: 0.42, xFraction: 0.5, style: 'heart' },
        { delayRemaining: 0.75, xFraction: 0.32, style: 'willow' },
        { delayRemaining: 0.92, xFraction: 0.68, style: 'willow' },
        { delayRemaining: 1.3, xFraction: 0.22, style: 'heart' },
        { delayRemaining: 1.48, xFraction: 0.78, style: 'heart' },
        { delayRemaining: 1.85, xFraction: 0.42, style: 'double' },
        { delayRemaining: 2.05, xFraction: 0.6, style: 'chrysanthemum' },
        { delayRemaining: 2.45, xFraction: 0.5, style: 'heart' }
      );
    } else if (isGrandAnniversary && mode === 'gate') {
      salvoQueue.push(
        { delayRemaining: 0.15, xFraction: 0.15, style: 'heart' },
        { delayRemaining: 0.4, xFraction: 0.85, style: 'double' }
      );
    }

    let nextFireworkTimer = isGrandAnniversary
      ? mode === 'celebration'
        ? 2.8
        : 3.0
      : mode === 'celebration'
        ? 0.25
        : Infinity;
    let initialBurstCount = 0;

    let rafId = 0;
    let lastTime = performance.now();
    let elapsedTotal = 0;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const tick = (now: number) => {
      if (document.hidden) {
        lastTime = now;
        rafId = window.requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      elapsedTotal += dt;

      ctx.clearRect(0, 0, width, height);

      // 1. Update & draw rising floating hearts
      for (let i = 0; i < hearts.length; i += 1) {
        const h = hearts[i];
        h.y -= h.speedY * dt;
        h.rotation += h.rotSpeed * dt;
        const swayX =
          h.x + Math.sin(elapsedTotal * h.swayFreq + h.phase) * h.swayAmp;

        if (h.y < -h.size * 2.5) {
          hearts[i] = createHeart(true);
          continue;
        }

        const bottomFade = Math.min(1, Math.max(0, (height - h.y) / 90));
        const topFade = Math.min(1, Math.max(0, h.y / 110));
        const effectiveAlpha = h.alpha * bottomFade * topFade;

        if (effectiveAlpha > 0.01) {
          ctx.save();
          ctx.globalAlpha = effectiveAlpha;
          ctx.fillStyle = h.color;
          drawHeartPath(ctx, swayX, h.y, h.size, h.rotation);
          ctx.fill();
          ctx.restore();
        }
      }

      // 2. Process scheduled Grand Anniversary salvo queue
      for (let i = salvoQueue.length - 1; i >= 0; i -= 1) {
        salvoQueue[i].delayRemaining -= dt;
        if (salvoQueue[i].delayRemaining <= 0) {
          const item = salvoQueue[i];
          spawnRocket(item.xFraction, item.style, true);
          salvoQueue.splice(i, 1);
        }
      }

      // 3. Ongoing firework schedule
      if (mode === 'celebration' || isGrandAnniversary) {
        nextFireworkTimer -= dt;
        if (nextFireworkTimer <= 0) {
          if (isGrandAnniversary) {
            if (mode === 'celebration') {
              spawnRocket(rand(0.1, 0.36));
              spawnRocket(rand(0.64, 0.9));
              if (Math.random() > 0.35) {
                spawnRocket(rand(0.36, 0.64), 'heart');
              }
              nextFireworkTimer = rand(1.65, 2.55);
            } else {
              spawnRocket(
                Math.random() > 0.5 ? rand(0.08, 0.22) : rand(0.78, 0.92)
              );
              nextFireworkTimer = rand(2.5, 3.8);
            }
          } else if (initialBurstCount === 0) {
            spawnRocket(rand(0.12, 0.34), 'chrysanthemum', false);
            initialBurstCount = 1;
            nextFireworkTimer = 0.45;
          } else if (initialBurstCount === 1) {
            spawnRocket(rand(0.66, 0.9), 'chrysanthemum', false);
            initialBurstCount = 2;
            nextFireworkTimer = rand(3.2, 4.8);
          } else {
            spawnRocket(undefined, 'chrysanthemum', false);
            nextFireworkTimer = rand(3.4, 5.6);
          }
        }
      }

      // 4. Update flashes
      for (let i = flashes.length - 1; i >= 0; i -= 1) {
        const f = flashes[i];
        f.alpha -= 1.05 * dt;
        if (f.alpha <= 0.01) {
          flashes.splice(i, 1);
          continue;
        }
        const grad = ctx.createRadialGradient(
          f.x,
          f.y,
          0,
          f.x,
          f.y,
          f.radius
        );
        grad.addColorStop(0, f.color);
        grad.addColorStop(1, 'rgba(250, 245, 238, 0)');
        ctx.save();
        ctx.globalAlpha = f.alpha;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. Update rockets
      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const r = rockets[i];
        const prevX = r.x;
        const prevY = r.y;
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        r.vy += 110 * dt;

        ctx.save();
        ctx.globalAlpha = r.grand ? 0.85 : 0.6;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = r.grand ? 3 : 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(prevX, prevY + 12);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();
        ctx.restore();

        if (r.y <= r.targetY || r.vy >= -40) {
          burstAt(r.x, r.y, r.style, r.grand);
          rockets.splice(i, 1);
        }
      }

      // 6. Update firework sparks (comet tail + bright ember tip)
      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const s = sparks[i];
        s.prevX = s.x;
        s.prevY = s.y;
        const damping = Math.max(0, 1 - s.drag * dt);
        s.vx *= damping;
        s.vy = s.vy * damping + s.gravity * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.alpha -= s.decay * dt;

        if (s.alpha <= 0.02) {
          sparks.splice(i, 1);
          continue;
        }

        const shimmer = s.twinkle
          ? 0.66 + 0.34 * Math.sin(elapsedTotal * 22 + i)
          : 1;
        const alpha = Math.min(0.94, s.alpha * shimmer);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = s.color;
        ctx.fillStyle = s.color;
        ctx.lineWidth = s.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.prevX, s.prevY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        // Crisp glowing ember bead at spark tip for high contrast on cream paper
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.58, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mode, isGrandAnniversary, reduceMotion]);

  if (reduceMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="ambient-canvas"
      aria-hidden="true"
    />
  );
}
