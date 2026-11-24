// 광장의 랜드마크 — 시계탑이 선 마을회관, 먼 성, 뒷줄 집.
const { P, M, Mat, WARM, clamp, hash, fbm, plaster, ashlar, bricks, planks, tiles } = require('./kit');
const { hbeam, vbeam, windowAt, doorAt, wallLantern, litColor } = require('./buildings');

/** 아치 구멍 — 안은 어둡고, 저녁엔 은은히 밝다 */
function archHole(mt, x, yBot, w, h, o = {}) {
  const r = w / 2, cx = x + w / 2, cy = yBot - h + r;
  for (let yy = yBot - h; yy < yBot; yy++)
    for (let xx = x; xx < x + w; xx++) {
      if (yy < cy && Math.hypot(xx + 0.5 - cx, yy + 0.5 - cy) > r) continue;
      const depth = clamp((xx - x) / w);
      mt.put(xx, yy, o.m ?? M.iron, 0.2 + depth * 0.1 + (yy - (yBot - h)) / h * 0.12);
      if (o.lit) mt.setLit(xx, yy, yy > yBot - h * 0.55 ? WARM.edge : [150, 84, 50]);
    }
  // 아치 테두리돌
  for (let a = Math.PI; a <= Math.PI * 2 + 0.01; a += 0.04) {
    const px = cx + Math.cos(a) * (r + 0.6), py = cy + Math.sin(a) * (r + 0.6);
    mt.put(px - 0.5, py - 0.5, M.stonePale, 0.78 - (px > cx ? 0.2 : 0));
  }
}

/**
 * 마을회관 + 시계탑. 광장 한가운데 축에 정면으로 선다.
 * 돌려주는 값: { mat, ox, oy, clock: [x, y, r], smoke } — ox 는 탑의 가운데.
 */
