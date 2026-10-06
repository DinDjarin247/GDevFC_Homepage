-- 0005: 뛰어라 우왕이 오락실 랭킹 — 로그인 없이 누구나 최고 높이(m)를 남긴다.
-- Supabase SQL Editor에서 이 파일 내용 전체를 한 번만 실행한다.
--
-- 달려라 우왕이(arcade_scores)와 점수 단위가 달라(점수 vs 미터) 같은 표에 섞을 수 없으므로
-- 테이블을 따로 둔다. 구조와 공개 정책은 0003 과 같다.

create table if not exists jump_scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null check (char_length(player_name) between 1 and 12),
  -- 최고 도달 높이 (m)
  score integer not null check (score >= 0 and score <= 999999),
  created_at timestamptz not null default now()
);

create index if not exists jump_scores_score_idx on jump_scores (score desc);

alter table jump_scores enable row level security;

create policy "anyone can read the jump leaderboard"
  on jump_scores for select
  using (true);

create policy "anyone can submit a jump score"
  on jump_scores for insert
  with check (true);
