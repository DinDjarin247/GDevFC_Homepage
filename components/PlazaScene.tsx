'use client';

import { useEffect, useRef } from 'react';
import {
  GROUND_SHIFT,
  HORIZON_Y,
  PLAZA_FLOOR,
  PLAZA_H,
  PLAZA_W,
  STATUE,
  phaseForHour,
  type DayPhase,
} from '@/lib/plazaLayout';

/** 지면 레이어의 바닥 — 장면 좌표에서 캔버스 맨 아래에 해당하는 y */
const GROUND_BOTTOM = PLAZA_H - GROUND_SHIFT;
/** 하늘이 차지하는 높이 (장면의 지평선 118 + 내려 그린 만큼) */
const SKY_BOTTOM = 118 + GROUND_SHIFT;

type PlazaSceneProps = {
  className?: string;
  /** 접속 기기의 현지 시각 기준 시간대. 생략하면 마운트 시점에 계산한다 */
  phase?: DayPhase;
};

/**
 * SELECT MODE 배경 — 중세 판타지 마을의 광장.
 *
 * 고정 480x216 가상 캔버스에 그리고, 부모(.stage)가 같은 비율을 유지하므로 가로세로
 * 배율이 같다(= 원이 찌그러지지 않는다). 캐릭터는 이 위에 DOM 으로 얹히고, 좌표는
 * lib/plazaLayout.ts 를 함께 본다.
 *
 * 시간대(새벽/아침/점심/오후/저녁/심야)에 따라 하늘·햇빛·등불이 바뀐다. 소품은 항상
 * 같은 색으로 그린 뒤, 마지막에 화면 전체에 한 겹 빛을 덮어 시간대를 만든다.
 * 계절은 가을 고정.
 */

type Ambient = {
  /** 하늘 그라데이션 (위 → 아래) */
  sky: string[];
  /** 먼 산 / 먼 지붕 */
  far: string;
  near: string;
  /** 바닥 밝기 보정 */
  groundTint: string;
  /** 전체를 덮는 빛 한 겹 */
  wash: { color: string; alpha: number; mode: GlobalCompositeOperation };
  /** 별 밝기 (0 이면 안 보임) */
  stars: number;
  /** 등불 · 창문 불빛 세기 */
  lamps: number;
  /** 해(또는 달)의 위치와 색 */
  orb: { x: number; y: number; r: number; color: string; glow: string; crescent: boolean } | null;
};

const AMBIENTS: Record<DayPhase, Ambient> = {
  dawn: {
    sky: ['#2a2450', '#5b4272', '#a86a7a', '#e9a171'],
    far: '#3b3358',
    near: '#463b60',
    groundTint: 'rgba(120, 100, 160, 0.20)',
    wash: { color: '#6a5aa8', alpha: 0.24, mode: 'multiply' },
    stars: 0.35,
    lamps: 0.75,
    orb: { x: 392, y: 78, r: 9, color: '#ffd9a8', glow: 'rgba(255, 190, 140, 0.45)', crescent: false },
  },
  morning: {
    sky: ['#4e8fd0', '#86b9e4', '#bcd9ef', '#e8e3cf'],
    far: '#6a7f9e',
    near: '#6f7d84',
    groundTint: 'rgba(255, 240, 200, 0.10)',
    wash: { color: '#fff3d0', alpha: 0.12, mode: 'screen' },
    stars: 0,
    lamps: 0,
    orb: { x: 404, y: 62, r: 11, color: '#fff4c8', glow: 'rgba(255, 240, 170, 0.5)', crescent: false },
  },
  noon: {
    sky: ['#2f7ec8', '#63a6dd', '#a4cdec', '#dbe7ea'],
    far: '#61789a',
    near: '#5f7480',
    groundTint: 'rgba(255, 250, 225, 0.14)',
    wash: { color: '#ffffff', alpha: 0.06, mode: 'screen' },
    stars: 0,
    lamps: 0,
    orb: { x: 250, y: 30, r: 12, color: '#fffdf0', glow: 'rgba(255, 252, 210, 0.55)', crescent: false },
  },
  afternoon: {
    sky: ['#3f74b8', '#7ea3cf', '#d3bd9a', '#f0cd9a'],
    far: '#6d7392',
    near: '#6d6b76',
    groundTint: 'rgba(255, 215, 150, 0.16)',
    wash: { color: '#ffc27a', alpha: 0.16, mode: 'overlay' },
    stars: 0,
    lamps: 0.15,
    orb: { x: 108, y: 54, r: 11, color: '#fff0b8', glow: 'rgba(255, 210, 130, 0.5)', crescent: false },
  },
  evening: {
    sky: ['#2b2450', '#5d3a63', '#b05a52', '#e58a4e'],
    far: '#463a5e',
    near: '#4a3c52',
    groundTint: 'rgba(200, 120, 80, 0.16)',
    wash: { color: '#ff8a46', alpha: 0.16, mode: 'overlay' },
    stars: 0.3,
    lamps: 0.85,
    orb: { x: 84, y: 82, r: 11, color: '#ffbb70', glow: 'rgba(255, 150, 90, 0.55)', crescent: false },
  },
  night: {
    sky: ['#0d0f28', '#161a3c', '#27274f', '#3a3059'],
    far: '#20223f',
    near: '#262742',
    groundTint: 'rgba(60, 70, 130, 0.22)',
    wash: { color: '#2a3170', alpha: 0.5, mode: 'multiply' },
    stars: 1,
    lamps: 1,
    orb: { x: 396, y: 42, r: 10, color: '#ffeec2', glow: 'rgba(255, 236, 190, 0.5)', crescent: true },
  },
};

const LEAF_TONES = ['#e0863a', '#c2622f', '#d9a43c', '#a8452a'];

/** 주인공 스프라이트 대비 마을 사람 크기 — 조금 뒤에 있는 정도로만 작게 */
const NPC_SCALE = 1.62;

/** 광장을 오가는 마을 사람들 — 옷 색만 다른 작은 실루엣 */
type Npc = {
  x: number;
  y: number;
  /** 왕복 구간 (없으면 제자리) */
  from?: number;
  to?: number;
  speed: number;
  dir: 1 | -1;
  coat: string;
  head: string;
  hair: string;
  phase: number;
  scale: number;
  /** 제자리에서 수다 떠는 사람은 몸만 까딱인다 */
  chatter?: boolean;
  /**
   * back = 좌판보다 먼저 그려서 상판이 하반신을 가린다(= 좌판 안쪽 상인).
   * front = 좌판보다 나중에 그려서 광장을 걸어다니는 사람으로 보인다.
   */
  layer: 'back' | 'front';
};

/**
 * 좌판 상판은 y 140~152 에 있다. 좌판 안쪽 상인은 발끝을 상판보다 위(작은 y)에 두고
 * back 으로, 광장을 지나다니는 사람은 상판보다 아래(큰 y)에 두고 front 로 그린다.
 * 그래야 상인은 좌판 뒤에 서 있고 행인은 좌판 앞을 지나가는 것처럼 보인다.
 */
