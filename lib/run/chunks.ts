import type { Chunk } from './world';

/**
 * 코스 조각 — 사람이 짠 패턴. 등급(tier)이 오를수록 어렵다.
 *
 * x 는 조각 시작부터의 거리(px, 초당 150px 로 달린다), h 는 땅 위 높이.
 * 장애물: low(한 번 점프) · tall(이단 점프) · hang(슬라이드로 빠져나가기) · pit(구덩이)
 * 모든 조각은 앞뒤 40px 이상을 평지로 두어 이어 붙여도 안전하다.
 *
 * 새 조각을 추가하면 scripts/verify-run-chunks.mjs 로 한 대도 안 맞고 지나갈 수
 * 있는지 꼭 확인한다 (1/15초 간격 입력만으로).
 */
export const CHUNKS: Chunk[] = [
  // ---------- 1등급 — 하나씩 배운다 ----------
  {
    id: 't1-coins',
    tier: 1,
    len: 360,
    els: [{ t: 'coins', x: 40, h: 8, n: 14, gap: 20 }],
  },
  {
    id: 't1-low',
    tier: 1,
    len: 380,
    els: [
      { t: 'low', x: 200 },
      { t: 'coins', x: 150, h: 10, n: 7, gap: 18, arc: 46 },
    ],
  },
  {
    id: 't1-two-low',
    tier: 1,
    len: 460,
    els: [
      { t: 'low', x: 150 },
      { t: 'low', x: 330 },
      { t: 'coins', x: 100, h: 10, n: 6, gap: 18, arc: 44 },
      { t: 'coins', x: 280, h: 10, n: 6, gap: 18, arc: 44 },
    ],
  },
  {
    id: 't1-hang',
    tier: 1,
    len: 400,
    els: [
      { t: 'hang', x: 210, w: 30 },
      // 슬라이드 높이에 학점 줄 — 엎드려 지나가면 먹는다
      { t: 'coins', x: 170, h: 5, n: 6, gap: 18 },
    ],
  },
  {
    id: 't1-pit',
    tier: 1,
    len: 380,
    els: [
      { t: 'pit', x: 190, w: 46 },
      { t: 'coins', x: 160, h: 12, n: 6, gap: 20, arc: 40 },
    ],
  },
  {
    id: 't1-plat',
    tier: 1,
    len: 400,
    els: [
      { t: 'plat', x: 130, h: 40, w: 140 },
      { t: 'coins', x: 150, h: 48, n: 6, gap: 20 },
    ],
  },

  // ---------- 2등급 — 두 가지를 섞는다 ----------
  {
    id: 't2-low-hang',
    tier: 2,
    len: 480,
    els: [
      { t: 'low', x: 130 },
      { t: 'hang', x: 320, w: 34 },
      { t: 'coins', x: 80, h: 10, n: 6, gap: 18, arc: 44 },
      { t: 'coins', x: 290, h: 5, n: 5, gap: 18 },
    ],
  },
  {
    id: 't2-pit-low',
    tier: 2,
    len: 480,
    els: [
      { t: 'pit', x: 140, w: 56 },
      { t: 'low', x: 340 },
      { t: 'coins', x: 120, h: 12, n: 6, gap: 20, arc: 42 },
    ],
  },
  {
    id: 't2-tall',
    tier: 2,
    len: 440,
    els: [
      { t: 'tall', x: 230 },
      { t: 'coins', x: 160, h: 20, n: 9, gap: 18, arc: 80 },
    ],
  },
  {
    id: 't2-stairs',
    tier: 2,
    len: 460,
    els: [
      { t: 'plat', x: 100, h: 40, w: 90 },
      { t: 'plat', x: 240, h: 76, w: 100 },
      { t: 'coins', x: 110, h: 48, n: 4, gap: 20 },
      { t: 'coins', x: 250, h: 84, n: 5, gap: 20 },
    ],
  },
  {
    id: 't2-hang-pair',
    tier: 2,
    len: 440,
    els: [
      { t: 'hang', x: 140, w: 30 },
      { t: 'hang', x: 270, w: 30 },
      { t: 'coins', x: 120, h: 5, n: 10, gap: 18 },
    ],
  },

  // ---------- 3등급 — 판단이 필요하다 ----------
  {
    id: 't3-pit-wide',
    tier: 3,
    len: 460,
    els: [
      { t: 'pit', x: 160, w: 100 },
      { t: 'coins', x: 140, h: 16, n: 8, gap: 20, arc: 80 },
    ],
  },
  {
    id: 't3-upper-route',
    tier: 3,
    len: 520,
    els: [
      // 아래 길은 낮은 장애물 둘, 위 길은 평탄 — 위로 올라타면 편하다
      { t: 'low', x: 170 },
      { t: 'low', x: 330 },
      { t: 'plat', x: 120, h: 52, w: 280 },
      { t: 'coins', x: 140, h: 60, n: 12, gap: 20 },
    ],
  },
  {
    id: 't3-tall-hang',
    tier: 3,
    len: 520,
    els: [
      { t: 'tall', x: 160 },
      { t: 'hang', x: 360, w: 34 },
      { t: 'coins', x: 100, h: 20, n: 8, gap: 18, arc: 80 },
    ],
  },
  {
    id: 't3-stepping-stone',
    tier: 3,
    len: 500,
    els: [
      { t: 'pit', x: 120, w: 240 },
      { t: 'plat', x: 200, h: 36, w: 72 },
      { t: 'coins', x: 210, h: 44, n: 4, gap: 18 },
    ],
  },
  {
    id: 't3-rhythm',
    tier: 3,
    len: 480,
    els: [
      { t: 'low', x: 120 },
      { t: 'low', x: 230 },
      { t: 'low', x: 340 },
      { t: 'coins', x: 90, h: 10, n: 14, gap: 20, arc: 0 },
    ],
  },

  // ---------- 4등급 — 몰아친다 ----------
  {
    id: 't4-pit-hang',
    tier: 4,
    len: 520,
    els: [
      { t: 'pit', x: 120, w: 70 },
      { t: 'hang', x: 300, w: 36 },
      { t: 'coins', x: 100, h: 14, n: 6, gap: 20, arc: 50 },
      { t: 'coins', x: 290, h: 5, n: 4, gap: 18 },
    ],
  },
  {
    id: 't4-plat-chain',
    tier: 4,
    len: 560,
    els: [
      { t: 'pit', x: 100, w: 360 },
      { t: 'plat', x: 160, h: 30, w: 54 },
      { t: 'plat', x: 290, h: 58, w: 54 },
      { t: 'plat', x: 410, h: 30, w: 40 },
      { t: 'coins', x: 170, h: 38, n: 3, gap: 18 },
      { t: 'coins', x: 300, h: 66, n: 3, gap: 18 },
    ],
  },
  {
    id: 't4-tall-pit',
    tier: 4,
    len: 520,
    els: [
      { t: 'tall', x: 140 },
      { t: 'pit', x: 290, w: 84 },
      { t: 'coins', x: 280, h: 16, n: 6, gap: 20, arc: 60 },
    ],
  },
  {
    id: 't4-two-routes',
    tier: 4,
    len: 560,
    els: [
      // 위 길(이단 점프로만 오르는 높이)엔 매달린 것, 아래 길엔 낮은 것 둘.
      // 발판이 한 번 점프의 정점(64)보다 높아서 아래 길에서 뛰어도 위로 올라타지 않는다
      { t: 'plat', x: 110, h: 72, w: 330 },
      { t: 'hang', x: 290, w: 30, h: 72 },
      { t: 'low', x: 220 },
      { t: 'low', x: 350 },
      { t: 'coins', x: 130, h: 80, n: 7, gap: 20 },
      { t: 'coins', x: 280, h: 77, n: 4, gap: 18 },
    ],
  },

  // ---------- 5등급 — 시험장 ----------
  {
    id: 't5-gauntlet',
    tier: 5,
    len: 560,
    els: [
      { t: 'low', x: 100 },
      { t: 'hang', x: 210, w: 30 },
      { t: 'low', x: 320 },
      { t: 'pit', x: 400, w: 60 },
      { t: 'coins', x: 60, h: 10, n: 6, gap: 18, arc: 44 },
    ],
  },
  {
    id: 't5-pit-tall-pit',
    tier: 5,
    len: 600,
    els: [
      { t: 'pit', x: 100, w: 90 },
      { t: 'tall', x: 300 },
      { t: 'pit', x: 440, w: 72 },
      { t: 'coins', x: 230, h: 20, n: 8, gap: 18, arc: 80 },
    ],
  },
  {
    id: 't5-double-tall',
    tier: 5,
    len: 500,
    els: [
      { t: 'tall', x: 150 },
      { t: 'tall', x: 320 },
      { t: 'coins', x: 90, h: 20, n: 6, gap: 18, arc: 80 },
      { t: 'coins', x: 260, h: 20, n: 6, gap: 18, arc: 80 },
    ],
  },
  {
    id: 't5-high-wire',
    tier: 5,
    len: 600,
    els: [
      { t: 'pit', x: 90, w: 430 },
      { t: 'plat', x: 150, h: 44, w: 46 },
      { t: 'plat', x: 270, h: 80, w: 46 },
      { t: 'hang', x: 284, w: 22, h: 80 },
      { t: 'plat', x: 400, h: 44, w: 46 },
      { t: 'coins', x: 160, h: 52, n: 2, gap: 18 },
      { t: 'coins', x: 410, h: 52, n: 2, gap: 18 },
    ],
  },
  // ================= 구간 전용 기믹 (zones 의 구간에서만 나온다) =================

  // ---------- 교실 — 날아오는 종이비행기 ----------
  {
    id: 'c-plane-high',
    tier: 1,
    zones: [0],
    len: 400,
    els: [
      // 머리 높이로 날아온다 — 슬라이드로 피한다
      { t: 'fly', x: 230, level: 'high' },
      { t: 'coins', x: 190, h: 5, n: 5, gap: 18 },
    ],
  },
  {
    id: 'c-plane-low',
    tier: 1,
    zones: [0],
    len: 400,
    els: [
      // 발목 높이로 낮게 — 뛰어넘는다
      { t: 'fly', x: 230, level: 'low' },
      { t: 'coins', x: 180, h: 12, n: 6, gap: 18, arc: 44 },
    ],
  },
  {
    id: 'c-plane-pair',
    tier: 2,
    zones: [0],
    len: 480,
    els: [
      { t: 'fly', x: 170, level: 'high' },
      { t: 'fly', x: 340, level: 'low' },
      { t: 'coins', x: 130, h: 5, n: 4, gap: 18 },
      { t: 'coins', x: 290, h: 12, n: 6, gap: 18, arc: 44 },
    ],
  },

  // ---------- 복도 — 굴러오는 청소 카트 ----------
  {
    id: 'h-cart',
    tier: 1,
    zones: [1],
    len: 420,
    els: [
      { t: 'roll', x: 240 },
      { t: 'coins', x: 190, h: 12, n: 6, gap: 18, arc: 48 },
    ],
  },
  {
    id: 'h-cart-hang',
    tier: 2,
    zones: [1],
    len: 500,
    els: [
      { t: 'roll', x: 170 },
      { t: 'hang', x: 350, w: 30 },
      { t: 'coins', x: 330, h: 5, n: 4, gap: 18 },
    ],
  },

  // ---------- 캠퍼스 — 통통 튀는 축구공 ----------
  {
    id: 'p-ball',
    tier: 2,
    zones: [2],
    len: 440,
    els: [
      // 공이 떠 있을 때 밑으로 지나가거나, 내려왔을 때 넘어간다
      { t: 'bounce', x: 230, height: 50, period: 130 },
      { t: 'coins', x: 170, h: 8, n: 7, gap: 18 },
    ],
  },
  {
    id: 'p-two-balls',
    tier: 3,
    zones: [2],
    len: 520,
    els: [
      { t: 'bounce', x: 170, height: 50, period: 130 },
      { t: 'bounce', x: 330, height: 50, period: 130, phase: 65 },
      { t: 'coins', x: 140, h: 20, n: 12, gap: 20 },
    ],
  },

  // ---------- 학생식당 — 날아오는 식판 ----------
  {
    id: 'f-tray',
    tier: 2,
    zones: [3],
    len: 420,
    els: [
      { t: 'fly', x: 240, level: 'low', k: 1.3 },
      { t: 'coins', x: 190, h: 12, n: 6, gap: 18, arc: 44 },
    ],
  },
  {
    id: 'f-tray-volley',
    tier: 3,
    zones: [3],
    len: 520,
    els: [
      { t: 'fly', x: 160, level: 'low', k: 1.3 },
      { t: 'fly', x: 320, level: 'high', k: 1.3 },
      { t: 'low', x: 420 },
      { t: 'coins', x: 290, h: 5, n: 4, gap: 18 },
    ],
  },

  // ---------- 중앙도서관 — 위에서 떨어지는 책 ----------
  {
    id: 'l-book',
    tier: 3,
    zones: [4],
    len: 440,
    els: [
      // 그림자가 먼저 생기고 책이 떨어져 쌓인다 — 쌓인 책은 뛰어넘는다
      { t: 'drop', x: 240 },
      { t: 'coins', x: 190, h: 12, n: 6, gap: 18, arc: 48 },
    ],
  },
  {
    id: 'l-book-rain',
    tier: 4,
    zones: [4],
    len: 560,
    els: [
      { t: 'drop', x: 160, lead: 200 },
      { t: 'drop', x: 300, lead: 240 },
      { t: 'hang', x: 430, w: 30 },
      { t: 'coins', x: 410, h: 5, n: 4, gap: 18 },
    ],
  },

  // ---------- 시험장 — 시험지 뭉치 · 전공책 · 구덩이를 한꺼번에 ----------
  {
    id: 'e-sheets',
    tier: 4,
    zones: [5],
    len: 520,
    els: [
      { t: 'fly', x: 160, level: 'high', k: 1.2 },
      { t: 'fly', x: 320, level: 'low', k: 1.2 },
      { t: 'coins', x: 120, h: 5, n: 4, gap: 18 },
      { t: 'coins', x: 270, h: 12, n: 6, gap: 18, arc: 44 },
    ],
  },
  {
    id: 'e-finals',
    tier: 5,
    zones: [5],
    len: 600,
    els: [
      { t: 'drop', x: 140 },
      { t: 'fly', x: 300, level: 'low', k: 1.2 },
      { t: 'pit', x: 420, w: 64 },
      { t: 'coins', x: 400, h: 14, n: 6, gap: 20, arc: 48 },
    ],
  },
];
