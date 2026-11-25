// 계절 옷 — 같은 광장에 계절마다 다른 옷을 입힌다.
//
//   autumn     가을 (처음 그린 그대로)
//   christmas  크리스마스 — 눈 덮인 지붕 · 바닥 · 나무, 늘푸른 장식줄과 리본, 꼬마전구, 계단 양옆의 트리,
//              눈사람과 선물 더미, 털모자와 목도리를 두른 사람들, 흩날리는 눈(화면이 그린다)
//
// 눈은 그림마다 손으로 얹지 않는다. 재질 버퍼(Mat)를 훑어 "위가 비어 있는 가장자리"에 눈을 쌓고,
// 지붕 · 바닥 · 풀 · 단풍 재질을 눈과 늘푸른 잎으로 바꾼다 (snowify). 그래서 어느 그림에나 같은 규칙이 먹는다.
// 꼬마전구는 그림에 굽지 않고 자리만 내보낸다 — 화면이 시간대에 맞춰 반짝이게 그린다.
const { P, M, MATS, Mat, WARM, clamp, hash, fbm } = require('./kit');
const L = require('./layout');

const SEASONS = ['autumn', 'christmas'];

/* ---------- 눈 ---------- */

const ROOF = new Set([M.roofTerra, M.roofSlate, M.roofPlum, M.roofBrown, M.roofTeal]);
const LEAF = new Set([M.leafOrange, M.leafRed, M.leafGold, M.leafGreen]);
const GROUND = new Set([M.cobble, M.dirt, M.grass]);
/** 눈이 쌓이지 않는 것 — 빛나는 것 · 물 · 유리 · 이미 눈 */
const NOSNOW = new Set([M.water, M.glass, M.snow, M.mist]);

/**
 * 재질 버퍼에 눈을 입힌다.
 * o.ground: 바닥이 눈에 덮이는 정도 (0~1), o.trodden(x, y): 사람이 많이 다녀 눈이 녹은 정도 (0~1)
 * o.ox · o.oy: 이 버퍼가 화면에 놓이는 자리 (무늬가 이웃 그림과 이어지게)
 * o.extra(x, y, m, v): 그 밖에 눈으로 바꿀 자리를 고른다 (계단 디딤판 등) — true 면 눈
 */
