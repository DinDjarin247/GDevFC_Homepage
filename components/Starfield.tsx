'use client';

import { useEffect, useRef } from 'react';

type StarfieldProps = {
  className?: string;
};

/** 저해상도 가상 캔버스 + CSS 확대로 8비트 느낌을 내고 렌더 비용을 낮춘다 */
const VIRTUAL_W = 320;
const VIRTUAL_H = 200;
const STAR_COUNT = 60;

type Star = {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  driftSpeed: number;
};

type Ship = {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  nextAt: number;
};

/** 단순 픽셀 우주선 실루엣 (10 x 6 블록) */
const SHIP_ROWS = ['..##......', '.####.....', '##########', '.####.....', '..##......', '.#....#...'];

function makeStars(): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const layer = Math.floor(Math.random() * 3); // 0 멀리 ~ 2 가까이
    stars.push({
      x: Math.random() * VIRTUAL_W,
      y: Math.random() * VIRTUAL_H,
      size: layer + 1,
      baseAlpha: 0.22 + layer * 0.16 + Math.random() * 0.12,
      twinkleSpeed: 0.5 + Math.random() * 1.3,
      phase: Math.random() * Math.PI * 2,
      driftSpeed: (layer + 1) * 2.4,
    });
  }
  return stars;
}

/**
 * 홈 화면 배경 — 반짝이는 패럴랙스 스타필드 + 주기적으로 지나가는 우주선.
 * 텍스트 가독성을 해치지 않도록 낮은 명도/투명도로 그린다.
 * prefers-reduced-motion 이면 정지 프레임 한 번만 그린다.
 */
export default function Starfield({ className }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = VIRTUAL_W;
    canvas.height = VIRTUAL_H;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stars = makeStars();
    const shipScale = 3;
    const shipW = SHIP_ROWS[0].length * shipScale;

    const ship: Ship = {
      active: false,
      x: -shipW,
      y: VIRTUAL_H * 0.16,
      vx: 0,
      nextAt: performance.now() + 4000 + Math.random() * 5000,
    };

    function drawStars() {
      for (const s of stars) {
        const tw = reduced ? 1 : 0.55 + 0.45 * Math.sin(s.phase);
        ctx!.globalAlpha = Math.min(1, s.baseAlpha * tw);
        ctx!.fillStyle = '#dff2ff';
        ctx!.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
      }
      ctx!.globalAlpha = 1;
    }

    function drawShip() {
      if (!ship.active) return;
      ctx!.globalAlpha = 0.38;
      ctx!.fillStyle = '#c9f73d';
      for (let row = 0; row < SHIP_ROWS.length; row++) {
        const line = SHIP_ROWS[row];
        for (let col = 0; col < line.length; col++) {
          if (line[col] === '#') {
            ctx!.fillRect(
              Math.round(ship.x + col * shipScale),
              Math.round(ship.y + row * shipScale),
              shipScale,
              shipScale
            );
          }
        }
      }
      ctx!.globalAlpha = 1;
    }

    let raf = 0;
    let last = performance.now();

    function frame(now: number) {
      const dt = Math.min(64, now - last) / 1000;
      last = now;

      ctx!.clearRect(0, 0, VIRTUAL_W, VIRTUAL_H);

      for (const s of stars) {
        s.phase += dt * s.twinkleSpeed;
        s.x -= s.driftSpeed * dt;
        if (s.x < -2) s.x = VIRTUAL_W + 2;
      }

      if (!ship.active && now >= ship.nextAt) {
        ship.active = true;
        ship.x = -shipW;
        ship.y = VIRTUAL_H * (0.1 + Math.random() * 0.24);
        ship.vx = (VIRTUAL_W + shipW * 2) / (7 + Math.random() * 3);
      } else if (ship.active) {
        ship.x += ship.vx * dt;
        if (ship.x > VIRTUAL_W + shipW) {
          ship.active = false;
          ship.nextAt = now + 11000 + Math.random() * 9000;
        }
      }

      drawStars();
      drawShip();

      raf = requestAnimationFrame(frame);
    }

    if (reduced) {
      drawStars();
    } else {
      raf = requestAnimationFrame(frame);
    }

    // 탭이 백그라운드일 땐 그리지 않아 배터리를 아낀다
    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
