'use client';

import { useEffect, useRef } from 'react';

type TentSceneProps = {
  className?: string;
};

/**
 * 점성술사의 천막 배경.
 *
 * 홈의 GateScene / 게시판의 CampfireScene 은 저해상도 고정 비트맵을 CSS 로 늘리지만,
 * 이 화면은 카드 목록이 길어질수록 패널이 세로로 훨씬 길어져서 같은 방식을 쓰면
 * 원이 세로 타원으로 찌그러진다. 그래서 여기서는 컨테이너 크기에 맞춰 가상 캔버스를
 * 다시 잡고(픽셀 1칸 = PIXEL CSS px), 천막은 위쪽 · 수정구슬은 아래쪽에 고정하는
 * 앵커 방식으로 그린다. 가로세로 배율이 같으므로 구슬은 항상 정원으로 유지된다.
 */
const PIXEL = 4;
const MIN_V = 80;
const MAX_VW = 700;
const MAX_VH = 1200;

/** 천막 천이 끝나는 높이 (가상 픽셀, 위에서부터 고정) */
const DRAPE_Y = 64;
const BALL_R = 13;
/** 수정구슬 중심이 바닥에서 떨어진 거리 */
const BALL_BOTTOM_GAP = 30;

type Spark = {
  x: number;
  y: number;
  speed: number;
  phase: number;
  twinkle: number;
  size: number;
};

/** 좌/우 별자리 — 가로는 캔버스 폭 비율, 세로는 천막 아래 고정 오프셋으로 배치한다 */
const CONSTELLATIONS: { fx: number; dy: number }[][] = [
  [
    { fx: 0.11, dy: 28 },
    { fx: 0.15, dy: 22 },
    { fx: 0.19, dy: 28 },
    { fx: 0.23, dy: 40 },
    { fx: 0.19, dy: 46 },
  ],
  [
    { fx: 0.79, dy: 24 },
    { fx: 0.84, dy: 36 },
    { fx: 0.89, dy: 28 },
    { fx: 0.85, dy: 14 },
  ],
];

