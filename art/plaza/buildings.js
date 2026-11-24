// 광장 건물 — 하프팀버 집 생성기와 세부(창 · 문 · 차양 · 간판 · 담쟁이).
//
// 집은 정면(평평하게 그린 면)과, 광장 중심에서 먼 쪽으로 물러나는 옆면 · 지붕면으로 이뤄진다.
// 정면만 그리면 바닥에 세운 판때기처럼 보이므로, 바닥과 같은 각도(뒤로 갈수록 위로 0.42)로
// 옆면을 기울여 붙여 상자로 읽히게 한다.
const { P, M, Mat, WARM, clamp, hash, fbm, plaster, ashlar, bricks, planks, planksH, tiles, stripes } = require('./kit');

const RECEDE = 0.42;

/* ---------- 부재 ---------- */

/** 가로 들보 (위는 밝고 아래는 어둡다) */
function hbeam(F, x0, x1, y, w, m, base = 0.5) {
  F.rect(x0, y, x1, y + w, m, (x, yy) => {
    const r = yy - Math.round(y);
    const g = (fbm(x * 0.5, yy * 2, 2, 3) - 0.5) * 0.12;
    return base + (r === 0 ? 0.16 : r === w - 1 && w > 1 ? -0.14 : 0) + g;
  });
}

/** 세로 기둥 (왼쪽은 밝고 오른쪽은 어둡다) */
function vbeam(F, x, y0, y1, w, m, base = 0.5) {
  F.rect(x, y0, x + w, y1, m, (xx, y) => {
    const r = xx - Math.round(x);
    const g = (fbm(xx * 2, y * 0.5, 2, 3) - 0.5) * 0.12;
    return base + (r === 0 ? 0.13 : r === w - 1 && w > 1 ? -0.12 : 0) + g;
  });
}

function litColor(dx, dy) {
  const d = Math.hypot(dx, dy);
  return d < 0.5 ? WARM.core : d < 0.95 ? WARM.mid : WARM.edge;
}

/**
 * 창 — (x, y) 는 창틀 왼쪽 위. 틀 · 유리 · 살 · 창턱, 그리고 원하면 덧문과 화분.
 * lit 이면 저녁에 불이 켜지고 앞에 빛 웅덩이를 만든다.
 */
function windowAt(F, x, y, w, h, o = {}) {
  const fm = o.frame ?? M.timber;
  if (o.shutters) {
    const sw = o.shutterW ?? 3;
    planks(F, x - sw, y, x, y + h, o.shutters, { pw: 2, seed: x, base: 0.56 });
    planks(F, x + w, y, x + w + sw, y + h, o.shutters, { pw: 2, seed: x + 9, base: 0.5 });
    F.rect(x - sw, y + 1, x, y + 2, M.iron, 0.4);
    F.rect(x + w, y + 1, x + w + sw, y + 2, M.iron, 0.4);
    F.rect(x - sw, y + h - 2, x, y + h - 1, M.iron, 0.4);
    F.rect(x + w, y + h - 2, x + w + sw, y + h - 1, M.iron, 0.4);
  }
  F.rect(x, y, x + w, y + h, fm, o.frameV ?? 0.4);
  const gx0 = x + 1, gy0 = y + 1, gx1 = x + w - 1, gy1 = y + h - 1;
  // 창살은 틀이 돌이어도 짙은 나무로
  if (fm !== M.timber && fm !== M.timberRed) F.rect(gx0, gy0, gx1, gy1, M.timber, 0.3);
  const mx = w >= 7 ? Math.round(x + w / 2 - 0.5) : -1;
  const my = h >= 9 ? gy0 + Math.round((h - 2) * 0.36) : -1;
  for (let yy = gy0; yy < gy1; yy++)
    for (let xx = gx0; xx < gx1; xx++) {
      if (o.arch) {
        // 윗모서리를 둥글린다
        const r = (w - 2) / 2, cx = x + w / 2, cy = gy0 + r;
        if (yy < cy && Math.hypot(xx + 0.5 - cx, yy + 0.5 - cy) > r) continue;
      }
      if (xx === mx || yy === my) continue;
      const u = (xx - gx0) / Math.max(1, gx1 - gx0 - 1), v = (yy - gy0) / Math.max(1, gy1 - gy0 - 1);
      // 유리: 왼쪽 위가 하늘을 비춰 밝다. 비스듬한 반사 한 줄
      let val = 0.62 - u * 0.2 - v * 0.26;
      if (Math.abs(xx - gx0 + (yy - gy0) - Math.round((w + h) * 0.32)) < 1) val += 0.22;
      if (yy === gy0) val -= 0.2;
      if (o.lattice && (xx + yy) % 3 === 0) val -= 0.1;
      F.put(xx, yy, M.glass, val);
      if (o.lit) F.setLit(xx, yy, litColor((u - 0.5) * 2, (v - 0.55) * 2));
    }
  // 창턱
  const sm = o.sill ?? M.woodPale;
  F.rect(x - 1, y + h, x + w + 1, y + h + 1, sm, 0.72);
  F.shade(x - 1, y + h + 1, x + w + 1, y + h + 2, -0.1);
  if (o.box) {
    // 화분: 나무 상자 위로 꽃이 넘친다
    planksH(F, x - 1, y + h + 1, x + w + 1, y + h + 4, M.wood, { pw: 3, seed: x, base: 0.46 });
    const flowers = o.flowers ?? [M.clothRed, M.clothGold, M.clothWhite, M.clothPurple];
    for (let xx = x - 2; xx < x + w + 2; xx++) {
      const hgt = 1 + Math.floor(hash(xx, y, 5) * 2.4);
      for (let k = 0; k < hgt; k++) {
        const top = k === hgt - 1;
        const fl = top && hash(xx, y, 9) < 0.6;
        F.put(xx, y + h - k, fl ? flowers[Math.floor(hash(xx, y, 13) * flowers.length)] : M.leafGreen, fl ? 0.72 : 0.3 + hash(xx, k, 3) * 0.35);
      }
      if (hash(xx, y, 21) < 0.3) F.put(xx, y + h + 2 + Math.floor(hash(xx, y, 23) * 3), M.leafGreen, 0.4);
    }
  }
  if (o.lit) F.lights.push({ x: x + w / 2, y: y + h / 2 + 3, r: 16 + w * 1.2, power: 0.5 });
}

