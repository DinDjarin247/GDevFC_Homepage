/**
 * 뛰어라 우왕이 — 물리와 발판 생성.
 *
 * 화면(JumpGame)과 발판 생성기가 같은 물리 함수(stepAir)를 쓴다. 생성기는 새 발판을
 * 놓을 때마다 실제 점프를 시뮬레이션해서 "직전 발판에서 정말 닿는지"를 확인하는데,
 * 화면 쪽 물리와 조금이라도 다르면 그 보장이 깨지기 때문이다.
 *
 * 좌표: 위가 +y (고도). x 는 플레이필드 왼쪽 벽이 0. 단위는 가상 픽셀, 10px = 1m.
 * 물리는 1/120초 고정 스텝으로만 돈다 — 그래야 생성기의 시뮬레이션과 한 스텝도
 * 어긋나지 않고, 차징 세기도 정확히 "몇 스텝 눌렀나"로 정해진다.
 */

export const PX_PER_M = 10;

/** 화면에 보이는 세로 범위 (가상 픽셀) — 32m */
export const VIEW_H = 320;
/** 발판이 놓이고 우왕이가 튕겨 나오는 벽 사이 폭 */
export const PLAYFIELD_W = 180;
/** 화면 가로는 기기 비율에 따라 이 사이에서 정해진다. 플레이필드 밖은 배경만 보인다 */
export const MIN_VIEW_W = PLAYFIELD_W;
export const MAX_VIEW_W = 576;

export const PHYS_DT = 1 / 120;
export const GRAVITY = 900;
export const MAX_FALL_SPEED = 560;
export const WALK_SPEED = 62;
/** 이만큼(0.6초) 누르면 최대 세기 — 점프킹처럼 가득 차면 손을 떼지 않아도 저절로 뛴다 */
export const CHARGE_STEPS = 72;
/** 살짝 눌렀을 때 ~2m, 가득 모았을 때 ~12m */
export const JUMP_VY_MIN = 200;
export const JUMP_VY_MAX = 470;
export const JUMP_VX_MIN = 48;
export const JUMP_VX_MAX = 128;
/** 벽에 부딪히면 가로 속도를 이만큼 남기고 반대로 튕긴다 */
export const WALL_BOUNCE = 0.55;
/** 충돌 폭의 절반 — 우왕이 몸통 폭 10px */
export const PLAYER_HALF_W = 5;
/** 발 중심이 발판 끝에서 이만큼 벗어나도 걸쳐 서 있는 것으로 친다 */
export const EDGE_GRACE = 3;
export const PLATFORM_H = 6;

/** 발판 — x 는 왼쪽 끝, y 는 윗면 고도 */
export type Platform = {
  x: number;
  y: number;
  w: number;
  kind: 'ground' | 'main' | 'side';
};

export type Body = { x: number; y: number; vx: number; vy: number };

export type Dir = -1 | 0 | 1;

/** 차징 스텝 수와 방향으로 점프 초속도를 정한다 */
export function jumpVelocity(chargeSteps: number, dir: Dir) {
  const p = Math.min(1, Math.max(0, chargeSteps / CHARGE_STEPS));
  return {
    vx: dir * (JUMP_VX_MIN + (JUMP_VX_MAX - JUMP_VX_MIN) * p),
    vy: JUMP_VY_MIN + (JUMP_VY_MAX - JUMP_VY_MIN) * p,
  };
}

export function isOver(x: number, p: Platform) {
  return x >= p.x - EDGE_GRACE && x <= p.x + p.w + EDGE_GRACE;
}

/**
 * 공중에서 한 스텝 진행한다. 착지하면 그 발판을 돌려준다.
 *
 * 발판은 아래에서 위로는 통과하고(머리를 박지 않는다) 위에서 내려올 때만 밟힌다.
 * platforms 에는 이번 스텝에 걸릴 수 있는 후보만 넘기면 된다.
 */
export function stepAir(b: Body, platforms: readonly Platform[]): Platform | null {
  const prevY = b.y;
  b.vy = Math.max(-MAX_FALL_SPEED, b.vy - GRAVITY * PHYS_DT);
  b.x += b.vx * PHYS_DT;
  b.y += b.vy * PHYS_DT;

  if (b.x < PLAYER_HALF_W) {
    b.x = PLAYER_HALF_W;
    b.vx = -b.vx * WALL_BOUNCE;
  } else if (b.x > PLAYFIELD_W - PLAYER_HALF_W) {
    b.x = PLAYFIELD_W - PLAYER_HALF_W;
    b.vx = -b.vx * WALL_BOUNCE;
  }

  if (b.vy <= 0) {
    let hit: Platform | null = null;
    for (const p of platforms) {
      if (prevY >= p.y && b.y <= p.y && isOver(b.x, p) && (!hit || p.y > hit.y)) hit = p;
    }
    if (hit) {
      b.y = hit.y;
      b.vx = 0;
      b.vy = 0;
      return hit;
    }
  }
  return null;
}

