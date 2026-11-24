// 광장 아트 공통 도구 — 재질(램프) · 재질 버퍼(Mat) · 질감 · 면 투영.
//
// 그림은 색을 바로 찍지 않고 "재질 번호 + 밝기 값"으로 쌓는다. 그림자 · 처마 그늘 ·
// 옆면은 밝기 값만 낮추고, 마지막에 재질마다 준비한 색 단계(어두울수록 푸르게, 밝을수록
// 누렇게 도는 램프)에서 색을 고른다. 그래야 어두운 곳이 탁한 회색이 아니라 색이 도는
// 그늘이 되고, 단계 사이만 디더로 섞인다.
const path = require('path');
const P = require(path.join(__dirname, '..', 'vendor', 'codixel', 'pixel.js'));

/** 화면 크기 (광장 좌표 480x270 의 2배) */
const W = 960;
const H = 540;
/** 빛은 왼쪽 위에서 온다 */
const LIGHT = [-0.6, -0.8];

/* ---------- 재질 ---------- */

const MATS = [null];
const M = {};
/** hue · sat · 밝기 범위로 색 단계를 만든다 (어두운 쪽은 파랑, 밝은 쪽은 노랑으로 돈다) */
function mat(name, hue, sat, l0, l1, n = 6, shift = 36) {
  MATS.push(P.hueRamp(n, { hue, sat, light: [l0, l1], shift }).map(P.unpack));
  M[name] = MATS.length - 1;
  return M[name];
}
/** 색을 직접 지정한 재질 */
function matCols(name, cols) {
  MATS.push(cols);
  M[name] = MATS.length - 1;
  return M[name];
}

// 벽
mat('plaster', 42, 0.36, 0.36, 0.86, 7);
mat('plasterOchre', 36, 0.5, 0.3, 0.76, 7);
mat('plasterRose', 14, 0.4, 0.3, 0.74, 7);
mat('plasterBlue', 204, 0.2, 0.3, 0.76, 7);
mat('plasterSage', 96, 0.18, 0.3, 0.74, 7);
mat('timber', 22, 0.42, 0.08, 0.36, 6);
mat('timberRed', 6, 0.45, 0.1, 0.36, 6);
mat('wood', 28, 0.45, 0.14, 0.52, 6);
mat('woodPale', 34, 0.4, 0.24, 0.66, 6);
mat('stone', 36, 0.13, 0.2, 0.7, 7);
mat('stoneCool', 222, 0.1, 0.18, 0.68, 7);
mat('stonePale', 44, 0.16, 0.34, 0.84, 7);
mat('brick', 12, 0.42, 0.16, 0.56, 6);
// 지붕
mat('roofTerra', 14, 0.56, 0.14, 0.58, 6);
mat('roofSlate', 214, 0.3, 0.12, 0.52, 6);
mat('roofPlum', 318, 0.2, 0.12, 0.46, 6);
mat('roofBrown', 26, 0.38, 0.12, 0.46, 6);
mat('roofTeal', 176, 0.3, 0.12, 0.48, 6);
// 땅
mat('cobble', 34, 0.13, 0.2, 0.64, 7);
mat('dirt', 30, 0.3, 0.12, 0.44, 6);
mat('grass', 84, 0.38, 0.12, 0.46, 6);
// 잎
mat('leafOrange', 22, 0.72, 0.16, 0.64, 6, 30);
mat('leafRed', 6, 0.66, 0.14, 0.54, 6, 30);
mat('leafGold', 42, 0.74, 0.22, 0.68, 6, 24);
mat('leafGreen', 104, 0.4, 0.12, 0.5, 6);
mat('bark', 24, 0.3, 0.08, 0.4, 6);
// 천
mat('clothRed', 356, 0.62, 0.16, 0.6, 6, 24);
mat('clothCream', 44, 0.4, 0.4, 0.9, 6);
mat('clothGreen', 140, 0.4, 0.14, 0.52, 6);
mat('clothBlue', 214, 0.46, 0.14, 0.56, 6);
mat('clothPurple', 272, 0.4, 0.12, 0.52, 6);
mat('clothGold', 42, 0.7, 0.24, 0.7, 6, 24);
mat('clothTeal', 180, 0.4, 0.14, 0.52, 6);
mat('clothBrown', 26, 0.36, 0.14, 0.5, 6);
mat('clothGray', 230, 0.08, 0.16, 0.6, 6);
mat('clothBlack', 250, 0.14, 0.05, 0.3, 6);
mat('clothWhite', 50, 0.16, 0.5, 0.95, 6);
// 쇠 · 금 · 유리
mat('iron', 228, 0.12, 0.06, 0.4, 6);
mat('steel', 216, 0.12, 0.2, 0.86, 7);
mat('gold', 44, 0.72, 0.22, 0.8, 6, 24);
mat('glass', 206, 0.3, 0.12, 0.56, 6);
mat('hay', 46, 0.6, 0.22, 0.72, 6, 20);
// 물 · 안개 · 먼 바위
mat('water', 196, 0.42, 0.16, 0.74, 7, 20);
mat('mist', 210, 0.16, 0.5, 0.94, 6, 10);
mat('rock', 250, 0.1, 0.16, 0.6, 7);
mat('pumpkin', 26, 0.8, 0.2, 0.62, 6, 24);
// 살갗 · 머리
mat('skin', 24, 0.5, 0.3, 0.8, 6, 20);
mat('skinTan', 22, 0.46, 0.24, 0.66, 6, 20);
mat('skinOrc', 96, 0.34, 0.16, 0.56, 6);
mat('hairBrown', 24, 0.44, 0.08, 0.38, 5);
mat('hairBlack', 250, 0.16, 0.04, 0.26, 5);
mat('hairBlond', 46, 0.6, 0.3, 0.8, 5, 20);
mat('hairGray', 220, 0.06, 0.34, 0.86, 5);
mat('hairRed', 14, 0.7, 0.14, 0.52, 5, 20);

