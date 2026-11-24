// 아래 광장의 소품 — 분수 · 천막 · 좌판 · 게임 소파 · 벤치 · 과녁 · 수레 · 통과 상자 · 가로등 · 이정표.
// 소품마다 { mat, ax, ay } 를 돌려준다. (ax, ay) 는 바닥에 닿는 기준점(가운데 아래).
const { P, M, Mat, WARM, clamp, hash, fbm, ashlar, planks, planksH } = require('./kit');

const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- 분수 (가운데 받침대가 동상 자리) ---------- */

/** frame: 0..n-1 — 물결과 물줄기가 프레임마다 달라진다 */
function fountain(frame = 0, n = 4) {
  const rx = 76, ry = 24, wallH = 15;
  const mt = new Mat(rx * 2 + 16, 132);
  const cx = mt.w / 2, cy = 84;
  const ph = frame / n;
  // 안쪽 뒷벽
  mt.disc(cx, cy, rx, ry, M.stone, (x, y, dx, dy) => 0.36 - dx * 0.1 + (dy < -0.4 ? 0.06 : 0));
  // 물 — 가운데에서 퍼지는 물결
  mt.disc(cx, cy + 4, rx - 6, ry - 4, M.water, (x, y, dx, dy) => {
    const d = Math.hypot(dx, dy * 1.1);
    const ring = Math.sin((d * 9 - ph * 2) * Math.PI);
    const glint = fbm(x * 0.3 + ph * 3, y * 0.9, 2, 5) > 0.7 ? 0.2 : 0;
    return 0.46 + ring * 0.09 * (1 - d * 0.5) + glint - dy * 0.1 - (dy < -0.55 ? 0.14 : 0);
  });
  // 앞벽
  for (let x = Math.ceil(cx - rx); x < cx + rx; x++) {
    const u = (x + 0.5 - cx) / rx, arc = cy + ry * Math.sqrt(Math.max(0, 1 - u * u));
    for (let y = Math.round(arc); y < Math.round(arc) + wallH; y++) {
      const row = Math.floor((y - arc) / 5), bxk = Math.floor((x + (row % 2) * 6) / 12);
      const edge = (Math.round(y - arc) % 5 === 4) || (x + (row % 2) * 6) % 12 === 11;
      mt.put(x, y, M.stonePale, 0.66 - u * 0.2 + (hash(bxk, row, 3) - 0.5) * 0.1 - (edge ? 0.18 : 0) - (y - arc > wallH - 3 ? 0.1 : 0));
    }
  }
  // 테두리 윗면
  for (let y = Math.floor(cy - ry); y <= cy + ry + 1; y++)
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const d0 = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry), d1 = Math.hypot((x + 0.5 - cx) / (rx - 6), (y + 0.5 - cy - 1) / (ry - 3.4));
      if (d0 <= 1 && d1 > 1) mt.put(x, y, M.stonePale, 0.84 - ((x - cx) / rx) * 0.1 - (y < cy ? 0.1 : 0) - (Math.floor(Math.atan2(y - cy, (x - cx) * 0.32) * 7) % 2 ? 0.05 : 0));
    }
  // 가운데 받침대 3단
  const tiers = [[28, cy + 4, 12], [20, cy - 8, 14], [10, cy - 22, 18], [14, cy - 40, 4]];
  for (const [hw, by, h] of tiers) {
    for (let y = by - h; y < by; y++)
      for (let x = Math.round(cx - hw); x < cx + hw; x++) {
        const u = (x + 0.5 - cx) / hw;
        const top = y < by - h + 3;
        mt.put(x, y, M.stonePale, top ? 0.9 - Math.abs(u) * 0.06 : 0.64 - u * 0.22 - (y === by - 1 ? 0.16 : 0) - ((x - Math.round(cx - hw)) % 9 === 8 ? 0.1 : 0));
      }
  }
  const topY = tiers[3][1] - tiers[3][2];
  // 명판
  mt.rect(cx - 9, cy - 16, cx + 9, cy - 11, M.gold, (x, y) => (y === cy - 16 ? 0.74 : 0.56));
  mt.rect(cx - 7, cy - 14, cx + 7, cy - 13, M.timber, 0.24);
  // 사자 머리에서 뿜는 물줄기 (양쪽)
  for (const s of [-1, 1]) {
    const sx = cx + s * 19, sy = cy - 14;
    mt.disc(sx, sy, 3, 3, M.gold, (x, y, dx, dy) => 0.6 - dx * 0.2 - dy * 0.2);
    for (let t = 0; t <= 1; t += 0.02) {
      const px = sx + s * (2 + t * 26), py = sy + t * t * 20 - t * 3;
      const gapk = Math.floor(t * 12 + ph * 4) % 4 === 0;
      if (!gapk) mt.put(px, py, M.mist, 0.96);
      mt.put(px, py + 1, M.water, 0.9);
      if (t > 0.5) mt.put(px + s, py + 1, M.mist, 0.8);
    }
    // 떨어진 자리의 물보라
    const lx = sx + s * 28, ly = sy + 17;
    for (let k = 0; k < 5; k++) mt.put(lx + (hash(k, frame, 3) - 0.5) * 9, ly + (hash(k, frame, 5) - 0.5) * 3, M.mist, 0.9);
  }
  return { mat: mt, ax: cx, ay: cy + ry + wallH, plinthTop: topY, cy, lights: [] };
}

