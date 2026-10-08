'use client';

import { useCallback, useEffect, useState } from 'react';
import Sprite from '@/components/Sprite';
import { CHARACTERS, type CharacterId } from '@/lib/run/characters';
import styles from './CharacterSelect.module.css';

const CHOICE_KEY = 'gdevfc_run_character';
const COLS = 3;

function readChoice(): number {
  try {
    const id = window.localStorage.getItem(CHOICE_KEY);
    const i = CHARACTERS.findIndex((c) => c.id === id);
    return i >= 0 ? i : 0;
  } catch {
    return 0;
  }
}

type CharacterSelectProps = {
  onPick: (id: CharacterId) => void;
};

/**
 * 달려라 우왕이 V2 — 캐릭터 선택. 왼쪽에 고른 캐릭터를 크게(이름 · 소개 · 고유 능력),
 * 오른쪽에 여섯 명의 타일. ← → ↑ ↓ 로 고르고 Enter / Space 로 출발한다.
 * 마지막으로 고른 캐릭터를 기억해 다음에 그 자리에서 시작한다.
 */
export default function CharacterSelect({ onPick }: CharacterSelectProps) {
  const [index, setIndex] = useState(0);
  const current = CHARACTERS[index];

  // 기억해 둔 선택은 마운트 뒤에 읽는다 (정적 export 라 서버에선 알 수 없다)
  useEffect(() => setIndex(readChoice()), []);

  const go = useCallback(() => {
    try {
      window.localStorage.setItem(CHOICE_KEY, CHARACTERS[index].id);
    } catch {
      // 기억 못 해도 그만
    }
    onPick(CHARACTERS[index].id);
  }, [index, onPick]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const n = CHARACTERS.length;
      if (e.code === 'ArrowRight') setIndex((i) => (i + 1) % n);
      else if (e.code === 'ArrowLeft') setIndex((i) => (i - 1 + n) % n);
      else if (e.code === 'ArrowDown') setIndex((i) => (i + COLS) % n);
      else if (e.code === 'ArrowUp') setIndex((i) => (i - COLS + n) % n);
      else if (e.code === 'Enter' || e.code === 'Space') go();
      else return;
      e.preventDefault();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h2 className={styles.title}>SELECT CHARACTER</h2>
        <p className={styles.hint}>
          <kbd>← → ↑ ↓</kbd> 고르기 · <kbd>ENTER</kbd> 출발
        </p>
      </header>

      <div className={styles.body}>
        {/* 고른 캐릭터 — 크게 */}
        <section className={styles.preview} aria-live="polite">
          <div className={styles.stage}>
            <Sprite key={current.id} name={current.sprite} className={styles.bigSprite} />
            <span className={styles.shadow} aria-hidden="true" />
          </div>
          <div className={styles.info}>
            <p className={styles.en}>{current.en}</p>
            <p className={styles.name}>{current.name}</p>
            <p className={styles.tagline}>{current.tagline}</p>
            <div className={styles.ability}>
              <span className={styles.abilityTag}>ABILITY</span>
              <span className={styles.abilityName}>{current.ability.name}</span>
            </div>
            <p className={styles.abilityDesc}>{current.ability.desc}</p>
          </div>
        </section>

        {/* 여섯 명 */}
        <ul className={styles.grid} role="listbox" aria-label="캐릭터">
          {CHARACTERS.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                role="option"
                aria-selected={i === index}
                className={`${styles.tile} ${i === index ? styles.active : ''}`}
                onClick={() => setIndex(i)}
                onDoubleClick={go}
              >
                <Sprite name={c.sprite} className={styles.tileSprite} />
                <span className={styles.tileName}>{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button type="button" className={styles.start} onClick={go}>
        <span className={styles.caret} aria-hidden="true">
          ▸
        </span>
        START · {current.name}
      </button>
    </div>
  );
}