const WARM = { core: [255, 236, 170], mid: [255, 200, 110], edge: [236, 140, 62] };

/* ---------- 작은 도구 ---------- */

const clamp = P.clamp;
const hash = P.hash;
const fbm = P.fbm;
const lerp = (a, b, u) => a + (b - a) * u;

/** 재질 버퍼 — 픽셀마다 재질 번호와 밝기 값. lit 은 등불이 켜질 때 색, glow 는 늘 빛나는 색 */
class Mat {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.m = new Uint8Array(w * h);
    this.v = new Float32Array(w * h);
    this.lit = new Uint32Array(w * h);
    this.glow = new Uint32Array(w * h);
    /** 빛 웅덩이 — { x, y, r, power, color } */
    this.lights = [];
  }

  inside(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  put(x, y, m, v) {
    x = Math.round(x);
    y = Math.round(y);
    if (!this.inside(x, y)) return;
    const i = y * this.w + x;
    this.m[i] = m;
    this.v[i] = v;
    this.lit[i] = 0;
    this.glow[i] = 0;
  }

  /** 밝기만 바꾼다 (그림자 · 하이라이트) */
  add(x, y, dv) {
    x = Math.round(x);
    y = Math.round(y);
    if (!this.inside(x, y)) return;
    const i = y * this.w + x;
    if (this.m[i]) this.v[i] += dv;
  }

  at(x, y) {
    x = Math.round(x);
    y = Math.round(y);
    return this.inside(x, y) ? this.m[y * this.w + x] : 0;
  }

  setLit(x, y, c) {
    x = Math.round(x);
    y = Math.round(y);
    if (this.inside(x, y) && this.m[y * this.w + x]) this.lit[y * this.w + x] = P.col(c);
  }

  setGlow(x, y, c) {
    x = Math.round(x);
    y = Math.round(y);
    if (!this.inside(x, y)) return;
    const i = y * this.w + x;
    if (!this.m[i]) {
      this.m[i] = M.iron;
      this.v[i] = 0.5;
    }
    this.glow[i] = P.col(c);
  }

  clearPx(x, y) {
    x = Math.round(x);
    y = Math.round(y);
    if (!this.inside(x, y)) return;
    const i = y * this.w + x;
    this.m[i] = 0;
    this.lit[i] = 0;
    this.glow[i] = 0;
  }

  rect(x0, y0, x1, y1, m, v) {
    x0 = Math.max(0, Math.round(x0));
    y0 = Math.max(0, Math.round(y0));
    x1 = Math.min(this.w, Math.round(x1));
    y1 = Math.min(this.h, Math.round(y1));
    const f = typeof v === 'function';
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) this.put(x, y, m, f ? v(x, y) : v);
  }

  shade(x0, y0, x1, y1, dv) {
    x0 = Math.max(0, Math.round(x0));
    y0 = Math.max(0, Math.round(y0));
    x1 = Math.min(this.w, Math.round(x1));
    y1 = Math.min(this.h, Math.round(y1));
    const f = typeof dv === 'function';
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const i = y * this.w + x;
        if (this.m[i]) this.v[i] += f ? dv(x, y) : dv;
      }
  }

  /** 다각형 채우기 — v 는 밝기 값이거나 (x, y) => 밝기 */
  poly(pts, m, v) {
    let y0 = Infinity, y1 = -Infinity;
    for (const p of pts) {
      y0 = Math.min(y0, p[1]);
      y1 = Math.max(y1, p[1]);
    }
    y0 = Math.max(Math.floor(y0), 0);
    y1 = Math.min(Math.ceil(y1), this.h - 1);
    const f = typeof v === 'function';
    const xs = [];
    for (let y = y0; y <= y1; y++) {
      const sy = y + 0.5;
      xs.length = 0;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= sy && b[1] > sy) || (b[1] <= sy && a[1] > sy)) xs.push(a[0] + ((sy - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2)
        for (let x = Math.round(xs[i]); x < Math.round(xs[i + 1]); x++) this.put(x, y, m, f ? v(x, y) : v);
    }
  }

  /** 다각형 안의 밝기만 바꾼다 */
  shadePoly(pts, dv) {
    let y0 = Infinity, y1 = -Infinity;
    for (const p of pts) {
      y0 = Math.min(y0, p[1]);
      y1 = Math.max(y1, p[1]);
    }
    y0 = Math.max(Math.floor(y0), 0);
    y1 = Math.min(Math.ceil(y1), this.h - 1);
    const xs = [];
    for (let y = y0; y <= y1; y++) {
      const sy = y + 0.5;
      xs.length = 0;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= sy && b[1] > sy) || (b[1] <= sy && a[1] > sy)) xs.push(a[0] + ((sy - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.round(xs[i]); x < Math.round(xs[i + 1]); x++) this.add(x, y, dv);
    }
  }

  /** 굵기가 있는 선 — 빛을 받는 쪽 가장자리는 밝게, 반대쪽은 어둡게 (나무 기둥 · 쇠막대) */
  beam(x0, y0, x1, y1, w, m, base = 0.5, bevel = 0.2) {
    const len = Math.hypot(x1 - x0, y1 - y0) || 1;
    const dx = (x1 - x0) / len, dy = (y1 - y0) / len;
    const nx = -dy, ny = dx;
    const lit = -(nx * LIGHT[0] + ny * LIGHT[1]);
    const hw = w / 2;
    const bx0 = Math.floor(Math.min(x0, x1) - hw - 1), bx1 = Math.ceil(Math.max(x0, x1) + hw + 1);
    const by0 = Math.floor(Math.min(y0, y1) - hw - 1), by1 = Math.ceil(Math.max(y0, y1) + hw + 1);
    for (let y = by0; y <= by1; y++)
      for (let x = bx0; x <= bx1; x++) {
        const px = x + 0.5 - x0, py = y + 0.5 - y0;
        const t = px * dx + py * dy;
        if (t < 0 || t > len) continue;
        const s = px * nx + py * ny;
        if (Math.abs(s) > hw) continue;
        const grain = (fbm(t * 0.5 + x0, s * 2 + y0, 2, 3) - 0.5) * 0.12;
        this.put(x, y, m, base + (s / hw) * lit * bevel + grain);
      }
  }

  /** 1픽셀 선 */
  line(x0, y0, x1, y1, m, v) {
    const n = Math.max(Math.abs(Math.round(x1 - x0)), Math.abs(Math.round(y1 - y0)), 1);
    for (let i = 0; i <= n; i++) this.put(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, m, v);
  }

  /** 원 · 타원 채우기 */
  disc(cx, cy, rx, ry, m, v) {
    const f = typeof v === 'function';
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.put(x, y, m, f ? v(x, y, dx, dy) : v);
      }
  }

  /** 다른 재질 버퍼를 (x, y) 에 얹는다 */
  blit(src, x, y, dv = 0) {
    x = Math.round(x);
    y = Math.round(y);
    for (let j = 0; j < src.h; j++)
      for (let i = 0; i < src.w; i++) {
        const k = j * src.w + i;
        if (!src.m[k]) continue;
        const X = x + i, Y = y + j;
        if (!this.inside(X, Y)) continue;
        const d = Y * this.w + X;
        this.m[d] = src.m[k];
        this.v[d] = src.v[k] + dv;
        this.lit[d] = src.lit[k];
        this.glow[d] = src.glow[k];
      }
    for (const l of src.lights) this.lights.push({ ...l, x: l.x + x, y: l.y + y });
  }

  /**
   * 평평하게 그린 면을 기울여 붙인다 — 화면의 점 = O + u*A + v*B (u, v 는 src 의 픽셀).
   * 옆벽 · 지붕면처럼 비스듬히 보이는 면에 쓴다. dv 로 면 전체를 밝히거나 어둡힌다.
   */
  project(src, O, A, B, dv = 0) {
    const det = A[0] * B[1] - A[1] * B[0];
    if (Math.abs(det) < 1e-6) return;
    const cs = [O, [O[0] + A[0] * src.w, O[1] + A[1] * src.w], [O[0] + B[0] * src.h, O[1] + B[1] * src.h], [O[0] + A[0] * src.w + B[0] * src.h, O[1] + A[1] * src.w + B[1] * src.h]];
    const x0 = Math.max(0, Math.floor(Math.min(...cs.map((c) => c[0])))), x1 = Math.min(this.w - 1, Math.ceil(Math.max(...cs.map((c) => c[0]))));
    const y0 = Math.max(0, Math.floor(Math.min(...cs.map((c) => c[1])))), y1 = Math.min(this.h - 1, Math.ceil(Math.max(...cs.map((c) => c[1]))));
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const px = x + 0.5 - O[0], py = y + 0.5 - O[1];
        const u = Math.floor((px * B[1] - py * B[0]) / det), v = Math.floor((A[0] * py - A[1] * px) / det);
        if (u < 0 || v < 0 || u >= src.w || v >= src.h) continue;
        const k = v * src.w + u;
        if (!src.m[k]) continue;
        const d = y * this.w + x;
        this.m[d] = src.m[k];
        this.v[d] = src.v[k] + dv;
        this.lit[d] = src.lit[k];
        this.glow[d] = src.glow[k];
      }
    for (const l of src.lights) this.lights.push({ ...l, x: O[0] + A[0] * l.x + B[0] * l.y, y: O[1] + A[1] * l.x + B[1] * l.y });
  }

  /** 좌우로 뒤집은 사본 */
  flipped() {
    const o = new Mat(this.w, this.h);
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const s = y * this.w + (this.w - 1 - x), d = y * this.w + x;
        o.m[d] = this.m[s];
        o.v[d] = this.v[s];
        o.lit[d] = this.lit[s];
        o.glow[d] = this.glow[s];
      }
    o.lights = this.lights.map((l) => ({ ...l, x: this.w - 1 - l.x }));
    return o;
  }

  /** 낮 색으로 풀어낸 그림 — col(낮) · lit(등불 켰을 때) · glow(늘 빛남) */
  resolve(ox = 0, oy = 0) {
    const col = new P.Buf(this.w, this.h), lit = new P.Buf(this.w, this.h), glow = new P.Buf(this.w, this.h);
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const i = y * this.w + x, m = this.m[i];
        if (!m) continue;
        const ramp = MATS[m];
        col.px[i] = P.col(ramp[P.band(this.v[i], ramp.length, x + ox, y + oy, 0.3)]);
        lit.px[i] = this.lit[i];
        glow.px[i] = this.glow[i];
      }
    return { col, lit, glow, lights: this.lights };
  }
}

