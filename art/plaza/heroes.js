// 주인공(메뉴 캐릭터) — 마을 사람과 같은 방식으로 그리되, 더 크고 세부가 많다.
// 생김새는 art/refs/heroes 의 레퍼런스를 따랐다: 옷 · 색 · 소지품 · 자세.
//   knight 용사 · bard 바드 · astrologer 점성술사 · archer 궁수 · mage 마법사 · rogue 어쌔신
//   woowang-couch 소파에서 게임하는 우왕이 (art/refs/mascots/woowang 을 픽셀로 옮긴 얼굴)
// 광장에서는 DOM 으로 얹히므로 시간대 색을 입히지 않고 한 장(heroes.png)만 굽는다.
const path = require('path');
const fs = require('fs');
const { P, M, Mat, MATS, hash } = require('./kit');
const { figure, outline, cap } = require('./npcs');

/** 한 칸 — 16:22 (기존 스프라이트와 같은 비율) */
const CELL = { w: 56, h: 77 };
const S = 1.36;
const FOOT = [27, 75];

const STAND = { a: [0.07, 0.03], b: [-0.07, -0.05], armA: [0.06, 0.2], armB: [-0.04, 0.12], bob: 0, free: true };

/* ---------- 덧그리는 부분 ---------- */

/** 활 — (x, y) 는 줌통(손으로 쥐는 곳). pull 이 있으면 시위를 그 점까지 당긴다 */
function bow(mt, J, x, y, pull) {
  const len = 15, bulge = 4.2;
  const top = J.P2(x, y - len), bot = J.P2(x, y + len);
  for (let t = 0; t <= 1; t += 0.012) {
    const [px, py] = J.P2(x + Math.sin(t * Math.PI) * bulge, y - len + t * len * 2);
    mt.put(px, py, M.wood, 0.56);
    mt.put(px + 1, py, M.wood, 0.34);
  }
  if (pull) {
    const [hx, hy] = J.P2(pull[0], pull[1]);
    mt.line(top[0], top[1], hx, hy, M.clothCream, 0.8);
    mt.line(bot[0], bot[1], hx, hy, M.clothCream, 0.8);
    // 화살
    const [ax, ay] = J.P2(x + bulge + 5, y);
    mt.line(hx, hy, ax, ay, M.woodPale, 0.7);
    mt.put(ax + 1, ay, M.steel, 0.86);
    mt.put(ax + 2, ay, M.steel, 0.7);
    mt.put(ax, ay - 1, M.steel, 0.8);
    mt.put(ax, ay + 1, M.steel, 0.6);
  } else mt.line(top[0], top[1], bot[0], bot[1], M.clothCream, 0.8);
}

function quiver(mt, J) {
  const [x0, y0] = J.P2(-J.tw - 3.2, J.shY - 3), [x1, y1] = J.P2(-J.tw - 0.4, J.shY + J.T * 0.7);
  mt.beam(x0, y0, x1, y1, J.R(3.2), M.wood, 0.46, 0.16);
  for (let k = 0; k < 3; k++) {
    const [fx, fy] = J.P2(-J.tw - 4.6 + k * 1.3, J.shY - 6.4 - (k % 2));
    mt.put(fx, fy, M.clothWhite, 0.86);
    mt.put(fx, fy + 1, M.clothWhite, 0.7);
    mt.put(fx, fy + 2, M.woodPale, 0.6);
  }
}

/** 별 무늬 — 재질이 from 인 자리 가운데 몇 곳에 금빛 점을 찍는다 */
function sprinkle(mt, from, to, v, chance, seed) {
  for (let y = 0; y < mt.h; y++)
    for (let x = 0; x < mt.w; x++) if (mt.at(x, y) === from && hash(x, y, seed) < chance && mt.at(x + 1, y) === from && mt.at(x, y + 1) === from) mt.put(x, y, to, v);
}

/* ---------- 여섯 명 ---------- */

