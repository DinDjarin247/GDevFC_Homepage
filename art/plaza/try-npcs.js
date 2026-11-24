// 시험 렌더: 마을 사람 → art/preview/plaza-npcs.png
const path = require('path');
const { P } = require('./kit');
const { DESIGNS, frames } = require('./npcs');

const only = process.argv[2];
const names = Object.keys(DESIGNS).filter((n) => !only || only.split(',').includes(n));
const rows = [];
for (const size of ['near', 'mid', 'far']) {
  const items = [];
  for (const name of names) {
    const f = frames(name, size);
    const all = size === 'near' ? [...f.walk, ...f.idle] : [f.walk[0], f.idle[0]];
    const sheet = new P.Buf(f.cell.w * all.length, f.cell.h);
    sheet.clear([122, 112, 98]);
    all.forEach((mt, i) => {
      const r = mt.resolve();
      for (let y = 0; y < f.cell.h; y++) for (let x = 0; x < f.cell.w; x++) if (r.col.px[y * f.cell.w + x]) sheet.px[y * sheet.w + i * f.cell.w + x] = r.col.px[y * f.cell.w + x];
    });
    items.push({ buf: sheet, label: size === 'near' ? name : '', scale: size === 'near' ? 3 : 3 });
  }
  rows.push(P.sheet(items, { cols: size === 'near' ? 2 : 8 }));
}
P.save(P.sheet(rows.map((buf) => ({ buf, scale: 1 })), { cols: 1 }), path.join(__dirname, '..', 'preview', 'plaza-npcs.png'));
console.log('ok', names.length);