/** 문 — (x, yBot) 은 문 왼쪽 아래. 판자문 + 쇠 경첩 + 손잡이 + 디딤돌 */
function doorAt(F, x, yBot, w, h, o = {}) {
  const fm = o.frame ?? M.timber;
  const y = yBot - h;
  F.rect(x - 2, y - 2, x + w + 2, yBot, fm, (xx, yy) => 0.42 + (xx < x ? 0.1 : xx >= x + w ? -0.1 : yy < y ? 0.08 : 0));
  planks(F, x, y, x + w, yBot, o.wood ?? M.wood, { pw: 3, seed: x, base: o.base ?? 0.44 });
  if (o.arched) {
    const r = w / 2, cx = x + w / 2, cy = y + r;
    for (let yy = y; yy < cy; yy++)
      for (let xx = x; xx < x + w; xx++)
        if (Math.hypot(xx + 0.5 - cx, yy + 0.5 - cy) > r) F.put(xx, yy, fm, 0.36);
  }
  for (const fy of [0.24, 0.72]) {
    const yy = Math.round(y + h * fy);
    F.rect(x, yy, x + Math.round(w * 0.6), yy + 1, M.iron, 0.34);
  }
  F.put(x + w - 2, y + Math.round(h * 0.52), M.gold, 0.7);
  F.shade(x, y, x + w, y + 2, -0.16);
  // 디딤돌
  F.rect(x - 3, yBot - 2, x + w + 3, yBot, M.stonePale, (xx, yy) => (yy === yBot - 2 ? 0.74 : 0.5));
  if (o.lit) {
    // 문틈 · 문 위 채광창으로 새는 불빛
    for (let xx = x + 1; xx < x + w - 1; xx++) F.setLit(xx, yBot - 3, WARM.edge);
    F.lights.push({ x: x + w / 2, y: yBot - 2, r: 30, power: 0.5 });
  }
}

/** 담쟁이 — 모서리에서 타고 올라간다. 가을이라 붉은 잎이 섞인다 */
function ivy(mt, x0, y0, x1, y1, seed = 1, o = {}) {
  const from = o.from ?? 'bl';
  const mats = o.mats ?? [M.leafRed, M.leafOrange, M.leafGreen, M.leafGreen, M.leafGold];
  for (let y = Math.round(y0); y < Math.round(y1); y++)
    for (let x = Math.round(x0); x < Math.round(x1); x++) {
      if (!mt.at(x, y)) continue;
      const u = (x - x0) / (x1 - x0), v = (y - y0) / (y1 - y0);
      const du = from.includes('l') ? u : 1 - u, dv = from.includes('b') ? 1 - v : v;
      // 모서리에서 멀수록 성기게
      const reach = 1 - Math.hypot(du * 1.15, dv * 0.95);
      const n = fbm(x * 0.16 + seed * 3, y * 0.16, 3, seed);
      if (n < 0.8 - reach * 0.52) continue;
      const cx = Math.floor(x / 2), cy = Math.floor(y / 2);
      const k = Math.floor(hash(cx, cy, seed) * mats.length);
      mt.put(x, y, mats[k], 0.28 + hash(cx, cy, seed + 4) * 0.5 - (hash(x, y, seed + 8) < 0.25 ? 0.18 : 0));
    }
}

/** 간판에 그릴 그림 (9x8 안쪽). '#' 은 짙은 색, 'o' 는 밝은 색 */
const ICONS = {
  mug: ['.........', '..####...', '.#oooo##.', '.#oooo#.#', '.#oooo#.#', '.#oooo##.', '..####...', '.........'],
  loaf: ['.........', '..#####..', '.#ooooo#.', '#o#o#o#o#', '#ooooooo#', '.#######.', '.........', '.........'],
  boot: ['.###.....', '.#o#.....', '.#o#.....', '.#o##....', '.#ooo###.', '.#oooooo#', '.########', '.........'],
  potion: ['...##....', '...##....', '..#oo#...', '.#oooo#..', '#oooooo#.', '#oooooo#.', '.######..', '.........'],
  sword: ['.......#.', '......#o#', '.....#o#.', '.#..#o#..', '..##o#...', '..###....', '.#..#....', '#........'],
  book: ['.........', '#########', '#ooo#ooo#', '#o#o#o#o#', '#ooo#ooo#', '#########', '.........', '.........'],
  star: ['....#....', '....#....', '.#######.', '..#####..', '..##.##..', '.##...##.', '.........', '.........'],
};