/* ---------- 점성술 천막 ---------- */

function tent() {
  const mt = new Mat(150, 150);
  const cx = 75, base = 146, wallH = 46, r = 54, apex = 20;
  const wallTop = base - wallH;
  // 지붕 — 살짝 오목한 고깔, 천 조각을 이어 붙인 결
  for (let y = apex; y < wallTop + 2; y++) {
    const t = (y - apex) / (wallTop - apex);
    const hw = (r + 6) * (t * 0.7 + t * t * 0.3);
    for (let x = Math.ceil(cx - hw); x < cx + hw; x++) {
      const u = (x + 0.5 - cx) / Math.max(1, hw);
      const gore = Math.floor((Math.asin(clamp(u, -1, 1)) / Math.PI + 0.5) * 8);
      const seam = Math.abs(((Math.asin(clamp(u, -1, 1)) / Math.PI + 0.5) * 8) % 1) < 0.07;
      mt.put(x, y, gore % 2 ? M.clothPurple : M.clothBlue, 0.6 - u * 0.24 - (seam ? 0.14 : 0) + (1 - t) * 0.06);
    }
  }
  // 벽
  for (let x = cx - r; x < cx + r; x++) {
    const u = (x + 0.5 - cx) / r, dip = Math.round(5 * Math.sqrt(Math.max(0, 1 - u * u)));
    const band = Math.floor((Math.asin(clamp(u, -1, 1)) / Math.PI + 0.5) * 14);
    for (let y = wallTop; y < base - 5 + dip; y++) mt.put(x, y, band % 2 ? M.clothPurple : M.clothBlue, 0.46 - u * 0.22 + (fbm(x * 0.4, y * 0.05, 2, 3) - 0.5) * 0.1 - (y - wallTop < 8 ? 0.12 : 0));
  }
  // 물결 술 장식
  for (let x = cx - r - 6; x < cx + r + 6; x++) {
    const k = ((x - (cx - r - 6)) % 9 + 9) % 9, d = 6 - Math.abs(k - 4) * 1.2;
    for (let y = wallTop - 1; y < wallTop + 2 + d; y++) mt.put(x, y, M.clothGold, 0.66 - ((x - cx) / r) * 0.2 - (y > wallTop + 1 + d - 1.5 ? 0.14 : 0));
  }
  // 입구 — 젖혀 둔 천 사이로 안의 불빛
  for (let y = wallTop + 8; y < base; y++) {
    const t = (y - wallTop - 8) / (base - wallTop - 8), hw = 3 + t * 13;
    for (let x = Math.round(cx - hw); x < cx + hw; x++) {
      mt.put(x, y, M.clothBlack, 0.3 + t * 0.2);
      mt.setLit(x, y, t > 0.5 ? WARM.mid : WARM.edge);
    }
    mt.put(Math.round(cx - hw) - 1, y, M.clothGold, 0.6);
    mt.put(Math.round(cx + hw), y, M.clothGold, 0.46);
  }
  // 수정구슬 (안쪽에 놓여 은은히 빛난다)
  mt.disc(cx, base - 12, 4, 4, M.water, (x, y, dx, dy) => 0.7 - dx * 0.2 - dy * 0.3);
  for (let y = base - 15; y < base - 9; y++) for (let x = cx - 3; x < cx + 3; x++) if (mt.at(x, y) === M.water) mt.setGlow(x, y, Math.hypot(x - cx + 1, y - base + 13) < 2 ? [226, 244, 255] : [140, 196, 255]);
  mt.rect(cx - 3, base - 8, cx + 3, base - 6, M.gold, 0.5);
  // 별 무늬
  const stars = [[cx - 26, 62], [cx + 22, 56], [cx - 6, 44], [cx + 34, 80], [cx - 38, 84], [cx + 8, 76], [cx - 16, 86]];
  for (const [sx, sy] of stars) {
    mt.setGlow(sx, sy, [255, 226, 130]);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (mt.at(sx + dx, sy + dy)) mt.put(sx + dx, sy + dy, M.clothGold, 0.7);
  }
  // 꼭대기 장대와 깃발
  mt.rect(cx - 1, apex - 14, cx + 1, apex + 2, M.woodPale, (x) => (x < cx ? 0.7 : 0.46));
  mt.disc(cx, apex - 15, 2.4, 2.4, M.gold, 0.72);
  for (let i = 0; i < 12; i++) for (let j = 0; j < 6 - Math.floor(i / 2); j++) mt.put(cx + 1 + i, apex - 12 + j + Math.floor(i / 4), M.clothPurple, 0.66 - i * 0.02);
  // 버팀줄과 말뚝
  for (const s of [-1, 1]) {
    mt.line(cx + s * (r + 2), wallTop + 2, cx + s * (r + 17), base - 2, M.woodPale, 0.6);
    mt.rect(cx + s * (r + 17) - 1, base - 6, cx + s * (r + 17) + 1, base, M.wood, 0.4);
  }
  mt.lights.push({ x: cx, y: base - 10, r: 46, power: 0.7 });
  return { mat: mt, ax: cx, ay: base, stars };
}

