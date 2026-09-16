import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dateDay, eventRange, eventColor, weekSegments } from '../lib/eventCalendar.ts';

const event = (title, date) => ({ title, date, category: '', location: '', organizer: '', summary: '', url: null });

test('윤년 및 잘못된 날짜와 역순 기간을 구분한다', () => {
  assert.notEqual(dateDay('2028-02-29'), null);
  assert.equal(dateDay('2026-02-29'), null);
  assert.equal(eventRange(event('미정', '추후 안내')), null);
  assert.equal(eventRange(event('역순', '2026-10-02 ~ 2026-09-01')), null);
});

test('월과 연도를 넘는 기간을 해당 주로 잘라 양 끝 날짜를 포함한다', () => {
  const start = dateDay('2026-12-27');
  const segments = weekSegments([event('연말', '2026-12-25 ~ 2027-01-05')], start);
  assert.equal(segments[0].column, 1);
  assert.equal(segments[0].span, 7);
  const next = weekSegments([event('연말', '2026-12-25 ~ 2027-01-05')], start + 7);
  assert.equal(next[0].span, 3);
});

test('겹치는 행사를 다른 줄에 놓고 단일 날짜도 표시한다', () => {
  const start = dateDay('2026-09-13');
  const segments = weekSegments([
    event('긴 행사', '2026-09-13 ~ 2026-09-19'),
    event('하루', '2026-09-14'),
    event('다음 날', '2026-09-15'),
    event('기간 밖', '2026-10-01'),
  ], start);
  assert.equal(segments.length, 3);
  assert.equal(segments[0].lane, 0);
  assert.equal(segments[1].lane, 1);
  assert.equal(segments[1].span, 1);
  assert.equal(segments[2].lane, 1);
  assert.equal(eventColor(segments[0].event), eventColor({ ...segments[0].event }));
});
