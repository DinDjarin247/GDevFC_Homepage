'use client';

import { useEffect, useRef } from 'react';

type CampfireSceneProps = {
  className?: string;
};

/** 저해상도 가상 캔버스 + CSS 확대로 8비트 느낌을 내고 렌더 비용을 낮춘다 (GateScene과 동일 기법) */
const VIRTUAL_W = 320;
const VIRTUAL_H = 180;
const GROUND_Y = VIRTUAL_H * 0.76;
const FIRE_X = VIRTUAL_W * 0.5;

type Star = { x: number; y: number; baseAlpha: number; twinkleSpeed: number; phase: number };

function makeStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * VIRTUAL_W,
    y: Math.random() * VIRTUAL_H * 0.5,
    baseAlpha: 0.3 + Math.random() * 0.45,
    twinkleSpeed: 0.4 + Math.random() * 1.1,
    phase: Math.random() * Math.PI * 2,
  }));
}

type FigureKind = 'warrior' | 'mage' | 'elf' | 'ogre' | 'rogue';

type Figure = {
  x: number;
  scale: number;
  kind: FigureKind;
  facing: 1 | -1;
  /** 개별 위상 — 다같이 동기화되지 않고 각자 숨쉬듯 움직이도록 */
  phase: number;
  bobSpeed: number;
};

const FIGURES: Figure[] = [
  { x: FIRE_X - 92, scale: 1, kind: 'warrior', facing: 1, phase: 0.3, bobSpeed: 1.1 },
  { x: FIRE_X - 52, scale: 0.86, kind: 'mage', facing: 1, phase: 1.8, bobSpeed: 0.9 },
  { x: FIRE_X + 46, scale: 0.9, kind: 'elf', facing: -1, phase: 3.1, bobSpeed: 1.2 },
  { x: FIRE_X + 96, scale: 1.32, kind: 'ogre', facing: -1, phase: 2.2, bobSpeed: 0.7 },
  { x: FIRE_X + 14, scale: 0.8, kind: 'rogue', facing: -1, phase: 4.4, bobSpeed: 1.0 },
];

const SILHOUETTE = '#141224';

/** 접어 앉은 인물 실루엣의 공통 뼈대. bob(숨쉬기)만큼 상체 전체를 위아래로 살짝 흔든다. */
function drawSeated(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  scale: number,
  bob: number,
  torsoWidthMul = 1
) {
  const legW = 5 * scale;
  const legH = 6 * scale;
  const legGap = 3 * scale;
  const torsoW = 15 * scale * torsoWidthMul;
  const torsoH = 12 * scale;
  const headS = 9 * scale;

  ctx.fillStyle = SILHOUETTE;

  const legsTop = groundY - legH;
  ctx.fillRect(Math.round(x - legGap / 2 - legW), Math.round(legsTop), Math.round(legW), Math.round(legH));
  ctx.fillRect(Math.round(x + legGap / 2), Math.round(legsTop), Math.round(legW), Math.round(legH));

  const torsoBottom = legsTop + 2 * scale - bob;
  const torsoTop = torsoBottom - torsoH;
  ctx.fillRect(Math.round(x - torsoW / 2), Math.round(torsoTop), Math.round(torsoW), Math.round(torsoH));

  const headBottom = torsoTop + 2 * scale;
  const headTop = headBottom - headS;
  ctx.fillRect(Math.round(x - headS / 2), Math.round(headTop), Math.round(headS), Math.round(headS));

  return { headTop, headBottom, torsoTop, torsoBottom, headS, torsoW, legsTop };
}

