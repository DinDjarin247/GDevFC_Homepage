// 달려라 우왕이 V2 — 코스 조각 검증.
//
//   npm run verify:run
//
// 1) 조각마다 "한 대도 안 맞고, 구덩이에 빠지지 않고" 지나갈 수 있는 입력이 있는지 찾는다.
//    입력은 1/15초마다만 바꿀 수 있다고 본다 (사람 손으로 맞출 수 있는 간격).
// 2) 그 길에서 "아무것도 안 해도 되는" 가장 긴 시간을 잰다 — 길면 지루하다.
// 3) expect 가 붙은 조각은 이단 점프 없이도 깨지는지, 두 번째 점프를 몇 초 뒤에 눌러야 하는지 잰다.
//    quick(타탁) 은 짧게만, late(타   탁) 는 늦게만 통과해야 의도대로다.
// 4) 아무 두 조각을 바로 이어 붙여도(사이 평지 없이) 지나갈 수 있는지 모든 쌍을 확인한다.
//
// 게임과 같은 물리 함수(lib/run/world.ts 의 stepRunner · obstacleAt)를 그대로 쓴다.
// 조각을 새로 만들거나 고쳤다면 반드시 돌려서 FAIL 이 없는지 확인한다.

import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const dir = mkdtempSync(path.join(tmpdir(), 'run-verify-'));
for (const name of ['world', 'chunks']) {
  const src = readFileSync(new URL(`../lib/run/${name}.ts`, import.meta.url), 'utf8');
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  writeFileSync(path.join(dir, `${name}.js`), out);
}
const W = require(path.join(dir, 'world.js'));
const { CHUNKS } = require(path.join(dir, 'chunks.js'));

const STEP = 8; // 120Hz / 8 = 15Hz — 한 번의 결정
const DECISION_S = STEP * W.PHYS_DT;
const LEAD = 120;
const TRAIL = 200;
const MAX_JUMPS = Number(process.env.MAX_JUMPS ?? 2);
const SKIP_PAIRS = process.env.SKIP_PAIRS === '1';

/** 조각들을 앞뒤 평지와 함께 차례로 깐 작은 코스 */
function miniCourse(chunks) {
  const grounds = [{ x0: 0, x1: LEAD }];
  const plats = [];
  const obstacles = [];
  let base = LEAD;
  for (const c of chunks) {
    const out = W.layoutChunk(c, base);
    grounds.push(...out.grounds);
    plats.push(...out.plats);
    obstacles.push(...out.obstacles);
    base += c.len;
  }
  grounds.push({ x0: base, x1: base + TRAIL });
  const surfaces = [...grounds.map((g) => ({ ...g, y: W.GROUND_Y, kind: 'ground' })), ...plats];
  return { surfaces, obstacles, start: LEAD, end: base + TRAIL - 40 };
}

/** 한 결정(1/15초) 동안 행동을 이어 간다. 맞거나 빠지면 null */
function advance(course, step, r, action, maxJumps) {
  const next = { ...r };
  for (let i = 0; i < STEP; i++) {
    const sx = (step + i) * W.PHYS_DT * W.RUN_SPEED;
    const near = course.surfaces.filter((s) => s.x1 >= sx - 40 && s.x0 <= sx + 40);
    W.stepRunner(next, sx, { jumpPressed: action === 'jump' && i === 0, slide: action === 'slide' }, near, maxJumps);
    if (W.fellOut(next)) return null;
    const box = W.hitbox(next, sx);
    // 움직이는 장애물은 지금(달린 거리 sx) 있는 자리로 본다
    if (course.obstacles.some((o) => o.x < sx + 60 && o.x + o.w > sx - 60 && W.touches(box, W.obstacleAt(o, sx))))
      return null;
  }
  return next;
}

const ACTIONS = ['none', 'jump', 'slide'];
const keyOf = (step, r) =>
  `${step}|${Math.round(r.y * 2)}|${Math.round(r.vy / 15)}|${r.grounded}|${r.airJumps}|${r.buffer > 0}`;

/** 지나갈 수 있는 길 하나 (행동 목록) — 없으면 null. 가만히 있기를 먼저 시도해 "최대한 미루는" 길이 나온다 */
function solve(course, maxJumps = MAX_JUMPS) {
  const seen = new Set();
  function run(step, r, plan) {
    if (step * W.PHYS_DT * W.RUN_SPEED >= course.end) return plan;
    const key = keyOf(step, r);
    if (seen.has(key)) return null;
    seen.add(key);
    for (const a of ACTIONS) {
      const next = advance(course, step, r, a, maxJumps);
      if (!next) continue;
      const found = run(step + STEP, next, [...plan, a]);
      if (found) return found;
    }
    return null;
  }
  return run(0, W.newRunner(), []);
}

