/**
 * 뛰어라 우왕이 — 배경.
 *
 * 화면 한가운데에 하늘 끝까지 이어진 탑이 서 있고, 나머지 여백은 오른 높이에 따라
 * 숲 → 산맥 → 구름 → 구름 위 → 성층권 → 우주(수성…명왕성) 순으로 바뀐다.
 *
 * 멀리 있는 풍경일수록 천천히 내려간다(시차). 그래서 숲은 금방 발아래로 사라지고,
 * 산맥은 한참 동안 지평선에 걸려 있다가 내려가며, 구름은 그 사이를 스쳐 지나간다.
 * 매 프레임 다시 그리기엔 무거운 것들(산 능선, 숲, 구름 바다, 탑 벽돌, 행성)은
 * 처음에 오프스크린 캔버스로 한 번 구워두고 찍기만 한다.
 */

import { MAX_VIEW_W, PLANET_SPAN_M, PX_PER_M, VIEW_H, ZONES, mulberry32 } from './world';

/** 탑 폭 — 플레이필드(180)보다 좁아서 양옆으로 풍경이 보인다 */
export const TOWER_W = 84;
/** 탑 벽 무늬 한 장의 높이 (24m 마다 반복) */
const TOWER_TILE_H = 240;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** a~b 구간에서 0→1 로 부드럽게 */
const ramp = (v: number, a: number, b: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return `rgb(${Math.round(lerp(A[0], B[0], t))}, ${Math.round(lerp(A[1], B[1], t))}, ${Math.round(
    lerp(A[2], B[2], t)
  )})`;
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  if (!g) throw new Error('2d context unavailable');
  return { c, g };
}

/* ---------- 하늘 ---------- */

type RGB = [number, number, number];

/** 고도(m) 별 하늘 위/아래 색 */
const SKY_KEYS: [number, RGB, RGB][] = (
  [
    [0, '#78bfe9', '#d6eef7'],
    [250, '#5fa9e3', '#c5e4f3'],
    [550, '#4b93da', '#b2d8f0'],
    [900, '#2c6cc6', '#8cbfea'],
    [1400, '#163a86', '#3f7bc4'],
    [2000, '#080c22', '#1b2a5e'],
    [2600, '#04050d', '#0a0e20'],
  ] as [number, string, string][]
).map(([m, a, b]) => [m, hexToRgb(a), hexToRgb(b)]);

const lerpRgb = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgbStr = (c: RGB) => `rgb(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])})`;

function skyAt(m: number): [RGB, RGB] {
  if (m <= SKY_KEYS[0][0]) return [SKY_KEYS[0][1], SKY_KEYS[0][2]];
  for (let i = 1; i < SKY_KEYS.length; i++) {
    const [m1, t1, b1] = SKY_KEYS[i];
    if (m <= m1) {
      const [m0, t0, b0] = SKY_KEYS[i - 1];
      const t = (m - m0) / (m1 - m0);
      return [lerpRgb(t0, t1, t), lerpRgb(b0, b1, t)];
    }
  }
  const last = SKY_KEYS[SKY_KEYS.length - 1];
  return [last[1], last[2]];
}

/* ---------- 구워두는 풍경 ---------- */

/** 산맥 두 겹 — 먼 쪽은 푸르스름하게, 가까운 쪽은 진하게. 높은 봉우리엔 눈 */
function bakeMountains() {
  const H = 150;
  const { c, g } = makeCanvas(MAX_VIEW_W, H);
  const rng = mulberry32(7);
  const ph = Array.from({ length: 6 }, () => rng() * Math.PI * 2);

  for (let x = 0; x < MAX_VIEW_W; x++) {
    const far = 70 + 26 * Math.sin(x * 0.019 + ph[0]) + 16 * Math.sin(x * 0.043 + ph[1]) + 7 * Math.sin(x * 0.11 + ph[2]);
    const top = Math.round(H - far);
    g.fillStyle = '#8193b6';
    g.fillRect(x, top, 1, H - top);
    if (far > 92) {
      g.fillStyle = '#eef3fa';
      g.fillRect(x, top, 1, Math.min(5, Math.round((far - 92) * 0.6) + 2));
    }
  }
  for (let x = 0; x < MAX_VIEW_W; x++) {
    const near = 42 + 18 * Math.sin(x * 0.027 + ph[3]) + 10 * Math.sin(x * 0.061 + ph[4]) + 5 * Math.sin(x * 0.15 + ph[5]);
    const top = Math.round(H - near);
    g.fillStyle = '#5d6f93';
    g.fillRect(x, top, 1, H - top);
    if (near > 62) {
      g.fillStyle = '#dfe7f2';
      g.fillRect(x, top, 1, 2);
    }
  }
  return c;
}

