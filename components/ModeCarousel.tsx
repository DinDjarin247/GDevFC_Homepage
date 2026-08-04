'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Sprite from './Sprite';
import { useArcadeKeys } from '@/lib/useArcadeKeys';
import type { Mode } from '@/lib/types';
import styles from './ModeCarousel.module.css';

type ModeCarouselProps = {
  heading: string;
  hint: string;
  modes: Mode[];
  /** 잠긴 카드 호버 시 표시할 문구 (예: "COMING SOON") */
  comingSoonLabel: string;
};

export default function ModeCarousel({
  heading,
  hint,
  modes,
  comingSoonLabel,
}: ModeCarouselProps) {
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
    if (current.locked || !current.href) return;
    router.push(current.href);
  }, [router, current]);

  const prev = useCallback(() => move(-1), [move]);
  const next = useCallback(() => move(1), [move]);

  // 선택된 모드는 미리 로드해 진입을 매끄럽게 (잠긴 슬롯은 href 가 없음)
  useEffect(() => {
    modes.forEach((m) => {
      if (m.href) router.prefetch(m.href);
    });
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
              const showImage = Boolean(mode.image) && !failed[mode.id] && !mode.locked;

              return (
                <button
                  key={mode.id}
                  type="button"
                  className={`${styles.card} ${isActive ? styles.active : ''} ${
                    mode.locked ? styles.locked : ''
                  }`}
                  aria-current={isActive}
                  aria-disabled={mode.locked || undefined}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => {
                    if (!isActive) {
                      setIndex(i);
                      return;
                    }
                    enter();
                  }}
                >
                  {mode.locked ? (
                    <>
                      <Sprite name={mode.sprite} silhouette className={styles.sprite} />
                      <span className={styles.comingSoon}>{comingSoonLabel}</span>
                    </>
                  ) : showImage ? (
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