function snowify(mt, o = {}) {
  const { w, h } = mt;
  const ox = o.ox ?? 0, oy = o.oy ?? 0, seed = o.seed ?? 1;
  const ground = o.ground ?? 0.7;
  const m = mt.m, v = mt.v;
  const snowAt = (i, val) => {
    m[i] = M.snow;
    v[i] = val;
    mt.lit[i] = 0;
  };
  // 1) 위가 빈 가장자리에 쌓이는 눈 — 원래 모양을 기준으로 먼저 고른다
  const caps = [];
  if (o.caps !== false)
    for (let y = 1; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (!m[i] || m[i - w] || NOSNOW.has(m[i]) || mt.glow[i]) continue;
        const X = x + ox, Y = y + oy;
        const d = 1 + (hash(X, Y, seed) < 0.55 ? 1 : 0) + (fbm(X * 0.15, Y * 0.2, 2, seed) > 0.62 ? 1 : 0);
        caps.push([x, y, d]);
      }
  // 2) 재질 바꾸기
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x, mm = m[i];
      if (!mm || mt.glow[i]) continue;
      const X = x + ox, Y = y + oy;
      if (ROOF.has(mm)) {
        // 지붕 — 대부분 덮이고, 기와 골이 군데군데 드러난다
        const n = fbm(X * 0.07, Y * 0.13, 3, seed + 2);
        if (n > 0.3 || v[i] > 0.62) snowAt(i, clamp(0.5 + v[i] * 0.5 + (n - 0.5) * 0.1, 0.3, 0.98));
        else v[i] -= 0.04;
      } else if (LEAF.has(mm)) {
        // 단풍 · 덤불 — 늘푸른 잎으로, 위쪽은 눈
        const up = y > 0 && (!m[i - w] || !LEAF.has(m[i - w]));
        if (up || (v[i] > 0.56 && hash(X, Y, seed + 3) < 0.6)) snowAt(i, 0.62 + v[i] * 0.3);
        else {
          m[i] = M.pine;
          v[i] = clamp(v[i] * 0.85 + 0.04);
        }
      } else if (GROUND.has(mm) || (o.extra && o.extra(X, Y, mm, v[i]))) {
        // 바닥 — 넓게 덮고, 다니는 길은 녹아 돌이 드러난다
        // 큰 얼룩 단위로만 덮고 녹인다 — 돌 하나하나가 따로 드러나면 지저분해 보인다
        const c = fbm(X * 0.016, Y * 0.036, 3, seed + 4) * 0.9 + fbm(X * 0.06, Y * 0.12, 2, seed + 5) * 0.1;
        const melt = o.trodden ? o.trodden(X, Y) : 0;
        const k = c + ground - 0.6 - melt * 0.7;
        if (k > 0.06) snowAt(i, clamp(0.6 + Math.min(k, 0.4) * 0.5 + (v[i] - 0.5) * 0.22, 0.4, 0.96));
        else if (k > -0.04) {
          // 녹은 가장자리 — 젖어 어둡고 푸르스름
          v[i] -= 0.1;
        }
      }
    }
  // 3) 쌓인 눈 얹기 (지붕 끝에는 고드름)
  for (const [x, y, d] of caps)
    for (let k = 0; k < d; k++) {
      const i = (y + k) * w + x;
      if (y + k >= h || !m[i] || NOSNOW.has(m[i])) break;
      snowAt(i, k === 0 ? 0.94 : 0.8 - k * 0.08);
    }
  if (o.icicles !== false)
    for (let y = 0; y < h - 1; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (!ROOF.has(m[i]) && !(m[i] === M.snow && o.roofEdge?.(x + ox, y + oy))) continue;
        if (m[i + w] && ROOF.has(m[i + w])) continue;
        if (hash(x + ox, y + oy, seed + 9) > 0.22) continue;
        const len = 1 + Math.floor(hash(x + ox, y + oy, seed + 10) * 3);
        for (let k = 1; k <= len && y + k < h; k++) {
          const j = (y + k) * w + x;
          m[j] = M.snow;
          v[j] = 0.72 - k * 0.1;
        }
      }
  return mt;
}

/* ---------- 늘푸른 장식줄 · 꼬마전구 ---------- */

/** 꼬마전구 색 — 0 따뜻한 흰색, 1 빨강, 2 초록, 3 금색, 4 파랑 (화면 PlazaScene 의 BULB 와 같은 순서) */
const BULB_COLORS = 5;

/** 늘어진 줄 위의 점들 — a 에서 b 까지, 가운데가 sag 만큼 처진다 */
function catenary(a, b, sag, step = 1) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.max(2, Math.ceil(len / step));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * sag]);
  }
  return pts;
}

/** 꼬마전구 줄 — 가는 검은 전선에 일정 간격으로 전구 자리. bulbs 배열에 [x, y, 색] 을 넣는다 */
function lightString(mt, a, b, sag, bulbs, o = {}) {
  const pts = catenary(a, b, sag, 0.5);
  for (const [x, y] of pts) mt.put(x, y, M.iron, 0.18);
  const gap = o.gap ?? 6;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.max(1, Math.round(len / gap));
  for (let i = 1; i < n; i++) {
    const p = pts[Math.round((i / n) * (pts.length - 1))];
    const c = o.color ?? (o.palette ? o.palette[(i + (o.shift ?? 0)) % o.palette.length] : i % BULB_COLORS);
    bulbs.push([Math.round(p[0]), Math.round(p[1]) + 1, c]);
  }
}

