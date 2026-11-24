// 광장에 놓이는 것들의 자리 — 소품, 마을 사람, 주인공이 설 곳.
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
 * layer: 'terrace' = 윗마당(난간 뒤, 다리가 난간에 가린다), 'court' = 아래 광장(y 순서대로 겹친다)
 * from · to 가 있으면 그 사이를 오가고, 없으면 제자리에서 이야기한다.
 */
const NPCS = [
  // ---- 윗마당: 난간 뒤를 오가는 사람들 ----
  { kind: 'peasant', layer: 'terrace', x: 80, y: 313, from: 14, to: 384, speed: 12, dir: 1 },
  { kind: 'woman', layer: 'terrace', x: 300, y: 312, from: 60, to: 392, speed: 9, dir: -1 },
  { kind: 'guard', layer: 'terrace', x: 220, y: 314, from: 120, to: 396, speed: 7, dir: 1 },
  { kind: 'monk', layer: 'terrace', x: 640, y: 312, from: 566, to: 930, speed: 8, dir: 1 },
  { kind: 'merchant', layer: 'terrace', x: 820, y: 313, from: 580, to: 946, speed: 10, dir: -1 },
  { kind: 'elf', layer: 'terrace', x: 720, y: 314, from: 570, to: 900, speed: 13, dir: 1 },
  { kind: 'maid', layer: 'terrace', x: 180, y: 311, dir: 1, chat: 0.3 },
  { kind: 'farmer', layer: 'terrace', x: 196, y: 311, dir: -1, chat: 1.4 },
  { kind: 'guard', layer: 'terrace', x: 428, y: 312, dir: 1, chat: 9 },
  { kind: 'guard', layer: 'terrace', x: 532, y: 312, dir: -1, chat: 9 },
  // ---- 계단 ----
  { kind: 'noble', layer: 'court', x: 452, y: 372, dir: 1, chat: 2.2, size: 'mid' },
  { kind: 'elder', layer: 'court', x: 472, y: 374, dir: -1, chat: 0.8, size: 'mid' },
  // ---- 좌판 상인 (판매대 뒤) ----
  { kind: 'woman', layer: 'court', x: 300, y: 420, dir: 1, chat: 1.1, size: 'mid' },
  { kind: 'baker', layer: 'court', x: 676, y: 420, dir: -1, chat: 2.6, size: 'mid' },
  // ---- 광장 안쪽 (벽 가까이) ----
  { kind: 'mercenary', layer: 'court', x: 400, y: 404, from: 356, to: 400, speed: 0, dir: 1, chat: 1.9, size: 'mid' },
  { kind: 'dwarf', layer: 'court', x: 384, y: 406, dir: 1, chat: 0.5, size: 'mid' },
  { kind: 'peasant', layer: 'court', x: 560, y: 398, from: 596, to: 800, speed: 11, dir: 1, size: 'mid' },
  { kind: 'hooded', layer: 'court', x: 60, y: 404, from: 22, to: 250, speed: 8, dir: 1, size: 'mid' },
  { kind: 'witch', layer: 'court', x: 236, y: 432, dir: 1, chat: 3.1, size: 'mid' },
  { kind: 'orc', layer: 'court', x: 612, y: 438, dir: 1, chat: 0.2, size: 'mid' },
  { kind: 'merchant', layer: 'court', x: 630, y: 440, dir: -1, chat: 1.5, size: 'mid' },
  { kind: 'maid', layer: 'court', x: 720, y: 444, from: 590, to: 730, speed: 10, dir: -1, size: 'mid' },
  { kind: 'farmer', layer: 'court', x: 364, y: 446, from: 350, to: 396, speed: 7, dir: 1, size: 'mid' },
  // ---- 광장 앞쪽 ----
  { kind: 'dwarf', layer: 'court', x: 344, y: 494, dir: -1, chat: 0.9 },
  { kind: 'elf', layer: 'court', x: 584, y: 478, from: 566, to: 660, speed: 9, dir: 1 },
  { kind: 'guard', layer: 'court', x: 400, y: 512, from: 290, to: 440, speed: 8, dir: 1 },
  { kind: 'noble', layer: 'court', x: 560, y: 516, from: 524, to: 690, speed: 6, dir: 1 },
  { kind: 'mercenary', layer: 'court', x: 820, y: 484, dir: -1, chat: 2.0 },
  { kind: 'orc', layer: 'court', x: 838, y: 486, dir: -1, chat: 0.6, flip: false },
  { kind: 'monk', layer: 'court', x: 632, y: 534, from: 250, to: 700, speed: 7, dir: -1 },
  { kind: 'peasant', layer: 'court', x: 60, y: 496, from: 14, to: 70, speed: 6, dir: 1 },
];

/**
 * 주인공(메뉴 캐릭터)이 서는 자리 — lib/plazaLayout.ts 로 내보낸다.
 * 좌표는 화면 기준, scale 은 뒤에 있을수록 작게.
 */
const SPOTS = {
  board: { x: 376, y: 306, scale: 0.94, place: '큰 계단 난간 위', idle: 'perch' },
  'weekly-gg': { x: 288, y: 478, scale: 1.06, place: '분수 옆 게임 소파', altSprite: 'woowang-couch-press', idle: 'rest' },
  events: { x: 112, y: 458, scale: 1.1, place: '점성술 천막', idle: 'read' },
  join: { x: 792, y: 442, scale: 1.08, place: '성벽 아래 과녁장', altSprite: 'archer-draw', idle: 'shoot' },
  showcase: { x: 690, y: 518, scale: 1.2, flip: true, place: '마법 두루마리 좌판', idle: 'browse' },
  about: { x: 132, y: 530, scale: 1.2, place: '화톳불 옆 벤치', idle: 'rest' },
  gallery: { x: 480, y: 534, scale: 1.16, place: '분수 앞', altSprite: 'bard-strum', idle: 'stroll' },
};

module.exports = { PROPS, NPCS, SPOTS };
