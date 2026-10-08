/**
 * 달려라 우왕이 V2 — 캐릭터 동작 · 장애물 · 발판 · 학점 · 하트 그림.
 *
 * 캐릭터는 components/Sprite.tsx 의 16x22 그리드를 그대로 가져와(광장 카드와 같은 그림),
 * 다리 줄만 바꿔 끼워 달리기 · 점프 동작을 만들고, 슬라이드는 머리와 몸을 눌러 담는다.
 * 처음에 한 장씩 캔버스로 구워 두고 매 프레임 찍기만 한다.
 */

import { SPRITE_GRIDS, SPRITE_PALETTE, SPRITE_SIZE } from '@/components/Sprite';

/* ---------- 캐릭터 ---------- */

export type Pose = 'runA' | 'runB' | 'jump' | 'slide' | 'stand';

/** 그리드 한 줄 — {열: 글자} 로 적는다 (Sprite.tsx 의 buildRow 와 같은 방식) */
function row(marks: Record<number, string>, w = SPRITE_SIZE.w) {
  return Array.from({ length: w }, (_, i) => marks[i] ?? '.').join('');
}
function range(from: number, to: number, ch: string) {
  const m: Record<number, string> = {};
  for (let i = from; i <= to; i++) m[i] = ch;
  return m;
}

/**
 * 캐릭터 한 명의 그림 재료. base 는 서 있는 22줄 그리드, legsAt 은 다리가 시작하는 줄
 * (그 위가 머리 · 몸). pants · shoe 는 다리를 새로 그릴 때 쓰는 글자.
 */
export type CharacterArt = {
  base: string[];
  legsAt: number;
  pants: string;
  shoe: string;
  /** 바지 양옆 줄무늬 (우왕이의 흰 줄) */
  stripe?: string;
  /** 슬라이드 때 남길 줄들 (머리 · 몸에서 골라 눌러 담는다) */
  slideRows: number[];
  /** 다리 줄을 직접 정한 캐릭터 (legsAt 줄부터 끼운다) — 없으면 우왕이식 다리를 만든다 */
  legs?: { runA: string[]; runB: string[]; jump: string[] };
};

/**
 * 사람 모양 캐릭터의 다리 — 반바지(top) 한 줄, 다리(leg) 두 줄, 신발(shoe) 한 줄.
 * 달리기 두 장은 한 발씩 들고, 점프는 무릎을 접는다.
 */
export function humanLegs(top: string, leg: string, shoe: string): NonNullable<CharacterArt['legs']> {
  const shorts = row(range(4, 11, top));
  return {
    runA: [shorts, row({ 5: leg, 6: leg, 10: leg, 11: leg }), row({ 5: leg, 6: leg, 11: leg, 12: leg }), row({ 4: shoe, 5: shoe, 6: shoe, 12: shoe, 13: shoe })],
    runB: [shorts, row({ 4: leg, 5: leg, 9: leg, 10: leg }), row({ 3: leg, 4: leg, 9: leg, 10: leg }), row({ 2: shoe, 3: shoe, 9: shoe, 10: shoe, 11: shoe })],
    jump: [shorts, row({ 4: leg, 5: leg, 10: leg, 11: leg }), row({ 3: shoe, 4: shoe, 11: shoe, 12: shoe })],
  };
}

/** 다리 줄 만들기 — 다른 파일에서도 같은 방식으로 적을 수 있게 */
export { row as legRow, range as legRange };

export const WOOWANG_ART: CharacterArt = {
  base: SPRITE_GRIDS['woowang'],
  legsAt: 15,
  pants: 'Y',
  shoe: 'k',
  stripe: 'v',
  slideRows: [2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 14],
};

/** 다리 줄을 바꿔 끼운 22줄 그리드 */
function withLegs(art: CharacterArt, legs: string[]) {
  const top = art.base.slice(0, art.legsAt);
  const out = [...top, ...legs];
  while (out.length < SPRITE_SIZE.h) out.push(row({}));
  return out.slice(0, SPRITE_SIZE.h);
}

