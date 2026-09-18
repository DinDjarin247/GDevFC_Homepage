'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Sprite from './Sprite';
import PlazaScene from './PlazaScene';
import { useArcadeKeys } from '@/lib/useArcadeKeys';
import {
  PHASE_LABEL,
  PLAZA_SPOTS,
  STATUE,
  fallbackSpot,
  phaseForHour,
  sceneFx,
  sceneFy,
  type DayPhase,
  type PlazaSpot,
} from '@/lib/plazaLayout';
import type { Mode } from '@/lib/types';
import styles from './ModePlaza.module.css';

type ModePlazaProps = {
  heading: string;
  hint: string;
  modes: Mode[];
  /** 잠긴 자리에 표시할 문구 (예: "COMING SOON") */
  comingSoonLabel: string;
};

/** idle 프레임 전환 주기 */
const TICK_MS = 400;

/**
 * 2프레임 캐릭터가 지금 어떤 스프라이트를 쓸지 고른다.
 * 캐릭터마다 리듬이 달라야 자연스러워서 주기를 다르게 잡는다.
 */
function currentSprite(mode: Mode, spot: PlazaSpot, tick: number) {
  if (!spot.altSprite) return mode.sprite;
  if (spot.idle === 'shoot') {
    // 4초 주기로 1.6초 동안 활을 당긴 자세 유지 → 배경 캔버스의 화살과 리듬을 맞춘다
    return tick % 10 < 4 ? spot.altSprite : mode.sprite;
  }
  if (spot.idle === 'cook') return tick % 4 < 2 ? spot.altSprite : mode.sprite;
  return tick % 2 === 0 ? spot.altSprite : mode.sprite;
}

export default function ModePlaza({ heading, hint, modes, comingSoonLabel }: ModePlazaProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);
  /**
   * 시간대는 접속 기기의 현지 시각으로 정한다. 정적 export 라 서버에서는 알 수 없으므로
   * 마운트 후에 계산해야 하이드레이션이 어긋나지 않는다.
   */
  const [phase, setPhase] = useState<DayPhase | null>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  /** 키보드로 옮겼을 때만 화면을 따라 스크롤한다 (마우스 호버로는 움직이지 않게) */
  const keyboardMoveRef = useRef(false);

  const total = modes.length;
  const current = modes[index];

  useEffect(() => {
    const id = setInterval(() => setTick((v) => (v + 1) % 120), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // 자정을 넘기거나 시간대가 바뀌면 광장도 따라 바뀐다 (1분마다 확인)
  useEffect(() => {
    const update = () => setPhase(phaseForHour(new Date().getHours()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    modes.forEach((m) => {
      if (m.href) router.prefetch(m.href);
    });
  }, [modes, router]);

  const move = useCallback((delta: number) => {
    keyboardMoveRef.current = true;
    setIndex((i) => (i + delta + total) % total);
  }, [total]);

  const enter = useCallback(() => {
    if (current?.locked || !current?.href) return;
    router.push(current.href);
  }, [router, current]);

  const prev = useCallback(() => move(-1), [move]);
  const next = useCallback(() => move(1), [move]);

  useArcadeKeys({ onPrev: prev, onNext: next, onEnter: enter });

  // 좁은 화면에서는 광장이 가로로 넘치므로, 선택된 캐릭터를 화면 안으로 끌어온다
  useEffect(() => {
    if (!keyboardMoveRef.current) return;
    keyboardMoveRef.current = false;
    buttonsRef.current[index]?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: 'smooth',
    });
  }, [index]);

  return (
    <div className={styles.wrap}>
      <div className={styles.stageScroll}>
        <div className={styles.stage}>
          {phase && <PlazaScene key={phase} className={styles.scene} phase={phase} />}

          {/* 제목·안내문은 광장 위에 얹는다 — 위아래 띠를 없애 화면을 꽉 채우기 위해 */}
          <h1 className={styles.heading}>{heading}</h1>

          {phase && (
            <span className={styles.phaseTag}>
              <span className={styles.phaseKo}>{PHASE_LABEL[phase].ko}</span>
              <span className={styles.phaseEn}>{PHASE_LABEL[phase].en}</span>
            </span>
          )}

          {/* 중앙 동상 자리 — 디자이너에게 "여기 들어갑니다" 를 보여주는 표식 */}
          <div
            className={styles.statue}
            style={{
              left: `${sceneFx(STATUE.x) * 100}%`,
              top: `${sceneFy(STATUE.labelY) * 100}%`,
            }}
          >
            <span className={styles.statueTag}>동상 자리</span>
            <span className={styles.statueSub}>STATUE HERE</span>
          </div>

          {modes.map((mode, i) => {
            const spot = PLAZA_SPOTS[mode.id] ?? fallbackSpot(i);
            const isActive = i === index;
            const sprite = currentSprite(mode, spot, tick);

            return (
              <button
                key={mode.id}
                ref={(el) => {
                  buttonsRef.current[i] = el;
                }}
                type="button"
                className={`${styles.char} ${isActive ? styles.active : ''} ${
                  mode.locked ? styles.locked : ''
                } ${spot.idle === 'stroll' ? styles.walking : ''}`}
                style={
                  {
                    left: `${sceneFx(spot.x) * 100}%`,
                    top: `${sceneFy(spot.y) * 100}%`,
                    '--scale': spot.scale,
                  } as CSSProperties
                }
                aria-current={isActive}
                aria-disabled={mode.locked || undefined}
                aria-label={`${mode.no} ${mode.label} — ${spot.place}`}
                onMouseEnter={() => setIndex(i)}
                onFocus={() => setIndex(i)}
                onClick={() => {
                  setIndex(i);
                  if (mode.locked || !mode.href) return;
                  router.push(mode.href);
                }}
              >
                <span className={styles.plate} aria-hidden="true">
                  <span className={styles.plateNo}>{mode.no}</span>
                  <span className={styles.plateLabel}>
                    {mode.locked ? comingSoonLabel : mode.label}
                  </span>
                  <span className={styles.platePlace}>{spot.place}</span>
                </span>

                <span className={`${styles.body} ${styles[spot.idle]}`}>
                  <Sprite
                    name={sprite}
                    silhouette={mode.locked}
                    className={`${styles.sprite} ${spot.flip ? styles.flip : ''}`}
                  />
                </span>

                <span className={styles.glow} aria-hidden="true" />
              </button>
            );
          })}

          <p className={styles.hint}>
            <span className={styles.hintMark} aria-hidden="true">
              ▪
            </span>
            {hint}
          </p>
        </div>
      </div>
    </div>
  );
}
