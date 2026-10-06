/**
 * 뛰어라 우왕이 — 물리와 발판 생성.
 *
 * 화면(JumpGame)과 발판 생성기가 같은 물리 함수(stepAir)를 쓴다. 생성기는 새 발판을
 * 놓을 때마다 실제 점프를 시뮬레이션해서 "직전 발판에서 정말 닿는지"를 확인하는데,
 * 화면 쪽 물리와 조금이라도 다르면 그 보장이 깨지기 때문이다.
 *
 * 좌표: 위가 +y (고도). 단위는 가상 픽셀, 10px = 1m.
 * 월드는 가로로 이어진 원통이다 — x 는 0~WORLD_W 를 돌고, 오른쪽 끝으로 나가면 왼쪽에서
 * 들어온다. 벽이 없으니 튕겨 나오지도, 바깥 낭떠러지로 떨어지지도 않는다.
 * 물리는 1/120초 고정 스텝으로만 돈다 — 그래야 생성기의 시뮬레이션과 한 스텝도
 * 어긋나지 않고, 차징 세기도 정확히 "몇 스텝 눌렀나"로 정해진다.
 */

export const PX_PER_M = 10;

/** 화면에 보이는 세로 범위 (가상 픽셀) — 32m */
export const VIEW_H = 320;
/**
 * 월드 한 바퀴의 폭. 넓은 화면의 최대 가로폭과 같아서, PC 에서는 화면 양 끝이 곧
 * 월드의 이음새다 (같은 발판이 두 번 보이지 않는다). 좁은 화면은 카메라가 옆으로 따라간다.
 */
export const WORLD_W = 576;
/** 화면 가로는 기기 비율에 따라 이 사이에서 정해진다 */
export const MIN_VIEW_W = 180;
export const MAX_VIEW_W = WORLD_W;

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
/** 스프링을 밟으면 이 속도로 튀어 오른다 — 정점 ~32m, 보통 점프의 세 배 가까이 */
export const SPRING_VY = 760;
/** 충돌 폭의 절반 — 우왕이 몸통 폭 10px */
export const PLAYER_HALF_W = 5;
/** 새와 부딪히는 몸 높이 */
export const PLAYER_H = 18;
/** 발 중심이 발판 끝에서 이만큼 벗어나도 걸쳐 서 있는 것으로 친다 */
export const EDGE_GRACE = 3;
export const PLATFORM_H = 6;

/** 발판 — x 는 왼쪽 끝, y 는 윗면 고도. 이음새를 걸쳐 놓이는 발판은 없다 */
export type Platform = {
  x: number;
  y: number;
  w: number;
  kind: 'ground' | 'main' | 'side';
  /** 스프링 점프대 — 밟으면 서지 않고 높이 튀어 오른다 */
  spring?: boolean;
};

export type Body = { x: number; y: number; vx: number; vy: number };

export type Dir = -1 | 0 | 1;

/** x 를 0~WORLD_W 로 감는다 */
export function wrapX(x: number) {
  return ((x % WORLD_W) + WORLD_W) % WORLD_W;
}

/** 이음새를 고려한 가로 거리 (-WORLD_W/2 ~ WORLD_W/2) */
export function wrapDelta(d: number) {
  return wrapX(d + WORLD_W / 2) - WORLD_W / 2;
}

/** 차징 스텝 수와 방향으로 점프 초속도를 정한다 */
export function jumpVelocity(chargeSteps: number, dir: Dir) {
  const p = Math.min(1, Math.max(0, chargeSteps / CHARGE_STEPS));
  return {
    vx: dir * (JUMP_VX_MIN + (JUMP_VX_MAX - JUMP_VX_MIN) * p),
    vy: JUMP_VY_MIN + (JUMP_VY_MAX - JUMP_VY_MIN) * p,
  };
}

export function isOver(x: number, p: Platform) {
  // 이음새 근처 발판은 반대편 끝에 선 발도 걸칠 수 있다
  for (const xx of [x, x - WORLD_W, x + WORLD_W]) {
    if (xx >= p.x - EDGE_GRACE && xx <= p.x + p.w + EDGE_GRACE) return true;
  }
  return false;
}