/** 늘푸른 장식줄 — 솔잎 밧줄이 처져 걸리고, 사이사이 빨간 열매 */
function garland(mt, a, b, sag, o = {}) {
  const pts = catenary(a, b, sag, 0.5);
  const th = o.thick ?? 2.4;
  for (const [x, y] of pts)
    for (let k = -th / 2; k <= th / 2; k += 0.5) {
      const X = Math.round(x), Y = Math.round(y + k);
      const hh = hash(X, Y, 41);
      mt.put(X, Y, M.pine, 0.28 + (k < 0 ? 0.16 : 0) + hh * 0.18);
    }
  // 솔잎 끝이 삐죽 나온다
  for (const [x, y] of pts) if (hash(Math.round(x), 7, 43) < 0.35) mt.put(x, y + th / 2 + 1, M.pine, 0.22);
  // 열매 · 쌓인 눈
  for (const [x, y] of pts) {
    const X = Math.round(x);
    if (hash(X, 3, 47) < 0.1) mt.put(X, y, M.clothRed, 0.62);
    if (hash(X, 5, 49) < 0.5) mt.put(X, y - th / 2, M.snow, 0.9);
  }
}

/** 빨간 리본 매듭 — (x, y) 가 매듭 가운데 */
function bow(mt, x, y, s = 1) {
  const r = M.clothRed;
  mt.disc(x - 2.2 * s, y - 0.5, 2 * s, 1.5 * s, r, (X, Y, dx) => 0.6 + dx * 0.1);
  mt.disc(x + 2.2 * s, y - 0.5, 2 * s, 1.5 * s, r, (X, Y, dx) => 0.48 + dx * 0.1);
  mt.put(x, y, r, 0.36);
  mt.line(x - 0.5, y + 1, x - 1.5 * s, y + 4 * s, r, 0.5);
  mt.line(x + 0.5, y + 1, x + 1.5 * s, y + 4 * s, r, 0.4);
}

/** 화환 — 솔잎 고리 + 빨간 열매 + 아래 리본 */
function wreath(mt, cx, cy, r, o = {}) {
  const th = o.thick ?? Math.max(2, r * 0.45);
  for (let y = Math.floor(cy - r - th); y <= cy + r + th; y++)
    for (let x = Math.floor(cx - r - th); x <= cx + r + th; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (Math.abs(d - r) > th / 2 + (hash(x, y, 51) < 0.3 ? 0.6 : 0)) continue;
      const up = y + 0.5 < cy;
      mt.put(x, y, M.pine, 0.3 + (up ? 0.14 : 0) - (x > cx ? 0.06 : 0) + hash(x, y, 53) * 0.16);
      if (hash(x, y, 55) < 0.09) mt.put(x, y, M.clothRed, 0.64);
      if (up && Math.abs(d - r - th / 2) < 0.8 && hash(x, y, 57) < 0.5) mt.put(x, y, M.snow, 0.9);
    }
  bow(mt, cx, cy + r + th / 2, Math.max(0.7, r / 6));
}

/* ---------- 크리스마스 소품 ---------- */

/**
 * 크리스마스트리 — 층층이 늘어진 전나무에 눈 · 장식 공 · 금빛 줄, 꼭대기에 별, 나무 화분.
 * 반환: { mat, ax, ay, bulbs: [[x, y, 색]] (그림 기준), star: [x, y] }
 */