/* ---------- 질감 ---------- */

/** 회벽 — 넓게 얼룩지고, 가까이선 고르다 */
function plaster(mt, x0, y0, x1, y1, m, seed = 1, base = 0.62) {
  mt.rect(x0, y0, x1, y1, m, (x, y) => base + (fbm(x * 0.045 + seed, y * 0.07, 3, seed) - 0.5) * 0.34 + (hash(x, y, seed) - 0.5) * 0.03);
}

/** 다듬은 돌 쌓기 — 줄마다 엇갈리고, 돌마다 밝기가 조금씩 다르다 */
function ashlar(mt, x0, y0, x1, y1, m, o = {}) {
  const bh = o.bh ?? 7, bw = o.bw ?? 13, seed = o.seed ?? 1, base = o.base ?? 0.55;
  mt.rect(x0, y0, x1, y1, m, (x, y) => {
    const row = Math.floor((y - y0) / bh), ry = (y - y0) % bh;
    const w = bw + Math.round((hash(row, seed, 5) - 0.5) * 4);
    const off = Math.round(hash(row, seed, 9) * w);
    const cx = Math.floor((x - x0 + off) / w), rx = (x - x0 + off) % w;
    const tone = (hash(cx, row, seed) - 0.5) * 0.26 + (fbm(x * 0.06, y * 0.06, 2, seed) - 0.5) * 0.14;
    if (ry === bh - 1 || rx === w - 1) return base - 0.3 + tone * 0.4; // 줄눈
    if (ry === 0 || rx === 0) return base + 0.11 + tone; // 빛 받는 모서리
    return base + tone;
  });
}

