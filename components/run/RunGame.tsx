'use client';

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import play from '@/data/play.json';
import ScoreSubmit from '@/components/play/ScoreSubmit';
import { CHUNKS } from '@/lib/run/chunks';
import { createRunBackground } from '@/lib/run/background';
import { rollStats, type Character, type RunnerStats } from '@/lib/run/characters';
import {
  bakeCharacter,
  bakeProfessor,
  drawCoin,
  drawHang,
  drawHeart,
  drawItem,
  drawLow,
  drawPlatform,
  drawTall,
  type Pose,
} from '@/lib/run/art';
import {
  Course,
  GROUND_Y,
  PHYS_DT,
  PLAYER_SCREEN_X,
  PX_PER_M,
  RUN_SPEED,
  VIEW_H,
  VIEW_W,
  ZONES,
  fellOut,
  hitbox,
  newRunner,
  stepRunner,
  touches,
  zoneAt,
  type ItemKind,
  type Surface,
} from '@/lib/run/world';
import styles from './RunGame.module.css';

const BEST_KEY = 'gdevfc_woowang_best';

/**
 * 체력 — 달리는 동안 초당 이만큼 줄어든다. 하트(25)가 ~16초마다 나오므로 한 대도 안 맞으면
 * 조금씩 남는 정도 — 버틸 수는 있고, 부딪힐 때마다 깎인 만큼이 쌓여 끝이 난다.
 */
const HP_MAX = 100;
const HP_DRAIN = 1.4;
const HP_HEART = 25;
const HP_HIT = 15;
const HP_PIT = 25;
/** 부딪힌 뒤 무적 시간 */
const HIT_GUARD = 1;
/** 학점 하나의 점수 — 점수는 달린 거리(px)의 절반 + 학점 x 5 + 부순 장애물 보너스 */
const COIN_POINTS = 5;
const SMASH_POINTS = 10;
/** 구간이 바뀔 때 배경을 겹쳐 넘기는 시간 */
const ZONE_FADE = 0.9;

/**
 * 교수님과의 거리 (1 = 화면 밖으로 따돌림, 0 = 잡힘). 시작할 땐 바로 뒤에 붙어 있다가
 * 깔끔하게 달리면 멀어진다. 부딪히거나 구덩이에 빠지면 확 가까워진다.
 */
const PROF_START = 0.7;
const PROF_HIT = 0.34;
const PROF_PIT = 0.45;
/** 마지막으로 다친 뒤 이만큼 지나야 다시 멀어지기 시작한다 */
const PROF_RECOVER_AFTER = 1.5;
const PROF_RECOVER = 0.045;
const PROF_RECOVER_BOOST = 0.25;
const PROF_DANGER = 0.4;

/** 아이템 지속 시간 (초) — 캐릭터 능력으로 늘어날 수 있다 */
const ITEM_TIME: Record<Exclude<ItemKind, 'shield'>, number> = { boost: 4.5, magnet: 8, giant: 6 };
const BOOST_SPEED = 1.6;
const MAGNET_RANGE = 90;

const ITEM_ORDER: ItemKind[] = ['boost', 'shield', 'magnet', 'giant'];
const ITEM_LABEL: Record<ItemKind, { ko: string; en: string }> = {
  boost: { ko: '질주', en: 'BOOST!' },
  shield: { ko: '족보', en: 'SHIELD!' },
  magnet: { ko: '자석', en: 'MAGNET!' },
  giant: { ko: '거대화', en: 'GIANT!' },
};

/** 타나의 불꽃 대시 — 중력 없이 앞으로 돌진하며 장애물을 부순다 */
const DASH_TIME = 0.45;
const DASH_SPEED = 2.2;
const DASH_COOLDOWN = 6;
/** 은송이의 활공 — 점프를 누르고 있으면 이 속도보다 빨리 떨어지지 않는다 */
const GLIDE_VY = 55;

type Mode = 'play' | 'paused' | 'over';
type Input = { jump: boolean; slide: boolean; ability: boolean };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number; g: number };
type Ring = { x: number; y: number; r: number; life: number; max: number; color: string };
type Ghost = { x: number; y: number; life: number; pose: Pose };
type Floater = { text: string; x: number; y: number; life: number; color: string };
type Banner = { key: number; en: string; ko: string; sub: string; note?: string };
type Result = {
  score: number;
  coins: number;
  meters: number;
  reached: string;
  newBest: boolean;
  cause: string;
  who: string;
};

const KEYS: Record<string, keyof Input> = {
  Space: 'jump',
  ArrowUp: 'jump',
  KeyW: 'jump',
  ArrowDown: 'slide',
  KeyS: 'slide',
  ShiftLeft: 'ability',
  ShiftRight: 'ability',
  KeyX: 'ability',
  KeyE: 'ability',
};

function readBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function writeBest(v: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(v));
  } catch {
    // 저장이 막혀도 게임은 그대로
  }
}

type RunGameProps = {
  /** 고른 캐릭터 */
  character: Character;
  onExit: () => void;
  /** 캐릭터 고르기 화면으로 돌아가기 */
  onChangeCharacter: () => void;
};

