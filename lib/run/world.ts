/**
 * 달려라 우왕이 V2 — 물리와 코스.
 *
 * 화면(RunGame)과 코스 검증 스크립트가 같은 물리 함수(stepRunner)를 쓴다. 코스 조각은
 * 사람이 짠 패턴이고, 검증 스크립트가 1/15초 간격 입력만으로 한 대도 안 맞고 지나갈 수
 * 있는지 확인한다 — 그래야 "깰 수 없는 조각"이 섞이지 않는다.
 *
 * 좌표: 화면과 같이 y 가 아래로 커진다. x 는 출발점부터 달린 거리(월드 x).
 * 속도는 일정하다 — 난이도는 빨라지는 속도가 아니라 코스 조각의 등급으로 오른다.
 * 물리는 1/120초 고정 스텝으로만 돈다.
 */

export const VIEW_W = 384;
export const VIEW_H = 216;
/** 땅 윗면 */
export const GROUND_Y = 184;
/** 화면에서 우왕이 발 가운데가 서는 x */
export const PLAYER_SCREEN_X = 84;

export const PHYS_DT = 1 / 120;
/** 일정한 달리기 속도 (px/s) — 10px = 1m 라 초속 15m */
export const RUN_SPEED = 150;
export const PX_PER_M = 10;

export const GRAVITY = 1500;
export const MAX_FALL = 620;
/** 땅에서 뛸 때 — 정점 ~64px */
export const JUMP_V = 440;
/** 공중에서 한 번 더 — 정점 +~53px */
export const AIR_JUMP_V = 400;
/** 공중에서 ↓ 를 누르면 이 속도로 빨리 내려온다 */
export const FAST_FALL_V = 380;
/** 발판 끝을 지나고도 이만큼은 땅에서 뛴 것으로 쳐준다 */
export const COYOTE_TIME = 0.08;
/** 착지 직전에 누른 점프를 이만큼 기억했다가 착지하자마자 뛴다 */
export const JUMP_BUFFER = 0.1;
/** 발 가운데가 발판 끝에서 이만큼 벗어나도 걸쳐 서 있는 것으로 친다 */
export const EDGE_GRACE = 2;

export const STAND_H = 20;
export const SLIDE_H = 11;
export const PLAYER_HALF_W = 5;

/* ---------- 코스 요소 ---------- */

/** 밟을 수 있는 면 — 땅 조각이나 공중 발판. 아래에서는 통과하고 위에서만 밟힌다 */
export type Surface = { x0: number; x1: number; y: number; kind: 'ground' | 'plat' };

export type ObstacleKind = 'low' | 'tall' | 'hang';
/** 부딪히면 다치는 것 (막지는 않는다 — 쿠키런처럼 지나가며 체력을 잃는다) */
export type Obstacle = {
  kind: ObstacleKind;
  x: number;
  y: number;
  w: number;
  h: number;
  /** 이미 한 번 부딪혔다 (다시 다치지 않는다) */
  hit?: boolean;
  /** 질주 · 거대화로 부쉈다 (더 그리지 않는다) */
  smashed?: boolean;
};

export type PickupKind = 'coin' | 'heart' | 'item';
/**
 * 아이템 — boost(아메리카노: 무적 질주) · shield(족보: 한 번 막아 줌) ·
 * magnet(자석: 학점을 끌어당김) · giant(거대화: 장애물을 부수며 달림)
 */
export type ItemKind = 'boost' | 'shield' | 'magnet' | 'giant';
export type Pickup = { kind: PickupKind; x: number; y: number; item?: ItemKind; taken?: boolean };

/** 아이템이 나오는 비율 */
const ITEM_WEIGHTS: [ItemKind, number][] = [
  ['shield', 0.3],
  ['boost', 0.25],
  ['magnet', 0.25],
  ['giant', 0.2],
];

/** 장애물 크기 — 낮은 것은 한 번, 높은 것은 이단 점프로 넘고, 매달린 것은 슬라이드로 지나간다 */
export const OBSTACLE_SIZE: Record<ObstacleKind, { w: number; h: number }> = {
  low: { w: 14, h: 17 },
  tall: { w: 16, h: 58 },
  // 매달린 것: 아래 끝이 발판에서 14px 위 — 선 키(20)는 걸리고 슬라이드(11)는 빠져나간다
  hang: { w: 30, h: 0 },
};
export const HANG_CLEARANCE = 14;

/* ---------- 달리는 몸 ---------- */

export type Runner = {
  /** 발 높이 (화면 y) */
  y: number;
  vy: number;
  grounded: boolean;
  /** 공중에서 더 뛸 수 있는 횟수 (이단 점프면 1) */
  airJumps: number;
  sliding: boolean;
  coyote: number;
  buffer: number;
};