/** 단풍 든 숲 — 바늘잎나무와 둥근 활엽수를 섞는다 (광장과 같은 가을) */
function bakeForest() {
  const H = 70;
  const { c, g } = makeCanvas(MAX_VIEW_W, H);
  const rng = mulberry32(11);
  const crowns = ['#d9822b', '#c2562a', '#e0a83a', '#b8462a'];

  // 숲 바닥
  g.fillStyle = '#3d5a32';
  g.fillRect(0, H - 14, MAX_VIEW_W, 14);

  let x = -6;
  while (x < MAX_VIEW_W + 6) {
    const h = Math.round(lerp(26, 52, rng()));
    const base = H - 10 - Math.round(rng() * 6);
    if (rng() < 0.45) {
      // 바늘잎나무 — 층층이 좁아지는 삼각형
      const w = Math.round(h * 0.5);
      for (let row = 0; row < h; row++) {
        const half = Math.round((w / 2) * (row / h) + ((row % 6) < 3 ? 1 : 0));
        g.fillStyle = row % 6 < 3 ? '#2f5a3a' : '#3b6e45';
        g.fillRect(x - half, base - h + row, half * 2 + 1, 1);
      }
      g.fillStyle = '#4a3220';
      g.fillRect(x, base, 2, 5);
      x += Math.round(lerp(9, 15, rng()));
    } else {
      // 활엽수 — 둥근 단풍 머리
      const r = Math.round(lerp(8, 14, rng()));
      const cy = base - h + r;
      g.fillStyle = '#4a3220';
      g.fillRect(x - 1, cy, 3, base - cy + 5);
      const col = crowns[Math.floor(rng() * crowns.length)];
      for (let dy = -r; dy <= r; dy++) {
        const half = Math.round(Math.sqrt(r * r - dy * dy));
        g.fillStyle = dy < -r / 3 ? mix(col, '#ffffff', 0.12) : col;
        g.fillRect(x - half, cy + dy, half * 2 + 1, 1);
      }
      x += Math.round(lerp(12, 20, rng()));
    }
  }
  return c;
}

/** 구름 바다 — 구름을 뚫고 올라오면 발아래 깔리는 하얀 바닥 */
function bakeCloudSea() {
  const H = 46;
  const { c, g } = makeCanvas(MAX_VIEW_W, H);
  const rng = mulberry32(23);
  g.fillStyle = '#e8eff8';
  g.fillRect(0, 14, MAX_VIEW_W, H - 14);
  let x = 0;
  while (x < MAX_VIEW_W) {
    const r = Math.round(lerp(8, 18, rng()));
    const cy = 14 + Math.round(rng() * 4);
    for (let dy = -r; dy <= 0; dy++) {
      const half = Math.round(Math.sqrt(r * r - dy * dy));
      g.fillStyle = dy < -r * 0.55 ? '#ffffff' : '#f3f7fc';
      g.fillRect(x - half, cy + dy, half * 2 + 1, 1);
    }
    x += Math.round(r * lerp(1.1, 1.7, rng()));
  }
  g.fillStyle = 'rgba(160, 180, 210, 0.35)';
  for (let y = 24; y < H; y += 6) g.fillRect(0, y, MAX_VIEW_W, 1);
  return c;
}

/**
 * 탑 벽 한 장 (24m). 벽돌 줄, 좌우 음영, 12m 마다 좌우 번갈아 아치 창문.
 * space=true 면 우주용 — 차가운 돌빛에 창문과 룬이 푸르게 빛난다.
 */
