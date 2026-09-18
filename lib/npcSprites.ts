/**
 * 마을 사람 픽셀 스프라이트.
 *
 * components/Sprite.tsx 의 주인공들과 같은 방식 — 문자 그리드로 그림을 적어두고
 * 색은 팔레트에서 찾는다. 다만 이쪽은 캔버스(PlazaScene) 위에 얹히므로, 마운트할 때
 * 사람마다 한 번씩 작은 오프스크린 캔버스로 구워두고 매 프레임 그 그림만 찍는다.
 * 사각형을 수십 개씩 매번 다시 그리던 예전 방식보다 오히려 가볍다.
 *
 * 근경(NPC_GRID)은 광장을 걸어다니는 사람, 원경(NPC_FAR_GRID)은 지평선 길을 오가는
 * 사람용이다. 원경은 10px 남짓이라 근경 그림을 줄이면 뭉개지므로 따로 그렸다.
 * 종류마다 두 장씩 있는 건 걸음(다리·팔 위치) 프레임이다.
 *
 * 이 파일은 scripts 로 찍어내지 않고 손으로 고쳐도 된다 — 한 줄이 가로 한 줄이고,
 * 글자 하나가 픽셀 하나다. 글자 뜻은 paintNpcSprite 의 colors 표에 있다.
 */

export type NpcKind = 'commoner' | 'knight' | 'mercenary' | 'orc' | 'elf' | 'dwarf';

export const NPC_GRID = { w: 14, h: 20 };
export const NPC_FAR_GRID = { w: 8, h: 11 };

/** 사람마다 달라지는 색 — 나머지는 고정 팔레트를 쓴다 */
export type NpcPalette = {
  skin: string;
  hair: string;
  coat: string;
};

/** 종족 고유 살갗 (없으면 사람마다 지정한 색) */
export const NPC_SKIN: Partial<Record<NpcKind, string>> = {
  orc: '#6f8f4a',
  elf: '#f2dcc0',
};

type NpcSprite = { near: [string[], string[]]; far: [string[], string[]] };

