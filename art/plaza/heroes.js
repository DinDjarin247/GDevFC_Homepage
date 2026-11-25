// 주인공(메뉴 캐릭터) — 마을 사람과 같은 입체 생성기로 그리되, 더 크고 동작이 많다.
// 생김새는 사용자가 준 레퍼런스의 옷 · 색 · 소지품을 따랐다 (그림을 그대로 옮기지 않았다).
//   knight 용사 · bard 바드 · astrologer 점성술사 · archer 궁수 · mage 마법사 · rogue 어쌔신
//   woowang 소파에서 게임하는 우왕이 (art/refs-pixel/woowang-64.png 를 그대로 쓴다)
//
// 주인공마다 동작 대본(script)이 있다: [프레임, 초] 의 목록을 차례로 돌린다.
// 메뉴에서 고르면 greet 대본으로 바꿔 화면을 보고 인사한다.
// 광장 캔버스 안에서 마을 사람과 같은 빛 · 앞뒤 순서로 그려진다.
const path = require('path');
const { P, M, hash } = require('./kit');
const N = require('./npcs');
const { add, sub, mul, norm, mv, lerp3, frameAlong } = require('./rig');
const { winterize, HERO_WINTER } = require('./season');

/** 주인공은 같은 자리의 마을 사람보다 이만큼 크다 */
const HS = 1.36;
const YAW = { S: 0, SE: Math.PI / 4, E: Math.PI / 2, SW: -Math.PI / 4, W: -Math.PI / 2 };

/** 서 있는 자세에 덮어쓰기 */
const stand = (D, d, s, o = {}) => ({ ...N.standSpec(D, d, o.breath ? 1 : 0, s), ...o, arms: o.arms ?? N.standSpec(D, d, 0, s).arms });
const rel = (x, y, z, pole) => ({ rel: [x, y, z], pole });
const hang = { a: 0.06, b: 0.2, o: 0.16 };

/* ---------- 덧그리는 것들 ---------- */

/** 금빛 별 무늬 — 화면에서 그 재질인 자리 몇 곳에 찍는다 */
function sprinkle(fig, from, to, v, chance, seed) {
  const { w, h } = fig, m = fig.mt.m;
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (m[i] === from && m[i + 1] === from && m[i + w] === from && m[i - 1] === from && hash(x, y, seed) < chance) {
        m[i] = to;
        fig.mt.v[i] = v;
      }
    }
}

/** 고리 — 가는 금선을 점으로 찍는다 (혼천의) */
function ring(fig, c, ax, ay, n, v) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const q = fig.proj(add(c, add(mul(ax, Math.cos(a)), mul(ay, Math.sin(a)))));
    fig.plot(Math.floor(q[0]), Math.floor(q[1]), q[2] + 0.2, M.gold, v - Math.sin(a) * 0.1, N.G.item);
  }
}

function quiver(fig, J) {
  const tw = J.D.tw;
  const a = add(J.SC, [-tw * 0.55, -3.6, -tw * 0.7 - 1.6]), b = add(J.at(0.2), [tw * 0.7, 0, -tw * 0.7 - 1.6]);
  fig.cap(a, b, 1.7, 1.5, M.wood, { g: N.G.back, v: 0.46 });
  for (let k = 0; k < 3; k++) {
    const f = add(a, [k * 0.9 - 0.9, -1.8 - (k % 2) * 0.6, 0]);
    fig.cap(f, add(f, [0.3, 1.6, 0]), 0.6, 0.6, M.clothWhite, { g: N.G.back, v: 0.82 });
  }
}

/** 활 — 줌통이 왼손, 시위는 pull 까지 당긴다 (없으면 곧게). arrow 가 있으면 그 자리에 화살을 메긴다 */
function bow(fig, J, pull, arrow) {
  const g = J.arms[0].H;
  const fwd = norm([0, 0, 1]);
  const up = [0, -1, 0];
  const bend = pull ? 4.8 : 3.2;
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const u = (i / 12) * 2 - 1;
    pts.push(add(add(g, mul(up, -u * 13)), mul(fwd, -bend * u * u + 0.4)));
  }
  for (let i = 1; i < pts.length; i++) {
    const r = 0.8 - Math.abs(i / 12 - 0.5) * 0.4;
    fig.cap(pts[i - 1], pts[i], r, r, M.wood, { g: N.G.item, v: 0.58, min: 0.55 });
  }
  const top = pts[0], bot = pts[pts.length - 1];
  if (pull) {
    fig.seg(top, pull, M.clothCream, 0.86);
    fig.seg(bot, pull, M.clothCream, 0.86);
  } else fig.seg(top, bot, M.clothCream, 0.86);
  if (arrow) {
    const tip = add(g, mul(fwd, 4.5));
    fig.seg(arrow, tip, M.woodPale, 0.74);
    fig.cap(tip, add(tip, mul(fwd, 1.8)), 0.7, 0.2, M.steel, { g: N.G.item, v: 0.84, min: 0.5 });
    fig.seg(add(arrow, [0, -0.8, 0]), add(arrow, mul(fwd, 1.6)), M.clothWhite, 0.9);
  }
  fig.ell(g, [1.5, 1.5, 1.5], M.skin, { g: N.G.armL, v: 0.58 });
  fig.mark('tip', add(g, mul(fwd, 6)));
}