function drawFigure(ctx: CanvasRenderingContext2D, f: Figure, groundY: number, t: number) {
  const bob = Math.sin(t * f.bobSpeed + f.phase) * 1.4 * f.scale;
  const s = f.scale;
  const side = f.facing; // 1: 몸통 소품이 오른쪽, -1: 왼쪽 (불 쪽을 보도록)

  if (f.kind === 'ogre') {
    const geo = drawSeated(ctx, f.x, groundY, s, bob, 1.35);
    ctx.fillStyle = SILHOUETTE;
    // 작은 뿔/귀 실루엣
    ctx.fillRect(Math.round(f.x - geo.headS / 2 - 2 * s), Math.round(geo.headTop + 1 * s), Math.round(2 * s), Math.round(3 * s));
    ctx.fillRect(Math.round(f.x + geo.headS / 2), Math.round(geo.headTop + 1 * s), Math.round(2 * s), Math.round(3 * s));
    return;
  }

  if (f.kind === 'warrior') {
    const geo = drawSeated(ctx, f.x, groundY, s, bob);
    ctx.fillStyle = SILHOUETTE;
    // 옆에 꽂아둔 검
    const swordX = f.x + side * (geo.torsoW / 2 + 5 * s);
    ctx.fillRect(Math.round(swordX - 1 * s), Math.round(geo.headTop - 6 * s), Math.round(2 * s), Math.round(geo.torsoBottom - geo.headTop + 6 * s));
    ctx.fillRect(Math.round(swordX - 3 * s), Math.round(geo.torsoTop + 4 * s), Math.round(6 * s), Math.round(2 * s));
    // 방패
    ctx.fillRect(
      Math.round(f.x - side * (geo.torsoW / 2 + 7 * s)),
      Math.round(geo.torsoTop + 1 * s),
      Math.round(5 * s),
      Math.round(9 * s)
    );
    return;
  }

  if (f.kind === 'mage') {
    const geo = drawSeated(ctx, f.x, groundY, s, bob);
    ctx.fillStyle = SILHOUETTE;
    // 뾰족한 마법사 모자
    ctx.beginPath();
    ctx.moveTo(f.x - geo.headS / 2 - 1 * s, geo.headTop + 1 * s);
    ctx.lineTo(f.x + geo.headS / 2 + 1 * s, geo.headTop + 1 * s);
    ctx.lineTo(f.x, geo.headTop - 11 * s);
    ctx.closePath();
    ctx.fill();
    // 지팡이 + 은은하게 빛나는 구슬
    const staffX = f.x + side * (geo.torsoW / 2 + 6 * s);
    const staffTop = geo.headTop - 4 * s;
    ctx.fillRect(Math.round(staffX - 1 * s), Math.round(staffTop), Math.round(2 * s), Math.round(geo.torsoBottom - staffTop));
    const glow = 0.5 + 0.5 * Math.sin(t * 2.4 + f.phase);
    ctx.save();
    ctx.shadowColor = 'rgba(140, 200, 255, 0.9)';
    ctx.shadowBlur = 6 * s * (0.6 + glow * 0.6);
    ctx.fillStyle = `rgba(180, 220, 255, ${0.7 + glow * 0.3})`;
    ctx.fillRect(Math.round(staffX - 1.5 * s), Math.round(staffTop - 3 * s), Math.round(3 * s), Math.round(3 * s));
    ctx.restore();
    return;
  }

  if (f.kind === 'elf') {
    const geo = drawSeated(ctx, f.x, groundY, s, bob, 0.9);
    ctx.fillStyle = SILHOUETTE;
    // 뾰족귀
    ctx.beginPath();
    ctx.moveTo(f.x - geo.headS / 2, geo.headTop + 2 * s);
    ctx.lineTo(f.x - geo.headS / 2 - 3 * s, geo.headTop);
    ctx.lineTo(f.x - geo.headS / 2, geo.headTop + 4 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(f.x + geo.headS / 2, geo.headTop + 2 * s);
    ctx.lineTo(f.x + geo.headS / 2 + 3 * s, geo.headTop);
    ctx.lineTo(f.x + geo.headS / 2, geo.headTop + 4 * s);
    ctx.fill();
    // 활
    ctx.strokeStyle = SILHOUETTE;
    ctx.lineWidth = Math.max(1, 1.4 * s);
    ctx.beginPath();
    ctx.arc(f.x + side * (geo.torsoW / 2 + 7 * s), (geo.torsoTop + geo.torsoBottom) / 2, 8 * s, Math.PI * 0.3, Math.PI * 1.7);
    ctx.stroke();
    return;
  }

  // rogue — 후드를 눌러쓴 채 웅크린 실루엣
  const geo = drawSeated(ctx, f.x, groundY, s * 0.94, bob * 0.7, 0.95);
  ctx.fillStyle = SILHOUETTE;
  ctx.beginPath();
  ctx.moveTo(f.x - geo.headS / 2 - 1 * s, geo.headBottom);
  ctx.lineTo(f.x - geo.headS / 2 - 1 * s, geo.headTop + 1 * s);
  ctx.quadraticCurveTo(f.x, geo.headTop - 4 * s, f.x + geo.headS / 2 + 1 * s, geo.headTop + 1 * s);
  ctx.lineTo(f.x + geo.headS / 2 + 1 * s, geo.headBottom);
  ctx.fill();
}

function drawFlameLayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, baseY);
  ctx.quadraticCurveTo(x - w / 2, baseY - h * 0.6, x, baseY - h);
  ctx.quadraticCurveTo(x + w / 2, baseY - h * 0.6, x + w / 2, baseY);
  ctx.closePath();
  ctx.fill();
}

