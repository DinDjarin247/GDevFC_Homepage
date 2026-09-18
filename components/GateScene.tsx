'use client';

import { useEffect, useRef } from 'react';

type GateSceneProps = {
  className?: string;
  /** true 가 되면 성문이 열린다 — 광장으로 넘어가기 직전의 연출 */
  opening?: boolean;
};

/**
 * 타이틀 화면 배경 — 마을 성문 앞 밤길.
 *
 * 대문이 우주 배경인데 들어가면 중세 마을 광장이라 장르가 둘로 갈렸다.
 * 문 하나만 지나면 그 광장이라는 걸 보여줘야 두 화면이 한 세계로 읽힌다.
 * 별밤은 버리지 않고 하늘 레이어로 그대로 쓴다.
 *
 * 저해상도 가상 캔버스를 CSS 로 늘려 8비트 질감을 내고 렌더 비용을 낮춘다
 * (PlazaScene 과 같은 기법).
 *
 * 다만 별만 흩뿌리던 때와 달리 이제는 형태가 있는 그림이라, 캔버스를 화면 비율과
 * 무관하게 늘리면 달이 찌그러지고 횃불이 길쭉해진다. 그래서 세로(H)만 고정하고
 * 가로(W)를 화면 비율에 맞춰 잡는다 — 성문·성벽·길의 크기는 어느 기기에서나 같고,
 * 화면이 좁아지면 양옆 마을이 잘려 나갈 뿐이다.
 */
const H = 270;
const W_MIN = 190;
const W_MAX = 900;

/** 성벽 윗면 / 아치 어깨 / 땅 — 이 세 줄이 화면의 뼈대다 (H 가 고정이라 모두 상수) */
const WALL_TOP = 150;
const ARCH_SPRING = 192;
const GROUND_Y = 236;
const ARCH_TOP = 162;
/** 성문 자체는 기기와 무관하게 같은 크기로 보여야 한다 */
const GATE_W = 76;

type Star = { x: number; y: number; size: number; alpha: number; speed: number; phase: number };
type Ember = { x: number; y: number; vy: number; life: number; max: number; tone: string };

const EMBER_TONES = ['#ffd27a', '#ff9a3c', '#ffe9b0'];

