// 시험 렌더: 마을 사람 → art/preview/plaza-npcs.png
//   node art/plaza/try-npcs.js [이름,이름] [walk|dirs]
// dirs: 사람마다 다섯 방향의 서 있는 모습. walk: 한 방향의 걷기 8프레임 + 서기 · 손짓.
const path = require('path');
const { P } = require('./kit');
const { DESIGNS, DIR_NAMES, ANIMS, SCALES, frame } = require('./npcs');
const { bounds } = require('./rig');

const only = process.argv[2] && process.argv[2] !== 'all' ? process.argv[2].split(',') : null;
const mode = process.argv[3] ?? 'dirs';
const bucket = Number(process.argv[4] ?? 4);
const names = Object.keys(DESIGNS).filter((n) => !only || only.includes(n));
const items = [];
const bgOf = (b) => {
  const bg = new P.Buf(b.w, b.h);
  bg.clear([150, 138, 120]);
  bg.sprite(b, 0, 0);
  return bg;
};
for (const name of names) {
  const list = mode === 'walk'
    ? ['SE', 'E', 'S', 'N'].flatMap((dir) => ANIMS.map((a) => [dir, a]))
    : DIR_NAMES.flatMap((dir) => [[dir, 'i0'], [dir, 'w2']]);
  const full = list.map(([dir, a]) => frame(name, bucket, dir, a).buf);
  // 모두 같은 범위로 잘라 붙인다 (발밑이 같은 높이에 오게)
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (const f of full) {
    const bb = bounds(f);
    if (!bb) continue;
    x0 = Math.min(x0, bb.x0); y0 = Math.min(y0, bb.y0); x1 = Math.max(x1, bb.x1); y1 = Math.max(y1, bb.y1);
  }
  const bufs = full.map((f) => P.crop(f, x0 - 2, y0 - 2, x1 - x0 + 5, y1 - y0 + 5));
  const w = bufs[0].w, h = bufs[0].h;
  const cols = mode === 'walk' ? ANIMS.length : list.length;
  const rows = Math.ceil(bufs.length / cols);
  const strip = new P.Buf(w * cols, h * rows);
  bufs.forEach((b, i) => strip.sprite(b, (i % cols) * w, Math.floor(i / cols) * h));
  items.push({ buf: bgOf(strip), label: `${name} s${SCALES[bucket]}`, scale: Number(process.argv[5] ?? 4) });
}
P.save(P.sheet(items, { cols: 1 }), path.join(__dirname, '..', 'preview', 'plaza-npcs.png'));
console.log('ok', names.length);
