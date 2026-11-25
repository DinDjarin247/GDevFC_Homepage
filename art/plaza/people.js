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
 * 굽기. npcs · spots 는 placement.js 의 것.
 * 반환: sheet(Buf) · rects · anchors · heroes(대본) · kinds(사람별 구운 크기 단계) · colors(낮 색 목록)
 */
function buildPeople(npcs, spots, log = () => {}) {
  checkGait();
  const items = {};
  const anchors = {};
  const trimmed = (name, r) => {
    const bb = bounds(r.buf);
    if (!bb) return;
    const buf = P.crop(r.buf, bb.x0, bb.y0, bb.x1 - bb.x0 + 1, bb.y1 - bb.y0 + 1);
    items[name] = { buf, w: buf.w, h: buf.h, ax: r.ax - bb.x0, ay: r.ay - bb.y0 };
    const an = r.anchors && Object.keys(r.anchors).length ? r.anchors : null;
    if (an) anchors[name] = an;
  };

  const need = requirements(npcs);
  const kinds = {};
  let count = 0;
  for (const { kind, b, set } of need.values()) {
    (kinds[kind] ??= []).push(b);
    for (const key of set) {
      const [dir, anim] = key.split('_');
      trimmed(`${kind}_${b}_${dir}_${anim}`, N.frame(kind, b, dir, anim));
      count++;
    }
  }
  for (const k of Object.keys(kinds)) kinds[k].sort();
  log(`villagers: ${count} frames (${need.size} kind-size pairs)`);

  const H = buildHeroes(spots);
  for (const [name, f] of Object.entries(H.frames)) trimmed(name, f);
  log(`heroes: ${Object.keys(H.frames).length} frames`);

  const WIDTH = 1024;
  const { rects, height } = pack(items, WIDTH);
  const sheet = new P.Buf(WIDTH, height);
  for (const [n, [x, y]] of Object.entries(rects)) sheet.sprite(items[n].buf, x, y);

  // 쓰인 색 목록 (낮 색)
  const set = new Set();
  for (const c of sheet.px) if (c >>> 24) set.add(c & 0xffffff);
  const colors = [...set].sort((a, b) => a - b);
  return { sheet, rects, anchors, heroes: H.defs, kinds, colors };
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
