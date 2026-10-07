'use client';

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import jump from '@/data/jump.json';
import ScoreSubmit from '@/components/play/ScoreSubmit';
import { SPRITE_GRIDS, SPRITE_PALETTE, SPRITE_SIZE } from '@/components/Sprite';
import { createBackground } from '@/lib/jump/background';
import {
  CHARGE_STEPS,
  MAX_VIEW_W,
  MIN_VIEW_W,
  PHYS_DT,
  PLATFORM_H,
  PX_PER_M,
  VIEW_H,
  WALK_SPEED,
  WORLD_W,
  ZONES,
  PlatformField,
  birdPos,
  jumpVelocity,
  stepAir,
  stepWalk,
  touchesBird,
  wrapDelta,
  wrapX,
  zoneIndexAt,
  type Body,
  type Dir,
  type Platform,
} from '@/lib/jump/world';
import styles from './JumpGame.module.css';

const BEST_KEY = 'gdevfc_jump_best';

/** 카메라가 땅 아래로 내려가지 않는 선 — 시작할 때 풀밭이 화면 아래 24px 보인다 */
const CAM_MIN = -24;
/** 이보다 높은 데서 떨어지면 착지할 때 철퍼덕 — 잠깐 못 움직인다 (점프킹처럼) */
const SPLAT_FALL = 170;
const SPLAT_TIME = 0.45;
/** 새와 부딪히면 이 속도로 튕겨 나가고, 잠깐은 다시 부딪히지 않는다 */
const KNOCK_VX = 150;
const KNOCK_VY = 100;
const KNOCK_GUARD = 0.8;

const FONT_LG = "10px 'Press Start 2P', monospace";
const FONT_SM = "7px 'Press Start 2P', monospace";
const FONT_XL = "16px 'Press Start 2P', monospace";

type Mode = 'play' | 'paused' | 'ended';
type PlayerState = 'ground' | 'charge' | 'air' | 'splat';
type Input = { left: boolean; right: boolean; jump: boolean };
type Dust = { x: number; y: number; vx: number; vy: number; life: number };

type Banner = { key: number; en: string; ko: string; m: number };
type EndResult = { score: number; newBest: boolean };

const KEYS: Record<string, keyof Input> = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  Space: 'jump',
  ArrowUp: 'jump',
  KeyW: 'jump',
};

const formatMeters = (m: number) => `${m}m`;

function readBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function writeBest(m: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(m));
  } catch {
    // 사생활 보호 모드 등에서 저장이 막혀도 게임은 그대로 한다
  }
}

/** Sprite.tsx 의 그리드를 캔버스 한 장으로 굽는다 (flip 이면 좌우 반전) */
function bakeSprite(grid: string[], flip: boolean) {
  const c = document.createElement('canvas');
  c.width = SPRITE_SIZE.w;
  c.height = SPRITE_SIZE.h;
  const g = c.getContext('2d');
  if (!g) return c;
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = SPRITE_PALETTE[row[x]];
      if (row[x] === '.' || !color) continue;
      g.fillStyle = color;
      g.fillRect(flip ? SPRITE_SIZE.w - 1 - x : x, y, 1, 1);
    }
  });
  return c;
}

type JumpGameProps = {
  onExit: () => void;
};

/**
 * 뛰어라 우왕이 — 점프킹식 탑 오르기.
 *
 * 스페이스(모바일은 JUMP)를 누르고 있는 동안 힘이 모이고, 떼는 순간 그때 누르고 있던
 * 방향으로 뛴다. 땅 위에서는 좌우로 걷는다. 떨어져도 죽지 않는다 — 대신 아래로 떨어진
 * 만큼 다시 올라야 한다. 기록은 "밟고 선" 가장 높은 곳(m).
 *
 * 물리와 발판은 lib/jump/world.ts, 배경은 lib/jump/background.ts. 이 컴포넌트는
 * 입력·카메라·그리기와 화면 위 UI 만 맡는다. 게임 루프는 리렌더 없이 rAF 로만 돌고,
 * React 상태는 일시정지·기록 화면·구간 배너처럼 드물게 바뀌는 것에만 쓴다.
 */
