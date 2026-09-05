-- 0004: 게시판 관리자 전체삭제(CHESS-01) + 투표 기능
-- Supabase SQL Editor에서 이 파일 내용 전체를 한 번만 실행한다.

-- ---------- 게시글/댓글 삭제: 작성자 본인 + 관리자(CHESS-01) ----------
-- 수정(update)은 여전히 작성자 본인만 가능 — 삭제만 관리자 예외를 추가한다.

drop policy if exists "authors can delete their own posts" on posts;
create policy "authors and admin can delete posts"
  on posts for delete
  to authenticated
  using (
    author_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "authors can delete their own comments" on comments;
create policy "authors and admin can delete comments"
  on comments for delete
  to authenticated
  using (
    author_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ---------- 투표 ----------
-- 글 하나에 투표 하나(선택). 옵션은 작성 시점에 고정, 회원당 한 표(변경 가능).

create table if not exists polls (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references posts(id) on delete cascade,
  question text not null,
  created_at timestamptz not null default now()
);

alter table polls enable row level security;

create policy "polls readable by members"
  on polls for select
  to authenticated
  using (true);

create policy "post author can create a poll for their own post"
  on polls for insert
  to authenticated
  with check (
    exists (select 1 from posts p where p.id = post_id and p.author_id = auth.uid())
  );

create table if not exists poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0
);

alter table poll_options enable row level security;

create policy "poll options readable by members"
  on poll_options for select
  to authenticated
  using (true);

create policy "post author can add options to their own poll"
  on poll_options for insert
  to authenticated
  with check (
    exists (
      select 1 from polls pl
      join posts p on p.id = pl.post_id
      where pl.id = poll_id and p.author_id = auth.uid()
    )
  );

create table if not exists poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls(id) on delete cascade,
  option_id uuid not null references poll_options(id) on delete cascade,
  voter_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poll_id, voter_id)
);

alter table poll_votes enable row level security;

create policy "poll votes readable by members"
  on poll_votes for select
  to authenticated
  using (true);

create policy "members can cast their own vote"
  on poll_votes for insert
  to authenticated
  with check (voter_id = auth.uid());

create policy "members can change their own vote"
  on poll_votes for update
  to authenticated
  using (voter_id = auth.uid())
  with check (voter_id = auth.uid());
