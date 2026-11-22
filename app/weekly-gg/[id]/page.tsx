import Link from 'next/link';
import { notFound } from 'next/navigation';
import Frame from '@/components/Frame';
import ScreenHeader from '@/components/ScreenHeader';
import GamePlayer from '@/components/weekly/GamePlayer';
import weekly from '@/data/weekly-gg.json';
import type { WeeklyGame } from '@/lib/types';
import styles from '../weekly-gg.module.css';

const games = weekly.games as WeeklyGame[];

/** 정적 export — 등록된 게임만 페이지로 굽는다 */
export const dynamicParams = false;

export function generateStaticParams() {
  return games.map((game) => ({ id: game.id }));
}

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const game = games.find((g) => g.id === id);
  return { title: `${game ? game.title : 'WEEKLY GG'} — ${weekly.season}` };
}

export default async function WeeklyGamePage({ params }: Params) {
  const { id } = await params;
  const game = games.find((g) => g.id === id);
  if (!game) notFound();

  const { labels, stages } = weekly;

  return (
    <Frame
      badge={weekly.badge}
      header={
        <ScreenHeader
          title={weekly.heading}
          backHref="/weekly-gg"
          aside={stages[game.stage].en}
        />
      }
    >
      <article className={styles.detail}>
        <header className={styles.detailHead}>
          <div className={styles.cardTags}>
            <span className={`${styles.stage} ${styles[game.stage]}`}>
              {stages[game.stage].label} · {stages[game.stage].en}
            </span>
            <span className={`${styles.kind} ${styles[game.play.type]}`}>
              {labels[game.play.type]}
            </span>
            <span className={styles.engine}>{game.engine}</span>
          </div>
          <h2 className={styles.detailTitle}>{game.title}</h2>
          {game.tagline && <p className={styles.detailTagline}>{game.tagline}</p>}
        </header>

        <GamePlayer game={game} />

        <div className={styles.info}>
          <section className={styles.infoMain}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.glyph} aria-hidden="true">
                ▸
              </span>
              {labels.about}
            </h3>
            {game.description && <p className={styles.description}>{game.description}</p>}
            {game.guide && (
              <>
                <h3 className={styles.sectionTitle}>
                  <span className={styles.glyph} aria-hidden="true">
                    ▸
                  </span>
                  {labels.howToPlay}
                </h3>
                <ol className={styles.steps}>
                  {game.guide.steps.map((step) => (
                    <li key={step.title}>
                      <strong>{step.title}</strong>
                      <p>{step.text}</p>
                      {step.points && (
                        <ul>
                          {step.points.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
                {game.guide.note && <p className={styles.guideNote}>{game.guide.note}</p>}
              </>
            )}
            <dl className={styles.facts}>
              <div>
                <dt>{labels.creator}</dt>
                <dd>{game.creator}</dd>
              </div>
              {game.genre && (
                <div>
                  <dt>GENRE</dt>
                  <dd>{game.genre}</dd>
                </div>
              )}
              <div>
                <dt>ENGINE</dt>
                <dd>{game.engine}</dd>
              </div>
            </dl>
          </section>

          {game.controls.length > 0 && (
            <section className={styles.infoSide}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.glyph} aria-hidden="true">
                  ▸
                </span>
                {labels.controls}
              </h3>
              <ul className={styles.controls}>
                {game.controls.map((c) => (
                  <li key={c.key}>
                    <kbd className={styles.key}>{c.key}</kbd>
                    <span>{c.action}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <Link href="/weekly-gg" className={styles.backLink}>
          <span aria-hidden="true">‹</span> {labels.back}
        </Link>
      </article>
    </Frame>
  );
}
