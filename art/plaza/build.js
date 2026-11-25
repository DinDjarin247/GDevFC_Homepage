// 광장 아트 굽기 —  npm run art
//
// 계절(가을 · 크리스마스)마다, 여섯 시간대마다 이미지 다섯 장을 public/art/plaza/<계절>/ 에 만든다.
//   sky-*     하늘 (별 · 해 · 달 · 높은 구름)
//   clouds-*  흘러가는 구름 한 겹 (가로로 이어 붙는다)
//   back-*    먼 산 · 성 · 윗마을 · 윗마당 건물 (하늘 자리는 비어 있다)
//   front-*   난간 · 옹벽 · 큰 계단 · 아래 광장 바닥
//   sprites-* 소품 · 움직이는 것들을 한 장에 모은 시트
// 사람(마을 사람 · 주인공)은 시간대와 상관없이 계절마다 people.png 한 장, 시간대 색은 대응표로 내보낸다.
// 시트의 좌표는 계절 · 시간대가 모두 같다 — 그 좌표와 배치를 lib/plazaArt.ts 로 내보낸다 (손으로 고치지 않는다).
// art/preview/plaza-<계절>-<시간대>.png 는 화면을 그대로 흉내 낸 미리보기다.
//
//   PHASE=noon,night SEASON=christmas npm run art   — 일부만 (이때는 lib/plazaArt.ts 를 쓰지 않는다)
const fs = require('fs');
const path = require('path');
const { P, W, H, M, MATS } = require('./kit');
const L = require('./layout');
const { buildTown } = require('./town');
const { buildFar, buildHill } = require('./backdrop');
const { buildTerrace, buildFront } = require('./ground');
const props = require('./props');
const fx = require('./effects');
const { PHASES, grade, sky, lightMap, tint } = require('./grade');
const { PROPS, NPCS, POIS, BLOCKS, SPOTS } = require('./placement');
const { buildPeople, gradeColors, recolor, FACE } = require('./people');
const { buildNav, walkable } = require('./nav');
const N = require('./npcs');
const { YC } = require('./rig');
const SE = require('./season');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'public', 'art', 'plaza');
const PREVIEW = path.join(ROOT, 'art', 'preview');
fs.mkdirSync(PREVIEW, { recursive: true });

const onlyPhases = process.env.PHASE ? process.env.PHASE.split(',') : null;
const onlySeasons = process.env.SEASON ? process.env.SEASON.split(',') : null;
const partial = !!(onlyPhases || onlySeasons);
const SEASONS = SE.SEASONS;
const BACK_H = L.WALL_TOP + 6;
const FRONT_Y = 266;
const SKY_H = 312;
const t0 = Date.now();
const log = (s) => console.log(`${String(Date.now() - t0).padStart(6)}ms  ${s}`);

/* ---------- 1. 계절마다 그림 그리기 (한낮 기준) ---------- */

const raw = (buf) => ({ col: buf });

