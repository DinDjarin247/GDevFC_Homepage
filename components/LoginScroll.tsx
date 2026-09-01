'use client';

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { useAuth } from '@/lib/useAuth';
import styles from './LoginScroll.module.css';

const BURN_DURATION_MS = 850;

type LoginScrollProps = {
  /** ✕ 버튼 / 배경 클릭으로 즉시 닫을 때 (모달 컨텍스트용, 애니메이션 없음). */
  onClose?: () => void;
  /** 로그인 성공 + 보라 불꽃 연출이 끝난 뒤 호출된다. */
  onSuccess?: () => void;
};

/** "고대 낡은 스크롤" 컨셉의 회원 로그인 폼 — 코너 팝업/게이트 화면 공용.
 * 로그인 성공 시 보라색 불꽃 연출로 타서 사라진 뒤 onSuccess 를 호출한다. */
export default function LoginScroll({ onClose, onSuccess }: LoginScrollProps) {
  const { signIn } = useAuth();
  const [codename, setCodename] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [burning, setBurning] = useState(false);

  const sparks = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        left: `${10 + Math.random() * 80}%`,
        drift: `${Math.round((Math.random() - 0.5) * 60)}px`,
        delay: `${Math.random() * 0.25}s`,
        key: i,
      })),
    []
  );

  useEffect(() => {
    if (!burning) return;
    const timer = setTimeout(() => onSuccess?.(), BURN_DURATION_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burning]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!codename.trim() || !password) {
      setError('코드네임과 비밀번호를 입력하세요.');
      return;
    }
    setError('');
    setSubmitting(true);
    const { error: signInError } = await signIn(codename, password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    setBurning(true);
  }

  return (
    <div className={`${styles.scrollShell} ${burning ? styles.burning : ''}`}>
      {burning && (
        <>
          <div className={styles.flameWash} aria-hidden="true" />
          {sparks.map((s) => (
            <span
              key={s.key}
              className={styles.spark}
              aria-hidden="true"
              style={{ left: s.left, animationDelay: s.delay, '--drift': s.drift } as CSSProperties}
            />
          ))}
        </>
      )}

      <div className={`${styles.rod} ${styles.rodTop}`} aria-hidden="true">
        <span className={`${styles.knob} ${styles.knobLeft}`} />
        <span className={`${styles.knob} ${styles.knobRight}`} />
      </div>

      <div className={styles.parchment}>
        {onClose && !burning && (
          <button type="button" className={styles.close} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        )}

        <h2 className={styles.heading}>▸ MEMBER SCROLL</h2>
        <p className={styles.sub}>코드네임과 비밀번호를 적어 넣으세요</p>

        <form onSubmit={onSubmit}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="scrollCodename">
              CODENAME
            </label>
            <input
              id="scrollCodename"
              className={styles.scrollInput}
              value={codename}
              onChange={(e) => setCodename(e.target.value)}
              placeholder="예: PIXEL-07"
              autoComplete="username"
              autoCapitalize="characters"
              disabled={burning}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="scrollPassword">
              PASSWORD
            </label>
            <input
              id="scrollPassword"
              type="password"
              className={styles.scrollInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={burning}
            />
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button type="submit" className={styles.sealBtn} disabled={submitting || burning}>
            {burning ? 'ENTERING...' : submitting ? 'OPENING...' : '▸ ENTER'}
          </button>
        </form>
      </div>

      <div className={`${styles.rod} ${styles.rodBottom}`} aria-hidden="true">
        <span className={`${styles.knob} ${styles.knobLeft}`} />
        <span className={`${styles.knob} ${styles.knobRight}`} />
      </div>
    </div>
  );
}
