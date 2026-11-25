// 걸을 수 있는 곳의 지도 — 4픽셀 칸마다 걸을 수 있는지(1) 없는지(0).
// 윗마당 띠 · 큰 계단 · 아래 광장을 이어 붙이고, 소품 · 주인공 · 제자리에 선 사람의 바닥을 뺀다.
// 화면(PlazaScene)은 이 지도 위에서 길을 찾아(A*) 마을 사람을 걷게 한다.
const L = require('./layout');
const { stairX } = require('./ground');

const CELL = 4;
const W = 960, H = 540;
/** 구역의 화면 y 범위 — 크기 단계를 미리 구울 때도 쓴다 */
const ZONES = {
  terrace: [303, 316],
  court: [388, 538],
  any: [303, 538],
};

function inBlock(b, x, y) {
  if (b.rect) return x >= b.rect[0] && x <= b.rect[2] && y >= b.rect[1] && y <= b.rect[3];
  const [cx, cy, rx, ry] = b.ell;
  return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
}

/** 이 자리가 원래 바닥인가 (막힌 것은 따지지 않는다) */
function floorAt(x, y) {
  if (y >= ZONES.terrace[0] && y <= ZONES.terrace[1] && x >= 8 && x <= W - 8) return true;
  if (y > ZONES.terrace[1] && y <= L.STAIR.botY + 2) {
    const [x0, x1] = stairX(Math.max(L.STAIR.topY, y));
    if (x >= x0 + 8 && x <= x1 - 8) return true;
  }
  return y >= ZONES.court[0] && y <= ZONES.court[1] && x >= 6 && x <= W - 6;
}

function buildNav(blocks) {
  const cols = W / CELL, rows = Math.ceil(H / CELL);
  const walk = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = c * CELL + CELL / 2, y = r * CELL + CELL / 2;
      if (!floorAt(x, y)) continue;
      if (blocks.some((b) => inBlock(b, x, y))) continue;
      walk[r * cols + c] = 1;
    }
  // 1비트씩 묶어 base64 로
  const bytes = Buffer.alloc(Math.ceil(walk.length / 8));
  walk.forEach((v, i) => {
    if (v) bytes[i >> 3] |= 1 << (i & 7);
  });
  return { cell: CELL, cols, rows, bits: bytes.toString('base64'), walk };
}

const walkable = (nav, x, y) => {
  const c = Math.floor(x / nav.cell), r = Math.floor(y / nav.cell);
  return c >= 0 && r >= 0 && c < nav.cols && r < nav.rows && nav.walk[r * nav.cols + c] === 1;
};

module.exports = { buildNav, walkable, ZONES, CELL };
