'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { PLAZA_ART } from '@/lib/plazaArt';
import { STATUE, phaseAt, seasonAt, type DayPhase, type Season } from '@/lib/plazaLayout';

/** 메뉴(ModePlaza)와 주고받는 것 — 지금 고른 주인공, 잠긴 모드, 움직이는 주인공의 자리 알림 */
export type HeroControl = {
  active: string | null;
  locked: Record<string, boolean>;
  move?: (id: string, x: number, y: number) => void;
};

type PlazaSceneProps = {
  className?: string;
  /** 접속 기기의 현지 시각 기준 시간대. 생략하면 마운트 시점에 계산한다 */
  phase?: DayPhase;
  /** 계절 옷 — 생략하면 오늘 날짜로 정한다 */
  season?: Season;
  control?: RefObject<HeroControl | null>;
};

/**
 * SELECT MODE 배경 — 언덕 도시의 계단 광장.
 *
 * 그림은 전부 미리 구워 둔 이미지다 (art/plaza 의 스크립트가 만들고 `npm run art` 로 다시 굽는다).
 * 시간대(새벽 · 아침 · 점심 · 오후 · 저녁 · 심야)마다 다섯 장을 쓴다:
 *
 *   sky      하늘
 *   clouds   흘러가는 구름 (가로로 이어 붙는다)
 *   back     먼 성 · 윗마을 · 윗마당 건물
 *   front    난간 · 옹벽 · 큰 계단 · 아래 광장 바닥
 *   sprites  소품 · 불꽃 같은 움직이는 것들의 시트
 *
 * 계절(가을 · 크리스마스)마다 그림 묶음이 따로 있다 (public/art/plaza/<계절>/). 크리스마스에는 눈이 내리고
 * 장식줄 · 트리 · 나무의 꼬마전구가 반짝인다 (전구 자리는 굽기가 내보내고, 여기서 시간대에 맞춰 켠다).
 *
 * 사람(마을 사람 · 주인공)은 people.png 한 장에 다섯 방향(왼쪽 셋은 뒤집어 쓴다) · 걷기 8프레임 ·
 * 서기 · 손짓으로 구워져 있고, 시간대 색은 받은 뒤 대응표대로 한 번 칠한다.
 *
 * 마을 사람은 걸을 수 있는 곳의 지도(nav) 위에서 볼거리를 골라 길을 찾아(A*) 걸어간다.
 * 걷는 프레임은 걸은 거리로 넘긴다 — 한 바퀴(8프레임)에 CYCLE x 크기만큼 가므로 디딘 발이 미끄러지지 않는다.
 * 주인공은 대본(프레임 · 초 목록)대로 움직이고, 메뉴에서 고르면 화면을 보고 인사한다.
 *
 * 화면에는 정수 배율(k)로 키워 그린 뒤 CSS 로 상자에 맞춘다. 캔버스를 곧바로 소수 배율로
 * 늘리면 픽셀 굵기가 들쭉날쭉해져 가는 선이 깨지기 때문이다.
 */

const A = PLAZA_ART;
const W = A.w;
const H = A.h;
const RECTS = A.sprites as unknown as Record<string, readonly number[]>;

const PEOPLE = A.people;
const PR = PEOPLE.rects as unknown as Record<string, readonly number[]>;
const PA = PEOPLE.anchors as unknown as Record<string, Record<string, readonly number[]>>;
const KINDS = PEOPLE.kinds as unknown as Record<string, readonly number[]>;
const SCALES = PEOPLE.scales as unknown as readonly number[];
const FACE = PEOPLE.face as unknown as Record<string, readonly [string, boolean]>;
const YC: number = PEOPLE.yc;
const CYCLE: number = PEOPLE.cycle;
const LAYER_Y: number = A.layerY;
const FACES = ['S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW'] as const;
const faceIndex = (name: string | undefined) => Math.max(0, FACES.indexOf((name ?? 'S') as (typeof FACES)[number]));

type Script = readonly (readonly [string, number])[];
type HeroDef = {
  hero: string;
  script: Script;
  greet: Script;
  walk?: {
    right: readonly string[];
    left: readonly string[];
    speed: number;
    span: readonly number[];
    rest: number;
    cycle: number;
    turnL: string;
    turnR: string;
  };
  scale: number;
  height: number;
  sortY?: number;
  noShadow?: boolean;
};
const HEROES = A.heroes as unknown as Record<string, HeroDef>;
const SPOTS = A.spots as unknown as Record<string, { x: number; y: number }>;

type NpcSpec = { kind: string; mode: string; zone?: string; x: number; y: number; speed?: number; face?: string; chat?: number };
type Poi = { x: number; y: number; zone: string; face: string; tag?: string };
const NPC_SPECS = A.npcs as unknown as readonly NpcSpec[];
const POIS = A.pois as unknown as readonly Poi[];

/** 거리(화면 y)에 따른 몸 크기 — 굽는 쪽(art/plaza/npcs.js 의 scaleAtY)과 같은 식 */
const scaleAtY = (y: number) => Math.min(1, Math.max(0.62, 0.62 + ((y - 312) * 0.38) / 208));

type Agent = {
  kind: string;
  walker: boolean;
  zones: string[];
  x: number;
  y: number;
  speed: number;
  face: number;
  want: number;
  turnT: number;
  path: [number, number][];
  state: 'idle' | 'walk' | 'enter' | 'inside' | 'leave';
  timer: number;
  phase: number;
  bucket: number;
  chat: number | null;
  poi: number;
  alpha: number;
  seed: number;
};

type Drawable = { y: number; draw: (t: number) => void };
type Bulb = readonly [number, number, number];
type SeasonArt = {
  snow: boolean;
  props: readonly { id: string; sprite: string; x: number; y: number; frames?: number; fps?: number }[];
  fires: readonly (readonly number[])[];
  bulbs: { back: readonly Bulb[]; front: readonly Bulb[]; sprites: Record<string, readonly Bulb[]> };
  peopleColors: readonly number[];
  phases: Record<
    DayPhase,
    {
      lamps: number;
      leaves: readonly string[];
      hand: string;
      smoke: string;
      shadow: number;
      stars: readonly (readonly [number, number])[];
      people: readonly number[];
    }
  >;
};