/* ---------- 좌판 ---------- */

/** kind: 'fruit' | 'bread' | 'cloth' | 'scroll' */
function stall(o = {}) {
  const w = o.w ?? 92;
  const mt = new Mat(w + 24, 96);
  const x0 = 12, x1 = x0 + w, base = 92, top = 14;
  const ma = M[o.a ?? 'clothRed'], mb = M[o.b ?? 'clothCream'];
  // 뒷기둥과 뒤 가로대
  mt.rect(x0 + 3, top + 6, x0 + 6, base - 8, M.wood, (x) => (x === x0 + 3 ? 0.56 : 0.36));
  mt.rect(x1 - 6, top + 6, x1 - 3, base - 8, M.wood, (x) => (x === x1 - 6 ? 0.5 : 0.3));
  // 뒤 천 (그늘진 안쪽)
  mt.rect(x0 + 6, top + 14, x1 - 6, base - 28, M.clothBrown, (x, y) => 0.22 + ((y - top) / 60) * 0.1);
  // 선반과 매단 물건
  mt.rect(x0 + 6, top + 30, x1 - 6, top + 32, M.wood, 0.4);
  const hang = o.hang ?? [M.clothRed, M.hay, M.leafGreen];
  for (let x = x0 + 12; x < x1 - 10; x += 11) {
    const g = hang[Math.floor(hash(x, w, 3) * hang.length)], len = 5 + Math.floor(hash(x, w, 5) * 5);
    mt.rect(x, top + 15, x + 1, top + 18, M.woodPale, 0.5);
    mt.rect(x - 1, top + 18, x + 2, top + 18 + len, g, (xx, yy) => 0.6 - (xx - x) * 0.1 - (yy - top - 18) * 0.02);
  }
  // 매단 등
  const lx = x0 + Math.round(w * 0.5);
  mt.rect(lx, top + 14, lx + 1, top + 18, M.iron, 0.3);
  mt.rect(lx - 2, top + 18, lx + 3, top + 24, M.glass, 0.72);
  mt.rect(lx - 2, top + 17, lx + 3, top + 18, M.iron, 0.3);
  mt.rect(lx - 2, top + 24, lx + 3, top + 25, M.iron, 0.26);
  for (let y = top + 18; y < top + 24; y++) for (let x = lx - 2; x < lx + 3; x++) mt.setLit(x, y, x === lx ? WARM.core : WARM.mid);
  mt.lights.push({ x: lx, y: top + 26, r: 52, power: 0.9 });
  // 판매대: 윗면 + 앞판(천을 둘렀다)
  const ct = base - 30;
  mt.rect(x0 - 2, ct, x1 + 2, ct + 5, M.woodPale, (x, y) => (y === ct ? 0.84 : 0.7 - (y - ct) * 0.03) + (hash(Math.floor(x / 9), 1, 7) - 0.5) * 0.08);
  mt.rect(x0 - 2, ct + 5, x1 + 2, ct + 7, M.wood, 0.3);
  for (let y = ct + 7; y < base - 2; y++)
    for (let x = x0; x < x1; x++) {
      const fold = Math.sin((x - x0) * 0.7) * 0.05;
      const st = Math.floor((x - x0) / 8) % 2;
      const hem = y > base - 7 - Math.round(Math.abs(Math.sin((x - x0) * 0.35)) * 2);
      if (hem && y > base - 5) continue;
      mt.put(x, y, st ? mb : ma, 0.5 + fold - ((y - ct) / 30) * 0.12 - ((x - x0) / w) * 0.1);
    }
  mt.rect(x0 + 2, base - 6, x0 + 5, base, M.wood, 0.3);
  mt.rect(x1 - 5, base - 6, x1 - 2, base, M.wood, 0.26);
  // 물건
  const kind = o.kind ?? 'fruit';
  const basket = (bx, cols) => {
    mt.rect(bx, ct - 4, bx + 14, ct + 1, M.hay, (x, y) => 0.46 + ((x + y) % 2) * 0.12 - (x - bx) * 0.012);
    for (let i = 0; i < 9; i++) {
      const px = bx + 1 + (i % 5) * 2.6 + (i > 4 ? 1.2 : 0), py = ct - 5 - (i > 4 ? 2 : 0);
      const c = cols[Math.floor(hash(i, bx, 3) * cols.length)];
      mt.rect(px, py, px + 2, py + 2, c, (x, y) => (y === Math.round(py) ? 0.72 : 0.5));
    }
  };
  if (kind === 'fruit') {
    basket(x0 + 4, [M.clothRed, M.clothRed, M.leafGold]);
    basket(x0 + 24, [M.leafOrange, M.pumpkin]);
    basket(x0 + 44, [M.leafGreen, M.grass]);
    basket(x0 + 64, [M.clothPurple, M.clothRed]);
  } else if (kind === 'bread') {
    for (let i = 0; i < 6; i++) {
      const bx = x0 + 5 + i * 13;
      mt.disc(bx + 5, ct - 3, 5.5, 3.2, M.hay, (x, y, dx, dy) => 0.56 - dx * 0.14 - dy * 0.24 - (Math.round(x) % 3 === 0 ? 0.12 : 0));
    }
    mt.rect(x0 + 70, ct - 10, x0 + 84, ct, M.hay, (x, y) => 0.5 + ((x + y) % 2) * 0.1);
  } else if (kind === 'cloth') {
    const rolls = [M.clothBlue, M.clothRed, M.clothGreen, M.clothGold, M.clothPurple, M.clothTeal];
    rolls.forEach((c, i) => {
      const bx = x0 + 4 + i * 14;
      mt.rect(bx, ct - 6, bx + 12, ct, c, (x, y) => 0.66 - (y - ct + 6) * 0.05 - (x === bx + 11 ? 0.14 : 0));
      mt.disc(bx + 1.5, ct - 3, 1.6, 3, M.clothCream, 0.7);
    });
  } else {
    // 두루마리와 물약
    for (let i = 0; i < 4; i++) {
      const bx = x0 + 5 + i * 13;
      mt.rect(bx, ct - 4, bx + 11, ct, M.clothCream, (x, y) => 0.8 - (y - ct + 4) * 0.06);
      mt.rect(bx, ct - 4, bx + 2, ct, M.gold, 0.56);
      mt.rect(bx + 9, ct - 4, bx + 11, ct, M.gold, 0.46);
    }
    const pots = [[150, 232, 255], [255, 140, 220], [170, 255, 150]];
    pots.forEach((c, i) => {
      const bx = x0 + 60 + i * 9;
      mt.rect(bx + 1, ct - 9, bx + 3, ct - 6, M.glass, 0.7);
      mt.rect(bx, ct - 6, bx + 4, ct, M.glass, 0.6);
      for (let y = ct - 5; y < ct - 1; y++) for (let x = bx; x < bx + 4; x++) mt.setGlow(x, y, x === bx + 1 && y === ct - 5 ? [255, 255, 255] : c);
    });
    mt.lights.push({ x: x0 + 72, y: ct - 4, r: 26, power: 0.5, color: [150, 220, 255] });
  }
  // 앞기둥
  mt.rect(x0, top + 10, x0 + 3, base, M.wood, (x) => (x === x0 ? 0.62 : x === x0 + 2 ? 0.34 : 0.48));
  mt.rect(x1 - 3, top + 10, x1, base, M.wood, (x) => (x === x1 - 3 ? 0.56 : x === x1 - 1 ? 0.28 : 0.42));
  // 차양 — 앞으로 기운 줄무늬 천
  for (let r = 0; r < 15; r++) {
    const grow = Math.round((r / 14) * 8);
    for (let x = x0 - 2 - grow; x < x1 + 2 + grow; x++) {
      const u = (x - (x0 - 2 - grow)) / (w + 4 + grow * 2);
      const st = Math.floor(u * (w / 7)) % 2;
      mt.put(x, top + r, st ? mb : ma, 0.74 - (r / 14) * 0.18 - (u - 0.5) * 0.12 + (r === 0 ? 0.08 : 0));
    }
  }
  for (let x = x0 - 10; x < x1 + 10; x++) {
    const u = (x - (x0 - 10)) / (w + 20), st = Math.floor(u * (w / 7)) % 2, k = ((x - x0 + 10) % 7 + 7) % 7;
    const d = k === 3 ? 4 : k === 2 || k === 4 ? 3 : k === 0 || k === 6 ? 1 : 2;
    for (let y = top + 15; y < top + 15 + d; y++) mt.put(x, y, st ? mb : ma, 0.5 - (y - top - 15) * 0.04 - (u - 0.5) * 0.1);
  }
  mt.shade(x0 - 4, top + 19, x1 + 4, top + 26, (x, y) => -0.16 + (y - top - 19) * 0.02);
  return { mat: mt, ax: x0 + w / 2, ay: base, counterY: ct };
}

