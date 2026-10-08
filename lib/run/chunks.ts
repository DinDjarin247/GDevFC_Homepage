import type { Chunk } from './world';

/**
 * 코스 조각 — 사람이 짠 패턴. 등급(tier)이 오를수록 어렵다.
 *
 * x 는 조각 시작부터의 거리(px, 초당 150px — 10px 가 1/15초), h 는 땅 위 높이.
 * 장애물: low(한 번 점프) · tall(이단 점프) · hang(슬라이드) · pit(구덩이) ·
 *        fly(날아온다 — high 는 슬라이드, low 는 점프) · roll(굴러온다) · bounce(튀는 공) · drop(떨어지는 것)
 * 학점: v 없음 = B(초록 10점) · v: 20 = A(파랑) · v: 30 = A+(금색). 위험한 길일수록 높은 학점.
 *
 * 설계 원칙
 * - 그냥 달리기만 하는 시간이 길지 않게: 장애물 사이는 대개 0.4~0.6초 (60~90px).
 * - 모든 조각은 앞뒤 40px 이상을 평지로 두어 아무 조각이나 이어 붙여도 안전하다.
 * - 갈림길(fork) 조각: 아래 길은 쉽고 B 학점, 위 길(발판)은 위험하지만 A · A+ 학점.
 *   위에서 떨어져도 아래 길로 떨어지게 짠다 — 위험의 대가는 "맞을 수 있다"이지 즉사가 아니다.
 * - expect: 이단 점프 타이밍 의도 — quick(타탁) · late(타   탁) · dodge(날아오는 걸 보내고 나서).
 *
 * 새 조각을 추가하면 npm run verify:run 으로 확인한다 — 1/15초 간격 입력만으로 한 대도 안 맞고
 * 지나갈 수 있는지, 아무 두 조각을 이어 붙여도 되는지, expect 타이밍이 정말 그런지.
 */
