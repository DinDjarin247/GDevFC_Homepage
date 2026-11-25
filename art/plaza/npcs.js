// 마을 사람 — 뼈대(관절 위치)를 3차원으로 세우고, 그 위에 몸 · 옷 · 소지품을 입체로 입혀 그린다.
//
// 같은 사람을 다섯 방향(정면 S · 3/4 앞 SE · 옆 E · 3/4 뒤 NE · 뒤 N)에서 그리고, 왼쪽을 향한
// 세 방향(SW · W · NW)은 화면에서 좌우로 뒤집어 쓴다. 빛이 거의 위 · 앞에서 오므로 뒤집어도 어색하지 않다.
//
// 걷기는 발이 땅을 디딘 동안 몸 좌표에서 일정한 속도로 뒤로 밀려나게 만든다 — 그래서 화면에서
// 사람을 STRIDE 만큼 옮기며 프레임을 넘기면 디딘 발이 바닥에 붙어 있다 (미끄러지지 않는다).
const { M, hash } = require('./kit');
const R = require('./rig');
const { add, sub, mul, norm, mv, mm, rotX, rotY, rotZ, frameAlong, ik, Fig } = R;

/** 방향 이름 → 바라보는 각 (0 = 카메라 쪽) */
const DIRS = { S: 0, SE: Math.PI / 4, E: Math.PI / 2, NE: (3 * Math.PI) / 4, N: Math.PI };
const DIR_NAMES = Object.keys(DIRS);

/** 부위 번호 — 서로 다른 부위가 겹친 가장자리에만 안쪽 선을 넣는다 */
const G = { torso: 1, head: 2, armL: 3, armR: 4, legL: 5, legR: 6, skirt: 7, cloak: 8, hair: 9, hat: 10, item: 11, back: 12, mantle: 14 };

/** 걸음 — 한 걸음(발 하나가 디딘 동안 몸이 나아가는 거리)의 절반. 한 바퀴(8프레임)에 4배를 간다 */
const STEP = 4.2;
const CYCLE = STEP * 4;
const ANKLE = 1.4;

/* ---------- 치수 ---------- */

function dims(d) {
  const B = { h: 1, w: 1, leg: 1, head: 1, ...(d.build ?? {}) };
  const U = 7.7 * B.h * B.leg, Lo = 7.7 * B.h * B.leg;
  const tw = 4.0 * B.w;
  return {
    B, U, Lo,
    Lg: U + Lo + ANKLE,
    T: 13.6 * B.h,
    hr: 5.0 * B.head,
    tw,
    hw: 1.9 * B.w,
    sw: tw + 1.25,
    UA: 6.0 * B.h,
    LA: 5.6 * B.h,
  };
}

/* ---------- 자세 ---------- */

/** 서 있는 골반 높이 — 무릎이 아주 조금 굽는다 */
const standHip = (D, spread = 0.2) => -(ANKLE + Math.sqrt((D.U + D.Lo) ** 2 * 0.975 ** 2 - spread ** 2));

/** 손에 든 것이 있으면 그 팔은 정해진 자세로 든다 */
function holdArm(d) {
  switch (d.item) {
    case 'staff':
    case 'spear':
    case 'broom':
      return { a: 0.34, b: 1.12, o: 0.14 };
    case 'basket':
      return { a: 0.06, b: 1.5, o: 0.26 };
    case 'mug':
    case 'gift':
      return { a: 0.22, b: 1.32, o: 0.12 };
    case 'axe':
    case 'hammer':
      return { a: -0.2, b: 2.6, o: 0.2 };
    default:
      return null;
  }
}

/** 걷기 한 프레임 — phi 는 0~1 (0 과 0.5 가 발이 닿는 순간, 0.25 · 0.75 가 다리가 엇갈리는 순간) */
function walkSpec(D, d, phi) {
  const lift = 2.3 * D.B.h;
  const foot = (ph) => {
    ph = ((ph % 1) + 1) % 1;
    if (ph < 0.5) return { z: STEP * (1 - 4 * ph), y: 0, toe: 0 };
    const u = (ph - 0.5) * 2, e = u * u * (3 - 2 * u);
    return { z: -STEP + 2 * STEP * e, y: -lift * Math.sin(Math.PI * u), toe: 0.55 * Math.sin(Math.PI * u) * (1 - u) - 0.25 * Math.sin(Math.PI * u) * u };
  };
  const fl = foot(phi), fr = foot(phi + 0.5);
  const c = Math.cos(2 * Math.PI * phi);
  const hip0 = ANKLE + Math.sqrt(((D.U + D.Lo) * 0.985) ** 2 - STEP ** 2);
  const up = 0.55 * (1 - Math.cos(4 * Math.PI * phi)) / 2;
  const hold = holdArm(d);
  const swing = 0.44;
  const armL = { a: -swing * c, b: 0.28 + 0.32 * Math.max(0, -swing * c), o: 0.1 };
  const armR = hold ? { ...hold, a: (hold.a ?? 0) + 0.05 * c } : { a: swing * c, b: 0.28 + 0.32 * Math.max(0, swing * c), o: 0.1 };
  return {
    feet: [[D.hw * 0.9, fl.y, fl.z, fl.toe], [-D.hw * 0.9, fr.y, fr.z, fr.toe]],
    hipY: -(hip0 + up),
    hipX: 0.35 * Math.sin(2 * Math.PI * phi) * D.B.w,
    lean: 0.07,
    twist: 0.14 * c,
    arms: [armL, armR],
    headYaw: -0.07 * c,
    cloth: { dz: -0.9 - 0.5 * Math.abs(Math.sin(2 * Math.PI * phi)), dx: 0.5 * Math.sin(2 * Math.PI * phi), sway: Math.sin(2 * Math.PI * (phi - 0.12)) },
    stride: Math.abs(fl.z - fr.z),
  };
}