/* ---------- 게임 코너: 소파 · 브라운관 TV · 게임기 ---------- */

function sofa() {
  const mt = new Mat(100, 60);
  const cx = 50, base = 56;
  // 등받이
  for (let y = 6; y < 36; y++)
    for (let x = 10; x < 90; x++) {
      const round = y < 10 && (x < 14 - (y - 6) || x > 85 + (y - 6));
      if (round) continue;
      const tuft = (x - 10) % 20 === 19;
      mt.put(x, y, M.clothBlue, 0.56 - ((x - 10) / 80) * 0.14 - ((y - 6) / 30) * 0.1 + (y < 9 ? 0.12 : 0) - (tuft ? 0.12 : 0));
    }
  for (const bx of [29, 49, 69]) for (const by of [16, 26]) mt.put(bx, by, M.clothGold, 0.66);
  // 앉는 면
  mt.rect(12, 34, 88, 42, M.clothBlue, (x, y) => 0.7 - (y - 34) * 0.03 - ((x - 12) / 76) * 0.1 - ((x - 12) % 25 === 24 ? 0.14 : 0));
  mt.rect(12, 42, 88, 52, M.clothBlue, (x, y) => 0.42 - (y - 42) * 0.015 - ((x - 12) / 76) * 0.1);
  // 팔걸이
  for (const [ax, dark] of [[4, 0], [84, 0.1]]) {
    mt.rect(ax, 22, ax + 12, 52, M.clothBlue, (x, y) => 0.58 - dark - ((x - ax) / 12) * 0.14 - ((y - 22) / 30) * 0.08);
    mt.rect(ax - 1, 20, ax + 13, 25, M.clothBlue, (x, y) => (y < 22 ? 0.8 : 0.62) - dark - ((x - ax) / 12) * 0.1);
  }
  // 나무 다리 · 금 술
  for (const lx of [8, 86]) mt.rect(lx, 52, lx + 5, base, M.wood, (x) => (x === lx ? 0.56 : 0.34));
  for (let x = 12; x < 88; x += 2) mt.put(x, 52, M.clothGold, 0.6);
  return { mat: mt, ax: cx, ay: base, seatY: 40 };
}

