/**
 * 달려라 우왕이 V2 — 구간 배경.
 *
 * 구간(교실 · 복도 · 캠퍼스 · 학생식당 · 중앙도서관 · 시험장)마다 세 겹으로 그린다.
 *   벽/하늘 — 고정
 *   먼 배경 — 창문 · 칠판 · 건물 · 책장 등, 천천히(0.25배) 흐른다
 *   가까운 배경 — 책상 · 사물함 · 식탁 등, 조금 빨리(0.55배) 흐른다
 *   바닥 — 달리는 속도 그대로
 * 먼 · 가까운 배경은 처음에 한 장씩 구워 두고 반복해서 찍는다. 구간이 바뀌면
 * 앞뒤 구간을 잠깐 겹쳐(크로스페이드) 자연스럽게 넘어간다.
 */

import { GROUND_Y, VIEW_H, VIEW_W, mulberry32 } from './world';

const STRIP_W = 512;

type ZoneArt = {
  /** 벽(또는 하늘) 위 · 아래 색 */
  wall: [string, string];
  far: HTMLCanvasElement;
  near: HTMLCanvasElement;
  floor: { top: string; fill: string; line: string; pattern: 'planks' | 'tiles' | 'path' | 'checker' | 'carpet' | 'dark' };
  /** 어두운 구간은 화면에 한 겹 덧씌운다 */
  tint?: string;
};

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  if (!g) throw new Error('2d context unavailable');
  return { c, g };
}