/* ---------- 생김새 ---------- */

const KNIGHT = {
  face: true, eye: 'clothBlue', build: { head: 1.2 },
  top: 'clothBlack', sleeves: 'clothBlack', legs: 'clothBlack', boots: 'wood', bootHigh: true,
  long: 0.42, skirt: 'clothBlack', trim: 'clothBlue', belt: 'wood', pouch: true,
  hair: { m: 'hairBlond', style: 'short' }, cloak: { m: 'clothBlue', len: 1.0, flare: 4 }, back: 'sword',
  pauldron: 'steel', bracer: 'steel', scarf: 'clothBlue',
  hooks: {
    after(fig, J) {
      const { hr } = J.D;
      // 흐트러진 앞머리와 가슴의 금 장식
      for (let k = -2; k <= 2; k++) fig.dot(N.headSurf(J, [k * 0.2, -0.52 + (k % 2 ? 0.08 : 0), 0.84], [hr * 1.03, hr * 1.1, hr * 1.03]), M.hairBlond, 0.72, { eps: 1.6 });
      fig.dot(add(J.at(0.78), [0, 0, J.D.tw * 0.68]), M.gold, 0.78, { eps: 1.2 });
    },
  },
};

const BARD = {
  face: true, build: { head: 1.2 },
  top: 'woodPale', sleeves: 'clothTeal', legs: 'clothTeal', boots: 'clothCream', bootHigh: true,
  long: 0.36, skirt: 'woodPale', belt: 'wood', mantle: 'clothRed', mantleLen: 0.42,
  hair: { m: 'hairBrown', style: 'long' },
  hooks: {
    after(fig, J) {
      const { hr, tw } = J.D;
      // 류트 — 몸통은 오른쪽 배 앞, 목은 왼쪽 어깨 위로
      const bowl = add(J.at(0.36), [-1.6, 0, tw * 0.66 + 2.4]);
      const neck = add(J.SC, [6.8, -2.6, tw * 0.5 + 2.4]);
      fig.ell([0, 0, 0], [3.8, 4.6, 2.2], M.wood, { F: { o: bowl, R: frameAlong(sub(neck, bowl), [0, 0, 1]) }, g: N.G.item, v: 0.62 });
      fig.cap(lerp3(bowl, neck, 0.25), neck, 1.0, 0.8, M.timber, { g: N.G.item, v: 0.46 });
      fig.cap(neck, add(neck, [1.4, -0.8, -0.6]), 1.1, 0.9, M.timber, { g: N.G.item, v: 0.36 });
      fig.dot(bowl, M.timber, 0.1, { eps: 3 });
      fig.seg(lerp3(bowl, neck, -0.1), neck, M.clothCream, 0.86, { lift: 0.6 });
      fig.mark('lute', bowl);
      // 콧수염 · 붉은 베레모와 긴 깃털
      for (const sd of [1, -1]) fig.dot(N.headSurf(J, [sd * 0.16, 0.42, 0.9], [hr * 0.94, hr * 1.02, hr * 0.96]), M.hairBrown, 0.3);
      const HF = { o: J.HC, R: J.HR };
      fig.ell([-0.8, -hr * 0.78, 0.2], [hr * 1.18, hr * 0.5, hr * 1.1], M.clothRed, { F: HF, g: N.G.hat, v: 0.58 });
      let prev = N.headPt(J, [hr * 0.6, -hr * 1.0, -hr * 0.2]);
      for (let i = 1; i <= 7; i++) {
        const t = i / 7;
        const p = N.headPt(J, [hr * 0.6 + t * 4, -hr * 1.0 - Math.sin(t * 2.4) * 6, -hr * 0.2 - t * 7]);
        fig.cap(prev, p, 0.9 - t * 0.4, 0.8 - t * 0.4, M.clothWhite, { g: N.G.hat, v: 0.86, min: 0.5 });
        prev = p;
      }
    },
  },
};