function townHall(o = {}) {
  const mt = new Mat(190, 270);
  const cx = 95, base = 268;
  const tw = 62, tx0 = cx - tw / 2, tx1 = cx + tw / 2;
  const bodyTop = base - 164;

  // ----- 양쪽 날개 -----
  const wing = (x0, x1, flip) => {
    const top = base - 78;
    // 1층: 돌 아케이드
    ashlar(mt, x0, base - 42, x1, base, M.stone, { seed: 21 + x0, bh: 6, bw: 11 });
    const aw = 15, gap = (x1 - x0 - aw * 2) / 3;
    for (let i = 0; i < 2; i++) archHole(mt, Math.round(x0 + gap + i * (aw + gap)), base, aw, 30, { lit: true });
    // 2층: 목골조
    plaster(mt, x0, top, x1, base - 42, M.plaster, 31 + x0);
    hbeam(mt, x0, x1, base - 45, 3, M.timber);
    hbeam(mt, x0, x1, top, 3, M.timber, 0.46);
    for (let i = 0; i <= 3; i++) vbeam(mt, Math.round(x0 + (i * (x1 - x0 - 3)) / 3), top, base - 42, i % 3 ? 2 : 3, M.timber);
    hbeam(mt, x0, x1, top + 22, 2, M.timber);
    const bw = (x1 - x0) / 3;
    for (const i of [0, 2]) windowAt(mt, Math.round(x0 + i * bw + bw / 2 - 5), top + 6, 10, 14, { lit: hash(i, x0, 3) < 0.7, box: true });
    mt.beam(x0 + bw + 2, top + 4, x0 + bw * 2 - 1, top + 21, 2, M.timber);
    mt.beam(x0 + bw * 2 - 1, top + 4, x0 + bw + 2, top + 21, 2, M.timber);
    mt.shade(x0, top, x1, top + 6, (x, y) => -0.28 + (y - top) * 0.05);
    // 지붕 (정면으로 흘러내리는 면)
    const rh = 28;
    const R = new Mat(x1 - x0 + 8, rh);
    tiles(R, 0, 0, R.w, rh, M.roofTerra, { seed: 5 + x0, tw: 6 });
    R.shade(0, rh - 2, R.w, rh, -0.22);
    mt.blit(R, x0 - 4, top - rh + 3);
    mt.beam(x0 - 4, top - rh + 3, x1 + 4, top - rh + 3, 2.4, M.roofTerra, 0.44, 0.26);
    mt.rect(x0 - 4, top + 3, x1 + 4, top + 4, M.timber, 0.26);
    void flip;
  };
  wing(tx0 - 46, tx0, false);
  wing(tx1, tx1 + 46, true);

  // ----- 탑 몸통 -----
  ashlar(mt, tx0, bodyTop, tx1, base, M.stonePale, { seed: 4, bh: 6, bw: 12, base: 0.56 });
  // 오른쪽으로 갈수록 살짝 어둡게 (둥근 맛)
  mt.shade(tx0, bodyTop, tx1, base, (x) => 0.04 - ((x - tx0) / tw) * 0.14);
  for (let y = bodyTop; y < base; y += 6) {
    const wq = Math.floor((y - bodyTop) / 6) % 2 ? 5 : 8;
    mt.rect(tx0, y, tx0 + wq, Math.min(base, y + 5), M.stone, (xx, yy) => (yy === y ? 0.74 : 0.6));
    mt.rect(tx1 - wq, y, tx1, Math.min(base, y + 5), M.stone, (xx, yy) => (yy === y ? 0.56 : 0.44));
  }
  // 밑단
  ashlar(mt, tx0 - 2, base - 9, tx1 + 2, base, M.stone, { seed: 9, bh: 5, bw: 10, base: 0.5 });
  mt.rect(tx0 - 2, base - 10, tx1 + 2, base - 9, M.stonePale, 0.8);
  // 돌림띠
  for (const y of [base - 68, base - 100]) {
    mt.rect(tx0 - 1, y, tx1 + 1, y + 1, M.stonePale, 0.84);
    mt.rect(tx0 - 1, y + 1, tx1 + 1, y + 2, M.stonePale, 0.58);
    mt.shade(tx0, y + 2, tx1, y + 4, -0.14);
  }
  // 문루 통로 — 탑 밑을 뚫고 지나가는 아치. 그 너머로 윗마을로 오르는 길이 보인다
  const dw = 30, dh = 46;
  {
    const r = dw / 2, cy = base - dh + r;
    for (let yy = base - dh - 5; yy < base; yy++)
      for (let xx = cx - dw / 2 - 5; xx < cx + dw / 2 + 5; xx++) {
        const d = yy < cy ? Math.hypot(xx + 0.5 - cx, yy + 0.5 - cy) : Math.abs(xx + 0.5 - cx);
        if (d > r + 5) continue;
        if (d > r) {
          // 아치 테두리돌
          mt.put(xx, yy, M.stonePale, 0.82 - (xx > cx ? 0.16 : 0) - (yy < cy ? (Math.floor(Math.atan2(yy - cy, xx - cx) * 6) % 2 ? 0.08 : 0) : Math.floor(yy / 6) % 2 ? 0.08 : 0));
          continue;
        }
        // 통로 안: 안쪽 벽 그늘 → 가운데는 햇빛 든 먼 길
        const u = (xx + 0.5 - cx) / r, v = (yy - (base - dh)) / dh;
        if (Math.abs(u) > 0.62) {
          mt.put(xx, yy, M.stone, 0.2 + (1 - Math.abs(u)) * 0.2 + v * 0.06);
          continue;
        }
        // 멀리 보이는 것: 하늘빛 안개 · 집 그림자 · 오르막 길
        const far = v < 0.5 ? 0.9 - v * 0.3 : 0.74 - (v - 0.5) * 0.5;
        const roof = v > 0.3 && v < 0.62 && fbm(xx * 0.4, 3, 2, 8) > 0.5 - (v - 0.3);
        mt.put(xx, yy, roof ? M.rock : v > 0.6 ? M.cobble : M.mist, roof ? 0.5 : v > 0.6 ? 0.72 - Math.abs(u) * 0.3 : far);
        mt.setLit(xx, yy, v > 0.55 ? [214, 150, 84] : [120, 96, 110]);
      }
    // 올려 둔 쇠창살
    for (let xx = cx - dw / 2 + 2; xx < cx + dw / 2 - 1; xx += 4) mt.rect(xx, base - dh + 2, xx + 1, base - dh + 9, M.iron, 0.24);
    mt.rect(cx - dw / 2 + 2, base - dh + 8, cx + dw / 2 - 2, base - dh + 9, M.iron, 0.3);
  }
  wallLantern(mt, cx - dw / 2 - 8, base - 34, -1);
  wallLantern(mt, cx + dw / 2 + 7, base - 34, 1);
  mt.lights.push({ x: cx, y: base - 6, r: 50, power: 0.6 });
  // 문 위 문장
  mt.disc(cx, base - 58, 5.5, 6, M.gold, (x, y, dx, dy) => 0.62 - dx * 0.2 - dy * 0.2);
  mt.disc(cx, base - 58, 3.2, 3.8, M.clothRed, 0.56);
  mt.put(cx - 1, base - 59, M.gold, 0.8);
  mt.put(cx, base - 58, M.gold, 0.8);
  // 좁은 창
  for (const dxw of [-17, 12]) windowAt(mt, cx + dxw, base - 90, 6, 16, { frame: M.stone, frameV: 0.4, sill: M.stonePale, arch: true, lit: true });
  // 긴 깃발 두 장 (동아리 색)
  for (const [bx, m] of [[tx0 + 5, M.clothGreen], [tx1 - 12, M.clothGreen]]) {
    mt.rect(bx - 1, base - 58, bx + 8, base - 57, M.iron, 0.3);
    for (let y = base - 57; y < base - 26; y++)
      for (let x = bx; x < bx + 7; x++) {
        const tail = y - (base - 30);
        if (tail > 0 && Math.abs(x - bx - 3) < tail) continue;
        mt.put(x, y, x === bx || x === bx + 6 ? M.gold : m, 0.6 - ((x - bx) / 7) * 0.2 + Math.sin((y - base) * 0.5) * 0.06);
      }
    mt.put(bx + 3, base - 46, M.gold, 0.76);
    mt.put(bx + 2, base - 45, M.gold, 0.7);
    mt.put(bx + 4, base - 45, M.gold, 0.7);
    mt.put(bx + 3, base - 44, M.gold, 0.66);
  }

  // ----- 시계 -----
  const ky = base - 124, kr = 17;
  mt.disc(cx, ky, kr + 3, kr + 3, M.stone, (x, y, dx, dy) => 0.5 - dx * 0.14 - dy * 0.16);
  mt.disc(cx, ky, kr + 1, kr + 1, M.gold, (x, y, dx, dy) => 0.56 - dx * 0.22 - dy * 0.24);
  for (let y = ky - kr; y <= ky + kr; y++)
    for (let x = cx - kr; x <= cx + kr; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - ky);
      if (d > kr - 1) continue;
      mt.put(x, y, M.clothCream, 0.82 - (d / kr) * 0.1 - ((x - cx) / kr) * 0.06 - (y < ky - kr + 4 ? 0.12 : 0));
      mt.setLit(x, y, d < kr * 0.6 ? [255, 244, 206] : [250, 222, 160]);
    }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, r0 = i % 3 ? kr - 4 : kr - 6;
    for (let r = r0; r <= kr - 3; r++) mt.put(cx - 0.5 + Math.cos(a) * r, ky - 0.5 + Math.sin(a) * r, M.timber, 0.2);
  }

  // ----- 처마띠 · 종루 -----
  const cor = bodyTop;
  mt.rect(tx0 - 3, cor - 4, tx1 + 3, cor, M.stonePale, (x, y) => (y === cor - 4 ? 0.86 : y === cor - 1 ? 0.5 : 0.7) - ((x - tx0) / tw) * 0.1);
  for (let x = tx0 - 2; x < tx1 + 2; x += 4) mt.rect(x, cor, x + 2, cor + 2, M.stonePale, 0.56);
  mt.shade(tx0, cor + 2, tx1, cor + 6, (x, y) => -0.24 + (y - cor - 2) * 0.05);
  const bx0 = tx0 + 3, bx1 = tx1 - 3, bTop = cor - 4 - 30;
  ashlar(mt, bx0, bTop, bx1, cor - 4, M.stonePale, { seed: 14, bh: 6, bw: 11, base: 0.58 });
  mt.shade(bx0, bTop, bx1, cor - 4, (x) => 0.04 - ((x - bx0) / (bx1 - bx0)) * 0.14);
  for (const ax of [bx0 + 8, bx1 - 8 - 14]) {
    archHole(mt, ax, cor - 6, 14, 22, { lit: false });
    // 종
    mt.disc(ax + 7, cor - 15, 3.4, 4, M.gold, (x, y, dx, dy) => 0.5 - dx * 0.24 - dy * 0.2);
    mt.rect(ax + 3, cor - 12, ax + 11, cor - 11, M.gold, 0.4);
    mt.put(ax + 6.5, cor - 10, M.iron, 0.3);
    mt.rect(ax + 6, cor - 26, ax + 8, cor - 19, M.timber, 0.3);
  }
  mt.rect(bx0 - 3, bTop - 4, bx1 + 3, bTop, M.stonePale, (x, y) => (y === bTop - 4 ? 0.86 : y === bTop - 1 ? 0.5 : 0.7) - ((x - bx0) / tw) * 0.1);
  mt.shade(bx0, bTop, bx1, bTop + 4, (x, y) => -0.22 + (y - bTop) * 0.05);

  // ----- 뾰족지붕 -----
  const rb = bTop - 4, apex = rb - 58, half = (bx1 - bx0) / 2 + 5;
  const T = new Mat(Math.ceil(half * 2) + 2, 60);
  tiles(T, 0, 0, T.w, 60, M.roofSlate, { seed: 33, tw: 5, th: 3, moss: 0.06 });
  for (let y = 0; y < 58; y++) {
    const t = (y + 0.5) / 58;
    // 아래쪽이 살짝 벌어지는 종 모양
    const hw = half * (t * 0.82 + Math.pow(t, 4) * 0.18);
    for (let x = Math.ceil(cx - hw); x < cx + hw; x++) {
      const k = y * T.w + Math.round(x - cx + T.w / 2);
      const leftFace = x < cx - hw * 0.12;
      mt.put(x, apex + y, T.m[k] || M.roofSlate, T.v[k] + (leftFace ? 0.1 : -0.16) - (Math.abs(x - (cx - hw * 0.12)) < 1 ? -0.1 : 0));
    }
  }
  mt.rect(cx - half - 1, rb - 1, cx + half + 1, rb + 1, M.roofSlate, (x, y) => (y === rb - 1 ? 0.62 : 0.2));
  // 모서리 작은 첨탑
  for (const px of [bx0 - 1, bx1 - 4]) {
    mt.rect(px, rb - 9, px + 5, rb - 1, M.stonePale, (x) => (x === px ? 0.8 : x === px + 4 ? 0.46 : 0.64));
    for (let y = 0; y < 9; y++) {
      const hw = ((y + 1) / 9) * 3.4;
      for (let x = Math.ceil(px + 2.5 - hw); x < px + 2.5 + hw; x++) mt.put(x, rb - 18 + y, M.roofSlate, x < px + 2.5 ? 0.62 : 0.36);
    }
    mt.put(px + 2, rb - 19, M.gold, 0.74);
  }
  // 꼭대기 장식과 깃발
  mt.rect(cx - 1, apex - 12, cx + 1, apex + 2, M.iron, (x) => (x < cx ? 0.44 : 0.26));
  mt.disc(cx, apex - 1, 2.6, 2.6, M.gold, (x, y, dx, dy) => 0.62 - dx * 0.2 - dy * 0.2);
  mt.put(cx - 1, apex - 13, M.gold, 0.78);
  mt.put(cx, apex - 13, M.gold, 0.6);

  return { mat: mt, ox: cx, oy: base, clock: [cx, ky, kr], flag: [cx + 1, apex - 12] };
}