export function poseGrid(art: CharacterArt, pose: Pose): string[] {
  const P = art.pants;
  const S = art.shoe;
  const stripe: Record<number, string> = art.stripe ? { 4: art.stripe, 11: art.stripe } : {};
  const pants = row({ ...range(4, 11, P), ...stripe });
  if (art.legs && pose !== 'stand' && pose !== 'slide') {
    const legs = pose === 'runA' ? art.legs.runA : pose === 'runB' ? art.legs.runB : art.legs.jump;
    return withLegs(art, legs);
  }
  switch (pose) {
    case 'stand':
      return art.base;
    case 'runA':
      // 왼발 딛고 오른발 든 걸음
      return withLegs(art, [pants, pants, pants, row({ 4: P, 5: P, 10: S, 11: S }), row({ 4: S, 5: S })]);
    case 'runB':
      return withLegs(art, [pants, pants, pants, row({ 4: S, 5: S, 10: P, 11: P }), row({ 10: S, 11: S })]);
    case 'jump':
      // 무릎을 접어 올린다
      return withLegs(art, [pants, pants, row({ ...range(3, 5, P), ...range(10, 12, P) }), row({ 3: S, 4: S, 11: S, 12: S })]);
    case 'slide': {
      // 머리와 몸을 눌러 담고 다리를 넓게 벌린 낮은 자세 (12줄)
      const rows = art.slideRows.map((i) => art.base[i]);
      rows.push(row({ 2: S, 3: S, 12: S, 13: S }));
      return rows;
    }
  }
}

export function bakeGrid(grid: string[]) {
  const c = document.createElement('canvas');
  c.width = SPRITE_SIZE.w;
  c.height = grid.length;
  const g = c.getContext('2d');
  if (!g) return c;
  grid.forEach((line, y) => {
    for (let x = 0; x < line.length; x++) {
      const color = SPRITE_PALETTE[line[x]];
      if (line[x] === '.' || !color) continue;
      g.fillStyle = color;
      g.fillRect(x, y, 1, 1);
    }
  });
  return c;
}

export type CharacterSprites = Record<Pose, HTMLCanvasElement>;

export function bakeCharacter(art: CharacterArt): CharacterSprites {
  const poses: Pose[] = ['stand', 'runA', 'runB', 'jump', 'slide'];
  return Object.fromEntries(poses.map((p) => [p, bakeGrid(poseGrid(art, p))])) as CharacterSprites;
}

/* ---------- 장애물 ---------- */

