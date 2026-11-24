// 마을 사람 — 몸을 부위(다리 · 몸통 · 팔 · 머리 · 옷 · 소지품)로 나눠 자세마다 다시 그린다.
// 그래서 걷는 4프레임과 말하는 2프레임이 같은 사람으로 이어지고, 멀리 선 사람은
// 같은 그림을 작은 배율로 다시 그려(줄인 게 아니라) 픽셀이 뭉개지지 않는다.
// 모두 오른쪽을 보고 서 있다 — 왼쪽으로 갈 때는 화면에서 뒤집는다.
const { P, M, Mat, clamp, hash } = require('./kit');

const LX = -0.6, LY = -0.8;

/** 굵기가 변하는 둥근 막대(팔다리 · 몸통). 왼쪽 위가 밝다 */
function cap(mt, x0, y0, x1, y1, r0, r1, m, base, o = {}) {
  const dx = x1 - x0, dy = y1 - y0, len2 = dx * dx + dy * dy || 1e-6;
  const R = Math.max(r0, r1) + 1;
  for (let y = Math.floor(Math.min(y0, y1) - R); y <= Math.ceil(Math.max(y0, y1) + R); y++)
    for (let x = Math.floor(Math.min(x0, x1) - R); x <= Math.ceil(Math.max(x0, x1) + R); x++) {
      const px = x + 0.5, py = y + 0.5;
      const t = clamp(((px - x0) * dx + (py - y0) * dy) / len2);
      const cx = x0 + dx * t, cy = y0 + dy * t, r = r0 + (r1 - r0) * t;
      const ox = px - cx, oy = py - cy, d = Math.hypot(ox, oy);
      if (d > r) continue;
      let v = base + ((ox * LX + oy * LY) / Math.max(r, 1)) * (o.round ?? 0.17);
      if (o.rim && d > r - 1 && mt.at(x, y)) v -= o.rim;
      mt.put(x, y, m, v);
    }
}

/** 걷기 4프레임 + 서서 말하기 2프레임의 관절 각도 (0 = 곧게 아래, + = 앞으로) */
const POSES = {
  walk: [
    { a: [0.52, 0.34], b: [-0.42, -0.86], armA: [-0.5, -0.2], armB: [0.5, 0.86], bob: 0 },
    { a: [0.06, 0.0], b: [0.3, -0.84], armA: [-0.1, 0.16], armB: [0.12, 0.4], bob: -1 },
    { a: [-0.42, -0.86], b: [0.52, 0.34], armA: [0.5, 0.86], armB: [-0.5, -0.2], bob: 0 },
    { a: [0.3, -0.84], b: [0.06, 0.0], armA: [0.12, 0.4], armB: [-0.1, 0.16], bob: -1 },
  ],
  idle: [
    { a: [0.07, 0.03], b: [-0.07, -0.05], armA: [0.06, 0.2], armB: [-0.04, 0.12], bob: 0 },
    { a: [0.07, 0.03], b: [-0.07, -0.05], armA: [0.7, 2.0], armB: [-0.04, 0.12], bob: 0, nod: 1 },
  ],
};

/**
 * 사람 한 명을 그린다. (ox, oy) 는 두 발 사이의 바닥, s 는 배율.
 * d: 생김새와 옷차림, pose: 관절 각도.
 */
