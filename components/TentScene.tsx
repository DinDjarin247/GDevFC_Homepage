'use client';

import { useEffect, useRef } from 'react';

type TentSceneProps = {
  className?: string;
};

/** 저해상도 가상 캔버스 + CSS 확대 (Starfield / CampfireScene 과 동일 기법) */
const VIRTUAL_W = 320;
const VIRTUAL_H = 180;

/** 천막 꼭대기(기둥이 모이는 지점)와 천이 끝나는 높이 */
const APEX_X = VIRTUAL_W / 2;
const APEX_Y = 4;
const DRAPE_Y = 64;

const BALL_X = VIRTUAL_W / 2;
const BALL_Y = 150;
const BALL_R = 13;

type Spark = {
  x: number;
  y: number;
  speed: number;
  phase: number;
  twinkle: number;
  size: number;
};

/** 수정구슬 주위에서 천천히 떠오르는 마법 입자 */
function makeSparks(count: number): Spark[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * VIRTUAL_W,
    y: 70 + Math.random() * 110,
    speed: 3 + Math.random() * 7,
    phase: Math.random() * Math.PI * 2,
    twinkle: 0.8 + Math.random() * 1.8,
    size: Math.random() < 0.25 ? 2 : 1,
  }));
}

/** 별자리 — 고정 좌표에 점을 찍고 선으로 잇는다 (좌: 국자 / 우: 삼각 성좌) */
const CONSTELLATIONS: { x: number; y: number }[][] = [
  [
    { x: 34, y: 92 },
    { x: 48, y: 86 },
    { x: 62, y: 92 },
    { x: 74, y: 104 },
    { x: 60, y: 110 },
  ],
  [
    { x: 252, y: 88 },
    { x: 268, y: 100 },
    { x: 286, y: 92 },
    { x: 272, y: 78 },
  ],
];