const ASTROLOGER = {
  face: true, blush: true, eye: 'clothPurple', build: { w: 0.92, head: 1.2 },
  top: 'clothBlue', sleeves: 'clothPurple', skirt: 'clothBlue', long: 0.98, flare: 3.6, trim: 'gold',
  boots: 'wood', belt: 'gold', cloak: { m: 'clothPurple', len: 0.92 },
  hair: { m: 'clothPurple', style: 'wavy' }, hat: 'pointed', hatM: 'clothBlue', hatBand: 'gold',
  hooks: {
    after(fig, J) {
      const sp = J.sp;
      // 혼천의 지팡이 (오른손)
      const h = J.arms[1].H;
      const topP = add(h, [0, -14, 0]);
      fig.cap([h[0], -0.4, h[2]], topP, 0.6, 0.6, M.gold, { g: N.G.item, v: 0.62, min: 0.55 });
      const orb = add(topP, [0, -2.4, 0]);
      ring(fig, orb, [4.2, 0, 0], [0, 4.2, 0], 40, 0.7);
      ring(fig, orb, [0, 0, 4.2], [0, 1.6, 0], 40, 0.56);
      fig.ell(orb, [1.7, 1.7, 1.7], M.water, { g: N.G.item, v: 0.86, k: 0.3 });
      fig.mark('orb', orb);
      // 펼친 책 (왼손) — 책장이 넘어가는 프레임에는 한 장이 들려 있다
      const b = J.arms[0].H;
      const tilt = sp.bookTilt ?? 0.75;
      const F = { o: add(b, [-1.8, -0.8, 0.8]), R: frameAlong([0, -Math.sin(tilt), Math.cos(tilt)], [0, -1, 0]) };
      fig.box([0, 0, 0], [3.6, 0.25, 2.6], M.wood, { F, g: N.G.item, v: 0.4 });
      fig.box([-1.75, -0.4, 0], [1.65, 0.2, 2.3], M.clothCream, { F, g: N.G.item, v: 0.82 });
      fig.box([1.75, -0.4, 0], [1.65, 0.2, 2.3], M.clothCream, { F, g: N.G.item, v: 0.74 });
      if (sp.flip != null) {
        const a = sp.flip;
        fig.box([Math.cos(a) * 1.7, -0.5 - Math.sin(a) * 1.7, 0], [Math.max(0.2, Math.abs(Math.cos(a)) * 1.65), Math.max(0.2, Math.abs(Math.sin(a)) * 1.65), 2.3], M.clothWhite, { F, g: N.G.item, v: 0.92 });
      }
      fig.mark('book', F.o);
      sprinkle(fig, M.clothBlue, M.gold, 0.84, 0.05, 5);
    },
  },
};

const ARCHER = {
  face: true, blush: true, eye: 'clothBlue', ears: 'elf', build: { w: 0.9, head: 1.2 },
  top: 'clothGreen', sleeves: 'clothGreen', legs: 'skin', boots: 'wood', bootHigh: true, thighBoot: true,
  long: 0.3, skirt: 'clothGreen', flare: 1.6, belt: 'wood', bracer: 'wood',
  hair: { m: 'hairBlond', style: 'short' },
  hooks: {
    after(fig, J) {
      quiver(fig, J);
      const { hr } = J.D;
      // 어깨 앞으로 넘긴 땋은 머리
      for (let k = 0; k < 6; k++) fig.ell(N.headPt(J, [hr * 0.7, hr * 0.7 + k * 1.7, hr * 0.15 + k * 0.2]), [1.4 - k * 0.08, 1.1, 1.3], M.hairBlond, { g: N.G.hair, v: k % 2 ? 0.66 : 0.5 });
      const st = J.sp.bowState;
      bow(fig, J, st === 'draw' ? J.arms[1].H : null, st === 'draw' || st === 'nock' ? J.arms[1].H : null);
      fig.mark('hand', J.arms[1].H);
    },
  },
};