function tvSet() {
  const mt = new Mat(64, 76);
  const base = 72;
  // 나무 궤짝
  planksH(mt, 10, base - 22, 54, base, M.wood, { pw: 5, seed: 3, base: 0.48 });
  mt.rect(10, base - 22, 54, base - 20, M.woodPale, 0.72);
  mt.rect(10, base - 22, 12, base, M.wood, 0.6);
  mt.rect(52, base - 22, 54, base, M.wood, 0.3);
  mt.rect(12, base - 12, 52, base - 11, M.iron, 0.3);
  // 브라운관 TV
  const tx0 = 8, ty0 = base - 60, tx1 = 56, ty1 = base - 22;
  mt.rect(tx0, ty0, tx1, ty1, M.clothGray, (x, y) => 0.4 - ((x - tx0) / 48) * 0.12 + (y < ty0 + 2 ? 0.2 : 0) - (y > ty1 - 3 ? 0.1 : 0));
  mt.rect(tx0 + 3, ty0 + 4, tx1 - 12, ty1 - 5, M.clothBlack, 0.3);
  const scr = { x: tx0 + 5, y: ty0 + 6, w: tx1 - 12 - tx0 - 7, h: ty1 - 5 - ty0 - 8 };
  for (let y = scr.y; y < scr.y + scr.h; y++) for (let x = scr.x; x < scr.x + scr.w; x++) {
    mt.put(x, y, M.clothBlue, 0.3);
    mt.setGlow(x, y, y < scr.y + scr.h * 0.42 ? [42, 74, 122] : [20, 33, 61]);
  }
  // 다이얼 · 전원 불 · 안테나
  mt.disc(tx1 - 6, ty0 + 10, 3, 3, M.clothBlack, 0.4);
  mt.disc(tx1 - 6, ty0 + 20, 3, 3, M.clothBlack, 0.4);
  mt.setGlow(tx1 - 7, ty1 - 8, [201, 247, 61]);
  mt.setGlow(tx1 - 6, ty1 - 8, [201, 247, 61]);
  mt.line(26, ty0, 16, ty0 - 12, M.iron, 0.4);
  mt.line(34, ty0, 46, ty0 - 12, M.iron, 0.4);
  mt.rect(26, ty0 - 2, 36, ty0, M.clothGray, 0.3);
  mt.lights.push({ x: scr.x + scr.w / 2 + 14, y: base - 16, r: 44, power: 0.6, color: [120, 190, 255], always: true });
  return { mat: mt, ax: 32, ay: base, screen: scr };
}

function consoleBox() {
  const mt = new Mat(26, 12);
  mt.rect(2, 3, 22, 10, M.clothWhite, (x, y) => (y === 3 ? 0.8 : y === 9 ? 0.4 : 0.64) - (x / 22) * 0.1);
  mt.rect(8, 5, 16, 7, M.clothGray, 0.3);
  mt.setGlow(19, 6, [255, 47, 143]);
  return { mat: mt, ax: 12, ay: 10 };
}