/** 벽돌 */
function bricks(mt, x0, y0, x1, y1, m, seed = 1, base = 0.55) {
  ashlar(mt, x0, y0, x1, y1, m, { bh: 4, bw: 8, seed, base });
}

/** 세로 판자 (문 · 덧문 · 상자) */
function planks(mt, x0, y0, x1, y1, m, o = {}) {
  const pw = o.pw ?? 4, seed = o.seed ?? 1, base = o.base ?? 0.5;
  mt.rect(x0, y0, x1, y1, m, (x, y) => {
    const k = Math.floor((x - x0) / pw), rx = (x - x0) % pw;
    const tone = (hash(k, seed, 3) - 0.5) * 0.2 + (fbm(x * 0.9, y * 0.12, 2, seed) - 0.5) * 0.16;
    if (rx === pw - 1) return base - 0.22 + tone * 0.5;
    if (rx === 0) return base + 0.08 + tone;
    return base + tone;
  });
}

/** 가로 판자 */
function planksH(mt, x0, y0, x1, y1, m, o = {}) {
  const pw = o.pw ?? 4, seed = o.seed ?? 1, base = o.base ?? 0.5;
  mt.rect(x0, y0, x1, y1, m, (x, y) => {
    const k = Math.floor((y - y0) / pw), ry = (y - y0) % pw;
    const tone = (hash(k, seed, 3) - 0.5) * 0.2 + (fbm(x * 0.12, y * 0.9, 2, seed) - 0.5) * 0.16;
    if (ry === pw - 1) return base - 0.22 + tone * 0.5;
    if (ry === 0) return base + 0.08 + tone;
    return base + tone;
  });
}