function drawSeason(season) {
  const xmas = season === 'christmas';
  const far = buildFar();
  const hill = buildHill();
  const town = buildTown();
  const terrace = buildTerrace();
  const front = buildFront();
  const bulbs = { back: [], front: [], sprites: {} };
  if (xmas) SE.dressChristmas({ far, hill, town, terrace, front }, bulbs);

  /** 시트에 들어갈 그림들 — name → { r(색 풀어낸 것), ax, ay, opt } */
  const sprites = {};
  const add = (name, res, ax, ay, opt = {}) => {
    sprites[name] = { r: res, w: res.col.w, h: res.col.h, ax: Math.round(ax), ay: Math.round(ay), ...opt };
  };
  /** 소품 재질 버퍼 → 시트 (겨울에는 눈을 얹는다) */
  const fromMat = (name, p, opt = {}) => {
    if (xmas && !opt.noSnow) SE.snowify(p.mat, { seed: name.length * 7 + 3, ground: 0.8 });
    add(name, p.mat.resolve(), p.ax, p.ay, { lights: p.mat.lights, ...opt });
  };

  const fountainF = [0, 1, 2, 3].map((f) => props.fountain(f, 4));
  fountainF.forEach((p, f) => fromMat(`fountain_${f}`, p));
  const tentP = props.tent();
  fromMat('tent', tentP);
  const stalls = { stallFruit: { kind: 'fruit' }, stallBread: { kind: 'bread', a: 'clothGreen', w: 84 }, stallScroll: { kind: 'scroll', a: 'clothPurple', b: 'clothGold', w: 96 } };
  for (const [name, o] of Object.entries(stalls)) {
    fromMat(name, props.stall(o));
    if (xmas) bulbs.sprites[name] = SE.stallBulbs(o.w ?? 92);
  }
  const targetP = props.target();
  fromMat('target', targetP);
  const tvP = props.tvSet();
  fromMat('tv', tvP);
  fromMat('console', props.consoleBox());
  fromMat('sofa', props.sofa());
  const brazierP = props.brazier();
  fromMat('brazier', brazierP);
  fromMat('bench', props.bench());
  fromMat('cart', props.hayCart());
  fromMat('signpost', props.signpost());
  if (!xmas) {
    [0, 1, 2].forEach((k) => fromMat(`clutter${k}`, props.clutter(k)));
    fromMat('lamp', props.lampPost());
  } else {
    [0, 1, 2].forEach((k) => fromMat(`xclutter${k}`, SE.xmasClutter(k), { noSnow: true }));
    const lamp = props.lampPost();
    SE.decorateLamp(lamp.mat, lamp.ax, lamp.ay);
    fromMat('xlamp', lamp);
    const tree = SE.xmasTree();
    fromMat('xtree', tree, { noSnow: true });
    bulbs.sprites.xtree = tree.bulbs;
  }

  // 양쪽 가장자리의 큰 나무 — 가을엔 단풍, 겨울엔 눈 얹은 늘푸른 잎에 꼬마전구
  if (!xmas) {
    const treeL = fx.treeFrames({ w: 240, h: 250, x: 96, seed: 5, cols: MATS[M.leafOrange], trunk: 78, lean: 0.12, clumpR: [10, 17] });
    const treeR = fx.treeFrames({ w: 220, h: 230, x: 130, seed: 11, cols: MATS[M.leafRed], trunk: 70, lean: -0.14, clumpR: [9, 15] });
    treeL.forEach((b, f) => add(`treeL_${f}`, raw(b), 96, 244));
    treeR.forEach((b, f) => add(`treeR_${f}`, raw(b), 130, 224));
  } else {
    const cols = SE.snowTreeRamp();
    const treeL = fx.treeFrames({ w: 240, h: 250, x: 96, seed: 5, cols, trunk: 78, lean: 0.12, clumpR: [10, 17] });
    const treeR = fx.treeFrames({ w: 220, h: 230, x: 130, seed: 11, cols, trunk: 70, lean: -0.14, clumpR: [9, 15] });
    treeL.forEach((b, f) => add(`snowTreeL_${f}`, raw(b), 96, 244));
    treeR.forEach((b, f) => add(`snowTreeR_${f}`, raw(b), 130, 224));
    bulbs.sprites.snowTreeL = SE.treeBulbs(treeL[0], 5);
    bulbs.sprites.snowTreeR = SE.treeBulbs(treeR[0], 11);
  }

  fx.flameFrames(8).forEach((b, f) => add(`flame_${f}`, raw(b), 15, 42, { emissive: true }));
  fx.puffs().forEach((mt, k) => add(`puff_${k}`, mt.resolve(), mt.w / 2, mt.h / 2));
  fx.dragonFrames(6).forEach((mt, f) => add(`dragon_${f}`, mt.resolve(), 32, 22, { haze: 0.42 }));
  fx.flagFrames(4).forEach((mt, f) => add(`flag_${f}`, mt.resolve(), 0, 2));
  // 폭포는 앞의 언덕 · 건물에 가려지는 부분을 미리 잘라 둔다
  fx.waterfallFrames(far.fall, 4).forEach((mt, f) => {
    for (let y = 0; y < mt.h; y++)
      for (let x = 0; x < mt.w; x++) {
        const X = far.fall.x - 2 + x, Y = far.fall.y0 + y;
        if (X < 0 || X >= W || Y >= H) continue;
        const i = Y * W + X;
        if (hill.m[i] || town.main.m[i] || terrace.m[i]) mt.clearPx(x, y);
      }
    add(`fall_${f}`, mt.resolve(), 0, 0, { haze: 0.44 });
  });

  // 소품 배치 — 계절마다 바꿔 끼우는 것
  const swap = xmas ? { treeL: 'snowTreeL', treeR: 'snowTreeR', clutter0: 'xclutter0', clutter1: 'xclutter1', clutter2: 'xclutter2', lamp: 'xlamp' } : {};
  const placed = PROPS.map((p) => ({ ...p, sprite: swap[p.sprite] ?? p.sprite }));
  if (xmas) {
    // 큰 계단 아래 양쪽 받침대 위 — 화로 대신 트리
    for (const [id, x] of [['xtreeL', L.STAIR.botX0 - 6], ['xtreeR', L.STAIR.botX1 + 6]]) placed.push({ id, sprite: 'xtree', x, y: L.STAIR.botY - 25 });
  }

  // 자리 잡기: 그림자 · 빛
  const lights = [...town.main.lights, ...front.mt.lights];
  const placedAt = {};
  for (const p of placed) {
    const name = p.frames ? `${p.sprite}_0` : p.sprite;
    const s = sprites[name];
    if (!s) throw new Error(`no sprite ${name}`);
    if (!placedAt[p.sprite]) placedAt[p.sprite] = [p.x - s.ax, p.y - s.ay];
    for (const l of s.lights ?? []) lights.push({ ...l, x: p.x - s.ax + l.x, y: p.y - s.ay + l.y });
    if (p.shadow) {
      const [rx, ry] = p.shadow;
      for (let y = Math.floor(p.y - ry); y <= p.y + ry; y++)
        for (let x = Math.floor(p.x - rx + 4); x <= p.x + rx + 8; x++) {
          const d = Math.hypot((x - p.x - 4) / (rx + 4), (y - p.y + 1) / ry);
          if (d < 1) front.mt.add(x, y, -0.2 * (1 - d * d * 0.6));
        }
    }
  }
  for (const [tx, ty, rx, ry] of [[52, 486, 70, 16], [912, 462, 64, 14]])
    for (let y = ty - ry; y <= ty + ry; y++)
      for (let x = tx - rx; x <= tx + rx; x++) {
        const d = Math.hypot((x - tx) / rx, (y - ty) / ry);
        if (d < 1 && P.fbm(x * 0.12, y * 0.2, 2, 7) > 0.34) front.mt.add(x, y, -0.16 * (1 - d * d));
      }
  const map = lightMap(lights);
  const R = {
    far2: far.far2.resolve(), far1b: far.far1b.resolve(), far1: far.far1.resolve(),
    hill: hill.resolve(), terrace: terrace.resolve(), main: town.main.resolve(), front: front.mt.resolve(),
  };
  log(`${season}: scene drawn (${Object.keys(sprites).length} sprites, ${lights.length} lights)`);
  return {
    season, far, town, front, sprites, placed, placedAt, map, R, bulbs, fountainF, tentP, targetP, tvP, brazierP,
    // 받침대 화로의 불 — 겨울엔 트리가 대신 선다
    fires: xmas ? [] : front.braziers,
  };
}

