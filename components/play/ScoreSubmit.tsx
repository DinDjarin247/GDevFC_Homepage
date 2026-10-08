'use client';

import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Leaderboard, { defaultScoreFormat, type ScoreTable } from './Leaderboard';
import styles from './ScoreSubmit.module.css';

const NAME_KEY = 'gdevfc_woowang_name';
const MAX_NAME_LEN = 12;

type ScoreSubmitProps = {
  score: number;
  /** 기록을 남길 랭킹 테이블 (기본: 달려라 우왕이) */
  table?: ScoreTable;
  formatScore?: (score: number) => string;
  /** 어떤 캐릭터로 낸 기록인지 — 랭킹에 아이콘으로 보인다 (달려라 우왕이) */
  character?: string;
};

/**
 * 옛날 오락실 방식 기록 등록 — 로그인 없이 이름만 적으면 점수가 공개 랭킹에 남는다.
 * 등록 직후 자동으로 TOP 10 랭킹을 보여준다.
 */
export default function ScoreSubmit({
  score,
  table = 'arcade_scores',
  formatScore = defaultScoreFormat,
  character,
}: ScoreSubmitProps) {
  const [name, setName] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(NAME_KEY) ?? '';
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showBoard, setShowBoard] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('이름을 입력하세요.');
      return;
    }
    setError('');
    setSubmitting(true);

    const row = { player_name: trimmed.slice(0, MAX_NAME_LEN), score };
    const insert = (payload: Record<string, unknown>) => supabase.from(table).insert(payload).select('id').single();
    let { data, error: insertError } = await insert(character ? { ...row, character } : row);
    // character 칸을 만드는 마이그레이션(0006)을 아직 안 돌렸으면 캐릭터 없이라도 남긴다
    if (insertError && character) ({ data, error: insertError } = await insert(row));

    setSubmitting(false);

    if (insertError || !data) {
      setError('기록 등록에 실패했습니다.');
      return;
    }

    window.localStorage.setItem(NAME_KEY, trimmed);
    setSubmittedId(data.id);
    setShowBoard(true);
  }

  return (
    <div className={styles.wrap}>
      {submittedId ? (
        <p className={styles.done}>▸ 기록이 등록됐습니다!</p>
      ) : (
        <form className={styles.form} onSubmit={onSubmit}>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 (최대 12자)"
            maxLength={MAX_NAME_LEN}
            autoComplete="off"
          />
          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? '...' : '▸ 기록 등록'}
          </button>
        </form>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <button type="button" className={styles.toggle} onClick={() => setShowBoard((s) => !s)}>
        {showBoard ? '랭킹 숨기기 ▴' : '전체 랭킹 보기 ▾'}
      </button>

      {showBoard && (
        <div className={styles.board}>
          <Leaderboard
            highlightId={submittedId}
            refreshKey={submittedId ? 1 : 0}
            table={table}
            formatScore={formatScore}
          />
        </div>
      )}
    </div>
  );
}