/**
 * 공중에서 한 스텝 진행한다. 발판에 닿으면 그 발판을 돌려준다.
 *
 * 발판은 아래에서 위로는 통과하고(머리를 박지 않는다) 위에서 내려올 때만 밟힌다.
 * 스프링을 밟으면 서지 않고 그 자리에서 다시 튀어 오른다 — 가로 속도는 그대로라
 * 들어온 방향으로 날아간다. 돌려준 발판의 spring 으로 둘을 구분한다.
 * platforms 에는 이번 스텝에 걸릴 수 있는 후보만 넘기면 된다.
 */
export function stepAir(b: Body, platforms: readonly Platform[]): Platform | null {
  const prevY = b.y;
  b.vy = Math.max(-MAX_FALL_SPEED, b.vy - GRAVITY * PHYS_DT);
  b.x = wrapX(b.x + b.vx * PHYS_DT);
  b.y += b.vy * PHYS_DT;

  if (b.vy <= 0) {
    let hit: Platform | null = null;
    for (const p of platforms) {
      if (prevY >= p.y && b.y <= p.y && isOver(b.x, p) && (!hit || p.y > hit.y)) hit = p;
    }
    if (hit) {
      b.y = hit.y;
      if (hit.spring) {
        b.vy = SPRING_VY;
      } else {
        b.vx = 0;
        b.vy = 0;
      }
      return hit;
    }
  }
  return null;
}

/** 땅 위에서 한 스텝 걷는다. 발판 끝을 벗어나면 false */
export function stepWalk(b: Body, dir: Dir, on: Platform): boolean {
  b.x = wrapX(b.x + dir * WALK_SPEED * PHYS_DT);
  return isOver(b.x, on);
}

/* ---------- 새 ---------- */

/** 정해진 구간을 좌우로 오가는 새 (우주에선 UFO). 부딪히면 튕겨 나간다 */
export type Bird = {
  /** 나는 높이 (몸 가운데) */
  y: number;
  x0: number;
  x1: number;
  speed: number;
  phase: number;
};

export const BIRD_HALF_W = 7;
export const BIRD_HALF_H = 4;

/** 시각 t 에서 새의 위치와 나는 방향 — 구간 양 끝에서 돌아선다 */
export function birdPos(b: Bird, t: number): { x: number; dir: 1 | -1 } {
  const range = b.x1 - b.x0;
  const d = (t * b.speed + b.phase) % (2 * range);
  return d < range ? { x: b.x0 + d, dir: 1 } : { x: b.x1 - (d - range), dir: -1 };
}

