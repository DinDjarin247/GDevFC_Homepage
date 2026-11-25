// 사람 시트 — 마을 사람과 주인공의 모든 프레임을 한 장(people.png)에 모은다.
//
// 시간대마다 따로 굽지 않는다. 사람에게는 등불 빛 지도를 쓰지 않아서 시간대 색이 "색 → 색" 으로만
// 바뀌므로, 낮 색으로 한 장만 굽고 시간대별 색 대응표(palette)를 함께 내보낸다.
// 화면은 그림을 받은 뒤 그 표대로 한 번 칠해 쓴다.
const { P } = require('./kit');
const N = require('./npcs');
const { bounds } = require('./rig');
const { buildHeroes } = require('./heroes');
const { tint } = require('./grade');
const { ZONES } = require('./nav');
const { winterize, WINTER } = require('./season');

/** 바라보는 쪽(8방향) → 구워 둔 방향과 좌우 뒤집기 */
const FACE = { S: ['S', false], SE: ['SE', false], E: ['E', false], NE: ['NE', false], N: ['N', false], NW: ['NE', true], W: ['E', true], SW: ['SE', true] };
const WALK = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7'];

/** 구역의 y 범위가 걸치는 크기 단계들 */
function bucketsFor(zone) {
  const [y0, y1] = ZONES[zone];
  const set = new Set();
  for (let y = y0; y <= y1; y += 2) set.add(N.bucketAtY(y));
  return [...set].sort();
}

/** 어떤 사람 · 크기 · 방향 · 동작이 필요한지 모은다 — 쓰이지 않는 프레임은 굽지 않는다 */
function requirements(npcs) {
  const need = new Map();
  const want = (kind, b, dirs, anims) => {
    const key = `${kind}_${b}`;
    if (!need.has(key)) need.set(key, { kind, b, set: new Set() });
    const e = need.get(key);
    for (const d of dirs) for (const a of anims) e.set.add(`${d}_${a}`);
  };
  for (const n of npcs) {
    if (n.mode === 'post') {
      const [dir] = FACE[n.face ?? 'S'];
      want(n.kind, N.bucketAtY(n.y), [dir], n.chat != null ? ['i0', 'i1', 't0', 't1'] : ['i0', 'i1']);
    } else {
      for (const b of bucketsFor(n.zone)) want(n.kind, b, N.DIR_NAMES, [...WALK, 'i0', 'i1']);
    }
  }
  return need;
}

/** 발이 미끄러지지 않는지 — 디딘 발은 한 프레임마다 정확히 CYCLE/8 만큼 뒤로 가야 한다 */
function checkGait() {
  const d = N.DESIGNS.peasant, D = N.dims(d);
  const zs = WALK.map((_, i) => N.walkSpec(D, d, i / 8).feet[0][2]);
  for (let i = 0; i < 4; i++) {
    const dz = zs[i + 1 === 8 ? 0 : i + 1] - zs[i];
    if (i < 3 && Math.abs(dz + N.CYCLE / 8) > 1e-6) throw new Error(`walk cycle slides: frame ${i} foot moves ${dz}`);
  }
}

/** 프레임들을 한 장에 줄지어 놓는다 (키 큰 것부터) */
function pack(items, width) {
  const order = Object.keys(items).sort((a, b) => items[b].h - items[a].h || (a < b ? -1 : 1));
  const rects = {};
  let x = 0, y = 0, rowH = 0;
  for (const n of order) {
    const it = items[n];
    if (x + it.w > width) {
      x = 0;
      y += rowH + 1;
      rowH = 0;
    }
    rects[n] = [x, y, it.w, it.h, it.ax, it.ay];
    x += it.w + 1;
    rowH = Math.max(rowH, it.h);
  }
  return { rects, height: y + rowH };
}

/**
 * 굽기. npcs · spots 는 placement.js 의 것, seasons 는 계절 목록.
 * 계절마다 옷이 달라도 프레임의 자리(rects)는 하나로 맞춘다 — 두 계절 그림을 모두 품는 상자로 잘라
 * 같은 자리에 놓으므로, 화면은 계절과 상관없이 같은 좌표표를 쓴다.
 * 반환: sheets(계절 → Buf) · rects · anchors · heroes(대본) · kinds(사람별 크기 단계) · colors(계절 → 낮 색 목록)
 */