/** 땅 위에서 한 스텝 걷는다. 발판 끝을 벗어나면 false */
export function stepWalk(b: Body, dir: Dir, on: Platform): boolean {
  b.x += dir * WALK_SPEED * PHYS_DT;
  b.x = Math.min(PLAYFIELD_W - PLAYER_HALF_W, Math.max(PLAYER_HALF_W, b.x));
  return isOver(b.x, on);
}

/* ---------- 발판 생성 ---------- */

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

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 고도에 따른 난이도 0~1 — 3km 에서 최대가 되고 그 뒤로는 그대로 */
export function difficulty(y: number) {
  const t = Math.min(1, Math.max(0, y / PX_PER_M / 3000));
  return t * t * (3 - 2 * t);
}

/** 한 번 점프로 갈 수 있는 최고 높이 (가득 모았을 때의 정점, 여유 포함) */
const MAX_APEX = (JUMP_VY_MAX * JUMP_VY_MAX) / (2 * GRAVITY) + 4;

/** 한 번의 점프를 끝까지 따라가서, target 에 착지하는지 본다 */
function landsOn(
  x0: number,
  y0: number,
  steps: number,
  dir: Dir,
  target: Platform,
  candidates: readonly Platform[]
): boolean {
  const v = jumpVelocity(steps, dir);
  const b: Body = { x: x0, y: y0, vx: v.vx, vy: v.vy };
  // 5초 안에 결판이 나지 않는 점프는 없다
  for (let i = 0; i < 600; i++) {
    const hit = stepAir(b, candidates);
    if (hit) return hit === target;
    // 목표 높이보다 아래로 내려가며 지나쳤으면 실패
    if (b.vy < 0 && b.y < target.y) return false;
  }
  return false;
}

/**
 * from 에서 to 로 "사람 손으로 맞출 수 있게" 닿는지.
 *
 * 발판 위 여러 출발 지점 x 세 방향 x 모든 차징 단계를 시뮬레이션해서, 같은 출발점과
 * 방향에서 tolerance 개 이상의 연속된 차징 단계가 to 에 착지하면 닿는다고 본다.
 * 연속 단계를 요구하는 이유: 딱 한 스텝(1/120초)짜리 정답은 사람이 못 맞춘다.
 *
 * interceptors 는 to 보다 높은 곳에 있어서 to 로 내려가는 길을 가로챌 수 있는 발판.
 * 낮은 발판은 to 의 높이를 지나친 뒤에야 만나므로 결과에 영향이 없다.
 */
export function canReach(
  from: Platform,
  to: Platform,
  interceptors: readonly Platform[],
  tolerance: number
): boolean {
  const rise = to.y - from.y;
  if (rise > MAX_APEX) return false;

  // 정점이 목표에 못 미치는 약한 점프는 볼 필요도 없다
  const vyNeeded = Math.sqrt(Math.max(0, 2 * GRAVITY * rise));
  const pNeeded = (vyNeeded - JUMP_VY_MIN) / (JUMP_VY_MAX - JUMP_VY_MIN);
  const minSteps = Math.max(0, Math.ceil(pNeeded * CHARGE_STEPS));
  if (minSteps > CHARGE_STEPS) return false;

  const candidates = [to, ...interceptors.filter((p) => p !== to && p !== from && p.y >= to.y)];

  const stride = from.kind === 'ground' ? 8 : 5;
  const left = Math.max(PLAYER_HALF_W, from.x - EDGE_GRACE);
  const right = Math.min(PLAYFIELD_W - PLAYER_HALF_W, from.x + from.w + EDGE_GRACE);
  const starts: number[] = [];
  for (let x = left; x < right; x += stride) starts.push(x);
  starts.push(right);

  const targetMid = to.x + to.w / 2;
  for (const x0 of starts) {
    // 목표 쪽 방향을 먼저 본다 (대부분 여기서 바로 찾는다). 반대 방향도 벽 튕김으로 닿을 수 있어 다 본다
    const toward: Dir = targetMid >= x0 ? 1 : -1;
    const dirs: Dir[] = [toward, 0, toward === 1 ? -1 : 1];
    for (const dir of dirs) {
      let run = 0;
      for (let s = minSteps; s <= CHARGE_STEPS; s++) {
        if (landsOn(x0, from.y, s, dir, to, candidates)) {
          if (++run >= tolerance) return true;
        } else {
          run = 0;
        }
      }
    }
  }
  return false;
}