/** 쇠 브래킷에 매단 나무 간판. (x, y) 는 브래킷이 벽에 붙는 점, dir 은 뻗는 방향 */
function hangingSign(mt, x, y, dir, icon, o = {}) {
  const len = 15;
  const x1 = x + dir * len;
  mt.rect(Math.min(x, x1), y, Math.max(x, x1) + 1, y + 1, M.iron, 0.3);
  mt.line(x, y + 6, x + dir * 6, y + 1, M.iron, 0.24);
  mt.put(x1, y - 1, M.iron, 0.3);
  const bx = Math.min(x + dir * 3, x1 - dir * 0) + (dir > 0 ? 0 : -1);
  const bx0 = dir > 0 ? x + 3 : x - 15;
  mt.put(bx0 + 2, y + 1, M.iron, 0.3);
  mt.put(bx0 + 10, y + 1, M.iron, 0.3);
  mt.put(bx0 + 2, y + 2, M.iron, 0.3);
  mt.put(bx0 + 10, y + 2, M.iron, 0.3);
  // 판
  mt.rect(bx0, y + 3, bx0 + 13, y + 15, o.frame ?? M.timber, (xx, yy) => (yy === y + 3 || xx === bx0 ? 0.52 : 0.3));
  mt.rect(bx0 + 1, y + 4, bx0 + 12, y + 14, o.board ?? M.woodPale, (xx, yy) => 0.66 + (fbm(xx * 0.3, yy * 0.9, 2, 5) - 0.5) * 0.16);
  const rows = ICONS[icon] ?? ICONS.star;
  rows.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === '#') mt.put(bx0 + 2 + c, y + 5 + r, o.ink ?? M.timber, 0.24);
    else if (ch === 'o') mt.put(bx0 + 2 + c, y + 5 + r, o.fill ?? M.gold, 0.62);
  }));
  void bx;
}

/** 벽등 — 쇠 브래킷 + 유리 등. 저녁에 켜진다 */
function wallLantern(mt, x, y, dir = 1) {
  mt.rect(Math.min(x, x + dir * 4), y, Math.max(x, x + dir * 4) + 1, y + 1, M.iron, 0.3);
  const lx = dir > 0 ? x + 3 : x - 6;
  mt.rect(lx, y + 1, lx + 4, y + 2, M.iron, 0.34);
  mt.rect(lx, y + 2, lx + 4, y + 7, M.glass, 0.7);
  mt.rect(lx, y + 7, lx + 4, y + 8, M.iron, 0.26);
  mt.put(lx + 1, y + 8, M.iron, 0.26);
  mt.put(lx + 2, y + 8, M.iron, 0.26);
  for (let yy = y + 2; yy < y + 7; yy++) for (let xx = lx; xx < lx + 4; xx++) mt.setLit(xx, yy, xx === lx || xx === lx + 3 ? WARM.mid : WARM.core);
  mt.lights.push({ x: lx + 2, y: y + 6, r: 46, power: 0.85 });
}

/** 줄무늬 차양 — 벽에서 앞으로 내민다. 아래 끝은 물결 술 */
function awning(mt, x0, x1, y, ma, mb, o = {}) {
  const d = o.drop ?? 9, sw = o.sw ?? 5;
  mt.shade(x0 + 1, y + d, x1 - 1, y + d + 8, (xx, yy) => -0.2 + (yy - y - d) * 0.02);
  for (let r = 0; r < d; r++) {
    const inset = Math.round((1 - r / (d - 1)) * 3);
    for (let x = x0 + inset; x < x1 - inset; x++) {
      const stripe = Math.floor((x - x0) / sw) % 2;
      mt.put(x, y + r, stripe ? mb : ma, 0.7 - (r / d) * 0.16 + (r === 0 ? 0.08 : 0));
    }
  }
  for (let x = x0; x < x1; x++) {
    const stripe = Math.floor((x - x0) / sw) % 2, k = (x - x0) % sw;
    mt.put(x, y + d, stripe ? mb : ma, 0.46);
    if (k > 0 && k < sw - 1) mt.put(x, y + d + 1, stripe ? mb : ma, 0.4);
    if (sw >= 5 && k === Math.floor(sw / 2)) mt.put(x, y + d + 2, stripe ? mb : ma, 0.36);
  }
}

/* ---------- 층 ---------- */

/**
 * 한 층의 벽을 평면 버퍼에 그린다.
 * f: { wall, plaster, pattern, bays, win, winH, winY, winStyle, door, shop }
 */
