// 사람을 입체로 그리는 도구.
//
// 몸의 부위(타원체 · 둥근 막대 · 상자)를 3차원 "몸 좌표"에 두고, 보는 방향으로 돌려 픽셀마다
// 광선을 쏴서 찍는다. 픽셀마다 깊이를 기억해(z 버퍼) 앞에 있는 부위가 뒤를 가리므로,
// 같은 사람을 정면 · 옆 · 뒤 · 3/4 어느 쪽에서 보든 따로 그리지 않아도 된다.
//
// 몸 좌표: x = 그 사람의 왼쪽, y = 아래, z = 앞(얼굴이 향한 쪽). 발밑 바닥이 원점.
// 화면(보기) 좌표: x = 화면 오른쪽, y = 화면 아래, z = 카메라 쪽.
// 카메라는 광장을 내려다보므로 PITCH 만큼 기울어 있다 — 앞으로 내민 발이 화면에서 조금 아래에 온다.
const { P, M, MATS, Mat, clamp } = require('./kit');

const PITCH = 0.4;
const CP = Math.cos(PITCH), SP = Math.sin(PITCH);
/** 땅 위에서 화면 y 로 1 움직이면 실제로는 1/YC 만큼 깊이 방향으로 간 것이다 */
const YC = SP;

/* ---------- 벡터 · 회전 ---------- */

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** 3x3 행렬은 행 세 개의 배열 */
const mv = (A, v) => [dot(A[0], v), dot(A[1], v), dot(A[2], v)];
const tr = (A) => [[A[0][0], A[1][0], A[2][0]], [A[0][1], A[1][1], A[2][1]], [A[0][2], A[1][2], A[2][2]]];
const mm = (A, B) => {
  const Bt = tr(B);
  return A.map((row) => Bt.map((col) => dot(row, col)));
};
const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
/** x 축 둘레 — 앞(z)이 아래(y)로 기운다 (고개 숙이기 · 몸 앞으로 숙이기) */
const rotX = (a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return [[1, 0, 0], [0, c, s], [0, -s, c]];
};
/** y 축 둘레 — 앞(z)이 왼쪽(x)으로 돈다 (고개 · 어깨 돌리기) */
const rotY = (a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
};
/** z 축 둘레 — 아래(y)가 왼쪽(x)으로 기운다 (고개 갸웃) */
const rotZ = (a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
};
/** 한 축(a)이 주어진 방향을 향하도록 하는 틀 — 막대 모양 소지품을 세울 때 */
function frameAlong(dir, up = [0, -1, 0]) {
  const y = norm(dir);
  let x = cross(up, y);
  if (len(x) < 1e-4) x = cross([0, 0, 1], y);
  x = norm(x);
  const z = cross(x, y);
  // 열이 지역 축(x, y, z)인 행렬 = 행렬의 행으로 쓰면 전치
  return tr([x, y, z]);
}

/** 두 마디 팔다리 — 뿌리 a 에서 끝 t 로 뻗을 때 가운데 관절. pole 은 관절이 튀어나갈 쪽 */
function ik(a, t, l1, l2, pole) {
  let d = sub(t, a);
  let D = len(d);
  const maxD = (l1 + l2) * 0.999;
  if (D > maxD) {
    d = mul(d, maxD / D);
    D = maxD;
  }
  D = Math.max(D, Math.abs(l1 - l2) + 1e-3);
  const dir = norm(d);
  const x = (l1 * l1 - l2 * l2 + D * D) / (2 * D);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  let p = sub(pole, mul(dir, dot(pole, dir)));
  if (len(p) < 1e-4) p = [0, 0, 1];
  p = norm(p);
  return { joint: add(add(a, mul(dir, x)), mul(p, h)), end: add(a, d) };
}

/* ---------- 빛 ---------- */

/** 보기 좌표의 빛 — 위 · 앞에서, 아주 조금 왼쪽. 좌우를 뒤집어 써도 어색하지 않을 만큼만 기울였다 */
const LIGHT = norm([-0.2, -0.74, 0.64]);

/* ---------- 그림판 ---------- */

/**
 * 한 사람 · 한 방향 · 한 프레임을 그리는 판.
 * (ax, ay) 는 발밑 원점이 놓일 픽셀, s 는 배율(몸 좌표 1 = 화면 s 픽셀), yaw 는 바라보는 방향
 * (0 = 카메라를 봄, π/2 = 화면 오른쪽, π = 등을 보임).
 */