export type RunInput = {
  /** 이번 스텝에 점프를 막 눌렀는지 */
  jumpPressed: boolean;
  /** ↓ 를 누르고 있는지 */
  slide: boolean;
};

export function newRunner(): Runner {
  return { y: GROUND_Y, vy: 0, grounded: true, airJumps: 1, sliding: false, coyote: 0, buffer: 0 };
}

function over(x: number, s: Surface) {
  return x >= s.x0 - EDGE_GRACE && x <= s.x1 + EDGE_GRACE;
}

/**
 * 한 스텝. x 는 이번 스텝의 월드 x(발 가운데), surfaces 는 그 근처의 밟을 면들.
 * maxJumps 는 땅 점프를 포함한 연속 점프 수 (보통 2 = 이단 점프).
 */
export function stepRunner(r: Runner, x: number, inp: RunInput, surfaces: readonly Surface[], maxJumps: number) {
  // 점프 — 땅(또는 막 떨어진 직후)이면 땅 점프, 공중이면 남은 공중 점프
  if (inp.jumpPressed) r.buffer = JUMP_BUFFER;
  else r.buffer = Math.max(0, r.buffer - PHYS_DT);
  if (r.buffer > 0) {
    if (r.grounded || r.coyote > 0) {
      r.vy = -JUMP_V;
      r.grounded = false;
      r.coyote = 0;
      r.airJumps = maxJumps - 1;
      r.buffer = 0;
    } else if (r.airJumps > 0) {
      r.vy = -AIR_JUMP_V;
      r.airJumps -= 1;
      r.buffer = 0;
    }
  }

  r.sliding = r.grounded && inp.slide;
  if (!r.grounded && inp.slide && r.vy < FAST_FALL_V) r.vy = FAST_FALL_V;

  if (r.grounded) {
    // 발밑이 끝났으면(구덩이 · 발판 끝) 떨어지기 시작한다
    const still = surfaces.some((s) => Math.abs(s.y - r.y) < 0.5 && over(x, s));
    if (!still) {
      r.grounded = false;
      r.coyote = COYOTE_TIME;
      r.airJumps = maxJumps - 1;
      r.vy = 0;
    }
    return;
  }

  r.coyote = Math.max(0, r.coyote - PHYS_DT);
  const prevY = r.y;
  r.vy = Math.min(MAX_FALL, r.vy + GRAVITY * PHYS_DT);
  r.y += r.vy * PHYS_DT;
  if (r.vy >= 0) {
    let land: Surface | null = null;
    for (const s of surfaces) {
      if (prevY <= s.y && r.y >= s.y && over(x, s) && (!land || s.y < land.y)) land = s;
    }
    if (land) {
      r.y = land.y;
      r.vy = 0;
      r.grounded = true;
      r.airJumps = maxJumps - 1;
    }
  }
}

/** 몸의 충돌 상자 (화면 y 기준) */
export function hitbox(r: Runner, x: number) {
  const h = r.sliding ? SLIDE_H : STAND_H;
  const half = r.sliding ? PLAYER_HALF_W + 2 : PLAYER_HALF_W;
  return { x0: x - half, x1: x + half, y0: r.y - h, y1: r.y };
}

export function touches(
  box: { x0: number; x1: number; y0: number; y1: number },
  o: { x: number; y: number; w: number; h: number }
) {
  return box.x0 < o.x + o.w && box.x1 > o.x && box.y0 < o.y + o.h && box.y1 > o.y;
}

/** 구덩이에 빠졌는지 — 화면 아래로 빠져나갔으면 */
export function fellOut(r: Runner) {
  return r.y > VIEW_H + 24;
}

/* ---------- 코스 조각 ---------- */

/**
 * 코스 조각의 요소. x 는 조각 시작부터의 거리, h 는 땅 위 높이(위로 +).
 * 장애물·학점에 on 을 주면 그 높이의 발판 위에 놓인 것으로 본다.
 */
export type ChunkEl =
  | { t: 'pit'; x: number; w: number }
  | { t: 'plat'; x: number; h: number; w: number }
  | { t: 'low' | 'tall'; x: number; h?: number }
  | { t: 'hang'; x: number; w?: number; h?: number }
  | { t: 'coins'; x: number; h: number; n: number; gap?: number; arc?: number }
  | { t: 'heart'; x: number; h: number };

export type Chunk = { id: string; tier: number; len: number; els: ChunkEl[] };

/**
 * 조각 하나를 월드 x=base 에 놓았을 때의 실제 요소들. 게임 코스와 검증 스크립트가 같이 쓴다.
 * 땅은 조각 전체에 깔고 구덩이만큼 비운다.
 */
