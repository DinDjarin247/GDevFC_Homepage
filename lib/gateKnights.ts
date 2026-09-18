/**
 * 성문을 지키는 여섯 기사.
 *
 * 광장 사람들(lib/npcSprites.ts)은 14x20 에 공용 팔레트를 쓰지만, 이쪽은 대문에
 * 딱 둘만 서는 얼굴마담이라 28x48 에 기사마다 전용 팔레트를 준다. 픽셀 수로는
 * 약 5배, 색 수로는 기사마다 따로라서 훨씬 촘촘하게 찍을 수 있다.
 *
 * 그리드 읽는 법은 npcSprites 와 같다 — 한 줄이 가로 한 줄, 글자 하나가 픽셀 하나,
 * '.' 은 투명. 글자 뜻은 각 기사의 palette 에 적어뒀으니 손으로 고쳐도 된다.
 *
 * 좌우 대칭 기준은 열 13.5 다 (열 x 의 짝은 27-x). 두 다리 사이는 열 12~15 를
 * 비워서, 어느 기사든 다리가 대칭으로 떨어지게 맞춰뒀다.
 */

export const KNIGHT_GRID = { w: 28, h: 48 };

export type GateKnight = {
  id: string;
  /** 사람이 알아보기 위한 이름 — 화면에는 쓰지 않는다 */
  name: string;
  /** 어떤 특징을 픽셀로 옮겼는지 */
  note: string;
  palette: Record<string, string>;
  grid: string[];
};