/* ---------- 벤치 · 화로 ---------- */

function bench() {
  const mt = new Mat(112, 50);
  const base = 46;
  // 등받이
  planksH(mt, 8, 6, 104, 22, M.wood, { pw: 5, seed: 5, base: 0.5 });
  for (const px of [8, 54, 100]) mt.rect(px, 2, px + 4, 34, M.wood, (x) => (x === px ? 0.62 : x === px + 3 ? 0.3 : 0.44));
  // 앉는 판
  mt.rect(4, 28, 108, 33, M.woodPale, (x, y) => (y === 28 ? 0.84 : 0.7 - (y - 28) * 0.03) - (x % 26 === 25 ? 0.14 : 0));
  mt.rect(4, 33, 108, 36, M.wood, 0.34);
  // 다리
  for (const lx of [10, 96]) {
    mt.rect(lx, 36, lx + 5, base, M.wood, (x) => (x === lx ? 0.56 : 0.34));
    mt.rect(lx - 3, 30, lx, 38, M.wood, 0.4);
  }
  mt.rect(14, 40, 98, 42, M.wood, 0.3);
  return { mat: mt, ax: 56, ay: base };
}

/** 세 발 쇠 화로 — 불꽃은 따로 얹는다 */
function brazier() {
  const mt = new Mat(34, 50);
  const cx = 17, base = 46;
  for (const s of [-1, 0, 1]) mt.line(cx + s * 3, 22, cx + s * 11, base, M.iron, 0.3 + (s < 0 ? 0.1 : 0));
  mt.rect(cx - 9, 34, cx + 9, 35, M.iron, 0.26);
  for (let y = 0; y < 9; y++) {
    const hw = 12 - y * 0.9;
    for (let x = Math.round(cx - hw); x < cx + hw; x++) mt.put(x, 14 + y, M.iron, 0.42 - ((x - cx + hw) / (hw * 2)) * 0.22 + (y === 0 ? 0.14 : 0));
  }
  // 숯불
  for (let x = cx - 9; x < cx + 9; x++) mt.setGlow(x, 13, hash(x, 1, 3) < 0.5 ? [255, 150, 60] : [200, 60, 30]);
  mt.lights.push({ x: cx, y: 10, r: 100, power: 1.15, always: false });
  return { mat: mt, ax: cx, ay: base, fire: [cx, 13] };
}

/* ---------- 과녁장 ---------- */

function target() {
  const mt = new Mat(84, 84);
  const base = 80, cx = 34, cy = 34;
  // 삼각 받침
  mt.line(cx - 4, cy, cx - 22, base, M.wood, 0.5);
  mt.line(cx - 3, cy, cx - 21, base, M.wood, 0.36);
  mt.line(cx + 4, cy, cx + 22, base, M.wood, 0.4);
  mt.line(cx + 5, cy, cx + 23, base, M.wood, 0.3);
  mt.rect(cx - 15, cy + 28, cx + 16, cy + 30, M.wood, 0.36);
  // 짚 과녁
  const rings = [[23, M.hay, 0.5], [20, M.clothWhite, 0.8], [15, M.clothBlack, 0.4], [10, M.clothBlue, 0.6], [5.6, M.clothRed, 0.56], [2.2, M.gold, 0.74]];
  for (const [r, m, v] of rings) mt.disc(cx, cy, r, r, m, (x, y, dx, dy) => v - dx * 0.08 - dy * 0.1 + (m === M.hay ? (hash(x, y, 3) - 0.5) * 0.2 : 0));
  // 짚단
  for (const [bx, by, bw, bh] of [[50, base - 18, 30, 18], [56, base - 34, 24, 16]]) {
    mt.rect(bx, by, bx + bw, by + bh, M.hay, (x, y) => 0.5 + (fbm(x * 0.9, y * 0.2, 2, 5) - 0.5) * 0.3 - ((x - bx) / bw) * 0.14 + (y === by ? 0.16 : 0) - (y === by + bh - 1 ? 0.14 : 0));
    for (const k of [0.3, 0.7]) mt.rect(bx + Math.round(bw * k), by, bx + Math.round(bw * k) + 1, by + bh, M.woodPale, 0.4);
  }
  return { mat: mt, ax: 40, ay: base, bull: [cx, cy] };
}

/* ---------- 수레 · 통 · 상자 · 자루 · 호박 ---------- */

function wheel(mt, cx, cy, r) {
  for (let y = Math.floor(cy - r); y <= cy + r; y++)
    for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
      if (d > r) continue;
      const a = Math.atan2(dy, dx);
      const spoke = Math.abs(Math.sin(a * 4)) < 0.2;
      if (d > r - 2.2) mt.put(x, y, M.wood, 0.4 - (dx / r) * 0.12 - (dy / r) * 0.14 + (d > r - 1 ? -0.12 : 0.06));
      else if (d < 2.6) mt.put(x, y, M.iron, 0.4);
      else if (spoke) mt.put(x, y, M.woodPale, 0.52 - (dy / r) * 0.1);
    }
}

