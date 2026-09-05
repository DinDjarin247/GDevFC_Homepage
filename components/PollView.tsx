'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/useAuth';
import styles from './PollView.module.css';

type PollRow = { id: string; question: string };
type OptionRow = { id: string; label: string; sort_order: number };
type VoteRow = { option_id: string; voter_id: string };

/** 글 상세페이지에 붙는 투표 — 존재하면 보여주고, 없으면 아무것도 렌더링하지 않는다. */
export default function PollView({ postId }: { postId: string }) {
  const { profile } = useAuth();
  const [poll, setPoll] = useState<PollRow | null>(null);
  const [options, setOptions] = useState<OptionRow[]>([]);
  const [votes, setVotes] = useState<VoteRow[]>([]);
  const [voting, setVoting] = useState(false);

  const load = useCallback(async () => {
    const { data: pollData } = await supabase
      .from('polls')
      .select('id, question')
      .eq('post_id', postId)
      .maybeSingle();

    if (!pollData) {
      setPoll(null);
      return;
    }
    setPoll(pollData);

    const [{ data: optionData }, { data: voteData }] = await Promise.all([
      supabase.from('poll_options').select('id, label, sort_order').eq('poll_id', pollData.id).order('sort_order'),
      supabase.from('poll_votes').select('option_id, voter_id').eq('poll_id', pollData.id),
    ]);
    setOptions(optionData ?? []);
    setVotes(voteData ?? []);
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  async function castVote(optionId: string) {
    if (!profile || !poll || voting) return;
    setVoting(true);
    await supabase
      .from('poll_votes')
      .upsert(
        { poll_id: poll.id, option_id: optionId, voter_id: profile.id },
        { onConflict: 'poll_id,voter_id' }
      );
    await load();
    setVoting(false);
  }

  if (!poll) return null;

  const total = votes.length;
  const myVote = votes.find((v) => v.voter_id === profile?.id)?.option_id;

  return (
    <div className={styles.wrap}>
      <p className={styles.question}>▸ {poll.question}</p>
      <div className={styles.options}>
        {options.map((opt) => {
          const count = votes.filter((v) => v.option_id === opt.id).length;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <button
              key={opt.id}
              type="button"
              className={`${styles.option} ${myVote === opt.id ? styles.picked : ''}`}
              onClick={() => castVote(opt.id)}
              disabled={voting}
            >
              <span className={styles.bar} style={{ width: `${pct}%` }} aria-hidden="true" />
              <span className={styles.optionLabel}>{opt.label}</span>
              <span className={styles.optionCount}>
                {count}표 · {pct}%
              </span>
            </button>
          );
        })}
      </div>
      <p className={styles.total}>총 {total}명 참여{myVote ? ' · 선택을 눌러 표를 바꿀 수 있습니다' : ''}</p>
    </div>
  );
}