const scenes = Object.fromEntries(SEASONS.filter((s) => !onlySeasons || onlySeasons.includes(s) || !partial).map((s) => [s, drawSeason(s)]));
const base = scenes.autumn ?? Object.values(scenes)[0];

/* ---------- 2. 사람 · 걸을 수 있는 곳 ---------- */

const people = buildPeople(NPCS, SPOTS, SEASONS, log);
for (const s of Object.keys(scenes)) {
  fs.mkdirSync(path.join(OUT, s), { recursive: true });
  P.save(people.sheets[s], path.join(OUT, s, 'people.png'));
}
log(`people sheet ${people.sheets[SEASONS[0]].w}x${people.sheets[SEASONS[0]].h}`);

const nav = buildNav([...BLOCKS, ...NPCS.filter((n) => n.mode === 'post').map((n) => ({ ell: [n.x, n.y, 7, 3.5] }))]);
const pois = [...POIS, ...base.town.doors.map((x) => ({ x, y: 304, zone: 'terrace', face: 'N', tag: 'door' }))];
for (const p of pois) if (!walkable(nav, p.x, p.y)) throw new Error(`POI not walkable: ${p.x},${p.y}`);
for (const n of NPCS) if (n.mode === 'walk' && !walkable(nav, n.x, n.y)) throw new Error(`NPC starts off the walk map: ${n.kind} ${n.x},${n.y}`);
log(`nav ${nav.cols}x${nav.rows}, ${pois.length} pois`);

/* ---------- 3. 시트 자리 배정 (모든 계절 · 시간대가 같은 좌표를 쓴다) ---------- */