const NPCS: Npc[] = [
  // 좌판 상인 둘 — 상판이 하반신을 가린다
  { x: 176, y: 152, speed: 0, dir: 1, coat: '#8a7a4a', head: '#f0c49a', hair: '#5a4a2a', phase: 2.1, scale: 0.9, chatter: true, layer: 'back' },
  { x: 290, y: 148, speed: 0, dir: -1, coat: '#8a6a2e', head: '#e8c49a', hair: '#4a3420', phase: 2.8, scale: 0.9, chatter: true, layer: 'back' },

  // 광장을 지나다니는 사람들 — 뒤쪽은 작게, 앞쪽은 크게 두어 깊이를 만든다
  // 동상 받침대(x 211~269, y 165~195)를 통과하지 않도록 좌/우 통행로를 나눠 뒀다
  { x: 168, y: 174, from: 148, to: 204, speed: 9, dir: 1, coat: '#7b5a3a', head: '#e8c49a', hair: '#3a2a1c', phase: 0.2, scale: 0.94, layer: 'front' },
  { x: 302, y: 168, from: 278, to: 322, speed: 7, dir: -1, coat: '#4d5f7a', head: '#f0c49a', hair: '#5a3a22', phase: 1.1, scale: 0.9, layer: 'front' },
  { x: 180, y: 200, from: 146, to: 210, speed: 15, dir: 1, coat: '#a85a3c', head: '#f0c49a', hair: '#7a4a1e', phase: 2.3, scale: 0.78, layer: 'front' },
  { x: 100, y: 178, speed: 0, dir: 1, coat: '#6a4a6e', head: '#e8c49a', hair: '#2e2119', phase: 0.7, scale: 0.96, chatter: true, layer: 'front' },
  { x: 114, y: 178, speed: 0, dir: -1, coat: '#57703f', head: '#f0c49a', hair: '#6b4a2a', phase: 1.9, scale: 0.96, chatter: true, layer: 'front' },
  { x: 286, y: 194, speed: 0, dir: 1, coat: '#3f6a5a', head: '#e8c49a', hair: '#4a3420', phase: 1.6, scale: 1, chatter: true, layer: 'front' },
  { x: 301, y: 194, speed: 0, dir: -1, coat: '#7a4552', head: '#f0c49a', hair: '#2b1f18', phase: 3.3, scale: 1, chatter: true, layer: 'front' },
  { x: 146, y: 214, speed: 0, dir: 1, coat: '#5a5a62', head: '#e8c49a', hair: '#8a8078', phase: 1.4, scale: 1.04, chatter: true, layer: 'front' },
  { x: 198, y: 160, speed: 0, dir: -1, coat: '#4a4f6a', head: '#f0c49a', hair: '#33291f', phase: 0.5, scale: 0.88, chatter: true, layer: 'front' },
  { x: 84, y: 186, from: 60, to: 114, speed: 6, dir: 1, coat: '#6a5a7a', head: '#e8c49a', hair: '#3a2a1c', phase: 0.9, scale: 0.94, layer: 'front' },
  { x: 330, y: 220, from: 300, to: 380, speed: 8, dir: -1, coat: '#7a6a4a', head: '#f0c49a', hair: '#4a3420', phase: 2.6, scale: 1.08, layer: 'front' },
];