export default function TentScene({ className }: TentSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx2d = canvasEl.getContext('2d');
    if (!ctx2d) return;
    const ctx: CanvasRenderingContext2D = ctx2d;
    const canvas: HTMLCanvasElement = canvasEl;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let vw = 320;
    let vh = 180;
    let sparks: Spark[] = [];
    let air: CanvasGradient | null = null;

    function makeSparks() {
      const count = Math.max(18, Math.round((vw * vh) / 1900));
      sparks = Array.from({ length: count }, () => ({
        x: Math.random() * vw,
        y: DRAPE_Y + Math.random() * Math.max(1, vh - DRAPE_Y),
        speed: 3 + Math.random() * 7,
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.8 + Math.random() * 1.8,
        size: Math.random() < 0.25 ? 2 : 1,
      }));
    }

    function resize() {
      const box = canvas.parentElement;
      const width = box?.clientWidth ?? 0;
      const height = box?.clientHeight ?? 0;
      if (width === 0 || height === 0) return;

      const nextW = Math.min(MAX_VW, Math.max(MIN_V, Math.round(width / PIXEL)));
      const nextH = Math.min(MAX_VH, Math.max(MIN_V, Math.round(height / PIXEL)));
      if (nextW === vw && nextH === vh && air) return;

      vw = nextW;
      vh = nextH;
      canvas.width = vw;
      canvas.height = vh;

      air = ctx.createLinearGradient(0, 0, 0, vh);
      air.addColorStop(0, '#140c28');
      air.addColorStop(0.55, '#1d1038');
      air.addColorStop(1, '#2a1546');

      makeSparks();
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    function drawAir() {
      if (!air) return;
      ctx.fillStyle = air;
      ctx.fillRect(0, 0, vw, vh);
    }

    /** 꼭대기에서 부채꼴로 펼쳐지는 천막 천 — 밝고 어두운 폭을 번갈아 칠한다 */
    function drawDrape() {
      const apexX = vw / 2;
      const apexY = 4;
      const panels = 10;
      const spread = vw + 80;
      for (let i = 0; i < panels; i++) {
        const x0 = -40 + (spread / panels) * i;
        const x1 = -40 + (spread / panels) * (i + 1);
        ctx.fillStyle = i % 2 === 0 ? '#3a2568' : '#301e57';
        ctx.beginPath();
        ctx.moveTo(apexX, apexY);
        ctx.lineTo(x0, DRAPE_Y);
        ctx.lineTo(x1, DRAPE_Y);
        ctx.closePath();
        ctx.fill();
      }

      // 천 끝단 — 물결치는 술 장식
      ctx.fillStyle = '#23153f';
      const scallop = 16;
      for (let x = -8; x < vw + scallop; x += scallop) {
        ctx.beginPath();
        ctx.moveTo(x, DRAPE_Y - 1);
        ctx.lineTo(x + scallop, DRAPE_Y - 1);
        ctx.lineTo(x + scallop / 2, DRAPE_Y + 9);
        ctx.closePath();
        ctx.fill();
      }

      // 꼭대기 금장식
      ctx.fillStyle = '#f5d76e';
      ctx.fillRect(apexX - 2, apexY - 3, 4, 7);
      ctx.fillRect(apexX - 4, apexY + 3, 8, 2);
    }

    function drawLantern(x: number, topY: number, t: number, seed: number) {
      ctx.fillStyle = '#2b1f4d';
      ctx.fillRect(x, topY, 1, 16);

      const flicker = reduced ? 1 : 1 + Math.sin(t * 7 + seed) * 0.16 + Math.sin(t * 17 + seed) * 0.08;

      ctx.save();
      ctx.shadowColor = 'rgba(245, 190, 90, 0.85)';
      ctx.shadowBlur = 7 * flicker;
      ctx.fillStyle = '#f3c268';
      ctx.fillRect(x - 3, topY + 16, 7, 9);
      ctx.fillStyle = '#fff0c0';
      ctx.fillRect(x - 1, topY + 19, 3, 4 * flicker);
      ctx.restore();

      ctx.fillStyle = '#7a5a20';
      ctx.fillRect(x - 4, topY + 15, 9, 2);
      ctx.fillRect(x - 4, topY + 25, 9, 2);
    }

    function drawConstellations(t: number) {
      ctx.strokeStyle = 'rgba(245, 215, 110, 0.22)';
      ctx.lineWidth = 1;
      for (const points of CONSTELLATIONS) {
        const resolved = points.map((p) => ({ x: p.fx * vw, y: DRAPE_Y + p.dy }));
        ctx.beginPath();
        resolved.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
        resolved.forEach((p, i) => {
          const pulse = reduced ? 1 : 0.55 + 0.45 * Math.sin(t * 1.6 + i * 0.9);
          ctx.globalAlpha = pulse;
          ctx.fillStyle = '#f7e6a8';
          ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
        });
        ctx.globalAlpha = 1;
      }
    }

    function drawSparks(dt: number, t: number) {
      for (const s of sparks) {
        if (!reduced) {
          s.y -= s.speed * dt;
          s.x += Math.sin(t * 0.8 + s.phase) * 4 * dt;
          if (s.y < DRAPE_Y - 2) {
            s.y = vh + 4;
            s.x = Math.random() * vw;
          }
        }
        const alpha = reduced ? 0.5 : 0.25 + 0.55 * Math.abs(Math.sin(t * s.twinkle + s.phase));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#d9c2ff';
        ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
      }
      ctx.globalAlpha = 1;
    }

    /** 미래를 비추는 수정구슬 — 바닥 중앙 받침대 위에서 천천히 맥동한다 */
    function drawCrystalBall(t: number) {
      const cx = vw / 2;
      const cy = vh - BALL_BOTTOM_GAP;
      const pulse = reduced ? 1 : 0.85 + 0.15 * Math.sin(t * 1.5);

      const halo = ctx.createRadialGradient(cx, cy, 2, cx, cy, 46 * pulse);
      halo.addColorStop(0, 'rgba(150, 220, 255, 0.30)');
      halo.addColorStop(0.45, 'rgba(150, 110, 255, 0.16)');
      halo.addColorStop(1, 'rgba(120, 90, 220, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, 46 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // 받침대
      ctx.fillStyle = '#6b4a1e';
      ctx.beginPath();
      ctx.moveTo(cx - 13, vh - 4);
      ctx.lineTo(cx + 13, vh - 4);
      ctx.lineTo(cx + 7, cy + 9);
      ctx.lineTo(cx - 7, cy + 9);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f5d76e';
      ctx.fillRect(cx - 9, cy + 8, 18, 2);

      const glass = ctx.createRadialGradient(cx - 4, cy - 5, 1, cx, cy, BALL_R);
      glass.addColorStop(0, '#eafaff');
      glass.addColorStop(0.35, `rgba(159, 232, 255, ${0.85 * pulse})`);
      glass.addColorStop(1, 'rgba(96, 120, 220, 0.75)');
      ctx.fillStyle = glass;
      ctx.beginPath();
      ctx.arc(cx, cy, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(cx - 6, cy - 7, 3, 2);
    }

    let raf = 0;
    let last = performance.now();
    const start = last;

    function frame(now: number) {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const t = (now - start) / 1000;

      ctx.clearRect(0, 0, vw, vh);
      drawAir();
      drawConstellations(t);
      drawSparks(dt, t);
      drawDrape();
      drawLantern(Math.round(vw * 0.16), 10, t, 0);
      drawLantern(Math.round(vw * 0.84), 10, t, 2.1);
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
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