/** 서 있기 — k: 0 보통, 1 숨을 내쉰 프레임(어깨 · 머리가 화면에서 1픽셀 내려간다) */
function standSpec(D, d, k, s) {
  const hold = holdArm(d);
  const drop = k ? 0.9 / s : 0;
  return {
    feet: [[D.hw * 0.95, 0, 0.25, 0], [-D.hw * 0.95, 0, -0.25, 0]],
    hipY: standHip(D, 0.25),
    lean: 0.03,
    breath: drop,
    arms: [{ a: 0.05, b: 0.2 + (k ? 0.04 : 0), o: 0.16 }, hold ?? { a: 0.05, b: 0.2, o: 0.16 }],
    headPitch: k ? 0.04 : 0,
    cloth: { dz: 0, dx: 0, sway: 0 },
    stride: 0.5,
  };
}

/** 말하기 손짓 — k: 0 손을 반쯤 든 프레임, 1 다 든 프레임. 손이 비어 있는 쪽 팔로 한다 */
function talkSpec(D, d, k, s) {
  const sp = standSpec(D, d, 0, s);
  const free = holdArm(d) ? 0 : 1;
  sp.arms[free] = k ? { a: 0.62, b: 1.55, o: 0.22 } : { a: 0.36, b: 0.95, o: 0.18 };
  sp.headPitch = k ? -0.06 : 0.02;
  sp.headYaw = k ? (free ? -0.08 : 0.08) : 0;
  sp.twist = free ? -0.06 * (k + 1) : 0.06 * (k + 1);
  return sp;
}

/* ---------- 뼈대 ---------- */

function skeleton(D, sp) {
  const lean = sp.lean ?? 0.03, twist = sp.twist ?? 0;
  const P0 = [sp.hipX ?? 0, sp.hipY, sp.hipZ ?? 0];
  const spine = [0, -Math.cos(lean), Math.sin(lean)];
  const at = (u) => add(P0, mul(spine, D.T * u));
  const breath = sp.breath ?? 0;
  const SC = add(at(1), [0, breath, 0]);
  const legs = [1, -1].map((side, k) => {
    const f = sp.feet[k];
    const H = add(P0, [side * D.hw, 0.6, 0]);
    const A = [f[0], -ANKLE + f[1], f[2]];
    const { joint, end } = ik(H, A, D.U, D.Lo, [side * 0.12, 0, 1]);
    return { H, K: joint, A: end, toe: f[3] ?? 0, side };
  });
  const sh = [1, -1].map((side) => add(SC, [side * D.sw * Math.cos(twist), 1.8, -side * D.sw * Math.sin(twist)]));
  const arms = [1, -1].map((side, k) => {
    const S = sh[k], a = sp.arms?.[k] ?? { a: 0.05, b: 0.2, o: 0.1 };
    // hand: 몸 좌표의 손 자리, rel: 어깨 가운데(SC)에서 본 손 자리 — 둘 다 팔꿈치는 IK 로 푼다
    const target = a.hand ?? (a.rel ? add(SC, a.rel) : null);
    if (target) {
      const pole = a.pole ?? [side * 0.5, 0.4, -1];
      const { joint, end } = ik(S, target, D.UA, D.LA, pole);
      return { S, E: joint, H: end };
    }
    const o = a.o ?? 0.1;
    const up = norm([side * Math.sin(o), Math.cos(a.a) * Math.cos(o), Math.sin(a.a) * Math.cos(o)]);
    const E = add(S, mul(up, D.UA));
    const a2 = a.a + (a.b ?? 0.2);
    const fore = norm([side * Math.sin(o) * 0.7, Math.cos(a2) * Math.cos(o), Math.sin(a2) * Math.cos(o)]);
    return { S, E, H: add(E, mul(fore, D.LA)) };
  });
  const HR = mm(rotX(lean * 0.5), mm(rotY(sp.headYaw ?? 0), mm(rotX(sp.headPitch ?? 0), rotZ(sp.headRoll ?? 0))));
  const HC = add(add(SC, mul(spine, 1.3 + D.hr * 0.95)), [0, breath * 0.2, 0.25]);
  return { D, sp, P0, spine, at, SC, lean, legs, arms, HC, HR, TR: rotX(lean), cloth: sp.cloth ?? { dz: 0, dx: 0, sway: 0 }, stride: sp.stride ?? 0 };
}

/* ---------- 그리기 ---------- */

/** 머리 틀 — 지역 좌표(머리 가운데 기준) → 몸 좌표 */
const headPt = (J, p) => add(J.HC, mv(J.HR, p));
/** 머리 표면 위의 점 — 지역 방향 u 로 뻗었을 때 닿는 자리 */
function headSurf(J, u, rr) {
  const n = norm(u);
  const t = 1 / Math.sqrt((n[0] / rr[0]) ** 2 + (n[1] / rr[1]) ** 2 + (n[2] / rr[2]) ** 2);
  return headPt(J, mul(n, t));
}

/**
 * 한 사람을 그린다. d: 생김새, J: 뼈대.
 * 몸통 · 팔다리 · 머리를 놓고, 옷 · 머리카락 · 쓰개 · 소지품을 그 위에 입힌다.
 */