const SHEET_W = 1024;
const union = {};
for (const sc of Object.values(scenes))
  for (const [n, s] of Object.entries(sc.sprites)) {
    const u = union[n];
    if (u && (u.w !== s.w || u.h !== s.h || u.ax !== s.ax || u.ay !== s.ay)) throw new Error(`sprite ${n} differs between seasons`);
    union[n] = { w: s.w, h: s.h, ax: s.ax, ay: s.ay };
  }
const rects = {};
{
  const names = Object.keys(union).sort((a, b) => union[b].h - union[a].h || (a < b ? -1 : 1));
  let x = 0, y = 0, rowH = 0;
  for (const n of names) {
    const s = union[n];
    if (x + s.w + 1 > SHEET_W) {
      x = 0;
      y += rowH + 1;
      rowH = 0;
    }
    rects[n] = [x, y, s.w, s.h, s.ax, s.ay];
    x += s.w + 1;
    rowH = Math.max(rowH, s.h);
  }
  rects.__h = y + rowH;
}
const SHEET_H = rects.__h;
delete rects.__h;
log(`sheet ${SHEET_W}x${SHEET_H}, ${Object.keys(rects).length} sprites`);

/* ---------- 4. 계절 · 시간대별로 굽기 ---------- */

const over = (dst, src, ox = 0, oy = 0) => {
  for (let y = 0; y < src.h; y++) {
    const Y = y + oy;
    if (Y < 0 || Y >= dst.h) continue;
    for (let x = 0; x < src.w; x++) {
      const X = x + ox;
      if (X < 0 || X >= dst.w) continue;
      const c = src.px[y * src.w + x], a = c >>> 24;
      if (!a) continue;
      if (a === 255) dst.px[Y * dst.w + X] = c;
      else {
        const d = dst.px[Y * dst.w + X];
        dst.px[Y * dst.w + X] = d >>> 24 ? P.col(P.mix(P.unpack(d), P.unpack(c), a / 255)) : c;
      }
    }
  }
};
const hexOf = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/** 사람 한 명을 미리보기에 — 시간대 색으로 칠한 사람 시트에서 잘라 붙인다 */
function drawPersonTo(dst, sheet, name, x, y, flip) {
  const r = people.rects[name];
  if (!r) throw new Error(`no person frame ${name}`);
  const [sx, sy, w, h, ax, ay] = r;
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const c = sheet.px[(sy + j) * sheet.w + sx + i];
      if (!(c >>> 24)) continue;
      const X = flip ? x + ax - i : x - ax + i;
      dst.pset(X, y - ay + j, c);
    }
}
const npcFrame = (n) => {
  const b = N.bucketAtY(n.y);
  const [dir, flip] = FACE[n.face ?? 'S'];
  return [`${n.kind}_${b}_${dir}_i0`, flip];
};
/** 미리보기용 전구 — 밤이면 밝게 */
const BULB = [[255, 238, 180], [255, 74, 74], [92, 255, 122], [255, 210, 74], [106, 184, 255]];
function drawBulbs(dst, list, ox, oy, lit) {
  for (const [x, y, c] of list) {
    const col = lit ? BULB[c] : BULB[c].map((v) => v * 0.62);
    dst.pset(x + ox, y + oy, col);
    if (lit) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) dst.pset(x + ox + dx, y + oy + dy, P.mix(P.unpack(dst.get(x + ox + dx, y + oy + dy)), BULB[c], 0.35));
  }
}

