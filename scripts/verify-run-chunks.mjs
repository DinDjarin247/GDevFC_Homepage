// 달려라 우왕이 V2 — 코스 조각 검증.
//
// 조각마다 "한 대도 안 맞고, 구덩이에 빠지지 않고" 지나갈 수 있는 입력이 있는지 찾는다.
// 입력은 1/15초마다만 바꿀 수 있다고 본다 (사람 손으로 맞출 수 있는 간격). 게임과 같은
// 물리 함수(lib/run/world.ts 의 stepRunner)를 그대로 쓴다.
//
//   npm run verify:run
//
// 조각을 새로 만들거나 고쳤다면 반드시 돌려서 전부 PASS 인지 확인한다.

import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');

// lib/run/*.ts 를 임시 폴더에 CommonJS 로 옮겨 불러온다 (빌드 없이)
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

const STEPS_PER_DECISION = 8; // 120Hz / 8 = 15Hz
const LEAD = 120;
const TRAIL = 200;
const MAX_JUMPS = Number(process.env.MAX_JUMPS ?? 2);

/** 조각 앞뒤에 평지를 붙인 작은 코스 */
function miniCourse(chunk) {
  const out = W.layoutChunk(chunk, LEAD);
  const grounds = [{ x0: 0, x1: LEAD }, ...out.grounds, { x0: LEAD + chunk.len, x1: LEAD + chunk.len + TRAIL }];
  const surfaces = [
    ...grounds.map((g) => ({ ...g, y: W.GROUND_Y, kind: 'ground' })),
    ...out.plats,
  ];
  return { surfaces, obstacles: out.obstacles, end: LEAD + chunk.len + TRAIL - 40 };
}

/**
 * 깊이 우선 탐색. 결정마다 [가만히 / 점프 / 슬라이드(↓)] 중 하나를 고른다.
 * 같은 시점에 같은 몸 상태면 다시 볼 필요가 없으므로 기억해 둔다.
 */
function solve(chunk) {
  const course = miniCourse(chunk);
  const seen = new Set();
  const actions = ['none', 'jump', 'slide'];

  function run(step, r, path) {
    const x = step * W.PHYS_DT * W.RUN_SPEED;
    if (x >= course.end) return path;
    const key = `${step}|${Math.round(r.y * 2)}|${Math.round(r.vy / 15)}|${r.grounded}|${r.airJumps}|${r.buffer > 0}`;
    if (seen.has(key)) return null;
    seen.add(key);

    for (const a of actions) {
      const next = { ...r };
      let ok = true;
      for (let i = 0; i < STEPS_PER_DECISION; i++) {
        const sx = (step + i) * W.PHYS_DT * W.RUN_SPEED;
        const near = course.surfaces.filter((s) => s.x1 >= sx - 40 && s.x0 <= sx + 40);
        W.stepRunner(next, sx, { jumpPressed: a === 'jump' && i === 0, slide: a === 'slide' }, near, MAX_JUMPS);
        if (W.fellOut(next)) {
          ok = false;
          break;
        }
        const box = W.hitbox(next, sx);
        // 움직이는 장애물은 지금(달린 거리 sx) 있는 자리로 본다
        if (course.obstacles.some((o) => W.touches(box, W.obstacleAt(o, sx)))) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      const found = run(step + STEPS_PER_DECISION, next, [...path, a]);
      if (found) return found;
    }
    return null;
  }

  return run(0, W.newRunner(), []);
}

let failed = 0;
for (const chunk of CHUNKS) {
  const t0 = Date.now();
  const sol = solve(chunk);
  const ms = Date.now() - t0;
  if (sol) {
    const plan = sol.map((a) => (a === 'jump' ? 'J' : a === 'slide' ? 'S' : '.')).join('');
    console.log(`PASS  t${chunk.tier} ${chunk.id.padEnd(20)} ${String(ms).padStart(5)}ms  ${plan}`);
  } else {
    failed++;
    console.log(`FAIL  t${chunk.tier} ${chunk.id.padEnd(20)} ${String(ms).padStart(5)}ms  — 안 맞고 지나갈 방법이 없음`);
  }
}
console.log(failed ? `\n${failed}개 조각을 고쳐야 합니다.` : `\n${CHUNKS.length}개 조각 모두 통과.`);
process.exit(failed ? 1 : 0);