function bakeTowerTile(space: boolean) {
  const W = TOWER_W;
  const H = TOWER_TILE_H;
  const { c, g } = makeCanvas(W, H);
  const stone = space ? '#5d6276' : '#8a8073';
  const stoneLight = space ? '#737a92' : '#a0968a';
  const mortar = space ? '#3d4152' : '#655c52';
  const rng = mulberry32(space ? 91 : 19);

  g.fillStyle = stone;
  g.fillRect(0, 0, W, H);
  // 벽돌
  for (let row = 0; row < H / 8; row++) {
    const y = row * 8;
    g.fillStyle = mortar;
    g.fillRect(0, y, W, 1);
    const off = row % 2 === 0 ? 0 : 7;
    for (let x = off; x < W; x += 14) {
      g.fillRect(x, y, 1, 8);
      if (rng() < 0.18) {
        g.fillStyle = stoneLight;
        g.fillRect(x + 1, y + 1, 12, 1);
        g.fillStyle = mortar;
      }
    }
  }
  // 둥근 몸통처럼 보이게 좌우 음영
  g.fillStyle = 'rgba(255, 255, 255, 0.10)';
  g.fillRect(0, 0, 8, H);
  g.fillStyle = 'rgba(0, 0, 0, 0.16)';
  g.fillRect(W - 12, 0, 12, H);
  g.fillStyle = 'rgba(0, 0, 0, 0.28)';
  g.fillRect(W - 4, 0, 4, H);

  // 아치 창문 — 24m 한 장에 두 개
  const windows: [number, number][] = [
    [18, 50],
    [W - 30, 170],
  ];
  for (const [wx, wy] of windows) {
    g.fillStyle = mortar;
    g.fillRect(wx - 1, wy - 1, 14, 21);
    g.fillStyle = space ? '#123048' : '#2a1d14';
    g.fillRect(wx, wy + 3, 12, 16);
    g.fillRect(wx + 2, wy + 1, 8, 2);
    g.fillRect(wx + 4, wy, 4, 1);
    g.fillStyle = space ? '#5fd3ff' : '#f2b552';
    g.fillRect(wx + 2, wy + 6, 8, 11);
    g.fillStyle = space ? '#bff0ff' : '#ffe2a0';
    g.fillRect(wx + 3, wy + 7, 3, 4);
    g.fillStyle = mortar;
    g.fillRect(wx + 5, wy + 6, 2, 11);
    g.fillRect(wx + 2, wy + 11, 8, 1);
    // 창턱
    g.fillStyle = stoneLight;
    g.fillRect(wx - 2, wy + 19, 16, 2);
  }

  // 층마다 두르는 띠 돌림
  g.fillStyle = stoneLight;
  g.fillRect(0, 118, W, 3);
  g.fillStyle = mortar;
  g.fillRect(0, 121, W, 1);

  if (space) {
    // 벽에 새겨진 룬
    g.fillStyle = 'rgba(120, 220, 255, 0.55)';
    for (const [rx, ry] of [
      [44, 20],
      [24, 140],
      [52, 206],
    ]) {
      g.fillRect(rx, ry, 1, 7);
      g.fillRect(rx - 2, ry + 2, 5, 1);
      g.fillRect(rx + 2, ry + 5, 2, 1);
    }
  }
  return c;
}

/* ---------- 행성 ---------- */

type PlanetLook = {
  r: number;
  base: string;
  light: string;
  dark: string;
  /** 픽셀 하나의 색을 정한다 (nx, ny 는 -1~1 단위 원 좌표) */
  paint?: (nx: number, ny: number, rng: () => number) => string | null;
  ring?: { color: string; shade: string; rx: number; ry: number; tilt?: boolean };
};

function spots(seed: number, n: number, rMin: number, rMax: number) {
  const rng = mulberry32(seed);
  return Array.from({ length: n }, () => {
    const a = rng() * Math.PI * 2;
    const d = Math.sqrt(rng()) * 0.85;
    return { x: Math.cos(a) * d, y: Math.sin(a) * d, r: lerp(rMin, rMax, rng()) };
  });
}

const MERCURY_CRATERS = spots(3, 9, 0.08, 0.2);
const EARTH_LAND = spots(5, 7, 0.18, 0.38);
const EARTH_CLOUDS = spots(8, 6, 0.08, 0.2);
const MARS_PATCHES = spots(13, 6, 0.12, 0.28);

const inSpot = (nx: number, ny: number, list: { x: number; y: number; r: number }[]) =>
  list.some((s) => (nx - s.x) ** 2 + (ny - s.y) ** 2 < s.r * s.r);

