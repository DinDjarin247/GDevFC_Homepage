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
};

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

const SPRITES: Record<string, string[]> = {
  knight: KNIGHT,
  mage: MAGE,
  archer: ARCHER,
};

type SpriteProps = {
  name: string;
  className?: string;
};

export default function Sprite({ name, className }: SpriteProps) {
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
          const fill = PALETTE[ch];
          if (!fill) return null;
          return (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />
          );
        })
      )}
    </svg>
  );
}