function drawFloor(F, x0, x1, yTop, yBot, f, ctx) {
  const { tim, seed, k, lit } = ctx;
  const w = x1 - x0;
  const bays = f.bays ?? Math.max(2, Math.round(w / 17));
  const bw = w / bays;
  const bx = (i) => Math.round(x0 + i * bw);
  const stone = f.wall === 'stone' || f.wall === 'brick';
  const winH = f.winH ?? Math.min(15, yBot - yTop - 13);
  const winTop = yTop + (f.winY ?? 6);
  const wins = f.win === 'all' ? Array.from({ length: bays }, (_, i) => i) : f.win ?? [];
  const out = { awnings: [], doors: [] };

  if (f.wall === 'stone') ashlar(F, x0, yTop, x1, yBot, M[f.stone ?? 'stone'], { seed: seed + k, bh: f.bh ?? 6, bw: f.bwStone ?? 12 });
  else if (f.wall === 'brick') bricks(F, x0, yTop, x1, yBot, M.brick, seed + k);
  else plaster(F, x0, yTop, x1, yBot, M[f.plaster ?? ctx.plaster], seed + k * 7);

  const doorBay = f.door ? f.door.bay ?? Math.floor(bays / 2) : -1;
  const shop = f.shop;
  const inShop = (i) => shop && i >= shop.bay0 && i <= shop.bay1;

  if (!stone) {
    const railY = winTop + winH + 1;
    // 가로대: 창턱 높이
    hbeam(F, x0, x1, railY, 2, tim);
    for (let i = 0; i < bays; i++) {
      const a = bx(i) + 2, b = bx(i + 1);
      const hasWin = wins.includes(i);
      const lowTop = railY + 2, lowBot = yBot - 3;
      if (i === doorBay || inShop(i)) continue;
      const pat = f.pattern ?? 'studs';
      if (pat === 'x' && i % 2 === (f.patOdd ?? 0)) {
        F.beam(a, lowTop, b, lowBot, 2, tim);
        F.beam(b, lowTop, a, lowBot, 2, tim);
      } else if (pat === 'herring') {
        if (i % 2) F.beam(a, lowTop, b, lowBot, 2, tim);
        else F.beam(b, lowTop, a, lowBot, 2, tim);
      } else if (pat === 'diag' && (i === 0 || i === bays - 1)) {
        if (i === 0) F.beam(a, yTop + 3, b, lowBot, 2, tim);
        else F.beam(b, yTop + 3, a, lowBot, 2, tim);
      } else if (pat === 'studs' && bw > 13) {
        vbeam(F, Math.round((a + b) / 2) - 1, lowTop, lowBot, 2, tim);
      } else if (pat === 'curve') {
        // 모서리에서 휘어 올라가는 버팀목
        const left = i < bays / 2;
        for (let t = 0; t <= 1; t += 0.03) {
          const px = left ? a + (b - a) * t * t : b - (b - a) * t * t, py = lowBot - (lowBot - lowTop) * t;
          F.put(px, py, tim, 0.46);
          F.put(px + 1, py, tim, 0.36);
        }
      }
      if (!hasWin && f.upperBrace && i % 2 === 1) F.beam(a, yTop + 3, b, railY, 2, tim);
    }
    // 기둥
    for (let i = 0; i <= bays; i++) {
      const edge = i === 0 || i === bays;
      vbeam(F, i === bays ? x1 - 3 : bx(i) - (edge ? 0 : 1), yTop, yBot, edge ? 3 : 2, tim);
    }
    hbeam(F, x0, x1, yBot - 3, 3, tim);
    hbeam(F, x0, x1, yTop, 3, tim, 0.46);
  } else if (f.quoins !== false) {
    // 모서리돌
    for (let y = yTop; y < yBot; y += 6) {
      const wq = (Math.floor((y - yTop) / 6) % 2 ? 5 : 8);
      F.rect(x0, y, x0 + wq, Math.min(yBot, y + 5), M.stonePale, (xx, yy) => (yy === y ? 0.72 : 0.6));
      F.rect(x1 - wq, y, x1, Math.min(yBot, y + 5), M.stonePale, (xx, yy) => (yy === y ? 0.66 : 0.52));
    }
  }

  // 창
  wins.forEach((i, n) => {
    if (i === doorBay || inShop(i)) return;
    const a = bx(i) + 2, b = bx(i + 1) - (stone ? 2 : 0);
    const ww = Math.min(f.winW ?? 11, b - a - (stone ? 4 : 2));
    const wx = Math.round((a + b) / 2 - ww / 2);
    windowAt(F, wx, winTop, ww, winH, {
      frame: stone ? M.stonePale : tim,
      frameV: stone ? 0.74 : 0.4,
      sill: stone ? M.stonePale : M.woodPale,
      arch: f.winArch,
      lattice: f.lattice,
      shutters: f.shutters ? M[f.shutters] : null,
      shutterW: Math.max(2, Math.min(3, Math.floor((b - a - ww) / 2))),
      box: f.box === true || (Array.isArray(f.box) && f.box.includes(i)),
      lit: lit(k * 16 + n),
    });
  });

  // 가게 진열창
  if (shop) {
    const a = bx(shop.bay0) + 3, b = bx(shop.bay1 + 1) - 3;
    const top = yTop + (shop.top ?? 11), bot = yBot - (shop.riser ?? 9);
    F.rect(a - 1, top - 1, b + 1, bot + 1, stone ? M.stonePale : tim, stone ? 0.72 : 0.4);
    const on = lit(k * 16 + 9);
    for (let yy = top; yy < bot; yy++)
      for (let xx = a; xx < b; xx++) {
        const u = (xx - a) / (b - a), v = (yy - top) / (bot - top);
        if ((xx - a) % 9 === 8) {
          F.put(xx, yy, stone ? M.stonePale : tim, 0.44);
          continue;
        }
        F.put(xx, yy, M.glass, 0.5 - u * 0.12 - v * 0.2 + (yy === top ? -0.16 : 0));
        if (on) F.setLit(xx, yy, litColor((u - 0.5) * 1.6, (v - 0.4) * 2));
      }
    // 진열품
    const goods = shop.goods ?? [M.clothGold, M.clothRed, M.clothGreen];
    for (let xx = a + 1; xx < b - 1; xx += 4) {
      if ((xx - a) % 9 >= 6) continue;
      const g = goods[Math.floor(hash(xx, seed, 31) * goods.length)], hgt = 2 + Math.floor(hash(xx, seed, 33) * 3);
      F.rect(xx, bot - hgt, xx + 3, bot, g, (px, py) => (py === bot - hgt ? 0.7 : 0.5));
    }
    F.rect(a - 2, bot + 1, b + 2, bot + 2, M.woodPale, 0.72);
    if (on) F.lights.push({ x: (a + b) / 2, y: bot + 2, r: 34, power: 0.6 });
    out.awnings.push({ x0: a - 4, x1: b + 4, y: top - 5, cols: shop.awning });
  }

  // 문
  if (f.door) {
    const d = f.door, dw = d.w ?? 12, dh = d.h ?? 22;
    const a = bx(doorBay), b = bx(doorBay + 1);
    const dx0 = Math.round((a + b) / 2 - dw / 2) + 1;
    doorAt(F, dx0, yBot, dw, dh, { arched: d.arched, frame: stone ? M.stonePale : tim, lit: d.lit && lit(k * 16 + 12), wood: d.wood ? M[d.wood] : undefined });
    out.doors.push({ x: dx0 + dw / 2, w: dw, h: dh });
  }
  return out;
}