const seasonInfo = {};
for (const [season, sc] of Object.entries(scenes)) {
  const xmas = season === 'christmas';
  const phaseInfo = {};
  const dir = path.join(OUT, season);
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, ph0] of Object.entries(PHASES)) {
    if (onlyPhases && !onlyPhases.includes(name)) continue;
    const ph = xmas ? SE.winterPhase(ph0, name) : ph0;
    const { R, map, sprites, placedAt } = sc;
    // 하늘
    const sk = sky(ph, name);
    P.save(P.crop(sk.buf, 0, 0, W, SKY_H), path.join(dir, `sky-${name}.png`));
    const clouds = fx.cloudStrip(ph, { dawn: 5, morning: 9, noon: 13, afternoon: 17, evening: 21, night: 25 }[name], xmas ? { amount: 0.6 } : {});
    P.save(clouds, path.join(dir, `clouds-${name}.png`));

    // 뒤 배경
    const back = new P.Buf(W, H);
    over(back, grade(R.far2, ph, 0, 0, { haze: 0.76 }));
    over(back, grade(R.far1b, ph, 0, 0, { haze: 0.62 }));
    over(back, grade(R.far1, ph, 0, 0, { haze: 0.48 }));
    over(back, grade(R.hill, ph, 0, 0, { haze: 0.3 }));
    over(back, grade(R.terrace, ph, 0, 0, { map }));
    over(back, grade(R.main, ph, 0, 0, { map }));
    P.save(P.crop(back, 0, 0, W, BACK_H), path.join(dir, `back-${name}.png`));

    // 앞 배경
    const frontG = grade(R.front, ph, 0, 0, { map });
    P.save(P.crop(frontG, 0, FRONT_Y, W, H - FRONT_Y), path.join(dir, `front-${name}.png`));

    // 시트 — 이 계절에 없는 그림의 자리는 비워 둔다
    const sheet = new P.Buf(SHEET_W, SHEET_H);
    const graded = {};
    for (const [n, s] of Object.entries(sprites)) {
      let g;
      if (s.emissive) g = s.r.col;
      else {
        const b = n.replace(/_\d+$/, '');
        const at = placedAt[b] ?? placedAt[n];
        g = grade(s.r, ph, at ? at[0] : 0, at ? at[1] : 0, { map: at ? map : null, haze: s.haze });
      }
      graded[n] = g;
      over(sheet, g, rects[n][0], rects[n][1]);
    }
    P.save(sheet, path.join(dir, `sprites-${name}.png`));

    // 반짝일 별: 뒤 배경에 가리지 않는 것만
    const stars = sk.stars.filter(([x, y]) => y < 250 && !(back.px[y * W + x] >>> 24)).slice(0, 46);
    const particle = xmas
      ? [[236, 242, 255], [255, 255, 255], [214, 226, 246], [246, 248, 255]].map((c) => hexOf(tint(c, { ...ph, lo: ph.lo.map((v) => Math.max(v, 0.62)), hi: ph.hi.map((v) => Math.max(v, 0.8)) })))
      : [M.leafOrange, M.leafRed, M.leafGold, M.leafOrange].map((m, i) => hexOf(tint(MATS[m][3 + (i % 2)], ph)));
    phaseInfo[name] = {
      lamps: ph.lamps,
      leaves: particle,
      hand: hexOf(ph.lamps > 0.3 ? [43, 29, 18] : tint([43, 29, 18], ph)),
      smoke: hexOf(tint([226, 222, 214], ph)),
      shadow: ph.lamps > 0.9 ? 0.34 : 0.24,
      stars,
      people: gradeColors(people.colors[season], ph),
    };
    const peopleG = recolor(people.sheets[season], people.colors[season], phaseInfo[name].people);

    // ----- 미리보기: 화면과 같은 순서로 겹쳐 본다 -----
    const lit = ph.lamps > 0.3;
    const pv = new P.Buf(W, H);
    over(pv, sk.buf);
    over(pv, clouds, 180, 0);
    over(pv, clouds, 180 - W, 0);
    over(pv, graded.dragon_1, 610, 30);
    over(pv, back);
    over(pv, graded.fall_0, sc.far.fall.x - 2, sc.far.fall.y0);
    over(pv, graded.flag_0, sc.town.flag[0], sc.town.flag[1] - 2);
    drawBulbs(pv, sc.bulbs.back, 0, 0, lit);
    const drawNpc = (n) => {
      const [fname, flip] = npcFrame(n);
      drawPersonTo(pv, peopleG, fname, n.x, n.y, flip);
    };
    const isTerrace = (y) => y < L.STAIR.topY;
    NPCS.filter((n) => isTerrace(n.y)).forEach(drawNpc);
    over(pv, frontG);
    drawBulbs(pv, sc.bulbs.front, 0, 0, lit);
    for (const [bx, by] of sc.fires) over(pv, graded.flame_2, bx - 15, by - 42);
    const items = [
      ...sc.placed.map((p) => ({
        y: p.y,
        draw: () => {
          const n = p.frames ? `${p.sprite}_0` : p.sprite;
          over(pv, graded[n], p.x - sprites[n].ax, p.y - sprites[n].ay);
          const bl = sc.bulbs.sprites[p.sprite];
          if (bl) drawBulbs(pv, bl, p.x - sprites[n].ax, p.y - sprites[n].ay, lit);
        },
      })),
      ...NPCS.filter((n) => !isTerrace(n.y)).map((n) => ({ y: n.y, draw: () => drawNpc(n) })),
      ...Object.entries(people.heroes).map(([id, h]) => ({ y: h.sortY ?? SPOTS[id].y, draw: () => drawPersonTo(pv, peopleG, h.script[0][0], SPOTS[id].x, SPOTS[id].y, false) })),
    ].sort((a, b) => a.y - b.y);
    for (const it of items) it.draw();
    {
      const bp = sc.placed.find((p) => p.id === 'brazier'), s = sprites.brazier;
      over(pv, graded.flame_4, bp.x - s.ax + sc.brazierP.fire[0] - 15, bp.y - s.ay + sc.brazierP.fire[1] - 42);
    }
    P.save(pv, path.join(PREVIEW, `plaza-${season}-${name}.png`));
    log(`${season} ${name} baked`);
  }
  seasonInfo[season] = {
    snow: xmas,
    props: sc.placed,
    fires: sc.fires,
    bulbs: sc.bulbs,
    peopleColors: people.colors[season],
    phases: phaseInfo,
  };
}

