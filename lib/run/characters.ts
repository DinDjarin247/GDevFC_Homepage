/**
 * 달려라 우왕이 V2 — 플레이어블 캐릭터 (충북대 마스코트).
 *
 * 그림은 components/Sprite.tsx 의 그리드(광장 · 선택 화면과 같은 그림)를 쓰고,
 * 달리기 동작은 다리 줄만 바꿔 끼운다(lib/run/art.ts). 고유 능력은 마스코트 소개글의
 * 성격에서 가져왔다.
 */

import { SPRITE_GRIDS } from '@/components/Sprite';
import { WOOWANG_ART, humanLegs, legRow, type CharacterArt } from './art';

export type CharacterId = 'woowang' | 'jwawang' | 'steady' | 'tana' | 'neuru' | 'eunsong';

/**
 * 능력치. itemMult — 아이템 지속시간 배율 · coinMult — 학점 점수 배율 · drainMult — 체력 감소 배율 ·
 * heartMult — 하트 회복 배율 · startShield — 족보를 들고 시작 · dash — 불꽃 대시 · glide — 활공.
 */
export type RunnerStats = {
  maxJumps: number;
  /** 서 있을 때 충돌 키 (그림 키와 맞춘다) */
  standH: number;
  itemMult: number;
  coinMult: number;
  drainMult: number;
  heartMult: number;
  startShield: boolean;
  dash: boolean;
  glide: boolean;
};

export const BASE_STATS: RunnerStats = {
  maxJumps: 2,
  standH: 20,
  itemMult: 1,
  coinMult: 1,
  drainMult: 1,
  heartMult: 1,
  startShield: false,
  dash: false,
  glide: false,
};

export type Character = {
  id: CharacterId;
  /** Sprite.tsx 의 그림 이름 */
  sprite: string;
  name: string;
  en: string;
  tagline: string;
  ability: { name: string; desc: string };
  /** 기본 능력치에서 바뀌는 것만 */
  stats: Partial<RunnerStats>;
  art: CharacterArt;
  /** 은송이 — 판마다 다른 친구의 능력 하나가 깃든다 */
  secret?: boolean;
};

const JWAWANG_FEET = (marks: Record<number, string>) => [legRow(marks)];