const PLANETS: Record<string, PlanetLook> = {
  mercury: {
    r: 22,
    base: '#a9a49c',
    light: '#c8c3ba',
    dark: '#6f6a63',
    paint: (nx, ny) => (inSpot(nx, ny, MERCURY_CRATERS) ? '#8a857d' : null),
  },
  venus: {
    r: 30,
    base: '#e3c47e',
    light: '#f4dfa6',
    dark: '#a8864a',
    paint: (nx, ny) => (Math.sin(ny * 9 + nx * 2) > 0.55 ? '#efd59a' : null),
  },
  earth: {
    r: 32,
    base: '#3b78c8',
    light: '#6aa2e2',
    dark: '#1f4a86',
    paint: (nx, ny) => {
      if (Math.abs(ny) > 0.82) return '#eef4fa';
      if (inSpot(nx, ny, EARTH_CLOUDS)) return '#f4f8fc';
      if (inSpot(nx, ny, EARTH_LAND)) return ny > 0.3 ? '#8a9a52' : '#5aa04a';
      return null;
    },
  },
  mars: {
    r: 26,
    base: '#c8613a',
    light: '#e08458',
    dark: '#86391f',
    paint: (nx, ny) => {
      if (ny < -0.78) return '#f1ece4';
      if (inSpot(nx, ny, MARS_PATCHES)) return '#a44a2a';
      return null;
    },
  },
  jupiter: {
    r: 58,
    base: '#d9b88a',
    light: '#eed9b5',
    dark: '#93704a',
    paint: (nx, ny) => {
      if ((nx - 0.28) ** 2 / 0.06 + (ny - 0.32) ** 2 / 0.018 < 1) return '#c45a3a';
      const band = Math.floor((ny + 1) * 7);
      return band % 2 === 0 ? '#b98a5e' : null;
    },
  },
  saturn: {
    r: 42,
    base: '#e2c98f',
    light: '#f3e2b4',
    dark: '#a48a52',
    paint: (_nx, ny) => (Math.floor((ny + 1) * 6) % 2 === 0 ? '#d1b274' : null),
    ring: { color: '#d8c79a', shade: '#a99868', rx: 2.15, ry: 0.42 },
  },
  uranus: {
    r: 34,
    base: '#9ad9e0',
    light: '#c3eef2',
    dark: '#5f9ea6',
    ring: { color: '#cfeff3', shade: '#8bbcc2', rx: 0.36, ry: 1.7, tilt: true },
  },
  neptune: {
    r: 33,
    base: '#3d5fd6',
    light: '#6b8bf0',
    dark: '#22368c',
    paint: (nx, ny) => ((nx + 0.25) ** 2 / 0.05 + (ny - 0.15) ** 2 / 0.02 < 1 ? '#1d2c78' : null),
  },
  pluto: {
    r: 16,
    base: '#cdb59a',
    light: '#e3d2bd',
    dark: '#8a735c',
    paint: (nx, ny) => {
      // 하트 모양 평원
      const x = (nx + 0.1) * 1.6;
      const y = -(ny - 0.15) * 1.6;
      const v = (x * x + y * y - 0.3) ** 3 - x * x * y * y * y;
      return v < 0 ? '#f1e6d6' : null;
    },
  },
};