/**
 * 기와 — 줄마다 반 칸씩 엇갈리는 비늘 기와. 위가 용마루, 아래로 갈수록 처마.
 * 처마 가까이에는 이끼가 낀다.
 */
function tiles(mt, x0, y0, x1, y1, m, o = {}) {
  const th = o.th ?? 4, tw = o.tw ?? 6, seed = o.seed ?? 1, base = o.base ?? 0.56, moss = o.moss ?? 0.14;
  const hgt = y1 - y0;
  for (let y = Math.round(y0); y < Math.round(y1); y++)
    for (let x = Math.round(x0); x < Math.round(x1); x++) {
      const row = Math.floor((y - y0) / th), ry = (y - y0) % th;
      const off = row % 2 ? tw / 2 : 0;
      const cx = Math.floor((x - x0 + off) / tw), rx = Math.floor(x - x0 + off) % tw;
      const tone = (hash(cx, row, seed) - 0.5) * 0.3 + (fbm(x * 0.05, y * 0.05, 2, seed) - 0.5) * 0.18;
      let v = base + tone - ((y - y0) / hgt) * 0.06;
      if (ry === th - 1) v -= 0.26; // 기와 아랫단 그늘
      else if (ry === 0) v += 0.1; // 윗단은 하늘빛을 받는다
      if (rx === tw - 1 && ry >= 1) v -= 0.14;
      let mm = m;
      if (moss && fbm(x * 0.11 + seed, y * 0.16, 3, seed + 7) > 0.8 - moss * ((y - y0) / hgt)) {
        mm = M.leafGreen;
        v = 0.34 + tone * 0.6;
      }
      mt.put(x, y, mm, v);
    }
}

/** 줄무늬 천 (차양 · 천막) */
function stripes(mt, x0, y0, x1, y1, ma, mb, o = {}) {
  const sw = o.sw ?? 6;
  for (let y = Math.round(y0); y < Math.round(y1); y++)
    for (let x = Math.round(x0); x < Math.round(x1); x++)
      mt.put(x, y, Math.floor((x - x0) / sw) % 2 ? mb : ma, (o.base ?? 0.62) + (fbm(x * 0.2, y * 0.1, 2, 3) - 0.5) * 0.1);
}

module.exports = { P, W, H, LIGHT, MATS, M, mat, matCols, Mat, WARM, clamp, hash, fbm, lerp, plaster, ashlar, bricks, planks, planksH, tiles, stripes };
