/**
 * 마을 광장 메뉴의 좌표계.
 *
 * 배경(PlazaScene 캔버스)과 그 위에 얹히는 캐릭터 버튼(ModePlaza DOM)이 같은 값을
 * 봐야 어긋나지 않으므로, 두 곳에서 쓰는 좌표를 여기에 모아둔다.
 * 캔버스는 PLAZA_W x PLAZA_H 가상 픽셀로 그리고, DOM 은 같은 비율(fx/fy)을 % 로 쓴다.
 */

export const PLAZA_W = 400;
export const PLAZA_H = 225;

export const toX = (fx: number) => fx * PLAZA_W;
export const toY = (fy: number) => fy * PLAZA_H;

/** 광장 바닥(타원 포석) */
export const PLAZA_FLOOR = { cx: 200, cy: 160, rx: 165, ry: 55 };

/**
 * 중앙 동상 자리 — 아직 동상이 없어 받침대와 자리 표시만 그린다.
 * topY 는 점선 실루엣의 꼭대기, labelY 는 그 위에 붙는 "동상 자리" 표식의 기준선.
 */
export const STATUE = { fx: 0.5, topY: 108, baseY: 163, labelY: 104 };

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
  // 도적 — 왼쪽 큰 나무 가지 위에서 광장을 내려다본다
  board: { fx: 0.115, fy: 0.402, scale: 0.78, place: '큰 나무 위', idle: 'perch' },
  // 우왕이 — 요리주점 텐트 앞 솥에서 요리 중
  play: {
    fx: 0.278,
    fy: 0.617,
    scale: 0.9,
    flip: true,
    place: '요리주점 텐트',
    altSprite: 'woowang-stir',
    idle: 'cook',
  },
  // 점성술사 — 별무늬 텐트 앞
  events: { fx: 0.663, fy: 0.617, scale: 0.9, place: '점성술 텐트', idle: 'read' },
  // 엘프 아처 — 오른쪽 과녁장에서 궁술 연습
  join: {
    fx: 0.845,
    fy: 0.702,
    scale: 0.95,
    place: '과녁장',
    altSprite: 'archer-draw',
    idle: 'shoot',
  },
  // 마법사 — 마법 스크롤 상점 좌판 앞
  showcase: { fx: 0.778, fy: 0.872, scale: 1.05, flip: true, place: '마법 스크롤 상점', idle: 'browse' },
  // 기사 — 광장 한켠 벤치에서 휴식
  about: { fx: 0.232, fy: 0.862, scale: 1.05, place: '광장 벤치', idle: 'rest' },
  // 바드 — 광장 앞쪽을 오가며 노래
  gallery: {
    fx: 0.5,
    fy: 0.9,
    scale: 1.05,
    place: '광장 한가운데',
    altSprite: 'bard-strum',
    idle: 'stroll',
  },
};

/** 자리가 지정되지 않은 모드를 위한 예비 배치 (광장 뒤편에 일렬로) */
export function fallbackSpot(order: number): PlazaSpot {
  return {
    fx: 0.34 + order * 0.1,
    fy: 0.5,
    scale: 0.8,
    place: '광장',
    idle: 'rest',
  };
}
