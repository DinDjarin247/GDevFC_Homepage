import type { ExternalEvent } from './events';

const DAY = 86400000;

export function dateDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) return null;
  return timestamp / DAY;
}

export function eventRange(event: ExternalEvent) {
  const parts = event.date.split(/\s*~\s*/);
  if (parts.length > 2) return null;
  const start = dateDay(parts[0]);
  const end = dateDay(parts[1] ?? parts[0]);
  return start !== null && end !== null && end >= start ? { start, end } : null;
}

/** 점성술사 천막 팔레트 — 어두운 글자(#1a0f2c)가 얹히므로 전부 밝은 톤으로 유지한다 */
const TENT_PALETTE = ['#f5d76e', '#c8a6ff', '#9fe8ff', '#a8f0c6', '#ffb0c8'] as const;

const CATEGORY_COLOR: Record<string, string> = {
  게임잼: '#f5d76e',
  전시회: '#c8a6ff',
  컨퍼런스: '#9fe8ff',
  스터디: '#a8f0c6',
  공모전: '#ffb0c8',
};

export function eventColor(event: ExternalEvent) {
  const byCategory = CATEGORY_COLOR[event.category];
  if (byCategory) return byCategory;

  // 미등록 분류는 제목 기준으로 팔레트 안에서 고정 배정한다 (같은 행사 = 같은 색)
  const key = `${event.title}|${event.date}|${event.url ?? ''}`;
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TENT_PALETTE[hash % TENT_PALETTE.length];
}

export function weekSegments(events: ExternalEvent[], weekStart: number) {
  const lanes: number[] = [];
  return events.flatMap((event) => {
    const range = eventRange(event);
    if (!range || range.end < weekStart || range.start > weekStart + 6) return [];
    return [{ event, start: Math.max(range.start, weekStart), end: Math.min(range.end, weekStart + 6) }];
  }).sort((a, b) => a.start - b.start || b.end - a.end || a.event.title.localeCompare(b.event.title))
    .map((segment) => {
      let lane = lanes.findIndex((end) => end < segment.start);
      if (lane === -1) lane = lanes.length;
      lanes[lane] = segment.end;
      return { ...segment, lane, column: segment.start - weekStart + 1, span: segment.end - segment.start + 1 };
    });
}