/**
 * 달려라 우왕이 V2 — 쿠키런식 러너.
 *
 * 일정한 속도로 달리며 점프 · 이단 점프 · 슬라이드로 장애물과 구덩이를 넘고 학점을 모은다.
 * 출석부를 든 교수님이 뒤에서 쫓아온다 — 부딪히거나 구덩이에 빠질 때마다 가까워지고,
 * 깔끔하게 달리면 멀어진다. 체력은 시간이 지나면 줄고 하트로 회복한다.
 * 체력이 바닥나거나 교수님께 잡히면 끝. 아이템: 아메리카노(무적 질주) · 족보(한 번 막아 줌) ·
 * 자석(학점 끌어당김) · 거대화(장애물을 부수며 달림).
 *
 * 게임 루프는 리렌더 없이 rAF 로만 돈다. HUD 숫자는 바뀔 때만 DOM 을 직접 고치고,
 * React 상태는 일시정지 · 결과 화면 · 구간 배너처럼 드물게 바뀌는 것에만 쓴다.
 */
export default function RunGame({ character, onExit, onChangeCharacter }: RunGameProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hpFillRef = useRef<HTMLElement>(null);
  const hpBlockRef = useRef<HTMLDivElement>(null);
  const profFillRef = useRef<HTMLElement>(null);
  const profBlockRef = useRef<HTMLDivElement>(null);
  const coinRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<HTMLElement>(null);
  const zoneRef = useRef<HTMLSpanElement>(null);
  const chipRefs = useRef<Partial<Record<ItemKind, HTMLSpanElement | null>>>({});
  const dashChipRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<Input>({ jump: false, slide: false, ability: false });
  const jumpLatchRef = useRef(false);
  const abilityLatchRef = useRef(false);
  /** 이번 판에 대시를 쓸 수 있는지 (타나, 또는 비밀의 힘으로 대시가 깃든 은송이) */
  const [hasDash, setHasDash] = useState(false);

  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);

  const pauseRef = useRef<() => void>(() => {});
  const resumeRef = useRef<() => void>(() => {});
  const retryRef = useRef<() => void>(() => {});
  const captureRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const stageEl = stageRef.current;
    const box = stageEl?.parentElement;
    const ctx2d = canvasEl?.getContext('2d');
    if (!canvasEl || !stageEl || !box || !ctx2d) return;
    const ctx: CanvasRenderingContext2D = ctx2d;
    const canvas: HTMLCanvasElement = canvasEl;
    const stage: HTMLDivElement = stageEl;
    const input = inputRef.current;

    canvas.width = VIEW_W;
    canvas.height = VIEW_H;
    ctx.imageSmoothingEnabled = false;

    const bg = createRunBackground();
    const sprites = bakeCharacter(character.art);
    const prof = bakeProfessor();
    let stats: RunnerStats;
    /** 판이 시작할 때 배너에 띄울 한 줄 — 은송이는 이번 판에 깃든 비밀의 힘 */
    let startNote = '';
    function roll() {
      const r = rollStats(character);
      stats = r.stats;
      startNote = r.secretFrom
        ? `비밀의 힘 — ${r.secretFrom.name}의 ${r.secretFrom.ability.name}!`
        : '교수님이 출석부를 들고 쫓아온다!';
      setHasDash(stats.dash);
    }
    roll();
    const calmMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    // ---------- 판 상태 ----------

    let mode: Mode = 'play';
    let course = new Course((Math.random() * 2 ** 32) >>> 0, CHUNKS);
    let dist = 0;
    let runner = newRunner();
    let hp = HP_MAX;
    let coins = 0;
    let bonus = 0;
    let guard = 0;
    /** 구덩이에 빠졌다가 끌어올려지는 중 — 최소 rescueLeft 초, 그 뒤로도 발밑에 땅이 올 때까지 떠 있다 */
    let rescuing = false;
    let rescueLeft = 0;
    let profGap = PROF_START;
    let sinceHit = 0;
    // 아이템
    let boost = 0;
    /** 질주가 끝났는데 아직 구덩이 위 — 땅이 나올 때까지 보이지 않는 바닥을 깔아 둔다 */
    let boostFloor = false;
    let magnet = 0;
    let giant = 0;
    let shield = stats!.startShield;
    let dashLeft = 0;
    let dashCd = 0;
    let zoneIdx = 0;
    let semester = 1;
    let prevZone = 0;
    let fade = 1;
    let t = 0;
    let shake = 0;
    let flash = 0;
    let sparks: Spark[] = [];
    let rings: Ring[] = [];
    let ghosts: Ghost[] = [];
    let floaters: Floater[] = [];
    let ghostTimer = 0;
    let bannerKey = 0;
    const best = readBest();

    course.extendTo(VIEW_W * 2);

    function showBanner(note?: string) {
      const z = ZONES[zoneIdx];
      setBanner({ key: ++bannerKey, en: z.en, ko: z.ko, sub: `${semester}학기`, note });
    }
    showBanner(startNote);

    // ---------- 화면 크기 ----------

    /** 384x216 을 비율 그대로 상자에 맞춘다 (HUD · 오버레이가 이 무대 위에 얹힌다) */
    function resize() {
      if (!box) return;
      const bw = box.clientWidth;
      const bh = box.clientHeight;
      if (!bw || !bh) return;
      const scale = Math.min(bw / VIEW_W, bh / VIEW_H);
      stage.style.width = `${Math.floor(VIEW_W * scale)}px`;
      stage.style.height = `${Math.floor(VIEW_H * scale)}px`;
    }
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    resize();

    // ---------- 이펙트 ----------

    function burst(x: number, y: number, n: number, colors: string[], speed: number, up = 30, g = 160) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = speed * (0.4 + Math.random() * 0.6);
        sparks.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - up,
          life: 0.35 + Math.random() * 0.3,
          max: 0.65,
          color: colors[i % colors.length],
          size: Math.random() < 0.3 ? 2 : 1,
          g,
        });
      }
      if (sparks.length > 260) sparks.splice(0, sparks.length - 260);
    }

    function ring(x: number, y: number, r: number, color: string, life = 0.3) {
      rings.push({ x, y, r, life, max: life, color });
    }

    function float(text: string, color: string) {
      floaters.push({ text, x: dist, y: runner.y - (giant > 0 ? 48 : 28), life: 1, color });
    }

    // ---------- 물리 (1/120초 고정 스텝) ----------

    const speedNow = () => RUN_SPEED * (dashLeft > 0 ? DASH_SPEED : boost > 0 ? BOOST_SPEED : 1);

    function nearSurfaces(): Surface[] {
      const near = course.surfacesNear(dist, 40);
      // 질주 중엔 구덩이 위에도 보이지 않는 바닥이 깔린다
      if (boost > 0 || boostFloor) near.push({ x0: dist - 60, x1: dist + 60, y: GROUND_Y, kind: 'ground' });
      return near;
    }

    function realGroundUnder() {
      return course.surfaces.some((s) => s.kind === 'ground' && dist >= s.x0 + 6 && dist <= s.x1 - 6);
    }

    function hurt(amount: number, gap: number) {
      hp -= amount;
      profGap -= gap;
      sinceHit = 0;
      guard = HIT_GUARD;
      if (!calmMotion) shake = 0.22;
      flash = 0.25;
    }

    function useItem(kind: ItemKind) {
      if (kind === 'shield') shield = true;
      else if (kind === 'boost') boost = ITEM_TIME.boost * stats.itemMult;
      else if (kind === 'magnet') magnet = ITEM_TIME.magnet * stats.itemMult;
      else giant = ITEM_TIME.giant * stats.itemMult;
      float(ITEM_LABEL[kind].en, '#c9f73d');
      ring(dist, runner.y - 10, 22, '#c9f73d', 0.4);
      burst(dist, runner.y - 10, 12, ['#c9f73d', '#ffffff', '#f5d76e'], 90);
    }

    function step() {
      const near = nearSurfaces();
      const wasGrounded = runner.grounded;
      const wasAirJumps = runner.airJumps;

      if (rescuing) {
        // 끌어올려지는 중 — 떠 있다가 발밑에 땅이 오면 놓아 준다
        rescueLeft -= PHYS_DT;
        runner.y += (GROUND_Y - 70 - runner.y) * Math.min(1, PHYS_DT * 8);
        if (rescueLeft <= 0 && course.surfaces.some((s) => s.kind === 'ground' && dist >= s.x0 + 8 && dist <= s.x1 - 8)) {
          rescuing = false;
          runner.vy = 0;
          runner.grounded = false;
          runner.airJumps = stats.maxJumps - 1;
        }
      } else if (dashLeft > 0) {
        // 불꽃 대시 — 그 높이 그대로 중력 없이 돌진한다 (구덩이도 건넌다)
        jumpLatchRef.current = false;
        dashLeft -= PHYS_DT;
        runner.vy = 0;
        if (Math.random() < 0.6) burst(dist - 6, runner.y - 4 - Math.random() * 14, 1, ['#ff8a3d', '#f5d76e', '#ff5a3d'], 40, 0, -20);
        if (dashLeft <= 0) guard = Math.max(guard, 0.4);
      } else {
        const jumpPressed = jumpLatchRef.current;
        jumpLatchRef.current = false;
        const vyBefore = runner.vy;
        stepRunner(runner, dist, { jumpPressed, slide: input.slide }, near, stats.maxJumps);
        // 활공 — 공중에서 점프를 누르고 있으면 사뿐히 내려온다
        if (stats.glide && !runner.grounded && input.jump && !jumpPressed && runner.vy > GLIDE_VY) {
          runner.vy = GLIDE_VY;
          if (Math.random() < 0.25) burst(dist - 4, runner.y - 12, 1, ['#fff3c4', '#9fe8ff'], 20, 0, 30);
        }
        if (jumpPressed && runner.vy < vyBefore - 50) {
          if (wasGrounded) burst(dist, runner.y, 5, ['#efe6d2'], 45, 0);
          else if (runner.airJumps < wasAirJumps) ring(dist, runner.y, 10, '#ffffff', 0.25);
        }
        if (!wasGrounded && runner.grounded) {
          burst(dist, runner.y, giant > 0 ? 12 : 4, ['#efe6d2'], giant > 0 ? 70 : 35, 0);
          if (giant > 0 && !calmMotion) shake = Math.max(shake, 0.12);
        }
      }

      // 능력 키 — 대시 (쿨다운이 끝났을 때만)
      const abilityPressed = abilityLatchRef.current;
      abilityLatchRef.current = false;
      if (dashCd > 0) dashCd = Math.max(0, dashCd - PHYS_DT);
      if (abilityPressed && stats.dash && dashCd <= 0 && dashLeft <= 0 && !rescuing) {
        dashLeft = DASH_TIME;
        dashCd = DASH_COOLDOWN;
        ring(dist, runner.y - 10, 20, '#ff8a3d', 0.3);
        float('불꽃 대시!', '#ff8a3d');
        if (!calmMotion) shake = Math.max(shake, 0.08);
      }

      dist += speedNow() * PHYS_DT;
      hp -= HP_DRAIN * stats.drainMult * PHYS_DT;
      if (guard > 0) guard -= PHYS_DT;
      sinceHit += PHYS_DT;

      // 아이템 시간
      if (boost > 0) {
        boost -= PHYS_DT;
        if (boost <= 0) {
          boost = 0;
          guard = Math.max(guard, 1);
          boostFloor = !realGroundUnder();
        }
      }
      if (boostFloor && realGroundUnder() && runner.y <= GROUND_Y + 0.5) boostFloor = false;
      if (magnet > 0) magnet = Math.max(0, magnet - PHYS_DT);
      if (giant > 0) giant = Math.max(0, giant - PHYS_DT);

      // 학점 · 하트 · 아이템
      const body = hitbox(runner, dist, stats.standH);
      const grow = giant > 0 ? 8 : 0;
      for (const p of course.pickups) {
        if (p.x > dist + MAGNET_RANGE + 20) break;
        if (p.taken || p.x < dist - 30) continue;
        if (magnet > 0 && p.kind === 'coin' && Math.abs(p.x - dist) < MAGNET_RANGE) {
          // 자석 — 가까운 학점이 날아온다
          p.x += (dist - p.x) * Math.min(1, PHYS_DT * 9);
          p.y += (runner.y - 10 - p.y) * Math.min(1, PHYS_DT * 9);
        }
        const reach = (p.kind === 'coin' ? 5 : 8) + grow;
        if (p.x + reach > body.x0 && p.x - reach < body.x1 && p.y + reach > body.y0 - grow * 2 && p.y - reach < body.y1) {
          p.taken = true;
          if (p.kind === 'coin') {
            coins += 1;
            burst(p.x, p.y, 3, ['#c9f73d', '#ffffff'], 40);
          } else if (p.kind === 'heart') {
            hp = Math.min(HP_MAX, hp + HP_HEART * stats.heartMult);
            burst(p.x, p.y, 10, ['#ff2f8f', '#ffd0e4'], 60);
            float('+HP', '#ff2f8f');
          } else if (p.item) {
            useItem(p.item);
          }
        }
      }

      // 장애물 — 질주 · 거대화면 부수고 지나가고, 족보가 있으면 한 번 막아 준다
      if (!rescuing) {
        const crushing = boost > 0 || giant > 0 || dashLeft > 0;
        for (const o of course.obstacles) {
          if (o.x > dist + 40) break;
          if (o.hit || o.x + o.w < dist - 40) continue;
          const reachBox = giant > 0 ? { x0: body.x0 - 6, x1: body.x1 + 6, y0: body.y1 - 44, y1: body.y1 } : body;
          if (!touches(reachBox, o)) continue;
          if (crushing) {
            o.hit = true;
            o.smashed = true;
            bonus += SMASH_POINTS;
            const cy = Math.max(10, Math.min(GROUND_Y - 8, o.y + o.h / 2));
            burst(o.x + o.w / 2, cy, 14, ['#ffffff', '#c8ccd4', '#8a6a46', '#c9f73d'], 140, 80, 260);
            ring(o.x + o.w / 2, cy, 16, '#ffffff', 0.25);
            if (!calmMotion) shake = Math.max(shake, 0.1);
            continue;
          }
          if (guard > 0) continue;
          o.hit = true;
          if (shield) {
            shield = false;
            guard = 0.6;
            ring(dist, runner.y - 10, 18, '#7fe3ff', 0.35);
            burst(dist, runner.y - 10, 12, ['#7fe3ff', '#ffffff'], 80);
            float('족보로 막았다!', '#7fe3ff');
          } else {
            hurt(HP_HIT, PROF_HIT);
            burst(dist, runner.y - 12, 10, ['#ff2f8f', '#ffffff'], 70);
            float('아야!', '#ff2f8f');
          }
          break;
        }
      }

      // 구덩이 — 족보가 있으면 대가 없이 끌어올려진다
      if (!rescuing && fellOut(runner)) {
        if (shield) {
          shield = false;
          float('족보로 버텼다!', '#7fe3ff');
        } else {
          hurt(HP_PIT, PROF_PIT);
          guard = HIT_GUARD + 0.5;
        }
        rescuing = true;
        rescueLeft = 0.5;
        runner.y = VIEW_H + 10;
        runner.vy = 0;
        runner.grounded = false;
      }

      // 교수님 — 한동안 안 다치면 멀어진다 (질주 중엔 훨씬 빨리)
      if (sinceHit > PROF_RECOVER_AFTER) {
        profGap = Math.min(1, profGap + (boost > 0 ? PROF_RECOVER_BOOST : PROF_RECOVER) * PHYS_DT);
      }

      // 구간
      const z = zoneAt(dist);
      if (z.index !== zoneIdx || z.semester !== semester) {
        prevZone = zoneIdx;
        zoneIdx = z.index;
        semester = z.semester;
        fade = 0;
        showBanner(z.index === 0 ? '새 학기 — 코스가 한 단계 어려워진다' : undefined);
      }

      if (profGap <= 0) end('교수님께 잡혔다!');
      else if (hp <= 0) end('체력이 바닥났다…');
    }

    // ---------- 그리기 ----------

    const sx = (wx: number) => Math.round(wx - dist + PLAYER_SCREEN_X);

    function drawWorld(dt: number) {
      if (fade < 1) fade = Math.min(1, fade + dt / ZONE_FADE);
      if (fade < 1) bg.draw(ctx, prevZone, dist, 1);
      bg.draw(ctx, zoneIdx, dist, fade < 1 ? fade : 1);

      ctx.save();
      if (shake > 0) {
        const m = Math.ceil(shake * 12);
        ctx.translate(Math.round((Math.random() * 2 - 1) * m), Math.round((Math.random() * 2 - 1) * m));
      }

      const lo = dist - PLAYER_SCREEN_X - 60;
      const hi = lo + VIEW_W + 120;
      for (const s of course.surfaces) {
        if (s.x1 < lo || s.x0 > hi) continue;
        if (s.kind === 'ground') bg.drawGround(ctx, zoneIdx, sx(s.x0), sx(s.x1), dist);
      }
      // 질주 중 구덩이 위 — 빛나는 다리
      if (boost > 0 || boostFloor) {
        ctx.fillStyle = 'rgba(201, 247, 61, 0.5)';
        ctx.fillRect(0, GROUND_Y, VIEW_W, 2);
      }
      for (const s of course.surfaces) {
        if (s.kind !== 'plat' || s.x1 < lo || s.x0 > hi) continue;
        drawPlatform(ctx, zoneAt(s.x0).index, sx(s.x0), s.y, s.x1 - s.x0);
      }
      for (const o of course.obstacles) {
        // 부서진 장애물은 그리지 않는다 (부딪히고 지나간 것은 그대로 남는다)
        if (o.smashed || o.x + o.w < lo || o.x > hi) continue;
        const z = zoneAt(o.x).index;
        if (o.kind === 'low') drawLow(ctx, z, sx(o.x), o.y);
        else if (o.kind === 'tall') drawTall(ctx, z, sx(o.x), o.y);
        else drawHang(ctx, z, sx(o.x), o.w, o.y + o.h, t);
      }
      for (const p of course.pickups) {
        if (p.taken || p.x < lo || p.x > hi) continue;
        if (p.kind === 'coin') drawCoin(ctx, sx(p.x), p.y, t);
        else if (p.kind === 'heart') drawHeart(ctx, sx(p.x), p.y, t);
        else drawItem(ctx, p.item ?? 'shield', sx(p.x), p.y, t);
      }
      drawProfessor();
      drawRunner(dt);
      drawEffects(dt);
      ctx.restore();

      // 교수님이 바짝 — 화면 왼쪽이 붉게 숨 쉰다
      if (profGap < PROF_DANGER) {
        const k = (1 - profGap / PROF_DANGER) * (0.55 + 0.45 * Math.sin(t * 9));
        const grad = ctx.createLinearGradient(0, 0, VIEW_W * 0.3, 0);
        grad.addColorStop(0, `rgba(255, 47, 143, ${0.38 * k})`);
        grad.addColorStop(1, 'rgba(255, 47, 143, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, VIEW_W * 0.3, VIEW_H);
      }
      if (flash > 0) {
        ctx.fillStyle = `rgba(255, 47, 143, ${flash * 0.6})`;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      }
      if (boost > 0) {
        // 질주 — 화면을 가로지르는 속도선
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        for (let i = 0; i < 9; i++) {
          const y = 20 + ((i * 37) % 170);
          const x = VIEW_W - ((t * 900 + i * 131) % (VIEW_W + 60));
          ctx.fillRect(Math.round(x), y, 22 + (i % 3) * 8, 1);
        }
      }
    }

    /** 교수님 — 거리에 따라 화면 왼쪽 밖에서 우왕이 바로 뒤까지 다가온다 */
    function drawProfessor() {
      const x = Math.round(PLAYER_SCREEN_X - 18 - profGap * 92);
      if (x < -20) return;
      const frame = prof[Math.floor(t * 9) % 2];
      // 발밑이 구덩이면 폴짝 뛰어넘는 중으로 보이게
      const worldX = dist - (PLAYER_SCREEN_X - x - 8);
      const ground = course.surfaces.some((s) => s.kind === 'ground' && worldX >= s.x0 - 4 && worldX <= s.x1 + 4);
      const hop = ground ? Math.round(Math.abs(Math.sin(t * 9)) * 1.5) : 14;
      ctx.drawImage(frame, x - 8, GROUND_Y - 20 - hop);
      // 가까우면 머리 위에 "거기 서!" 느낌의 느낌표
      if (profGap < PROF_DANGER && Math.floor(t * 5) % 2 === 0) {
        ctx.fillStyle = '#ff2f8f';
        ctx.fillRect(x - 1, GROUND_Y - 34 - hop, 2, 6);
        ctx.fillRect(x - 1, GROUND_Y - 26 - hop, 2, 2);
      }
    }

    function poseNow(): Pose {
      if (rescuing || !runner.grounded) return 'jump';
      if (runner.sliding) return 'slide';
      return Math.floor(dist / 9) % 2 === 0 ? 'runA' : 'runB';
    }

    function drawSprite(pose: Pose, x: number, y: number, scale: number) {
      const img = sprites[pose];
      const w = img.width * scale;
      const h = img.height * scale;
      const top = pose === 'slide' ? y - h : y - 20 * scale;
      ctx.drawImage(img, Math.round(x - w / 2), Math.round(top), w, h);
    }

    function drawRunner(dt: number) {
      const pose = poseNow();
      const scale = giant > 0 ? (giant < 0.6 && Math.floor(t * 12) % 2 === 0 ? 1 : 2) : 1;

      // 질주 잔상
      if (boost > 0 || dashLeft > 0) {
        ghostTimer -= dt;
        if (ghostTimer <= 0) {
          ghostTimer = 0.04;
          ghosts.push({ x: dist, y: runner.y, life: 0.22, pose });
        }
      }
      for (const g of ghosts) g.life -= dt;
      ghosts = ghosts.filter((g) => g.life > 0);
      for (const g of ghosts) {
        ctx.globalAlpha = (g.life / 0.22) * 0.35;
        drawSprite(g.pose, sx(g.x), g.y, scale);
      }
      ctx.globalAlpha = 1;

      // 부딪힌 직후 · 끌어올려지는 중엔 깜빡인다
      const blink = (guard > 0 || rescuing) && boost <= 0 && Math.floor(t * 14) % 2 === 0;
      if (!blink) {
        const bob = pose === 'runA' ? -scale : 0;
        drawSprite(pose, PLAYER_SCREEN_X, runner.y + bob, scale);
      }

      if (runner.sliding) {
        // 슬라이드 — 뒤로 흩날리는 속도선
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (let i = 0; i < 3; i++) ctx.fillRect(PLAYER_SCREEN_X - 16 - ((t * 120 + i * 9) % 18), Math.round(runner.y - 3 - i * 3), 6, 1);
      }
      if (shield) {
        // 족보 — 몸을 감싼 푸른 막
        const cy = Math.round(runner.y - (runner.sliding ? 6 : 11) * scale);
        const rad = 14 * scale;
        ctx.fillStyle = `rgba(127, 227, 255, ${0.55 + 0.25 * Math.sin(t * 6)})`;
        for (let i = 0; i < 28; i++) {
          const a = (i / 28) * Math.PI * 2 + t;
          ctx.fillRect(Math.round(PLAYER_SCREEN_X + Math.cos(a) * rad), Math.round(cy + Math.sin(a) * rad), 1, 1);
        }
      }
      if (magnet > 0) {
        // 자석 — 퍼져 나가는 점선 고리
        const k = (t * 1.5) % 1;
        ctx.globalAlpha = (1 - k) * 0.6;
        ctx.fillStyle = '#e0443a';
        const rad = 10 + k * 40;
        for (let i = 0; i < 20; i += 2) {
          const a = (i / 20) * Math.PI * 2;
          ctx.fillRect(Math.round(PLAYER_SCREEN_X + Math.cos(a) * rad), Math.round(runner.y - 10 + Math.sin(a) * rad), 1, 1);
        }
        ctx.globalAlpha = 1;
      }
    }

    function drawEffects(dt: number) {
      for (const s of sparks) {
        s.life -= dt;
        s.vy += s.g * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
      }
      sparks = sparks.filter((s) => s.life > 0);
      for (const s of sparks) {
        ctx.globalAlpha = Math.min(1, (s.life / s.max) * 1.8);
        ctx.fillStyle = s.color;
        ctx.fillRect(sx(s.x), Math.round(s.y), s.size, s.size);
      }
      for (const r of rings) r.life -= dt;
      rings = rings.filter((r) => r.life > 0);
      for (const r of rings) {
        const k = 1 - r.life / r.max;
        const rad = 3 + r.r * k;
        ctx.globalAlpha = (r.life / r.max) * 0.9;
        ctx.fillStyle = r.color;
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * Math.PI * 2;
          ctx.fillRect(sx(r.x + Math.cos(a) * rad), Math.round(r.y + Math.sin(a) * rad * 0.6), 1, 1);
        }
      }
      for (const f of floaters) {
        f.life -= dt;
        f.y -= 18 * dt;
      }
      floaters = floaters.filter((f) => f.life > 0);
      ctx.font = "8px 'Press Start 2P', 'Galmuri11', monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      for (const f of floaters) {
        ctx.globalAlpha = Math.min(1, f.life * 2.5);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillText(f.text, sx(f.x) + 1, Math.round(f.y) + 1);
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, sx(f.x), Math.round(f.y));
      }
      ctx.globalAlpha = 1;
      if (shake > 0) shake = Math.max(0, shake - dt);
      if (flash > 0) flash = Math.max(0, flash - dt);
    }

    // HUD — 값이 바뀔 때만 DOM 을 고친다
    let shownHp = -1;
    let shownProf = -1;
    let shownCoins = -1;
    let shownScore = -1;
    let shownZone = '';
    const shownChip: Partial<Record<ItemKind, number>> = {};
    let shownDash = -1;
    const score = () => Math.floor(dist * 0.5) + Math.round(coins * COIN_POINTS * stats.coinMult) + bonus;

    function itemLeft(k: ItemKind) {
      if (k === 'shield') return shield ? 1 : 0;
      const total = ITEM_TIME[k] * stats.itemMult;
      const left = k === 'boost' ? boost : k === 'magnet' ? magnet : giant;
      return left > 0 ? left / total : 0;
    }

    function updateHud() {
      const hpPct = Math.max(0, Math.round((hp / HP_MAX) * 100));
      if (hpPct !== shownHp) {
        shownHp = hpPct;
        if (hpFillRef.current) hpFillRef.current.style.width = `${hpPct}%`;
        hpBlockRef.current?.toggleAttribute('data-low', hpPct <= 25);
      }
      const profPct = Math.max(0, Math.round(profGap * 100));
      if (profPct !== shownProf) {
        shownProf = profPct;
        if (profFillRef.current) profFillRef.current.style.width = `${profPct}%`;
        profBlockRef.current?.toggleAttribute('data-danger', profGap < PROF_DANGER);
      }
      for (const k of ITEM_ORDER) {
        const left = Math.round(itemLeft(k) * 50) / 50;
        if (left === shownChip[k]) continue;
        shownChip[k] = left;
        const el = chipRefs.current[k];
        if (!el) continue;
        el.toggleAttribute('data-on', left > 0);
        el.style.setProperty('--left', String(left));
      }
      const dashEl = dashChipRef.current;
      if (dashEl) {
        const ready = Math.round((1 - dashCd / DASH_COOLDOWN) * 50) / 50;
        if (ready !== shownDash) {
          shownDash = ready;
          dashEl.style.setProperty('--left', String(ready));
          dashEl.toggleAttribute('data-ready', dashCd <= 0);
        }
      }
      if (coins !== shownCoins && coinRef.current) {
        shownCoins = coins;
        coinRef.current.textContent = String(coins);
      }
      const sc = score();
      if (sc !== shownScore && scoreRef.current) {
        shownScore = sc;
        scoreRef.current.textContent = String(sc).padStart(6, '0');
      }
      const zl = `${semester}학기 · ${ZONES[zoneIdx].ko}`;
      if (zl !== shownZone && zoneRef.current) {
        shownZone = zl;
        zoneRef.current.textContent = zl;
      }
    }

    function render(dt: number) {
      drawWorld(dt);
      updateHud();
    }

    // ---------- 루프 ----------

    let raf = 0;
    let last = performance.now();
    let acc = 0;

    function frame(now: number) {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;
      acc += dt;
      let n = 0;
      while (acc >= PHYS_DT && n < 16 && mode === 'play') {
        step();
        acc -= PHYS_DT;
        n++;
      }
      if (n === 16) acc = 0;
      course.extendTo(dist + VIEW_W * 2);
      course.dropBefore(dist - PLAYER_SCREEN_X - 80);
      render(dt);
      if (mode === 'play') raf = requestAnimationFrame(frame);
    }

    function start() {
      cancelAnimationFrame(raf);
      last = performance.now();
      acc = 0;
      raf = requestAnimationFrame(frame);
    }

    function releaseInput() {
      input.jump = false;
      input.slide = false;
      input.ability = false;
      jumpLatchRef.current = false;
      abilityLatchRef.current = false;
    }

    function pause() {
      if (mode !== 'play') return;
      mode = 'paused';
      cancelAnimationFrame(raf);
      releaseInput();
      setPaused(true);
    }

    function resume() {
      if (mode !== 'paused') return;
      mode = 'play';
      setPaused(false);
      start();
    }

    function end(cause: string) {
      if (mode === 'over') return;
      mode = 'over';
      cancelAnimationFrame(raf);
      releaseInput();
      const sc = score();
      const newBest = sc > best;
      if (newBest) writeBest(sc);
      const reach = zoneAt(dist);
      setResult({
        score: sc,
        coins,
        meters: Math.floor(dist / PX_PER_M),
        reached: `${reach.semester}학기 · ${ZONES[reach.index].ko}`,
        newBest,
        cause,
        who: character.name,
      });
      shake = 0;
      flash = 0;
      // 결과 화면 뒤로 마지막 장면이 보이게 한 번 더 그린다
      render(0);
    }

    function retry() {
      course = new Course((Math.random() * 2 ** 32) >>> 0, CHUNKS);
      course.extendTo(VIEW_W * 2);
      dist = 0;
      runner = newRunner();
      hp = HP_MAX;
      coins = 0;
      bonus = 0;
      guard = 0;
      rescuing = false;
      rescueLeft = 0;
      profGap = PROF_START;
      sinceHit = 0;
      boost = 0;
      boostFloor = false;
      magnet = 0;
      giant = 0;
      roll();
      shield = stats.startShield;
      dashLeft = 0;
      dashCd = 0;
      zoneIdx = 0;
      semester = 1;
      prevZone = 0;
      fade = 1;
      shake = 0;
      flash = 0;
      sparks = [];
      rings = [];
      ghosts = [];
      floaters = [];
      mode = 'play';
      setResult(null);
      showBanner(startNote);
      start();
    }

    pauseRef.current = pause;
    resumeRef.current = resume;
    retryRef.current = retry;
    captureRef.current = () => {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `woowang-run-${score()}.png`;
      a.click();
    };

    // ---------- 입력 ----------

    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Escape') {
        if (mode === 'play') pause();
        else if (mode === 'paused') resume();
        return;
      }
      if (mode !== 'play') return;
      const k = KEYS[e.code];
      if (!k) return;
      e.preventDefault();
      if (k === 'jump' && !input.jump) jumpLatchRef.current = true;
      if (k === 'ability' && !input.ability) abilityLatchRef.current = true;
      input[k] = true;
    }

    function onKeyUp(e: KeyboardEvent) {
      const k = KEYS[e.code];
      if (!k) return;
      if (mode === 'play') e.preventDefault();
      input[k] = false;
    }

    function onVisibility() {
      if (document.hidden) pause();
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', releaseInput);
    document.addEventListener('visibilitychange', onVisibility);

    start();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', releaseInput);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [character]);

  /** 터치 버튼 — 누르는 동안만 켜진다 */
  function touchProps(key: keyof Input) {
    const set = (e: ReactPointerEvent<HTMLButtonElement>, on: boolean) => {
      if (key === 'jump' && on && !inputRef.current.jump) jumpLatchRef.current = true;
      if (key === 'ability' && on && !inputRef.current.ability) abilityLatchRef.current = true;
      inputRef.current[key] = on;
      e.currentTarget.dataset.pressed = on ? 'true' : 'false';
    };
    return {
      onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        set(e, true);
      },
      onPointerUp: (e: ReactPointerEvent<HTMLButtonElement>) => set(e, false),
      onPointerCancel: (e: ReactPointerEvent<HTMLButtonElement>) => set(e, false),
      onLostPointerCapture: (e: ReactPointerEvent<HTMLButtonElement>) => set(e, false),
      onContextMenu: (e: ReactMouseEvent) => e.preventDefault(),
    };
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
        <div ref={stageRef} className={styles.stage}>
          <canvas ref={canvasRef} className={styles.canvas} />

          {/* ---------- HUD ---------- */}
          <div className={styles.hud} aria-hidden={result ? true : undefined}>
            <div className={styles.hudLeft}>
              <div ref={hpBlockRef} className={styles.hp}>
                <span className={styles.hpLabel}>HP</span>
                <span className={styles.hpBar}>
                  <i ref={hpFillRef} className={styles.hpFill} />
                </span>
              </div>
              <div ref={profBlockRef} className={styles.prof}>
                <span className={styles.profLabel}>교수님</span>
                <span className={styles.profBar}>
                  <i ref={profFillRef} className={styles.profFill} />
                </span>
                <span className={styles.profWarn}>바짝!</span>
              </div>
              <div className={styles.hudRow}>
                <div className={styles.coins}>
                  <i className={styles.coinIcon} aria-hidden="true" />
                  <span ref={coinRef}>0</span>
                </div>
                <div className={styles.chips}>
                  {hasDash && (
                    <span ref={dashChipRef} className={`${styles.chip} ${styles.dashChip}`} data-on="">
                      대시
                    </span>
                  )}
                  {ITEM_ORDER.map((k) => (
                    <span
                      key={k}
                      ref={(el) => {
                        chipRefs.current[k] = el;
                      }}
                      className={styles.chip}
                      data-item={k}
                    >
                      {ITEM_LABEL[k].ko}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.hudRight}>
              <div className={styles.score}>
                <span className={styles.scoreLabel}>SCORE</span>
                <b ref={scoreRef}>000000</b>
              </div>
              <span ref={zoneRef} className={styles.zone}>
                1학기 · 교실
              </span>
            </div>
          </div>

          {!result && !paused && (
            <button
              type="button"
              className={styles.pauseBtn}
              aria-label="일시정지"
              onClick={(e) => {
                e.currentTarget.blur();
                pauseRef.current();
              }}
            >
              Ⅱ
            </button>
          )}

          {banner && !result && (
            <div key={banner.key} className={styles.banner} onAnimationEnd={() => setBanner(null)}>
              <span className={styles.bannerSub}>{banner.sub}</span>
              <span className={styles.bannerEn}>{banner.en}</span>
              <span className={styles.bannerKo}>{banner.ko}</span>
              {banner.note && <span className={styles.bannerNote}>{banner.note}</span>}
            </div>
          )}

          {/* ---------- 터치 버튼 (터치 화면에서만) ---------- */}
          {!result && !paused && (
            <div className={styles.touch} aria-hidden="true">
              <button type="button" className={`${styles.tbtn} ${styles.tslide}`} tabIndex={-1} {...touchProps('slide')}>
                <span>▼</span>
                SLIDE
              </button>
              <div className={styles.tright}>
                {hasDash && (
                  <button type="button" className={`${styles.tbtn} ${styles.tdash}`} tabIndex={-1} {...touchProps('ability')}>
                    <span>»</span>
                    DASH
                  </button>
                )}
                <button type="button" className={`${styles.tbtn} ${styles.tjump}`} tabIndex={-1} {...touchProps('jump')}>
                  <span>▲</span>
                  JUMP
                </button>
              </div>
            </div>
          )}

          {/* ---------- 일시정지 ---------- */}
          {paused && (
            <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="일시정지">
              <div className={styles.card}>
                <p className={styles.cardTitle}>PAUSED</p>
                <p className={styles.cardSub}>일시정지 — 교수님도 잠시 멈췄다</p>
                <button type="button" className={styles.primary} autoFocus onClick={() => resumeRef.current()}>
                  ▸ 계속 달리기
                </button>
                <button type="button" className={styles.ghost} onClick={onChangeCharacter}>
                  캐릭터 바꾸기
                </button>
                <button type="button" className={styles.ghost} onClick={onExit}>
                  광장으로 나가기
                </button>
              </div>
            </div>
          )}

          {/* ---------- 결과 ---------- */}
          {result && (
            <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={play.gameOver.title}>
              <div className={`${styles.card} ${styles.resultCard}`}>
                <p className={styles.overTitle}>{play.gameOver.title}</p>
                <p className={styles.cause}>
                  {result.who} — {result.cause}
                </p>
                <div className={styles.bigScore}>
                  <span className={styles.statLabel}>{play.gameOver.scoreLabel}</span>
                  <b>{String(result.score).padStart(6, '0')}</b>
                  {result.newBest && <span className={styles.newBest}>{play.gameOver.newBestLabel}</span>}
                </div>
                <dl className={styles.stats}>
                  <div>
                    <dt>학점</dt>
                    <dd>{result.coins}</dd>
                  </div>
                  <div>
                    <dt>거리</dt>
                    <dd>{result.meters}m</dd>
                  </div>
                  <div>
                    <dt>도달</dt>
                    <dd>{result.reached}</dd>
                  </div>
                </dl>
                <ScoreSubmit score={result.score} />
                <div className={styles.actions}>
                  <button type="button" className={styles.primary} onClick={() => retryRef.current()}>
                    {play.gameOver.retryLabel}
                  </button>
                  <button type="button" className={styles.ghost} onClick={onChangeCharacter}>
                    CHARACTER
                  </button>
                  <button type="button" className={styles.ghost} onClick={() => captureRef.current()}>
                    {play.gameOver.captureLabel}
                  </button>
                  <button type="button" className={styles.ghost} onClick={onExit}>
                    {play.gameOver.backLabel}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