export default function PlazaScene({ className, phase }: PlazaSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx2d = canvasEl.getContext('2d');
    if (!ctx2d) return;
    const ctx: CanvasRenderingContext2D = ctx2d;
    const canvas: HTMLCanvasElement = canvasEl;

    canvas.width = PLAZA_W;
    canvas.height = PLAZA_H;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const active: DayPhase = phase ?? phaseForHour(new Date().getHours());
    const amb = AMBIENTS[active];

    const leaves = Array.from({ length: 24 }, () => ({
      x: Math.random() * PLAZA_W,
      y: Math.random() * PLAZA_H,
      vy: 5 + Math.random() * 9,
      drift: 6 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
      tone: Math.floor(Math.random() * LEAF_TONES.length),
      size: Math.random() < 0.3 ? 2 : 1,
    }));

    const stars = Array.from({ length: 56 }, () => ({
      x: Math.random() * PLAZA_W,
      y: Math.random() * (SKY_BOTTOM - 30),
      a: 0.25 + Math.random() * 0.5,
      tw: 0.5 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
    }));

    const npcs = NPCS.map((n) => ({ ...n }));

    const sky = ctx.createLinearGradient(0, 0, 0, SKY_BOTTOM);
    amb.sky.forEach((color, i) => sky.addColorStop(i / (amb.sky.length - 1), color));

    // ---------- 하늘 ----------

    function drawSky(t: number) {
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, PLAZA_W, SKY_BOTTOM);

      if (amb.stars > 0) {
        for (const s of stars) {
          const tw = reduced ? 1 : 0.5 + 0.5 * Math.sin(t * s.tw + s.phase);
          ctx.globalAlpha = s.a * tw * amb.stars * (1 - s.y / (SKY_BOTTOM + 12));
          ctx.fillStyle = '#f2ecff';
          ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
        }
        ctx.globalAlpha = 1;
      }

      if (!amb.orb) return;
      const { x, y, r, color, glow, crescent } = amb.orb;
      ctx.save();
      ctx.shadowColor = glow;
      ctx.shadowBlur = 12;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (crescent) {
        ctx.fillStyle = amb.sky[0];
        ctx.beginPath();
        ctx.arc(x - 5, y - 4, r * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /** 멀리 보이는 성채와 마을 지붕 — 광장이 "마을 안"임을 알려주는 배경 */
    function drawSkyline() {
      ctx.fillStyle = amb.far;
      // 성채
      ctx.fillRect(28, 62, 26, 46);
      ctx.fillRect(22, 70, 6, 38);
      ctx.fillRect(54, 70, 6, 38);
      ctx.beginPath();
      ctx.moveTo(26, 62);
      ctx.lineTo(41, 44);
      ctx.lineTo(56, 62);
      ctx.closePath();
      ctx.fill();
      // 먼 지붕들
      const roofs: [number, number, number, number][] = [
        [96, 84, 34, 24],
        [136, 78, 28, 30],
        [300, 82, 30, 26],
        [340, 74, 36, 34],
        [392, 84, 30, 24],
        [432, 78, 34, 30],
      ];
      for (const [x, y, w, h] of roofs) {
        ctx.fillStyle = amb.far;
        ctx.fillRect(x, y + 8, w, h);
        ctx.beginPath();
        ctx.moveTo(x - 3, y + 9);
        ctx.lineTo(x + w / 2, y);
        ctx.lineTo(x + w + 3, y + 9);
        ctx.closePath();
        ctx.fill();
      }
      // 마을 능선
      ctx.fillStyle = amb.near;
      ctx.beginPath();
      ctx.moveTo(0, 118);
      ctx.lineTo(0, 104);
      ctx.lineTo(70, 96);
      ctx.lineTo(180, 106);
      ctx.lineTo(300, 98);
      ctx.lineTo(400, 107);
      ctx.lineTo(PLAZA_W, 100);
      ctx.lineTo(PLAZA_W, 118);
      ctx.closePath();
      ctx.fill();
    }

    // ---------- 마을 건물 ----------

    /**
     * 하프팀버(흰 벽 + 나무 기둥) 집 한 채.
     *
     * 예전엔 벽 사각형 + 삼각 지붕만 그려서 완전 정면(0°)이었고, 21° 로 열린 광장
     * 바닥과 각도가 어긋나 "바닥에 세운 판때기"처럼 보였다. 지금은 바닥과 같은
     * 각도로 지붕 윗면과 측벽을 함께 그려 상자(3/4 볼륨)로 읽히게 한다.
     * depth 는 옆으로 밀려 보이는 안쪽 깊이 — 왼쪽 건물은 오른쪽 면이,
     * 오른쪽 건물은 왼쪽 면이 보이도록 side 로 방향을 정한다.
     */
    function house(
      x: number,
      y: number,
      w: number,
      h: number,
      roof: string,
      wall: string,
      opts: {
        windows?: number;
        door?: boolean;
        chimney?: boolean;
        sign?: string;
        depth?: number;
        side?: 'left' | 'right';
      } = {}
    ) {
      const roofH = Math.round(h * 0.42);
      const depth = opts.depth ?? 12;
      // 광장 중심에서 먼 쪽 면이 보인다
      const side = opts.side ?? (x + w / 2 < PLAZA_FLOOR.cx ? 'right' : 'left');
      const dx = side === 'right' ? depth : -depth;
      // 21° 카메라 → 안쪽으로 밀릴수록 위로 올라간다
      const dy = -Math.round(depth * 0.42);

      const shade = (hex: string, f: number) => {
        const n = parseInt(hex.slice(1), 16);
        const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) * f)));
        const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) * f)));
        const b = Math.max(0, Math.min(255, Math.round((n & 255) * f)));
        return `rgb(${r}, ${g}, ${b})`;
      };

      // 측벽 (안쪽으로 물러난 면)
      ctx.fillStyle = shade(wall, 0.66);
      ctx.beginPath();
      ctx.moveTo(side === 'right' ? x + w : x, y + roofH);
      ctx.lineTo(side === 'right' ? x + w + dx : x + dx, y + roofH + dy);
      ctx.lineTo(side === 'right' ? x + w + dx : x + dx, y + h + dy);
      ctx.lineTo(side === 'right' ? x + w : x, y + h);
      ctx.closePath();
      ctx.fill();

      // 벽
      ctx.fillStyle = wall;
      ctx.fillRect(x, y + roofH, w, h - roofH);
      // 기둥(하프팀버)
      ctx.fillStyle = '#4e3524';
      ctx.fillRect(x, y + roofH, 2, h - roofH);
      ctx.fillRect(x + w - 2, y + roofH, 2, h - roofH);
      ctx.fillRect(x, y + roofH + Math.round((h - roofH) * 0.55), w, 2);
      for (let bx = x + 8; bx < x + w - 6; bx += 12) {
        ctx.fillRect(bx, y + roofH, 1, h - roofH);
      }

      // 지붕 — 앞면(박공) + 뒤로 물러난 윗면
      const ridgeX = x + w / 2;
      ctx.fillStyle = shade(roof, 0.72);
      ctx.beginPath();
      ctx.moveTo(x - 4, y + roofH + 2);
      ctx.lineTo(ridgeX, y);
      ctx.lineTo(ridgeX + dx, y + dy);
      ctx.lineTo(x - 4 + dx, y + roofH + 2 + dy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = shade(roof, 0.86);
      ctx.beginPath();
      ctx.moveTo(x + w + 4, y + roofH + 2);
      ctx.lineTo(ridgeX, y);
      ctx.lineTo(ridgeX + dx, y + dy);
      ctx.lineTo(x + w + 4 + dx, y + roofH + 2 + dy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = roof;
      ctx.beginPath();
      ctx.moveTo(x - 4, y + roofH + 2);
      ctx.lineTo(x + w / 2, y);
      ctx.lineTo(x + w + 4, y + roofH + 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(x - 4, y + roofH, w + 8, 3);

      // 창문 — 시간대에 따라 불이 켜진다
      const lit = amb.lamps;
      const winCount = opts.windows ?? 2;
      for (let i = 0; i < winCount; i++) {
        const wx = x + 7 + i * Math.max(12, (w - 16) / Math.max(1, winCount - 1 || 1));
        const wy = y + roofH + 6;
        if (wx + 7 > x + w - 3) break;
        ctx.fillStyle = lit > 0.3 ? `rgba(255, 206, 122, ${0.55 + lit * 0.45})` : '#3f4a5a';
        ctx.fillRect(wx, wy, 7, 7);
        ctx.fillStyle = '#4e3524';
        ctx.fillRect(wx + 3, wy, 1, 7);
        ctx.fillRect(wx, wy + 3, 7, 1);
      }
      if (opts.door) {
        ctx.fillStyle = '#4a3220';
        ctx.fillRect(x + Math.round(w / 2) - 5, y + h - 14, 10, 14);
        ctx.fillStyle = '#d9a43c';
        ctx.fillRect(x + Math.round(w / 2) + 2, y + h - 8, 1, 1);
      }
      if (opts.chimney) {
        ctx.fillStyle = '#6b5142';
        ctx.fillRect(x + w - 14, y - 6, 7, 14);
      }
      if (opts.sign) {
        ctx.fillStyle = '#4e3524';
        ctx.fillRect(x + w - 6, y + roofH + 4, 12, 2);
        ctx.fillStyle = opts.sign;
        ctx.fillRect(x + w + 1, y + roofH + 6, 12, 9);
        ctx.fillStyle = '#2b1d12';
        ctx.fillRect(x + w + 3, y + roofH + 9, 8, 1);
        ctx.fillRect(x + w + 3, y + roofH + 12, 5, 1);
      }
    }

    function drawVillage(t: number) {
      // 뒷줄 — 앞줄에 가려지는 집들. 높이를 엇갈리게 두고 사이에 골목 틈을 남긴다
      house(30, 52, 40, 64, '#5d3a4a', '#9d8f78', { windows: 2, depth: 9 });
      house(150, 44, 46, 72, '#4f3a63', '#a89a80', { windows: 2, depth: 9, chimney: true });
      house(300, 48, 42, 68, '#5d3a4a', '#9d8f78', { windows: 2, depth: 9 });
      house(408, 46, 44, 70, '#4f3a63', '#a89a80', { windows: 2, depth: 9, side: 'left' });

      // 왼쪽 집들 — 사람 키의 3배 넘게 키워 마을다운 위압감을 준다
      house(2, 40, 56, 76, '#7a3b2e', '#c9b79a', {
        windows: 2,
        door: true,
        chimney: true,
        depth: 14,
      });
      house(60, 56, 46, 60, '#6a4a7a', '#bfae92', { windows: 2, depth: 12 });

      // 선술집 (우왕이 자리)
      house(108, 34, 78, 82, '#8a4a2c', '#d2c0a0', {
        windows: 3,
        door: true,
        chimney: true,
        sign: '#d9a43c',
        depth: 16,
      });

      // 시계탑 · 마을회관 (중앙) — 광장의 랜드마크라 가장 높게
      ctx.fillStyle = '#9e9078';
      ctx.beginPath();
      ctx.moveTo(252, 40);
      ctx.lineTo(262, 34);
      ctx.lineTo(262, 110);
      ctx.lineTo(252, 116);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#b9a98c';
      ctx.fillRect(206, 40, 46, 76);
      ctx.fillStyle = '#4e3524';
      ctx.fillRect(206, 40, 2, 76);
      ctx.fillRect(250, 40, 2, 76);
      ctx.fillRect(206, 84, 46, 2);
      ctx.fillStyle = '#54403a';
      ctx.beginPath();
      ctx.moveTo(229, 12);
      ctx.lineTo(262, 34);
      ctx.lineTo(258, 42);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#6a4a3a';
      ctx.beginPath();
      ctx.moveTo(200, 42);
      ctx.lineTo(229, 12);
      ctx.lineTo(258, 42);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d9a43c';
      ctx.fillRect(228, 4, 2, 9);
      ctx.fillRect(230, 4, 8, 5);
      // 시계
      ctx.fillStyle = '#efe4c8';
      ctx.beginPath();
      ctx.arc(229, 70, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4e3524';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(229, 70, 10, 0, Math.PI * 2);
      ctx.stroke();
      // 시침 — 실제 시각을 가리킨다
      const now = new Date();
      const hourAngle = ((now.getHours() % 12) + now.getMinutes() / 60) * (Math.PI / 6) - Math.PI / 2;
      const minAngle = now.getMinutes() * (Math.PI / 30) - Math.PI / 2;
      ctx.strokeStyle = '#2b1d12';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(229, 70);
      ctx.lineTo(229 + Math.cos(hourAngle) * 5, 70 + Math.sin(hourAngle) * 5);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(229, 70);
      ctx.lineTo(229 + Math.cos(minAngle) * 8, 70 + Math.sin(minAngle) * 8);
      ctx.stroke();
      // 문
      ctx.fillStyle = '#4a3220';
      ctx.fillRect(222, 100, 14, 16);
      ctx.fillStyle = '#d9a43c';
      ctx.fillRect(233, 108, 1, 2);

      // 오른쪽 상점들
      house(266, 52, 50, 64, '#7a3b2e', '#c9b79a', { windows: 2, sign: '#7a4fa0', depth: 13, side: 'left' });
      house(322, 38, 56, 78, '#6a4a7a', '#d2c0a0', {
        windows: 2,
        door: true,
        chimney: true,
        depth: 15,
        side: 'left',
      });
      house(384, 54, 50, 62, '#8a4a2c', '#c9b79a', { windows: 2, depth: 13, side: 'left' });

      // 오른쪽 담벼락 (과녁장 배경)
      ctx.fillStyle = '#7d6a52';
      ctx.fillRect(430, 106, 50, 26);
      ctx.fillStyle = '#8b7a5e';
      ctx.fillRect(430, 104, 50, 3);
      ctx.fillStyle = '#6a5a44';
      for (let x = 430; x < 480; x += 10) ctx.fillRect(x, 107, 1, 25);
      ctx.fillRect(430, 116, 50, 1);

      // 굴뚝 연기
      if (!reduced) {
        for (const [sx, sy] of [
          [47, 32],
          [175, 26],
          [367, 30],
          [185, 36],
        ]) {
          for (let i = 0; i < 3; i++) {
            const p = (t * 0.28 + i / 3) % 1;
            ctx.globalAlpha = 0.24 * (1 - p);
            ctx.fillStyle = '#d8d2c8';
            ctx.fillRect(Math.round(sx + Math.sin((p + i) * 4) * 4), Math.round(sy - p * 26), 2, 2);
          }
        }
        ctx.globalAlpha = 1;
      }

      // 건물 사이 만국기 — 왁자지껄한 장터 느낌
      const bunting: [number, number, number, number][] = [
        [56, 64, 108, 48],
        [186, 48, 206, 46],
        [252, 46, 268, 60],
        [316, 58, 324, 46],
        [378, 50, 430, 62],
      ];
      const flagColors = ['#d94f4f', '#d9a43c', '#5aa9d9', '#7ac05a', '#b06ad9'];
      for (const [x1, y1, x2, y2] of bunting) {
        ctx.strokeStyle = 'rgba(60, 46, 34, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo((x1 + x2) / 2, Math.max(y1, y2) + 8, x2, y2);
        ctx.stroke();
        const count = Math.max(3, Math.round((x2 - x1) / 12));
        for (let i = 1; i < count; i++) {
          const p = i / count;
          const fx = x1 + (x2 - x1) * p;
          const fy =
            (1 - p) * (1 - p) * y1 + 2 * (1 - p) * p * (Math.max(y1, y2) + 8) + p * p * y2;
          ctx.fillStyle = flagColors[i % flagColors.length];
          ctx.beginPath();
          ctx.moveTo(fx - 2.5, fy);
          ctx.lineTo(fx + 2.5, fy);
          ctx.lineTo(fx, fy + 5);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // ---------- 광장 바닥 ----------

    /**
     * 광장 바닥은 매 프레임 다시 그리기엔 비싸고(포석 수백 칸) 전혀 움직이지도
     * 않으므로, 오프스크린에 한 번만 그려두고 매 프레임 통째로 얹는다.
     */
    const floorLayer = document.createElement('canvas');
    floorLayer.width = PLAZA_W;
    floorLayer.height = PLAZA_H;

    function paintFloorLayer() {
      const g = floorLayer.getContext('2d');
      if (!g) return;
      const { cx, cy, rx, ry } = PLAZA_FLOOR;

      let seed = 11;
      const rnd = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
      };
      /** 타원 위의 점 — a 는 각도, r 은 중심(0)~가장자리(1) */
      const pt = (a: number, r: number): [number, number] => [
        cx + Math.cos(a) * rx * r,
        cy + Math.sin(a) * ry * r,
      ];

      // 흙바닥
      const field = g.createLinearGradient(0, HORIZON_Y - 6, 0, GROUND_BOTTOM);
      field.addColorStop(0, '#4a3d28');
      field.addColorStop(1, '#2c2417');
      g.fillStyle = field;
      g.fillRect(0, HORIZON_Y - 6, PLAZA_W, GROUND_BOTTOM - HORIZON_Y + 6);

      // 흙 얼룩 — 민짜 그라디언트로 두면 종이처럼 보인다
      for (let i = 0; i < 90; i++) {
        const x = rnd() * PLAZA_W;
        const y = HORIZON_Y + rnd() * (GROUND_BOTTOM - HORIZON_Y);
        g.fillStyle = rnd() < 0.5 ? 'rgba(90,74,48,0.35)' : 'rgba(28,22,14,0.35)';
        g.fillRect(Math.round(x), Math.round(y), 2 + Math.round(rnd() * 3), 1);
      }

      // 광장 밖으로 빠지는 길 — 광장이 접시처럼 떠 보이지 않도록 세계와 이어준다
      g.fillStyle = '#5c5346';
      for (const [ax, spread] of [
        [-Math.PI / 2 - 0.34, 15],
        [-Math.PI / 2 + 0.36, 13],
      ] as const) {
        const [ix, iy] = pt(ax, 0.98);
        g.beginPath();
        g.moveTo(ix - spread, iy);
        g.lineTo(ix + spread, iy);
        g.lineTo(ix + spread * 0.45, HORIZON_Y - 8);
        g.lineTo(ix - spread * 0.45, HORIZON_Y - 8);
        g.closePath();
        g.fill();
      }
      // 앞쪽(관객 쪽)으로 내려가는 큰길
      g.beginPath();
      g.moveTo(cx - 44, cy + ry - 6);
      g.lineTo(cx + 44, cy + ry - 6);
      g.lineTo(cx + 74, GROUND_BOTTOM);
      g.lineTo(cx - 74, GROUND_BOTTOM);
      g.closePath();
      g.fill();

      // 광장 포석 — 방사형 + 동심원. 바깥으로 갈수록 칸이 납작해져 원근이 생긴다
      g.fillStyle = '#6b6153';
      g.beginPath();
      g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      g.fill();

      // 포석은 가로줄로 깐다. 방사형(동심원)으로 깔면 아무리 색을 흩어도
      // 고리 경계가 눈에 남아 과녁처럼 읽힌다. 줄 간격을 뒤로 갈수록
      // 촘촘하게 만들어 원근을 준다.
      g.save();
      g.beginPath();
      g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      g.clip();

      const ROWS = 15;
      /** 0(먼 쪽) → 1(앞쪽). 제곱으로 눌러 뒤쪽 줄이 더 촘촘해진다 */
      const depthAt = (v: number) => Math.pow(v, 1.55);
      for (let row = 0; row < ROWS; row++) {
        const v0 = depthAt(row / ROWS);
        const v1 = depthAt((row + 1) / ROWS);
        const yTop = cy - ry + 2 * ry * v0;
        const yBot = cy - ry + 2 * ry * v1;
        // 줄이 깊을수록 돌도 넓어진다
        const stoneW = 7 + v1 * 16;
        const offset = (row % 2 ? stoneW / 2 : 0) + rnd() * 4;
        for (let sx = cx - rx - stoneW; sx < cx + rx + stoneW; sx += stoneW) {
          const shade = rnd();
          g.fillStyle =
            shade < 0.28
              ? '#6a6153'
              : shade < 0.56
                ? '#655c4f'
                : shade < 0.82
                  ? '#6f6557'
                  : '#5d554a';
          g.fillRect(sx + offset, yTop, stoneW - 1, yBot - yTop + 0.6);
        }
      }

      // 바닥 명암 — 가운데가 밝고 가장자리가 어두워야 평면이 아니라 실제 바닥처럼 보인다.
      // 단, 반드시 광장 타원과 "같은 모양"이어야 한다. 정원(正圓) 그라디언트를 납작한
      // 타원 바닥에 얹으면 그 원 테두리가 바닥 위에 떠서 과녁처럼 읽힌다.
      // 세로로 눌러 어두워지는 끝이 연석과 정확히 겹치게 한다.
      g.translate(cx, cy);
      g.scale(1, ry / rx);
      const vign = g.createRadialGradient(0, 0, 0, 0, 0, rx);
      vign.addColorStop(0, 'rgba(255, 240, 210, 0.07)');
      vign.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
      vign.addColorStop(1, 'rgba(18, 14, 10, 0.4)');
      g.fillStyle = vign;
      g.fillRect(-rx, -rx, rx * 2, rx * 2);
      g.restore();

      // 테두리 연석 — 한 줄로 쭉 그으면 바닥에 그은 트랙 선처럼 보인다.
      // 돌 하나하나를 따로 놓고 톤을 흩어야 "쌓아 두른 돌"로 읽힌다.
      const CURB_STONES = 96;
      for (let i = 0; i < CURB_STONES; i++) {
        const a = (i / CURB_STONES) * Math.PI * 2;
        const [sx, sy] = pt(a, 1);
        // 아래쪽(앞쪽) 연석은 카메라에 두께가 보이고, 위쪽(먼 쪽)은 거의 선으로 눕는다
        const facing = (Math.sin(a) + 1) / 2;
        const h = 1 + Math.round(facing * 2.2);
        const tone = rnd();
        g.fillStyle =
          tone < 0.3 ? '#7d7059' : tone < 0.62 ? '#6e624e' : tone < 0.86 ? '#877a62' : '#5f5545';
        g.fillRect(Math.round(sx) - 1, Math.round(sy) - h, 3, h);
        // 앞쪽 연석에만 윗면 하이라이트 — 두께가 있다는 신호
        if (facing > 0.55) {
          g.fillStyle = 'rgba(214, 198, 166, 0.35)';
          g.fillRect(Math.round(sx) - 1, Math.round(sy) - h, 3, 1);
        }
      }
      // 연석 바깥에 깔리는 그림자 — 광장이 흙바닥보다 살짝 높다는 표시
      g.strokeStyle = 'rgba(24, 18, 12, 0.45)';
      g.lineWidth = 1;
      g.beginPath();
      g.ellipse(cx, cy + 1, rx + 1, ry + 1, 0, 0.1, Math.PI - 0.1);
      g.stroke();

      // 바닥에 쌓인 낙엽
      for (let i = 0; i < 70; i++) {
        const a = rnd() * Math.PI * 2;
        const r = Math.sqrt(rnd());
        const [x, y] = pt(a, r);
        g.fillStyle = LEAF_TONES[Math.floor(rnd() * LEAF_TONES.length)];
        g.globalAlpha = 0.5 + rnd() * 0.3;
        g.fillRect(Math.round(x), Math.round(y), 2, 1);
      }
      g.globalAlpha = 1;
    }
    paintFloorLayer();

    function drawGround() {
      ctx.drawImage(floorLayer, 0, 0);
    }

    // ---------- 장소별 소품 ----------

    /**
     * 마을을 "사람이 사는 곳"으로 만드는 잡동사니.
     *
     * 광장이 어설퍼 보이는 큰 이유 하나가, 건물과 캐릭터 사이에 아무것도 없어서
     * 무대 배경 앞에 인형을 세워둔 것처럼 읽힌다는 점이다. 우물·수레·빨랫줄처럼
     * 생활의 흔적을 층층이 끼워 넣어야 깊이가 생긴다.
     */
    function drawVillageProps(t: number) {
      const sway = reduced ? 0 : Math.sin(t * 1.1);

      /* 건물 사이 빨랫줄 — 지붕 선 위쪽 빈 공간을 메운다 */
      // 지붕 위가 아니라 벽면을 가로질러 걸어야 빨래로 읽힌다
      const lines: [number, number, number, number, string[]][] = [
        [74, 88, 146, 82, ['#c8d8e0', '#d9c58f', '#b8646e']],
        [288, 86, 352, 92, ['#cfd8c0', '#9fb4cc', '#e0d3b0']],
      ];
      for (const [x0, y0, x1, y1, tones] of lines) {
        const dip = 5;
        ctx.strokeStyle = 'rgba(214, 200, 168, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + dip, x1, y1);
        ctx.stroke();
        tones.forEach((tone, i) => {
          const u = (i + 1) / (tones.length + 1);
          // 2차 베지어 위의 점
          const bx = (1 - u) ** 2 * x0 + 2 * (1 - u) * u * ((x0 + x1) / 2) + u ** 2 * x1;
          const by =
            (1 - u) ** 2 * y0 + 2 * (1 - u) * u * ((y0 + y1) / 2 + dip) + u ** 2 * y1;
          const flap = reduced ? 0 : Math.sin(t * 1.6 + i * 1.3) * 0.8;
          ctx.fillStyle = tone;
          ctx.fillRect(Math.round(bx - 3 + flap), Math.round(by), 7, 9);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
          ctx.fillRect(Math.round(bx - 3 + flap), Math.round(by + 7), 7, 2);
        });
      }

      /* 벽에 매달린 철제 간판 — 중세 마을의 상점 표시 */
      const signs: [number, number, string, string][] = [
        [96, 72, '#b8863c', 'mug'],
        [286, 76, '#8fa8c4', 'loaf'],
        [372, 70, '#a8556a', 'boot'],
      ];
      for (const [sx, sy, tone, kind] of signs) {
        ctx.fillStyle = '#2e2620';
        ctx.fillRect(sx, sy, 11, 2); // 브래킷 가로대
        ctx.fillRect(sx, sy, 2, 6); // 벽에 붙는 세로대
        const tilt = reduced ? 0 : sway * 0.8;
        ctx.save();
        ctx.translate(sx + 9, sy + 2);
        ctx.rotate(tilt * 0.05);
        ctx.fillStyle = '#2e2620';
        ctx.fillRect(-1, 0, 2, 3);
        ctx.fillStyle = tone;
        ctx.fillRect(-6, 3, 13, 10);
        ctx.fillStyle = 'rgba(20, 14, 10, 0.45)';
        ctx.fillRect(-6, 3, 13, 1);
        ctx.fillRect(-6, 12, 13, 1);
        // 간판 그림
        ctx.fillStyle = '#231b16';
        if (kind === 'mug') {
          ctx.fillRect(-3, 6, 5, 5);
          ctx.fillRect(2, 7, 2, 3);
        } else if (kind === 'loaf') {
          ctx.fillRect(-4, 7, 8, 4);
          ctx.fillRect(-2, 6, 4, 1);
        } else {
          ctx.fillRect(-3, 5, 3, 6);
          ctx.fillRect(-3, 9, 6, 2);
        }
        ctx.restore();
      }

      /* 광장 우물 — 마을 광장의 상징. 두레박이 천천히 흔들린다 */
      const wx = 176;
      const wy = 224;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(wx, wy + 1, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // 돌 몸통 — 앞면
      ctx.fillStyle = '#6a6153';
      ctx.fillRect(wx - 13, wy - 15, 26, 15);
      // 돌 한 장 한 장
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          const ox = (r % 2 ? 3 : 0) + c * 7;
          ctx.fillStyle = (r + c) % 2 ? '#6f6557' : '#625949';
          ctx.fillRect(wx - 13 + ox, wy - 15 + r * 5, 6, 4);
        }
      }
      ctx.fillStyle = 'rgba(24, 18, 12, 0.35)';
      ctx.fillRect(wx - 13, wy - 15, 4, 15);
      ctx.fillRect(wx + 9, wy - 15, 4, 15);
      // 우물 입구 — 위에서 21° 로 보므로 타원으로 열린다
      ctx.fillStyle = '#857a66';
      ctx.beginPath();
      ctx.ellipse(wx, wy - 15, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#17120c';
      ctx.beginPath();
      ctx.ellipse(wx, wy - 15, 9, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(120, 160, 175, 0.35)';
      ctx.beginPath();
      ctx.ellipse(wx, wy - 14.4, 6, 1.9, 0, 0, Math.PI * 2);
      ctx.fill();
      // 기둥 + 지붕
      ctx.fillStyle = '#5a4128';
      ctx.fillRect(wx - 12, wy - 36, 3, 21);
      ctx.fillRect(wx + 9, wy - 36, 3, 21);
      ctx.fillRect(wx - 12, wy - 37, 24, 3);
      ctx.fillStyle = '#7d4a33';
      ctx.beginPath();
      ctx.moveTo(wx, wy - 50);
      ctx.lineTo(wx + 16, wy - 37);
      ctx.lineTo(wx - 16, wy - 37);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(40, 22, 14, 0.4)';
      ctx.beginPath();
      ctx.moveTo(wx, wy - 50);
      ctx.lineTo(wx + 16, wy - 37);
      ctx.lineTo(wx, wy - 37);
      ctx.closePath();
      ctx.fill();
      // 두레박
      const bob = reduced ? 0 : sway * 1.4;
      ctx.strokeStyle = '#9c8f74';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wx + 1, wy - 34);
      ctx.lineTo(wx + 1 + bob, wy - 26);
      ctx.stroke();
      ctx.fillStyle = '#6b4a2c';
      ctx.fillRect(Math.round(wx - 2 + bob), wy - 26, 7, 6);
      ctx.fillStyle = '#4e351e';
      ctx.fillRect(Math.round(wx - 2 + bob), wy - 24, 7, 1);

      /* 건초 수레 — 오른쪽 담벼락 앞 */
      const kx = 424;
      const ky = 218;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(kx, ky + 1, 21, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6b4a2c';
      ctx.fillRect(kx - 19, ky - 12, 38, 8); // 짐칸
      ctx.fillStyle = '#54371f';
      ctx.fillRect(kx - 19, ky - 6, 38, 2);
      ctx.fillRect(kx - 19, ky - 12, 2, 8);
      ctx.fillRect(kx + 17, ky - 12, 2, 8);
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(kx + 17, ky - 9, 14, 2); // 끌채
      // 건초
      for (let i = 0; i < 26; i++) {
        const hx = kx - 17 + ((i * 13) % 34);
        const hy = ky - 14 - ((i * 7) % 5);
        ctx.fillStyle = i % 3 === 0 ? '#d8b45c' : i % 3 === 1 ? '#c09240' : '#a87c33';
        ctx.fillRect(hx, hy, 3, 2);
      }
      // 바퀴
      for (const wxo of [-11, 11]) {
        ctx.fillStyle = '#3c2a18';
        ctx.beginPath();
        ctx.arc(kx + wxo, ky - 4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6b4a2c';
        ctx.beginPath();
        ctx.arc(kx + wxo, ky - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3c2a18';
        ctx.fillRect(kx + wxo - 4, ky - 5, 8, 1);
        ctx.fillRect(kx + wxo - 1, ky - 8, 1, 7);
      }

      /* 벽 앞에 쌓인 나무 상자와 통 — 왼쪽 구석 */
      const crates: [number, number, number][] = [
        [288, 240, 10],
        [298, 242, 8],
        [292, 230, 9],
      ];
      for (const [bx, by, s] of crates) {
        ctx.fillStyle = '#7a5630';
        ctx.fillRect(bx, by - s, s, s);
        ctx.fillStyle = '#5e3f21';
        ctx.fillRect(bx, by - s, s, 1);
        ctx.fillRect(bx, by - 1, s, 1);
        ctx.fillRect(bx, by - s, 1, s);
        ctx.fillRect(bx + s - 1, by - s, 1, s);
        ctx.fillStyle = 'rgba(94, 63, 33, 0.8)';
        ctx.fillRect(bx + 1, by - Math.round(s / 2), s - 2, 1);
      }
    }

    /** 왼쪽 단풍나무 — 도적이 가지 위에 앉는다 */
    function drawTree(t: number) {
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(52, 92, 10, 66);
      ctx.fillStyle = '#3a2718';
      ctx.fillRect(59, 92, 3, 66);
      ctx.fillRect(38, 100, 16, 3);
      ctx.fillRect(62, 110, 14, 3);

      const sway = reduced ? 0 : Math.sin(t * 0.7) * 1.2;
      const blobs: [number, number, number, string][] = [
        [56, 60, 30, '#a8452a'],
        [34, 72, 21, '#c2622f'],
        [78, 70, 22, '#c2622f'],
        [50, 48, 20, '#e0863a'],
        [68, 54, 16, '#d9a43c'],
        [38, 58, 14, '#8f4522'],
        [72, 88, 14, '#a8452a'],
        [36, 90, 13, '#c2622f'],
      ];
      for (const [x, y, r, color] of blobs) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x + sway, y, r, r * 0.78, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /** 선술집 앞 가마솥 — 우왕이 자리 */
    function drawCauldron(t: number) {
      ctx.fillStyle = '#2f2b2c';
      ctx.beginPath();
      ctx.ellipse(124, 150, 11, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e1a1b';
      ctx.beginPath();
      ctx.ellipse(124, 145, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      const flick = reduced ? 1 : 1 + Math.sin(t * 9) * 0.18;
      ctx.fillStyle = '#ff7b2e';
      ctx.beginPath();
      ctx.ellipse(124, 158, 8, 4 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.ellipse(124, 158, 4, 2.2 * flick, 0, 0, Math.PI * 2);
      ctx.fill();

      if (!reduced) {
        for (let i = 0; i < 3; i++) {
          const p = (t * 0.45 + i / 3) % 1;
          ctx.globalAlpha = 0.32 * (1 - p);
          ctx.fillStyle = '#e8ddd0';
          ctx.fillRect(Math.round(124 + Math.sin((p + i) * 5) * 4), Math.round(142 - p * 30), 2, 2);
        }
        ctx.globalAlpha = 1;
      }

      // 옆에 쌓아둔 통과 자루
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(94, 142, 13, 16);
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(94, 146, 13, 1);
      ctx.fillRect(94, 153, 13, 1);
      ctx.fillStyle = '#b9a276';
      ctx.beginPath();
      ctx.ellipse(86, 154, 7, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /** 점성술 천막 — 점성술사는 천막 왼쪽 앞에 서므로 천막은 그보다 오른쪽에 친다 */
    function drawAstrologerTent(t: number) {
      ctx.fillStyle = '#3d2c73';
      ctx.beginPath();
      ctx.moveTo(356, 102);
      ctx.lineTo(318, 160);
      ctx.lineTo(394, 160);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#4b3a8f';
      ctx.beginPath();
      ctx.moveTo(356, 102);
      ctx.lineTo(356, 160);
      ctx.lineTo(394, 160);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2b1f5c';
      ctx.fillRect(318, 157, 76, 5);

      const twinkle = reduced ? 1 : 0.6 + 0.4 * Math.sin(t * 2.2);
      ctx.fillStyle = '#f5d76e';
      ctx.globalAlpha = twinkle;
      for (const [sx, sy] of [
        [340, 134],
        [372, 128],
        [356, 146],
        [330, 150],
        [384, 148],
      ]) {
        ctx.fillRect(sx, sy - 1, 1, 3);
        ctx.fillRect(sx - 1, sy, 3, 1);
      }
      ctx.globalAlpha = 1;
      ctx.fillRect(355, 94, 1, 9);
      ctx.fillStyle = '#b98cff';
      ctx.fillRect(356, 94, 7, 4);

      ctx.fillStyle = '#191038';
      ctx.beginPath();
      ctx.moveTo(347, 160);
      ctx.lineTo(356, 124);
      ctx.lineTo(365, 160);
      ctx.closePath();
      ctx.fill();
    }

    /** 담벼락 과녁장 — 엘프 자리 */
    function drawArchery(t: number) {
      ctx.fillStyle = '#7a6a34';
      ctx.fillRect(438, 166, 28, 13);
      ctx.fillStyle = '#6a5c2c';
      ctx.fillRect(438, 171, 28, 2);

      const rings: [number, string][] = [
        [12, '#e8e2d4'],
        [9, '#3d3a34'],
        [5.5, '#e8e2d4'],
        [2.5, '#c4331a'],
      ];
      for (const [r, color] of rings) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(452, 150, r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (reduced) return;
      const cycle = (t % 4) / 4;
      if (cycle < 0.22) {
        const p = cycle / 0.22;
        const x = 420 + (448 - 420) * p;
        const y = 154 - Math.sin(p * Math.PI) * 6;
        ctx.fillStyle = '#d8cbb0';
        ctx.fillRect(Math.round(x), Math.round(y), 6, 1);
        ctx.fillStyle = '#e8e2d4';
        ctx.fillRect(Math.round(x + 6), Math.round(y), 2, 1);
      } else {
        ctx.fillStyle = '#d8cbb0';
        ctx.fillRect(454, 150, 7, 1);
      }
    }

    /** 장터 좌판 하나 */
    function stall(x: number, y: number, w: number, a: string, b: string) {
      ctx.fillStyle = a;
      ctx.fillRect(x, y, w, 7);
      ctx.fillStyle = b;
      for (let i = 0; i < w / 10; i++) ctx.fillRect(x + i * 10, y, 5, 7);
      ctx.fillStyle = '#3d2752';
      for (let sx = x; sx < x + w; sx += 8) {
        ctx.beginPath();
        ctx.moveTo(sx, y + 7);
        ctx.lineTo(sx + 8, y + 7);
        ctx.lineTo(sx + 4, y + 11);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(x + 2, y + 7, 3, 22);
      ctx.fillRect(x + w - 5, y + 7, 3, 22);
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(x - 2, y + 18, w + 4, 5);
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(x - 2, y + 23, w + 4, 3);
    }

    /** 앞쪽 마법 두루마리 좌판 — 마법사 자리 */
    function drawScrollShop(t: number) {
      stall(334, 186, 60, '#5b3a7a', '#7a4fa0');
      ctx.fillStyle = '#e8dcc0';
      ctx.fillRect(342, 199, 10, 5);
      ctx.fillRect(357, 200, 9, 4);
      ctx.fillStyle = '#c4b28c';
      ctx.fillRect(342, 201, 10, 1);
      ctx.fillRect(357, 201, 9, 1);

      const bob = reduced ? 0 : Math.sin(t * 1.6) * 2.5;
      ctx.save();
      ctx.shadowColor = 'rgba(159, 232, 255, 0.7)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#f0e8d0';
      ctx.fillRect(377, Math.round(184 + bob), 10, 6);
      ctx.restore();
      ctx.fillStyle = '#9fe8ff';
      ctx.fillRect(377, Math.round(186 + bob), 10, 1);
    }

    /** 뒤쪽 장터 좌판들 — 마을 사람들이 붙어 있다 */
    function drawMarket() {
      stall(266, 130, 50, '#6a4030', '#8a5a3c');
      // 과일 상자
      ctx.fillStyle = '#c4331a';
      ctx.fillRect(272, 143, 4, 3);
      ctx.fillRect(278, 143, 4, 3);
      ctx.fillStyle = '#d9a43c';
      ctx.fillRect(287, 143, 4, 3);
      ctx.fillStyle = '#7ac05a';
      ctx.fillRect(296, 143, 4, 3);

      stall(158, 134, 46, '#3d5570', '#4f6f92');
      ctx.fillStyle = '#b9a276';
      ctx.fillRect(166, 147, 6, 4);
      ctx.fillRect(177, 147, 6, 4);
      ctx.fillStyle = '#8a7c66';
      ctx.fillRect(188, 146, 7, 5);

      // 나무 상자와 통
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(402, 162, 14, 13);
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(402, 167, 14, 1);
      ctx.fillStyle = '#7a5a36';
      ctx.fillRect(389, 167, 11, 10);
    }

    /** 광장 벤치 + 화톳불 — 기사 자리 */
    function drawBench(t: number) {
      const flick = reduced ? 1 : 1 + Math.sin(t * 8.5) * 0.2 + Math.sin(t * 19) * 0.08;
      // 화톳불 (삼각 받침 + 불)
      ctx.fillStyle = '#4a4038';
      ctx.fillRect(52, 212, 18, 4);
      ctx.fillRect(59, 200, 4, 13);
      ctx.save();
      ctx.shadowColor = 'rgba(255, 150, 60, 0.6)';
      ctx.shadowBlur = 11 * flick;
      ctx.fillStyle = '#c4331a';
      ctx.beginPath();
      ctx.ellipse(61, 196, 9, 10 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff8a2b';
      ctx.beginPath();
      ctx.ellipse(61, 198, 5.5, 6.5 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.ellipse(61, 200, 2.8, 3.8 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 벤치
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(84, 210, 50, 4);
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(84, 214, 50, 2);
      ctx.fillRect(88, 216, 4, 10);
      ctx.fillRect(126, 216, 4, 10);
      ctx.fillStyle = '#5c3f24';
      ctx.fillRect(84, 200, 50, 3);
      ctx.fillRect(86, 200, 3, 11);
      ctx.fillRect(129, 200, 3, 11);
    }

    /** 광장 등불 — 어두운 시간대에만 불이 들어온다 */
    function drawLamps(t: number) {
      const posts: [number, number][] = [
        [148, 176],
        [302, 168],
        [420, 164],
      ];
      for (const [x, groundY] of posts) {
        ctx.fillStyle = '#3a3128';
        ctx.fillRect(x, groundY - 30, 3, 30);
        ctx.fillRect(x - 3, groundY - 2, 9, 3);
        ctx.fillStyle = '#4a4038';
        ctx.fillRect(x - 4, groundY - 38, 11, 9);
        if (amb.lamps <= 0.1) continue;
        const flick = reduced ? 1 : 1 + Math.sin(t * 6 + x) * 0.1;
        ctx.save();
        ctx.shadowColor = 'rgba(255, 196, 96, 0.85)';
        ctx.shadowBlur = 9 * flick * amb.lamps;
        ctx.fillStyle = `rgba(255, 216, 140, ${0.55 + amb.lamps * 0.45})`;
        ctx.fillRect(x - 2, groundY - 36, 7, 6);
        ctx.restore();
      }
    }

    /** 중앙 동상 자리 — 받침대 + "여기 들어갑니다" 점선 실루엣 */
    function drawStatuePlinth(t: number) {
      const cx = STATUE.x;

      // 받침대 그림자 — 진하면 바닥에 뚫린 구멍처럼 보인다. 옅게, 받침대에 붙여서.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.beginPath();
      ctx.ellipse(cx, 196, 33, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // 받침대 3 단. 카메라가 21° 위에서 보므로 각 단의 "윗면"이 보여야 하고,
      // 그 윗면이 바닥보다 밝아야 돌이 쌓인 걸로 읽힌다. 앞면만 칠하면 바닥에
      // 뚫린 검은 구멍처럼 보인다.
      for (const [hw, ty, h] of [
        [29, 185, 11],
        [23, 175, 10],
        [18, 165, 10],
      ] as const) {
        // 앞면
        ctx.fillStyle = '#5f5749';
        ctx.fillRect(cx - hw, ty + 3, hw * 2, h - 3);
        // 양 끝은 빛이 스쳐 지나가 어둡다
        ctx.fillStyle = 'rgba(28, 22, 16, 0.38)';
        ctx.fillRect(cx - hw, ty + 3, 4, h - 3);
        ctx.fillRect(cx + hw - 4, ty + 3, 4, h - 3);
        // 윗면 — 하늘을 보고 있으니 가장 밝다
        ctx.fillStyle = '#8d8270';
        ctx.fillRect(cx - hw, ty, hw * 2, 3);
        ctx.fillStyle = '#a5987f';
        ctx.fillRect(cx - hw + 2, ty, hw * 2 - 4, 1);
        // 단과 단 사이 그늘
        ctx.fillStyle = 'rgba(20, 16, 12, 0.4)';
        ctx.fillRect(cx - hw, ty + h - 1, hw * 2, 1);
      }

      ctx.fillStyle = '#f5d76e';
      ctx.fillRect(cx - 9, 177, 18, 5);
      ctx.fillStyle = '#7a5a20';
      ctx.fillRect(cx - 7, 179, 14, 1);

      const pulse = reduced ? 0.8 : 0.62 + 0.28 * Math.sin(t * 1.8);
      ctx.save();
      ctx.globalAlpha = pulse;

      const silhouette = new Path2D();
      silhouette.moveTo(cx - 14, 165);
      silhouette.lineTo(cx - 14, 147);
      silhouette.lineTo(cx - 7, 135);
      silhouette.lineTo(cx - 7, STATUE.topY);
      silhouette.lineTo(cx + 7, STATUE.topY);
      silhouette.lineTo(cx + 7, 135);
      silhouette.lineTo(cx + 14, 147);
      silhouette.lineTo(cx + 14, 165);
      silhouette.closePath();

      ctx.fillStyle = 'rgba(245, 215, 110, 0.14)';
      ctx.fill(silhouette);
      ctx.shadowColor = 'rgba(245, 215, 110, 0.6)';
      ctx.shadowBlur = 5;
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = '#ffe9a0';
      ctx.stroke(silhouette);
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffe9a0';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', cx, 149);
      ctx.restore();
    }

    // ---------- 마을 사람들 ----------

    function drawNpc(n: Npc, t: number, dt: number) {
      if (n.from !== undefined && n.to !== undefined && !reduced) {
        n.x += n.speed * n.dir * dt;
        if (n.x > n.to) {
          n.x = n.to;
          n.dir = -1;
        } else if (n.x < n.from) {
          n.x = n.from;
          n.dir = 1;
        }
      }

      const s = n.scale * NPC_SCALE;
      const walking = n.from !== undefined && !reduced;
      const step = walking ? Math.sin(t * 6 + n.phase) : 0;
      const bob = reduced ? 0 : Math.abs(Math.sin(t * (n.chatter ? 2.4 : 6) + n.phase)) * (n.chatter ? 0.8 : 1.2);
      const x = Math.round(n.x);
      const y = Math.round(n.y - bob);

      // 그림자
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.ellipse(x + 2 * s, n.y + 1, 4 * s, 1.6 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // 다리
      ctx.fillStyle = '#3b2f26';
      ctx.fillRect(x + Math.round(step * 1.2), y - 3, 2 * s, 3 * s);
      ctx.fillRect(x + 3 * s - Math.round(step * 1.2), y - 3, 2 * s, 3 * s);
      // 몸
      ctx.fillStyle = n.coat;
      ctx.fillRect(x, y - 9 * s, 5 * s, 6 * s);
      // 머리
      ctx.fillStyle = n.head;
      ctx.fillRect(x + 1 * s, y - 13 * s, 3 * s, 3 * s);
      ctx.fillStyle = n.hair;
      ctx.fillRect(x + 1 * s, y - 14 * s, 3 * s, 1.5 * s);
    }

    function drawNpcs(layer: 'back' | 'front', t: number, dt: number) {
      for (const n of npcs) if (n.layer === layer) drawNpc(n, t, dt);
    }

    // ---------- 입자 / 마감 ----------

    function drawLeaves(dt: number, t: number) {
      for (const l of leaves) {
        if (!reduced) {
          l.y += l.vy * dt;
          l.x += Math.sin(t * 1.4 + l.phase) * l.drift * dt - 4 * dt;
          if (l.y > PLAZA_H + 2) {
            l.y = -3;
            l.x = Math.random() * PLAZA_W;
          }
          if (l.x < -3) l.x = PLAZA_W + 2;
        }
        ctx.fillStyle = LEAF_TONES[l.tone];
        ctx.globalAlpha = 0.85;
        ctx.fillRect(Math.round(l.x), Math.round(l.y), l.size + 1, l.size);
        ctx.globalAlpha = 1;
      }
    }

    /** 시간대 빛 한 겹 + 가장자리 어둡게 */
    function drawAmbient() {
      ctx.save();
      ctx.globalCompositeOperation = amb.wash.mode;
      ctx.globalAlpha = amb.wash.alpha;
      ctx.fillStyle = amb.wash.color;
      ctx.fillRect(0, 0, PLAZA_W, PLAZA_H);
      ctx.restore();

      // 가장자리 어둡게 — 화면 비율(16:9)에 맞춰 눌러야 한다. 정원으로 주면
      // 프레임 안에 원 테두리가 그대로 보이고, 안쪽 반지름을 띄워두면 그 경계가
      // 또 하나의 고리가 된다. 중심에서 0 으로 시작해 모서리까지 매끄럽게 깐다.
      ctx.save();
      ctx.translate(PLAZA_W / 2, PLAZA_H / 2);
      ctx.scale(1, PLAZA_H / PLAZA_W);
      const v = ctx.createRadialGradient(0, 0, 0, 0, 0, PLAZA_W * 0.72);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(0.6, 'rgba(6, 4, 14, 0.06)');
      v.addColorStop(1, 'rgba(6, 4, 14, 0.5)');
      ctx.fillStyle = v;
      ctx.fillRect(-PLAZA_W, -PLAZA_W, PLAZA_W * 2, PLAZA_W * 2);
      ctx.restore();
    }

    let raf = 0;
    let last = performance.now();
    const start = last;

    function frame(now: number) {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const t = (now - start) / 1000;

      ctx.clearRect(0, 0, PLAZA_W, PLAZA_H);
      drawSky(t);

      // 지면 레이어 — 하늘을 넓게 두기 위해 통째로 내려 그린다
      ctx.save();
      ctx.translate(0, GROUND_SHIFT);
      drawSkyline();
      drawVillage(t);
      drawGround();
      drawTree(t);
      drawNpcs('back', t, dt); // 좌판 상인 (상판이 하반신을 가리도록 먼저)
      drawMarket();
      drawNpcs('front', t, dt); // 광장을 지나다니는 사람들
      drawVillageProps(t);
      drawCauldron(t);
      drawAstrologerTent(t);
      drawArchery(t);
      drawLamps(t);
      drawStatuePlinth(t);
      drawBench(t);
      drawScrollShop(t);
      ctx.restore();

      drawLeaves(dt, t);
      drawAmbient();

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
  }, [phase]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