function xmasTree(o = {}) {
  const H = o.h ?? 92, Wd = o.w ?? 58;
  const mt = new Mat(Wd + 12, H + 16);
  const cx = Math.round(mt.w / 2), base = mt.h - 2;
  const potH = 9, potTop = base - potH;
  // 화분 (나무 통 + 빨간 띠)
  for (let y = potTop; y < base; y++) {
    const hw = 8 - (y - potTop) * 0.25;
    for (let x = Math.round(cx - hw); x < cx + hw; x++) {
      const band = y === potTop + 3 || y === potTop + 4;
      mt.put(x, y, band ? M.clothRed : M.wood, (band ? 0.56 : 0.5) - ((x - cx + hw) / (hw * 2)) * 0.28 + ((x - cx) % 3 === 0 && !band ? -0.08 : 0));
    }
  }
  mt.rect(cx - 2, potTop - 4, cx + 2, potTop, M.bark, 0.3);
  // 층 — 아래가 넓고, 층마다 끝이 삐죽삐죽 처진다
  const tiers = 6, top = 10;
  const tierY = (k) => top + ((potTop - 4 - top) * (k + 1)) / tiers;
  const bulbs = [];
  for (let k = 0; k < tiers; k++) {
    const y0 = k === 0 ? top : tierY(k - 1) - 6, y1 = tierY(k);
    const halfW = (Wd / 2) * (0.24 + (0.76 * (k + 1)) / tiers);
    for (let y = Math.floor(y0); y <= y1; y++) {
      const t = (y - y0) / (y1 - y0);
      const hw = halfW * (0.18 + 0.82 * t);
      for (let x = Math.round(cx - hw - 1); x <= cx + hw + 1; x++) {
        const u = (x - cx) / hw;
        const edge = Math.abs(u) > 0.86;
        if (Math.abs(u) > 1 + (hash(x, y, 61) < 0.4 ? 0.12 : 0)) continue;
        // 아랫단 끝은 톱니처럼
        if (y > y1 - 2 && (x + k * 3) % 4 === 0) continue;
        const needle = hash(x, Math.floor(y / 2), 63 + k) * 0.18;
        mt.put(x, y, M.pine, 0.4 - u * 0.16 + t * -0.12 + needle - (edge ? 0.08 : 0));
      }
    }
  }
  // 눈 — 층마다 윗면에
  snowify(mt, { caps: true, icicles: false, seed: 7 });
  // 장식 공
  const balls = [M.clothRed, M.gold, M.clothBlue, M.clothRed, M.steel];
  for (let i = 0; i < 26; i++) {
    const t = hash(i, 1, 71), k = Math.floor(hash(i, 2, 73) * tiers);
    const y = tierY(k) - 2 - Math.floor(hash(i, 3, 75) * 4);
    const hw = (Wd / 2) * (0.24 + (0.76 * (k + 1)) / tiers) * 0.8;
    const x = Math.round(cx + (t * 2 - 1) * hw);
    if (mt.at(x, y) !== M.pine) continue;
    const b = balls[i % balls.length];
    mt.put(x, y, b, 0.6);
    mt.put(x + 1, y, b, 0.42);
    mt.put(x, y + 1, b, 0.4);
    mt.put(x + 1, y + 1, b, 0.3);
    mt.put(x, y, b, 0.82);
  }
  // 금빛 줄 (나선) 과 그 위의 전구
  for (let s = 0; s < 1; s += 0.004) {
    const y = top + 6 + s * (potTop - 12 - top);
    const k = Math.min(tiers - 1, Math.floor(((y - top) / (potTop - 4 - top)) * tiers));
    const hw = (Wd / 2) * (0.24 + (0.76 * (k + 1)) / tiers) * 0.86 * (0.4 + 0.6 * ((y - top) / (potTop - top)));
    const ang = s * Math.PI * 7;
    const x = cx + Math.sin(ang) * hw;
    if (Math.cos(ang) < -0.15) continue; // 뒤로 돌아간 부분은 가려진다
    if (mt.at(x, y)) mt.put(x, y, M.gold, 0.66 + Math.cos(ang) * 0.12);
    if (Math.round(s * 250) % 9 === 0 && mt.at(x, y)) bulbs.push([Math.round(x), Math.round(y) + 1, (bulbs.length % 4) + 1]);
  }
  // 꼭대기 별 — 늘 빛난다
  const sx = cx, sy = top - 3;
  const star = [[0, -4], [0, -3], [-1, -2], [0, -2], [1, -2], [-4, -1], [-3, -1], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [3, -1], [4, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-2, 1], [-1, 1], [1, 1], [2, 1], [-3, 2], [3, 2]];
  for (const [dx, dy] of star) mt.setGlow(sx + dx, sy + dy, dx === 0 && dy <= 0 ? [255, 250, 210] : [255, 214, 90]);
  mt.lights.push({ x: cx, y: Math.round(H * 0.55), r: 70, power: 1 });
  return { mat: mt, ax: cx, ay: base, bulbs, star: [sx, sy] };
}