function drawPerson(fig, d, J) {
  const D = J.D, { T, hr, tw } = D, bw = D.B.w;
  const skin = M[d.skin ?? 'skin'];
  const top = M[d.top ?? 'clothBrown'], sleeves = M[d.sleeves ?? d.top ?? 'clothBrown'];
  const legsM = M[d.legs ?? 'clothBrown'], boots = M[d.boots ?? 'timber'];
  const armor = d.armor ? M[d.armor] : 0;
  const hipY = J.P0[1];
  const beltY = [hipY - 3.5, hipY - 2.1];
  const TF = { o: J.P0, R: J.TR };

  /** 몸통 · 치마가 함께 쓰는 옷 무늬 — 몸 좌표의 점과 바깥 법선으로 고른다 */
  const clothAt = (pb, nb, base) => {
    const local = mv(R.tr(J.TR), sub(pb, J.P0));
    const front = nb[2] > 0.18, back = nb[2] < -0.18;
    if (d.belt && pb[1] > beltY[0] && pb[1] < beltY[1]) return nb[2] > 0.9 && Math.abs(local[0]) < 0.8 ? [M.gold, 0.2] : [M[d.belt], -0.08];
    if (d.tabard && (front || back) && Math.abs(local[0]) < tw * 0.56 && local[1] < 0.5) return M[d.tabard];
    if (d.apron && front && Math.abs(local[0]) < tw * 0.66 && local[1] > -T * 0.52) return [M[d.apron], 0.12];
    return base;
  };

  // ----- 다리 (긴 옷 안쪽은 그리지 않는다 — 옷자락을 뚫고 나오지 않게) -----
  const hemCut = d.long ? hipY + D.Lg * d.long - 0.4 : -1e9;
  J.legs.forEach((L, k) => {
    const g = k ? G.legR : G.legL;
    fig.cap(L.H, L.K, 2.4 * bw, 2.1 * bw, legsM, {
      g,
      paint: (p, n, ins, t) => (p[1] < hemCut ? null : d.thighBoot && t > 0.45 ? boots : legsM),
    });
    fig.cap(L.K, L.A, 2.05 * bw, 1.65 * bw, legsM, { g, paint: (p, n, ins, t) => (p[1] < hemCut ? null : d.bootHigh || t > 0.72 ? boots : legsM) });
    const tR = rotX(L.toe);
    const heel = add(L.A, [0, 0.3, -0.9]), toe = add(L.A, mv(tR, [0, 0.5, 2.8]));
    fig.cap(heel, toe, 1.55 * Math.min(1.2, bw), 1.3 * Math.min(1.2, bw), boots, { g, v: 0.44 });
  });

  // ----- 몸통 -----
  {
    const base = armor || top;
    const o = {
      F: TF, g: G.torso, v: armor ? 0.6 : 0.52, k: armor ? 0.62 : 0.5,
      paint: (pl, nl) => {
        const pb = add(J.P0, mv(J.TR, pl)), nb = mv(J.TR, nl);
        const c = clothAt(pb, nb, base);
        if (armor && c === base && Math.abs(pl[1] + T * 0.6) < 0.5) return [base, -0.2];
        return c;
      },
    };
    fig.ell([0, -T * 0.72, 0], [tw, T * 0.34, tw * 0.66], base, o);
    fig.ell([0, -T * 0.4, 0.12], [tw * 0.86, T * 0.3, tw * 0.6], base, o);
    fig.ell([0, -T * 0.1, 0], [tw * 0.94, T * 0.22, tw * 0.66], base, o);
    if (d.pouch) fig.ell([tw * 0.6, -1.4, tw * 0.5], [1.6, 1.9, 1.3], M.wood, { F: TF, g: G.item, v: 0.5 });
  }

  // ----- 긴 옷자락 (치마 · 로브 · 코트) -----
  if (d.long) {
    const hemY = hipY + D.Lg * d.long;
    const zL = J.legs[0].A[2], zR = J.legs[1].A[2];
    const topC = J.at(0.2);
    const flare = d.flare ?? 2.2;
    const bot = [J.P0[0] * 0.4 + J.cloth.dx * 0.4, hemY + 1.4, (zL + zR) * 0.5 + J.cloth.dz * 0.3];
    const sm = M[d.skirt ?? d.top ?? 'clothBrown'];
    const trim = d.trim ? M[d.trim] : 0;
    // 옷자락은 걸을 때 앞뒤로 벌어진 무릎을 품을 만큼 넓어진다
    const need = Math.max(...J.legs.map((L) => Math.hypot(L.K[0] - bot[0], L.K[2] - bot[2]) + 2.3 * bw));
    const rb = Math.max(tw * 0.95 + flare * 0.72, need * 1.05);
    fig.cap(topC, bot, tw * 1.03, rb, sm, {
      g: G.skirt, two: true, v: 0.5,
      paint: (pb, nb) => {
        if (pb[1] > hemY || pb[1] < topC[1]) return null;
        const c = clothAt(pb, nb, sm);
        if (c !== sm) return c;
        if (trim && pb[1] > hemY - 1.3) return [trim, 0.1];
        const ang = Math.atan2(pb[0] - J.P0[0], pb[2] - bot[2] * ((pb[1] - topC[1]) / (hemY - topC[1])));
        return Math.floor(ang * 2.2 + 20) % 2 && pb[1] > hipY + 2 ? [sm, -0.06] : sm;
      },
    });
  }

  // ----- 겉옷 앞뒤판 (제복) -----
  if (d.tabard) {
    const hem = D.Lg * 0.4;
    for (const z of [1, -1])
      fig.box([0, hem / 2 - 1, z * tw * 0.66], [tw * 0.5, hem / 2 + 1, 0.3], M[d.tabard], { F: TF, g: G.skirt, v: 0.56, paint: (pl) => (pl[1] > hem - 0.9 ? [M[d.tabard], -0.12] : M[d.tabard]) });
  }

  // ----- 팔 -----
  J.arms.forEach((A, k) => {
    const g = k ? G.armR : G.armL;
    const aw = d.armW ?? bw;
    fig.cap(A.S, A.E, 2.2 * aw, 1.9 * aw, sleeves, { g });
    const fore = d.bracer ? M[d.bracer] : d.bare ? skin : sleeves;
    fig.cap(A.E, A.H, 1.85 * aw, 1.5 * aw, fore, { g, v: d.bracer ? 0.56 : 0.5 });
    fig.ell(A.H, [1.45, 1.5, 1.45], d.gloves ? M[d.gloves] : skin, { g, v: 0.56 });
  });

  // ----- 어깨 (견갑 · 털깃 · 어깨망토 · 목도리) -----
  if (armor || d.pauldron) {
    const pm = d.pauldron ? M[d.pauldron] : armor;
    J.arms.forEach((A, k) => fig.ell(add(A.S, [(k ? -1 : 1) * 0.5, -0.5, 0]), [3, 2.3, 2.8], pm, { g: k ? G.armR : G.armL, v: 0.62, k: 0.6 }));
  }
  if (d.mantle) {
    const mm2 = M[d.mantle], hemY = J.SC[1] + T * (d.mantleLen ?? 0.46);
    fig.cap(add(J.SC, [0, -0.6, -0.3]), add(J.SC, [J.cloth.dx * 0.3, T * (d.mantleLen ?? 0.46) + 1.5, -0.6 + J.cloth.dz * 0.2]), tw + 1.0, tw + 2.5, mm2, {
      g: G.mantle, two: true, v: 0.56,
      paint: (pb) => (pb[1] > hemY || pb[1] < J.SC[1] - 1.4 ? null : pb[1] > hemY - 1 ? [mm2, -0.12] : mm2),
    });
  }
  if (d.fur) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      fig.ell(add(J.SC, [Math.cos(a) * tw * 0.72, 0.5, Math.sin(a) * tw * 0.6]), [2.3, 1.9, 2.1], M[d.fur], {
        g: G.mantle, v: 0.6, paint: (p) => (hash(Math.round(p[0] * 2), Math.round(p[1] * 2), i) < 0.25 ? [M[d.fur], -0.14] : M[d.fur]),
      });
    }
  }
  if (d.scarf) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      fig.ell(add(J.SC, [Math.cos(a) * 1.9, 0.1, Math.sin(a) * 1.6]), [1.5, 1.3, 1.5], M[d.scarf], { g: G.mantle, v: 0.56 });
    }
    fig.cap(add(J.SC, [tw * 0.35, 0.6, -1.6]), add(J.SC, [tw * 0.45 + J.cloth.dx * 0.3, 6.5, -2.4 + J.cloth.dz]), 1.2, 0.9, M[d.scarf], { g: G.mantle, v: 0.5 });
  }

  // ----- 망토 (등 뒤, 앞이 트여 있다) -----
  if (d.cloak) {
    const cm = M[d.cloak.m], len = d.cloak.len ?? 0.7, flare = d.cloak.flare ?? 0;
    const hemY = hipY + D.Lg * len;
    const a = add(J.SC, [0, 0.4, -tw * 0.45]);
    const b = [J.cloth.dx * 0.6 + J.P0[0] * 0.5, hemY + 2, -tw * 0.7 - 1.3 + J.cloth.dz * 1.1];
    fig.cap(a, b, tw + 0.7, tw + 2.2 + flare * 0.6 + J.stride * 0.1, cm, {
      g: G.cloak, two: true, v: 0.46,
      paint: (pb, nb, inside) => {
        if (pb[1] > hemY || pb[1] < J.SC[1] - 1.2) return null;
        if (!inside && nb[2] > 0.3 - (d.cloak.front ?? 0) * 0.1) return null;
        return pb[1] > hemY - 1 ? [cm, -0.1] : cm;
      },
    });
  }

  // ----- 등에 멘 것 -----
  const backZ = -tw * 0.7 - 1.0;
  if (d.back === 'sword') {
    const a = add(J.SC, [-tw * 0.75, -3.2, backZ - 0.4]), b = add(J.at(0.05), [tw * 1.1, 4, backZ - 0.8]);
    const F = { o: a, R: frameAlong(sub(b, a)) }, L = R.len(sub(b, a));
    fig.box([0, L / 2, 0], [0.95, L / 2, 0.45], M.timber, { F, g: G.back, v: 0.42 });
    fig.box([0, -0.4, 0], [2.0, 0.4, 0.6], M.gold, { F, g: G.back, v: 0.6 });
    fig.cap(a, add(a, mv(F.R, [0, -2.6, 0])), 0.6, 0.6, M.wood, { g: G.back });
  } else if (d.back === 'bow') {
    let prev = null;
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const p = add(J.SC, [tw * 0.15, -6 + t * (T + 9), backZ - 0.4 - Math.sin(Math.PI * t) * 3.2]);
      if (prev) fig.cap(prev, p, 0.6, 0.6, M.woodPale, { g: G.back, v: 0.6 });
      prev = p;
    }
    fig.seg(add(J.SC, [tw * 0.15, -6, backZ - 0.4]), add(J.SC, [tw * 0.15, T + 3, backZ - 0.4]), M.clothCream, 0.8, { g: G.back });
  } else if (d.back === 'pack') {
    fig.ell(add(J.at(0.62), [0, 0, backZ - 1.4]), [tw * 0.8, 4.4, 2.4], M.wood, { g: G.back, v: 0.5 });
  }

  // ----- 목 · 머리 -----
  const rr = [hr * 0.94, hr * 1.02, hr * 0.96];
  fig.cap(add(J.SC, [0, 0.6, 0]), headPt(J, [0, hr * 0.6, -0.4]), 1.5, 1.4, skin, { g: G.torso, v: 0.44 });
  const HF = { o: J.HC, R: J.HR };
  fig.ell([0, 0, 0], rr, skin, { F: HF, g: G.head, v: 0.58, k: 0.42 });
  const big = fig.s * hr;
  // 귀
  if (d.ears === 'elf') {
    for (const sd of [1, -1]) fig.cap(headPt(J, [sd * hr * 0.82, hr * 0.08, -0.4]), headPt(J, [sd * (hr + 1.5), -hr * 0.42, -1.6]), 0.85, 0.3, skin, { g: G.head, v: 0.6 });
  } else if (big > 3.4) {
    for (const sd of [1, -1]) fig.ell([sd * hr * 0.92, hr * 0.12, -0.3], [0.7, 1.2, 0.9], skin, { F: HF, g: G.head, v: 0.54 });
  }
  // 코
  if (big > 3.4) fig.ell([0, hr * 0.2, rr[2] * 0.96], [0.7, 0.8, 0.7], skin, { F: HF, g: G.head, v: 0.6 });
  // 수염
  if (d.beard) {
    const bm = M[d.beard.m], ln = d.beard.len ?? 0.5;
    fig.ell([0, hr * (0.72 + ln * 0.3), hr * 0.4], [hr * 0.72, hr * (0.3 + ln * 0.5), hr * 0.56], bm, {
      F: HF, g: G.hair, v: 0.56,
      paint: (p, n) => (n[2] < -0.2 ? null : (Math.round(p[0] * 1.5) + Math.round(p[1])) % 3 === 0 ? [bm, -0.08] : bm),
    });
  }

  // ----- 머리카락 -----
  const hairM = d.hair ? M[d.hair.m] : 0;
  const st = d.hair?.style;
  const faceZone = (n) => n[2] > 0.16 && n[1] > -0.42;
  if (hairM && !(d.hat === 'helm')) {
    const keep = st === 'bald'
      ? (n) => n[2] < 0.25 && n[1] > -0.15 && n[1] < 0.5
      : (n) => !faceZone(n) && n[1] < (n[2] < -0.1 ? 0.56 : 0.26);
    const hm = hairM;
    fig.ell([0, -0.2, -0.1], [rr[0] + 0.55, rr[1] + 0.5, rr[2] + 0.55], hm, {
      F: HF, g: G.hair, v: 0.52, k: 0.5,
      paint: (p, n) => (keep(n) ? (st !== 'bald' && n[1] < -0.6 && Math.round(p[0] * 1.3) % 3 === 0 ? [hm, 0.08] : hm) : null),
    });
    if (st === 'long' || st === 'wavy') {
      fig.ell([0, hr * 1.25, -hr * 0.6], [hr * 0.96, hr * 1.55, hr * 0.48], hm, {
        F: HF, g: G.hair, v: 0.5,
        paint: (p) => (st === 'wavy' && Math.sin(p[1] * 1.3 + p[0] * 0.5) > 0.4 ? [hm, 0.1] : hm),
      });
    }
    if (st === 'bun') fig.ell([0, -hr * 0.55, -hr * 1.0], [2.1, 2.1, 2.1], hm, { F: HF, g: G.hair, v: 0.5 });
    if (st === 'tail') fig.cap(headPt(J, [0, -hr * 0.1, -hr * 0.95]), add(headPt(J, [0, hr * 1.7, -hr * 1.4]), [J.cloth.dx * 0.2, 0, J.cloth.dz * 0.3]), 1.6, 0.9, hm, { g: G.hair, v: 0.5 });
  }

  // ----- 얼굴 -----
  const eyeM = d.eye ? M[d.eye] : M.hairBlack;
  for (const sd of [1, -1]) {
    const p = headSurf(J, [sd * 0.37, 0.06, 0.93], rr);
    if (d.face && big > 5) {
      // 주인공: 두 칸짜리 눈과 반짝임
      const up = headSurf(J, [sd * 0.37, -0.12, 0.92], rr);
      fig.dot(up, M.hairBlack, 0.06);
      fig.dot(p, eyeM, d.eye ? 0.36 : 0.06);
    } else fig.dot(p, M.hairBlack, 0.08);
    if (d.blush && big > 5) fig.dot(headSurf(J, [sd * 0.55, 0.34, 0.77], rr), M.clothRed, 0.72);
    if (d.tusk) fig.dot(headSurf(J, [sd * 0.3, 0.62, 0.72], rr), M.clothWhite, 0.86);
  }
  if (d.face && big > 5) fig.dot(headSurf(J, [0, 0.54, 0.84], rr), skin, 0.2);

  // ----- 쓰개 -----
  drawHat(fig, d, J, rr, HF);

  // ----- 손에 든 것 -----
  drawItem(fig, d, J);
}