export function layoutChunk(c: Chunk, base: number) {
  const grounds: { x0: number; x1: number }[] = [];
  const pits = c.els.filter((e): e is Extract<ChunkEl, { t: 'pit' }> => e.t === 'pit').sort((a, b) => a.x - b.x);
  let cursor = 0;
  for (const p of pits) {
    if (p.x > cursor) grounds.push({ x0: base + cursor, x1: base + p.x });
    cursor = p.x + p.w;
  }
  if (cursor < c.len) grounds.push({ x0: base + cursor, x1: base + c.len });

  const plats: Surface[] = [];
  const obstacles: Obstacle[] = [];
  const pickups: Pickup[] = [];
  for (const e of c.els) {
    const x = base + e.x;
    switch (e.t) {
      case 'plat':
        plats.push({ x0: x, x1: x + e.w, y: GROUND_Y - e.h, kind: 'plat' });
        break;
      case 'low':
      case 'tall': {
        const size = OBSTACLE_SIZE[e.t];
        const floor = GROUND_Y - (e.h ?? 0);
        obstacles.push({ kind: e.t, x, y: floor - size.h, w: size.w, h: size.h });
        break;
      }
      case 'hang': {
        // 천장에서 내려와 발판 14px 위에서 끝난다
        const bottom = GROUND_Y - (e.h ?? 0) - HANG_CLEARANCE;
        obstacles.push({ kind: 'hang', x, y: -8, w: e.w ?? OBSTACLE_SIZE.hang.w, h: bottom + 8 });
        break;
      }
      case 'coins':
        pickups.push(...coinLine(x, GROUND_Y - e.h, e.n, e.gap ?? 20, e.arc ?? 0));
        break;
      case 'heart':
        pickups.push({ kind: 'heart', x, y: GROUND_Y - e.h });
        break;
    }
  }
  obstacles.sort((a, b) => a.x - b.x);
  return { grounds, plats, obstacles, pickups };
}

/** 학점 한 줄 — arc 만큼 솟았다 내려오는 포물선이면 점프 궤적을 따라 먹게 된다 */
export function coinLine(x: number, y: number, n: number, gap: number, arc: number): Pickup[] {
  const out: Pickup[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    out.push({ kind: 'coin', x: x + i * gap, y: y - arc * 4 * t * (1 - t) });
  }
  return out;
}

/* ---------- 구간 ---------- */

export type Zone = { id: string; ko: string; en: string };

/** 한 학기의 구간들 — 교실에서 시작해 시험장에서 끝난다. 다 지나면 다음 학기 */
export const ZONES: Zone[] = [
  { id: 'classroom', ko: '교실', en: 'CLASSROOM' },
  { id: 'hallway', ko: '복도', en: 'HALLWAY' },
  { id: 'campus', ko: '캠퍼스', en: 'CAMPUS' },
  { id: 'cafeteria', ko: '학생식당', en: 'CAFETERIA' },
  { id: 'library', ko: '중앙도서관', en: 'LIBRARY' },
  { id: 'exam', ko: '시험장', en: 'EXAM HALL' },
];

/** 구간 하나의 길이 — 초속 15m 로 ~47초 */
export const ZONE_LEN = 7000;

/** 구간별로 뽑는 코스 조각 등급 [최소, 최대]. 학기가 올라가면 한 등급씩 어려워진다 */
const ZONE_TIERS: [number, number][] = [
  [1, 1],
  [1, 2],
  [2, 3],
  [2, 3],
  [3, 4],
  [4, 5],
];
export const MAX_TIER = 5;

export function zoneAt(x: number) {
  const n = Math.max(0, Math.floor(x / ZONE_LEN));
  return { index: n % ZONES.length, semester: Math.floor(n / ZONES.length) + 1 };
}

export function tiersAt(x: number): [number, number] {
  const { index, semester } = zoneAt(x);
  const [lo, hi] = ZONE_TIERS[index];
  const up = semester - 1;
  return [Math.min(MAX_TIER, lo + up), Math.min(MAX_TIER, hi + up)];
}

/* ---------- 코스 ---------- */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 조각 사이 숨 고르기 평지 — 하트는 여기에만 놓는다 */
const BREATHER = 110;
/** 이 거리(~16초)마다 한 번쯤 하트 — 체력은 초당 1.4 씩 줄고 하트 하나가 25 를 채운다 */
const HEART_EVERY = 2400;
/** 이 거리(~20초)마다 한 번쯤 아이템 */
const ITEM_EVERY = 3000;
/** 출발 직후의 안전한 평지 */
const START_FLAT = 520;

