'use client';

import { useEffect, useRef } from 'react';
import {
  PLAZA_FLOOR,
  PLAZA_H,
  PLAZA_W,
  STATUE,
  phaseForHour,
  type DayPhase,
} from '@/lib/plazaLayout';

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
};

const NPCS: Npc[] = [
  { x: 150, y: 134, from: 140, to: 206, speed: 9, dir: 1, coat: '#7b5a3a', head: '#e8c49a', hair: '#3a2a1c', phase: 0.2, scale: 1 },
  { x: 318, y: 128, from: 276, to: 344, speed: 7, dir: -1, coat: '#4d5f7a', head: '#f0c49a', hair: '#5a3a22', phase: 1.1, scale: 0.95 },
  { x: 214, y: 143, from: 196, to: 268, speed: 15, dir: 1, coat: '#a85a3c', head: '#f0c49a', hair: '#7a4a1e', phase: 2.3, scale: 0.78 },
  { x: 186, y: 138, speed: 0, dir: 1, coat: '#6a4a6e', head: '#e8c49a', hair: '#2e2119', phase: 0.7, scale: 0.98, chatter: true },
  { x: 197, y: 139, speed: 0, dir: -1, coat: '#57703f', head: '#f0c49a', hair: '#6b4a2a', phase: 1.9, scale: 0.98, chatter: true },
  { x: 288, y: 133, speed: 0, dir: -1, coat: '#8a6a2e', head: '#e8c49a', hair: '#4a3420', phase: 2.8, scale: 0.96, chatter: true },
  { x: 96, y: 148, speed: 0, dir: 1, coat: '#5a5a62', head: '#e8c49a', hair: '#8a8078', phase: 1.4, scale: 0.94, chatter: true },
  { x: 430, y: 130, speed: 0, dir: -1, coat: '#4a4f6a', head: '#f0c49a', hair: '#33291f', phase: 0.5, scale: 1, chatter: true },
  { x: 356, y: 140, from: 330, to: 392, speed: 6, dir: 1, coat: '#7a4552', head: '#f0c49a', hair: '#2b1f18', phase: 3.3, scale: 0.92 },
  { x: 258, y: 146, from: 232, to: 300, speed: 11, dir: -1, coat: '#3f6a5a', head: '#e8c49a', hair: '#4a3420', phase: 1.6, scale: 0.86 },
  { x: 176, y: 131, speed: 0, dir: 1, coat: '#8a7a4a', head: '#f0c49a', hair: '#5a4a2a', phase: 2.1, scale: 0.9, chatter: true },
  { x: 402, y: 136, from: 396, to: 448, speed: 8, dir: 1, coat: '#6a5a7a', head: '#e8c49a', hair: '#3a2a1c', phase: 0.9, scale: 0.9 },
  { x: 132, y: 152, speed: 0, dir: -1, coat: '#7a4a3a', head: '#f0c49a', hair: '#2e2119', phase: 2.6, scale: 0.92, chatter: true },
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

    const stars = Array.from({ length: 46 }, () => ({
      x: Math.random() * PLAZA_W,
      y: Math.random() * 84,
      a: 0.25 + Math.random() * 0.5,
      tw: 0.5 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
    }));

    const npcs = NPCS.map((n) => ({ ...n }));

    const sky = ctx.createLinearGradient(0, 0, 0, 118);
    amb.sky.forEach((color, i) => sky.addColorStop(i / (amb.sky.length - 1), color));

    // ---------- 하늘 ----------

    function drawSky(t: number) {
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, PLAZA_W, 118);

      if (amb.stars > 0) {
        for (const s of stars) {
          const tw = reduced ? 1 : 0.5 + 0.5 * Math.sin(t * s.tw + s.phase);
          ctx.globalAlpha = s.a * tw * amb.stars * (1 - s.y / 130);
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

    /** 하프팀버(흰 벽 + 나무 기둥) 집 한 채 */
    function house(
      x: number,
      y: number,
      w: number,
      h: number,
      roof: string,
      wall: string,
      opts: { windows?: number; door?: boolean; chimney?: boolean; sign?: string } = {}
    ) {
      const roofH = Math.round(h * 0.42);
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
      // 지붕
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
      // 왼쪽 집들
      house(6, 74, 52, 48, '#7a3b2e', '#c9b79a', { windows: 2, door: true, chimney: true });
      house(62, 82, 44, 42, '#6a4a7a', '#bfae92', { windows: 2 });

      // 선술집 (우왕이 자리)
      house(112, 66, 74, 58, '#8a4a2c', '#d2c0a0', { windows: 3, door: true, chimney: true, sign: '#d9a43c' });

      // 시계탑 · 마을회관 (중앙)
      ctx.fillStyle = '#b9a98c';
      ctx.fillRect(206, 52, 46, 70);
      ctx.fillStyle = '#4e3524';
      ctx.fillRect(206, 52, 2, 70);
      ctx.fillRect(250, 52, 2, 70);
      ctx.fillStyle = '#6a4a3a';
      ctx.beginPath();
      ctx.moveTo(200, 54);
      ctx.lineTo(229, 26);
      ctx.lineTo(258, 54);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d9a43c';
      ctx.fillRect(228, 18, 2, 9);
      ctx.fillRect(230, 18, 8, 5);
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
      ctx.fillRect(222, 106, 14, 16);

      // 오른쪽 상점들
      house(270, 80, 46, 44, '#7a3b2e', '#c9b79a', { windows: 2, sign: '#7a4fa0' });
      house(332, 72, 52, 52, '#6a4a7a', '#d2c0a0', { windows: 2, door: true, chimney: true });
      house(396, 80, 48, 44, '#8a4a2c', '#c9b79a', { windows: 2 });

      // 오른쪽 담벼락 (과녁장 배경)
      ctx.fillStyle = '#7d6a52';
      ctx.fillRect(402, 118, 78, 26);
      ctx.fillStyle = '#6a5a44';
      for (let x = 402; x < 480; x += 10) ctx.fillRect(x, 118, 1, 26);
      ctx.fillRect(402, 126, 78, 1);

      // 굴뚝 연기
      if (!reduced) {
        for (const [sx, sy] of [
          [51, 68],
          [178, 60],
          [378, 66],
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
        [58, 96, 112, 88],
        [186, 84, 206, 74],
        [252, 74, 270, 86],
        [316, 90, 332, 80],
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

    function drawGround() {
      const field = ctx.createLinearGradient(0, 114, 0, PLAZA_H);
      field.addColorStop(0, '#463a26');
      field.addColorStop(1, '#2f2719');
      ctx.fillStyle = field;
      ctx.fillRect(0, 114, PLAZA_W, PLAZA_H - 114);

      const { cx, cy, rx, ry } = PLAZA_FLOOR;
      ctx.fillStyle = '#6b6153';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#8a7c66';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx - 3, ry - 3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(138, 124, 102, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 0.58, ry * 0.58, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 포석 + 떨어진 낙엽
      let seed = 11;
      const rnd = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
      };
      for (let i = 0; i < 130; i++) {
        const a = rnd() * Math.PI * 2;
        const r = Math.sqrt(rnd());
        const x = cx + Math.cos(a) * rx * r;
        const y = cy + Math.sin(a) * ry * r;
        if (rnd() < 0.7) {
          ctx.fillStyle = rnd() < 0.5 ? '#7a7062' : '#5b5246';
          ctx.fillRect(Math.round(x), Math.round(y), 2, 1);
        } else {
          ctx.fillStyle = LEAF_TONES[Math.floor(rnd() * LEAF_TONES.length)];
          ctx.globalAlpha = 0.7;
          ctx.fillRect(Math.round(x), Math.round(y), 2, 1);
          ctx.globalAlpha = 1;
        }
      }
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(0, 114, PLAZA_W, 2);
    }

    // ---------- 장소별 소품 ----------

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
      ctx.ellipse(124, 140, 11, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e1a1b';
      ctx.beginPath();
      ctx.ellipse(124, 135, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      const flick = reduced ? 1 : 1 + Math.sin(t * 9) * 0.18;
      ctx.fillStyle = '#ff7b2e';
      ctx.beginPath();
      ctx.ellipse(124, 148, 8, 4 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.ellipse(124, 148, 4, 2.2 * flick, 0, 0, Math.PI * 2);
      ctx.fill();

      if (!reduced) {
        for (let i = 0; i < 3; i++) {
          const p = (t * 0.45 + i / 3) % 1;
          ctx.globalAlpha = 0.32 * (1 - p);
          ctx.fillStyle = '#e8ddd0';
          ctx.fillRect(Math.round(124 + Math.sin((p + i) * 5) * 4), Math.round(132 - p * 30), 2, 2);
        }
        ctx.globalAlpha = 1;
      }

      // 옆에 쌓아둔 통과 자루
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(96, 134, 12, 14);
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(96, 137, 12, 1);
      ctx.fillRect(96, 143, 12, 1);
      ctx.fillStyle = '#b9a276';
      ctx.beginPath();
      ctx.ellipse(88, 144, 7, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /** 점성술 천막 — 점성술사는 천막 왼쪽 앞에 서므로 천막은 그보다 오른쪽에 친다 */
    function drawAstrologerTent(t: number) {
      ctx.fillStyle = '#3d2c73';
      ctx.beginPath();
      ctx.moveTo(356, 104);
      ctx.lineTo(322, 148);
      ctx.lineTo(390, 148);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#4b3a8f';
      ctx.beginPath();
      ctx.moveTo(356, 104);
      ctx.lineTo(356, 148);
      ctx.lineTo(390, 148);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2b1f5c';
      ctx.fillRect(322, 146, 68, 4);

      const twinkle = reduced ? 1 : 0.6 + 0.4 * Math.sin(t * 2.2);
      ctx.fillStyle = '#f5d76e';
      ctx.globalAlpha = twinkle;
      for (const [sx, sy] of [
        [342, 128],
        [370, 124],
        [356, 138],
        [332, 140],
        [380, 138],
      ]) {
        ctx.fillRect(sx, sy - 1, 1, 3);
        ctx.fillRect(sx - 1, sy, 3, 1);
      }
      ctx.globalAlpha = 1;
      ctx.fillRect(355, 96, 1, 9);
      ctx.fillStyle = '#b98cff';
      ctx.fillRect(356, 96, 7, 4);

      ctx.fillStyle = '#191038';
      ctx.beginPath();
      ctx.moveTo(348, 148);
      ctx.lineTo(356, 120);
      ctx.lineTo(364, 148);
      ctx.closePath();
      ctx.fill();
    }

    /** 담벼락 과녁장 — 엘프 자리 */
    function drawArchery(t: number) {
      ctx.fillStyle = '#7a6a34';
      ctx.fillRect(440, 150, 24, 12);
      ctx.fillStyle = '#6a5c2c';
      ctx.fillRect(440, 154, 24, 2);

      const rings: [number, string][] = [
        [11, '#e8e2d4'],
        [8, '#3d3a34'],
        [5, '#e8e2d4'],
        [2.5, '#c4331a'],
      ];
      for (const [r, color] of rings) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(452, 138, r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (reduced) return;
      const cycle = (t % 4) / 4;
      if (cycle < 0.22) {
        const p = cycle / 0.22;
        const x = 422 + (448 - 422) * p;
        const y = 142 - Math.sin(p * Math.PI) * 5;
        ctx.fillStyle = '#d8cbb0';
        ctx.fillRect(Math.round(x), Math.round(y), 6, 1);
        ctx.fillStyle = '#e8e2d4';
        ctx.fillRect(Math.round(x + 6), Math.round(y), 2, 1);
      } else {
        ctx.fillStyle = '#d8cbb0';
        ctx.fillRect(454, 138, 7, 1);
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
      stall(340, 160, 56, '#5b3a7a', '#7a4fa0');
      ctx.fillStyle = '#e8dcc0';
      ctx.fillRect(348, 172, 9, 5);
      ctx.fillRect(362, 173, 8, 4);
      ctx.fillStyle = '#c4b28c';
      ctx.fillRect(348, 174, 9, 1);
      ctx.fillRect(362, 174, 8, 1);

      const bob = reduced ? 0 : Math.sin(t * 1.6) * 2.5;
      ctx.save();
      ctx.shadowColor = 'rgba(159, 232, 255, 0.7)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#f0e8d0';
      ctx.fillRect(380, Math.round(158 + bob), 10, 6);
      ctx.restore();
      ctx.fillStyle = '#9fe8ff';
      ctx.fillRect(380, Math.round(160 + bob), 10, 1);
    }

    /** 뒤쪽 장터 좌판들 — 마을 사람들이 붙어 있다 */
    function drawMarket() {
      stall(268, 122, 48, '#6a4030', '#8a5a3c');
      // 과일 상자
      ctx.fillStyle = '#c4331a';
      ctx.fillRect(274, 134, 4, 3);
      ctx.fillRect(280, 134, 4, 3);
      ctx.fillStyle = '#d9a43c';
      ctx.fillRect(288, 134, 4, 3);
      ctx.fillStyle = '#7ac05a';
      ctx.fillRect(296, 134, 4, 3);

      stall(160, 126, 44, '#3d5570', '#4f6f92');
      ctx.fillStyle = '#b9a276';
      ctx.fillRect(168, 138, 6, 4);
      ctx.fillRect(178, 138, 6, 4);
      ctx.fillStyle = '#8a7c66';
      ctx.fillRect(188, 137, 7, 5);

      // 나무 상자와 통
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(404, 148, 13, 12);
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(404, 152, 13, 1);
      ctx.fillStyle = '#7a5a36';
      ctx.fillRect(392, 152, 10, 9);
    }

    /** 광장 벤치 + 화톳불 — 기사 자리 */
    function drawBench(t: number) {
      const flick = reduced ? 1 : 1 + Math.sin(t * 8.5) * 0.2 + Math.sin(t * 19) * 0.08;
      // 화톳불 (삼각 받침 + 불)
      ctx.fillStyle = '#4a4038';
      ctx.fillRect(56, 186, 16, 4);
      ctx.fillRect(62, 176, 4, 12);
      ctx.save();
      ctx.shadowColor = 'rgba(255, 150, 60, 0.6)';
      ctx.shadowBlur = 10 * flick;
      ctx.fillStyle = '#c4331a';
      ctx.beginPath();
      ctx.ellipse(64, 172, 8, 9 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff8a2b';
      ctx.beginPath();
      ctx.ellipse(64, 173, 5, 6 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.ellipse(64, 175, 2.5, 3.5 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 벤치
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(82, 186, 46, 4);
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(82, 190, 46, 2);
      ctx.fillRect(86, 192, 4, 9);
      ctx.fillRect(120, 192, 4, 9);
      ctx.fillStyle = '#5c3f24';
      ctx.fillRect(82, 177, 46, 3);
      ctx.fillRect(84, 177, 3, 10);
      ctx.fillRect(123, 177, 3, 10);
    }

    /** 광장 등불 — 어두운 시간대에만 불이 들어온다 */
    function drawLamps(t: number) {
      const posts: [number, number][] = [
        [150, 160],
        [300, 154],
        [418, 150],
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
      const cx = STATUE.fx * PLAZA_W;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(cx, 176, 32, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#585046';
      ctx.fillRect(cx - 28, 166, 56, 9);
      ctx.fillStyle = '#6b6257';
      ctx.fillRect(cx - 22, 157, 44, 9);
      ctx.fillStyle = '#7a7166';
      ctx.fillRect(cx - 17, 148, 34, 10);
      ctx.fillStyle = '#4a443c';
      ctx.fillRect(cx - 17, 157, 34, 1);
      ctx.fillRect(cx - 22, 166, 44, 1);

      ctx.fillStyle = '#f5d76e';
      ctx.fillRect(cx - 9, 159, 18, 5);
      ctx.fillStyle = '#7a5a20';
      ctx.fillRect(cx - 7, 161, 14, 1);

      const pulse = reduced ? 0.8 : 0.62 + 0.28 * Math.sin(t * 1.8);
      ctx.save();
      ctx.globalAlpha = pulse;

      const silhouette = new Path2D();
      silhouette.moveTo(cx - 13, 148);
      silhouette.lineTo(cx - 13, 132);
      silhouette.lineTo(cx - 6, 121);
      silhouette.lineTo(cx - 6, STATUE.topY);
      silhouette.lineTo(cx + 6, STATUE.topY);
      silhouette.lineTo(cx + 6, 121);
      silhouette.lineTo(cx + 13, 132);
      silhouette.lineTo(cx + 13, 148);
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
      ctx.fillText('?', cx, 134);
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

      const s = n.scale;
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

    function drawNpcs(t: number, dt: number) {
      for (const n of npcs) drawNpc(n, t, dt);
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

      const v = ctx.createRadialGradient(240, 150, 90, 240, 150, 300);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(6, 4, 14, 0.5)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, PLAZA_W, PLAZA_H);
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
      drawSkyline();
      drawVillage(t);
      drawGround();
      drawTree(t);
      drawMarket();
      drawNpcs(t, dt);
      drawCauldron(t);
      drawAstrologerTent(t);
      drawArchery(t);
      drawLamps(t);
      drawStatuePlinth(t);
      drawBench(t);
      drawScrollShop(t);
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