/** 몸이 새와 겹치는지 */
export function touchesBird(body: Body, bx: number, by: number) {
  return (
    Math.abs(wrapDelta(body.x - bx)) < PLAYER_HALF_W + BIRD_HALF_W &&
    body.y < by + BIRD_HALF_H &&
    body.y + PLAYER_H > by - BIRD_HALF_H
  );
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
/** 가득 모아 뛰었을 때 가로로 갈 수 있는 거리보다 넉넉히 */
const MAX_REACH_X = 150;

/**
 * rise 만큼 높은 곳에 내려앉을 때 가로로 갈 수 있는 최대 거리 (가득 모아 옆으로 뛴 경우).
 * 정점을 지나 rise 높이까지 내려오는 시간 x 최대 가로 속도. 벽이 없으니 이게 상한이다.
 */
export function reachX(rise: number) {
  const disc = JUMP_VY_MAX * JUMP_VY_MAX - 2 * GRAVITY * Math.max(0, rise);
  if (disc < 0) return 0;
  return (JUMP_VX_MAX * (JUMP_VY_MAX + Math.sqrt(disc))) / GRAVITY;
}

/** 가로로 a 구간과 b 구간이 margin 이내로 붙어 있는지 (이음새 고려) */
function overlapsX(ax: number, aw: number, bx: number, bw: number, margin: number) {
  for (const s of [0, -WORLD_W, WORLD_W]) {
    if (ax < bx + s + bw + margin && ax + aw > bx + s - margin) return true;
  }
  return false;
}

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
    // 스프링이든 다른 발판이든, 목표가 아닌 곳에 먼저 닿으면 실패로 친다
    if (hit) return hit === target;
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

  // 출발점 — 목표에서 가로로 닿을 만한 거리 안의 것만, 가까운 순으로
  const targetMid = to.x + to.w / 2;
  const stride = from.kind === 'ground' ? 8 : 5;
  const starts: number[] = [];
  for (let x = from.x - EDGE_GRACE; x < from.x + from.w + EDGE_GRACE; x += stride) starts.push(wrapX(x));
  starts.push(wrapX(from.x + from.w + EDGE_GRACE));
  const limit = reachX(rise) + to.w / 2 + EDGE_GRACE + 2;
  const near = starts
    .map((x) => ({ x, d: wrapDelta(targetMid - x) }))
    .filter((s) => Math.abs(s.d) <= limit)
    .sort((a, b) => Math.abs(a.d) - Math.abs(b.d));

  for (const { x: x0, d } of near) {
    // 목표 쪽 방향을 먼저 본다 (대부분 여기서 바로 찾는다)
    const toward: Dir = d >= 0 ? 1 : -1;
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

/** 오르는 길 하나 — 메인 발판의 사슬과, 이 길이 주로 머무는 가로 위치 */
type Chain = { lane: number; links: Platform[] };

/**
 * 끝없이 위로 이어지는 발판들.
 *
 * 뼈대는 "메인" 발판의 사슬 세 줄이다. 새 메인 발판은 같은 사슬의 직전 발판에서
 * canReach 로 닿는 것이 확인된 자리에만 놓이므로, 땅에서부터 끝까지 올라가는 길이
 * 적어도 세 갈래 존재한다. 사슬은 저마다 주로 머무는 가로 위치(lane)가 있어 월드
 * 전체에 고르게 퍼지지만, 서로 가까워지기도 해서 길을 갈아탈 수 있다.
 * 떨어져도 결국 어느 사슬 위(최악이면 땅)에 내려앉으니 언제든 다시 오를 수 있다.
 *
 * 사이사이 "곁" 발판(일부는 스프링)을 섞어 쉬어 갈 곳과 지름길을 만든다. 곁 발판은
 * 두 메인 발판 사이 높이에만 놓는다 — 그보다 높으면 아직 만들지 않은 다음 고리를
 * 가로챌 수 있다. 그래도 아래쪽 고리로 내려오는 점프를 가로챌 수는 있으므로, 곁
 * 발판을 놓을 때마다 모든 사슬의 최근 고리를 다시 시뮬레이션해서 하나라도 끊기면
 * 그 곁 발판은 버린다.
 *
 * 나중에 생긴 더 높은 메인 발판이 아래 고리를 가로채는 건 괜찮다 — 어느 사슬이든
 * 더 위쪽 메인 발판에 내려앉는 것이니 오히려 앞서 나간 셈이다.
 *
 * 새는 생성이 끝난 높이(모든 사슬의 꼭대기보다 충분히 아래)에만 놓는다. 그래야
 * 나중에 생길 발판과 겹칠 일이 없어, "발판에 서 있는 높이"를 정확히 피할 수 있다.
 */
export class PlatformField {
  /** y 오름차순 */
  readonly platforms: Platform[] = [];
  /** y 오름차순 */
  readonly birds: Bird[] = [];
  private readonly rng: () => number;
  private readonly chains: Chain[];
  private nextBirdY = 40 * PX_PER_M;

  constructor(seed: number) {
    this.rng = mulberry32(seed);
    const ground: Platform = { x: 0, y: 0, w: WORLD_W, kind: 'ground' };
    this.platforms.push(ground);
    this.chains = [1, 3, 5].map((k) => ({ lane: (WORLD_W * k) / 6, links: [ground] }));
  }

  /** 가장 낮은 사슬의 꼭대기 — 여기까지는 모든 길이 완성돼 있다 */
  get top() {
    return Math.min(...this.chains.map((c) => c.links[c.links.length - 1].y));
  }

  /**
   * 고도 y 까지 발판을 채운다. budgetMs 를 주면 그 시간을 넘기는 즉시 멈추고 다음
   * 호출에서 이어 한다 — 게임 화면은 세 화면 높이를 미리 만들어 두므로 조금씩 나눠도 충분하다.
   */
  extendTo(y: number, budgetMs = Infinity) {
    const start = budgetMs === Infinity ? 0 : performance.now();
    while (this.top < y) {
      if (budgetMs !== Infinity && performance.now() - start > budgetMs) return;
      // 가장 뒤처진 사슬부터 한 칸씩 — 세 길이 나란히 올라간다
      let low = this.chains[0];
      for (const c of this.chains) {
        if (c.links[c.links.length - 1].y < low.links[low.links.length - 1].y) low = c;
      }
      this.addNext(low);
      this.placeBirds();
    }
  }

  /** 윗면 고도가 [lo, hi] 안에 있는 발판들 */
  query(lo: number, hi: number): Platform[] {
    return sliceByY(this.platforms, lo, hi);
  }

  /** 나는 높이가 [lo, hi] 안에 있는 새들 */
  queryBirds(lo: number, hi: number): Bird[] {
    return sliceByY(this.birds, lo, hi);
  }

  private insert(p: Platform) {
    this.platforms.splice(lowerBound(this.platforms, p.y), 0, p);
  }

  private remove(p: Platform) {
    const i = this.platforms.indexOf(p);
    if (i >= 0) this.platforms.splice(i, 1);
  }

  /** 다른 발판과 겹치거나, 위아래로 붙어서 우왕이가 설 자리가 없는 곳은 안 된다 */
  private isClear(c: Platform) {
    for (const p of this.query(c.y - 34, c.y + 34)) {
      if (overlapsX(c.x, c.w, p.x, p.w, 8) && Math.abs(c.y - p.y) < 32) return false;
    }
    return true;
  }

  private reachable(from: Platform, to: Platform, tolerance: number) {
    return canReach(from, to, this.query(to.y, to.y + MAX_APEX), tolerance);
  }

  private addNext(chain: Chain) {
    const rng = this.rng;
    const from = chain.links[chain.links.length - 1];
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
      // 직전 발판에서 실제로 닿을 수 있는 가로 범위 안에서 고른다. 이 길의 자리(lane)에서
      // 멀어졌으면 그쪽으로 돌아가는 쪽을 더 자주 골라, 세 길이 월드 전체에 고르게 퍼진다
      let mid: number;
      if (from.kind === 'ground') {
        mid = wrapX(chain.lane + (rng() * 2 - 1) * 110);
      } else {
        const fromMid = from.x + from.w / 2;
        const backToLane = wrapDelta(chain.lane - fromMid);
        const sign = Math.abs(backToLane) > 60 && rng() < 0.7 ? Math.sign(backToLane) : rng() < 0.5 ? -1 : 1;
        mid = wrapX(fromMid + sign * rng() * (from.w / 2 + reachX(rise) * 0.9));
      }
      const x = Math.round(Math.min(WORLD_W - w, Math.max(0, mid - w / 2)));
      const c: Platform = { x, y: from.y + Math.max(32, rise), w, kind: 'main' };
      if (this.isClear(c) && this.reachable(from, c, tolerance)) placed = c;
    }
    if (!placed) placed = this.fallback(from);

    this.insert(placed);
    chain.links.push(placed);
    if (chain.links.length > 6) chain.links.shift();

    if (rng() < lerp(0.6, 0.3, d)) this.trySide(from, placed, d);
  }

  /** 무작위 자리가 다 실패했을 때 — 바로 위로 조금씩 올려 가며 닿는 자리를 찾는다 */
  private fallback(from: Platform): Platform {
    const w = 64;
    const mid = from.kind === 'ground' ? WORLD_W / 2 : from.x + from.w / 2;
    for (let rise = 36; rise <= 96; rise += 6) {
      for (const off of [0, -40, 40, -80, 80]) {
        const x = Math.round(Math.min(WORLD_W - w, Math.max(0, mid - w / 2 + off)));
        const c: Platform = { x, y: from.y + rise, w, kind: 'main' };
        if (this.isClear(c) && this.reachable(from, c, 3)) return c;
      }
    }
    // 여기까지 오는 일은 없지만, 오더라도 바로 위 제자리 점프 자리는 늘 닿는다
    const x = Math.round(Math.min(WORLD_W - w, Math.max(0, mid - w / 2)));
    return { x, y: from.y + 36, w, kind: 'main' };
  }

  private trySide(from: Platform, next: Platform, d: number) {
    const rng = this.rng;
    const lo = from.y + 30;
    const hi = next.y - 8;
    if (hi <= lo) return;

    // 스프링은 30m 넘어서부터, 곁 발판 다섯 중 하나꼴
    const spring = from.y > 30 * PX_PER_M && rng() < 0.2;
    for (let i = 0; i < 4; i++) {
      const w = spring ? 22 : Math.round(lerp(lerp(40, 24, d), lerp(60, 36, d), rng()));
      // 곁 발판은 두 메인 발판 사이 어디쯤, 좌우로 넓게
      const mid = wrapX(lerp(from.x, next.x, rng()) + (rng() * 2 - 1) * 170);
      const s: Platform = {
        x: Math.round(Math.min(WORLD_W - w, Math.max(0, mid - w / 2))),
        y: Math.round(lerp(lo, hi, rng())),
        w,
        kind: 'side',
        ...(spring ? { spring: true } : {}),
      };
      if (!this.isClear(s)) continue;

      this.insert(s);
      if (this.chainsStillHold(s)) return;
      this.remove(s);
    }
  }

  /**
   * 곁 발판 s 가 들어와도 모든 사슬의 최근 고리가 여전히 이어져 있는지.
   * s 가 가로챌 수 있는 고리만 다시 시뮬레이션한다 — 도착 발판보다 높고, 출발점에서
   * 뛰어 닿을 만한 높이 안이며, 가로로도 그 점프가 지나갈 만한 범위에 있는 고리.
   */
  private chainsStillHold(s: Platform) {
    for (const chain of this.chains) {
      const c = chain.links;
      for (let i = Math.max(1, c.length - 4); i < c.length; i++) {
        const a = c[i - 1];
        const b = c[i];
        if (s.y < b.y || s.y > a.y + MAX_APEX) continue;
        const nearA = a.kind === 'ground' || overlapsX(s.x, s.w, a.x, a.w, MAX_REACH_X);
        const nearB = overlapsX(s.x, s.w, b.x, b.w, MAX_REACH_X);
        if (!nearA && !nearB) continue;
        if (!this.reachable(a, b, 3)) return false;
      }
    }
    return true;
  }

  /**
   * 생성이 끝난 높이까지 새를 놓는다. 새는 정해진 가로 구간을 오가며, 그 구간 안의
   * 발판에 서 있는 우왕이의 몸 높이와는 겹치지 않게 한다 — 서 있다가 날벼락 맞는 일은
   * 없고, 뛰어오르다 부딪힐 뿐이다.
   */
  private placeBirds() {
    const rng = this.rng;
    const settled = this.top - 40;
    while (this.nextBirdY < settled) {
      const base = this.nextBirdY;
      const d = difficulty(base);
      this.nextBirdY += Math.round(lerp(220, 110, d) * lerp(0.75, 1.25, rng()));

      for (let i = 0; i < 12; i++) {
        const y = Math.round(base + (rng() * 2 - 1) * 40);
        const range = Math.round(lerp(100, 220, rng()));
        const x0 = Math.round(rng() * (WORLD_W - range - 16)) + 8;
        const x1 = x0 + range;
        // 서 있는 몸(발판 윗면 ~ +PLAYER_H)과 새의 몸(±BIRD_HALF_H)이 겹치는 높이는 피한다
        const blocked = this.query(y - PLAYER_H - BIRD_HALF_H - 2, y + BIRD_HALF_H + 2).some((p) =>
          overlapsX(x0, range, p.x, p.w, BIRD_HALF_W + PLAYER_HALF_W + 2)
        );
        if (blocked) continue;
        const bird: Bird = { y, x0, x1, speed: Math.round(lerp(28, 62, d) * lerp(0.85, 1.15, rng())), phase: rng() * range * 2 };
        this.birds.splice(lowerBound(this.birds, y), 0, bird);
        break;
      }
    }
  }
}

function lowerBound(list: readonly { y: number }[], y: number) {
  let lo = 0;
  let hi = list.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (list[mid].y < y) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function sliceByY<T extends { y: number }>(list: readonly T[], lo: number, hi: number): T[] {
  const out: T[] = [];
  for (let i = lowerBound(list, lo); i < list.length; i++) {
    if (list[i].y > hi) break;
    out.push(list[i]);
  }
  return out;
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
