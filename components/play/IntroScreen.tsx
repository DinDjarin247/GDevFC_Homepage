'use client';

import { useEffect, useRef, useState } from 'react';
import play from '@/data/play.json';
import Leaderboard from './Leaderboard';
import styles from './IntroScreen.module.css';

type IntroScreenProps = {
  onStart: () => void;
};

/**
 * 레트로 타이틀 카드 스타일의 설명 화면.
 * 끝까지 스크롤해야 "TOUCH TO START" 가 활성화된다 (짧아서 스크롤이 필요
 * 없는 화면에서는 마운트 시점에 곧바로 활성화된다).
 */
export default function IntroScreen({ onStart }: IntroScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  const checkBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 12;
    if (atBottom) setReady(true);
  };

  useEffect(() => {
    // 내용이 이미 다 보이는 화면(스크롤 불필요)이면 바로 활성화
    checkBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.scroll} ref={scrollRef} onScroll={checkBottom}>
        <div className={styles.titleCard}>
          <h1 className={styles.titleMain}>{play.intro.titleMain}</h1>
          <h1 className={styles.titleSub}>{play.intro.titleSub}</h1>
          <p className={styles.subtitle}>{play.intro.subtitle}</p>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{play.intro.controlsHeading}</h2>
          <div className={styles.controls}>
            {play.intro.controls.map((c) => (
              <div className={styles.controlRow} key={c.key}>
                <span className={styles.key}>{c.key}</span>
                <span className={styles.desc}>{c.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{play.intro.phasesHeading}</h2>
          <div className={styles.phases}>
            {play.intro.phases.map((p) => (
              <div className={styles.phaseCard} key={p.no}>
                <span className={styles.phaseNo}>{p.no}</span>
                <h3 className={styles.phaseTitle}>{p.title}</h3>
                <p className={styles.phaseDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{play.intro.rankingHeading}</h2>
          <Leaderboard limit={5} />
        </section>
      </div>

      <div className={styles.footer}>
        {!ready && <p className={styles.scrollHint}>{play.intro.scrollHint}</p>}
        <button
          type="button"
          className={`${styles.startButton} ${ready ? styles.ready : ''}`}
          disabled={!ready}
          onClick={onStart}
        >
          {play.intro.startHint}
        </button>
      </div>
    </div>
  );
}
