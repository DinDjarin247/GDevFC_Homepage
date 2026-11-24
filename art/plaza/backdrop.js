// 먼 배경 — 산, 절벽 위의 성, 하늘을 가로지르는 돌다리, 언덕을 타고 오르는 윗마을.
// 여기서 그린 층은 나중에 거리만큼 하늘빛으로 흐려진다(공기 원근).
const { P, W, H, M, Mat, WARM, clamp, hash, fbm, ashlar, tiles } = require('./kit');
const { backHouse } = require('./landmarks');
const L = require('./layout');

const sstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** 둥근 탑 한 채 — 왼쪽이 밝고 오른쪽이 어두운 원통 + 고깔 지붕 */
function roundTower(mt, x0, x1, yTop, yBot, o = {}) {
  const w = x1 - x0;
  mt.rect(x0, yTop, x1, yBot, o.m ?? M.stonePale, (x, y) => {
    const u = (x - x0 + 0.5) / w;
    const row = Math.floor(y / 4), bx = Math.floor((x + (row % 2) * 3) / 6);
    return 0.74 - u * 0.36 + (u > 0.12 && u < 0.3 ? 0.06 : 0) + (hash(bx, row, 3) - 0.5) * 0.1 - (y % 4 === 3 ? 0.1 : 0);
  });
  if (o.merlons !== false) {
    for (let x = x0 - 1; x < x1 + 1; x += 4) if (Math.floor((x - x0 + 1) / 4) % 2 === 0) mt.rect(x, yTop - 3, x + 3, yTop, o.m ?? M.stonePale, 0.7 - ((x - x0) / w) * 0.3);
    mt.rect(x0 - 1, yTop, x1 + 1, yTop + 2, o.m ?? M.stonePale, (x, y) => (y === yTop ? 0.8 : 0.46) - ((x - x0) / w) * 0.2);
  }
  if (o.cone) {
    const ch = o.cone, apex = yTop - (o.merlons === false ? 0 : 2) - ch;
    for (let y = 0; y < ch; y++) {
      const hw = ((y + 1) / ch) * (w / 2 + 2);
      for (let x = Math.ceil((x0 + x1) / 2 - hw); x < (x0 + x1) / 2 + hw; x++)
        mt.put(x, apex + y, o.roof ?? M.roofSlate, (x < (x0 + x1) / 2 - hw * 0.15 ? 0.66 : 0.36) - (y % 3 === 2 ? 0.1 : 0));
    }
    const cx = Math.round((x0 + x1) / 2);
    mt.rect(cx, apex - 7, cx + 1, apex + 1, M.iron, 0.3);
    if (o.flag) {
      for (let i = 0; i < 6; i++) for (let j = 0; j < 3 - Math.floor(i / 2); j++) mt.put(cx + 1 + i, apex - 7 + j + Math.floor(i / 3), o.flag, 0.6 - i * 0.03);
    } else mt.put(cx, apex - 8, M.gold, 0.74);
  }
  // 창 — 낮엔 검은 틈, 밤엔 불빛
  for (const [fx, fy] of o.wins ?? []) {
    const wx = Math.round(x0 + fx * w), wy = Math.round(yTop + fy * (yBot - yTop));
    for (let k = 0; k < 3; k++) {
      mt.put(wx, wy + k, M.iron, 0.16);
      mt.setLit(wx, wy + k, WARM.mid);
    }
  }
}

/** 바위 절벽 — 세로 결과 금, 왼쪽이 밝다 */
function crag(mt, top, x0, x1, yBot, seed, o = {}) {
  for (let x = x0; x < x1; x++) {
    const ty = Math.round(top(x));
    for (let y = ty; y < yBot; y++) {
      const u = (x - x0) / (x1 - x0);
      const strata = fbm(x * 0.11 + seed, y * 0.025, 3, seed);
      const crack = fbm(x * 0.3 + seed, y * 0.05, 2, seed + 5);
      let v = 0.64 - u * 0.26 + (strata - 0.5) * 0.5 - (crack > 0.66 ? 0.22 : 0) - ((y - ty) / (yBot - ty)) * 0.08;
      if (y - ty < 2) v += 0.14;
      // 꼭대기에는 풀, 턱에는 덤불
      const grassy = y - ty < 3 + fbm(x * 0.2, 1, 2, seed + 9) * 4 && o.grass !== false;
      mt.put(x, y, grassy ? M.grass : M.rock, grassy ? 0.5 + (hash(x, y, seed) - 0.5) * 0.3 : v);
    }
  }
}