const HEROES = {
  // 용사 — 금발 소년, 은빛 견갑과 팔보호대, 검은 옷에 푸른 단, 발목까지 오는 푸른 망토
  knight: {
    d: {
      face: true, eye: 'clothBlue', build: { head: 1.24 },
      top: 'clothBlack', sleeves: 'clothBlack', legs: 'clothBlack', boots: 'wood', bootHigh: true,
      long: 0.4, skirt: 'clothBlack', trim: 'clothBlue', belt: 'wood', pouch: true,
      hair: { m: 'hairBlond', style: 'short' }, cloak: { m: 'clothBlue', len: 0.98, flare: 4.5, front: 1.5 }, back: 'sword',
      pauldron: 'steel', bracer: 'steel', scarf: 'clothBlue',
      hooks: {
        body(mt, J) {
          // 가슴의 금 장식과 옷자락 가운데 줄
          const [cx, cy] = J.P2(1, J.shY + J.T * 0.36);
          mt.put(cx, cy, M.gold, 0.74);
          mt.put(cx, cy + 1, M.gold, 0.56);
          for (let y = J.hipY - 1; y < J.hipY + J.Lg * 0.36; y += 0.6) {
            const [px, py] = J.P2(J.tw * 0.5, y);
            if (mt.at(px, py)) mt.put(px, py, M.clothBlue, 0.6);
          }
        },
        head(mt, J) {
          // 흐트러진 앞머리
          for (let k = -2; k <= 3; k++) mt.put(J.hcx + k * 1.6, J.hcy - J.hR * 0.5 + (k % 2 ? 1 : 0), M.hairBlond, 0.7 - Math.abs(k) * 0.05);
          mt.put(J.hcx + J.hR * 0.2, J.hcy - J.hR - 1, M.hairBlond, 0.74);
          mt.put(J.hcx - J.hR * 0.5, J.hcy - J.hR - 1, M.hairBlond, 0.6);
        },
      },
    },
    frames: { knight: STAND },
  },

  // 바드 — 깃털 꽂은 붉은 모자와 붉은 어깨망토, 황토색 윗옷, 청록 바지, 흰 장화, 류트
  bard: {
    d: {
      face: true, build: { head: 1.24 },
      top: 'woodPale', sleeves: 'clothTeal', legs: 'clothTeal', boots: 'clothCream', bootHigh: true,
      long: 0.34, skirt: 'woodPale', belt: 'wood', mantle: 'clothRed', mantleLen: 0.42,
      hair: { m: 'hairBrown', style: 'long' },
      hooks: {
        body(mt, J) {
          // 류트 — 몸통은 배 앞에, 목은 왼쪽 위로 뻗는다
          const [bx, by] = J.P2(2.2, J.hipY - 4.2);
          const [nx, ny] = J.P2(-9.5, J.shY + 1.5);
          mt.beam(bx, by, nx, ny, J.R(1.9), M.wood, 0.4, 0.12);
          mt.disc(nx - 1, ny - 1, J.R(1.9), J.R(1.6), M.wood, 0.3);
          mt.disc(bx, by, J.R(5.6), J.R(4.6), M.wood, 0.34);
          mt.disc(bx, by, J.R(4.8), J.R(3.8), M.wood, (x, y, dx, dy) => 0.66 - dx * 0.16 - dy * 0.22);
          mt.disc(bx - 0.5, by, J.R(1.9), J.R(1.6), M.timber, 0.2);
          mt.line(bx + J.R(3), by, nx, ny, M.clothCream, 0.86);
        },
        head(mt, J) {
          // 콧수염 · 붉은 모자와 긴 깃털
          const { hcx, hcy, hR } = J;
          mt.put(hcx + hR * 0.62, hcy + hR * 0.36, M.hairBrown, 0.3);
          mt.put(hcx + hR * 0.62 - 1, hcy + hR * 0.36, M.hairBrown, 0.36);
          mt.put(hcx + hR * 0.3, hcy + hR * 0.9, M.hairBrown, 0.34);
          mt.disc(hcx - 0.6, hcy - hR * 0.86, hR * 1.16, hR * 0.62, M.clothRed, (x, y, dx, dy) => 0.6 - dx * 0.16 - dy * 0.24);
          for (let x = Math.round(hcx - hR * 1.2); x <= hcx + hR * 1.15; x++) mt.put(x, Math.round(hcy - hR * 0.44), M.clothRed, 0.4);
          for (let t = 0; t <= 1; t += 0.03) {
            const fx = hcx - hR * 0.6 - t * 15, fy = hcy - hR * 1.0 - Math.sin(t * 2.2) * 9 + t * 4;
            mt.put(fx, fy, M.clothWhite, 0.9 - t * 0.2);
            if (t > 0.15 && t < 0.9) mt.put(fx, fy + 1, M.clothWhite, 0.66);
          }
        },
      },
    },
    frames: {
      bard: { ...STAND, armA: [0.42, 1.5], armB: [-0.5, -1.2] },
      'bard-strum': { ...STAND, armA: [0.56, 1.78], armB: [-0.5, -1.2], bob: -1 },
    },
  },

  // 점성술사 — 보랏빛 긴 머리, 별 박힌 큰 고깔모자와 남보라 로브, 별 지도 책과 혼천의 지팡이
  astrologer: {
    d: {
      face: true, blush: true, eye: 'clothPurple', build: { w: 0.92, head: 1.24 },
      top: 'clothBlue', sleeves: 'clothPurple', skirt: 'clothBlue', long: 0.94, flare: 3.4, trim: 'gold',
      boots: 'wood', belt: 'gold', cloak: { m: 'clothPurple', len: 0.9 },
      hair: { m: 'clothPurple', style: 'wavy' }, hat: 'pointed', hatM: 'clothBlue', hatBand: 'gold',
      hooks: {
        body(mt, J) {
          sprinkle(mt, M.clothBlue, M.gold, 0.8, 0.045, 5);
          // 펼친 책 (뒤쪽 손)
          const [bx, by] = J.P2(J.aB.hx + 0.5, J.aB.hy - 1.5);
          mt.rect(bx - J.R(4.6), by - J.R(2.6), bx + J.R(4.6), by + J.R(2.4), M.wood, 0.36);
          mt.rect(bx - J.R(4), by - J.R(2.9), bx, by + J.R(1.6), M.clothCream, (x, y) => 0.84 - (bx - x) * 0.02);
          mt.rect(bx, by - J.R(2.9), bx + J.R(4), by + J.R(1.6), M.clothCream, (x, y) => 0.74 - (x - bx) * 0.02);
          mt.put(bx - J.R(2), by - J.R(1), M.clothBlue, 0.5);
          mt.put(bx + J.R(2), by - J.R(1), M.clothBlue, 0.5);
          mt.put(bx + J.R(1.5), by, M.gold, 0.7);
        },
        head(mt, J) {
          sprinkle(mt, M.clothBlue, M.gold, 0.84, 0.03, 9);
          // 모자챙에 매단 달 장식
          mt.put(J.hcx + J.hR + 4, J.hcy - J.hR * 0.2, M.gold, 0.8);
          mt.put(J.hcx + J.hR + 4, J.hcy - J.hR * 0.2 + 1, M.gold, 0.6);
        },
        front(mt, J) {
          // 혼천의 지팡이
          const [px, py] = J.P2(J.aA.hx, J.aA.hy);
          const topY = J.oy + (J.hy - J.hr - 3) * J.s;
          for (let y = Math.round(topY) + 6; y < J.oy; y++) {
            mt.put(px + 1, y, M.gold, 0.62);
            mt.put(px + 2, y, M.gold, 0.36);
          }
          for (let a = 0; a < 6.3; a += 0.12) {
            mt.put(px + 1.5 + Math.cos(a) * 5, topY + Math.sin(a) * 5, M.gold, 0.7 - Math.sin(a) * 0.16);
            mt.put(px + 1.5 + Math.cos(a) * 5, topY + Math.sin(a) * 2, M.gold, 0.56);
          }
          mt.disc(px + 1.5, topY, 1.8, 1.8, M.water, 0.86);
          mt.disc(px, py, J.R(1.5), J.R(1.5), J.skin, 0.6);
        },
      },
    },
    frames: { astrologer: { ...STAND, armA: [0.5, 1.5], armB: [0.86, 1.96] } },
  },

  // 궁수 — 금발 땋은 머리의 엘프, 초록 튜닉, 갈색 팔보호대와 허벅지까지 오는 장화, 화살통
  archer: {
    d: {
      face: true, blush: true, eye: 'clothBlue', ears: 'elf', build: { w: 0.9, head: 1.24 },
      top: 'clothGreen', sleeves: 'clothGreen', legs: 'skin', boots: 'wood', bootHigh: true, thighBoot: true,
      long: 0.3, skirt: 'clothGreen', flare: 1.6, belt: 'wood', bracer: 'wood',
      hair: { m: 'hairBlond', style: 'short' },
      hooks: {
        back(mt, J) {
          quiver(mt, J);
        },
        head(mt, J) {
          // 어깨 앞으로 넘긴 땋은 머리
          for (let k = 0; k < 9; k++) {
            const [bx, by] = J.P2(-J.tw * 0.9 - (k > 4 ? 0.6 : 0), J.hy + J.hr * 0.5 + k * 2);
            mt.disc(bx, by, J.R(1.7 - k * 0.07), J.R(1.3), M.hairBlond, k % 2 ? 0.66 : 0.44);
          }
        },
        front(mt, J) {
          const draw = J.pose.draw;
          bow(mt, J, J.aA.hx + 0.6, J.aA.hy, draw ? [J.aB.hx, J.aB.hy] : null);
          const [px, py] = J.P2(J.aA.hx, J.aA.hy);
          mt.disc(px, py, J.R(1.5), J.R(1.5), J.skin, 0.6);
          if (draw) {
            const [qx, qy] = J.P2(J.aB.hx, J.aB.hy);
            mt.disc(qx, qy, J.R(1.4), J.R(1.4), J.skin, 0.56);
          }
        },
      },
    },
    frames: {
      archer: { ...STAND, armA: [0.5, 1.3], armB: [-0.1, 0.3] },
      'archer-draw': { ...STAND, a: [0.26, 0.1], b: [-0.3, -0.36], armA: [1.5, 1.56], armB: [-1.5, 1.35], draw: true },
    },
  },

  // 마법사 — 검은 긴 머리와 금빛 이마 장식, 보랏빛 무늬가 도는 검은 드레스, 손 위에 뜬 보랏빛 구슬
  mage: {
    d: {
      face: true, blush: true, eye: 'clothPurple', build: { w: 0.92, head: 1.24 },
      top: 'clothBlack', sleeves: 'clothBlack', skirt: 'clothBlack', long: 1.0, flare: 6.4, trim: 'clothPurple',
      belt: 'gold', hair: { m: 'hairBlack', style: 'wavy' }, cloak: { m: 'clothPurple', len: 1.0, flare: 5 },
      hooks: {
        body(mt, J) {
          // 치맛자락의 보랏빛 소용돌이 무늬
          for (let y = 0; y < mt.h; y++)
            for (let x = 0; x < mt.w; x++) {
              if (mt.at(x, y) !== M.clothBlack || y < J.oy + (J.hipY + 3) * J.s) continue;
              const k = Math.sin(x * 0.9 + Math.sin(y * 0.55) * 2.2) + Math.cos(y * 0.8 + x * 0.3);
              if (k > 1.25) mt.put(x, y, M.clothPurple, 0.52);
            }
          // 드러난 어깨와 목걸이
          const [nx, ny] = J.P2(0.6, J.shY + 1.6);
          mt.rect(nx - J.R(3), ny - 1, nx + J.R(3.4), ny + 1, J.skin, 0.6);
          mt.put(nx + 1, ny + 2, M.gold, 0.76);
        },
        head(mt, J) {
          for (let k = -1; k <= 2; k++) mt.put(J.hcx + k * 2, J.hcy - J.hR * 0.62, M.gold, 0.76);
          mt.put(J.hcx + 2, J.hcy - J.hR * 0.62 + 1, M.clothPurple, 0.7);
        },
        front(mt, J) {
          // 손 위에 뜬 구슬과 그 빛
          const [ox, oy] = J.P2(J.aB.hx + 0.6, J.aB.hy - 6);
          for (let a = 0; a < 6.3; a += 0.2) mt.put(ox + Math.cos(a) * 6, oy + Math.sin(a) * 6, M.clothPurple, 0.74);
          mt.disc(ox, oy, 4.4, 4.4, M.clothPurple, (x, y, dx, dy) => 0.84 - dx * 0.14 - dy * 0.2);
          mt.disc(ox - 1, oy - 1, 1.8, 1.8, M.clothWhite, 0.94);
          // 넓게 늘어진 소매
          for (const ap of [J.aA]) {
            const [ex, ey] = J.P2(ap.ex, ap.ey), [hx, hy] = J.P2(ap.hx, ap.hy);
            mt.poly([[ex - 1, ey], [hx + 1, hy - 1], [hx - 1, hy + J.R(6)], [ex - J.R(2), ey + J.R(5)]], M.clothBlack, (x, y) => 0.44 - (y - ey) * 0.012);
            mt.disc(hx, hy, J.R(1.5), J.R(1.5), J.skin, 0.6);
          }
        },
      },
    },
    frames: { mage: { ...STAND, armA: [0.66, 1.2], armB: [1.1, 2.2] } },
  },

  // 어쌔신 — 깊게 쓴 검은 두건, 검은 가죽옷, 붉은 목도리와 허리천, 화살통과 단검. 난간 위에 웅크려 앉는다
  rogue: {
    d: {
      face: true, skin: 'skinTan', build: { head: 1.24 },
      top: 'clothBlack', sleeves: 'clothBlack', legs: 'clothBlack', boots: 'iron', bootHigh: true,
      belt: 'wood', gloves: 'iron', hood: 'clothBlack', scarf: 'clothRed', mantle: 'clothRed', mantleLen: 0.26,
      hair: { m: 'hairBrown', style: 'short' },
      hooks: {
        back(mt, J) {
          quiver(mt, J);
        },
        body(mt, J) {
          // 허리에서 늘어진 붉은 천과 가슴의 멜빵
          mt.poly([J.P2(-0.4, J.hipY - 2), J.P2(J.tw * 0.9, J.hipY - 2), J.P2(J.tw * 0.7, J.hipY + 9), J.P2(0.2, J.hipY + 10.5)], M.clothRed, (x, y) => 0.5 - (y - J.oy - J.hipY * J.s) * 0.012);
          const [x0, y0] = J.P2(-J.tw, J.shY + 3), [x1, y1] = J.P2(J.tw, J.hipY - 3.4);
          mt.beam(x0, y0, x1, y1, J.R(1.5), M.wood, 0.44, 0.1);
          mt.put((x0 + x1) / 2, (y0 + y1) / 2, M.steel, 0.8);
        },
        head(mt, J) {
          // 두건이 드리운 그늘 — 얼굴 위쪽을 어둡게
          for (let y = Math.round(J.hcy - J.hR); y < J.hcy - J.hR * 0.2; y++) for (let x = Math.round(J.hcx - J.hR); x <= J.hcx + J.hR + 1; x++) if (mt.at(x, y) === M.skinTan) mt.add(x, y, -0.3);
        },
        front(mt, J) {
          // 단검
          const [hx, hy] = J.P2(J.aA.hx, J.aA.hy);
          mt.line(hx + 1, hy + 1, hx + 6, hy + 6, M.steel, 0.84);
          mt.line(hx + 2, hy + 1, hx + 6, hy + 5, M.steel, 0.6);
          mt.put(hx + 1, hy + 2, M.gold, 0.7);
          mt.put(hx + 2, hy, M.gold, 0.6);
        },
      },
    },
    frames: { rogue: { a: [1.34, -0.52], b: [1.08, -0.7], armA: [0.56, 1.3], armB: [0.3, 1.0], bob: 0, free: true } },
  },
};

