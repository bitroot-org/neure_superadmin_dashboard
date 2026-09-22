import React, { useEffect, useRef } from 'react';

// Glyphs grouped by depth layer — far stars are tiny dots, near stars are sparkles.
const LAYERS = [
  { glyphs: ['.', '·', '˙'], size: 10, speed: 4, parallax: 6, alpha: 0.32 },
  { glyphs: ['+', '*', '⋆', '·'], size: 13, speed: 8, parallax: 14, alpha: 0.5 },
  { glyphs: ['✦', '✧', '*', '+'], size: 16, speed: 14, parallax: 26, alpha: 0.75 },
];

const TRAIL = ['*', '+', '·', '·', '.', '.'];

interface Star {
  x: number;
  y: number;
  layer: number;
  glyph: string;
  phase: number;
  twinkle: number;
  drift: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]) => arr[(Math.random() * arr.length) | 0];

const AsciiStars: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const font = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let meteor: Meteor | null = null;
    let nextMeteorAt = performance.now() + rand(2500, 5000);
    let raf = 0;
    let last = performance.now();

    // Pointer: target vs eased value, normalised to -1..1 for parallax.
    const pointer = { tx: 0, ty: 0, x: 0, y: 0, px: -9999, py: -9999 };

    const seed = () => {
      const count = Math.min(240, Math.round((width * height) / 7000));
      stars = Array.from({ length: count }, () => {
        const r = Math.random();
        const layer = r < 0.55 ? 0 : r < 0.87 ? 1 : 2;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          layer,
          glyph: pick(LAYERS[layer].glyphs),
          phase: Math.random() * Math.PI * 2,
          twinkle: rand(0.6, 2.2),
          drift: rand(0.6, 1.4),
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      seed();
    };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;

      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // Draw layer by layer so the font is only set three times per frame.
      for (let l = 0; l < LAYERS.length; l++) {
        const layer = LAYERS[l];
        ctx.font = `${layer.size}px ${font}`;
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          if (s.layer !== l) continue;

          if (!reducedMotion) {
            s.y -= layer.speed * s.drift * dt;
            s.x += layer.speed * 0.35 * s.drift * dt;
            if (s.y < -20) { s.y = height + 20; s.x = Math.random() * width; }
            if (s.x > width + 20) { s.x = -20; }
          }

          const x = s.x - pointer.x * layer.parallax;
          const y = s.y - pointer.y * layer.parallax;

          const tw = reducedMotion ? 0.8 : 0.55 + 0.45 * Math.sin(t * s.twinkle + s.phase);
          const dx = x - pointer.px;
          const dy = y - pointer.py;
          const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 160);

          const a = Math.min(1, layer.alpha * tw + near * 0.6);
          ctx.fillStyle = near > 0.05
            ? `rgba(235, 255, 244, ${a})`
            : `rgba(${200 + l * 15}, ${225 + l * 10}, ${212 + l * 12}, ${a})`;
          ctx.fillText(s.glyph, x, y);
        }
      }

      // Occasional ASCII shooting star.
      if (!reducedMotion) {
        if (!meteor && now > nextMeteorAt) {
          const fromLeft = Math.random() < 0.5;
          meteor = {
            x: fromLeft ? rand(-40, width * 0.4) : rand(width * 0.6, width + 40),
            y: rand(-20, height * 0.35),
            vx: (fromLeft ? 1 : -1) * rand(520, 720),
            vy: rand(220, 320),
            life: 1,
          };
        }
        if (meteor) {
          meteor.x += meteor.vx * dt;
          meteor.y += meteor.vy * dt;
          meteor.life -= dt * 0.9;
          ctx.font = `14px ${font}`;
          const len = Math.hypot(meteor.vx, meteor.vy);
          const ux = meteor.vx / len;
          const uy = meteor.vy / len;
          for (let k = 0; k < TRAIL.length; k++) {
            const a = Math.max(0, meteor.life) * (1 - k / TRAIL.length);
            ctx.fillStyle = `rgba(210, 255, 225, ${a})`;
            ctx.fillText(TRAIL[k], meteor.x - ux * k * 11, meteor.y - uy * k * 11);
          }
          if (meteor.life <= 0 || meteor.y > height + 40) {
            meteor = null;
            nextMeteorAt = now + rand(4000, 8000);
          }
        }
      }

      if (!reducedMotion) raf = requestAnimationFrame(draw);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      const rect = canvas.getBoundingClientRect();
      pointer.px = e.clientX - rect.left;
      pointer.py = e.clientY - rect.top;
    };
    const onPointerLeave = () => { pointer.px = -9999; pointer.py = -9999; };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reducedMotion) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reducedMotion) draw(performance.now());
    });
    ro.observe(canvas);
    resize();
    raf = requestAnimationFrame(draw);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};

export default AsciiStars;
