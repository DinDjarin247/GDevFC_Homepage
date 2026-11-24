// 움직이는 것들 — 불꽃 · 연기 뭉치 · 폭포 · 용 · 탑 깃발 · 흘러가는 구름 · 광장 양쪽의 가을 나무.
const { P, W, M, MATS, Mat, clamp, hash, fbm } = require('./kit');

/** 화로 불꽃 — n 프레임. 스스로 빛나므로 시간대 색을 입히지 않는다 */
function flameFrames(n = 8, o = {}) {
  const w = o.w ?? 30, h = o.h ?? 46;
  const fl = new P.Flame({ height: o.height ?? 24, width: o.width ?? 7, swayAmp: 4, bits: 0.3, speed: 3, fx: 0.24, fy: 0.16, ...o });
  const out = [];
  for (let i = 0; i < n + 6; i++) {
    const b = new P.Buf(w, h);
    fl.draw(b, w / 2, h - 4, i * 0.42);
    if (i >= 6) out.push(b);
  }
  return out;
}

/** 굴뚝 연기 뭉치 3가지 크기 (화면에서 떠오르며 옅어진다) */
function puffs() {
  return [2.4, 3.6, 5].map((r, k) => {
    const s = Math.ceil(r * 2 + 4), mt = new Mat(s, s);
    for (let y = 0; y < s; y++)
      for (let x = 0; x < s; x++) {
        const d = Math.hypot(x + 0.5 - s / 2, y + 0.5 - s / 2) + (fbm(x * 0.6, y * 0.6, 2, k + 3) - 0.5) * 2.4;
        if (d > r) continue;
        if (d > r - 1.2 && P.bt(x, y) < 0.5) continue;
        mt.put(x, y, M.mist, 0.66 - ((x - s / 2) / r) * 0.12 - ((y - s / 2) / r) * 0.18);
      }
    return mt;
  });
}

/** 폭포 줄기 — 세로로 흘러내리는 무늬 n 프레임 */
function waterfallFrames(fall, n = 4) {
  const h = fall.y1 - fall.y0, out = [];
  for (let f = 0; f < n; f++) {
    const mt = new Mat(fall.w + 4, h);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < fall.w; x++) {
        const k = (y - (f * 12) / n + 240) % 12;
        const streak = hash(x, Math.floor((y - (f * 12) / n + 240) / 12), 7) < 0.55;
        mt.put(x + 2, y, k < 5 && streak ? M.mist : M.water, k < 5 && streak ? 0.94 : 0.8 - (x / fall.w) * 0.14);
      }
    // 떨어지며 퍼지는 물안개
    for (let i = 0; i < 16; i++) {
      const y = h - 1 - Math.floor(hash(i, f, 3) * 26), x = Math.floor(hash(i, f, 5) * (fall.w + 4));
      mt.put(x, y, M.mist, 0.9);
    }
    out.push(mt);
  }
  return out;
}

/** 멀리 나는 용 — 날갯짓 n 프레임 (오른쪽을 본다) */
function dragonFrames(n = 6) {
  const out = [];
  for (let f = 0; f < n; f++) {
    const mt = new Mat(64, 44);
    const cx = 30, cy = 24;
    const flap = Math.sin((f / n) * Math.PI * 2);
    const body = M.roofPlum, wing = M.clothRed;
    // 뒤 날개
    const wy = cy - 3 - flap * 11;
    mt.poly([[cx - 2, cy - 2], [cx - 14, wy - 3], [cx - 4, wy + 2], [cx + 8, cy - 3]], wing, 0.3);
    // 꼬리 · 몸 · 목 · 머리
    for (let t = 0; t <= 1; t += 0.02) {
      const x = cx - 8 - t * 20, y = cy + 1 + Math.sin(t * 3 + f * 0.5) * 3 + t * 2, r = 2.6 * (1 - t) + 0.5;
      mt.disc(x, y, r, r, body, 0.44 - t * 0.1);
    }
    mt.put(cx - 29, cy + 2 + Math.sin(3 + f * 0.5) * 3, body, 0.5);
    mt.put(cx - 30, cy + 1 + Math.sin(3 + f * 0.5) * 3, body, 0.5);
    mt.disc(cx - 1, cy, 9, 4.2, body, (x, y, dx, dy) => 0.5 - dx * 0.08 - dy * 0.24);
    for (let t = 0; t <= 1; t += 0.05) mt.disc(cx + 7 + t * 9, cy - 1 - t * 5, 2.6 - t * 0.6, 2.4 - t * 0.6, body, 0.5 - t * 0.04);
    mt.disc(cx + 19, cy - 7, 3.6, 2.4, body, (x, y, dx, dy) => 0.56 - dy * 0.2);
    mt.put(cx + 23, cy - 6, body, 0.5);
    mt.put(cx + 17, cy - 10, body, 0.36);
    mt.put(cx + 15, cy - 10, body, 0.36);
    mt.put(cx + 20, cy - 8, M.gold, 0.8);
    // 다리
    mt.rect(cx - 3, cy + 3, cx - 1, cy + 7, body, 0.34);
    mt.rect(cx + 4, cy + 3, cx + 6, cy + 6, body, 0.34);
    // 앞 날개 — 손가락뼈 사이로 막이 펴진다
    const tipY = cy - 2 - flap * 15, midY = cy - 5 - flap * 8;
    mt.poly([[cx + 6, cy - 3], [cx - 2, midY - 5], [cx - 20, tipY], [cx - 12, tipY + 7 + flap * 2], [cx - 8, midY + 5], [cx - 2, cy]], wing, (x, y) => 0.56 - ((cx - x) / 22) * 0.2);
    mt.line(cx + 6, cy - 3, cx - 2, midY - 5, body, 0.5);
    mt.line(cx - 2, midY - 5, cx - 20, tipY, body, 0.5);
    mt.line(cx - 2, midY - 5, cx - 12, tipY + 7 + flap * 2, body, 0.4);
    out.push(mt);
  }
  return out;
}