/** 뒷줄 집 — 앞줄 지붕 너머로 보이는 단순한 집. 세부는 줄이고 덩어리만 */
function backHouse(o) {
  const w = o.w, h = o.h, rh = o.rh ?? Math.round(w * 0.5);
  const mt = new Mat(w + 16, h + rh + 26);
  const x0 = 8, base = mt.h, top = base - h;
  const pm = M[o.plaster ?? 'plaster'], rm = M[o.roof ?? 'roofTerra'];
  plaster(mt, x0, top, x0 + w, base, pm, o.seed ?? 1, 0.58);
  hbeam(mt, x0, x0 + w, top, 2, M.timber);
  hbeam(mt, x0, x0 + w, top + Math.round(h * 0.45), 2, M.timber);
  for (let i = 0; i <= 3; i++) vbeam(mt, Math.round(x0 + (i * (w - 2)) / 3), top, base, 2, M.timber);
  const bw = w / 3;
  for (let i = 0; i < 3; i++) if (hash(i, o.seed ?? 1, 4) < 0.75) windowAt(mt, Math.round(x0 + i * bw + bw / 2 - 4), top + 6, 8, 11, { lit: hash(i, o.seed ?? 1, 6) < 0.6 });
  if (o.gable) {
    for (let y = 0; y < rh; y++) {
      const hw = ((y + 0.5) / rh) * (w / 2);
      for (let x = Math.ceil(x0 + w / 2 - hw); x < x0 + w / 2 + hw; x++) mt.put(x, top - rh + y, pm, 0.56 + (fbm(x * 0.05, y * 0.07, 2, 3) - 0.5) * 0.2);
    }
    vbeam(mt, Math.round(x0 + w / 2) - 1, top - rh + 4, top, 2, M.timber);
    hbeam(mt, x0 + w * 0.25, x0 + w * 0.75, top - Math.round(rh * 0.5), 2, M.timber);
    mt.beam(x0 + w / 2, top - rh - 1, x0 - 4, top + 3, 3, rm, 0.5, 0.2);
    mt.beam(x0 + w / 2, top - rh - 1, x0 + w + 4, top + 3, 3, rm, 0.36, 0.2);
  } else {
    const R = new Mat(w + 10, rh);
    tiles(R, 0, 0, R.w, rh, rm, { seed: (o.seed ?? 1) + 3, tw: 6 });
    R.shade(0, rh - 2, R.w, rh, -0.2);
    mt.blit(R, x0 - 5, top - rh + 2);
    mt.beam(x0 - 5, top - rh + 2, x0 + w + 5, top - rh + 2, 2.4, rm, 0.44, 0.24);
    if (o.chimney) {
      const cxp = x0 + Math.round(w * o.chimney);
      bricks(mt, cxp, top - rh - 12, cxp + 8, top - rh + 6, M.brick, 3);
      mt.rect(cxp - 1, top - rh - 14, cxp + 9, top - rh - 12, M.stonePale, 0.7);
    }
  }
  mt.shade(x0, top, x0 + w, top + 5, (x, y) => -0.26 + (y - top) * 0.05);
  return { mat: mt, ox: x0, oy: base };
}

module.exports = { townHall, backHouse, archHole };
