'use client';

import { useEffect, useRef, useState } from 'react';
import play from '@/data/play.json';
import ScoreSubmit from './ScoreSubmit';
import styles from './WoowangGame.module.css';

const VIRTUAL_W = 320;
const VIRTUAL_H = 180;
const FLOOR_Y = 150;

const BEST_KEY = 'gdevfc_woowang_best';

type Phase = 'phase1' | 'phase2' | 'gameover';
type ObstacleType = 'low' | 'high' | 'heart';
type WoowangPose = 'idle' | 'run' | 'jump' | 'duck';

type Obstacle = {
  type: ObstacleType;
  x: number;
  y: number;
  w: number;
  h: number;
};

type Box = { x: number; y: number; w: number; h: number };

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function aabb(a: Box, b: Box) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

const PIXEL_FONT_SM = "9px 'Press Start 2P', monospace";
const PIXEL_FONT_MD = "10px 'Press Start 2P', monospace";
const PIXEL_FONT_LG = "16px 'Press Start 2P', monospace";

// ---------- 픽셀 캐릭터 드로잉 ----------

/**
 * 우왕이 — 뿔 달린 주황 소, 버건디 재킷.
 * 서 있을 때는 머리(털+얼굴패치+눈+볼터치)와 재킷(단추)을 분리해서 그리고,
 * 숙일 때는 웅크린 덩어리 하나로 단순화한다.
 */
function drawWoowang(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  opts: { pose: WoowangPose; legPhase: number; hit: boolean }
) {
  const { pose, legPhase, hit } = opts;
  const furColor = hit ? '#ff2f8f' : '#e8935a';
  const jacketColor = hit ? '#c91f6f' : '#7a2438';
  const jacketShade = hit ? '#8f1552' : '#5c1b2a';
  const faceColor = '#f7dfb0';
  const hornColor = '#f5f0e0';
  const eyeColor = '#141414';
  const cheekColor = '#f2a6b0';

  const isDuck = pose === 'duck';
  const bw = 18;
  const bh = isDuck ? 11 : 20;
  const top = groundY - bh;

  if (isDuck) {
    ctx.fillStyle = furColor;
    ctx.fillRect(x, top, bw, 6);
    ctx.fillStyle = jacketColor;
    ctx.fillRect(x, top + 6, bw, bh - 6);
    ctx.fillStyle = eyeColor;
    ctx.fillRect(x + bw - 6, top + 2, 2, 2);
    return;
  }

  const headH = 8;

  // 머리
  ctx.fillStyle = furColor;
  ctx.fillRect(x, top, bw, headH);
  ctx.fillStyle = faceColor;
  ctx.fillRect(x + 4, top + 3, bw - 9, 5);
  ctx.fillStyle = hornColor;
  ctx.fillRect(x + 2, top - 3, 2, 4);
  ctx.fillRect(x + bw - 4, top - 3, 2, 4);
  ctx.fillStyle = cheekColor;
  ctx.fillRect(x + 1, top + 5, 2, 2);
  ctx.fillStyle = eyeColor;
  ctx.fillRect(x + bw - 7, top + 4, 2, 2);

  // 재킷 (버건디, 단추)
  const jacketTop = top + headH;
  const jacketH = bh - headH;
  ctx.fillStyle = jacketColor;
  ctx.fillRect(x, jacketTop, bw, jacketH);
  ctx.fillStyle = jacketShade;
  ctx.fillRect(x, jacketTop + jacketH - 3, bw, 3);
  ctx.fillStyle = hornColor;
  ctx.fillRect(x + bw / 2 - 1, jacketTop + 2, 2, 2);
  ctx.fillRect(x + bw / 2 - 1, jacketTop + jacketH - 6, 2, 2);

  ctx.fillStyle = eyeColor;
  if (pose === 'run') {
    const lift = legPhase === 0 ? 2 : 0;
    const lift2 = legPhase === 0 ? 0 : 2;
    ctx.fillRect(x + 2, top + bh, 3, 5 - lift);
    ctx.fillRect(x + bw - 5, top + bh, 3, 5 - lift2);
  } else if (pose === 'jump') {
    ctx.fillRect(x + 2, top + bh, 3, 3);
    ctx.fillRect(x + bw - 5, top + bh, 3, 3);
  } else {
    ctx.fillRect(x + 2, top + bh, 3, 4);
    ctx.fillRect(x + bw - 5, top + bh, 3, 4);
  }
}

