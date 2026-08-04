/** data/*.json 의 스키마 정의 */

export type Mode = {
  id: string;
  no: string;
  label: string;
  href: string;
  /** public/ 기준 경로. null 이면 내장 픽셀 스프라이트로 대체된다. */
  image: string | null;
  sprite: string;
  alt: string;
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
