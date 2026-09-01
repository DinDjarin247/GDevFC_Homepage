/**
 * 픽셀 스프라이트 폴백.
 * public/images/mode-*.png 가 없을 때 카드에 표시되는 기본 아트워크.
 * 16x22 그리드를 문자열로 정의하고 <rect> 로 렌더링한다.
 */

const PALETTE: Record<string, string> = {
  k: '#14161a', // 외곽선
  s: '#f0c49a', // 피부
  S: '#cf9a6f', // 피부 그림자
  e: '#24407a', // 파란 눈
  E: '#2f6b3a', // 초록 눈
  h: '#e8b544', // 금발
  H: '#b3812a', // 금발 그림자
  a: '#c6cad1', // 은빛 갑옷
  A: '#868b94', // 갑옷 그림자
  g: '#d9a93f', // 금장식
  b: '#2c4e94', // 파란 천
  w: '#eceff4', // 하이라이트
  p: '#6f42a3', // 보라
  P: '#46296b', // 보라 그림자
  m: '#bb74e6', // 보석
  r: '#8a5730', // 갈색 머리
  n: '#4f6f36', // 초록
  N: '#354a24', // 초록 그림자
  t: '#cbb98c', // 밝은 갈색 머리
  o: '#6b4a2a', // 나무(활/지팡이)
  O: '#3d2a16', // 활시위
  // 엘프 아처용 밝은 팔레트
  f: '#f7e7a8', // 플래티넘 블론드
  F: '#d9c274', // 블론드 그림자
  c: '#6fc98a', // 민트 그린 망토
  C: '#47996a', // 망토 그림자
  l: '#e8f7d0', // 아이보리 튜닉
  q: '#7fe3c0', // 청록 액센트
  // 우왕이(마스코트) 전용 — 뿔 달린 주황 소, 버건디 재킷
  y: '#e8935a', // 털(주황)
  Y: '#c96f3d', // 털 그림자
  v: '#f5f0e0', // 뿔 / 단추 / 바지 줄무늬 (오프화이트)
  z: '#f7dfb0', // 얼굴 패치(탠)
  j: '#7a2438', // 재킷(버건디)
  J: '#5c1b2a', // 재킷 그림자
  x: '#f2a6b0', // 볼터치
  // 잠긴 슬롯 실루엣은 기존 'm'(보석 보라) 을 재사용한다
  // 바드(갤러리) 전용
  u: '#7a3b5e', // 챙 넓은 모자(보라)
  U: '#4d2340', // 모자 그림자
  // 도적(게시판) 전용
  B: '#2a2a30', // 후드/망토(어두운 남보라)
  L: '#1a1a1f', // 망토 그림자
};

/** 수동으로 16글자를 세는 실수를 막기 위한 그리드 빌더 (인덱스 → 문자) */
function buildRow(width: number, marks: Record<number, string>, base = '.'): string {
  return Array.from({ length: width }, (_, i) => marks[i] ?? base).join('');
}

function markRange(from: number, to: number, ch: string): Record<number, string> {
  const m: Record<number, string> = {};
  for (let i = from; i <= to; i++) m[i] = ch;
  return m;
}

const KNIGHT = [
  '................',
  '.....hhhhh......',
  '....hhhhhhh.....',
  '...hhHhhhHhh....',
  '...hssssssss....',
  '...hsesessss....',
  '....ssssssss....',
  '.....SSSSS......',
  '...gggggggg.....',
  '..aabbbbbbaa....',
  '..aAbbwwbbAaaaaa',
  '..aabbwwbbaaagaa',
  '...abbwwbba.agaa',
  '...abbbbbba.gggg',
  '...gbbbbbbg.agaa',
  '...bbbbbbbb.agaa',
  '...bbb..bbb.agaa',
  '...aab..baa..aa.',
  '...aa....aa...a.',
  '..kaa....aak....',
  '..kkk....kkk....',
  '................',
];

const MAGE = [
  '.......pp.......',
  '......pppp......',
  '.....pPpppp.....',
  '....pppppppp....',
  '...pppgggppp....',
  '..pppppppppp....',
  '.pppppppppppp...',
  '...rrssssrr.....',
  '...rsesesssr....',
  '...rssssssr.....',
  '..mrrssssrr.....',
  '..mppppppppp....',
  '..oppgggggpp....',
  '..oppppppppp....',
  '..oPppppppPp....',
  '..opppppppppp...',
  '..oppppppppppp..',
  '..oPpppppppppP..',
  '..oPPPPPPPPPP...',
  '..o.kkkkkkkk....',
  '................',
  '................',
];

/**
 * 엘프 아처 — 뾰족한 귀, 플래티넘 블론드, 민트 망토.
 * 몸통은 col 1~9, 리커브 활은 col 11~15 (시위 O 는 col 11 직선).
 */