function drawProfessor(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  facing: 'board' | 'front'
) {
  const bw = 16;
  const bh = 34;
  const top = groundY - bh;

  ctx.fillStyle = '#3a3d44';
  ctx.fillRect(x, top + 8, bw, bh - 8);
  ctx.fillStyle = '#e8c9a0';
  ctx.fillRect(x + 3, top, bw - 6, 10);

  if (facing === 'front') {
    ctx.fillStyle = '#141414';
    ctx.fillRect(x + 5, top + 4, 2, 2);
    ctx.fillRect(x + bw - 7, top + 4, 2, 2);
  } else {
    ctx.fillStyle = '#1f2126';
    ctx.fillRect(x + 3, top + 2, bw - 6, 4);
  }
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#ff2f8f';
  ctx.fillRect(x + 2, y, 3, 2);
  ctx.fillRect(x + 7, y, 3, 2);
  ctx.fillRect(x, y + 2, 10, 3);
  ctx.fillRect(x + 1, y + 5, 8, 2);
  ctx.fillRect(x + 2, y + 7, 6, 2);
  ctx.fillRect(x + 3, y + 9, 4, 2);
}

type WoowangGameProps = {
  onExit: () => void;
};

/**
 * 페이즈1(교실 탈출) + 페이즈2(횡스크롤 러닝)를 한 캔버스에서 처리하는
 * 게임 엔진. 상태는 전부 이 effect 안의 클로저 변수로 관리해 매 프레임
 * 리렌더 없이 rAF 루프만으로 동작한다 (GateScene.tsx 와 동일한 패턴).
 */