export const NPC_SPRITES: Record<NpcKind, NpcSprite> = {
  commoner: {
    near: [
      [
        '..............',
        '...hhhhhhhh...',
        '...hhhhhhhh...',
        '...hssssssh...',
        '....skssks....',
        '....ssssss....',
        '....sSSSSs....',
        '......SS......',
        '...cccccccc...',
        '..cccccccccc..',
        '..cccccccccc..',
        '..cccccccccc..',
        '..skkkkkkkks..',
        '...CCCCCCCC...',
        '....pp..pp....',
        '....pp..pp....',
        '....pp..pp....',
        '....pp..pp....',
        '....bb..bb....',
        '....bb..bb....',
      ],
      [
        '..............',
        '...hhhhhhhh...',
        '...hhhhhhhh...',
        '...hssssssh...',
        '....skssks....',
        '....ssssss....',
        '....sSSSSs....',
        '......SS......',
        '..ccccccccc...',
        '..ccccccccc...',
        '..cccccccccc..',
        '..cccccccccc..',
        '..skkkkkkkkc..',
        '...CCCCCCCCs..',
        '...pp....pp...',
        '...pp....pp...',
        '...pp....pp...',
        '...pp....pp...',
        '..bbb....bbb..',
        '..bbb....bbb..',
      ],
    ],
    far: [
      [
        '........',
        '...hh...',
        '...ss...',
        '...ss...',
        '..cccc..',
        '.cccccc.',
        '.cccccc.',
        '..cccc..',
        '..pppp..',
        '..pppp..',
        '..pppp..',
      ],
      [
        '........',
        '...hh...',
        '...ss...',
        '...ss...',
        '..cccc..',
        '.cccccc.',
        '.cccccc.',
        '..cccc..',
        '.pp..pp.',
        '.pp..pp.',
        '.pp..pp.',
      ],
    ],
  },
  knight: {
    near: [
      [
        '......rr....m.',
        '....mmmmmm..m.',
        '....mmmmmm..w.',
        '....mmmmmm..w.',
        '....mkkkkm..w.',
        '....mmmmmm..w.',
        '....MMMMMM..w.',
        '..MMmmmmmmMMw.',
        '..MMmmmmmmMMw.',
        '..mmmmmmmmmmw.',
        '..mmmmmmmmmmw.',
        '..mmmmmmmmmmw.',
        '...gggggggg.w.',
        '...MMMMMMMM.w.',
        '....MM..MM..w.',
        '....MM..MM..w.',
        '....MM..MM..w.',
        '....MM..MM....',
        '....kk..kk....',
        '....kk..kk....',
      ],
      [
        '......rr....m.',
        '....mmmmmm..m.',
        '....mmmmmm..w.',
        '....mmmmmm..w.',
        '....mkkkkm..w.',
        '....mmmmmm..w.',
        '....MMMMMM..w.',
        '..MMmmmmmmMMw.',
        '..MMmmmmmmMMw.',
        '..mmmmmmmmm.w.',
        '..mmmmmmmmmmw.',
        '..mmmmmmmmmmw.',
        '..mggggggggmw.',
        '...MMMMMMMM.w.',
        '...MM....MM.w.',
        '...MM....MM.w.',
        '...MM....MM.w.',
        '...MM....MM...',
        '..kkk....kkk..',
        '..kkk....kkk..',
      ],
    ],
    far: [
      [
        '...r....',
        '...mm..w',
        '...mm..w',
        '...mm..w',
        '..mmmm.w',
        '.MmmmmMw',
        '.MmmmmMw',
        '..mmmm.w',
        '..MMMM..',
        '..MMMM..',
        '..MMMM..',
      ],
      [
        '...r....',
        '...mm..w',
        '...mm..w',
        '...mm..w',
        '..mmmm.w',
        '.MmmmmMw',
        '.MmmmmMw',
        '..mmmm.w',
        '.MM..MM.',
        '.MM..MM.',
        '.MM..MM.',
      ],
    ],
  },
  mercenary: {
    near: [
      [
        '..............',
        '...hhhhhhhh...',
        '...hhhhhhhh...',
        '...rrrrrrrr.m.',
        '...hssssssh.m.',
        '....skssks..m.',
        '....sSSSSs..m.',
        '......SS....m.',
        '..MMMcccccc.m.',
        '..MMMcccccc.m.',
        '..ccccccccccm.',
        '..ccccccccccww',
        '..skkkkkkkksw.',
        '...CCCCCCCC.w.',
        '....pp..pp....',
        '....pp..pp....',
        '....pp..pp....',
        '....pp..pp....',
        '....bb..bb....',
        '....bb..bb....',
      ],
      [
        '..............',
        '...hhhhhhhh...',
        '...hhhhhhhh...',
        '...rrrrrrrr.m.',
        '...hssssssh.m.',
        '....skssks..m.',
        '....sSSSSs..m.',
        '......SS....m.',
        '..MMMcccccc.m.',
        '..MMMcccccccm.',
        '..ccccccccccm.',
        '..ccccccccccww',
        '..ckkkkkkkksw.',
        '..sCCCCCCCC.w.',
        '...pp....pp...',
        '...pp....pp...',
        '...pp....pp...',
        '...pp....pp...',
        '..bbb....bbb..',
        '..bbb....bbb..',
      ],
    ],
    far: [
      [
        '........',
        '...hh...',
        '...ss...',
        '...ss..m',
        '..cccc.m',
        '.ccccccm',
        '.ccccccm',
        '..cccc.m',
        '..pppp..',
        '..pppp..',
        '..pppp..',
      ],
      [
        '........',
        '...hh...',
        '...ss...',
        '...ss..m',
        '..cccc.m',
        '.ccccccm',
        '.ccccccm',
        '..cccc.m',
        '.pp..pp.',
        '.pp..pp.',
        '.pp..pp.',
      ],
    ],
  },
  orc: {
    near: [
      [
        '..............',
        '..............',
        '....hhhhhh....',
        'mmm.SSSSSS....',
        'mmm.skssks....',
        '.w..ssssss....',
        '.w..ssssss....',
        '.w...t..t.....',
        '.cccccccccccc.',
        '.ssccccccccss.',
        '.ssccccccccss.',
        '.ssccccccccss.',
        '.sskkkkkkkkss.',
        '..CCCCCCCCCC..',
        '...ppp..ppp...',
        '...ppp..ppp...',
        '...ppp..ppp...',
        '...bbb..bbb...',
        '...bbb..bbb...',
        '...bbb..bbb...',
      ],
      [
        '..............',
        '..............',
        '....hhhhhh....',
        'mmm.SSSSSS....',
        'mmm.skssks....',
        '.w..ssssss....',
        '.w..ssssss....',
        '.w...t..t.....',
        '.cccccccccccc.',
        '.ccccccccccss.',
        '.ssccccccccss.',
        '.ssccccccccss.',
        '.sskkkkkkkkss.',
        '.ssCCCCCCCCC..',
        '..ppp....ppp..',
        '..ppp....ppp..',
        '..ppp....ppp..',
        '.bbbb....bbbb.',
        '.bbbb....bbbb.',
        '.bbbb....bbbb.',
      ],
    ],
    far: [
      [
        '........',
        '........',
        '..hhhh..',
        '..ssss..',
        '..ssss..',
        '.cccccc.',
        'sccccccs',
        'sccccccs',
        'sccccccs',
        '..pppp..',
        '..pppp..',
      ],
      [
        '........',
        '........',
        '..hhhh..',
        '..ssss..',
        '..ssss..',
        '.cccccc.',
        'sccccccs',
        'sccccccs',
        'sccccccs',
        '.pp..pp.',
        '.pp..pp.',
      ],
    ],
  },
  elf: {
    near: [
      [
        '...hhhhhhhh...',
        '...hhhhhhhh...',
        '...hssssssh...',
        '..ssskssksssw.',
        '...hssssssh.kw',
        '...hsSSSSsh.kw',
        '...hcccccch.kw',
        '...hcccccch.kw',
        '...cccccccc.kw',
        '...cccccccc.w.',
        '...cccccccc...',
        '...cggggggc...',
        '...sCCCCCCs...',
        '....pp..pp....',
        '....pp..pp....',
        '....pp..pp....',
        '....pp..pp....',
        '....pp..pp....',
        '....bb..bb....',
        '....bb..bb....',
      ],
      [
        '...hhhhhhhh...',
        '...hhhhhhhh...',
        '...hssssssh...',
        '..ssskssksssw.',
        '...hssssssh.kw',
        '...hsSSSSsh.kw',
        '...hcccccch.kw',
        '...hcccccch.kw',
        '...ccccccch.kw',
        '...cccccccc.w.',
        '...cccccccc...',
        '...cggggggc...',
        '...sCCCCCCs...',
        '...pp....pp...',
        '...pp....pp...',
        '...pp....pp...',
        '...pp....pp...',
        '...pp....pp...',
        '..bbb....bbb..',
        '..bbb....bbb..',
      ],
    ],
    far: [
      [
        '...hh...',
        '...ss...',
        '..hssh..',
        '...cc.w.',
        '..cccc.w',
        '...cc..w',
        '...cc.w.',
        '...cc...',
        '...pp...',
        '...pp...',
        '...pp...',
      ],
      [
        '...hh...',
        '...ss...',
        '..hssh..',
        '...cc.w.',
        '..cccc.w',
        '...cc..w',
        '...cc.w.',
        '...cc...',
        '..p..p..',
        '..p..p..',
        '..p..p..',
      ],
    ],
  },
  dwarf: {
    near: [
      [
        '..............',
        '..............',
        '..............',
        '..............',
        '..............',
        '...MMMMMMMM...',
        '...mmmmmmmm...',
        '...mmmmmmmm...',
        '....skMsks....',
        'mmm.ssssss....',
        'mmmhhhhhhhh...',
        '.wchhhhhhhhc..',
        '.cchhhhhhhhcc.',
        '.cchhhhhhhhcc.',
        '.ccchhhhhhccc.',
        '.skkkkkkkkkks.',
        '..CCCCCCCCCC..',
        '...ppp..ppp...',
        '...bbb..bbb...',
        '...bbb..bbb...',
      ],
      [
        '..............',
        '..............',
        '..............',
        '..............',
        '..............',
        '...MMMMMMMM...',
        '...mmmmmmmm...',
        '...mmmmmmmm...',
        '....skMsks....',
        'mmm.ssssss....',
        'mmmhhhhhhhh...',
        '.wchhhhhhhhc..',
        '.cchhhhhhhhcc.',
        '.cchhhhhhhhcc.',
        '.ccchhhhhhccc.',
        '.skkkkkkkkkks.',
        '..CCCCCCCCCC..',
        '..ppp....ppp..',
        '.bbbb....bbbb.',
        '.bbbb....bbbb.',
      ],
    ],
    far: [
      [
        '........',
        '........',
        '........',
        '..mmmm..',
        '...ss...',
        '.chhhhc.',
        'cchhhhcc',
        '.chhhhc.',
        '.cccccc.',
        '..pppp..',
        '..pppp..',
      ],
      [
        '........',
        '........',
        '........',
        '..mmmm..',
        '...ss...',
        '.chhhhc.',
        'cchhhhcc',
        '.chhhhc.',
        '.cccccc.',
        '.pp..pp.',
        '.pp..pp.',
      ],
    ],
  },
};

