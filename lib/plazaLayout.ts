/**
 * 마을 광장 메뉴의 좌표계.
 *
 * 배경(PlazaScene 캔버스)과 그 위에 얹히는 캐릭터 버튼(ModePlaza DOM)이 같은 값을
 * 봐야 어긋나지 않으므로, 두 곳에서 쓰는 좌표를 여기에 모아둔다.
 * 캔버스는 PLAZA_W x PLAZA_H 가상 픽셀로 그리고, DOM 은 같은 비율(fx/fy)을 % 로 쓴다.
 */

export const PLAZA_W = 480;
export const PLAZA_H = 216;

export const toX = (fx: number) => fx * PLAZA_W;
export const toY = (fy: number) => fy * PLAZA_H;

/** 광장 바닥(타원 포석) */
export const PLAZA_FLOOR = { cx: 240, cy: 166, rx: 214, ry: 50 };

/**
 * 중앙 동상 자리 — 아직 동상이 없어 받침대와 자리 표시만 그린다.
 * topY 는 점선 실루엣의 꼭대기, labelY 는 그 위에 붙는 "동상 자리" 표식의 기준선.
 */
export const STATUE = { fx: 0.5, topY: 116, baseY: 174, labelY: 112 };

export type PlazaSpot = {
  /** 캐릭터 발이 닿는 지점 (광장 폭·높이 대비 비율) */
  fx: number;
  fy: number;
  /** 원근감용 크기 배율 — 뒤쪽일수록 작게 */
  scale: number;
  /** 스프라이트를 좌우 반전할지 (기본은 오른쪽을 보는 그림) */
  flip?: boolean;
  /** 화면에 띄우는 장소 이름 */
  place: string;
  /** 기본 프레임과 번갈아 보여줄 2프레임 스프라이트 (없으면 숨쉬기만) */
  altSprite?: string;
  /** idle 연출 종류 — CSS 클래스와 1:1 대응 */
  idle: 'rest' | 'browse' | 'perch' | 'cook' | 'read' | 'shoot' | 'stroll';
};

/**
 * modes.json 의 id 로 자리를 찾는다. 새 모드가 자리 없이 추가돼도
 * ModePlaza 가 기본 자리에 배치하므로 화면이 깨지지 않는다.
 */
export const PLAZA_SPOTS: Record<string, PlazaSpot> = {
  // 도적 — 광장 왼쪽 큰 나무의 왼쪽 가지 위 (단풍 앞이라 실루엣이 잘 보인다)
  board: { fx: 0.092, fy: 0.472, scale: 0.72, place: '광장 어귀 큰 나무', idle: 'perch' },
  // 우왕이 — 선술집 앞 솥에서 요리 중
  play: {
    fx: 0.3,
    fy: 0.663,
    scale: 0.84,
    flip: true,
    place: '선술집 앞 가마솥',
    altSprite: 'woowang-stir',
    idle: 'cook',
  },
  // 점성술사 — 광장에 친 별무늬 천막
  events: { fx: 0.655, fy: 0.681, scale: 0.84, place: '점성술 천막', idle: 'read' },
  // 엘프 아처 — 오른쪽 담벼락 과녁장
  join: {
    fx: 0.855,
    fy: 0.735,
    scale: 0.88,
    place: '담벼락 과녁장',
    altSprite: 'archer-draw',
    idle: 'shoot',
  },
  // 마법사 — 앞쪽 마법 두루마리 좌판
  showcase: { fx: 0.775, fy: 0.895, scale: 1, flip: true, place: '마법 두루마리 좌판', idle: 'browse' },
  // 기사 — 광장 벤치와 화톳불
  about: { fx: 0.225, fy: 0.885, scale: 1, place: '광장 벤치', idle: 'rest' },
  // 바드 — 광장 앞을 오가며 노래
  gallery: {
    fx: 0.5,
    fy: 0.915,
    scale: 1,
    place: '광장 한가운데',
    altSprite: 'bard-strum',
    idle: 'stroll',
  },
};

/** 자리가 지정되지 않은 모드를 위한 예비 배치 (광장 뒤편에 일렬로) */
export function fallbackSpot(order: number): PlazaSpot {
  return {
    fx: 0.34 + order * 0.09,
    fy: 0.56,
    scale: 0.75,
    place: '광장',
    idle: 'rest',
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
