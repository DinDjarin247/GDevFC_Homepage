'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Sprite from './Sprite';
import { useArcadeKeys } from '@/lib/useArcadeKeys';
import styles from './ModeCarousel.module.css';

type Mode = {
  id: string;
  no: string;
  label: string;
  href: string;
  image: string | null;
  sprite: string;
  alt: string;
};

type ModeCarouselProps = {
  heading: string;
  hint: string;
  modes: Mode[];
};

export default function ModeCarousel({ heading, hint, modes }: ModeCarouselProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const touchStartX = useRef<number | null>(null);

  const total = modes.length;
  const current = modes[index];

  // 순환 이동 (마지막 → 처음)
  const move = useCallback(
    (delta: number) => setIndex((i) => (i + delta + total) % total),
    [total]
  );

  const enter = useCallback(() => {
    router.push(current.href);
  }, [router, current.href]);

  const prev = useCallback(() => move(-1), [move]);
  const next = useCallback(() => move(1), [move]);

  // 선택된 모드는 미리 로드해 진입을 매끄럽게
  useEffect(() => {
    modes.forEach((m) => router.prefetch(m.href));
  }, [modes, router]);

  // 키보드: ← → 로 이동, Enter 로 진입
  useArcadeKeys({ onPrev: prev, onNext: next, onEnter: enter });

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <div className={styles.wrap}>
      <h1 className={styles.heading}>{heading}</h1>

      <div className={styles.carousel}>
        <button
          type="button"
          className={`${styles.arrow} ${styles.prev}`}
          onClick={prev}
          aria-label="이전 모드"
        >
          ◀
        </button>

        <div
          className={styles.viewport}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={onTouchEnd}
        >
          <div
            className={styles.track}
            style={{ '--index': index } as CSSProperties}
          >
            {modes.map((mode, i) => {
              const isActive = i === index;
              const showImage = Boolean(mode.image) && !failed[mode.id];

              return (
                <button
                  key={mode.id}
                  type="button"
                  className={`${styles.card} ${isActive ? styles.active : ''}`}
                  aria-current={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => (isActive ? enter() : setIndex(i))}
                >
                  {showImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      className={styles.art}
                      src={mode.image as string}
                      alt={mode.alt}
                      onError={() =>
                        setFailed((f) => ({ ...f, [mode.id]: true }))
                      }
                    />
                  ) : (
                    <Sprite name={mode.sprite} className={styles.sprite} />
                  )}

                  <span className={styles.meta}>
                    <span className={styles.no}>{mode.no}</span>
                    <span className={styles.label}>{mode.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className={`${styles.arrow} ${styles.next}`}
          onClick={next}
          aria-label="다음 모드"
        >
          ▶
        </button>
      </div>

      <div className={styles.dots}>
        {modes.map((mode, i) => (
          <button
            key={mode.id}
            type="button"
            className={`${styles.dot} ${i === index ? styles.on : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`${mode.label} 선택`}
          />
        ))}
      </div>

      <p className={styles.hint}>
        <span className={styles.hintMark} aria-hidden="true">
          ▪
        </span>
        {hint}
      </p>
    </div>
  );
}