/** 눈사람 · 선물 · 썰매 더미 (가을의 통 · 상자 더미 자리) */
function xmasClutter(kind = 0) {
  const mt = new Mat(90, 64);
  const base = 60;
  const gift = (x, w, hgt, c, rib = M.gold, y = base) => {
    mt.rect(x, y - hgt, x + w, y, c, (X, Y) => 0.6 - ((X - x) / w) * 0.24 + (Y === y - hgt ? 0.12 : 0));
    const rx = Math.round(x + w / 2);
    mt.rect(rx - 1, y - hgt, rx + 1, y, rib, 0.66);
    mt.rect(x, y - Math.round(hgt / 2) - 1, x + w, y - Math.round(hgt / 2) + 1, rib, 0.56);
    mt.disc(rx - 2, y - hgt - 1, 2, 1.4, rib, 0.7);
    mt.disc(rx + 2, y - hgt - 1, 2, 1.4, rib, 0.58);
  };
  const snowman = (x, s = 1) => {
    const sb = (cy, r) => mt.disc(x, cy, r, r * 0.92, M.snow, (X, Y, dx, dy) => 0.86 - dx * 0.16 - dy * 0.22);
    sb(base - 9 * s, 10 * s);
    sb(base - 24 * s, 7.5 * s);
    sb(base - 35 * s, 5.5 * s);
    // 눈 · 코 · 단추 · 목도리 · 모자 · 팔
    const hy = base - 35 * s;
    mt.put(x - 2, hy - 1, M.hairBlack, 0.1);
    mt.put(x + 2, hy - 1, M.hairBlack, 0.1);
    mt.rect(x, hy + 1, x + 4, hy + 2, M.pumpkin, 0.66);
    for (const by of [base - 26 * s, base - 21 * s, base - 12 * s]) mt.put(x, by, M.hairBlack, 0.12);
    mt.rect(x - 6 * s, hy + 4, x + 6 * s, hy + 7, M.clothRed, (X) => 0.6 - (X - x) * 0.02);
    mt.rect(x + 2, hy + 6, x + 5, hy + 13, M.clothRed, 0.48);
    mt.rect(x - 5 * s, hy - 6, x + 5 * s, hy - 4, M.clothBlack, 0.3);
    mt.rect(x - 3.5 * s, hy - 13, x + 3.5 * s, hy - 6, M.clothBlack, (X) => 0.26 - (X - x) * 0.02);
    mt.rect(x - 3.5 * s, hy - 8, x + 3.5 * s, hy - 7, M.clothRed, 0.56);
    mt.line(x - 7, base - 25 * s, x - 15, base - 31 * s, M.bark, 0.36);
    mt.line(x - 12, base - 29 * s, x - 13, base - 33 * s, M.bark, 0.36);
    mt.line(x + 7, base - 25 * s, x + 15, base - 30 * s, M.bark, 0.3);
  };
  if (kind === 0) {
    snowman(24);
    gift(44, 14, 12, M.clothRed);
    gift(58, 12, 10, M.clothGreen, M.clothRed);
    gift(50, 10, 8, M.clothBlue, M.clothWhite, base - 12);
    gift(72, 10, 14, M.clothGold, M.clothRed);
  } else if (kind === 1) {
    gift(6, 16, 14, M.clothRed);
    gift(24, 12, 10, M.clothGreen, M.clothRed);
    gift(10, 10, 9, M.clothBlue, M.clothWhite, base - 14);
    snowman(56, 0.8);
  } else {
    // 썰매 위에 쌓인 선물
    const sy = base - 6;
    mt.rect(14, sy - 8, 74, sy, M.clothRed, (X, Y) => 0.56 - (Y - sy + 8) * 0.02 - ((X - 14) / 60) * 0.12);
    mt.rect(14, sy - 9, 74, sy - 8, M.gold, 0.72);
    for (let x = 8; x < 82; x++) mt.put(x, base - 1 - (x < 14 ? Math.round((14 - x) * 0.6) : 0), M.gold, 0.6);
    for (const x of [22, 44, 66]) mt.rect(x, sy, x + 2, base - 1, M.gold, 0.5);
    gift(20, 14, 12, M.clothGreen, M.clothRed, sy - 8);
    gift(36, 16, 15, M.clothBlue, M.clothWhite, sy - 8);
    gift(54, 12, 10, M.clothRed, M.gold, sy - 8);
    gift(40, 10, 8, M.clothGold, M.clothRed, sy - 23);
  }
  snowify(mt, { caps: true, icicles: false, seed: 13 + kind });
  return { mat: mt, ax: 45, ay: base };
}