export default function TentScene({ className }: TentSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = VIRTUAL_W;
    canvas.height = VIRTUAL_H;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sparks = makeSparks(30);

    const air = ctx.createLinearGradient(0, 0, 0, VIRTUAL_H);
    air.addColorStop(0, '#140c28');
    air.addColorStop(0.55, '#1d1038');
    air.addColorStop(1, '#2a1546');

    function drawAir() {
      ctx!.fillStyle = air;
      ctx!.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);
    }

    /** 꼭대기에서 부채꼴로 펼쳐지는 천막 천 — 밝고 어두운 폭을 번갈아 칠한다 */
    function drawDrape() {
      const panels = 10;
      const spread = VIRTUAL_W + 80;
      for (let i = 0; i < panels; i++) {
        const x0 = -40 + (spread / panels) * i;
        const x1 = -40 + (spread / panels) * (i + 1);
        ctx!.fillStyle = i % 2 === 0 ? '#3a2568' : '#301e57';
        ctx!.beginPath();
        ctx!.moveTo(APEX_X, APEX_Y);
        ctx!.lineTo(x0, DRAPE_Y);
        ctx!.lineTo(x1, DRAPE_Y);
        ctx!.closePath();
        ctx!.fill();
      }

      // 천 끝단 — 물결치는 술 장식
      ctx!.fillStyle = '#23153f';
      const scallop = 16;
      for (let x = -8; x < VIRTUAL_W + scallop; x += scallop) {
        ctx!.beginPath();
        ctx!.moveTo(x, DRAPE_Y - 1);
        ctx!.lineTo(x + scallop, DRAPE_Y - 1);
        ctx!.lineTo(x + scallop / 2, DRAPE_Y + 9);
        ctx!.closePath();
        ctx!.fill();
      }

      // 꼭대기 금장식
      ctx!.fillStyle = '#f5d76e';
      ctx!.fillRect(APEX_X - 2, APEX_Y - 3, 4, 7);
      ctx!.fillRect(APEX_X - 4, APEX_Y + 3, 8, 2);
    }

    function drawLantern(x: number, topY: number, t: number, seed: number) {
      ctx!.fillStyle = '#2b1f4d';
      ctx!.fillRect(x, topY, 1, 16);

      const flicker = reduced ? 1 : 1 + Math.sin(t * 7 + seed) * 0.16 + Math.sin(t * 17 + seed) * 0.08;

      ctx!.save();
      ctx!.shadowColor = 'rgba(245, 190, 90, 0.85)';
      ctx!.shadowBlur = 7 * flicker;
      ctx!.fillStyle = '#f3c268';
      ctx!.fillRect(x - 3, topY + 16, 7, 9);
      ctx!.fillStyle = '#fff0c0';
      ctx!.fillRect(x - 1, topY + 19, 3, 4 * flicker);
      ctx!.restore();

      ctx!.fillStyle = '#7a5a20';
      ctx!.fillRect(x - 4, topY + 15, 9, 2);
      ctx!.fillRect(x - 4, topY + 25, 9, 2);
    }

    function drawConstellations(t: number) {
      ctx!.strokeStyle = 'rgba(245, 215, 110, 0.22)';
      ctx!.lineWidth = 1;
      for (const points of CONSTELLATIONS) {
        ctx!.beginPath();
        points.forEach((p, i) => (i === 0 ? ctx!.moveTo(p.x, p.y) : ctx!.lineTo(p.x, p.y)));
        ctx!.stroke();
        points.forEach((p, i) => {
          const pulse = reduced ? 1 : 0.55 + 0.45 * Math.sin(t * 1.6 + i * 0.9);
          ctx!.globalAlpha = pulse;
          ctx!.fillStyle = '#f7e6a8';
          ctx!.fillRect(p.x - 1, p.y - 1, 2, 2);
        });
        ctx!.globalAlpha = 1;
      }
    }

    function drawSparks(dt: number, t: number) {
      for (const s of sparks) {
        if (!reduced) {
          s.y -= s.speed * dt;
          s.x += Math.sin(t * 0.8 + s.phase) * 4 * dt;
          if (s.y < 62) {
            s.y = VIRTUAL_H + 4;
            s.x = Math.random() * VIRTUAL_W;
          }
        }
        const alpha = reduced ? 0.5 : 0.25 + 0.55 * Math.abs(Math.sin(t * s.twinkle + s.phase));
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = '#d9c2ff';
        ctx!.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
      }
      ctx!.globalAlpha = 1;
    }

    /** 미래를 비추는 수정구슬 — 받침대 위에서 천천히 맥동한다 */
    function drawCrystalBall(t: number) {
      const pulse = reduced ? 1 : 0.85 + 0.15 * Math.sin(t * 1.5);

      const halo = ctx!.createRadialGradient(BALL_X, BALL_Y, 2, BALL_X, BALL_Y, 46 * pulse);
      halo.addColorStop(0, 'rgba(150, 220, 255, 0.30)');
      halo.addColorStop(0.45, 'rgba(150, 110, 255, 0.16)');
      halo.addColorStop(1, 'rgba(120, 90, 220, 0)');
      ctx!.fillStyle = halo;
      ctx!.beginPath();
      ctx!.arc(BALL_X, BALL_Y, 46 * pulse, 0, Math.PI * 2);
      ctx!.fill();

      // 받침대
      ctx!.fillStyle = '#6b4a1e';
      ctx!.beginPath();
      ctx!.moveTo(BALL_X - 13, VIRTUAL_H - 4);
      ctx!.lineTo(BALL_X + 13, VIRTUAL_H - 4);
      ctx!.lineTo(BALL_X + 7, BALL_Y + 9);
      ctx!.lineTo(BALL_X - 7, BALL_Y + 9);
      ctx!.closePath();
      ctx!.fill();
      ctx!.fillStyle = '#f5d76e';
      ctx!.fillRect(BALL_X - 9, BALL_Y + 8, 18, 2);

      const glass = ctx!.createRadialGradient(
        BALL_X - 4,
        BALL_Y - 5,
        1,
        BALL_X,
        BALL_Y,
        BALL_R
      );
      glass.addColorStop(0, '#eafaff');
      glass.addColorStop(0.35, `rgba(159, 232, 255, ${0.85 * pulse})`);
      glass.addColorStop(1, 'rgba(96, 120, 220, 0.75)');
      ctx!.fillStyle = glass;
      ctx!.beginPath();
      ctx!.arc(BALL_X, BALL_Y, BALL_R, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx!.fillRect(BALL_X - 6, BALL_Y - 7, 3, 2);
    }

    let raf = 0;
    let last = performance.now();
    const start = last;

    function frame(now: number) {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const t = (now - start) / 1000;

      ctx!.clearRect(0, 0, VIRTUAL_W, VIRTUAL_H);
      drawAir();
      drawConstellations(t);
      drawSparks(dt, t);
      drawDrape();
      drawLantern(52, 10, t, 0);
      drawLantern(268, 10, t, 2.1);
      drawCrystalBall(t);

      raf = requestAnimationFrame(frame);
    }

    if (reduced) {
      frame(last);
    } else {
      raf = requestAnimationFrame(frame);
    }

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
