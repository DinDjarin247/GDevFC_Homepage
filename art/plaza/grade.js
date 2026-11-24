// 시간대 — 하늘을 그리고, 낮에 그린 그림을 새벽 · 저녁 · 밤의 빛으로 바꾼다.
//
// 그림은 전부 "한낮" 기준으로 그린다. 시간대마다 어두운 색과 밝은 색에 서로 다른 빛을
// 곱해(그늘은 푸르게, 볕은 붉게) 분위기를 만들고, 등불이 켜지는 시간대에는 등 주변을
// 따뜻한 원래 색으로 되돌린다. 창 · 등 · 불처럼 스스로 빛나는 곳은 따로 칠한다.
const { P, W, H, clamp } = require('./kit');

const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];

const PHASES = {
  dawn: {
    sky: ['#241f4a', '#4a3c76', '#96628a', '#e09878', '#f6c890'].map(hex),
    cloud: [[66, 60, 110], [130, 96, 140], [220, 150, 150], [255, 206, 170]],
    haze: [206, 156, 152],
    lo: [0.5, 0.48, 0.84], hi: [0.92, 0.78, 0.84],
    lamps: 0.8, stars: 0.4,
    orb: { x: 884, y: 150, r: 15, color: [255, 222, 176], glow: [255, 176, 130] },
  },
  morning: {
    sky: ['#3f86cc', '#74b0e4', '#aed4f0', '#e4ecdc'].map(hex),
    cloud: [[168, 182, 210], [214, 222, 234], [246, 242, 234], [255, 252, 244]],
    haze: [206, 226, 236],
    lo: [0.9, 0.96, 1.05], hi: [1.04, 1.02, 0.95],
    lamps: 0, stars: 0,
    orb: { x: 836, y: 62, r: 19, color: [255, 248, 214], glow: [255, 240, 180] },
  },
  noon: {
    sky: ['#2f7ec8', '#5ea4de', '#9ccbee', '#d8e8ee'].map(hex),
    cloud: [[150, 172, 206], [198, 214, 234], [236, 242, 250], [255, 255, 255]],
    haze: [200, 222, 238],
    lo: [1, 1, 1], hi: [1, 1, 1],
    lamps: 0, stars: 0,
    orb: { x: 300, y: 46, r: 21, color: [255, 254, 240], glow: [255, 250, 210] },
  },
  afternoon: {
    sky: ['#3a70b4', '#7aa2d0', '#c8c0aa', '#f2d09c'].map(hex),
    cloud: [[150, 150, 182], [208, 198, 202], [248, 228, 202], [255, 246, 222]],
    haze: [232, 208, 174],
    lo: [0.9, 0.84, 0.92], hi: [1.08, 0.98, 0.84],
    lamps: 0, stars: 0,
    orb: { x: 150, y: 66, r: 20, color: [255, 242, 190], glow: [255, 214, 136] },
  },
  evening: {
    sky: ['#221d48', '#4c3468', '#a2505c', '#e6864e', '#f8b866'].map(hex),
    cloud: [[70, 52, 100], [140, 80, 110], [226, 130, 96], [255, 190, 120]],
    haze: [216, 134, 104],
    lo: [0.6, 0.45, 0.76], hi: [1.04, 0.74, 0.58],
    lamps: 0.9, stars: 0.35,
    orb: { x: 112, y: 128, r: 19, color: [255, 196, 120], glow: [255, 150, 90] },
  },
  night: {
    sky: ['#090b20', '#11153a', '#1f2250', '#2e2b5c'].map(hex),
    cloud: [[20, 24, 52], [34, 40, 74], [54, 62, 100], [84, 94, 134]],
    haze: [36, 38, 86],
    lo: [0.2, 0.24, 0.52], hi: [0.44, 0.52, 0.86],
    lamps: 1, stars: 1,
    orb: { x: 300, y: 56, r: 17, color: [255, 240, 200], glow: [200, 210, 255], crescent: true },
  },
};

/** 낮 색 → 그 시간대의 색 */
function tint(c, ph) {
  const lum = clamp((0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]) / 255);
  return [
    Math.min(255, c[0] * (ph.lo[0] + (ph.hi[0] - ph.lo[0]) * lum)),
    Math.min(255, c[1] * (ph.lo[1] + (ph.hi[1] - ph.lo[1]) * lum)),
    Math.min(255, c[2] * (ph.lo[2] + (ph.hi[2] - ph.lo[2]) * lum)),
  ];
}
/** 등불에 비친 색 (따뜻하게) */
const warmed = (c) => [Math.min(255, c[0] * 1.14 + 14), Math.min(255, c[1] * 0.94 + 6), c[2] * 0.64];

/**
 * 빛 지도 — 장면의 모든 등불이 바닥과 벽에 만드는 빛의 세기.
 * 바닥은 눕혀 보이므로 세로로는 더 빨리 약해진다.
 */
function lightMap(lights) {
  const map = new Float32Array(W * H);
  for (const l of lights) {
    if (l.always) continue;
    const r = l.r, ry = r / 1.45;
    for (let y = Math.max(0, Math.floor(l.y - ry)); y < Math.min(H, l.y + ry); y++)
      for (let x = Math.max(0, Math.floor(l.x - r)); x < Math.min(W, l.x + r); x++) {
        const d = Math.hypot(x - l.x, (y - l.y) * 1.45) / r;
        if (d < 1) map[y * W + x] += l.power * (1 - d) * (1 - d);
      }
  }
  return map;
}

