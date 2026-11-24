// 시험 렌더: 소품 → art/preview/plaza-props.png
const path = require('path');
const { P } = require('./kit');
const pr = require('./props');

const items = [
  ['fountain', pr.fountain(0)],
  ['tent', pr.tent()],
  ['stall fruit', pr.stall({ kind: 'fruit' })],
  ['stall bread', pr.stall({ kind: 'bread', a: 'clothGreen', w: 84 })],
  ['stall scroll', pr.stall({ kind: 'scroll', a: 'clothPurple', b: 'clothGold', w: 96 })],
  ['sofa', pr.sofa()],
  ['tv', pr.tvSet()],
  ['bench', pr.bench()],
  ['brazier', pr.brazier()],
  ['target', pr.target()],
  ['cart', pr.hayCart()],
  ['clutter0', pr.clutter(0)],
  ['clutter1', pr.clutter(1)],
  ['clutter2', pr.clutter(2)],
  ['lamp', pr.lampPost()],
  ['sign', pr.signpost()],
];
const bufs = items.map(([label, p]) => {
  const r = p.mat.resolve();
  const b = new P.Buf(r.col.w, r.col.h);
  b.clear([112, 104, 92]);
  for (let i = 0; i < b.px.length; i++) if (r.col.px[i]) b.px[i] = r.glow.px[i] || r.lit.px[i] || r.col.px[i];
  return { buf: b, label, scale: 2 };
});
P.save(P.sheet(bufs, { cols: 5 }), path.join(__dirname, '..', 'preview', 'plaza-props.png'));
console.log('ok');
