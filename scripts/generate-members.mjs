// 회원 100개 계정(요원 코드네임)을 Supabase Auth + profiles에 일괄 생성하고
// 결과를 scripts/output/members-credentials.csv 로 저장한다.
//
// 실행:
//   .env.script.local 에 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 를 채운 뒤
//   npm run gen:members
//
// 이미 존재하는 코드네임은 건너뛰므로 재실행해도 안전하다 (새로 추가된 코드네임만 생성).

import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { randomInt } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

loadEnv({ path: '.env.script.local' });

// @supabase/supabase-js는 생성자에서 항상 RealtimeClient를 초기화하는데, Node 20 이하는
// 전역 WebSocket이 없어 그 초기화만으로 즉시 예외를 던진다. 이 스크립트는 realtime
// 채널을 전혀 쓰지 않으므로, 검사를 통과시킬 더미 클래스만 등록해준다.
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class {};
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '.env.script.local 에 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const MEMBER_EMAIL_DOMAIN = 'members.gdevfc.local';
const TOTAL_MEMBERS = 100;

// 게임 / 게임업계에서 흔히 쓰는 용어 워드뱅크
const WORD_BANK = [
  'PIXEL', 'RESPAWN', 'GLITCH', 'COMBO', 'PARRY', 'CLUTCH', 'CRIT', 'NPC',
  'BOSS', 'LOOT', 'FRAG', 'GRIND', 'BUFF', 'NERF', 'QUEST', 'ARCADE',
  'RETRO', 'PORTAL', 'VOID', 'JOYSTICK', 'CHECKPOINT', 'SPAWN', 'HITBOX',
  'AGGRO', 'OVERCLOCK', 'SPEEDRUN', 'ROGUE', 'COOP', 'SANDBOX', 'PROCGEN',
  'COMBOBREAK', 'HEADSHOT', 'SIDEQUEST', 'PLATFORMER', 'ROGUELIKE',
];

const AMBIGUOUS_CHARS = new Set(['0', 'O', '1', 'I']);
const PASSWORD_CHARS = Array.from(
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
).filter((c) => !AMBIGUOUS_CHARS.has(c));

function randomPassword(length = 8) {
  return Array.from({ length }, () => PASSWORD_CHARS[randomInt(PASSWORD_CHARS.length)]).join('');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildCodenamePool(count) {
  const combos = [];
  for (const word of WORD_BANK) {
    for (let n = 1; n <= 20; n++) {
      combos.push(`${word}-${String(n).padStart(2, '0')}`);
    }
  }
  return shuffle(combos).slice(0, count);
}

function codenameToEmail(codename) {
  return `${codename.toLowerCase()}@${MEMBER_EMAIL_DOMAIN}`;
}

async function codenameExists(codename) {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('codename', codename)
    .maybeSingle();
  return !!data;
}

async function createMember(codename, role) {
  const password = randomPassword();
  const email = codenameToEmail(codename);

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    console.error(`  ✕ ${codename}: ${createError?.message ?? 'auth 계정 생성 실패'}`);
    return null;
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: created.user.id,
    codename,
    role,
  });

  if (profileError) {
    console.error(`  ✕ ${codename}: ${profileError.message}`);
    return null;
  }

  console.log(`  ✓ ${codename} (${role})`);
  return { codename, password, role };
}

async function main() {
  const results = [];

  console.log('마스터 어드민 계정 확인 중...');
  if (!(await codenameExists('CHESS-01'))) {
    const admin = await createMember('CHESS-01', 'admin');
    if (admin) results.push(admin);
  } else {
    console.log('  · CHESS-01 은 이미 존재합니다. 건너뜁니다.');
  }

  const memberSlots = TOTAL_MEMBERS - 1;
  const pool = buildCodenamePool(memberSlots * 2); // 중복 스킵 대비 여유분

  console.log(`일반 회원 최대 ${memberSlots}명 생성 중...`);
  let created = 0;
  for (const codename of pool) {
    if (created >= memberSlots) break;
    if (await codenameExists(codename)) continue;
    const member = await createMember(codename, 'member');
    if (member) {
      results.push(member);
      created += 1;
    }
  }

  if (results.length === 0) {
    console.log('새로 생성된 계정이 없습니다.');
    return;
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const outDir = path.join(__dirname, 'output');
  await mkdir(outDir, { recursive: true });

  const outFile = path.join(outDir, 'members-credentials.csv');
  const csv = ['codename,password,role', ...results.map((r) => `${r.codename},${r.password},${r.role}`)].join('\n');
  await writeFile(outFile, csv, 'utf8');

  console.log(`\n${results.length}개 계정 생성 완료 → ${outFile}`);
  console.log('이 파일은 절대 커밋하지 말고, 동아리원에게 개별 배포 후 삭제하세요.');
}

main();