/** 시계탑 꼭대기의 깃발 — 펄럭임 n 프레임 */
function flagFrames(n = 4) {
  const out = [];
  for (let f = 0; f < n; f++) {
    const mt = new Mat(18, 12);
    for (let x = 0; x < 15; x++) {
      const wave = Math.sin(x * 0.7 - (f / n) * Math.PI * 2) * (x / 15) * 2.2;
      const hgt = 7 - Math.floor(x / 4);
      for (let y = 0; y < hgt; y++) mt.put(1 + x, Math.round(2 + wave + y + x * 0.1), y === 0 || y === hgt - 1 ? M.gold : M.clothRed, 0.62 - Math.cos(x * 0.7 - (f / n) * Math.PI * 2) * 0.12);
    }
    out.push(mt);
  }
  return out;
}

/**
 * 흘러가는 구름 한 겹 — 가로로 이어 붙여도 이음매가 없다.
 * (오른쪽 끝 M 픽셀을 왼쪽 끝과 겹쳐 섞어 반복 무늬로 만든다)
 */
function cloudStrip(ph, seed, o = {}) {
  const Mg = 160, h = o.h ?? 250;
  const wide = new P.Buf(W + Mg, h);
  P.clouds(wide, { base: o.base ?? 138, h: o.ch ?? 50, cols: ph.cloud, seed, amount: o.amount ?? 0.5, t: 0, T: 1 });
  const out = new P.Buf(W, h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < W; x++) {
      const a = wide.px[y * wide.w + x];
      if (x >= Mg) {
        out.px[y * W + x] = a;
        continue;
      }
      // 왼쪽 M 픽셀: 원래 그림에서 넘친 오른쪽 끝(x + W)과 서서히 바꿔치기
      const b = wide.px[y * wide.w + x + W];
      // 픽셀마다 섞으면 지글거리므로, 구름 덩어리 크기의 얼룩 단위로 넘어간다
      const t = x / Mg;
      out.px[y * W + x] = fbm(x * 0.035, y * 0.06, 2, 91) * 0.7 + 0.15 < t ? a : b;
    }
  return out;
}

/** 광장 가장자리의 큰 가을 나무 — 가만히 선 그림 + 잎이 흔들리는 n 프레임 */
function treeFrames(o, n = 3) {
  const w = o.w ?? 230, h = o.h ?? 250;
  const make = (wind) => {
    const b = new P.Buf(w, h);
    P.branchTree(b, {
      x: o.x ?? w / 2, base: h - 6, trunk: o.trunk ?? 74, width: o.width ?? 7, depth: o.depth ?? 4,
      spread: o.spread ?? 0.62, decay: 0.74, up: 0.16, clumpR: o.clumpR ?? [9, 16], tipClumps: 4, midLeaves: 2,
      cols: o.cols, bark: MATS[M.bark], seed: o.seed ?? 3, lean: o.lean ?? 0, jitter: 0.5, gaps: 0.1, wind,
    });
    // 뿌리 둘레의 돌 화단
    for (let y = h - 9; y < h; y++)
      for (let x = Math.round((o.x ?? w / 2) - 17); x < (o.x ?? w / 2) + 17; x++) {
        const c = MATS[M.stonePale][y === h - 9 ? 5 : (x + Math.floor(y / 4) * 4) % 9 === 0 ? 2 : 4 - (x > (o.x ?? w / 2) ? 1 : 0)];
        b.pset(x, y, c);
      }
    return b;
  };
  const still = make(null), moved = make({ phase: 0.25, amp: 1.2, flutter: 0.5 });
  return P.leafFlicker(still, moved, n, { density: 0.3 });
}

module.exports = { flameFrames, puffs, waterfallFrames, dragonFrames, flagFrames, cloudStrip, treeFrames };
