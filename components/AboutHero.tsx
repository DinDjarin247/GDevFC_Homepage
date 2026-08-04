'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from './AboutHero.module.css';

type HeroLine = {
  id: string;
  tone: string;
  text: string[];
};

type AboutHeroProps = {
  lines: HeroLine[];
  skipHint: string;
};

/** 줄 사이 등장 간격 (ms) */
const STEP_MS = 780;

export default function AboutHero({ lines, skipHint }: AboutHeroProps) {
  const [shown, setShown] = useState(0);

  const revealAll = useCallback(() => setShown(lines.length), [lines.length]);

  useEffect(() => {
    // 모션 최소화 설정이면 애니메이션 없이 즉시 전체 노출
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reduced) {
      revealAll();
      return;
    }

    const timers = lines.map((_, i) =>
      window.setTimeout(() => setShown((n) => Math.max(n, i + 1)), 260 + i * STEP_MS)
    );

    return () => timers.forEach(window.clearTimeout);
  }, [lines, revealAll]);

  const done = shown >= lines.length;

  return (
    <section
      className={`${styles.hero} ${done ? styles.done : ''}`}
      onClick={revealAll}
      aria-label="G DEV. F.C. 매니페스토"
    >
      {lines.map((line, i) => (
        <p
          key={line.id}
          className={`${styles.line} ${styles[line.tone] ?? ''} ${
            i < shown ? styles.shown : ''
          }`}
        >
          {line.text.map((part) => (
            <span key={part}>{part}</span>
          ))}
        </p>
      ))}

      {!done && (
        <button type="button" className={styles.skip} onClick={revealAll}>
          {skipHint}
        </button>
      )}
    </section>
  );
}