export const CHUNKS: Chunk[] = [
  // ======================= 1등급 — 하나씩, 그래도 쉴 틈 없이 =======================
  {
    id: 't1-hop-duck',
    tier: 1,
    len: 380,
    els: [
      { t: 'low', x: 60 },
      { t: 'hang', x: 180, w: 30 },
      { t: 'low', x: 310 },
      { t: 'coins', x: 20, h: 10, n: 6, gap: 18, arc: 44 },
      { t: 'coins', x: 170, h: 5, n: 3, gap: 18 },
      { t: 'coins', x: 270, h: 10, n: 6, gap: 18, arc: 44 },
    ],
  },
  {
    id: 't1-duck-hop',
    tier: 1,
    len: 380,
    els: [
      { t: 'hang', x: 50, w: 30 },
      { t: 'low', x: 180 },
      { t: 'hang', x: 300, w: 30 },
      { t: 'coins', x: 40, h: 5, n: 3, gap: 18 },
      { t: 'coins', x: 140, h: 10, n: 6, gap: 18, arc: 44 },
      { t: 'coins', x: 290, h: 5, n: 3, gap: 18 },
    ],
  },
  {
    id: 't1-pits',
    tier: 1,
    len: 380,
    els: [
      { t: 'pit', x: 60, w: 44 },
      { t: 'pit', x: 180, w: 44 },
      { t: 'low', x: 300 },
      { t: 'coins', x: 40, h: 14, n: 5, gap: 20, arc: 40 },
      { t: 'coins', x: 160, h: 14, n: 5, gap: 20, arc: 40 },
    ],
  },
  {
    id: 't1-fork',
    tier: 1,
    len: 340,
    els: [
      // 갈림길 — 위(발판)는 A 학점, 아래는 낮은 장애물 둘과 B 학점
      { t: 'plat', x: 50, h: 40, w: 240 },
      { t: 'coins', x: 70, h: 48, n: 10, gap: 22, v: 20 },
      { t: 'low', x: 120 },
      { t: 'low', x: 240 },
      { t: 'coins', x: 80, h: 10, n: 5, gap: 18, arc: 34 },
      { t: 'coins', x: 200, h: 10, n: 5, gap: 18, arc: 34 },
    ],
  },
  {
    id: 't1-incoming',
    tier: 1,
    len: 400,
    els: [
      { t: 'fly', x: 120, level: 'high' },
      { t: 'low', x: 230 },
      { t: 'fly', x: 340, level: 'low' },
      { t: 'coins', x: 100, h: 5, n: 3, gap: 18 },
      { t: 'coins', x: 190, h: 10, n: 6, gap: 18, arc: 44 },
    ],
  },

  // ======================= 2등급 — 점프 · 슬라이드가 번갈아 =======================
  {
    id: 't2-zigzag',
    tier: 2,
    len: 480,
    els: [
      // 0.6초마다 점프 / 슬라이드
      { t: 'low', x: 40 },
      { t: 'hang', x: 130, w: 26 },
      { t: 'low', x: 220 },
      { t: 'hang', x: 310, w: 26 },
      { t: 'low', x: 400 },
      { t: 'coins', x: 125, h: 5, n: 2, gap: 16 },
      { t: 'coins', x: 305, h: 5, n: 2, gap: 16 },
      { t: 'coins', x: 190, h: 30, n: 3, gap: 16, v: 20 },
    ],
  },
  {
    id: 't2-quick-double',
    tier: 2,
    expect: 'quick',
    len: 320,
    els: [
      // 슬라이드로 현수막을 빠져나오자마자 높은 장애물 — 타탁!
      { t: 'hang', x: 40, w: 50 },
      { t: 'tall', x: 132 },
      { t: 'hang', x: 250, w: 30 },
      { t: 'coins', x: 50, h: 5, n: 3, gap: 16 },
      { t: 'coins', x: 120, h: 72, n: 3, gap: 14, v: 20 },
    ],
  },
  {
    id: 't2-pit-duck',
    tier: 2,
    len: 440,
    els: [
      { t: 'pit', x: 40, w: 52 },
      { t: 'hang', x: 160, w: 30 },
      { t: 'pit', x: 250, w: 52 },
      { t: 'hang', x: 370, w: 30 },
      { t: 'coins', x: 30, h: 16, n: 4, gap: 22, arc: 40 },
      { t: 'coins', x: 240, h: 16, n: 4, gap: 22, arc: 40 },
    ],
  },
  {
    id: 't2-fork-banner',
    tier: 2,
    len: 400,
    els: [
      // 위: 발판 위 현수막을 슬라이드로(A · A+) / 아래: 낮은 것 · 날아오는 것 · 낮은 것(B)
      { t: 'plat', x: 40, h: 52, w: 310 },
      { t: 'hang', x: 180, w: 30, h: 52 },
      { t: 'coins', x: 60, h: 60, n: 5, gap: 20, v: 20 },
      { t: 'coins', x: 176, h: 56, n: 3, gap: 14, v: 30 },
      { t: 'coins', x: 240, h: 60, n: 4, gap: 20, v: 20 },
      { t: 'low', x: 100 },
      { t: 'fly', x: 220, level: 'low' },
      { t: 'low', x: 320 },
    ],
  },
  {
    id: 't2-ball-run',
    tier: 2,
    len: 440,
    els: [
      { t: 'bounce', x: 90, height: 48, period: 120 },
      { t: 'low', x: 230 },
      { t: 'bounce', x: 350, height: 48, period: 120, phase: 60 },
      { t: 'coins', x: 60, h: 8, n: 5, gap: 18 },
      { t: 'coins', x: 190, h: 10, n: 6, gap: 18, arc: 44 },
    ],
  },

  // ======================= 3등급 — 타이밍을 고른다 =======================
  {
    id: 't3-late-double',
    tier: 3,
    expect: 'late',
    len: 300,
    els: [
      // 아주 넓은 구덩이 — 정점까지 참았다가 두 번째 점프 (타   탁). 맨 위 금색은 완벽한 궤적의 보상
      { t: 'pit', x: 50, w: 156 },
      { t: 'coins', x: 60, h: 40, n: 3, gap: 18 },
      { t: 'coins', x: 120, h: 108, n: 3, gap: 16, v: 30 },
    ],
  },
  {
    id: 't3-dodge',
    tier: 3,
    expect: 'dodge',
    len: 300,
    els: [
      // 높은 현수막 밑의 낮은 장애물을 점프로 넘는다 — 현수막 밑에서 두 번째 점프를 누르면 머리를 박는다.
      // 현수막을 벗어나자마자 눌러야 바로 뒤의 높은 것을 넘는다 (타 … 탁, 0.27~0.53초 뒤)
      { t: 'hang', x: 110, w: 50, h: 76 },
      { t: 'low', x: 135 },
      { t: 'tall', x: 174 },
      { t: 'coins', x: 100, h: 40, n: 3, gap: 18, v: 20 },
      { t: 'coins', x: 168, h: 82, n: 2, gap: 12, v: 30 },
    ],
  },
  {
    id: 't3-rapid',
    tier: 3,
    len: 520,
    els: [
      { t: 'low', x: 40 },
      { t: 'hang', x: 120, w: 26 },
      { t: 'low', x: 200 },
      { t: 'hang', x: 280, w: 26 },
      { t: 'tall', x: 370 },
      { t: 'hang', x: 460, w: 26 },
      { t: 'coins', x: 340, h: 70, n: 4, gap: 14, v: 20 },
    ],
  },
  {
    id: 't3-fork-gold',
    tier: 3,
    len: 400,
    els: [
      // 위: 높낮이가 다른 발판 셋 — 가운데 높은 발판에 금색 / 아래: 낮은 것 셋
      { t: 'plat', x: 40, h: 56, w: 70 },
      { t: 'plat', x: 150, h: 86, w: 60 },
      { t: 'plat', x: 260, h: 56, w: 70 },
      { t: 'coins', x: 52, h: 64, n: 3, gap: 20, v: 20 },
      { t: 'coins', x: 158, h: 94, n: 3, gap: 20, v: 30 },
      { t: 'coins', x: 272, h: 64, n: 3, gap: 20, v: 20 },
      { t: 'low', x: 100 },
      { t: 'low', x: 210 },
      { t: 'low', x: 320 },
    ],
  },
  {
    id: 't3-fly-rhythm',
    tier: 3,
    len: 420,
    els: [
      { t: 'fly', x: 80, level: 'high' },
      { t: 'fly', x: 170, level: 'low' },
      { t: 'fly', x: 260, level: 'high' },
      { t: 'fly', x: 350, level: 'low' },
      { t: 'coins', x: 140, h: 12, n: 4, gap: 16, arc: 30, v: 20 },
    ],
  },
  {
    id: 't3-stepping',
    tier: 3,
    len: 360,
    els: [
      { t: 'pit', x: 40, w: 270 },
      { t: 'plat', x: 100, h: 30, w: 44 },
      { t: 'plat', x: 200, h: 62, w: 44 },
      { t: 'coins', x: 108, h: 38, n: 2, gap: 18, v: 20 },
      { t: 'coins', x: 208, h: 70, n: 2, gap: 18, v: 30 },
    ],
  },

  // ======================= 4등급 — 몰아친다 =======================
  {
    id: 't4-late-then-duck',
    tier: 4,
    expect: 'late',
    len: 340,
    els: [
      // 넓은 구덩이를 늦은 이단 점프로 — 내리자마자 슬라이드
      { t: 'pit', x: 40, w: 150 },
      { t: 'hang', x: 250, w: 30 },
      { t: 'coins', x: 100, h: 104, n: 3, gap: 16, v: 30 },
      { t: 'coins', x: 240, h: 5, n: 3, gap: 16 },
    ],
  },
  {
    id: 't4-quick-then-late',
    tier: 4,
    len: 440,
    els: [
      // 타탁 — 그리고 곧바로 타   탁
      { t: 'hang', x: 40, w: 50 },
      { t: 'tall', x: 132 },
      { t: 'pit', x: 230, w: 140 },
      { t: 'coins', x: 280, h: 100, n: 3, gap: 16, v: 30 },
    ],
  },
  {
    id: 't4-fork-hell',
    tier: 4,
    len: 420,
    els: [
      // 위: 좁은 발판 사이로 현수막 — 금색 / 아래: 높은 것 · 날아오는 것 · 낮은 것
      { t: 'plat', x: 40, h: 60, w: 70 },
      { t: 'plat', x: 160, h: 90, w: 64 },
      { t: 'hang', x: 180, w: 24, h: 90 },
      { t: 'plat', x: 280, h: 60, w: 70 },
      { t: 'coins', x: 52, h: 68, n: 3, gap: 20, v: 20 },
      { t: 'coins', x: 168, h: 94, n: 3, gap: 20, v: 30 },
      { t: 'coins', x: 292, h: 68, n: 3, gap: 20, v: 20 },
      { t: 'tall', x: 120 },
      { t: 'fly', x: 250, level: 'low' },
      { t: 'low', x: 350 },
    ],
  },
  {
    id: 't4-ball-gauntlet',
    tier: 4,
    len: 480,
    els: [
      { t: 'bounce', x: 70, height: 48, period: 110 },
      { t: 'low', x: 170 },
      { t: 'bounce', x: 250, height: 48, period: 110, phase: 40 },
      { t: 'hang', x: 340, w: 26 },
      { t: 'low', x: 420 },
      { t: 'coins', x: 130, h: 10, n: 5, gap: 18, arc: 44, v: 20 },
    ],
  },
  {
    id: 't4-pit-chain',
    tier: 4,
    len: 540,
    els: [
      { t: 'pit', x: 40, w: 70 },
      { t: 'pit', x: 170, w: 96 },
      { t: 'pit', x: 320, w: 70 },
      { t: 'hang', x: 420, w: 26 },
      { t: 'low', x: 490 },
      { t: 'coins', x: 170, h: 70, n: 4, gap: 20, v: 20 },
    ],
  },

  // ======================= 5등급 — 시험장 =======================
  {
    id: 't5-chaos',
    tier: 5,
    len: 540,
    els: [
      { t: 'low', x: 40 },
      { t: 'hang', x: 110, w: 26 },
      { t: 'pit', x: 190, w: 60 },
      { t: 'tall', x: 310 },
      { t: 'hang', x: 400, w: 26 },
      { t: 'low', x: 470 },
      { t: 'coins', x: 280, h: 72, n: 4, gap: 14, v: 30 },
    ],
  },
  {
    id: 't5-late-tall',
    tier: 5,
    expect: 'late',
    len: 350,
    els: [
      { t: 'pit', x: 40, w: 154 },
      { t: 'tall', x: 240 },
      { t: 'coins', x: 90, h: 104, n: 3, gap: 16, v: 30 },
    ],
  },
  {
    id: 't5-fork-tightrope',
    tier: 5,
    len: 420,
    els: [
      // 위: 아주 좁은 발판 셋 사이 현수막 — 금색 잔뜩 / 아래: 구덩이 둘과 낮은 것
      { t: 'plat', x: 40, h: 70, w: 40 },
      { t: 'plat', x: 150, h: 70, w: 40 },
      { t: 'plat', x: 260, h: 70, w: 40 },
      { t: 'hang', x: 112, w: 18, h: 70 },
      { t: 'hang', x: 222, w: 18, h: 70 },
      { t: 'coins', x: 48, h: 78, n: 2, gap: 18, v: 30 },
      { t: 'coins', x: 158, h: 78, n: 2, gap: 18, v: 30 },
      { t: 'coins', x: 268, h: 78, n: 2, gap: 18, v: 30 },
      { t: 'pit', x: 90, w: 56 },
      { t: 'pit', x: 230, w: 56 },
      { t: 'low', x: 350 },
    ],
  },
  {
    id: 't5-fly-storm',
    tier: 5,
    len: 420,
    els: [
      { t: 'fly', x: 60, level: 'low', k: 1.2 },
      { t: 'fly', x: 130, level: 'high', k: 1.2 },
      { t: 'fly', x: 200, level: 'low', k: 1.2 },
      { t: 'fly', x: 270, level: 'high', k: 1.2 },
      { t: 'fly', x: 340, level: 'low', k: 1.2 },
      { t: 'coins', x: 50, h: 30, n: 5, gap: 70, v: 20 },
    ],
  },
  {
    id: 't5-double-tall',
    tier: 5,
    len: 420,
    els: [
      { t: 'tall', x: 60 },
      { t: 'tall', x: 200 },
      { t: 'hang', x: 330, w: 30 },
      { t: 'coins', x: 40, h: 72, n: 3, gap: 14, v: 30 },
      { t: 'coins', x: 180, h: 72, n: 3, gap: 14, v: 30 },
    ],
  },

  // ======================= 구간 전용 기믹 (zones 의 구간에서만) =======================

  // ---------- 교실 — 날아오는 종이비행기 ----------
  {
    id: 'c-plane-high',
    tier: 1,
    zones: [0],
    len: 340,
    els: [
      { t: 'fly', x: 100, level: 'high' },
      { t: 'low', x: 210 },
      { t: 'fly', x: 300, level: 'high' },
      { t: 'coins', x: 80, h: 5, n: 3, gap: 16 },
      { t: 'coins', x: 170, h: 10, n: 6, gap: 18, arc: 44 },
    ],
  },
  {
    id: 'c-plane-low',
    tier: 1,
    zones: [0],
    len: 340,
    els: [
      { t: 'fly', x: 100, level: 'low' },
      { t: 'hang', x: 200, w: 30 },
      { t: 'fly', x: 300, level: 'low' },
      { t: 'coins', x: 60, h: 12, n: 6, gap: 18, arc: 44 },
    ],
  },
  {
    id: 'c-plane-pair',
    tier: 2,
    zones: [0],
    len: 400,
    els: [
      { t: 'fly', x: 80, level: 'high' },
      { t: 'fly', x: 160, level: 'low' },
      { t: 'fly', x: 240, level: 'high' },
      { t: 'low', x: 330 },
      { t: 'coins', x: 120, h: 12, n: 4, gap: 18, arc: 40, v: 20 },
    ],
  },

  // ---------- 복도 — 굴러오는 청소 카트 ----------
  {
    id: 'h-cart',
    tier: 2,
    zones: [1],
    len: 380,
    els: [
      { t: 'roll', x: 110 },
      { t: 'hang', x: 210, w: 30 },
      { t: 'roll', x: 310 },
      { t: 'coins', x: 60, h: 12, n: 6, gap: 18, arc: 48 },
    ],
  },
  {
    id: 'h-cart-locker',
    tier: 3,
    zones: [1],
    len: 420,
    els: [
      { t: 'roll', x: 90 },
      { t: 'tall', x: 210 },
      { t: 'roll', x: 330, k: 0.7 },
      { t: 'coins', x: 180, h: 72, n: 3, gap: 14, v: 20 },
    ],
  },

  // ---------- 캠퍼스 — 통통 튀는 축구공 (끝까지 보고 피한다) ----------
  {
    id: 'p-ball',
    tier: 2,
    zones: [2],
    len: 380,
    els: [
      { t: 'bounce', x: 100, height: 50, period: 130 },
      { t: 'low', x: 220 },
      { t: 'bounce', x: 320, height: 50, period: 130, phase: 50 },
      { t: 'coins', x: 60, h: 8, n: 5, gap: 18 },
    ],
  },
  {
    id: 'p-three-balls',
    tier: 3,
    zones: [2],
    len: 460,
    els: [
      { t: 'bounce', x: 90, height: 50, period: 120 },
      { t: 'bounce', x: 210, height: 50, period: 120, phase: 60 },
      { t: 'bounce', x: 330, height: 50, period: 120, phase: 20 },
      { t: 'coins', x: 60, h: 20, n: 14, gap: 22, v: 20 },
    ],
  },

  // ---------- 학생식당 — 날아오는 식판 ----------
  {
    id: 'f-tray',
    tier: 2,
    zones: [3],
    len: 380,
    els: [
      { t: 'fly', x: 100, level: 'low', k: 1.3 },
      { t: 'hang', x: 200, w: 30 },
      { t: 'fly', x: 300, level: 'low', k: 1.3 },
      { t: 'coins', x: 50, h: 12, n: 6, gap: 18, arc: 44 },
    ],
  },
  {
    id: 'f-tray-volley',
    tier: 3,
    zones: [3],
    len: 440,
    els: [
      { t: 'fly', x: 80, level: 'low', k: 1.3 },
      { t: 'fly', x: 160, level: 'high', k: 1.3 },
      { t: 'fly', x: 240, level: 'low', k: 1.3 },
      { t: 'low', x: 340 },
      { t: 'coins', x: 140, h: 5, n: 3, gap: 16, v: 20 },
    ],
  },

  // ---------- 중앙도서관 — 위에서 떨어지는 책 ----------
  {
    id: 'l-book',
    tier: 3,
    zones: [4],
    len: 400,
    els: [
      { t: 'drop', x: 120 },
      { t: 'hang', x: 220, w: 30 },
      { t: 'drop', x: 330 },
      { t: 'coins', x: 80, h: 12, n: 6, gap: 18, arc: 48 },
    ],
  },
  {
    id: 'l-book-rain',
    tier: 4,
    zones: [4],
    len: 460,
    els: [
      { t: 'drop', x: 90, lead: 200 },
      { t: 'drop', x: 200, lead: 240 },
      { t: 'drop', x: 310, lead: 200 },
      { t: 'hang', x: 400, w: 30 },
      { t: 'coins', x: 150, h: 40, n: 6, gap: 20, v: 20 },
    ],
  },

  // ---------- 시험장 — 시험지 뭉치 · 전공책 · 구덩이를 한꺼번에 ----------
  {
    id: 'e-sheets',
    tier: 4,
    zones: [5],
    len: 440,
    els: [
      { t: 'fly', x: 80, level: 'high', k: 1.2 },
      { t: 'fly', x: 160, level: 'low', k: 1.2 },
      { t: 'drop', x: 260 },
      { t: 'fly', x: 350, level: 'high', k: 1.2 },
      { t: 'coins', x: 120, h: 12, n: 4, gap: 18, arc: 40, v: 20 },
    ],
  },
  {
    id: 'e-finals',
    tier: 5,
    zones: [5],
    len: 520,
    els: [
      { t: 'drop', x: 80 },
      { t: 'fly', x: 180, level: 'low', k: 1.2 },
      { t: 'pit', x: 260, w: 70 },
      { t: 'hang', x: 390, w: 30 },
      { t: 'coins', x: 250, h: 70, n: 4, gap: 20, v: 30 },
    ],
  },
];
