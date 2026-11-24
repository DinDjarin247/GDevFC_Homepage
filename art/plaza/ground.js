// 바닥과 구조물 — 윗마당 바닥, 난간, 옹벽, 큰 계단, 아래 광장의 포석.
const { P, W, H, M, Mat, WARM, clamp, hash, fbm, ashlar, planks } = require('./kit');
const { ivy, wallLantern } = require('./buildings');
const L = require('./layout');

/** 윗마당 바닥 — 건물 발치에서 난간까지의 좁은 띠 (난간 뒤로 사람이 지나간다) */
function buildTerrace() {
  const mt = new Mat(W, H);
  const y0 = L.TERRACE_Y - 2, y1 = L.WALL_TOP + 2;
  mt.rect(0, y0, W, y1, M.cobble, (x, y) => {
    const row = Math.floor((y - y0) / 3), ry = (y - y0) % 3;
    const cx = Math.floor((x + (row % 2) * 3) / 7), rx = (x + (row % 2) * 3) % 7;
    let v = 0.6 + (hash(cx, row, 3) - 0.5) * 0.2 + (fbm(x * 0.04, y * 0.2, 2, 5) - 0.5) * 0.12;
    if (ry === 2 || rx === 6) v -= 0.18;
    // 건물 발치의 그늘
    v -= clamp(1 - (y - y0) / 7) * 0.2;
    return v;
  });
  return mt;
}

/** 계단의 좌우 끝 x (y 에 따라 아래로 벌어진다) */
function stairX(y) {
  const s = L.STAIR, t = clamp((y - s.topY) / (s.botY - s.topY));
  return [s.topX0 + (s.botX0 - s.topX0) * t, s.topX1 + (s.botX1 - s.topX1) * t];
}

/** 아래 광장 포석의 줄 — y 에 따라 줄 번호와 줄 안에서의 위치. 앞으로 올수록 돌이 커진다 */
const ROWS = (() => {
  const rows = [];
  let y = L.WALL_BOT;
  let i = 0;
  while (y < H) {
    const t = (y - L.WALL_BOT) / (H - L.WALL_BOT);
    const h = Math.round(3 + t * 5.4);
    rows.push({ y0: y, y1: y + h, h, i });
    y += h;
    i++;
  }
  return rows;
})();
const ROW_OF = new Int16Array(H).fill(-1);
ROWS.forEach((r, k) => {
  for (let y = r.y0; y < Math.min(H, r.y1); y++) ROW_OF[y] = k;
});