function figure(mt, ox, oy, s, d, pose) {
  const B = { h: 1, w: 1, leg: 1, head: 1, ...(d.build ?? {}) };
  const Lg = 18 * B.h * B.leg, T = 15 * B.h, hr = 4.5 * B.head, tw = 4.1 * B.w;
  const U = Lg / 2, Lo = Lg / 2;
  const P2 = (x, y) => [ox + x * s, oy + y * s];
  const R = (r) => Math.max(0.75, r * s);
  const skin = M[d.skin ?? 'skin'];
  const top = M[d.top ?? 'clothBrown'], sleeves = M[d.sleeves ?? d.top ?? 'clothBrown'];
  const legsM = M[d.legs ?? 'clothBrown'], boots = M[d.boots ?? 'timber'];
  const long = d.long ?? 0; // 0 = 바지가 보인다, 1 = 발목까지 덮는 옷

  // 다리 끝 위치를 먼저 구해 몸 높이를 맞춘다 (낮은 발이 바닥에 닿게)
  const leg = ([th, sh]) => {
    const kx = Math.sin(th) * U, ky = Math.cos(th) * U;
    return { kx, ky, fx: kx + Math.sin(sh) * Lo, fy: ky + Math.cos(sh) * Lo };
  };
  const la = leg(pose.a), lb = leg(pose.b);
  const hipY = -Math.max(la.fy, lb.fy) + (pose.bob ?? 0) * 0.6;
  const shY = hipY - T;
  const hx = 0.8, hy = shY - 1.6 - hr + (pose.nod ? 0.5 : 0);
  const stride = Math.abs(la.fx - lb.fx);
  const item = d.item;
  const fixedArm = pose.free ? null : item === 'staff' || item === 'spear' ? [0.5, 1.5] : item === 'basket' ? [0.1, 0.5] : item === 'axe' || item === 'hammer' ? [0.3, 1.2] : null;
  const angA = fixedArm && pose !== POSES.idle[1] ? fixedArm : pose.armA;
  const UA = 7 * B.h, LA = 6.6 * B.h;
  const armPts = (ang, front) => {
    const sx = front ? 0.8 : -0.8;
    const ex = sx + Math.sin(ang[0]) * UA, ey = shY + 2.2 + Math.cos(ang[0]) * UA;
    return { sx, sy: shY + 2.2, ex, ey, hx: ex + Math.sin(ang[1]) * LA, hy: ey + Math.cos(ang[1]) * LA };
  };
  const aA = armPts(angA, true), aB = armPts(pose.armB, false);
  const hooks = d.hooks ?? {};
  /** 훅(생김새마다 덧그리는 부분)에 넘기는 몸의 치수 — 단위는 배율 전의 "몸 좌표" */
  const J = { s, P2, R, ox, oy, tw, hipY, shY, T, Lg, hr, hx, hy, aA, aB, la, lb, stride, pose, skin };

  // --- 망토 (몸 뒤) ---
  if (d.cloak) {
    const cm = M[d.cloak.m], hem = hipY + Lg * (d.cloak.len ?? 0.7), sway = stride * 0.25;
    const pts = [P2(-tw - 0.6, shY + 0.6), P2(tw * 0.5, shY + 0.2), P2(tw * 0.2 + (d.cloak.front ?? 0), hem), P2(-tw - 2.4 - sway - (d.cloak.flare ?? 0), hem)];
    mt.poly(pts, cm, (x, y) => 0.44 - ((x - ox) / (tw * s)) * 0.1 + ((x + y) % 5 === 0 ? -0.06 : 0));
  }
  // --- 뒤에 멘 것 ---
  if (d.back === 'bow') {
    for (let t = 0; t <= 1; t += 0.03) {
      const [bx, by] = P2(-tw - 1.5 - Math.sin(t * Math.PI) * 4, shY - 5 + t * (T + 9));
      mt.put(bx, by, M.woodPale, 0.6);
    }
    const [b0x, b0y] = P2(-tw - 1.5, shY - 5), [b1x, b1y] = P2(-tw - 1.5, shY + T + 4);
    mt.line(b0x, b0y, b1x, b1y, M.clothCream, 0.7);
  } else if (d.back === 'sword') {
    const [s0x, s0y] = P2(tw * 0.4, shY - 3), [s1x, s1y] = P2(-tw - 6, hipY + 5);
    mt.beam(s0x, s0y, s1x, s1y, Math.max(1.4, 1.8 * s), M.timber, 0.4, 0.1);
    const [gx, gy] = P2(tw * 0.5, shY - 3.6);
    mt.put(gx, gy, M.gold, 0.7);
    mt.put(gx + 1, gy - 1, M.gold, 0.6);
  } else if (d.back === 'pack') {
    const [bx, by] = P2(-tw - 1.6, shY + T * 0.45);
    mt.disc(bx, by, R(3.4), R(4.6), M.wood, (x, y, dx, dy) => 0.5 - dx * 0.16 - dy * 0.2);
  }

  const drawLeg = (L, dark, front) => {
    const [h0x, h0y] = P2(front ? 0.6 : -0.6, hipY), [kx, ky] = P2(L.kx + (front ? 0.6 : -0.6), hipY + L.ky), [fx, fy] = P2(L.fx + (front ? 0.6 : -0.6), hipY + L.fy);
    cap(mt, h0x, h0y, kx, ky, R(2.5 * B.w), R(2.1 * B.w), legsM, 0.5 - dark);
    if (d.thighBoot) cap(mt, (h0x + kx) / 2, (h0y + ky) / 2, kx, ky, R(2.5 * B.w), R(2.3 * B.w), boots, 0.48 - dark);
    cap(mt, kx, ky, fx, fy - R(1.2), R(2.0 * B.w), R(1.6 * B.w), d.bootHigh ? boots : legsM, (d.bootHigh ? 0.44 : 0.5) - dark);
    // 신
    cap(mt, fx - R(0.6), fy - R(1.3), fx + R(2.6), fy - R(1.1), R(1.5), R(1.3), boots, 0.42 - dark, { round: 0.12 });
  };
  const drawArm = (ap, dark, front, hold) => {
    const [s0x, s0y] = P2(ap.sx, ap.sy);
    const hx2 = ap.hx, hy2 = ap.hy;
    const [e1x, e1y] = P2(ap.ex, ap.ey), [h1x, h1y] = P2(hx2, hy2);
    const aw = d.armW ?? B.w;
    cap(mt, s0x, s0y, e1x, e1y, R(2.2 * aw), R(1.9 * aw), sleeves, 0.52 - dark, { rim: front ? 0.16 : 0 });
    cap(mt, e1x, e1y, h1x, h1y, R(1.8 * aw), R(1.5 * aw), d.bracer ? M[d.bracer] : d.bare ? skin : sleeves, (d.bracer ? 0.56 : 0.5) - dark, { rim: front ? 0.16 : 0 });
    mt.disc(h1x, h1y, R(1.5), R(1.5), d.gloves ? M[d.gloves] : skin, 0.6 - dark);
    if (hold) hold(hx2, hy2);
  };

  if (hooks.back) hooks.back(mt, J);
  // --- 뒤 팔 · 뒤 다리 ---
  drawArm(aB, 0.14, false);
  drawLeg(lb, 0.12, false);
  drawLeg(la, 0, true);

  // --- 몸통 ---
  const armor = d.armor ? M[d.armor] : 0;
  {
    const [t0x, t0y] = P2(0, shY + tw * 0.55), [t1x, t1y] = P2(0, hipY - 0.5);
    cap(mt, t0x, t0y, t1x, t1y, R(tw), R(tw * 0.92), armor || top, armor ? 0.6 : 0.52, { round: armor ? 0.26 : 0.17 });
    if (armor) {
      // 흉갑의 빛과 이음매
      const [cx2, cy2] = P2(-tw * 0.3, shY + T * 0.3);
      mt.add(cx2, cy2, 0.2);
      mt.add(cx2 + 1, cy2, 0.14);
      const [bx, by] = P2(0, shY + T * 0.62);
      for (let x = Math.round(bx - R(tw)); x < bx + R(tw); x++) mt.add(x, Math.round(by), -0.2);
    }
  }
  // 긴 옷자락 (치마 · 로브 · 코트)
  if (long > 0) {
    const hem = hipY + Lg * long, flare = (d.flare ?? 2.2) + stride * 0.35;
    const pts = [P2(-tw, hipY - 3.5), P2(tw, hipY - 3.5), P2(tw + flare * 0.6 + (la.fx > 0 ? la.fx * 0.35 : 0), hem), P2(-tw - flare + (lb.fx < 0 ? lb.fx * 0.35 : 0), hem)];
    const sm = M[d.skirt ?? d.top ?? 'clothBrown'];
    mt.poly(pts, sm, (x, y) => {
      const u = (x - ox) / ((tw + flare) * s);
      const fold = Math.round(x - ox) % Math.max(2, Math.round(3 * s)) === 0 && y > oy + (hipY + 2) * s;
      return 0.5 - u * 0.16 - (fold ? 0.1 : 0) - (y > oy + (hem - 1.4) * s ? 0.12 : 0);
    });
    if (d.trim) {
      const [hx0, hy0] = P2(-tw - flare, hem - 1);
      for (let x = Math.round(hx0); x < ox + (tw + flare) * s; x++) if (mt.at(x, Math.round(hy0)) === sm) mt.put(x, Math.round(hy0), M[d.trim], 0.62);
    }
  }
  // 겉옷 앞판 (제복 · 휘장)
  if (d.tabard) {
    const hem = hipY + Lg * 0.42;
    mt.poly([P2(-tw * 0.55, shY + 1.5), P2(tw * 0.75, shY + 1.5), P2(tw * 0.85, hem), P2(-tw * 0.6, hem)], M[d.tabard], (x, y) => 0.56 - ((x - ox) / (tw * s)) * 0.14 - (y > oy + (hem - 1.3) * s ? 0.14 : 0));
    const [ex, ey] = P2(0.2, shY + T * 0.45);
    mt.put(ex, ey, M.gold, 0.74);
    mt.put(ex, ey + 1, M.gold, 0.62);
  }
  // 앞치마
  if (d.apron) {
    const hem = hipY + Lg * Math.max(0.5, long - 0.14);
    mt.poly([P2(-tw * 0.3, shY + T * 0.5), P2(tw + 0.6, shY + T * 0.5), P2(tw + 1.6, hem), P2(-tw * 0.5, hem)], M[d.apron], (x, y) => 0.7 - ((x - ox) / (tw * s)) * 0.1 - ((y - oy) % 4 === 0 ? 0.04 : 0));
  }
  // 허리띠
  if (d.belt) {
    const [bx, by] = P2(0, hipY - 3.2);
    for (let x = Math.round(bx - R(tw) - 1); x <= bx + R(tw) + 1; x++)
      for (let k = 0; k < Math.max(1, Math.round(1.6 * s)); k++) if (mt.at(x, Math.round(by) + k)) mt.put(x, Math.round(by) + k, M[d.belt], 0.36 + (k === 0 ? 0.1 : 0));
    const [gx, gy] = P2(tw * 0.5, hipY - 3.2);
    mt.put(gx, gy, M.gold, 0.74);
    if (d.pouch) {
      const [px, py] = P2(tw * 0.2, hipY - 0.6);
      mt.disc(px, py, R(1.8), R(2.1), M.wood, 0.5);
    }
  }
  // 어깨 (갑옷 견갑 · 털깃)
  if (armor) {
    const [px, py] = P2(0.6, shY + 1.8);
    mt.disc(px, py, R(3.1), R(2.4), armor, (x, y, dx, dy) => 0.66 - dx * 0.2 - dy * 0.28);
  }
  if (d.pauldron) {
    const [px, py] = P2(0.4, shY + 1.6);
    mt.disc(px, py, R(3.3), R(2.5), M[d.pauldron], (x, y, dx, dy) => 0.68 - dx * 0.22 - dy * 0.3);
    for (let x = Math.round(px - R(3)); x <= px + R(3); x++) mt.add(x, Math.round(py + R(2.4)), -0.2);
  }
  if (d.mantle) {
    const mm = M[d.mantle], hemY = shY + T * (d.mantleLen ?? 0.46);
    mt.poly([P2(-tw - 1.4, shY + 0.4), P2(tw + 1.2, shY + 0.4), P2(tw + 2.4, hemY), P2(-tw - 2.8, hemY)], mm, (x, y) => 0.58 - ((x - ox) / (tw * s)) * 0.14 - (y > oy + (hemY - 1.3) * s ? 0.14 : 0) - (Math.round(x - ox) % Math.max(3, Math.round(4 * s)) === 0 ? 0.06 : 0));
  }
  if (d.fur) {
    for (const fx of [-tw * 0.7, 0, tw * 0.7]) {
      const [px, py] = P2(fx, shY + 1.2);
      mt.disc(px, py, R(2.6), R(2.1), M[d.fur], (x, y, dx, dy) => 0.62 - dx * 0.14 - dy * 0.22 - (hash(x, y, 3) < 0.25 ? 0.14 : 0));
    }
  }
  // 목도리
  if (d.scarf) {
    const [px, py] = P2(0.3, shY + 0.4);
    for (let x = Math.round(px - R(tw * 0.8)); x <= px + R(tw * 0.8); x++) for (let k = 0; k < Math.max(1, Math.round(1.8 * s)); k++) mt.put(x, Math.round(py) + k, M[d.scarf], 0.56 - k * 0.1);
    const [tx, ty] = P2(-tw * 0.8, shY + 2);
    cap(mt, tx, ty, tx - R(1.5), ty + R(5), R(1.1), R(0.9), M[d.scarf], 0.46);
  }

  if (hooks.body) hooks.body(mt, J);

  // --- 머리 ---
  const [hcx, hcy] = P2(hx, hy);
  const hR = R(hr);
  J.hcx = hcx;
  J.hcy = hcy;
  J.hR = hR;
  {
    const [n0x, n0y] = P2(0.4, shY + 0.4);
    cap(mt, n0x, n0y, hcx - R(0.3), hcy + hR * 0.6, R(1.5), R(1.5), skin, 0.44);
  }
  if (d.hood) mt.disc(hcx - R(1), hcy - R(0.2), hR + R(1.7), hR + R(1.6), M[d.hood], (x, y, dx, dy) => 0.46 - dx * 0.18 - dy * 0.22);
  const hairM = d.hair ? M[d.hair.m] : 0;
  if (hairM && d.hair.style === 'long') cap(mt, hcx - hR * 0.5, hcy, hcx - hR * 0.9, hcy + hR * 2.4, R(2.3), R(1.6), hairM, 0.46);
  if (hairM && d.hair.style === 'wavy') {
    for (let t = 0; t <= 1; t += 0.08) {
      const wy = hcy + hR * (0.1 + t * 3.1), wx = hcx - hR * (0.7 + t * 0.5) + Math.sin(t * 7) * R(1.1);
      mt.disc(wx, wy, R(3.1 - t * 1.1), R(2.4), hairM, (x, y, dx, dy) => 0.5 - dx * 0.14 - dy * 0.2 + (Math.sin(t * 9) > 0 ? 0.08 : -0.04));
    }
  }
  if (d.hat === 'veil') cap(mt, hcx - hR * 0.5, hcy, hcx - hR * 1.1, hcy + hR * 3, R(2.6), R(2.2), M.clothWhite, 0.74);
  mt.disc(hcx, hcy, hR, hR * 1.04, skin, (x, y, dx, dy) => 0.6 - dx * 0.1 - dy * 0.16);
  // 머리카락
  if (hairM) {
    const st = d.hair.style;
    for (let y = Math.floor(hcy - hR - 1); y <= hcy + hR + 1; y++)
      for (let x = Math.floor(hcx - hR - 1); x <= hcx + hR + 1; x++) {
        const dx = (x + 0.5 - hcx) / hR, dy = (y + 0.5 - hcy) / (hR * 1.04);
        if (dx * dx + dy * dy > 1.0) continue;
        const onTop = st === 'bald' ? false : dy < -0.28 - dx * 0.22;
        const onBack = dx < (st === 'bald' ? -0.5 : -0.3) && dy < 0.62 && (st !== 'bald' || dy > -0.2);
        if (onTop || onBack) mt.put(x, y, hairM, 0.52 - dx * 0.14 - dy * 0.2);
      }
    if (st === 'bun') mt.disc(hcx - hR * 0.95, hcy - hR * 0.55, R(2), R(2), hairM, 0.5);
    if (st === 'tail') cap(mt, hcx - hR * 0.9, hcy - hR * 0.1, hcx - hR * 1.5, hcy + hR * 1.5, R(1.5), R(0.9), hairM, 0.48);
  }
  if (d.ears === 'elf') {
    mt.put(hcx - hR * 0.25, hcy - hR * 0.05, skin, 0.5);
    mt.put(hcx - hR * 0.55, hcy - hR * 0.35, skin, 0.62);
    if (s > 0.7) mt.put(hcx - hR * 0.85, hcy - hR * 0.6, skin, 0.66);
  }
  // 눈 · 코
  mt.put(hcx + hR * 0.48, hcy - hR * 0.02, M.hairBlack, 0.1);
  if (s > 0.85) {
    mt.put(hcx + hR * 0.48, hcy - hR * 0.36, hairM || M.hairBrown, 0.3);
    mt.put(hcx + hR + 0.2, hcy + hR * 0.2, skin, 0.5);
  }
  if (d.face && s > 1.1) {
    const ex = Math.round(hcx + hR * 0.46), ey = Math.round(hcy - hR * 0.02);
    mt.put(ex, ey - 1, M.hairBlack, 0.12);
    mt.put(ex, ey, d.eye ? M[d.eye] : M.hairBlack, d.eye ? 0.5 : 0.12);
    mt.put(ex - 1, ey - 1, M.clothWhite, 0.9);
    mt.put(Math.round(hcx + hR * 0.5), Math.round(hcy + hR * 0.56), skin, 0.24);
    mt.put(Math.round(hcx + hR * 0.5) - 1, Math.round(hcy + hR * 0.56), skin, 0.3);
    if (d.blush) mt.put(ex - 2, ey + 2, M.clothRed, 0.74);
  }
  if (d.tusk) {
    mt.put(hcx + hR * 0.56, hcy + hR * 0.52, M.clothWhite, 0.84);
    if (s > 0.85) mt.put(hcx + hR * 0.2, hcy + hR * 0.58, M.clothWhite, 0.8);
  }
  if (d.beard) {
    const bm = M[d.beard.m], len = d.beard.len ?? 0.5;
    mt.disc(hcx + hR * 0.3, hcy + hR * (0.7 + len * 0.5), hR * 0.82, hR * (0.5 + len), bm, (x, y, dx, dy) => 0.56 - dx * 0.14 - dy * 0.2 - ((x + y) % 3 === 0 ? 0.08 : 0));
  }
  // 쓰개
  const hat = d.hat;
  if (d.hood) {
    for (let a = -2.5; a < -0.45; a += 0.06) mt.put(hcx - R(0.6) + Math.cos(a) * (hR + R(0.9)), hcy + Math.sin(a) * (hR + R(0.9)), M[d.hood], 0.6 + Math.cos(a) * 0.1);
  }
  if (hat === 'cap' || hat === 'scarfHead' || hat === 'chef') {
    const hm = M[d.hatM ?? (hat === 'cap' ? 'clothBrown' : 'clothWhite')];
    for (let y = Math.floor(hcy - hR - 3 * s); y <= hcy; y++)
      for (let x = Math.floor(hcx - hR - 1); x <= hcx + hR + 1; x++) {
        const dx = (x + 0.5 - hcx) / (hR + 0.6), dy = (y + 0.5 - hcy) / (hR + 0.8);
        if (dx * dx + dy * dy > 1 || dy > (hat === 'scarfHead' ? -0.1 - dx * 0.5 : -0.34)) continue;
        mt.put(x, y, hm, 0.62 - dx * 0.14 - dy * 0.1);
      }
    if (hat === 'cap') mt.put(hcx + hR + 0.6, hcy - hR * 0.36, hm, 0.4);
    if (hat === 'scarfHead') cap(mt, hcx - hR * 0.7, hcy - hR * 0.1, hcx - hR * 1.1, hcy + hR * 1.3, R(1.9), R(1.3), hm, 0.6);
    if (hat === 'chef') mt.disc(hcx - R(0.3), hcy - hR - R(2), hR * 1.1, R(3), hm, (x, y, dx, dy) => 0.8 - dx * 0.1 - dy * 0.14);
  } else if (hat === 'pointed' || hat === 'wide') {
    const hm = M[d.hatM ?? 'clothPurple'];
    const brimY = hcy - hR * 0.46, bw = hR + R(hat === 'wide' ? 4.6 : 3.2);
    if (hat === 'pointed') {
      mt.poly([[hcx - hR - 0.5, brimY], [hcx + hR + 0.5, brimY], [hcx - R(2.4), brimY - R(11)], [hcx - R(3.4), brimY - R(10.4)]], hm, (x, y) => 0.5 - ((x - hcx) / hR) * 0.16);
    } else {
      mt.rect(hcx - hR, brimY - R(4), hcx + hR, brimY, hm, (x, y) => 0.44 - ((x - hcx) / hR) * 0.14);
    }
    for (let x = Math.round(hcx - bw); x <= hcx + bw; x++) {
      mt.put(x, Math.round(brimY), hm, 0.6 - ((x - hcx) / bw) * 0.16);
      mt.put(x, Math.round(brimY) + 1, hm, 0.34);
    }
    if (d.hatBand) for (let x = Math.round(hcx - hR); x <= hcx + hR; x++) mt.put(x, Math.round(brimY) - 1, M[d.hatBand], 0.6);
  } else if (hat === 'helm' || hat === 'kettle') {
    const hm = M.steel;
    for (let y = Math.floor(hcy - hR - 2); y <= hcy + hR + 1; y++)
      for (let x = Math.floor(hcx - hR - 2); x <= hcx + hR + 2; x++) {
        const dx = (x + 0.5 - hcx) / (hR + 0.9), dy = (y + 0.5 - hcy) / (hR + 0.9);
        if (dx * dx + dy * dy > 1) continue;
        if (hat === 'kettle' && dy > -0.12) continue;
        if (hat === 'helm' && dy > 0.74) continue;
        mt.put(x, y, hm, 0.66 - dx * 0.26 - dy * 0.26);
      }
    if (hat === 'helm') {
      // 눈구멍 틈과 깃털 장식
      for (let x = Math.round(hcx - hR * 0.1); x <= hcx + hR + 0.6; x++) mt.put(x, Math.round(hcy - hR * 0.04), M.iron, 0.12);
      if (s > 0.8) mt.put(hcx + hR * 0.5, Math.round(hcy + hR * 0.36), M.iron, 0.2);
      for (let a = -2.7; a < -1.0; a += 0.08) {
        const rr = hR + R(1.6) + Math.sin((a + 2.7) * 1.8) * R(1.2);
        mt.put(hcx - R(0.6) + Math.cos(a) * rr, hcy + Math.sin(a) * rr, M[d.plume ?? 'clothRed'], 0.6);
        mt.put(hcx - R(0.6) + Math.cos(a) * (rr - 1), hcy + Math.sin(a) * (rr - 1), M[d.plume ?? 'clothRed'], 0.46);
      }
    } else {
      for (let x = Math.round(hcx - hR - R(1.6)); x <= hcx + hR + R(1.6); x++) mt.put(x, Math.round(hcy - hR * 0.12), hm, 0.5 - ((x - hcx) / hR) * 0.2);
    }
  } else if (hat === 'bandana') {
    const hm = M[d.hatM ?? 'clothRed'];
    for (let x = Math.round(hcx - hR); x <= hcx + hR; x++) {
      mt.put(x, Math.round(hcy - hR * 0.5), hm, 0.6 - ((x - hcx) / hR) * 0.14);
      if (s > 0.7) mt.put(x, Math.round(hcy - hR * 0.5) - 1, hm, 0.5);
    }
    cap(mt, hcx - hR, hcy - hR * 0.4, hcx - hR - R(2.6), hcy + hR * 0.4, R(1), R(0.8), hm, 0.5);
  } else if (hat === 'veil') {
    for (let y = Math.floor(hcy - hR - 1); y <= hcy + hR; y++)
      for (let x = Math.floor(hcx - hR - 1); x <= hcx + hR; x++) {
        const dx = (x + 0.5 - hcx) / (hR + 0.4), dy = (y + 0.5 - hcy) / (hR + 0.5);
        if (dx * dx + dy * dy > 1 || !(dy < -0.3 - dx * 0.3 || dx < -0.25)) continue;
        mt.put(x, y, M.clothWhite, 0.8 - dx * 0.1 - dy * 0.12);
      }
    for (let k = -1; k <= 1; k++) {
      mt.put(hcx + k * R(1.6), hcy - hR - 1, M.gold, 0.74);
      mt.put(hcx + k * R(1.6), hcy - hR - (k === 0 ? 2.4 : 2), M.gold, 0.6);
    }
    for (let x = Math.round(hcx - hR * 0.7); x <= hcx + hR * 0.7; x++) mt.put(x, Math.round(hcy - hR * 0.86), M.gold, 0.66);
  }

  if (hooks.head) hooks.head(mt, J);

  // --- 앞 팔과 손에 든 것 ---
  drawArm(aA, 0, true, (ax, ay) => {
    const [px, py] = P2(ax, ay);
    if (item === 'staff' || item === 'spear') {
      const topY = oy + (item === 'spear' ? hy - hr - 12 : shY - 9) * s;
      for (let y = Math.round(topY); y < oy; y++) {
        mt.put(px + 1, y, M.woodPale, 0.62);
        if (s > 0.85) mt.put(px + 2, y, M.wood, 0.36);
      }
      if (item === 'spear') {
        for (let k = 0; k < R(5); k++) {
          mt.put(px + 1, topY - k, M.steel, 0.8);
          if (k < R(3)) mt.put(px + 2, topY - k, M.steel, 0.5);
          if (k < R(2)) mt.put(px, topY - k, M.steel, 0.9);
        }
        mt.put(px + 2, topY + 2, M.clothRed, 0.6);
        mt.put(px + 3, topY + 3, M.clothRed, 0.5);
      } else mt.disc(px + 1.5, topY - 1, R(1.7), R(1.7), d.orb ? M[d.orb] : M.woodPale, 0.66);
      mt.disc(px, py, R(1.5), R(1.5), skin, 0.6);
    } else if (item === 'basket') {
      mt.rect(px - R(3), py + R(1), px + R(3.4), py + R(5), M.hay, (x, y) => 0.5 + ((x + y) % 2) * 0.12 - (x - px) * 0.02);
      for (let k = -2; k <= 2; k++) mt.put(px + k * R(1.2), py + R(0.4), [M.clothRed, M.leafGreen, M.leafGold, M.clothPurple][(k + 6) % 4], 0.62);
      mt.put(px - R(3), py, M.hay, 0.4);
      mt.put(px + R(3), py, M.hay, 0.4);
    } else if (item === 'axe' || item === 'hammer') {
      const [tx, ty] = P2(ax + 2.6, ay - 12);
      mt.line(px, py + R(2), tx, ty, M.woodPale, 0.56);
      if (item === 'axe') mt.disc(tx + R(1.6), ty + R(1.4), R(3.2), R(3.6), M.steel, (x, y, dx, dy) => 0.7 - dx * 0.2 - dy * 0.26);
      else mt.rect(tx - R(2.4), ty - R(1.6), tx + R(3), ty + R(2), M.steel, (x, y) => 0.74 - (x - tx) * 0.04 - (y - ty) * 0.08);
    } else if (item === 'mug') {
      mt.rect(px, py - R(3), px + R(3), py + R(1), M.woodPale, 0.6);
      mt.put(px + 1, py - R(3) - 1, M.clothWhite, 0.86);
    } else if (item === 'broom') {
      for (let y = Math.round(oy + (shY - 6) * s); y < oy - R(4); y++) mt.put(px + 1, y, M.woodPale, 0.6);
      mt.rect(px - R(1.4), oy - R(5), px + R(3.6), oy - 1, M.hay, (x, y) => 0.5 + (x % 2) * 0.14);
    }
  });
  if (hooks.front) hooks.front(mt, J);
}