function drawHat(fig, d, J, rr, HF) {
  const hr = J.D.hr;
  const hat = d.hat;
  const shell = (grow, m, keep, o = {}) =>
    fig.ell([0, -0.2, -0.05], [rr[0] + grow, rr[1] + grow, rr[2] + grow], m, { F: HF, g: G.hat, v: o.v ?? 0.56, k: o.k ?? 0.5, two: o.two, paint: keep });
  if (d.hood) {
    const hm = M[d.hood];
    shell(1.5, hm, (p, n, inside) => (!inside && n[2] > 0.32 && n[1] > -0.55 ? null : inside ? [hm, -0.12] : hm), { two: true, v: 0.46 });
    fig.cap(headPt(J, [0, hr * 0.5, -hr * 0.9]), add(J.SC, [0, 1.6, -J.D.tw * 0.6]), hr * 0.9, J.D.tw * 0.9, hm, { g: G.hat, v: 0.42 });
  }
  if (!hat) return;
  if (hat === 'santa') {
    // 산타 모자 — 빨간 고깔이 뒤로 처지고, 흰 털 띠와 방울
    const k = d.hatSmall ? 0.85 : 1;
    const red = M.clothRed, white = M.clothWhite;
    shell(0.8, red, (p, n) => (n[1] < -0.28 ? red : null), { v: 0.56 });
    const a = headPt(J, [0, -hr * 0.7, -0.2]), b = headPt(J, [hr * 0.25, -hr * 1.55 * k, -hr * 0.55]), c = headPt(J, [hr * 0.5, -hr * 1.2 * k, -hr * 1.5 * k]);
    fig.cap(a, b, hr * 0.92, hr * 0.42, red, { g: G.hat, v: 0.56 });
    fig.cap(b, c, hr * 0.42, 0.5, red, { g: G.hat, v: 0.5, min: 0.6 });
    fig.ell([0, -hr * 0.4, 0], [rr[0] + 1.0, hr * 0.2 + 0.55, rr[2] + 1.0], white, { F: HF, g: G.hat, v: 0.84, k: 0.35 });
    fig.ell(c, [1.4, 1.4, 1.4], white, { g: G.hat, v: 0.9, k: 0.3 });
    return;
  }
  if (hat === 'beanie') {
    const bm = M[d.hatM ?? 'clothRed'];
    shell(0.75, bm, (p, n) => (n[1] < -0.18 ? (n[1] > -0.36 ? [bm, -0.12] : (Math.round(p[0] * 1.6) % 2 ? [bm, 0.06] : bm)) : null), { v: 0.56 });
    fig.ell(headPt(J, [0, -(rr[1] + 1.4), -0.3]), [1.5, 1.4, 1.5], M.clothWhite, { g: G.hat, v: 0.86, k: 0.35 });
    return;
  }
  const hm = M[d.hatM ?? (hat === 'cap' ? 'clothBrown' : hat === 'pointed' ? 'clothPurple' : hat === 'bandana' ? 'clothRed' : 'clothWhite')];
  if (hat === 'cap') {
    shell(0.6, hm, (p, n) => (n[1] < -0.42 + n[2] * 0.12 ? hm : null));
    fig.ell([0, -hr * 0.46, hr * 0.78], [hr * 0.5, 0.5, hr * 0.38], hm, { F: HF, g: G.hat, v: 0.46 });
  } else if (hat === 'scarfHead') {
    shell(0.8, hm, (p, n) => (n[1] < -0.12 - 0.45 * n[2] && !(n[2] > 0.16 && n[1] > -0.5) ? hm : null), { v: 0.64 });
    fig.cap(headPt(J, [0, 0, -hr]), headPt(J, [0.6, hr * 1.5, -hr * 1.35]), 1.7, 1.2, hm, { g: G.hat, v: 0.6 });
  } else if (hat === 'chef') {
    shell(0.7, hm, (p, n) => (n[1] < -0.32 ? hm : null), { v: 0.74 });
    fig.ell([0, -hr * 1.4, 0], [hr * 1.02, hr * 0.78, hr * 1.02], hm, { F: HF, g: G.hat, v: 0.76, k: 0.4 });
  } else if (hat === 'pointed' || hat === 'wide') {
    const brim = hat === 'wide' ? hr + 4.8 : hr + 3.4;
    fig.ell([0, -hr * 0.48, 0], [brim, 0.65, brim], hm, { F: HF, g: G.hat, v: 0.52 });
    if (hat === 'pointed') {
      const tip = headPt(J, [0, -hr - 11, -2.8]);
      fig.cap(headPt(J, [0, -hr * 0.55, 0]), tip, hr * 1.0, 0.35, hm, { g: G.hat, v: 0.5, min: 0.6 });
      if (d.hatBand) fig.ell([0, -hr * 0.68, 0], [hr * 1.0, 0.7, hr * 1.0], M[d.hatBand], { F: HF, g: G.hat, v: 0.62 });
    } else {
      fig.ell([0, -hr * 0.78, 0], [hr * 0.96, hr * 0.55, hr * 0.96], hm, { F: HF, g: G.hat, v: 0.56 });
      if (d.hatBand) fig.ell([0, -hr * 0.6, 0], [hr * 0.98, 0.6, hr * 0.98], M[d.hatBand], { F: HF, g: G.hat, v: 0.5 });
    }
  } else if (hat === 'helm' || hat === 'kettle') {
    const sm = M.steel;
    if (hat === 'helm') {
      shell(0.9, sm, (p, n) => (n[1] > 0.74 ? null : n[2] > 0.5 && Math.abs(p[1] + 0.2) < 0.7 ? [M.iron, -0.3] : sm), { v: 0.62, k: 0.62 });
      const plume = M[d.plume ?? 'clothRed'];
      let prev = null;
      for (let i = 0; i <= 7; i++) {
        const a = -0.25 + i * 0.32, Rr = hr + 1.5 + Math.sin(i * 0.5) * 0.4;
        const p = headPt(J, [0, -Rr * Math.cos(a), -Rr * Math.sin(a)]);
        if (prev) fig.cap(prev, p, 1.35 - i * 0.07, 1.3 - i * 0.07, plume, { g: G.hat, v: 0.56 });
        prev = p;
      }
    } else {
      shell(0.9, sm, (p, n) => (n[1] < -0.06 ? sm : null), { v: 0.6, k: 0.6 });
      fig.ell([0, -hr * 0.12, 0], [hr + 1.1, 0.55, hr + 1.1], sm, { F: HF, g: G.hat, v: 0.54, k: 0.6 });
    }
  } else if (hat === 'bandana') {
    shell(0.6, hm, (p, n) => (n[1] < -0.2 && !(n[2] > 0.5 && n[1] > -0.45) ? (n[1] > -0.32 ? [hm, -0.08] : hm) : null));
    fig.cap(headPt(J, [0, -hr * 0.25, -hr]), headPt(J, [-1, hr * 0.9, -hr * 1.6]), 1.0, 0.8, hm, { g: G.hat, v: 0.5 });
  } else if (hat === 'veil') {
    const wm = M.clothWhite;
    shell(0.7, wm, (p, n) => (n[2] < 0.22 || n[1] < -0.55 ? wm : null), { v: 0.74 });
    fig.ell([0, hr * 1.7, -hr * 0.72], [hr * 1.02, hr * 1.9, hr * 0.42], wm, { F: HF, g: G.hat, v: 0.72 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      fig.dot(headSurf(J, [Math.cos(a), -0.62, Math.sin(a)], [rr[0] + 0.7, rr[1] + 0.7, rr[2] + 0.7]), M.gold, 0.74, { eps: 1.6 });
    }
  }
}

function drawItem(fig, d, J) {
  const A = J.arms[1], h = A.H;
  const it = d.item;
  if (!it) return;
  const ground = 0;
  if (it === 'staff' || it === 'spear' || it === 'broom') {
    const topY = h[1] - (it === 'spear' ? 24 : it === 'staff' ? 15 : 9);
    const botY = Math.min(ground - 0.4, h[1] + 14);
    const b = [h[0] + 0.2, it === 'broom' ? ground - 3.2 : botY, h[2]], t = [h[0] + 0.2, topY, h[2]];
    fig.cap(b, t, 0.55, 0.55, M.woodPale, { g: G.item, v: 0.62, min: 0.55 });
    if (it === 'spear') {
      fig.cap(t, add(t, [0, -4.5, 0]), 1.2, 0.2, M.steel, { g: G.item, v: 0.74, k: 0.6, min: 0.5 });
      fig.ell(add(t, [0, 1.2, 0]), [1.1, 0.9, 1.1], M.clothRed, { g: G.item, v: 0.56 });
    } else if (it === 'staff') {
      fig.ell(add(t, [0, -1.3, 0]), [1.7, 1.7, 1.7], d.orb ? M[d.orb] : M.woodPale, { g: G.item, v: 0.7 });
    } else {
      fig.ell([b[0], ground - 1.7, b[2] + 0.4], [2.3, 2.1, 1.5], M.hay, { g: G.item, v: 0.56, paint: (p) => (Math.round(p[0] * 2) % 2 ? [M.hay, 0.1] : M.hay) });
    }
    fig.ell(h, [1.5, 1.5, 1.5], M[d.skin ?? 'skin'], { g: G.armR, v: 0.58 });
  } else if (it === 'basket') {
    const c = add(h, [0, 2.6, 0.5]);
    fig.ell(c, [3.2, 2.2, 2.6], M.hay, { g: G.item, v: 0.56, paint: (p) => (p[1] < c[1] - 1.2 ? null : (Math.round(p[0] * 1.5) + Math.round(p[1] * 1.5)) % 2 ? [M.hay, 0.1] : M.hay) });
    [M.clothRed, M.leafGreen, M.leafGold, M.clothPurple].forEach((m, i) => fig.ell(add(c, [-1.8 + i * 1.2, -1.2, (i % 2) * 0.8 - 0.4]), [0.9, 0.9, 0.9], m, { g: G.item, v: 0.6 }));
  } else if (it === 'gift') {
    // 선물 상자 — 빨간 포장에 금빛 리본
    const c = add(h, [0, -0.8, 1.7]);
    fig.box(c, [2.4, 2.2, 2.2], M.clothRed, {
      g: G.item, v: 0.58,
      paint: (p) => (Math.abs(p[0] - c[0]) < 0.5 || Math.abs(p[2] - c[2]) < 0.5 ? [M.gold, 0.12] : M.clothRed),
    });
    fig.ell(add(c, [0, -2.6, 0]), [1.3, 0.8, 1.0], M.gold, { g: G.item, v: 0.7 });
  } else if (it === 'mug') {
    fig.box(add(h, [0, -1.2, 0.7]), [1.3, 1.7, 1.3], M.woodPale, { g: G.item, v: 0.58 });
    fig.ell(add(h, [0, -3.0, 0.7]), [1.2, 0.5, 1.2], M.clothWhite, { g: G.item, v: 0.86 });
  } else if (it === 'axe' || it === 'hammer') {
    const butt = add(h, [0, 3, 1.4]), head = add(J.arms[1].S, [-0.4, -8, -4.4]);
    fig.cap(butt, head, 0.6, 0.6, M.woodPale, { g: G.item, v: 0.58, min: 0.55 });
    const F = { o: head, R: frameAlong(sub(head, butt)) };
    if (it === 'axe') fig.box([0, -0.6, 1.8], [0.45, 1.8, 2.0], M.steel, { F, g: G.item, v: 0.72, k: 0.6 });
    else fig.box([0, -0.4, 0], [1.9, 1.4, 1.6], M.steel, { F, g: G.item, v: 0.7, k: 0.6 });
  }
}

/* ---------- 생김새 ---------- */

const DESIGNS = {
  peasant: { top: 'clothBrown', legs: 'clothGray', boots: 'timber', belt: 'timber', hair: { m: 'hairBrown', style: 'short' }, hat: 'cap', hatM: 'clothGreen', pouch: true },
  farmer: { top: 'clothGreen', legs: 'clothBrown', boots: 'timber', belt: 'timber', hair: { m: 'hairBlond', style: 'short' }, hat: 'wide', hatM: 'hay', item: 'broom', bare: true },
  woman: { top: 'clothTeal', skirt: 'clothTeal', long: 0.88, apron: 'clothCream', boots: 'timber', hair: { m: 'hairRed', style: 'bun' }, hat: 'scarfHead', hatM: 'clothWhite', item: 'basket' },
  maid: { top: 'clothRed', skirt: 'clothBrown', long: 0.82, apron: 'clothWhite', boots: 'timber', hair: { m: 'hairBrown', style: 'tail' }, belt: 'timber' },
  hooded: { top: 'clothBlack', skirt: 'clothBlack', long: 0.92, hood: 'clothBlack', cloak: { m: 'clothBlack', len: 0.86 }, boots: 'iron', skin: 'skinTan', belt: 'timber', pouch: true },
  merchant: { top: 'clothGold', skirt: 'clothBrown', long: 0.86, fur: 'hairGray', boots: 'timber', belt: 'clothTeal', pouch: true, beard: { m: 'hairBlack', len: 0.3 }, hair: { m: 'hairBlack', style: 'short' }, hat: 'cap', hatM: 'clothRed', build: { w: 1.2 }, trim: 'gold' },
  elder: { top: 'clothGray', skirt: 'clothGray', long: 0.96, boots: 'timber', beard: { m: 'hairGray', len: 0.9 }, hair: { m: 'hairGray', style: 'long' }, item: 'staff', belt: 'clothBrown', cloak: { m: 'clothBlue', len: 0.82 } },
  guard: { top: 'steel', sleeves: 'steel', legs: 'steel', boots: 'iron', bootHigh: true, armor: 'steel', tabard: 'clothBlue', hat: 'helm', plume: 'clothRed', item: 'spear', gloves: 'steel', belt: 'timber' },
  mercenary: { top: 'wood', sleeves: 'clothCream', legs: 'clothBrown', boots: 'timber', bootHigh: true, belt: 'timber', hair: { m: 'hairBlack', style: 'short' }, hat: 'bandana', hatM: 'clothRed', back: 'sword', scarf: 'clothRed', skin: 'skinTan', beard: { m: 'hairBlack', len: 0.1 } },
  orc: { skin: 'skinOrc', top: 'clothBrown', sleeves: 'skinOrc', bare: true, legs: 'timber', boots: 'iron', fur: 'hairBrown', belt: 'iron', tusk: true, hair: { m: 'hairBlack', style: 'tail' }, item: 'axe', build: { h: 1.08, w: 1.45, head: 1.1 } },
  elf: { top: 'clothGreen', legs: 'clothBrown', boots: 'wood', bootHigh: true, cloak: { m: 'clothGreen', len: 0.72 }, hair: { m: 'hairBlond', style: 'long' }, ears: 'elf', back: 'bow', belt: 'gold', build: { h: 1.05, w: 0.86, head: 0.94 } },
  dwarf: { top: 'clothRed', legs: 'clothBrown', boots: 'iron', beard: { m: 'hairRed', len: 1.3 }, hair: { m: 'hairRed', style: 'short' }, hat: 'kettle', item: 'hammer', belt: 'timber', build: { h: 0.76, w: 1.45, leg: 0.74, head: 1.28 } },
  noble: { top: 'clothRed', skirt: 'clothRed', long: 1.0, flare: 4, trim: 'gold', hat: 'veil', hair: { m: 'hairBlond', style: 'long' }, belt: 'gold', build: { w: 0.92 } },
  monk: { top: 'clothBrown', skirt: 'clothBrown', long: 0.98, boots: 'timber', hair: { m: 'hairBrown', style: 'bald' }, belt: 'clothCream', scarf: 'clothBrown' },
  witch: { top: 'clothPurple', skirt: 'clothPurple', long: 0.92, hat: 'pointed', hatM: 'clothPurple', hatBand: 'gold', hair: { m: 'hairGray', style: 'long' }, item: 'staff', orb: 'water', cloak: { m: 'clothBlack', len: 0.72 }, build: { h: 0.92 } },
  baker: { top: 'clothWhite', legs: 'clothGray', boots: 'timber', apron: 'clothWhite', hat: 'chef', hair: { m: 'hairBrown', style: 'short' }, beard: { m: 'hairBrown', len: 0.2 }, build: { w: 1.22 }, item: 'mug' },
};

/* ---------- 프레임 ---------- */

/** 거리(화면 y)에 따른 크기 단계 — 뒤(윗마당)는 작게, 앞은 크게 */
const SCALES = [0.62, 0.7, 0.78, 0.88, 1.0];
const scaleAtY = (y) => Math.min(1, Math.max(0.62, 0.62 + ((y - 312) * 0.38) / 208));
const bucketAtY = (y) => {
  const s = scaleAtY(y);
  let best = 0;
  SCALES.forEach((v, i) => {
    if (Math.abs(v - s) < Math.abs(SCALES[best] - s)) best = i;
  });
  return best;
};

/** 프레임 이름 — 걷기 w0~w7, 서기 i0 · i1, 손짓 t0 · t1 */
const ANIMS = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'i0', 'i1', 't0', 't1'];