const MAGE = {
  face: true, blush: true, eye: 'clothPurple', build: { w: 0.92, head: 1.2 },
  top: 'clothBlack', sleeves: 'clothBlack', skirt: 'clothBlack', long: 1.0, flare: 6, trim: 'clothPurple',
  belt: 'gold', hair: { m: 'hairBlack', style: 'wavy' }, cloak: { m: 'clothPurple', len: 1.0, flare: 4.5 },
  hooks: {
    after(fig, J) {
      const { hr, tw } = J.D;
      // 넓게 늘어진 소매
      J.arms.forEach((A, k) => fig.cap(A.E, lerp3(A.E, A.H, 0.72), 1.8, 2.5, M.clothBlack, { g: k ? N.G.armR : N.G.armL, v: 0.44, two: true }));
      // 드러난 목 · 금 목걸이 · 이마 장식
      fig.ell(add(J.SC, [0, 0.4, 0.7]), [tw * 0.78, 1.3, tw * 0.5], M.skin, { g: N.G.torso, v: 0.6 });
      fig.dot(add(J.SC, [0, 1.8, tw * 0.64]), M.gold, 0.8, { eps: 2 });
      for (let k = -2; k <= 2; k++) fig.dot(N.headSurf(J, [k * 0.17, -0.5, 0.86], [hr * 0.98, hr * 1.06, hr * 1.0]), k ? M.gold : M.clothPurple, k ? 0.76 : 0.74, { eps: 2 });
      if (J.sp.scroll) {
        const h = J.arms[1].H;
        const F = { o: add(h, [0.4, -2.8, 0.9]), R: frameAlong([0, 1, 0.25], [0, 0, 1]) };
        fig.box([0, 0, 0], [2.2, 3.4, 0.2], M.clothCream, { F, g: N.G.item, v: 0.84, paint: (p) => (Math.round(p[1] * 1.4) % 2 && Math.abs(p[0]) < 1.4 ? [M.clothCream, -0.3] : M.clothCream) });
        for (const e of [-3.6, 3.6]) fig.cap(add(F.o, mv(F.R, [-2.4, e, 0])), add(F.o, mv(F.R, [2.4, e, 0])), 0.7, 0.7, M.wood, { g: N.G.item, v: 0.5 });
      }
      fig.mark('orb', add(J.arms[0].H, [0, -6.5, 0.6]));
      // 치맛자락의 보랏빛 소용돌이
      const m = fig.mt.m;
      for (let i = 0; i < m.length; i++) {
        if (m[i] !== M.clothBlack || fig.g[i] !== N.G.skirt) continue;
        const x = i % fig.w, y = Math.floor(i / fig.w);
        const k = Math.sin(x * 0.7 + Math.sin(y * 0.45) * 2.2) + Math.cos(y * 0.6 + x * 0.25);
        if (k > 1.3) {
          m[i] = M.clothPurple;
          fig.mt.v[i] = 0.5;
        }
      }
    },
  },
};

const ROGUE = {
  face: true, skin: 'skinTan', build: { head: 1.2 },
  top: 'clothBlack', sleeves: 'clothBlack', legs: 'clothBlack', boots: 'iron', bootHigh: true,
  belt: 'wood', gloves: 'iron', hood: 'clothBlack', scarf: 'clothRed', mantle: 'clothRed', mantleLen: 0.26,
  hair: { m: 'hairBrown', style: 'short' },
  hooks: {
    after(fig, J) {
      quiver(fig, J);
      const { tw } = J.D;
      // 허리에서 늘어진 붉은 천 · 가슴을 가로지르는 멜빵
      fig.box([tw * 0.45, 4.5, tw * 0.62], [1.6, 4.5, 0.3], M.clothRed, { F: { o: J.P0, R: J.TR }, g: N.G.skirt, v: 0.5 });
      const a = add(J.SC, [tw * 0.9, 2.6, tw * 0.66]), b = add(J.at(0.25), [-tw * 0.9, 0, tw * 0.7]);
      fig.cap(a, b, 0.8, 0.8, M.wood, { g: N.G.mantle, v: 0.46 });
      // 단검 — 손에 쥐었거나 공중에서 돈다
      const h = J.arms[1].H;
      const dg = J.sp.dagger;
      const at = dg ? add(h, [0, -dg.up, 0]) : h;
      const ang = dg ? dg.spin : 0.6;
      const dir = [Math.sin(ang) * 0.3, -Math.cos(ang), Math.sin(ang) * 0.95];
      fig.cap(at, add(at, mul(dir, 4.8)), 0.6, 0.25, M.steel, { g: N.G.item, v: 0.86, k: 0.6, min: 0.5 });
      fig.cap(add(at, mul(dir, -0.4)), add(at, mul(dir, -1.8)), 0.6, 0.6, M.gold, { g: N.G.item, v: 0.62, min: 0.5 });
    },
  },
};

/* ---------- 자세 ---------- */

/** 어쌔신 — 난간 위에 웅크려 앉는다 (발밑 = 난간 윗면) */
function squat(D, d, s, o = {}) {
  return {
    feet: [[2.8, 0, 1.4, 0.2], [-2.8, 0, 0.6, 0.2]],
    hipY: -6.2, hipZ: -2.4, lean: 0.46,
    arms: o.arms ?? [rel(2.8, 10, 3.2), rel(-3, 10.4, 3.8)],
    headPitch: -0.32 + (o.breath ? 0.03 : 0), headYaw: o.headYaw ?? 0, breath: o.breath ? 0.8 / s : 0,
    cloth: { dz: -0.4, dx: 0, sway: 0 }, stride: 0, dagger: o.dagger,
  };
}

/** 바드의 류트 쥔 손 — 왼손은 목, 오른손은 줄 위에서 위아래로 (k: -1~1) */
const luteArms = (k) => [rel(4.6, 0.8, 4.7, [0.6, 0.6, -1]), rel(-2.2, 7.8 + k * 1.3, 5.4, [-0.6, 0.5, -0.6])];