export const CHARACTERS: Character[] = [
  {
    id: 'woowang',
    sprite: 'woowang',
    name: '우왕이',
    en: 'WOOWANG',
    tagline: '소들의 왕 · 언제나 스무 살 열정맨',
    ability: { name: '우왕!', desc: '아이템 지속시간 1.5배 — 뭐든 신나게, 오래 누린다' },
    stats: { itemMult: 1.5 },
    art: WOOWANG_ART,
  },
  {
    id: 'jwawang',
    sprite: 'jwawang',
    name: '좌왕이',
    en: 'JWAWANG',
    tagline: '우왕이 동생 · 말 없는 재주꾼',
    ability: { name: '3단 점프', desc: '공중에서 두 번 더 뛸 수 있다. 몸이 작아 현수막 밑은 그냥 지나간다' },
    stats: { maxJumps: 3, standH: 12 },
    art: {
      base: SPRITE_GRIDS['jwawang'],
      legsAt: 19,
      pants: 'y',
      shoe: 'Y',
      slideRows: [9, 10, 12, 13, 14, 15, 17, 18],
      legs: {
        runA: JWAWANG_FEET({ 4: 'Y', 5: 'Y', 10: 'Y', 11: 'Y' }),
        runB: JWAWANG_FEET({ 6: 'Y', 7: 'Y', 8: 'Y', 9: 'Y' }),
        jump: JWAWANG_FEET({ 4: 'Y', 11: 'Y' }),
      },
    },
  },
  {
    id: 'steady',
    sprite: 'steady',
    name: '스테디',
    en: 'STEADY',
    tagline: '열혈 학구파 · 중앙도서관 1층 마지막 줄 네 번째 자리',
    ability: { name: '학구열', desc: '학점 점수 1.5배, 족보를 들고 시작한다' },
    stats: { coinMult: 1.5, startShield: true },
    art: {
      base: SPRITE_GRIDS['steady'],
      legsAt: 16,
      pants: '1',
      shoe: 'X',
      slideRows: [0, 1, 3, 4, 5, 6, 7, 8, 9, 11, 15],
      legs: humanLegs('1', 'W', 'X'),
    },
  },
  {
    id: 'tana',
    sprite: 'tana',
    name: '타나',
    en: 'TANA',
    tagline: '불과 별의 수호자 · 도서관보다 체육관',
    ability: { name: '불꽃 대시', desc: '능력 키로 앞으로 돌진해 장애물을 부수고 구덩이를 건넌다 (6초마다)' },
    stats: { dash: true },
    art: {
      base: SPRITE_GRIDS['tana'],
      legsAt: 16,
      pants: 'v',
      shoe: 'K',
      slideRows: [1, 2, 3, 5, 6, 7, 8, 10, 11, 13, 15],
      legs: humanLegs('v', 'K', 'K'),
    },
  },
  {
    id: 'neuru',
    sprite: 'neuru',
    name: '느루',
    en: 'NEURU',
    tagline: '느티나무 한 그루 · 햇빛을 머금은 긍정 에너지',
    ability: { name: '광합성', desc: '체력이 30% 천천히 줄고, 하트 회복량 1.5배' },
    stats: { drainMult: 0.7, heartMult: 1.5 },
    art: {
      base: SPRITE_GRIDS['neuru'],
      legsAt: 16,
      pants: 'r',
      shoe: 'O',
      slideRows: [1, 2, 4, 5, 6, 7, 8, 9, 10, 12, 15],
      legs: humanLegs('r', 'r', 'O'),
    },
  },
  {
    id: 'eunsong',
    sprite: 'eunsong',
    name: '은송이',
    en: 'EUNSONG',
    tagline: '미선나무 꽃송이 요정 · 지나간 자리엔 좋은 향기',
    ability: {
      name: '활공 · 비밀의 힘',
      desc: '공중에서 점프를 누르고 있으면 천천히 내려온다. 판마다 다른 친구의 능력 하나가 깃든다',
    },
    stats: { glide: true },
    secret: true,
    art: {
      base: SPRITE_GRIDS['eunsong'],
      legsAt: 16,
      pants: 'z',
      shoe: 'G',
      slideRows: [0, 1, 3, 4, 6, 7, 9, 10, 12, 15],
      legs: {
        runA: [legRow({ 6: 'z', 9: 'z' }), legRow({ 5: 'z', 9: 'z' }), legRow({ 5: 'z', 10: 'z' }), legRow({ 5: 'G', 10: 'G' })],
        runB: [legRow({ 6: 'z', 9: 'z' }), legRow({ 6: 'z', 10: 'z' }), legRow({ 6: 'z', 11: 'z' }), legRow({ 6: 'G', 11: 'G' })],
        jump: [legRow({ 6: 'z', 9: 'z' }), legRow({ 6: 'G', 9: 'G' })],
      },
    },
  },
];

export function characterById(id: string | null | undefined): Character {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}

/**
 * 이번 판의 능력치. 은송이는 다른 다섯 명 중 하나의 능력이 무작위로 깃든다 —
 * 무엇이 깃들었는지는 돌려준 secretFrom 으로 알 수 있다.
 */
export function rollStats(c: Character, rng: () => number = Math.random): { stats: RunnerStats; secretFrom?: Character } {
  const stats = { ...BASE_STATS, ...c.stats };
  if (!c.secret) return { stats };
  const others = CHARACTERS.filter((o) => !o.secret);
  const from = others[Math.floor(rng() * others.length)];
  // 몸집은 은송이 그대로 — 능력만 빌려온다
  return { stats: { ...stats, ...from.stats, glide: true, standH: stats.standH }, secretFrom: from };
}