/**
 * 끝없이 위로 이어지는 발판들.
 *
 * 뼈대는 "메인" 발판의 사슬이다. 새 메인 발판은 직전 메인 발판에서 canReach 로 닿는
 * 것이 확인된 자리에만 놓이므로, 땅에서부터 끝까지 올라가는 길이 항상 존재한다.
 * 떨어져도 결국 사슬 위 어딘가(최악이면 땅)에 내려앉으니 언제든 다시 오를 수 있다.
 *
 * 사이사이 "곁" 발판을 섞어 쉬어 갈 곳과 갈림길을 만든다. 곁 발판은 두 메인 발판
 * 사이 높이에만 놓는다 — 그보다 높으면 아직 만들지 않은 다음 고리를 가로챌 수 있다.
 * 그래도 아래쪽 고리로 내려오는 점프를 가로챌 수는 있으므로, 곁 발판을 놓을 때마다
 * 최근 고리들을 다시 시뮬레이션해서 하나라도 끊기면 그 곁 발판은 버린다.
 *
 * 나중에 생긴 더 높은 메인 발판이 아래 고리를 가로채는 건 괜찮다 — 사슬의 더 위쪽에
 * 내려앉는 것이니 오히려 앞서 나간 셈이다.
 */
export class PlatformField {
  /** y 오름차순 */
  readonly platforms: Platform[] = [];
  private readonly rng: () => number;
  /** 최근 메인 발판들 (마지막이 가장 높다) */
  private readonly chain: Platform[] = [];

  constructor(seed: number) {
    this.rng = mulberry32(seed);
    const ground: Platform = { x: 0, y: 0, w: PLAYFIELD_W, kind: 'ground' };
    this.platforms.push(ground);
    this.chain.push(ground);
  }

  /** 가장 높은 메인 발판의 고도 */
  get top() {
    return this.chain[this.chain.length - 1].y;
  }

  /** 고도 y 까지 발판을 채운다 */
  extendTo(y: number) {
    while (this.top < y) this.addNext();
  }

  /** 윗면 고도가 [lo, hi] 안에 있는 발판들 */
  query(lo: number, hi: number): Platform[] {
    const out: Platform[] = [];
    for (let i = this.lowerBound(lo); i < this.platforms.length; i++) {
      const p = this.platforms[i];
      if (p.y > hi) break;
      out.push(p);
    }
    return out;
  }

  private lowerBound(y: number) {
    let lo = 0;
    let hi = this.platforms.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.platforms[mid].y < y) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  private insert(p: Platform) {
    this.platforms.splice(this.lowerBound(p.y), 0, p);
  }

  private remove(p: Platform) {
    const i = this.platforms.indexOf(p);
    if (i >= 0) this.platforms.splice(i, 1);
  }

  /** 다른 발판과 겹치거나, 위아래로 붙어서 우왕이가 설 자리가 없는 곳은 안 된다 */
  private isClear(c: Platform) {
    for (const p of this.query(c.y - 34, c.y + 34)) {
      const overlapX = c.x < p.x + p.w + 8 && c.x + c.w > p.x - 8;
      if (overlapX && Math.abs(c.y - p.y) < 32) return false;
    }
    return true;
  }

  private reachable(from: Platform, to: Platform, tolerance: number) {
    return canReach(from, to, this.query(to.y, to.y + MAX_APEX), tolerance);
  }

  private addNext() {
    const rng = this.rng;
    const from = this.chain[this.chain.length - 1];
    const d = difficulty(from.y);
    // 낮은 곳은 넉넉하게(10단계 ≈ 83ms), 높은 곳은 빡빡하게(5단계 ≈ 42ms)
    const tolerance = Math.round(lerp(10, 5, d));

    let placed: Platform | null = null;
    const TRIES = 28;
    for (let i = 0; i < TRIES && !placed; i++) {
      // 실패가 쌓일수록 넓고 낮게 — 어떻게든 다음 발판을 찾는다
      const ease = i / TRIES;
      const w = Math.round(lerp(lerp(52, 26, d), lerp(78, 40, d), rng()) + ease * 18);
      const rise = Math.round(lerp(lerp(32, 46, d), lerp(64, 92, d), rng()) * (1 - ease * 0.45));
      const x = Math.round(rng() * (PLAYFIELD_W - w));
      const c: Platform = { x, y: from.y + Math.max(32, rise), w, kind: 'main' };
      if (this.isClear(c) && this.reachable(from, c, tolerance)) placed = c;
    }
    if (!placed) placed = this.fallback(from);

    this.insert(placed);
    this.chain.push(placed);
    if (this.chain.length > 6) this.chain.shift();

    if (rng() < lerp(0.5, 0.2, d)) this.trySide(from, placed, d);
  }

