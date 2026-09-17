'use client';

import { useEffect, useRef } from 'react';
import { PLAZA_FLOOR, PLAZA_H, PLAZA_W, STATUE } from '@/lib/plazaLayout';

type PlazaSceneProps = {
  className?: string;
};

/**
 * SELECT MODE 배경 — 가을 초저녁의 마을 광장.
 *
 * 고정 400x225 가상 캔버스에 그리고, 부모(.stage)가 같은 16:9 비율을 유지하므로
 * 가로세로 배율이 같다(= 원이 찌그러지지 않는다). 캐릭터는 이 위에 DOM 으로 얹히고,
 * 좌표는 lib/plazaLayout.ts 를 함께 본다.
 *
 * 계절은 지금 '가을' 고정 — 사계절 전환은 아직 범위 밖이다.
 */

type Leaf = { x: number; y: number; vy: number; drift: number; phase: number; tone: number; size: number };
type Firefly = { x: number; y: number; phase: number; speed: number };

const LEAF_TONES = ['#e0863a', '#c2622f', '#d9a43c', '#a8452a'];

export default function PlazaScene({ className }: PlazaSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx2d = canvasEl.getContext('2d');
    if (!ctx2d) return;
    const ctx: CanvasRenderingContext2D = ctx2d;
    const canvas: HTMLCanvasElement = canvasEl;

    canvas.width = PLAZA_W;
    canvas.height = PLAZA_H;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const leaves: Leaf[] = Array.from({ length: 26 }, () => ({
      x: Math.random() * PLAZA_W,
      y: Math.random() * PLAZA_H,
      vy: 5 + Math.random() * 9,
      drift: 6 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
      tone: Math.floor(Math.random() * LEAF_TONES.length),
      size: Math.random() < 0.3 ? 2 : 1,
    }));

    const fireflies: Firefly[] = Array.from({ length: 14 }, () => ({
      x: 20 + Math.random() * (PLAZA_W - 40),
      y: 110 + Math.random() * 100,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.4,
    }));

    const stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * PLAZA_W,
      y: Math.random() * 86,
      a: 0.25 + Math.random() * 0.5,
      tw: 0.5 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
    }));

    const sky = ctx.createLinearGradient(0, 0, 0, 104);
    sky.addColorStop(0, '#161230');
    sky.addColorStop(0.45, '#2d1f43');
    sky.addColorStop(0.78, '#5a3348');
    sky.addColorStop(1, '#8a4c3c');

    // ---------- 배경 ----------

    function drawSky(t: number) {
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, PLAZA_W, 104);

      for (const s of stars) {
        const tw = reduced ? 1 : 0.5 + 0.5 * Math.sin(t * s.tw + s.phase);
        ctx.globalAlpha = s.a * tw * (1 - s.y / 120);
        ctx.fillStyle = '#f2ecff';
        ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
      }
      ctx.globalAlpha = 1;

      // 초승달
      ctx.save();
      ctx.shadowColor = 'rgba(255, 236, 190, 0.5)';
      ctx.shadowBlur = 7;
      ctx.fillStyle = '#ffeec2';
      ctx.beginPath();
      ctx.arc(330, 32, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#20183a';
      ctx.beginPath();
      ctx.arc(325, 28, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawHills() {
      ctx.fillStyle = '#291f3f';
      ctx.beginPath();
      ctx.moveTo(0, 104);
      ctx.lineTo(0, 88);
      ctx.lineTo(54, 66);
      ctx.lineTo(108, 92);
      ctx.lineTo(168, 72);
      ctx.lineTo(232, 94);
      ctx.lineTo(296, 74);
      ctx.lineTo(356, 92);
      ctx.lineTo(PLAZA_W, 80);
      ctx.lineTo(PLAZA_W, 104);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#342847';
      ctx.beginPath();
      ctx.moveTo(0, 104);
      ctx.lineTo(0, 98);
      ctx.lineTo(70, 86);
      ctx.lineTo(150, 100);
      ctx.lineTo(240, 88);
      ctx.lineTo(320, 99);
      ctx.lineTo(PLAZA_W, 90);
      ctx.lineTo(PLAZA_W, 104);
      ctx.closePath();
      ctx.fill();
    }

    function drawGround() {
      // 마른 가을 들판
      const field = ctx.createLinearGradient(0, 100, 0, PLAZA_H);
      field.addColorStop(0, '#3d3323');
      field.addColorStop(1, '#2a2318');
      ctx.fillStyle = field;
      ctx.fillRect(0, 100, PLAZA_W, PLAZA_H - 100);

      // 광장 포석 타원
      const { cx, cy, rx, ry } = PLAZA_FLOOR;
      ctx.fillStyle = '#4b4238';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#6d5c46';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx - 2, ry - 2, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(109, 92, 70, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 0.62, ry * 0.62, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 포석 얼룩 + 떨어진 낙엽
      let seed = 7;
      const rnd = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
      };
      for (let i = 0; i < 90; i++) {
        const a = rnd() * Math.PI * 2;
        const r = Math.sqrt(rnd());
        const x = cx + Math.cos(a) * rx * r;
        const y = cy + Math.sin(a) * ry * r;
        if (rnd() < 0.68) {
          ctx.fillStyle = rnd() < 0.5 ? '#564b40' : '#413930';
          ctx.fillRect(Math.round(x), Math.round(y), 2, 1);
        } else {
          ctx.fillStyle = LEAF_TONES[Math.floor(rnd() * LEAF_TONES.length)];
          ctx.globalAlpha = 0.75;
          ctx.fillRect(Math.round(x), Math.round(y), 2, 1);
          ctx.globalAlpha = 1;
        }
      }
    }

    // ---------- 장소 ----------

    /** 왼쪽 큰 단풍나무 — 도적이 가지 위에 앉는다 */
    function drawTree(t: number) {
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(42, 92, 9, 64);
      ctx.fillStyle = '#3a2718';
      ctx.fillRect(48, 92, 3, 64);
      // 가지
      ctx.fillRect(30, 100, 14, 3);
      ctx.fillRect(51, 108, 15, 3);

      const sway = reduced ? 0 : Math.sin(t * 0.7) * 1.2;
      const blobs: [number, number, number, string][] = [
        [46, 62, 30, '#a8452a'],
        [26, 74, 22, '#c2622f'],
        [68, 72, 23, '#c2622f'],
        [40, 52, 20, '#e0863a'],
        [58, 56, 17, '#d9a43c'],
        [30, 60, 15, '#8f4522'],
        [62, 88, 15, '#a8452a'],
        [28, 90, 14, '#c2622f'],
      ];
      for (const [x, y, r, color] of blobs) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x + sway, y, r, r * 0.78, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /** 요리주점 텐트 + 솥 — 우왕이 자리 */
    function drawTavern(t: number) {
      // 천막
      ctx.fillStyle = '#7d3f2c';
      ctx.beginPath();
      ctx.moveTo(112, 78);
      ctx.lineTo(76, 118);
      ctx.lineTo(148, 118);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#93503a';
      ctx.beginPath();
      ctx.moveTo(112, 78);
      ctx.lineTo(112, 118);
      ctx.lineTo(148, 118);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5c2c1f';
      ctx.fillRect(76, 116, 72, 4);
      // 입구
      ctx.fillStyle = '#2a1a14';
      ctx.beginPath();
      ctx.moveTo(104, 118);
      ctx.lineTo(112, 92);
      ctx.lineTo(120, 118);
      ctx.closePath();
      ctx.fill();
      // 간판
      ctx.fillStyle = '#d9a43c';
      ctx.fillRect(126, 96, 14, 9);
      ctx.fillStyle = '#4a2a16';
      ctx.fillRect(128, 99, 10, 1);
      ctx.fillRect(128, 102, 7, 1);

      // 솥
      ctx.fillStyle = '#2f2b2c';
      ctx.beginPath();
      ctx.ellipse(96, 131, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e1a1b';
      ctx.beginPath();
      ctx.ellipse(96, 127, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // 불
      const flick = reduced ? 1 : 1 + Math.sin(t * 9) * 0.18;
      ctx.fillStyle = '#ff7b2e';
      ctx.beginPath();
      ctx.ellipse(96, 138, 7, 4 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.ellipse(96, 138, 3.5, 2.2 * flick, 0, 0, Math.PI * 2);
      ctx.fill();

      // 김
      if (!reduced) {
        for (let i = 0; i < 3; i++) {
          const p = (t * 0.45 + i / 3) % 1;
          ctx.globalAlpha = 0.34 * (1 - p);
          ctx.fillStyle = '#e8ddd0';
          const sx = 96 + Math.sin((p + i) * 5) * 4;
          ctx.fillRect(Math.round(sx), Math.round(124 - p * 30), 2, 2);
        }
        ctx.globalAlpha = 1;
      }
    }

    /** 점성술 텐트 — 캘린더(점성술사) 자리. 별무늬 보라 천막 */
    function drawAstrologerTent(t: number) {
      ctx.fillStyle = '#3d2c73';
      ctx.beginPath();
      ctx.moveTo(272, 76);
      ctx.lineTo(238, 120);
      ctx.lineTo(306, 120);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#4b3a8f';
      ctx.beginPath();
      ctx.moveTo(272, 76);
      ctx.lineTo(272, 120);
      ctx.lineTo(306, 120);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2b1f5c';
      ctx.fillRect(238, 118, 68, 4);

      // 금빛 별 장식
      const twinkle = reduced ? 1 : 0.6 + 0.4 * Math.sin(t * 2.2);
      ctx.fillStyle = '#f5d76e';
      ctx.globalAlpha = twinkle;
      for (const [sx, sy] of [
        [258, 100],
        [286, 96],
        [272, 110],
        [248, 112],
        [296, 110],
      ]) {
        ctx.fillRect(sx, sy - 1, 1, 3);
        ctx.fillRect(sx - 1, sy, 3, 1);
      }
      ctx.globalAlpha = 1;
      // 꼭대기 깃발
      ctx.fillRect(271, 68, 1, 9);
      ctx.fillStyle = '#b98cff';
      ctx.fillRect(272, 68, 7, 4);

      // 입구
      ctx.fillStyle = '#191038';
      ctx.beginPath();
      ctx.moveTo(264, 120);
      ctx.lineTo(272, 92);
      ctx.lineTo(280, 120);
      ctx.closePath();
      ctx.fill();
    }

    /** 과녁장 — 엘프 아처 자리. 주기적으로 화살이 날아가 꽂힌다 */
    function drawArchery(t: number) {
      // 건초 더미 받침
      ctx.fillStyle = '#7a6a34';
      ctx.fillRect(366, 148, 22, 12);
      ctx.fillStyle = '#6a5c2c';
      ctx.fillRect(366, 152, 22, 2);

      // 과녁
      const rings: [number, string][] = [
        [11, '#e8e2d4'],
        [8, '#3d3a34'],
        [5, '#e8e2d4'],
        [2.5, '#c4331a'],
      ];
      for (const [r, color] of rings) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(377, 136, r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (reduced) return;
      // 4초 주기로 화살 1발
      const cycle = (t % 4) / 4;
      if (cycle < 0.22) {
        const p = cycle / 0.22;
        const x = 348 + (373 - 348) * p;
        const y = 140 - Math.sin(p * Math.PI) * 5;
        ctx.fillStyle = '#d8cbb0';
        ctx.fillRect(Math.round(x), Math.round(y), 6, 1);
        ctx.fillStyle = '#e8e2d4';
        ctx.fillRect(Math.round(x + 6), Math.round(y), 2, 1);
      } else {
        // 꽂힌 화살
        ctx.fillStyle = '#d8cbb0';
        ctx.fillRect(379, 136, 7, 1);
      }
    }

    /** 마법 스크롤 상점 좌판 — 마법사 자리 */
    function drawScrollShop(t: number) {
      // 차양
      ctx.fillStyle = '#5b3a7a';
      ctx.fillRect(286, 158, 60, 8);
      ctx.fillStyle = '#7a4fa0';
      for (let i = 0; i < 6; i++) ctx.fillRect(286 + i * 10, 158, 5, 8);
      ctx.fillStyle = '#3d2752';
      for (let x = 286; x < 346; x += 8) {
        ctx.beginPath();
        ctx.moveTo(x, 166);
        ctx.lineTo(x + 8, 166);
        ctx.lineTo(x + 4, 171);
        ctx.closePath();
        ctx.fill();
      }
      // 기둥 + 좌판
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(288, 166, 3, 26);
      ctx.fillRect(341, 166, 3, 26);
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(284, 176, 64, 5);
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(284, 181, 64, 3);

      // 좌판 위 두루마리
      ctx.fillStyle = '#e8dcc0';
      ctx.fillRect(292, 170, 9, 5);
      ctx.fillRect(306, 171, 8, 4);
      ctx.fillStyle = '#c4b28c';
      ctx.fillRect(292, 172, 9, 1);
      ctx.fillRect(306, 172, 8, 1);

      // 떠 있는 마법 두루마리
      const bob = reduced ? 0 : Math.sin(t * 1.6) * 2.5;
      ctx.save();
      ctx.shadowColor = 'rgba(159, 232, 255, 0.7)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#f0e8d0';
      ctx.fillRect(326, Math.round(158 + bob), 10, 6);
      ctx.restore();
      ctx.fillStyle = '#9fe8ff';
      ctx.fillRect(326, Math.round(160 + bob), 10, 1);
    }

    /** 광장 벤치 + 모닥불 — 기사 자리 */
    function drawBench(t: number) {
      // 모닥불
      const flick = reduced ? 1 : 1 + Math.sin(t * 8.5) * 0.2 + Math.sin(t * 19) * 0.08;
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(48, 196, 20, 3);
      ctx.fillRect(52, 192, 12, 3);
      ctx.save();
      ctx.shadowColor = 'rgba(255, 150, 60, 0.6)';
      ctx.shadowBlur = 10 * flick;
      ctx.fillStyle = '#c4331a';
      ctx.beginPath();
      ctx.ellipse(58, 188, 8, 9 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff8a2b';
      ctx.beginPath();
      ctx.ellipse(58, 189, 5, 6 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.ellipse(58, 191, 2.5, 3.5 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 벤치
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(74, 190, 44, 4);
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(74, 194, 44, 2);
      ctx.fillRect(78, 196, 4, 8);
      ctx.fillRect(110, 196, 4, 8);
      ctx.fillStyle = '#5c3f24';
      ctx.fillRect(74, 182, 44, 3);
      ctx.fillRect(76, 182, 3, 9);
      ctx.fillRect(113, 182, 3, 9);
    }

    /** 중앙 동상 자리 — 받침대 + "여기 들어갑니다" 점선 실루엣 */
    function drawStatuePlinth(t: number) {
      const cx = STATUE.fx * PLAZA_W;

      // 받침대 그림자
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(cx, 165, 30, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3단 석조 받침
      ctx.fillStyle = '#585046';
      ctx.fillRect(cx - 26, 156, 52, 8);
      ctx.fillStyle = '#6b6257';
      ctx.fillRect(cx - 21, 148, 42, 8);
      ctx.fillStyle = '#7a7166';
      ctx.fillRect(cx - 16, 140, 32, 9);
      ctx.fillStyle = '#4a443c';
      ctx.fillRect(cx - 16, 148, 32, 1);
      ctx.fillRect(cx - 21, 156, 42, 1);

      // 명판
      ctx.fillStyle = '#f5d76e';
      ctx.fillRect(cx - 9, 150, 18, 5);
      ctx.fillStyle = '#7a5a20';
      ctx.fillRect(cx - 7, 152, 14, 1);

      // 동상이 들어갈 자리 — 점선 실루엣 + 물음표.
      // 디자이너가 한눈에 "여기에 동상이 들어간다"를 알아보도록 또렷하게 그린다.
      const pulse = reduced ? 0.8 : 0.62 + 0.28 * Math.sin(t * 1.8);
      ctx.save();
      ctx.globalAlpha = pulse;

      const silhouette = new Path2D();
      silhouette.moveTo(cx - 12, 140);
      silhouette.lineTo(cx - 12, 124);
      silhouette.lineTo(cx - 6, 113);
      silhouette.lineTo(cx - 6, STATUE.topY);
      silhouette.lineTo(cx + 6, STATUE.topY);
      silhouette.lineTo(cx + 6, 113);
      silhouette.lineTo(cx + 12, 124);
      silhouette.lineTo(cx + 12, 140);
      silhouette.closePath();

      ctx.fillStyle = 'rgba(245, 215, 110, 0.14)';
      ctx.fill(silhouette);

      ctx.shadowColor = 'rgba(245, 215, 110, 0.6)';
      ctx.shadowBlur = 5;
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = '#ffe9a0';
      ctx.stroke(silhouette);
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // 물음표 — 아직 정해지지 않은 자리라는 표시
      ctx.fillStyle = '#ffe9a0';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', cx, 126);
      ctx.restore();
    }

    // ---------- 입자 ----------

    function drawLeaves(dt: number, t: number) {
      for (const l of leaves) {
        if (!reduced) {
          l.y += l.vy * dt;
          l.x += Math.sin(t * 1.4 + l.phase) * l.drift * dt - 4 * dt;
          if (l.y > PLAZA_H + 2) {
            l.y = -3;
            l.x = Math.random() * PLAZA_W;
          }
          if (l.x < -3) l.x = PLAZA_W + 2;
        }
        ctx.fillStyle = LEAF_TONES[l.tone];
        ctx.globalAlpha = 0.85;
        ctx.fillRect(Math.round(l.x), Math.round(l.y), l.size + 1, l.size);
        ctx.globalAlpha = 1;
      }
    }

    function drawFireflies(t: number) {
      for (const f of fireflies) {
        const blink = reduced ? 0.5 : Math.max(0, Math.sin(t * f.speed + f.phase));
        if (blink <= 0.05) continue;
        ctx.globalAlpha = blink * 0.8;
        ctx.fillStyle = '#ffe9a8';
        const x = f.x + (reduced ? 0 : Math.sin(t * 0.5 + f.phase) * 6);
        const y = f.y + (reduced ? 0 : Math.cos(t * 0.4 + f.phase) * 4);
        ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
        ctx.globalAlpha = 1;
      }
    }

    /** 광장 가장자리를 살짝 어둡게 — 캐릭터가 더 잘 보이도록 */
    function drawVignette() {
      const v = ctx.createRadialGradient(200, 150, 60, 200, 150, 250);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(6, 4, 14, 0.55)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, PLAZA_W, PLAZA_H);
    }

    let raf = 0;
    let last = performance.now();
    const start = last;

    function frame(now: number) {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const t = (now - start) / 1000;

      ctx.clearRect(0, 0, PLAZA_W, PLAZA_H);
      drawSky(t);
      drawHills();
      drawGround();
      drawTree(t);
      drawTavern(t);
      drawAstrologerTent(t);
      drawArchery(t);
      drawStatuePlinth(t);
      drawBench(t);
      drawScrollShop(t);
      drawFireflies(t);
      drawLeaves(dt, t);
      drawVignette();

      raf = requestAnimationFrame(frame);
    }

    if (reduced) {
      frame(last);
    } else {
      raf = requestAnimationFrame(frame);
    }

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
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