export const GATE_KNIGHTS: GateKnight[] = [
  {
    id: 'crimson',
    name: '붉은 깃',
    note: '붉은 깃 장식 투구 · 흰 털 망토 · 검게 그을린 판금 · 허리에 매단 등불',
    palette: {
      k: '#141519', // 투구 안쪽 · 외곽
      D: '#33363d', // 판금 그늘
      M: '#565c66', // 판금
      m: '#8f97a3', // 판금 하이라이트
      r: '#d2342c', // 붉은 깃
      R: '#8f1f1b', // 붉은 깃 그늘
      w: '#e9e3d1', // 흰 털
      W: '#b0a88f', // 흰 털 그늘
      l: '#c2ab82', // 가슴에 두른 밧줄
      L: '#6a563a', // 가죽 허리띠
      g: '#d9a43c', // 등불 놋쇠
      e: '#ffcf6b', // 등불 불빛
    },
    grid: [
      '..........r..rr..r..........',
      '..........rR.rr.Rr..........',
      '..........rRrrrrRr..........',
      '..........rRrrrrRr..........',
      '..........RrrrrrrR..........',
      '...........RrrrrR...........',
      '...........DRrrRD...........',
      '...........DDDDDD...........',
      '.........DDMMMMMMDD.........',
      '........DMMmmmmmmMMD........',
      '........DMkkkkkkkkMD........',
      '........DMkrrrrrrkMD........',
      '........DMkkrrrrkkMD........',
      '........DMkrrrrrrkMD........',
      '........DMMkkkkkkMMD........',
      '.........DMMmmmmMMD.........',
      '..........DDMMMMDD..........',
      '......wWwwWwwwwwwWwwWw......',
      '.....wwwwwwwwwwwwwwwwww.....',
      '....wwwwwwwwwwwwwwwwwwww....',
      '....WwwwwwwwwwwwwwwwwwwW....',
      '.....WWwwwwwwwwwwwwwwWW.....',
      '...DDMMDDDDDDDDDDDDDDMMDD...',
      '...DMMmDDllDDDDDDllDDmMMD...',
      '...DMMmDDDllDDDDllDDDmMMD...',
      '...DMMmDDDDllDDllDDDDmMMD...',
      '....MmDDDDDDllllDDDDDDmM....',
      '....MmDDDDDllDDllDDDDDmM....',
      '....MmDDDDllDDDDllDDDDmM....',
      '....MmDDDllDDDDDDllDDDmM....',
      '....MmDDDDDDDDDDDDDDDDmM....',
      '....LLLLLLLLLLLLLLLLLLLL....',
      '....LLggLLLLLLLLLLLLggLL....',
      '.....DDMMMMDDDDDDMMMMDDgg...',
      '.....DMMMMMDDDDDDMMMMMDge...',
      '.....DMMMMMDDDDDDMMMMMDee...',
      '.....DMMMMMD....DMMMMMDgg...',
      '.....DMMMMMD....DMMMMMD.....',
      '......DMMMMD....DMMMMD......',
      '......DMMMMD....DMMMMD......',
      '......DMMMMD....DMMMMD......',
      '......DDMMMD....DMMMDD......',
      '.......DMMD......DMMD.......',
      '.......DMMD......DMMD.......',
      '.......DMMD......DMMD.......',
      '.......kkkk......kkkk.......',
      '......kkkkkk....kkkkkk......',
      '.....kkkkkkk....kkkkkkk.....',
    ],
  },
  {
    id: 'hawk',
    name: '은빛 매',
    note: '은백색 광택 판금 · 관자놀이의 금빛 날개 · 깃털 모양 어깨 · 푸른 망토',
    palette: {
      k: '#16171b', // 눈 · 그늘
      D: '#6c7684', // 은판 그늘
      m: '#dfe4ea', // 은판
      g: '#e8c46a', // 금장식
      G: '#a8842f', // 금장식 그늘
      b: '#2f57b5', // 망토
      B: '#1d3a80', // 망토 그늘
      s: '#f0c9a8', // 살갗
      S: '#c79e7c', // 살갗 그늘
      w: '#f7f8fa', // 깃털
    },
    grid: [
      '...........mmmmmm...........',
      '....gg....mmmmmmmm....gg....',
      '....gggg..mmmmmmmm..gggg....',
      '.....gggg.mmmmmmmm.gggg.....',
      '......gggmmmmmmmmmmggg......',
      '.......ggmmmmmmmmmmgg.......',
      '........mmmmmmmmmmmm........',
      '........mmDDDDDDDDmm........',
      '........mmDssssssDmm........',
      '........mmDskssksDmm........',
      '........mmDssssssDmm........',
      '........mmmDssssDmmm........',
      '.........mmmDDDDmmm.........',
      '..........gggggggg..........',
      '.......wwwwmmmmmmwwww.......',
      '....bbwwwwwwmmmmwwwwwwbb....',
      '...bbbwwwwwwmmmmwwwwwwbbb...',
      '...bbbwwwwwmmmmmmwwwwwbbb...',
      '...bbbwwwwmmmmmmmmwwwwbbb...',
      '..bbbBwwwmmmmmmmmmmwwwBbbb..',
      '..bbbBDmmmmggggggmmmmDBbbb..',
      '..bbbBDmmmmmggggmmmmmDBbbb..',
      '..bbbBDmmmmmmggmmmmmmDBbbb..',
      '..bbbBDmmmmmmmmmmmmmmDBbbb..',
      '..bbbBDDmmmmmmmmmmmmDDBbbb..',
      '...bbBDmmmmmmmmmmmmmmDBbb...',
      '...bbBDmmmmmmmmmmmmmmDBbb...',
      '...bbBDDmmmmmmmmmmmmDDBbb...',
      '....bBDmmmmmmmmmmmmmmDBb....',
      '....bBggggggggggggggggBb....',
      '....bBgGGggggggggggGGgBb....',
      '....bBDmmmmmmmmmmmmmmDBb....',
      '.....BDmmmmmmmmmmmmmmDB.....',
      '.....BDmmmmmmDDmmmmmmDB.....',
      '.....BDmmmmmD..DmmmmmDB.....',
      '......Dmmmmm....mmmmmD......',
      '......DmmmmD....DmmmmD......',
      '......DmmmmD....DmmmmD......',
      '......DmmmmD....DmmmmD......',
      '......DmmmmD....DmmmmD......',
      '......DDmmmD....DmmmDD......',
      '.......DmmD......DmmD.......',
      '.......DmmD......DmmD.......',
      '.......DmmD......DmmD.......',
      '.......DmmD......DmmD.......',
      '.......mmmm......mmmm.......',
      '......mmmmmm....mmmmmm......',
      '.....mmmmmmm....mmmmmmm.....',
    ],
  },
  {
    id: 'blackswordsman',
    name: '검은 검사',
    note: '맨머리에 검은 머리 · 해진 검은 망토 · 한쪽만 드러낸 팔 · 검은 의수 · 등에 멘 대검',
    palette: {
      k: '#101118', // 검은 갑옷 · 의수
      K: '#0b0c10', // 더 짙은 그늘
      c: '#2d2f38', // 망토 (몸통보다 밝아야 실루엣이 갈린다)
      C: '#1d1f26', // 망토 그늘
      h: '#1d1d22', // 머리카락
      s: '#dfa878', // 살갗
      S: '#ab7a50', // 살갗 그늘
      l: '#7a5230', // 가죽
      L: '#4c3319', // 가죽 그늘
      M: '#5a6069', // 대검 날
      p: '#4a4e57', // 바지
      P: '#31343b', // 바지 그늘
      w: '#8e6a3c', // 칼자루 가죽끈
    },
    grid: [
      '...MMMM.....................',
      '...MMMMM....................',
      '...MMMMM....................',
      '....MMMMM...................',
      '....MMMMM...................',
      '.....MMMMM..hhhhhh..........',
      '.....LLMMM..hhhhhh..........',
      '......LLMM.hhhhhhhh.........',
      '......LwL..hhhhhhhh.........',
      '......LwL.hhssssshh.........',
      '......LLL.hssssssh..........',
      '..........hskssksh..........',
      '...........ssssss...........',
      '...........sSSSSs...........',
      '............sSSs............',
      '...cccccc..ssss..cccccc.....',
      '..cccccccc.ssss.cccccccc....',
      '..ccckkkkkkkkkkkkkkccccc....',
      '..cckkkkkkkkkkkkkkkkcccc....',
      '..cckkkkkkkkkkkkkkkkscccc...',
      '..cckkkkkkkkkkkkkkkkssccc...',
      '..cckkkkkkkkkkkkkkkkssccc...',
      '..cckkkkkkkkkkkkkkkkssccc...',
      '..cckkkkkkkkkkkkkkkkssccc...',
      '..cckkkkllllllllkkkkssccc...',
      '..cckkkllllllllllkkkssccc...',
      '..cckkklllllllllLkkkSsccc...',
      '..cckkkkllllllkkkkkkSsccc...',
      '...cppppppppppppppppp.cc....',
      '...cppppppppppppppppp.cc....',
      '...cpppppppppppppppppccc....',
      '....pppppppppppppppppcc.....',
      '....ppppppppppppppppccc.....',
      '.....ppppppppPPpppppcc......',
      '.....ppppppp....ppppppp.....',
      '.....ppppppp....ppppppp.....',
      '.....ppppppp....ppppppp.....',
      '.....ppppppp....ppppppp.....',
      '......pppppp....pppppp......',
      '......pppppp....pppppp......',
      '......llllll....llllll......',
      '......llllll....llllll......',
      '.......kkkk......kkkk.......',
      '.......kkkk......kkkk.......',
      '.......kkkk......kkkk.......',
      '.......kkkk......kkkk.......',
      '......kkkkkk....kkkkkk......',
      '.....kkkkkkk....kkkkkkk.....',
    ],
  },
  {
    id: 'bluesaber',
    name: '푸른 검성',
    note: '금발 묶음머리와 삐친 머리카락 · 은빛 흉갑 · 푸른 드레스와 흰 속치마 · 앞에 세워 든 검',
    palette: {
      k: '#16171b', // 눈 · 칼날 그늘
      y: '#f2d98a', // 금발
      Y: '#c9a94e', // 금발 그늘
      s: '#f5d6bb', // 살갗
      S: '#d0a382', // 살갗 그늘
      m: '#dfe4ea', // 은빛 갑옷 · 칼날
      M: '#a0aab6', // 은빛 그늘
      D: '#6b7480', // 은빛 더 짙은 그늘
      b: '#2b4c9e', // 푸른 드레스
      B: '#1a2f66', // 드레스 그늘
      w: '#eef1f5', // 흰 속치마
      g: '#e0bb56', // 금장식 · 칼자루
      n: '#eef2f6', // 칼날
    },
    grid: [
      '.............y..............',
      '..........yyyyyyy...........',
      '.........yyyyyyyyy..........',
      '.........yyyyyyyyy..........',
      '.........yyyyyyyyyy.........',
      '.........yyssssssyy.........',
      '.........yssssssssy.........',
      '.........yssksskssy.........',
      '.........yssssssssy.........',
      '..........ssssssss..........',
      '..........sSSSSSSs..........',
      '...........SSSSSS...........',
      '..........mmmmmmmm..........',
      '........mmmmmmmmmmmm........',
      '......mmmmmmmmmmmmmmmm......',
      '.....mmMMmmmmmmmmmmMMmm.....',
      '....bmmMMmmmmmmmmmmMMmmb....',
      '....bbmMmmmmmmmmmmmmMmbb....',
      '....bbmmmmmmmggmmmmmmmbb....',
      '....bbmmmmmmgggggmmmmmbb....',
      '....bbmmmmmggnngggmmmmbb....',
      '....bbbmmmmggnnggmmmmbbb....',
      '....bbbmmmmmmnnmmmmmmbbb....',
      '....bbbbmmmmmnnmmmmmbbbb....',
      '....bbbbbmmmmnnmmmmbbbbb....',
      '....bbbbbbmmmnnmmmbbbbbb....',
      '...bbbbbbbbmmnnmmbbbbbbbb...',
      '...bbbbbbbbwmnnmwbbbbbbbb...',
      '...bbbbbbbwwmnnmwwbbbbbbb...',
      '..bbbbbbbwwwwnnwwwwbbbbbbb..',
      '..bbbbbbwwwwwnnwwwwwbbbbbb..',
      '..bbbbbwwwwwwnnwwwwwwbbbbb..',
      '.bbbbbbwwwwwwnnwwwwwwbbbbbb.',
      '.bbbbbwwwwwwwnnwwwwwwwbbbbb.',
      '.bbbbwwwwwwwwnnwwwwwwwwbbbb.',
      '.bbbwwwwwwwwwnnwwwwwwwwwbbb.',
      '.bbwwwwwwwwwwnnwwwwwwwwwwbb.',
      'bbwwwwwwwwwwwnnwwwwwwwwwwwbb',
      'bwwwwwwwwwwwwnnwwwwwwwwwwwwb',
      'bbbbbbbbbbbbbnnbbbbbbbbbbbbb',
      '........mmmm.nn.mmmm........',
      '........mmmm.nn.mmmm........',
      '........mmmm.nn.mmmm........',
      '........mmmm..n..mmmm.......',
      '........mmmm.....mmmm.......',
      '........mmmm.....mmmm.......',
      '.......mmmmmm...mmmmmm......',
      '......mmmmmmm...mmmmmmm.....',
    ],
  },
  {
    id: 'whitewind',
    name: '하얀 바람',
    note: '높이 묶어 흩날리는 금발 · 흰 코르셋의 금빛 당초무늬 · 한쪽 어깨의 푸른 반망토 · 검은 장갑',
    palette: {
      k: '#16171b', // 눈 · 검은 장갑
      y: '#f0d488', // 금발
      Y: '#c8a548', // 금발 그늘
      s: '#f7dcc2', // 살갗
      S: '#d3a988', // 살갗 그늘
      w: '#f4f6f8', // 흰 옷
      W: '#c8ced6', // 흰 옷 그늘
      b: '#1f6f8f', // 푸른 반망토
      B: '#14495e', // 반망토 그늘
      g: '#d9b455', // 금빛 당초무늬
      m: '#cfd6de', // 칼날
      M: '#87909b', // 칼날 그늘
    },
    grid: [
      '..........yyyyyy............',
      '.........yyyyyyyy...........',
      '........yyyyyyyyyy..........',
      '........yyyyyyyyyyyy........',
      '........yyssssssyyyyy.......',
      '........ysssssssyyyyyy......',
      '........ysskssksyyyyy.......',
      '........yssssssssyyyy.......',
      '.........sssssssyyyyy.......',
      '.........sSSSSSSyyyyyy......',
      '..........SSSSS.yyyyyy......',
      '..........wwwww..yyyyyy.....',
      '........wwwwwwwww.yyyyy.....',
      '.....bbwwwwwwwwwww.yyy......',
      '....bbbwwwwwwwwwwww.yy......',
      '....bbbkwwwwwwwwwwwk........',
      '....bBbkwwwwgwwgwwwwk.......',
      '....bBbkwwwgggggwwwwk.......',
      '....bBbkwwwwgggwwwwwk.......',
      '....bBbkwwwwwgwwwwwwk.......',
      '....bBbkwwwwwgwwwwwwk.......',
      '....bBbkwwwwgggwwwwwk.......',
      '....bBbkwwwgggggwwwwk.......',
      '.....Bbkwwwwgggwwwwwk.......',
      '.....Bbkkwwwwwwwwwkkk.......',
      '.....Bbkgggggggggggkm.......',
      '......bkwwwwwwwwwwwkM.......',
      '......bwwwwwwwwwwwwwM.......',
      '.......wwwwwwwwwwwwwM.......',
      '.......wwwwwwwwwwwwwM.......',
      '.......wwwwwwwwwwwwwM.......',
      '.......wwwwwwWWwwwwwM.......',
      '.......wwwww....wwwwwM......',
      '......wwwwww....wwwwww......',
      '......wwwwww....wwwwww......',
      '......wwwwww....wwwwww......',
      '......wwwwww....wwwwww......',
      '......wwwwww....wwwwww......',
      '......WWwwww....wwwwWW......',
      '......kkkkkk....kkkkkk......',
      '......kkkkkk....kkkkkk......',
      '.......kkkk......kkkk.......',
      '.......kkkk......kkkk.......',
      '.......kkkk......kkkk.......',
      '.......kkkk......kkkk.......',
      '.......kkkk......kkkk.......',
      '......kkkkkk....kkkkkk......',
      '.....kkkkkkk....kkkkkkk.....',
    ],
  },
  {
    id: 'brasshelm',
    name: '황금 투구',
    note: '놋쇠 투구에서 길게 흩날리는 붉은 깃 · 붉고 흰 체크무늬 어깨 · 놋쇠와 강철 판금 · 두 손으로 세워 든 검',
    palette: {
      k: '#17181c', // 투구 안쪽 · 눈
      g: '#d9a83f', // 놋쇠
      G: '#9a6f22', // 놋쇠 그늘
      y: '#f0cf7a', // 놋쇠 하이라이트
      r: '#b5322c', // 붉은 깃 · 붉은 체크
      R: '#7a1d1a', // 붉은 그늘
      w: '#ece7dc', // 흰 체크
      W: '#b5afa2', // 흰 체크 그늘
      m: '#c3cad3', // 강철 · 칼날
      M: '#818a95', // 강철 그늘
      D: '#565e69', // 강철 그늘 진한 곳
      n: '#eef2f6', // 칼날
      s: '#e8bd9a', // 살갗 (턱)
    },
    grid: [
      '...........gggg....rr.......',
      '..........ggyygg..rrrr......',
      '.........ggyyyygg.rrrRR.....',
      '.........gyyyyyyggrrRR......',
      '........ggyyyyyyggrrRR......',
      '........ggkkkkkkggrRR.......',
      '........gGkkkkkkGgRR........',
      '........gGkssssGGgR.........',
      '........gGksskkGGg..........',
      '........gGkssssGGg..........',
      '........gGGkssGGGg..........',
      '.........gGGGGGGg...........',
      '..........gggggg............',
      '.........mmmmmmmm...........',
      '.......mmmmmmmmmmmm.........',
      '.....rwrwmmmmmmmmwrwr.......',
      '....wrwrwmmmmmmmmrwrwr......',
      '....rwrwrmmmmmmmmwrwrw......',
      '....wrwrwmmmmmmmmrwrwr......',
      '....MMmmmmmmggmmmmmmMM......',
      '....MmmmmmmgggggmmmmmM......',
      '....MmmmmmmgnngggmmmmM......',
      '....MmmmmmmgnnggmmmmmM......',
      '....MMmmmmmmnnmmmmmmMM......',
      '.....MmmmmmmnnmmmmmmM.......',
      '.....MmmmmmmnnmmmmmmM.......',
      '.....MMmmmmmnnmmmmmMM.......',
      '.....gggggggnnggggggg.......',
      '.....gGgggggnngggggGg.......',
      '....MMmmmmmmnnmmmmmmMM......',
      '....MmmmmmmmnnmmmmmmmM......',
      '....mmMmMmMmnnMmMmMmmm......',
      '....mMmMmMmMnnmMmMmMmm......',
      '....mmMmMmMmnnMmMmMmmm......',
      '....mMmMmMmMnnmMmMmMmm......',
      '....mmMmMmMmnnMmMmMmmm......',
      '.....MmMmMmMnnMmMmMmM.......',
      '.....mMmMmMmnnmMmMmMm.......',
      '......MmMmMm.n.MmMmM........',
      '......mmmmmm...mmmmmm.......',
      '......DmmmmD...DmmmmD.......',
      '......DmmmmD...DmmmmD.......',
      '.......DmmD.....DmmD........',
      '.......DmmD.....DmmD........',
      '.......DmmD.....DmmD........',
      '.......mmmm.....mmmm........',
      '......mmmmmm...mmmmmm.......',
      '.....mmmmmmm...mmmmmmm......',
    ],
  },
];