/** 꼬마전구 색 — 0 따뜻한 흰색, 1 빨강, 2 초록, 3 금색, 4 파랑 (art/plaza/season.js 와 같은 순서) */
const BULB_ON = ['255, 240, 184', '255, 72, 72', '88, 255, 124', '255, 210, 74', '106, 184, 255'];
const BULB_OFF = ['#9a8f72', '#8a3434', '#2f7a46', '#8a7232', '#3a5f88'];

function load(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** 사람 시트를 시간대 색으로 칠한 사본 */
function recolor(img: HTMLImageElement, colors: readonly number[], graded: readonly number[]) {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const x = c.getContext('2d', { willReadFrequently: true });
  if (!x) return c;
  x.drawImage(img, 0, 0);
  const data = x.getImageData(0, 0, c.width, c.height);
  const px = new Uint32Array(data.data.buffer);
  const map = new Map<number, number>();
  colors.forEach((col, i) => map.set(col, graded[i]));
  for (let i = 0; i < px.length; i++) {
    const v = px[i];
    if (v >>> 24 === 0) continue;
    const g = map.get(v & 0xffffff);
    if (g !== undefined) px[i] = ((v & 0xff000000) | g) >>> 0;
  }
  x.putImageData(data, 0, 0);
  return c;
}

/* ---------- 길 찾기 ---------- */

const NAV = A.nav;

function decodeNav() {
  const n = NAV.cols * NAV.rows;
  const g = new Uint8Array(n);
  const bin = atob(NAV.bits);
  for (let i = 0; i < n; i++) g[i] = (bin.charCodeAt(i >> 3) >> (i & 7)) & 1;
  return g;
}

/** 작은 최소 힙 (A* 의 열린 목록) */
class Heap {
  private k: number[] = [];
  private v: number[] = [];
  get size() {
    return this.k.length;
  }
  push(key: number, val: number) {
    const k = this.k, v = this.v;
    let i = k.length;
    k.push(key);
    v.push(val);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (k[p] <= key) break;
      k[i] = k[p];
      v[i] = v[p];
      i = p;
    }
    k[i] = key;
    v[i] = val;
  }
  pop() {
    const k = this.k, v = this.v;
    const top = v[0];
    const lk = k.pop()!, lv = v.pop()!;
    if (k.length) {
      let i = 0;
      for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let m = i;
        let mk = lk;
        if (l < k.length && k[l] < mk) {
          m = l;
          mk = k[l];
        }
        if (r < k.length && k[r] < mk) m = r;
        if (m === i) break;
        k[i] = k[m];
        v[i] = v[m];
        i = m;
      }
      k[i] = lk;
      v[i] = lv;
    }
    return top;
  }
}

function makePathfinder(grid: Uint8Array) {
  const { cell: C, cols, rows } = NAV;
  const idxOf = (x: number, y: number) => {
    const c = Math.min(cols - 1, Math.max(0, Math.floor(x / C)));
    const r = Math.min(rows - 1, Math.max(0, Math.floor(y / C)));
    return r * cols + c;
  };
  const ok = (x: number, y: number) => grid[idxOf(x, y)] === 1;
  /** 두 점 사이가 막힘없이 걸을 수 있는가 — 2픽셀마다 확인 */
  const sight = (a: [number, number], b: [number, number]) => {
    const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2);
    for (let i = 1; i < n; i++) if (!ok(a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n)) return false;
    return true;
  };
  const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const cost = N8.map(([dc, dr]) => Math.hypot(dc, dr / YC));
  const g = new Float32Array(cols * rows);
  const from = new Int32Array(cols * rows);
  const closed = new Uint8Array(cols * rows);

  return function find(sx: number, sy: number, tx: number, ty: number): [number, number][] | null {
    let s = idxOf(sx, sy);
    const t = idxOf(tx, ty);
    if (!grid[t]) return null;
    if (!grid[s]) {
      // 지도 밖에 서 있으면 가장 가까운 걸을 수 있는 칸에서 출발한다
      let best = -1, bd = 1e9;
      const sc = s % cols, sr = Math.floor(s / cols);
      for (let dr = -4; dr <= 4; dr++)
        for (let dc = -4; dc <= 4; dc++) {
          const c = sc + dc, r = sr + dr;
          if (c < 0 || r < 0 || c >= cols || r >= rows || !grid[r * cols + c]) continue;
          const d = Math.hypot(dc, dr / YC);
          if (d < bd) {
            bd = d;
            best = r * cols + c;
          }
        }
      if (best < 0) return null;
      s = best;
    }
    g.fill(1e9);
    from.fill(-1);
    closed.fill(0);
    const tc = t % cols, tr = Math.floor(t / cols);
    const hOf = (i: number) => Math.hypot((i % cols) - tc, (Math.floor(i / cols) - tr) / YC);
    const open = new Heap();
    g[s] = 0;
    open.push(hOf(s), s);
    let found = false;
    let guard = 0;
    while (open.size && guard++ < 40000) {
      const cur = open.pop();
      if (closed[cur]) continue;
      if (cur === t) {
        found = true;
        break;
      }
      closed[cur] = 1;
      const cc = cur % cols, cr = Math.floor(cur / cols);
      for (let k = 0; k < 8; k++) {
        const nc = cc + N8[k][0], nr = cr + N8[k][1];
        if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
        const ni = nr * cols + nc;
        if (!grid[ni] || closed[ni]) continue;
        // 모서리를 비스듬히 가로지르지 않는다
        if (k >= 4 && (!grid[cr * cols + nc] || !grid[nr * cols + cc])) continue;
        const ng = g[cur] + cost[k];
        if (ng < g[ni]) {
          g[ni] = ng;
          from[ni] = cur;
          open.push(ng + hOf(ni), ni);
        }
      }
    }
    if (!found) return null;
    const cells: [number, number][] = [];
    for (let i = t; i !== -1; i = from[i]) cells.push([(i % cols) * C + C / 2, Math.floor(i / cols) * C + C / 2]);
    cells.reverse();
    cells[0] = [sx, sy];
    cells[cells.length - 1] = [tx, ty];
    // 줄 당기기 — 막힘없이 보이는 가장 먼 점으로 곧장 간다
    const out: [number, number][] = [cells[0]];
    let i = 0;
    while (i < cells.length - 1) {
      let j = cells.length - 1;
      while (j > i + 1 && !sight(cells[i], cells[j])) j--;
      out.push(cells[j]);
      i = j;
    }
    return out.slice(1);
  };
}