const ARCHER = [
  '................',
  '....fff.........',
  '...fffff........',
  '..fFfffFf..o....',
  '.sffsssffs.Oo...',
  '..fsEsEsf..O.o..',
  '...sssss...O.o..',
  '....SSS....O..o.',
  '..ccccccc..O..o.',
  '.ccclllccc.O..o.',
  '.ccqlllqcc.O..o.',
  '.cCclllcCc.O..o.',
  '.cqqqqqqqc.O..o.',
  '.ccclllccc.O..o.',
  '.cCclllcCc.O.o..',
  '.ccclllccc.O.o..',
  '.cccclcccc.Oo...',
  '.ccc...ccc.o....',
  '.CCC...CCC......',
  '.kCC...CCk......',
  '.kkk...kkk......',
  '................',
];

const W = 16;

/**
 * 우왕이 — 뿔 달린 주황 소 마스코트. 버건디 재킷(단추 줄) + 주황 바지.
 * 얼굴은 주황 바탕에 탠 색 얼굴 패치, 큰 눈, 볼터치로 구성.
 */
const WOOWANG = [
  buildRow(W, {}),
  buildRow(W, { 6: 'v', 9: 'v' }),
  buildRow(W, { ...markRange(5, 6, 'v'), ...markRange(9, 10, 'v') }),
  buildRow(W, markRange(4, 11, 'y')),
  buildRow(W, { ...markRange(3, 12, 'y'), 3: 'Y', 12: 'Y' }),
  buildRow(W, { ...markRange(2, 13, 'y'), ...markRange(5, 10, 'z'), 6: 'k', 9: 'k' }),
  buildRow(W, { ...markRange(2, 13, 'y'), ...markRange(5, 10, 'z'), 3: 'x', 12: 'x' }),
  buildRow(W, { ...markRange(2, 13, 'y'), ...markRange(6, 9, 'z'), 7: 'k', 8: 'k' }),
  buildRow(W, markRange(3, 12, 'Y')),
  buildRow(W, { ...markRange(2, 13, 'j'), 7: 'v' }),
  buildRow(W, { ...markRange(2, 13, 'j'), 2: 'J', 13: 'J', 8: 'v' }),
  buildRow(W, { ...markRange(2, 13, 'j'), 2: 'J', 13: 'J', 7: 'v' }),
  buildRow(W, { ...markRange(2, 13, 'j'), 2: 'J', 13: 'J', 8: 'v' }),
  buildRow(W, { ...markRange(3, 12, 'j'), 7: 'v' }),
  buildRow(W, markRange(4, 11, 'J')),
  buildRow(W, { ...markRange(4, 11, 'Y'), 4: 'v', 11: 'v' }),
  buildRow(W, { ...markRange(4, 11, 'Y'), 4: 'v', 11: 'v' }),
  buildRow(W, { ...markRange(4, 11, 'Y'), 4: 'v', 11: 'v' }),
  buildRow(W, { 4: 'Y', 5: 'Y', 10: 'Y', 11: 'Y' }),
  buildRow(W, { 4: 'k', 5: 'k', 10: 'k', 11: 'k' }),
  buildRow(W, {}),
  buildRow(W, {}),
];

/** 잠긴 SELECT MODE 슬롯용 — 후드를 쓴 정체불명의 실루엣 */
const MYSTERY = [
  buildRow(W, {}),
  buildRow(W, markRange(7, 8, 'm')),
  buildRow(W, markRange(6, 9, 'm')),
  buildRow(W, markRange(5, 10, 'm')),
  buildRow(W, markRange(4, 11, 'm')),
  buildRow(W, markRange(4, 11, 'm')),
  buildRow(W, markRange(3, 12, 'm')),
  buildRow(W, markRange(3, 12, 'm')),
  buildRow(W, markRange(2, 13, 'm')),
  buildRow(W, markRange(2, 13, 'm')),
  buildRow(W, markRange(2, 13, 'm')),
  buildRow(W, markRange(2, 13, 'm')),
  buildRow(W, markRange(2, 13, 'm')),
  buildRow(W, markRange(2, 13, 'm')),
  buildRow(W, markRange(2, 13, 'm')),
  buildRow(W, markRange(2, 13, 'm')),
  buildRow(W, markRange(2, 13, 'm')),
  buildRow(W, { ...markRange(2, 5, 'm'), ...markRange(10, 13, 'm') }),
  buildRow(W, { ...markRange(2, 5, 'm'), ...markRange(10, 13, 'm') }),
  buildRow(W, { ...markRange(2, 5, 'm'), ...markRange(10, 13, 'm') }),
  buildRow(W, {}),
  buildRow(W, {}),
];

