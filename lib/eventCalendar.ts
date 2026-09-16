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

export function eventColor(event: ExternalEvent) {
  const key = `${event.title}|${event.date}|${event.url ?? ''}`;
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return `hsl(${hash % 360} 70% 76%)`;
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
