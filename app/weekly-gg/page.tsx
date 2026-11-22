import Link from 'next/link';
import Frame from '@/components/Frame';
import ScreenHeader from '@/components/ScreenHeader';
import QuestPoster from '@/components/weekly/QuestPoster';
import weekly from '@/data/weekly-gg.json';
import type { WeeklyGame } from '@/lib/types';
import styles from './weekly-gg.module.css';

export const metadata = { title: 'WEEKLY GG — G DEV. F.C.' };

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * 주간줴줴 — 길드 의뢰 게시판.
 * 게임 한 편이 의뢰서 한 장이다. 계정 없이 누구나 들어와 바로 플레이한다.
 * 게임을 더하려면 data/weekly-gg.json 의 games 에 한 항목, public/wgg-builds/<id>/ 에 빌드를 넣는다.
 */
export default function WeeklyGGPage() {
  const games = weekly.games as WeeklyGame[];
  const { labels, stages, submit } = weekly;

  return (
    <Frame
      badge={weekly.badge}
      header={<ScreenHeader title={weekly.heading} aside={`${pad(games.length)} QUESTS`} />}
    >
      <div className={styles.board}>
        <header className={styles.boardHead}>
          <p className={styles.season}>
            <span className={styles.glyph} aria-hidden="true">
              ▸
            </span>
            {weekly.season}
          </p>
          <p className={styles.intro}>{weekly.intro}</p>
        </header>

        <ul className={styles.grid}>
          {games.map((game, i) => (
            <li key={game.id}>
              <Link href={`/weekly-gg/${game.id}`} className={styles.card}>
                <QuestPoster game={game} no={pad(i + 1)} />
                <div className={styles.cardBody}>
                  <div className={styles.cardTags}>
                    <span className={`${styles.stage} ${styles[game.stage]}`}>
                      {stages[game.stage].en}
                    </span>
                    <span className={`${styles.kind} ${styles[game.play.type]}`}>
                      {labels[game.play.type]}
                    </span>
                  </div>
                  <h2 className={styles.cardTitle}>{game.title}</h2>
                  <p className={styles.cardTagline}>{game.tagline}</p>
                  <p className={styles.cardMeta}>
                    <span>{game.creator}</span>
                    {game.genre && <span>{game.genre}</span>}
                  </p>
                </div>
              </Link>
            </li>
          ))}

          <li>
            <Link href="/weekly-gg/submit" className={`${styles.card} ${styles.submitCard}`}>
              <span className={styles.submitPlus} aria-hidden="true">
                +
              </span>
              <strong className={styles.submitTitle}>{submit.cardTitle}</strong>
              <span className={styles.submitText}>{submit.cardText}</span>
            </Link>
          </li>
        </ul>
      </div>
    </Frame>
  );
}