/** 색을 f 배만큼 어둡게 — 옷 그늘(C)처럼 원래 색에서 파생되는 자리에 쓴다 */
function shade(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c((n >> 16) & 255)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`;
}

/**
 * 그리드 한 장을 1글자 = 1픽셀짜리 캔버스로 굽는다.
 * 화면에 얼마나 크게 얹을지는 그릴 때 정하므로, 여기서는 원본 해상도 그대로 만든다.
 */
export function paintNpcSprite(grid: string[], w: number, h: number, pal: NpcPalette) {
  const colors: Record<string, string> = {
    k: '#1b1c22', // 눈 · 허리띠 · 외곽
    s: pal.skin,
    S: shade(pal.skin, 0.78), // 살갗 그늘
    h: pal.hair, // 머리카락 · 수염
    c: pal.coat,
    C: shade(pal.coat, 0.72), // 옷 그늘
    p: '#3b2f26', // 바지
    b: '#24201c', // 신발
    m: '#c3cad3', // 쇠붙이
    M: '#828b96', // 쇠붙이 그늘
    w: '#6a4a2c', // 나무 (자루 · 활)
    r: '#c4402f', // 깃털 · 머리띠
    t: '#eae2cf', // 이빨
    g: '#d9a43c', // 금장식
  };

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  for (let y = 0; y < h; y++) {
    const row = grid[y];
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (ch === undefined || ch === '.') continue;
      const color = colors[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return canvas;
}