/** 갤러리 모드용 — 챙 넓은 모자에 깃털, 류트를 든 바드(중세 음악가) */
const BARD = [
  buildRow(W, {}),
  buildRow(W, { 12: 'h' }),
  buildRow(W, { ...markRange(5, 10, 'u'), 11: 'H' }),
  buildRow(W, markRange(5, 10, 'u')),
  buildRow(W, markRange(4, 11, 'U')),
  buildRow(W, { 4: 'r', ...markRange(5, 10, 's'), 11: 'r' }),
  buildRow(W, { 4: 'r', 5: 's', 6: 'e', 7: 's', 8: 's', 9: 'e', 10: 's', 11: 'r' }),
  buildRow(W, markRange(5, 10, 'S')),
  buildRow(W, markRange(4, 11, 'n')),
  buildRow(W, { ...markRange(3, 12, 'n'), 13: 'O' }),
  buildRow(W, { ...markRange(3, 12, 'n'), 13: 'O', 14: 'v' }),
  buildRow(W, { ...markRange(3, 10, 'n'), ...markRange(11, 15, 'o') }),
  buildRow(W, { ...markRange(3, 10, 'o'), 11: 'o', 12: 'k', 13: 'k', 14: 'o', 15: 'o' }),
  buildRow(W, { ...markRange(3, 10, 'n'), ...markRange(11, 15, 'o') }),
  buildRow(W, markRange(3, 12, 'n')),
  buildRow(W, markRange(3, 12, 'n')),
  buildRow(W, { ...markRange(4, 7, 'N'), ...markRange(8, 11, 'n') }),
  buildRow(W, { ...markRange(4, 7, 'N'), ...markRange(8, 11, 'n') }),
  buildRow(W, { ...markRange(4, 7, 'N'), ...markRange(8, 11, 'n') }),
  buildRow(W, { 4: 'k', 5: 'k', 10: 'k', 11: 'k' }),
  buildRow(W, {}),
  buildRow(W, {}),
];

/** 게시판 모드용 — 후드를 눌러쓰고 단검을 찬 도적. 눈만 어둠 속에서 빛난다 */
const ROGUE = [
  buildRow(W, {}),
  buildRow(W, markRange(6, 9, 'B')),
  buildRow(W, markRange(5, 10, 'B')),
  buildRow(W, markRange(4, 11, 'B')),
  buildRow(W, { ...markRange(4, 11, 'B'), 6: 'k', 9: 'k' }),
  buildRow(W, { ...markRange(4, 11, 'L'), 6: 'e', 9: 'e' }),
  buildRow(W, markRange(4, 11, 'L')),
  buildRow(W, markRange(3, 12, 'B')),
  buildRow(W, { ...markRange(3, 12, 'B'), 13: 'o' }),
  buildRow(W, { ...markRange(3, 12, 'B'), 13: 'O', 14: 'w' }),
  buildRow(W, { ...markRange(3, 12, 'B'), 14: 'w', 15: 'w' }),
  buildRow(W, markRange(3, 12, 'B')),
  buildRow(W, markRange(3, 12, 'L')),
  buildRow(W, markRange(3, 12, 'B')),
  buildRow(W, markRange(3, 12, 'B')),
  buildRow(W, markRange(4, 11, 'B')),
  buildRow(W, { ...markRange(4, 6, 'L'), ...markRange(9, 11, 'L') }),
  buildRow(W, { ...markRange(4, 6, 'L'), ...markRange(9, 11, 'L') }),
  buildRow(W, { ...markRange(4, 6, 'L'), ...markRange(9, 11, 'L') }),
  buildRow(W, { 4: 'k', 5: 'k', 10: 'k', 11: 'k' }),
  buildRow(W, {}),
  buildRow(W, {}),
];

const SPRITES: Record<string, string[]> = {
  knight: KNIGHT,
  mage: MAGE,
  archer: ARCHER,
  woowang: WOOWANG,
  mystery: MYSTERY,
  bard: BARD,
  rogue: ROGUE,
};

type SpriteProps = {
  name: string;
  className?: string;
  /** true 면 팔레트를 무시하고 단색 실루엣으로 렌더링한다 (잠긴 슬롯용) */
  silhouette?: boolean;
};

export default function Sprite({ name, className, silhouette = false }: SpriteProps) {
  const grid = SPRITES[name] ?? KNIGHT;

  return (
    <svg
      className={className}
      viewBox="0 0 16 22"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {grid.flatMap((row, y) =>
        row.split('').map((ch, x) => {
          if (ch === '.') return null;
          const fill = silhouette ? '#050505' : PALETTE[ch];
          if (!fill) return null;
          return (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />
          );
        })
      )}
    </svg>
  );
}