function heroFrame(d, pose) {
  const mt = new Mat(CELL.w, CELL.h);
  figure(mt, FOOT[0], FOOT[1], S, d, pose);
  outline(mt);
  return mt.resolve().col;
}

/* ---------- 우왕이 (소파에서 게임 중) ---------- */

/** 레퍼런스에서 옮긴 64px 우왕이의 머리에, 앉아서 패드를 쥔 몸을 붙인다 */
function woowangCouch(press) {
  const src = P.load(path.join(__dirname, '..', 'refs-pixel', 'woowang-64.png'));
  const b = new P.Buf(CELL.w, CELL.h);
  const ox = Math.round((CELL.w - src.w) / 2), oy = CELL.h - 2 - 61;
  // 머리 (맨 위 ~ 턱)
  for (let y = 0; y < 43; y++) for (let x = 0; x < src.w; x++) if (src.px[y * src.w + x] >>> 24) b.px[(oy + y) * b.w + ox + x] = src.px[y * src.w + x];
  const C = {
    L: [84, 52, 40], o: [224, 135, 65], O: [196, 110, 50], M: [180, 45, 91], m: [150, 34, 76], W: [252, 250, 248], w: [226, 222, 226],
    g: [168, 164, 164], G: [128, 124, 126], p: [60, 60, 72], P: [96, 98, 112], r: [255, 47, 143], y: [201, 247, 61], c: [255, 227, 174],
  };
  // 앉은 몸 — 재킷, 패드를 쥔 두 손, 회색 반바지, 앞으로 뻗은 발바닥
  const rows = [
    '....LLWWLMMWWWWWWMMLWWLL....',
    '...LWWWLMMMMWWWWMMMMLWWWL...',
    '..LWWWWLMMMMMWWMMMMMLWWWWL..',
    '..LWWWLMMMMMMMMMMMMMMLWWWL..',
    '..LWWWLMMMLLLLLLLLMMMLWWWL..',
    '..LWWWLLLLPPPPPPPPLLLLWWWL..',
    '...LWLooLPPPpPPPrPPLooLWL...',
    '...LLoooLPPpppPPyPPLoooLL...',
    '....LLLLLPPPpPPPPPPLLLLL....',
    '....LggggLLLLLLLLLLggggL....',
    '...LgggggggggLLgggggggggL...',
    '...LGGGggggggLLggggggGGGL...',
    '..LLLLLLLLLLLLLLLLLLLLLLLL..',
    '..LooooooooL....LooooooooL..',
    '..LoOOOOOOoL....LoOOOOOOoL..',
    '..LoOOOOOOoL....LoOOOOOOoL..',
    '...LLLLLLLL......LLLLLLLL...',
  ];
  const bx = Math.round(CELL.w / 2 - rows[0].length / 2), by = oy + 43;
  rows.forEach((row, r) => [...row].forEach((ch, i) => {
    if (ch !== '.') b.pset(bx + i, by + r + (press && r >= 5 && r <= 8 ? 1 : 0), C[ch]);
  }));
  if (press) {
    // 버튼을 누르는 순간: 패드가 한 칸 내려가고 불이 번쩍
    for (let i = 9; i < 19; i++) b.pset(bx + i, by + 5, C.M);
    b.pset(bx + 16, by + 7, [255, 255, 255]);
    b.pset(bx + 21, by + 3, C.y);
    b.pset(bx + 22, by + 2, C.y);
    b.pset(bx + 6, by + 3, C.r);
  }
  return b;
}

/** 주인공 전부 — name → Buf(56x77) */
function buildHeroes() {
  const out = {};
  for (const h of Object.values(HEROES)) for (const [name, pose] of Object.entries(h.frames)) out[name] = heroFrame(h.d, pose);
  out['woowang-couch'] = woowangCouch(false);
  out['woowang-couch-press'] = woowangCouch(true);
  return out;
}

module.exports = { buildHeroes, CELL, HEROES };

if (require.main === module) {
  const hs = buildHeroes();
  const items = Object.entries(hs).map(([label, buf]) => {
    const bg = new P.Buf(buf.w, buf.h);
    bg.clear([122, 112, 98]);
    bg.sprite(buf, 0, 0);
    return { buf: bg, label, scale: 4 };
  });
  P.save(P.sheet(items, { cols: 5 }), path.join(__dirname, '..', 'preview', 'plaza-heroes.png'));
  console.log('ok', Object.keys(hs).length, fs.existsSync(path.join(__dirname, '..', 'refs-pixel')));
}
