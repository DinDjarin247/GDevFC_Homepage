import type { CSSProperties } from 'react';
import Sprite from './Sprite';
import { PLAZA_ART } from '@/lib/plazaArt';

type HeroSpriteProps = {
  /** modes.json 의 sprite 이름 (예: 'knight', 'bard-strum') */
  name: string;
  className?: string;
  /** 잠긴 모드 — 검은 실루엣으로만 보여준다 */
  silhouette?: boolean;
};

const { cell, names } = PLAZA_ART.heroes;
const COUNT = names.length;
const INDEX: Record<string, number> = Object.fromEntries(names.map((n, i) => [n, i]));

/** 주인공 한 칸의 가로세로 비 (가로 / 세로) — CSS 에서 폭을 정할 때 쓴다 */
export const HERO_ASPECT = cell[0] / cell[1];

/**
 * 광장의 주인공 그림.
 *
 * art/plaza 가 구운 heroes.png (한 줄로 늘어선 시트)에서 한 칸을 잘라 보여준다.
 * 시트에 없는 이름이면 예전의 16x22 격자 스프라이트(Sprite)로 대신한다 — 새 모드를
 * 그림 없이 먼저 추가해도 화면이 비지 않는다.
 */
export default function HeroSprite({ name, className, silhouette = false }: HeroSpriteProps) {
  const index = INDEX[name];
  if (index === undefined) return <Sprite name={name} className={className} silhouette={silhouette} />;

  const style: CSSProperties = {
    aspectRatio: `${cell[0]} / ${cell[1]}`,
    backgroundImage: 'url(/art/plaza/heroes.png)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${COUNT * 100}% 100%`,
    backgroundPosition: `${COUNT > 1 ? (index / (COUNT - 1)) * 100 : 0}% 0`,
  };
  return <span className={className} style={style} data-hero="" data-silhouette={silhouette || undefined} aria-hidden="true" />;
}
