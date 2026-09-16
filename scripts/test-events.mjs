import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseEventsCsv } from '../lib/events.ts';

test('events 탭의 영문 열과 행사 기간을 읽는다', () => {
  const [event] = parseEventsCsv('id,title,category,start_date,end_date,location,url,source\n1,Sample Jam,jam,2026-09-14,2026-09-28,온라인,https://example.com,itch.io');
  assert.equal(event.title, 'Sample Jam');
  assert.equal(event.category, '게임잼');
  assert.equal(event.date, '2026-09-14 ~ 2026-09-28');
  assert.equal(event.location, '온라인');
  assert.equal(event.url, 'https://example.com/');
  assert.equal(event.organizer, '');
});

test('빈 시트와 헤더만 있는 시트를 빈 목록으로 처리한다', () => {
  assert.deepEqual(parseEventsCsv(''), []);
  assert.deepEqual(parseEventsCsv('행사명,분류,일정\r\n'), []);
});

test('열 순서, BOM, 쉼표, 줄바꿈, 따옴표를 보존한다', () => {
  const events = parseEventsCsv('\uFEFF링크,소개,행사명,분류,일정,장소,주최\r\nhttps://example.com,"게임, 개발\n""함께""",테스트 행사,게임잼,2026-10-01,온라인,테스트 주최\r\n');
  assert.deepEqual(events, [{
    title: '테스트 행사', category: '게임잼', date: '2026-10-01',
    location: '온라인', organizer: '테스트 주최',
    summary: '게임, 개발\n"함께"', url: 'https://example.com/',
  }]);
});

test('이름 없는 행을 제외하고 선택 항목 누락을 허용한다', () => {
  assert.deepEqual(parseEventsCsv('행사명,분류\n,전시회\n테스트 행사,'), [{
    title: '테스트 행사', category: '기타', date: '', location: '', organizer: '', summary: '', url: null,
  }]);
});

test('실행 가능한 URL과 잘못된 링크는 표시하지 않는다', () => {
  for (const link of ['javascript:alert(1)', 'data:text/html,test', '/relative', 'invalid']) {
    const [event] = parseEventsCsv(`행사명,링크\n테스트,"${link}"`);
    assert.equal(event.url, null);
  }
});

test('로그인 HTML, 잘못된 헤더, 깨진 CSV는 오류로 처리한다', () => {
  assert.throws(() => parseEventsCsv('<html>로그인</html>'));
  assert.throws(() => parseEventsCsv('제목,장소\n행사,온라인'));
  assert.throws(() => parseEventsCsv('행사명\n"닫히지 않은 문자열'));
});