/** 어두운 윤곽선 — 바깥 가장자리에 그 자리 색의 가장 어두운 단계를 두른다 */
function outline(mt) {
  const add = [];
  for (let y = 0; y < mt.h; y++)
    for (let x = 0; x < mt.w; x++) {
      if (mt.m[y * mt.w + x]) continue;
      let best = 0;
      for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
        const m = mt.at(x + dx, y + dy);
        if (m) {
          best = m;
          break;
        }
      }
      if (best) add.push([x, y, best]);
    }
  for (const [x, y, m] of add) mt.put(x, y, m, -0.3);
}

/* ---------- 생김새 ---------- */

const DESIGNS = {
  peasant: { top: 'clothBrown', legs: 'clothGray', boots: 'timber', belt: 'timber', hair: { m: 'hairBrown', style: 'short' }, hat: 'cap', hatM: 'clothGreen', pouch: true },
  farmer: { top: 'clothGreen', legs: 'clothBrown', boots: 'timber', belt: 'timber', hair: { m: 'hairBlond', style: 'short' }, hat: 'wide', hatM: 'hay', item: 'broom', bare: true },
  woman: { top: 'clothTeal', skirt: 'clothTeal', long: 0.86, apron: 'clothCream', boots: 'timber', hair: { m: 'hairRed', style: 'bun' }, hat: 'scarfHead', hatM: 'clothWhite', item: 'basket' },
  maid: { top: 'clothRed', skirt: 'clothBrown', long: 0.8, apron: 'clothWhite', boots: 'timber', hair: { m: 'hairBrown', style: 'tail' }, belt: 'timber' },
  hooded: { top: 'clothBlack', skirt: 'clothBlack', long: 0.9, hood: 'clothBlack', cloak: { m: 'clothBlack', len: 0.86 }, boots: 'iron', skin: 'skinTan', belt: 'timber', pouch: true },
  merchant: { top: 'clothGold', skirt: 'clothBrown', long: 0.84, fur: 'hairGray', boots: 'timber', belt: 'clothTeal', pouch: true, beard: { m: 'hairBlack', len: 0.3 }, hair: { m: 'hairBlack', style: 'short' }, hat: 'cap', hatM: 'clothRed', build: { w: 1.2 }, trim: 'gold' },
  elder: { top: 'clothGray', skirt: 'clothGray', long: 0.94, boots: 'timber', beard: { m: 'hairGray', len: 0.9 }, hair: { m: 'hairGray', style: 'long' }, item: 'staff', belt: 'clothBrown', cloak: { m: 'clothBlue', len: 0.8 } },
  guard: { top: 'steel', sleeves: 'steel', legs: 'steel', boots: 'iron', bootHigh: true, armor: 'steel', tabard: 'clothBlue', hat: 'helm', plume: 'clothRed', item: 'spear', gloves: 'steel', belt: 'timber' },
  mercenary: { top: 'wood', sleeves: 'clothCream', legs: 'clothBrown', boots: 'timber', bootHigh: true, belt: 'timber', hair: { m: 'hairBlack', style: 'short' }, hat: 'bandana', hatM: 'clothRed', back: 'sword', scarf: 'clothRed', skin: 'skinTan', beard: { m: 'hairBlack', len: 0.1 } },
  orc: { skin: 'skinOrc', top: 'clothBrown', sleeves: 'skinOrc', bare: true, legs: 'timber', boots: 'iron', fur: 'hairBrown', belt: 'iron', tusk: true, hair: { m: 'hairBlack', style: 'tail' }, item: 'axe', build: { h: 1.08, w: 1.5, head: 1.12 } },
  elf: { top: 'clothGreen', legs: 'clothBrown', boots: 'wood', bootHigh: true, cloak: { m: 'clothGreen', len: 0.7 }, hair: { m: 'hairBlond', style: 'long' }, ears: 'elf', back: 'bow', belt: 'gold', build: { h: 1.05, w: 0.86, head: 0.94 } },
  dwarf: { top: 'clothRed', legs: 'clothBrown', boots: 'iron', beard: { m: 'hairRed', len: 1.3 }, hair: { m: 'hairRed', style: 'short' }, hat: 'kettle', item: 'hammer', belt: 'timber', build: { h: 0.74, w: 1.5, leg: 0.74, head: 1.3 } },
  noble: { top: 'clothRed', skirt: 'clothRed', long: 0.98, flare: 4, trim: 'gold', hat: 'veil', hair: { m: 'hairBlond', style: 'long' }, belt: 'gold', build: { w: 0.94 } },
  monk: { top: 'clothBrown', skirt: 'clothBrown', long: 0.96, boots: 'timber', hair: { m: 'hairBrown', style: 'bald' }, belt: 'clothCream', scarf: 'clothBrown' },
  witch: { top: 'clothPurple', skirt: 'clothPurple', long: 0.9, hat: 'pointed', hatM: 'clothPurple', hatBand: 'gold', hair: { m: 'hairGray', style: 'long' }, item: 'staff', orb: 'water', cloak: { m: 'clothBlack', len: 0.7 }, build: { h: 0.9 } },
  baker: { top: 'clothWhite', legs: 'clothGray', boots: 'timber', apron: 'clothWhite', hat: 'chef', hair: { m: 'hairBrown', style: 'short' }, beard: { m: 'hairBrown', len: 0.2 }, build: { w: 1.24 }, item: 'mug' },
};

/** 배율 — near: 광장 앞쪽, mid: 광장 안쪽, far: 윗마당 난간 뒤 */
const SIZES = { near: 1, mid: 0.8, far: 0.62 };
const cellOf = (s) => ({ w: Math.ceil(40 * s) + 8, h: Math.ceil(62 * s) + 6 });

/** 한 사람의 프레임들 — 걷기 4 + 말하기 2 */
function frames(name, size) {
  const s = SIZES[size], c = cellOf(s), d = DESIGNS[name];
  const make = (pose) => {
    const mt = new Mat(c.w, c.h);
    figure(mt, Math.round(c.w / 2) - 1, c.h - 2, s, d, pose);
    outline(mt);
    return mt;
  };
  return { walk: POSES.walk.map(make), idle: POSES.idle.map(make), cell: c, ax: Math.round(c.w / 2) - 1, ay: c.h - 2 };
}

module.exports = { DESIGNS, SIZES, frames, cellOf, figure, outline, cap, POSES };