class Fig {
  constructor(w, h, ax, ay, s, yaw) {
    this.w = w;
    this.h = h;
    this.ax = ax;
    this.ay = ay;
    this.s = s;
    const c = Math.cos(yaw), sn = Math.sin(yaw);
    const Yw = [[c, 0, sn], [0, 1, 0], [-sn, 0, c]];
    const Pm = [[1, 0, 0], [0, CP, SP], [0, -SP, CP]];
    this.V = mm(Pm, Yw);
    this.Vt = tr(this.V);
    this.mt = new Mat(w, h);
    this.z = new Float32Array(w * h).fill(-1e9);
    this.g = new Uint8Array(w * h);
    this.anchors = {};
  }

  /** 몸 좌표 → [화면 x, 화면 y, 깊이] (화면 좌표는 소수) */
  proj(p) {
    const v = mv(this.V, p);
    return [this.ax + v[0] * this.s, this.ay + v[1] * this.s, v[2]];
  }

  /** 픽셀 하나 — 더 가까울 때만 쓴다 */
  plot(x, y, d, m, v, g) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = y * this.w + x;
    if (d <= this.z[i]) return;
    this.z[i] = d;
    this.g[i] = g;
    this.mt.m[i] = m;
    this.mt.v[i] = v;
  }

  /** 빛을 받은 밝기 */
  shade(nv, base, k) {
    return base + k * (dot(nv, LIGHT) - 0.42);
  }

  /** paint 의 반환값(재질 번호 · [재질, 밝기 더하기] · null)을 풀어 픽셀을 찍는다 */
  _emit(x, y, d, nv, res, o, inside) {
    if (res == null || res === false) return false;
    let m = res, dv = 0;
    if (Array.isArray(res)) [m, dv] = res;
    if (!m) return false;
    const v = this.shade(nv, o.v ?? 0.5, o.k ?? 0.5) + dv - (inside ? 0.18 : 0) - (o.dark ?? 0);
    this.plot(x, y, d, m, v, o.g ?? 1);
    return true;
  }

  /** 화면에서 이 픽셀 중심의 보기 좌표 */
  _pv(x, y) {
    return [(x + 0.5 - this.ax) / this.s, (y + 0.5 - this.ay) / this.s];
  }

  /**
   * 타원체 — F(틀: o 몸 좌표 원점, R 지역→몸 회전) 안의 c 에 반지름 r = [rx, ry, rz].
   * o.paint(지역 점, 지역 법선, 안쪽인가) 로 픽셀마다 재질을 고른다 (null 이면 비운다).
   * o.two: 바깥 면이 비면 안쪽 면을 찍는다 (망토 · 두건처럼 속이 보이는 것).
   */
  ell(c, r, m, o = {}) {
    const F = o.F ?? { o: [0, 0, 0], R: I3 };
    const R = F.R, Rt = tr(R);
    const cb = add(F.o, mv(R, c));
    // 화면에서의 범위 — 지역 상자의 꼭짓점 8개
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      const p = this.proj(add(cb, mv(R, [sx * r[0], sy * r[1], sz * r[2]])));
      x0 = Math.min(x0, p[0]);
      y0 = Math.min(y0, p[1]);
      x1 = Math.max(x1, p[0]);
      y1 = Math.max(y1, p[1]);
    }
    const toL = mm(Rt, this.Vt); // 보기 → 지역 회전
    const Dl = mv(toL, [0, 0, 1]);
    const qd = [Dl[0] / r[0], Dl[1] / r[1], Dl[2] / r[2]];
    const A = dot(qd, qd);
    const toV = mm(this.V, R); // 지역 → 보기
    const cl = mv(Rt, sub(F.o, [0, 0, 0])); // 지역 좌표로 본 몸 원점
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++)
      for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
        const [vx, vy] = this._pv(x, y);
        // 광선 시작점(깊이 0)을 지역 좌표로
        const Ol = sub(mv(toL, [vx, vy, 0]), cl);
        const q0 = [(Ol[0] - c[0]) / r[0], (Ol[1] - c[1]) / r[1], (Ol[2] - c[2]) / r[2]];
        const B = dot(q0, qd), C = dot(q0, q0) - 1;
        const disc = B * B - A * C;
        if (disc < 0) continue;
        const sq = Math.sqrt(disc);
        for (const [t, inside] of [[(-B + sq) / A, false], [(-B - sq) / A, true]]) {
          if (inside && !o.two) break;
          const pl = add(Ol, mul(Dl, t));
          const q = [(pl[0] - c[0]) / (r[0] * r[0]), (pl[1] - c[1]) / (r[1] * r[1]), (pl[2] - c[2]) / (r[2] * r[2])];
          let nl = norm(q);
          if (inside) nl = mul(nl, -1);
          const nv = mv(toV, nl);
          const res = o.paint ? o.paint(pl, nl, inside) : m;
          if (this._emit(x, y, t, nv, res, o, inside)) break;
        }
      }
  }

  /**
   * 둥근 막대 — 몸 좌표 a 에서 b 까지, 반지름 ra → rb (팔다리 · 치마 · 망토).
   * paint 에는 F 가 있으면 그 지역 좌표, 없으면 몸 좌표를 넘긴다.
   */
  cap(a, b, ra, rb, m, o = {}) {
    const pa = this.proj(a), pb = this.proj(b);
    const s = this.s;
    const Ra = Math.max(ra * s, o.min ?? 0.5), Rb = Math.max(rb * s, o.min ?? 0.5);
    const R0 = Math.max(Ra, Rb) + 1;
    const dx = pb[0] - pa[0], dy = pb[1] - pa[1], L2 = dx * dx + dy * dy;
    const F = o.F, Rt = F ? tr(F.R) : null;
    for (let y = Math.floor(Math.min(pa[1], pb[1]) - R0); y <= Math.ceil(Math.max(pa[1], pb[1]) + R0); y++)
      for (let x = Math.floor(Math.min(pa[0], pb[0]) - R0); x <= Math.ceil(Math.max(pa[0], pb[0]) + R0); x++) {
        const px = x + 0.5, py = y + 0.5;
        const t = L2 < 1e-6 ? (Rb > Ra ? 1 : 0) : clamp(((px - pa[0]) * dx + (py - pa[1]) * dy) / L2);
        const cx = pa[0] + dx * t, cy = pa[1] + dy * t, cz = pa[2] + (pb[2] - pa[2]) * t;
        const r = Ra + (Rb - Ra) * t;
        const ox = px - cx, oy = py - cy, d2 = ox * ox + oy * oy;
        if (d2 > r * r) continue;
        const nz = Math.sqrt(1 - d2 / (r * r));
        for (const inside of [false, true]) {
          if (inside && !o.two) break;
          const nv = inside ? [-ox / r, -oy / r, nz] : [ox / r, oy / r, nz];
          const depth = cz + ((inside ? -1 : 1) * nz * r) / s;
          // 표면 점을 몸 좌표로
          const sv = [(px - this.ax) / s, (py - this.ay) / s, depth];
          const pbody = mv(this.Vt, sv);
          const nbody = mv(this.Vt, inside ? [ox / r, oy / r, -nz] : nv);
          const pl = F ? mv(Rt, sub(pbody, F.o)) : pbody;
          const nl = F ? mv(Rt, nbody) : nbody;
          const res = o.paint ? o.paint(pl, nl, inside, t) : m;
          if (this._emit(x, y, depth, nv, res, o, inside)) break;
        }
      }
  }

  /** 상자 — 틀 F 안에서 중심 c, 반 크기 h (책 · 칼날 · 두루마리) */
  box(c, h, m, o = {}) {
    const F = o.F ?? { o: [0, 0, 0], R: I3 };
    const R = F.R, Rt = tr(R);
    const cb = add(F.o, mv(R, c));
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      const p = this.proj(add(cb, mv(R, [sx * h[0], sy * h[1], sz * h[2]])));
      x0 = Math.min(x0, p[0]);
      y0 = Math.min(y0, p[1]);
      x1 = Math.max(x1, p[0]);
      y1 = Math.max(y1, p[1]);
    }
    const toL = mm(Rt, this.Vt), toV = mm(this.V, R);
    const Dl = mv(toL, [0, 0, 1]);
    const cl = mv(Rt, F.o);
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++)
      for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
        const [vx, vy] = this._pv(x, y);
        const Ol = sub(mv(toL, [vx, vy, 0]), cl);
        let tmin = -1e9, tmax = 1e9, amin = 0, amax = 0;
        let miss = false;
        for (let k = 0; k < 3; k++) {
          const o0 = Ol[k] - c[k];
          if (Math.abs(Dl[k]) < 1e-9) {
            if (Math.abs(o0) > h[k]) miss = true;
            continue;
          }
          let ta = (-h[k] - o0) / Dl[k], tb = (h[k] - o0) / Dl[k];
          if (ta > tb) [ta, tb] = [tb, ta];
          if (ta > tmin) {
            tmin = ta;
            amin = k;
          }
          if (tb < tmax) {
            tmax = tb;
            amax = k;
          }
        }
        if (miss || tmin > tmax) continue;
        const nl = [0, 0, 0];
        nl[amax] = Math.sign(Dl[amax]) || 1;
        const pl = add(Ol, mul(Dl, tmax));
        const res = o.paint ? o.paint(pl, nl, false) : m;
        this._emit(x, y, tmax, mv(toV, nl), res, o, false);
      }
  }

  /** 가는 선 (활시위 · 지팡이 · 깃털) — 1픽셀 굵기 */
  seg(a, b, m, v = 0.6, o = {}) {
    const pa = this.proj(a), pb = this.proj(b);
    const n = Math.max(1, Math.ceil(Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) * 2));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = Math.floor(pa[0] + (pb[0] - pa[0]) * t), y = Math.floor(pa[1] + (pb[1] - pa[1]) * t);
      this.plot(x, y, pa[2] + (pb[2] - pa[2]) * t + (o.lift ?? 0.3), m, typeof v === 'function' ? v(t) : v, o.g ?? 11);
    }
  }

  /** 표면 위의 점 (눈 · 단추 · 별 무늬) — 그 자리가 보일 때만 찍는다 */
  dot(p, m, v, o = {}) {
    const [sx, sy, d] = this.proj(p);
    const x = Math.floor(sx), y = Math.floor(sy);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return false;
    const i = y * this.w + x;
    if (!this.mt.m[i] || d < this.z[i] - (o.eps ?? 0.9)) return false;
    this.mt.m[i] = m;
    this.mt.v[i] = v;
    if (o.g) this.g[i] = o.g;
    return true;
  }

  /** 기준점 기록 — 화면에서 덧그릴 것(마법 구슬 · 화살)의 자리 */
  mark(name, p) {
    const [x, y] = this.proj(p);
    this.anchors[name] = [Math.round(x - this.ax), Math.round(y - this.ay)];
  }

  /** 부위 사이 선 — 다른 부위가 바로 앞을 가리는 가장자리를 한 단계 어둡게 */
  contour(T = 1.6, dv = 0.16) {
    const { w, h, z, g } = this;
    const m = this.mt.m, v = this.mt.v;
    const hit = [];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (!m[i]) continue;
        for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) {
          const X = x + dx, Y = y + dy;
          if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
          const j = Y * w + X;
          if (m[j] && g[j] !== g[i] && z[j] > z[i] + T / this.s) {
            hit.push(i);
            break;
          }
        }
      }
    for (const i of hit) v[i] -= dv;
  }

  /** 바깥 윤곽 — 맞닿은 재질의 가장 어두운 단계 */
  outline() {
    const { w, h } = this;
    const m = this.mt.m;
    const add2 = [];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (m[y * w + x]) continue;
        let best = 0, bz = -1e9;
        for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
          const X = x + dx, Y = y + dy;
          if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
          const j = Y * w + X;
          if (m[j] && this.z[j] > bz) {
            best = m[j];
            bz = this.z[j];
          }
        }
        if (best) add2.push([y * w + x, best]);
      }
    for (const [i, mm2] of add2) {
      m[i] = mm2;
      this.mt.v[i] = -0.3;
    }
  }

  /** 색으로 풀기 — 작은 그림이라 디더 없이 단계만 고른다 */
  resolve() {
    const out = new P.Buf(this.w, this.h);
    const m = this.mt.m, v = this.mt.v;
    for (let i = 0; i < m.length; i++) {
      if (!m[i]) continue;
      const ramp = MATS[m[i]];
      const k = Math.floor(clamp(v[i], 0, 0.9999) * ramp.length);
      out.px[i] = P.col(ramp[k]);
    }
    return out;
  }
}

/** 그림의 실제 범위 — 비어 있지 않은 픽셀의 상자 */
function bounds(buf) {
  let x0 = buf.w, y0 = buf.h, x1 = -1, y1 = -1;
  for (let y = 0; y < buf.h; y++)
    for (let x = 0; x < buf.w; x++)
      if (buf.px[y * buf.w + x] >>> 24) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  return x1 < 0 ? null : { x0, y0, x1, y1 };
}

module.exports = {
  PITCH, CP, SP, YC, LIGHT, I3,
  add, sub, mul, dot, cross, len, norm, lerp3, mv, mm, tr, rotX, rotY, rotZ, frameAlong, ik,
  Fig, bounds, M,
};
