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
import {
  WOOWANG_ART,
  bakeCharacter,
  drawCoin,
  drawHang,
  drawHeart,
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
/** 학점 하나의 점수 — 점수는 달린 거리(px)의 절반 + 학점 x 5 (V1 점수와 비슷한 크기) */
const COIN_POINTS = 5;
/** 구간이 바뀔 때 배경을 겹쳐 넘기는 시간 */
const ZONE_FADE = 0.9;

type Mode = 'play' | 'paused' | 'over';
type Input = { jump: boolean; slide: boolean };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number };
type Banner = { key: number; en: string; ko: string; sub: string };
type Result = { score: number; coins: number; meters: number; reached: string; newBest: boolean; cause: string };

const KEYS: Record<string, keyof Input> = {
  Space: 'jump',
  ArrowUp: 'jump',
  KeyW: 'jump',
  ArrowDown: 'slide',
  KeyS: 'slide',
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

function zoneLabel(x: number) {
  const z = zoneAt(x);
  return { ...ZONES[z.index], semester: z.semester };
}

type RunGameProps = {
  onExit: () => void;
};

/**
 * 달려라 우왕이 V2 — 쿠키런식 러너.
 *
 * 일정한 속도로 달리며 점프 · 이단 점프 · 슬라이드로 장애물과 구덩이를 넘고 학점을 모은다.
 * 체력은 시간이 지나면 줄고, 부딪히거나 구덩이에 빠지면 크게 깎이며, 하트로 회복한다.
 * 체력이 바닥나면 끝. 코스는 lib/run/chunks.ts 의 조각을 구간(교실 → … → 시험장) 등급에
 * 맞춰 이어 붙이고, 학기가 바뀔 때마다 어려워진다.
 *
 * 게임 루프는 리렌더 없이 rAF 로만 돈다. HUD 숫자는 바뀔 때만 DOM 을 직접 고치고,
 * React 상태는 일시정지 · 결과 화면 · 구간 배너처럼 드물게 바뀌는 것에만 쓴다.
 */
export default function RunGame({ onExit }: RunGameProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hpFillRef = useRef<HTMLElement>(null);
  const hpBlockRef = useRef<HTMLDivElement>(null);
  const coinRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<HTMLElement>(null);
  const zoneRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<Input>({ jump: false, slide: false });
  const jumpLatchRef = useRef(false);

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
    const sprites = bakeCharacter(WOOWANG_ART);
    const maxJumps = 2;

    // ---------- 판 상태 ----------

    let mode: Mode = 'play';
    let course = new Course((Math.random() * 2 ** 32) >>> 0, CHUNKS);
    let dist = 0;
    let runner = newRunner();
    let hp = HP_MAX;
    let coins = 0;
    let guard = 0;
    /** 구덩이에 빠졌다가 끌어올려지는 중 — 최소 rescueLeft 초, 그 뒤로도 발밑에 땅이 올 때까지 떠 있다 */
    let rescuing = false;
    let rescueLeft = 0;
    let zoneIdx = 0;
    let semester = 1;
    let prevZone = 0;
    let fade = 1;
    let t = 0;
    let sparks: Spark[] = [];
    let bannerKey = 0;
    const best = readBest();

    course.extendTo(VIEW_W * 2);

    function showBanner() {
      const z = ZONES[zoneIdx];
      setBanner({ key: ++bannerKey, en: z.en, ko: z.ko, sub: `${semester}학기` });
    }
    showBanner();

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

    function burst(x: number, y: number, n: number, colors: string[], speed: number, up = 30) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = speed * (0.4 + Math.random() * 0.6);
        sparks.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - up,
          life: 0.35 + Math.random() * 0.25,
          max: 0.6,
          color: colors[i % colors.length],
          size: Math.random() < 0.3 ? 2 : 1,
        });
      }
      if (sparks.length > 200) sparks.splice(0, sparks.length - 200);
    }

    // ---------- 물리 (1/120초 고정 스텝) ----------

    function nearSurfaces(): Surface[] {
      return course.surfacesNear(dist, 40);
    }

    function step() {
      const near = nearSurfaces();
      const wasGrounded = runner.grounded;

      if (rescuing) {
        // 끌어올려지는 중 — 떠 있다가 발밑에 땅이 오면 놓아 준다
        rescueLeft -= PHYS_DT;
        runner.y += (GROUND_Y - 70 - runner.y) * Math.min(1, PHYS_DT * 8);
        const ground = near.some((s) => s.kind === 'ground' && dist >= s.x0 + 8 && dist <= s.x1 - 8);
        if (rescueLeft <= 0 && ground) {
          rescuing = false;
          runner.vy = 0;
          runner.grounded = false;
          runner.airJumps = maxJumps - 1;
        }
      } else {
        const jumpPressed = jumpLatchRef.current;
        jumpLatchRef.current = false;
        const vyBefore = runner.vy;
        stepRunner(runner, dist, { jumpPressed, slide: input.slide }, near, maxJumps);
        if (jumpPressed && runner.vy < vyBefore - 50) burst(dist, runner.y, 4, ['#efe6d2'], 40, 0);
        if (!wasGrounded && runner.grounded) burst(dist, runner.y, 3, ['#efe6d2'], 30, 0);
      }

      dist += RUN_SPEED * PHYS_DT;
      hp -= HP_DRAIN * PHYS_DT;
      if (guard > 0) guard -= PHYS_DT;

      // 학점 · 하트
      const body = hitbox(runner, dist);
      for (const p of course.pickups) {
        if (p.x > dist + 20) break;
        if (p.taken || p.x < dist - 20) continue;
        const reach = p.kind === 'coin' ? 5 : 7;
        if (p.x + reach > body.x0 && p.x - reach < body.x1 && p.y + reach > body.y0 && p.y - reach < body.y1) {
          p.taken = true;
          if (p.kind === 'coin') {
            coins += 1;
            burst(p.x, p.y, 3, ['#c9f73d', '#ffffff'], 40);
          } else {
            hp = Math.min(HP_MAX, hp + HP_HEART);
            burst(p.x, p.y, 8, ['#ff2f8f', '#ffd0e4'], 60);
          }
        }
      }

      // 장애물
      if (guard <= 0 && !rescuing) {
        for (const o of course.obstacles) {
          if (o.x > dist + 20) break;
          if (o.hit || o.x + o.w < dist - 20) continue;
          if (touches(body, o)) {
            o.hit = true;
            hp -= HP_HIT;
            guard = HIT_GUARD;
            burst(dist, runner.y - 12, 10, ['#ff2f8f', '#ffffff'], 70);
            break;
          }
        }
      }

      // 구덩이
      if (!rescuing && fellOut(runner)) {
        hp -= HP_PIT;
        rescuing = true;
        rescueLeft = 0.5;
        guard = HIT_GUARD + 0.5;
        runner.y = VIEW_H + 10;
        runner.vy = 0;
        runner.grounded = false;
      }

      // 구간
      const z = zoneAt(dist);
      if (z.index !== zoneIdx || z.semester !== semester) {
        prevZone = zoneIdx;
        zoneIdx = z.index;
        semester = z.semester;
        fade = 0;
        showBanner();
      }

      if (hp <= 0) end('체력이 바닥났다…');
    }

    // ---------- 그리기 ----------

    const sx = (wx: number) => Math.round(wx - dist + PLAYER_SCREEN_X);

    function drawWorld(dt: number) {
      if (fade < 1) fade = Math.min(1, fade + dt / ZONE_FADE);
      if (fade < 1) bg.draw(ctx, prevZone, dist, 1);
      bg.draw(ctx, zoneIdx, dist, fade < 1 ? fade : 1);

      const lo = dist - PLAYER_SCREEN_X - 60;
      const hi = lo + VIEW_W + 120;
      for (const s of course.surfaces) {
        if (s.x1 < lo || s.x0 > hi) continue;
        if (s.kind === 'ground') bg.drawGround(ctx, zoneIdx, sx(s.x0), sx(s.x1), dist);
      }
      for (const s of course.surfaces) {
        if (s.kind !== 'plat' || s.x1 < lo || s.x0 > hi) continue;
        drawPlatform(ctx, zoneAt(s.x0).index, sx(s.x0), s.y, s.x1 - s.x0);
      }
      for (const o of course.obstacles) {
        if (o.x + o.w < lo || o.x > hi) continue;
        const z = zoneAt(o.x).index;
        if (o.kind === 'low') drawLow(ctx, z, sx(o.x), o.y);
        else if (o.kind === 'tall') drawTall(ctx, z, sx(o.x), o.y);
        else drawHang(ctx, z, sx(o.x), o.w, o.y + o.h, t);
      }
      for (const p of course.pickups) {
        if (p.taken || p.x < lo || p.x > hi) continue;
        if (p.kind === 'coin') drawCoin(ctx, sx(p.x), p.y, t);
        else drawHeart(ctx, sx(p.x), p.y, t);
      }
    }

    function drawRunner() {
      // 부딪힌 직후 · 끌어올려지는 중엔 깜빡인다
      if ((guard > 0 || rescuing) && Math.floor(t * 14) % 2 === 0) return;
      let pose: Pose = 'stand';
      if (rescuing || !runner.grounded) pose = 'jump';
      else if (runner.sliding) pose = 'slide';
      else pose = Math.floor(dist / 9) % 2 === 0 ? 'runA' : 'runB';
      const img = sprites[pose];
      const top = pose === 'slide' ? runner.y - img.height : runner.y - 20;
      // 달릴 때 한 걸음마다 1px 들썩
      const bob = pose === 'runA' ? -1 : 0;
      ctx.drawImage(img, PLAYER_SCREEN_X - 8, Math.round(top) + bob);
      if (runner.sliding) {
        // 슬라이드 — 뒤로 흩날리는 속도선
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (let i = 0; i < 3; i++) ctx.fillRect(PLAYER_SCREEN_X - 16 - ((t * 120 + i * 9) % 18), Math.round(runner.y - 3 - i * 3), 6, 1);
      }
    }

    function drawSparks(dt: number) {
      for (const s of sparks) {
        s.life -= dt;
        s.vy += 160 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
      }
      sparks = sparks.filter((s) => s.life > 0);
      for (const s of sparks) {
        ctx.globalAlpha = Math.min(1, (s.life / s.max) * 1.8);
        ctx.fillStyle = s.color;
        ctx.fillRect(sx(s.x), Math.round(s.y), s.size, s.size);
      }
      ctx.globalAlpha = 1;
    }

    // HUD — 값이 바뀔 때만 DOM 을 고친다
    let shownHp = -1;
    let shownCoins = -1;
    let shownScore = -1;
    let shownZone = '';
    const score = () => Math.floor(dist * 0.5) + coins * COIN_POINTS;

    function updateHud() {
      const hpPct = Math.max(0, Math.round((hp / HP_MAX) * 100));
      if (hpPct !== shownHp) {
        shownHp = hpPct;
        if (hpFillRef.current) hpFillRef.current.style.width = `${hpPct}%`;
        hpBlockRef.current?.toggleAttribute('data-low', hpPct <= 25);
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
      drawRunner();
      drawSparks(dt);
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
      jumpLatchRef.current = false;
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
      const reach = zoneLabel(dist);
      setResult({
        score: sc,
        coins,
        meters: Math.floor(dist / PX_PER_M),
        reached: `${reach.semester}학기 · ${reach.ko}`,
        newBest,
        cause,
      });
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
      guard = 0;
      rescuing = false;
      rescueLeft = 0;
      zoneIdx = 0;
      semester = 1;
      prevZone = 0;
      fade = 1;
      sparks = [];
      mode = 'play';
      setResult(null);
      showBanner();
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
  }, []);

  /** 터치 버튼 — 누르는 동안만 켜진다 */
  function touchProps(key: keyof Input) {
    const set = (e: ReactPointerEvent<HTMLButtonElement>, on: boolean) => {
      if (key === 'jump' && on && !inputRef.current.jump) jumpLatchRef.current = true;
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
              <div className={styles.coins}>
                <i className={styles.coinIcon} aria-hidden="true" />
                <span ref={coinRef}>0</span>
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
            </div>
          )}

          {/* ---------- 터치 버튼 (터치 화면에서만) ---------- */}
          {!result && !paused && (
            <div className={styles.touch} aria-hidden="true">
              <button type="button" className={`${styles.tbtn} ${styles.tslide}`} tabIndex={-1} {...touchProps('slide')}>
                <span>▼</span>
                SLIDE
              </button>
              <button type="button" className={`${styles.tbtn} ${styles.tjump}`} tabIndex={-1} {...touchProps('jump')}>
                <span>▲</span>
                JUMP
              </button>
            </div>
          )}

          {/* ---------- 일시정지 ---------- */}
          {paused && (
            <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="일시정지">
              <div className={styles.card}>
                <p className={styles.cardTitle}>PAUSED</p>
                <p className={styles.cardSub}>일시정지</p>
                <button type="button" className={styles.primary} autoFocus onClick={() => resumeRef.current()}>
                  ▸ 계속 달리기
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
                <p className={styles.cause}>{result.cause}</p>
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
