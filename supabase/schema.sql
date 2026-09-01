-- G DEV. F.C. 홈페이지 — 로그인 / 갤러리 / 게시판 스키마
-- Supabase SQL Editor에서 전체 실행. gen_random_uuid()는 pgcrypto 확장이 필요하며
-- Supabase 프로젝트에는 기본적으로 활성화되어 있다.

-- ---------- profiles ----------
-- auth.users 1:1. codename 은 "PIXEL-07" 같은 요원 코드네임, role 은 마스터 어드민(CHESS-01) 구분용.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  codename text unique not null,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles are readable by any logged-in member"
  on profiles for select
  to authenticated
  using (true);

-- insert/update는 계정 생성 스크립트(service_role, RLS 우회)만 수행하므로
-- 클라이언트용 insert/update 정책은 만들지 않는다.

-- ---------- posts ----------

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table posts enable row level security;

create policy "posts are readable by any logged-in member"
  on posts for select
  to authenticated
  using (true);

create policy "members can create their own posts"
  on posts for insert
  to authenticated
  with check (author_id = auth.uid());

-- 게시판 U/D는 관리자 예외 없이 본인 글에만 허용한다 (요청 사항).
create policy "authors can update their own posts"
  on posts for update
  to authenticated
  using (author_id = auth.uid());

create policy "authors can delete their own posts"
  on posts for delete
  to authenticated
  using (author_id = auth.uid());

-- ---------- comments ----------

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table comments enable row level security;

create policy "comments are readable by any logged-in member"
  on comments for select
  to authenticated
  using (true);

create policy "members can create their own comments"
  on comments for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "authors can delete their own comments"
  on comments for delete
  to authenticated
  using (author_id = auth.uid());

-- ---------- gallery_items ----------

create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references profiles(id) on delete cascade,
  title text,
  image_path text not null,
  created_at timestamptz not null default now()
);

alter table gallery_items enable row level security;

create policy "gallery items are readable by any logged-in member"
  on gallery_items for select
  to authenticated
  using (true);

create policy "members can add their own gallery items"
  on gallery_items for insert
  to authenticated
  with check (uploader_id = auth.uid());

create policy "uploader and admin can delete gallery items"
  on gallery_items for delete
  to authenticated
  using (
    uploader_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ---------- storage: gallery 버킷 ----------
-- 대시보드 Storage에서 "gallery" 버킷을 Private으로 먼저 만든 뒤 아래 정책을 실행한다.
-- 업로드 경로는 항상 "<auth.uid()>/<파일명>" 형태로 구성한다 (Gallery.tsx 참고).

create policy "gallery bucket readable by members"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'gallery');

create policy "members can upload into their own gallery folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'gallery'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owner and admin can delete gallery objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gallery'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  );