/* ---------- 집 ---------- */

/**
 * 집 한 채.
 * o: { w, floors[], roof: { type: 'gable' | 'eave', h, m, ov, dormers, chimneys }, gable, depth, side,
 *      plaster, timber, seed, litChance, ivy, sign, lantern }
 * 돌려주는 값: { mat, ox, oy, smoke[] } — (ox, oy) 는 1층 정면의 왼쪽 아래.
 */
function house(o) {
  const seed = o.seed ?? 1;
  const floors = o.floors;
  const tim = M[o.timber ?? 'timber'];
  const roof = o.roof;
  const rm = M[roof.m ?? 'roofTerra'];
  const rh = roof.h, ov = roof.ov ?? 4;
  const depth = o.depth ?? 26, side = o.side ?? 'right', sgn = side === 'right' ? 1 : -1;
  const dx = sgn * depth, dy = -Math.round(depth * RECEDE);
  const gable = roof.type === 'gable';
  const lit = (i) => hash(seed * 13 + i, 7, 11) < (o.litChance ?? 0.62);
  const sideDv = side === 'right' ? -0.27 : 0.06;

  const widths = [];
  let w = o.w;
  floors.forEach((f, k) => {
    if (k) w += 2 * (f.jetty ?? 0);
    widths.push(w);
  });
  const Wt = widths[widths.length - 1];
  const Hw = floors.reduce((s, f) => s + f.h, 0);

  // ----- 정면 -----
  const F = new Mat(Wt, Hw + (gable ? rh : 0));
  const wallTop = gable ? rh : 0;
  const ctx = { tim, seed, plaster: o.plaster ?? 'plaster', lit, k: 0 };
  const rows = [];
  let yBot = F.h;
  const extras = { awnings: [], doors: [] };
  floors.forEach((f, k) => {
    const x0 = Math.round((Wt - widths[k]) / 2), x1 = x0 + widths[k], yTop = yBot - f.h;
    rows.push({ x0, x1, yTop, yBot });
    const out = drawFloor(F, x0, x1, yTop, yBot, f, { ...ctx, k });
    extras.awnings.push(...out.awnings);
    extras.doors.push(...out.doors);
    yBot = yTop;
  });
  // 내민 층 아래의 그늘 + 까치발
  for (let k = 1; k < floors.length; k++) {
    const j = floors[k].jetty ?? 0, lo = rows[k - 1], up = rows[k];
    if (!j) continue;
    F.shade(lo.x0, up.yBot, lo.x1, up.yBot + 4, (x, y) => -0.26 + (y - up.yBot) * 0.06);
    for (let i = 0; i < j; i++) {
      F.rect(up.x0 + i, up.yBot, up.x0 + i + 1, up.yBot + i + 1, tim, 0.3);
      F.rect(up.x1 - 1 - i, up.yBot, up.x1 - i, up.yBot + i + 1, tim, 0.26);
    }
  }
  // 박공 삼각벽
  if (gable) {
    const g = o.gable ?? {};
    const half = (y) => ((y + 0.5) / rh) * (Wt / 2);
    const pm = M[g.plaster ?? floors[floors.length - 1].plaster ?? ctx.plaster];
    for (let y = 0; y < rh; y++) {
      const hw = half(y);
      for (let x = Math.ceil(Wt / 2 - hw); x < Wt / 2 + hw; x++) F.put(x, y, pm, 0.6 + (fbm(x * 0.045 + seed, y * 0.07, 3, seed + 3) - 0.5) * 0.34);
    }
    const inTri = (x, y) => y >= 0 && y < rh && Math.abs(x + 0.5 - Wt / 2) < half(y);
    const tput = (fn) => {
      const T = new Mat(Wt, rh);
      fn(T);
      for (let y = 0; y < rh; y++) for (let x = 0; x < Wt; x++) if (T.m[y * Wt + x] && inTri(x, y)) F.put(x, y, T.m[y * Wt + x], T.v[y * Wt + x]);
    };
    const collar = Math.round(rh * (g.collar ?? 0.46));
    tput((T) => {
      const c = Wt / 2;
      hbeam(T, 0, Wt, collar, 2, tim);
      vbeam(T, Math.round(c) - 1, 0, collar, 2, tim);
      const q = Math.round(Wt * 0.2);
      vbeam(T, Math.round(c - q) - 1, collar, rh, 2, tim);
      vbeam(T, Math.round(c + q) - 1, collar, rh, 2, tim);
      const pat = g.pattern ?? 'chevron';
      if (pat === 'chevron') {
        T.beam(c - q, rh - 2, c - 2, collar + 2, 2, tim);
        T.beam(c + q, rh - 2, c + 2, collar + 2, 2, tim);
        T.beam(c - q - 2, collar + 3, c - Wt * 0.42, rh - 2, 2, tim);
        T.beam(c + q + 2, collar + 3, c + Wt * 0.42, rh - 2, 2, tim);
      } else if (pat === 'x') {
        T.beam(c - q, collar + 2, c + q, rh - 2, 2, tim);
        T.beam(c + q, collar + 2, c - q, rh - 2, 2, tim);
      } else if (pat === 'studs') {
        for (let x = 8; x < Wt - 4; x += 9) vbeam(T, x, collar, rh, 1, tim);
      }
      if (g.window !== false && rh - collar > 15) {
        const ww = 8, wh = Math.min(11, rh - collar - 6);
        windowAt(T, Math.round(c - ww / 2), collar + 3, ww, wh, { frame: tim, lit: lit(99), sill: M.woodPale });
      } else if (g.window !== false && collar > 16) {
        const r = 3;
        T.disc(c, collar - 7, r + 1, r + 1, tim, 0.4);
        T.disc(c, collar - 7, r, r, M.glass, 0.5);
      }
    });
    // 박공 처마가 삼각벽에 드리우는 그늘
    for (let y = 0; y < rh; y++) {
      const hw = half(y);
      for (let d = 0; d < 4; d++) {
        F.add(Math.ceil(Wt / 2 - hw) + d, y, -0.2 + d * 0.05);
        F.add(Math.ceil(Wt / 2 + hw) - 1 - d, y, -0.2 + d * 0.05);
      }
    }
    hbeam(F, 0, Wt, rh, 3, tim, 0.46);
  } else {
    // 처마 그늘
    F.shade(0, 0, Wt, 6, (x, y) => -0.3 + y * 0.05);
  }
  // 땅에 닿는 곳은 살짝 어둡게
  F.shade(0, F.h - 3, Wt, F.h, -0.07);
  if (o.ivy) {
    const iv = o.ivy, h = iv.h ?? Hw * 0.7, wd = iv.w ?? Wt * 0.5;
    const g0 = rows[0];
    if (iv.side === 'left') ivy(F, g0.x0 - 2, F.h - h, g0.x0 + wd, F.h, seed + 5, { from: 'bl' });
    else ivy(F, g0.x1 - wd, F.h - h, g0.x1 + 2, F.h, seed + 5, { from: 'br' });
  }

  // ----- 조립 -----
  const pad = depth + ov + 22;
  const padTop = (gable ? 0 : rh) + Math.abs(dy) + 34;
  const mt = new Mat(Wt + pad * 2, F.h + padTop + 2);
  const fx = pad, fy = padTop;
  const A = [sgn, dy / depth];
  const smoke = [];

  // 옆벽 — 층마다 따로 붙여 내민 층이 옆에서도 계단으로 보이게
  floors.forEach((f, k) => {
    const r = rows[k];
    const S = new Mat(depth, f.h);
    if (f.wall === 'stone') ashlar(S, 0, 0, depth, f.h, M[f.stone ?? 'stone'], { seed: seed + k + 40, bh: f.bh ?? 6, bw: 10 });
    else if (f.wall === 'brick') bricks(S, 0, 0, depth, f.h, M.brick, seed + k + 40);
    else {
      plaster(S, 0, 0, depth, f.h, M[f.plaster ?? ctx.plaster], seed + k * 7 + 40);
      hbeam(S, 0, depth, f.h - 3, 3, tim);
      hbeam(S, 0, depth, 0, 3, tim, 0.46);
      vbeam(S, 0, 0, f.h, 3, tim);
      vbeam(S, depth - 2, 0, f.h, 2, tim);
      if (depth > 22) vbeam(S, Math.round(depth / 2) - 1, 0, f.h, 2, tim);
      if (f.h > 26) hbeam(S, 0, depth, Math.round(f.h * 0.55), 2, tim);
    }
    if (k > 0 && depth >= 20 && f.sideWin !== false) {
      const ww = 7, wh = Math.min(12, f.h - 14);
      windowAt(S, Math.round(depth * 0.3), 6, ww, wh, { frame: tim, lit: lit(k * 16 + 14), sill: M.woodPale });
    }
    if (k === 0) S.shade(0, f.h - 3, depth, f.h, -0.07);
    const ex = side === 'right' ? fx + r.x1 : fx + r.x0;
    mt.project(S, [ex, fy + r.yTop], A, [0, 1], sideDv);
  });

  const topRow = rows[rows.length - 1];
  if (gable) {
    const Ap = [fx + Wt / 2, fy];
    const drop = (ov * rh) / (Wt / 2);
    const El = [fx - ov, fy + rh + drop], Er = [fx + Wt + ov, fy + rh + drop];
    const E = side === 'right' ? Er : El;
    const slopeLen = Math.round(Math.hypot(E[0] - Ap[0], E[1] - Ap[1]));
    const B = [(E[0] - Ap[0]) / slopeLen, (E[1] - Ap[1]) / slopeLen];
    // 처마 밑 옆벽 그늘
    mt.shadePoly([E, [E[0] + dx, E[1] + dy], [E[0] + dx, E[1] + dy + 6], [E[0], E[1] + 6]], -0.14);
    const Rs = new Mat(depth, slopeLen);
    tiles(Rs, 0, 0, depth, slopeLen, rm, { seed: seed + 60, tw: roof.tw ?? 5, th: roof.th ?? 4, moss: roof.moss });
    Rs.shade(0, slopeLen - 2, depth, slopeLen, -0.2);
    mt.project(Rs, Ap, [dx / depth, dy / depth], B, side === 'right' ? -0.16 : 0.07);
    // 용마루
    mt.beam(Ap[0], Ap[1], Ap[0] + dx, Ap[1] + dy, 2.4, rm, 0.42, 0.26);
    for (const t of roof.chimneys ?? []) {
      const cx = Math.round(Ap[0] + dx * t), cy = Math.round(Ap[1] + dy * t);
      chimney(mt, cx, cy + 5, 9, 20, sgn, seed + t * 10);
      smoke.push([cx, cy - 18]);
    }
    mt.blit(F, fx, fy);
    // 박공널
    mt.beam(Ap[0], Ap[1] - 1, El[0], El[1] - 1, 3, tim, 0.46, 0.22);
    mt.beam(Ap[0], Ap[1] - 1, Er[0], Er[1] - 1, 3, tim, 0.4, 0.22);
    mt.rect(Ap[0] - 1, Ap[1] - 7, Ap[0] + 1, Ap[1] + 1, tim, (x) => (x < Ap[0] ? 0.5 : 0.34));
    mt.put(Ap[0] - 1, Ap[1] - 8, M.gold, 0.7);
    mt.put(Ap[0], Ap[1] - 8, M.gold, 0.5);
  } else {
    // 옆 박공벽 (삼각)
    const G = new Mat(depth, rh);
    const pm = M[floors[floors.length - 1].plaster ?? ctx.plaster];
    for (let y = 0; y < rh; y++) {
      const hw = ((y + 0.5) / rh) * (depth / 2);
      for (let x = Math.ceil(depth / 2 - hw); x < depth / 2 + hw; x++) G.put(x, y, pm, 0.6 + (fbm(x * 0.05 + seed, y * 0.07, 3, seed + 9) - 0.5) * 0.3);
    }
    for (let y = Math.round(rh * 0.5); y < rh; y++) {
      if (G.at(depth / 2, y)) {
        G.put(depth / 2 - 1, y, tim, 0.5);
        G.put(depth / 2, y, tim, 0.38);
      }
    }
    for (let x = 0; x < depth; x++) for (let k = 0; k < 2; k++) if (G.at(x, Math.round(rh * 0.5) + k)) G.put(x, Math.round(rh * 0.5) + k, tim, k ? 0.36 : 0.52);
    const ex = side === 'right' ? fx + topRow.x1 : fx + topRow.x0;
    mt.project(G, [ex, fy - rh], A, [0, 1], sideDv);
    mt.blit(F, fx, fy);
    // 앞 지붕면
    const yEave = fy + 3;
    const Rl = [fx - ov + dx / 2, fy - rh + dy / 2];
    const sh = Math.round(yEave - Rl[1]);
    const Rf = new Mat(Wt + ov * 2, sh);
    tiles(Rf, 0, 0, Rf.w, sh, rm, { seed: seed + 60, tw: roof.tw ?? 6, th: roof.th ?? 4, moss: roof.moss });
    Rf.shade(0, sh - 2, Rf.w, sh, -0.22);
    Rf.shade(0, 0, Rf.w, sh, (x, y) => 0.05 - (y / sh) * 0.1);
    mt.project(Rf, Rl, [1, 0], [-dx / 2 / sh, 1], 0);
    // 지붕창
    const dorm = roof.dormers ?? [];
    dorm.forEach((u, i) => {
      const vpos = roof.dormerV ?? 0.74;
      const cx = Math.round(fx + u * Wt + (dx / 2) * (1 - vpos));
      const by = Math.round(Rl[1] + sh * vpos) + 4;
      dormer(mt, cx, by, { tim, rm, pm, lit: lit(70 + i), sgn, w: roof.dormerW ?? 15 });
    });
    for (const u of roof.chimneys ?? []) {
      const cx = Math.round(fx + u * Wt + dx / 2), cy = Math.round(Rl[1]);
      chimney(mt, cx, cy + 7, 9, 22, sgn, seed + u * 10);
      smoke.push([cx, cy - 18]);
    }
    mt.beam(Rl[0], Rl[1], Rl[0] + Rf.w, Rl[1], 2.4, rm, 0.44, 0.26);
    // 처마 끝 서까래 그늘
    mt.rect(fx - ov, yEave, fx + Wt + ov, yEave + 1, tim, 0.26);
  }

  // 차양 · 간판 · 등
  for (const a of extras.awnings) awning(mt, fx + a.x0, fx + a.x1, fy + a.y, M[a.cols?.[0] ?? 'clothRed'], M[a.cols?.[1] ?? 'clothCream']);
  const g0 = rows[0];
  if (o.sign) {
    const s = o.sign, dir = s.at === 'left' ? -1 : 1;
    const sx = dir > 0 ? fx + topRow.x1 : fx + topRow.x0 - 1;
    hangingSign(mt, sx, fy + wallTop + (s.y ?? Hw - floors[0].h - 4), dir, s.icon, s);
  }
  if (o.lantern) {
    const l = o.lantern;
    wallLantern(mt, fx + g0.x0 + Math.round(l.u * (g0.x1 - g0.x0)), fy + F.h - (l.h ?? 26), l.dir ?? 1);
  }
  return { mat: mt, ox: fx + g0.x0, oy: fy + F.h, smoke, w: o.w, doors: extras.doors.map((d) => ({ ...d, x: d.x - g0.x0 })) };
}

