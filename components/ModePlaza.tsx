'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Sprite from './Sprite';
import PlazaScene, { type HeroControl } from './PlazaScene';
import { useArcadeKeys } from '@/lib/useArcadeKeys';
import {
  HERO_BOX,
  PHASE_LABEL,
  PLAZA_SPOTS,
  SEASON_LABEL,
  STATUE,
  clockText,
  fallbackSpot,
  phaseAt,
  sceneFx,
  sceneFy,
  seasonAt,
  sunTimes,
  type DayPhase,
  type Season,
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

/**
 * SELECT MODE — 광장의 주인공을 골라 들어간다.
 *
 * 주인공 그림과 동작은 배경 캔버스(PlazaScene)가 마을 사람과 함께 그린다.
 * 여기서는 그 자리에 보이지 않는 버튼(클릭 · 키보드 · 이름표 · 머리 위 표식)만 얹고,
 * 지금 고른 주인공을 캔버스에 알려 준다 — 고른 주인공은 화면을 보고 인사한다.
 * 걸어 다니는 주인공(바드)은 캔버스가 자리를 알려 주면 버튼이 따라간다.
 */
export default function ModePlaza({ heading, hint, modes, comingSoonLabel }: ModePlazaProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  /**
   * 시간대는 접속 기기의 현지 시각으로 정한다. 정적 export 라 서버에서는 알 수 없으므로
   * 마운트 후에 계산해야 하이드레이션이 어긋나지 않는다.
   */
  const [phase, setPhase] = useState<DayPhase | null>(null);
  const [season, setSeason] = useState<Season>('autumn');
  const [sunset, setSunset] = useState('');
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  /** 키보드로 옮겼을 때만 화면을 따라 스크롤한다 (마우스 호버로는 움직이지 않게) */
  const keyboardMoveRef = useRef(false);

  const total = modes.length;
  const current = modes[index];

  const control = useRef<HeroControl | null>(null);
  if (!control.current) {
    control.current = {
      active: null,
      locked: Object.fromEntries(modes.map((m) => [m.id, !!m.locked])),
      move: (id, x, y) => {
        const i = modes.findIndex((m) => m.id === id);
        const el = buttonsRef.current[i];
        if (!el) return;
        el.style.left = `${sceneFx(x) * 100}%`;
        el.style.top = `${sceneFy(y) * 100}%`;
      },
    };
  }
  useEffect(() => {
    if (control.current) control.current.active = current?.id ?? null;
  }, [current]);

  // 시간대는 그날 실제로 해 뜨고 지는 시각(청주 기준)으로 정한다 — 1분마다 확인.
  // 계절 옷은 날짜로 정하고, 주소에 ?season=autumn 처럼 붙이면 그 옷으로 볼 수 있다
  useEffect(() => {
    const override = new URLSearchParams(window.location.search).get('season');
    const update = () => {
      const now = new Date();
      setPhase(phaseAt(now));
      setSeason(seasonAt(now, override));
      setSunset(clockText(sunTimes(now).sunset));
    };
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
        <div className={styles.stage} data-phase={phase ?? undefined}>
          {phase && <PlazaScene key={`${season}-${phase}`} className={styles.scene} phase={phase} season={season} control={control} />}

          {/* 제목·안내문은 광장 위에 얹는다 — 위아래 띠를 없애 화면을 꽉 채우기 위해 */}
          <h1 className={styles.heading}>{heading}</h1>

          {phase && (
            <span className={styles.phaseTag}>
              <span className={styles.phaseKo}>
                {season === 'christmas' ? `${SEASON_LABEL[season]} · ` : ''}
                {PHASE_LABEL[phase].ko}
              </span>
              <span className={styles.phaseEn}>{PHASE_LABEL[phase].en}</span>
              {sunset && <span className={styles.phaseSun}>일몰 {sunset}</span>}
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
            const box = HERO_BOX[mode.id];
            const isActive = i === index;
            // 광장 그림이 없는 새 모드는 예전 격자 스프라이트로 대신 세운다
            const w = box?.w ?? 30;
            const h = box?.h ?? 42;

            return (
              <button
                key={mode.id}
                ref={(el) => {
                  buttonsRef.current[i] = el;
                }}
                type="button"
                className={`${styles.char} ${isActive ? styles.active : ''} ${mode.locked ? styles.locked : ''}`}
                style={
                  {
                    left: `${sceneFx(spot.x) * 100}%`,
                    top: `${sceneFy(spot.y) * 100}%`,
                    width: `${sceneFx(w) * 100}%`,
                    height: `${sceneFy(h) * 100}%`,
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
                <span className={styles.marker} aria-hidden="true" />

                <span className={styles.plate} aria-hidden="true">
                  <span className={styles.plateNo}>{mode.no}</span>
                  <span className={styles.plateLabel}>
                    {mode.locked ? comingSoonLabel : mode.label}
                  </span>
                  <span className={styles.platePlace}>{spot.place}</span>
                </span>

                {!box && <Sprite name={mode.sprite} silhouette={mode.locked} className={styles.fallback} />}

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