/**
 * 그림 한 겹을 시간대의 색으로 바꾼다.
 * r: { col, lit, glow } (Mat.resolve 의 결과), ox · oy: 이 그림이 장면에 놓이는 자리.
 * o: { haze, map(빛 지도), lift(밝기 보정) }
 */
function grade(r, ph, ox = 0, oy = 0, o = {}) {
  const out = new P.Buf(r.col.w, r.col.h);
  const haze = o.haze ?? 0, on = ph.lamps > 0.3;
  for (let y = 0; y < out.h; y++)
    for (let x = 0; x < out.w; x++) {
      const i = y * out.w + x, c = r.col.px[i];
      const a = c >>> 24;
      if (!a) continue;
      const base = P.unpack(c);
      let g = tint(base, ph);
      if (o.lift) g = [Math.min(255, g[0] * o.lift + 6), Math.min(255, g[1] * o.lift + 6), Math.min(255, g[2] * o.lift + 8)];
      if (on && o.map) {
        const X = x + ox, Y = y + oy;
        if (X >= 0 && Y >= 0 && X < W && Y < H) {
          const L = clamp(o.map[Y * W + X] * ph.lamps);
          if (L > 0.02) {
            // 빛은 몇 단계로만 번지고, 단계 사이만 디더로 섞인다
            const k = P.band(L, 6, X, Y, 0.4) / 5;
            g = P.mix(g, warmed(base), k * 0.92);
          }
        }
      }
      if (haze) g = P.mix(g, ph.haze, haze);
      if (on && r.lit && r.lit.px[i]) g = P.unpack(r.lit.px[i]);
      if (r.glow && r.glow.px[i]) g = P.unpack(r.glow.px[i]);
      out.px[i] = ((a << 24) | (Math.round(g[2]) << 16) | (Math.round(g[1]) << 8) | Math.round(g[0])) >>> 0;
    }
  return out;
}

/** 하늘 — 띠로 나뉜 하늘빛, 별, 해 · 달, 구름 */
function sky(ph, name) {
  const b = new P.Buf(W, H);
  const cols = P.palette([...ph.sky].reverse(), 11);
  P.sky(b, { cols, y0: 0, y1: 310, dither: 0.3 });
  const starList = [];
  if (ph.stars > 0) {
    const r = P.rng(77);
    const n = Math.round(170 * ph.stars);
    for (let i = 0; i < n; i++) {
      const x = Math.floor(r() * W), y = Math.floor(r() * r() * 250), a = 0.35 + r() * 0.65;
      const fade = 1 - y / 280;
      const c = P.mix(P.unpack(b.get(x, y)), [244, 240, 255], a * fade * (0.5 + ph.stars * 0.5));
      b.pset(x, y, c);
      if (a > 0.86 && ph.stars > 0.6) {
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) b.pset(x + dx, y + dy, P.mix(P.unpack(b.get(x + dx, y + dy)), [220, 224, 255], 0.35));
        starList.push([x, y]);
      } else if (a > 0.7) starList.push([x, y]);
    }
  }
  const o = ph.orb;
  if (o) {
    // 해 · 달 둘레의 빛무리 (띠 3겹)
    for (let y = o.y - o.r * 4; y < o.y + o.r * 4; y++)
      for (let x = o.x - o.r * 4; x < o.x + o.r * 4; x++) {
        if (x < 0 || y < 0 || x >= W || y >= 310) continue;
        const d = Math.hypot(x - o.x, y - o.y) / o.r;
        if (d > 4) continue;
        const k = P.band(clamp(1 - (d - 1) / 3), 4, x, y, 0.4) / 3;
        if (k > 0) b.pset(x, y, P.mix(P.unpack(b.get(x, y)), o.glow, k * 0.42));
      }
    for (let y = o.y - o.r; y <= o.y + o.r; y++)
      for (let x = o.x - o.r; x <= o.x + o.r; x++) {
        const d = Math.hypot(x + 0.5 - o.x, y + 0.5 - o.y);
        if (d > o.r) continue;
        if (o.crescent && Math.hypot(x + 0.5 - (o.x - o.r * 0.42), y + 0.5 - (o.y - o.r * 0.3)) < o.r * 0.92) continue;
        b.pset(x, y, d > o.r - 1.5 ? P.mix(o.color, o.glow, 0.4) : o.color);
      }
  }
  const seed = { dawn: 11, morning: 23, noon: 37, afternoon: 41, evening: 53, night: 67 }[name] ?? 5;
  // 높은 새털구름 조금 + 지평선 가까이 낮게 깔린 구름
  P.clouds(b, { base: 70, h: 26, cols: ph.cloud, seed: seed + 3, amount: 0.42, t: 0, T: 1, haze: 0.3, hazeCol: ph.haze });
  P.clouds(b, { base: 236, h: 70, cols: ph.cloud, seed, amount: 0.8, t: 0, T: 1, haze: 0.25, hazeCol: ph.haze });
  return { buf: b, stars: starList };
}

module.exports = { PHASES, tint, warmed, lightMap, grade, sky };
