// 윗마당의 건물들 — 큰 계단 위, 난간 뒤에 늘어선 앞줄.
//
// 광장은 두 층이다. 화면 앞쪽이 분수가 있는 아래 광장이고, 가운데 큰 계단을 오르면
// 시계탑 문루가 선 윗마당이 나온다. 여기서는 윗마당에 발을 딛는 건물을 세운다.
const { W, H, M, Mat } = require('./kit');
const { house } = require('./buildings');
const { townHall } = require('./landmarks');
const L = require('./layout');

/** 앞줄 집 — [1층 왼쪽 x, 설정]. 왼쪽 절반은 오른쪽 옆면이, 오른쪽 절반은 왼쪽 옆면이 보인다 */
const FRONT = {
  a: [
    -16,
    {
      w: 98, seed: 21, depth: 22, side: 'right', plaster: 'plasterSage',
      floors: [
        { h: 38, wall: 'stone', bays: 5, win: [1, 3], winH: 13, winY: 10, winArch: true, door: { bay: 4, h: 20 } },
        { h: 34, wall: 'timber', jetty: 3, pattern: 'x', bays: 6, win: [1, 2, 4], winH: 13, shutters: 'clothBrown' },
        { h: 30, wall: 'timber', jetty: 2, pattern: 'studs', bays: 6, win: [0, 3, 5], winH: 11 },
      ],
      roof: { type: 'eave', h: 36, m: 'roofSlate', dormers: [0.5], chimneys: [0.82] },
    },
  ],
  tavern: [
    94,
    {
      w: 146, seed: 8, depth: 30, side: 'right', plaster: 'plaster', litChance: 0.9,
      floors: [
        { h: 42, wall: 'stone', bays: 7, win: [0, 1, 5, 6], winH: 15, winY: 11, winW: 12, lattice: true, door: { bay: 3, w: 16, h: 26, arched: true, lit: true } },
        { h: 38, wall: 'timber', jetty: 3, pattern: 'diag', bays: 8, win: [1, 2, 4, 5, 7], winH: 14, box: [1, 4, 7] },
      ],
      roof: { type: 'eave', h: 54, m: 'roofTerra', dormers: [0.22, 0.5, 0.78], chimneys: [0.12, 0.9], moss: 0.1 },
      sign: { icon: 'mug', at: 'right', y: 36 },
      lantern: { u: 0.36, h: 28, dir: -1 },
    },
  ],
  b: [
    284,
    {
      w: 70, seed: 34, depth: 20, side: 'right', plaster: 'plasterRose',
      floors: [
        { h: 36, wall: 'timber', pattern: 'studs', bays: 4, win: [0, 3], winH: 12, door: { bay: 2, h: 20 } },
        { h: 34, wall: 'timber', jetty: 3, pattern: 'curve', bays: 5, win: [1, 3], winH: 13, shutters: 'clothTeal', box: [1, 3] },
      ],
      roof: { type: 'gable', h: 42, m: 'roofPlum', chimneys: [0.55] },
      gable: { pattern: 'x' },
      ivy: { side: 'left', h: 46, w: 26 },
    },
  ],
  s1: [
    620,
    {
      w: 84, seed: 55, depth: 22, side: 'left', plaster: 'plasterOchre',
      floors: [
        { h: 38, wall: 'stone', bays: 5, shop: { bay0: 0, bay1: 2, awning: ['clothGreen', 'clothCream'], goods: [M.clothGold, M.hay, M.woodPale], top: 10, riser: 8 }, door: { bay: 4, h: 20, lit: true } },
        { h: 34, wall: 'timber', jetty: 3, pattern: 'herring', bays: 6, win: [1, 4], winH: 13, box: true },
      ],
      roof: { type: 'gable', h: 44, m: 'roofBrown', chimneys: [0.6] },
      gable: { pattern: 'chevron' },
      sign: { icon: 'loaf', at: 'left', y: 32 },
    },
  ],
  s2: [
    714,
    {
      w: 98, seed: 62, depth: 26, side: 'left', plaster: 'plaster',
      floors: [
        { h: 38, wall: 'stone', bays: 6, shop: { bay0: 3, bay1: 5, awning: ['clothPurple', 'clothCream'], goods: [M.clothBlue, M.clothRed, M.glass], top: 10, riser: 8 }, door: { bay: 1, h: 20, arched: true, lit: true }, win: [0], winH: 12, winY: 11 },
        { h: 34, wall: 'timber', jetty: 3, pattern: 'x', bays: 6, win: [0, 2, 3, 5], winH: 13, shutters: 'clothRed', patOdd: 1 },
        { h: 30, wall: 'timber', jetty: 2, pattern: 'diag', bays: 6, win: [1, 4], winH: 11 },
      ],
      roof: { type: 'eave', h: 38, m: 'roofTeal', dormers: [0.3, 0.7], chimneys: [0.5] },
      lantern: { u: 0.3, h: 26, dir: 1 },
    },
  ],
  s3: [
    824,
    {
      w: 72, seed: 71, depth: 20, side: 'left', plaster: 'plasterBlue',
      floors: [
        { h: 36, wall: 'timber', pattern: 'studs', bays: 4, win: [0, 3], winH: 12, door: { bay: 1, h: 20 } },
        { h: 34, wall: 'timber', jetty: 3, pattern: 'x', bays: 5, win: [1, 3], winH: 13, box: [1] },
      ],
      roof: { type: 'gable', h: 42, m: 'roofTerra' },
      gable: { pattern: 'studs' },
      sign: { icon: 'boot', at: 'left', y: 30 },
      ivy: { side: 'right', h: 50, w: 30 },
    },
  ],
  c: [
    906,
    {
      w: 90, seed: 83, depth: 20, side: 'left', plaster: 'plasterOchre',
      floors: [
        { h: 38, wall: 'stone', bays: 5, win: [0, 2], winH: 13, winY: 10, door: { bay: 1, h: 20 } },
        { h: 36, wall: 'timber', jetty: 3, pattern: 'herring', bays: 5, win: [0, 2, 4], winH: 13, shutters: 'clothGreen' },
      ],
      roof: { type: 'eave', h: 40, m: 'roofSlate', dormers: [0.4] },
    },
  ],
};

function buildTown() {
  const main = new Mat(W, H);
  const smoke = [];
  /** 1층 문의 가운데 x — 윗마당 사람이 드나든다 */
  const doors = [];
  const put = (name) => {
    const [x, spec] = FRONT[name];
    const b = house(spec);
    main.blit(b.mat, x - b.ox, L.TERRACE_Y - b.oy);
    for (const d of b.doors) doors.push(Math.round(x + d.x));
    for (const [sx, sy] of b.smoke) smoke.push([x - b.ox + sx, L.TERRACE_Y - b.oy + sy]);
  };
  // 가운데에서 먼 집부터 — 가운데 쪽 집이 옆집의 옆벽을 가린다
  ['a', 'tavern', 'b', 'c', 's3', 's2', 's1'].forEach(put);
  const hall = townHall();
  const hx = L.CX - hall.ox, hy = L.TERRACE_Y - hall.oy;
  main.blit(hall.mat, hx, hy);
  const clock = [hx + hall.clock[0], hy + hall.clock[1], hall.clock[2]];
  const flag = [hx + hall.flag[0], hy + hall.flag[1]];
  return { main, smoke, clock, flag, doors: doors.sort((a, b) => a - b) };
}

module.exports = { buildTown, FRONT };