export default function PlazaScene({ className, phase, season, control }: PlazaSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx2d = canvasEl.getContext('2d');
    if (!ctx2d) return;
    const ctx: CanvasRenderingContext2D = ctx2d;
    const canvas: HTMLCanvasElement = canvasEl;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const active: DayPhase = phase ?? phaseAt(new Date());
    const seasonName: Season = season ?? seasonAt(new Date());
    const SEA = A.seasons[seasonName] as unknown as SeasonArt;
    const info = SEA.phases[active];
    const lampsOn = info.lamps > 0.3;

    let alive = true;
    let raf = 0;
    let k = 1;

    /** 화면에 그려지는 크기에 맞춰 정수 배율을 고른다 (1~3배) */
    function fit() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const need = Math.max((rect.width * dpr) / W, (rect.height * dpr) / H);
      const next = Math.min(3, Math.max(1, Math.ceil(need - 0.05)));
      if (next !== k || canvas.width !== W * next) {
        k = next;
        canvas.width = W * k;
        canvas.height = H * k;
      }
    }
    fit();
    const ro = new ResizeObserver(() => {
      fit();
      if (reduced && images) frame(performance.now());
    });
    ro.observe(canvas);

    type Images = {
      sky: HTMLImageElement;
      clouds: HTMLImageElement;
      back: HTMLImageElement;
      front: HTMLImageElement;
      sheet: HTMLImageElement;
      people: HTMLImageElement;
      peopleG: HTMLCanvasElement;
    };
    let images: Images | null = null;

    // ---------- 조각 그리기 ----------

    function spr(name: string, x: number, y: number, flip = false) {
      const r = RECTS[name];
      if (!r || !images) return;
      const [sx, sy, sw, sh, ax, ay] = r;
      if (flip) {
        ctx.save();
        ctx.translate(Math.round(x) + ax + 1, Math.round(y) - ay);
        ctx.scale(-1, 1);
        ctx.drawImage(images.sheet, sx, sy, sw, sh, 0, 0, sw, sh);
        ctx.restore();
      } else {
        ctx.drawImage(images.sheet, sx, sy, sw, sh, Math.round(x) - ax, Math.round(y) - ay, sw, sh);
      }
    }

    /** 사람 한 장 — raw 면 시간대 색을 입히지 않은 원래 색 (고른 주인공) */
    function person(name: string, x: number, y: number, flip = false, raw = false) {
      const r = PR[name];
      if (!r || !images) return;
      const [sx, sy, sw, sh, ax, ay] = r;
      const src = raw ? images.people : images.peopleG;
      if (flip) {
        ctx.save();
        ctx.translate(Math.round(x) + ax + 1, Math.round(y) - ay);
        ctx.scale(-1, 1);
        ctx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
        ctx.restore();
      } else {
        ctx.drawImage(src, sx, sy, sw, sh, Math.round(x) - ax, Math.round(y) - ay, sw, sh);
      }
    }

    /** 사람 프레임의 기준점(손 · 구슬 · 화살 끝)을 화면 좌표로 */
    function anchor(name: string, key: string, x: number, y: number, flip = false): [number, number] | null {
      const a = PA[name]?.[key];
      if (!a) return null;
      return [Math.round(x) + (flip ? -a[0] : a[0]), Math.round(y) + a[1]];
    }

    /** 발밑 그림자 */
    function shadow(x: number, y: number, half: number) {
      ctx.fillStyle = `rgba(0, 0, 0, ${info.shadow})`;
      const X = Math.round(x);
      ctx.fillRect(X - half, y - 1, half * 2, 2);
      ctx.fillRect(X - half + 2, y - 2, half * 2 - 4, 4);
    }

    /**
     * 꼬마전구 — 밤 · 저녁에는 켜서 반짝이고(색 전구는 깜빡, 흰 전구는 은은하게), 낮에는 꺼진 색만.
     * (ox, oy) 는 전구 좌표에 더할 자리 (소품에 달린 전구는 그 소품 그림의 왼쪽 위)
     */
    function bulbs(list: readonly Bulb[], ox: number, oy: number, t: number, seed: number) {
      if (!list.length) return;
      if (!lampsOn) {
        for (const [x, y, c] of list) {
          ctx.fillStyle = BULB_OFF[c];
          ctx.fillRect(x + ox, y + oy, 1, 1);
        }
        return;
      }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      list.forEach(([x, y, c], i) => {
        const k = i + seed;
        const on = reduced ? 1 : c === 0 ? 0.75 + 0.25 * Math.sin(t * 1.3 + k * 0.9) : Math.sin(t * 2.2 + k * 1.7) > -0.35 ? 1 : 0.25;
        ctx.fillStyle = `rgba(${BULB_ON[c]}, ${0.2 * on})`;
        ctx.fillRect(x + ox - 1, y + oy - 1, 3, 3);
        ctx.fillStyle = `rgba(${BULB_ON[c]}, ${on})`;
        ctx.fillRect(x + ox, y + oy, 1, 1);
      });
      ctx.restore();
    }

    /** 불빛이 번지는 자리 — 등불 켜진 시간대에만 은은하게 일렁인다 */
    function glow(x: number, y: number, r: number, color: string, alpha: number) {
      const g = ctx.createRadialGradient(x, y, 1, x, y, r);
      g.addColorStop(0, `rgba(${color}, ${alpha})`);
      g.addColorStop(1, `rgba(${color}, 0)`);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.restore();
    }

    // ---------- 마을 사람 ----------

    const grid = decodeNav();
    const findPath = makePathfinder(grid);
    const reserved = new Set<number>();
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const agents: Agent[] = NPC_SPECS.map((n, i) => {
      const walker = n.mode === 'walk';
      const zones = n.zone === 'any' ? ['terrace', 'court'] : [n.zone ?? 'court'];
      const f = faceIndex(n.face ?? (walker ? FACES[(i * 3) % 8] : 'S'));
      return {
        kind: n.kind,
        walker,
        zones,
        x: n.x,
        y: n.y,
        speed: n.speed ?? 18,
        face: f,
        want: f,
        turnT: 0,
        path: [],
        state: 'idle',
        timer: walker ? rand(0.4, 5) : 0,
        phase: Math.random(),
        bucket: nearestBucket(n.kind, scaleAtY(n.y), -1),
        chat: n.chat ?? null,
        poi: -1,
        alpha: 1,
        seed: (i * 0.37) % 1,
      };
    });

    function nearestBucket(kind: string, s: number, cur: number) {
      const list = KINDS[kind] ?? [0];
      let best = list[0];
      for (const b of list) if (Math.abs(SCALES[b] - s) < Math.abs(SCALES[best] - s)) best = b;
      if (cur >= 0 && list.includes(cur) && Math.abs(SCALES[cur] - s) - Math.abs(SCALES[best] - s) < 0.014) return cur;
      return best;
    }

    /** 다음 볼거리를 골라 길을 낸다 */
    function startTrip(a: Agent) {
      const cand: number[] = [];
      POIS.forEach((p, i) => {
        if (!a.zones.includes(p.zone) || reserved.has(i) || i === a.poi) return;
        if (Math.hypot(p.x - a.x, (p.y - a.y) / YC) < 40) return;
        cand.push(i);
      });
      for (let tries = 0; tries < 4 && cand.length; tries++) {
        const pick = cand.splice(Math.floor(Math.random() * cand.length), 1)[0];
        const p = POIS[pick];
        const path = findPath(a.x, a.y, p.x, p.y);
        if (!path || !path.length) continue;
        if (a.poi >= 0) reserved.delete(a.poi);
        reserved.add(pick);
        a.poi = pick;
        a.path = path;
        a.state = 'walk';
        return;
      }
      a.timer = rand(1, 2.5);
    }

    function headingOf(dx: number, dy: number) {
      const ang = Math.atan2(dx, dy / YC);
      return ((Math.round(ang / (Math.PI / 4)) % 8) + 8) % 8;
    }

    function updateAgent(a: Agent, dt: number) {
      // 몸 돌리기 — 한 번에 45도씩, 가장 가까운 쪽으로
      a.turnT -= dt;
      if (a.face !== a.want && a.turnT <= 0) {
        const diff = (a.want - a.face + 8) % 8;
        a.face = (a.face + (diff <= 4 ? 1 : -1) + 8) % 8;
        a.turnT = 0.075;
      }
      if (!a.walker) return;
      switch (a.state) {
        case 'idle':
          a.timer -= dt;
          if (a.timer <= 0) startTrip(a);
          break;
        case 'walk': {
          const tgt = a.path[0];
          if (!tgt) break;
          const gx = tgt[0] - a.x, gy = (tgt[1] - a.y) / YC;
          const dist = Math.hypot(gx, gy);
          a.want = headingOf(tgt[0] - a.x, tgt[1] - a.y);
          // 크게 도는 중에는 제자리에서 몸부터 돌린다 (옆걸음으로 미끄러지지 않게)
          const diff = Math.min((a.want - a.face + 8) % 8, (a.face - a.want + 8) % 8);
          if (diff >= 2) break;
          const s = scaleAtY(a.y);
          const step = a.speed * s * dt;
          a.phase = (a.phase + (a.speed * dt) / CYCLE) % 1;
          if (step >= dist) {
            a.x = tgt[0];
            a.y = tgt[1];
            a.path.shift();
            if (!a.path.length) {
              const p = POIS[a.poi];
              a.want = faceIndex(p?.face);
              if (p?.tag === 'door') {
                a.state = 'enter';
                a.timer = 0.45;
              } else {
                a.state = 'idle';
                a.timer = rand(2.5, 7.5);
              }
            }
          } else {
            a.x += (gx / dist) * step;
            a.y += (gy / dist) * step * YC;
          }
          break;
        }
        case 'enter':
          a.alpha = Math.max(0, a.alpha - dt / 0.45);
          if (a.alpha <= 0) {
            a.state = 'inside';
            a.timer = rand(4, 11);
          }
          break;
        case 'inside':
          a.timer -= dt;
          if (a.timer <= 0) {
            a.state = 'leave';
            a.face = a.want = 0;
          }
          break;
        case 'leave':
          a.alpha = Math.min(1, a.alpha + dt / 0.45);
          if (a.alpha >= 1) {
            a.state = 'idle';
            a.timer = rand(0.8, 2.5);
          }
          break;
      }
      a.bucket = nearestBucket(a.kind, scaleAtY(a.y), a.bucket);
    }

    function frameOf(a: Agent, t: number) {
      const [dir, flip] = FACE[FACES[a.face]];
      let anim = 'i0';
      const moving = a.state === 'walk' && a.path.length && a.face === a.want;
      if (!reduced) {
        if (moving || (a.state === 'walk' && a.path.length && Math.min((a.want - a.face + 8) % 8, (a.face - a.want + 8) % 8) < 2)) {
          anim = `w${Math.floor(a.phase * 8) % 8}`;
        } else if (a.chat !== null) {
          const u = (t * 0.9 + a.chat) % 3.4;
          anim = u < 0.14 ? 't0' : u < 0.95 ? 't1' : u < 1.1 ? 't0' : (t + a.seed * 4) % 3.6 < 2.2 ? 'i0' : 'i1';
        } else {
          anim = (t + a.seed * 4) % 3.6 < 2.2 ? 'i0' : 'i1';
        }
      }
      let name = `${a.kind}_${a.bucket}_${dir}_${anim}`;
      if (!PR[name]) name = `${a.kind}_${a.bucket}_${dir}_i0`;
      return { name, flip };
    }

    function drawAgent(a: Agent, t: number) {
      if (a.state === 'inside') return;
      const { name, flip } = frameOf(a, t);
      if (!PR[name]) return;
      const s = scaleAtY(a.y);
      if (a.alpha < 1) ctx.globalAlpha = a.alpha;
      shadow(a.x, Math.round(a.y), Math.round(8 * s));
      person(name, a.x, a.y, flip);
      ctx.globalAlpha = 1;
    }

    // ---------- 주인공 ----------

    type HeroRun = {
      id: string;
      def: HeroDef;
      x: number;
      y: number;
      t: number;
      greeting: boolean;
      last: string;
      // 바드
      walkState: 'walk' | 'turnIn' | 'play' | 'turnOut';
      dir: number;
      wt: number;
      phase: number;
      noteT: number;
    };
    const heroes: HeroRun[] = Object.entries(HEROES).map(([id, def]) => ({
      id,
      def,
      x: SPOTS[id].x,
      y: SPOTS[id].y,
      t: Math.random() * 3,
      greeting: false,
      last: '',
      walkState: 'play',
      dir: 1,
      wt: 1.5,
      phase: 0,
      noteT: 0,
    }));

    /** 대본에서 지금 프레임 — 인사 대본의 첫 칸(몸 돌리기)은 처음 한 번만 */
    function pick(list: Script, t: number, intro: number) {
      let introT = 0;
      for (let i = 0; i < intro; i++) introT += list[i][1];
      if (t < introT) {
        let acc = 0;
        for (let i = 0; i < intro; i++) {
          acc += list[i][1];
          if (t < acc) return list[i][0];
        }
      }
      let total = 0;
      for (let i = intro; i < list.length; i++) total += list[i][1];
      let u = (t - introT) % total;
      for (let i = intro; i < list.length; i++) {
        if (u < list[i][1]) return list[i][0];
        u -= list[i][1];
      }
      return list[list.length - 1][0];
    }
    const introOf = (list: Script) => (/_(s0|se|sw)$/.test(list[0][0]) ? 1 : 0);

    // 궁수의 화살 · 바드의 음표
    const arrow = { flying: false, t: 0, from: [0, 0] as [number, number], stuck: true };
    const [bullX, bullY] = A.bull;
    const notes: { x: number; y: number; t: number; s: number }[] = [];

    function heroFrame(h: HeroRun, dt: number) {
      const isActive = control?.current?.active === h.id;
      if (isActive !== h.greeting) {
        h.greeting = isActive;
        h.t = 0;
      }
      h.t += dt;
      const w = h.def.walk;
      if (!w || reduced) {
        if (reduced) return h.def.script[0][0];
        const list = h.greeting ? h.def.greet : h.def.script;
        return pick(list, h.t, h.greeting ? introOf(list) : 0);
      }
      // 바드 — 양 끝 사이를 걷다가, 끝에서 화면을 보고 한 곡 뜯는다
      if (h.greeting) return pick(h.def.greet, h.t, 0);
      const home = SPOTS[h.id].x;
      const x0 = home + w.span[0], x1 = home + w.span[1];
      h.wt -= dt;
      switch (h.walkState) {
        case 'walk': {
          h.x += h.dir * w.speed * dt;
          h.phase = (h.phase + (w.speed * dt) / w.cycle) % 1;
          if ((h.dir > 0 && h.x >= x1) || (h.dir < 0 && h.x <= x0)) {
            h.x = h.dir > 0 ? x1 : x0;
            h.walkState = 'turnIn';
            h.wt = 0.14;
          }
          control?.current?.move?.(h.id, h.x, h.y);
          return (h.dir > 0 ? w.right : w.left)[Math.floor(h.phase * 8) % 8];
        }
        case 'turnIn':
          if (h.wt <= 0) {
            h.walkState = 'play';
            h.wt = w.rest;
            h.t = 0;
          }
          return h.dir > 0 ? w.turnR : w.turnL;
        case 'play':
          if (h.wt <= 0) {
            h.walkState = 'turnOut';
            h.wt = 0.14;
            h.dir = h.x >= home ? -1 : 1;
          }
          return pick(h.def.script, h.t, 0);
        case 'turnOut':
        default:
          if (h.wt <= 0) h.walkState = 'walk';
          return h.dir > 0 ? w.turnR : w.turnL;
      }
    }

    function drawHero(h: HeroRun, t: number, dt: number) {
      const name = heroFrame(h, dt);
      const locked = !!control?.current?.locked?.[h.id];
      const lit = control?.current?.active === h.id;
      if (!h.def.noShadow) shadow(h.x, h.y, Math.round(10 * h.def.scale * (h.def.hero === 'rogue' ? 0.8 : 1)));
      if (locked) {
        ctx.save();
        ctx.filter = 'brightness(0)';
        ctx.globalAlpha = 0.82;
      }
      person(name, h.x, h.y, false, lit);
      if (locked) ctx.restore();

      // 동작에 붙는 것들
      if (h.def.hero === 'archer' && name !== h.last && name.endsWith('_release') && !reduced) {
        const tip = anchor(h.last, 'tip', h.x, h.y) ?? [h.x + 20, h.y - 40];
        arrow.flying = true;
        arrow.t = 0;
        arrow.from = tip;
      }
      if (h.def.hero === 'mage') {
        const o = anchor(name, 'orb', h.x, h.y);
        if (o) {
          const bob = reduced ? 0 : Math.round(Math.sin(t * 2.4) * 1.5);
          const [ox, oy] = [o[0], o[1] + bob];
          glow(ox, oy, 16, '190, 120, 255', lampsOn ? 0.5 : 0.32);
          ctx.fillStyle = '#7a3fd0';
          ctx.fillRect(ox - 2, oy - 3, 5, 7);
          ctx.fillRect(ox - 3, oy - 2, 7, 5);
          ctx.fillStyle = '#c69bff';
          ctx.fillRect(ox - 2, oy - 2, 4, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(ox - 1, oy - 2, 2, 1);
          if (!reduced) {
            for (let i = 0; i < 3; i++) {
              const a = t * 1.6 + (i * Math.PI * 2) / 3;
              ctx.fillStyle = 'rgba(214, 180, 255, 0.85)';
              ctx.fillRect(Math.round(ox + Math.cos(a) * 7), Math.round(oy + Math.sin(a) * 3), 1, 1);
            }
          }
        }
      }
      if (h.def.hero === 'astrologer' && !reduced) {
        const o = anchor(name, 'orb', h.x, h.y);
        const tw = Math.sin(t * 2.1);
        if (o && tw > 0.6) {
          ctx.fillStyle = `rgba(255, 250, 220, ${(tw - 0.6) * 2.2})`;
          ctx.fillRect(o[0] - 2, o[1], 5, 1);
          ctx.fillRect(o[0], o[1] - 2, 1, 5);
        }
      }
      if (h.def.hero === 'bard' && !reduced) {
        h.noteT -= dt;
        const lute = anchor(name, 'lute', h.x, h.y);
        if (lute && h.noteT <= 0) {
          notes.push({ x: lute[0] + (Math.random() * 6 - 3), y: lute[1] - 6, t: 0, s: Math.random() < 0.5 ? 1 : -1 });
          h.noteT = h.greeting ? 0.35 : 0.65;
        }
      }
      h.last = name;
    }

    function drawNotes(dt: number) {
      for (let i = notes.length - 1; i >= 0; i--) {
        const n = notes[i];
        n.t += dt;
        if (n.t > 1.8) {
          notes.splice(i, 1);
          continue;
        }
        const x = Math.round(n.x + Math.sin(n.t * 3) * 3 * n.s), y = Math.round(n.y - n.t * 14);
        ctx.globalAlpha = Math.min(1, (1.8 - n.t) * 1.4);
        ctx.fillStyle = '#fff2c4';
        ctx.fillRect(x, y, 2, 2);
        ctx.fillRect(x + 1, y - 4, 1, 4);
        ctx.fillRect(x + 2, y - 4, 1, 1);
        ctx.fillRect(x + 3, y - 3, 1, 1);
      }
      ctx.globalAlpha = 1;
    }

    function drawArrowFlight(dt: number) {
      if (!arrow.flying) return;
      arrow.t += dt;
      const p = Math.min(1, arrow.t / 0.22);
      const [x0, y0] = arrow.from;
      const x = x0 + (bullX - 10 - x0) * p;
      const y = y0 + (bullY - y0) * p - Math.sin(p * Math.PI) * 6;
      ctx.fillStyle = '#e4d8bc';
      ctx.fillRect(Math.round(x), Math.round(y), 11, 1);
      ctx.fillStyle = '#f6f2e6';
      ctx.fillRect(Math.round(x + 11), Math.round(y), 2, 1);
      ctx.fillStyle = '#b4452e';
      ctx.fillRect(Math.round(x) - 2, Math.round(y) - 1, 3, 3);
      if (p >= 1) {
        arrow.flying = false;
        arrow.stuck = true;
      }
    }

    // ---------- 소품 ----------

    /** 소품 위에 덧그리는 움직임 (TV 화면 · 천막의 별 · 과녁의 화살 · 동상 자리) */
    const overlays: Record<string, (t: number) => void> = {
      tv(t) {
        const { x, y, w, h } = A.screen;
        const flick = reduced ? 0 : Math.sin(t * 23) * 0.04;
        // 화면 — 달리는 우왕이: 바닥선 위로 장애물이 흘러오고, 주인공이 주기적으로 뛴다
        const ground = y + Math.round(h * 0.76);
        ctx.fillStyle = '#c9f73d';
        ctx.fillRect(x, ground, w, 1);
        const run = reduced ? 0.4 : (t * 0.55) % 1;
        ctx.fillStyle = '#ff2f8f';
        ctx.fillRect(x + Math.round((1 - run) * (w - 3)), ground - 4, 3, 4);
        const hop = reduced ? 0 : Math.max(0, Math.sin(t * 0.55 * Math.PI * 2 + 1.2)) * 8;
        ctx.fillStyle = '#e8935a';
        ctx.fillRect(x + 7, ground - 6 - Math.round(hop), 4, 6);
        ctx.fillStyle = '#fff3d6';
        ctx.fillRect(x + 8, ground - 7 - Math.round(hop), 1, 1);
        ctx.fillRect(x + 10, ground - 7 - Math.round(hop), 1, 1);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.06 + flick})`;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x + 2, y + 2, 7, 1);
        ctx.fillRect(x + 2, y + 3, 3, 1);
        // 화면 빛이 소파 쪽으로 번진다
        glow(x + w + 10, y + h + 14, 46, '120, 190, 255', (lampsOn ? 0.2 : 0.08) + flick);
      },
      tent(t) {
        A.twinkles.forEach(([sx, sy], i) => {
          const a = reduced ? 0.7 : 0.45 + 0.55 * Math.sin(t * 2.2 + i * 1.7);
          if (a < 0.5) return;
          ctx.fillStyle = `rgba(255, 244, 190, ${a})`;
          ctx.fillRect(sx - 1, sy, 3, 1);
          ctx.fillRect(sx, sy - 1, 1, 3);
        });
      },
      target() {
        // 과녁에 박혀 있는 화살 (날아가는 중에는 그리지 않는다)
        if (arrow.flying || !arrow.stuck) return;
        ctx.fillStyle = '#e4d8bc';
        ctx.fillRect(bullX - 12, bullY, 12, 1);
        ctx.fillStyle = '#b4452e';
        ctx.fillRect(bullX - 15, bullY - 1, 4, 3);
      },
      fountain(t) {
        // 가운데 받침대 위 — 동상이 들어설 자리를 점선 실루엣으로 표시한다
        const cx = STATUE.x;
        const b = STATUE.baseY;
        const pulse = reduced ? 0.8 : 0.62 + 0.28 * Math.sin(t * 1.8);
        ctx.save();
        ctx.globalAlpha = pulse;
        const s = new Path2D();
        s.moveTo(cx - 20, b);
        s.lineTo(cx - 20, b - 28);
        s.lineTo(cx - 10, b - 44);
        s.lineTo(cx - 10, STATUE.topY);
        s.lineTo(cx + 10, STATUE.topY);
        s.lineTo(cx + 10, b - 44);
        s.lineTo(cx + 20, b - 28);
        s.lineTo(cx + 20, b);
        s.closePath();
        ctx.fillStyle = 'rgba(245, 215, 110, 0.16)';
        ctx.fill(s);
        ctx.shadowColor = 'rgba(245, 215, 110, 0.6)';
        ctx.shadowBlur = 8;
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffe9a0';
        ctx.stroke(s);
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffe9a0';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', cx, b - 24);
        ctx.restore();
      },
    };

    const fireBench = A.benchFire;

    function flame(x: number, y: number, t: number, offset: number) {
      const f = reduced ? 2 : (Math.floor(t * 11) + offset) % 8;
      spr(`flame_${f}`, x, y);
      if (lampsOn) glow(x, y - 8, 70, '255, 150, 60', reduced ? 0.12 : 0.1 + Math.sin(t * 9 + offset) * 0.03);
    }

    /** 아래 광장의 것들 — 화면 아래(= 앞)에 있을수록 나중에 그려 앞사람이 뒷사람을 가린다 */
    let frameDt = 0;
    const statics: Drawable[] = [
      ...SEA.props.map((p, pi) => ({
        y: p.y,
        draw(t: number) {
          const name = p.frames && p.fps ? `${p.sprite}_${reduced ? 0 : Math.floor(t * p.fps) % p.frames}` : p.sprite;
          spr(name, p.x, p.y);
          const list = SEA.bulbs.sprites[p.sprite];
          const r = RECTS[p.frames ? `${p.sprite}_0` : p.sprite];
          if (list && r) bulbs(list, Math.round(p.x) - r[4], Math.round(p.y) - r[5], t, pi * 13);
          overlays[p.id]?.(t);
        },
      })),
      { y: SEA.props.find((p) => p.id === 'brazier')!.y + 0.5, draw: (t: number) => flame(fireBench[0], fireBench[1], t, 5) },
      ...heroes.map((h) => ({
        get y() {
          return h.def.sortY ?? h.y;
        },
        draw(t: number) {
          drawHero(h, t, frameDt);
        },
      })),
    ];
    const agentDrawables: Drawable[] = agents.map((a) => ({
      get y() {
        return a.y;
      },
      draw(t: number) {
        drawAgent(a, t);
      },
    }));

    // ---------- 입자 ----------

    const leaves = Array.from({ length: 30 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vy: 9 + Math.random() * 16,
      drift: 10 + Math.random() * 18,
      phase: Math.random() * Math.PI * 2,
      tone: Math.floor(Math.random() * info.leaves.length),
      big: Math.random() < 0.4,
    }));

    /** 크리스마스 — 세 겹으로 내리는 눈 (멀수록 작고 느리다) */
    const flakes = SEA.snow
      ? Array.from({ length: 150 }, (_, i) => {
          const layer = i % 3;
          return {
            x: Math.random() * W,
            y: Math.random() * H,
            vy: [10, 18, 30][layer] + Math.random() * 6,
            drift: [4, 8, 12][layer],
            phase: Math.random() * Math.PI * 2,
            size: layer === 2 ? 2 : 1,
            alpha: [0.5, 0.75, 0.95][layer],
            tone: Math.floor(Math.random() * info.leaves.length),
          };
        })
      : [];

    function drawSnow(dt: number, t: number) {
      for (const f of flakes) {
        if (!reduced) {
          f.y += f.vy * dt;
          f.x += Math.sin(t * 0.9 + f.phase) * f.drift * dt - 4 * dt;
          if (f.y > H + 2) {
            f.y = -3;
            f.x = Math.random() * W;
          }
          if (f.x < -3) f.x = W + 2;
        }
        ctx.globalAlpha = f.alpha;
        ctx.fillStyle = info.leaves[f.tone];
        ctx.fillRect(Math.round(f.x), Math.round(f.y), f.size, f.size);
      }
      ctx.globalAlpha = 1;
    }

    function drawLeaves(dt: number, t: number) {
      if (SEA.snow) return drawSnow(dt, t);
      for (const l of leaves) {
        if (!reduced) {
          l.y += l.vy * dt;
          l.x += Math.sin(t * 1.4 + l.phase) * l.drift * dt - 7 * dt;
          if (l.y > H + 3) {
            l.y = -4;
            l.x = Math.random() * W;
          }
          if (l.x < -4) l.x = W + 3;
        }
        ctx.fillStyle = info.leaves[l.tone];
        const flat = Math.sin(t * 3 + l.phase) > 0;
        ctx.fillRect(Math.round(l.x), Math.round(l.y), l.big ? 3 : 2, flat ? 1 : 2);
      }
    }

    function drawSmoke(t: number) {
      if (reduced) return;
      for (const [sx, sy] of A.smoke) {
        for (let i = 0; i < 4; i++) {
          const p = (t * 0.16 + i / 4 + sx * 0.013) % 1;
          ctx.globalAlpha = 0.5 * (1 - p) * Math.min(1, p * 6);
          spr(`puff_${p < 0.3 ? 0 : p < 0.65 ? 1 : 2}`, sx + Math.sin((p + i) * 5) * 4 + p * 10, sy - p * 44);
        }
      }
      ctx.globalAlpha = 1;
    }

    /** 시계 바늘 — 실제 시각을 가리킨다 */
    function drawClock() {
      const [cx, cy, r] = A.clock;
      const now = new Date();
      const hour = ((now.getHours() % 12) + now.getMinutes() / 60) * (Math.PI / 6) - Math.PI / 2;
      const min = now.getMinutes() * (Math.PI / 30) - Math.PI / 2;
      ctx.fillStyle = info.hand;
      for (let d = 0; d <= r * 0.5; d += 0.5) ctx.fillRect(Math.round(cx + Math.cos(hour) * d) - 1, Math.round(cy + Math.sin(hour) * d) - 1, 2, 2);
      for (let d = 0; d <= r * 0.8; d += 0.5) ctx.fillRect(Math.round(cx + Math.cos(min) * d - 0.5), Math.round(cy + Math.sin(min) * d - 0.5), 1, 1);
      ctx.fillStyle = '#d9a43c';
      ctx.fillRect(cx - 1, cy - 1, 2, 2);
    }

    function drawSkyLife(t: number) {
      if (!images) return;
      // 반짝이는 별
      if (info.stars.length && !reduced) {
        ctx.fillStyle = '#ffffff';
        info.stars.forEach(([x, y], i) => {
          const tw = Math.sin(t * (0.7 + (i % 5) * 0.23) + i * 2.1);
          if (tw < 0.55) return;
          ctx.globalAlpha = (tw - 0.55) * 2;
          ctx.fillRect(x, y, 1, 1);
          if (tw > 0.9) {
            ctx.fillRect(x - 1, y, 3, 1);
            ctx.fillRect(x, y - 1, 1, 3);
          }
        });
        ctx.globalAlpha = 1;
      }
      // 흘러가는 구름
      const off = reduced ? 180 : Math.floor((t * 2.4 + 180) % W);
      ctx.drawImage(images.clouds, off, 0);
      ctx.drawImage(images.clouds, off - W, 0);
      // 멀리 나는 용 — 오른쪽 성 뒤에서 나타나 하늘을 가로질러 왼쪽으로 사라진다
      if (!reduced) {
        const cycle = 70;
        const p = ((t + 14) % cycle) / 46;
        if (p < 1) {
          const x = W + 50 - p * (W + 120);
          const y = 50 + Math.sin(p * 9) * 10 - Math.sin(p * Math.PI) * 14;
          spr(`dragon_${Math.floor(t * 7) % 6}`, x, y, true);
        }
      }
    }

    /** 가장자리 어둡게 — 화면 비율에 맞춰 눌러 원 테두리가 보이지 않게 한다 */
    function drawVignette() {
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(1, H / W);
      const v = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.72);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(0.62, 'rgba(6, 4, 14, 0.05)');
      v.addColorStop(1, 'rgba(6, 4, 14, 0.42)');
      ctx.fillStyle = v;
      ctx.fillRect(-W, -W, W * 2, W * 2);
      ctx.restore();
    }

    let last = performance.now();
    const start = last;

    function frame(now: number) {
      if (!images) return;
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      frameDt = dt;
      const t = (now - start) / 1000;

      if (!reduced) for (const a of agents) updateAgent(a, dt);

      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(images.sky, 0, 0);
      drawSkyLife(t);
      ctx.drawImage(images.back, 0, 0);
      spr(`fall_${reduced ? 0 : Math.floor(t * 9) % 4}`, A.fall[0], A.fall[1]);
      spr(`flag_${reduced ? 0 : Math.floor(t * 6) % 4}`, A.flag[0], A.flag[1]);
      drawClock();
      bulbs(SEA.bulbs.back, 0, 0, t, 0);
      drawSmoke(t);
      // 윗마당 사람들 — 난간이 다리를 가리도록 앞 배경보다 먼저 그린다
      const upper = agentDrawables.filter((d) => d.y < LAYER_Y).sort((a, b) => a.y - b.y);
      for (const d of upper) d.draw(t);
      ctx.drawImage(images.front, 0, A.frontY);
      bulbs(SEA.bulbs.front, 0, 0, t, 500);
      SEA.fires.forEach(([fx, fy], i) => flame(fx, fy, t, i * 3));
      const lower = [...statics, ...agentDrawables.filter((d) => d.y >= LAYER_Y)].sort((a, b) => a.y - b.y);
      for (const d of lower) d.draw(t);
      drawArrowFlight(dt);
      drawNotes(dt);
      drawLeaves(dt, t);
      drawVignette();

      if (!reduced) raf = requestAnimationFrame(frame);
    }

    const base = `/art/plaza/${seasonName}`;
    Promise.all([
      load(`${base}/sky-${active}.png`),
      load(`${base}/clouds-${active}.png`),
      load(`${base}/back-${active}.png`),
      load(`${base}/front-${active}.png`),
      load(`${base}/sprites-${active}.png`),
      load(`${base}/people.png`),
    ])
      .then(([sky, clouds, back, front, sheet, peopleImg]) => {
        if (!alive) return;
        const peopleG = recolor(peopleImg, SEA.peopleColors, info.people);
        images = { sky, clouds, back, front, sheet, people: peopleImg, peopleG };
        last = performance.now();
        if (reduced) frame(last);
        else raf = requestAnimationFrame(frame);
      })
      .catch(() => {
        // 그림을 못 받아도 메뉴(DOM)는 그대로 쓸 수 있다 — 배경만 빈 채로 둔다
      });

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduced && images) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [phase, season, control]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