/**
 * 끝없이 이어지는 코스. 앞으로 달릴 곳을 조각 단위로 미리 깔아 두고, 지나간 것은 버린다.
 * 각 목록은 x 오름차순이라 화면 근처만 빠르게 찾을 수 있다.
 */
export class Course {
  surfaces: Surface[] = [];
  obstacles: Obstacle[] = [];
  pickups: Pickup[] = [];
  /** 지금까지 깐 끝 */
  builtTo = 0;
  private readonly rng: () => number;
  private readonly chunks: readonly Chunk[];
  private sinceHeart = 0;
  private sinceItem = 1200;
  private lastId = '';

  constructor(seed: number, chunks: readonly Chunk[]) {
    this.rng = mulberry32(seed);
    this.chunks = chunks;
    this.addFlat(START_FLAT);
    this.addCoins(200, GROUND_Y - 8, 10, 22, 0);
  }

  /** x 까지 코스를 깐다 */
  extendTo(x: number) {
    while (this.builtTo < x) {
      this.addBreather();
      this.addChunk(this.pick());
    }
  }

  /** x 보다 한참 뒤에 있는 것은 버린다 (메모리 · 검색 비용) */
  dropBefore(x: number) {
    this.surfaces = this.surfaces.filter((s) => s.x1 >= x);
    this.obstacles = this.obstacles.filter((o) => o.x + o.w >= x);
    this.pickups = this.pickups.filter((p) => p.x >= x - 16);
  }

  surfacesNear(x: number, r = 40) {
    return this.surfaces.filter((s) => s.x1 >= x - r && s.x0 <= x + r);
  }

  private pick(): Chunk {
    const [lo, hi] = tiersAt(this.builtTo);
    // 등급 범위 안에서 고르되, 높은 등급을 조금 더 자주. 같은 조각이 연달아 나오지 않게
    const pool = this.chunks.filter((c) => c.tier >= lo && c.tier <= hi && c.id !== this.lastId);
    const weights = pool.map((c) => 1 + (c.tier - lo) * 0.6);
    let r = this.rng() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  private addFlat(len: number) {
    this.addGround(this.builtTo, this.builtTo + len);
    this.builtTo += len;
  }

  private addGround(x0: number, x1: number) {
    // 바로 이어지는 땅은 한 조각으로 합친다 (사이에 공중 발판이 끼어 있어도)
    for (let i = this.surfaces.length - 1; i >= 0; i--) {
      const s = this.surfaces[i];
      if (s.kind !== 'ground') continue;
      if (Math.abs(s.x1 - x0) < 0.5) {
        s.x1 = x1;
        return;
      }
      break;
    }
    this.surfaces.push({ x0, x1, y: GROUND_Y, kind: 'ground' });
    this.surfaces.sort((a, b) => a.x0 - b.x0);
  }

  private addCoins(x: number, y: number, n: number, gap: number, arc: number) {
    this.pickups.push(...coinLine(x, y, n, gap, arc));
  }

  private addBreather() {
    const x = this.builtTo;
    this.addFlat(BREATHER);
    this.sinceHeart += BREATHER;
    this.sinceItem += BREATHER;
    const heart = this.sinceHeart >= HEART_EVERY;
    const item = this.sinceItem >= ITEM_EVERY;
    // 둘 다 나올 차례면 나란히 — 하트는 앞, 아이템은 뒤 (살짝 뛰어야 닿는 높이)
    if (heart) {
      this.sinceHeart = 0;
      this.pickups.push({ kind: 'heart', x: x + (item ? 30 : BREATHER / 2), y: GROUND_Y - 30 });
    }
    if (item) {
      this.sinceItem = 0;
      this.pickups.push({ kind: 'item', item: this.pickItem(), x: x + (heart ? 80 : BREATHER / 2), y: GROUND_Y - 30 });
    }
  }

  private pickItem(): ItemKind {
    let r = this.rng() * ITEM_WEIGHTS.reduce((a, [, w]) => a + w, 0);
    for (const [k, w] of ITEM_WEIGHTS) {
      r -= w;
      if (r <= 0) return k;
    }
    return 'shield';
  }

  private addChunk(c: Chunk) {
    this.lastId = c.id;
    const out = layoutChunk(c, this.builtTo);
    for (const g of out.grounds) this.addGround(g.x0, g.x1);
    this.surfaces.push(...out.plats);
    this.surfaces.sort((a, b) => a.x0 - b.x0);
    this.obstacles.push(...out.obstacles);
    this.pickups.push(...out.pickups);
    this.pickups.sort((a, b) => a.x - b.x);
    this.builtTo += c.len;
    this.sinceHeart += c.len;
    this.sinceItem += c.len;
  }
}