/** 먼 층: 산줄기 두 겹 + 절벽과 성 + 돌다리 + 폭포 */
function buildFar() {
  const far2 = new Mat(W, H);
  // 뒤 산줄기 (눈 덮인 봉우리)
  const ridgeA = (x) => 150 - 78 * Math.pow(fbm(x * 0.0042 + 3, 2, 3, 11), 1.3) - 16 * fbm(x * 0.022, 5, 3, 13) + 20;
  for (let x = 0; x < W; x++) {
    const ty = Math.round(ridgeA(x));
    const slope = ridgeA(x + 3) - ridgeA(x - 3);
    for (let y = ty; y < 300; y++) {
      const d = y - ty;
      const snow = y < 112 + fbm(x * 0.05, 2, 2, 5) * 16 && d < 20 + fbm(x * 0.09, y * 0.09, 2, 7) * 14;
      far2.put(x, y, snow ? M.mist : M.rock, (snow ? 0.86 : 0.56) + clamp(slope * 0.05, -0.16, 0.16) + (fbm(x * 0.05, y * 0.08, 3, 21) - 0.5) * 0.24 - d * 0.0012);
    }
  }
  const far1b = new Mat(W, H);
  // 앞 산줄기 (가을 숲)
  const ridgeB = (x) => 214 - 46 * fbm(x * 0.007 + 9, 4, 3, 31) - 10 * fbm(x * 0.05, 8, 2, 33);
  for (let x = 0; x < W; x++) {
    const ty = Math.round(ridgeB(x));
    for (let y = ty; y < 300; y++) {
      const n = fbm(x * 0.07, y * 0.1, 3, 41), k = fbm(x * 0.02, y * 0.03, 2, 43);
      const m = k > 0.56 ? M.leafOrange : k > 0.46 ? M.leafGold : M.grass;
      far1b.put(x, y, m, 0.3 + n * 0.4 - (y - ty < 2 ? -0.12 : 0));
    }
  }

  const far1 = new Mat(W, H);
  // 왼쪽 외딴 바위와 망루
  const spireTop = (x) => 152 + Math.pow(Math.abs(x - 211) / 50, 1.6) * 100 + (fbm(x * 0.2, 2, 2, 3) - 0.5) * 8 - (Math.abs(x - 211) < 16 ? 2 : 0);
  crag(far1, spireTop, 150, 272, 300, 3);
  roundTower(far1, 202, 220, 92, 152, { cone: 26, flag: M.clothRed, wins: [[0.5, 0.2], [0.4, 0.5], [0.6, 0.75]] });
  roundTower(far1, 222, 232, 124, 153, { cone: 14, wins: [[0.5, 0.3]] });

  // 큰 절벽 — 성이 올라앉는다
  const plateau = 122;
  const cragTop = (x) => {
    const left = x < 624 ? Math.pow((624 - x) / 74, 0.62) * 138 : 0;
    const right = x > 806 ? Math.pow((x - 806) / 110, 0.7) * 120 : 0;
    return plateau + left + right + (fbm(x * 0.12, 4, 2, 17) - 0.5) * (x < 624 || x > 806 ? 12 : 3);
  };
  crag(far1, cragTop, 548, 920, 300, 17);
  // 폭포가 나오는 굴
  const fall = { x: 588, y0: 176, y1: 300, w: 5 };
  far1.disc(fall.x + 2, fall.y0 - 1, 6, 4.5, M.rock, 0.16);

  // 돌다리 — 외딴 바위에서 큰 절벽까지 하늘을 가로지른다
  const deck = 128, span = 44, bx0 = 226, bx1 = 630;
  for (let x = bx0; x < bx1; x++) {
    const k = Math.floor((x - bx0) / span), dx = (x - bx0) % span - span / 2;
    const pier = Math.abs(dx) > span / 2 - 4;
    const r = span / 2 - 4;
    const arcY = deck + 8 + r - Math.sqrt(Math.max(0, r * r - dx * dx));
    for (let y = deck; y < 300; y++) {
      if (!pier && y >= arcY) continue;
      const light = pier ? (dx < 0 ? -0.1 : 0.12) : 0;
      let v = 0.66 + light + (hash(Math.floor(x / 5), Math.floor(y / 4), 5) - 0.5) * 0.12 - (y % 4 === 3 ? 0.08 : 0);
      if (!pier && y > arcY - 2.5) v -= 0.22; // 아치 밑 그늘
      if (y < deck + 2) v = y === deck ? 0.9 : 0.5;
      far1.put(x, y, M.stonePale, v);
    }
    void k;
  }
  for (let x = bx0; x < bx1; x += 4) if (Math.floor(x / 4) % 2) far1.rect(x, deck - 2, x + 3, deck, M.stonePale, 0.76);

  // 성
  const base = plateau + 1;
  // 본채
  far1.rect(662, 66, 704, base, M.stonePale, (x, y) => 0.74 - ((x - 662) / 42) * 0.3 + (hash(Math.floor(x / 6), Math.floor(y / 4), 9) - 0.5) * 0.1 - (y % 4 === 3 ? 0.08 : 0));
  for (let y = 0; y < 30; y++) {
    const hw = ((y + 1) / 30) * 24;
    for (let x = Math.ceil(683 - hw); x < 683 + hw; x++) far1.put(x, 36 + y, M.roofSlate, (x < 679 ? 0.66 : 0.34) - (y % 3 === 2 ? 0.1 : 0));
  }
  far1.rect(683, 28, 684, 38, M.iron, 0.3);
  for (let i = 0; i < 7; i++) for (let j = 0; j < 3 - Math.floor(i / 3); j++) far1.put(684 + i, 28 + j + Math.floor(i / 3), M.clothRed, 0.62 - i * 0.03);
  for (const [wx, wy] of [[670, 78], [680, 78], [692, 78], [674, 94], [688, 94]]) for (let k = 0; k < 4; k++) {
    far1.put(wx, wy + k, M.iron, 0.16);
    far1.setLit(wx, wy + k, WARM.mid);
  }
  roundTower(far1, 656, 666, 58, 82, { cone: 14, merlons: false });
  roundTower(far1, 700, 710, 60, 84, { cone: 13, merlons: false });
  // 높은 첨탑과 탑들
  roundTower(far1, 736, 750, 50, base, { cone: 30, flag: M.clothGold, wins: [[0.5, 0.12], [0.4, 0.4], [0.6, 0.62]] });
  far1.rect(734, 64, 752, 67, M.stonePale, (x, y) => (y === 64 ? 0.84 : 0.5) - ((x - 734) / 18) * 0.2);
  roundTower(far1, 760, 776, 76, base, { cone: 18, wins: [[0.5, 0.3]] });
  roundTower(far1, 626, 644, 86, base, { cone: 20, wins: [[0.5, 0.3], [0.45, 0.62]] });
  roundTower(far1, 786, 804, 90, base, { cone: 18, flag: M.clothRed, wins: [[0.5, 0.3]] });
  // 성벽과 문
  far1.rect(640, 104, 790, base, M.stonePale, (x, y) => 0.68 - ((x - 640) / 150) * 0.14 + (hash(Math.floor((x + (Math.floor(y / 4) % 2) * 3) / 7), Math.floor(y / 4), 13) - 0.5) * 0.12 - (y % 4 === 3 ? 0.1 : 0));
  for (let x = 640; x < 790; x += 4) if (Math.floor(x / 4) % 2) far1.rect(x, 100, x + 4, 104, M.stonePale, 0.72 - ((x - 640) / 150) * 0.14);
  far1.rect(640, 104, 790, 106, M.stonePale, (x, y) => (y === 104 ? 0.82 : 0.44));
  roundTower(far1, 706, 728, 94, base, { wins: [] });
  for (let y = 108; y < base; y++) for (let x = 712; x < 722; x++) {
    if (y < 113 && Math.hypot(x + 0.5 - 717, y + 0.5 - 113) > 5) continue;
    far1.put(x, y, M.iron, 0.14);
    far1.setLit(x, y, WARM.edge);
  }
  // 절벽 가장자리의 나무
  for (const [tx, ty, r, m] of [[612, 126, 7, M.leafOrange], [822, 124, 8, M.leafRed], [838, 136, 6, M.leafGold], [600, 140, 5, M.leafGold], [252, 158, 5, M.leafOrange], [182, 170, 6, M.leafRed]])
    far1.disc(tx, ty, r, r * 0.8, m, (x, y, dx, dy) => 0.5 - dx * 0.2 - dy * 0.24 + (hash(x, y, 3) - 0.5) * 0.2);

  // 폭포 줄기 (움직임은 따로 프레임으로 굽는다 — 여기서는 바탕만)
  for (let y = fall.y0; y < fall.y1; y++) for (let x = fall.x; x < fall.x + fall.w; x++) far1.put(x, y, M.water, 0.82 + (hash(x, Math.floor(y / 3), 7) - 0.5) * 0.2);
  return { far2, far1b, far1, fall };
}