/** 굴뚝 — (cx, yBase) 는 밑동 가운데. sgn 쪽 옆면이 보인다 */
function chimney(mt, cx, yBase, w, h, sgn, seed) {
  const x0 = Math.round(cx - w / 2), y0 = yBase - h;
  bricks(mt, x0, y0, x0 + w, yBase, M.brick, seed, 0.56);
  // 옆면
  if (sgn > 0) mt.rect(x0 + w, y0 - 1, x0 + w + 3, yBase - 1, M.brick, 0.3);
  else mt.rect(x0 - 3, y0 - 1, x0, yBase - 1, M.brick, 0.68);
  mt.rect(x0 - 1, y0 - 2, x0 + w + 1 + (sgn > 0 ? 3 : 0), y0, M.stonePale, (x, y) => (y === y0 - 2 ? 0.74 : 0.5));
  if (sgn < 0) mt.rect(x0 - 4, y0 - 2, x0 - 1, y0, M.stonePale, 0.7);
  mt.rect(x0 + 2, y0 - 5, x0 + w - 2, y0 - 2, M.roofTerra, (x) => (x < x0 + 4 ? 0.6 : 0.4));
  mt.rect(x0 + 3, y0 - 5, x0 + w - 3, y0 - 4, M.iron, 0.14);
  mt.shade(x0, yBase - 4, x0 + w, yBase, -0.1);
}