/** 가로등에 감긴 빨간 리본과 작은 화환 (그림을 직접 고친다) */
function decorateLamp(mt, cx, base) {
  for (let y = 30; y < base - 10; y++) {
    const ph = ((y - 30) % 8) / 8;
    if (ph < 0.35) {
      const x = cx - 2 + Math.round(ph / 0.35 * 4);
      mt.put(x, y, M.clothRed, 0.6);
      mt.put(x, y + 1, M.clothRed, 0.44);
    }
  }
  wreath(mt, cx, 34, 3.4, { thick: 2 });
}

/** 노점 차양 끝의 꼬마전구 자리 (그림 기준) */
function stallBulbs(w) {
  const x0 = 12, x1 = x0 + w, top = 14;
  const out = [];
  for (let x = x0 - 8, i = 0; x <= x1 + 8; x += 6, i++) out.push([x, top + 17 + ((x - x0 + 10) % 7 === 3 ? 1 : 0), [1, 2, 3, 0][i % 4]]);
  return out;
}

/* ---------- 사람의 겨울옷 ---------- */

/** 산타 모자 · 털모자를 씌우고 목도리를 두른다 — 생김새마다 하나씩 정해 둔다 */
const WINTER = {
  peasant: { hat: 'santa', scarf: 'clothGreen', item: 'gift' },
  farmer: { hat: 'beanie', hatM: 'clothRed', scarf: 'clothCream' },
  woman: { scarf: 'clothRed', fur: 'clothWhite' },
  maid: { hat: 'beanie', hatM: 'clothGreen', scarf: 'clothWhite' },
  hooded: { scarf: 'clothRed' },
  merchant: { hat: 'santa' },
  elder: { scarf: 'clothRed', hat: 'beanie', hatM: 'clothBlue' },
  guard: { scarf: 'clothRed' },
  mercenary: { hat: 'beanie', hatM: 'clothGray' },
  orc: { hat: 'santa', item: 'gift' },
  elf: { hat: 'santa', scarf: 'clothRed' },
  dwarf: { scarf: 'clothGreen' },
  noble: { fur: 'clothWhite' },
  monk: { scarf: 'clothRed' },
  witch: { scarf: 'clothGreen' },
  baker: { scarf: 'clothRed' },
};
/** 주인공의 겨울 덧옷 */
const HERO_WINTER = {
  knight: { hat: 'santa' },
  bard: { scarf: 'clothGreen' },
  astrologer: { scarf: 'clothWhite' },
  archer: { hat: 'santa', hatSmall: true },
  mage: { fur: 'clothWhite' },
  rogue: {},
};

function winterize(d, extra) {
  if (!extra) return d;
  const out = { ...d, ...extra };
  // 모자를 바꾸면 그 모자에 딸린 색 · 장식은 버린다
  if (extra.hat && extra.hat !== d.hat) {
    if (!extra.hatM) delete out.hatM;
    delete out.hatBand;
    delete out.plume;
  }
  // 손에 든 것을 선물로 바꿀 때, 원래 들고 있던 큰 물건이 없을 때만
  if (extra.item && d.item) out.item = d.item;
  return out;
}

/* ---------- 겨울 하늘 ---------- */

