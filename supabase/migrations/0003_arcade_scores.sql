-- 0003: 달려라 우왕이 오락실 랭킹 — 로그인 없이 누구나 기록을 남길 수 있다.
-- Supabase SQL Editor에서 이 파일 내용 전체를 한 번만 실행한다.

create table if not exists arcade_scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null check (char_length(player_name) between 1 and 12),
  score integer not null check (score >= 0 and score <= 999999),
  created_at timestamptz not null default now()
);

create index if not exists arcade_scores_score_idx on arcade_scores (score desc);

alter table arcade_scores enable row level security;

-- to 절을 생략하면 기본적으로 "public" (로그인 여부 무관: anon + authenticated) 대상 정책이 된다.
-- 이 게임 랭킹은 회원 전용 기능이 아니라 옛날 오락실처럼 누구나 이름 쓰고 기록을 남기는
-- 공개 리더보드이므로, 이 테이블만 예외적으로 로그인 없이 select/insert를 허용한다.

create policy "anyone can read the leaderboard"
  on arcade_scores for select
  using (true);

create policy "anyone can submit a score"
  on arcade_scores for insert
  with check (true);
