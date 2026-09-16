export type ExternalEvent = {
  title: string;
  category: string;
  date: string;
  location: string;
  organizer: string;
  summary: string;
  url: string | null;
};

/** Published CSV may contain quoted commas, newlines, and escaped quotes. */
export function parseCsv(source: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const text = source.replace(/^\uFEFF/, '');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && char === ',') {
      row.push(cell);
      cell = '';
    } else if (!quoted && (char === '\n' || char === '\r')) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      if (char === '\r' && text[i + 1] === '\n') i++;
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error('CSV 따옴표가 닫히지 않았습니다.');
  row.push(cell);
  rows.push(row);
  return rows.filter((values) => values.some((value) => value.trim()));
}

export function safeEventUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function parseEventsCsv(source: string): ExternalEvent[] {
  const [headers, ...rows] = parseCsv(source);
  if (!headers) return [];
  const columns = headers.map((header) => header.trim());
  if (!columns.includes('행사명') && !columns.includes('title')) throw new Error('행사명 또는 title 열이 없습니다.');
  const read = (row: string[], ...names: string[]) => {
    for (const name of names) {
      const value = row[columns.indexOf(name)]?.trim();
      if (value) return value;
    }
    return '';
  };

  return rows.filter((row) => read(row, '행사명', 'title')).map((row) => {
    const start = read(row, 'start_date');
    const end = read(row, 'end_date');
    const category = read(row, '분류', 'category');
    return {
      title: read(row, '행사명', 'title'),
      category: category === 'jam' ? '게임잼' : category || '기타',
      date: read(row, '일정') || (start && end && start !== end ? `${start} ~ ${end}` : start || end),
      location: read(row, '장소', 'location'),
      organizer: read(row, '주최', 'organizer'),
      summary: read(row, '소개', 'summary'),
      url: safeEventUrl(read(row, '링크', 'url')),
    };
  });
}