type Ember = { x: number; y: number; vy: number; life: number; maxLife: number };

/** 낮게 떠서 몸을 까딱이는 요정 — 앉은 인물들과 달리 지면에서 떨어져 뜬다 */
function drawFairy(ctx: CanvasRenderingContext2D, x: number, baseY: number, t: number) {
  const bob = Math.sin(t * 2.2) * 3;
  const y = baseY + bob;
  const wingFlap = Math.abs(Math.sin(t * 10));

  ctx.save();
  ctx.shadowColor = 'rgba(150, 255, 190, 0.85)';
  ctx.shadowBlur = 5;

  ctx.fillStyle = 'rgba(150, 255, 190, 0.85)';
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 1 * wingFlap);
  ctx.lineTo(x - 7, y - 3);
  ctx.lineTo(x - 3, y + 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 4, y - 1 * wingFlap);
  ctx.lineTo(x + 7, y - 3);
  ctx.lineTo(x + 3, y + 2);
  ctx.fill();

  ctx.fillStyle = '#1c2a20';
  ctx.fillRect(Math.round(x - 1.5), Math.round(y - 2), 3, 5);
  ctx.restore();
}

function drawMountains(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(30, 26, 54, 0.7)';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(0, GROUND_Y - 30);
  ctx.lineTo(46, GROUND_Y - 58);
  ctx.lineTo(92, GROUND_Y - 26);
  ctx.lineTo(150, GROUND_Y - 50);
  ctx.lineTo(210, GROUND_Y - 20);
  ctx.lineTo(260, GROUND_Y - 46);
  ctx.lineTo(VIRTUAL_W, GROUND_Y - 18);
  ctx.lineTo(VIRTUAL_W, GROUND_Y);
  ctx.closePath();
  ctx.fill();
}