/** 행성 한 장 — 빛은 왼쪽 위에서. 3단 음영으로 둥글게 */
function bakePlanet(id: string) {
  const look = PLANETS[id];
  const r = look.r;
  const ring = look.ring;
  const padX = ring ? Math.ceil(r * Math.max(ring.rx, 1)) + 2 : r + 2;
  const padY = ring ? Math.ceil(r * Math.max(ring.ry, 1)) + 2 : r + 2;
  const { c, g } = makeCanvas(padX * 2, padY * 2);
  const cx = padX;
  const cy = padY;
  const rng = mulberry32(r);

  const ringPixel = (dx: number, dy: number) => {
    if (!ring) return null;
    const e = (dx / (r * ring.rx)) ** 2 + (dy / (r * ring.ry)) ** 2;
    if (e < 0.7 || e > 1) return null;
    return e < 0.84 ? ring.shade : ring.color;
  };
  // 행성 뒤로 지나가는 고리 반쪽
  const behind = (dx: number, dy: number) => (ring?.tilt ? dx < 0 : dy < 0);

  for (let dy = -padY; dy < padY; dy++) {
    for (let dx = -padX; dx < padX; dx++) {
      const inside = dx * dx + dy * dy <= r * r;
      const rp = ringPixel(dx + 0.5, dy + 0.5);
      if (!inside) {
        if (rp) {
          g.fillStyle = rp;
          g.fillRect(cx + dx, cy + dy, 1, 1);
        }
        continue;
      }
      if (rp && !behind(dx, dy)) {
        g.fillStyle = rp;
        g.fillRect(cx + dx, cy + dy, 1, 1);
        continue;
      }
      const nx = (dx + 0.5) / r;
      const ny = (dy + 0.5) / r;
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const lit = -0.55 * nx - 0.5 * ny + 0.67 * nz;
      // 무늬 색 위에 빛(왼쪽 위)과 그늘을 얹는다 — paint 는 늘 #hex 를 돌려준다
      let col = look.paint?.(nx, ny, rng) ?? look.base;
      if (lit > 0.78) col = mix(col, look.light, 0.55);
      else if (lit < 0.2) col = mix(col, look.dark, lit < 0 ? 0.85 : 0.55);
      g.fillStyle = col;
      g.fillRect(cx + dx, cy + dy, 1, 1);
    }
  }
  return { canvas: c, cx, cy, r };
}

/* ---------- 구름 ---------- */

type Cloud = { alt: number; x: number; w: number; p: number; front: boolean; shape: number[] };

/** 380~860m 사이에 흩뿌린 구름 — 구름 구간(550~900m)을 지날 때 스쳐 간다 */
function makeClouds(): Cloud[] {
  const rng = mulberry32(31);
  const out: Cloud[] = [];
  for (let alt = 380 * PX_PER_M; alt < 860 * PX_PER_M; alt += lerp(60, 120, rng())) {
    const w = Math.round(lerp(24, 70, rng()));
    // 가로 막대 몇 줄로 뭉게구름 실루엣을 만든다 (줄마다 폭 비율)
    const rows = 3 + Math.floor(rng() * 3);
    const shape = Array.from({ length: rows }, (_, i) => {
      const t = i / (rows - 1);
      return Math.min(1, 0.45 + Math.sin(t * Math.PI) * 0.6 + rng() * 0.12);
    });
    out.push({ alt, x: rng(), w, p: lerp(0.8, 0.95, rng()), front: rng() < 0.22, shape });
  }
  return out;
}

/* ---------- 별 ---------- */

type Star = { x: number; y: number; s: number; tw: number };

function makeStars(): Star[] {
  const rng = mulberry32(47);
  return Array.from({ length: 150 }, () => ({
    x: rng(),
    y: rng(),
    s: rng() < 0.12 ? 2 : 1,
    tw: rng() * Math.PI * 2,
  }));
}

/* ---------- 배경 전체 ---------- */

export type Background = {
  /** 탑 뒤의 모든 것 — 하늘, 별, 행성, 산, 숲, 구름 */
  drawBack(ctx: CanvasRenderingContext2D, viewW: number, camY: number, t: number): void;
  /** 탑 */
  drawTower(ctx: CanvasRenderingContext2D, viewW: number, camY: number): void;
  /** 탑 앞을 스치는 옅은 구름 (발판·우왕이보다는 뒤) */
  drawFront(ctx: CanvasRenderingContext2D, viewW: number, camY: number): void;
};