export default function JumpGame({ onExit }: JumpGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<Input>({ left: false, right: false, jump: false });
  const [paused, setPaused] = useState(false);
  const [pausedBest, setPausedBest] = useState(0);
  const [ended, setEnded] = useState<EndResult | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);

  const pauseRef = useRef<() => void>(() => {});
  const resumeRef = useRef<() => void>(() => {});
  const giveUpRef = useRef<() => void>(() => {});
  const retryRef = useRef<() => void>(() => {});
  const captureRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const box = canvasEl?.parentElement;
    const ctx2d = canvasEl?.getContext('2d');
    if (!canvasEl || !box || !ctx2d) return;
    // 아래 중첩 함수들에서 null 좁히기가 풀리지 않게 타입이 고정된 상수로 잡아 둔다
    const ctx: CanvasRenderingContext2D = ctx2d;
    const canvas: HTMLCanvasElement = canvasEl;
    const input = inputRef.current;

    canvas.height = VIEW_H;
    canvas.width = MIN_VIEW_W;

    const bg = createBackground();
    const sprites = {
      idle: [bakeSprite(SPRITE_GRIDS['woowang-helm'], false), bakeSprite(SPRITE_GRIDS['woowang-helm'], true)],
      walk: [
        bakeSprite(SPRITE_GRIDS['woowang-helm-walk'], false),
        bakeSprite(SPRITE_GRIDS['woowang-helm-walk'], true),
      ],
      crouch: [
        bakeSprite(SPRITE_GRIDS['woowang-helm-crouch'], false),
        bakeSprite(SPRITE_GRIDS['woowang-helm-crouch'], true),
      ],
      air: [bakeSprite(SPRITE_GRIDS['woowang-helm-air'], false), bakeSprite(SPRITE_GRIDS['woowang-helm-air'], true)],
    };

    // ---------- 판 상태 ----------

    let mode: Mode = 'play';
    let field = new PlatformField((Math.random() * 2 ** 32) >>> 0);
    let body: Body = { x: WORLD_W / 2, y: 0, vx: 0, vy: 0 };
    let pstate: PlayerState = 'ground';
    let standing: Platform = field.platforms[0];
    let chargeSteps = 0;
    /** 점프 키를 한 번 떼야 다음 힘 모으기가 시작된다 — 누른 채 착지해도 바로 또 뛰지 않게 */
    let jumpArmed = true;
    let facing: 1 | -1 = 1;
    /**
     * 힘을 모으는 동안 고른 점프 방향. ← → 를 한 번 누를 때마다 한 칸씩
     * (왼쪽 · 위 · 오른쪽) 옮겨지고, 손을 떼도 그대로 남는다 — 방향키를 계속 누르고
     * 있을 필요가 없다. 힘 모으기를 시작할 때 누르고 있던 방향이 있으면 거기서 출발한다.
     */
    let aim: Dir = 0;
    /** 직전 스텝의 방향키 상태 — "막 눌렀다"를 알아내는 데 쓴다 */
    let prevLeft = false;
    let prevRight = false;
    let airApex = 0;
    let splatLeft = 0;
    let walkDist = 0;
    /** 밟고 선 가장 높은 곳 (px) — 이게 기록이다 */
    let bestLanded = 0;
    let storedBest = readBest();
    /** 이번 판이 개인 최고 기록을 넘었는지 — 판이 끝나는 순간 정해진다 */
    let endNewBest = false;
    let shownZone = -1;
    let camY = CAM_MIN;
    /** 화면 왼쪽 끝이 보는 월드 x — 화면이 월드보다 좁을 때만 옆으로 따라간다 */
    let camX = 0;
    let t = 0;
    /** 물리 시계 — 새의 위치는 이걸로 정해서 물리 스텝과 한 치도 어긋나지 않게 한다 */
    let simT = 0;
    /** 새에 부딪힌 뒤 무적 시간 */
    let guardLeft = 0;
    /** 스프링이 마지막으로 눌린 시각 (눌린 그림을 잠깐 보여준다) */
    const springFired = new Map<Platform, number>();
    let dust: Dust[] = [];
    let nearby: Platform[] = [];
    let bannerKey = 0;

    field.extendTo(VIEW_H * 3);

    function showZone(i: number) {
      shownZone = i;
      const z = ZONES[i];
      setBanner({ key: ++bannerKey, en: z.en, ko: z.ko, m: z.from });
    }
    showZone(0);

    // ---------- 화면 크기 ----------

    /**
     * 세로는 늘 32m(320px) 를 보여주고, 가로는 화면 비율에 맞춰 180~576px 사이로 정한다.
     * 넓은 화면은 월드 한 바퀴(576)를 통째로, 휴대폰 세로 화면은 그 일부를 보며 옆으로 따라간다.
     */
    function resize() {
      if (!box) return;
      const bw = box.clientWidth;
      const bh = box.clientHeight;
      if (bw === 0 || bh === 0) return;
      const vw = Math.round(Math.min(MAX_VIEW_W, Math.max(MIN_VIEW_W, (VIEW_H * bw) / bh)));
      if (canvas.width !== vw) {
        canvas.width = vw;
        snapCamX();
      }
      // 캔버스 크기를 바꾸면 컨텍스트 설정이 초기화된다
      ctx.imageSmoothingEnabled = false;
      const scale = Math.min(bw / vw, bh / VIEW_H);
      canvas.style.width = `${Math.floor(vw * scale)}px`;
      canvas.style.height = `${Math.floor(VIEW_H * scale)}px`;
      if (mode !== 'play') render(0);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    resize();
    // 화면 폭이 처음부터 최소값이면 resize 가 폭 변화를 못 느끼므로 한 번은 직접 맞춘다
    snapCamX();

    // ---------- 물리 (1/120초 고정 스텝) ----------

    function heldDir(): Dir {
      if (input.left && !input.right) return -1;
      if (input.right && !input.left) return 1;
      return 0;
    }

    function puff(n: number, spread: number) {
      for (let i = 0; i < n; i++) {
        dust.push({
          x: body.x + (Math.random() - 0.5) * 10,
          y: body.y,
          vx: (Math.random() - 0.5) * spread,
          vy: Math.random() * 18 + 6,
          life: 0.45 + Math.random() * 0.25,
        });
      }
    }

    function launch(steps: number) {
      const v = jumpVelocity(steps, aim);
      body.vx = v.vx;
      body.vy = v.vy;
      if (aim !== 0) facing = aim;
      pstate = 'air';
      airApex = body.y;
      puff(3, 30);
    }

    function land(p: Platform) {
      standing = p;
      const fall = airApex - p.y;
      if (fall > SPLAT_FALL) {
        pstate = 'splat';
        splatLeft = SPLAT_TIME;
        puff(10, 90);
      } else {
        pstate = 'ground';
        puff(4, 40);
      }
      if (p.y > bestLanded) {
        bestLanded = p.y;
        const zi = zoneIndexAt(bestLanded / PX_PER_M);
        if (zi > shownZone) showZone(zi);
      }
    }

    /** 새(우주에선 UFO)에 부딪혔는지 보고, 부딪혔으면 반대쪽으로 튕겨 낸다 */
    function checkBirds() {
      if (guardLeft > 0) {
        guardLeft -= PHYS_DT;
        return;
      }
      for (const b of field.queryBirds(body.y - 12, body.y + 30)) {
        const pos = birdPos(b, simT);
        if (!touchesBird(body, pos.x, b.y)) continue;
        const away = Math.sign(wrapDelta(body.x - pos.x)) || pos.dir;
        body.vx = away * KNOCK_VX;
        body.vy = KNOCK_VY;
        pstate = 'air';
        airApex = body.y;
        guardLeft = KNOCK_GUARD;
        puff(8, 80);
        return;
      }
    }

    function step() {
      simT += PHYS_DT;
      if (!input.jump) jumpArmed = true;
      const pressedLeft = input.left && !prevLeft;
      const pressedRight = input.right && !prevRight;
      prevLeft = input.left;
      prevRight = input.right;
      checkBirds();

      switch (pstate) {
        case 'ground': {
          if (input.jump && jumpArmed) {
            pstate = 'charge';
            chargeSteps = 0;
            jumpArmed = false;
            aim = heldDir();
            break;
          }
          const dir = heldDir();
          if (dir === 0) break;
          facing = dir;
          walkDist += WALK_SPEED * PHYS_DT;
          if (!stepWalk(body, dir, standing)) {
            // 발판 끝을 넘어 떨어진다 — 걷던 방향으로 조금 밀려 나간다
            pstate = 'air';
            body.vx = dir * WALK_SPEED * 0.8;
            body.vy = 0;
            airApex = body.y;
          }
          break;
        }
        case 'charge': {
          chargeSteps++;
          // 누를 때마다 한 칸 — 오른쪽을 고른 뒤 ← 를 누르면 위, 한 번 더 누르면 왼쪽
          if (pressedLeft && aim > -1) aim = (aim - 1) as Dir;
          if (pressedRight && aim < 1) aim = (aim + 1) as Dir;
          if (aim !== 0) facing = aim;
          // 손을 떼거나, 가득 차면 저절로 뛴다
          if (!input.jump || chargeSteps >= CHARGE_STEPS) launch(Math.min(chargeSteps, CHARGE_STEPS));
          break;
        }
        case 'air': {
          const hit = stepAir(body, nearby);
          if (hit?.spring) {
            // 스프링 — 서지 않고 그대로 높이 튀어 오른다
            springFired.set(hit, t);
            airApex = body.y;
            puff(6, 70);
          } else if (hit) {
            land(hit);
          }
          if (body.y > airApex) airApex = body.y;
          break;
        }
        case 'splat': {
          splatLeft -= PHYS_DT;
          if (splatLeft <= 0) pstate = 'ground';
          break;
        }
      }
    }

    // ---------- 카메라 ----------

    function updateCamera(dt: number) {
      // 우왕이를 화면 아래쪽 36% 높이에 둔다. 화면 끝에 몰리면 빨리 따라간다
      const target = Math.max(CAM_MIN, body.y - VIEW_H * 0.36);
      const screenY = VIEW_H - (body.y - camY);
      const rate = screenY > VIEW_H - 48 || screenY < 56 ? 10 : 4.5;
      camY += (target - camY) * (1 - Math.exp(-rate * dt));

      // 가로 — 월드를 통째로 보여주는 넓은 화면은 고정. 좁은 화면은 우왕이가 가운데
      // 부분을 벗어날 때만 따라간다 (조금 움직일 때마다 화면이 흔들리지 않게).
      // 땅에서 방향을 누르고 있으면(걷거나, 힘을 모으며 겨누면) 그쪽을 더 보여준다 —
      // 다음 발판은 대개 옆으로 비켜 있어서, 겨누는 쪽이 화면 밖일 수 있다
      const viewW = canvas.width;
      if (viewW >= WORLD_W) {
        camX = 0;
        return;
      }
      const lean = pstate === 'charge' ? aim : pstate === 'ground' ? heldDir() : 0;
      const off = wrapDelta(body.x + lean * viewW * 0.3 - (camX + viewW / 2));
      const dead = lean !== 0 ? 0 : viewW * 0.18;
      if (Math.abs(off) > dead) {
        const want = off - Math.sign(off) * dead;
        camX = wrapX(camX + want * (1 - Math.exp(-6 * dt)));
      }
    }

    // ---------- 그리기 ----------

    const sy = (worldY: number) => VIEW_H - (worldY - camY);

    /** 가로 카메라를 우왕이에게 바로 맞춘다 (시작 · 다시 하기 · 화면 폭이 바뀔 때) */
    function snapCamX() {
      camX = canvas.width >= WORLD_W ? 0 : wrapX(body.x - canvas.width / 2);
    }

    /**
     * 월드 x 를 화면 x 로. 이음새에 걸친 것도 끊기지 않게, 화면에 걸리는 사본 위치를
     * 모두(0~2개) 돌려준다. w 는 그리는 물체의 폭.
     */
    function screenXs(worldX: number, w: number): number[] {
      const viewW = canvas.width;
      const base = wrapX(worldX - camX);
      const out: number[] = [];
      for (const x of [base, base - WORLD_W]) if (x < viewW && x + w > 0) out.push(Math.round(x));
      return out;
    }

    function drawGround(viewW: number) {
      const y = Math.round(sy(0));
      if (y >= VIEW_H) return;
      ctx.fillStyle = '#5a4030';
      ctx.fillRect(0, y, viewW, VIEW_H - y);
      ctx.fillStyle = '#6aa84f';
      ctx.fillRect(0, y, viewW, 4);
      for (let x = 0; x < viewW; x += 3) {
        const h = (x * 7919) % 5 === 0 ? 3 : (x * 104729) % 3 === 0 ? 2 : 1;
        ctx.fillStyle = '#8cc66a';
        ctx.fillRect(x, y - h + 1, 1, h);
      }
      for (let x = 7; x < viewW; x += 23) {
        ctx.fillStyle = (x * 31) % 2 === 0 ? '#f2d24a' : '#f08aa8';
        ctx.fillRect(x, y + 1, 2, 2);
      }
    }

    /** 발판 — 오른 높이(구간)에 따라 나무 → 돌 → 구름 → 얼음 → 금속 */
    function drawPlatform(p: Platform) {
      const y = Math.round(sy(p.y));
      for (const x of screenXs(p.x, p.w)) {
        if (p.spring) {
          drawSpring(p, x, y);
          continue;
        }
        drawLedge(p, x, y);
        if (p.landing) drawFlag(x + p.w - 5, y);
      }
    }

    /** 스프링 착지 발판의 깃발 — "저 스프링을 밟으면 여기로 온다" */
    function drawFlag(x: number, y: number) {
      ctx.fillStyle = '#5a3a1c';
      ctx.fillRect(x, y - 11, 1, 11);
      const wave = Math.floor(t * 4) % 2;
      ctx.fillStyle = '#f5d76e';
      ctx.fillRect(x + 1, y - 11 + wave, 5, 2);
      ctx.fillRect(x + 1, y - 9, 3 + wave, 2);
      ctx.fillStyle = '#c99a2e';
      ctx.fillRect(x + 1, y - 8, 2, 1);
    }

    /** 스프링 점프대 — 밟힌 직후 잠깐 눌린 모양 */
    function drawSpring(p: Platform, x: number, y: number) {
      const w = p.w;
      const pressed = t - (springFired.get(p) ?? -1) < 0.15;
      const padY = y + (pressed ? 3 : 0);
      // 받침
      ctx.fillStyle = '#3e3f48';
      ctx.fillRect(x + 1, y + 6, w - 2, 3);
      ctx.fillStyle = '#62646f';
      ctx.fillRect(x + 1, y + 6, w - 2, 1);
      // 용수철 — 지그재그
      const coilTop = padY + 3;
      for (let i = 0; coilTop + i < y + 6; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#c8ccd4' : '#8a8f99';
        ctx.fillRect(x + Math.round(w / 2) - 5 + (i % 2) * 2, coilTop + i, 8, 1);
      }
      // 발판
      ctx.fillStyle = '#9e2a22';
      ctx.fillRect(x, padY, w, 3);
      ctx.fillStyle = '#e0443a';
      ctx.fillRect(x, padY, w, 2);
      ctx.fillStyle = '#ff9a8a';
      ctx.fillRect(x + 2, padY, w - 4, 1);
      // 날아갈 쪽을 가리키는 화살표 — 깜빡이며 위아래로 까딱인다
      if (p.launch) {
        const dir = wrapDelta(p.launch.toX - (p.x + w / 2)) >= 0 ? 1 : -1;
        const ax = x + Math.round(w / 2);
        const ay = padY - 5 - (Math.floor(t * 3) % 2);
        ctx.fillStyle = '#fff3c4';
        for (let i = 0; i < 3; i++) ctx.fillRect(ax + dir * (i - 1), ay - (2 - i), 1, 1 + (2 - i) * 2);
      }
    }

    function drawLedge(p: Platform, x: number, y: number) {
      const w = p.w;
      const zone = zoneIndexAt(p.y / PX_PER_M);

      if (zone === 0) {
        ctx.fillStyle = '#5a3a1c';
        ctx.fillRect(x, y, w, PLATFORM_H);
        ctx.fillStyle = '#9a6a38';
        ctx.fillRect(x, y, w, 4);
        ctx.fillStyle = '#c08a4a';
        ctx.fillRect(x, y, w, 1);
        ctx.fillStyle = '#3a2a1a';
        for (let i = 4; i < w - 2; i += 10) ctx.fillRect(x + i, y + 2, 1, 1);
        ctx.fillStyle = '#5a3a1c';
        ctx.fillRect(x + 2, y + PLATFORM_H, 2, 3);
        ctx.fillRect(x + w - 4, y + PLATFORM_H, 2, 3);
      } else if (zone === 1) {
        ctx.fillStyle = '#4d4842';
        ctx.fillRect(x, y, w, PLATFORM_H);
        ctx.fillStyle = '#8d857a';
        ctx.fillRect(x, y, w, 4);
        ctx.fillStyle = '#b8b1a5';
        ctx.fillRect(x, y, w, 1);
        ctx.fillStyle = '#6a635a';
        for (let i = 9; i < w - 2; i += 13) ctx.fillRect(x + i, y + 1, 1, 3);
      } else if (zone <= 3) {
        ctx.fillStyle = '#c9d6e6';
        ctx.fillRect(x + 1, y + 3, w - 2, 4);
        ctx.fillStyle = '#f4f7fb';
        ctx.fillRect(x, y + 1, w, 4);
        ctx.fillStyle = '#ffffff';
        for (let i = 1; i < w - 3; i += 6) ctx.fillRect(x + i, y - 1, 4, 2);
      } else if (zone === 4) {
        ctx.fillStyle = '#4f8fb0';
        ctx.fillRect(x, y, w, PLATFORM_H);
        ctx.fillStyle = '#8fcde6';
        ctx.fillRect(x, y, w, 4);
        ctx.fillStyle = '#e6f8ff';
        ctx.fillRect(x, y, w, 1);
        ctx.fillStyle = '#ffffff';
        for (let i = 5; i < w - 2; i += 11) ctx.fillRect(x + i, y + 2, 1, 1);
        ctx.fillStyle = '#8fcde6';
        for (let i = 3; i < w - 2; i += 7) ctx.fillRect(x + i, y + PLATFORM_H, 1, 2 + (i % 3));
      } else {
        ctx.fillStyle = '#2c2f3a';
        ctx.fillRect(x, y, w, PLATFORM_H);
        ctx.fillStyle = '#6c7284';
        ctx.fillRect(x, y, w, 4);
        ctx.fillStyle = '#a8afc2';
        ctx.fillRect(x, y, w, 1);
        ctx.fillStyle = '#3a3e4a';
        for (let i = 4; i < w - 2; i += 8) ctx.fillRect(x + i, y + 2, 1, 1);
        ctx.fillStyle = Math.sin(t * 3 + p.y) > 0 ? '#5fd3ff' : '#2f8fb8';
        ctx.fillRect(x, y + 2, 1, 2);
        ctx.fillRect(x + w - 1, y + 2, 1, 2);
      }
    }

    /** 새 — 구간 따라 참새 · 갈매기 · 독수리, 우주에선 UFO. 날갯짓 2프레임 */
    function drawBirds() {
      for (const b of field.queryBirds(camY - 10, camY + VIEW_H + 10)) {
        const pos = birdPos(b, simT);
        const y = Math.round(sy(b.y));
        const zone = zoneIndexAt(b.y / PX_PER_M);
        const flap = Math.floor(t * 8 + b.phase) % 2 === 0;
        for (const left of screenXs(pos.x - 8, 16)) {
          if (zone >= 5) drawUfo(left + 8, y);
          else drawBird(left + 8, y, pos.dir, flap, zone);
        }
      }
    }

    function drawBird(cx: number, cy: number, dir: 1 | -1, flap: boolean, zone: number) {
      const body = zone <= 1 ? '#7a5634' : zone <= 3 ? '#f2f2f2' : '#3a2e28';
      const wing = zone <= 1 ? '#5a3c22' : zone <= 3 ? '#9aa3ad' : '#2a201c';
      const belly = zone <= 1 ? '#d9b27a' : zone <= 3 ? '#ffffff' : '#c8b49a';
      // 오른쪽을 보는 그림을 기준으로, 왼쪽으로 날면 x 를 거울처럼 뒤집는다
      const px = (dx: number, dy: number, w: number, h: number) =>
        ctx.fillRect(dir === 1 ? cx + dx : cx - dx - w, cy + dy, w, h);
      ctx.fillStyle = body;
      px(-4, -1, 8, 3); // 몸통
      px(3, -2, 3, 3); // 머리
      ctx.fillStyle = belly;
      px(-3, 1, 6, 1);
      ctx.fillStyle = '#f2b13a';
      px(6, -1, 1, 1); // 부리
      ctx.fillStyle = '#141414';
      px(4, -2, 1, 1); // 눈
      ctx.fillStyle = wing;
      px(-6, -1, 2, 2); // 꼬리
      if (flap) {
        px(-2, -4, 4, 3);
        px(-1, -6, 2, 2);
      } else {
        px(-2, 1, 4, 3);
      }
    }

    function drawUfo(cx: number, cy: number) {
      ctx.fillStyle = '#7fe3ff';
      ctx.fillRect(cx - 2, cy - 4, 5, 3);
      ctx.fillStyle = '#c3cad3';
      ctx.fillRect(cx - 7, cy - 1, 15, 3);
      ctx.fillStyle = '#828b96';
      ctx.fillRect(cx - 5, cy + 2, 11, 1);
      ctx.fillStyle = Math.floor(t * 6) % 2 === 0 ? '#ff5a3d' : '#ffe06b';
      ctx.fillRect(cx - 5, cy, 1, 1);
      ctx.fillRect(cx, cy, 1, 1);
      ctx.fillRect(cx + 5, cy, 1, 1);
    }

    function drawPlayer() {
      // 새에 부딪힌 직후엔 깜빡인다
      if (guardLeft > 0 && Math.floor(t * 16) % 2 === 0) return;
      const footY = Math.round(sy(body.y));
      const side = facing === 1 ? 0 : 1;
      const W = SPRITE_SIZE.w;

      for (const left of screenXs(body.x - W / 2, W)) {
        const cx = left + W / 2;
        if (pstate === 'splat') {
          // 철퍼덕 — 웅크린 그림을 납작하게
          ctx.drawImage(sprites.crouch[side], cx - 9, footY - 15, 18, 16);
          continue;
        }
        let img = sprites.idle[side];
        if (pstate === 'charge') img = sprites.crouch[side];
        else if (pstate === 'air') img = sprites.air[side];
        else if (heldDir() !== 0 && Math.floor(walkDist / 6) % 2 === 1) img = sprites.walk[side];
        ctx.drawImage(img, left, footY - 20);
        if (pstate === 'charge') drawCharge(cx, footY);
      }
    }

    /** 힘 게이지와 점프 방향 화살표 (머리 위) */
    function drawCharge(cx: number, footY: number) {
      const p = Math.min(1, chargeSteps / CHARGE_STEPS);
      const x = cx - 9;
      const y = footY - 26;
      ctx.fillStyle = '#141414';
      ctx.fillRect(x, y, 18, 4);
      const full = p >= 1;
      ctx.fillStyle = full ? (Math.floor(t * 12) % 2 ? '#ffffff' : '#ff5a3d') : p < 0.5 ? '#c9f73d' : p < 0.85 ? '#f5d76e' : '#ff8a3d';
      ctx.fillRect(x + 1, y + 1, Math.max(1, Math.round(16 * p)), 2);

      // 고를 수 있는 세 방향을 모두 그리고, 지금 고른 쪽만 밝게
      const on = '#c9f73d';
      const off = 'rgba(255, 255, 255, 0.28)';
      const ly = y + 2;
      ctx.fillStyle = aim === -1 ? on : off;
      ctx.fillRect(x - 6, ly, 1, 1);
      ctx.fillRect(x - 5, ly - 1, 1, 3);
      ctx.fillRect(x - 4, ly - 2, 1, 5);
      ctx.fillStyle = aim === 1 ? on : off;
      ctx.fillRect(x + 22, ly, 1, 1);
      ctx.fillRect(x + 21, ly - 1, 1, 3);
      ctx.fillRect(x + 20, ly - 2, 1, 5);
      ctx.fillStyle = aim === 0 ? on : off;
      ctx.fillRect(cx, y - 6, 1, 1);
      ctx.fillRect(cx - 1, y - 5, 3, 1);
      ctx.fillRect(cx - 2, y - 4, 5, 1);
    }

    function drawDust(dt: number) {
      for (const d of dust) {
        d.life -= dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vy -= 60 * dt;
      }
      dust = dust.filter((d) => d.life > 0);
      for (const d of dust) {
        ctx.globalAlpha = Math.min(1, d.life * 2);
        ctx.fillStyle = '#efe6d2';
        for (const x of screenXs(d.x, 2)) ctx.fillRect(x, Math.round(sy(d.y)), 2, 2);
      }
      ctx.globalAlpha = 1;
    }

    function text(str: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'left') {
      ctx.font = font;
      ctx.textAlign = align;
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillText(str, x + 1, y + 1);
      ctx.fillStyle = color;
      ctx.fillText(str, x, y);
    }

    function drawHud() {
      const now = Math.max(0, Math.floor(body.y / PX_PER_M));
      const best = Math.max(storedBest, Math.floor(bestLanded / PX_PER_M));
      text(formatMeters(now), 8, 8, FONT_LG, '#ffffff');
      text(`BEST ${formatMeters(best)}`, 8, 22, FONT_SM, '#c9f73d');
    }

    function drawEnd(viewW: number) {
      ctx.fillStyle = 'rgba(8, 8, 16, 0.62)';
      ctx.fillRect(0, 0, viewW, VIEW_H);
      const score = Math.floor(bestLanded / PX_PER_M);
      text(jump.end.title, viewW / 2, 112, FONT_LG, '#ffffff', 'center');
      text(formatMeters(score), viewW / 2, 134, FONT_XL, '#c9f73d', 'center');
      if (endNewBest) text(jump.end.newBest, viewW / 2, 162, FONT_SM, '#ff5ab4', 'center');
    }

    function render(dt: number) {
      const viewW = canvas.width;

      bg.drawBack(ctx, viewW, camY, t);
      bg.drawTower(ctx, viewW, camY);
      bg.drawFront(ctx, viewW, camY);
      drawGround(viewW);
      for (const p of field.query(camY - 12, camY + VIEW_H + 12)) {
        if (p.kind !== 'ground') drawPlatform(p);
      }
      drawBirds();
      drawDust(dt);
      drawPlayer();
      if (mode === 'ended') drawEnd(viewW);
      else drawHud();
    }

    // ---------- 루프 ----------

    let raf = 0;
    let last = performance.now();
    let acc = 0;

    function frame(now: number) {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;

      // 이번 프레임에 걸릴 수 있는 발판만 추린다 (스프링으로 솟을 때 한 프레임에 최대 76px)
      nearby = field.query(body.y - 96, body.y + 96);
      acc += dt;
      let n = 0;
      while (acc >= PHYS_DT && n < 16) {
        step();
        acc -= PHYS_DT;
        n++;
      }
      if (n === 16) acc = 0;

      updateCamera(dt);
      // 앞으로 세 화면 높이까지 발판을 미리 만들어 둔다 — 한 프레임에 4ms 까지만 쓰고 나머지는 다음 프레임에
      field.extendTo(camY + VIEW_H * 3, 4);

      render(dt);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      cancelAnimationFrame(raf);
      last = performance.now();
      acc = 0;
      raf = requestAnimationFrame(frame);
    }

    function releaseInput() {
      input.left = false;
      input.right = false;
      input.jump = false;
    }

    function pause() {
      if (mode !== 'play') return;
      mode = 'paused';
      cancelAnimationFrame(raf);
      releaseInput();
      setPausedBest(Math.floor(bestLanded / PX_PER_M));
      setPaused(true);
    }

    function resume() {
      if (mode !== 'paused') return;
      mode = 'play';
      // 일시정지 전에 모으던 힘은 버린다 — 키를 다시 눌러 새로 모은다
      if (pstate === 'charge') pstate = 'ground';
      jumpArmed = false;
      setPaused(false);
      start();
    }

    function giveUp() {
      if (mode === 'ended') return;
      mode = 'ended';
      cancelAnimationFrame(raf);
      releaseInput();
      const score = Math.floor(bestLanded / PX_PER_M);
      endNewBest = score > 0 && score > storedBest;
      if (endNewBest) {
        writeBest(score);
        storedBest = score;
      }
      setPaused(false);
      setEnded({ score, newBest: endNewBest });
      render(0);
    }

    function retry() {
      field = new PlatformField((Math.random() * 2 ** 32) >>> 0);
      field.extendTo(VIEW_H * 3);
      body = { x: WORLD_W / 2, y: 0, vx: 0, vy: 0 };
      pstate = 'ground';
      standing = field.platforms[0];
      chargeSteps = 0;
      jumpArmed = false;
      facing = 1;
      aim = 0;
      prevLeft = false;
      prevRight = false;
      airApex = 0;
      splatLeft = 0;
      walkDist = 0;
      bestLanded = 0;
      storedBest = readBest();
      endNewBest = false;
      camY = CAM_MIN;
      snapCamX();
      simT = 0;
      guardLeft = 0;
      springFired.clear();
      dust = [];
      mode = 'play';
      setEnded(null);
      showZone(0);
      start();
    }

    pauseRef.current = pause;
    resumeRef.current = resume;
    giveUpRef.current = giveUp;
    retryRef.current = retry;
    captureRef.current = () => {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `jump-woowang-${Math.floor(bestLanded / PX_PER_M)}m.png`;
      a.click();
    };

    // ---------- 입력 ----------

    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Escape') {
        if (mode === 'play') pause();
        else if (mode === 'paused') resume();
        return;
      }
      // 기록 화면의 이름 입력칸 등에서는 손대지 않는다
      if (mode !== 'play') return;
      const k = KEYS[e.code];
      if (!k) return;
      e.preventDefault();
      input[k] = true;
    }

    function onKeyUp(e: KeyboardEvent) {
      const k = KEYS[e.code];
      if (!k) return;
      // 포커스가 남은 버튼이 스페이스로 눌리지 않게, 게임 중에는 keyup 도 막는다
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
  }, []);

  /** 터치 버튼 — 누르는 동안만 켜진다. 두 손가락으로 방향과 JUMP 를 함께 누를 수 있다 */
  function touchProps(key: keyof Input) {
    const set = (e: ReactPointerEvent<HTMLButtonElement>, on: boolean) => {
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
      // 길게 누를 때 뜨는 메뉴·돋보기를 막는다
      onContextMenu: (e: ReactMouseEvent) => e.preventDefault(),
    };
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.canvasBox}>
        <canvas ref={canvasRef} className={styles.canvas} />

        {!ended && !paused && (
          <button
            type="button"
            className={styles.pauseBtn}
            aria-label={jump.pause.title}
            onClick={(e) => {
              e.currentTarget.blur();
              pauseRef.current();
            }}
          >
            Ⅱ
          </button>
        )}

        {banner && !ended && (
          <div key={banner.key} className={styles.banner} onAnimationEnd={() => setBanner(null)}>
            <span className={styles.bannerEn}>{banner.en}</span>
            <span className={styles.bannerKo}>
              {banner.ko} · {formatMeters(banner.m)}
            </span>
          </div>
        )}

        {paused && (
          <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={jump.pause.subtitle}>
            <div className={styles.pauseCard}>
              <p className={styles.pauseTitle}>{jump.pause.title}</p>
              <p className={styles.pauseSub}>{jump.pause.subtitle}</p>
              <p className={styles.pauseBest}>
                {jump.pause.bestLabel} <strong>{formatMeters(pausedBest)}</strong>
              </p>
              <button type="button" className={styles.primary} autoFocus onClick={() => resumeRef.current()}>
                {jump.pause.resume}
              </button>
              <button type="button" className={styles.secondary} onClick={() => giveUpRef.current()}>
                {jump.pause.giveUp}
              </button>
              <button type="button" className={styles.ghost} onClick={onExit}>
                {jump.pause.exit}
              </button>
            </div>
          </div>
        )}
      </div>

      {!ended && (
        <div className={styles.touch} aria-hidden="true">
          <button type="button" className={styles.tbtn} tabIndex={-1} {...touchProps('left')}>
            {jump.touch.left}
          </button>
          <button type="button" className={`${styles.tbtn} ${styles.tjump}`} tabIndex={-1} {...touchProps('jump')}>
            {jump.touch.jump}
          </button>
          <button type="button" className={styles.tbtn} tabIndex={-1} {...touchProps('right')}>
            {jump.touch.right}
          </button>
        </div>
      )}

      {ended && (
        <div className={styles.overActions}>
          <ScoreSubmit score={ended.score} table="jump_scores" formatScore={formatMeters} />
          <button type="button" className={styles.capture} onClick={() => captureRef.current()}>
            <span className={styles.caret} aria-hidden="true">
              ▸
            </span>
            {jump.end.capture}
          </button>
          <button type="button" className={styles.retry} onClick={() => retryRef.current()}>
            {jump.end.retry}
          </button>
          <button type="button" className={styles.retry} onClick={onExit}>
            {jump.end.back}
          </button>
        </div>
      )}
    </div>
  );
}
