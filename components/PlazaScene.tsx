'use client';

import { useEffect, useRef } from 'react';
import { PLAZA_ART } from '@/lib/plazaArt';
import { STATUE, phaseForHour, type DayPhase } from '@/lib/plazaLayout';

type PlazaSceneProps = {
  className?: string;
  /** 접속 기기의 현지 시각 기준 시간대. 생략하면 마운트 시점에 계산한다 */
  phase?: DayPhase;
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
 *   sprites  소품 · 마을 사람 · 불꽃 같은 움직이는 것들의 시트
 *
 * 여기서는 그 조각들을 순서대로 겹치고 움직이는 것만 매 프레임 다시 그린다.
 * 캐릭터 메뉴는 이 위에 DOM 으로 얹히고, 좌표는 lib/plazaLayout.ts 를 함께 본다.
 *
 * 화면에는 정수 배율(k)로 키워 그린 뒤 CSS 로 상자에 맞춘다. 캔버스를 곧바로 소수 배율로
 * 늘리면 픽셀 굵기가 들쭉날쭉해져 가는 선이 깨지기 때문이다.
 */

const A = PLAZA_ART;
const W = A.w;
const H = A.h;
const RECTS = A.sprites as unknown as Record<string, readonly number[]>;

type Npc = {
  kind: string;
  size: string;
  layer: string;
  x: number;
  y: number;
  from?: number;
  to?: number;
  speed: number;
  dir: number;
  /** 제자리에 선 사람이 말할 때의 박자 (9 이상이면 말없이 서 있다) */
  chat: number;
  phase: number;
};

type Drawable = { y: number; draw: (t: number) => void };

function load(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function PlazaScene({ className, phase }: PlazaSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx2d = canvasEl.getContext('2d');
    if (!ctx2d) return;
    const ctx: CanvasRenderingContext2D = ctx2d;
    const canvas: HTMLCanvasElement = canvasEl;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const active: DayPhase = phase ?? phaseForHour(new Date().getHours());
    const info = A.phases[active];
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

    type Images = { sky: HTMLImageElement; clouds: HTMLImageElement; back: HTMLImageElement; front: HTMLImageElement; sheet: HTMLImageElement };
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

    const npcs: Npc[] = A.npcs.map((n, i) => ({
      kind: n.kind,
      size: n.size,
      layer: n.layer,
      x: n.x,
      y: n.y,
      from: 'from' in n ? n.from : undefined,
      to: 'to' in n ? n.to : undefined,
      speed: 'speed' in n ? n.speed : 0,
      dir: n.dir,
      chat: 'chat' in n ? n.chat : 0,
      phase: (i * 0.37) % 1,
    }));

    function drawNpc(n: Npc, t: number, dt: number) {
      const walks = n.from !== undefined && n.to !== undefined && n.speed > 0;
      if (walks && !reduced) {
        n.x += n.speed * n.dir * dt;
        if (n.x > n.to!) {
          n.x = n.to!;
          n.dir = -1;
        } else if (n.x < n.from!) {
          n.x = n.from!;
          n.dir = 1;
        }
      }
      let frameName: string;
      if (walks && !reduced) {
        // 걸음 박자는 속도를 따라간다 — 빠른 사람은 발도 빨리 옮긴다
        const f = Math.floor(t * (2.6 + n.speed * 0.3) + n.phase * 4) % 4;
        frameName = `w${f}`;
      } else {
        const talking = !reduced && n.chat < 9 && (t * 0.55 + n.chat) % 3 < 0.55;
        frameName = talking ? 'i1' : 'i0';
      }
      const half = n.size === 'near' ? 9 : n.size === 'mid' ? 7 : 5;
      ctx.fillStyle = `rgba(0, 0, 0, ${info.shadow})`;
      ctx.fillRect(Math.round(n.x) - half, n.y - 1, half * 2, 2);
      ctx.fillRect(Math.round(n.x) - half + 2, n.y - 2, half * 2 - 4, 4);
      spr(`${n.kind}_${n.size}_${frameName}`, n.x, n.y, n.dir === -1);
    }

    // ---------- 소품 ----------

    const [bullX, bullY] = A.bull;
    const archer = A.spots.join;

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
      target(t) {
        if (reduced) return;
        const cycle = (t % 4) / 4;
        const x0 = archer.x + 22;
        const y0 = archer.y - 34;
        if (cycle < 0.16) {
          const p = cycle / 0.16;
          const x = x0 + (bullX - 10 - x0) * p;
          const y = y0 + (bullY - y0) * p - Math.sin(p * Math.PI) * 9;
          ctx.fillStyle = '#e4d8bc';
          ctx.fillRect(Math.round(x), Math.round(y), 11, 1);
          ctx.fillStyle = '#f6f2e6';
          ctx.fillRect(Math.round(x + 11), Math.round(y), 3, 1);
          ctx.fillStyle = '#b4452e';
          ctx.fillRect(Math.round(x) - 2, Math.round(y) - 1, 3, 3);
        } else {
          ctx.fillStyle = '#e4d8bc';
          ctx.fillRect(bullX - 12, bullY, 12, 1);
          ctx.fillStyle = '#b4452e';
          ctx.fillRect(bullX - 15, bullY - 1, 4, 3);
        }
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

    const [fireA, fireB, fireBench] = A.fires;

    function flame(x: number, y: number, t: number, offset: number) {
      const f = reduced ? 2 : (Math.floor(t * 11) + offset) % 8;
      spr(`flame_${f}`, x, y);
      if (lampsOn) glow(x, y - 8, 70, '255, 150, 60', reduced ? 0.12 : 0.1 + Math.sin(t * 9 + offset) * 0.03);
    }

    /** 아래 광장의 것들 — 화면 아래(= 앞)에 있을수록 나중에 그려 앞사람이 뒷사람을 가린다 */
    const courtNpcs = npcs.filter((n) => n.layer === 'court');
    const terraceNpcs = npcs.filter((n) => n.layer === 'terrace');
    let frameDt = 0;
    const drawables: Drawable[] = [
      ...A.props.map((p) => ({
        y: p.y,
        draw(t: number) {
          const name = 'frames' in p ? `${p.sprite}_${reduced ? 0 : Math.floor(t * p.fps) % p.frames}` : p.sprite;
          spr(name, p.x, p.y);
          overlays[p.id]?.(t);
        },
      })),
      ...courtNpcs.map((n) => ({
        get y() {
          return n.y;
        },
        draw(t: number) {
          drawNpc(n, t, frameDt);
        },
      })),
      { y: A.props.find((p) => p.id === 'brazier')!.y + 0.5, draw: (t: number) => flame(fireBench[0], fireBench[1], t, 5) },
    ];
    drawables.sort((a, b) => a.y - b.y);

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

    function drawLeaves(dt: number, t: number) {
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

      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(images.sky, 0, 0);
      drawSkyLife(t);
      ctx.drawImage(images.back, 0, 0);
      spr(`fall_${reduced ? 0 : Math.floor(t * 9) % 4}`, A.fall[0], A.fall[1]);
      spr(`flag_${reduced ? 0 : Math.floor(t * 6) % 4}`, A.flag[0], A.flag[1]);
      drawClock();
      drawSmoke(t);
      // 윗마당 사람들 — 난간이 다리를 가리도록 앞 배경보다 먼저 그린다
      for (const n of terraceNpcs) drawNpc(n, t, dt);
      ctx.drawImage(images.front, 0, A.frontY);
      flame(fireA[0], fireA[1], t, 0);
      flame(fireB[0], fireB[1], t, 3);
      // 걷는 사람의 y 는 변하지 않으므로 순서는 처음 정한 그대로다
      for (const d of drawables) d.draw(t);
      drawLeaves(dt, t);
      drawVignette();

      if (!reduced) raf = requestAnimationFrame(frame);
    }

    const base = `/art/plaza`;
    Promise.all([
      load(`${base}/sky-${active}.png`),
      load(`${base}/clouds-${active}.png`),
      load(`${base}/back-${active}.png`),
      load(`${base}/front-${active}.png`),
      load(`${base}/sprites-${active}.png`),
    ])
      .then(([sky, clouds, back, front, sheet]) => {
        if (!alive) return;
        images = { sky, clouds, back, front, sheet };
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
  }, [phase]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