/** 사각형 하나 — 짧게 쓰려고 */
function r(g: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

/** 하늘이 보이는 창문 (틀 + 유리 + 구름 한 점 + 십자 창살) */
function window_(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: string, sky: [string, string]) {
  r(g, frame, x - 3, y - 3, w + 6, h + 6);
  for (let i = 0; i < h; i++) r(g, i < h / 2 ? sky[0] : sky[1], x, y + i, w, 1);
  r(g, '#ffffff', x + 6, y + 8, 10, 3);
  r(g, '#ffffff', x + 9, y + 6, 6, 2);
  r(g, frame, x + w / 2 - 1, y, 2, h);
  r(g, frame, x, y + h / 2 - 1, w, 2);
}

/* ---------- 구간별 그림 ---------- */

function classroom(): ZoneArt {
  const far = canvas(STRIP_W, GROUND_Y);
  const fg = far.g;
  // 나무 벽판 (아랫부분)
  r(fg, '#b98a5a', 0, GROUND_Y - 34, STRIP_W, 34);
  r(fg, '#d4a674', 0, GROUND_Y - 34, STRIP_W, 2);
  for (let x = 0; x < STRIP_W; x += 32) r(fg, '#a07548', x, GROUND_Y - 32, 1, 32);
  // 창문 둘
  window_(fg, 24, 46, 64, 56, '#f2efe6', ['#8fcbee', '#c4e5f6']);
  window_(fg, 420, 46, 64, 56, '#f2efe6', ['#8fcbee', '#c4e5f6']);
  // 칠판 — 분필 글씨는 흰 줄로
  r(fg, '#7a5634', 150, 36, 212, 82);
  r(fg, '#2f5d46', 154, 40, 204, 74);
  r(fg, '#3a6b52', 154, 40, 204, 2);
  for (const [x, y, w] of [
    [166, 52, 70],
    [166, 62, 110],
    [166, 72, 54],
    [250, 86, 80],
    [250, 96, 46],
  ]) r(fg, 'rgba(240,240,230,0.75)', x, y, w, 2);
  r(fg, '#c9c2b2', 160, 114, 196, 3);
  r(fg, '#ffffff', 200, 112, 6, 2);
  // 벽시계
  r(fg, '#3a3a3a', 112, 18, 18, 18);
  r(fg, '#f4f1e8', 114, 20, 14, 14);
  r(fg, '#2a2a2a', 120, 22, 2, 6);
  r(fg, '#2a2a2a', 120, 27, 5, 2);

  const near = canvas(STRIP_W, 60);
  const ng = near.g;
  // 책상과 의자 줄
  for (let x = 10; x < STRIP_W; x += 96) {
    r(ng, '#8a6a46', x, 28, 46, 5);
    r(ng, '#6b5236', x, 33, 46, 2);
    r(ng, '#5a5f66', x + 3, 35, 3, 25);
    r(ng, '#5a5f66', x + 40, 35, 3, 25);
    // 의자
    r(ng, '#5a5f66', x + 54, 20, 3, 40);
    r(ng, '#8a6a46', x + 54, 38, 18, 4);
    r(ng, '#5a5f66', x + 69, 42, 3, 18);
  }
  return {
    wall: ['#ece2ca', '#e2d5b8'],
    far: far.c,
    near: near.c,
    floor: { top: '#d39a5e', fill: '#b07a46', line: '#8f5f33', pattern: 'planks' },
  };
}

function hallway(): ZoneArt {
  const far = canvas(STRIP_W, GROUND_Y);
  const fg = far.g;
  r(fg, '#8fa3b5', 0, GROUND_Y - 48, STRIP_W, 48);
  r(fg, '#a9bccc', 0, GROUND_Y - 48, STRIP_W, 2);
  // 교실 문 둘 — 문 위 호실 팻말
  for (const x of [40, 296]) {
    r(fg, '#6b4a2c', x - 3, 64, 54, 120);
    r(fg, '#9a6a3c', x, 67, 48, 117);
    r(fg, '#c8e4f2', x + 10, 78, 28, 30);
    r(fg, '#6b4a2c', x + 23, 78, 2, 30);
    r(fg, '#d9a43c', x + 40, 130, 4, 3);
    r(fg, '#2f4f6f', x + 8, 50, 32, 10);
    r(fg, '#ffffff', x + 13, 53, 4, 4);
    r(fg, '#ffffff', x + 21, 53, 4, 4);
    r(fg, '#ffffff', x + 29, 53, 4, 4);
  }
  // 게시판 — 종이 몇 장
  r(fg, '#8a6a46', 150, 60, 110, 70);
  r(fg, '#c9a46a', 154, 64, 102, 62);
  const papers: [number, number, string][] = [
    [160, 70, '#ffffff'],
    [188, 74, '#ffe6a0'],
    [218, 68, '#c9f0ff'],
    [176, 98, '#ffd0e0'],
    [210, 100, '#ffffff'],
  ];
  for (const [x, y, c] of papers) {
    r(fg, c, x, y, 24, 22);
    r(fg, '#d94f4f', x + 10, y - 1, 3, 3);
    r(fg, 'rgba(0,0,0,0.25)', x + 3, y + 6, 16, 1);
    r(fg, 'rgba(0,0,0,0.25)', x + 3, y + 11, 12, 1);
  }
  // 소화기
  r(fg, '#c43a2e', 400, 132, 10, 22);
  r(fg, '#2a2a2a', 402, 128, 6, 4);
  // 형광등
  for (let x = 30; x < STRIP_W; x += 128) r(fg, '#fafcf2', x, 4, 60, 3);

  const near = canvas(STRIP_W, 70);
  const ng = near.g;
  // 사물함 줄
  for (let x = 0; x < STRIP_W; x += 20) {
    if (Math.floor(x / 120) % 2 === 1) continue;
    r(ng, '#5f7da0', x, 0, 19, 70);
    r(ng, '#7896b8', x, 0, 19, 2);
    r(ng, '#4a6585', x, 34, 19, 2);
    r(ng, '#3d5470', x + 2, 8, 12, 1);
    r(ng, '#3d5470', x + 2, 11, 12, 1);
    r(ng, '#c8ccd4', x + 15, 20, 2, 5);
  }
  return {
    wall: ['#dfe3e5', '#d2d7da'],
    far: far.c,
    near: near.c,
    floor: { top: '#e6e1d4', fill: '#cfcabe', line: '#b8b2a4', pattern: 'checker' },
  };
}

function campus(): ZoneArt {
  const far = canvas(STRIP_W, GROUND_Y);
  const fg = far.g;
  const rng = mulberry32(3);
  // 붉은 벽돌 건물들 — 창문 격자
  const buildings: [number, number, number][] = [
    [0, 70, 120],
    [140, 46, 150],
    [320, 82, 110],
    [440, 60, 90],
  ];
  for (const [x, top, w] of buildings) {
    r(fg, '#a5574a', x, top, w, GROUND_Y - top);
    r(fg, '#8a4438', x, top, w, 4);
    for (let wy = top + 14; wy < GROUND_Y - 30; wy += 18) {
      for (let wx = x + 10; wx < x + w - 14; wx += 20) r(fg, rng() < 0.3 ? '#ffe6a0' : '#cfe7f5', wx, wy, 10, 10);
    }
  }
  // 시계탑 지붕 한 채
  r(fg, '#7a3b2e', 205, 26, 20, 20);
  r(fg, '#f4f1e8', 209, 30, 12, 12);
  // 단풍나무들 (건물 앞)
  for (let x = 20; x < STRIP_W; x += 72 + Math.floor(rng() * 30)) {
    const rad = 14 + Math.floor(rng() * 8);
    const cy = GROUND_Y - 34 - rad;
    r(fg, '#5a3c22', x - 2, cy, 4, GROUND_Y - cy);
    const col = ['#d9822b', '#c2562a', '#e0a83a'][Math.floor(rng() * 3)];
    for (let dy = -rad; dy <= rad; dy++) {
      const hw = Math.round(Math.sqrt(rad * rad - dy * dy));
      r(fg, col, x - hw, cy + dy, hw * 2, 1);
    }
  }

  const near = canvas(STRIP_W, 40);
  const ng = near.g;
  // 화단과 가로등
  r(ng, '#4f7f3a', 0, 30, STRIP_W, 10);
  for (let x = 0; x < STRIP_W; x += 6) r(ng, '#6aa84f', x, 28 + (x % 12 === 0 ? 0 : 1), 4, 3);
  for (const x of [60, 316]) {
    r(ng, '#3a3a42', x, 0, 3, 40);
    r(ng, '#f5d76e', x - 3, 0, 9, 4);
  }
  return {
    wall: ['#7fc1ea', '#d6eef7'],
    far: far.c,
    near: near.c,
    floor: { top: '#6aa84f', fill: '#c9b796', line: '#a8956f', pattern: 'path' },
  };
}

function cafeteria(): ZoneArt {
  const far = canvas(STRIP_W, GROUND_Y);
  const fg = far.g;
  r(fg, '#d9b680', 0, GROUND_Y - 40, STRIP_W, 40);
  for (let x = 0; x < STRIP_W; x += 16) r(fg, '#c9a36a', x, GROUND_Y - 40, 1, 40);
  for (let y = GROUND_Y - 40; y < GROUND_Y; y += 10) r(fg, '#c9a36a', 0, y, STRIP_W, 1);
  // 메뉴판 — 오늘의 메뉴 줄
  r(fg, '#3a2e28', 40, 30, 150, 74);
  r(fg, '#5a4a40', 40, 30, 150, 3);
  r(fg, '#f5d76e', 52, 40, 50, 4);
  for (let i = 0; i < 4; i++) {
    r(fg, 'rgba(255,255,255,0.8)', 52, 52 + i * 11, 70, 2);
    r(fg, '#f5d76e', 150, 52 + i * 11, 24, 2);
  }
  // 배식대 — 식판과 김
  r(fg, '#b8c0c8', 230, 100, 240, 44);
  r(fg, '#d6dde3', 230, 100, 240, 4);
  for (let x = 244; x < 460; x += 44) {
    r(fg, '#8a949e', x, 92, 30, 10);
    r(fg, ['#e0443a', '#f5d76e', '#7ac05a', '#c98a4a'][(x / 44) % 4 | 0], x + 4, 90, 22, 4);
    r(fg, 'rgba(255,255,255,0.5)', x + 10, 78, 2, 8);
    r(fg, 'rgba(255,255,255,0.4)', x + 16, 72, 2, 10);
  }
  // 포스터
  r(fg, '#ff9a8a', 200, 36, 22, 30);
  r(fg, '#ffffff', 204, 42, 14, 2);

  const near = canvas(STRIP_W, 48);
  const ng = near.g;
  // 식탁과 둥근 의자
  for (let x = 20; x < STRIP_W; x += 128) {
    r(ng, '#f4f1e8', x, 16, 72, 5);
    r(ng, '#e07a3a', x, 21, 72, 2);
    r(ng, '#8a949e', x + 34, 23, 4, 25);
    for (const sx of [x - 14, x + 78]) {
      r(ng, '#e07a3a', sx, 30, 12, 4);
      r(ng, '#8a949e', sx + 5, 34, 2, 14);
    }
  }
  return {
    wall: ['#f6e3bd', '#f0d7a8'],
    far: far.c,
    near: near.c,
    floor: { top: '#f4efe2', fill: '#e8e0cf', line: '#cfc5ae', pattern: 'tiles' },
  };
}

function library(): ZoneArt {
  const far = canvas(STRIP_W, GROUND_Y);
  const fg = far.g;
  const rng = mulberry32(9);
  const spines = ['#c4402f', '#3d5fd6', '#d9a43c', '#4f7a62', '#7a4fa0', '#e8e0cf', '#8a5a2c'];
  // 높은 책장 — 칸마다 색색 책등
  for (let x = 0; x < STRIP_W; x += 128) {
    r(fg, '#3a2618', x + 4, 20, 100, GROUND_Y - 20);
    for (let shelf = 0; shelf < 5; shelf++) {
      const sy = 26 + shelf * 30;
      r(fg, '#2a1a10', x + 8, sy, 92, 24);
      let bx = x + 9;
      while (bx < x + 98) {
        const bw = 3 + Math.floor(rng() * 3);
        const bh = 16 + Math.floor(rng() * 7);
        r(fg, spines[Math.floor(rng() * spines.length)], bx, sy + 24 - bh, bw, bh);
        bx += bw + (rng() < 0.15 ? 2 : 0);
      }
      r(fg, '#6b4a2c', x + 6, sy + 24, 96, 3);
    }
  }
  // 아치 창 (책장 사이)
  for (const x of [108, 364]) {
    r(fg, '#6b4a2c', x - 2, 34, 20, 70);
    r(fg, '#1d3550', x, 40, 16, 62);
    r(fg, '#f5d76e', x + 6, 50, 4, 4);
  }

  const near = canvas(STRIP_W, 46);
  const ng = near.g;
  // 열람 책상과 초록 스탠드 (스테디의 고정석이 어딘가에…)
  for (let x = 30; x < STRIP_W; x += 128) {
    r(ng, '#6b4a2c', x, 22, 90, 5);
    r(ng, '#4a3220', x, 27, 90, 2);
    r(ng, '#4a3220', x + 4, 29, 4, 17);
    r(ng, '#4a3220', x + 82, 29, 4, 17);
    r(ng, '#2f7a4a', x + 14, 10, 14, 5);
    r(ng, '#c9b796', x + 20, 15, 2, 7);
    r(ng, 'rgba(255,240,160,0.35)', x + 10, 15, 22, 7);
    r(ng, '#e8e0cf', x + 50, 18, 16, 4);
  }
  return {
    wall: ['#5a3e2b', '#4a3222'],
    far: far.c,
    near: near.c,
    floor: { top: '#8e3838', fill: '#7a2e2e', line: '#5e2222', pattern: 'carpet' },
    tint: 'rgba(40, 20, 0, 0.12)',
  };
}

function exam(): ZoneArt {
  const far = canvas(STRIP_W, GROUND_Y);
  const fg = far.g;
  r(fg, '#2c3140', 0, GROUND_Y - 30, STRIP_W, 30);
  // 큰 칠판 — 시험 범위가 빼곡
  r(fg, '#4a3a2c', 40, 30, 260, 90);
  r(fg, '#1f3a2e', 44, 34, 252, 82);
  for (let i = 0; i < 6; i++) r(fg, 'rgba(240,240,230,0.6)', 56, 44 + i * 11, 120 + ((i * 37) % 90), 2);
  // 큰 시계 — 시험 시간이 흐른다
  r(fg, '#1a1a1a', 340, 26, 34, 34);
  r(fg, '#f4f1e8', 343, 29, 28, 28);
  r(fg, '#c4402f', 356, 31, 2, 13);
  r(fg, '#1a1a1a', 356, 42, 10, 2);
  // 빨간 "조용히" 등
  r(fg, '#c4402f', 410, 40, 70, 18);
  r(fg, '#ff9a8a', 414, 44, 62, 2);
  r(fg, '#ffffff', 418, 49, 54, 4);

  const near = canvas(STRIP_W, 44);
  const ng = near.g;
  // 계단식 책상 — 시험지와 연필
  for (let x = 0; x < STRIP_W; x += 64) {
    r(ng, '#3a3f4f', x, 20, 56, 5);
    r(ng, '#2a2e3a', x, 25, 56, 19);
    r(ng, '#f4f1e8', x + 10, 16, 18, 4);
    r(ng, '#f5d76e', x + 32, 18, 12, 2);
  }
  return {
    wall: ['#3c4253', '#323746'],
    far: far.c,
    near: near.c,
    floor: { top: '#3a3f4f', fill: '#2c2f3a', line: '#22252e', pattern: 'dark' },
    tint: 'rgba(80, 0, 20, 0.10)',
  };
}

/* ---------- 그리기 ---------- */

export type RunBackground = {
  /** 구간 index 의 배경을 화면에 그린다 (dist = 달린 거리, alpha 로 겹쳐 그리기) */
  draw(ctx: CanvasRenderingContext2D, zone: number, dist: number, alpha: number): void;
  /** 땅 조각의 윗면 · 몸통을 그린다 (구간 바닥 무늬) */
  drawGround(ctx: CanvasRenderingContext2D, zone: number, x0: number, x1: number, dist: number): void;
};

export function createRunBackground(): RunBackground {
  const zones = [classroom(), hallway(), campus(), cafeteria(), library(), exam()];

  function strip(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, offset: number, y: number) {
    const o = ((offset % STRIP_W) + STRIP_W) % STRIP_W;
    for (let x = -o; x < VIEW_W; x += STRIP_W) ctx.drawImage(img, Math.round(x), y);
  }

  function draw(ctx: CanvasRenderingContext2D, zone: number, dist: number, alpha: number) {
    const z = zones[zone];
    ctx.globalAlpha = alpha;
    for (let i = 0; i < GROUND_Y; i += 8) {
      ctx.fillStyle = i < GROUND_Y / 2 ? z.wall[0] : z.wall[1];
      ctx.fillRect(0, i, VIEW_W, 8);
    }
    strip(ctx, z.far, dist * 0.25, 0);
    strip(ctx, z.near, dist * 0.55, GROUND_Y - z.near.height);
    // 땅 아래 (구덩이 속까지 이어지는 바닥 밑) — 어둡게
    ctx.fillStyle = '#121218';
    ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
    if (z.tint) {
      ctx.fillStyle = z.tint;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
    ctx.globalAlpha = 1;
  }

  function drawGround(ctx: CanvasRenderingContext2D, zone: number, x0: number, x1: number, dist: number) {
    const f = zones[zone].floor;
    const left = Math.max(-2, Math.round(x0));
    const right = Math.min(VIEW_W + 2, Math.round(x1));
    if (right <= left) return;
    const w = right - left;
    ctx.fillStyle = f.fill;
    ctx.fillRect(left, GROUND_Y, w, VIEW_H - GROUND_Y);
    ctx.fillStyle = f.top;
    ctx.fillRect(left, GROUND_Y, w, 3);
    // 무늬 — 달리는 속도 그대로 흐른다
    ctx.fillStyle = f.line;
    const step = f.pattern === 'checker' || f.pattern === 'tiles' ? 16 : f.pattern === 'planks' ? 24 : 20;
    const off = ((dist % step) + step) % step;
    for (let x = left - off - step; x < right; x += step) {
      if (x + 1 < left || x > right) continue;
      if (f.pattern === 'checker') {
        const odd = Math.floor((x + dist) / step) % 2 === 0;
        if (odd) ctx.fillRect(Math.round(x), GROUND_Y + 3, Math.min(step, right - x), 13);
      } else if (f.pattern === 'carpet') {
        ctx.fillRect(Math.round(x), GROUND_Y + 8, 6, 2);
      } else {
        ctx.fillRect(Math.round(x), GROUND_Y + 3, 1, VIEW_H - GROUND_Y - 3);
      }
    }
    if (f.pattern === 'tiles' || f.pattern === 'planks') {
      ctx.fillRect(left, GROUND_Y + 15, w, 1);
    }
    // 구덩이 쪽 가장자리를 살짝 어둡게 — 끊긴 곳이 눈에 띄게
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    if (x0 > -2) ctx.fillRect(left, GROUND_Y, 2, VIEW_H - GROUND_Y);
    if (x1 < VIEW_W + 2) ctx.fillRect(right - 2, GROUND_Y, 2, VIEW_H - GROUND_Y);
  }

  return { draw, drawGround };
}