const HEROES = {
  // 용사 — 화톳불 옆. 3/4 앞을 보고 서 있다가, 가끔 불 쪽(왼쪽)으로 돌아 손을 녹인다
  knight: {
    mode: 'about', d: KNIGHT,
    frames: {
      i0: ['SE', (D, d, s) => stand(D, d, s)],
      i1: ['SE', (D, d, s) => stand(D, d, s, { breath: 1 })],
      s0: ['S', (D, d, s) => stand(D, d, s)],
      sw: ['SW', (D, d, s) => stand(D, d, s)],
      warm0: ['W', (D, d, s) => stand(D, d, s, { lean: 0.08, headPitch: 0.12, arms: [rel(2.0, 6.8, 7.6), rel(-2.0, 6.4, 7.8)] })],
      warm1: ['W', (D, d, s) => stand(D, d, s, { lean: 0.08, headPitch: 0.12, breath: 0.7 / s, arms: [rel(2.6, 6.2, 7.4), rel(-2.6, 6.0, 7.6)] })],
      g0: ['S', (D, d, s) => stand(D, d, s, { arms: [hang, rel(-7.2, -6.2, 2.2)] })],
      g1: ['S', (D, d, s) => stand(D, d, s, { headRoll: 0.06, arms: [hang, rel(-5.4, -8.2, 2.6)] })],
    },
    script: [['i0', 1.8], ['i1', 1.3], ['i0', 1.8], ['i1', 1.3], ['s0', 0.12], ['sw', 0.12], ['warm0', 0.7], ['warm1', 0.7], ['warm0', 0.7], ['warm1', 0.7], ['warm0', 0.7], ['sw', 0.12], ['s0', 0.12]],
    greet: [['s0', 0.1], ['g0', 0.32], ['g1', 0.32], ['g0', 0.32], ['g1', 0.32]],
  },

  // 바드 — 분수 앞을 오가며 류트를 탄다. 양 끝에서는 화면을 보고 한 곡 뜯는다
  bard: {
    mode: 'gallery', d: BARD,
    frames: {
      ...Object.fromEntries([0, 1, 2, 3, 4, 5, 6, 7].flatMap((i) => [
        [`e${i}`, ['E', (D, d) => ({ ...N.walkSpec(D, d, i / 8), arms: luteArms(Math.sin((i / 8) * Math.PI * 4)) })]],
        [`w${i}`, ['W', (D, d) => ({ ...N.walkSpec(D, d, i / 8), arms: luteArms(Math.sin((i / 8) * Math.PI * 4)) })]],
      ])),
      ...Object.fromEntries([0, 1, 2, 3].map((i) => [`p${i}`, ['S', (D, d, s) => stand(D, d, s, { arms: luteArms([-1, 0, 1, 0][i]), headRoll: [0.05, 0, -0.05, 0][i], breath: i % 2 ? 0.6 / s : 0 })]])),
      se: ['SE', (D, d, s) => stand(D, d, s, { arms: luteArms(0) })],
      sw: ['SW', (D, d, s) => stand(D, d, s, { arms: luteArms(0) })],
    },
    // 바드는 화면(PlazaScene)이 직접 걷게 한다 — 걷는 프레임은 걸은 거리로, 서서 연주할 때는 이 대본으로
    walk: { right: ['e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7'], left: ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7'], speed: 24, span: [-80, 80], rest: 3.2 },
    script: [['p0', 0.16], ['p1', 0.16], ['p2', 0.16], ['p3', 0.16]],
    greet: [['p0', 0.12], ['p1', 0.12], ['p2', 0.12], ['p3', 0.12]],
  },

  // 점성술사 — 천막 앞에서 별 지도 책을 읽는다. 책장이 저절로 넘어가고, 가끔 하늘을 올려다본다
  astrologer: {
    mode: 'events', d: ASTROLOGER,
    frames: (() => {
      const book = rel(1.4, 7.4, 6.6, [1, 0.6, -0.6]), staff = { a: 0.24, b: 0.8, o: 0.55 };
      return {
        r0: ['SE', (D, d, s) => stand(D, d, s, { headPitch: 0.22, arms: [book, staff] })],
        r1: ['SE', (D, d, s) => stand(D, d, s, { headPitch: 0.24, breath: 1, arms: [book, staff] })],
        f0: ['SE', (D, d, s) => ({ ...stand(D, d, s, { headPitch: 0.22, arms: [book, staff] }), flip: 0.5 })],
        f1: ['SE', (D, d, s) => ({ ...stand(D, d, s, { headPitch: 0.22, arms: [book, staff] }), flip: Math.PI / 2 })],
        f2: ['SE', (D, d, s) => ({ ...stand(D, d, s, { headPitch: 0.22, arms: [book, staff] }), flip: 2.6 })],
        up: ['SE', (D, d, s) => ({ ...stand(D, d, s, { headPitch: -0.42, lean: -0.04, arms: [rel(1.8, 9.4, 5.4, [1, 0.6, -0.6]), staff] }), bookTilt: 1.2 })],
        s0: ['S', (D, d, s) => stand(D, d, s, { arms: [book, staff] })],
        g0: ['S', (D, d, s) => stand(D, d, s, { headRoll: 0.1, arms: [book, rel(-5.2, -1.6, 3.2)] })],
        g1: ['S', (D, d, s) => stand(D, d, s, { headRoll: 0.04, arms: [book, rel(-5.0, -2.8, 3.2)] })],
      };
    })(),
    script: [['r0', 1.6], ['r1', 1.2], ['r0', 1.4], ['f0', 0.14], ['f1', 0.14], ['f2', 0.18], ['r0', 1.2], ['r1', 1.2], ['up', 1.8], ['r0', 0.8]],
    greet: [['s0', 0.1], ['g0', 0.5], ['g1', 0.5]],
  },

  // 궁수 — 과녁장. 화살을 꺼내 메기고, 당겨 겨누고, 쏜다 (release 프레임에 화면이 화살을 날린다)
  archer: {
    mode: 'join', d: ARCHER,
    frames: (() => {
      const A = 1.25;
      const bowLow = rel(3.2, 10, 3.6);
      const f = (arms, o = {}) => [A, (D, d, s) => ({ ...stand(D, d, s, { arms, ...o }), bowState: o.bowState })];
      return {
        i0: f([bowLow, hang]),
        i1: f([bowLow, hang], { breath: 1 }),
        reach: f([bowLow, rel(-3.4, -3.8, -3.6, [-1, 0.6, 0.4])], { twist: 0.1 }),
        nock: f([rel(2.6, 1.6, 9.6), rel(0.8, 2.2, 7.6, [-1, 0.6, -0.4])], { bowState: 'nock', twist: -0.1 }),
        draw1: f([rel(1.6, 0.6, 10.8), rel(-0.6, 0.8, 4.8, [-1, 0.2, -0.4])], { bowState: 'draw', twist: -0.2, headYaw: -0.06 }),
        draw2: f([rel(1.2, 0.2, 11.4), rel(-1.6, -1.4, 1.2, [-1, 0.2, -0.2])], { bowState: 'draw', twist: -0.28, headYaw: -0.1 }),
        release: f([rel(1.2, 0.2, 11.4), rel(-3.6, -2.0, -1.6, [-1, 0.2, 0.2])], { twist: -0.28, headYaw: -0.1 }),
        follow: f([rel(1.4, 1.0, 11.0), rel(-3.8, -1.2, -1.8, [-1, 0.2, 0.2])], { twist: -0.24, headYaw: -0.08 }),
        lower: f([rel(2.8, 6.4, 6.6), hang]),
        se: ['SE', (D, d, s) => stand(D, d, s, { arms: [bowLow, hang] })],
        g0: ['S', (D, d, s) => stand(D, d, s, { arms: [bowLow, rel(-7, -6.4, 2.4)] })],
        g1: ['S', (D, d, s) => stand(D, d, s, { headRoll: -0.06, arms: [bowLow, rel(-5.2, -8.4, 2.8)] })],
      };
    })(),
    script: [['i0', 0.9], ['i1', 0.7], ['reach', 0.36], ['nock', 0.3], ['draw1', 0.22], ['draw2', 0.8], ['release', 0.14], ['follow', 0.5], ['lower', 0.34]],
    greet: [['se', 0.1], ['g0', 0.32], ['g1', 0.32], ['g0', 0.32], ['g1', 0.32]],
  },

  // 마법사 — 두루마리 좌판 앞. 왼손 위에 마법 구슬을 띄우고(화면이 그린다), 오른손으로 두루마리를 집어 읽는다
  mage: {
    mode: 'showcase', d: MAGE,
    frames: (() => {
      const A = 1.15;
      const orbHand = rel(3.4, 3.6, 6.4, [1, 0.6, -0.6]), side = { a: 0.08, b: 0.3, o: 0.18 };
      const f = (arms, o = {}) => [A, (D, d, s) => ({ ...stand(D, d, s, { arms, ...o }), scroll: o.scroll })];
      return {
        i0: f([orbHand, side]),
        i1: f([rel(3.4, 3.9, 6.4, [1, 0.6, -0.6]), side], { breath: 1 }),
        reach: f([orbHand, rel(-1.6, 5.4, 10.6)], { lean: 0.14 }),
        read: f([orbHand, rel(-0.8, 2.6, 6.8)], { headPitch: 0.16, scroll: true }),
        se: ['SE', (D, d, s) => stand(D, d, s, { arms: [orbHand, side] })],
        g0: ['S', (D, d, s) => stand(D, d, s, { arms: [rel(3.6, -3.2, 4.2, [1, 0.4, -0.6]), side] })],
        g1: ['S', (D, d, s) => stand(D, d, s, { headRoll: 0.06, arms: [rel(3.8, -4.2, 4.0, [1, 0.4, -0.6]), side] })],
      };
    })(),
    script: [['i0', 1.4], ['i1', 1.1], ['i0', 1.4], ['reach', 0.5], ['read', 2.4], ['reach', 0.4], ['i0', 1.0], ['i1', 1.1]],
    greet: [['se', 0.1], ['g0', 0.45], ['g1', 0.45]],
  },

  // 어쌔신 — 큰 계단 난간 위에 웅크려 앉아 두리번거리고, 단검을 던졌다 받는다
  rogue: {
    mode: 'board', d: ROGUE,
    frames: {
      i0: ['SE', (D, d, s) => squat(D, d, s)],
      i1: ['SE', (D, d, s) => squat(D, d, s, { breath: 1 })],
      lookL: ['SE', (D, d, s) => squat(D, d, s, { headYaw: 0.75 })],
      lookR: ['SE', (D, d, s) => squat(D, d, s, { headYaw: -0.7 })],
      t0: ['SE', (D, d, s) => squat(D, d, s, { arms: [rel(2.8, 10, 3.2), rel(-3.2, 4.6, 6.4)] })],
      t1: ['SE', (D, d, s) => squat(D, d, s, { arms: [rel(2.8, 10, 3.2), rel(-3.2, 2.4, 6.6)], dagger: { up: 7, spin: 2.4 } })],
      t2: ['SE', (D, d, s) => squat(D, d, s, { arms: [rel(2.8, 10, 3.2), rel(-3.2, 3.0, 6.6)], dagger: { up: 12, spin: 4.6 } })],
      t3: ['SE', (D, d, s) => squat(D, d, s, { arms: [rel(2.8, 10, 3.2), rel(-3.2, 2.6, 6.6)], dagger: { up: 6, spin: 0.2 } })],
      s0: ['S', (D, d, s) => squat(D, d, s)],
      g0: ['S', (D, d, s) => squat(D, d, s, { arms: [rel(2.8, 10, 3.2), rel(-2.6, -4.8, 4.6)] })],
      g1: ['S', (D, d, s) => squat(D, d, s, { headYaw: -0.12, arms: [rel(2.8, 10, 3.2), rel(-3.6, -4.2, 4.4)] })],
    },
    script: [['i0', 1.5], ['i1', 1.0], ['lookL', 1.2], ['i0', 0.4], ['lookR', 1.2], ['i0', 1.0], ['i1', 1.0], ['t0', 0.18], ['t1', 0.12], ['t2', 0.2], ['t3', 0.12], ['t0', 0.3]],
    greet: [['s0', 0.1], ['g0', 0.7], ['g1', 0.5]],
  },
};

/* ---------- 우왕이 (소파에서 게임 중) ---------- */

/** 레퍼런스에서 옮긴 64px 우왕이의 머리에, 앉아서 패드를 쥔 몸을 붙인다 */
function woowangCouch(press, season) {
  const CELL = { w: 56, h: 77 };
  const src = P.load(path.join(__dirname, '..', 'refs-pixel', 'woowang-64.png'));
  const b = new P.Buf(CELL.w, CELL.h);
  const ox = Math.round((CELL.w - src.w) / 2), oy = CELL.h - 2 - 61;
  for (let y = 0; y < 43; y++) for (let x = 0; x < src.w; x++) if (src.px[y * src.w + x] >>> 24) b.px[(oy + y) * b.w + ox + x] = src.px[y * src.w + x];
  const C = {
    L: [84, 52, 40], o: [224, 135, 65], O: [196, 110, 50], M: [180, 45, 91], m: [150, 34, 76], W: [252, 250, 248], w: [226, 222, 226],
    g: [168, 164, 164], G: [128, 124, 126], p: [60, 60, 72], P: [96, 98, 112], r: [255, 47, 143], y: [201, 247, 61], c: [255, 227, 174],
  };
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
    for (let i = 9; i < 19; i++) b.pset(bx + i, by + 5, C.M);
    b.pset(bx + 16, by + 7, [255, 255, 255]);
    b.pset(bx + 21, by + 3, C.y);
    b.pset(bx + 22, by + 2, C.y);
    b.pset(bx + 6, by + 3, C.r);
  }
  if (season === 'christmas') santaPixel(b, ox, oy, C.L);
  return { buf: b, ax: Math.round(CELL.w / 2), ay: CELL.h - 2, anchors: {} };
}