/** 시간대 빛을 겨울 쪽으로 — 낮 하늘은 엷고 차갑게, 그늘은 더 푸르게 */
function winterPhase(ph, name) {
  const mix = (c, t, k) => c.map((v, i) => Math.round(v + (t[i] - v) * k));
  const cold = [206, 218, 234];
  const k = { dawn: 0.12, morning: 0.28, noon: 0.3, afternoon: 0.24, evening: 0.1, night: 0 }[name] ?? 0;
  return {
    ...ph,
    sky: ph.sky.map((c) => mix(c, cold, k)),
    cloud: ph.cloud.map((c) => mix(c, [236, 240, 248], k * 0.6)),
    haze: mix(ph.haze, cold, k),
    lo: [ph.lo[0] * 0.95, ph.lo[1] * 0.98, Math.min(1.2, ph.lo[2] * 1.06)],
    hi: [ph.hi[0] * 0.98, ph.hi[1] * 0.99, Math.min(1.2, ph.hi[2] * 1.03)],
    // 겨울엔 해가 일찍 져서 저녁부터 등이 다 켜진다
    lamps: name === 'afternoon' ? 0.2 : ph.lamps,
  };
}

/* ---------- 장면 전체에 크리스마스 옷 입히기 ---------- */

/** 사람이 많이 다녀 눈이 녹은 곳 — 큰 계단 축 · 분수 앞 길 · 옹벽 아래 길 */
function courtTrodden(x, y) {
  if (y < L.WALL_BOT + 6) return 0.3;
  // 사람들이 다니는 길: 계단에서 분수로 내려오는 축, 분수 앞을 가로지르는 길, 옹벽 아래 길,
  // 그리고 분수 둘레를 도는 고리
  const axis = Math.exp(-(((x - 480) / 46) ** 2)) * (y < 440 ? 1 : 0);
  const lane = Math.exp(-(((y - 506) / 11) ** 2)) * 0.95;
  const back = Math.exp(-(((y - 414) / 8) ** 2)) * 0.75 * (x > 60 && x < 900 ? 1 : 0);
  const ring = Math.exp(-(((Math.hypot((x - 480) / 100, (y - 458) / 36) - 1) / 0.16) ** 2)) * 0.9;
  return Math.min(1, Math.max(axis, lane, back, ring));
}

/** 계단 디딤판 (밝은 돌) 도 바닥처럼 눈이 쌓인다 — 가운데 융단은 치워져 있다 */
function stairTread(stairX) {
  const STONE = new Set([M.stone, M.stoneCool, M.stonePale, M.cobble]);
  return (x, y, m, v) => {
    // 아래 광장 바닥 — 돌 종류가 섞여 있어 모두 바닥으로 친다 (받침대 화로 기둥은 뺀다)
    if (y >= L.WALL_BOT + 2 && STONE.has(m)) {
      const ped = (x > 352 && x < 380) || (x > 580 && x < 608);
      return !(ped && y < L.STAIR.botY + 10);
    }
    if (m !== M.stonePale || y < L.STAIR.topY || y > L.STAIR.botY) return false;
    const [x0, x1] = stairX(y);
    return x > x0 && x < x1 && v > 0.6;
  };
}

/**
 * 장면 레이어(먼 산 · 언덕 · 윗마당 건물 · 윗마당 바닥 · 앞 배경)에 눈과 장식을 얹는다.
 * 꼬마전구 자리는 bulbs.back(건물 쪽) · bulbs.front(난간) 에 넣는다.
 */