function hayCart() {
  const mt = new Mat(112, 72);
  const base = 68;
  // 끌채
  mt.beam(84, 44, 110, 56, 3, M.wood, 0.46);
  // 건초 더미
  for (let x = 12; x < 86; x++) {
    const u = (x - 12) / 74, top = 26 - Math.sin(u * Math.PI) * 14 - fbm(x * 0.2, 1, 2, 3) * 5;
    for (let y = Math.round(top); y < 40; y++) mt.put(x, y, M.hay, 0.56 + (fbm(x * 0.5, y * 0.25, 3, 7) - 0.5) * 0.4 - u * 0.12 - ((y - top) / 24) * 0.14);
  }
  // 짐칸
  planksH(mt, 8, 36, 90, 52, M.wood, { pw: 5, seed: 9, base: 0.5 });
  mt.rect(8, 34, 90, 36, M.woodPale, 0.72);
  for (const px of [8, 34, 62, 87]) mt.rect(px, 30, px + 3, 54, M.wood, (x) => (x === px ? 0.62 : 0.36));
  mt.shade(8, 48, 90, 52, -0.1);
  wheel(mt, 28, 54, 14);
  wheel(mt, 70, 54, 14);
  return { mat: mt, ax: 50, ay: base };
}

function barrel(mt, cx, base, w = 16, h = 22) {
  for (let y = base - h; y < base; y++) {
    const t = (y - (base - h)) / h, bulge = Math.sin(t * Math.PI) * 2;
    const hw = w / 2 + bulge;
    for (let x = Math.round(cx - hw); x < cx + hw; x++) {
      const u = (x + 0.5 - cx) / hw;
      const hoop = Math.abs(t - 0.16) < 0.045 || Math.abs(t - 0.84) < 0.045;
      const stave = Math.round((u * 0.5 + 0.5) * 5.999) !== Math.round((((x + 1.5 - cx) / hw) * 0.5 + 0.5) * 5.999);
      mt.put(x, y, hoop ? M.iron : M.wood, (hoop ? 0.4 : 0.56) - u * 0.24 - (stave && !hoop ? 0.14 : 0));
    }
  }
  mt.rect(cx - w / 2 + 1, base - h - 1, cx + w / 2 - 1, base - h + 1, M.woodPale, (x, y) => (y === base - h - 1 ? 0.76 : 0.6));
}

function crate(mt, x0, base, s = 16) {
  planks(mt, x0, base - s, x0 + s, base, M.wood, { pw: 4, seed: x0, base: 0.52 });
  mt.rect(x0, base - s, x0 + s, base - s + 2, M.woodPale, 0.7);
  mt.rect(x0, base - 2, x0 + s, base, M.wood, 0.3);
  mt.rect(x0, base - s, x0 + 2, base, M.woodPale, 0.6);
  mt.rect(x0 + s - 2, base - s, x0 + s, base, M.wood, 0.3);
  mt.beam(x0 + 2, base - s + 2, x0 + s - 2, base - 2, 2, M.woodPale, 0.5);
}

function sack(mt, cx, base, w = 14, h = 16) {
  mt.disc(cx, base - h / 2, w / 2, h / 2, M.hay, (x, y, dx, dy) => 0.5 - dx * 0.2 - dy * 0.22 + (hash(x, y, 3) - 0.5) * 0.08);
  mt.rect(cx - 2, base - h - 2, cx + 2, base - h + 2, M.hay, 0.6);
  mt.rect(cx - 2, base - h + 1, cx + 2, base - h + 2, M.woodPale, 0.4);
}

function pumpkin(mt, cx, base, r = 7) {
  mt.disc(cx, base - r * 0.8, r, r * 0.8, M.pumpkin, (x, y, dx, dy) => 0.56 - dx * 0.2 - dy * 0.26 - (Math.abs(Math.sin(dx * 4.2)) > 0.92 ? 0.14 : 0));
  mt.rect(cx - 1, base - r * 1.6 - 2, cx + 1, base - r * 1.6 + 1, M.leafGreen, 0.4);
}

/** 통 · 상자 · 자루 · 호박 무더기 */
function clutter(kind = 0) {
  const mt = new Mat(90, 60);
  const base = 56;
  if (kind === 0) {
    barrel(mt, 16, base, 18, 26);
    crate(mt, 30, base, 18);
    crate(mt, 34, base - 18, 14);
    barrel(mt, 60, base, 16, 22);
    sack(mt, 76, base, 14, 15);
  } else if (kind === 1) {
    pumpkin(mt, 14, base, 9);
    pumpkin(mt, 32, base, 7);
    pumpkin(mt, 23, base - 9, 6);
    crate(mt, 44, base, 20);
    pumpkin(mt, 54, base - 20, 7);
    sack(mt, 74, base, 16, 18);
  } else {
    barrel(mt, 14, base, 16, 22);
    barrel(mt, 32, base, 16, 24);
    barrel(mt, 23, base - 22, 14, 18);
    sack(mt, 52, base, 15, 16);
    sack(mt, 66, base, 14, 14);
    sack(mt, 59, base - 12, 13, 13);
  }
  return { mat: mt, ax: 45, ay: base };
}

