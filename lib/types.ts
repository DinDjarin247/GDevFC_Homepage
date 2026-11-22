/** data/*.json 의 스키마 정의 */

export type Mode = {
  id: string;
  no: string;
  label: string;
  /** locked 슬롯은 href 가 없다 */
  href: string | null;
  /** public/ 기준 경로. null 이면 내장 픽셀 스프라이트로 대체된다. */
  image: string | null;
  sprite: string;
  alt: string;
  /** true 면 실루엣 + "COMING SOON" 만 보여주고 진입은 막는다 */
  locked?: boolean;
};

export type ShowcaseSlot = {
  id: string;
  /** null 이면 NO DATA 슬롯으로 렌더링된다. */
  title: string | null;
  summary: string | null;
  genre: string | null;
  period: string | null;
  image: string | null;
};

export type JoinField = {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  options?: string[];
};

/** 주간줴줴 — 게임을 어떻게 내보일지 */
export type WeeklyPlay =
  | {
      type: 'web';
      /** public/ 기준 빌드 진입 파일 */
      src: string;
      /** CSS aspect-ratio 값 (예: "16 / 9") */
      aspect: string;
      /** false 면 터치 기기에서 "PC 전용" 안내를 띄운다 */
      mobile: boolean;
      /** 페이지형 게임(메뉴가 세로로 긴 경우)은 iframe 스크롤을 허용한다 */
      scroll?: boolean;
    }
  | { type: 'download'; file: string; size: string; run: string }
  | { type: 'soon'; note: string };

export type WeeklyGame = {
  id: string;
  title: string;
  creator: string;
  stage: 'proto' | 'alpha' | 'beta';
  engine: string;
  genre: string;
  tagline: string;
  description: string;
  controls: { key: string; action: string }[];
  thumbnail: string | null;
  play: WeeklyPlay;
};