/** 우왕이 머리 위의 산타 모자 — 두 뿔 사이에 얹고 끝이 오른쪽으로 처진다 (그림 좌표는 64px 원본 기준) */
function santaPixel(b, ox, oy, line) {
  const red = [214, 44, 56], redD = [158, 28, 44], white = [252, 250, 248], whiteD = [214, 216, 226];
  const set = (x, y, c) => b.pset(ox + x, oy + y, c);
  for (let j = 0; j <= 10; j++) {
    const y = 4 - j, hw = 9.5 * (1 - j / 11), cx = 27 + j * 0.9;
    for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) set(x, y, x > cx + hw * 0.35 ? redD : red);
    set(Math.round(cx - hw) - 1, y, line);
    set(Math.round(cx + hw) + 1, y, line);
  }
  for (let x = 16; x <= 38; x++) {
    set(x, 4, line);
    set(x, 5, x > 32 ? whiteD : white);
    set(x, 6, x > 32 ? whiteD : white);
    set(x, 7, line);
  }
  set(15, 5, line);
  set(15, 6, line);
  set(39, 5, line);
  set(39, 6, line);
  for (let y = -9; y <= -5; y++) for (let x = 35; x <= 40; x++) if (Math.hypot(x - 37.5, y + 7) < 2.6) set(x, y, Math.hypot(x - 37.5, y + 7) > 1.8 ? whiteD : white);
}