export default function WoowangGame({ onExit }: WoowangGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOverUI, setGameOverUI] = useState(false);
  const [scoreForUI, setScoreForUI] = useState(0);
  const retryRef = useRef<() => void>(() => {});
  const captureRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx2d = canvasEl.getContext('2d');
    if (!ctx2d) return;
    // 아래 중첩 함수 선언들은 TS 의 null 좁히기가 유지되지 않으므로,
    // 타입이 고정된 새 상수에 담아 매번 non-null 단언을 반복하지 않는다.
    const ctx: CanvasRenderingContext2D = ctx2d;
    const canvas: HTMLCanvasElement = canvasEl;

    canvas.width = VIRTUAL_W;
    canvas.height = VIRTUAL_H;

    // 렌더 해상도(320x180)는 고정하고, 화면 표시 크기만 컨테이너에 맞춰
    // letterbox 로 계산한다. CSS 의 aspect-ratio+max-width/height 조합은
    // flex 자식인 canvas 를 실제로 "최대한 키우지" 않아서 (auto 크기 유지)
    // 항상 원본 320x180 그대로 작게 보이는 문제가 있었다.
    const box = canvas.parentElement;
    function resizeCanvasDisplay() {
      if (!box) return;
      const bw = box.clientWidth;
      const bh = box.clientHeight;
      if (bw === 0 || bh === 0) return;
      const targetRatio = VIRTUAL_W / VIRTUAL_H;
      const boxRatio = bw / bh;
      const displayW = boxRatio > targetRatio ? bh * targetRatio : bw;
      const displayH = boxRatio > targetRatio ? bh : bw / targetRatio;
      canvas.style.width = `${Math.floor(displayW)}px`;
      canvas.style.height = `${Math.floor(displayH)}px`;
    }
    resizeCanvasDisplay();
    const resizeObserver = new ResizeObserver(resizeCanvasDisplay);
    if (box) resizeObserver.observe(box);

    // ---------- 페이즈1: 교실 탈출 ----------
    const P1_START_X = 252;
    const DOOR_X = 20;
    const MOVE_SPEED = 62;

    let phase: Phase = 'phase1';
    let p1x = P1_START_X;
    let holding = false;
    let safe = true;
    let phaseTimerEnd = performance.now() + rand(2000, 2800);
    let caughtUntil = 0;

    // ---------- 페이즈2: 횡스크롤 러닝 ----------
    const BASE_SPEED = 92;
    const ACCEL = 4.4; // 갈수록 빠르게 가속
    const MAX_SPEED = 280;
    const GRAVITY = 950;
    const JUMP_V = -300;
    const PLAYER_X = 46;
    /** 40초에 걸쳐 0→1 로 포화되는 난이도 계수. 스폰 간격/장애물 구성에 쓴다 */
    const DIFFICULTY_RAMP_SEC = 40;

    let scrollSpeed = BASE_SPEED;
    let elapsed = 0;
    let scrollOffset = 0;
    let py = FLOOR_Y;
    let pvy = 0;
    let grounded = true;
    let ducking = false;
    let duckHeld = false;
    let obstacles: Obstacle[] = [];
    let nextSpawnAt = 0;
    let score = 0;
    let lives = 3;
    let invulnUntil = 0;

    let legPhase = 0;
    let legTimer = 0;

    // ---------- 게임오버 ----------
    let finalScore = 0;
    let bestScore = Number(localStorage.getItem(BEST_KEY) ?? 0);
    let isNewBest = false;

    function resetPhase1() {
      phase = 'phase1';
      p1x = P1_START_X;
      holding = false;
      safe = true;
      phaseTimerEnd = performance.now() + rand(2000, 2800);
      caughtUntil = 0;
    }

    function resetPhase2() {
      scrollSpeed = BASE_SPEED;
      elapsed = 0;
      scrollOffset = 0;
      py = FLOOR_Y;
      pvy = 0;
      grounded = true;
      ducking = false;
      duckHeld = false;
      obstacles = [];
      nextSpawnAt = performance.now() + rand(900, 1500);
      score = 0;
      lives = 3;
      invulnUntil = 0;
    }

    function startPhase2() {
      phase = 'phase2';
      resetPhase2();
    }

    function jump() {
      if (phase !== 'phase2' || !grounded || ducking) return;
      pvy = JUMP_V;
      grounded = false;
    }

    function triggerGameOver() {
      phase = 'gameover';
      finalScore = Math.floor(score);
      isNewBest = finalScore > bestScore;
      if (isNewBest) {
        bestScore = finalScore;
        localStorage.setItem(BEST_KEY, String(bestScore));
      }
      setScoreForUI(finalScore);
      setGameOverUI(true);
    }

    function playerHitbox(): Box {
      const bw = 18;
      const bh = ducking ? 11 : 20;
      return { x: PLAYER_X, y: py - bh, w: bw, h: bh };
    }

    function makeObstacle(type: ObstacleType, x: number): Obstacle {
      if (type === 'low') return { type, x, y: FLOOR_Y - 16, w: 14, h: 16 };
      if (type === 'high') return { type, x, y: 126, w: 18, h: 11 };
      return { type, x, y: FLOOR_Y - 34, w: 10, h: 10 };
    }

    /** 장애물 스폰. 난이도가 오를수록 간격이 좁아지고, 하트는 줄고,
     * 일정 확률로 바로 뒤에 두 번째 장애물이 따라붙는 콤보가 나온다 */
    function spawnObstacle(now: number, difficulty: number) {
      const heartChance = Math.max(0.1, 0.25 - difficulty * 0.15);
      const lowChance = 0.4;
      const r = Math.random();
      const type: ObstacleType = r < heartChance ? 'heart' : r < heartChance + lowChance ? 'low' : 'high';

      obstacles.push(makeObstacle(type, VIRTUAL_W + 10));

      if (type !== 'heart' && difficulty > 0.25 && Math.random() < difficulty * 0.4) {
        const comboType: ObstacleType = Math.random() < 0.5 ? 'low' : 'high';
        obstacles.push(makeObstacle(comboType, VIRTUAL_W + 10 + rand(38, 56)));
      }

      const minGap = 900 - difficulty * 420;
      const maxGap = 1900 - difficulty * 750;
      nextSpawnAt = now + rand(minGap, maxGap);
    }

    // ---------- update ----------

    function updatePhase1(dt: number, now: number) {
      legTimer += dt;
      if (legTimer > 0.28) {
        legTimer = 0;
        legPhase = legPhase === 0 ? 1 : 0;
      }

      if (now < caughtUntil) return;

      if (now >= phaseTimerEnd) {
        safe = !safe;
        phaseTimerEnd = now + rand(2000, 2800);
      }

      if (!holding) return;

      if (safe) {
        p1x -= MOVE_SPEED * dt;
        if (p1x <= DOOR_X) startPhase2();
      } else {
        holding = false;
        p1x = P1_START_X;
        caughtUntil = now + 900;
      }
    }

    function updatePhase2(dt: number, now: number) {
      elapsed += dt;
      scrollSpeed = Math.min(MAX_SPEED, BASE_SPEED + elapsed * ACCEL);
      scrollOffset += scrollSpeed * dt;
      score += scrollSpeed * dt * 0.5;

      ducking = grounded && duckHeld;

      if (!grounded) {
        pvy += GRAVITY * dt;
        py += pvy * dt;
        if (py >= FLOOR_Y) {
          py = FLOOR_Y;
          pvy = 0;
          grounded = true;
        }
      }

      legTimer += dt;
      if (legTimer > Math.max(0.08, 0.2 - elapsed * 0.004)) {
        legTimer = 0;
        legPhase = legPhase === 0 ? 1 : 0;
      }

      const difficulty = Math.min(1, elapsed / DIFFICULTY_RAMP_SEC);
      if (now >= nextSpawnAt) spawnObstacle(now, difficulty);

      const hitbox = playerHitbox();
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const ob = obstacles[i];
        ob.x -= scrollSpeed * dt;

        if (ob.x + ob.w < -4) {
          obstacles.splice(i, 1);
          continue;
        }

        if (ob.type === 'heart') {
          if (aabb(hitbox, ob)) {
            lives = Math.min(3, lives + 1);
            obstacles.splice(i, 1);
          }
          continue;
        }

        if (now >= invulnUntil && aabb(hitbox, ob)) {
          lives -= 1;
          invulnUntil = now + 1000;
          obstacles.splice(i, 1);
          if (lives <= 0) {
            triggerGameOver();
            return;
          }
        }
      }
    }

    // ---------- render ----------

    function renderPhase1(now: number) {
      ctx.fillStyle = '#111116';
      ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

      ctx.fillStyle = '#1d3a2a';
      ctx.fillRect(240, 30, 66, 46);
      ctx.fillStyle = 'rgba(223,242,255,0.45)';
      ctx.fillRect(250, 42, 30, 2);
      ctx.fillRect(250, 50, 42, 2);
      ctx.fillRect(250, 58, 24, 2);

      ctx.fillStyle = '#2a2d33';
      for (const dx of [70, 118, 166, 214]) {
        ctx.fillRect(dx, 122, 30, 6);
        ctx.fillRect(dx + 2, 128, 4, 20);
        ctx.fillRect(dx + 24, 128, 4, 20);
      }

      ctx.strokeStyle = 'rgba(201,247,61,0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(9, 88, 24, 62);
      ctx.fillStyle = 'rgba(201,247,61,0.08)';
      ctx.fillRect(9, 88, 24, 62);

      drawProfessor(ctx, 282, FLOOR_Y, safe ? 'board' : 'front');
      drawWoowang(ctx, p1x, FLOOR_Y, {
        pose: holding ? 'run' : 'idle',
        legPhase,
        hit: now < caughtUntil,
      });

      ctx.font = PIXEL_FONT_SM;
      ctx.textAlign = 'center';
      if (now < caughtUntil) {
        ctx.fillStyle = '#ff2f8f';
        ctx.fillText(play.phase1.caughtMessage, VIRTUAL_W / 2, 20);
      } else {
        ctx.fillStyle = safe ? '#c9f73d' : '#ff2f8f';
        ctx.fillText(safe ? play.phase1.safeLabel : play.phase1.dangerLabel, VIRTUAL_W / 2, 20);
      }
      ctx.textAlign = 'left';
    }

    function renderPhase2Background() {
      ctx.fillStyle = '#0d0e12';
      ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

      ctx.fillStyle = 'rgba(223,242,255,0.15)';
      for (let i = 0; i < 14; i++) {
        const raw = i * 47 - scrollOffset * 0.2;
        const x = ((raw % (VIRTUAL_W + 40)) + VIRTUAL_W + 40) % (VIRTUAL_W + 40);
        ctx.fillRect(x - 20, 20 + (i % 5) * 14, 2, 2);
      }

      ctx.fillStyle = '#1c1f14';
      ctx.fillRect(0, FLOOR_Y, VIRTUAL_W, VIRTUAL_H - FLOOR_Y);
      ctx.strokeStyle = 'rgba(201,247,61,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, FLOOR_Y + 0.5);
      ctx.lineTo(VIRTUAL_W, FLOOR_Y + 0.5);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(201,247,61,0.14)';
      const stripe = 26;
      const off = scrollOffset % stripe;
      for (let x = -off; x < VIRTUAL_W; x += stripe) {
        ctx.beginPath();
        ctx.moveTo(x, FLOOR_Y + 6);
        ctx.lineTo(x - 10, VIRTUAL_H);
        ctx.stroke();
      }
    }

    function renderObstacles() {
      for (const ob of obstacles) {
        if (ob.type === 'heart') {
          drawHeart(ctx, ob.x, ob.y);
        } else if (ob.type === 'low') {
          ctx.fillStyle = '#8a5a2a';
          ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
          ctx.fillStyle = '#c9f73d';
          ctx.fillRect(ob.x, ob.y, ob.w, 3);
        } else {
          ctx.fillStyle = '#ff2f8f';
          ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.fillRect(ob.x, ob.y + ob.h - 3, ob.w, 2);
        }
      }
    }

    function renderHUD() {
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = i < lives ? 1 : 0.25;
        drawHeart(ctx, 10 + i * 14, 8);
      }
      ctx.globalAlpha = 1;

      ctx.font = PIXEL_FONT_SM;
      ctx.fillStyle = '#c9f73d';
      ctx.textAlign = 'right';
      ctx.fillText(String(Math.floor(score)).padStart(5, '0'), VIRTUAL_W - 10, 14);
      ctx.textAlign = 'left';
    }

    function renderPhase2(now: number) {
      renderPhase2Background();
      renderObstacles();

      const hit = now < invulnUntil && Math.floor(now / 80) % 2 === 0;
      const pose: WoowangPose = !grounded ? 'jump' : ducking ? 'duck' : 'run';
      drawWoowang(ctx, PLAYER_X, py, { pose, legPhase, hit });

      renderHUD();
    }

    function renderGameOver() {
      ctx.fillStyle = 'rgba(5,5,5,0.82)';
      ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

      ctx.textAlign = 'center';
      ctx.font = PIXEL_FONT_LG;
      ctx.fillStyle = '#ff2f8f';
      ctx.fillText(play.gameOver.title, VIRTUAL_W / 2, 58);

      ctx.font = PIXEL_FONT_MD;
      ctx.fillStyle = '#c9f73d';
      ctx.fillText(
        `${play.gameOver.scoreLabel} ${String(finalScore).padStart(5, '0')}`,
        VIRTUAL_W / 2,
        90
      );

      ctx.fillStyle = '#e8e8e8';
      ctx.fillText(
        `${play.gameOver.bestLabel} ${String(bestScore).padStart(5, '0')}`,
        VIRTUAL_W / 2,
        110
      );

      if (isNewBest) {
        ctx.font = PIXEL_FONT_SM;
        ctx.fillStyle = '#c9f73d';
        ctx.fillText(play.gameOver.newBestLabel, VIRTUAL_W / 2, 130);
      }

      ctx.textAlign = 'left';
    }

    // ---------- 입력 ----------

    function onKeyDown(e: KeyboardEvent) {
      if (phase === 'gameover' || e.repeat) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (phase === 'phase1') holding = true;
        else jump();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        duckHeld = true;
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space' && phase === 'phase1') holding = false;
      else if (e.code === 'ArrowDown') duckHeld = false;
    }

    let pointerDown = false;
    let pointerStartY = 0;
    let dragTriggeredDuck = false;

    function onPointerDown(e: PointerEvent) {
      if (phase === 'gameover') return;
      e.preventDefault();
      pointerDown = true;
      pointerStartY = e.clientY;
      dragTriggeredDuck = false;
      if (phase === 'phase1') holding = true;
    }

    function onPointerMove(e: PointerEvent) {
      if (!pointerDown || phase !== 'phase2') return;
      if (e.clientY - pointerStartY > 18) {
        duckHeld = true;
        dragTriggeredDuck = true;
      }
    }

    function onPointerUp() {
      if (!pointerDown) return;
      if (phase === 'phase1') holding = false;
      if (phase === 'phase2') {
        if (dragTriggeredDuck) duckHeld = false;
        else jump();
      }
      pointerDown = false;
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ---------- 루프 ----------

    let raf = 0;
    let last = performance.now();

    function loop(now: number) {
      const dt = Math.min(48, now - last) / 1000;
      last = now;

      if (phase === 'phase1') updatePhase1(dt, now);
      else if (phase === 'phase2') updatePhase2(dt, now);

      if (phase === 'phase1') renderPhase1(now);
      else if (phase === 'phase2') renderPhase2(now);
      else renderGameOver();

      if (phase !== 'gameover') raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    retryRef.current = () => {
      setGameOverUI(false);
      resetPhase1();
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    captureRef.current = () => {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `woowang-record-${finalScore}.png`;
      a.click();
    };

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.canvasBox}>
        <canvas ref={canvasRef} className={styles.canvas} />
        {/* 모바일 전체화면 모드에서는 헤더의 BACK 링크가 사라지므로,
            언제든 빠져나갈 수 있게 캔버스 위에 작은 나가기 버튼을 둔다.
            데스크톱에서는 헤더 BACK 이 이미 있어 CSS 로 숨긴다 */}
        {!gameOverUI && (
          <button
            type="button"
            className={styles.exitBtn}
            onClick={onExit}
            aria-label={play.gameOver.backLabel}
          >
            ✕
          </button>
        )}
      </div>

      {gameOverUI && (
        <div className={styles.overActions}>
          <ScoreSubmit score={scoreForUI} />
          <button type="button" className={styles.capture} onClick={() => captureRef.current()}>
            <span className={styles.caret} aria-hidden="true">
              ▸
            </span>
            {play.gameOver.captureLabel}
          </button>
          <button type="button" className={styles.retry} onClick={() => retryRef.current()}>
            {play.gameOver.retryLabel}
          </button>
          <button type="button" className={styles.retry} onClick={onExit}>
            {play.gameOver.backLabel}
          </button>
        </div>
      )}
    </div>
  );
}
