// 광장에 놓이는 것들의 자리 — 소품, 마을 사람, 볼거리, 주인공이 설 곳.
// 좌표는 화면(960x540) 기준이고, (x, y) 는 발이 닿는 바닥이다.
const L = require('./layout');

/** 소품 — sprite 이름과 바닥 기준점. 화면에서는 y 가 큰(앞에 있는) 것이 나중에 그려진다 */
const PROPS = [
  { id: 'treeL', sprite: 'treeL', x: 30, y: 488, frames: 3, fps: 2.2 },
  { id: 'treeR', sprite: 'treeR', x: 936, y: 462, frames: 3, fps: 1.9 },
  { id: 'tent', sprite: 'tent', x: 150, y: 448, shadow: [64, 10] },
  { id: 'stallA', sprite: 'stallFruit', x: 300, y: 432, shadow: [54, 7] },
  { id: 'stallB', sprite: 'stallBread', x: 676, y: 432, shadow: [50, 7] },
  { id: 'target', sprite: 'target', x: 896, y: 440, shadow: [40, 7] },
  { id: 'clutterA', sprite: 'clutter0', x: 96, y: 398, shadow: [42, 6] },
  { id: 'clutterB', sprite: 'clutter2', x: 838, y: 400, shadow: [42, 6] },
  { id: 'fountain', sprite: 'fountain', x: L.FOUNTAIN.x, y: L.FOUNTAIN.y + L.FOUNTAIN.ry + 15, frames: 4, fps: 5 },
  { id: 'tv', sprite: 'tv', x: 200, y: 488, shadow: [26, 5] },
  { id: 'console', sprite: 'console', x: 238, y: 492 },
  { id: 'sofa', sprite: 'sofa', x: 288, y: 486, shadow: [48, 7] },
  { id: 'lampL', sprite: 'lamp', x: 362, y: 502, shadow: [9, 3] },
  { id: 'lampR', sprite: 'lamp', x: 600, y: 502, shadow: [9, 3] },
  { id: 'stallScroll', sprite: 'stallScroll', x: 748, y: 508, shadow: [58, 8] },
  { id: 'brazier', sprite: 'brazier', x: 84, y: 520, shadow: [14, 4] },
  { id: 'bench', sprite: 'bench', x: 176, y: 522, shadow: [56, 6] },
  { id: 'cart', sprite: 'cart', x: 880, y: 520, shadow: [54, 7] },
  { id: 'pumpkins', sprite: 'clutter1', x: 44, y: 548 },
  { id: 'signpost', sprite: 'signpost', x: 934, y: 552 },
];

/**
 * 마을 사람.
 *   mode 'walk' — zone 안의 볼거리(POIS)를 골라 길을 찾아 걸어가고, 거기서 잠시 둘러본 뒤 다음 곳으로 간다.
 *                 zone: 'terrace'(윗마당) · 'court'(아래 광장) · 'any'(큰 계단으로 오르내린다)
 *   mode 'post' — 제자리에 서 있다. face 쪽을 보고, chat 이 있으면 그 박자로 손짓하며 이야기한다.
 * speed 는 몸 크기 1 기준의 걷는 빠르기(픽셀/초) — 화면에서는 거리에 따라 줄어든다.
 */
