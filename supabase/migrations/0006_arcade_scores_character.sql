-- 0006: 달려라 우왕이 V2 — 어떤 캐릭터로 낸 기록인지 남긴다 (랭킹에 캐릭터 아이콘).
-- Supabase SQL Editor에서 이 파일 내용 전체를 한 번만 실행한다.
--
-- V1 시절 기록은 전부 우왕이로 플레이한 것이라 기본값을 'woowang' 으로 두면 기존 기록에도
-- 정확한 아이콘이 붙는다. 누구나 기록을 남길 수 있는 공개 테이블이라 여섯 캐릭터만 허용한다.

alter table arcade_scores
  add column if not exists character text not null default 'woowang'
  check (character in ('woowang', 'jwawang', 'steady', 'tana', 'neuru', 'eunsong'));
