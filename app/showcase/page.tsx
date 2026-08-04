'use client';

import { useCallback, useRef, useState } from 'react';
import Frame from '@/components/Frame';
import ScreenHeader from '@/components/ScreenHeader';
import { useArcadeKeys } from '@/lib/useArcadeKeys';
import showcase from '@/data/showcase.json';
import type { ShowcaseSlot } from '@/lib/types';
import styles from './showcase.module.css';

const pad = (n: number) => String(n).padStart(2, '0');

export default function ShowcasePage() {
  const { empty } = showcase;
  const slots = showcase.slots as ShowcaseSlot[];
  const total = slots.length;

  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const slot = slots[index];
  const slotNo = pad(index + 1);
  const isEmpty = !slot.title;

  // 순환 이동 (마지막 → 처음)
  const move = useCallback(
    (delta: number) => setIndex((i) => (i + delta + total) % total),
    [total]
  );

  const prev = useCallback(() => move(-1), [move]);
  const next = useCallback(() => move(1), [move]);

  useArcadeKeys({ onPrev: prev, onNext: next });

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <Frame
      badge={showcase.badge}
      header={
        <ScreenHeader
          title={showcase.heading}
          aside={`${slotNo}/${pad(total)}`}
        />
      }
    >
      <div className={styles.stage}>
        <div className={styles.viewer}>
          <button
            type="button"
            className={styles.arrow}
            onClick={prev}
            aria-label="이전 슬롯"
          >
            ◀
          </button>

          <div
            className={styles.slot}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={onTouchEnd}
          >
            {slot.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                className={styles.shot}
                src={slot.image}
                alt={slot.title ?? `슬롯 ${slotNo}`}
              />
            ) : (
              <>
                <span className={styles.slotTag}>
                  <span aria-hidden="true">▸</span>
                  {empty.slotPrefix} {slotNo}
                </span>
                <strong className={styles.slotStatus}>{empty.status}</strong>
                <p className={styles.slotMessage}>{empty.message}</p>
              </>
            )}
          </div>

          <button
            type="button"
            className={styles.arrow}
            onClick={next}
            aria-label="다음 슬롯"
          >
            ▶
          </button>
        </div>

        <div className={styles.caption} aria-live="polite">
          <h2 className={styles.title}>
            <span className={styles.bracket} aria-hidden="true">
              【
            </span>
            {isEmpty ? `${empty.slotPrefix} ${slotNo}` : slot.title}
            <span className={styles.bracket} aria-hidden="true">
              】
            </span>
          </h2>
          <p className={styles.summary}>{slot.summary ?? empty.summary}</p>
          <p className={styles.meta}>
            {isEmpty || !slot.genre
              ? empty.meta
              : `${slot.genre} · ${slot.period ?? ''}`}
          </p>
        </div>

        <div className={styles.dots}>
          {slots.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.dot} ${i === index ? styles.on : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`슬롯 ${pad(i + 1)} 보기`}
            />
          ))}
        </div>
      </div>
    </Frame>
  );
}