const NPCS = [
  // ---- 윗마당 ----
  { kind: 'peasant', mode: 'walk', zone: 'terrace', x: 80, y: 312, speed: 22 },
  { kind: 'woman', mode: 'walk', zone: 'terrace', x: 300, y: 311, speed: 18 },
  { kind: 'monk', mode: 'walk', zone: 'terrace', x: 650, y: 312, speed: 16 },
  { kind: 'merchant', mode: 'walk', zone: 'terrace', x: 820, y: 312, speed: 18 },
  { kind: 'elf', mode: 'walk', zone: 'terrace', x: 720, y: 313, speed: 24 },
  { kind: 'maid', mode: 'post', x: 182, y: 311, face: 'E', chat: 0.3 },
  { kind: 'farmer', mode: 'post', x: 198, y: 311, face: 'W', chat: 1.7 },
  { kind: 'guard', mode: 'post', x: 426, y: 313, face: 'S' },
  { kind: 'guard', mode: 'post', x: 534, y: 313, face: 'S' },
  // ---- 큰 계단으로 오르내리는 사람 ----
  { kind: 'noble', mode: 'walk', zone: 'any', x: 462, y: 372, speed: 15 },
  { kind: 'elder', mode: 'walk', zone: 'any', x: 500, y: 314, speed: 13 },
  { kind: 'guard', mode: 'walk', zone: 'any', x: 560, y: 470, speed: 19 },
  // ---- 좌판 상인 (판매대 뒤) ----
  { kind: 'woman', mode: 'post', x: 300, y: 420, face: 'S', chat: 1.1 },
  { kind: 'baker', mode: 'post', x: 676, y: 420, face: 'S', chat: 2.6 },
  // ---- 아래 광장: 이야기하는 사람들 ----
  { kind: 'mercenary', mode: 'post', x: 222, y: 410, face: 'E', chat: 1.9 },
  { kind: 'dwarf', mode: 'post', x: 240, y: 411, face: 'W', chat: 0.5 },
  { kind: 'orc', mode: 'post', x: 604, y: 446, face: 'E', chat: 0.2 },
  { kind: 'merchant', mode: 'post', x: 623, y: 447, face: 'W', chat: 1.5 },
  { kind: 'mercenary', mode: 'post', x: 846, y: 490, face: 'NW', chat: 2.4 },
  { kind: 'peasant', mode: 'post', x: 268, y: 516, face: 'N' },
  // ---- 아래 광장: 돌아다니는 사람들 ----
  { kind: 'peasant', mode: 'walk', zone: 'court', x: 560, y: 398, speed: 22 },
  { kind: 'hooded', mode: 'walk', zone: 'court', x: 60, y: 410, speed: 17 },
  { kind: 'witch', mode: 'walk', zone: 'court', x: 236, y: 460, speed: 15 },
  { kind: 'maid', mode: 'walk', zone: 'court', x: 720, y: 456, speed: 21 },
  { kind: 'farmer', mode: 'walk', zone: 'court', x: 380, y: 452, speed: 17 },
  { kind: 'dwarf', mode: 'walk', zone: 'court', x: 344, y: 520, speed: 16 },
  { kind: 'elf', mode: 'walk', zone: 'court', x: 584, y: 478, speed: 23 },
  { kind: 'monk', mode: 'walk', zone: 'court', x: 640, y: 530, speed: 14 },
  { kind: 'orc', mode: 'walk', zone: 'court', x: 900, y: 490, speed: 18 },
];

/**
 * 볼거리 — 걷는 사람이 찾아가는 곳. face 는 거기 도착해서 바라볼 쪽.
 * 윗마당 집의 문은 build.js 가 건물에서 받아 door 로 덧붙인다 (들어가 잠시 사라졌다가 다시 나온다).
 */