function drawMoon(ctx: CanvasRenderingContext2D) {
  const mx = VIRTUAL_W * 0.84;
  const my = VIRTUAL_H * 0.16;
  ctx.save();
  ctx.shadowColor = 'rgba(232, 230, 200, 0.5)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#eee6c8';
  ctx.beginPath();
  ctx.arc(mx, my, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // 초승달 음영 (배경색으로 일부를 덮어 그믐 느낌을 낸다)
  ctx.fillStyle = '#0c0a1a';
  ctx.beginPath();
  ctx.arc(mx + 4, my - 2, 8, 0, Math.PI * 2);
  ctx.fill();
}

export default function CampfireScene({ className }: CampfireSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = VIRTUAL_W;
    canvas.height = VIRTUAL_H;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stars = makeStars(34);
    const embers: Ember[] = [];
    let emberTimer = 0;

    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, '#0a0916');
    sky.addColorStop(1, '#231a3a');

    function drawSky() {
      ctx!.fillStyle = sky;
      ctx!.fillRect(0, 0, VIRTUAL_W, GROUND_Y + 1);
    }

    function drawStars(t: number) {
      for (const s of stars) {
        const tw = reduced ? 1 : 0.55 + 0.45 * Math.sin(s.phase + t * s.twinkleSpeed);
        ctx!.globalAlpha = Math.min(1, s.baseAlpha * tw);
        ctx!.fillStyle = '#eef2ff';
        ctx!.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
      }
      ctx!.globalAlpha = 1;
    }

    function drawGround() {
      ctx!.fillStyle = '#161326';
      ctx!.fillRect(0, GROUND_Y, VIRTUAL_W, VIRTUAL_H - GROUND_Y);
      ctx!.fillStyle = 'rgba(0,0,0,0.25)';
      ctx!.fillRect(0, GROUND_Y, VIRTUAL_W, 2);
    }

    function drawFireGlow() {
      const glowR = 60;
      const glow = ctx!.createRadialGradient(FIRE_X, GROUND_Y - 12, 4, FIRE_X, GROUND_Y - 12, glowR);
      glow.addColorStop(0, 'rgba(255, 176, 64, 0.32)');
      glow.addColorStop(1, 'rgba(255, 120, 40, 0)');
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.arc(FIRE_X, GROUND_Y - 12, glowR, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawFire(t: number) {
      ctx!.fillStyle = '#3b2415';
      ctx!.fillRect(FIRE_X - 14, GROUND_Y - 3, 28, 4);
      ctx!.fillRect(FIRE_X - 10, GROUND_Y - 6, 20, 3);

      const flicker = reduced ? 1 : 1 + Math.sin(t * 9) * 0.07 + Math.sin(t * 23) * 0.04;
      drawFlameLayer(ctx!, FIRE_X, GROUND_Y - 5, 15 * flicker, 25 * flicker, '#c4331a');
      drawFlameLayer(ctx!, FIRE_X, GROUND_Y - 6, 11 * flicker, 19 * flicker, '#ff8a2b');
      drawFlameLayer(ctx!, FIRE_X, GROUND_Y - 7, 6 * flicker, 12 * flicker, '#ffe066');
    }

    function drawEmbers(dt: number) {
      emberTimer += dt;
      if (!reduced && emberTimer > 0.35) {
        emberTimer = 0;
        embers.push({
          x: FIRE_X + (Math.random() - 0.5) * 10,
          y: GROUND_Y - 14,
          vy: -8 - Math.random() * 6,
          life: 0,
          maxLife: 1.4 + Math.random() * 0.8,
        });
      }
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life += dt;
        e.y += e.vy * dt;
        e.x += Math.sin(e.life * 6) * 4 * dt;
        if (e.life >= e.maxLife) {
          embers.splice(i, 1);
          continue;
        }
        const fade = 1 - e.life / e.maxLife;
        ctx!.globalAlpha = fade;
        ctx!.fillStyle = '#ffb04a';
        ctx!.fillRect(Math.round(e.x), Math.round(e.y), 1, 1);
      }
      ctx!.globalAlpha = 1;
    }

    let raf = 0;
    let last = performance.now();
    const start = last;

    function frame(now: number) {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const t = (now - start) / 1000;

      ctx!.clearRect(0, 0, VIRTUAL_W, VIRTUAL_H);
      drawSky();
      drawStars(t);
      drawMoon(ctx!);
      drawMountains(ctx!);
      drawGround();
      drawFireGlow();
      for (const f of FIGURES) drawFigure(ctx!, f, GROUND_Y, t);
      drawFairy(ctx!, FIRE_X + 26, GROUND_Y - 34, t);
      drawFire(t);
      drawEmbers(dt);

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