/* ---------- 5. 좌표 내보내기 ---------- */

if (!partial) {
  const sc = base;
  const at = (id) => sc.placed.find((p) => p.id === id);
  const spr = (n) => sc.sprites[n];
  const tv = at('tv'), tvS = spr('tv');
  const fo = at('fountain'), foS = spr('fountain_0');
  const tg = at('target'), tgS = spr('target');
  const br = at('brazier'), brS = spr('brazier');
  const te = at('tent'), teS = spr('tent');
  const art = {
    w: W, h: H, backH: BACK_H, frontY: FRONT_Y, skyH: SKY_H, sheet: [SHEET_W, SHEET_H],
    /** 이 y 보다 위(윗마당)에 선 사람은 난간 뒤에 그린다 */
    layerY: L.STAIR.topY,
    sprites: rects,
    npcs: NPCS,
    pois,
    nav: { cell: nav.cell, cols: nav.cols, rows: nav.rows, bits: nav.bits },
    people: {
      sheet: [people.sheets[SEASONS[0]].w, people.sheets[SEASONS[0]].h],
      rects: people.rects,
      anchors: people.anchors,
      kinds: people.kinds,
      scales: N.SCALES,
      cycle: N.CYCLE,
      yc: +YC.toFixed(4),
      face: FACE,
    },
    spots: SPOTS,
    heroes: people.heroes,
    clock: sc.town.clock,
    flag: [sc.town.flag[0], sc.town.flag[1] - 2],
    smoke: sc.town.smoke,
    fall: [sc.far.fall.x - 2, sc.far.fall.y0],
    benchFire: [br.x - brS.ax + sc.brazierP.fire[0], br.y - brS.ay + sc.brazierP.fire[1]],
    screen: { x: tv.x - tvS.ax + sc.tvP.screen.x, y: tv.y - tvS.ay + sc.tvP.screen.y, w: sc.tvP.screen.w, h: sc.tvP.screen.h },
    bull: [tg.x - tgS.ax + sc.targetP.bull[0], tg.y - tgS.ay + sc.targetP.bull[1]],
    statue: { x: fo.x, baseY: fo.y - foS.ay + sc.fountainF[0].plinthTop },
    twinkles: sc.tentP.stars.map(([x, y]) => [te.x - teS.ax + x, te.y - teS.ay + y]),
    seasons: seasonInfo,
  };
  const ts = `// 이 파일은 art/plaza/build.js 가 만든다 (npm run art). 손으로 고치지 말 것.\n// 광장 그림 시트의 좌표와, 소품 · 마을 사람 · 주인공의 자리 · 계절별 장식.\n\nexport const PLAZA_ART = ${JSON.stringify(art, null, 1)} as const;\n`;
  fs.writeFileSync(path.join(ROOT, 'lib', 'plazaArt.ts'), ts);
  log('lib/plazaArt.ts written');
}
let total = 0;
for (const s of fs.readdirSync(OUT)) {
  const p = path.join(OUT, s);
  if (fs.statSync(p).isDirectory()) for (const f of fs.readdirSync(p)) total += fs.statSync(path.join(p, f)).size;
}
log(`public/art/plaza: ${(total / 1024).toFixed(0)} KB`);