function dressChristmas(S, bulbs) {
  const { stairX } = require('./ground');
  snowify(S.far.far2, { seed: 21, ground: 0.95 });
  snowify(S.far.far1b, { seed: 22, ground: 0.95 });
  snowify(S.far.far1, { seed: 23, ground: 0.9 });
  snowify(S.hill, { seed: 24, ground: 0.9 });
  snowify(S.town.main, { seed: 25 });
  const terraceStone = new Set([M.stone, M.stoneCool, M.stonePale, M.cobble]);
  snowify(S.terrace, {
    seed: 26, ground: 0.74,
    trodden: (x) => 0.3 + (x > L.STAIR.topX0 - 20 && x < L.STAIR.topX1 + 20 ? 0.5 : 0),
    extra: (x, y, m) => y >= L.TERRACE_Y && terraceStone.has(m),
  });
  snowify(S.front.mt, { seed: 27, ground: 0.74, trodden: courtTrodden, extra: stairTread(stairX) });

  // ----- 윗마당 건물: 시계 둘레의 큰 화환, 문마다 작은 화환 -----
  const main = S.town.main;
  const [cx, cy, cr] = S.town.clock;
  wreath(main, cx, cy, cr + 3.5, { thick: 4.5 });
  for (const d of S.town.doorBoxes) wreath(main, d.x, L.TERRACE_Y - d.h + 7, 3.4, { thick: 2.2 });

  // ----- 꼬마전구 줄 -----
  // 시계탑 꼭대기에서 양쪽 날개 지붕으로 — 밤이면 탑이 빛나는 트리 모양이 된다
  const spire = [cx, 44];
  for (const [end, sag] of [[[404, 198], 8], [[556, 198], 8], [[430, 216], 10], [[530, 216], 10]]) lightString(main, spire, end, sag, bulbs.back, { gap: 5, palette: [0, 3] });
  // 건물 앞을 가로지르는 줄 (처마 아래)
  const strings = [
    [[6, 232], [92, 228], 9], [[98, 224], [176, 226], 9], [[180, 226], [268, 232], 9], [[284, 246], [352, 246], 8],
    [[356, 250], [402, 248], 5], [[558, 248], [616, 250], 5], [[622, 238], [700, 238], 9], [[706, 242], [812, 242], 11],
    [[818, 246], [886, 244], 9], [[892, 242], [958, 238], 9],
  ];
  strings.forEach(([a, b, sag], i) => lightString(main, a, b, sag, bulbs.back, { gap: 6, palette: [1, 2, 3, 4], shift: i }));

  // ----- 난간: 기둥 사이로 늘어진 장식줄 + 리본 + 전구 -----
  const fm = S.front.mt;
  const posts = [...L.BUTTRESS.map((x) => [x, 6]), [L.STAIR.topX0 - 8, 8], [L.STAIR.topX1 + 8, 8]].sort((a, b) => a[0] - b[0]);
  for (let i = 0; i + 1 < posts.length; i++) {
    const [xa, ha] = posts[i], [xb, hb] = posts[i + 1];
    if (xa < L.STAIR.topX0 && xb > L.STAIR.topX1) continue; // 계단 위는 비어 있다
    const a = [xa + ha + 1, L.BAL_TOP + 1], b = [xb - hb - 1, L.BAL_TOP + 1];
    garland(fm, a, b, 6);
    const pts = catenary(a, b, 6, 0.5);
    const n = Math.round((b[0] - a[0]) / 7);
    for (let k = 1; k < n; k++) {
      const p = pts[Math.round((k / n) * (pts.length - 1))];
      bulbs.front.push([Math.round(p[0]), Math.round(p[1]) + 2, (k + i) % 2 ? 0 : 1 + ((k + i) % 3)]);
    }
  }
  for (const [x] of posts) bow(fm, x, L.BAL_TOP + 3, 0.9);
  return bulbs;
}

/** 겨울 가장자리 나무의 색 — 그늘은 늘푸른 잎, 볕 드는 쪽은 눈 */
function snowTreeRamp() {
  const pine = MATS[M.pine], snow = MATS[M.snow];
  return [pine[0], pine[1], pine[2], snow[2], snow[4], snow[5]];
}

/** 나무 그림에서 꼬마전구 자리 고르기 — 잎 덩이 위에 흩어 놓는다 (그림 기준 좌표) */
function treeBulbs(buf, seed) {
  const out = [];
  for (let y = 0; y < buf.h - 60; y += 3)
    for (let x = 0; x < buf.w; x += 3) {
      const c = buf.px[y * buf.w + x];
      if (!(c >>> 24) || hash(x, y, seed) > 0.11) continue;
      out.push([x, y, hash(x, y, seed + 1) < 0.7 ? 0 : 3]);
    }
  return out;
}

module.exports = {
  dressChristmas, snowTreeRamp, treeBulbs, courtTrodden,
  SEASONS, snowify, catenary, lightString, garland, bow, wreath, xmasTree, xmasClutter, decorateLamp, stallBulbs,
  WINTER, HERO_WINTER, winterize, winterPhase, BULB_COLORS,
};
