'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './Leaderboard.module.css';

/** 게임마다 랭킹 테이블이 따로 있다 — 달려라(arcade_scores) / 뛰어라(jump_scores) */
export type ScoreTable = 'arcade_scores' | 'jump_scores';

/** 기본 표기는 달려라 우왕이의 5자리 점수 */
export const defaultScoreFormat = (n: number) => String(n).padStart(5, '0');

type ScoreRow = {
  id: string;
  player_name: string;
  score: number;
};

type LeaderboardProps = {
  limit?: number;
  /** 방금 등록한 기록의 id — 목록에서 하이라이트해준다 */
  highlightId?: string | null;
  /** 부모가 새 기록 등록 직후 새로고침을 트리거할 때 쓰는 값 (바뀌면 재조회) */
  refreshKey?: number;
  table?: ScoreTable;
  formatScore?: (score: number) => string;
};

/** 로그인 없이 누구나 볼 수 있는 오락실 스타일 TOP 랭킹 (public RLS: arcade_scores / jump_scores). */
export default function Leaderboard({
  limit = 10,
  highlightId,
  refreshKey,
  table = 'arcade_scores',
  formatScore = defaultScoreFormat,
}: LeaderboardProps) {
  const [rows, setRows] = useState<ScoreRow[] | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from(table)
      .select('id, player_name, score')
      .order('score', { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        if (active) setRows((data as ScoreRow[]) ?? []);
      });
    return () => {
      active = false;
    };
  }, [limit, refreshKey, table]);

  if (rows === null) return <p className={styles.loading}>불러오는 중...</p>;
  if (rows.length === 0) return <p className={styles.empty}>아직 등록된 기록이 없습니다. 첫 기록의 주인공이 되어보세요!</p>;

  return (
    <div className={styles.wrap}>
      {rows.map((r, i) => (
        <div key={r.id} className={`${styles.row} ${r.id === highlightId ? styles.me : ''}`}>
          <span className={styles.rank}>{i + 1}</span>
          <span className={styles.name}>{r.player_name}</span>
          <span className={styles.score}>{formatScore(r.score)}</span>
        </div>
      ))}
    </div>
  );
}
