import type { WeeklyGame } from '@/lib/types';
import styles from '@/app/weekly-gg/weekly-gg.module.css';

type QuestPosterProps = {
  game: WeeklyGame;
  /** 게시판에서의 순번 ("01") */
  no: string;
};

/** 제목에서 뽑은 색상 — 썸네일이 없는 의뢰서도 한 장 한 장 달라 보이게 한다 */
function hueOf(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 360;
  return h;
}

/**
 * 의뢰서 그림. 썸네일이 있으면 그 그림을, 없으면 쇼케이스의 빈 슬롯과 같은
 * 사선 줄무늬 위에 제목을 찍은 포스터를 보여준다.
 */
export default function QuestPoster({ game, no }: QuestPosterProps) {
  if (game.thumbnail) {
    return (
      <div className={styles.poster}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.posterImg} src={game.thumbnail} alt="" loading="lazy" />
        <span className={styles.posterNo}>QUEST {no}</span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.poster} ${styles.posterBlank}`}
      style={{ ['--poster-hue' as string]: hueOf(game.id) }}
    >
      <span className={styles.posterNo}>QUEST {no}</span>
      <strong className={styles.posterTitle}>{game.title}</strong>
      <span className={styles.posterEngine}>{game.engine}</span>
    </div>
  );
}