function r(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

/** 낮은 장애물 (14x17) — 구간마다 다른 물건 */
export function drawLow(ctx: CanvasRenderingContext2D, zone: number, x: number, y: number) {
  switch (zone) {
    case 0: // 교실 의자
      r(ctx, '#5a5f66', x + 1, y, 2, 17);
      r(ctx, '#8a6a46', x + 1, y + 1, 9, 6);
      r(ctx, '#a8845a', x + 1, y + 1, 9, 1);
      r(ctx, '#8a6a46', x, y + 9, 14, 3);
      r(ctx, '#5a5f66', x + 11, y + 12, 2, 5);
      r(ctx, '#5a5f66', x + 1, y + 12, 2, 5);
      break;
    case 1: // 복도 쓰레기통
      r(ctx, '#7d8791', x + 1, y + 3, 12, 14);
      r(ctx, '#9aa5b0', x, y, 14, 4);
      r(ctx, '#5f6a75', x + 5, y - 1, 4, 2);
      r(ctx, '#7ac05a', x + 3, y + 8, 8, 3);
      r(ctx, '#5f6a75', x + 1, y + 15, 12, 2);
      break;
    case 2: // 캠퍼스 고깔
      r(ctx, '#2a2a2a', x, y + 15, 14, 2);
      r(ctx, '#e8702a', x + 2, y + 9, 10, 6);
      r(ctx, '#e8702a', x + 4, y + 3, 6, 6);
      r(ctx, '#e8702a', x + 6, y, 2, 3);
      r(ctx, '#ffffff', x + 3, y + 9, 8, 2);
      r(ctx, '#ffffff', x + 5, y + 4, 4, 2);
      break;
    case 3: // 학생식당 식판 카트
      r(ctx, '#8a949e', x, y + 6, 14, 2);
      for (let i = 0; i < 3; i++) r(ctx, ['#e07a3a', '#f4f1e8', '#7ac05a'][i], x + 1, y + i * 2, 12, 2);
      r(ctx, '#5f6a75', x + 1, y + 8, 2, 7);
      r(ctx, '#5f6a75', x + 11, y + 8, 2, 7);
      r(ctx, '#2a2a2a', x, y + 15, 4, 2);
      r(ctx, '#2a2a2a', x + 10, y + 15, 4, 2);
      break;
    case 4: // 도서관 책 더미
      for (let i = 0; i < 4; i++) {
        const c = ['#c4402f', '#3d5fd6', '#d9a43c', '#4f7a62'][i];
        r(ctx, c, x + (i % 2), y + 13 - i * 4, 13 - (i % 2), 4);
        r(ctx, '#f4f1e8', x + (i % 2) + 1, y + 14 - i * 4, 10 - (i % 2), 1);
      }
      break;
    default: // 시험장 시험지 더미 + 연필
      r(ctx, '#e8e4da', x, y + 4, 14, 13);
      for (let i = 0; i < 4; i++) r(ctx, '#c9c2b2', x, y + 6 + i * 3, 14, 1);
      r(ctx, '#ffffff', x + 1, y + 3, 13, 2);
      r(ctx, '#c4402f', x + 8, y + 7, 4, 4);
      r(ctx, '#f5d76e', x + 2, y, 10, 2);
      r(ctx, '#2a2a2a', x + 12, y, 2, 2);
      break;
  }
}

/** 높은 장애물 (16x58) — 이단 점프로 넘는 큰 물건 */
export function drawTall(ctx: CanvasRenderingContext2D, zone: number, x: number, y: number) {
  const h = 58;
  if (zone === 1) {
    // 사물함
    r(ctx, '#4a6585', x, y, 16, h);
    r(ctx, '#7896b8', x, y, 16, 2);
    r(ctx, '#3d5470', x, y + 28, 16, 2);
    for (const oy of [6, 34]) {
      r(ctx, '#3d5470', x + 3, y + oy, 10, 1);
      r(ctx, '#3d5470', x + 3, y + oy + 3, 10, 1);
      r(ctx, '#c8ccd4', x + 12, y + oy + 8, 2, 5);
    }
    return;
  }
  if (zone === 2) {
    // 게시판 기둥 — 포스터가 덕지덕지
    r(ctx, '#8a7a6a', x + 2, y, 12, h);
    r(ctx, '#a89880', x + 2, y, 3, h);
    const posters = ['#ff9a8a', '#c9f0ff', '#ffe6a0', '#d9c2ff', '#ffffff'];
    for (let i = 0; i < 5; i++) r(ctx, posters[i], x + 1 + (i % 2) * 3, y + 4 + i * 11, 10, 9);
    r(ctx, '#5a4a3a', x, y - 2, 16, 3);
    return;
  }
  if (zone === 3) {
    // 정수기 + 쌓인 컵
    r(ctx, '#d6dde3', x, y + 14, 16, h - 14);
    r(ctx, '#3d8fd6', x + 2, y, 12, 15);
    r(ctx, '#7fc1ea', x + 4, y + 2, 4, 10);
    r(ctx, '#8a949e', x + 4, y + 30, 8, 3);
    r(ctx, '#c4402f', x + 4, y + 26, 3, 3);
    r(ctx, '#3d8fd6', x + 9, y + 26, 3, 3);
    return;
  }
  if (zone === 4 || zone === 5) {
    // 책장
    const wood = zone === 4 ? '#5a3e2b' : '#3a3f4f';
    r(ctx, wood, x, y, 16, h);
    const spines = ['#c4402f', '#3d5fd6', '#d9a43c', '#4f7a62', '#e8e0cf'];
    for (let s = 0; s < 4; s++) {
      const sy = y + 3 + s * 14;
      r(ctx, '#20140c', x + 2, sy, 12, 11);
      for (let b = 0; b < 4; b++) r(ctx, spines[(s + b) % spines.length], x + 2 + b * 3, sy + 2 + (b % 2), 2, 9 - (b % 2));
    }
    return;
  }
  // 교실 — 쌓아 올린 책상 탑
  for (let i = 0; i < 3; i++) {
    const ty = y + i * 19;
    r(ctx, '#8a6a46', x, ty, 16, 4);
    r(ctx, '#a8845a', x, ty, 16, 1);
    r(ctx, '#5a5f66', x + 1, ty + 4, 2, 15);
    r(ctx, '#5a5f66', x + 13, ty + 4, 2, 15);
  }
}

/** 천장에서 내려온 현수막 — 슬라이드로 빠져나간다. bottom 이 아래 끝 */
export function drawHang(ctx: CanvasRenderingContext2D, zone: number, x: number, w: number, bottom: number, t: number) {
  const colors: [string, string][] = [
    ['#2f5d46', '#f4f1e8'],
    ['#2f8f5a', '#e6fbe8'],
    ['#c4402f', '#ffe6a0'],
    ['#e07a3a', '#fff3c4'],
    ['#3d5fd6', '#e8e0cf'],
    ['#8a1f2e', '#ff9a8a'],
  ];
  const [cloth, mark] = colors[zone] ?? colors[0];
  const sway = Math.round(Math.sin(t * 2 + x * 0.05));
  // 봉
  r(ctx, '#5a4632', x - 3, 0, w + 6, 3);
  // 천
  r(ctx, cloth, x + sway, 3, w, bottom - 3);
  r(ctx, 'rgba(255,255,255,0.12)', x + sway, 3, 3, bottom - 3);
  r(ctx, 'rgba(0,0,0,0.18)', x + sway + w - 3, 3, 3, bottom - 3);
  // 아래쪽 경고 띠 — "엎드려!"
  for (let i = 0; i < w; i += 6) r(ctx, mark, x + sway + i, bottom - 9, 3, 4);
  // 술 장식
  for (let i = 1; i < w; i += 4) r(ctx, cloth, x + sway + i, bottom, 2, 3);
}

/* ---------- 발판 ---------- */

const PLAT_STYLE: { top: string; face: string; dark: string }[] = [
  { top: '#c99a62', face: '#a8794a', dark: '#7a5634' }, // 교실 — 책상
  { top: '#d6dde3', face: '#a9b4be', dark: '#7d8791' }, // 복도 — 창턱
  { top: '#b8875a', face: '#9a6a38', dark: '#6b4a2c' }, // 캠퍼스 — 벤치
  { top: '#ffffff', face: '#f4f1e8', dark: '#e07a3a' }, // 학생식당 — 식탁
  { top: '#7a5638', face: '#5a3e2b', dark: '#3a2618' }, // 도서관 — 책장 위
  { top: '#535a6e', face: '#3a3f4f', dark: '#22252e' }, // 시험장 — 책상
];

export function drawPlatform(ctx: CanvasRenderingContext2D, zone: number, x: number, y: number, w: number) {
  const s = PLAT_STYLE[zone] ?? PLAT_STYLE[0];
  r(ctx, s.dark, x, y, w, 7);
  r(ctx, s.face, x, y, w, 5);
  r(ctx, s.top, x, y, w, 2);
  // 받침 — 공중에 떠 있어도 선반처럼 보이게
  r(ctx, s.dark, x + 3, y + 7, 2, 4);
  r(ctx, s.dark, x + w - 5, y + 7, 2, 4);
  if (zone === 4) {
    // 도서관 — 위에 책 몇 권
    const spines = ['#c4402f', '#3d5fd6', '#d9a43c', '#4f7a62'];
    for (let i = 4; i < w - 6; i += 9) r(ctx, spines[(i / 9) % 4 | 0], x + i, y - 6, 3, 6);
  }
}

/* ---------- 학점 · 하트 ---------- */

/** 학점 동전 — 연두색에 A. 빙글빙글 돈다 (폭이 7 → 5 → 2 → 5) */
export function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const frame = Math.floor(t * 8 + x * 0.05) % 4;
  const w = [7, 5, 2, 5][frame];
  const cx = Math.round(x);
  const cy = Math.round(y);
  const left = cx - Math.ceil(w / 2);
  r(ctx, '#7da61e', left, cy - 4, w, 9);
  r(ctx, '#c9f73d', left + (w > 2 ? 1 : 0), cy - 3, w > 2 ? w - 2 : w, 7);
  if (w >= 5) {
    // A
    r(ctx, '#2a3a08', cx - 1, cy - 2, 1, 5);
    r(ctx, '#2a3a08', cx + 1, cy - 2, 1, 5);
    r(ctx, '#2a3a08', cx, cy - 3, 1, 1);
    r(ctx, '#2a3a08', cx - 1, cy, 3, 1);
  }
}