function specFor(D, d, anim, s) {
  if (anim[0] === 'w') return walkSpec(D, d, Number(anim.slice(1)) / 8);
  if (anim[0] === 'i') return standSpec(D, d, Number(anim.slice(1)), s);
  return talkSpec(D, d, Number(anim.slice(1)), s);
}

/**
 * 한 장 그리기 — 발밑이 (ax, ay) 에 오는 Buf 와 기준점들.
 * spec 대신 함수(D → spec)를 넘기면 주인공처럼 자세를 직접 정할 수 있다.
 */
function render(d, s, dir, spec, o = {}) {
  const D = dims(d);
  const w = Math.ceil(64 * s) + 16, h = Math.ceil(88 * s) + 12;
  const ax = Math.floor(w / 2), ay = h - 5;
  const fig = new Fig(w, h, ax, ay, s, typeof dir === 'number' ? dir : DIRS[dir]);
  const sp = typeof spec === 'function' ? spec(D) : spec;
  const J = skeleton(D, sp);
  drawPerson(fig, d, J);
  if (d.hooks?.after) d.hooks.after(fig, J, d);
  if (o.extra) o.extra(fig, J);
  fig.contour();
  fig.outline();
  return { buf: fig.resolve(), ax, ay, anchors: fig.anchors, J, fig };
}

/** 마을 사람 한 장 */
function frame(kind, bucket, dir, anim, design) {
  const d = design ?? DESIGNS[kind], s = SCALES[bucket];
  const D = dims(d);
  return render(d, s, dir, specFor(D, d, anim, s));
}

module.exports = {
  DESIGNS, DIRS, DIR_NAMES, ANIMS, SCALES, STEP, CYCLE, G,
  scaleAtY, bucketAtY, dims, walkSpec, standSpec, talkSpec, standHip, skeleton, drawPerson, render, frame, headPt, headSurf,
};