/**
 * 이단 점프를 "땅 점프 d 결정 뒤에만" 누를 수 있다고 제한하고 d 마다 지나갈 수 있는지 본다.
 * 이단 점프 없이는 못 지나가는 조각이라면, 통과한 d 들이 곧 그 장애물에 맞는 두 번째 점프 타이밍이다.
 */
function solveWithDelay(course, d) {
  const seen = new Set();
  function run(step, r, since) {
    if (step * W.PHYS_DT * W.RUN_SPEED >= course.end) return true;
    const key = `${keyOf(step, r)}|${since}`;
    if (seen.has(key)) return false;
    seen.add(key);
    for (const a of ACTIONS) {
      const groundJump = a === 'jump' && (r.grounded || r.coyote > 0);
      const airJump = a === 'jump' && !groundJump && r.airJumps > 0;
      if (airJump && since !== d) continue;
      const next = advance(course, step, r, a, MAX_JUMPS);
      if (!next) continue;
      const nextSince = groundJump ? 1 : since > 0 && !next.grounded ? since + 1 : 0;
      if (run(step + STEP, next, nextSince)) return true;
    }
    return false;
  }
  return run(0, W.newRunner(), 0);
}

function doubleDelays(course) {
  const out = [];
  for (let d = 1; d <= 16; d++) if (solveWithDelay(course, d)) out.push(d);
  return out;
}

/** 길에서 아무 행동도 필요 없는 가장 긴 시간 (첫 행동부터 마지막 행동 사이, 초) */
function longestIdle(plan) {
  const acts = plan.map((a, i) => (a === 'none' ? -1 : i)).filter((i) => i >= 0);
  let gap = 0;
  for (let i = 1; i < acts.length; i++) gap = Math.max(gap, acts[i] - acts[i - 1] - 1);
  return gap * DECISION_S;
}

let failed = 0;
console.log(`조각 ${CHUNKS.length}개 (점프 ${MAX_JUMPS}번까지)\n`);
for (const chunk of CHUNKS) {
  const course = miniCourse([chunk]);
  const plan = solve(course);
  const tag = `t${chunk.tier} ${chunk.id.padEnd(20)}`;
  if (!plan) {
    failed++;
    console.log(`FAIL  ${tag} — 안 맞고 지나갈 방법이 없음`);
    continue;
  }
  const inside = plan.slice(Math.floor(LEAD / (DECISION_S * W.RUN_SPEED)));
  let line = `PASS  ${tag} 최대 빈 시간 ${longestIdle(inside).toFixed(2)}s`;
  if (chunk.expect) {
    const single = solve(course, 1);
    const d = doubleDelays(course);
    const range = d.length ? `${(d[0] * DECISION_S).toFixed(2)}~${(d[d.length - 1] * DECISION_S).toFixed(2)}s` : '없음';
    // 결정(1/15초) 단위로 판정 — quick: 4번(0.27초) 안에만 / late: 5번(0.33초) 뒤에만 / dodge: 4번 뒤에만
    const want =
      chunk.expect === 'quick'
        ? d.length && d[d.length - 1] <= 4
        : chunk.expect === 'late'
          ? d.length && d[0] >= 5
          : d.length && d[0] >= 4;
    const ok = !single && want;
    if (!ok) failed++;
    line += `  | ${chunk.expect}: 이단 점프 ${single ? '없이도 깨짐 ✗' : '필수'} · 두 번째 점프 ${range} 뒤 ${ok ? '✓' : '✗ 의도와 다름'}`;
  }
  console.log(line);
}

if (!SKIP_PAIRS) {
  let bad = 0;
  const t0 = Date.now();
  for (const a of CHUNKS) {
    for (const b of CHUNKS) {
      if (a.zones && b.zones && !a.zones.some((z) => b.zones.includes(z))) continue;
      if (Math.abs(a.tier - b.tier) > 2) continue;
      if (!solve(miniCourse([a, b]))) {
        bad++;
        console.log(`FAIL  이음매 ${a.id} → ${b.id}`);
      }
    }
  }
  console.log(`\n이음매: 함께 나올 수 있는 모든 쌍 검사 (${Date.now() - t0}ms)${bad ? ` — ${bad}쌍 실패` : ' — 전부 통과'}`);
  failed += bad;
}

console.log(failed ? `\n${failed}건을 고쳐야 합니다.` : `\n모두 통과.`);
process.exit(failed ? 1 : 0);