export function createBackground(): Background {
  const mountains = bakeMountains();
  const forest = bakeForest();
  const cloudSea = bakeCloudSea();
  const towerDay = bakeTowerTile(false);
  const towerSpace = bakeTowerTile(true);
  const clouds = makeClouds();
  const stars = makeStars();
  const planetCache = new Map<string, ReturnType<typeof bakePlanet>>();

  const planet = (id: string) => {
    let p = planetCache.get(id);
    if (!p) {
      p = bakePlanet(id);
      planetCache.set(id, p);
    }
    return p;
  };

  /** 월드 고도(px) → 화면 y */
  const sy = (worldY: number, camY: number) => VIEW_H - (worldY - camY);

  function drawCloud(ctx: CanvasRenderingContext2D, c: Cloud, x: number, y: number, alpha: number) {
    ctx.globalAlpha = alpha;
    const rowH = 4;
    const top = y - c.shape.length * rowH;
    c.shape.forEach((k, i) => {
      const w = Math.round(c.w * k);
      ctx.fillStyle = i === c.shape.length - 1 ? '#dbe6f2' : i === 0 ? '#ffffff' : '#f5f8fc';
      ctx.fillRect(Math.round(x - w / 2), top + i * rowH, w, rowH);
    });
    ctx.globalAlpha = 1;
  }

  function drawBack(ctx: CanvasRenderingContext2D, viewW: number, camY: number, t: number) {
    // 화면 가운데 높이(m) 기준으로 풍경을 고른다
    const m = (camY + VIEW_H / 2) / PX_PER_M;

    // 하늘 — 8px 계단식 그라데이션 (픽셀 느낌)
    const [top, bottom] = skyAt(m);
    const bands = VIEW_H / 8;
    for (let i = 0; i < bands; i++) {
      ctx.fillStyle = rgbStr(lerpRgb(top, bottom, i / (bands - 1)));
      ctx.fillRect(0, i * 8, viewW, 8);
    }

    // 별 — 구름 위부터 서서히, 우주에선 또렷하게. 오를수록 아주 천천히 흘러내린다
    const starA = ramp(m, 900, 2200);
    if (starA > 0) {
      for (const s of stars) {
        const y = (s.y * VIEW_H + camY * 0.02) % VIEW_H;
        const tw = 0.6 + 0.4 * Math.sin(t * 2 + s.tw);
        ctx.globalAlpha = starA * tw;
        ctx.fillStyle = s.s === 2 ? '#fff6d8' : '#ffffff';
        ctx.fillRect(Math.round(s.x * viewW), Math.round(y), s.s, s.s);
      }
      ctx.globalAlpha = 1;
    }

    // 행성 — 구간(1km) 동안 화면 위에서 아래로 지나간다. 좌우 번갈아
    for (let i = 0; i < ZONES.length; i++) {
      const z = ZONES[i];
      if (!PLANETS[z.id]) continue;
      const q = (m - z.from) / PLANET_SPAN_M;
      // 다가오는 행성은 300m 전에 미리 구워 둔다 (목성처럼 큰 건 굽는 데 한 프레임이 걸린다)
      if (q >= -0.3 && q < 0) planet(z.id);
      if (q < 0 || q > 1) continue;
      const p = planet(z.id);
      const left = i % 2 === 1;
      const off = TOWER_W / 2 + p.r * 0.75 + 14;
      const cx = Math.round(
        Math.min(viewW - p.r * 0.35, Math.max(p.r * 0.35, viewW / 2 + (left ? -off : off)))
      );
      const cy = Math.round(-p.r * 1.2 + q * (VIEW_H + p.r * 2.4));
      ctx.drawImage(p.canvas, cx - p.cx, cy - p.cy);
    }

    // 지구의 둥근 가장자리 — 성층권에서 발아래로 드러나 우주에 들어서며 가라앉는다
    const arcA = ramp(m, 1450, 1750) * (1 - ramp(m, 2350, 2700));
    if (arcA > 0) {
      const yTop = 250 + (camY - 1500 * PX_PER_M) * 0.008;
      const R = 1100;
      ctx.globalAlpha = arcA;
      for (let x = 0; x < viewW; x += 2) {
        const dx = x - viewW / 2;
        const y = Math.round(yTop + R - Math.sqrt(R * R - dx * dx));
        if (y >= VIEW_H) continue;
        ctx.fillStyle = '#9fe6ff';
        ctx.fillRect(x, y - 3, 2, 3);
        ctx.fillStyle = '#2f6fb4';
        ctx.fillRect(x, y, 2, VIEW_H - y);
        ctx.fillStyle = '#4f9a58';
        if (Math.sin(x * 0.05) > 0.4) ctx.fillRect(x, y + 6, 2, VIEW_H - y);
      }
      ctx.globalAlpha = 1;
    }

    // 구름 바다 — 구름을 뚫고 오르면 발아래 깔리고, 성층권에서 흐려진다
    const seaA = ramp(m, 760, 920) * (1 - ramp(m, 1500, 1800));
    if (seaA > 0) {
      const y = Math.round(150 + (camY - 760 * PX_PER_M) * 0.015);
      if (y < VIEW_H) {
        ctx.globalAlpha = seaA;
        ctx.drawImage(cloudSea, 0, 0, viewW, cloudSea.height, 0, y, viewW, cloudSea.height);
        ctx.fillStyle = '#e8eff8';
        ctx.fillRect(0, y + cloudSea.height, viewW, Math.max(0, VIEW_H - y - cloudSea.height));
        ctx.globalAlpha = 1;
      }
    }

    // 산맥 — 아주 멀어서 숲보다 천천히 가라앉는다. 처음엔 숲 뒤에 봉우리만 보이다가,
    // 숲이 발아래로 빠지는 250m 무렵 지평선에 온전히 드러나고 ~700m 에서 사라진다
    const mountY = Math.round(210 + camY * 0.03);
    if (mountY - mountains.height < VIEW_H) {
      ctx.drawImage(mountains, 0, 0, viewW, mountains.height, 0, mountY - mountains.height, viewW, mountains.height);
      ctx.fillStyle = '#5d6f93';
      if (mountY < VIEW_H) ctx.fillRect(0, mountY, viewW, VIEW_H - mountY);
    }

    // 숲 — 산보다 가까워 조금 더 빨리 가라앉는다 (~260m 에서 사라짐)
    const forestY = Math.round(234 + camY * 0.05);
    if (forestY - forest.height < VIEW_H) {
      ctx.drawImage(forest, 0, 0, viewW, forest.height, 0, forestY - forest.height, viewW, forest.height);
      ctx.fillStyle = '#3d5a32';
      if (forestY < VIEW_H) ctx.fillRect(0, forestY, viewW, VIEW_H - forestY);
    }

    // 지나가는 구름 (탑 뒤)
    for (const c of clouds) {
      if (c.front) continue;
      const y = VIEW_H - (c.alt - camY * c.p);
      if (y < -10 || y > VIEW_H + 30) continue;
      drawCloud(ctx, c, c.x * viewW, y, 0.92);
    }
  }

  function drawTower(ctx: CanvasRenderingContext2D, viewW: number, camY: number) {
    const m = (camY + VIEW_H / 2) / PX_PER_M;
    const x = Math.round(viewW / 2 - TOWER_W / 2);
    const spaceA = ramp(m, 1500, 2300);

    const first = Math.max(0, Math.floor(camY / TOWER_TILE_H));
    const last = Math.floor((camY + VIEW_H) / TOWER_TILE_H);
    for (let k = first; k <= last; k++) {
      const top = Math.round(sy((k + 1) * TOWER_TILE_H, camY));
      if (spaceA < 1) ctx.drawImage(towerDay, x, top);
      if (spaceA > 0) {
        ctx.globalAlpha = spaceA;
        ctx.drawImage(towerSpace, x, top);
        ctx.globalAlpha = 1;
      }
    }

    // 탑 밑동 — 땅에 닿는 곳의 큰 문과 주춧돌
    const groundY = Math.round(sy(0, camY));
    if (groundY > -40 && groundY < VIEW_H + 40) {
      ctx.fillStyle = '#6e665b';
      ctx.fillRect(x - 6, groundY - 10, TOWER_W + 12, 10);
      ctx.fillStyle = '#857c70';
      ctx.fillRect(x - 6, groundY - 10, TOWER_W + 12, 2);
      const dx = Math.round(viewW / 2 - 13);
      ctx.fillStyle = '#4a3220';
      ctx.fillRect(dx, groundY - 40, 26, 30);
      ctx.fillRect(dx + 3, groundY - 44, 20, 4);
      ctx.fillRect(dx + 7, groundY - 46, 12, 2);
      ctx.fillStyle = '#6b4a2c';
      for (let i = 0; i < 4; i++) ctx.fillRect(dx + 3 + i * 6, groundY - 38, 4, 28);
      ctx.fillStyle = '#d9a43c';
      ctx.fillRect(dx + 18, groundY - 26, 2, 3);
    }
  }

  function drawFront(ctx: CanvasRenderingContext2D, viewW: number, camY: number) {
    for (const c of clouds) {
      if (!c.front) continue;
      const y = VIEW_H - (c.alt - camY * c.p);
      if (y < -10 || y > VIEW_H + 30) continue;
      drawCloud(ctx, c, c.x * viewW, y, 0.55);
    }
  }

  return { drawBack, drawTower, drawFront };
}