function buildPeople(npcs, spots, seasons, log = () => {}) {
  checkGait();
  const items = {};
  const anchors = {};
  /** 이름 하나의 계절별 그림 → 모두를 품는 상자로 잘라 둔다 */
  const put = (name, bySeason) => {
    let box = null;
    for (const r of Object.values(bySeason)) {
      const bb = bounds(r.buf);
      if (!bb) continue;
      box = box ? { x0: Math.min(box.x0, bb.x0), y0: Math.min(box.y0, bb.y0), x1: Math.max(box.x1, bb.x1), y1: Math.max(box.y1, bb.y1) } : bb;
    }
    if (!box) return;
    const first = Object.values(bySeason)[0];
    const w = box.x1 - box.x0 + 1, h = box.y1 - box.y0 + 1;
    items[name] = { w, h, ax: first.ax - box.x0, ay: first.ay - box.y0, bufs: {} };
    for (const [season, r] of Object.entries(bySeason)) items[name].bufs[season] = P.crop(r.buf, box.x0, box.y0, w, h);
    const an = first.anchors && Object.keys(first.anchors).length ? first.anchors : null;
    if (an) anchors[name] = an;
  };

  const need = requirements(npcs);
  const kinds = {};
  let count = 0;
  for (const { kind, b, set } of need.values()) {
    (kinds[kind] ??= []).push(b);
    const designs = Object.fromEntries(seasons.map((se) => [se, se === 'christmas' ? winterize(N.DESIGNS[kind], WINTER[kind]) : N.DESIGNS[kind]]));
    for (const key of set) {
      const [dir, anim] = key.split('_');
      put(`${kind}_${b}_${dir}_${anim}`, Object.fromEntries(seasons.map((se) => [se, N.frame(kind, b, dir, anim, designs[se])])));
      count++;
    }
  }
  for (const k of Object.keys(kinds)) kinds[k].sort();
  log(`villagers: ${count} frames x ${seasons.length} seasons (${need.size} kind-size pairs)`);

  const heroSets = Object.fromEntries(seasons.map((se) => [se, buildHeroes(spots, se)]));
  for (const name of Object.keys(heroSets[seasons[0]].frames)) put(name, Object.fromEntries(seasons.map((se) => [se, heroSets[se].frames[name]])));
  log(`heroes: ${Object.keys(heroSets[seasons[0]].frames).length} frames`);

  const WIDTH = 1024;
  const { rects, height } = pack(items, WIDTH);
  const sheets = {}, colors = {};
  for (const se of seasons) {
    const sheet = new P.Buf(WIDTH, height);
    for (const [n, [x, y]] of Object.entries(rects)) sheet.sprite(items[n].bufs[se], x, y);
    sheets[se] = sheet;
    const set = new Set();
    for (const c of sheet.px) if (c >>> 24) set.add(c & 0xffffff);
    colors[se] = [...set].sort((a, b) => a - b);
  }
  return { sheets, rects, anchors, heroes: heroSets[seasons[0]].defs, kinds, colors };
}

/** 시간대의 색 대응 — 낮 색 목록과 같은 순서의 색 목록. 밤에는 사람이 묻히지 않게 조금 밝힌다 */
function gradeColors(colors, ph) {
  const lift = ph.lamps > 0.3 ? 1.22 : 1;
  return colors.map((c) => {
    const base = [c & 255, (c >> 8) & 255, (c >> 16) & 255];
    let g = tint(base, ph);
    if (lift !== 1) g = [Math.min(255, g[0] * lift + 6), Math.min(255, g[1] * lift + 6), Math.min(255, g[2] * lift + 8)];
    return (Math.round(g[0]) | (Math.round(g[1]) << 8) | (Math.round(g[2]) << 16)) >>> 0;
  });
}

/** 시트를 시간대 색으로 칠한 사본 (미리보기용) */
function recolor(sheet, colors, graded) {
  const map = new Map(colors.map((c, i) => [c, graded[i]]));
  const out = new P.Buf(sheet.w, sheet.h);
  for (let i = 0; i < sheet.px.length; i++) {
    const c = sheet.px[i];
    if (!(c >>> 24)) continue;
    out.px[i] = ((c & 0xff000000) | map.get(c & 0xffffff)) >>> 0;
  }
  return out;
}

module.exports = { buildPeople, gradeColors, recolor, FACE, requirements };
