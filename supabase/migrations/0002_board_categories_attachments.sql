-- 0002: 게시판 카테고리 + 첨부파일, 갤러리 다중 이미지
-- Supabase SQL Editor에서 이 파일 내용 전체를 한 번만 실행한다 (0001 = supabase/schema.sql 실행 이후).

-- ---------- posts: 카테고리 ----------

alter table posts
  add column if not exists category text not null default 'free'
    check (category in ('free', 'notice', 'info', 'recruit'));

-- ---------- post_attachments: 글에 첨부된 파일/사진 ----------

create table if not exists post_attachments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table post_attachments enable row level security;

create policy "post attachments readable by members"
  on post_attachments for select
  to authenticated
  using (true);

create policy "post authors can attach files"
  on post_attachments for insert
  to authenticated
  with check (
    exists (select 1 from posts p where p.id = post_id and p.author_id = auth.uid())
  );

create policy "post authors can delete their attachments"
  on post_attachments for delete
  to authenticated
  using (
    exists (select 1 from posts p where p.id = post_id and p.author_id = auth.uid())
  );

-- ---------- gallery_images: 갤러리 항목당 여러 장의 사진 ----------

create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  gallery_item_id uuid not null references gallery_items(id) on delete cascade,
  image_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table gallery_images enable row level security;

create policy "gallery images readable by members"
  on gallery_images for select
  to authenticated
  using (true);

create policy "uploader can add gallery images"
  on gallery_images for insert
  to authenticated
  with check (
    exists (select 1 from gallery_items g where g.id = gallery_item_id and g.uploader_id = auth.uid())
  );

create policy "uploader or admin can delete gallery images"
  on gallery_images for delete
  to authenticated
  using (
    exists (
      select 1 from gallery_items g
      where g.id = gallery_item_id
        and (
          g.uploader_id = auth.uid()
          or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
        )
    )
  );

-- 기존 gallery_items.image_path(단일 사진)를 gallery_images로 옮겨 대표사진(0번)으로 만든다.
-- 이후 업로드는 image_path를 쓰지 않고 전부 gallery_images에 기록한다.
insert into gallery_images (gallery_item_id, image_path, sort_order)
select id, image_path, 0
from gallery_items
where image_path is not null;

alter table gallery_items alter column image_path drop not null;

-- ---------- storage: 게시판 첨부파일 버킷 ----------
-- gallery 버킷은 이미 만들어져 있으므로 그대로 두고, 첨부파일 전용 버킷을 새로 만든다.
-- Private, 5MB 제한.

insert into storage.buckets (id, name, public, file_size_limit)
values ('board-attachments', 'board-attachments', false, 5242880)
on conflict (id) do nothing;

create policy "board attachments readable by members"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'board-attachments');

create policy "members can upload into their own attachment folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'board-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owner can delete their attachment objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'board-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
