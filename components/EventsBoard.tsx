'use client';

import { useEffect, useState } from 'react';
import { parseEventsCsv, type ExternalEvent } from '@/lib/events';
import source from '@/data/events-source.json';
import EventsCalendar from './EventsCalendar';
import styles from '@/app/events/events.module.css';

const sheetUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(source.sheetId)}/gviz/tq?tqx=out:csv&headers=1${source.sheetName ? `&sheet=${encodeURIComponent(source.sheetName)}` : ''}`;

export default function EventsBoard() {
  const [events, setEvents] = useState<ExternalEvent[]>([]);
  const [loading, setLoading] = useState(Boolean(sheetUrl));
  const [error, setError] = useState(false);
  const [request, setRequest] = useState(0);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'cards' | 'calendar'>('cards');
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  useEffect(() => {
    if (!sheetUrl) return;
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    setLoading(true);
    setError(false);

    async function load() {
      try {
        const response = await fetch(sheetUrl!, { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error('행사 정보를 불러오지 못했습니다.');
        const data = parseEventsCsv(await response.text());
        if (active) { setEvents(data); setPage(1); }
      } catch {
        if (active) setError(true);
      } finally {
        clearTimeout(timeout);
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [request]);

  const categories = Array.from(new Set(events.map((event) => event.category)));
  const search = query.trim().toLocaleLowerCase('ko');
  const filtered = events.filter((event) =>
    (!category || event.category === category) &&
    [event.title, event.summary, event.location, event.organizer, event.category]
      .some((value) => value.toLocaleLowerCase('ko').includes(search))
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pageCount);
  const groupStart = Math.floor((currentPage - 1) / 5) * 5 + 1;
  const pageNumbers = Array.from({ length: Math.min(5, pageCount - groupStart + 1) }, (_, i) => groupStart + i);
  const pageEvents = filtered.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <section className={styles.board} aria-label="외부행사 게시판" aria-busy={loading}>
      <div className={styles.toolbar}>
        <div className={styles.viewToggle} role="group" aria-label="보기 방식">
          <button type="button" className={styles.button} aria-pressed={view === 'cards'} onClick={() => setView('cards')}>카드 보기</button>
          <button type="button" className={styles.button} aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}>달력 보기</button>
        </div>
        <label className={styles.search}>
          <span className="srOnly">행사 검색</span>
          <input type="search" placeholder="행사명, 장소, 주최 검색" value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
        </label>
        <label>
          <span className="srOnly">행사 분류</span>
          <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>
            <option value="">전체 분류</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        {sheetUrl && <button type="button" className={styles.button} disabled={loading}
          onClick={() => setRequest((value) => value + 1)}>새로고침</button>}
      </div>

      <p className={styles.count} role="status">
        {loading ? '행사 정보를 불러오는 중…' : error ? '행사 정보를 불러오지 못했습니다.' : `전체 ${events.length}개 · 검색 결과 ${filtered.length}개`}
      </p>

      {loading ? (
        <div className={styles.empty}><p className={styles.description}>새로운 만남을 준비하고 있어요.</p></div>
      ) : error ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyHeading}>행사 소식을 잠시 불러올 수 없습니다</h2>
          <p className={styles.description}>잠시 후 다시 시도해 주세요.</p>
          <button type="button" className={styles.button} onClick={() => setRequest((value) => value + 1)}>다시 시도</button>
        </div>
      ) : view === 'calendar' ? (
        <EventsCalendar events={filtered} month={month} onMonthChange={setMonth} />
      ) : filtered.length ? (
        <>
        <div className={styles.cards}>
          {pageEvents.map((event, index) => (
            <article key={`${event.title}-${index}`} className={styles.card}>
              <span className={styles.category}>{event.category}</span>
              <h2 className={styles.cardTitle}>{event.title}</h2>
              {event.summary && <p className={styles.summary}>{event.summary}</p>}
              <dl className={styles.details}>
                <div><dt>일정</dt><dd>{event.date || '추후 안내'}</dd></div>
                <div><dt>장소</dt><dd>{event.location || '추후 안내'}</dd></div>
                {event.organizer && <div><dt>주최</dt><dd>{event.organizer}</dd></div>}
              </dl>
              {event.url ? <a className={styles.eventLink} href={event.url} target="_blank" rel="noopener noreferrer"
                aria-label={`${event.title} 자세히 보기 (새 탭)`}>자세히 보기 <span aria-hidden="true">↗</span></a>
                : <p className={styles.noLink}>상세 링크 준비 중</p>}
            </article>
          ))}
        </div>
        <nav className={styles.pagination} aria-label="행사 페이지 선택">
          <button className={styles.button} type="button" disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)} aria-label="이전 페이지">이전</button>
          {pageNumbers.map((number) => <button key={number} className={styles.button} type="button"
            aria-label={`${number}페이지`} aria-current={number === currentPage ? 'page' : undefined}
            onClick={() => setPage(number)}>{number}</button>)}
          <button className={styles.button} type="button" disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)} aria-label="다음 페이지">다음</button>
        </nav>
        <p className={styles.pageStatus} role="status">{currentPage} / {pageCount} 페이지</p>
        </>
      ) : (
        <div className={styles.empty}>
          <span className={styles.symbol} aria-hidden="true">✦</span>
          <p className={styles.status}>{events.length ? 'NO RESULTS' : 'NO EVENTS YET'}</p>
          <h2 className={styles.emptyHeading}>{events.length ? '검색 조건에 맞는 행사가 없습니다' : '아직 등록된 외부행사가 없습니다'}</h2>
          <p className={styles.description}>{events.length ? '다른 검색어나 분류로 찾아보세요.' : '새로운 행사 소식이 준비되면 이곳에서 안내할 예정입니다.'}</p>
          {(query || category) && <button type="button" className={styles.button} onClick={() => { setQuery(''); setCategory(''); setPage(1); }}>검색 초기화</button>}
        </div>
      )}
    </section>
  );
}