/* ---------- 가로등 · 이정표 ---------- */

function lampPost() {
  const mt = new Mat(34, 96);
  const cx = 17, base = 92;
  mt.rect(cx - 5, base - 5, cx + 5, base, M.iron, (x, y) => 0.36 - ((x - cx + 5) / 10) * 0.14 + (y === base - 5 ? 0.1 : 0));
  mt.rect(cx - 3, base - 9, cx + 3, base - 5, M.iron, 0.34);
  mt.rect(cx - 1, 24, cx + 1, base - 9, M.iron, (x) => (x < cx ? 0.44 : 0.26));
  mt.rect(cx - 2, 52, cx + 2, 54, M.iron, 0.4);
  // 팔과 등
  mt.rect(cx - 9, 24, cx + 9, 25, M.iron, 0.36);
  mt.line(cx - 9, 24, cx - 5, 30, M.iron, 0.3);
  mt.line(cx + 8, 24, cx + 4, 30, M.iron, 0.26);
  mt.rect(cx - 6, 8, cx + 6, 22, M.glass, 0.74);
  mt.rect(cx - 7, 22, cx + 7, 24, M.iron, 0.3);
  mt.rect(cx - 6, 8, cx - 5, 22, M.iron, 0.34);
  mt.rect(cx + 5, 8, cx + 6, 22, M.iron, 0.26);
  mt.rect(cx - 1, 8, cx, 22, M.iron, 0.3);
  for (let y = 0; y < 6; y++) {
    const hw = 2 + y * 1.1;
    for (let x = Math.round(cx - hw); x < cx + hw; x++) mt.put(x, 2 + y, M.iron, 0.4 - ((x - cx + hw) / (hw * 2)) * 0.18);
  }
  mt.put(cx - 0.5, 1, M.iron, 0.34);
  for (let y = 9; y < 22; y++) for (let x = cx - 5; x < cx + 5; x++) if (x !== cx - 1) mt.setLit(x, y, Math.abs(x - cx + 0.5) < 3 && y > 12 ? WARM.core : WARM.mid);
  mt.lights.push({ x: cx, y: 18, r: 104, power: 1.1 });
  return { mat: mt, ax: cx, ay: base };
}

function signpost() {
  const mt = new Mat(84, 120);
  const cx = 40, base = 116;
  mt.rect(cx - 3, 14, cx + 3, base, M.wood, (x, y) => 0.5 - ((x - cx + 3) / 6) * 0.26 + (fbm(x * 0.9, y * 0.1, 2, 3) - 0.5) * 0.1);
  mt.rect(cx - 5, base - 4, cx + 5, base, M.stone, 0.5);
  mt.disc(cx, 13, 4, 3, M.wood, 0.56);
  const boards = [[22, 1, M.woodPale], [42, -1, M.woodPale], [62, 1, M.woodPale]];
  boards.forEach(([y, dir, m], i) => {
    const x0 = dir > 0 ? cx - 6 : cx - 34, x1 = dir > 0 ? cx + 36 : cx + 6;
    for (let yy = y; yy < y + 13; yy++)
      for (let x = x0; x < x1; x++) {
        const tip = dir > 0 ? x - (x1 - 7) : x0 + 7 - x;
        if (tip > 0 && Math.abs(yy - y - 6) > 6 - tip) continue;
        mt.put(x, yy, m, 0.7 - (yy - y) * 0.016 + (fbm(x * 0.2, yy * 0.9, 2, i) - 0.5) * 0.14 - (yy === y + 12 ? 0.2 : 0) + (yy === y ? 0.1 : 0));
      }
    // 글씨 흉내
    for (let k = 0; k < 5; k++) {
      const lx = (dir > 0 ? cx + 2 : cx - 26) + k * 5;
      mt.rect(lx, y + 4, lx + 3, y + 5, M.timber, 0.2);
      if (hash(k, i, 5) < 0.7) mt.rect(lx, y + 7, lx + 2 + Math.round(hash(k, i, 7) * 2), y + 8, M.timber, 0.24);
    }
    mt.put(cx - 1, y + 3, M.iron, 0.3);
    mt.put(cx, y + 9, M.iron, 0.3);
  });
  return { mat: mt, ax: cx, ay: base };
}

module.exports = { fountain, tent, stall, sofa, tvSet, consoleBox, bench, brazier, target, hayCart, clutter, lampPost, signpost, barrel, crate, sack, pumpkin };