/** 하트 — 체력 회복. 둥실둥실 */
export function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const bob = Math.round(Math.sin(t * 4 + x * 0.1) * 1.5);
  const cx = Math.round(x) - 5;
  const cy = Math.round(y) - 4 + bob;
  r(ctx, '#ff2f8f', cx + 1, cy, 3, 2);
  r(ctx, '#ff2f8f', cx + 6, cy, 3, 2);
  r(ctx, '#ff2f8f', cx, cy + 1, 10, 4);
  r(ctx, '#ff2f8f', cx + 1, cy + 5, 8, 2);
  r(ctx, '#ff2f8f', cx + 3, cy + 7, 4, 1);
  r(ctx, '#ff2f8f', cx + 4, cy + 8, 2, 1);
  r(ctx, '#ffd0e4', cx + 2, cy + 1, 2, 2);
}

/* ---------- 교수님 ---------- */

/**
 * 출석부를 든 교수님 (16x20, 오른쪽을 보고 쫓아온다). 은발 · 안경 · 콧수염 · 남색 정장 ·
 * 빨간 넥타이. 다리만 다른 두 장으로 달린다.
 */
const PROF_PALETTE: Record<string, string> = {
  h: '#c8c8c8',
  s: '#e8c49a',
  g: '#2a2a2a',
  m: '#7a7a7a',
  w: '#f4f4f4',
  t: '#c4402f',
  n: '#2f3a5a',
  N: '#222a42',
  b: '#7a4a2a',
  l: '#c9f73d',
  p: '#3a3d44',
  k: '#1a1a1a',
};
const PROF_TOP = [
  '......hhhh......',
  '.....hhhhhhh....',
  '....hhssssshh...',
  '....hssssssss...',
  '....hsggggggs...',
  '....sssssssss...',
  '.....sssmmss....',
  '......ssssss....',
  '.....wwwtwww....',
  '....nnnwtwnnbb..',
  '...nnnnwtwnnbbl.',
  '...nnnnntnnnbbb.',
  '...nnnnnnnnsbb..',
  '...nnnnnnnnn....',
  '....nnnnnnnn....',
  '....NNNNNNNN....',
];
const PROF_LEGS_A = [
  '....ppp..ppp....',
  '....ppp...ppp...',
  '...ppp.....pp...',
  '...kkk.....kkk..',
];
const PROF_LEGS_B = [
  '....ppp..ppp....',
  '...ppp...ppp....',
  '....pp..ppp.....',
  '...kkk..kkk.....',
];