export default function GateScene({ className, opening = false }: GateSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 프레임 루프가 항상 최신 값을 보도록 ref 로 건넨다 (루프를 다시 만들지 않기 위해)
  const openingRef = useRef(opening);
  openingRef.current = opening;

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx2d = canvasEl.getContext('2d');
    if (!ctx2d) return;
    const ctx: CanvasRenderingContext2D = ctx2d;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 화면 비율에 따라 다시 잡히는 값들 ---------- */
    let W = 480;
    let gateL = 202;
    let gateR = 278;
    let stars: Star[] = [];
    let torches: [number, number][] = [];
    const embers: Ember[] = [];

    /** 움직이지 않는 레이어는 한 번만 그려 캐시한다 */
    const backdrop = document.createElement('canvas');
    const bgCtx = backdrop.getContext('2d');
    if (!bgCtx) return;
    const b: CanvasRenderingContext2D = bgCtx;

    function paintBackdrop() {
      b.clearRect(0, 0, W, H);

      /** 돌과 자갈 배치는 새로고침해도 같아야 하므로 고정 시드 난수를 쓴다 */
      let seed = 7;
      const rnd = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
      };

      // 밤하늘 — 위는 깊은 남색, 지평선 가까이는 마을 불빛으로 살짝 데워진다
      const sky = b.createLinearGradient(0, 0, 0, WALL_TOP + 20);
      sky.addColorStop(0, '#0b0a1f');
      sky.addColorStop(0.55, '#141334');
      sky.addColorStop(1, '#2c2145');
      b.fillStyle = sky;
      b.fillRect(0, 0, W, WALL_TOP + 20);

      // 초승달 — 오른쪽 위에서 일정한 거리를 둔다
      const moonX = Math.max(gateR + 40, W - 88);
      b.fillStyle = '#f2ecd0';
      b.beginPath();
      b.arc(moonX, 44, 17, 0, Math.PI * 2);
      b.fill();
      b.fillStyle = '#0f0e26';
      b.beginPath();
      b.arc(moonX - 8, 39, 16, 0, Math.PI * 2);
      b.fill();

      // 먼 산 — 두 겹으로 겹쳐야 거리가 생긴다
      const ridges: [string, number, number][] = [
        ['#171632', 118, 26],
        ['#1e1c3d', 132, 18],
      ];
      for (const [tone, base, amp] of ridges) {
        b.fillStyle = tone;
        b.beginPath();
        b.moveTo(0, WALL_TOP + 20);
        b.lineTo(0, base);
        for (let x = 0; x <= W; x += 16) {
          b.lineTo(x, base - Math.abs(Math.sin(x * 0.021 + base)) * amp);
        }
        b.lineTo(W, WALL_TOP + 20);
        b.closePath();
        b.fill();
      }

      // 성벽 너머로 보이는 마을 지붕과 종탑 — 이 문 뒤에 광장이 있다는 신호
      const towerX = Math.round(W * 0.31) - 12;
      b.fillStyle = '#231f3e';
      b.fillRect(towerX, 112, 24, 40);
      b.beginPath();
      b.moveTo(towerX + 12, 94);
      b.lineTo(towerX + 30, 114);
      b.lineTo(towerX - 6, 114);
      b.closePath();
      b.fill();
      b.fillStyle = '#e8c46a';
      b.fillRect(towerX + 8, 122, 8, 8);
      for (const [fx, ry, rw] of [
        [0.16, 128, 40],
        [0.63, 124, 46],
        [0.75, 132, 34],
        [0.48, 130, 30],
      ] as const) {
        const rx = Math.round(W * fx) - rw / 2;
        b.fillStyle = '#231f3e';
        b.beginPath();
        b.moveTo(rx, ry + 22);
        b.lineTo(rx + rw / 2, ry);
        b.lineTo(rx + rw, ry + 22);
        b.closePath();
        b.fill();
        b.fillStyle = 'rgba(232, 196, 106, 0.75)';
        b.fillRect(rx + rw / 2 - 2, ry + 12, 4, 4);
      }

      // 성벽 — 돌 한 장씩 톤을 흩어야 판자가 아니라 석벽으로 읽힌다
      b.fillStyle = '#3b3446';
      b.fillRect(0, WALL_TOP, W, GROUND_Y - WALL_TOP);
      for (let row = 0; row * 9 < GROUND_Y - WALL_TOP; row++) {
        for (let col = -1; col * 17 < W + 17; col++) {
          const x = col * 17 + (row % 2 ? 8 : 0);
          const y = WALL_TOP + row * 9;
          const v = rnd();
          b.fillStyle =
            v < 0.3 ? '#403950' : v < 0.62 ? '#383143' : v < 0.86 ? '#463e57' : '#332c3d';
          b.fillRect(x, y, 16, 8);
        }
      }
      // 성벽 윗면 — 하늘을 보고 있으니 가장 밝다
      b.fillStyle = '#554b66';
      b.fillRect(0, WALL_TOP - 3, W, 4);
      // 총안(요철)
      for (let x = 0; x < W; x += 24) {
        b.fillStyle = '#453d57';
        b.fillRect(x, WALL_TOP - 12, 14, 10);
        b.fillStyle = '#554b66';
        b.fillRect(x, WALL_TOP - 12, 14, 3);
      }

      // 아치 입구를 파낸다
      b.save();
      archPath(b);
      b.clip();
      const tunnel = b.createLinearGradient(0, ARCH_TOP, 0, GROUND_Y);
      tunnel.addColorStop(0, '#0a0810');
      tunnel.addColorStop(1, '#17110f');
      b.fillStyle = tunnel;
      b.fillRect(gateL, ARCH_TOP - 14, GATE_W, GROUND_Y - ARCH_TOP + 14);
      b.restore();

      // 아치 테두리 쐐기돌
      b.strokeStyle = '#6a5d7d';
      b.lineWidth = 5;
      archPath(b);
      b.stroke();

      // 성벽에 걸린 깃발 두 장
      for (const [fx, tone] of [
        [gateL - 44, '#8e2f4a'],
        [gateR + 32, '#2f4a8e'],
      ] as const) {
        b.fillStyle = tone;
        b.fillRect(fx, WALL_TOP + 6, 14, 34);
        b.beginPath();
        b.moveTo(fx, WALL_TOP + 40);
        b.lineTo(fx + 7, WALL_TOP + 33);
        b.lineTo(fx + 14, WALL_TOP + 40);
        b.closePath();
        b.fill();
        b.fillStyle = 'rgba(0, 0, 0, 0.28)';
        b.fillRect(fx + 10, WALL_TOP + 6, 4, 34);
        b.fillStyle = '#d9c06a';
        b.fillRect(fx + 5, WALL_TOP + 16, 4, 4);
      }

      // 흙길 — 문으로 모이게 그려야 시선이 입구로 빨려 들어간다
      const road = b.createLinearGradient(0, GROUND_Y, 0, H);
      road.addColorStop(0, '#2b2218');
      road.addColorStop(1, '#171208');
      b.fillStyle = road;
      b.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      b.fillStyle = '#3a2e20';
      b.beginPath();
      b.moveTo(gateL + 4, GROUND_Y);
      b.lineTo(gateR - 4, GROUND_Y);
      b.lineTo(W / 2 + GATE_W, H);
      b.lineTo(W / 2 - GATE_W, H);
      b.closePath();
      b.fill();
      // 바퀴 자국
      b.strokeStyle = 'rgba(20, 15, 8, 0.55)';
      b.lineWidth = 2;
      for (const s of [-1, 1]) {
        b.beginPath();
        b.moveTo(W / 2 + s * 10, GROUND_Y + 1);
        b.lineTo(W / 2 + s * 52, H);
        b.stroke();
      }
      // 자갈과 풀포기
      const grit = Math.round((W / 480) * 120);
      for (let i = 0; i < grit; i++) {
        const x = rnd() * W;
        const y = GROUND_Y + rnd() * (H - GROUND_Y);
        b.fillStyle = rnd() < 0.5 ? 'rgba(92, 76, 50, 0.5)' : 'rgba(16, 12, 6, 0.5)';
        b.fillRect(Math.round(x), Math.round(y), 2, 1);
      }
      for (let i = 0; i < Math.round(grit / 4.6); i++) {
        const x = rnd() * W;
        const y = GROUND_Y + 4 + rnd() * (H - GROUND_Y - 6);
        b.fillStyle = '#3c4a26';
        b.fillRect(Math.round(x), Math.round(y) - 3, 1, 4);
        b.fillRect(Math.round(x) + 2, Math.round(y) - 2, 1, 3);
      }
    }

    /** 아치 실루엣 — 배경을 파낼 때도, 문짝을 가둘 때도 같은 모양을 쓴다 */
    function archPath(g: CanvasRenderingContext2D) {
      g.beginPath();
      g.moveTo(gateL, GROUND_Y);
      g.lineTo(gateL, ARCH_SPRING);
      g.quadraticCurveTo(W / 2, ARCH_TOP - 12, gateR, ARCH_SPRING);
      g.lineTo(gateR, GROUND_Y);
      g.closePath();
    }

    /** 컨테이너 비율에 맞춰 가상 캔버스를 다시 잡는다 */
    function layout() {
      const rect = canvasEl!.getBoundingClientRect();
      const aspect = rect.height > 0 ? rect.width / rect.height : 16 / 9;
      const next = Math.round(Math.min(W_MAX, Math.max(W_MIN, H * aspect)));
      if (next === W && canvasEl!.width === W) return;

      W = next;
      gateL = Math.round((W - GATE_W) / 2);
      gateR = gateL + GATE_W;
      canvasEl!.width = W;
      canvasEl!.height = H;
      backdrop.width = W;
      backdrop.height = H;
      torches = [
        [gateL - 14, 186],
        [gateR + 14, 186],
      ];

      let seed = 23;
      const rnd = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
      };
      stars = [];
      for (let i = 0; i < Math.round((W / 480) * 90); i++) {
        const layer = Math.floor(rnd() * 3);
        stars.push({
          x: rnd() * W,
          y: rnd() * (WALL_TOP - 10),
          size: layer === 2 ? 2 : 1,
          alpha: 0.2 + layer * 0.16 + rnd() * 0.14,
          speed: (layer + 1) * 1.1,
          phase: rnd() * Math.PI * 2,
        });
      }

      paintBackdrop();
    }

    /** 성문 두 짝 — open 이 1 이 되면 양옆으로 완전히 물러난다 */
    function drawDoors(open: number) {
      if (open >= 1) return;
      const half = GATE_W / 2;
      ctx.save();
      archPath(ctx);
      ctx.clip();
      for (const side of [-1, 1] as const) {
        const x = (side < 0 ? gateL : gateL + half) + side * open * (half + 4);
        ctx.fillStyle = '#4a3320';
        ctx.fillRect(x, ARCH_TOP - 14, half, GROUND_Y - ARCH_TOP + 14);
        // 세로 판자
        for (let p = 0; p < half; p += 7) {
          ctx.fillStyle = p % 14 === 0 ? '#553c25' : '#43301d';
          ctx.fillRect(x + p, ARCH_TOP - 14, 6, GROUND_Y - ARCH_TOP + 14);
        }
        // 철 띠와 손잡이 고리
        ctx.fillStyle = '#2b2620';
        ctx.fillRect(x, 186, half, 3);
        ctx.fillRect(x, 214, half, 3);
        ctx.strokeStyle = '#2b2620';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(side < 0 ? x + half - 7 : x + 7, 201, 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    /** 문틈으로 새어 나오는 광장의 불빛 */
    function drawGateGlow(open: number, t: number) {
      const flick = reduced ? 1 : 0.9 + Math.sin(t * 3.1) * 0.1;
      ctx.save();
      archPath(ctx);
      ctx.clip();
      const glow = ctx.createRadialGradient(W / 2, 214, 2, W / 2, 214, 54);
      glow.addColorStop(0, `rgba(255, 196, 108, ${(0.16 + open * 0.5) * flick})`);
      glow.addColorStop(1, 'rgba(255, 150, 60, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(gateL, ARCH_TOP - 14, GATE_W, GROUND_Y - ARCH_TOP + 14);
      ctx.restore();

      // 문 앞 땅에 깔리는 빛
      if (open > 0) {
        ctx.save();
        ctx.globalAlpha = open * 0.5;
        const spill = ctx.createLinearGradient(0, GROUND_Y, 0, H);
        spill.addColorStop(0, 'rgba(255, 190, 110, 0.55)');
        spill.addColorStop(1, 'rgba(255, 170, 90, 0)');
        ctx.fillStyle = spill;
        ctx.beginPath();
        ctx.moveTo(gateL + 2, GROUND_Y);
        ctx.lineTo(gateR - 2, GROUND_Y);
        ctx.lineTo(W / 2 + GATE_W * 0.9, H);
        ctx.lineTo(W / 2 - GATE_W * 0.9, H);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    /** 횃불 — 불꽃과 벽에 번지는 빛 */
    function drawTorches(t: number) {
      torches.forEach(([tx, ty], i) => {
        // 벽에 박힌 받침
        ctx.fillStyle = '#2b2620';
        ctx.fillRect(tx - 2, ty, 4, 14);
        ctx.fillRect(tx - 4, ty - 2, 8, 3);

        const flick = reduced ? 1 : 0.78 + Math.sin(t * 7.3 + i * 2.1) * 0.22;
        const pool = ctx.createRadialGradient(tx, ty, 2, tx, ty, 46 * flick);
        pool.addColorStop(0, 'rgba(255, 186, 96, 0.34)');
        pool.addColorStop(1, 'rgba(255, 140, 50, 0)');
        ctx.fillStyle = pool;
        ctx.fillRect(tx - 50, ty - 50, 100, 100);

        // 불꽃 세 겹
        const flames: [number, number, string][] = [
          [7, 13 * flick, '#ff7a1e'],
          [4.5, 9 * flick, '#ffb547'],
          [2.2, 5 * flick, '#ffe9a8'],
        ];
        for (const [rx, ry, tone] of flames) {
          ctx.fillStyle = tone;
          ctx.beginPath();
          ctx.ellipse(tx, ty - 4 - ry * 0.4, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    function spawnEmber() {
      if (!torches.length) return;
      const [tx, ty] = torches[Math.floor(Math.random() * torches.length)];
      embers.push({
        x: tx + (Math.random() - 0.5) * 6,
        y: ty - 8,
        vy: 9 + Math.random() * 12,
        life: 0,
        max: 1.6 + Math.random() * 1.6,
        tone: EMBER_TONES[Math.floor(Math.random() * EMBER_TONES.length)],
      });
    }

    function drawEmbers(dt: number, t: number) {
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life += dt;
        if (e.life >= e.max) {
          embers.splice(i, 1);
          continue;
        }
        e.y -= e.vy * dt;
        const drift = Math.sin(t * 2 + e.life * 3) * 0.6;
        ctx.globalAlpha = Math.max(0, 1 - e.life / e.max) * 0.9;
        ctx.fillStyle = e.tone;
        ctx.fillRect(Math.round(e.x + drift), Math.round(e.y), 1, 1);
      }
      ctx.globalAlpha = 1;
    }

    /**
     * 가장자리를 눌러 타이틀 글씨가 놓일 가운데를 비워준다.
     * 화면 비율에 맞춰 눌러야 한다 — 정원으로 주면 프레임 안에 원 테두리가 그대로 보인다.
     */
    function drawVignette() {
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(1, H / W);
      const v = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.72);
      v.addColorStop(0, 'rgba(0, 0, 0, 0)');
      v.addColorStop(0.6, 'rgba(6, 4, 14, 0.08)');
      v.addColorStop(1, 'rgba(4, 3, 12, 0.6)');
      ctx.fillStyle = v;
      ctx.fillRect(-W, -W, W * 2, W * 2);
      ctx.restore();
    }

    let raf = 0;
    let last = performance.now();
    const start = last;
    let open = 0;
    let emberAt = last;

    function frame(now: number) {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const t = (now - start) / 1000;

      // 한 번 열리면 되돌아오지 않는다 — 곧 광장으로 넘어가므로
      if (openingRef.current) open = Math.min(1, open + dt * 1.9);

      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(backdrop, 0, 0);

      for (const s of stars) {
        if (!reduced) {
          s.phase += dt * 1.1;
          s.x -= s.speed * dt;
          if (s.x < -2) s.x = W + 2;
        }
        const tw = reduced ? 1 : 0.55 + 0.45 * Math.sin(s.phase);
        ctx.globalAlpha = Math.min(1, s.alpha * tw);
        ctx.fillStyle = '#dff2ff';
        ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
      }
      ctx.globalAlpha = 1;

      drawDoors(open);
      drawGateGlow(open, t);
      drawTorches(t);

      if (!reduced) {
        if (now >= emberAt) {
          spawnEmber();
          emberAt = now + 110 + Math.random() * 200;
        }
        drawEmbers(dt, t);
      }

      drawVignette();
      raf = requestAnimationFrame(frame);
    }

    layout();

    if (reduced) {
      frame(last);
    } else {
      raf = requestAnimationFrame(frame);
    }

    // 창 크기가 바뀌면 비율이 달라지므로 가상 캔버스를 다시 잡는다
    const ro = new ResizeObserver(() => {
      layout();
      if (reduced) frame(performance.now());
    });
    ro.observe(canvasEl);

    // 탭이 백그라운드일 땐 그리지 않아 배터리를 아낀다
    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
