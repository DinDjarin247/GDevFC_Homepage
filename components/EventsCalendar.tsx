'use client';

import type { ExternalEvent } from '@/lib/events';
import { eventColor, eventRange, weekSegments } from '@/lib/eventCalendar';
import styles from '@/app/events/events.module.css';

const DAY = 86400000;

export default function EventsCalendar({ events, month, onMonthChange }: {
  events: ExternalEvent[];
  month: { year: number; month: number };
  onMonthChange: (month: { year: number; month: number }) => void;
}) {
  const first = new Date(Date.UTC(month.year, month.month, 1));
  const last = new Date(Date.UTC(month.year, month.month + 1, 0));
  const gridStart = first.getTime() / DAY - first.getUTCDay();
  const weeks = Math.ceil((first.getUTCDay() + last.getUTCDate()) / 7);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / DAY;
  const unscheduled = events.filter((event) => !eventRange(event)).length;
  const inMonth = events.filter((event) => {
    const range = eventRange(event);
    return range && range.start <= last.getTime() / DAY && range.end >= first.getTime() / DAY;
  }).length;

  function move(delta: number) {
    const next = new Date(Date.UTC(month.year, month.month + delta, 1));
    onMonthChange({ year: next.getUTCFullYear(), month: next.getUTCMonth() });
  }

  return (
    <section aria-label="행사 달력">
      <div className={styles.calendarHeader}>
        <h2 aria-live="polite">{month.year}년 {month.month + 1}월</h2>
        <div className={styles.viewToggle}>
          <button className={styles.button} type="button" aria-label="이전 달" onClick={() => move(-1)}>‹</button>
          <button className={styles.button} type="button" onClick={() => onMonthChange({ year: now.getFullYear(), month: now.getMonth() })}>이번 달</button>
          <button className={styles.button} type="button" aria-label="다음 달" onClick={() => move(1)}>›</button>
        </div>
      </div>
      <p className={styles.count} role="status">이번 달 {inMonth}개 · 색상 막대는 행사의 전체 기간을 나타냅니다.</p>
      <p className={styles.calendarHint}>행사명을 누르면 상세 페이지가 새 탭으로 열립니다. 좁은 화면에서는 달력을 좌우로 스크롤하세요.</p>
      <div className={styles.calendarScroll} tabIndex={0} role="region" aria-label="월간 일정, 좌우 스크롤 가능">
        <div className={styles.calendarGrid}>
          <div className={styles.weekdays}>{['일', '월', '화', '수', '목', '금', '토'].map((day) => <span key={day}>{day}</span>)}</div>
          {Array.from({ length: weeks }, (_, week) => {
            const start = gridStart + week * 7;
            const segments = weekSegments(events, start);
            const laneCount = Math.max(2, ...segments.map((item) => item.lane + 1));
            return (
              <div key={start} className={styles.calendarWeek} style={{ gridTemplateRows: `32px repeat(${laneCount}, 28px) 8px` }}>
                {Array.from({ length: 7 }, (_, day) => {
                  const date = new Date((start + day) * DAY);
                  const outside = date.getUTCMonth() !== month.month;
                  return <div key={day} className={`${styles.calendarDay} ${outside ? styles.outsideMonth : ''}`}
                    style={{ gridColumn: day + 1, gridRow: '1 / -1' }}>
                    <time dateTime={date.toISOString().slice(0, 10)} aria-current={start + day === today ? 'date' : undefined}
                      className={start + day === today ? styles.today : ''}>{date.getUTCDate()}</time>
                  </div>;
                })}
                {segments.map(({ event, lane, column, span }, index) => {
                  const style = { gridColumn: `${column} / span ${span}`, gridRow: lane + 2, backgroundColor: eventColor(event) };
                  const label = `${event.title} · ${event.date}${event.location ? ` · ${event.location}` : ''}`;
                  return event.url
                    ? <a key={`${event.title}-${index}`} href={event.url} target="_blank" rel="noopener noreferrer"
                        className={styles.calendarEvent} style={style} title={label} aria-label={`${label} (새 탭)`}>{event.title}</a>
                    : <span key={`${event.title}-${index}`} className={styles.calendarEvent} style={style} title={label}>{event.title}</span>;
                })}
              </div>
            );
          })}
        </div>
      </div>
      {inMonth === 0 && <p className={styles.description}>이번 달에는 검색 조건에 맞는 행사가 없습니다.</p>}
      {unscheduled > 0 && <p className={styles.count}>날짜를 확인할 수 없는 행사 {unscheduled}개는 카드 보기에서 확인할 수 있습니다.</p>}
    </section>
  );
}