function bakeWith(grid: string[], palette: Record<string, string>) {
  const c = document.createElement('canvas');
  c.width = grid[0].length;
  c.height = grid.length;
  const g = c.getContext('2d');
  if (!g) return c;
  grid.forEach((line, y) => {
    for (let x = 0; x < line.length; x++) {
      const color = palette[line[x]];
      if (!color) continue;
      g.fillStyle = color;
      g.fillRect(x, y, 1, 1);
    }
  });
  return c;
}

export function bakeProfessor(): [HTMLCanvasElement, HTMLCanvasElement] {
  return [bakeWith([...PROF_TOP, ...PROF_LEGS_A], PROF_PALETTE), bakeWith([...PROF_TOP, ...PROF_LEGS_B], PROF_PALETTE)];
}

/* ---------- 아이템 ---------- */

/** 아이템 — 빛나는 고리 안에 아이콘. (x, y) 가 가운데 */
export function drawItem(ctx: CanvasRenderingContext2D, kind: string, x: number, y: number, t: number) {
  const bob = Math.round(Math.sin(t * 4 + x * 0.1) * 1.5);
  const cx = Math.round(x);
  const cy = Math.round(y) + bob;
  // 빛 — 깜빡이는 마름모 테두리
  const glow = Math.floor(t * 6) % 2 === 0 ? 'rgba(201,247,61,0.85)' : 'rgba(255,255,255,0.7)';
  ctx.fillStyle = glow;
  for (let i = -8; i <= 8; i++) {
    const d = 8 - Math.abs(i);
    ctx.fillRect(cx + i, cy - d, 1, 1);
    ctx.fillRect(cx + i, cy + d, 1, 1);
  }
  ctx.fillStyle = 'rgba(10,10,12,0.7)';
  for (let i = -6; i <= 6; i++) {
    const d = 6 - Math.abs(i);
    ctx.fillRect(cx + i, cy - d, 1, d * 2 + 1);
  }
  const p = (c: string, dx: number, dy: number, w: number, h: number) => {
    ctx.fillStyle = c;
    ctx.fillRect(cx + dx, cy + dy, w, h);
  };
  switch (kind) {
    case 'boost': // 아메리카노 — 흰 컵 · 연두 슬리브 · 김
      p('#f4f1e8', -3, -3, 7, 7);
      p('#5a3a1c', -2, -3, 5, 1);
      p('#c9f73d', -3, -1, 7, 2);
      p('#2a2a2a', -4, -5, 9, 2);
      p('rgba(255,255,255,0.8)', -1, -8 + (Math.floor(t * 4) % 2), 1, 2);
      p('rgba(255,255,255,0.8)', 1, -9 + (Math.floor(t * 4 + 1) % 2), 1, 2);
      break;
    case 'shield': // 족보 — 낡은 노트와 연두 책갈피
      p('#8a5a2c', -4, -4, 8, 9);
      p('#f4f1e8', 3, -3, 1, 7);
      p('#f5d76e', -2, -2, 4, 1);
      p('#f5d76e', -2, 0, 3, 1);
      p('#c9f73d', 1, -5, 2, 4);
      break;
    case 'magnet': // 자석 — 빨간 U 에 은빛 끝
      p('#e0443a', -4, -3, 2, 6);
      p('#e0443a', 2, -3, 2, 6);
      p('#e0443a', -4, 2, 8, 2);
      p('#e8ecf2', -4, -4, 2, 2);
      p('#e8ecf2', 2, -4, 2, 2);
      break;
    default: // 거대화 — 마젠타 원에 겹 화살표
      p('#ff2f8f', -4, -4, 9, 9);
      p('#ffffff', 0, -3, 1, 1);
      p('#ffffff', -1, -2, 3, 1);
      p('#ffffff', -2, -1, 5, 1);
      p('#ffffff', 0, 1, 1, 1);
      p('#ffffff', -1, 2, 3, 1);
      p('#ffffff', -2, 3, 5, 1);
      break;
  }
}