const POIS = [
  // 윗마당
  ...[40, 150, 250, 350, 610, 700, 800, 900].map((x, i) => ({ x, y: 309 + (i % 3) * 3, zone: 'terrace', face: i % 2 ? 'S' : 'SE' })),
  { x: 470, y: 309, zone: 'terrace', face: 'N' },
  // 아래 광장
  { x: 300, y: 446, zone: 'court', face: 'N', tag: 'stall' },
  { x: 322, y: 448, zone: 'court', face: 'N', tag: 'stall' },
  { x: 676, y: 446, zone: 'court', face: 'N', tag: 'stall' },
  { x: 654, y: 448, zone: 'court', face: 'N', tag: 'stall' },
  { x: 386, y: 462, zone: 'court', face: 'E', tag: 'fountain' },
  { x: 574, y: 462, zone: 'court', face: 'W', tag: 'fountain' },
  { x: 480, y: 420, zone: 'court', face: 'S', tag: 'fountain' },
  { x: 440, y: 496, zone: 'court', face: 'N', tag: 'fountain' },
  { x: 236, y: 518, zone: 'court', face: 'N', tag: 'tv' },
  { x: 760, y: 472, zone: 'court', face: 'E', tag: 'archery' },
  { x: 880, y: 474, zone: 'court', face: 'N', tag: 'archery' },
  { x: 760, y: 530, zone: 'court', face: 'N', tag: 'scrolls' },
  { x: 182, y: 466, zone: 'court', face: 'N', tag: 'tent' },
  { x: 438, y: 410, zone: 'court', face: 'S' },
  { x: 524, y: 410, zone: 'court', face: 'S' },
  { x: 60, y: 414, zone: 'court', face: 'S' },
  { x: 160, y: 404, zone: 'court', face: 'S' },
  { x: 780, y: 406, zone: 'court', face: 'S' },
  { x: 920, y: 414, zone: 'court', face: 'S' },
  { x: 800, y: 532, zone: 'court', face: 'N', tag: 'cart' },
  { x: 586, y: 528, zone: 'court', face: 'S' },
  { x: 40, y: 466, zone: 'court', face: 'E' },
];

/** 걸을 수 없는 곳 — 소품 · 주인공 자리의 바닥. rect: [x0, y0, x1, y1], ell: [cx, cy, rx, ry] */
const BLOCKS = [
  { rect: [244, 396, 358, 436] }, // 과일 좌판
  { rect: [628, 396, 726, 436] }, // 빵 좌판
  { rect: [86, 414, 216, 452] }, // 천막
  { ell: [480, 458, 86, 32] }, // 분수
  { rect: [176, 474, 332, 496] }, // TV · 게임기 · 소파
  { ell: [362, 502, 6, 3] }, { ell: [600, 502, 6, 3] }, // 가로등
  { rect: [144, 512, 210, 528] }, // 벤치
  { rect: [826, 504, 934, 526] }, // 건초 수레
  { ell: [84, 520, 11, 5] }, // 화톳불
  { rect: [866, 424, 924, 446] }, // 과녁
  { rect: [800, 430, 872, 450] }, // 화살이 날아가는 길
  { rect: [68, 386, 124, 404] }, { rect: [810, 388, 866, 406] }, // 통 · 상자 더미
  { ell: [30, 488, 13, 6] }, { ell: [936, 462, 13, 6] }, // 나무 밑동
  { rect: [698, 492, 798, 514] }, // 두루마리 좌판
  { rect: [355, 394, 378, 414] }, { rect: [583, 394, 606, 414] }, // 계단 아래 받침대 화로
  // 주인공 자리
  { ell: [142, 530, 14, 6] }, { ell: [86, 450, 14, 7] }, { ell: [792, 442, 14, 7] }, { ell: [690, 518, 14, 6] },
  { rect: [392, 502, 568, 518] }, // 바드가 오가는 길
];

/**
 * 주인공(메뉴 캐릭터)이 서는 자리 — lib/plazaLayout.ts 로 내보낸다.
 * 좌표는 화면 기준, scale 은 같은 자리의 마을 사람보다 얼마나 크게 그릴지(heroes.js 의 HS 와 곱한다).
 */
const SPOTS = {
  board: { x: 376, y: 306, scale: 1.04, place: '큰 계단 난간 위' },
  'weekly-gg': { x: 288, y: 478, scale: 1.06, place: '분수 옆 게임 소파' },
  events: { x: 86, y: 450, scale: 1.06, place: '점성술 천막' },
  join: { x: 792, y: 442, scale: 1.08, place: '성벽 아래 과녁장' },
  showcase: { x: 690, y: 518, scale: 1.2, place: '마법 두루마리 좌판' },
  about: { x: 142, y: 530, scale: 1.12, place: '화톳불 옆 벤치' },
  gallery: { x: 480, y: 510, scale: 1.12, place: '분수 앞' },
};

module.exports = { PROPS, NPCS, POIS, BLOCKS, SPOTS };