function buildFront() {
  const mt = new Mat(W, H);
  const S = L.STAIR, F = L.FOUNTAIN;

  // ---------- 아래 광장 포석 ----------
  for (let y = L.WALL_BOT; y < H; y++) {
    const r = ROWS[ROW_OF[y]];
    const sw = Math.round(r.h * 2.1 + 2);
    const off = Math.round(hash(r.i, 1, 7) * sw);
    for (let x = 0; x < W; x++) {
      let cx = Math.floor((x + off) / sw), rx = (x + off) % sw;
      let cw = sw;
      // 돌 넷 중 하나는 반으로 쪼개 크기를 섞는다
      if (hash(cx, r.i, 11) < 0.26) {
        const half = Math.floor(sw / 2);
        if (rx >= half) {
          rx -= half;
          cw = sw - half;
          cx = cx * 2 + 1;
        } else {
          cw = half;
          cx = cx * 2;
        }
      }
      const ry = y - r.y0;
      const kind = hash(cx, r.i, 13);
      let m = kind < 0.88 ? M.cobble : kind < 0.95 ? M.stone : M.stonePale;
      let v = (m === M.stonePale ? 0.42 : 0.52) + (hash(cx, r.i, 17) - 0.5) * 0.1 + (fbm(x * 0.012, y * 0.03, 3, 19) - 0.5) * 0.16;
      const gap = ry === r.h - 1 || rx === cw - 1;
      if (gap) {
        v -= 0.17;
        // 돌 틈의 이끼와 풀
        if (fbm(x * 0.04, y * 0.07, 2, 23) > 0.6 && hash(x, y, 29) < 0.6) {
          m = M.grass;
          v = 0.3 + hash(x, y, 31) * 0.2;
        }
      } else if (ry === 0 || rx === 0) v += 0.05;
      else if (r.h >= 6 && ry === r.h - 2) v -= 0.05;
      mt.put(x, y, m, v);
    }
  }
  // 광장 가운데가 밝고 가장자리가 어둡다
  mt.shade(0, L.WALL_BOT, W, H, (x, y) => {
    const dx = (x - L.CX) / 560, dy = (y - 470) / 150;
    return 0.06 - (dx * dx + dy * dy * 0.4) * 0.16;
  });
  // 옹벽 발치의 그늘
  mt.shade(0, L.WALL_BOT, W, L.WALL_BOT + 12, (x, y) => -0.24 * (1 - (y - L.WALL_BOT) / 12));
  // 계단에서 분수까지 이어지는 밝은 판석 길
  for (let y = S.botY; y < F.y - F.ry - 2; y++)
    for (let x = L.CX - 34; x < L.CX + 34; x++) {
      const bx = Math.floor((x - (L.CX - 34)) / 17), by = Math.floor((y - S.botY) / 7);
      const edge = (x - (L.CX - 34)) % 17 === 16 || (y - S.botY) % 7 === 6;
      mt.put(x, y, M.stonePale, 0.62 + (hash(bx, by, 37) - 0.5) * 0.14 - (edge ? 0.22 : 0));
    }
  // 분수 둘레를 두르는 밝은 띠 (물받이 그림자와 함께)
  for (let y = F.y - F.ry - 14; y < F.y + F.ry + 18; y++)
    for (let x = F.x - F.rx - 20; x < F.x + F.rx + 20; x++) {
      const d = Math.hypot((x + 0.5 - F.x) / (F.rx + 12), (y + 0.5 - F.y - 3) / (F.ry + 8));
      if (d > 1) continue;
      const a = Math.atan2((y - F.y - 3) / (F.ry + 8), (x - F.x) / (F.rx + 12));
      const seg = Math.floor((a / (Math.PI * 2)) * 44 + 100);
      const ring = d > 0.84;
      const joint = Math.abs(((a / (Math.PI * 2)) * 44 + 100) % 1) < 0.12;
      mt.put(x, y, M.stonePale, ring ? 0.66 + (hash(seg, 3, 41) - 0.5) * 0.12 - (joint ? 0.2 : 0) - (d > 0.97 ? 0.16 : 0) : 0.44 + (hash(seg, Math.floor(d * 6), 43) - 0.5) * 0.1);
    }
  // 낙엽 — 왼쪽 위 나뭇가지 아래와 벽 발치에 몰린다
  for (let i = 0; i < 620; i++) {
    const u = hash(i, 1, 47), v = hash(i, 2, 47);
    const x = Math.round(Math.pow(u, 1.5) * W), y = Math.round(L.WALL_BOT + 2 + Math.pow(v, 1.3) * (H - L.WALL_BOT - 3));
    if (Math.hypot((x - F.x) / (F.rx + 4), (y - F.y) / (F.ry + 4)) < 1) continue;
    const m = [M.leafOrange, M.leafRed, M.leafGold, M.leafOrange][i % 4];
    mt.put(x, y, m, 0.5 + hash(i, 3, 47) * 0.3);
    if (hash(i, 4, 47) < 0.55) mt.put(x + 1, y, m, 0.4 + hash(i, 5, 47) * 0.2);
    if (hash(i, 6, 47) < 0.2) mt.put(x, y - 1, m, 0.6);
  }

  // ---------- 옹벽 ----------
  for (let y = L.WALL_TOP; y < L.WALL_BOT; y++) {
    const [sx0, sx1] = stairX(y);
    for (let x = 0; x < W; x++) {
      if (x >= sx0 && x < sx1) continue;
      const row = Math.floor((y - L.WALL_TOP) / 8), ry = (y - L.WALL_TOP) % 8;
      const bw = 18 + Math.round((hash(row, 2, 53) - 0.5) * 4);
      const off = Math.round(hash(row, 3, 53) * bw);
      const cx = Math.floor((x + off) / bw), rx = (x + off) % bw;
      let v = 0.5 + (hash(cx, row, 59) - 0.5) * 0.22 + (fbm(x * 0.03, y * 0.05, 3, 61) - 0.5) * 0.2;
      if (ry === 7 || rx === bw - 1) v -= 0.28;
      else if (ry === 0 || rx === 0) v += 0.1;
      // 위 덮개돌 밑 그늘 · 바닥 가까이의 물때
      v -= clamp(1 - (y - L.WALL_TOP) / 5) * 0.2;
      const low = clamp((y - (L.WALL_BOT - 16)) / 16);
      let m = M.stone;
      if (low > 0 && fbm(x * 0.06, y * 0.1, 3, 67) > 0.66 - low * 0.2) {
        m = M.leafGreen;
        v = 0.26 + hash(x, y, 71) * 0.2;
      } else v -= low * 0.1;
      mt.put(x, y, m, v);
    }
  }
  // 버팀벽
  for (const bx of L.BUTTRESS) {
    for (let y = L.WALL_TOP + 2; y < L.WALL_BOT; y++) {
      const t = (y - L.WALL_TOP) / (L.WALL_BOT - L.WALL_TOP);
      const hw = 6 + Math.floor(t * 3) + (y > L.WALL_BOT - 8 ? 2 : 0);
      for (let x = bx - hw; x < bx + hw; x++) {
        const row = Math.floor(y / 7), edge = y % 7 === 6;
        mt.put(x, y, M.stonePale, 0.64 - ((x - bx) / hw) * 0.16 + (hash(row, bx, 73) - 0.5) * 0.1 - (edge ? 0.2 : 0) + (x === bx - hw ? 0.12 : 0));
      }
      // 버팀벽이 벽에 드리우는 그림자
      for (let k = 0; k < 5; k++) mt.add(bx + hw + k, y, -0.2 + k * 0.04);
    }
    mt.rect(bx - 7, L.WALL_TOP + 2, bx + 7, L.WALL_TOP + 4, M.stonePale, 0.84);
  }
  // 담쟁이 — 덮개돌에서 흘러내린다
  const VINE = [M.leafRed, M.leafOrange, M.leafGreen, M.leafGreen, M.leafGold, M.leafRed];
  for (const [x0, x1, len, seed] of [[52, 124, 40, 3], [236, 306, 34, 5], [654, 722, 38, 7], [850, 920, 44, 9], [0, 26, 30, 11], [462 - 200, 462 - 150, 0, 13]]) {
    for (let x = x0; x < x1; x++) {
      const u = (x - x0) / (x1 - x0);
      const hgt = len * Math.sqrt(Math.sin(u * Math.PI)) * (0.35 + 0.65 * fbm(x * 0.17, seed, 2, seed));
      for (let y = 0; y < hgt; y++) {
        if (hash(x, y, seed) > 0.86 - (y / Math.max(1, hgt)) * 0.42) continue;
        const cx = Math.floor(x / 2), cy = Math.floor(y / 2);
        mt.put(x, L.WALL_TOP + 1 + y, VINE[Math.floor(hash(cx, cy, seed + 1) * VINE.length)], 0.3 + hash(cx, cy, seed + 2) * 0.46 - (hash(x, y, seed + 3) < 0.2 ? 0.16 : 0));
      }
    }
  }
  void ivy;
  // 선술집 지하 창고 문
  {
    const dx = 168, dw = 22, dh = 34, yb = L.WALL_BOT;
    mt.rect(dx - 3, yb - dh - 3, dx + dw + 3, yb, M.stonePale, (x, y) => 0.74 - (x > dx + dw / 2 ? 0.14 : 0));
    planks(mt, dx, yb - dh, dx + dw, yb, M.wood, { pw: 3, seed: 7, base: 0.4 });
    const r = dw / 2, cy = yb - dh + r;
    for (let y = yb - dh - 3; y < cy; y++) for (let x = dx - 3; x < dx + dw + 3; x++) {
      const d = Math.hypot(x + 0.5 - (dx + r), y + 0.5 - cy);
      if (d > r + 3) mt.put(x, y, M.stone, 0.5 + (hash(Math.floor(x / 18), Math.floor(y / 8), 59) - 0.5) * 0.2);
      else if (d > r) mt.put(x, y, M.stonePale, 0.78 - (x > dx + r ? 0.14 : 0));
    }
    for (const yy of [yb - 24, yb - 9]) mt.rect(dx, yy, dx + dw, yy + 1, M.iron, 0.3);
    mt.put(dx + dw - 3, yb - 16, M.gold, 0.72);
    wallLantern(mt, dx + dw + 6, yb - 34, 1);
  }
  // 사자 머리 물꼭지와 돌 물통
  {
    const lx = 772, ly = L.WALL_TOP + 22;
    mt.disc(lx, ly, 7, 7, M.stonePale, (x, y, dx, dy) => 0.66 - dx * 0.2 - dy * 0.22);
    mt.put(lx - 3, ly - 2, M.stone, 0.26);
    mt.put(lx + 2, ly - 2, M.stone, 0.26);
    mt.rect(lx - 1, ly + 1, lx + 1, ly + 4, M.stone, 0.24);
    for (let y = ly + 4; y < L.WALL_BOT - 9; y++) {
      mt.put(lx - 1, y, M.water, 0.84);
      mt.put(lx, y, M.water, 0.66);
    }
    ashlar(mt, lx - 15, L.WALL_BOT - 11, lx + 15, L.WALL_BOT + 4, M.stonePale, { seed: 5, bh: 5, bw: 10, base: 0.6 });
    mt.rect(lx - 16, L.WALL_BOT - 13, lx + 16, L.WALL_BOT - 11, M.stonePale, (x, y) => (y === L.WALL_BOT - 13 ? 0.86 : 0.6));
    mt.rect(lx - 13, L.WALL_BOT - 12, lx + 13, L.WALL_BOT - 11, M.water, (x) => 0.6 + (hash(x, 1, 5) - 0.5) * 0.3);
  }

  // ---------- 덮개돌 + 난간 ----------
  const railGap = (x) => x >= S.topX0 && x < S.topX1;
  for (let x = 0; x < W; x++) {
    if (railGap(x)) continue;
    // 덮개돌 (옹벽 위로 살짝 내민다)
    for (let y = L.WALL_TOP - 2; y < L.WALL_TOP + 2; y++) mt.put(x, y, M.stonePale, (y === L.WALL_TOP - 2 ? 0.88 : y === L.WALL_TOP + 1 ? 0.46 : 0.7) + (hash(Math.floor(x / 22), 1, 79) - 0.5) * 0.08 - (x % 22 === 21 ? 0.16 : 0));
    // 손잡이 돌
    for (let y = L.BAL_TOP; y < L.BAL_TOP + 3; y++) mt.put(x, y, M.stonePale, (y === L.BAL_TOP ? 0.9 : y === L.BAL_TOP + 2 ? 0.5 : 0.72) - (x % 26 === 25 ? 0.14 : 0));
    // 난간 기둥 — 호리병 모양으로 가운데가 불룩하다
    const k = x % 7;
    for (let y = L.BAL_TOP + 3; y < L.WALL_TOP - 2; y++) {
      const t = (y - L.BAL_TOP - 3) / (L.WALL_TOP - L.BAL_TOP - 5);
      const wide = t > 0.3 && t < 0.8;
      if (k === 2 || k === 3 || (wide && (k === 1 || k === 4))) mt.put(x, y, M.stonePale, 0.76 - (k >= 3 ? 0.2 : 0) - (k === 4 ? 0.1 : 0));
    }
  }
  // 난간 받침 기둥 (버팀벽 위) — 위에 돌 공이나 등을 얹는다
  const posts = [...L.BUTTRESS, S.topX0 - 8, S.topX1 + 8];
  const lampPosts = [];
  posts.forEach((px, i) => {
    const stair = i >= L.BUTTRESS.length;
    const hw = stair ? 8 : 6, top = L.BAL_TOP - (stair ? 10 : 5);
    mt.rect(px - hw, top, px + hw, L.WALL_TOP + 2, M.stonePale, (x, y) => 0.76 - ((x - px + hw) / (hw * 2)) * 0.26 - ((y - top) % 6 === 5 ? 0.14 : 0));
    mt.rect(px - hw - 1, top - 2, px + hw + 1, top, M.stonePale, (x, y) => (y === top - 2 ? 0.9 : 0.6) - ((x - px + hw) / (hw * 2)) * 0.16);
    if (stair || i % 2 === 0) {
      // 쇠 등
      mt.rect(px - 1, top - 6, px + 1, top - 2, M.iron, 0.3);
      mt.rect(px - 4, top - 16, px + 4, top - 6, M.glass, 0.74);
      mt.rect(px - 5, top - 17, px + 5, top - 16, M.iron, 0.3);
      mt.rect(px - 4, top - 7, px + 4, top - 6, M.iron, 0.24);
      mt.rect(px - 4, top - 16, px - 3, top - 6, M.iron, 0.3);
      mt.rect(px + 3, top - 16, px + 4, top - 6, M.iron, 0.24);
      mt.rect(px - 3, top - 20, px + 3, top - 17, M.iron, (x, y) => 0.34 - (y - top + 20) * 0.02);
      mt.put(px - 0.5, top - 21, M.iron, 0.3);
      for (let y = top - 15; y < top - 7; y++) for (let x = px - 3; x < px + 3; x++) mt.setLit(x, y, Math.abs(x - px + 0.5) < 2 && y > top - 14 ? WARM.core : WARM.mid);
      mt.lights.push({ x: px, y: top - 10, r: stair ? 78 : 60, power: stair ? 1 : 0.85 });
      lampPosts.push([px, top - 11]);
    } else {
      mt.disc(px, top - 6, 4.4, 4.4, M.stonePale, (x, y, dx, dy) => 0.7 - dx * 0.22 - dy * 0.24);
    }
  });

  // ---------- 큰 계단 ----------
  const steps = Math.round((S.botY - S.topY) / S.step);
  for (let y = S.topY - 2; y < S.botY; y++) {
    const [x0, x1] = stairX(Math.max(S.topY, y));
    const k = Math.floor((y - (S.topY - 2)) / S.step), ry = (y - (S.topY - 2)) % S.step;
    for (let x = Math.round(x0); x < Math.round(x1); x++) {
      const u = (x - x0) / (x1 - x0);
      // 디딤판(밝다) 4줄 + 챌판(어둡다) 2줄. 가운데는 발길에 닳아 밝다
      const tread = ry < S.step - 2;
      const bw = 22, bxk = Math.floor((x + (k % 2) * 11) / bw), bedge = (x + (k % 2) * 11) % bw === bw - 1;
      let v = tread ? 0.74 - ry * 0.03 : 0.4 - (ry - (S.step - 2)) * 0.06;
      v += (hash(bxk, k, 83) - 0.5) * 0.1 - (bedge ? 0.14 : 0) + (1 - Math.abs(u - 0.5) * 2) * 0.05;
      mt.put(x, y, M.stonePale, v);
      // 붉은 융단
      const cw = 0.17;
      if (Math.abs(u - 0.5) < cw) {
        const edgeC = Math.abs(u - 0.5) > cw - 0.022;
        mt.put(x, y, edgeC ? M.gold : M.clothRed, (edgeC ? 0.6 : 0.52) + (tread ? 0.06 - ry * 0.02 : -0.16));
      }
    }
    void steps;
  }
  // 계단 옆 난간벽 — 계단 끝선을 따라 내려가는 낮은 돌벽
  for (let y = S.topY; y <= S.botY; y++) {
    const [x0, x1] = stairX(y);
    for (const side of [-1, 1]) {
      const edge = Math.round(side < 0 ? x0 : x1);
      for (let k = 0; k < 8; k++) {
        const x = side < 0 ? edge - 8 + k : edge + k;
        for (let hgt = 0; hgt <= 13; hgt++) {
          const cap = hgt >= 12;
          mt.put(x, y - hgt, M.stonePale, (cap ? 0.9 : 0.66 - hgt * 0.006) - (k / 8) * 0.2 - (!cap && (y - hgt) % 6 === 5 ? 0.1 : 0) + (k === 0 ? 0.08 : 0));
        }
      }
    }
  }
  // 계단 아래 끝의 받침대 — 위에 불 밝힌 화로를 얹는다
  const braziers = [];
  for (const px of [S.botX0 - 6, S.botX1 + 6]) {
    const top = S.botY - 22, bot = S.botY + 8;
    mt.rect(px - 9, top, px + 9, bot, M.stonePale, (x, y) => 0.76 - ((x - px + 9) / 18) * 0.28 - ((y - top) % 7 === 6 ? 0.14 : 0));
    mt.rect(px - 11, top - 3, px + 11, top, M.stonePale, (x, y) => (y === top - 3 ? 0.92 : 0.62) - ((x - px + 11) / 22) * 0.16);
    mt.rect(px - 11, bot - 3, px + 11, bot, M.stonePale, (x, y) => (y === bot - 3 ? 0.78 : 0.5) - ((x - px + 11) / 22) * 0.16);
    // 쇠 화로 그릇
    for (let y = 0; y < 6; y++) {
      const hw = 8 - y;
      for (let x = px - hw; x < px + hw; x++) mt.put(x, top - 9 + y, M.iron, 0.4 - ((x - px + hw) / (hw * 2)) * 0.2 + (y === 0 ? 0.1 : 0));
    }
    braziers.push([px, top - 9]);
    mt.lights.push({ x: px, y: top - 12, r: 96, power: 1.1 });
  }
  return { mt, lampPosts, braziers };
}

module.exports = { buildTerrace, buildFront, stairX, ROWS, ROW_OF };