/** 지붕창 — (cx, yBot) 은 창 벽의 아래 가운데 */
function dormer(mt, cx, yBot, o) {
  const w = o.w ?? 15, wallH = 11, gh = 9;
  const x0 = Math.round(cx - w / 2), yTop = yBot - wallH;
  const D = new Mat(w, wallH + gh);
  for (let y = 0; y < gh; y++) {
    const hw = ((y + 0.5) / gh) * (w / 2);
    for (let x = Math.ceil(w / 2 - hw); x < w / 2 + hw; x++) D.put(x, y, o.pm, 0.56);
  }
  D.rect(0, gh, w, gh + wallH, o.pm, 0.62);
  vbeam(D, 0, gh, gh + wallH, 2, o.tim);
  vbeam(D, w - 2, gh, gh + wallH, 2, o.tim);
  hbeam(D, 0, w, gh + wallH - 2, 2, o.tim);
  windowAt(D, Math.round(w / 2 - 4), gh + 0, 8, wallH - 3, { frame: o.tim, lit: o.lit, sill: M.woodPale });
  // 옆 지붕(보이는 쪽)과 볼
  const sg = o.sgn;
  const side = sg > 0 ? x0 + w : x0 - 5;
  mt.poly([[sg > 0 ? x0 + w : x0, yTop], [sg > 0 ? x0 + w + 4 : x0 - 4, yTop - 2], [sg > 0 ? x0 + w + 4 : x0 - 4, yBot - 5], [sg > 0 ? x0 + w : x0, yBot]], o.tim, sg > 0 ? 0.3 : 0.6);
  mt.poly([[cx, yTop - gh - 1], [cx + sg * 7, yTop - gh - 3], [sg > 0 ? x0 + w + 7 : x0 - 7, yTop - 1], [sg > 0 ? x0 + w + 1 : x0 - 1, yTop + 1]], o.rm, sg > 0 ? 0.34 : 0.62);
  void side;
  mt.blit(D, x0, yTop - gh);
  mt.beam(cx, yTop - gh - 1, x0 - 2, yTop + 1, 2.4, o.rm, 0.56, 0.2);
  mt.beam(cx, yTop - gh - 1, x0 + w + 2, yTop + 1, 2.4, o.rm, 0.44, 0.2);
  mt.shade(x0, yBot, x0 + w, yBot + 2, -0.14);
}

module.exports = { house, hbeam, vbeam, windowAt, doorAt, ivy, hangingSign, wallLantern, awning, chimney, dormer, litColor, ICONS, RECEDE };
