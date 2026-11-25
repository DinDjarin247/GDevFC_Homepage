/**
 * 마을 광장 메뉴의 좌표계.
 *
 * 배경(PlazaScene 캔버스)과 그 위에 얹히는 캐릭터 버튼(ModePlaza DOM)이 같은 값을
 * 봐야 어긋나지 않는다. 광장 그림은 art/plaza 의 스크립트가 굽고, 그때 소품과 주인공의
 * 자리도 함께 lib/plazaArt.ts 로 내보낸다 — 자리를 옮기려면 art/plaza/placement.js 를
 * 고치고 `npm run art` 를 다시 돌린다.
 *
 * 캔버스는 PLAZA_W x PLAZA_H 픽셀로 그리고, DOM 은 같은 비율(fx/fy)을 % 로 쓴다.
 */
import { PLAZA_ART } from './plazaArt';

export const PLAZA_W = PLAZA_ART.w;
export const PLAZA_H = PLAZA_ART.h;

/** 화면 좌표 → 캔버스 전체 대비 비율 (DOM 에서 % 로 쓰기 위한 변환) */
export const sceneFx = (x: number) => x / PLAZA_W;
export const sceneFy = (y: number) => y / PLAZA_H;

/**
 * 동상 자리 — 분수 한가운데 받침대 위. 아직 동상이 없어 점선 실루엣만 그린다.
 * baseY 는 받침대 윗면, topY 는 실루엣의 꼭대기, labelY 는 그 위에 붙는 "동상 자리" 표식의 기준선.
 */
const STATUE_BASE = PLAZA_ART.statue.baseY;
export const STATUE = {
  x: PLAZA_ART.statue.x,
  baseY: STATUE_BASE,
  topY: STATUE_BASE - 58,
  labelY: STATUE_BASE - 66,
};

export type PlazaSpot = {
  /** 캐릭터 발이 닿는 지점 — 캔버스 픽셀 */
  x: number;
  y: number;
  /** 같은 자리의 마을 사람보다 얼마나 크게 그렸는지 */
  scale: number;
  /** 화면에 띄우는 장소 이름 */
  place: string;
};

/**
 * modes.json 의 id 로 자리를 찾는다. 새 모드가 자리 없이 추가돼도
 * ModePlaza 가 기본 자리에 배치하므로 화면이 깨지지 않는다.
 *
 *   board      도적 — 큰 계단 난간 위에 걸터앉아 있다
 *   weekly-gg  우왕이 — 분수 옆에 소파와 TV 를 내놓고 게임기를 붙잡고 있다 (주간줴줴)
 *   events     점성술사 — 별무늬 천막 앞
 *   join       엘프 아처 — 성벽 아래 과녁장
 *   showcase   마법사 — 앞쪽 마법 두루마리 좌판
 *   about      기사 — 화톳불 옆 벤치
 *   gallery    바드 — 분수 앞을 오가며 노래
 */
export const PLAZA_SPOTS: Record<string, PlazaSpot> = PLAZA_ART.spots;

/**
 * 주인공을 누를 수 있는 상자 (캔버스 픽셀) — 발밑 가운데가 기준.
 * 그림은 캔버스가 그리고, 메뉴는 이 크기의 보이지 않는 버튼만 얹는다.
 */
export const HERO_BOX: Record<string, { w: number; h: number }> = Object.fromEntries(
  Object.entries(PLAZA_ART.heroes as unknown as Record<string, { hero: string; height: number }>).map(([id, h]) => [
    id,
    { w: Math.round(h.height * (h.hero === 'rogue' || h.hero === 'woowang' ? 0.82 : 0.56)), h: h.height },
  ]),
);

/** 자리가 지정되지 않은 모드를 위한 예비 배치 (큰 계단 아래에 일렬로) */
export function fallbackSpot(order: number): PlazaSpot {
  return {
    x: 300 + order * 52,
    y: 424,
    scale: 0.8,
    place: '광장',
  };
}

/* ---------- 시간대 ---------- */

export type DayPhase = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';

export const PHASE_LABEL: Record<DayPhase, { ko: string; en: string }> = {
  dawn: { ko: '새벽', en: 'DAWN' },
  morning: { ko: '아침', en: 'MORNING' },
  noon: { ko: '점심', en: 'NOON' },
  afternoon: { ko: '오후', en: 'AFTERNOON' },
  evening: { ko: '저녁', en: 'EVENING' },
  night: { ko: '심야', en: 'NIGHT' },
};

/** 접속한 기기의 현지 시각으로 광장의 시간대를 정한다 */
export function phaseForHour(hour: number): DayPhase {
  if (hour < 5) return 'night';
  if (hour < 8) return 'dawn';
  if (hour < 11) return 'morning';
  if (hour < 14) return 'noon';
  if (hour < 17) return 'afternoon';
  if (hour < 20) return 'evening';
  return 'night';
}