/**
 * 주인공 전부 — spots 는 placement.js 의 SPOTS (모드 id → 자리 · 배율).
 * 반환: frames(이름 → { buf, ax, ay, anchors }), defs(모드 id → 대본 · 크기)
 */
function buildHeroes(spots, season = 'autumn') {
  const frames = {}, defs = {};
  for (const [name, H] of Object.entries(HEROES)) {
    const spot = spots[H.mode];
    const s = HS * spot.scale;
    const d = season === 'christmas' ? winterize(H.d, HERO_WINTER[name]) : H.d;
    const D = N.dims(d);
    for (const [key, [dir, fn]] of Object.entries(H.frames)) {
      const yaw = typeof dir === 'number' ? dir : YAW[dir];
      const r = N.render(d, s, yaw, (D2) => fn(D2, d, s));
      frames[`h_${name}_${key}`] = { buf: r.buf, ax: r.ax, ay: r.ay, anchors: r.anchors };
    }
    const pref = (list) => list.map(([k, t]) => [`h_${name}_${k}`, t]);
    defs[H.mode] = {
      hero: name,
      script: pref(H.script),
      greet: pref(H.greet),
      walk: H.walk
        ? { ...H.walk, right: H.walk.right.map((k) => `h_${name}_${k}`), left: H.walk.left.map((k) => `h_${name}_${k}`), cycle: +(N.CYCLE * s).toFixed(2), turnL: `h_${name}_sw`, turnR: `h_${name}_se` }
        : undefined,
      scale: +s.toFixed(3),
      height: Math.round((D.Lg + D.T + D.hr * 2.4) * s) - (name === 'rogue' ? Math.round(10 * s) : 0),
    };
  }
  // 우왕이는 레퍼런스에서 옮긴 그림 그대로 (입체 생성기를 쓰지 않는다)
  frames.h_woowang_idle = woowangCouch(false, season);
  frames.h_woowang_press = woowangCouch(true, season);
  defs['weekly-gg'] = {
    hero: 'woowang',
    script: [['h_woowang_idle', 0.5], ['h_woowang_press', 0.18], ['h_woowang_idle', 0.34], ['h_woowang_press', 0.14], ['h_woowang_idle', 0.22], ['h_woowang_press', 0.14], ['h_woowang_idle', 0.9], ['h_woowang_press', 0.2]],
    greet: [['h_woowang_press', 0.12], ['h_woowang_idle', 0.12]],
    scale: 1,
    height: 62,
    // 소파에 앉아 있으므로 소파보다 앞에 그린다
    sortY: 487,
    noShadow: true,
  };
  return { frames, defs };
}

module.exports = { buildHeroes, HEROES, HS };

if (require.main === module) {
  const { SPOTS } = require('./placement');
  const { bounds } = require('./rig');
  const only = process.argv[2];
  const { frames } = buildHeroes(SPOTS, process.argv[3] ?? 'autumn');
  const items = Object.entries(frames)
    .filter(([n]) => !only || n.includes(only))
    .map(([label, f]) => {
      const bb = bounds(f.buf) ?? { x0: 0, y0: 0, x1: 1, y1: 1 };
      const c = P.crop(f.buf, bb.x0 - 2, bb.y0 - 2, bb.x1 - bb.x0 + 5, bb.y1 - bb.y0 + 5);
      const bg = new P.Buf(c.w, c.h);
      bg.clear([150, 138, 120]);
      bg.sprite(c, 0, 0);
      return { buf: bg, label: label.replace('h_', ''), scale: 3 };
    });
  P.save(P.sheet(items, { cols: 9 }), path.join(__dirname, '..', 'preview', 'plaza-heroes.png'));
  console.log('ok', items.length);
}