/**
 * 그리드 한 장을 1글자 = 1픽셀짜리 캔버스로 굽는다.
 * 화면에 얼마나 크게 얹을지는 그릴 때 정하므로 여기서는 원본 해상도 그대로 만든다.
 */
export function paintKnight(knight: GateKnight) {
  const { w, h } = KNIGHT_GRID;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  for (let y = 0; y < h; y++) {
    const row = knight.grid[y];
    if (!row) continue;
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (ch === undefined || ch === '.') continue;
      const color = knight.palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return canvas;
}

/**
 * 오늘 문을 지킬 두 사람을 뽑는다.
 *
 * 접속할 때마다 다른 조합을 보라고 무작위로 고르되, 같은 기사가 양쪽에 서면
 * 쌍둥이처럼 보이므로 반드시 서로 다른 둘을 뽑는다. 좌우 순서까지 섞이므로
 * 여섯 명에서 나오는 조합은 30 가지다.
 */
export function pickKnightPair(): [GateKnight, GateKnight] {
  const left = Math.floor(Math.random() * GATE_KNIGHTS.length);
  // 남은 다섯 중에서 고른 뒤 자리를 되돌려, 어느 쪽도 같은 사람이 되지 않게 한다
  let right = Math.floor(Math.random() * (GATE_KNIGHTS.length - 1));
  if (right >= left) right += 1;
  return [GATE_KNIGHTS[left], GATE_KNIGHTS[right]];
}