/** 가을 나무 한 그루 (멀리 보이는 덩어리) */
function clumpTree(mt, x, y, r, m, seed = 1) {
  mt.rect(x - 1, y - 2, x + 1, y + r * 0.9, M.bark, 0.3);
  for (let i = 0; i < 5; i++) {
    const a = hash(i, seed, 1) * 6.28, d = hash(i, seed, 2) * r * 0.5;
    const cx = x + Math.cos(a) * d, cy = y - r * 0.5 + Math.sin(a) * d * 0.7, rr = r * (0.5 + hash(i, seed, 3) * 0.3);
    mt.disc(cx, cy, rr, rr * 0.86, m, (px, py, dx, dy) => 0.5 - dx * 0.22 - dy * 0.28 + (hash(Math.floor(px / 2), Math.floor(py / 2), seed) - 0.5) * 0.26);
  }
}

/** 윗마을이 올라앉은 언덕의 능선 */
const hillY = (x) => 252 - 88 * sstep(280, 700, x) + 34 * sstep(790, 960, x) + (fbm(x * 0.03, 2, 2, 51) - 0.5) * 10;

/** 가운데 층: 언덕과 그 위에 층층이 올라가는 집들 */
function buildHill() {
  const mt = new Mat(W, H);
  for (let x = 0; x < W; x++) {
    const ty = Math.round(hillY(x));
    for (let y = ty; y < L.TERRACE_Y + 4; y++) {
      const k = fbm(x * 0.03, y * 0.05, 2, 61), n = fbm(x * 0.12, y * 0.16, 2, 63);
      const m = k > 0.6 ? M.leafGold : k > 0.52 ? M.leafOrange : M.grass;
      mt.put(x, y, m, 0.34 + n * 0.34 + (y - ty < 2 ? 0.12 : 0));
    }
  }
  const PL = ['plaster', 'plasterOchre', 'plasterRose', 'plasterBlue', 'plasterSage'];
  const RF = ['roofTerra', 'roofSlate', 'roofBrown', 'roofPlum', 'roofTeal'];
  const list = [];
  // 능선 위 줄 (가장 멀다)
  for (let x = 318, i = 0; x < 930; x += 46 + Math.round(hash(i, 1, 71) * 22), i++) {
    const w = 30 + Math.round(hash(i, 2, 71) * 12);
    list.push({ x, base: hillY(x + w / 2) + 8, spec: { w, h: 30 + Math.round(hash(i, 3, 71) * 14), rh: 16 + Math.round(hash(i, 4, 71) * 6), plaster: PL[i % 5], roof: RF[(i * 2 + 1) % 5], seed: 100 + i, gable: hash(i, 5, 71) < 0.5, chimney: hash(i, 6, 71) < 0.5 ? 0.6 : 0 } });
  }
  // 중턱 줄
  for (let x = -6, i = 0; x < 950; x += 50 + Math.round(hash(i, 1, 81) * 20), i++) {
    const w = 40 + Math.round(hash(i, 2, 81) * 14);
    const base = Math.min(L.TERRACE_Y - 8, hillY(x + w / 2) + 44 + hash(i, 7, 81) * 10);
    list.push({ x, base, spec: { w, h: 44 + Math.round(hash(i, 3, 81) * 18), rh: 20 + Math.round(hash(i, 4, 81) * 8), plaster: PL[(i + 2) % 5], roof: RF[(i * 3) % 5], seed: 200 + i, gable: hash(i, 5, 81) < 0.5, chimney: hash(i, 6, 81) < 0.5 ? 0.3 : 0 } });
  }
  list.sort((a, b) => a.base - b.base);
  let t = 0;
  for (const it of list) {
    // 집 사이사이에 나무
    if (hash(t, 3, 91) < 0.55) clumpTree(mt, it.x - 8, it.base - 4, 8 + hash(t, 4, 91) * 5, [M.leafOrange, M.leafRed, M.leafGold, M.leafGreen][t % 4], t + 5);
    const b = backHouse(it.spec);
    mt.blit(b.mat, Math.round(it.x) - b.ox, Math.round(it.base) - b.oy);
    t++;
  }
  // 지그재그로 오르는 돌계단 길
  const path = [[388, 300], [352, 276], [420, 256], [392, 238], [470, 222], [560, 206], [530, 190], [610, 176]];
  for (let i = 0; i + 1 < path.length; i++) {
    const [x0, y0] = path[i], [x1, y1] = path[i + 1];
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let k = 0; k <= n; k++) {
      const x = x0 + ((x1 - x0) * k) / n, y = y0 + ((y1 - y0) * k) / n;
      mt.put(x, y, M.stonePale, 0.8);
      mt.put(x, y + 1, M.stonePale, 0.62);
      mt.put(x, y + 2, M.stone, 0.4);
    }
  }
  return mt;
}

module.exports = { buildFar, buildHill, hillY, clumpTree, roundTower };