  /** 무작위 자리가 다 실패했을 때 — 바로 위로 조금씩 올려 가며 닿는 자리를 찾는다 */
  private fallback(from: Platform): Platform {
    const w = 64;
    const mid = from.x + from.w / 2;
    for (let rise = 36; rise <= 96; rise += 6) {
      for (const off of [0, -40, 40, -80, 80]) {
        const x = Math.round(Math.min(PLAYFIELD_W - w, Math.max(0, mid - w / 2 + off)));
        const c: Platform = { x, y: from.y + rise, w, kind: 'main' };
        if (this.isClear(c) && this.reachable(from, c, 3)) return c;
      }
    }
    // 여기까지 오는 일은 없지만, 오더라도 바로 위 제자리 점프 자리는 늘 닿는다
    const x = Math.round(Math.min(PLAYFIELD_W - w, Math.max(0, mid - w / 2)));
    return { x, y: from.y + 36, w, kind: 'main' };
  }

  private trySide(from: Platform, next: Platform, d: number) {
    const rng = this.rng;
    const lo = from.y + 30;
    const hi = next.y - 8;
    if (hi <= lo) return;

    for (let i = 0; i < 4; i++) {
      const w = Math.round(lerp(lerp(40, 24, d), lerp(60, 36, d), rng()));
      const s: Platform = {
        x: Math.round(rng() * (PLAYFIELD_W - w)),
        y: Math.round(lerp(lo, hi, rng())),
        w,
        kind: 'side',
      };
      if (!this.isClear(s)) continue;

      this.insert(s);
      if (this.chainStillHolds()) return;
      this.remove(s);
    }
  }

  /** 최근 고리들이 여전히 이어져 있는지 (곁 발판이 가로채지 않는지) */
  private chainStillHolds() {
    const c = this.chain;
    for (let i = Math.max(1, c.length - 4); i < c.length; i++) {
      if (!this.reachable(c[i - 1], c[i], 3)) return false;
    }
    return true;
  }
}

/* ---------- 고도 구간 ---------- */

export type Zone = {
  id: string;
  /** 시작 고도 (m) */
  from: number;
  ko: string;
  en: string;
};

/**
 * 고도 구간. 앞쪽은 짧게(250~600m) 바뀌어 초반부터 변화가 보이고,
 * 우주에 들어서면 1km 마다 행성 하나씩 지나간다.
 */
export const ZONES: Zone[] = [
  { id: 'forest', from: 0, ko: '숲', en: 'FOREST' },
  { id: 'mountains', from: 250, ko: '산맥', en: 'MOUNTAINS' },
  { id: 'clouds', from: 550, ko: '구름', en: 'CLOUDS' },
  { id: 'skies', from: 900, ko: '구름 위', en: 'ABOVE THE CLOUDS' },
  { id: 'stratosphere', from: 1400, ko: '성층권', en: 'STRATOSPHERE' },
  { id: 'mercury', from: 2000, ko: '수성', en: 'MERCURY' },
  { id: 'venus', from: 3000, ko: '금성', en: 'VENUS' },
  { id: 'earth', from: 4000, ko: '지구', en: 'EARTH' },
  { id: 'mars', from: 5000, ko: '화성', en: 'MARS' },
  { id: 'jupiter', from: 6000, ko: '목성', en: 'JUPITER' },
  { id: 'saturn', from: 7000, ko: '토성', en: 'SATURN' },
  { id: 'uranus', from: 8000, ko: '천왕성', en: 'URANUS' },
  { id: 'neptune', from: 9000, ko: '해왕성', en: 'NEPTUNE' },
  { id: 'pluto', from: 10000, ko: '명왕성', en: 'PLUTO' },
  { id: 'deep', from: 11000, ko: '심우주', en: 'DEEP SPACE' },
];

/** 행성 구간 길이 (m) — 행성 하나가 화면 위에서 아래로 지나가는 동안 오르는 높이 */
export const PLANET_SPAN_M = 1000;

export function zoneIndexAt(meters: number) {
  let i = 0;
  while (i + 1 < ZONES.length && meters >= ZONES[i + 1].from) i++;
  return i;
}
